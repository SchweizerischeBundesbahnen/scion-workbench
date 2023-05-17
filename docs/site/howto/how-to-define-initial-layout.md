<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Layout

The workbench has a main area and a peripheral area for placing views. The main area is the primary place for views to interact with the application. Typically, it is initially blank or displays a start page. The peripheral area arranges views around the main area. Peripheral views can be used to provide entry points to the application, tools or context-sensitive assistance to support the user's workflow.

### How to define an initial layout

Arranging views in the peripheral area requires two steps.

<details>
    <summary>1. Define the layout via workbench config</summary>
    <br>

```ts
import {MAIN_AREA_PART_ID, WorkbenchModule} from '@scion/workbench';

WorkbenchModule.forRoot({
  layout: layout => layout
    .addPart('topLeft', {relativeTo: MAIN_AREA_PART_ID, align: 'left', ratio: .25})
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

A layout is defined through a layout function in the workbench config. The layout function is passed an empty layout to which parts and views can be added. A part is a stack of views. Parts are aligned relative to each other. Views are added to parts. The layout is an immutable object, meaning that modifications have no side effects. Each modification creates a new layout instance that can be used for further modifications.

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
A route for a view in the peripheral layout must be a secondary route with an empty path. The outlet refers to the view in the layout. Because the path is empty, no outlet needs to be added to the URL.   
</details>

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
