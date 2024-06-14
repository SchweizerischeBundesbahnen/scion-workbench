<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

The workbench displays a "Not Found" page if no route matches the requested URL. This happens when navigating to a route that does not exist or when loading the application, and the routes have changed since the last use.

The built-in "Not Found" page can be replaced, e.g., to localize the page, as follows:

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideWorkbench} from '@scion/workbench';

bootstrapApplication(AppComponent, {
  providers: [
    provideWorkbench({
      pageNotFoundComponent: YourPageNotFoundComponent,
    }),
  ],
});
```

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
