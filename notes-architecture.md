## 1. Structure du projet

L'architecture ne contient que des `pages/` mais aucun service, modèle ou composant réutilisable.

## 2. Les composants

- `HttpClient` est utilisé directement dans `home.component.ts` et `country.component.ts`.
- Répétition de cette URL dans chaque page : `./assets/mock/olympic.json`.
- Il y a des calculs métier qui sont faits dans les pages (pas réutilisables, ni testables).
- Le JSON est rechargé dans chaque page.

## 3. Typage

- Du typage `any` partout.
- Il n'y a aucune interface `Olympic` ou `Participation` (la spec les fournit).

## 4.

- Les `subscribe()` n'ont pas de désabonnement. `route.paramMap` ne se termine jamais tout seul.
- Dans `country.component.ts`, `paramMap` et la requête HTTP sont gérés séparément au lieu d'être chaînés. Si le paramètre change, les données ne sont pas rechargées.
- Les deux pages contiennent un `.pipe()` vide.
- Les pages utilisent `subscribe(next, error)`, qui est déprécié.
- `this.error` est stocké mais n'est jamais affiché.

## 5. Bugs

- Un pays inexistant dans l'URL (par exemple `/country/Japon`) fait planter la page détail : le code lit une propriété sur `undefined`.
- La route est `country/:countryName` alors que la spec demande `/country/:id`.
- Les graphiques sont ciblés par leur id dans le DOM (`new Chart("DashboardPieChart")`) au lieu d'un `@ViewChild`.
- Les graphiques ne sont jamais détruits (pas de `ngOnDestroy`), ce qui crée une fuite mémoire à chaque navigation.
- `{{ pieChart }}` et `{{ lineChart }}` sont écrits à l'intérieur des `<canvas>` : ils affichent « [object Object] ».

## 6.

- Les tests ne passent pas : ils vérifient un titre qui n'existe plus et ne fournissent pas `HttpClient`.
- Aucun linter n'est configuré, donc `ng lint` ne fonctionne pas.
- `angular.json` utilise `browserTarget` (déprécié), et les tests utilisent `RouterTestingModule` (déprécié).

## 7.

- Il n'y a pas d'état de chargement, d'état vide ni d'état d'erreur.
- Le responsive est minimal : une seule media query, alors que la spec demande 3 formats (desktop, tablette, mobile).
- Les graphiques n'ont pas d'`aria-label` ni de description texte. Le clic sur un pays ne fonctionne qu'à la souris.
- Le titre de page est dans une `<div>` au lieu d'un `<h1>`, et la page est déclarée en `lang="en"`.

---

## Les blocs que j'ai identifiés

En relisant mon audit et la spec de Jeannette, j'ai repéré 4 types de blocs :

- **Des pages** : le dashboard, le détail d'un pays et la page « introuvable ».
- **Un composant réutilisable** : l'en-tête (titre + indicateurs), qui est copié-collé dans les 2 pages.
- **Un service** : pour récupérer les données à un seul endroit au lieu de le faire dans chaque page.
- **Des modèles** : pour décrire la forme des données et ne plus utiliser `any`.

## La nouvelle arborescence

```
src/app/
├── components/
│   └── header/
├── pages/
│   ├── dashboard/              (ancien home/)
│   ├── country-detail/         (ancien country/)
│   └── not-found/
├── services/
│   └── data.service.ts         (les données du JSON)
└── models/
    ├── olympic.model.ts
    ├── participation.model.ts
    └── indicator.model.ts
```

Les données descendent dans un seul sens, de la source vers l'affichage :

```
olympic.json  (intégration future d'un back-end : API REST)
      │
      ▼
 DataService  ── seul point de contact avec les données
      │          renvoie des Observable<Olympic[]> typés
      ▼
 Pages (Dashboard, CountryDetail)
      │          demandent les données, gèrent loading / error
      ▼
 HeaderComponent + graphiques
                 reçoivent des valeurs via @Input et les affichent
```

## Où vont les fichiers actuels

| Aujourd'hui | Demain |
|---|---|
| `pages/home/` | `pages/dashboard/` (renommé comme dans la spec) |
| `pages/country/` | `pages/country-detail/` (renommé comme dans la spec) |
| `pages/not-found/` | ne bouge pas |
| Le bloc titre + indicateurs, dupliqué dans les 2 pages | `components/header/` |
| Les `http.get` et l'URL du JSON, dans les 2 pages | `services/data.service.ts` |
| Les calculs (total médailles, nombre de JO…) | `services/data.service.ts` |
| Les `any` | remplacés par les interfaces de `models/` |
| La route `country/:countryName` | devient `country/:id`, comme demandé dans la spec |

## Les patterns que j'utilise

### Le Singleton pour le service

En écrivant `@Injectable({ providedIn: 'root' })`, Angular crée une seule instance du `DataService` pour toute l'application. Les 2 pages utilisent donc le même service et les mêmes données. Aujourd'hui, au contraire, chaque page recharge le JSON de son côté.

### La séparation composant / service

Le service s'occupe de récupérer les données. Les pages s'occupent de les afficher. Le header, lui, affiche seulement ce que la page lui donne (un titre et une liste d'indicateurs), sans savoir d'où viennent les données. C'est ce qui le rend réutilisable dans les 2 pages.

## Et pour un vrai back-end plus tard ?

Aujourd'hui, les données viennent d'un fichier JSON. Dans les prochains projets, elles viendront d'une API REST. Avec cette organisation, il suffira de modifier le `DataService` : les pages et le header ne changeront pas.

## Ce que je dois encore approfondir

- Comment bien gérer les observables entre le service et les pages, en particulier le désabonnement.
- Si je dois aussi faire des composants séparés pour les graphiques, ou les laisser dans les pages.