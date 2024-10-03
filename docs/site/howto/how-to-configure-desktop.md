<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Layout

### How to configure a desktop
A desktop is used to display content when all views are closed. Start by adding a desktop navigation in the layout definition.

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {MAIN_AREA, provideWorkbench, WorkbenchLayoutFactory} from '@scion/workbench';

bootstrapApplication(AppComponent, {
  providers: [
    provideWorkbench({
      layout: (factory: WorkbenchLayoutFactory) => factory
        .addPart(MAIN_AREA)
        .navigateDesktop([''], {hint: 'desktop'})
    }),
  ],
});
```

Then, register a route.

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';
import {canMatchWorkbenchDesktop} from '@scion/workbench';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      {
        path: '',
        canMatch: [canMatchWorkbenchDesktop('desktop')],
        loadComponent: () => import('./desktop/desktop.component')
      },
    ]),
  ],
});
```

> To avoid cluttering the URL, we recommend navigating the desktop to an empty path route and using a navigation hint.

### How to configure a desktop per perspective
Each perspective can have its own desktop. Start by adding a desktop navigation per perspective.

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
              .addPart(MAIN_AREA)
              .navigateDesktop([''], {hint: 'desktop-admin'})
          },
          {
            id: 'manager',
            layout: (factory: WorkbenchLayoutFactory) => factory
              .addPart(MAIN_AREA)
              .navigateDesktop([''], {hint: 'desktop-manager'})
          },
        ],
      },
    }),
  ],
});
```

Then, register the routes.

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';
import {canMatchWorkbenchDesktop} from '@scion/workbench';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      {
        path: '',
        canMatch: [canMatchWorkbenchDesktop('desktop-admin')],
        loadComponent: () => import('./desktop/desktop-admin.component')
      },
      {
        path: '',
        canMatch: [canMatchWorkbenchDesktop('desktop-manager')],
        loadComponent: () => import('./desktop/desktop-manager.component')
      },
    ]),
  ],
});
```

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
