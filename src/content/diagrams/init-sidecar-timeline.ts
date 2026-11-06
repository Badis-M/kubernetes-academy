import type { L } from "../types";
import type { SequenceScenario, TimelineState } from "@/components/diagrams/StepSequenceDiagram";

const l = (en: string, fr = en): L => ({ en, fr });
export const lifecycleStates = {
  waiting: { label: l("Not started", "Non démarré"), short: l("Wait", "Att.") },
  running: { label: l("Running", "En cours"), short: l("Run", "Actif"), tone: "active" },
  probing: {
    label: l("Running, startup not yet successful", "En cours, startup non réussie"),
    short: l("Probe"),
    tone: "active",
  },
  complete: {
    label: l("Completed, exit code 0", "Terminé, code 0"),
    short: l("OK"),
    tone: "success",
  },
  failed: {
    label: l("Exited with an error", "Terminé en erreur"),
    short: l("Error", "Échec"),
    tone: "blocked",
  },
  restarting: {
    label: l("Restart pending", "Redémarrage en attente"),
    short: l("Retry", "Reprise"),
    tone: "blocked",
  },
  stopping: {
    label: l("Termination requested", "Arrêt demandé"),
    short: l("Stop"),
    tone: "active",
  },
  stopped: { label: l("Stopped", "Arrêté"), short: l("Off", "Arrêt") },
} satisfies Record<string, TimelineState>;
export type LifecycleState = keyof typeof lifecycleStates;
type Actor = { name: string; role: L };
type Frame = { title: L; description: L; states: LifecycleState[] };
const labActors: Actor[] = [
  { name: "seed-page", role: l("Regular init", "Init classique") },
  { name: "access-log", role: l("Native sidecar", "Sidecar natif") },
  { name: "web", role: l("Application", "Application") },
];
const frame = (title: L, description: L, ...states: LifecycleState[]): Frame => ({
  title,
  description,
  states,
});
function scenario(label: L, actors: Actor[], frames: Frame[]): SequenceScenario {
  return {
    label,
    steps: frames.map((item) => ({
      title: item.title,
      description: item.description,
      scene: [
        {
          label: l(
            "Current snapshot · container states, not Pod phases",
            "État courant · états des conteneurs, pas phases du Pod",
          ),
          nodes: actors.map((actor, index) => {
            const state = lifecycleStates[item.states[index]!];
            return {
              label: l(actor.name),
              detail: l(
                `${actor.role.en} · ${state.label.en}`,
                `${actor.role.fr} · ${state.label.fr}`,
              ),
              ...("tone" in state ? { tone: state.tone } : {}),
            };
          }),
        },
      ],
    })),
    timeline: {
      caption: l(
        "Logical stages → · each column is a snapshot, not a duration. Click a column number to inspect it.",
        "Étapes logiques → · chaque colonne est un état, pas une durée. Cliquez sur son numéro pour l’examiner.",
      ),
      tracks: actors.map((actor, index) => ({
        label: l(actor.name),
        states: frames.map((item) => lifecycleStates[item.states[index]!]),
      })),
    },
  };
}
const prepare = frame(
  l("Prepare the page", "Préparer la page"),
  l(
    "seed-page writes then renames the page file. A regular init must exit with code 0 before the next init starts. access-log and web have not started.",
    "seed-page écrit puis renomme le fichier de page. Un init classique doit terminer avec le code 0 avant le démarrage du suivant. access-log et web n’ont pas démarré.",
  ),
  "running",
  "waiting",
  "waiting",
);
const probe = frame(
  l("Wait for sidecar startup", "Attendre la startup du sidecar"),
  l(
    "seed-page completed. access-log starts tail, but its startupProbe must confirm that /logs/access.log exists. A running process alone is insufficient here: web waits for this startup signal.",
    "seed-page a terminé. access-log lance tail, mais sa startupProbe doit confirmer l’existence de /logs/access.log. Le processus actif ne suffit pas ici : web attend ce signal de démarrage.",
  ),
  "complete",
  "probing",
  "waiting",
);
const started = frame(
  l("Startup succeeds; web may start", "Startup réussit ; web peut démarrer"),
  l(
    "The sidecar’s started status becomes true. Initialization may advance without waiting for access-log to exit. This snapshot shows the gate opening, just before web starts; it is not a mandatory pause.",
    "Le statut started du sidecar devient true. L’initialisation peut progresser sans attendre la fin de access-log. Cet état montre l’ouverture du passage juste avant le démarrage de web, pas une pause obligatoire.",
  ),
  "complete",
  "running",
  "waiting",
);
const serving = frame(
  l("Run together, check readiness", "Tourner ensemble, vérifier readiness"),
  l(
    "web starts and its readinessProbe must succeed before the Pod is Ready. access-log continues reading the shared log. The lab sidecar has no readinessProbe; adding one would contribute to Pod readiness, not gate the start of web. Startup success is not remote log delivery.",
    "web démarre et sa readinessProbe doit réussir avant que le Pod soit Ready. access-log continue de lire le log partagé. Le sidecar du lab n’a pas de readinessProbe ; en ajouter une contribuerait à la readiness du Pod sans conditionner le démarrage de web. Le succès de startup ne prouve pas la livraison distante des logs.",
  ),
  "complete",
  "running",
  "running",
);

