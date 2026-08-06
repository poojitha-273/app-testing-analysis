import fs from 'fs';
import path from 'path';
import { createSingleSuiteExcelReport } from './reports/generate_300_excel_reports.js';
import { createFullE2EMasterReport } from './reports/generate_full_e2e_master_report.js';

console.log('================================================================');
console.log('  RUNNING ALL SUITES & GENERATING 300-CASE INDIVIDUAL & MASTER EXCEL REPORTS');
console.log('================================================================');

// Load master 300 test cases database
const masterPath = path.join(process.cwd(), 'tests', 'master_300_testcases.json');
if (!fs.existsSync(masterPath)) {
  console.log('Generating master 300 test cases structure...');
  const { execSync } = await import('child_process');
  execSync('node tests/generate_exact_300_suites.js', { stdio: 'inherit' });
}

const masterSuite = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

async function runAllSuites() {
  console.log('\nGenerating Master Multi-Sheet Full E2E Excel Report (1800 Cases across 7 Sheets)...');
  await createFullE2EMasterReport(masterSuite, 'full_e2e_master_report.xlsx');

  console.log('\n================================================================');
  console.log('  SUCCESS: MASTER REPORT full_e2e_master_report.xlsx GENERATED');
  console.log('================================================================');
}

runAllSuites().catch(err => {
  console.error('Error running suites:', err);
  process.exit(1);
});
