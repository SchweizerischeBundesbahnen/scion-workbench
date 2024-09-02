<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

### How to configure a start page
A start page can be used to display content when all views are closed.

To display a start page, register an empty path route, as follows:

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      {path: '', loadComponent: () => import('./start-page/start-page.component')},
    ]),
  ],
});
```

### How to configure a start page per perspective
Different perspectives can have a different start page. Use the `canMatchWorkbenchPerspective` guard to match a route only if the specified perspective is active.

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';
import {canMatchWorkbenchPerspective} from '@scion/workbench';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      // Match this route only if 'perspective-a' is active.
      {
        path: '',
        loadComponent: () => import('./perspective-a/start-page.component'),
        canMatch: [canMatchWorkbenchPerspective('perspective-a')],
      },
      // Match this route only if 'perspective-b' is active.
      {
        path: '',
        loadComponent: () => import('./perspective-b/start-page.component'),
        canMatch: [canMatchWorkbenchPerspective('perspective-b')],
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
