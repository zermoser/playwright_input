
// tests/example.spec.ts
import fs from 'fs-extra';
import path from 'path';
import { test, expect } from '@playwright/test';
import { backupTemplate, readTestCases, writeResults } from './utils/excel';

test('ตรวจสอบข้อมูลทั้งหมดจาก Excel', async ({ page }) => {
  await backupTemplate();
  const testCases = await readTestCases();
  const results: Array<{ rowNumber: number; checkResult: string; screenshot: string }> = [];

  // สร้างโฟลเดอร์ screenshots ถ้ายังไม่มี
  const screenshotDir = path.join('tests', 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

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
    const screenshotPath = path.join(screenshotDir, screenshotName);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // results.push({
    //   rowNumber: tc.rowNumber,
    //   checkResult: passed,
    //   screenshot: screenshotName
    // });
  }

  await writeResults(results);
});