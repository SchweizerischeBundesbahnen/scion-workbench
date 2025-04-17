<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Layout

The SCION Workbench provides a flexible layout for displaying content side-by-side or stacked, all personalizable by the user via drag & drop.

The layout defines an arrangement of parts and views. Parts can be docked to the side or aligned relative to each other. Views are stacked in parts. Content can be displayed in both parts and views.

A typical workbench application has a main area part with other parts docked to the side, providing navigation and context-sensitive assistance to support the user's workflow.

***
**Content:**
- [How to Define the Workbench Layout](#how-to-define-the-workbench-layout)
- [How to Align Parts Relative to Each Other](#how-to-align-parts-relative-to-each-other)
- [How to Provide Multiple Layouts (Perspectives)](#how-to-provide-multiple-layouts-perspectives)
***

### How to Define the Workbench Layout

Define the workbench layout via a layout function passed to `provideWorkbench()`. The workbench will invoke this function with a factory object to create the layout. The layout is immutable, so each modification creates a new instance. Use the instance for further modifications and finally return it.

Start by adding parts to the layout. Parts can be docked to a specific region, or aligned relative to each other. Views can be added to any part (except the main area part). To display content, navigate parts and views to registered routes.

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {MAIN_AREA, provideWorkbench, WorkbenchLayoutFactory} from '@scion/workbench';

bootstrapApplication(AppComponent, {
  providers: [
    provideWorkbench({
      layout: (factory: WorkbenchLayoutFactory) => factory
        // Add parts to the layout.
        .addPart(MAIN_AREA)
        .addPart('navigator', {dockTo: 'left-top'}, {label: 'Navigator', icon: 'folder'})
        .addPart('find', {dockTo: 'bottom-left'}, {label: 'Find', icon: 'search'})
        .addPart('notifications', {dockTo: 'right-top'}, {label: 'Notifications', icon: 'notifications'})
        .addPart('settings', {dockTo: 'right-top'}, {label: 'Settings', icon: 'settings'})

        // Navigate parts.
        .navigatePart('navigator', [], {hint: 'navigator'})
        .navigatePart('notifications', ['path/to/notifications'])
        .navigatePart('settings', ['path/to/settings'])

        // Add views to the layout.
        .addView('find1', {partId: 'find'})
        .addView('find2', {partId: 'find'})

        // Navigate views.
        .navigateView('find1', ['path/to/find'])
        .navigateView('find2', ['path/to/find'])

        // Activate parts.
        .activatePart('navigator')
    }),
  ],
});
```

> The layout function can call `inject` to get any required dependencies.

> To maintain a clean URL, we recommend navigating the parts and views to empty path routes and using a navigation hint to differentiate.

> By default, Material icons are used. Learn how to use [custom icons][link-how-to-provide-icons].

The above code snippet defines the following layout.

[<img src="/docs/site/images/workbench-layout-docked-parts.svg">](https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/docs/site/images/workbench-layout-docked-parts.svg)

The layout above uses the following routes:

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';
import {canMatchWorkbenchView, canMatchWorkbenchPart} from '@scion/workbench';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      // Navigator
      {path: '', canMatch: [canMatchWorkbenchPart('navigator')], loadComponent: () => import('./navigator/navigator.component')},
      // Find
      {path: 'path/to/find', loadComponent: () => import('./find/find.component')},
      // Settings
      {path: 'path/to/settings', loadComponent: () => import('./settings/settings.component')},
      // Notifications
      {path: '', canMatch: [canMatchWorkbenchPart('notifications')], loadComponent: () => import('./notifications/notifications.component')},
    ]),
  ],
});
```

> Use the `canMatchWorkbenchPart` guard to match a route when navigating a part with a particular hint.

> Use the `canMatchWorkbenchView` guard to match a route when navigating a view with a particular hint.

### How to Align Parts Relative to Each Other

Parts can also be added relative to each other rather than docked to a specific region. Unlike docked parts, relative parts cannot be minimized to the sidebars.

Relative aligned parts can be used as an alternative or complement to docked parts, for example to create split docked parts.

**Layout with Parts Relative to Each Other**

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {MAIN_AREA, provideWorkbench, WorkbenchLayoutFactory} from '@scion/workbench';

bootstrapApplication(AppComponent, {
  providers: [
    provideWorkbench({
      layout: (factory: WorkbenchLayoutFactory) => factory
        // Add parts to the layout.
        .addPart(MAIN_AREA)
        .addPart('navigator', {relativeTo: MAIN_AREA, align: 'left', ratio: .25})
        .addPart('find', {relativeTo: MAIN_AREA, align: 'bottom', ratio: .25})
        .addPart('notifications', {relativeTo: MAIN_AREA, align: 'right', ratio: .25})
        .addPart('settings', {relativeTo: 'notifications', align: 'bottom', ratio: .25})

        // Navigate parts.
        .navigatePart('navigator', [], {hint: 'navigator'})
        .navigatePart('notifications', ['path/to/notifications'])
        .navigatePart('settings', ['path/to/settings'])

        // Add views to the layout.
        .addView('find1', {partId: 'find'})
        .addView('find2', {partId: 'find'})

        // Navigate views.
        .navigateView('find1', ['path/to/find'])
        .navigateView('find2', ['path/to/find'])
    }),
  ],
});
```

The above code snippet defines the following layout.

[<img src="/docs/site/images/workbench-layout-relative-parts.svg">](https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/docs/site/images/workbench-layout-relative-parts.svg)


**Layout with a Split Docked Part**

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {MAIN_AREA, provideWorkbench, WorkbenchLayoutFactory} from '@scion/workbench';

bootstrapApplication(AppComponent, {
  providers: [
    provideWorkbench({
      layout: (factory: WorkbenchLayoutFactory) => factory
        // Add parts to the layout.
        .addPart(MAIN_AREA)
        .addPart('navigator', {dockTo: 'left-top'}, {label: 'Navigator', icon: 'folder'})
        
        // Add part relative to navigator.
        .addPart('navigator-details', {relativeTo: 'navigator', align: 'bottom'})

        // Navigate parts.
        .navigatePart('navigator', [], {hint: 'navigator'})
        .navigatePart('navigator-details', [], {hint: 'navigator-details'})

        // Activate parts.
        .activatePart('navigator')
    }),
  ],
});
```

The above code snippet defines the following layout.

[<img src="/docs/site/images/workbench-layout-docked-and-relative-parts.svg">](https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/docs/site/images/workbench-layout-docked-and-relative-parts.svg)

### How to Provide Multiple Layouts (Perspectives)
Multiple layouts, known as perspectives, can be created to provide different perspectives on the application. Users can switch between perspectives.

Perspectives are registered similarly to [Defining the workbench layout](#how-to-define-the-workbench-layout) via the configuration passed to `provideWorkbench()`. However, an array of perspective definitions is passed instead of a single workbench layout.

A perspective must have a unique identity. Optionally, data can be associated with the perspective via data dictionary, e.g., to associate an icon, label or tooltip with the perspective.

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideWorkbench, WorkbenchLayoutFactory} from '@scion/workbench';

bootstrapApplication(AppComponent, {
  providers: [
    provideWorkbench({
      layout: {
        perspectives: [
          {
            id: 'user',
            layout: (factory: WorkbenchLayoutFactory) => {...},
            data: {
              label: 'User',
            },
            canActivate: () => {...},
          },
          {
            id: 'admin',
            layout: (factory: WorkbenchLayoutFactory) => {...},
            data: {
              label: 'Administrator',
            },
            canActivate: () => {...},
          }
        ],
        initialPerspective: 'manager',
      },
    }),
  ],
});
```

> A `canActivate` function can be configured to determine if the perspective can be activated, for example based on the user's permissions.

> The initial perspective can be set via `initialPerspective` property which accepts a string literal or a function for more advanced use cases.

The application can switch perspectives using the `WorkbenchService.switchPerspective()` method, passing the id of the perspective. 
Typically, the application provides a perspective switcher menu for the user to switch perspectives. Refer to chapter [How to Work With Perspectives][link-how-to-perspectives] to learn more about interacting with perspectives.

[link-how-to-provide-icons]: /docs/site/howto/how-to-icons.md
[link-how-to-perspectives]: /docs/site/howto/how-to-perspective.md

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md

[menu-projects-overview]: /docs/site/projects-overview.md

[menu-changelog]: /docs/site/changelog.md

[menu-contributing]: /CONTRIBUTING.md

[menu-sponsoring]: /docs/site/sponsoring.md
