import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import ExcelJS from 'exceljs';

// กำหนด __dirname สำหรับ ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const TEMPLATE_PATH = path.join(DATA_DIR, 'template.xlsx');
const BACKUP_PATH = path.join(DATA_DIR, 'template.backup.xlsx');

export async function backupTemplate() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // สร้าง template.xlsx ถ้ายังไม่มี
  if (!fs.existsSync(TEMPLATE_PATH)) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Test Cases');

    worksheet.columns = [
      { header: 'ชื่อ', key: 'firstName' },
      { header: 'นามสกุล', key: 'lastName' },
      { header: 'อายุ', key: 'age' },
      { header: 'หมายเหตุ', key: 'note' },
      { header: 'ผลการตรวจสอบ', key: 'result' },
      { header: 'ภาพผลการตรวจสอบ', key: 'screenshot' }
    ];

    // เพิ่มตัวอย่างเคส
    worksheet.addRows([
      ['John', 'Doe', 17, 'Age below 18'],
      ['Jane', 'Smith', 18, 'Age exactly 18'],
      ['Bob', 'Johnson', 25, 'Age above 18'],
      ['Alice', 'Brown', 15, 'Age below 18'],
      ['Tom', 'Davis', 0, 'Edge case: zero age']
    ]);

    await workbook.xlsx.writeFile(TEMPLATE_PATH);
  }

  // สำรองไฟล์ template
  await fs.copy(TEMPLATE_PATH, BACKUP_PATH);
}

export async function readTestCases() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(TEMPLATE_PATH);
  const worksheet = workbook.worksheets[0];

  const testCases: Array<{ rowNumber: number; firstName: string; lastName: string; age: number; note: string }> = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    testCases.push({
      rowNumber,
      firstName: row.getCell(1).text,
      lastName: row.getCell(2).text,
      age: Number(row.getCell(3).text),
      note: row.getCell(4).text
    });
  });

  return testCases;
}

export async function writeResults(results: Array<{ rowNumber: number; checkResult: string; screenshot: string }>) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(TEMPLATE_PATH);
  const worksheet = workbook.worksheets[0];

  // เขียนผลลัพธ์ลง worksheet
  results.forEach(r => {
    const row = worksheet.getRow(r.rowNumber);
    row.getCell(5).value = r.checkResult;
    row.getCell(6).value = r.screenshot;
  });

  // เขียนเป็นไฟล์ใหม่ result_template.xlsx
  const RESULT_PATH = path.join(DATA_DIR, 'result_template.xlsx');
  await workbook.xlsx.writeFile(RESULT_PATH);
}