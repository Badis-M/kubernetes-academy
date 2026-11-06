import { initSidecarTimeline } from "@/content/diagrams/init-sidecar-timeline";
import { StepSequenceDiagram } from "./StepSequenceDiagram";

export function InitSidecarTimeline() {
  return <StepSequenceDiagram {...initSidecarTimeline} />;
}
