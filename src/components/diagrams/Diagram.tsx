import { FailureDomainsDiagram } from "./FailureDomainsDiagram";
import { InitSidecarTimeline } from "./InitSidecarTimeline";
import { StatefulSetIdentityDiagram } from "./StatefulSetIdentityDiagram";
import { NetworkPolicyDiagram } from "./NetworkPolicyDiagram";
import {
  ApiConflictDiagram,
  BackupRecoveryDiagram,
  CsiSnapshotDiagram,
  EtcdSnapshotDiagram,
  ProbesDiagram,
  GatewayDiagram,
  SchedulingDiagram,
} from "./DecisionSequenceDiagrams";
import { EvictionBudgetDiagram, FleetPromotionDiagram } from "./LabSequenceDiagrams";
import {
  AdmissionWebhookDiagram,
  ObservabilityFlowDiagram,
  GitOpsReconciliationDiagram,
  PersistentStorageDiagram,
  RbacAggregationDiagram,
  RbacPermissionDiagram,
  ServiceTrafficDiagram,
} from "./ResourceFlowDiagrams";
import { AutoscalingDiagram } from "./AutoscalingDiagram";
import type { DiagramName } from "@/content/types";
import { ArchitectureDiagram } from "./ArchitectureDiagram";
import { ReconcileDiagram } from "./ReconcileDiagram";
import { DeploymentTreeDiagram, PodLifecycleDiagram, VmVsContainerDiagram } from "./SmallDiagrams";

export function Diagram({ name }: { name: DiagramName }) {
  switch (name) {
    case "etcd-snapshot-timeline":
      return <EtcdSnapshotDiagram />;
    case "csi-snapshot-timeline":
      return <CsiSnapshotDiagram />;
    case "rbac-permission-flow":
      return <RbacPermissionDiagram />;
    case "rbac-aggregation-flow":
      return <RbacAggregationDiagram />;
    case "ha-failure-domains":
      return <FailureDomainsDiagram topology="ha" />;
    case "fleet-failure-domains":
      return <FailureDomainsDiagram topology="fleet" />;
    case "observability-flow":
      return <ObservabilityFlowDiagram />;
    case "backup-recovery-timeline":
      return <BackupRecoveryDiagram />;
    case "api-conflict-timeline":
      return <ApiConflictDiagram />;
    case "statefulset-identity":
      return <StatefulSetIdentityDiagram />;
    case "init-sidecar-timeline":
      return <InitSidecarTimeline />;
    case "network-policy-decisions":
      return <NetworkPolicyDiagram />;
    case "probe-decisions":
      return <ProbesDiagram />;
    case "gateway-routing":
      return <GatewayDiagram />;
    case "scheduling-decisions":
      return <SchedulingDiagram />;
    case "autoscaling-feedback":
      return <AutoscalingDiagram />;
    case "service-traffic":
      return <ServiceTrafficDiagram />;
    case "persistent-storage":
      return <PersistentStorageDiagram />;
    case "admission-webhook-flow":
      return <AdmissionWebhookDiagram />;
    case "gitops-reconciliation":
      return <GitOpsReconciliationDiagram />;
    case "fleet-promotion":
      return <FleetPromotionDiagram />;
    case "eviction-budget":
      return <EvictionBudgetDiagram />;
    case "architecture":
      return <ArchitectureDiagram />;
    case "reconcile":
      return <ReconcileDiagram />;
    case "deployment-tree":
      return <DeploymentTreeDiagram />;
    case "vm-vs-container":
      return <VmVsContainerDiagram />;
    case "pod-lifecycle":
      return <PodLifecycleDiagram />;
  }
}
