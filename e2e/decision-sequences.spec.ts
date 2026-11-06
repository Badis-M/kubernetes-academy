import { test, expect } from "@playwright/test";

const diagrams = [
  {
    route: "etcd",
    title: { en: "etcd · API state snapshot", fr: "etcd · snapshot de l’état API" },
    branches: 1,
  },
  {
    route: "csi",
    title: { en: "CSI · volume snapshot", fr: "CSI · snapshot de volume" },
    branches: 1,
  },
  {
    route: "backup-dr",
    title: {
      en: "Backup · source, snapshot and restore",
      fr: "Sauvegarde · source, snapshot et restauration",
    },
    branches: 1,
  },
  {
    route: "api-architecture",
    title: { en: "API · 409 Conflict and fresh read", fr: "API · conflit 409 et relecture" },
    branches: 1,
  },
  {
    route: "init-sidecars",
    title: {
      en: "Init & sidecars · lifecycle timeline",
      fr: "Init et sidecars · timeline du cycle de vie",
    },
    branches: 5,
  },
  {
    route: "probes",
    title: { fr: "Probes · routage ou redémarrage ?", en: "Probes · routing or restart?" },
    branches: 3,
  },
  {
    route: "ingress-gateway",
    title: { fr: "Gateway · configuration et trafic", en: "Gateway · configuration and traffic" },
    branches: 3,
  },
  {
    route: "scheduling",
    title: {
      fr: "Scheduling · filtrer avant de classer",
      en: "Scheduling · filter before scoring",
    },
    branches: 2,
  },
];

test.beforeEach(async ({ page }) => {
  await page.route("https://static.cloudflareinsights.com/**", (route) =>
    route.fulfill({ body: "", contentType: "text/javascript" }),
  );
  await page.route("https://cloudflareinsights.com/**", (route) => route.fulfill({ status: 204 }));
});

for (const lang of ["fr", "en"] as const) {
  for (const diagram of diagrams) {
    test(`${diagram.route} ${lang}: every branch, keyboard controls and responsive scene`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/learn/${diagram.route}?lang=${lang}`);
      const figure = page.getByRole("figure", { name: diagram.title[lang], exact: true });
      await expect(figure).toBeVisible();
      const assumptions = figure.locator("summary");
      await assumptions.focus();
      await page.keyboard.press("Enter");
      await expect(figure.locator("details")).toHaveAttribute("open", "");
      await assumptions.press("Enter");
      await expect(figure.locator("details")).not.toHaveAttribute("open", "");
      const branches = figure.getByRole("group").getByRole("button");
      await expect(branches).toHaveCount(diagram.branches > 1 ? diagram.branches : 0);
      const next = figure.getByRole("button", {
        name: lang === "fr" ? "Étape suivante" : "Next step",
        exact: true,
      });
      const reset = figure.getByRole("button", {
        name: lang === "fr" ? "Revenir au début" : "Reset",
        exact: true,
      });
      const play = figure.getByRole("button", {
        name: lang === "fr" ? "Lecture" : "Play",
        exact: true,
      });
      for (let branch = 0; branch < diagram.branches; branch++) {
        if (diagram.branches > 1) {
          await branches.nth(branch).click();
          await expect(branches.nth(branch)).toHaveAttribute("aria-pressed", "true");
        }
        const steps = figure.locator("ol button");
        for (let step = 0; step < (await steps.count()); step++) {
          await expect(steps.nth(step)).toHaveAttribute("aria-current", "step");
          await expect(figure.locator("[data-sequence-scene]")).toBeVisible();
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          ).toBe(true);
          expect(
            await figure
              .locator("[data-sequence-scene]")
              .evaluate((el) => el.scrollWidth <= el.clientWidth),
          ).toBe(true);
          if (step < (await steps.count()) - 1) {
            await next.focus();
            await page.keyboard.press("Enter");
          }
        }
        await expect(next).toBeDisabled();
        await reset.focus();
        await page.keyboard.press("Space");
        await expect(steps.first()).toHaveAttribute("aria-current", "step");
      }
      await page.clock.install();
      await play.click();
      await expect(figure.getByRole("button", { name: "Pause", exact: true })).toBeVisible();
      await page.clock.runFor(3300);
      await expect(figure.locator("ol button").nth(1)).toHaveAttribute("aria-current", "step");
      await figure.getByRole("button", { name: "Pause", exact: true }).click();
      await page.clock.runFor(6400);
      await expect(figure.locator("ol button").nth(1)).toHaveAttribute("aria-current", "step");
      await reset.click();
      await expect(figure.locator("ol button").first()).toHaveAttribute("aria-current", "step");
      expect(errors).toEqual([]);
    });
  }
}
