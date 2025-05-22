<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
|-----------------|---------------------------------------------|-----------------------------|-----------------------------------|-------------------------------|

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Layout

This chapter requires a perspective to be registered. See [How to Define Multiple Layouts][link-how-to-define-multiple-layouts] to learn how to provide one or more perspectives.

### How to Query Perspectives
Query perspectives using the `WorkbenchService.perspectives` signal.

### How to Switch a Perspective
Switch perspectives using the `WorkbenchService.switchPerspective` method.

### How to Reset a Perspectives
Reset the active perspective to its initial layout using the `WorkbenchService.resetPerspective` method.

### How to Test if a Perspective is Active
Check if a perspective is active using the `WorkbenchPerspective.active` signal, or read the active perspective from the `WorkbenchService.activePerspective` signal.

```ts
// Read the active perspective.
const activePerspective = inject(WorkbenchService).activePerspective();

// Check if a perspective is active.
const perspective = inject(WorkbenchService).getPerspective('perspective');
const isActive = perspective.active()
```

### How to Configure the Initial Perspective
Set the initial perspective in the workbench configuration by defining the `initialPerspective` property. Provide either a perspective id or a function to select from available perspectives.

**Setting the `developer` perspective as the initial perspective.**
```ts
import {provideWorkbench} from '@scion/workbench';

provideWorkbench({
  layout: {
    initialPerspective: 'developer',
  },
});
```

**Selecting the `developer` perspective based on the user's roles and available perspectives.**

```ts
import {provideWorkbench, WorkbenchPerspective} from '@scion/workbench';
import {inject} from '@angular/core';

provideWorkbench({
  layout: {
    initialPerspective: async (perspectives: WorkbenchPerspective[]) => {
      if (await inject(AuthService).hasRole('developer') && perspectives.some(perspective => perspective.id === 'developer')) {
        return 'developer';
      }
      return undefined;
    },
  },
});
```

> [!NOTE]
> The `AuthService` is illustrative and not part of the Workbench API. 

### How to Configure if Perspective Can Be Activated
A `canActivate` function can be configured to determine if the perspective can be activated, for example based on the user's permissions.

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideWorkbench, WorkbenchLayoutFactory} from '@scion/workbench';

bootstrapApplication(AppComponent, {
  providers: [
    provideWorkbench({
      layout: {
        perspectives: [
          {
            id: 'admin',
            layout: (factory: WorkbenchLayoutFactory) => {...},
            data: {
              label: 'Administrator',
            },
            canActivate: () => inject(AuthService).hasRole('admin'),
          },
          {
            id: 'manager',
            layout: (factory: WorkbenchLayoutFactory) => {...},
            data: {
              label: 'Manager',
            },
          },
        ],
      },
    }),
  ],
});
```

> [!NOTE]
> The `AuthService` is illustrative and not part of the Workbench API.

[link-how-to-define-multiple-layouts]: /docs/site/howto/how-to-define-layout.md#how-to-define-multiple-layouts

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
