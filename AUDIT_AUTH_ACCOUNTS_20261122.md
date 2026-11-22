# PURAMA Template — authentification, administration et demandes de suppression

État du 22 novembre 2026 : **PASS pour les contrôles locaux décrits ; PARTIEL pour l’application et son intégration réelle.**

## Référence

Le lot part du commit `493ec577771f671a03795897a71112d099039167` de `main`, arbre `73f6b04df8385fb3ba9fd23e119c910cf64ce1ee`. Les 117 fichiers de cet instantané ont été vérifiés par empreinte avant modification. Les identités, placeholders du modèle, versions métier et règles économiques ne sont pas réinventés.

## Changements

### Connexion et cookies

Le groupe de routes `(auth)` ne crée pas de segment d’URL. Le callback existant `/callback` possède maintenant un alias `/auth/callback`, qui réexporte le même handler. Les liens d’inscription et de récupération passent par cet échange de session. Les pages de récupération et les pages légales sont accessibles sans session.

La destination après connexion doit rester un chemin local sûr. Les URL externes, chemins réseau, contrôles, antislashs et encodages ambigus sont refusés. Les erreurs du fournisseur ou de l’échange de code produisent un retour récupérable à la connexion, avec une destination locale conservée et sans mise en cache.

Le middleware transmet les nouveaux cookies au navigateur **et** à la requête utilisée par le rendu serveur. Les options de cookies et les en-têtes de cache du SDK sont conservés, y compris à travers une redirection et plusieurs appels `setAll`.

### Formulaires et cycle de vie

Un verrou synchrone commun aux quatre formulaires empêche les doubles soumissions et la concurrence entre OAuth et mot de passe. Un rejet réseau ou une erreur du SDK rend le formulaire réessayable, avec un message visible. Une réponse reçue après démontage ne produit plus de navigation tardive. Le verrou reste actif pendant une navigation réussie.

Les confirmations reprennent l’adresse effectivement soumise, même si le champ a changé pendant l’attente. Une inscription renvoyant une session valide poursuit vers le tableau de bord. Les mots de passe sont conservés tels que saisis. Les labels et messages d’erreur sont associés aux champs et accessibles.

Le hook réutilisable `useAuth` s’abonne avant la lecture initiale, privilégie les événements d’authentification récents et ignore les anciens cycles d’effet après démontage ou StrictMode. Il est testé comme unité : `Header.tsx` le consomme, mais aucun rendu de ce Header dans les routes actuelles n’est établi.

### Administration

Les contrôles HTTP appliquent l’identité `SUPER_ADMIN_EMAIL` déjà établie par le layout, les API et les constantes du dépôt. Ils utilisent une identité vérifiée par `auth.getUser()`, sans fallback sur un flag de profil, des métadonnées utilisateur ou une variable publique. Une vérification impossible refuse l’accès.

Chaque page administrateur vérifie l’accès avant de construire son client de service. Les réponses JSON administrateur sont privées et non stockables. Aucun compte n’est promu, aucun rôle en base n’est migré et aucun nouvel administrateur n’est défini.

### Demandes de suppression

La migration additive horodate les nouvelles demandes côté serveur. Une répétition conserve la date initiale ; une annulation l’efface et une nouvelle demande redémarre le délai. Les dates fournies par le client sont ignorées et les demandes historiques sans date ne sont pas artificiellement antidatées.

Le cron compte uniquement les demandes âgées d’au moins 30 fois 24 heures, délai déjà prévu par le code antérieur. Une erreur de base n’est plus interprétée comme une absence de travail. La route ne supprime plus une identité `auth.users` commune à partir du seul flag d’un profil local : une demande éligible retourne 503 tant que le service central coordonné n’est pas qualifié. **La suppression globale reste donc PARTIELLE/BLOQUÉE**, sans effacement réel effectué par ce lot.

### Vérifications de compilation

La projection partielle des utilisateurs n’est plus annotée comme un profil complet, ce qui corrige une erreur TypeScript réelle. L’ancienne option Next vide et non reconnue a été retirée. Les arguments et variables inutilisés ont été supprimés. L’avatar utilise le composant Image avec dimensions explicites et transfert direct de la même image, sans imposer un nouveau service d’optimisation.

## Qualification et commandes

Les suites exécutent les véritables modules TypeScript, les réponses Next, les composants React et les événements DOM. Les appels d’authentification, de base et le routeur sont simulés à leurs frontières. Les tests SQL utilisent PGlite 0.5.17 en mémoire, avec contrôles négatifs et opérations légitimes.

