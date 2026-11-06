import type { Block } from "./types";
import { sharedLabIntroduction } from "./shared-lab-introduction";
import { code, p } from "./lesson-kit";

/** Keep early exercises isolated while reusing the beginner context selection. */
export const foundationLab = (namespace: string, uidVariable?: string): Block[] => [
  ...sharedLabIntroduction,
  p(
    `This chapter uses ${namespace}. Check that it is absent; continue only after NotFound. Save the shown YAML files in your working directory. The k function below keeps the chosen explicit context and defaults to this namespace; a later -n flag can select kube-system for observation. In a second terminal repeat only context selection and the k function definition; reuse this exercise namespace, do not create it again.`,
    `Ce chapitre utilise ${namespace}. Vérifiez son absence ; continuez seulement après NotFound. Enregistrez les fichiers YAML présentés dans votre répertoire de travail. La fonction k ci-dessous garde le contexte explicite choisi et ce namespace par défaut ; un flag -n ultérieur peut cibler kube-system pour l’observation. Dans un second terminal, répétez seulement le choix du contexte et la définition de k ; réutilisez ce namespace, sans le recréer.`,
  ),
  code("bash", `k get namespace ${namespace}`),
  p(
    "Run the creation block only after confirming NotFound. If creation fails, stop before defining the namespace shortcut or running any exercise or cleanup command.",
    "Lancez la création uniquement après avoir confirmé NotFound. Si elle échoue, arrêtez-vous avant de définir le raccourci de namespace ou d’exécuter une commande d’exercice ou de nettoyage.",
  ),
  code(
    "bash",
    uidVariable
      ? `${uidVariable}=\ncreated_namespace_uid=$(k create namespace ${namespace} -o jsonpath='{.metadata.uid}') &&\n  test -n "$created_namespace_uid" &&\n  ${uidVariable}="$created_namespace_uid"`
      : `k create namespace ${namespace}`,
  ),
  code(
    "bash",
    `function k() {\n  case "$K8S_CONTEXT" in\n    kind-?*) kubectl --context "$K8S_CONTEXT" --namespace ${namespace} "$@" ;;\n    *) printf 'Select a nonempty local kind context first.\\n' >&2; return 1 ;;\n  esac\n}`,
  ),
];
