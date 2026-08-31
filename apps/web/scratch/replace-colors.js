const fs = require('fs');
const path = require('path');

const DIRECTORIES = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../components'),
  path.join(__dirname, '../contexts'),
];

const REPLACEMENTS = [
  { regex: /bg-\[#101312\]/g, replacement: 'bg-background' },
  { regex: /bg-\[var\(--color-charcoal\)\]/g, replacement: 'bg-background' },
  { regex: /text-\[#101312\]/g, replacement: 'text-background' },
  { regex: /bg-\[#181D1A\]/g, replacement: 'bg-surface' },
  { regex: /border-\[#181D1A\]/g, replacement: 'border-surface' },
  { regex: /bg-\[#222925\]/g, replacement: 'bg-surface-hover' },
  { regex: /border-\[#28332D\]/g, replacement: 'border-surface-border' },
  { regex: /text-\[#F5F5F4\]/g, replacement: 'text-foreground' },
  { regex: /text-\[var\(--color-off-white\)\]/g, replacement: 'text-foreground' },
  { regex: /text-\[#A3A3A3\]/g, replacement: 'text-muted' },
  { regex: /bg-\[#84CC16\]/g, replacement: 'bg-moss' },
  { regex: /text-\[#84CC16\]/g, replacement: 'text-moss' },
  { regex: /border-\[#84CC16\]/g, replacement: 'border-moss' },
  { regex: /selection:bg-\[#84CC16\]/g, replacement: 'selection:bg-moss' },
  { regex: /selection:text-\[#101312\]/g, replacement: 'selection:text-background' },
];

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const { regex, replacement } of REPLACEMENTS) {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

for (const dir of DIRECTORIES) {
  walkDir(dir);
}
console.log('Done.');
