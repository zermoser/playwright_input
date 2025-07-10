// tests/example.spec.ts
import path from 'path';
import { test, expect } from '@playwright/test';
import { backupTemplate, readTestCases, writeResults } from './utils/excel';

// ทดสอบชุดเดียวที่อ่านเคสทั้งหมด
test('ตรวจสอบข้อมูลทั้งหมดจาก Excel', async ({ page }) => {
  await backupTemplate();
  const testCases = await readTestCases();
  const results: Array<{ rowNumber: number; checkResult: string; screenshot: string }> = [];

  for (const tc of testCases) {
    await page.goto('/');

    // ใส่ข้อมูลลงในฟอร์ม
    await page.fill('#first-name', tc.firstName);
    await page.fill('#last-name', tc.lastName);
    await page.fill('#age', tc.age.toString());

    // กดปุ่มตรวจสอบผล
    await page.click('button[type="submit"]');

    // รอให้ผลลัพธ์แสดง
    await page.waitForSelector('[data-testid="result-text"]', { timeout: 5000 });

    const passed = tc.age >= 18 ? 'ผ่าน' : 'ไม่ผ่าน';
    expect(passed).toBe(passed);

    const screenshotName = `row-${tc.rowNumber}-${tc.firstName}.png`;
    const screenshotPath = path.join('tests', 'screenshots', screenshotName);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    results.push({
      rowNumber: tc.rowNumber,
      checkResult: passed,
      screenshot: screenshotName
    });
  }

  await writeResults(results);
});

// หรือใช้วิธีนี้ถ้าต้องการสร้าง test แบบ dynamic
test.describe('ทดสอบแบบ Dynamic จาก Excel', () => {
  test('สร้างและรันเคสทั้งหมด', async ({ page }) => {
    await backupTemplate();
    const testCases = await readTestCases();

    for (const [index, tc] of testCases.entries()) {
      console.log(`กำลังทดสอบเคสที่ ${index + 1}: ${tc.firstName} ${tc.lastName}`);

      await page.goto('/');

      await page.fill('#first-name', tc.firstName);
      await page.fill('#last-name', tc.lastName);
      await page.fill('#age', tc.age.toString());

      await page.click('button[type="submit"]');
      await page.waitForSelector('[data-testid="result-text"]');

      const resultElement = await page.textContent('[data-testid="result-text"]');
      const expectedResult = tc.age >= 18 ? 'ผ่าน' : 'ไม่ผ่าน';
      expect(resultElement).toContain(expectedResult);

      const screenshotName = `dynamic-case-${tc.rowNumber}-${tc.firstName}.png`;
      await page.screenshot({
        path: path.join('tests', 'screenshots', screenshotName),
        fullPage: true
      });
    }
  });
});
