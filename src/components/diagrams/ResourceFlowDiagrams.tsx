import { ArrowDown } from "lucide-react";
import type { L } from "@/content/types";
import { useLang } from "@/lib/i18n";

type Flow = { title: L; start: string | L; steps: { relation: L; target: string | L }[] };

function ResourceFlowDiagram({
  title,
  flows,
  explanation,
  columns = 2,
}: {
  title: L;
  flows: Flow[];
  explanation: L;
  columns?: 1 | 2 | 3;
}) {
  const { tr } = useLang();

  return (
    <figure className="@container my-8 rounded-2xl border border-border bg-surface/70 p-4 sm:p-5">
      <figcaption className="mb-4 font-semibold text-foreground">{tr(title)}</figcaption>
      <div
        className={`grid gap-3 ${columns === 3 ? "@min-[38rem]:grid-cols-3" : columns === 2 ? "@min-[34rem]:grid-cols-2" : ""}`}
      >
        {flows.map((flow) => (
          <div key={flow.title.en} className="min-w-0 rounded-xl border border-border p-3">
            <div className="mb-3 text-sm font-semibold text-foreground">{tr(flow.title)}</div>
            <ol className="m-0 list-none space-y-1 p-0 text-center">
              <li className="rounded-lg bg-surface-2 px-2 py-2 font-mono text-xs [overflow-wrap:anywhere]">
                {typeof flow.start === "string" ? flow.start : tr(flow.start)}
              </li>
              {flow.steps.map(({ relation, target }) => (
                <li key={typeof target === "string" ? target : target.en} className="min-w-0">
                  <span className="flex items-center justify-center gap-1 py-1 text-xs text-muted-foreground">
                    <ArrowDown className="size-3.5 shrink-0" aria-hidden="true" />
                    {tr(relation)}
                  </span>
                  <div className="rounded-lg bg-surface-2 px-2 py-2 font-mono text-xs [overflow-wrap:anywhere]">
                    {typeof target === "string" ? target : tr(target)}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{tr(explanation)}</p>
    </figure>
  );
}

const serviceFlows: Flow[] = [
  {
    title: { en: "Backend selection", fr: "Sélection des backends" },
    start: "Service web: app=web",
    steps: [
      {
        relation: {
          en: "the controller matches Pod labels",
          fr: "le contrôleur compare les labels des Pods",
        },
        target: "Pods: app=web",
      },
      {
        relation: {
          en: "the controller records addresses and readiness",
          fr: "le contrôleur renseigne les adresses et l’état de disponibilité",
        },
        target: "EndpointSlices",
      },
    ],
  },
  {
    title: { en: "Connection path", fr: "Trajet de la connexion" },
    start: "Pod client",
    steps: [
      {
        relation: { en: "resolves web and connects", fr: "résout web et se connecte" },
        target: "ClusterIP:80",
      },
      {
        relation: {
          en: "the data plane forwards to an eligible endpoint",
          fr: "le plan de données achemine vers un endpoint éligible",
        },
        target: "Pod web:80",
      },
    ],
  },
];

const storageFlows: Flow[] = [
  {
    title: { en: "Storage used by the Pod", fr: "Stockage utilisé par le Pod" },
    start: "Pod",
    steps: [
      {
        relation: {
          en: "references a claim in its namespace",
          fr: "référence une demande dans son namespace",
        },
        target: "PVC",
      },
      {
        relation: {
          en: "binds to a cluster-scoped volume",
          fr: "se lie à un volume à l’échelle du cluster",
        },
        target: "PV",
      },
      {
        relation: {
          en: "represents the underlying storage",
          fr: "représente le stockage sous-jacent",
        },
        target: "local-path",
      },
    ],
  },
  {
    title: { en: "Dynamic provisioning", fr: "Provisionnement dynamique" },
    start: "PVC: storageClassName: standard",
    steps: [
      {
        relation: {
          en: "requests storage from this class",
          fr: "demande du stockage à cette classe",
        },
        target: "StorageClass standard",
      },
      {
        relation: { en: "selects the provisioner", fr: "désigne le provisioner" },
        target: "rancher.io/local-path",
      },
      {
        relation: {
          en: "provisions storage and creates a PV for the claim",
          fr: "prépare le stockage et crée un PV pour la demande",
        },
        target: "PV",
      },
    ],
  },
];

export function ServiceTrafficDiagram() {
  return (
    <ResourceFlowDiagram
      title={{
        en: "From Service selection to Pod traffic",
        fr: "De la sélection du Service au trafic vers un Pod",
      }}
      flows={serviceFlows}
      explanation={{
        en: "EndpointSlices describe backends. The Service data plane uses them to route traffic. The port-forward example later in this chapter uses a separate tunnel to one Pod.",
        fr: "Les EndpointSlices décrivent les backends. Le plan de données du Service les utilise pour acheminer le trafic. L’exemple de port-forward plus bas ouvre un tunnel distinct vers un Pod.",
      }}
    />
  );
}

export function PersistentStorageDiagram() {
  return (
    <ResourceFlowDiagram
      title={{ en: "From a storage claim to a volume", fr: "De la demande de stockage au volume" }}
      flows={storageFlows}
      explanation={{
        en: "In this kind lab, WaitForFirstConsumer delays provisioning until a Pod that uses the claim can be scheduled. The data lives on one node and can outlive a Pod replacement.",
        fr: "Dans ce lab kind, WaitForFirstConsumer retarde le provisionnement jusqu’à ce qu’un Pod utilisant la demande puisse être placé. Les données résident sur un nœud et peuvent survivre au remplacement du Pod.",
      }}
    />
  );
}

const admissionFlows: Flow[] = [
  {
    title: { en: "API server checks", fr: "Contrôles du serveur API" },
    start: { en: "Write request", fr: "Requête d’écriture" },
    steps: [
      {
        relation: { en: "identifies the caller", fr: "identifie l’appelant" },
        target: { en: "Authentication", fr: "Authentification" },
      },
      {
        relation: { en: "checks permissions", fr: "vérifie les permissions" },
        target: { en: "Authorization", fr: "Autorisation" },
      },
      {
        relation: { en: "may change the object", fr: "peut modifier l’objet" },
        target: { en: "Mutating admission", fr: "Admission mutante" },
      },
      {
        relation: { en: "checks the resulting object", fr: "contrôle l’objet obtenu" },
        target: {
          en: "Validation and validating admission",
          fr: "Validation et admission validante",
        },
      },
    ],
  },
  {
    title: { en: "Decision for a matching request", fr: "Décision pour une requête ciblée" },
    start: { en: "Validating webhook in the lab", fr: "Webhook validant du lab" },
    steps: [
      {
        relation: {
          en: "receives AdmissionReview over HTTPS",
          fr: "reçoit AdmissionReview en HTTPS",
        },
        target: { en: "Checks the owner label", fr: "Vérifie le label owner" },
      },
      {
        relation: {
          en: "returns its decision to the API server",
          fr: "renvoie sa décision au serveur API",
        },
        target: { en: "Allow or deny", fr: "Autoriser ou refuser" },
      },
    ],
  },
];

const gitOpsFlows: Flow[] = [
  {
    title: { en: "Desired state", fr: "État désiré" },
    start: { en: "Approved Git revision", fr: "Révision Git approuvée" },
    steps: [
      {
        relation: {
          en: "the controller fetches and renders",
          fr: "le contrôleur récupère et génère",
        },
        target: { en: "Desired manifests", fr: "Manifests désirés" },
      },
      {
        relation: {
          en: "compares them with live resources",
          fr: "les compare aux ressources du cluster",
        },
        target: { en: "Reconciliation decision", fr: "Décision de réconciliation" },
      },
    ],
  },
  {
    title: { en: "Apply and observe", fr: "Appliquer et observer" },
    start: { en: "Difference detected", fr: "Écart détecté" },
    steps: [
      {
        relation: {
          en: "the controller applies changes if policy allows",
          fr: "le contrôleur applique les changements si la politique le permet",
        },
        target: { en: "Kubernetes API", fr: "API Kubernetes" },
      },
      {
        relation: {
          en: "observes resources and compares again",
          fr: "observe les ressources et compare à nouveau",
        },
        target: { en: "Observed state", fr: "État observé" },
      },
    ],
  },
];

export function AdmissionWebhookDiagram() {
  return (
    <ResourceFlowDiagram
      title={{ en: "Admission before persistence", fr: "L’admission avant la persistance" }}
      flows={admissionFlows}
      explanation={{
        en: "If a check denies the request, the API server returns an error and saves nothing. After all checks pass, a normal write can be persisted. An accepted server-side dry-run returns without saving.",
        fr: "Si un contrôle refuse la requête, le serveur API renvoie une erreur et n’enregistre rien. Quand tous les contrôles passent, une écriture normale peut être persistée. Un dry-run serveur accepté se termine sans enregistrement.",
      }}
    />
  );
}

export function GitOpsReconciliationDiagram() {
  return (
    <ResourceFlowDiagram
      title={{ en: "GitOps reconciliation loop", fr: "Boucle de réconciliation GitOps" }}
      flows={gitOpsFlows}
      explanation={{
        en: "The observed state feeds the next comparison. A synced revision describes alignment with the desired state. Workload health is a separate signal to check.",
        fr: "L’état observé alimente la comparaison suivante. Une révision synchronisée indique l’alignement avec l’état désiré. La santé des workloads se vérifie séparément.",
      }}
    />
  );
}

const collectorProcessing = {
  en: "Collector receives OTLP/HTTP on :4318",
  fr: "Le Collector reçoit OTLP/HTTP sur :4318",
};

const collectorPipeline = "Collector · memory_limiter → batch";

const debugOutput = {
  en: "Collector logs · debug output",
  fr: "Logs du Collector · sortie debug",
};

const observabilityFlows: Flow[] = [
  {
    title: { en: "Metrics", fr: "Métriques" },
    start: "App SDK · /v1/metrics",
    steps: [
      { relation: collectorProcessing, target: collectorPipeline },
      {
        relation: {
          en: "Prometheus exporter exposes metrics",
          fr: "L’exporter Prometheus expose les métriques",
        },
        target: "collector:8889/metrics",
      },
      {
        relation: { en: "Prometheus scrapes every 5 s", fr: "Prometheus collecte toutes les 5 s" },
        target: "Prometheus · prometheus:9090",
      },
      {
        relation: {
          en: "Grafana queries Prometheus via PromQL",
          fr: "Grafana interroge Prometheus en PromQL",
        },
        target: "Grafana",
      },
    ],
  },
  {
    title: { en: "Traces", fr: "Traces" },
    start: "App SDK · /v1/traces",
    steps: [
      { relation: collectorProcessing, target: collectorPipeline },
      {
        relation: { en: "debug prints spans", fr: "debug affiche les spans" },
        target: debugOutput,
      },
    ],
  },
  {
    title: { en: "Logs", fr: "Logs" },
    start: "App SDK · /v1/logs",
    steps: [
      { relation: collectorProcessing, target: collectorPipeline },
      {
        relation: {
          en: "debug prints log records",
          fr: "debug affiche les enregistrements de log",
        },
        target: debugOutput,
      },
    ],
  },
];

export function ObservabilityFlowDiagram() {
  return (
    <ResourceFlowDiagram
      title={{ en: "Telemetry flows in the lab", fr: "Flux de télémétrie du lab" }}
      flows={observabilityFlows}
      columns={3}
      explanation={{
        en: "Arrows follow the data. Prometheus initiates scrapes and Grafana initiates queries. Prometheus stores metrics in its local volume with one-hour retention. Traces and application logs use separate pipelines that share the same debug exporter. Both can be inspected in the Collector logs, with no durable query backend for either signal.",
        fr: "Les flèches suivent les données. Prometheus lance la collecte et Grafana lance les requêtes. Prometheus conserve les métriques dans son volume local avec une rétention d’une heure. Les traces et les logs applicatifs passent par deux pipelines distincts qui partagent le même exporter debug. Les deux signaux sont visibles dans les logs du Collector, sans backend durable pour les interroger.",
      }}
    />
  );
}

const subjectRelation = { en: "listed in subjects", fr: "déclaré dans subjects" };
const roleRelation = { en: "references via roleRef", fr: "référence via roleRef" };
const permissionFlows: Flow[] = [
  {
    title: { en: "Basic lab · lab-rbac", fr: "Lab de base · lab-rbac" },
    start: "ServiceAccount lab-rbac/pod-reader",
    steps: [
      { relation: subjectRelation, target: "RoleBinding lab-rbac/pod-reader" },
      { relation: roleRelation, target: "Role lab-rbac/pod-reader" },
      {
        relation: {
          en: "grants Pod reads in this namespace",
          fr: "autorise la lecture des Pods dans ce namespace",
        },
        target: "lab-rbac · pods · get / list / watch",
      },
    ],
  },
  {
    title: { en: "Advanced lab · lab-rbac-advanced", fr: "Lab avancé · lab-rbac-advanced" },
    start: "ServiceAccount lab-rbac-advanced/observer",
    steps: [
      { relation: subjectRelation, target: "RoleBinding lab-rbac-advanced/observer" },
      { relation: roleRelation, target: "ClusterRole lab-ops-observer" },
      {
        relation: {
          en: "grants matching rules only in the binding namespace",
          fr: "accorde les règles applicables dans le namespace du binding",
        },
        target: "lab-rbac-advanced · pods · get / list / watch",
      },
    ],
  },
  {
    title: {
      en: "Cluster-wide example · outside the labs",
      fr: "Exemple à l’échelle du cluster · hors labs",
    },
    start: { en: "Group platform-auditors", fr: "Groupe platform-auditors" },
    steps: [
      { relation: subjectRelation, target: "ClusterRoleBinding audit-pod-read" },
      { relation: roleRelation, target: "ClusterRole audit-pod-read" },
      {
        relation: {
          en: "grants Pod reads in all namespaces",
          fr: "autorise la lecture des Pods dans tous les namespaces",
        },
        target: {
          en: "All namespaces · pods · get / list / watch",
          fr: "Tous les namespaces · pods · get / list / watch",
        },
      },
    ],
  },
];

export function RbacPermissionDiagram() {
  return (
    <ResourceFlowDiagram
      title={{ en: "RBAC · Subject → Binding → Role", fr: "RBAC · Subject → Binding → Role" }}
      flows={permissionFlows}
      columns={3}
      explanation={{
        en: "The arrows trace how RBAC grants rules to a subject. A RoleBinding grants access within its own namespace, even when it references a ClusterRole. A ClusterRoleBinding grants the referenced ClusterRole's rules across the cluster, including cluster-scoped resources if the rules cover them. The advanced lab branch shows only the initial Pod rules granted by the observer binding.",
        fr: "Les flèches montrent comment RBAC accorde des règles à un sujet. Un RoleBinding accorde des droits dans son propre namespace, même s’il référence un ClusterRole. Un ClusterRoleBinding accorde les règles du ClusterRole à l’échelle du cluster, y compris sur les ressources sans namespace si les règles les couvrent. La branche du lab avancé montre uniquement les règles initiales sur les Pods accordées par le binding observer.",
      }}
    />
  );
}

const aggregationFlows: Flow[] = [
  {
    title: { en: "Contributors selected by label", fr: "Contributeurs sélectionnés par label" },
    start: {
      en: "ClusterRole lab-ops-pod-observer (Pods) + optional lab-ops-config-observer (ConfigMap release-settings)",
      fr: "ClusterRole lab-ops-pod-observer (Pods) + lab-ops-config-observer facultatif (ConfigMap release-settings)",
    },
    steps: [
      {
        relation: {
          en: "aggregationRule selects ClusterRoles with this label",
          fr: "aggregationRule sélectionne les ClusterRoles portant ce label",
        },
        target: "lab.k8sops.dev/aggregate: observer",
      },
      {
        relation: {
          en: "the controller writes the union to rules",
          fr: "le contrôleur écrit l’union dans rules",
        },
        target: "ClusterRole lab-ops-observer",
      },
    ],
  },
];

export function RbacAggregationDiagram() {
  return (
    <ResourceFlowDiagram
      title={{ en: "RBAC · ClusterRole aggregation", fr: "RBAC · agrégation de ClusterRoles" }}
      flows={aggregationFlows}
      columns={1}
      explanation={{
        en: "Aggregation assembles rules. The separate RoleBinding observer grants those rules in lab-rbac-advanced. The optional contributor restricts its ConfigMap rules to release-settings. For list or watch, the client must include a matching metadata.name field selector.",
        fr: "L’agrégation assemble des règles. Le RoleBinding observer accorde ces règles dans lab-rbac-advanced. Le contributeur facultatif limite ses règles ConfigMap à release-settings. Pour list ou watch, le client doit fournir un sélecteur de champ metadata.name correspondant.",
      }}
    />
  );
}
