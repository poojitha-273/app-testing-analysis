import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';

const C = {
  SLATE_900: '0F172A',
  SLATE_800: '1E293B',
  SLATE_200: 'E2E8F0',
  SLATE_50:  'F8FAFC',
  WHITE:      'FFFFFF',
  GREEN_LIGHT:'DCFCE7',
  GREEN_TEXT: '166534',
  RED_LIGHT:  'FEE2E2',
  RED_TEXT:   '991B1B',
  BLUE_HEADER:'1E3A8A'
};

function applyHeader(cell, text) {
  cell.value = text;
  cell.font = { name: 'Calibri', bold: true, size: 10, color: { argb: C.WHITE } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.SLATE_900 } };
  cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
}

function applyData(cell, value, isEven, align = 'left') {
  cell.value = value;
  cell.font = { name: 'Calibri', size: 9, color: { argb: C.SLATE_800 } };
  if (isEven) {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.SLATE_50 } };
  }
  cell.alignment = { vertical: 'middle', horizontal: align, wrapText: true };
  cell.border = {
    top:    { style: 'thin', color: { argb: C.SLATE_200 } },
    bottom: { style: 'thin', color: { argb: C.SLATE_200 } },
    left:   { style: 'thin', color: { argb: C.SLATE_200 } },
    right:  { style: 'thin', color: { argb: C.SLATE_200 } }
  };
}

function statusCell(cell, status) {
  const isPass = status === 'PASS' || status === 'PASSED';
  cell.value = status;
  cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: isPass ? C.GREEN_TEXT : C.RED_TEXT } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isPass ? C.GREEN_LIGHT : C.RED_LIGHT } };
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
  cell.border = {
    top:    { style: 'thin', color: { argb: C.SLATE_200 } },
    bottom: { style: 'thin', color: { argb: C.SLATE_200 } },
    left:   { style: 'thin', color: { argb: C.SLATE_200 } },
    right:  { style: 'thin', color: { argb: C.SLATE_200 } }
  };
}

function addSuiteTab(workbook, tabName, testCases) {
  const sheet = workbook.addWorksheet(tabName);
  sheet.views = [{ state: 'frozen', ySplit: 1 }];

  const dHeaders = ['Test ID', 'Category', 'Module', 'Test Scenario', 'Test Steps', 'Expected Result', 'Actual Result', 'Status', 'Severity', 'Duration (ms)', 'Tester', 'Date'];
  const dHeaderRow = sheet.getRow(1);
  dHeaderRow.height = 25;
  dHeaders.forEach((h, i) => applyHeader(dHeaderRow.getCell(i + 1), h));

  testCases.forEach((tc, idx) => {
    const row = sheet.getRow(idx + 2);
    row.height = 28;
    const isEven = idx % 2 === 1;

    applyData(row.getCell(1),  tc.id, isEven, 'center');
    applyData(row.getCell(2),  tc.category, isEven, 'center');
    applyData(row.getCell(3),  tc.module, isEven, 'left');
    applyData(row.getCell(4),  tc.scenario, isEven, 'left');
    applyData(row.getCell(5),  tc.steps, isEven, 'left');
    applyData(row.getCell(6),  tc.expectedResult, isEven, 'left');
    applyData(row.getCell(7),  tc.actualResult, isEven, 'left');
    statusCell(row.getCell(8),  tc.status);
    applyData(row.getCell(9),  tc.severity, isEven, 'center');
    applyData(row.getCell(10), tc.durationMs, isEven, 'center');
    applyData(row.getCell(11), tc.tester, isEven, 'left');
    applyData(row.getCell(12), tc.timestamp, isEven, 'center');
  });

  sheet.columns = [
    { width: 12 }, { width: 18 }, { width: 22 }, { width: 35 }, { width: 40 }, { width: 35 }, { width: 35 }, { width: 12 }, { width: 12 }, { width: 14 }, { width: 22 }, { width: 14 }
  ];
}

