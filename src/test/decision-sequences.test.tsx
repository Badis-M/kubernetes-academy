import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StepSequenceDiagram } from "@/components/diagrams/StepSequenceDiagram";
import {
  gatewaySequence,
  probesSequence,
  schedulingSequence,
} from "@/content/diagrams/decision-sequences";
import {
  FleetPromotionDiagram,
  EvictionBudgetDiagram,
} from "@/components/diagrams/LabSequenceDiagrams";
import { LangProvider } from "@/lib/i18n";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

for (const lang of ["fr", "en"] as const) {
  describe(`decision sequences (${lang})`, () => {
    for (const sequence of [probesSequence, gatewaySequence, schedulingSequence]) {
      it(`renders every branch of ${sequence.title.en} with a textual alternative`, () => {
        render(
          <LangProvider initialLang={lang}>
            <StepSequenceDiagram {...sequence} />
          </LangProvider>,
        );
        expect(screen.getByRole("figure", { name: sequence.title[lang] })).toBeInTheDocument();
        for (const scenario of sequence.scenarios) {
          fireEvent.click(screen.getByRole("button", { name: scenario.label[lang] }));
          for (const [index, step] of scenario.steps.entries()) {
            fireEvent.click(
              screen.getByRole("button", {
                name: `${index + 1}. ${step.title[lang]}`,
              }),
            );
            expect(screen.getByText(step.description[lang])).toBeInTheDocument();
            expect(document.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
            for (const lane of step.scene ?? []) {
              expect(screen.getByText(lane.label[lang])).toBeInTheDocument();
              for (const node of lane.nodes)
                expect(screen.getAllByText(node.detail[lang]).length).toBeGreaterThan(0);
            }
          }
          expect(
            screen.getByRole("button", {
              name: lang === "fr" ? "Étape suivante" : "Next step",
            }),
          ).toBeDisabled();
          fireEvent.click(
            screen.getByRole("button", {
              name: lang === "fr" ? "Revenir au début" : "Reset",
            }),
          );
          expect(screen.getByText(scenario.steps[0]!.description[lang])).toBeInTheDocument();
        }
      });
    }
  });
}

it("does not autoplay, pauses, resets on scenario changes, stops at the end and replays", () => {
  vi.useFakeTimers();
  const { unmount } = render(
    <LangProvider initialLang="en">
      <StepSequenceDiagram {...probesSequence} />
    </LangProvider>,
  );
  const current = () => document.querySelector('[aria-current="step"]')?.textContent;
  act(() => {
    vi.advanceTimersByTime(6400);
  });
  expect(current()).toMatch(/^1\./);
  fireEvent.click(screen.getByRole("button", { name: "Play" }));
  act(() => {
    vi.advanceTimersByTime(3200);
  });
  expect(current()).toMatch(/^2\./);
  fireEvent.click(screen.getByRole("button", { name: "Pause" }));
  act(() => {
    vi.advanceTimersByTime(6400);
  });
  expect(current()).toMatch(/^2\./);
  fireEvent.click(screen.getByRole("button", { name: "Play" }));
  fireEvent.click(screen.getByRole("button", { name: "Startup" }));
  act(() => {
    vi.advanceTimersByTime(6400);
  });
  expect(current()).toMatch(/^1\./);
  fireEvent.click(screen.getByRole("button", { name: "Play" }));
  act(() => {
    vi.advanceTimersByTime(3200);
  });
  act(() => {
    vi.advanceTimersByTime(3200);
  });
  expect(current()).toMatch(/^3\./);
  expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Next step" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Play" }));
  expect(current()).toMatch(/^1\./);
  fireEvent.click(screen.getByRole("button", { name: "Next step" }));
  act(() => {
    vi.advanceTimersByTime(6400);
  });
  expect(current()).toMatch(/^2\./);
  fireEvent.click(screen.getByRole("button", { name: "Reset" }));
  expect(current()).toMatch(/^1\./);
  fireEvent.click(screen.getByRole("button", { name: "Play" }));
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

for (const lang of ["fr", "en"] as const) {
  for (const Component of [FleetPromotionDiagram, EvictionBudgetDiagram]) {
    it(`preserves ${Component.name} controls in ${lang}`, () => {
      render(
        <LangProvider initialLang={lang}>
          <Component />
        </LangProvider>,
      );
      const steps = document.querySelectorAll("ol button");
      fireEvent.click(steps[steps.length - 1]!);
      expect(
        screen.getByRole("button", { name: lang === "fr" ? "Étape suivante" : "Next step" }),
      ).toBeDisabled();
      fireEvent.click(
        screen.getByRole("button", { name: lang === "fr" ? "Revenir au début" : "Reset" }),
      );
      expect(steps[0]).toHaveAttribute("aria-current", "step");
      expect(
        screen.getByRole("button", { name: lang === "fr" ? "Lecture" : "Play" }),
      ).toBeInTheDocument();
    });
  }
}
