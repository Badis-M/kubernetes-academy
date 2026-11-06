import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("https://static.cloudflareinsights.com/**", (route) =>
    route.fulfill({ body: "", contentType: "text/javascript" }),
  );
  await page.route("https://cloudflareinsights.com/**", (route) => route.fulfill({ status: 204 }));
});
for (const lang of ["fr", "en"] as const) {
  test(`NetworkPolicy ${lang}: selectors, direction gates, additive rules and playback`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/learn/network-policies?lang=${lang}`);
    const diagram = page.locator("[data-network-policy]");
    const status = diagram.getByRole("status", { name: /Verdict du modèle|Model verdict/ });
    const allowed = lang === "fr" ? "autorisé par ces politiques" : "allowed by these policies";
    const blocked = lang === "fr" ? "bloqué par ces politiques" : "blocked by these policies";
    const source = diagram.getByLabel(lang === "fr" ? "Namespace source" : "Source namespace", {
      exact: true,
    });
    const pod = diagram.getByLabel(lang === "fr" ? "Label du Pod source" : "Source Pod label", {
      exact: true,
    });
    const peers = diagram.getByLabel(
      lang === "fr" ? "Pairs de la règle ingress" : "Ingress rule peers",
      { exact: true },
    );
    const connection = diagram.getByLabel(
      lang === "fr" ? "Connexion vers web" : "Connection to web",
      { exact: true },
    );
    const egress = diagram.getByLabel(lang === "fr" ? "Egress source" : "Source egress", {
      exact: true,
    });
    const ingress = diagram.getByLabel(
      lang === "fr" ? "Ingress destination (base)" : "Destination ingress (base)",
      { exact: true },
    );
    const extra = diagram.getByRole("checkbox");
    await expect(status).toContainText(allowed);
    await pod.selectOption("untrusted");
    await expect(status).toContainText(blocked);
    await peers.selectOption("or");
    await expect(status).toContainText(allowed);
    await source.selectOption("other");
    await pod.selectOption("trusted");
    await expect(status).toContainText(blocked);
    await source.selectOption("lab-netpol");
    await expect(status).toContainText(allowed);
    await peers.selectOption("and");
    await expect(status).toContainText(blocked);
    await peers.selectOption("pod");
    await expect(status).toContainText(allowed);
    await connection.selectOption("TCP 443");
    await expect(status).toContainText(blocked);
    await egress.selectOption("open");
    await expect(status).toContainText(allowed);
    await connection.selectOption("UDP 80");
    await expect(status).toContainText(blocked);
    await ingress.selectOption("deny");
    await extra.focus();
    await page.keyboard.press("Space");
    await expect(status).toContainText(allowed);
    await egress.selectOption("deny");
    await expect(status).toContainText(blocked);
    await ingress.selectOption("open");
    await expect(status).toContainText(blocked);
    await diagram.locator("summary").first().click();
    await expect(diagram.locator("pre")).toHaveCount(3);
    await expect(diagram.locator("pre").last()).toContainText("- {}");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await diagram.locator("summary").first().click();
    await diagram
      .getByRole("button", {
        name: lang === "fr" ? "Réinitialiser les règles" : "Reset rules",
        exact: true,
      })
      .click();
    const figure = diagram.getByRole("figure");
    await page.clock.install();
    await figure
      .getByRole("button", { name: lang === "fr" ? "Lecture" : "Play", exact: true })
      .click();
    await page.clock.runFor(3300);
    await expect(figure.locator("ol button").nth(1)).toHaveAttribute("aria-current", "step");
    await figure.getByRole("button", { name: "Pause", exact: true }).click();
    await page.clock.runFor(6400);
    await expect(figure.locator("ol button").nth(1)).toHaveAttribute("aria-current", "step");
    for (let step = 2; step < 4; step++) {
      await figure
        .getByRole("button", { name: lang === "fr" ? "Étape suivante" : "Next step", exact: true })
        .focus();
      await page.keyboard.press("Enter");
      await expect(figure.locator("ol button").nth(step)).toHaveAttribute("aria-current", "step");
    }
    await expect(
      figure.getByRole("button", {
        name: lang === "fr" ? "Étape suivante" : "Next step",
        exact: true,
      }),
    ).toBeDisabled();
    await figure
      .getByRole("button", { name: lang === "fr" ? "Revenir au début" : "Reset", exact: true })
      .click();
    await expect(figure.locator("ol button").first()).toHaveAttribute("aria-current", "step");
    await page.getByRole("button", { name: lang === "fr" ? "en" : "fr", exact: true }).click();
    await expect(status).toContainText(
      lang === "fr" ? "allowed by these policies" : "autorisé par ces politiques",
    );
    expect(errors).toEqual([]);
  });
}
