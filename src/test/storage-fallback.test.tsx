import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LangProvider, useLang } from "@/lib/i18n";
import { ProgressProvider, useProgress } from "@/lib/progress";
import { StorageNotice } from "@/components/academy/StorageNotice";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
function Probe() {
  const { lang, setLang } = useLang();
  const { isDone, toggle } = useProgress();
  return (
    <>
      <button onClick={() => setLang(lang === "fr" ? "en" : "fr")}>{lang}</button>
      <button onClick={() => toggle("pods")}>{isDone("pods") ? "done" : "pending"}</button>
      <StorageNotice />
    </>
  );
}
function mount(initialLang?: "fr" | "en") {
  return render(
    <LangProvider initialLang={initialLang}>
      <ProgressProvider>
        <Probe />
      </ProgressProvider>
    </LangProvider>,
  );
}
function storage(getItem: (key: string) => string | null, setItem = vi.fn()) {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: { getItem, setItem },
  });
  return setItem;
}
describe("recoverable browser persistence failures", () => {
  it("keeps language and progress usable when reads and writes are denied", () => {
    storage(
      () => {
        throw new Error("SecurityError");
      },
      vi.fn(() => {
        throw new Error("SecurityError");
      }),
    );
    mount("en");
    fireEvent.click(screen.getByText("en"));
    expect(screen.getByText("fr")).toBeTruthy();
    fireEvent.click(screen.getByText("pending"));
    expect(screen.getByText("done")).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("Sauvegarde locale");
  });
  it("keeps loaded progress when a quota error prevents writing", () => {
    storage(
      (key) => (key.endsWith("v1") ? '["pods"]' : "en"),
      vi.fn(() => {
        throw new Error("QuotaExceededError");
      }),
    );
    mount();
    fireEvent.click(screen.getByText("done"));
    expect(screen.getByText("pending")).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("Local storage");
  });
  it.each(['{"pods":true}', "[1,null]", "broken"])(
    "rejects invalid saved progress %s without rewriting it on mount",
    (raw) => {
      const writes = storage((key) => (key.endsWith("v1") ? raw : "en"));
      mount();
      expect(screen.getByText("pending")).toBeTruthy();
      expect(writes).not.toHaveBeenCalled();
      expect(screen.getByRole("status")).toBeTruthy();
    },
  );
  it("lets an explicit URL language override the saved preference", () => {
    storage((key) => (key.endsWith("lang") ? "en" : null));
    const { rerender } = mount("fr");
    expect(screen.getByText("fr")).toBeTruthy();
    rerender(
      <LangProvider initialLang="en">
        <ProgressProvider>
          <Probe />
        </ProgressProvider>
      </LangProvider>,
    );
    expect(screen.getByText("en")).toBeTruthy();
  });
});