Le détail reproductible des suites se trouve dans [test/README.md](test/README.md). Les tests DOM demandent jsdom ; les tests de migration demandent PGlite. Ils peuvent être fournis par `JSDOM_MODULE_PATH` et `PGLITE_MODULE_PATH`, sans installation dans le graphe applicatif. Une dépendance de test absente fait échouer le lancement ; aucun test n’est silencieusement ignoré.

Le runtime local réutilisé diffère partiellement du lock : Next 16.2.11 et TypeScript 5.9.3 correspondent ; React/ReactDOM 19.2.4 au lieu de 19.2.6, Supabase SSR 0.10.0 au lieu de 0.10.3, Supabase JS 2.101.1 au lieu de 2.106.2, Tailwind 3.4.17 au lieu de 3.4.19, Autoprefixer 10.4.21 au lieu de 10.5.0 et Resend 6.22.0 au lieu de 4.8.0 ont été utilisés. Le lock et les dépendances directes restent inchangés. **Ce résultat ne certifie pas une installation propre du verrou.**

## Résultats finaux du candidat

| Contrôle | Résultat |
|---|---|
| Routage, middleware, cookies et callbacks | 58/58 PASS |
| Identité et frontières administrateur | 56/56 PASS |
| Quatre formulaires React/DOM | 37/37 PASS |
| Hook de session | 6/6 PASS |
| Cron de suppression et migration SQL | 33/33 PASS, dont 10 scénarios SQL |
| Exécution regroupée exacte | **190/190 PASS**, zéro échec ou saut |
| TypeScript global | PASS, sans émission et sans cache incrémental |
| ESLint global | PASS avec `--max-warnings 0`, règles conservées |
| Compilation finale après le lot administrateur | **PASS, 47/47 pages**, Next 16.2.11 avec `next build --webpack`, configuration synthétique |
| Diff et intégrité | PASS ; source applicative inchangée pendant la compilation |
| Navigateur natif mobile/ordinateur | **NON TESTÉ** : Chromium échoue avant toute page sur la création d’un socket Unix (`Operation not permitted`, SIGABRT) |

Le serveur Next local du build précédent a démarré et a été arrêté proprement lors de la tentative navigateur. Aucun parcours UI n’a été exécuté par Chromium, aucune requête fournisseur ni capture n’a été produite. Ce résultat n’est pas assimilé aux tests DOM. Le build final a ensuite été rejoué sur les dernières sources administrateur.

Des contrepreuves sont conservées : 37 échecs sur les 49 premiers scénarios de routage, neuf nouveaux scénarios de cookies/cache également en échec avant correction, 32/37 échecs de formulaires, 6/6 échecs du hook, 51/56 échecs administrateur et 15/23 échecs du cron initial. Les tests ne se limitent pas à une vérification de chaînes de source.

Le build conserve les avertissements de convention middleware dépréciée, de sérialisation du cache webpack et de génération statique désactivée pour une route Edge. La compilation réussie n’est pas présentée comme une mesure de latence ou une validation de service réel.

## Limites d’intégration à conserver

- Le schéma fourni utilise `super_admin`, tandis que certains types et projections de données attendent `is_super_admin`. Le contrôle HTTP ne dépend plus de ces flags, mais la divergence des données n’est pas migrée.
- La politique historique de lecture administrateur de `profiles` se référence elle-même. Une lecture de profil sous rôle limité reproduit la récursion `42P17`. Le schéma ne protège pas spécifiquement la modification du flag `super_admin`. Aucune élévation effective n’est revendiquée ; la récursion et le contrat de rôles doivent être traités ensemble après qualification du schéma réel.
- Des colonnes et tables attendues par les écrans administrateur et financiers sont absentes du bootstrap. Un build et des fixtures ne prouvent pas l’existence de ces données en service.
- Les tests de suppression reconstruisent une politique RLS de profil explicite ; ils ne qualifient pas toutes les politiques du bootstrap.
- Le service central de suppression doit traiter les données liées, annulations, reprises et résultats sur une base propriétaire confirmée avant activation.
- Authentification Supabase réelle, réception d’email, consentement Google, paiements, parcours multi-applications, appareils, charge et endurance restent à qualifier.

Aucune migration de production, identité réelle, opération financière ou mise en ligne n’a été réalisée. La branche `fix/template-auth-account-guards-20261122` est une branche de revue, dont le déploiement automatique Vercel est désactivé uniquement pour cette branche. Les demandes de validation de conception déjà satisfaites ne sont pas réintroduites.
