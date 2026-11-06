import type { L } from "./types";

export const referenceLabels: ReadonlyMap<string, L> = new Map([
  [
    "https://kubernetes.io/docs/concepts/services-networking/service/",
    { en: "Kubernetes Services", fr: "Services Kubernetes" },
  ],
  [
    "https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/",
    {
      en: "Access a cluster application with port forwarding",
      fr: "Accéder à une application du cluster avec port-forward",
    },
  ],
  [
    "https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/",
    { en: "Configure access to multiple clusters", fr: "Configurer l’accès à plusieurs clusters" },
  ],
  [
    "https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/",
    { en: "Namespaces", fr: "Namespaces" },
  ],
  [
    "https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/",
    { en: "Labels and selectors", fr: "Labels et sélecteurs" },
  ],
  [
    "https://kubernetes.io/docs/concepts/configuration/configmap/",
    { en: "ConfigMaps", fr: "ConfigMaps" },
  ],
  ["https://kubernetes.io/docs/concepts/configuration/secret/", { en: "Secrets", fr: "Secrets" }],
  [
    "https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/",
    { en: "Debug a running Pod", fr: "Diagnostiquer un Pod en cours d’exécution" },
  ],
  [
    "https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/",
    { en: "Pod lifecycle", fr: "Cycle de vie des Pods" },
  ],
]);
