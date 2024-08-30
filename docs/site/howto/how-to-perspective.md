<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Layout

This chapter requires a perspective to be registered. See [Providing a Perspective][link-how-to-provide-perspective] to learn how to provide a perspective.

### How to query perspectives
Query perspectives using the `WorkbenchService.perspectives` signal.

### How to switch a perspective
Switch perspectives using the `WorkbenchService.switchPerspective` method.

### How to reset a perspectives
Reset the active perspective to its initial layout using the `WorkbenchService.resetPerspective` method.

### How to test if a perspective is active
Check if a perspective is active using the `WorkbenchPerspective.active` signal, or read the active perspective from the `WorkbenchService.activePerspective` signal.

```ts
// Read the active perspective.
const activePerspective = inject(WorkbenchService).activePerspective();

// Check if a perspective is active.
const perspective = inject(WorkbenchService).getPerspective('perspective');
const isActive = perspective.active()
```

### How to configure the initial perspective
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

> The `AuthService` is illustrative and not part of the Workbench API. 

[link-how-to-provide-perspective]: /docs/site/howto/how-to-provide-perspective.md

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
