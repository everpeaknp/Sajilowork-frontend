// Quick diagnostic script to check if all imports are working
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking critical imports...\n');

const checks = [
  { file: 'src/validations/index.ts', desc: 'Validations index' },
  { file: 'src/validations/auth.schema.ts', desc: 'Auth schema' },
  { file: 'src/validations/task.schema.ts', desc: 'Task schema' },
  { file: 'src/hooks/useAuth.ts', desc: 'useAuth hook' },
  { file: 'src/store/auth.store.ts', desc: 'Auth store' },
  { file: 'src/store/index.ts', desc: 'Store index' },
  { file: 'src/services/auth.service.ts', desc: 'Auth service' },
  { file: 'src/services/index.ts', desc: 'Services index' },
  { file: 'src/providers/AuthProvider.tsx', desc: 'Auth provider' },
  { file: 'src/providers/index.ts', desc: 'Providers index' },
];

let allGood = true;

checks.forEach(({ file, desc }) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${desc}: ${file}`);
  } else {
    console.log(`❌ ${desc}: ${file} - NOT FOUND`);
    allGood = false;
  }
});

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ All critical files exist!');
  console.log('\n💡 If the app still shows an error:');
  console.log('   1. Stop the dev server (Ctrl+C)');
  console.log('   2. Delete .next folder: rmdir /s /q .next');
  console.log('   3. Restart: npm run dev');
} else {
  console.log('❌ Some files are missing. Please check the errors above.');
}
console.log('='.repeat(50) + '\n');
