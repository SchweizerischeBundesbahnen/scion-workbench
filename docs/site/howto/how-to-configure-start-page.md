<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

### How to configure a start page
The workbench installs a primary router outlet when the main area is blank, i.e., no view is opened. By registering an empty path route, a component can be displayed instead. 

```ts
RouterModule.forRoot([
  {path: '', loadComponent: () => import('./start-page/start-page.component')},
]);
```

### How to configure a start page per perspective

If working with perspectives, configure a different start page per perspective by testing for the active perspective in the `canMatch` route handler.

```ts
RouterModule.forRoot([
  // Match this route only if 'perspective A' is active.
  {
    path: '', 
    loadComponent: () => import('./perspective-a/start-page.component'), 
    canMatch: [() => inject(WorkbenchService).getPerspective('perspective-a')?.active]
  },
  // Match this route only if 'perspective B' is active.
  {
    path: '',
    loadComponent: () => import('./perspective-b/start-page.component'),
    canMatch: [() => inject(WorkbenchService).getPerspective('perspective-b')?.active]
  },
]);
```

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
