/**
 * Verify Task Pages Setup
 * 
 * This script checks if the task pages are properly configured
 */

const fs = require('fs');
const path = require('path');

const checks = [];

function check(name, condition, fix) {
  checks.push({ name, passed: condition, fix });
  console.log(condition ? `✅ ${name}` : `❌ ${name}`);
  if (!condition && fix) {
    console.log(`   💡 Fix: ${fix}`);
  }
}

console.log('🔍 Verifying Task Pages Setup...\n');

// Check if required files exist
const requiredFiles = [
  'src/app/task/page.tsx',
  'src/app/my-tasks/page.tsx',
  'src/services/task.service.ts',
  'src/store/task.store.ts',
  'src/components/task/TaskCard.tsx',
  'src/components/task/TaskDetails.tsx',
  'src/components/task/MapView.tsx',
  'src/components/task/FilterBar.tsx',
  'src/types/index.ts',
  'src/lib/api/client.ts',
];

console.log('📁 Checking Required Files:');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  check(
    file,
    fs.existsSync(filePath),
    `Create the file: ${file}`
  );
});

// Check environment variables
console.log('\n🔧 Checking Environment Variables:');
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  check(
    'NEXT_PUBLIC_API_BASE_URL is set',
    envContent.includes('NEXT_PUBLIC_API_BASE_URL'),
    'Add NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1 to .env.local'
  );
} else {
  check(
    '.env.local exists',
    false,
    'Create .env.local with NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1'
  );
}

// Check package.json dependencies
console.log('\n📦 Checking Dependencies:');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = [
    'axios',
    'zustand',
    'react-leaflet',
    'leaflet',
    'sonner',
    'motion',
    'js-cookie',
  ];
  
  requiredDeps.forEach(dep => {
    check(
      `${dep} installed`,
      !!deps[dep],
      `Run: npm install ${dep}`
    );
  });
}

// Summary
console.log('\n' + '='.repeat(50));
const passed = checks.filter(c => c.passed).length;
const failed = checks.filter(c => !c.passed).length;
console.log(`📊 Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(50));

if (failed === 0) {
  console.log('\n✅ All checks passed! Pages should be functional.');
  console.log('\n📝 Next steps:');
  console.log('   1. Make sure backend is running: cd ../backend && python manage.py runserver');
  console.log('   2. Seed test data: python manage.py seed_tasks --count=20');
  console.log('   3. Start frontend: npm run dev');
  console.log('   4. Visit: http://localhost:3000/task');
} else {
  console.log('\n⚠️  Some checks failed. Please fix the issues above.');
}
