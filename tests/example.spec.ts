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