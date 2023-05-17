<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

Similar to Angular, the workbench provides a router for view navigation. View navigation is based on Angular's routing mechanism and thus supports lazy component loading, resolvers, browser back/forward navigation, persistent navigation, and more. A view can inject `ActivatedRoute` to read path parameters, query parameters and data associated with the route.

### How to open a view

A view is opened using the `WorkbenchRouter`. Like the Angular router, the workbench router has a `navigate` method that is passed an array of commands and optional navigation extras to control navigation.

```ts
const wbRouter = inject(WorkbenchRouter);

wbRouter.navigate(['path/to/view']);
```

Navigation is absolute unless providing a `relativeTo` route in navigation extras.
```ts
const wbRouter = inject(WorkbenchRouter);
const relativeTo = inject(ActivatedRoute);

// Relative navigation
wbRouter.navigate(['../path/to/view'], {relativeTo});
```

The navigation can be passed additional data in the form of matrix params. Matrix params do not affect route or view resolution. The view can read matrix params from `ActivatedRoute.params`. 

```ts
const wbRouter = inject(WorkbenchRouter);
const relativeTo = inject(ActivatedRoute);

const matrixParams = {param1: 'value1', param2: 'value2'};
wbRouter.navigate(['path/to/view', matrixParams]);
```

### How to control the navigation target
By default, the router opens a new view if no view is found that matches the specified path. Matrix parameters do not affect view resolution. If a view matching the path is already open, it will be navigated instead of opening a new view, e.g., to bring it to the front or update matrix parameters.

The default behavior can be overridden by specifying a `target` via navigation extras.

|Target|Explanation|Default|
|-|-|-|
|`auto`|Navigates existing view(s) that match the path, or opens a new view otherwise. Matrix params do not affect view resolution.|yes|
|`blank`|Navigates in a new view.||
|`<view.id>`|Navigates the specified view. If already opened, replaces it, or opens a new view otherwise.||

### How to navigate in a template
The workbench provides the `wbRouterLink` directive for navigation in a template. The `wbRouterLink` directive is the workbench equivalent of the Angular `routerLink`.

```html
<a [wbRouterLink]="['../path/to/view']">Link</a>
```

If in the context of a view in the main area and CTRL (Mac: ⌘, Windows: ⊞) key is not pressed, by default, navigation replaces the content of the current view. Override this default behavior by setting a view target strategy in navigation extras.

```html
<a [wbRouterLink]="['../path/to/view']" [wbRouterLinkExtras]="{target: 'blank'}">Link</a>
```

By default, navigation is relative to the currently activated route, if any. Prepend the path with a forward slash `/` to navigate absolutely, or set `relativeTo` property in navigational extras to `null`. 

***
#### Related Links:
- [Learn how to provide a view.][link-how-to-provide-view]
- [Learn how to define an initial layout.][link-how-to-define-initial-layout]
***

[link-how-to-provide-view]: /docs/site/howto/how-to-provide-view.md
[link-how-to-define-initial-layout]: /docs/site/howto/how-to-define-initial-layout.md

[menu-how-to]: /docs/site/howto/how-to.md
[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
