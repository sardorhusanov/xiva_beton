import { test, expect } from "@playwright/test";
test("order creation, pricing, search, status and persistence", async ({
  page,
}) => {
  await page.goto("/#orders");
  await page
    .getByRole("button", { name: "Yangi buyurtma", exact: true })
    .click();
  const d = page.getByRole("dialog");
  await d.getByLabel("Mijoz nomi").fill("React test mijoz");
  await d.getByLabel("Miqdor").fill("120");
  await expect(d.getByText("9 510 000 so‘m", { exact: true })).toBeVisible();
  await d.getByRole("button", { name: "Saqlash" }).click();
  await page.getByLabel("Buyurtma qidirish").fill("React test mijoz");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Ishlab chiqarishga", exact: true })
    .click();
  await expect(
    page.locator("tbody").getByText("Ishlab chiqarilmoqda", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "#1055 React test mijoz" }),
  ).toBeVisible();
});
test("batch and inventory receipts update persisted records", async ({
  page,
}) => {
  await page.goto("/#production");
  await page.getByRole("button", { name: "Partiya qo‘shish" }).click();
  const d = page.getByRole("dialog");
  await d.getByLabel("Miqdor").fill("10");
  await d.getByLabel("Brak").fill("2");
  await d.getByRole("button", { name: "Saqlash" }).click();
  let s = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("xiva-beton-react-v1")),
  );
  expect(s.products[0].made).toBe(328);
  expect(s.materials[0].stock).toBeCloseTo(309.832);
  await page.goto("/#warehouse");
  await page
    .getByRole("button", { name: "Kirim qo‘shish", exact: true })
    .first()
    .click();
  await d.getByLabel("Miqdor").fill("20");
  await d.getByRole("button", { name: "Saqlash" }).click();
  s = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("xiva-beton-react-v1")),
  );
  expect(s.materials[0].stock).toBeCloseTo(329.832);
});
test("all views render, assistant replies, report downloads and mobile stays in viewport", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const route of [
    "dashboard",
    "production",
    "warehouse",
    "orders",
    "finance",
    "delivery",
    "assistant",
  ]) {
    await page.goto("/#" + route);
    await expect(page.locator("h1")).toBeVisible();
  }
  await page.getByRole("button", { name: "Omborda nima kam?" }).click();
  await expect(page.locator(".chat")).toContainText("Sement M500");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Hisobot", exact: true }).click();
  expect((await download).suggestedFilename()).toBe("xiva-beton-hisobot.csv");
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    "dashboard",
    "production",
    "warehouse",
    "orders",
    "finance",
    "delivery",
    "assistant",
  ]) {
    await page.goto("/#" + route);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole("button", { name: "Menyuni ochish" }).click();
  await page
    .getByRole("button", { name: "Boshqaruv paneli", exact: true })
    .click();
  await expect(page.locator("h1")).toHaveText("Boshqaruv paneli");
  expect(errors).toEqual([]);
});
