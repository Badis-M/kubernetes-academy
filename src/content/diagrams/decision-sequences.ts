import type { L } from "../types";
import type {
  SequenceLane,
  SequenceNode,
  SequenceScenario,
  SequenceStep,
} from "@/components/diagrams/StepSequenceDiagram";

const l = (en: string, fr = en): L => ({ en, fr });
const node = (label: L, detail: L, tone?: SequenceNode["tone"]): SequenceNode => ({
  label,
  detail,
  ...(tone ? { tone } : {}),
});
const step = (title: L, description: L, scene: SequenceLane[]): SequenceStep => ({
  title,
  description,
  scene,
});
const probeScene = (check: L, process: L, endpoint: L, failed = false): SequenceLane[] => [
  {
    label: l(
      "Decision → process → routing eligibility (not a packet path)",
      "Décision → processus → éligibilité au trafic (pas un trajet réseau)",
    ),
    connected: true,
    nodes: [
      node(l("kubelet · probes"), check, failed ? "blocked" : "active"),
      node(l("Container", "Conteneur"), process),
      node(l("Service · endpoint"), endpoint, failed ? "blocked" : "active"),
    ],
  },
];
const starting = step(
  l("Startup gates the checks", "Startup suspend les checks"),
  l(
    "The container has started, but startup has not succeeded. Readiness and liveness are disabled for this container; the Pod is not yet ready.",
    "Le conteneur a démarré, mais startup n’a pas réussi. Readiness et liveness sont désactivées pour ce conteneur ; le Pod n’est pas encore prêt.",
  ),
  probeScene(
    l("Startup: waiting", "Startup : en attente"),
    l("Running · restarts: 0", "En cours · redémarrages : 0"),
    l("Not ready · no traffic", "Non prêt · aucun trafic"),
  ),
);
const startupPassed = step(
  l("Startup succeeds", "Startup réussit"),
  l(
    "Readiness and liveness may now run independently. Startup success alone does not make this Pod Ready: readiness still has to succeed.",
    "Readiness et liveness peuvent maintenant s’exécuter indépendamment. Le succès de startup ne rend pas ce Pod Ready : readiness doit encore réussir.",
  ),
  probeScene(
    l("Readiness + liveness enabled", "Readiness + liveness activées"),
    l("Running · restarts: 0", "En cours · redémarrages : 0"),
    l("Readiness pending", "Readiness en attente"),
  ),
);
const ready = step(
  l("Readiness succeeds", "Readiness réussit"),
  l(
    "With readiness successful and no other readiness gates, this Pod becomes Ready. Its endpoint becomes eligible after the routing components observe the change.",
    "Readiness réussit et aucune autre readiness gate ne bloque : ce Pod devient Ready. Son endpoint devient éligible après propagation aux composants de routage.",
  ),
  probeScene(
    l("Readiness: success", "Readiness : succès"),
    l("Running · restarts: 0", "En cours · redémarrages : 0"),
    l("Ready · eligible", "Prêt · éligible"),
  ),
);
const restarted = step(
  l("Restart, then startup again", "Redémarrage, puis startup"),
  l(
    "The kubelet restarts this container under restartPolicy: Always. The Pod UID stays the same. Startup runs again; readiness and liveness wait. Restart backoff and termination time are omitted.",
    "Le kubelet redémarre ce conteneur selon restartPolicy: Always. L’UID du Pod reste identique. Startup reprend ; readiness et liveness attendent. Backoff et délai d’arrêt sont omis.",
  ),
  probeScene(
    l("Startup: waiting again", "Startup : nouvelle attente"),
    l("Same Pod · restarts: 1", "Même Pod · redémarrages : 1"),
    l("Not ready · no traffic", "Non prêt · aucun trafic"),
    true,
  ),
);

