# Journal de relecture manuelle — 2026-11-05

La lecture porte sur les paires FR/EN, commandes, manifestes importés, questions et distracteurs, indices et solutions. Les introductions communes sont relues une fois puis leurs intégrations sont vérifiées. Cette lecture n’est pas une exécution Kubernetes. Les captures et interactions navigateur sont consignées séparément ; aucune ligne n’est réputée visuellement acceptée par un simple HTTP 200.

## Passes 1 et 2 — lecture technique et éditoriale

| Chapitre lu intégralement | Contrat examiné et résultat | Suite retenue |
| --- | --- | --- |
| why-kubernetes | Docker vs orchestration, IDs des conteneurs, boucle de nettoyage partiel. Aucun quiz dans ce chapitre. | Corrigé FR/EN : coûts/délais des VM nuancés, SIGTERM distingué d’un crash brutal. |
| architecture | Chaîne API → contrôleurs → scheduler → kubelet, manifest brut, Pod sans scheduler, nettoyage isolé. Aucun quiz. | Corrigé FR/EN : ordre des Events non garanti ; API persistée distincte des Pods disponibles. |
| reconciliation | spec/status, scale du ReplicaSet corrigé par son Deployment, identité du Pod remplacé. Aucun quiz. | Formulation d’idempotence suppose absence de mutations externes ; le schéma reste simplifié. |
| setup-kind | Versions 1.35/0.31, contextes, scratch et k8s-multi avec UID, nettoyage conditionné. Aucun quiz. | Gater les téléchargements avant checksum/install, y compris si un ancien fichier existe. |
| namespaces-contexts | Deux Pods de même nom, portée de namespace, contexte local, trois réponses et solution cohérentes FR/EN. | Création des deux namespaces non chaînée : suite possible après un échec. |
| pods | Phases vs états, runtime/probes, duo/localhost, limites CPU/mémoire, sources YAML et solution. Aucun quiz. | Corrigé FR/EN : un Pod peut retrouver sa readiness ou redémarrer ses conteneurs ; il ne migre pas. Phases du schéma corrigées. |
| deployments | Ownership distinct du sélecteur, budgets, historique, restauration UID avant suppression du Deployment. Aucun quiz. | Le nettoyage final du namespace contourne encore la garde de récupération du défi. |
| services | Service/EndpointSlice/ports, requête interne distincte de port-forward, trois réponses et solution correctes. | Schéma existant suffisant ; garder la limite « une requête ne valide pas tous les réplicas ». |
| labels-selectors | AND et ensembles, annotations non secrètes, trois sélections vérifiées mentalement, solution team=platform cohérente. | Gater la création du namespace avant les créations de Pods. |
| configmaps-secrets | Base64 ≠ chiffrement, injection env vs volume/subPath, patch stratégique par nom, trois réponses correctes. | Gater le bootstrap du namespace ; garder les seules valeurs factices. |
| kubectl-troubleshooting | Diagnostic avant correction, logs précédents conditionnels, patch du propriétaire, trois réponses cohérentes. | Gater la création du namespace avant apply. |
| rollout-strategies | Arrondis surge/unavailable, readiness, délai CLI vs controller, Recreate, challenge capacité, trois réponses. | Corrigé FR : « hors terminaison ». Budgets et limites du schéma de rollout précisés. |
| rollbacks | Révision du template, ConfigMaps externes et données exclues, retour explicite, source Git, trois réponses. | Procédure suppose la révision 1 vérifiée manuellement ; proposer une variable pour la révision observée. |
| resources | Unités, requests, QoS, CPU vs OOM, claim 1000 CPU/1Ti, correction via fichier temporaire, trois réponses. | Pas de mesure CPU réelle ; budgets pédagogiques correctement annoncés. |
| probes | Startup bloque les autres checks, readiness ne redémarre pas, ancien/new ReplicaSet, 24×5 nominal, trois réponses. | Schéma interactif de décisions particulièrement utile. |
| init-sidecars | Ordre init/sidecar, probes et arrêt, fsGroup/montages, solution retire aussi startupProbe, trois réponses. | Timeline startup/app/shutdown livrée le 6 novembre : 5 scénarios ; aucune garantie de livraison distante des logs. |
| storage | WFFC avant consommateur, RWO vs RWOP, PV/PVC, Delete/Retain, remplacement et fichier conservé, trois réponses. | Schéma existant adapté ; durabilité et test sur cluster restent distincts. |
| statefulsets | Ordinaux/DNS/PVC, UID remplacé, rollout décroissant, retention distincte de reclaim, trois réponses. | Garde scale/wait corrigée avec R19. Schéma ordinal, UID et PVC livré le 6 novembre. |
| daemonsets | Effectif éligible, tolérances automatiques, contrôle-plane optionnel, trois réponses. | Garde ciblée ajoutée : UID et clé exacte, retrait global supprimé. |
| jobs | Indexed, retries, deadlines, cron Forbid/UTC, manuel vs planifié, idempotence applicative, trois réponses. | Démo 70 s traverse une minute mais le lancement n’est pas exact ; texte le précise. |
| ingress-gateway | Class/Route/proxy distincts, Host et ports, conditions vs HTTP, trois réponses et challenge Exact. | Garde ajoutée : namespace/release/classe et arrêt à chaque échec. |
| scheduling | Filtres vs score, tolérance ≠ attraction, NoSchedule ≠ éviction, affinité AND/OR, trois réponses. | Garde ajoutée : UID/valeur/resourceVersion, nettoyage indépendant des ajouts réussis. |

La suite complète ci-dessous clôt la lecture des 60 chapitres. Les anomalies ouvertes ne sont pas confondues avec une absence de lecture.

### Suite de la lecture intégrale

Chaque ligne ci-dessous inclut les deux langues, les trois questions (énoncé, chaque option et explication), les deux indices et la solution. Les fichiers affichés par import `?raw` ont été lus dans le contexte du chapitre ; les bibliothèques tierces et l’exécution réelle des fixtures ne font pas partie de cette lecture.

