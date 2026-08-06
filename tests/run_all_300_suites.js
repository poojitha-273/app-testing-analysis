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
  console.log('\nExecuting All 6 Test Suites (300 Cases Each)...');

  await createSingleSuiteExcelReport('selenium_web_300_report.xlsx', 'Selenium — Website Tests', 'Selenium Web E2E', masterSuite.selenium);
  await createSingleSuiteExcelReport('appium_android_300_report.xlsx', 'Appium — Android Tests', 'Appium Mobile E2E', masterSuite.appium);
  await createSingleSuiteExcelReport('unit_test_300_report.xlsx', 'Unit Tests — API', 'API Unit Testing', masterSuite.unit);
  await createSingleSuiteExcelReport('validation_test_300_report.xlsx', 'Validation Tests', 'Validation & Boundaries', masterSuite.validation);
  await createSingleSuiteExcelReport('deployment_test_300_report.xlsx', 'Deployment Status Tests', 'Deployment & Release', masterSuite.deployment);
  await createSingleSuiteExcelReport('load_test_300_report.xlsx', 'Load Testing — Performance', 'Load & Performance', masterSuite.load);

  console.log('\nGenerating Master Multi-Sheet Full E2E Excel Report (1800 Cases across 7 Sheets)...');
  await createFullE2EMasterReport(masterSuite, 'full_e2e_master_report.xlsx');

  console.log('\n================================================================');
  console.log('  SUCCESS: ALL REPORTS (INDIVIDUAL & MASTER) GENERATED');
  console.log('================================================================');
}

runAllSuites().catch(err => {
  console.error('Error running suites:', err);
  process.exit(1);
});
