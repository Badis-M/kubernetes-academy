import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import type { L, Lang } from "@/content/types";

const KEY = "k8slab.lang";

const LangCtx = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  tr: (s: L) => string;
  storageUnavailable: boolean;
}>({
  lang: "en",
  setLang: () => {},
  tr: (s) => s.en,
  storageUnavailable: false,
});

export function LangProvider({
  children,
  initialLang,
  onLanguageChange,
}: {
  children: ReactNode;
  initialLang?: Lang | undefined;
  onLanguageChange?: (lang: Lang) => void;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang ?? "en");
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const initialized = useRef(false);
  useEffect(() => {
    if (initialLang) {
      setLangState(initialLang);
      initialized.current = true;
      return;
    }
    if (initialized.current) return;
    initialized.current = true;
    let selected: Lang = navigator.language?.toLowerCase().startsWith("fr") ? "fr" : "en";
    try {
      const saved = window.localStorage.getItem(KEY);
      if (saved === "fr" || saved === "en") selected = saved;
    } catch {
      setStorageUnavailable(true);
    }
    setLangState(selected);
    onLanguageChange?.(selected);
  }, [initialLang, onLanguageChange]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = (value: Lang) => {
    setLangState(value);
    try {
      window.localStorage.setItem(KEY, value);
      setStorageUnavailable(false);
    } catch {
      setStorageUnavailable(true);
    }
    onLanguageChange?.(value);
  };
  return (
    <LangCtx.Provider value={{ lang, setLang, tr: (s) => s[lang], storageUnavailable }}>
      {children}
    </LangCtx.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components -- Keep the shared context API with its provider.
export const useLang = () => useContext(LangCtx);

/** Interface strings. */
// eslint-disable-next-line react-refresh/only-export-components -- Keep the shared context API with its provider.
export const ui = {
  academy: { en: "Academy", fr: "Académie" },
  lab: { en: "Guided lab", fr: "Lab guidé" },
  source: { en: "Source files", fr: "Fichiers source" },
  start: { en: "Start learning", fr: "Commencer" },
  continue: { en: "Continue", fr: "Continuer" },
  explore: { en: "Explore the curriculum", fr: "Explorer le programme" },
  available: { en: "Available", fr: "Disponible" },
  upcoming: { en: "Upcoming", fr: "À venir" },
  minutes: { en: "min", fr: "min" },
  chapters: { en: "chapters", fr: "chapitres" },
  onThisPage: { en: "On this page", fr: "Sur cette page" },
  curriculum: { en: "Curriculum", fr: "Programme" },
  prev: { en: "Previous", fr: "Précédent" },
  next: { en: "Next", fr: "Suivant" },
  markDone: { en: "Mark chapter as complete", fr: "Marquer le chapitre comme terminé" },
  done: { en: "Completed", fr: "Terminé" },
  undo: { en: "Mark as not done", fr: "Marquer comme non terminé" },
  copy: { en: "Copy", fr: "Copier" },
  copied: { en: "Copied", fr: "Copié" },
  hint: { en: "Hint", fr: "Indice" },
  showSolution: { en: "Show the detailed solution", fr: "Afficher la solution détaillée" },
  hideSolution: { en: "Hide the solution", fr: "Masquer la solution" },
  challenge: { en: "Challenge", fr: "Défi" },
  why: { en: "Why", fr: "Pourquoi" },
  expected: { en: "Expected result", fr: "Résultat attendu" },
  mistake: { en: "Common mistake", fr: "Erreur fréquente" },
  prereq: { en: "Recommended first", fr: "À lire avant" },
  related: { en: "Related chapters", fr: "Chapitres liés" },
  progress: { en: "Your progress", fr: "Votre progression" },
  upcomingNote: {
    en: "This chapter is being written. It will be published only once its explanations, lab and solutions are complete.",
    fr: "Ce chapitre est en cours de rédaction. Il ne sera publié qu'une fois ses explications, son lab et ses solutions complets.",
  },
  heavy: { en: "Resource note", fr: "Note sur les ressources" },
  level: { en: "Level", fr: "Niveau" },
} satisfies Record<string, L>;
