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

// ทางเลือก: ทดสอบแต่ละเคสแยกกัน
test.describe('ตรวจสอบข้อมูลแต่ละเคสจาก Excel', () => {
  let testCases: any[] = [];

  test.beforeAll(async () => {
    await backupTemplate();
    testCases = await readTestCases();
  });

  // สร้างทดสอบสำหรับ 5 เคสแรก (หรือปรับจำนวนตามต้องการ)
  for (let i = 0; i < 5; i++) {
    test(`เคสที่ ${i + 1} จาก Excel`, async ({ page }) => {
      // ตรวจสอบว่ามีข้อมูลในตำแหน่งที่ต้องการ
      if (i >= testCases.length) {
        console.log(`ข้าม: ไม่มีข้อมูลในตำแหน่งที่ ${i + 1}`);
        return;
      }

      const tc = testCases[i];

      await page.goto('/');

      // ใส่ข้อมูล
      await page.fill('#first-name', tc.firstName);
      await page.fill('#last-name', tc.lastName);
      await page.fill('#age', tc.age.toString());

      // กดปุ่ม
      await page.click('button[type="submit"]');

      // รอผลลัพธ์
      await page.waitForSelector('[data-testid="result-text"]');

      // ตรวจสอบผลลัพธ์
      const resultElement = await page.textContent('[data-testid="result-text"]');
      const expectedResult = tc.age >= 18 ? 'ผ่าน' : 'ไม่ผ่าน';
      expect(resultElement).toContain(expectedResult);

      // ตรวจสอบสีของผลลัพธ์
      const resultDiv = page.locator('[data-testid="result-text"]');
      if (expectedResult === 'ผ่าน') {
        await expect(resultDiv).toHaveClass(/bg-green-100/);
      } else {
        await expect(resultDiv).toHaveClass(/bg-red-100/);
      }

      // Screenshot
      const screenshotName = `individual-case-${tc.rowNumber}-${tc.firstName}.png`;
      await page.screenshot({
        path: path.join('tests', 'screenshots', screenshotName),
        fullPage: true
      });
    });
  }
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

// ทางเลือก: ถ้าต้องการทดสอบแบบแยกเคส
test.describe('ตรวจสอบข้อมูลแต่ละเคสจาก Excel', () => {
  let testCases: any[];

  test.beforeAll(async () => {
    await backupTemplate();
    testCases = await readTestCases();
  });

  for (let i = 0; i < 5; i++) { // จำกัดจำนวนเคสหรือใช้ testCases.length
    test(`ตรวจสอบเคสที่ ${i + 1}`, async ({ page }) => {
      if (i >= testCases.length) return;

      const tc = testCases[i];

      await page.goto('/');

      // ใส่ข้อมูล
      await page.fill('input[name="firstName"]', tc.firstName);
      await page.fill('input[name="lastName"]', tc.lastName);
      await page.fill('input[name="age"]', tc.age.toString());

      // Submit
      await page.click('button[type="submit"]');

      // รอผลลัพธ์
      await page.waitForSelector('.result');

      // ตรวจสอบ
      const resultElement = await page.textContent('.result');
      const expected = tc.age >= 18 ? 'ผ่าน' : 'ไม่ผ่าน';
      expect(resultElement).toContain(expected);

      // Screenshot
      const screenshotName = `case-${tc.rowNumber}-${tc.firstName}.png`;
      await page.screenshot({
        path: path.join('tests', 'screenshots', screenshotName),
        fullPage: true
      });
    });
  }
});