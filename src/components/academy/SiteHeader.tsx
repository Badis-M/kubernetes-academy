import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { ui, useLang } from "@/lib/i18n";

const SUPPORT_URL = "https://ko-fi.com/badism";

export function SiteHeader() {
  const { tr, lang, setLang } = useLang();
  const supportLabel = tr({ fr: "Me soutenir", en: "Support me" });
  const links = [
    { to: "/academy", label: tr({ en: "Courses", fr: "Cours" }) },
    { to: "/lab", label: tr(ui.lab) },
    { to: "/source-files", label: tr(ui.source) },
  ] as const;
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex min-h-14 max-w-[90rem] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:flex-nowrap sm:px-6">
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-semibold tracking-tight text-foreground"
          >
            <span className="relative flex size-7 items-center justify-center rounded-lg border border-primary/40 bg-primary/10">
              <span className="size-2.5 rotate-45 rounded-[3px] border-2 border-primary" />
            </span>
            <span>Kubernetes Academy</span>
          </Link>
        </div>
        <nav
          className="flex w-full flex-wrap items-center justify-between gap-1 text-sm sm:w-auto sm:justify-start"
          aria-label={lang === "fr" ? "Navigation principale" : "Main navigation"}
        >
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "rounded-md px-2.5 py-1.5 text-foreground bg-surface-2" }}
            >
              {l.label}
            </Link>
          ))}
          <div className="flex shrink-0 items-center gap-1">
            <a
              href={SUPPORT_URL}
              aria-label={supportLabel}
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-md text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-2.5"
            >
              <Heart className="size-4" aria-hidden="true" />
              <span className="hidden whitespace-nowrap sm:inline">{supportLabel}</span>
            </a>
            <div
              className="flex rounded-lg border border-border p-0.5 font-mono text-[11px]"
              role="group"
              aria-label={lang === "fr" ? "Langue" : "Language"}
            >
              {(["fr", "en"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={`rounded-md px-2 py-1 uppercase transition ${lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { lang, tr } = useLang();
  const links = [
    { label: "Portfolio", href: "https://portfolio.badismerakchi.com/" },
    { label: "Consulting", href: "https://consulting.badismerakchi.com/" },
    { label: "Infra Academy", href: "https://academy.badismerakchi.com/" },
    { label: "GitHub", href: "https://github.com/Badis-M/kubernetes-academy" },
  ];
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[90rem] flex-col gap-5 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-8">
        <div>
          <p className="font-medium text-foreground">Kubernetes Academy</p>
          <p className="mt-1 text-xs">
            {lang === "fr" ? "gratuit, open source, local" : "free, open source, local-first"}
          </p>
          <p className="mt-2 text-xs">
            By{" "}
            <a
              href="https://portfolio.badismerakchi.com/"
              className="rounded-sm text-foreground/80 underline decoration-border underline-offset-4 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Badis M
            </a>
          </p>
          <a
            href={SUPPORT_URL}
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-3 py-2 font-medium text-primary transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Heart className="size-4 shrink-0" aria-hidden="true" />
            {tr({ fr: "Soutenir Kubernetes Academy", en: "Support Kubernetes Academy" })}
          </a>
          <p className="mt-2 max-w-xs text-xs">
            {tr({
              fr: "Le soutien est facultatif. Tous les cours restent gratuits.",
              en: "Support is optional. All courses remain free.",
            })}
          </p>
        </div>
        <nav
          aria-label={lang === "fr" ? "Autres sites et code source" : "Other sites and source code"}
          className="flex flex-wrap items-center gap-x-5 gap-y-1"
        >
          {links.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="inline-flex min-h-11 items-center rounded-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
