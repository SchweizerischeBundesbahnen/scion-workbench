<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Layout

A perspective is an arrangement of views around the main area. Multiple perspectives are supported. Different perspectives provide a different perspective on the application while sharing the main area. Only one perspective can be active at a time.

### How to provide a perspective

Providing a perspective requires two steps.

<details>
    <summary>1. Register the perspective via workbench config</summary>
    <br>

Perspectives are registered similarly to [Defining an initial layout][link-how-to-define-initial-layout] via the configuration passed to `WorkbenchModule.forRoot()`. However, an array of perspective definitions is passed instead of a single layout. A perspective must have a unique identity and define a layout. Optionally, data can be associated with the perspective via data dictionary, e.g., to associate an icon, label or tooltip with the perspective.

```ts
import {MAIN_AREA_PART_ID, WorkbenchModule} from '@scion/workbench';

WorkbenchModule.forRoot({
  layout: {
    perspectives: [
      {
        id: 'admin',
        layout: layout => layout
            .addPart('topLeft', {relativeTo: MAIN_AREA_PART_ID, align: 'left', ratio: .25})
            .addPart('bottomLeft', {relativeTo: 'topLeft', align: 'bottom', ratio: .5})
            .addPart('bottom', {align: 'bottom', ratio: .3})
            .addView('navigator', {partId: 'topLeft', activateView: true})
            .addView('explorer', {partId: 'topLeft'})
            .addView('outline', {partId: 'bottomLeft', activateView: true})
            .addView('console', {partId: 'bottom', activateView: true})
            .addView('problems', {partId: 'bottom'})
            .addView('search', {partId: 'bottom'}),
        data: {
          label: 'Administrator',
        },
      },
      {
        id: 'manager',
        layout: layout => layout
            .addPart('bottom', {relativeTo: MAIN_AREA_PART_ID, align: 'bottom', ratio: .3})
            .addView('explorer', {partId: 'bottom', activateView: true})
            .addView('navigator', {partId: 'bottom'})
            .addView('outline', {partId: 'bottom'})
            .addView('search', {partId: 'bottom'}),
        data: {
          label: 'Manager',
        },
      },
    ],
    initialPerspective: 'manager',
  },
});
```

The perspective 'admin' defines the following layout.

```plain
+--------+----------------+
|  top   |   main area    |
|  left  |                |
|--------+                |
| bottom |                |
| left   |                |
+--------+----------------+
|          bottom         |
+-------------------------+
```

The perspective 'manager' defines the following layout.

```plain
+-------------------------+
|        main area        |
|                         |
|                         |
+-------------------------+
|          bottom         |
+-------------------------+
```

A layout is defined through a layout function. The layout function is passed an empty layout to which parts and views can be added. A part is a stack of views. Parts are aligned relative to each other. Views are added to parts. The layout is an immutable object, meaning that modifications have no side effects. Each modification creates a new layout instance that can be used for further modifications.

> The function can call `inject` to get required dependencies, if any.

Optionally, a `canActivate` function can be configured with a perspective descriptor to determine whether the perspective can be activated, for example based on the user's permissions. The initial activated perspective can be set via `initialPerspective` property which accepts a string literal or a function for more advanced use cases.
</details>

<details>
    <summary>2. Register the routes for views added to the perspectives</summary>
    <br>
 
Routes for views added to the perspective layouts must be registered via the router module, as follows:

```ts
RouterModule.forRoot([
  {path: '', outlet: 'navigator', loadComponent: () => import('./navigator/navigator.component')},
  {path: '', outlet: 'explorer', loadComponent: () => import('./explorer/explorer.component')},
  {path: '', outlet: 'outline', loadComponent: () => import('./outline/outline.component')},
  {path: '', outlet: 'console', loadComponent: () => import('./console/console.component')},
  {path: '', outlet: 'problems', loadComponent: () => import('./problems/problems.component')},
  {path: '', outlet: 'search', loadComponent: () => import('./search/search.component')},
]);
```

A route for a view in the layout must be a secondary route with an empty path. The outlet refers to the view in the layout. Because the path is empty, no outlet needs to be added to the URL.
</details>

[link-how-to-define-initial-layout]: /docs/site/howto/how-to-define-initial-layout.md

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