export async function createFullE2EMasterReport(masterSuite, filename = 'full_e2e_master_report.xlsx') {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'BloodAI Master Automation Engine';
  workbook.created = new Date();

  // Combined array for KPI metrics
  const allCases = [
    ...masterSuite.selenium,
    ...masterSuite.appium,
    ...masterSuite.unit,
    ...masterSuite.validation,
    ...masterSuite.deployment,
    ...masterSuite.load
  ];

  const total = allCases.length;
  const passed = allCases.filter(t => t.status === 'PASS').length;
  const failed = total - passed;
  const passRate = ((passed / total) * 100).toFixed(1);

  // ---------------------------------------------------------
  // TAB 1: EXECUTIVE DASHBOARD
  // ---------------------------------------------------------
  const summarySheet = workbook.addWorksheet('Executive Dashboard');

  // Title Banner
  summarySheet.mergeCells('A1:G2');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = 'BLOOD AI — FULL E2E MASTER TEST EXECUTION REPORT (1800 TEST CASES)';
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: C.WHITE } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.BLUE_HEADER } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // KPI Cards
  const kpis = [
    { range: 'A4:B5', label: 'TOTAL TEST CASES', val: total },
    { range: 'C4:D5', label: 'PASSED', val: passed },
    { range: 'E4:F5', label: 'FAILED', val: failed },
    { range: 'G4:G5', label: 'PASS RATE', val: `${passRate}%` }
  ];

  kpis.forEach(k => {
    summarySheet.mergeCells(k.range);
    const cell = summarySheet.getCell(k.range.split(':')[0]);
    cell.value = `${k.label}\n${k.val}`;
    cell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: C.SLATE_900 } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.SLATE_50 } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  });

  // Table Header
  summarySheet.mergeCells('A7:G7');
  const secCell = summarySheet.getCell('A7');
  secCell.value = 'TEST SUITES SUMMARY (SEPARATE SHEETS PER TEST SUITE)';
  secCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: C.WHITE } };
  secCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.SLATE_800 } };

  const sHeaders = ['Test Suite Sheet', 'Target Scope', 'Total Cases', 'Passed', 'Failed', 'Pass Rate', 'Status'];
  const sRow = summarySheet.getRow(9);
  sHeaders.forEach((h, i) => applyHeader(sRow.getCell(i + 1), h));

  const suiteList = [
    { tabName: 'Selenium Web (300)', name: 'Selenium Website Tests', scope: 'Web E2E UI & Navigation', cases: masterSuite.selenium },
    { tabName: 'Appium Android (300)', name: 'Appium Android Tests', scope: 'Mobile Native & Gestures', cases: masterSuite.appium },
    { tabName: 'Unit Tests API (300)', name: 'Unit Tests — API', scope: 'API Contracts & SQLite DB', cases: masterSuite.unit },
    { tabName: 'Validation Tests (300)', name: 'Validation Tests', scope: 'Form Limits & Sanitization', cases: masterSuite.validation },
    { tabName: 'Deployment Status (300)', name: 'Deployment Status', scope: 'Build, Security & Environment', cases: masterSuite.deployment },
    { tabName: 'Load Testing (300)', name: 'Load Testing — Performance', scope: '100 VUs / RPS & Latency SLA', cases: masterSuite.load }
  ];

  suiteList.forEach((s, idx) => {
    const rRow = summarySheet.getRow(10 + idx);
    const sPass = s.cases.filter(t => t.status === 'PASS').length;
    const sFail = s.cases.length - sPass;
    const sRate = ((sPass / s.cases.length) * 100).toFixed(1);

    applyData(rRow.getCell(1), s.name, idx % 2 === 1, 'left');
    applyData(rRow.getCell(2), s.scope, idx % 2 === 1, 'left');
    applyData(rRow.getCell(3), s.cases.length, idx % 2 === 1, 'center');
    applyData(rRow.getCell(4), sPass, idx % 2 === 1, 'center');
    applyData(rRow.getCell(5), sFail, idx % 2 === 1, 'center');
    applyData(rRow.getCell(6), `${sRate}%`, idx % 2 === 1, 'center');
    statusCell(rRow.getCell(7), sFail === 0 ? 'PASSED' : 'FAILED');
  });

  summarySheet.columns = [
    { width: 30 }, { width: 30 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 18 }
  ];

  // ---------------------------------------------------------
  // SEPARATE SHEETS FOR EACH TEST SUITE (300 CASES EACH)
  // ---------------------------------------------------------
  addSuiteTab(workbook, 'Selenium Web (300)', masterSuite.selenium);
  addSuiteTab(workbook, 'Appium Android (300)', masterSuite.appium);
  addSuiteTab(workbook, 'Unit Tests API (300)', masterSuite.unit);
  addSuiteTab(workbook, 'Validation Tests (300)', masterSuite.validation);
  addSuiteTab(workbook, 'Deployment Status (300)', masterSuite.deployment);
  addSuiteTab(workbook, 'Load Testing (300)', masterSuite.load);

  const outPath = path.join(process.cwd(), 'tests', 'reports', filename);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await workbook.xlsx.writeFile(outPath);
  console.log(`[Master Excel Engine] Created Full E2E Master Report with individual sheets: ${filename} (7 sheets total)`);
  return outPath;
}
