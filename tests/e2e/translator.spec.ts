import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

test.describe("ترجمة النصوص", () => {
  test("ترجمة بسيطة بنص وهمي", async ({ page }) => {
    await page.route("**/api/translate", async (route) => {
      const body = route.request().postDataJSON() as { text?: string; segments?: string[] };
      const source = body.text ?? (Array.isArray(body.segments) ? body.segments.join(" ") : "");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          translation: `ترجمة تجريبية: ${source}`,
          translations: [source ? `ترجمة تجريبية: ${source}` : ""],
          detectedSource: "en",
          provider: "test",
          characters: source.length,
          cached: false,
        }),
      });
    });

    await page.goto("/text");
    await page.locator("textarea").first().fill("hello world");
    await page.getByRole("button", { name: "ترجم الآن" }).click();
    await expect(page.getByText("ترجمة تجريبية: hello world")).toBeVisible();
  });
});

test.describe("ترجمة الملفات", () => {
  test("رفع ملف txt وترجمته", async ({ page }, testInfo) => {
    await page.route("**/api/translate", async (route) => {
      const body = route.request().postDataJSON() as { segments?: string[] };
      const segments = Array.isArray(body.segments) ? body.segments : [];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          translations: segments.map((item) => `AR: ${item}`),
          detectedSource: "en",
          provider: "test",
          characters: segments.reduce((total, item) => total + item.length, 0),
          cached: false,
        }),
      });
    });

    await page.goto("/files");
    await page.getByRole("tab", { name: /ملفات/ }).click();

    const filePath = path.join(testInfo.outputPath("sample.txt"));
    fs.writeFileSync(filePath, "Hello from file.\nSecond line.", "utf8");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
    await page.getByRole("button", { name: "ترجم الملف" }).click();

    await expect(page.getByText("تمت ترجمة الملف بنجاح")).toBeVisible({ timeout: 20_000 });
    const download = page.getByRole("link", { name: "تنزيل الملف المترجم" });
    await expect(download).toBeVisible();
    await expect(download).toHaveAttribute("download", /مترجم/);
  });
});

test.describe("الصفحات الثانوية", () => {
  test("صفحة اللغات تعمل وبحثها", async ({ page }) => {
    await page.goto("/languages");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.getByRole("searchbox").fill("اليابانية");
    await expect(page.getByRole("heading", { level: 2, name: "اليابانية" })).toBeVisible();
  });

  test("صفحة 404", async ({ page }) => {
    await page.goto("/does-not-exist");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("لم نجد هذه الصفحة");
  });

  test("صفحات قانونية وتحميلها", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.goto("/terms");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.goto("/about");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
