import type { L } from "../types";
import type { SequenceNode, SequenceScenario } from "@/components/diagrams/StepSequenceDiagram";

const l = (en: string, fr = en): L => ({ en, fr });

const scene = (client: L, stored: string, response: L, tone?: SequenceNode["tone"]) => [
  {
    label: l(
      "Client view, stored object and API response",
      "Vue du client, objet stocké et réponse API",
    ),
    nodes: [
      { label: l("Client"), detail: client },
      { label: l("Stored ConfigMap", "ConfigMap stockée"), detail: l(stored) },
      { label: l("API response", "Réponse API"), detail: response, ...(tone ? { tone } : {}) },
    ],
  },
];

const initial = 'resourceVersion: "7" · data.value: one';
const patched = 'resourceVersion: "8" · data.value: two';
const accepted = 'resourceVersion: "12" · data.value: two · reviewed: "true"';

const conflictScenario = {
  label: l("Stale replacement", "Remplacement périmé"),
  steps: [
    {
      title: l("Read counter", "Lire counter"),
      description: l(
        "The client reads the ConfigMap counter in lab-api and saves the full response, including metadata.resourceVersion.",
        "Le client lit la ConfigMap counter dans lab-api et enregistre la réponse complète, avec metadata.resourceVersion.",
      ),
      scene: scene(l(initial), initial, l("GET · 200 OK"), "success"),
    },
    {
      title: l("A PATCH changes counter", "Un PATCH modifie counter"),
      description: l(
        "A separate write sets data.value to two. The API server stores the change and returns a new resourceVersion. The saved copy still contains one.",
        "Une écriture intermédiaire fixe data.value à two. Le serveur API enregistre la modification et renvoie un nouveau resourceVersion. La copie enregistrée contient toujours one.",
      ),
      scene: scene(l(initial), patched, l("PATCH · 200 OK"), "success"),
    },
    {
      title: l("Reject the stale PUT", "Refuser le PUT périmé"),
      description: l(
        'kubectl replace sends the saved object with resourceVersion "7". The current object has "8", so the API server rejects the PUT. The rejected request leaves data.value at two.',
        'kubectl replace envoie l’objet enregistré avec resourceVersion "7". L’objet courant porte "8", donc le serveur API refuse le PUT. La requête rejetée laisse data.value à two.',
      ),
      scene: scene(l(initial), patched, l("PUT · 409 Conflict"), "blocked"),
    },
    {
      title: l("Read the current object", "Relire l’objet courant"),
      description: l(
        "A fresh GET returns the current object and its resourceVersion. The client sees that the intervening write set data.value to two.",
        "Un nouveau GET renvoie l’objet courant et son resourceVersion. Le client constate que l’écriture intermédiaire a fixé data.value à two.",
      ),
      scene: scene(l(patched), patched, l("GET · 200 OK"), "success"),
    },
    {
      title: l("Rebuild the change from the fresh copy", "Repartir de l’objet relu"),
      description: l(
        'To illustrate a retry, the client decides to add the annotation reviewed: "true". It prepares the change from the fresh object, preserving data.value: two and the resourceVersion returned by GET.',
        'Pour illustrer une nouvelle tentative, le client décide d’ajouter l’annotation reviewed: "true". Il prépare la modification à partir de l’objet relu, en conservant data.value: two et le resourceVersion renvoyé par GET.',
      ),
      scene: scene(
        l(patched + ' · reviewed: "true"'),
        patched,
        l("No request yet", "Aucune requête à cette étape"),
      ),
    },
    {
      title: l("Retry the conditional PUT", "Retenter le PUT conditionnel"),
      description: l(
        "In this example the resourceVersion still matches, so the server accepts the update and returns a new one. If another write intervenes, a new conflict requires another read and a fresh decision about the change.",
        "Dans cet exemple, le resourceVersion correspond toujours. Le serveur accepte donc la mise à jour et renvoie un nouveau jeton. Si une autre écriture intervient, le nouveau conflit demande une relecture et une nouvelle décision sur la modification.",
      ),
      scene: scene(l(accepted), accepted, l("PUT · 200 OK"), "success"),
    },
  ],
} satisfies SequenceScenario;

export const apiConflictSequence = {
  title: l("API · 409 Conflict and fresh read", "API · conflit 409 et relecture"),
  scope: l(
    "This simulation follows the lab through the fresh read, then illustrates a possible retry. The example resourceVersions identify stored revisions. Copy the value returned by the API unchanged, without calculating the next version or treating it as a timestamp.",
    "Cette simulation suit le lab jusqu’à la relecture, puis illustre une nouvelle tentative possible. Les resourceVersion d’exemple identifient des révisions stockées. Recopiez la valeur renvoyée par l’API telle quelle, sans calculer la version suivante ni l’interpréter comme une date.",
  ),
  scenarios: [conflictScenario] as const,
};
