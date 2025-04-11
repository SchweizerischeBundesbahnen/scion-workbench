<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Layout

A perspective is a named workbench layout.
Different perspectives provide a different perspective on the application.
A perspective can be divided into a main and a peripheral area, with the main area as the primary place for opening views.
Views in the main area are retained when switching perspectives.

### How to provide a perspective

Perspectives are registered similarly to [Defining the workbench layout][link-how-to-define-workbench-layout] via the configuration passed to `provideWorkbench()`. However, an array of perspective definitions is passed instead of a single workbench layout.

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
            id: 'admin',
            layout: (factory: WorkbenchLayoutFactory) => {...},
            data: {
              label: 'Administrator',
            },
          },
          {
            id: 'manager',
            layout: (factory: WorkbenchLayoutFactory) => {...},
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

> A `canActivate` function can be configured to determine if the perspective can be activated, for example based on the user's permissions.

> The initial perspective can be set via `initialPerspective` property which accepts a string literal or a function for more advanced use cases.

[link-how-to-define-workbench-layout]: /docs/site/howto/how-to-define-initial-layout.md

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