| Chapitre | Contrat examiné | Constat / décision |
| --- | --- | --- |
| dns | FQDN, search/ndots, Service vs headless et client BusyBox | Chemins et résultats cohérents ; éviter une nouvelle figure redondante avec Services. |
| helm-basics | Valeurs, rendu local, namespace et release, upgrade/rollback | Nettoyage uninstall puis namespace non chaîné : R19. |
| network-policies | Isolation ingress/egress, union des allows, AND/OR des sélecteurs, DNS | Prérequis CNI explicite ; schéma à deux permissions livré le 6 novembre, sans promesse de test kindnet. |
| rbac | Role/Binding/ServiceAccount, impersonation, verbes et portée | Trois réponses cohérentes. Graphe des permissions livré. |
| troubleshooting-2 | Images, requests, sélection, ports, DNS et PVC | Panne et réparation parfois dans le même bloc : R20. |
| helm-charts | Helpers, sélecteurs, checksum, valeurs/schema, rendu | Nettoyage non chaîné : R19 ; tableaux de rendu suffisants. |
| helm-releases | Dépendance locale verrouillée, release, valeurs, rollback Helm 4 | Nettoyage non chaîné : R19 ; pas de promesse de rollback des données. |
| kustomize | Base/overlays, générateurs hashés, apply/prune et namespaces | Garde de namespace présente ; pas de moteur template à inventer. |
| gitops | Source épinglée, projet/app Argo, identité Flux, health vs sync, orphan | Création et nettoyage Argo corrigés ici ; promotion du SHA reste une opération manuelle relue. |
| hpa | Usage/request, formule nominale, métriques, stabilisation | Calcul et limites corrects ; conserver le curseur existant. |
| vertical-cluster-scaling | Recommandation VPA Off, capacité réelle, composant cloud distinct | Aucun autoscaler installé par le site ; proposition de schéma statique des trois responsabilités. |
| pdb | Eviction API, 429, disruptionsAllowed, remplacement | Séquence interactive existante pertinente ; aucun drain partagé. |
| ha | Répartition logique, domaines de panne, quorum et readiness | Schéma livré. Les trois nœuds kind partagent un hôte. |
| advanced-scheduling | Spread Honor, affinité, PriorityClass non préemptante, UID | Chaîne cluster-scoped R11 relue ; dépendances de capacité conservées. |
| security-hardening | UID/GID, capabilities, writable paths, non-root NGINX | Le chemin /var/cache/lab/probe est dans le conteneur, pas un fichier manquant du dépôt. |
| pod-security | Admission audit/warn/enforce, version v1.35, legacy Pod | Solution supprime legacy même après attente échouée : R19. |
| rbac-advanced | Agrégation, contributeur, resourceNames, bind/escalate | UID et create R11 relus ; aucune suggestion cluster-admin pour réparer. |
| cni-internals | Attachement CNI vs proxy Service, routage et retour | Pas de remplacement de CNI ; figure de chemin possible mais secondaire. |
| observability | SDK/Collector/Prometheus/Grafana, debug logs/traces, labels et erreurs | Projet Compose fixe avec down --volumes sans propriété : R18. |
| incidents | Sélecteur puis targetPort, preuves avant reprise, chronologie | Bonne séparation causalité/hypothèse ; réutiliser Services. |
| backup-dr | Quiescence, checksum, nouveau PVC, perte post-snapshot | Preuve de copie distincte de sauvegarde globale ; timeline RPO livrée le 6 novembre. |
| api-architecture | Identité UID, resourceVersion, génération, replace Conflict vs patch | Trois réponses correctes. Timeline de conflit et relecture livrée le 6 novembre. |
| controllers-internals | List/watch/cache, coalescence, idempotence, owner UID, statut | Extraits et défi cohérents ; aucun exactly-once fictif. |
| crds | Schéma structurel, CEL nom compatible Service, defaults/status, scope | Propriété de la CRD partagée seulement manuelle : R21. |
| custom-controllers | Reconcile/own/publishStatus réels, génération et readiness, fake client | Attentes non chaînées avant Ready/port-forward : R19 ; fausses preuves évitées dans le texte. |
| operators | Pause/reprise, statut potentiellement périmé, RBAC, GC | Même séquence de génération non bloquante : R19 ; contrat limité correctement décrit. |
| kubebuilder-operator | Types/markers/Makefile/manager, envtest vs fake, image optionnelle | Préparation et compilation non chaînées : R19 ; chemin lab/greeting-operator est un exemple de repo scaffold. |
| admission-webhooks | AdmissionReview UID, TLS/SAN, selectors, Fail, dry-run, retrait avant backend | R12/R14 corrects ; défi répare dans le bloc de panne : R20. |
| api-extension | ConversionReview lot/ordre/identité, size↔replicas, storage vs migration | Préconditions UID et nettoyage gardant le backend relus ; pas de migration prétendue. |
| scheduler-internals | Queue/Filter/Score/Bind, schedulerName non pris en charge, profil non installé | Défi observation/reprise dans le même bloc : R20 ; configuration n’est pas un objet apply. |
| etcd | Quorum, MVCC, snapshot blue→green, bump/compacted, preuve Docker | Fichiers du script affiché relus ; aucun scénario réellement lancé ; nettoyage par marker. |
| cri | Pod UID vs sandbox/container ID, init arrêté, sélection Python stricte | Lecture seule explicitement bornée ; phrase « agent » à remplacer lors de la prochaine révision. |
| cni-advanced | Anti-affinité, remote direct vs Service Local, MTU/segmentation | Chemins de panne plausibles ; succès HTTP ≠ taille d’un paquet IP. |
| csi | RPCs, CSIDriver, snapshotter, quiescence/new PVC/readback, UID DELETE | Le garde et les limites non-CSI kind sont explicites ; pas de test CSI réel. |
| control-plane-scale | Pagination cohérente, token, watch, APF vs PriorityClass, mesures bornées | Ne pas transformer deux snapshots en benchmark ; métriques dépendantes de version. |
| multi-cluster | Kubeconfigs dédiés, UID, A accepté avant B, reprise, cleanup partiel | R9/R10 relus ; aucune bascule de données ou HA physique revendiquée. |
| failure-scenarios | Readiness vs liveness, quota vs surge, PDB vs scale | Défi scale/reprise trop rapproché : R20 ; les pannes restent namespacées. |
| platform-engineering | Validation renderer, JSON List, quotas, image non-root, ownership produit | Contrat volontairement étroit ; prod signifie deux réplicas et non production validée. |

Bilan de lecture : **60/60 chapitres, FR et EN, 162 questions, 120 indices et 147 blocs de solution**. Aucun corrigé de quiz contradictoire avec son cours n’a été identifié. Plusieurs distracteurs sont volontairement très faciles ; leur difficulté pourrait être affinée sans modifier la bonne réponse.

### Pages hors chapitre et composants partagés

- `/` : hero, Beta, liens, quatre niveaux, architecture et reprise de progression relus FR/EN.
- `/academy` : niveau 0 intégral (Linux, terminal, réseau, conteneurs, YAML, outils), niveaux, résumés, durées et liens relus. Suppression de la formulation désuète « autres à venir » ; disponibilité des 60 cours distincte de leur validation sur cluster.
- `/lab` : dix étapes, erreurs/solutions et six fichiers source correspondants relus FR/EN. Étape 08 EN précisée : le tunnel cible un Pod sélectionné par le Service. Le bootstrap local Python et la création kind ne forment pas encore une procédure intégralement protégée (R19).
- `/source-files` : fichiers réels FastAPI, requirements, Dockerfile, namespace, Deployment et Service rapprochés des notices. Limites /ready HTTP 200, root, tags mutables, absence de probes/requests toujours visibles.
- `/k8s-basics`, `/prerequisites` : redirections vers architecture/setup-kind ; aucun contenu pédagogique indépendant.
- 404 générale et chapitre absent : textes FR/EN et lien retour relus. Écran d’erreur runtime : source FR/EN relue ; panne 500 réelle non provoquée.
- Renderers : code littéral/copier/échec, tableaux avec défilement local, liste de références, fieldsets quiz, indices progressifs, solution explicitement révélée, progression et langue hydratées. `Blocks` est réinitialisé par chapitre ; le quiz reste cohérent au changement de langue.

## Passe 3 — inventaire et décisions visuelles

Inventaire de la passe du 5 novembre — douze schémas nommés examinés : architecture, reconcile, vm-vs-container, pod-lifecycle, deployment-tree, service-traffic, persistent-storage, admission-webhook-flow, gitops-reconciliation, autoscaling-feedback, eviction-budget, fleet-promotion. L’architecture apparaît aussi sur l’accueil.

- Livrés dans l’itération précédente et relus : PDB/éviction et promotion A→B, avec branche refus/timeout, lecture/pause/suivant/reset.
- Améliorés ici : rollout Deployment (pause, lecture, suivant, reset localisé, tempo 3,2 s et hypothèse de disponibilité explicite) ; phases Pod (Unknown, Running exact, suppression de fausses flèches linéaires, explication textuelle).
- Conservés : Services/Stockage/Admission/GitOps statiques (relations et légendes correctes), HPA avec curseur et limites, architecture et réconciliation interactives.

| Priorité | Emplacement proposé | Question à résoudre / apprentissage attendu | Forme et décision |
| --- | --- | --- | --- |
| P2 | probes, après le modèle mental | Un échec startup/readiness/liveness redémarre-t-il le conteneur ou retire-t-il seulement le trafic ? | Livré le 6 novembre : trois branches, Lecture/Pause/Suivant/Reset, seuils du manifest et hypothèses explicites. |
| P2 | ingress-gateway, avant les manifests | Pourquoi une Route Accepted peut-elle retourner 503, et un Host différent 404 ? | Livré le 6 novembre : deux voies distinctes et branches 200/404/503 ; backend invalide distingué du backend sans endpoint prêt. |
| P2 | scheduling / scheduler-internals | Pourquoi un score ne sauve-t-il pas un nœud filtré ? | Livré le 6 novembre dans scheduling : candidats → filtres → classement → binding, branche Pending ; StepSequenceDiagram partagé. Pas de duplication dans scheduler-internals. |
| P2 | network-policies | Comment combiner ingress et egress, et OR/AND des peers ? | Livré le 6 novembre : filtres ingress/egress, pairs ET/OU, ports, union additive, verdict et trace en quatre étapes ; modèle comparé à 972 configurations YAML. |
| P3 | init-sidecars | Dans quel ordre commencent init, sidecar et application, puis s’arrêtent-ils ? | Livrée le 6 novembre : 5 scénarios, 24 étapes, attentes/échecs et ordre d’arrêt ; preuves ci-dessous. |
| P3 | statefulsets | Que deviennent le nom, l’UID et le PVC après remplacement de notebook-0 ? | Comparatif statique livré et contrôlé en FR/EN sur mobile et bureau. |
| P3 | api-architecture | Que se passe-t-il quand un remplacement repose sur un objet périmé ? | Timeline 409 et relecture livrée. Les resourceVersion affichés servent d’exemples. |
| P3 | backup-dr / etcd / csi | Quelles écritures survivent au point de reprise ? | Timelines livrées dans backup-dr, etcd et csi. Elles distinguent l’archive de fichier, l’état API et le contenu d’un volume. |
| P3 | observability | Où vont métriques, traces et logs dans cette fixture ? | Graphe statique livré. Deux pipelines distincts aboutissent à la sortie debug du Collector. |
| P3 | ha / multi-cluster | Quels nœuds partagent encore le même domaine de panne ? | Schéma statique livré dans les deux chapitres. Les boîtes hôte, cluster et nœud reprennent la topologie de chaque lab. |
| P3 | rbac / rbac-advanced | Qui reçoit quels verbes dans quelle portée ? | Graphe statique Subject → Binding → Role livré dans les deux chapitres. Agrégation illustrée séparément dans RBAC avancé. |

