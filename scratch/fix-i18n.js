const fs = require('fs');
const path = require('path');

const files = [
  'pages/accounting.tsx',
  'pages/activity.tsx',
  'pages/dashboard.tsx',
  'pages/documents.tsx',
  'pages/driver-portal.tsx',
  'pages/drivers.tsx',
  'pages/index.tsx',
  'pages/login.tsx',
  'pages/reminders.tsx',
  'pages/reports.tsx',
  'pages/settings.tsx',
  'pages/vehicles.tsx'
];

const basePath = 'c:/Users/Admin/Desktop/karvex21';

files.forEach(file => {
  const filePath = path.join(basePath, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Fix any broken imports first
  content = content.replace(/import nextI18nConfig as any from/g, "import nextI18nConfig from");

  // If there's no import at all, add it
  if (!content.includes('import nextI18nConfig')) {
    content = `import nextI18nConfig from '@/next-i18next.config'\n` + content;
  }

  // Ensure all serverSideTranslations calls pass "nextI18nConfig as any"
  content = content.replace(/serverSideTranslations\(([^,)]+),\s*(\[[^\]]+\])(?:,\s*nextI18nConfig(?:\s+as\s+any)?)?\)/g, 'serverSideTranslations($1, $2, nextI18nConfig as any)');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed and updated ${file}`);
});
