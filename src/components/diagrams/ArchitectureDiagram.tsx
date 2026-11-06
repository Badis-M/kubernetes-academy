import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import type { L } from "@/content/types";
import { useLang } from "@/lib/i18n";

type Plane = "client" | "control" | "worker";
type NodeDef = { id: string; x: number; y: number; label: string; sub: L; plane: Plane; desc: L };

const nodes: NodeDef[] = [
  {
    id: "kubectl",
    x: 9,
    y: 34,
    label: "kubectl",
    plane: "client",
    sub: { en: "you / CI", fr: "vous / CI" },
    desc: {
      en: "A client of the Kubernetes API. It reads ~/.kube/config for the server URL and credentials, and sends REST requests over HTTPS. It never talks to nodes or etcd directly.",
      fr: "Un client de l'API Kubernetes. Il lit ~/.kube/config pour l'URL du serveur et les identifiants, puis envoie des requêtes REST en HTTPS. Il ne parle jamais directement aux nœuds ni à etcd.",
    },
  },
  {
    id: "api",
    x: 33,
    y: 34,
    label: "kube-apiserver",
    plane: "control",
    sub: { en: "the hub", fr: "le hub" },
    desc: {
      en: "The only entry point and the only component connected to etcd. Pipeline: authentication → authorization (RBAC) → mutating admission → schema validation → validating admission → persist to etcd. Serves watch streams that notify every other component.",
      fr: "Le seul point d'entrée et le seul composant connecté à etcd. Pipeline : authentification → autorisation (RBAC) → admission mutante → validation du schéma → admission validante → persistance dans etcd. Sert les flux watch qui notifient tous les autres composants.",
    },
  },
  {
    id: "etcd",
    x: 33,
    y: 54,
    label: "etcd",
    plane: "control",
    sub: { en: "source of truth", fr: "source de vérité" },
    desc: {
      en: "Consistent, replicated key-value store using the Raft consensus algorithm. Stores every object (spec and status). Back it up: it is the cluster's state.",
      fr: "Magasin clé-valeur cohérent et répliqué, basé sur l'algorithme de consensus Raft. Stocke chaque objet (spec et status). Sauvegardez-le : c'est l'état du cluster.",
    },
  },
  {
    id: "sched",
    x: 51,
    y: 15,
    label: "kube-scheduler",
    plane: "control",
    sub: { en: "placement", fr: "placement" },
    desc: {
      en: "Watches Pods without spec.nodeName. Filters nodes that can run the Pod (resources, taints, affinity), scores the rest, and writes a Binding via the API server. It never contacts a kubelet.",
      fr: "Surveille les Pods sans spec.nodeName. Filtre les nœuds capables d'exécuter le Pod (ressources, taints, affinité), note les autres, et écrit un Binding via l'API server. Il ne contacte jamais un kubelet.",
    },
  },
  {
    id: "cm",
    x: 51,
    y: 54,
    label: "controller-manager",
    plane: "control",
    sub: { en: "reconcilers", fr: "réconciliateurs" },
    desc: {
      en: "Runs built-in controllers (Deployment, ReplicaSet, Node, Job, EndpointSlice…). Each watches objects through the API server and creates/updates/deletes others to converge actual state toward desired state.",
      fr: "Exécute les contrôleurs intégrés (Deployment, ReplicaSet, Node, Job, EndpointSlice…). Chacun surveille des objets via l'API server et en crée/modifie/supprime d'autres pour faire converger l'état réel vers l'état désiré.",
    },
  },
  {
    id: "kubelet",
    x: 74,
    y: 15,
    label: "kubelet",
    plane: "worker",
    sub: { en: "node agent", fr: "agent du nœud" },
    desc: {
      en: "Runs on every node. Watches the API server for Pods bound to its node, drives the container runtime through CRI, runs probes, mounts volumes, and reports Pod/node status back to the API server.",
      fr: "Tourne sur chaque nœud. Surveille l'API server pour les Pods assignés à son nœud, pilote le runtime via la CRI, exécute les probes, monte les volumes et remonte le statut des Pods et du nœud à l'API server.",
    },
  },
  {
    id: "proxy",
    x: 90,
    y: 15,
    label: "kube-proxy",
    plane: "worker",
    sub: { en: "Service rules", fr: "règles Service" },
    desc: {
      en: "Watches Services and EndpointSlices from the API server and programs iptables, nftables or IPVS rules so traffic to a Service IP reaches a backend Pod. Not in the Pod creation path.",
      fr: "Surveille Services et EndpointSlices via l'API server et programme des règles iptables, nftables ou IPVS pour que le trafic vers l'IP d'un Service atteigne un Pod. Hors du chemin de création des Pods.",
    },
  },
  {
    id: "runtime",
    x: 74,
    y: 35,
    label: "containerd",
    plane: "worker",
    sub: { en: "runtime (CRI)", fr: "runtime (CRI)" },
    desc: {
      en: "The container runtime. Receives CRI gRPC calls from the kubelet, pulls images, creates the Pod sandbox and containers (via runc), and invokes the CNI plugin for networking.",
      fr: "Le runtime de conteneurs. Reçoit les appels gRPC CRI du kubelet, télécharge les images, crée le sandbox du Pod et les conteneurs (via runc), et appelle le plugin CNI pour le réseau.",
    },
  },
  {
    id: "cni",
    x: 90,
    y: 35,
    label: "CNI plugin",
    plane: "worker",
    sub: { en: "Pod network", fr: "réseau des Pods" },
    desc: {
      en: "Called by the runtime when a Pod sandbox is created: allocates the Pod IP and wires it into the cluster network (kindnet, Calico, Cilium…).",
      fr: "Appelé par le runtime à la création du sandbox d'un Pod : attribue l'IP du Pod et le connecte au réseau du cluster (kindnet, Calico, Cilium…).",
    },
  },
  {
    id: "pods",
    x: 82,
    y: 54,
    label: "Pods",
    plane: "worker",
    sub: { en: "your containers", fr: "vos conteneurs" },
    desc: {
      en: "Your workloads: one or more containers sharing a network namespace. Created by the runtime on behalf of the kubelet.",
      fr: "Vos charges de travail : un ou plusieurs conteneurs partageant un namespace réseau. Créés par le runtime pour le compte du kubelet.",
    },
  },
];

