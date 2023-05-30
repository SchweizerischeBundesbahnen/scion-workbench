<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

### How to provide a view
Any component can be displayed as a view. A view is a regular Angular component associated with a primary route. Depending on the route configuration, the component can be loaded lazily. Below are some examples of most common route configurations.

**Route for loading a component upon application startup**
  
```ts
// Register route
RouterModule.forRoot([
  {path: 'path/to/view', component: ViewComponent},
]);

// Open view
inject(WorkbenchRouter).navigate(['/path/to/view']);
```

**Route for lazy loading a standalone component upon navigation**
    
```ts
// Register route
RouterModule.forRoot([
  {path: 'path/to/view', loadComponent: () => import('./view/view.component')},
]);

// Open view
inject(WorkbenchRouter).navigate(['/path/to/view']);
```

**Route for lazy loading child routes upon navigation** 

```ts
// Register route to load child routes
RouterModule.forRoot([
  {path: 'path/to/module', loadChildren: () => import('./module/routes')},
]);

// Open view
inject(WorkbenchRouter).navigate(['/path/to/module/path/to/view']);
```
```ts
// file: module/routes.ts

export default [
  {path: 'path/to/view', component: ViewComponent},
] satisfies Routes;
```

***

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
