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

export async function createSingleSuiteExcelReport(filename, suiteTitle, testType, testCases) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'BloodAI Automated Test Framework';
  workbook.created = new Date();

  const total = testCases.length;
  const passed = testCases.filter(t => t.status === 'PASS').length;
  const failed = total - passed;
  const passRate = ((passed / total) * 100).toFixed(1);

  // ---------------------------------------------------------
  // TAB 1: SUMMARY DASHBOARD
  // ---------------------------------------------------------
  const summarySheet = workbook.addWorksheet('Summary Dashboard');

  // Title Banner
  summarySheet.mergeCells('A1:G2');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = `${suiteTitle.toUpperCase()} - TEST REPORT (300 TEST CASES)`;
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

  // Table Headers
  summarySheet.mergeCells('A7:G7');
  const secCell = summarySheet.getCell('A7');
  secCell.value = 'SUITE PERFORMANCE SUMMARY';
  secCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: C.WHITE } };
  secCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.SLATE_800 } };

  const sHeaders = ['Test Suite', 'Test Type', 'Total Cases', 'Passed', 'Failed', 'Pass Rate', 'Status'];
  const sRow = summarySheet.getRow(9);
  sHeaders.forEach((h, i) => applyHeader(sRow.getCell(i + 1), h));

  const rRow = summarySheet.getRow(10);
  applyData(rRow.getCell(1), suiteTitle, false, 'left');
  applyData(rRow.getCell(2), testType, false, 'center');
  applyData(rRow.getCell(3), total, false, 'center');
  applyData(rRow.getCell(4), passed, false, 'center');
  applyData(rRow.getCell(5), failed, false, 'center');
  applyData(rRow.getCell(6), `${passRate}%`, false, 'center');
  statusCell(rRow.getCell(7), failed === 0 ? 'PASSED' : 'FAILED');

  summarySheet.columns = [
    { width: 25 }, { width: 25 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 18 }
  ];

  // ---------------------------------------------------------
  // TAB 2: DETAILED TEST CASES (300 ROWS)
  // ---------------------------------------------------------
  const detailSheet = workbook.addWorksheet('Test Cases (300)');
  detailSheet.views = [{ state: 'frozen', ySplit: 1 }];

  const dHeaders = ['Test ID', 'Category', 'Module', 'Test Scenario', 'Test Steps', 'Expected Result', 'Actual Result', 'Status', 'Severity', 'Duration (ms)', 'Tester', 'Date'];
  const dHeaderRow = detailSheet.getRow(1);
  dHeaderRow.height = 25;
  dHeaders.forEach((h, i) => applyHeader(dHeaderRow.getCell(i + 1), h));

  testCases.forEach((tc, idx) => {
    const row = detailSheet.getRow(idx + 2);
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

  detailSheet.columns = [
    { width: 12 }, { width: 18 }, { width: 22 }, { width: 35 }, { width: 40 }, { width: 35 }, { width: 35 }, { width: 12 }, { width: 12 }, { width: 14 }, { width: 22 }, { width: 14 }
  ];

  const outPath = path.join(process.cwd(), 'tests', 'reports', filename);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await workbook.xlsx.writeFile(outPath);
  console.log(`[Excel Engine] Created: ${filename} (300 cases)`);
  return outPath;
}
