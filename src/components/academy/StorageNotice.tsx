import { useLang } from "@/lib/i18n";
import { useProgress } from "@/lib/progress";

export function StorageNotice() {
  const { lang, storageUnavailable: languageIssue } = useLang();
  const { storageUnavailable: progressIssue } = useProgress();
  if (!languageIssue && !progressIssue) return null;
  return (
    <p role="status" className="mx-auto w-full max-w-5xl px-4 py-3 text-sm text-muted-foreground">
      {lang === "fr"
        ? "Sauvegarde locale indisponible ou illisible. Vous pouvez continuer dans cet onglet ; les changements non sauvegardés peuvent être perdus au rechargement. La langue reste indiquée dans l’URL."
        : "Local storage is unavailable or unreadable. You can continue in this tab; unsaved changes may be lost on reload. The URL still records the language."}
    </p>
  );
}
