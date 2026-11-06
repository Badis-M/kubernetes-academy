import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  retainSearchParams,
  useNavigate,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useCallback, type ReactNode } from "react";

import type { Lang } from "../content/types";
import { StorageNotice } from "../components/academy/StorageNotice";
import appCss from "../styles.css?url";
import { SiteHeader, SiteFooter } from "../components/academy/SiteHeader";
import { LangProvider, useLang } from "../lib/i18n";
import { ProgressProvider } from "../lib/progress";

function NotFoundComponent() {
  const { lang } = useLang();
  const fr = lang === "fr";
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          {fr ? "Page introuvable" : "Page not found"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {fr
            ? "La page que vous cherchez n’existe pas ou a été déplacée."
            : "The page you're looking for doesn't exist or has been moved."}
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {fr ? "Retour à l’accueil" : "Go home"}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  const { lang } = useLang();
  const fr = lang === "fr";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {fr ? "Impossible de charger cette page" : "This page didn't load"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {fr
            ? "Une erreur est survenue. Vous pouvez réessayer ou revenir à l’accueil."
            : "Something went wrong on our end. You can try refreshing or head back home."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {fr ? "Réessayer" : "Try again"}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {fr ? "Retour à l’accueil" : "Go home"}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  validateSearch: (search: Record<string, unknown>): { lang?: Lang } => ({
    ...(search["lang"] === "fr" || search["lang"] === "en" ? { lang: search["lang"] } : {}),
  }),
  search: { middlewares: [retainSearchParams(["lang"])] },
  loaderDeps: ({ search }) => ({ lang: search.lang }),
  head: ({ match }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Kubernetes Academy" },
      {
        name: "description",
        content:
          match.search.lang === "fr"
            ? "Un lab visuel pratique pour apprendre Kubernetes."
            : "A hands-on visual lab to learn Kubernetes.",
      },
      { property: "og:title", content: "Kubernetes Academy" },
      {
        property: "og:description",
        content:
          match.search.lang === "fr"
            ? "Un lab visuel pratique pour apprendre Kubernetes."
            : "A hands-on visual lab to learn Kubernetes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap",
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const nonce = useRouter().options.ssr?.nonce;
  const { lang } = Route.useSearch();
  const navigate = useNavigate();
  const changeLanguage = useCallback(
    (next: Lang) => {
      void navigate({
        to: ".",
        search: (previous) => ({ ...previous, lang: next }),
        hash: true,
        hashScrollIntoView: false,
        replace: true,
        resetScroll: false,
      }).catch(console.error);
    },
    [navigate],
  );

  return (
    <html lang={lang ?? "en"} className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <LangProvider initialLang={lang} onLanguageChange={changeLanguage}>
          {children}
        </LangProvider>
        <Scripts />
        {/* Cloudflare Web Analytics */}
        <script
          type="module"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "5b83c8beea424e25b3810d5d866a6752"}'
          nonce={nonce}
        />
        {/* End Cloudflare Web Analytics */}
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <ProgressProvider>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <StorageNotice />
          <main className="flex-1">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
      </ProgressProvider>
    </QueryClientProvider>
  );
}
