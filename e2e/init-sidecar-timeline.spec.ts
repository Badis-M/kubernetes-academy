import { test, expect } from "@playwright/test";
for (const lang of ["fr", "en"] as const) {
  test(`Init sidecars ${lang}: timeline keyboard selection and local horizontal scrolling`, async ({
    page,
  }) => {
    await page.route("https://static.cloudflareinsights.com/**", (route) =>
      route.fulfill({ body: "", contentType: "text/javascript" }),
    );
    await page.route("https://cloudflareinsights.com/**", (route) =>
      route.fulfill({ status: 204 }),
    );
    await page.goto(`/learn/init-sidecars?lang=${lang}`);
    const figure = page.getByRole("figure");
    const timeline = figure.getByRole("region");
    const columns = timeline.getByRole("button");
    await expect(columns).toHaveCount(7);
    await columns.last().focus();
    await page.keyboard.press("Enter");
    await expect(columns.last()).toHaveAttribute("aria-pressed", "true");
    await expect(figure.locator("ol button").last()).toHaveAttribute("aria-current", "step");
    await expect(columns.last()).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if (await timeline.evaluate((el) => el.scrollWidth > el.clientWidth)) {
      expect(await timeline.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
      await timeline.focus();
      const previous = await timeline.evaluate((el) => el.scrollLeft);
      await page.keyboard.press("ArrowLeft");
      await expect.poll(() => timeline.evaluate((el) => el.scrollLeft)).toBeLessThan(previous);
    }
    await page.getByRole("button", { name: lang === "fr" ? "en" : "fr", exact: true }).click();
    await expect(columns.last()).toHaveAttribute("aria-pressed", "true");
    await expect(figure.locator("thead th").first()).toHaveText(
      lang === "fr" ? "Container" : "Conteneur",
    );
  });
}
