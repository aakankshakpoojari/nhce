export default function ProfilePage() {
  return (
    <div className="w-full flex flex-col items-center justify-center pb-20">
      <div className="w-full max-w-3xl space-y-12 text-center">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-[#F5F5F4] mb-4 tracking-tight animate-float">
            Decentralized Identity (DID)
          </h1>
          <p className="text-[#A3A3A3] text-xl font-light">
            Manage your on-chain reputation and verified credentials.
          </p>
        </div>

        <div className="bg-[#181D1A] border border-white/5 rounded-[2.5rem] p-12 text-left space-y-10 shadow-2xl">
          
          <div className="flex flex-col items-center space-y-6 mb-12">
            <div className="h-32 w-32 rounded-full bg-gradient-to-tr from-[#22C55E] to-[#BEF264] flex items-center justify-center border-8 border-[#101312] shadow-xl interactive hover:scale-105 transition-transform duration-500 ease-[var(--ease-fluid)]">
              <span className="text-3xl font-bold text-[#101312]">W3</span>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-[#A3A3A3] uppercase tracking-wider ml-2">Display Name</label>
              <div className="h-16 w-full bg-[#101312] rounded-2xl border border-white/5 px-6 flex items-center interactive hover:border-white/20 transition-colors">
                <span className="text-[#F5F5F4] text-lg opacity-50">Enter display name...</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-semibold text-[#A3A3A3] uppercase tracking-wider ml-2">Verified Skills</label>
              <div className="h-16 w-full bg-[#101312] rounded-2xl border border-white/5 px-6 flex items-center interactive hover:border-white/20 transition-colors">
                <span className="text-[#F5F5F4] text-lg opacity-50">e.g., Solidity, Next.js</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-[#A3A3A3] uppercase tracking-wider ml-2">Wallet Address</label>
              <div className="h-16 w-full bg-[#101312] rounded-2xl border border-white/5 px-6 flex items-center interactive hover:border-white/20 transition-colors">
                <span className="text-[#F5F5F4] font-mono opacity-50">0x...</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
