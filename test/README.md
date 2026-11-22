# Tests d’authentification

Les tests chargent les vrais modules TypeScript et les vrais composants React. Les frontières Supabase et Next router sont simulées ; aucun compte ni service de production n’est appelé. Le routage utilise les objets réels NextRequest et NextResponse. Les formulaires sont montés dans React/DOM et reçoivent de vrais événements input, submit et click.

```sh
node --test test/auth-routing.test.mjs test/admin-access.test.mjs
node --test test/auth-forms.test.mjs test/auth-state.test.mjs
```

## Runtime DOM externe

Les deux suites DOM nécessitent **jsdom** dans l’environnement de test. Le helper cherche d’abord le package installé accessible au projet, ou utilise `JSDOM_MODULE_PATH` si cette variable est fournie. Cette variable doit désigner le répertoire du package jsdom ou un module compatible ; aucun chemin de workspace n’est codé dans les tests.

```sh
JSDOM_MODULE_PATH=/chemin/vers/node_modules/jsdom node --test test/auth-forms.test.mjs test/auth-state.test.mjs
```

Qualification locale observée : jsdom **29.0.2**, React et ReactDOM **19.2.4**, Node **24.22.3**. Le runtime a été réemployé depuis un environnement déjà disponible. Aucun package ni lockfile n’a été modifié pour ces tests. Ce résultat ne qualifie pas un `npm ci` exact : le lock du projet déclare notamment React **19.2.6**, et les écarts complets d’environnement sont consignés avec les preuves de qualification. Un environnement issu exclusivement du lock doit fournir jsdom séparément avant d’exécuter les suites DOM. L’absence de ce runtime fait échouer explicitement le lancement ; aucun test n’est ignoré silencieusement.

`auth-forms.test.mjs` couvre 37 scénarios : réessai après erreur et exception, doublons, exclusion des actions OAuth/mot de passe, confirmation de l’adresse soumise, démontage/remontage, session immédiatement active et validation du nouveau mot de passe. `auth-state.test.mjs` couvre 6 scénarios du hook réutilisable, dont la priorité des événements récents et le nettoyage StrictMode. Le seul consommateur actuel de ce hook est `Header.tsx`, sans import dans les routes/layouts du snapshot qualifié ; ces tests ne constituent donc pas une preuve de parcours de navigation publié.

Les suites ne remplacent pas la validation d’un vrai parcours Supabase, de la réception d’un email ou d’un fournisseur OAuth. Aucun de ces flux distants n’est prétendu vérifié ici.

## Administration et demandes de suppression

`npm run test:auth` exécute les 58 contrôles de routage et les 56 contrôles administrateur. Ces derniers chargent les vrais middleware, layout, pages et handlers ; ils vérifient les autorisations à partir de l’identité établie et l’absence de toute lecture privilégiée après refus. Ils ne qualifient pas le schéma réel ou ses politiques SQL.

`npm run test:auth:dom` exécute les 43 tests React/DOM ci-dessus. La suite de suppression utilise la vraie route et 10 scénarios SQL, pour un total de 33 tests :

```sh
PGLITE_MODULE_PATH=/chemin/vers/@electric-sql/pglite npm run test:account-deletion
```

La variable est facultative si PGlite est déjà accessible dans le projet. Version locale vérifiée : 0.5.17. La fixture RLS de cette suite est explicitement limitée au profil propriétaire ; elle ne corrige ni ne certifie la politique récursive du bootstrap existant. La suppression globale d’un compte commun reste désactivée tant que son contrat central et ses intégrations ne sont pas qualifiés.
