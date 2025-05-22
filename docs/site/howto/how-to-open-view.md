<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
|-----------------|---------------------------------------------|-----------------------------|-----------------------------------|-------------------------------|

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

Similar to Angular, the workbench provides a router for view navigation. View navigation is based on Angular's routing mechanism and thus supports lazy component loading, resolvers, browser back/forward navigation, persistent navigation, and more. A view can inject `ActivatedRoute` to obtain parameters passed to the navigation and/or read data associated with the route.

### How to Open a View

A view is opened using the `WorkbenchRouter`. Like the Angular router, the workbench router has a `navigate` method that is passed an array of commands and optional navigation extras to control the navigation.

```ts
import {inject} from '@angular/core';
import {WorkbenchRouter} from '@scion/workbench';

inject(WorkbenchRouter).navigate(['path/to/view']);
```

The navigation is absolute unless providing a `relativeTo` route in navigation extras.
```ts
import {inject} from '@angular/core';
import {WorkbenchRouter} from '@scion/workbench';
import {ActivatedRoute} from '@angular/router';

const relativeTo = inject(ActivatedRoute);

// Navigate relative to a route.
inject(WorkbenchRouter).navigate(['../path/to/view'], {relativeTo});
```

Additional data can be passed to the navigation as matrix parameters or navigation data. Matrix parameters are added to the path, while navigation data is stored in the layout. Unlike matrix parameters, navigation data can be passed to empty path navigations. The view can read matrix parameters from `ActivatedRoute.params` and navigation data from `WorkbenchView.navigation.data`.

```ts
import {inject} from '@angular/core';
import {WorkbenchRouter} from '@scion/workbench';

// Pass matrix parameters to the view.
inject(WorkbenchRouter).navigate(['path/to/view', {some: 'param'}]);

// Pass navigation data to the view.
inject(WorkbenchRouter).navigate(['path/to/view'], {data: {some: 'data'}});
```

### How to Control the Navigation Target
By default, the router navigates existing views that match the path, or opens a new view otherwise. Matrix params do not affect view resolution.

The default behavior can be overridden by specifying a `target` in navigation extras.

| Target     | Explanation                                                                                                               | Default |
|------------|---------------------------------------------------------------------------------------------------------------------------|---------|
| `auto`     | Navigates existing views that match the path, or opens a new view otherwise. Matrix params do not affect view resolution. | yes     |
| `blank`    | Opens a new view and navigates it.                                                                                        |         |
| `<viewId>` | Navigates the specified view. If already opened, replaces it, or opens a new view otherwise.                              |         |

### How to differentiate between routes with an identical path
The workbench router supports passing a hint to the navigation to differentiate between routes with an identical path.

For example, views of the initial layout or a perspective are usually navigated to the empty path route to maintain a clean URL,
requiring a navigation hint to differentiate between the routes.

Like the path, a hint affects view resolution. If set, the router will only navigate views with an equivalent hint, or if not set, views without a hint.

The following example defines two empty path routes, using the `canMatchWorkbenchView` guard to match if navigating with a specific hint. 

```ts
import {inject} from '@angular/core';
import {canMatchWorkbenchView, WorkbenchRouter} from '@scion/workbench';
import {provideRouter} from '@angular/router';
import {bootstrapApplication} from '@angular/platform-browser';

// Navigate to the empty path route, passing a hint to select the route of `OutlineComponent`.
inject(WorkbenchRouter).navigate([], {hint: 'outline'});

// Navigate to the empty path route, passing a hint to select the route of `NavigatorComponent`.
inject(WorkbenchRouter).navigate([], {hint: 'navigator'});

// Routes
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      // Outline View
      {path: '', canMatch: [canMatchWorkbenchView('outline')], component: OutlineComponent},
      // Navigator View
      {path: '', canMatch: [canMatchWorkbenchView('navigator')], component: NavigatorComponent},
    ]),
  ],
});
```

### How to Navigate in a Template
The workbench provides the `wbRouterLink` directive for navigation in a template. The `wbRouterLink` directive is the workbench equivalent of the Angular `routerLink`.

Use this directive to navigate the current view. If the user presses the CTRL key (Mac: ⌘, Windows: ⊞), this directive will open a new view.

```html
<a [wbRouterLink]="['../path/to/view']">Link</a>
```
You can override the default behavior by setting an explicit navigation target in navigation extras.

```html
<a [wbRouterLink]="['../path/to/view']" [wbRouterLinkExtras]="{target: 'blank'}">Link</a>
```

By default, navigation is relative to the currently activated route, if any.

Prepend the path with a forward slash `/` to navigate absolutely, or set `relativeTo` property in navigational extras to `null`.

```html
<a [wbRouterLink]="['/path/to/view']">Link</a>
```

***
**Further Reading:**
- [How to Provide a View](how-to-provide-view.md)
- [How to Define the Workbench Layout](how-to-define-layout.md)
***

[menu-how-to]: /docs/site/howto/how-to.md
[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
