<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
|-----------------|---------------------------------------------|-----------------------------|-----------------------------------|-------------------------------|

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Layout

SCION Workbench enables the creation of layouts, called perspectives, for displaying content side-by-side or stacked, all personalizable by the user via drag & drop.

A perspective defines an arrangement of parts and views. Parts can be docked to the side or positioned relative to each other. Views are stacked in parts and can be dragged to other parts. Content can be displayed in both parts and views.

A perspective typically has a main area part and other parts docked to the side, providing navigation and context-sensitive assistance to support the user's workflow.

For an overview of the workbench layout, see the chapter [Overview][link-overview]. 

***
**Content:**
- [How to Define a Layout](#how-to-define-a-layout)
- [How to Define Multiple Layouts](#how-to-define-multiple-layouts)
***

### How to Define a Layout

Define the workbench layout via a layout function passed to `provideWorkbench()` in `main.ts` or `app.config.ts`. The workbench will invoke this function with a factory object to create the layout. The layout is immutable; each modification creates a new instance.

Start by adding parts to the layout. Parts can be docked to a specific area (`left-top`, `left-bottom`, `right-top`, `right-bottom`, `bottom-left`, `bottom-right`) or aligned relative to each other. Views can be added to any part except the main area part. To display content, navigate parts and views to registered routes.

> [!NOTE]
> - A part can be docked to the left, right, or bottom side of the workbench. Each side has two docking areas: `left-top` and `left-bottom`, `right-top` and `right-bottom`, and `bottom-left` and `bottom-right`. Parts added to the same area are stacked, with only one part active per stack. If there is an active part in both stacks of a side, the two parts are split vertically or horizontally, depending on the side.
> - Docked parts can be minimized to create more space for the main content.
> - A docked part may be navigated to display content, have views, or define a layout with multiple parts aligned relative to each other.
> - Users cannot drag views into or out of docked parts.

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {MAIN_AREA, provideWorkbench, WorkbenchLayoutFactory} from '@scion/workbench';

bootstrapApplication(App, {
  providers: [
    provideWorkbench({
      layout: (factory: WorkbenchLayoutFactory) => factory
        // Add parts to dock areas on the side.
        .addPart(MAIN_AREA)
        .addPart('navigator', {dockTo: 'left-top'}, {label: 'Navigator', icon: 'folder'})
        .addPart('find', {dockTo: 'bottom-left'}, {label: 'Find', icon: 'search'})
        .addPart('inventory', {dockTo: 'right-top'}, {label: 'Inventory', icon: 'inventory'})
        .addPart('notifications', {dockTo: 'right-bottom'}, {label: 'Notifications', icon: 'notifications'})

        // Add views to parts.
        .addView('find1', {partId: 'find'})
        .addView('find2', {partId: 'find'})
        .addView('find3', {partId: 'find'})

        // Navigate the main area to display a welcome page.
        .navigatePart(MAIN_AREA, [], {hint: 'welcome'})

        // Navigate parts to display content.
        .navigatePart('navigator', [], {hint: 'navigator'})
        .navigatePart('inventory', ['path/to/inventory'])
        .navigatePart('notifications', [], {hint: 'notifications'})
        
        // Navigate views to display content.
        .navigateView('find1', ['path/to/find'])
        .navigateView('find2', ['path/to/find'])
        .navigateView('find3', ['path/to/find'])

        // Activate parts to open docked parts.
        .activatePart('navigator')
        .activatePart('find')
        .activatePart('inventory'),
    }),
  ],
});
```

The code snippet above creates the following layout.

[<img src="/docs/site/images/workbench-layout-docked-parts.drawio.svg" height="300" alt="Layout with Parts Docked to the Side">](https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/docs/site/images/workbench-layout-docked-parts.drawio.svg)

> [!NOTE]
> The main area is where the workbench opens new views by default and is optional. The layout function cannot add views to the main area but display a welcome page.

> [!TIP]
> - The layout function can call `inject` to get any required dependencies.
> - Material icons are used by default. Learn how to use [custom icons][link-how-to-provide-icons].

The layout uses the following routes:

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';
import {canMatchWorkbenchView, canMatchWorkbenchPart} from '@scion/workbench';

bootstrapApplication(App, {
  providers: [
    provideRouter([
      // Route for the "MAIN_AREA Part"
      {path: '', canMatch: [canMatchWorkbenchPart('welcome')], loadComponent: () => import('./welcome/welcome.component')},
      // Route for the "Navigator Part"
      {path: '', canMatch: [canMatchWorkbenchPart('navigator')], loadComponent: () => import('./navigator/navigator.component')},
      // Route for the "Find View"
      {path: 'path/to/find', loadComponent: () => import('./find/find.component')},
      // Route for the "Inventory Part"
      {path: 'path/to/inventory', loadComponent: () => import('./inventory/inventory.component')},
      // Route for the "Notifications Part"
      {path: '', canMatch: [canMatchWorkbenchPart('notifications')], loadComponent: () => import('./notifications/notifications.component')},
    ]),
  ],
});
```
> [!TIP]
> To maintain a clean URL, we recommend navigating the parts and views to empty path routes and using a navigation hint for differentiation.
> - Use the `canMatchWorkbenchPart` guard to match a route for a part navigated with a particular hint.
> - Use the `canMatchWorkbenchView` guard to match a route for a view navigated with a particular hint.

**Relative Part Alignment**

Parts can also be positioned relative to each other rather than docked to a specific area. Unlike docked parts, relative aligned parts cannot be minimized to the side. These two layouting methods can be combined.

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {MAIN_AREA, provideWorkbench, WorkbenchLayoutFactory} from '@scion/workbench';

bootstrapApplication(App, {
  providers: [
    provideWorkbench({
      layout: (factory: WorkbenchLayoutFactory) => factory
        // Add parts relative to each other.
        .addPart(MAIN_AREA)
        .addPart('navigator', {align: 'left', ratio: .25}, {title: 'Navigator'})
        .addPart('inventory', {align: 'right', ratio: .25}, {title: 'Inventory'})
        .addPart('find', {align: 'bottom', relativeTo: MAIN_AREA, ratio: .25}, {title: 'Find'})
        .addPart('notifications', {align: 'bottom', relativeTo: 'inventory', ratio: .5}, {title: 'Notifications'})

        // Add views to parts.
        .addView('find1', {partId: 'find'})
        .addView('find2', {partId: 'find'})
        .addView('find3', {partId: 'find'})

        // Navigate the main area to display a welcome page.
        .navigatePart(MAIN_AREA, [], {hint: 'welcome'})

        // Navigate parts to display content.
        .navigatePart('navigator', [], {hint: 'navigator'})
        .navigatePart('inventory', ['path/to/inventory'])
        .navigatePart('notifications', [], {hint: 'notifications'})

        // Navigate views to display content.
        .navigateView('find1', ['path/to/find'])
        .navigateView('find2', ['path/to/find'])
        .navigateView('find3', ['path/to/find'])
    }),
  ],
});
```

The code snippet above creates the following layout.

[<img src="/docs/site/images/workbench-layout-relative-parts.drawio.svg" height="300" alt="Layout with Relative Aligned Parts">](https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/docs/site/images/workbench-layout-relative-parts.drawio.svg)

A part can also be aligned relative to a docked part, enabling inline layouts within docked parts, such as splitting the docked parts into multiple sections.

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {MAIN_AREA, provideWorkbench, WorkbenchLayoutFactory} from '@scion/workbench';

bootstrapApplication(App, {
  providers: [
    provideWorkbench({
      layout: (factory: WorkbenchLayoutFactory) => factory
        // Add parts to the layout.
        .addPart(MAIN_AREA)
        .addPart('navigator', {dockTo: 'left-top'}, {label: 'Navigator', icon: 'folder'})
        .addPart('detail', {relativeTo: 'navigator', align: 'bottom'})

        // Navigate parts to display content.
        .navigatePart('navigator', [], {hint: 'navigator'})
        .navigatePart('detail', [], {hint: 'detail'})

        // Activate parts to open docked parts.
        .activatePart('navigator'),
    }),
  ],
});
```

The code snippet above defines the following layout.

[<img src="/docs/site/images/workbench-layout-docked-and-relative-parts.drawio.svg" height="300" alt="Layout with Docked and Relative Aligned Parts">](https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/docs/site/images/workbench-layout-docked-and-relative-parts.drawio.svg)

### How to Define Multiple Layouts
Multiple layouts, called perspectives, can be created. Users can switch between perspectives. Perspectives share the same main area, if any.

Perspectives are registered similarly to [defining a single layout](#how-to-define-a-layout) via the configuration passed to `provideWorkbench()`. However, an array of perspective definitions is passed instead of a single workbench layout.

A perspective must have a unique identity. Optionally, data can be associated with the perspective via a data dictionary, e.g., to associate an icon, label, or tooltip with the perspective.

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideWorkbench, WorkbenchLayoutFactory} from '@scion/workbench';

bootstrapApplication(App, {
  providers: [
    provideWorkbench({
      layout: {
        perspectives: [
          {
            id: 'perspective-1',
            layout: (factory: WorkbenchLayoutFactory) => {...},
            data: {
              label: 'Perspective 1',
            },
            canActivate: () => {...},
          },
          {
            id: 'perspective-2',
            layout: (factory: WorkbenchLayoutFactory) => {...},
            data: {
              label: 'Perspective 2',
            },
            canActivate: () => {...},
          }
        ],
        initialPerspective: 'perspective-1',
      },
    }),
  ],
});
```

> [!NOTE]
> - The layout of the main area is not reset when resetting perspectives. 
> - The label is illustrative and not part of the Workbench API.
> - The SCION Workbench has no built-in perspective switcher; the application must implement it.

> [!TIP]
> - A `canActivate` function can be configured to determine if the perspective can be activated, for example, based on the user's permissions.
> - The initial perspective can be configured via the `initialPerspective` property.

For more information on interacting with perspectives, refer to the chapter [How to Work With Perspectives][link-how-to-perspectives].

***
**Further Reading:**
- [How to Provide a Desktop](how-to-provide-desktop.md)
- [How to Provide a View](how-to-provide-view.md)
- [How to Open a View](how-to-open-view.md)
- [How to Display Content in a Part](how-to-navigate-part.md)
***


[link-how-to-provide-icons]: /docs/site/howto/how-to-icons.md
[link-how-to-perspectives]: /docs/site/howto/how-to-perspective.md
[link-overview]: /docs/site/overview.md

[menu-how-to]: /docs/site/howto/how-to.md
[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
