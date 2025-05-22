<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
|-----------------|---------------------------------------------|-----------------------------|-----------------------------------|-------------------------------|

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

### How to Provide a View
Any component can be displayed as a view. A view is a regular Angular component associated with a route. Below are some examples of common route configurations.

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      {path: 'path/to/view1', component: ViewComponent},
      {path: 'path/to/view2', loadComponent: () => import('./view/view.component')}, // lazy loaded route
      {path: 'path/to/views', loadChildren: () => import('./routes')}, // lazy loaded routes
    ]),
  ],
});
```

```ts
import {Routes} from '@angular/router';

// file: routes.ts
export default [
  {path: 'view3', component: ViewComponent},
  {path: 'view4', loadComponent: () => import('./view/view.component')},
] satisfies Routes;
```

Having defined the routes, views can be opened using the `WorkbenchRouter`.

```ts
import {WorkbenchRouter} from '@scion/workbench';
import {inject} from '@angular/core';

// Open view 1
inject(WorkbenchRouter).navigate(['/path/to/view1']);

// Open view 2
inject(WorkbenchRouter).navigate(['/path/to/view2']);

// Open view 3
inject(WorkbenchRouter).navigate(['/path/to/views/view3']);

// Open view 4
inject(WorkbenchRouter).navigate(['/path/to/views/view4']);
```

The workbench supports associating view-specific data with a route, such as a tile, a heading, or a CSS class.

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
```

Alternatively, the above data can be set in the view by injecting the view handle `WorkbenchView`. See [How to Interact With a View](how-to-interact-with-view.md).

***
**Further Reading:**
- [How to Open a View](how-to-open-view.md)
- [How to Interact With a View](how-to-interact-with-view.md)
- [How to Define the Workbench Layout](how-to-define-layout.md)
***

[menu-how-to]: /docs/site/howto/how-to.md
[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
