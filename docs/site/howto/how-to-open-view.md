<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
|-----------------|---------------------------------------------|-----------------------------|-----------------------------------|-------------------------------|

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

The SCION Workbench provides a router for view navigation. A view can inject `ActivatedRoute` to get parameters passed to the navigation and read data associated with the route.

***
**Content:**
- [How to Open a View](#how-to-open-a-view)
- [How to Control the Navigation Target](#how-to-control-the-navigation-target)
- [How to Differentiate Between Routes with an Identical Path](#how-to-differentiate-between-routes-with-an-identical-path)
- [How to Navigate in a Template](#how-to-navigate-in-a-template)
***

### How to Open a View

To open a view, use the `WorkbenchRouter`. It has a `navigate` method like the Angular router. This method takes an array of commands and extras to control navigation.

```ts
import {inject} from '@angular/core';
import {WorkbenchRouter} from '@scion/workbench';

inject(WorkbenchRouter).navigate(['path/to/view']);
```

Set up the route for the view in Angular's router configuration:

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      {path: 'path/to/view', component: ViewComponent},
    ]),
  ],
});
```

Refer to [How To Define Routes](how-to-define-routes.md) to learn more about routes.

The navigation is absolute unless providing a `relativeTo` route in navigation extras.
```ts
import {inject} from '@angular/core';
import {WorkbenchRouter} from '@scion/workbench';
import {ActivatedRoute} from '@angular/router';

const relativeTo = inject(ActivatedRoute);

// Navigate relative to a route.
inject(WorkbenchRouter).navigate(['../path/to/view'], {relativeTo});
```

Additional data can be passed to the navigation as matrix parameters or navigation data. Matrix parameters are added to the path, while navigation data is stored in the layout. Unlike matrix parameters, navigation data can be passed to an empty-path navigation. The view can read matrix parameters from `ActivatedRoute.params` and navigation data from `WorkbenchView.navigation.data`.

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

### How to Differentiate Between Routes with an Identical Path
The workbench router supports passing a hint to the navigation to differentiate between routes with an identical path.

For example, views of the initial layout or a perspective are usually navigated to the empty-path route to maintain a clean URL,
requiring a navigation hint to differentiate between the routes.

Like the path, a hint affects view resolution. If set, the router will only navigate views with an equivalent hint, or if not set, views without a hint.

The following example defines two empty-path routes, using the `canMatchWorkbenchView` guard to match if navigating with a specific hint. 

```ts
import {inject} from '@angular/core';
import {canMatchWorkbenchView, WorkbenchRouter} from '@scion/workbench';
import {provideRouter} from '@angular/router';
import {bootstrapApplication} from '@angular/platform-browser';

// Navigate to the empty-path route, passing a hint to select the route of the `SearchComponent`.
inject(WorkbenchRouter).navigate([], {hint: 'search'});

// Navigate to the empty-path route, passing a hint to select the route of the `NavigatorComponent`.
inject(WorkbenchRouter).navigate([], {hint: 'navigator'});

// Routes
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      // Search View
      {path: '', canMatch: [canMatchWorkbenchView('search')], component: SearchComponent},
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
- [How to Define Routes](how-to-define-routes.md)
- [How to Interact with a View](how-to-interact-with-view.md)
- [How to Define the Workbench Layout](how-to-define-layout.md)
***

[menu-how-to]: /docs/site/howto/how-to.md
[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
