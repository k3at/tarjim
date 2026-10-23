import { expect, test } from "@playwright/test";

test.describe("الصفحة الرئيسية", () => {
  test("تعرض المحتوى العربي باتجاه RTL", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("ترجم نصوصك وملفاتك");
    await expect(page).toHaveTitle(/تَرجِم/);
  });

  test("يظهر مترجم النصوص في الصفحة الرئيسية", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("tab", { name: /نص/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "ترجم الآن" }).first()).toBeVisible();
  });

  test("الوضع الداكن يُفعّل ويُحفظ بعد إعادة التحميل", async ({ page }) => {
    await page.goto("/");

    const toggle = page.getByRole("button", { name: /الوضع/ });
    await expect(toggle).toHaveAttribute("data-ready", "true");
    await toggle.click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("واجهة الصحة ترجع JSON سليماً", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe("ok");
  });
});
