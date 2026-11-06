import type { L, Level } from "./types";

export const levels: { level: Level; name: L; tagline: L; description: L }[] = [
  {
    level: 1,
    name: { en: "Beginner", fr: "Débutant" },
    tagline: { en: "Kubernetes Foundations", fr: "Les fondations de Kubernetes" },
    description: {
      en: "Zero prior knowledge. Understand what a cluster is, how its components talk, and deploy your first application on a local kind cluster.",
      fr: "Aucun prérequis Kubernetes. Comprendre ce qu'est un cluster, comment ses composants communiquent, et déployer une première application sur un cluster kind local.",
    },
  },
  {
    level: 2,
    name: { en: "Intermediate", fr: "Intermédiaire" },
    tagline: { en: "Operating Kubernetes", fr: "Exploiter Kubernetes" },
    description: {
      en: "Rollouts, probes, storage, stateful workloads, networking, RBAC, scheduling and Helm on realistic multi-component apps.",
      fr: "Déploiements progressifs, probes, stockage, workloads stateful, réseau, RBAC, ordonnancement et Helm sur des applications réalistes.",
    },
  },
  {
    level: 3,
    name: { en: "Advanced", fr: "Avancé" },
    tagline: { en: "Production Kubernetes", fr: "Kubernetes en production" },
    description: {
      en: "Helm chart engineering, Kustomize, GitOps, autoscaling, security hardening, observability and incident response.",
      fr: "Conception de charts Helm, Kustomize, GitOps, autoscaling, durcissement sécurité, observabilité et gestion d'incidents.",
    },
  },
  {
    level: 4,
    name: { en: "Expert", fr: "Expert" },
    tagline: { en: "Internals & Extensibility", fr: "Internes & extensibilité" },
    description: {
      en: "API machinery, controllers, CRDs, Operators with Kubebuilder, admission webhooks, etcd, CRI/CNI/CSI and platform engineering.",
      fr: "Mécanique de l'API, contrôleurs, CRD, Operators avec Kubebuilder, webhooks d'admission, etcd, CRI/CNI/CSI et platform engineering.",
    },
  },
];
