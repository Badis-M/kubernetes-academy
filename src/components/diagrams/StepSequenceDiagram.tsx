import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import type { L } from "@/content/types";
import { useLang } from "@/lib/i18n";

export type SequenceNode = {
  label: L;
  detail: L;
  tone?: "active" | "success" | "blocked";
};
export type SequenceLane = { label: L; nodes: readonly SequenceNode[]; connected?: boolean };
export type SequenceStep = { title: L; description: L; scene?: readonly SequenceLane[] };
export type TimelineState = { label: L; short: L; tone?: SequenceNode["tone"] };
export type SequenceScenario = {
  label: L;
  steps: readonly SequenceStep[];
  timeline?: {
    caption: L;
    tracks: readonly { label: L; states: readonly TimelineState[] }[];
  };
};

const tones = {
  active: "border-primary bg-primary/10",
  success: "border-emerald-500/60 bg-emerald-500/10",
  blocked: "border-amber-500/60 bg-amber-500/10",
};

export function StepSequenceDiagram({
  title,
  scenarios,
  scope,
}: {
  title: L;
  scenarios: readonly [SequenceScenario, ...SequenceScenario[]];
  scope?: L;
}) {
  const { lang, tr } = useLang();
  const titleId = useId();
  const fr = lang === "fr";
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const scenario = scenarios[scenarioIndex] ?? scenarios[0];
  const last = scenario.steps.length - 1;
  const active = scenario.steps[stepIndex];

  useEffect(() => {
    if (!playing || stepIndex >= last) return;
    const timeout = window.setTimeout(() => {
      setStepIndex(stepIndex + 1);
      if (stepIndex + 1 === last) setPlaying(false);
    }, 3200);
    return () => window.clearTimeout(timeout);
  }, [last, playing, stepIndex]);

  const selectStep = (index: number) => {
    setPlaying(false);
    setStepIndex(index);
  };

  return (
    <figure
      aria-labelledby={titleId}
      className="my-8 rounded-2xl border border-border bg-surface/70 p-4 sm:p-5"
    >
      <figcaption id={titleId} className="font-semibold text-foreground">
        {tr(title)}
      </figcaption>
      {scope && (
        <details className="mt-2 text-sm text-muted-foreground">
          <summary className="cursor-pointer rounded focus-visible:outline focus-visible:outline-primary">
            {fr ? "Simulation · hypothèses" : "Simulation · assumptions"}
          </summary>
          <p className="mt-2">{tr(scope)}</p>
        </details>
      )}
      {scenarios.length > 1 && (
        <div
          className="mt-3 flex flex-wrap gap-2"
          role="group"
          aria-label={fr ? "Scénario" : "Scenario"}
        >
          {scenarios.map((item, index) => (
            <Button
              key={item.label.en}
              type="button"
              size="sm"
              className="min-h-11 h-auto whitespace-normal"
              variant={index === scenarioIndex ? "default" : "outline"}
              aria-pressed={index === scenarioIndex}
              onClick={() => {
                setScenarioIndex(index);
                selectStep(0);
              }}
            >
              {tr(item.label)}
            </Button>
          ))}
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          className="min-h-11 h-auto whitespace-normal"
          onClick={() => {
            if (stepIndex === last) setStepIndex(0);
            setPlaying(!playing);
          }}
        >
          {playing ? "Pause" : fr ? "Lecture" : "Play"}
        </Button>
        <Button
          type="button"
          size="sm"
          className="min-h-11 h-auto whitespace-normal"
          variant="outline"
          disabled={stepIndex === last}
          onClick={() => selectStep(stepIndex + 1)}
        >
          {fr ? "Étape suivante" : "Next step"}
        </Button>
        <Button
          type="button"
          size="sm"
          className="min-h-11 h-auto whitespace-normal"
          variant="outline"
          onClick={() => selectStep(0)}
        >
          {fr ? "Revenir au début" : "Reset"}
        </Button>
      </div>
      {scenario.timeline && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-muted-foreground">{tr(scenario.timeline.caption)}</p>
          <p className="mb-2 text-xs text-muted-foreground sm:hidden">
            {fr
              ? "Faites défiler la timeline horizontalement ; l’état courant est détaillé dessous."
              : "Scroll the timeline horizontally; the current state is detailed below."}
          </p>
          <div
            role="region"
            aria-label={fr ? "Timeline des conteneurs" : "Container timeline"}
            tabIndex={0}
            className="relative overflow-x-auto rounded-lg border border-border focus-visible:outline focus-visible:outline-primary"
          >
            <table className="w-full text-xs">
              <caption className="sr-only">
                {tr(title)} — {tr(scenario.label)}
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="sticky left-0 z-10 bg-surface-2 p-2 text-left">
                    {fr ? "Conteneur" : "Container"}
                  </th>
                  {scenario.steps.map((step, index) => (
                    <th key={step.title.en} scope="col" className="p-1">
                      <button
                        type="button"
                        onClick={() => selectStep(index)}
                        aria-label={`${fr ? "Afficher l’étape" : "Show step"} ${index + 1}: ${tr(step.title)}`}
                        aria-pressed={stepIndex === index}
                        className="min-h-11 min-w-11 rounded-md border border-border px-2 aria-pressed:border-primary aria-pressed:bg-primary/10"
                      >
                        {index + 1}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scenario.timeline.tracks.map((track) => (
                  <tr key={track.label.en}>
                    <th
                      scope="row"
                      className="sticky left-0 z-10 whitespace-nowrap bg-surface-2 p-2 text-left font-medium"
                    >
                      {tr(track.label)}
                    </th>
                    {track.states.map((state, index) => (
                      <td
                        key={index}
                        className={`min-w-14 border p-2 text-center ${index === stepIndex ? "border-primary" : "border-border"} ${state.tone ? tones[state.tone] : "bg-surface-2"}`}
                      >
                        <span aria-hidden="true" title={tr(state.label)}>
                          {tr(state.short)}
                        </span>
                        <span className="sr-only">{tr(state.label)}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {Array.from(
              new Map(
                scenario.timeline.tracks
                  .flatMap((track) => track.states)
                  .map((state) => [state.label.en, state]),
              ).values(),
            )
              .map((state) => `${tr(state.short)} = ${tr(state.label)}`)
              .join(" · ")}
          </p>
        </div>
      )}
      {active?.scene && (
        <div className="mt-4 space-y-3" data-sequence-scene="">
          {active.scene.map((lane) => (
            <div key={lane.label.en}>
              <p className="mb-2 text-xs font-medium text-muted-foreground">{tr(lane.label)}</p>
              <ul className="flex list-none flex-col gap-2 p-0 sm:flex-row">
                {lane.nodes.map((node, index) => (
                  <li
                    key={node.label.en}
                    className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row"
                  >
                    {lane.connected && index > 0 && (
                      <span aria-hidden="true" className="self-center text-primary">
                        <span className="sm:hidden">↓</span>
                        <span className="hidden sm:inline">→</span>
                      </span>
                    )}
                    <div
                      className={`min-w-0 flex-1 rounded-xl border p-3 [overflow-wrap:anywhere] ${node.tone ? tones[node.tone] : "border-border bg-surface-2"}`}
                    >
                      <p className="text-sm font-semibold">{tr(node.label)}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {tr(node.detail)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      <ol className="mt-4 grid list-none gap-2 p-0 sm:grid-cols-2">
        {scenario.steps.map((step, index) => (
          <li key={step.title.en}>
            <button
              type="button"
              aria-current={stepIndex === index ? "step" : undefined}
              onClick={() => selectStep(index)}
              className="size-full min-h-11 rounded-lg border border-border bg-surface-2 px-3 py-2 text-left text-sm aria-[current=step]:border-primary"
            >
              {index + 1}. {tr(step.title)}
            </button>
          </li>
        ))}
      </ol>
      {active && (
        <div
          className="mt-3 rounded-lg bg-surface-2 px-3 py-2 text-sm"
          aria-live={playing ? "off" : "polite"}
        >
          <p className="font-medium">
            {fr ? "Étape" : "Step"} {stepIndex + 1} / {scenario.steps.length}
          </p>
          <p className="mt-1 text-muted-foreground">{tr(active.description)}</p>
        </div>
      )}
    </figure>
  );
}