const edges: [string, string][] = [
  ["kubectl", "api"],
  ["api", "etcd"],
  ["sched", "api"],
  ["cm", "api"],
  ["kubelet", "api"],
  ["proxy", "api"],
  ["kubelet", "runtime"],
  ["runtime", "cni"],
  ["runtime", "pods"],
];

const steps: { flows: [string, string][]; nodes: string[]; title: L; text: L }[] = [
  {
    flows: [["kubectl", "api"]],
    nodes: ["kubectl", "api"],
    title: { en: "1 · kubectl sends the Deployment", fr: "1 · kubectl envoie le Deployment" },
    text: {
      en: "kubectl apply -f deployment.yaml → HTTPS request to the API server, which authenticates, authorizes (RBAC), runs admission and validates the object.",
      fr: "kubectl apply -f deployment.yaml → requête HTTPS vers l'API server, qui authentifie, autorise (RBAC), exécute l'admission et valide l'objet.",
    },
  },
  {
    flows: [["api", "etcd"]],
    nodes: ["api", "etcd"],
    title: { en: "2 · Desired state is persisted", fr: "2 · L'état désiré est persisté" },
    text: {
      en: "The Deployment is written to etcd. kubectl prints “created” after persistence. Controllers act asynchronously: this response does not prove that Pods exist or are ready.",
      fr: "Le Deployment est écrit dans etcd. kubectl affiche « created » après persistance. Les contrôleurs agissent de manière asynchrone : cette réponse ne prouve ni existence ni disponibilité des Pods.",
    },
  },
  {
    flows: [
      ["api", "cm"],
      ["cm", "api"],
    ],
    nodes: ["cm", "api", "etcd"],
    title: { en: "3 · Controllers react", fr: "3 · Les contrôleurs réagissent" },
    text: {
      en: "The Deployment controller (watch) creates a ReplicaSet; the ReplicaSet controller creates 2 Pod objects. Both write through the API server. Pods have no node yet.",
      fr: "Le contrôleur Deployment (watch) crée un ReplicaSet ; le contrôleur ReplicaSet crée 2 objets Pod. Les deux écrivent via l'API server. Les Pods n'ont pas encore de nœud.",
    },
  },
  {
    flows: [
      ["api", "sched"],
      ["sched", "api"],
    ],
    nodes: ["sched", "api"],
    title: { en: "4 · Scheduler picks a node", fr: "4 · Le scheduler choisit un nœud" },
    text: {
      en: "The scheduler sees unscheduled Pods, filters and scores nodes, then writes a Binding that sets spec.nodeName.",
      fr: "Le scheduler voit les Pods non planifiés, filtre et note les nœuds, puis écrit un Binding qui renseigne spec.nodeName.",
    },
  },
  {
    flows: [["api", "kubelet"]],
    nodes: ["kubelet", "api"],
    title: { en: "5 · kubelet notices its Pods", fr: "5 · Le kubelet repère ses Pods" },
    text: {
      en: "The kubelet on the chosen node is watching for Pods bound to it, and receives them.",
      fr: "Le kubelet du nœud choisi surveille les Pods qui lui sont assignés, et les reçoit.",
    },
  },
  {
    flows: [
      ["kubelet", "runtime"],
      ["runtime", "cni"],
      ["runtime", "pods"],
    ],
    nodes: ["kubelet", "runtime", "cni", "pods"],
    title: { en: "6 · Containers start", fr: "6 · Les conteneurs démarrent" },
    text: {
      en: "kubelet → CRI → containerd: pull image, create the sandbox, CNI assigns the Pod IP, start the containers.",
      fr: "kubelet → CRI → containerd : téléchargement de l'image, création du sandbox, le CNI attribue l'IP, démarrage des conteneurs.",
    },
  },
  {
    flows: [
      ["kubelet", "api"],
      ["api", "etcd"],
    ],
    nodes: ["kubelet", "api", "etcd"],
    title: { en: "7 · Status is reported", fr: "7 · Le statut est remonté" },
    text: {
      en: "kubelet reports Running + Pod IP to the API server, stored in etcd. Running is a phase. After both Pods are Ready for minReadySeconds, the Deployment can report 2/2 available.",
      fr: "Le kubelet remonte Running + l'IP du Pod à l'API server, stocké dans etcd. Running est une phase. Quand les deux Pods sont Ready depuis au moins minReadySeconds, le Deployment peut indiquer 2/2 disponibles.",
    },
  },
];

