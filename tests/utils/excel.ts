import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import ExcelJS from 'exceljs';

// กําหนด __dirname สําหรับ ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const TEMPLATE_PATH = path.join(DATA_DIR, 'template.xlsx');
const BACKUP_PATH = path.join(DATA_DIR, 'template.backup.xlsx');

// เพิ่ม interface สำหรับ TestCase
interface TestCase {
  rowNumber: number;
  firstName: string;
  lastName: string;
  age: number;
}

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
      { header: 'ผลการตรวจสอบ', key: 'result' },
      { header: 'ภาพผลการตรวจสอบ', key: 'screenshot' },
      { header: 'สถานะการทดสอบ', key: 'testStatus' }, // เพิ่ม column ใหม่
      { header: 'ข้อผิดพลาด', key: 'errorMessage' } // เพิ่ม column สำหรับข้อผิดพลาด
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

  // สํารองไฟล์ template
  await fs.copy(TEMPLATE_PATH, BACKUP_PATH);
}

export async function readTestCases(): Promise<TestCase[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(TEMPLATE_PATH);
  const worksheet = workbook.getWorksheet(1);

  if (!worksheet) {
    throw new Error('ไม่พบ worksheet ใน Excel file');
  }

  const testCases: TestCase[] = [];

  // เริ่มจาก row 2 เพื่อข้าม header
  for (let i = 2; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i);
    if (row.getCell(1).value) { // ตรวจสอบว่า cell แรกไม่ว่าง
      testCases.push({
        rowNumber: i,
        firstName: row.getCell(1).value?.toString() || '',
        lastName: row.getCell(2).value?.toString() || '',
        age: parseInt(row.getCell(3).value?.toString() || '0'),
      });
    }
  }

  return testCases;
}

// อัปเดต interface สำหรับผลลัพธ์
export async function writeResults(results: Array<{
  rowNumber: number;
  checkResult: string;
  screenshot: string;
  testStatus: 'PASS' | 'FAIL' | 'ERROR';
  errorMessage?: string;
}>) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(TEMPLATE_PATH);
  const worksheet = workbook.worksheets[0];

  // เขียนผลลัพธ์ลง worksheet
  for (const r of results) {
    const row = worksheet.getRow(r.rowNumber);
    row.getCell(5).value = r.checkResult;
    row.getCell(7).value = r.testStatus; // เพิ่มสถานะการทดสอบ
    row.getCell(8).value = r.errorMessage || ''; // เพิ่มข้อผิดพลาด

    // กำหนดสีพื้นหลังตามสถานะการทดสอบ
    const statusCell = row.getCell(7);
    if (r.testStatus === 'PASS') {
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF90EE90' } // สีเขียวอ่อน
      };
    } else if (r.testStatus === 'FAIL') {
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFCCCB' } // สีแดงอ่อน
      };
    } else if (r.testStatus === 'ERROR') {
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFA500' } // สีส้ม
      };
    }

    // เพิ่มรูปภาพลงใน Excel
    const screenshotFullPath = path.join('tests', 'screenshots', r.screenshot);

    if (fs.existsSync(screenshotFullPath)) {
      // อ่านไฟล์รูปภาพ
      const imageBuffer = fs.readFileSync(screenshotFullPath);

      // เพิ่มรูปภาพลงใน workbook
      const imageId = workbook.addImage({
        buffer: imageBuffer,
        extension: 'png',
      });

      // กำหนดตำแหน่งและขนาดของรูปภาพ
      const cellAddress = `F${r.rowNumber}`;

      // เพิ่มรูปภาพลงใน worksheet
      worksheet.addImage(imageId, {
        tl: { col: 5, row: r.rowNumber - 1 }, // Top-left position (column F, row based on data)
        ext: { width: 200, height: 150 } // กำหนดขนาดรูปภาพ
      });

      // ปรับความสูงของ row ให้พอดีกับรูปภาพ
      row.height = 120;
    } else {
      // ถ้าไม่มีไฟล์รูปภาพให้ใส่ข้อความแทน
      row.getCell(6).value = `ไม่พบไฟล์: ${r.screenshot}`;
    }
  }

  // เขียนเป็นไฟล์ใหม่ result_template.xlsx
  const RESULT_PATH = path.join(DATA_DIR, 'result_template.xlsx');
  await workbook.xlsx.writeFile(RESULT_PATH);
}