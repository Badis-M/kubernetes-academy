import { spawnSync } from "node:child_process";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import {
  initSidecarTimeline,
  lifecycleStates as state,
} from "@/content/diagrams/init-sidecar-timeline";
import { InitSidecarTimeline } from "@/components/diagrams/InitSidecarTimeline";
import { LangProvider } from "@/lib/i18n";
import manifest from "../../lab/level-2/init-sidecars/web.yaml?raw";

const scenarios = initSidecarTimeline.scenarios;
const tracks = (index: number) => scenarios[index]!.timeline!.tracks;

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
it("matches the lab's actual container order and startup gate", () => {
  const parsed = spawnSync(
    "bun",
    [
      "-e",
      "const docs=Bun.YAML.parse(await Bun.stdin.text()); console.log(JSON.stringify(docs.find(doc=>doc.kind==='Pod').spec));",
    ],
    { input: manifest, encoding: "utf8" },
  );
  expect(parsed.status, parsed.stderr).toBe(0);
  const spec = JSON.parse(parsed.stdout);
  expect(spec.initContainers.map((container: { name: string }) => container.name)).toEqual([
    "seed-page",
    "access-log",
  ]);
  expect(spec.containers.map((container: { name: string }) => container.name)).toEqual(["web"]);
  expect(spec.initContainers[0].restartPolicy).toBeUndefined();
  expect(spec.initContainers[1]).toMatchObject({
    restartPolicy: "Always",
    startupProbe: {
      failureThreshold: 10,
      periodSeconds: 1,
      exec: { command: ["test", "-f", "/logs/access.log"] },
    },
  });
  expect(spec.initContainers[1].readinessProbe).toBeUndefined();
  expect(spec.restartPolicy ?? "Always").toBe("Always");
  expect(tracks(0).map((track) => track.label.en)).toEqual(["seed-page", "access-log", "web"]);
});
it("never starts web before regular init completion and sidecar startup success", () => {
  for (const scenario of scenarios.slice(0, 4)) {
    const [seed, sidecar, app] = scenario.timeline!.tracks;
    scenario.steps.forEach((_, index) => {
      if (sidecar!.states[index] !== state.waiting)
        expect(seed!.states[index]).toBe(state.complete);
      if (app!.states[index] === state.running) {
        expect(seed!.states[index]).toBe(state.complete);
        expect(sidecar!.states[index]).toBe(state.running);
        expect(sidecar!.states.slice(0, index)).toContain(state.probing);
        expect(sidecar!.states[index - 1]).toBe(state.running);
      }
    });
  }
  for (const index of [1, 2, 3])
    expect(tracks(index)[2]!.states.every((item) => item === state.waiting)).toBe(true);
  expect(
    tracks(2)[0]!
      .states.slice(1)
      .every((item) => item === state.complete),
  ).toBe(true);
  expect(tracks(2)[1]!.states).toContain(state.restarting);
  expect(
    tracks(3)[1]!
      .states.slice(1)
      .every((item) => item === state.running),
  ).toBe(true);
});
it("orders normal termination after web and reverses sidecar order", () => {
  const [, sidecar, app] = tracks(0);
  const stop = sidecar!.states.indexOf(state.stopping);
  expect(app!.states[stop]).toBe(state.stopped);
  const [a, b, web] = tracks(4);
  const stopB = b!.states.indexOf(state.stopping);
  const stopA = a!.states.indexOf(state.stopping);
  expect(stopB).toBeLessThan(stopA);
  expect(web!.states[stopB]).toBe(state.stopped);
  expect(a!.states[stopB]).toBe(state.running);
  expect(b!.states[stopA]).toBe(state.stopped);
});
for (const lang of ["fr", "en"] as const) {
  it(`keeps every timeline cell aligned with its textual snapshot in ${lang}`, () => {
    render(
      <LangProvider initialLang={lang}>
        <InitSidecarTimeline />
      </LangProvider>,
    );
    for (const scenario of scenarios) {
      fireEvent.click(screen.getByRole("button", { name: scenario.label[lang] }));
      const table = screen.getByRole<HTMLTableElement>("table");
      const columns = within(table).getAllByRole("button");
      expect(table.rows).toHaveLength(4);
      expect(within(table).getAllByRole("cell")).toHaveLength(scenario.steps.length * 3);
      scenario.steps.forEach((step, index) => {
        fireEvent.click(columns[index]!);
        expect(columns.filter((column) => column.getAttribute("aria-pressed") === "true")).toEqual([
          columns[index],
        ]);
        expect(screen.getByText(step.description[lang])).toBeInTheDocument();
        scenario.timeline!.tracks.forEach((track, row) => {
          expect(track.states).toHaveLength(scenario.steps.length);
          // The first cell in each body row is the row header.
          expect(table.rows[row + 1]?.cells[index + 1]).toHaveTextContent(
            track.states[index]!.label[lang],
          );
          expect(step.scene![0]!.nodes[row]!.detail[lang]).toContain(
            track.states[index]!.label[lang],
          );
        });
      });
    }
  });
}
it("pauses autoplay on a timeline jump and resets when a shorter branch is selected", () => {
  vi.useFakeTimers();
  render(
    <LangProvider initialLang="en">
      <InitSidecarTimeline />
    </LangProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Play" }));
  act(() => {
    vi.advanceTimersByTime(3200);
  });
  const columns = within(screen.getByRole("table")).getAllByRole("button");
  expect(columns[1]).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(columns[5]!);
  act(() => {
    vi.advanceTimersByTime(6400);
  });
  expect(columns[5]).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Companion as a regular init" }));
  expect(within(screen.getByRole("table")).getAllByRole("button")[0]).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  fireEvent.click(screen.getByRole("button", { name: "Play" }));
  act(() => {
    vi.advanceTimersByTime(3200);
  });
  act(() => {
    vi.advanceTimersByTime(3200);
  });
  expect(screen.getByRole("button", { name: "Next step" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Reset" }));
  expect(within(screen.getByRole("table")).getAllByRole("button")[0]).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