export const probesSequence = {
  title: l("Probes · routing or restart?", "Probes · routage ou redémarrage ?"),
  scope: l(
    "Teaching simulation: one container from the lab Deployment, restartPolicy: Always, default Service routing and no extra readiness gates. The other replica is omitted. Steps are decisions, not a time scale; existing connections are not instantly terminated.",
    "Simulation pédagogique : un conteneur du Deployment du lab, restartPolicy: Always, routage Service par défaut et aucune readiness gate supplémentaire. L’autre réplique est omise. Les étapes ne sont pas une échelle de temps ; les connexions existantes ne sont pas coupées instantanément.",
  ),
  scenarios: [
    {
      label: l("Readiness"),
      steps: [
        starting,
        startupPassed,
        ready,
        step(
          l("Readiness fails twice", "Readiness échoue deux fois"),
          l(
            "In this manifest, failureThreshold is 2. After two consecutive failures, readiness becomes false: normal Service traffic excludes this endpoint after propagation. The process continues; readiness does not restart it. Liveness remains independent.",
            "Dans ce manifest, failureThreshold vaut 2. Après deux échecs consécutifs, readiness devient false : le routage Service normal exclut cet endpoint après propagation. Le processus continue ; readiness ne le redémarre pas. Liveness reste indépendante.",
          ),
          probeScene(
            l("Readiness: failure threshold", "Readiness : seuil d’échec"),
            l("Still running · restarts: 0", "Toujours en cours · redémarrages : 0"),
            l("Not ready · excluded", "Non prêt · exclu"),
            true,
          ),
        ),
        step(
          l("Readiness recovers", "Readiness se rétablit"),
          l(
            "The lab uses the default successThreshold of 1. A successful readiness check restores eligibility after propagation, without restarting the container.",
            "Le lab utilise successThreshold à 1 par défaut. Un succès de readiness rétablit l’éligibilité après propagation, sans redémarrer le conteneur.",
          ),
          probeScene(
            l("Readiness: success", "Readiness : succès"),
            l("Same process · restarts: 0", "Même processus · redémarrages : 0"),
            l("Ready · eligible again", "Prêt · de nouveau éligible"),
          ),
        ),
      ],
    },
    {
      label: l("Liveness"),
      steps: [
        starting,
        startupPassed,
        ready,
        step(
          l("Liveness fails three times", "Liveness échoue trois fois"),
          l(
            "Three consecutive failures reach this manifest’s liveness failureThreshold. The kubelet initiates container termination. This is a restart decision, not merely a readiness change.",
            "Trois échecs consécutifs atteignent le failureThreshold de liveness de ce manifest. Le kubelet déclenche l’arrêt du conteneur. C’est une décision de redémarrage, pas seulement un changement de readiness.",
          ),
          probeScene(
            l("Liveness: failure threshold", "Liveness : seuil d’échec"),
            l("Termination initiated", "Arrêt déclenché"),
            l("Routing updates asynchronously", "Routage actualisé de façon asynchrone"),
            true,
          ),
        ),
        restarted,
      ],
    },
    {
      label: l("Startup"),
      steps: [
        starting,
        step(
          l("Startup exhausts its budget", "Startup épuise son budget"),
          l(
            "Thirty consecutive startup failures reach this manifest’s threshold. Readiness and liveness never ran. The kubelet initiates termination; 30 × 2 seconds is a nominal budget, not an exact restart deadline.",
            "Trente échecs consécutifs de startup atteignent le seuil du manifest. Readiness et liveness n’ont jamais tourné. Le kubelet déclenche l’arrêt ; 30 × 2 secondes est un budget nominal, pas une échéance exacte de redémarrage.",
          ),
          probeScene(
            l("Startup: 30 failures", "Startup : 30 échecs"),
            l("Termination initiated", "Arrêt déclenché"),
            l("Never ready", "Jamais prêt"),
            true,
          ),
        ),
        restarted,
      ],
    },
  ] satisfies [SequenceScenario, ...SequenceScenario[]],
};