Pour les autres chapitres : commandes, tableaux de champs et exemples suffisent pour le prochain lot. En particulier ressources, labels, ConfigMaps, Jobs, Helm/Kustomize, Pod Security, plateforme et diagnostics ne nécessitent pas une nouvelle animation par défaut. Les chapitres contrôleurs/Operators réutilisent le modèle de réconciliation ; CRI/CNI/CSI peuvent s’appuyer sur les frontières décrites plutôt que répéter l’architecture générale. Cette décision couvre aussi les cours sans schéma.

## Constats du 5 novembre — corrigés dans le suivi du 6 novembre

Les problèmes de cette section sont des résultats de la relecture, pas une affirmation que tous les labs échouent. Les erreurs prévues pour observation doivent rester séparées des commandes de récupération.

| ID | Priorité | Portée FR/EN et preuve | Impact / action |
| --- | --- | --- | --- |
| R16 | P1 | namespaces-contexts, labels-selectors, configmaps-secrets, kubectl-troubleshooting : `create namespace` suivi de mutations séparées par newline | Un échec de création ne bloque pas la suite collée. Prochain lot : créer avec UID, chaîner le bootstrap, protéger nettoyage et création partielle. |
| R17 | P1 | deployments : dernier bloc `k delete namespace lab-deployments` indépendant de la preuve de reprise R13 | Peut contourner l’arrêt après timeout du défi. Étendre le même contrat de reprise au nettoyage final ou distinguer explicitement abandon et reprise validée. |
| R18 | P1 | observability : projet Compose fixe `k8s-ops-observability` puis `obs down --volumes` | Une pile préexistante peut être reprise puis détruite. Ajouter identité de run et refus de collision sur conteneurs/réseaux/volumes ; tests Docker simulés nécessaires. |
| R19 | P2 | setup-kind téléchargements/checksum/install ; statefulsets scale/wait/delete ; Helm uninstall/delete ; pod-security dry-run/apply/wait/delete ; custom-controllers/operators/Kubebuilder generation-wait/Ready ; lab Python | La dernière commande peut réussir malgré une préparation/attente échouée. Scinder observation et mutation, chaîner les prérequis, tester chaque frontière ; ne pas appliquer un `set -e` global aux échecs pédagogiques attendus. |
| R20 | P2 | troubleshooting-2, admission-webhooks, scheduler-internals, failure-scenarios : plusieurs solutions mélangent panne et reprise dans un bloc | Le collage peut effacer la preuve avant lecture. Séparer injection, diagnostic, acceptation, reprise. |
| R21 | P2 | crds et trois cours Greeting : vérification manuelle de CRD puis `apply`, suppression CRD par nom après inventaire manuel | Partage intentionnel mais propriété non prouvée automatiquement. Concevoir le contrat interchapitres avant de généraliser une garde qui empêcherait leur réutilisation. |
| R22 | P3 | métadonnées des routes hors chapitre en EN ; langue FR connue seulement après hydratation | Contenu visible bilingue, SEO/partage hors cours non entièrement localisé. Une stratégie de routes/langue SSR dépasse la correction ciblée de contenu. |
| R23 | P3 | i18n/progress : accès localStorage non protégé dans certains chemins | Stockage interdit/plein peut casser la sélection ou sauvegarde ; prévoir un mode dégradé explicite et tests dédiés. Aucun changement de clé proposé. |

État historique au 5 novembre (levé par le suivi ci-dessous) : R16–R21 impliquent de nouvelles procédures et leurs matrices de simulation, au-delà des trois gardes demandées en priorité ; ils restent ouverts et visibles. R22 est un choix d’architecture ; R23 est un correctif produit distinct. Les schémas proposés restent différés tant que leurs modèles et branches n’ont pas été relus/testés. Les corrections ciblées effectivement livrées ci-dessus ne sont pas présentées comme une sûreté globale du corpus.

## Références consultées pour les corrections

