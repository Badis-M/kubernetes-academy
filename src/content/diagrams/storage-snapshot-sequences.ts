import type { L } from "../types";
import type { SequenceScenario, SequenceStep } from "@/components/diagrams/StepSequenceDiagram";

const l = (en: string, fr = en): L => ({ en, fr });
const absent = l("Not created", "Non créé");

function recoveryScenario(
  label: L,
  lanes: readonly [L, L, L],
  frames: readonly { title: L; description: L; states: readonly [L, L, L] }[],
): SequenceScenario {
  const steps: SequenceStep[] = frames.map(({ title, description, states }) => ({
    title,
    description,
    scene: [
      {
        label: l(
          "Source, snapshot and target at this step",
          "Source, snapshot et cible à cette étape",
        ),
        nodes: states.map((detail, index) => ({ label: lanes[index]!, detail })),
      },
    ],
  }));
  return { label, steps };
}

const blue = l("/workshop/release = blue");
const green = l("/workshop/release = green");
const saved = l("snapshot.db · blue");

export const etcdSnapshotSequence = {
  title: l("etcd · API state snapshot", "etcd · snapshot de l’état API"),
  scope: l(
    "The lab uses a synthetic key in an isolated etcd store. In Kubernetes, an etcd snapshot captures API state stored in etcd, including PVC objects and potentially Secrets. The contents of external volumes need their own backup.",
    "Le lab utilise une clé synthétique dans un magasin etcd isolé. Dans Kubernetes, un snapshot etcd capture l’état API conservé dans etcd, dont les objets PVC et potentiellement les Secrets. Le contenu des volumes externes demande sa propre sauvegarde.",
  ),
  scenarios: [
    recoveryScenario(
      l("Isolated etcd recovery", "Restauration etcd isolée"),
      [l("Source etcd"), l("Snapshot"), l("Restored etcd", "etcd restauré")],
      [
        {
          title: l("Write the source key", "Écrire la clé source"),
          description: l(
            "The synthetic source stores blue.",
            "La source synthétique enregistre blue.",
          ),
          states: [blue, absent, absent],
        },
        {
          title: l("Save and inspect the snapshot", "Sauvegarder et inspecter le snapshot"),
          description: l(
            "etcdctl snapshot save captures the store. etcdutl snapshot status inspects the resulting snapshot.db.",
            "etcdctl snapshot save capture le magasin. etcdutl snapshot status inspecte le fichier snapshot.db obtenu.",
          ),
          states: [blue, saved, absent],
        },
        {
          title: l("Write green after capture", "Écrire green après la capture"),
          description: l(
            "The source advances to green. The snapshot still contains blue.",
            "La source passe à green. Le snapshot contient toujours blue.",
          ),
          states: [green, saved, absent],
        },
        {
          title: l("Restore into a new data directory", "Restaurer dans un nouveau répertoire"),
          description: l(
            "etcdutl snapshot restore checks the snapshot hash and prepares a new logical cluster in a separate directory. Revision bumping and compaction help watch clients rebuild their caches. They preserve the snapshot’s data point.",
            "etcdutl snapshot restore vérifie le hash et prépare un nouveau cluster logique dans un répertoire distinct. L’augmentation de révision et la compaction aident les clients watch à reconstruire leur cache. Le contenu restauré reste celui de la capture.",
          ),
          states: [green, saved, l("New data directory · blue", "Nouveau répertoire · blue")],
        },
        {
          title: l("Read both stores", "Relire les deux magasins"),
          description: l(
            "The new member returns blue and the source still returns green. Restoring the snapshot recovers the earlier value.",
            "Le nouveau membre renvoie blue et la source renvoie toujours green. La restauration récupère la valeur antérieure.",
          ),
          states: [green, saved, blue],
        },
      ],
    ),
  ] as const,
};

const marker = l("marker.txt · snapshot-marker-v1");
const ready = l("source-snapshot · readyToUse: true");

export const csiSnapshotSequence = {
  title: l("CSI · volume snapshot", "CSI · snapshot de volume"),
  scope: l(
    "This success path assumes a compatible CSI driver, snapshot CRDs and controller, and matching classes. The default kind local-path provisioner cannot run it. A VolumeSnapshot is an API object that references a storage snapshot. The snapshot captures one volume’s contents at a point in time. Plan application consistency and protection against backend loss separately.",
    "Ce parcours suppose un pilote CSI compatible, les CRD et le contrôleur de snapshots ainsi que des classes compatibles. Le provisionneur local-path de kind ne permet pas de l’exécuter. Un VolumeSnapshot est un objet API qui référence une capture côté stockage. Le snapshot capture le contenu d’un volume à un instant donné. La cohérence applicative et la protection contre la perte du backend se préparent séparément.",
  ),
  scenarios: [
    recoveryScenario(
      l("Restore a CSI volume", "Restaurer un volume CSI"),
      [
        l("Source volume", "Volume source"),
        l("Volume snapshot", "Snapshot de volume"),
        l("Restore volume", "Volume restauré"),
      ],
      [
        {
          title: l("Write a marker to source-data", "Écrire un marqueur dans source-data"),
          description: l(
            "In lab-csi, writer mounts source-data and writes then syncs /data/marker.txt.",
            "Dans lab-csi, writer monte source-data, écrit /data/marker.txt puis lance sync.",
          ),
          states: [marker, absent, absent],
        },
        {
          title: l("Request the volume snapshot", "Demander le snapshot de volume"),
          description: l(
            "VolumeSnapshot source-snapshot points to the source PVC. The snapshot controller and CSI snapshotter coordinate the capture with the driver.",
            "Le VolumeSnapshot source-snapshot désigne le PVC source. Le contrôleur de snapshots et le snapshotter CSI coordonnent la capture avec le pilote.",
          ),
          states: [marker, l("source-snapshot · requested", "source-snapshot · demandé"), absent],
        },
        {
          title: l("Wait for readyToUse", "Attendre readyToUse"),
          description: l(
            "The lab waits for readyToUse: true before using the snapshot as a data source. This confirms snapshot readiness. Reading the restored file comes later.",
            "Le lab attend readyToUse: true avant d’utiliser le snapshot comme source de données. Cet état confirme que le snapshot est prêt. La lecture du fichier restauré vient ensuite.",
          ),
          states: [marker, ready, absent],
        },
        {
          title: l(
            "Provision a new volume from the snapshot",
            "Créer un volume depuis le snapshot",
          ),
          description: l(
            "The new PVC restored-data sets dataSource to source-snapshot. The provisioner and driver create a distinct volume from the snapshot. Provisioning can wait for reader to be scheduled.",
            "Le nouveau PVC restored-data désigne source-snapshot dans dataSource. Le provisionneur et le pilote créent un volume distinct à partir du snapshot. Le provisionnement peut attendre le placement de reader.",
          ),
          states: [
            marker,
            ready,
            l("restored-data · distinct volume", "restored-data · volume distinct"),
          ],
        },
        {
          title: l("Read the restored marker", "Relire le marqueur restauré"),
          description: l(
            "reader mounts restored-data and checks /data/marker.txt. This verifies the copied file. Restoring this volume does not restore Kubernetes API state.",
            "reader monte restored-data et vérifie /data/marker.txt. Ce contrôle valide le fichier copié. La restauration du volume laisse l’état API Kubernetes intact.",
          ),
          states: [marker, ready, marker],
        },
      ],
    ),
  ] as const,
};
