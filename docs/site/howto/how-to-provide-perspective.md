<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Layout

A perspective is a named arrangement of views. Different perspectives provide a different perspective on the application. A perspective can be divided into a main and a peripheral area, with the main area as the primary place for opening views. Views in the main area are retained when switching perspectives.

The layout of a perspective is a grid of parts. Parts are aligned relative to each other. A part is a stack of views. Content is displayed in views.

### How to provide a perspective

Perspectives are registered similarly to [Defining the initial workbench layout][link-how-to-define-initial-workbench-layout] via the configuration passed to `provideWorkbench()`. However, an array of perspective definitions is passed instead of a single workbench layout. A perspective must have a unique identity and define a workbench layout. Optionally, data can be associated with the perspective via data dictionary, e.g., to associate an icon, label or tooltip with the perspective.

Define the perspective's layout by registering a layout function in the perspective definition. The workbench will invoke this function with a factory to create the layout. The layout is immutable, so each modification creates a new instance. Use the instance for further modifications and finally return it.

Start by adding the first part. From there, you can gradually add more parts and align them relative to each other. Next, add views to the layout, specifying to which part to add the views. The final step is to navigate the views. A view can be navigated to any route.

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {MAIN_AREA, provideWorkbench, WorkbenchLayoutFactory} from '@scion/workbench';

bootstrapApplication(AppComponent, {
  providers: [
    provideWorkbench({
      layout: {
        perspectives: [
          {
            id: 'admin',
            layout: (factory: WorkbenchLayoutFactory) => factory
              // Add parts to the layout.
              .addPart(MAIN_AREA)
              .addPart('topLeft', {relativeTo: MAIN_AREA, align: 'left', ratio: .25})
              .addPart('bottomLeft', {relativeTo: 'topLeft', align: 'bottom', ratio: .5})
              .addPart('bottom', {align: 'bottom', ratio: .3})

              // Add views to the layout.
              .addView('navigator', {partId: 'topLeft'})
              .addView('explorer', {partId: 'topLeft'})
              .addView('outline', {partId: 'bottomLeft'})
              .addView('console', {partId: 'bottom'})
              .addView('problems', {partId: 'bottom'})
              .addView('search', {partId: 'bottom'})

              // Navigate views.
              .navigateView('navigator', ['path/to/navigator'])
              .navigateView('explorer', ['path/to/explorer'])
              .navigateView('outline', [], {hint: 'outline'}) // Set hint to differentiate between routes with an empty path.
              .navigateView('console', [], {hint: 'console'}) // Set hint to differentiate between routes with an empty path.
              .navigateView('problems', [], {hint: 'problems'}) // Set hint to differentiate between routes with an empty path.
              .navigateView('search', ['path/to/search']),
            data: {
              label: 'Administrator',
            },
          },
          {
            id: 'manager',
            layout: (factory: WorkbenchLayoutFactory) => factory
              // Add parts to the layout.
              .addPart(MAIN_AREA)
              .addPart('bottom', {relativeTo: MAIN_AREA, align: 'bottom', ratio: .3})

              // Add views to the layout.  
              .addView('navigator', {partId: 'bottom'})
              .addView('explorer', {partId: 'bottom'})
              .addView('outline', {partId: 'bottom'})
              .addView('search', {partId: 'bottom'})

              // Navigate views.
              .navigateView('navigator', ['path/to/navigator'])
              .navigateView('explorer', ['path/to/explorer'])
              .navigateView('outline', [], {hint: 'outline'}) // Set hint to differentiate between routes with an empty path.
              .navigateView('search', ['path/to/search']),
            data: {
              label: 'Manager',
            },
          },
        ],
        initialPerspective: 'manager',
      },
    }),
  ],
});
```

> The layout function can call `inject` to get any required dependencies.

> A `canActivate` function can be configured to determine if the perspective can be activated, for example based on the user's permissions.

> The initial perspective can be set via `initialPerspective` property which accepts a string literal or a function for more advanced use cases.

The perspective `admin` defines the following layout.

```plain
+--------+----------------+
|  top   |                |
|  left  |                |
|--------+   main area    |
| bottom |                |
| left   |                |
+--------+----------------+
|          bottom         |
+-------------------------+
```

The perspective `manager` defines the following layout.

```plain
+-------------------------+
|                         |
|        main area        |
|                         |
+-------------------------+
|          bottom         |
+-------------------------+
```

The above perspectives require the following routes.
 
```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';
import {canMatchWorkbenchView} from '@scion/workbench';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      // Navigator View
      {path: 'path/to/navigator', loadComponent: () => import('./navigator/navigator.component')},
      // Explorer View
      {path: 'path/to/explorer', loadComponent: () => import('./explorer/explorer.component')},
      // Outline View
      {path: '', canMatch: [canMatchWorkbenchView('outline')], loadComponent: () => import('./outline/outline.component')},
      // Console View
      {path: '', canMatch: [canMatchWorkbenchView('console')], loadComponent: () => import('./console/console.component')},
      // Problems View
      {path: '', canMatch: [canMatchWorkbenchView('problems')], loadComponent: () => import('./problems/problems.component')},
      // Search View
      {path: 'path/to/search', loadComponent: () => import('./search/search.component')},
    ]),
  ],
});
```

> To avoid cluttering the initial URL, we recommend navigating the views of a perspective to empty path routes and using a navigation hint to differentiate.

> Use the `canMatchWorkbenchView` guard to match a route only when navigating a view with a particular hint.

> Use the `canMatchWorkbenchView` guard and pass `false` to never match a route for a workbench view, e.g., to exclude the application root path, if any, necessary when navigating views to the empty path route.

[link-how-to-define-initial-workbench-layout]: /docs/site/howto/how-to-define-initial-layout.md

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