Le socle documentaire de chaque chapitre reste indexé dans `docs/content-sources.md` et ses fragments. Reconsultation ciblée : [scheduler Kubernetes 1.35](https://v1-35.docs.kubernetes.io/docs/concepts/scheduling-eviction/scheduling-framework/), [DaemonSet 1.35](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/controllers/daemonset/), [matrice Envoy Gateway 1.9](https://gateway.envoyproxy.io/news/releases/matrix/), [suppression Argo CD 3.5](https://argo-cd.readthedocs.io/en/release-3.5/user-guide/app_deletion/), [kubectl patch](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_patch/). La matrice inclut Kubernetes 1.35 / Gateway API 1.6.1 ; cela ne prouve pas l’installation locale. Le JSON Patch du helper teste UID et resourceVersion au serveur ; les vérifications Helm/namespace avant suppression ne sont pas une transaction et exigent l’absence d’administration concurrente du lab.

## Passes 4 et 5 — rendu, interactions et régressions

Le build Worker local a été contrôlé en Chromium en FR et EN à **320 et 1 280 px** : 64 pages de contenu et deux pages 404, soit **264 vues**. Dans chaque chapitre, les indices et solutions ont été ouverts, les quiz soumis, la progression activée au clavier puis relue après rechargement. Les deux redirections historiques ont également été contrôlées. Les captures d’entrée et de contenu ont été parcourues en planches de contact sur les quatre variantes ; les pages modifiées et schémas ont reçu une inspection ciblée en pleine taille. Cette couverture visuelle porte sur les zones capturées, pas sur chaque pixel de chaque longue page.

Le premier passage a trouvé du texte de champs coupé dans Deployments et StatefulSets sur mobile FR/EN. Le renderer permet maintenant le retour à la ligne des identifiants longs. Le second passage des 264 vues ne signale plus de débordement global, de texte hors conteneur selon les sondes du script, d’ancre cassée ou d’erreur JavaScript. Les blocs de code et tableaux conservent leur défilement horizontal local intentionnel. Les noms accessibles de la navigation et du choix de langue sont localisés.

La copie exacte des commandes et l’ouverture des solutions ont été rejouées sur 11 chapitres ciblés dans les quatre variantes. Les séquences PDB et flotte (succès/échec) et le rollout Deployment ont été vérifiés avec lecture/pause/suivant/reset et activation au clavier. Architecture distingue maintenant persistance API et disponibilité, inclut nftables ; Réconciliation décrit une réaction à l’état courant sans prétendre que les contrôleurs ignorent tous les événements. La page débutante nuance désormais la comparaison VM/conteneur dans les deux langues.

### Preuves de validation du 2026-11-05

- `bun run test` : **98 tests / 8 fichiers** réussis. Dont **58 simulations Bash/zsh** des blocs authored de Gateway, DaemonSets, Scheduling et Argo CD dans `src/test/lab-guards.test.ts` : erreurs de lecture (y compris sortie partielle), création, suppression, identité remplacée, timeout/échec Helm et installation partielle. Les appels sont des doublures ; aucun kubectl/Helm réel.
- `bun run test:python` : **62 tests** réussis, dont **11 tests** du helper node-metadata (collision, UID, valeur/effect, conflit de resourceVersion, erreur de lecture/patch, nettoyage répété). Tests du configurateur GitOps mis à jour pour les quatre fichiers générés.
- Scénarios antérieurs R9–R15 : **37 scénarios par shell, 74 exécutions simulées** réussies. Contrôle syntaxique de **506 blocs Bash** en Bash et zsh.
- `bun run check:labs` : **130 fichiers**, dont 96 YAML / 146 documents, 2 JSON, 10 shell et 22 Python ; parsing hors cluster réussi. `bun run check:charts` : rendus Helm/Kustomize locaux réussis, pas de compatibilité runtime revendiquée.
- TypeScript, gate de lint hérité et build SSR/Worker : réussis ; **1 542 diagnostics ESLint hérités** restent gelés, aucun nouveau. Avertissements de bundle volumineux et de bundler toujours présents.
- `bun run test:e2e` : **14 tests** réussis sur le Worker local. Balayage complémentaire : **264 vues, zéro anomalie remontée après correction**, plus les contrôles ciblés ci-dessus. Après le dernier ajustement de traduction VM en EN, build et smoke ciblé why-kubernetes/Deployments/StatefulSets rejoués dans les quatre variantes. Analytics intercepté dans le navigateur pour éviter l’envoi de trafic de test.
- `git diff --check` : réussi. Aucune dépendance ajoutée, clé de progression ou URL de chapitre modifiée.

### Limites conservées

L’état « relu » ne signifie ni « corrigé de tout défaut » ni « exécuté sur Kubernetes ». Les R16–R23 étaient ouverts le 5 novembre ; leur correction est consignée ci-dessous. Pas d’exercice réel, installation de contrôleur, création/suppression de cluster, accès cloud, commit, push ou déploiement. Les tests Go inchangés n’ont pas été relancés dans ce lot. L’écran 500 est relu en source mais non provoqué ; pas d’audit exhaustif avec lecteur d’écran, de Safari/Firefox ni de validation sur téléphone physique. Les contrôles UID de Helm/namespace ne constituent pas une transaction atomique ; les labs supposent un environnement exclusif sans administration concurrente.

Les scripts ponctuels, journaux et captures de cette session sont sous `/tmp/k8s-manual-*` (artefacts temporaires). Les tests de gardes pérennes sont dans le dépôt. La grille `docs/review-passes.md` renvoie à ce journal pour les décisions par chapitre et les constats priorisés.

## Suivi R16–R23 — 2026-11-06

Les huit constats sont corrigés dans le checkout local, sans commit. Cette étape relit les modifications FR/EN et leurs procédures ; elle ne revendique pas une nouvelle lecture intégrale des 60 cours.

| ID | Correction et contrat retenu | Preuve principale |
| --- | --- | --- |
| R16 | namespaces-contexts, labels-selectors, configmaps-secrets et kubectl-troubleshooting : création avec UID, chaîne bloquante, UID enregistré seulement après succès et valeur non vide, nettoyage par namespace original. Deux namespaces créés partiellement peuvent être retirés séparément. | `src/test/review-guards.test.ts` : chaque commande échouée coupe la suite ; UID absent/étranger, lecture refusée et deuxième création échouée. |
| R17 | Le défi invalide son reçu avant injection. Seule la reprise validée puis la suppression réussie du Deployment autorisent le nettoyage final du namespace original. La présence d’un nouveau Deployment bloque ce nettoyage. | Tests de reprise/suppression échouées et reçu absent/étranger ; inspection du code affiché FR/EN. |
| R18 | `lab/level-3/observability/stack.py` réserve un projet UUID, garde un état privé sans mot de passe, vérifie le démon Docker et le jeton des conteneurs/réseaux/volumes. Inventaire par label et par nom pour refuser aussi les collisions sans label. Démarrage partiel inspectable/nettoyable ; `up` ne réutilise pas un projet existant. Configuration validée avant action ; erreur non masquée. | Dix tests Python avec transport Docker simulé ; démarrage shell injecté à chaque frontière ; parsing Compose hors ligne. Aucune pile réellement démarrée. |
| R19 | Les prérequis concernés sont chaînés, sans `set -e` global : téléchargements dans un répertoire temporaire, lecture du checksum explicitement gardée, installation, scale/wait/delete, uninstall/delete, dry-run/apply/Ready, génération Greeting avant Ready et bootstrap Python. Compilation Go utilise `-C`, évitant de laisser le terminal dans un autre dossier après un échec. README du projet contrôleur aligné. | Injections Bash/zsh à chaque commande dans les procédures ciblées, y compris téléchargement/checksum, compilation, génération, attente et venv. Les commandes d’observation après une erreur pédagogique attendue restent distinctes. |
| R20 | Les cinq scénarios de dépannage du niveau 2 et les défis admission/scheduler/failure-scenarios séparent injection, diagnostic, acceptation manuelle et reprise. Le webhook attend le retrait des Pods avant le diagnostic d’indisponibilité. | Vérification des blocs et de leur séparation ; rendu des solutions ouvertes FR/EN. |
| R21 | `lab/scripts/greeting-schema.py` crée une définition absente par `create`, jamais par `apply`. Le reçu commun conserve UID, spec retournée par le serveur et empreinte du fichier. Les autres cours réutilisent seulement cette définition inchangée avec la preuve d’origine. Un reçu partiel ou un changement de schéma/UID arrête la suite. La suppression de CRD disparaît des procédures et du README ; la définition est conservée jusqu’à la fin du cluster dédié. | Sept tests Python : création/réutilisation, objet étranger, UID/spec/source modifiés, définition absente, lecture et création échouées. Aucune admission API ou suppression de CRD réelle. |
| R22 | Paramètre `lang` validé au root, transmis aux métadonnées et au provider SSR. Les routes existantes conservent leurs chemins ; la navigation ajoute/conserve seulement le paramètre, ainsi que l’ancre au changement de langue. L’URL explicite prime sur la préférence locale. Sans paramètre, le SSR reste EN puis reprend la préférence historique après hydratation. | HTML serveur des cinq routes principales/chapitre en FR/EN ; redirection localisée ; métadonnées en navigation/rechargement, préférence contradictoire et ancre testées sur mobile/bureau. Aucun état utilisateur partagé entre requêtes. |
| R23 | Lecture/écriture localStorage protégées, forme de progression validée, aucune écriture de réparation silencieuse au montage. En cas de refus, quota ou JSON invalide, usage en mémoire et message FR/EN visible ; les clés `k8slab.lang` et `k8slab.progress.v1` sont inchangées. | Six tests de composant et E2E avec Storage.getItem/setItem refusés : choix de langue, progression temporaire, navigation et perte annoncée au rechargement. |

### Validation fraîche

- **168 tests applicatifs / 10 fichiers**, dont **64 cas supplémentaires Bash/zsh** avec injections aux frontières des commandes et **6 cas stockage** : réussis. Les 58 cas de gardes précédents restent inclus.
- **79 tests Python**, dont 10 Compose et 7 CRD ajoutés : réussis, transports simulés.
- **134 fichiers de lab** contrôlés hors ligne : 96 YAML / 146 documents, 2 JSON, 10 shell, 26 Python. Syntaxe des **522 blocs Bash** vérifiée en Bash et zsh. Les deux chemins signalés par l’inventaire (`/var/cache/lab/probe` et l’exemple de scaffold `lab/greeting-operator`) restent des faux positifs déjà expliqués.
- Rendus Helm/Kustomize locaux, TypeScript, build SSR/Worker et `git diff --check` : réussis. Avertissements hérités de bundle/bundler maintenus. Gate lint : **12 diagnostics hérités, aucun fichier nouveau à corriger**. Le formatage est limité aux fichiers touchés ; les quatre cours débutants contenaient la majorité des violations anciennes. Les avertissements Fast Refresh des API de contexte colocalisées ont une justification locale, sans désactivation globale.
- **22 tests navigateur** réussis sur le Worker local : contrôles existants de CSP/nonce/Analytics/progression et nouveaux cas SSR/langue/stockage/ancres, desktop et mobile.
- **96 vues ciblées** (20 chapitres + accueil, programme, lab et fichiers source, en FR/EN à 320/1 280 px), solutions ouvertes ; aucune erreur JavaScript ou débordement global signalé. Inspection manuelle des planches d’entrée/nettoyage, des messages de stockage et des détails de commandes. Quatre captures supplémentaires montrent le stockage indisponible. Les captures de détail désactivent l’animation transitoire pour inspecter le texte révélé à son opacité finale. Les longs codes conservent leur défilement horizontal local.

Les artefacts ponctuels sont sous `/tmp/r16-*`. Les tests pérennes ajoutés sont `src/test/review-guards.test.ts`, `src/test/storage-fallback.test.tsx`, `lab/level-3/observability/test_stack.py`, `lab/scripts/test_greeting_schema.py` et `e2e/review-fixes.spec.ts`. Le README contrôleur a été relu et ses commandes analysées, sans compilation Go supplémentaire.

### Limites et références

Ces corrections ne constituent pas une validation sur un vrai cluster ou démon Docker. Les vérifications avant opérations multiressources ne sont pas atomiques : les exercices exigent un environnement réservé sans administrateur concurrent. Perdre un reçu ou modifier une définition partagée exige d’inspecter l’état, pas de fabriquer une nouvelle preuve. La CRD est conservée volontairement entre chapitres. Aucun nouveau schéma, package, commit, push, déploiement ou changement de service externe.

Pour R22, le partage d’une URL `?lang=fr` fournit du FR dès le serveur ; aucun routage par préfixe ni détection serveur d’Accept-Language n’a été introduit. Pas de garantie de référencement ou d’indexation obtenue par ce contrôle local. Inspection visuelle par captures et parcours ciblés, pas audit lecteur d’écran exhaustif ni test sur téléphone physique.

Références primaires reconsultées : [contexte TanStack Router](https://tanstack.com/router/latest/docs/guide/router-context), [SSR TanStack Router](https://tanstack.com/router/latest/docs/guide/ssr), [services Compose](https://docs.docker.com/reference/compose-file/services/), [volumes Compose](https://docs.docker.com/reference/compose-file/volumes), [réseaux Compose](https://docs.docker.com/reference/compose-file/networks/). Les types de la version installée du routeur ont aussi été vérifiés localement.

## Schémas Probes, Gateway et Scheduling — 2026-11-06

Trois schémas ajoutés après le modèle mental des chapitres `probes`, `ingress-gateway` et `scheduling`, avant les commandes de lab. L’inventaire passe à **15 noms typés**. Les scènes et textes bilingues sont séparés dans `src/content/diagrams/decision-sequences.ts` ; le renderer `StepSequenceDiagram` est réutilisé, y compris pour PDB et promotion de flotte.

### Contrat pédagogique et exactitude

- **Probes** : trois scénarios (13 étapes au total), avec démarrage réussi, perte/rétablissement de readiness, échec de liveness et épuisement du budget startup. Les seuils 30/2/3 reprennent le YAML du lab. Le retrait de l’éligibilité au trafic n’est pas un redémarrage ; les probes se relancent après un redémarrage du conteneur, dans le même Pod. Hypothèses : un conteneur, restartPolicy Always, Service normal, pas de readiness gate supplémentaire. Propagation, arrêt et backoff ne sont pas des délais simulés ; aucune coupure instantanée des connexions existantes n’est promise.
- **Gateway** : trois scénarios (10 étapes), configuration contrôleur/proxy distincte du chemin des requêtes, un listener HTTP et une Route. Le Service est une référence de backend, sans imposer le passage réseau par sa ClusterIP. Un mauvais Host donne 404 dans ce modèle ; une Route acceptée peut n’avoir aucun endpoint prêt. Le 503 est un comportement attendu et un SHOULD de Gateway API, pas une garantie universelle ; une référence invalide est distinguée (500). TLS, installation du contrôleur et fourniture d’adresse ne sont pas simulés.
- **Scheduling** : deux scénarios (7 étapes), les deux workers general/reserved du lab. Filtres stricts, puis classement des seuls candidats admissibles ; la toleration autorise sans attirer. Une tentative sans candidat garde le Pod Pending. La préférence ne représente pas un score réel ; les autres règles sont supposées égales. Binding réussi n’implique ni démarrage ni Ready. Pas de simulation des autres plugins, de la concurrence ou de la préemption.

Sources primaires consultées le 6 novembre : [probes Kubernetes 1.35](https://v1-35.docs.kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/), [scheduler Kubernetes 1.35](https://v1-35.docs.kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/), [taints et tolerations](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/), [contrat HTTPRoute Gateway API v1.6.1](https://github.com/kubernetes-sigs/gateway-api/blob/v1.6.1/apis/v1/httproute_types.go). Les fichiers YAML et le défi Scheduling ont été confrontés aux étapes FR/EN.

### Interaction et preuves fraîches

Aucun démarrage automatique. Lecture progresse toutes les 3,2 secondes puis s’arrête ; Pause, sélection d’étape et Suivant arrêtent la lecture ; Reset revient au début de la branche ; changer de scénario arrête et réinitialise. Relancer depuis la fin repart au début. Les états sont décrits en texte et ne dépendent pas de la couleur. Les flèches sont légendées (conséquences, configuration ou décisions HTTP) ; les candidats Scheduling sont juxtaposés, sans fausse flèche réseau.

Les commandes ont été remontées avant la scène après inspection mobile. Cibles tactiles d’au moins 44 px, labels avec retour à la ligne, hypothèses dans un volet natif dépliable, figures nommées, état courant et description textuelle. Aucune animation décorative continue ; la lecture reste une avance discrète explicitement demandée, y compris avec mouvement réduit.

- `bun run test` : **179 tests / 11 fichiers réussis**, dont 11 nouveaux tests des branches FR/EN, minuteur, pause, fin/relecture, reset, changement de scénario, démontage et régression PDB/flotte.
- TypeScript, gate lint et build SSR/Worker réussis. **12 diagnostics lint hérités** restent gelés, aucun nouveau. Les avertissements préexistants de taille du bundle, tsconfig-paths et bundler subsistent. Aucune dépendance ajoutée.
- `bun run test:e2e` : **34 tests réussis**, dont 12 nouveaux cas (3 chapitres × 2 langues × 2 formats). Chaque branche est parcourue, Suivant et Reset sont activés au clavier ; volet d’hypothèses, lecture/pause, état actif, mouvement réduit et absence de débordement vérifiés.
- Contrôle complémentaire à **320×900 et 1 280×900**, FR/EN : **120 états capturés**, zéro erreur JavaScript et zéro débordement global. Inspection visuelle des états finaux des huit branches dans les quatre variantes, avec détails ciblés. Captures isolées : le header sticky est masqué uniquement pendant la prise d’image pour ne pas recouvrir une longue figure ; il reste présent pendant les contrôles de navigation. Un artefact de capture longue tronquait le bas de Scheduling EN ; vérification dans le viewport puis nouvelle capture après défilement sur la description ont confirmé que le texte est intégralement lisible, sans correction du site nécessaire.
- Les suites shell simulées existantes font partie des tests applicatifs, mais aucun lab, Docker ou Kubernetes réel n’a été exécuté. Les tests Python/Go et rendus Helm ne sont pas relancés pour ces ajouts de diagrammes.

Artefacts temporaires : `/tmp/decision-diagrams/`, scripts `/tmp/decision-diagrams-*.cjs` et journaux `/tmp/decision-diagrams-*.log`. Les tests pérennes sont `src/test/decision-sequences.test.tsx` et `e2e/decision-sequences.spec.ts`. Ce contrôle local Chromium ne vaut ni essai sur téléphone physique, ni audit lecteur d’écran exhaustif, ni déploiement. Aucun commit, push ou déploiement.

## Schéma NetworkPolicies — 2026-11-06

Le seizième schéma nommé, `network-policy-decisions`, est inséré après le paragraphe ET/OU de `network-policies`, avant la section egress/DNS. Il répond à la question « cette connexion a-t-elle les deux permissions nécessaires ? ». Le modèle pur (`network-policy-model.ts`), ses textes de séquence (`network-policy-sequence.ts`) et son renderer (`NetworkPolicyDiagram.tsx`) sont séparés. Aucun manifest de lab n’est modifié.

### Modèle et contrôles

- Source sélectionnable dans clients (`team=trusted`), lab-netpol (`team=lab`) ou other (`team=other`), avec `role=trusted-client` ou `role=untrusted-client`. Destination fixe : web, `app=policy-web`, namespace lab-netpol.
- Combinaison des pairs ingress : namespaceSelector ET podSelector dans une entrée ; deux entrées combinées par OU ; podSelector seul. Le dernier reste local au namespace de la politique. Le OU accepte donc tous les Pods de clients OU les seuls trusted de lab-netpol, jamais un trusted de other.
- Connexion TCP 80, TCP 443 ou UDP 80. La règle ingress exige un pair correspondant ET l’un des deux ports TCP ; la règle egress cible namespace lab-netpol ET app=policy-web ET TCP 80. Le protocole fait partie du filtre.
- Chaque direction propose l’absence de politique de base, une liste vide ou une règle ciblée. Une politique ingress supplémentaire avec `ingress: [{}]` démontre l’union additive, y compris avec `ingress: []`. Elle ne contourne pas un egress bloqué. La politique egress générée suit explicitement le namespace et le label de la source choisie.
- Verdict immédiat et trace de quatre étapes via le composant partagé : identité des extrémités, egress, ingress, ET final. Lecture/Pause/Suivant/Reset ; édition d’un paramètre et reset des règles arrêtent et réinitialisent la trace. Le bouton de sélection de scénario est masqué lorsqu’il n’existe qu’un scénario ; les autres schémas conservent leurs choix.
- Le volet logique/YAML expose l’indentation réelle des pairs, les alternatives de ports et les politiques affichées, avec copie via le renderer existant. Les noms accessibles des sélecteurs sont liés explicitement à leurs libellés ; verdict annoncé et explications textuelles indépendantes de la couleur. Contrôles d’au moins 44 px, disposition empilée sur mobile.

### Exactitude et limites

Reconsultation de la [documentation NetworkPolicy Kubernetes 1.35](https://v1-35.docs.kubernetes.io/docs/concepts/services-networking/network-policies/) : isolation directionnelle, union des règles/politiques, ET entre ingress et egress, portée des pairs et autorisation implicite des réponses. Comparaison avec les cinq fichiers YAML du lab, workloads compris. Les namespaces clients/other et TCP 443 sont des extensions pédagogiques affichées, pas une nouvelle topologie réellement créée.

La simulation suppose un CNI appliquant les politiques et leur convergence. Elle porte sur de nouvelles connexions directes entre Pods. DNS, Service/NAT, trafic du nœud/hostNetwork, autres contrôles de sécurité et connexions déjà établies sont exclus. Un verdict autorisé ne teste ni écoute applicative ni connectivité réelle. Le kindnet par défaut ne suffit toujours pas à démontrer l’application des politiques.

### Preuves du lot

- **202 tests applicatifs / 12 fichiers réussis**, dont **23 nouveaux cas** : 18 cas de vérité des pairs, matrice directionnelle, ports/protocole, cohérence exhaustive du modèle/YAML et interactions FR/EN.
- Le test exhaustif couvre **972 combinaisons**. Le YAML émis est parsé par Bun, puis évalué par un interpréteur de test distinct fondé sur la sélection de politiques et les listes de règles. Les verdicts de chaque direction et le verdict combiné concordent. Cela valide le sous-ensemble du schéma, pas la conformité complète d’un CNI ou de l’API Kubernetes.
- TypeScript, gate lint (**12 diagnostics hérités, aucun nouveau fichier à corriger**), build SSR/Worker et `git diff --check` réussis. Avertissements de bundle/bundler existants conservés ; aucune dépendance ajoutée.
- **38 tests navigateur réussis** sur le Worker local, dont quatre nouveaux cas FR/EN desktop/mobile : pairs ET/OU et portée locale, ports/protocole, deux directions, union additive, YAML, clavier, lecture/pause/suivant/reset et bascule de langue. La première tentative a révélé un ciblage ambigu des labels implicites par le test navigateur ; les champs ont reçu des associations explicites via aria-labelledby, puis la suite a été rejouée.
- **48 états ciblés** parcourus et capturés (12 configurations × FR/EN × 320×900 et 1 280×900), plus 12 captures des contrôles, YAML et hypothèses. Aucun débordement global ni erreur JavaScript. Inspection représentative des quatre variantes, états autorisés/refusés, code et limites. Les longs blocs YAML gardent leur défilement horizontal local. Le header sticky est masqué uniquement dans les captures isolées de figures, pas pendant la navigation.

Artefacts temporaires : `/tmp/network-policy-visual/`, `/tmp/network-policy-visual.cjs` et `/tmp/network-policy-*.log`. Tests pérennes : `src/test/network-policy.test.tsx` et `e2e/network-policy.spec.ts`. Le contrôle local Chromium n’est ni un test sur téléphone physique ni un audit lecteur d’écran exhaustif. Les suites Python/Go et fixtures inchangées ne sont pas relancées ; aucun cluster/CNI, lab réel, commit, push ou déploiement.


## Timeline Init containers et Sidecars — 2026-11-06

Le dix-septième schéma nommé, `init-sidecar-timeline`, est placé après la note startup/readiness/arrêt de `init-sidecars`, avant la préparation du lab. Les données bilingues sont séparées du renderer ; le composant partagé `StepSequenceDiagram` reçoit un tableau optionnel. Le manifest, les quiz, les solutions et les commandes du lab sont inchangés.

### Scénarios et exactitude

| Scénario | Étapes | Contrat illustré |
| --- | --- | --- |
| Lab : démarrage et arrêt | 7 | `seed-page` doit terminer avec code 0 ; `access-log` doit réussir sa startupProbe avant `web` ; l’arrêt du sidecar suit celui de web. |
| Init classique en échec | 4 | Le restartPolicy du Pod vaut Always par défaut ; l’init est retenté, les autres conteneurs attendent. La fin du schéma n’est pas une limite de tentatives Kubernetes. |
| Startup du sidecar en échec | 5 | Variante à probe mal configurée, processus tail toujours actif : dix échecs consécutifs entraînent arrêt/reprise du sidecar ; web ne démarre pas. L’init déjà terminé et emptyDir subsistent dans ce redémarrage de conteneur. |
| Compagnon devenu init classique | 3 | Retirer à la fois restartPolicy Always et startupProbe transforme le compagnon en init classique ; tail ne termine pas et empêche web de démarrer. |
| Arrêt de deux sidecars | 5 | Extension fictive : A puis B déclarés ; web s’arrête, puis B, puis A. Le lab réel ne contient qu’un sidecar. |

Sources primaires reconsultées : [sidecars Kubernetes 1.35](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/) et [init containers Kubernetes 1.35](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/pods/init-containers/). Comparaison avec `lab/level-2/init-sidecars/web.yaml`, y compris les noms, ordre, probe de fichier, seuil 10, période 1 seconde et absence de readinessProbe du sidecar. La réussite de startup ouvre le démarrage de l’application ; l’étape qui les sépare n’impose aucune attente réelle. Une readinessProbe de sidecar, si ajoutée, contribue à Ready du Pod ; elle ne remplace pas cette barrière de startup.

Les colonnes représentent des états logiques des conteneurs, pas des durées ni des phases du Pod. Images, montages et scheduling sont supposés réussis. L’arrêt modélisé correspond à la suppression normale du Pod, avec assez de temps de grâce ; une panne du seul processus web n’est pas cette procédure. Le budget de grâce est commun : son expiration peut forcer les arrêts, sans délai complet supplémentaire par sidecar ni garantie de vidage/livraison des logs. emptyDir survit aux redémarrages de conteneurs, pas au retrait du Pod. Crash hôte, livraison distante et reprise après panne restent hors modèle.

### Interaction et preuves fraîches

- Lecture/Pause/Suivant/Reset reprennent le comportement partagé : pas de lecture automatique, avance toutes les 3,2 secondes, arrêt à la fin, reprise depuis le début, pause lors de la sélection d’une étape et réinitialisation au changement de scénario. La sélection d’une colonne au clavier ou à la souris choisit aussi l’étape et suspend la lecture.
- Tableau nommé, en-têtes de ligne/colonne, états lisibles sans couleur, légende complète et résumé courant. Noms des conteneurs fixes lors du défilement horizontal local ; contrôles d’au moins 44 px. Les explications complètes restent sous la timeline sur mobile. Hypothèses dépliables FR/EN ; le changement de langue conserve l’étape.
- **208 tests applicatifs / 13 fichiers réussis**, dont six nouveaux tests : comparaison au YAML réel parsé, invariants de démarrage/échec/arrêt, toutes les branches et cellules FR/EN, sélection des colonnes et minuteur. Les tests existants des autres séquences et simulations shell sont également passés.
- TypeScript, gate lint (**12 diagnostics hérités, aucun nouveau fichier à corriger**), build SSR/Worker et contrôle des espaces du diff réussis. Avertissements de bundle/bundler préexistants ; aucune dépendance ajoutée.
- **46 tests navigateur réussis**, dont huit nouveaux cas : cinq branches parcourues dans les deux langues et deux formats, commandes de lecture, clavier, bascule de langue, sélection de colonne, défilement local à 320 px et absence de débordement global. Analytics est simulé, aucune collecte réelle des tests.
- **96 états capturés** à 320×900 et 1 280×900 (24 étapes × deux langues × deux formats), plus huit captures du viewport/hypothèses. Zéro erreur JavaScript et zéro débordement global sur le parcours final. Inspection représentative des cinq scénarios : fin nominale FR mobile, échec init EN bureau, reprise startup FR mobile, init infini EN mobile, arrêt inverse FR/EN bureau, hypothèses et contexte de page.
- La première vérification à 320 px a révélé que les textes accessibles absolus du tableau débordaient jusqu’à 490 px. Une expérience locale a isolé l’absence d’ancêtre positionné ; le wrapper du tableau est désormais relatif. La suite complète et les captures ont été rejouées après correction. Le tableau garde son défilement local intentionnel, sans masquer un débordement global.
- Une capture longue isolée du scénario d’arrêt EN tronquait latéralement quelques textes ; un contrôle supplémentaire dans le viewport réel montre intégralement le tableau, les cartes et l’explication, avec scrollX 0 et largeur document/viewport 1 280 px. Il s’agit d’un artefact de capture longue, pas d’un défaut reproduit dans le viewport. Le header sticky n’est masqué que pendant les captures isolées, pas lors des contrôles de navigation.

Artefacts temporaires : `/tmp/init-sidecar-visual/`, `/tmp/init-sidecar-visual.cjs`, `/tmp/init-sidecar-final-view.cjs` et `/tmp/init-sidecar-*.log`. Tests pérennes : `src/test/init-sidecar-timeline.test.tsx`, `e2e/init-sidecar-timeline.spec.ts` et extension de `e2e/decision-sequences.spec.ts`. Chromium local ne vaut ni essai sur téléphone physique ni audit lecteur d’écran exhaustif. Les fixtures et suites Python/Go inchangées ne sont pas rejouées. Aucun lab Docker/Kubernetes réel, commit, push ou déploiement.


## Schéma StatefulSets — 2026-11-06

`statefulset-identity` suit le modèle mental de `/learn/statefulsets`, avant le lab. La figure compare deux objets Pod successifs à l’ordinal 0. A et B représentent les UID distincts attribués par Kubernetes. La flèche indique une référence au même PVC dans le namespace `lab-stateful`. Le PVC est représenté une seule fois. La lecture de `/data/identity.txt` dépend de la liaison conservée au PV et de l’accessibilité du stockage.

Vérification contre le manifest `lab/level-2/statefulsets/notebook.yaml` et l’exercice qui remplace `notebook-0`. Le template `data` donne le PVC `data-notebook-0`. Le conteneur monte le volume sur `/data` et crée `identity.txt` uniquement si le fichier est absent. Références primaires consultées : [identité et stockage des StatefulSets](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/controllers/statefulset/#pod-identity), [UID des objets](https://v1-35.docs.kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids) et [nommage des PVC dans le contrôleur 1.35.0](https://github.com/kubernetes/kubernetes/blob/v1.35.0/pkg/controller/statefulset/stateful_set_utils.go#L100-L108).

Contrôle Chromium sur le build SSR/Worker local avec analytics intercepté. Les quatre captures FR/EN à 320×900 et 1 280×900 ont été inspectées. Figure nommée et présente en SSR, ordre des cartes, PVC unique, lisibilité, absence de débordement et d’erreur JavaScript, changement de langue au clavier et rechargement vérifiés. Captures dans `/tmp/statefulset-identity-visual/`. Le contrôle porte sur le navigateur local.

Bun 1.4.2. Les 208 tests applicatifs, TypeScript, le contrôle lint (12 diagnostics hérités gelés), le build SSR/Worker, les 46 tests navigateur et `git diff --check` passent. Les avertissements de bundle et de bundler préexistants subsistent. Aucun exercice Kubernetes réel, commit, push ou déploiement.


## Timeline Architecture de l’API — 2026-11-06

`api-conflict-timeline` suit l’exercice de remplacement périmé et précède la section sur les watches. Six étapes montrent côte à côte la vue du client, la ConfigMap stockée et la réponse API. Les quatre premières suivent la ConfigMap `counter` dans `lab-api` et les commandes du chapitre. Le PATCH intermédiaire écrit `two`, le PUT avec la copie périmée reçoit `409 Conflict`, puis un GET relit `two` et le jeton courant.

Les deux dernières étapes prolongent le lab avec une annotation illustrative `reviewed: "true"`. La modification est préparée à partir de l’objet relu, conserve `data.value: two` et renvoie le jeton reçu sans le modifier. La réussite suppose que la version corresponde encore et que la requête soit par ailleurs valide. Un nouveau conflit demande une nouvelle lecture et une décision sur la modification. Les jetons 7, 8 et 12 illustrent des révisions, sans calcul de la version suivante. Exactitude confrontée au manifest `lab/level-4/api-architecture/counter.yaml`, aux [concepts API de Kubernetes 1.35](https://v1-35.docs.kubernetes.io/docs/reference/using-api/api-concepts/#updates-to-existing-resources) et à [RetryOnConflict dans client-go](https://github.com/kubernetes/client-go/blob/v0.35.0/util/retry/util.go#L62-L89).

Contrôle sur le Worker local avec analytics intercepté. Les quatre configurations FR/EN à 320×900 et 1 280×900 ont parcouru les six étapes, soit 24 états capturés. Vérifications ciblées du contenu SSR, des valeurs client/serveur, des statuts HTTP illustrés, de la disposition, de l’absence de débordement et d’erreur JavaScript. Inspection représentative dans les quatre configurations, avec six captures de détails supplémentaires après défilement mobile. Captures dans `/tmp/api-conflict-visual/`.

Bun 1.4.2. Les 208 tests applicatifs, TypeScript, le contrôle lint (12 diagnostics hérités gelés), le build SSR/Worker et les 50 tests navigateur passent. Quatre cas E2E ajoutés couvrent les étapes et les commandes de lecture, dont l’avance au clavier, la pause et la remise à zéro. Les avertissements de build préexistants subsistent. Aucun exercice sur un cluster réel, commit, push ou déploiement.


## Timeline Sauvegarde et reprise — 2026-11-06

Le schéma `backup-recovery-timeline` suit l’exercice de restauration, avant le diagnostic. Il reprend les fichiers du lab. Capture du fichier sans écriture concurrente dans `orders.tar`, ajout d’A003 à la source (3 commandes, total 55), validation de l’archive avant contact avec la cible, extraction dans un PVC séparé et vérification du fichier (2 commandes, total 30). Le total restauré et l’absence d’A003 matérialisent le point de reprise. L’archive locale et les deux PVC restent dans le domaine de panne de l’hôte. [Documentation Kubernetes 1.35 sur les snapshots CSI](https://v1-35.docs.kubernetes.io/docs/concepts/storage/volume-snapshots/).

Le Worker local a servi les deux langues en SSR. Les contrôles Chromium ont parcouru 24 états et vérifié les totaux des trois cartes, la disposition et l’absence de débordement ou d’erreur JavaScript. Quatre variantes à 320×900 et 1 280×900 inspectées sur des captures représentatives. Contrôle complémentaire des explications après défilement sur mobile. Analytics intercepté. Captures dans `/tmp/backup-recovery-visual/`. Aucun exercice sur cluster réel.

Bun 1.4.2. Les 208 tests applicatifs, TypeScript, le contrôle lint, le build SSR/Worker et les 54 tests navigateur passent. Quatre cas E2E couvrent la timeline dans les deux langues et formats, avec Lecture, Pause, Suivant au clavier et retour au début.


## Graphe Observabilité — 2026-11-06

`observability-flow` est inséré après l’explication du SDK et du Collector. Les trois signaux entrent via OTLP/HTTP sur 4318 et passent par memory_limiter puis batch. Prometheus collecte `collector:8889/metrics` toutes les cinq secondes et Grafana interroge Prometheus. Les branches traces et logs partagent l’exporter debug et aboutissent aux logs du Collector, sans backend durable interrogeable. Vérifié contre `app.py`, `collector.yaml`, `prometheus.yaml`, `grafana-datasource.yaml` et `compose.yaml`. [Configuration OpenTelemetry Collector](https://opentelemetry.io/docs/collector/configuration/).

Contrôle Chromium sur le Worker local avec analytics intercepté. Présence du graphe en SSR, destinations des trois branches, disposition et absence de débordement contrôlées dans les quatre variantes FR/EN à 320×900 et 1 280×900. Quatre captures inspectées dans `/tmp/observability-visual/`. Aucune pile Compose lancée.

Bun 1.4.2. Les 208 tests applicatifs, TypeScript, le contrôle lint, le build SSR/Worker et les 54 tests navigateur passent.


## Domaines de panne — Haute disponibilité et Multi-cluster — 2026-11-06

Le composant partagé place les nœuds dans leur cluster, puis les clusters dans l’hôte Docker partagé. La variante HA reprend `lab/kind.yaml` et `lab/README.md` avec un control plane et deux workers. La variante Multi-cluster reprend les clusters locaux `fleet-a` et `fleet-b` à un nœud chacun. Les légendes distinguent les conséquences possibles d’une panne de worker, de cluster ou de l’hôte. [Configuration kind](https://kind.sigs.k8s.io/docs/user/configuration/).

Vérification SSR et Chromium du build local. Les noms et l’imbrication de chaque nœud ont été contrôlés dans les deux chapitres, en FR/EN à 320×900 et 1 280×900. Les huit captures ont été inspectées dans `/tmp/failure-domains-visual/`. Aucun débordement ni erreur JavaScript. Analytics intercepté. Aucun cluster lancé ni test de panne réel.

Bun 1.4.2. Les 208 tests applicatifs, TypeScript, le contrôle lint, le build SSR/Worker et les 54 tests navigateur passent.


## Portée RBAC et agrégation — 2026-11-06

Le graphe partagé reprend les manifests `lab/level-2/rbac/access.yaml` et `lab/level-3/rbac-advanced/access.yaml`. Les chemins comparent un RoleBinding vers un Role, un RoleBinding vers un ClusterRole et un ClusterRoleBinding illustratif qui accorde les mêmes verbes sur les Pods dans tous les namespaces. Le graphe avancé sépare l’union des règles des contributeurs `lab-ops-pod-observer` et `lab-ops-config-observer` de l’attribution via `RoleBinding observer`. La contrainte `resourceNames` du contributeur facultatif reste visible. [Référence Kubernetes 1.35 sur RBAC](https://v1-35.docs.kubernetes.io/docs/reference/access-authn-authz/rbac/).

Les huit vues de page ont été contrôlées dans Chromium sur le Worker local avec analytics intercepté. Vérification SSR, relations et portée, présence du graphe distinct uniquement dans le chapitre avancé et absence de débordement. Douze captures produites et inspection représentative des graphes dans les deux langues et formats. Captures dans `/tmp/rbac-diagrams-visual/`. Aucun exercice sur un cluster réel.

Bun 1.4.2. Les 208 tests applicatifs, TypeScript, le contrôle lint, le build SSR/Worker et les 54 tests navigateur passent.


## Timelines de snapshot etcd et CSI — 2026-11-06

La timeline etcd suit `lab/level-4/etcd/isolated-recovery.sh`. Le lab utilise une clé synthétique dans un magasin indépendant. La légende relie le modèle à l’état API stocké dans etcd et distingue les objets PVC des octets de volumes externes. La restauration vérifie le hash et prépare un nouveau cluster logique. L’augmentation de révision et la compaction concernent les caches watch. [Guide de récupération etcd 3.6](https://etcd.io/docs/v3.6/op-guide/recovery/).

La timeline CSI suit `lab/level-4/csi/snapshot-cycle.sh` avec pilote, contrôleurs et classes compatibles. Le PVC source `source-data` alimente `source-snapshot`. Après `readyToUse`, le PVC `restored-data` référence le snapshot via `dataSource`. Le Pod `reader` lit le marqueur depuis le volume restauré. Ce parcours restaure les octets d’un volume. [Snapshots de volume dans Kubernetes 1.35](https://v1-35.docs.kubernetes.io/docs/concepts/storage/volume-snapshots/).

SSR et Chromium vérifiés sur le Worker local avec analytics intercepté. Cinq étapes × deux chapitres × deux langues × deux formats, soit 40 états sans débordement ni erreur JavaScript. Captures représentatives inspectées pour chaque configuration et vérifications du texte après défilement mobile. Captures dans `/tmp/storage-snapshot-visual/`. Aucun lab etcd ou CSI réellement exécuté.

Bun 1.4.2. Les 208 tests applicatifs, TypeScript, le contrôle lint, le build SSR/Worker et les 62 tests navigateur passent. Huit cas E2E supplémentaires couvrent la lecture, la pause, l’avance au clavier et la remise à zéro des deux timelines en FR/EN.


## Dernière passe FR/EN — 2026-11-06

Le [suivi de la dernière passe](review-passes.md#dernière-passe-fren--2026-11-06) consigne la matrice des 27 schémas et les constats F1–F6. Le corpus du build contient 60 chapitres, 3 090 paires de textes non vides et 162 questions. L’audit des références n’a trouvé ni identifiant de chapitre manquant ni prérequis après le chapitre concerné. Aucun doublon d’option par langue. Chaque position de bonne réponse est utilisée 54 fois. Les différences numériques signalées par la comparaison FR/EN ont été relues (espacement des unités et nombres écrits en lettres).

Chromium local, analytics intercepté. En FR/EN à 320×900 et 1 280×900, 264 vues avec relevé du statut, de la langue, du titre, des ancres internes, des indices/solutions ouverts et du débordement. Huit redirections contrôlées séparément. 112 captures d’insertions de schémas réparties sur sept planches, puis contrôles en taille réelle sur les zones ciblées. Les captures de figures masquent le header uniquement pendant la prise d’image. Les régressions Playwright couvrent les contrôles des timelines récentes et NetworkPolicies. Un contrôle complémentaire rejoue Architecture, Déploiements, HPA, Réconciliation, les deux branches PDB et les deux branches de promotion de flotte dans les quatre configurations.

Artefacts dans `/tmp/academy-final-review/` (mesures par page, captures, planches et journal de réconciliation FR). Les résultats du build et des tests de cette passe sont dans `/tmp/academy-final-build.log` et `/tmp/academy-final-e2e.log`. Cette passe transversale s’appuie sur la lecture intégrale déjà documentée. Les tests locaux ne constituent pas un exercice sur cluster, une mesure de performance réseau ni une validation sur téléphone physique.


## Suivi F1–F6 — 2026-11-06

F1 retire l’import du cursus complet de l’accueil, du programme et du lecteur. Le catalogue généré contient les titres, résumés, niveaux, durées et indicateurs de disponibilité. `bun run generate:catalog` le régénère après modification de ces métadonnées. Le test de parité compare les 60 entrées et les 60 modules chargés par le lecteur avec les sources. Les URL, l’ordre, les données de progression et la 404 de chapitre sont couverts par les contrôles. Mesures et méthode dans la grille. Relevés bruts locaux dans `/tmp/academy-f1-before.json` et `/tmp/academy-f1-after.json`.

Les états du journal de Réconciliation sont traduits à l’affichage, ce qui préserve la langue des événements déjà produits après une bascule FR/EN. Les commandes tactiles corrigées ont été mesurées et activées. La nouvelle position du texte courant a été vérifiée sur Init/Sidecars, Gateway et CSI. Les branches mobiles RBAC et Observabilité ont été ouvertes au clavier, une à la fois. Les trois quiz retouchés ont été soumis avec les bonnes réponses par libellé et donnent 3/3 dans les quatre configurations. Les 264 vues du parcours et les deux redirections dans les quatre configurations ont été rejouées. Captures et contrôles ciblés dans `/tmp/academy-f2-f6/`. Mesures par page dans `/tmp/academy-f1-f6-sweep/results.json`.

Bun 1.4.2, build Worker local, 209 tests applicatifs, 62 tests navigateur, TypeScript et contrôle lint réussis. Les 12 diagnostics lint hérités restent gelés. Aucun exercice sur cluster réel, commit ni déploiement.