const gatewayScene = (proxy: L, backend: L, result: L, failed = false): SequenceLane[] => [
  {
    label: l(
      "Configuration · declarations → reconciliation → proxy configuration",
      "Configuration · déclarations → réconciliation → configuration du proxy",
    ),
    connected: true,
    nodes: [
      node(l("Gateway + HTTPRoute"), l("Listener + Host + backendRef")),
      node(l("Controller", "Contrôleur"), l("Observes the API", "Observe l’API")),
      node(l("Proxy"), l("Receives configuration", "Reçoit la configuration")),
    ],
  },
  {
    label: l(
      "HTTP request · client → proxy decision → outcome",
      "Requête HTTP · client → décision du proxy → résultat",
    ),
    connected: true,
    nodes: [
      node(l("Client"), proxy, "active"),
      node(l("Proxy · routing", "Proxy · routage"), backend, failed ? "blocked" : "active"),
      node(l("Outcome", "Résultat"), result, failed ? "blocked" : "active"),
    ],
  },
];
const config = step(
  l("Configure the data plane", "Configurer le plan de données"),
  l(
    "The controller reconciles Gateway and HTTPRoute into proxy configuration. Assume current Accepted, ResolvedRefs and Programmed conditions are true where applicable. These are not an end-to-end HTTP health check; the controller is not in the request path.",
    "Le contrôleur traduit Gateway et HTTPRoute en configuration du proxy. On suppose les conditions courantes Accepted, ResolvedRefs et Programmed vraies lorsqu’elles s’appliquent. Elles ne testent pas HTTP de bout en bout ; le contrôleur n’est pas sur le trajet des requêtes.",
  ),
  gatewayScene(
    l("No request yet", "Pas encore de requête"),
    l("Listener ready", "Listener prêt"),
    l("HTTP untested", "HTTP non testé"),
  ),
);
export const gatewaySequence = {
  title: l("Gateway · configuration and traffic", "Gateway · configuration et trafic"),
  scope: l(
    "Teaching simulation of the lab’s HTTP listener and single Route: academy.example.invalid, path /. Assume a reachable Envoy Gateway proxy. TLS and external address provisioning are omitted. A backendRef selects a Service; forwarding to its endpoints need not traverse its ClusterIP.",
    "Simulation du listener HTTP et de l’unique Route du lab : academy.example.invalid, chemin /. Proxy Envoy Gateway supposé joignable. TLS et fourniture d’adresse externe sont omis. Un backendRef désigne un Service ; le transfert vers ses endpoints ne passe pas forcément par sa ClusterIP.",
  ),
  scenarios: [
    {
      label: l("200 · ready backend", "200 · backend prêt"),
      steps: [
        config,
        step(
          l("Match Host and path", "Sélectionner Host et chemin"),
          l(
            "The request Host academy.example.invalid and path / match the listener and HTTPRoute. The backendRef points to Service web on port 80.",
            "Le Host academy.example.invalid et le chemin / correspondent au listener et à HTTPRoute. Le backendRef désigne le Service web sur le port 80.",
          ),
          gatewayScene(
            l("Host: academy.example.invalid"),
            l("Route matches → Service web:80", "Route sélectionnée → Service web:80"),
            l("Backend selection pending", "Sélection du backend en attente"),
          ),
        ),
        step(
          l("Forward to a ready endpoint", "Transférer vers un endpoint prêt"),
          l(
            "The proxy forwards the request to an eligible backend Pod discovered for Service web. This example assumes connectivity and a healthy nginx response.",
            "Le proxy transfère la requête à un Pod backend éligible découvert pour le Service web. Cet exemple suppose la connectivité et une réponse nginx correcte.",
          ),
          gatewayScene(
            l("GET /"),
            l("Ready endpoint selected", "Endpoint prêt sélectionné"),
            l("Request reaches nginx", "Requête reçue par nginx"),
          ),
        ),
        step(
          l("Return 200 to the client", "Renvoyer 200 au client"),
          l(
            "nginx responds with HTTP 200; the response travels back through the proxy to the client. Ready alone would not guarantee this application response.",
            "nginx répond HTTP 200 ; la réponse revient au client par le proxy. Ready ne garantirait pas à lui seul cette réponse applicative.",
          ),
          gatewayScene(
            l("Receives HTTP 200", "Reçoit HTTP 200"),
            l("Relays the backend response", "Relaie la réponse backend"),
            l("200 · nginx"),
          ),
        ),
      ],
    },
    {
      label: l("404 · wrong Host", "404 · mauvais Host"),
      steps: [
        config,
        step(
          l("Send a different Host", "Envoyer un autre Host"),
          l(
            "The client sends Host: other.example.invalid. No other listener or Route is configured in this model.",
            "Le client envoie Host: other.example.invalid. Aucun autre listener ni Route n’est configuré dans ce modèle.",
          ),
          gatewayScene(
            l("Host: other.example.invalid"),
            l("Hostname does not match", "Hostname sans correspondance"),
            l("No backend selected", "Aucun backend sélectionné"),
            true,
          ),
        ),
        step(
          l("Reject before the backend", "Refuser avant le backend"),
          l(
            "No listener matches this Host. The Gateway returns HTTP 404 without sending the request to nginx. Check the Host and listener/Route hostnames before debugging the application.",
            "Aucun listener ne correspond à ce Host. La Gateway renvoie HTTP 404 sans transmettre la requête à nginx. Vérifiez le Host et les hostnames listener/Route avant de diagnostiquer l’application.",
          ),
          gatewayScene(
            l("Receives HTTP 404", "Reçoit HTTP 404"),
            l("No matching listener", "Aucun listener correspondant"),
            l("404 · no backend request", "404 · backend non appelé"),
            true,
          ),
        ),
      ],
    },
    {
      label: l("503 · no ready endpoint", "503 · aucun endpoint prêt"),
      steps: [
        config,
        step(
          l("Route matches, endpoints do not", "Route valide, endpoints indisponibles"),
          l(
            "Host and path match, and Service web exists, but it has no ready endpoint. Accepted and ResolvedRefs can remain true: the reference is valid even though no backend is ready.",
            "Host et chemin correspondent, et le Service web existe, mais aucun endpoint n’est prêt. Accepted et ResolvedRefs peuvent rester vraies : la référence est valide même sans backend prêt.",
          ),
          gatewayScene(
            l("Host: academy.example.invalid"),
            l("Service web · 0 ready endpoints", "Service web · 0 endpoint prêt"),
            l("No eligible backend", "Aucun backend éligible"),
            true,
          ),
        ),
        step(
          l("Return an availability error", "Renvoyer une erreur de disponibilité"),
          l(
            "503 is the expected Envoy response here and the Gateway API recommendation (SHOULD), not an unconditional guarantee across implementations. A backendRef to a missing or invalid resource is a different error: the API requires 500 for traffic assigned to that invalid backend.",
            "503 est la réponse Envoy attendue ici et la recommandation Gateway API (SHOULD), pas une garantie universelle. Un backendRef vers une ressource absente ou invalide est un autre défaut : l’API exige 500 pour le trafic affecté à ce backend invalide.",
          ),
          gatewayScene(
            l("Receives HTTP 503", "Reçoit HTTP 503"),
            l("No ready upstream", "Aucun upstream prêt"),
            l("503 · inspect EndpointSlices", "503 · examiner les EndpointSlices"),
            true,
          ),
        ),
      ],
    },
  ] satisfies [SequenceScenario, ...SequenceScenario[]],
};

