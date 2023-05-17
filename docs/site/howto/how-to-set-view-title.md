<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

### How to set a view title
Title and heading of a view can be set either in the route definition or in the view by injecting the view handle `WorkbenchView`.

#### Set view title in route definition
Associate the route with view title and heading, as follows:

```ts
RouterModule.forRoot([
  {
    path: 'path/to/view',
    loadComponent: () => import('./view/view.component'),
    data: {
      [WorkbenchRouteData.title]: 'View Title',
      [WorkbenchRouteData.heading]: 'View Heading',
    },
  },
])
```

#### Set view title in view component
Inject `WorkbenchView` and set title and heading, as follows:

```typescript
inject(WorkbenchView).title = 'View title';
inject(WorkbenchView).heading = 'View Heading';
```

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
