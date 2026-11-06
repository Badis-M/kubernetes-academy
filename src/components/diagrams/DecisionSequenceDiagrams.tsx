import { backupRecoverySequence } from "@/content/diagrams/backup-recovery-sequence";
import { apiConflictSequence } from "@/content/diagrams/api-conflict-sequence";
import {
  gatewaySequence,
  probesSequence,
  schedulingSequence,
} from "@/content/diagrams/decision-sequences";
import {
  csiSnapshotSequence,
  etcdSnapshotSequence,
} from "@/content/diagrams/storage-snapshot-sequences";
import { StepSequenceDiagram } from "./StepSequenceDiagram";

export function BackupRecoveryDiagram() {
  return <StepSequenceDiagram {...backupRecoverySequence} />;
}

export function ApiConflictDiagram() {
  return <StepSequenceDiagram {...apiConflictSequence} />;
}

export function ProbesDiagram() {
  return <StepSequenceDiagram {...probesSequence} />;
}
export function GatewayDiagram() {
  return <StepSequenceDiagram {...gatewaySequence} />;
}
export function SchedulingDiagram() {
  return <StepSequenceDiagram {...schedulingSequence} />;
}

export function EtcdSnapshotDiagram() {
  return <StepSequenceDiagram {...etcdSnapshotSequence} />;
}

export function CsiSnapshotDiagram() {
  return <StepSequenceDiagram {...csiSnapshotSequence} />;
}
