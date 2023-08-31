<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Layout

The workbench layout is a grid of parts. Parts are aligned relative to each other. A part is a stack of views. Content is displayed in views.

The layout can be divided into a main and a peripheral area, with the main area as the primary place for opening views. The peripheral area arranges parts around the main area to provide navigation or context-sensitive assistance to support the user's workflow. Defining a main area is optional and recommended for applications requiring a dedicated and maximizable area for user interaction.

### How to define an initial layout

Arranging views in the workbench layout requires two steps.

<details>
    <summary>1. Define the layout via workbench config</summary>
    <br>

```ts
import {MAIN_AREA, WorkbenchLayoutFactory, WorkbenchModule} from '@scion/workbench';

WorkbenchModule.forRoot({
  layout: (factory: WorkbenchLayoutFactory) => factory
    .addPart(MAIN_AREA)
    .addPart('topLeft', {relativeTo: MAIN_AREA, align: 'left', ratio: .25})
    .addPart('bottomLeft', {relativeTo: 'topLeft', align: 'bottom', ratio: .5})
    .addPart('bottom', {align: 'bottom', ratio: .3})
    .addView('navigator', {partId: 'topLeft', activateView: true})
    .addView('explorer', {partId: 'topLeft'})
    .addView('console', {partId: 'bottom', activateView: true})
    .addView('problems', {partId: 'bottom'})
    .addView('search', {partId: 'bottom'})
});
```
The above code snippet defines the following layout.

```plain
+--------+----------------+
|  top   |   main area    |
|  left  |                |
|--------+                |
| bottom |                |
|  left  |                |
+--------+----------------+
|          bottom         |
+-------------------------+
```   

A layout is defined through a layout function in the workbench config. The function is passed a factory to create the layout. The layout has methods to modify it. Each modification creates a new layout instance that can be used for further modifications.

> The function can call `inject` to get required dependencies, if any.
</details>

<details>
    <summary>2. Register the routes for views added to the layout</summary>
    <br>

```ts
RouterModule.forRoot([
  {path: '', outlet: 'navigator', loadComponent: () => import('./navigator/navigator.component')},
  {path: '', outlet: 'explorer', loadComponent: () => import('./explorer/explorer.component')},
  {path: '', outlet: 'console', loadComponent: () => import('./console/console.component')},
  {path: '', outlet: 'problems', loadComponent: () => import('./problems/problems.component')},
  {path: '', outlet: 'search', loadComponent: () => import('./search/search.component')},
]);
```
A route for a view in the initial layout must be a secondary route with an empty path. The outlet refers to the view in the layout. Because the path is empty, no outlet needs to be added to the URL.   
</details>

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