const pos = (id: string) => nodes.find((n) => n.id === id)!;
const H = 64;

export function ArchitectureDiagram() {
  const { tr, lang } = useLang();
  const [selected, setSelected] = useState<string>("api");
  const [step, setStep] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(
      () => {
        setStep((s) => {
          const n = s === null ? 0 : s + 1;
          if (n >= steps.length) {
            setPlaying(false);
            return steps.length - 1;
          }
          return n;
        });
      },
      step === null ? 50 : 3200,
    );
    return () => clearTimeout(id);
  }, [playing, step]);

  const active = step !== null ? steps[step] : null;
  const sel = pos(selected);
  const controlPlane = lang === "fr" ? "Plan de contrôle" : "Control plane";
  const workerNode = lang === "fr" ? "Nœud de travail" : "Worker node";
  const selectStep = (index: number) => {
    setPlaying(false);
    setStep(index);
  };

  const planeCls: Record<Plane, string> = {
    client: "border-border bg-surface-2 text-foreground",
    control:
      "border-control/50 bg-surface text-foreground shadow-[inset_0_0_0_100px_var(--control-soft)]",
    worker:
      "border-worker/50 bg-surface text-foreground shadow-[inset_0_0_0_100px_var(--worker-soft)]",
  };

  return (
    <figure className="@container my-8 overflow-hidden rounded-2xl border border-border bg-surface/70 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-control" />
            {controlPlane}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-worker" />
            {workerNode}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              if (step === null || step >= steps.length - 1) setStep(null);
              setPlaying((p) => !p);
            }}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
          >
            {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            {playing
              ? lang === "fr"
                ? "Pause"
                : "Pause"
              : lang === "fr"
                ? "Lancer kubectl apply"
                : "Play kubectl apply"}
          </button>
          <button
            type="button"
            aria-label={lang === "fr" ? "Étape suivante" : "Next step"}
            disabled={step === steps.length - 1}
            onClick={() => selectStep((step ?? -1) + 1)}
            className="grid size-11 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <SkipForward className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label={lang === "fr" ? "Réinitialiser" : "Reset"}
            onClick={() => {
              setPlaying(false);
              setStep(null);
            }}
            className="grid size-11 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </div>

      <ol
        className="m-0 list-none space-y-2 p-4 @min-[42rem]:hidden"
        aria-label={lang === "fr" ? "Étapes de kubectl apply" : "kubectl apply steps"}
      >
        {steps.map((item, index) => (
          <li key={item.title.en} className="rounded-lg border border-border bg-surface">
            <button
              type="button"
              aria-current={step === index ? "step" : undefined}
              onClick={() => selectStep(index)}
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium aria-[current=step]:bg-primary/15"
            >
              {tr(item.title)}
            </button>
            {step === index && (
              <p className="px-3 pb-3 text-sm leading-relaxed text-foreground/80">
                {tr(item.text)}
              </p>
            )}
          </li>
        ))}
      </ol>
      <div className="hidden @min-[42rem]:block">
        <div className="relative mx-auto aspect-[100/64]">
          {/* planes */}
          <div className="absolute left-[21%] top-[5%] h-[90%] w-[42%] rounded-xl border border-dashed border-control/40 bg-control/[0.04]">
            <span className="absolute left-3 top-2 font-mono text-[10px] uppercase tracking-widest text-control">
              {controlPlane}
            </span>
          </div>
          <div className="absolute left-[65%] top-[5%] h-[90%] w-[33%] rounded-xl border border-dashed border-worker/40 bg-worker/[0.04]">
            <span className="absolute left-3 top-2 font-mono text-[10px] uppercase tracking-widest text-worker">
              {workerNode}
            </span>
          </div>

          <svg
            className="absolute inset-0 size-full"
            viewBox={`0 0 100 ${H}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            {edges.map(([a, b]) => {
              const A = pos(a),
                B = pos(b);
              const hot = selected === a || selected === b;
              return (
                <line
                  key={a + b}
                  x1={A.x}
                  y1={A.y}
                  x2={B.x}
                  y2={B.y}
                  className={hot && !active ? "stroke-primary/60" : "stroke-foreground/15"}
                  strokeWidth={1.2}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
            {active?.flows.map(([a, b], i) => {
              const A = pos(a),
                B = pos(b);
              const off =
                a === b
                  ? 0
                  : i % 2 === 1 && active.flows.some(([x, y]) => x === b && y === a)
                    ? 0.9
                    : 0;
              return (
                <line
                  key={step + a + b + i}
                  x1={A.x + off}
                  y1={A.y + off}
                  x2={B.x + off}
                  y2={B.y + off}
                  className="animate-flow stroke-primary"
                  strokeWidth={2.4}
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>

          {nodes.map((n) => {
            const isActive = active?.nodes.includes(n.id);
            const isSel = selected === n.id;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => setSelected(n.id)}
                style={{ left: `${n.x}%`, top: `${(n.y / H) * 100}%` }}
                className={`absolute w-[15%] -translate-x-1/2 -translate-y-1/2 rounded-lg border px-2 py-1.5 text-left backdrop-blur transition-all duration-300 ${planeCls[n.plane]} ${isSel ? "ring-2 ring-primary/70" : ""} ${isActive ? "animate-pulse-ring scale-105 border-primary" : active ? "opacity-60 saturate-50" : "hover:-translate-y-[55%]"}`}
              >
                <div className="font-mono text-[12px] font-medium [overflow-wrap:anywhere]">
                  {n.label}
                </div>
                <div className="text-[10px] text-muted-foreground [overflow-wrap:anywhere]">
                  {tr(n.sub)}
                </div>
                {n.id === "pods" && (
                  <div className="mt-1 flex gap-1">
                    {[0, 1].map((i) => (
                      <span
                        key={i}
                        className={`h-2 flex-1 rounded-sm ${step !== null && step >= 5 ? "bg-success" : "bg-foreground/15"}`}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <figcaption className="grid gap-px border-t border-border bg-border @min-[42rem]:grid-cols-2">
        <div className="hidden bg-surface px-5 py-4 @min-[42rem]:block">
          <div className="eyebrow">
            {active
              ? lang === "fr"
                ? "Cycle de vie"
                : "Request lifecycle"
              : lang === "fr"
                ? "Composant"
                : "Component"}
          </div>
          {active ? (
            <>
              <div className="mt-1.5 font-semibold text-foreground">{tr(active.title)}</div>
              <p className="mt-1 text-sm leading-relaxed text-foreground/80">{tr(active.text)}</p>
              <div className="mt-3 flex gap-1">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={lang === "fr" ? `Étape ${i + 1}` : `Step ${i + 1}`}
                    aria-current={step === i ? "step" : undefined}
                    onClick={() => selectStep(i)}
                    className={`h-1.5 flex-1 rounded-full transition ${i <= (step ?? -1) ? "bg-primary" : "bg-foreground/15"}`}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="mt-1.5 text-sm text-muted-foreground">
              {lang === "fr"
                ? "Lancez l'animation pour suivre un kubectl apply de bout en bout."
                : "Press play to follow a kubectl apply end to end."}
            </p>
          )}
        </div>
        <div className="bg-surface px-5 py-4">
          <label className="mb-3 block text-sm @min-[42rem]:hidden">
            {lang === "fr" ? "Explorer les composants" : "Explore components"}
            <select
              value={selected}
              onChange={(event) => setSelected(event.target.value)}
              className="mt-1 block w-full rounded-md border border-border bg-surface-2 px-2 py-1"
            >
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.label}
                </option>
              ))}
            </select>
          </label>
          <div
            className={`font-mono text-sm font-semibold ${sel.plane === "control" ? "text-control" : sel.plane === "worker" ? "text-worker" : "text-foreground"}`}
          >
            {sel.label}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-foreground/80">{tr(sel.desc)}</p>
        </div>
      </figcaption>
    </figure>
  );
}
