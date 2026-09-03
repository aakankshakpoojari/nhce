/* End-to-end marketplace flow test against the API (run with: node e2e.tmp.mjs) */
const BASE = 'http://localhost:3002/api';
let passed = 0, failed = 0;
const results = [];
const ok = (name, cond, extra = '') => {
  if (cond) { passed++; results.push(`✅ ${name}`); }
  else { failed++; results.push(`❌ ${name} ${extra}`); }
};

async function req(method, path, { token, body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch {}
  return { status: res.status, data };
}

const stamp = Date.now().toString().slice(-8);
const clientEmail = `client${stamp}@test.io`;
const flEmail = `fl${stamp}@test.io`;
const fl2Email = `fl2${stamp}@test.io`;

// 1. Signups
let r = await req('POST', '/auth/signup', { body: { email: clientEmail, password: 'test1234', name: 'Test Client', role: 'CLIENT' } });
const clientToken = r.data?.token;
ok('client signup', r.status === 201 && !!clientToken);

r = await req('POST', '/auth/signup', { body: { email: flEmail, password: 'test1234', name: 'Test Freelancer', role: 'FREELANCER' } });
const flToken = r.data?.token;
const flId = r.data?.user?.id;
ok('freelancer signup', r.status === 201 && !!flToken);

r = await req('POST', '/auth/signup', { body: { email: fl2Email, password: 'test1234', name: 'Freelancer Two', role: 'FREELANCER' } });
const fl2Token = r.data?.token;
ok('second freelancer signup', r.status === 201 && !!fl2Token);

// 2. Freelancer cannot create jobs
r = await req('POST', '/jobs', { token: flToken, body: { title: 'Hack', description: 'x', budget: 10 } });
ok('freelancer creating job blocked', r.status === 403, `got ${r.status}`);

// 3. Client creates draft job
const jobBody = {
  title: 'Build a React Dashboard',
  description: 'Need a responsive analytics dashboard with charts and real-time updates.',
  budget: 500,
  tokenSymbol: 'USDC',
  skills: ['React', 'TypeScript', 'Tailwind', 'Node.js'],
  deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
  status: 'DRAFT',
};
r = await req('POST', '/jobs', { token: clientToken, body: jobBody });
const draftJob = r.data?.job;
ok('client creates draft job', r.status === 201 && draftJob?.status === 'DRAFT', `got ${r.status} ${JSON.stringify(r.data)}`);
ok('draft has skills + deadline + token', Array.isArray(draftJob?.skills) && draftJob?.skills.length === 4 && !!draftJob?.deadline && draftJob?.tokenSymbol === 'USDC');

// 4. Apply to unpublished (draft) job -> blocked
r = await req('POST', `/jobs/${draftJob.id}/applications`, { token: flToken, body: { pitch: 'I can build this', requestedRate: 450, deliveryDays: 14 } });
ok('apply to draft job blocked', r.status === 403, `got ${r.status}`);

// 5. Marketplace does not show drafts
r = await req('GET', '/jobs');
ok('marketplace hides draft', !(r.data?.jobs || []).some((j) => j.id === draftJob.id));

// 6. Client publishes job
r = await req('POST', `/jobs/${draftJob.id}/publish`, { token: clientToken });
ok('publish draft', r.status === 200 && r.data?.job?.status === 'PUBLISHED', `got ${r.status} ${JSON.stringify(r.data)}`);

// 7. Marketplace shows published job with count
r = await req('GET', '/jobs');
const listed = (r.data?.jobs || []).find((j) => j.id === draftJob.id);
ok('marketplace shows published job', !!listed, `got ${JSON.stringify(r.data)}`);
ok('job card has client + count', !!listed?.client?.name && typeof listed?._count?.applications === 'number');

// 8. Non-owner (freelancer) cannot view applications
r = await req('GET', `/jobs/${draftJob.id}/applications`, { token: flToken });
ok('non-owner viewing applications blocked', r.status === 403, `got ${r.status}`);

// 9. Client applies -> blocked
r = await req('POST', `/jobs/${draftJob.id}/applications`, { token: clientToken, body: { pitch: 'x', requestedRate: 1, deliveryDays: 1 } });
ok('client applying blocked', r.status === 403, `got ${r.status}`);

// 10. Missing pitch blocked
r = await req('POST', `/jobs/${draftJob.id}/applications`, { token: flToken, body: { requestedRate: 450, deliveryDays: 14 } });
ok('missing proposal blocked', r.status === 400, `got ${r.status}`);

// 11. Freelancer applies
r = await req('POST', `/jobs/${draftJob.id}/applications`, { token: flToken, body: { pitch: 'I can build this in 2 weeks, solid React experience.', requestedRate: 450, deliveryDays: 14 } });
const app1 = r.data?.application;
ok('freelancer applies', r.status === 201 && app1?.status === 'SUBMITTED', `got ${r.status} ${JSON.stringify(r.data)}`);
ok('application has pitch/rate/days', app1?.pitch?.length > 0 && app1?.requestedRate === 450 && app1?.deliveryDays === 14);

// 12. Duplicate application blocked
r = await req('POST', `/jobs/${draftJob.id}/applications`, { token: flToken, body: { pitch: 'again', requestedRate: 400, deliveryDays: 10 } });
ok('duplicate application blocked', r.status === 409, `got ${r.status}`);

// 13. Second freelancer applies
r = await req('POST', `/jobs/${draftJob.id}/applications`, { token: fl2Token, body: { pitch: 'Also interested, 10 years experience.', requestedRate: 480, deliveryDays: 10 } });
const app2 = r.data?.application;
ok('second freelancer applies', r.status === 201 && !!app2?.id);

// 14. Application count reflects 2
r = await req('GET', `/jobs/${draftJob.id}`);
ok('job detail count = 2', r.data?.job?._count?.applications === 2, `got ${JSON.stringify(r.data)}`);

// 15. Search: query by title
r = await req('GET', `/jobs?q=React%20Dashboard`);
ok('search by title works', (r.data?.jobs || []).some((j) => j.id === draftJob.id));
// 16. Search: query by skill (exact-case `has`; UI additionally filters skills case-insensitively client-side)
r = await req('GET', `/jobs?q=Tailwind`);
ok('search by skill works', (r.data?.jobs || []).some((j) => j.id === draftJob.id));
// 17. Budget filter
r = await req('GET', `/jobs?minBudget=600`);
ok('budget filter excludes job', !(r.data?.jobs || []).some((j) => j.id === draftJob.id));
// 18. Token filter
r = await req('GET', `/jobs?token=USDC`);
ok('token filter includes job', (r.data?.jobs || []).some((j) => j.id === draftJob.id));

// 19. Owner views applications with freelancer info
r = await req('GET', `/jobs/${draftJob.id}/applications`, { token: clientToken });
ok('owner views applications', r.status === 200 && r.data?.applications?.length === 2, `got ${r.status} ${JSON.stringify(r.data)}`);
ok('applications include freelancer name/rating/bio', r.data?.applications?.every((a) => !!a?.freelancer?.name));

// 20. Non-owner select blocked
r = await req('POST', `/jobs/${draftJob.id}/select`, { token: flToken, body: { applicationId: app1.id } });
ok('non-owner select blocked', r.status === 403, `got ${r.status}`);

// 21. Review application -> UNDER_REVIEW
r = await req('POST', `/jobs/${draftJob.id}/applications/${app1.id}/review`, { token: clientToken });
ok('review application -> UNDER_REVIEW', r.status === 200 && r.data?.application?.status === 'UNDER_REVIEW', `got ${r.status}`);

// 22. Select freelancer (transactional)
r = await req('POST', `/jobs/${draftJob.id}/select`, { token: clientToken, body: { applicationId: app1.id } });
ok('select freelancer', r.status === 200, `got ${r.status} ${JSON.stringify(r.data)}`);
ok('job = FREELANCER_SELECTED', r.data?.job?.status === 'FREELANCER_SELECTED');
ok('job.freelancerId = selected freelancer', r.data?.job?.freelancerId === flId);

// 23. Verify application statuses after selection
r = await req('GET', `/jobs/${draftJob.id}/applications`, { token: clientToken });
const appsAfter = r.data?.applications || [];
const selected = appsAfter.find((a) => a.id === app1.id);
const rejected = appsAfter.find((a) => a.id === app2.id);
ok('selected application ACCEPTED', selected?.status === 'ACCEPTED', `got ${selected?.status}`);
ok('other applications REJECTED', rejected?.status === 'REJECTED', `got ${rejected?.status}`);

// 24. Selecting again blocked
r = await req('POST', `/jobs/${draftJob.id}/select`, { token: clientToken, body: { applicationId: app2.id } });
ok('re-select blocked after selection', r.status === 409, `got ${r.status}`);

// 25. Marketplace no longer lists selected job as open? (it stays PUBLISHED/OPEN in listing query; FREELANCER_SELECTED excluded)
r = await req('GET', '/jobs');
ok('selected job hidden from marketplace listing', !(r.data?.jobs || []).some((j) => j.id === draftJob.id));

// 26. Freelancer "my applications" shows statuses
r = await req('GET', '/applications/my', { token: flToken });
const myApps = r.data?.applications || [];
const myApp = myApps.find((a) => a.jobId === draftJob.id);
ok('freelancer my-applications lists job + status', !!myApp && myApp.status === 'ACCEPTED' && !!myApp?.job?.title, `got ${JSON.stringify(r.data)}`);

// 27. Client "my jobs" lists job with count + status
r = await req('GET', '/jobs/my', { token: clientToken });
const myJobs = r.data?.jobs || [];
const myJob = myJobs.find((j) => j.id === draftJob.id);
ok('client my-jobs lists job', !!myJob && myJob.status === 'FREELANCER_SELECTED' && myJob._count?.applications === 2, `got ${JSON.stringify(r.data)}`);

// 28. Unauthenticated create blocked
r = await req('POST', '/jobs', { body: { title: 'x', description: 'y', budget: 1 } });
ok('unauthenticated create blocked', r.status === 401, `got ${r.status}`);

// 29. Update draft job (edit)
r = await req('POST', '/jobs', { token: clientToken, body: { title: 'Draft to edit', description: 'd', budget: 100, status: 'DRAFT' } });
const editJob = r.data?.job;
r = await req('PATCH', `/jobs/${editJob.id}`, { token: clientToken, body: { budget: 150, skills: ['React'] } });
ok('client edits draft job', r.status === 200 && r.data?.job?.budget === 150 && r.data?.job?.skills?.[0] === 'React', `got ${r.status} ${JSON.stringify(r.data)}`);

// 30. Non-owner edit blocked
r = await req('PATCH', `/jobs/${editJob.id}`, { token: flToken, body: { budget: 1 } });
ok('non-owner edit blocked', r.status === 403, `got ${r.status}`);

console.log('\n======== RESULTS ========');
results.forEach((line) => console.log(line));
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);