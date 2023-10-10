<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

### How to provide a view
Any component can be displayed as a view. A view is a regular Angular component associated with a route. Below are some examples of common route configurations.

```ts
// Routes
RouterModule.forRoot([
  {path: 'path/to/view1', component: ViewComponent},
  {path: 'path/to/view2', loadComponent: () => import('./view/view.component')}, // lazy loaded route
  {path: 'path/to/views', loadChildren: () => import('./routes')}, // lazy loaded routes
]);
```

```ts
// file: routes.ts
export default [
  {path: 'view3', component: ViewComponent},
  {path: 'view4', loadComponent: () => import('./view/view.component')},
] satisfies Routes;
```

Having defined the routes, views can be opened using the `WorkbenchRouter`.

```ts
// Open view 1
inject(WorkbenchRouter).navigate(['/path/to/view1']);

// Open view 2
inject(WorkbenchRouter).navigate(['/path/to/view2']);

// Open view 3
inject(WorkbenchRouter).navigate(['/path/to/views/view3']);

// Open view 4
inject(WorkbenchRouter).navigate(['/path/to/views/view4']);
```

The workbench supports associating view-specific data with a route, such as a tile, a heading, or a CSS class. Alternatively, this data can be set in the view by injecting the view handle `WorkbenchView`.

```ts
RouterModule.forRoot([
  {
    path: 'path/to/view',
    loadComponent: () => import('./view/view.component'),
    data: {
      [WorkbenchRouteData.title]: 'View Title',
      [WorkbenchRouteData.heading]: 'View Heading',
      [WorkbenchRouteData.cssClass]: 'e2e-view',
    },
  },
])
```

***
#### Related Links:
- [Learn how to open a view.][link-how-to-open-view] 
- [Learn how to define an initial layout.][link-how-to-define-initial-layout] 
***

[link-how-to-open-view]: /docs/site/howto/how-to-open-view.md
[link-how-to-define-initial-layout]: /docs/site/howto/how-to-define-initial-layout.md

[menu-how-to]: /docs/site/howto/how-to.md
[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
