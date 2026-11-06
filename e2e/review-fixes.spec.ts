import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("https://static.cloudflareinsights.com/**", (route) =>
    route.fulfill({ body: "", contentType: "text/javascript" }),
  );
  await page.route("https://cloudflareinsights.com/**", (route) => route.fulfill({ status: 204 }));
});

test("explicit language renders content and metadata on the server", async ({ request }) => {
  const routes = ["/", "/academy", "/lab", "/source-files", "/learn/pods"];
  for (const lang of ["fr", "en"])
    for (const route of routes) {
      const response = await request.get(`${route}?lang=${lang}`);
      expect(response.status()).toBe(200);
      const html = await response.text();
      expect(html).toContain(`<html lang="${lang}"`);
      const title = html.match(/<title>(.*?)<\/title>/)?.[1];
      const description = html.match(/<meta name="description" content="([^"]+)"/u)?.[1];
      expect(title).toBeTruthy();
      expect(description).toBeTruthy();
      if (lang === "fr") {
        expect(title).toMatch(/Apprendre|Programme|guidé|Fichiers|Pods/);
        expect(html).toContain("Cours");
      } else expect(html).toContain("Courses");
    }
  const redirect = await request.get("/prerequisites?lang=fr", { maxRedirects: 0 });
  expect(redirect.status()).toBe(301);
  expect(redirect.headers()["location"]).toContain("lang=fr");
});

test("language and progress remain usable with blocked browser storage", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
    Storage.prototype.setItem = () => {
      throw new DOMException("Full", "QuotaExceededError");
    };
  });
  await page.goto("/learn/pods?lang=en");
  await expect(page.getByRole("status").filter({ hasText: "Local storage" })).toContainText(
    "Local storage",
  );
  await page.getByRole("button", { name: "fr", exact: true }).click();
  await expect(page).toHaveURL(/lang=fr/);
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await page
    .getByRole("button", { name: "Marquer le chapitre comme terminé", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Marquer comme non terminé", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Cours", exact: true }).click();
  await expect(page).toHaveURL(/\/academy\?lang=fr$/);
  await expect(page).toHaveTitle("Programme — Kubernetes Academy");
  await expect(page.locator("#level-1")).toContainText("1/11");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.reload();
  await expect(page).toHaveTitle("Programme — Kubernetes Academy");
  await expect(page.locator("#level-1")).toContainText("0/11");
  expect(errors).toEqual([]);
});

test("URL language overrides a conflicting saved preference and survives navigation", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem("k8slab.lang", "en"));
  await page.goto("/source-files?lang=fr");
  await expect(page).toHaveTitle("Fichiers source du lab — Kubernetes Academy");
  await page.getByRole("link", { name: "Lab guidé", exact: true }).click();
  await expect(page).toHaveURL(/\/lab\?lang=fr$/);
  await expect(page).toHaveTitle(/Lab guidé/);
  await page.getByRole("button", { name: "en", exact: true }).click();
  await expect(page).toHaveTitle(/Guided lab/);
  await page.reload();
  await expect(page).toHaveTitle(/Guided lab/);
});

test("changing language preserves the current section anchor", async ({ page }) => {
  await page.goto("/academy?lang=en#level-3");
  await expect(page.locator("#level-3 h2")).toBeInViewport();
  await page.getByRole("button", { name: "fr", exact: true }).click();
  await expect(page).toHaveURL(/lang=fr#level-3$/);
  await expect(page).toHaveTitle("Programme — Kubernetes Academy");
});
