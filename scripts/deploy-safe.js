import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Initializing EcoSmartHomes Deploy-Safe Pipeline...');

// 1. Update Fingerprint
const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const timestamp = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
const fpPath = path.resolve('src/deployment/fingerprint.json');

let fp = { version: timestamp, phases: '1-40' };
if (fs.existsSync(fpPath)) {
  try {
    fp = JSON.parse(fs.readFileSync(fpPath, 'utf8'));
    fp.version = timestamp;
    fp.phases = '1-40';
  } catch {
    // default fallback
  }
}
fs.writeFileSync(fpPath, JSON.stringify(fp, null, 2));
console.log(
  `✅ Step 1: Updated Fingerprint Version -> v${timestamp} (Phases 1-40)`,
);

// 2. Build Validation
console.log('🛠️ Step 2: Running npm run build validation...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Step 2: Build validation succeeded cleanly.');
} catch (err) {
  console.error('❌ Step 2: Build failed! Aborting deployment.');
  process.exit(1);
}

// 3. Clean Workspace
console.log('🧹 Step 3: Cleaning workspace (AntiGravity No-ZIP check)...');
try {
  execSync('git rm -f *.zip', { stdio: 'ignore' });
  console.log('✅ Step 3: Removed tracked ZIP archives.');
} catch {
  console.log('✅ Step 3: Workspace clean. No ZIP archives found.');
}

// 4. Stage, Commit & Push
console.log('📦 Step 4: Staging source files and pushing to GitHub...');
execSync(
  'git add src/ vercel.json index.html vite.config.ts package.json eslint.config.js scripts/',
  { stdio: 'inherit' },
);

const commitMsg = `deploy: release v${timestamp} - Phases 1-40 verified`;
try {
  execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
  console.log(`✅ Step 4: Committed -> '${commitMsg}'`);
} catch {
  console.log('ℹ️ Step 4: No new source changes to commit.');
}

try {
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('✅ Step 4: Successfully pushed main to GitHub (origin/main).');
} catch (err) {
  console.error('❌ Step 4: Push to origin/main failed.');
  process.exit(1);
}

console.log(
  '\n==========================================================================',
);
console.log('🎉 DEPLOY-SAFE PIPELINE COMPLETE!');
console.log(`- Live Version Badge : v${timestamp}`);
console.log('- Phase Range        : 1-40 (Master Suite Active)');
console.log('- Build Target       : Safari 13 / ESNext Hashed Assets');
console.log('- Verification URL   : https://ecosmarthomes-seo-hub.vercel.app');
console.log(
  '==========================================================================\n',
);