export const initSidecarTimeline = {
  title: l("Init & sidecars · lifecycle timeline", "Init et sidecars · timeline du cycle de vie"),
  scope: l(
    "Kubernetes 1.35 teaching model, based on sidecar-web. Pod restartPolicy defaults to Always; access-log explicitly uses Always inside initContainers. Steps have no time scale. Assume successful image pulls, mounts and scheduling. Normal termination is initiated by Pod deletion, with enough grace time; it is not an ordinary web crash. If the overall grace period expires, remaining containers can be killed before graceful sidecar shutdown finishes. emptyDir survives container restarts, not Pod removal. Two-sidecar shutdown is a fictional extension of the one-sidecar lab. No host-crash recovery or durable log delivery is simulated.",
    "Modèle pédagogique Kubernetes 1.35 fondé sur sidecar-web. Le restartPolicy du Pod vaut Always par défaut ; access-log utilise explicitement Always dans initContainers. Les étapes n’ont pas d’échelle de temps. Images, montages et placement sont supposés réussis. L’arrêt normal est déclenché par la suppression du Pod, avec assez de temps de grâce ; ce n’est pas un simple crash de web. Si le délai global expire, les conteneurs restants peuvent être tués avant la fin de l’arrêt gracieux des sidecars. emptyDir survit aux redémarrages de conteneurs, pas au retrait du Pod. L’arrêt de deux sidecars est une extension fictive du lab qui n’en contient qu’un. Ni reprise après panne hôte ni livraison durable de logs ne sont simulées.",
  ),
  scenarios: [
    scenario(l("Lab · startup and shutdown", "Lab · démarrage et arrêt"), labActors, [
      prepare,
      probe,
      started,
      serving,
      frame(
        l("Request Pod termination", "Demander l’arrêt du Pod"),
        l(
          "On normal Pod deletion, the kubelet starts terminating web. access-log is kept alive while the main container finishes. The Pod’s grace-period budget is already running.",
          "À la suppression normale du Pod, le kubelet commence à arrêter web. access-log reste actif pendant la fin du conteneur principal. Le budget de grâce du Pod est déjà en cours.",
        ),
        "complete",
        "running",
        "stopping",
      ),
      frame(
        l("Stop the sidecar after web", "Arrêter le sidecar après web"),
        l(
          "web is fully stopped. The kubelet may now terminate access-log using the remaining grace time. The sidecar does not receive a fresh full grace period.",
          "web est complètement arrêté. Le kubelet peut maintenant arrêter access-log avec le temps de grâce restant. Le sidecar ne reçoit pas un nouveau délai de grâce complet.",
        ),
        "complete",
        "stopping",
        "stopped",
      ),
      frame(
        l("Finish Pod termination", "Terminer l’arrêt du Pod"),
        l(
          "Both processes have stopped. Removing the Pod discards its emptyDir volumes. There is no remote collector or persistence acknowledgement in this lab, so shutdown ordering alone is not a log-delivery guarantee.",
          "Les deux processus sont arrêtés. Le retrait du Pod efface ses volumes emptyDir. Ce lab n’a ni collecteur distant ni acquittement de persistance ; l’ordre d’arrêt ne garantit donc pas la livraison des logs.",
        ),
        "complete",
        "stopped",
        "stopped",
      ),
    ]),
    scenario(l("Regular init fails", "Init classique en échec"), labActors, [
      prepare,
      frame(
        l("seed-page exits with an error", "seed-page termine en erreur"),
        l(
          "A preparation failure prevents access-log and web from starting. Inspect this initializer’s logs, events and mount permissions; web logs cannot explain a process that never started.",
          "Un échec de préparation empêche le démarrage de access-log et web. Examinez logs, événements et permissions de montage de cet init ; les logs de web n’expliquent pas un processus jamais démarré.",
        ),
        "failed",
        "waiting",
        "waiting",
      ),
      frame(
        l("Retry initialization", "Retenter l’initialisation"),
        l(
          "With the lab’s Pod restartPolicy: Always, a failed regular init is retried, with backoff omitted here. This is not a successful completion. With restartPolicy: Never, an init failure would instead fail the Pod.",
          "Avec restartPolicy: Always du Pod du lab, un init classique échoué est retenté ; le backoff est omis ici. Ce n’est pas une fin réussie. Avec restartPolicy: Never, un échec d’init ferait au contraire échouer le Pod.",
        ),
        "restarting",
        "waiting",
        "waiting",
      ),
      frame(
        l("Failure repeats; the app still waits", "L’échec persiste ; l’application attend"),
        l(
          "The next attempt can fail again. The diagram stops at a repeated failure, not at a Kubernetes retry limit. Fix the cause and use repeatable initialization; a restart alone is not a repair.",
          "La tentative suivante peut encore échouer. Le schéma s’arrête sur cet échec répété, pas sur une limite de tentatives Kubernetes. Corrigez la cause et rendez l’initialisation répétable ; un redémarrage n’est pas une réparation.",
        ),
        "failed",
        "waiting",
        "waiting",
      ),
    ]),
    scenario(l("Sidecar startup fails", "Startup du sidecar en échec"), labActors, [
      prepare,
      probe,
      frame(
        l("Ten startup failures", "Dix échecs de startup"),
        l(
          "Failure variant: a misconfigured probe fails ten times consecutively while the sidecar process keeps running: failureThreshold is 10, periodSeconds is 1. The kubelet initiates termination of access-log. web has never started; this is not a readiness failure. Ten seconds is only a nominal budget.",
          "Variante de panne : une probe mal configurée échoue dix fois consécutivement pendant que le sidecar reste actif : failureThreshold vaut 10 et periodSeconds vaut 1. Le kubelet déclenche l’arrêt de access-log. web n’a jamais démarré ; ce n’est pas un échec de readiness. Dix secondes ne sont qu’un budget nominal.",
        ),
        "complete",
        "stopping",
        "waiting",
      ),
      frame(
        l("Restart only the failed sidecar", "Redémarrer le sidecar en échec"),
        l(
          "The native sidecar’s Always policy restarts access-log. In this container-restart scenario, seed-page remains completed and emptyDir remains. Backoff and termination delay are omitted.",
          "La politique Always du sidecar natif redémarre access-log. Dans ce scénario de redémarrage de conteneur, seed-page reste terminé et emptyDir subsiste. Backoff et délai d’arrêt sont omis.",
        ),
        "complete",
        "restarting",
        "waiting",
      ),
      frame(
        l("Startup must succeed on the retry", "Startup doit réussir à la reprise"),
        l(
          "The restarted sidecar runs its startupProbe again. web still waits until it succeeds. A fresh container process does not bypass the startup prerequisite; this branch stops before any success is observed.",
          "Le sidecar redémarré exécute de nouveau sa startupProbe. web attend toujours son succès. Un nouveau processus ne contourne pas ce prérequis ; cette branche s’arrête avant tout succès observé.",
        ),
        "complete",
        "probing",
        "waiting",
      ),
    ]),
    scenario(
      l("Companion as a regular init", "Compagnon devenu init classique"),
      [
        labActors[0]!,
        { name: "access-log", role: l("Regular init (variant)", "Init classique (variante)") },
        labActors[2]!,
      ],
      [
        prepare,
        frame(
          l("tail runs as a regular initializer", "tail devient un init classique"),
          l(
            "As in the challenge, remove both restartPolicy: Always and startupProbe from access-log in a disposable copy. A regular init cannot declare startupProbe; removing only restartPolicy would make that manifest invalid.",
            "Comme dans le défi, retirez restartPolicy: Always et startupProbe de access-log dans une copie jetable. Un init classique ne peut pas déclarer startupProbe ; retirer seulement restartPolicy rendrait ce manifest invalide.",
          ),
          "complete",
          "running",
          "waiting",
        ),
        frame(
          l("No completion, no application", "Pas de fin, pas d’application"),
          l(
            "tail keeps running, so this regular initializer never exits successfully and web cannot start. Kubernetes does not convert it into a sidecar. Two ordinary containers under containers would not provide the native sidecar’s startup or shutdown ordering either.",
            "tail continue de tourner : cet init classique ne termine jamais avec succès et web ne démarre pas. Kubernetes ne le convertit pas en sidecar. Deux conteneurs ordinaires sous containers n’offriraient pas non plus l’ordre de démarrage ou d’arrêt du sidecar natif.",
          ),
          "complete",
          "running",
          "waiting",
        ),
      ],
    ),
    scenario(
      l("Shutdown · two sidecars", "Arrêt · deux sidecars"),
      [
        { name: "sidecar-a", role: l("First native sidecar", "Premier sidecar natif") },
        { name: "sidecar-b", role: l("Second native sidecar", "Second sidecar natif") },
        labActors[2]!,
      ],
      [
        frame(
          l("Variant: A then B, then web", "Variante : A puis B, puis web"),
          l(
            "Fictional extension: sidecar-a and sidecar-b are native sidecars, declared in that initContainers order. Their startup prerequisites have already succeeded; web is running. The lab manifest has only access-log, not these two sidecars.",
            "Extension fictive : sidecar-a et sidecar-b sont natifs, déclarés dans cet ordre dans initContainers. Leurs prérequis de démarrage ont déjà réussi ; web tourne. Le manifest du lab ne contient que access-log, pas ces deux sidecars.",
          ),
          "running",
          "running",
          "running",
        ),
        frame(
          l("Stop web first", "Arrêter web d’abord"),
          l(
            "Pod deletion starts normal termination. Both sidecars keep running while web stops, within the shared grace period.",
            "La suppression du Pod déclenche l’arrêt normal. Les deux sidecars restent actifs pendant l’arrêt de web, dans le délai de grâce partagé.",
          ),
          "running",
          "running",
          "stopping",
        ),
        frame(
          l("Then stop B", "Puis arrêter B"),
          l(
            "web has stopped. The kubelet terminates sidecars in reverse declaration order: B first. A remains available while B stops.",
            "web est arrêté. Le kubelet termine les sidecars dans l’ordre inverse de déclaration : B d’abord. A reste disponible pendant l’arrêt de B.",
          ),
          "running",
          "stopping",
          "stopped",
        ),
        frame(
          l("Then stop A", "Puis arrêter A"),
          l(
            "Once B has stopped, A is asked to stop. This ordered path assumes sufficient remaining grace time; it is not a separate timeout budget for each sidecar.",
            "Une fois B arrêté, l’arrêt de A est demandé. Ce chemin ordonné suppose assez de temps de grâce restant ; chaque sidecar n’a pas son propre budget complet.",
          ),
          "stopping",
          "stopped",
          "stopped",
        ),
        frame(
          l("All stopped within the budget", "Tous arrêtés dans le délai"),
          l(
            "This graceful branch finishes before the deadline. If the overall grace period expires, forced termination can interrupt this sequence. Do not infer crash safety or guaranteed buffered-log delivery from the normal ordering.",
            "Cette branche gracieuse finit avant l’échéance. Si le délai global expire, l’arrêt forcé peut interrompre cette séquence. Ne déduisez de l’ordre normal ni résistance aux pannes ni livraison garantie des logs en mémoire.",
          ),
          "stopped",
          "stopped",
          "stopped",
        ),
      ],
    ),
  ] satisfies [SequenceScenario, ...SequenceScenario[]],
};
