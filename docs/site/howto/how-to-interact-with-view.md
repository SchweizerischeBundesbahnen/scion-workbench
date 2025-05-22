<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
|-----------------|---------------------------------------------|-----------------------------|-----------------------------------|-------------------------------|

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

The view component can inject `WorkbenchView` to interact with the view, such as setting the title or closing the view.

```ts
import {inject} from '@angular/core';
import {WorkbenchView} from '@scion/workbench';

// Set the title.
inject(WorkbenchView).title = 'View title';

// Set the subtitle.
inject(WorkbenchView).heading = 'View Heading';

// Mark the view dirty.
inject(WorkbenchView).dirty = true;

// Close the view.
inject(WorkbenchView).close();

// Test if the view is active.
const isActive = inject(WorkbenchView).active;

// And more...
```

Some properties can also be defined on the route, such as title, heading or CSS class(es).

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';
import {WorkbenchRouteData} from '@scion/workbench';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      {
        path: 'path/to/view',
        loadComponent: () => import('./view/view.component'),
        data: {
          [WorkbenchRouteData.title]: 'View Title',
          [WorkbenchRouteData.heading]: 'View Heading',
          [WorkbenchRouteData.cssClass]: ['class 1', 'class 2'],
        },
      },
    ]),
  ],
});
````

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
