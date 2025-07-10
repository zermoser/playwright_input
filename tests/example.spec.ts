// tests/example.spec.ts
import path from 'path';
import { test, expect } from '@playwright/test';
import { backupTemplate, readTestCases, writeResults } from './utils/excel';

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

      const screenshotName = `case-${tc.rowNumber}-${tc.firstName}.jpg`;
      await page.screenshot({
        path: path.join('tests', 'screenshots', screenshotName),
        fullPage: true
      });
    }
  });
});
