// tests/example.spec.ts
import fs from 'fs-extra';
import path from 'path';
import { test, expect } from '@playwright/test';
import { backupTemplate, readTestCases, writeResults } from './utils/excel';

test('ตรวจสอบข้อมูลทั้งหมดจาก Excel', async ({ page }) => {
  // await backupTemplate();
  const testCases = await readTestCases();
  const results: Array<{ 
    rowNumber: number; 
    checkResult: string; 
    screenshot: string;
    testStatus: 'PASS' | 'FAIL' | 'ERROR';
    errorMessage?: string;
  }> = [];

  // สร้างโฟลเดอร์ screenshots ถ้ายังไม่มี
  const screenshotDir = path.join('tests', 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  for (const tc of testCases) {
    let testStatus: 'PASS' | 'FAIL' | 'ERROR' = 'PASS';
    let errorMessage = '';
    let checkResult = '';

    try {
      await page.goto('/');

      // ใส่ข้อมูลลงในฟอร์ม
      await page.fill('#first-name', tc.firstName);
      await page.fill('#last-name', tc.lastName);
      await page.fill('#age', tc.age.toString());

      // กดปุ่มตรวจสอบผล
      await page.click('button[type="submit"]');

      // รอให้ผลลัพธ์แสดง
      await page.waitForSelector('[data-testid="result-text"]', { timeout: 5000 });

      // อ่านผลลัพธ์จากหน้าเว็บ
      const actualResult = await page.textContent('[data-testid="result-text"]');
      
      // กำหนดผลลัพธ์ที่คาดหวัง
      const expectedResult = tc.age >= 18 ? 'ผ่าน' : 'ไม่ผ่าน';
      checkResult = expectedResult;

      // ตรวจสอบว่าผลลัพธ์ตรงกับที่คาดหวังหรือไม่
      if (actualResult && actualResult.includes(expectedResult)) {
        testStatus = 'PASS';
        // ใช้ expect เพื่อบันทึกใน test report
        expect(actualResult).toContain(expectedResult);
      } else {
        testStatus = 'FAIL';
        errorMessage = `คาดหวัง: "${expectedResult}" แต่ได้: "${actualResult}"`;
      }

    } catch (error) {
      testStatus = 'ERROR';
      errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
      checkResult = 'ERROR';
    }

    // ถ่าย screenshot ไม่ว่าจะ pass หรือ fail
    const screenshotName = `row-${tc.rowNumber}-${tc.firstName}-${testStatus}.png`;
    const screenshotPath = path.join(screenshotDir, screenshotName);
    
    try {
      await page.screenshot({ path: screenshotPath, fullPage: true });
    } catch (screenshotError) {
      console.warn(`ไม่สามารถถ่าย screenshot ได้: ${screenshotError}`);
    }

    results.push({
      rowNumber: tc.rowNumber,
      checkResult: checkResult,
      screenshot: screenshotName,
      testStatus: testStatus,
      errorMessage: errorMessage
    });
  }

  // เขียนผลลัพธ์ลง Excel
  await writeResults(results);
});