const candidates = (
  a: L,
  b: L,
  phase: L,
  aTone?: SequenceNode["tone"],
  bTone?: SequenceNode["tone"],
): SequenceLane[] => [
  {
    label: phase,
    nodes: [node(l("Worker A · general"), a, aTone), node(l("Worker B · reserved"), b, bTone)],
  },
];
export const schedulingSequence = {
  title: l("Scheduling · filter before scoring", "Scheduling · filtrer avant de classer"),
  scope: l(
    "Two-worker teaching model from the lab: A=general, B=reserved with the exercise NoSchedule taint. Both are Ready with enough allocatable resources for the Pod’s requests. Control-plane excluded. Other plugins, contention and preemption are omitted; preferences shown are not real scheduler scores.",
    "Modèle des deux workers du lab : A=general, B=reserved avec le taint NoSchedule d’exercice. Tous deux sont Ready et disposent de ressources allocatable suffisantes pour les requests du Pod. Control plane exclu. Autres plugins, concurrence et préemption omis ; les préférences affichées ne sont pas des scores réels.",
  ),
  scenarios: [
    {
      label: l("Feasible placement", "Placement possible"),
      steps: [
        step(
          l("Declare constraints and preferences", "Déclarer contraintes et préférences"),
          l(
            "Like the chapter’s challenge: required node affinity allows general OR reserved, a toleration matches B’s exercise taint, and preferred affinity favors general. The toleration permits B; it does not attract the Pod to B.",
            "Comme dans le défi du chapitre : l’affinité obligatoire autorise general OU reserved, une toleration correspond au taint d’exercice de B, et l’affinité préférée favorise general. La toleration autorise B ; elle n’y attire pas le Pod.",
          ),
          candidates(
            l("Label matches · preferred", "Label accepté · préféré"),
            l("Label matches · taint tolerated", "Label accepté · taint toléré"),
            l("Candidates · Pod still unassigned", "Candidats · Pod non affecté"),
          ),
        ),
        step(
          l("Filter mandatory constraints", "Appliquer les filtres obligatoires"),
          l(
            "Both nodes satisfy the requirements modeled here. Only feasible nodes proceed to scoring. A preference would never rescue an untolerated NoSchedule taint or a failed required affinity.",
            "Les deux nœuds satisfont les exigences modélisées. Seuls les nœuds admissibles passent au classement. Une préférence ne compenserait jamais un taint NoSchedule non toléré ni une affinité obligatoire non satisfaite.",
          ),
          candidates(
            l("Feasible", "Admissible"),
            l("Feasible", "Admissible"),
            l("Filter → feasible set: A, B", "Filtre → ensemble admissible : A, B"),
            "success",
            "success",
          ),
        ),
        step(
          l("Score only feasible nodes", "Classer les seuls nœuds admissibles"),
          l(
            "Assuming other scoring rules are equal, the preference for general ranks A above B. Real scores depend on the scheduler profile and cluster state; this animation does not compute them.",
            "En supposant les autres règles de score égales, la préférence pour general classe A devant B. Les scores réels dépendent du profil du scheduler et de l’état du cluster ; cette animation ne les calcule pas.",
          ),
          candidates(
            l("Rank 1 · preference matches", "Rang 1 · préférence satisfaite"),
            l("Rank 2 · still feasible", "Rang 2 · toujours admissible"),
            l("Score → choose A in this model", "Classement → choisir A dans ce modèle"),
            "active",
          ),
        ),
        step(
          l("Bind, then let kubelet start", "Lier, puis laisser le kubelet démarrer"),
          l(
            "Assume reservation, permission and binding succeed: the Pod is assigned to A. Its kubelet then starts the containers. Bound does not mean Running or Ready; image pulls and startup can still fail.",
            "On suppose réservation, permission et binding réussis : le Pod est affecté à A. Son kubelet démarre ensuite les conteneurs. Affecté ne signifie ni Running ni Ready ; téléchargement d’image et démarrage peuvent encore échouer.",
          ),
          candidates(
            l("Pod bound · kubelet takes over", "Pod affecté · relais au kubelet"),
            l("Not selected", "Non sélectionné"),
            l("Bind → startup is a separate operation", "Binding → démarrage distinct"),
            "success",
          ),
        ),
      ],
    },
    {
      label: l("No feasible node", "Aucun nœud admissible"),
      steps: [
        step(
          l("Require reserved without toleration", "Exiger reserved sans toleration"),
          l(
            "The initial lab manifest uses nodeSelector: reserved and no toleration for B’s NoSchedule taint. Even adding a strong preference for B would not remove these hard constraints.",
            "Le manifest initial du lab impose nodeSelector: reserved sans toleration du taint NoSchedule de B. Même une forte préférence pour B ne retirerait pas ces contraintes strictes.",
          ),
          candidates(
            l("Wrong pool: general", "Mauvais pool : general"),
            l("Right pool, untolerated taint", "Bon pool, taint non toléré"),
            l(
              "Candidates · mandatory checks pending",
              "Candidats · filtres obligatoires à appliquer",
            ),
          ),
        ),
        step(
          l("Reject both candidates", "Rejeter les deux candidats"),
          l(
            "A fails nodeSelector. B fails the taint/toleration check. The feasible set is empty; neither node receives a score for selection in this attempt.",
            "A échoue au nodeSelector. B échoue au contrôle taint/toleration. L’ensemble admissible est vide ; aucun nœud ne reçoit de score de sélection pour cette tentative.",
          ),
          candidates(
            l("Filtered · selector mismatch", "Exclu · sélecteur incompatible"),
            l("Filtered · NoSchedule untolerated", "Exclu · NoSchedule non toléré"),
            l("Filter → empty feasible set", "Filtre → ensemble admissible vide"),
            "blocked",
            "blocked",
          ),
        ),
        step(
          l("Keep the Pod Pending", "Garder le Pod Pending"),
          l(
            "There is no binding in this attempt. Inspect FailedScheduling events and correct the constraint or add the intended toleration, as the lab explains. Retries may follow; preemption cannot repair a selector mismatch or missing toleration.",
            "Aucun binding n’a lieu dans cette tentative. Examinez les événements FailedScheduling puis corrigez la contrainte ou ajoutez la toleration prévue, comme dans le lab. D’autres tentatives peuvent suivre ; la préemption ne répare ni un sélecteur incompatible ni une toleration absente.",
          ),
          candidates(
            l("No score · no binding", "Pas de score · pas de binding"),
            l("No score · no binding", "Pas de score · pas de binding"),
            l(
              "Pending → diagnose hard constraints",
              "Pending → diagnostiquer les contraintes strictes",
            ),
            "blocked",
            "blocked",
          ),
        ),
      ],
    },
  ] satisfies [SequenceScenario, ...SequenceScenario[]],
};
