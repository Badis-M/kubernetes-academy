import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const KEY = "k8slab.progress.v1";

type Ctx = {
  storageUnavailable: boolean;
  done: Set<string>;
  toggle: (id: string) => void;
  isDone: (id: string) => boolean;
};
const ProgressCtx = createContext<Ctx>({
  storageUnavailable: false,
  done: new Set(),
  toggle: () => {},
  isDone: () => false,
});

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [done, setDone] = useState<Set<string>>(new Set());

  const [storageUnavailable, setStorageUnavailable] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed) || !parsed.every((id) => typeof id === "string"))
          throw new Error("Invalid saved progress");
        setDone(new Set(parsed));
      }
    } catch {
      setStorageUnavailable(true);
    }
  }, []);

  const toggle = (id: string) => {
    const next = new Set(done);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    // Keep this tab usable even when persistence is denied or full.
    setDone(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify([...next]));
      setStorageUnavailable(false);
    } catch {
      setStorageUnavailable(true);
    }
  };

  return (
    <ProgressCtx.Provider
      value={{ storageUnavailable, done, toggle, isDone: (id) => done.has(id) }}
    >
      {children}
    </ProgressCtx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- Keep the shared context API with its provider.
export const useProgress = () => useContext(ProgressCtx);
