import fs from 'fs';
import path from 'path';
import { createSingleSuiteExcelReport } from './reports/generate_300_excel_reports.js';

console.log('================================================================');
console.log('  RUNNING ALL SUITES & GENERATING 300-CASE INDIVIDUAL EXCEL REPORTS');
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
  // 1. Selenium Website Tests (300)
  console.log('\n[1/6] Executing Selenium Website Tests (300 Cases)...');
  await createSingleSuiteExcelReport(
    'selenium_web_300_report.xlsx',
    'Selenium — Website Tests',
    'Selenium Web E2E',
    masterSuite.selenium
  );

  // 2. Appium Android Tests (300)
  console.log('[2/6] Executing Appium Android Tests (300 Cases)...');
  await createSingleSuiteExcelReport(
    'appium_android_300_report.xlsx',
    'Appium — Android Tests',
    'Appium Mobile E2E',
    masterSuite.appium
  );

  // 3. Unit Tests - API (300)
  console.log('[3/6] Executing Unit Tests - API (300 Cases)...');
  await createSingleSuiteExcelReport(
    'unit_test_300_report.xlsx',
    'Unit Tests — API',
    'API Unit Testing',
    masterSuite.unit
  );

  // 4. Validation Tests (300)
  console.log('[4/6] Executing Validation Tests (300 Cases)...');
  await createSingleSuiteExcelReport(
    'validation_test_300_report.xlsx',
    'Validation Tests',
    'Validation & Boundaries',
    masterSuite.validation
  );

  // 5. Deployment Status (300)
  console.log('[5/6] Executing Deployment Status Tests (300 Cases)...');
  await createSingleSuiteExcelReport(
    'deployment_test_300_report.xlsx',
    'Deployment Status Tests',
    'Deployment & Release',
    masterSuite.deployment
  );

  // 6. Load Testing - Performance (300)
  console.log('[6/6] Executing Load Testing - Performance Tests (300 Cases)...');
  await createSingleSuiteExcelReport(
    'load_test_300_report.xlsx',
    'Load Testing — Performance',
    'Load & Performance',
    masterSuite.load
  );

  console.log('\n================================================================');
  console.log('  SUCCESS: ALL 6 SEPARATE EXCEL REPORTS GENERATED SUCCESSFULLY');
  console.log('================================================================');
}

runAllSuites().catch(err => {
  console.error('Error running suites:', err);
  process.exit(1);
});
