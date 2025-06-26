<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
|-----------------|---------------------------------------------|-----------------------------|-----------------------------------|-------------------------------|

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Routes

Views and parts display content based on Angular's router state, or more precisely, based on the activated routes. Routes are activated through navigation using the `WorkbenchRouter` or the layout's `navigate` method when setting up the workbench layout. The path passed to the navigation determines which route to activate for a view or part. All Angular routing features are supported.

***
**Content:**
- [How to Define Routes](#how-to-define-routes)
- [Lazily Loaded Components](#lazily-loaded-components)
- [Nested Routes](#nested-routes)
- [Multiple Route Files](#multiple-route-files)
- [Using a Router Outlet](#using-a-router-outlet)
- [Workbench-Specific Route Matchers](#workbench-specific-route-matchers)
- [Associating Data with Routes](#associating-data-with-routes)
***

### How to Define Routes
Routes are defined using Angular's `provideRouter()` function. Any route in the configuration can be used to navigate a view or part.

Below is an example with two routes:

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      {path: 'path/to/page1', component: Page1Component},
      {path: 'path/to/page2', component: Page2Component},
    ]),
  ],
});
```

To display `Page1Component` in a view, navigate it as follows:

```ts
import {inject} from '@angular/core';
import {WorkbenchRouter} from '@scion/workbench';

inject(WorkbenchRouter).navigate(['path/to/page1']);
```

To display `Page2Component` in a part, navigate it as follows:

```ts
import {inject} from '@angular/core';
import {WorkbenchRouter} from '@scion/workbench';

inject(WorkbenchRouter).navigate(layout => layout.navigatePart('some-part', ['path/to/page2']));
```

Refer to [How To Navigate Views](how-to-open-view.md) and [How To Navigate Parts](how-to-navigate-part.md) to learn more about navigation.

### Lazily Loaded Components
Components can be loaded lazily to reduce the initial bundle size.

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {PreloadAllModules, provideRouter, withPreloading} from '@angular/router';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      {path: 'path/to/page1', loadComponent: () => import('./components/page1.component')},
      {path: 'path/to/page2', loadComponent: () => import('./components/page2.component')},
    ], withPreloading(PreloadAllModules)), // optional preloading
  ],
});
```

Visit [angular.dev](https://angular.dev/guide/routing/define-routes#loading-route-component-strategies) to learn more about lazy routes.

> [!TIP]
> Lazy loading can be combined with preloading to enhance the user experience by loading components when idle.

### Nested Routes
Routes can be nested, which is useful for guarding multiple routes in one place.

```ts
import {provideRouter} from '@angular/router';
import {canMatchWorkbenchPart, canMatchWorkbenchView} from '@scion/workbench';
import {bootstrapApplication} from '@angular/platform-browser';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      {
        path: '',
        canActivate: [authorizedGuard()],
        children: [
          {path: 'path/to/page1', component: Page1Component},
          {path: 'path/to/page2', component: Page2Component},
        ],
      },
    ]),
  ],
});
```

Visit [angular.dev](https://angular.dev/guide/routing/define-routes#nested-routes) to learn more about nested routes.

### Multiple Route Files
Routes can be split into multiple files:

```ts
import {provideRouter} from '@angular/router';
import {canMatchWorkbenchPart, canMatchWorkbenchView} from '@scion/workbench';
import {bootstrapApplication} from '@angular/platform-browser';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      {path: 'feature-a', loadChildren: () => import('./feature-a-routes')},
      {path: 'feature-b', loadChildren: () => import('./feature-b-routes')},
    ]),
  ],
});
```

Below is an example of the referenced route file:

```ts
import {Routes} from '@angular/router';

export default [
  {path: 'page1', component: Page1Component},
  {path: 'page2', loadComponent: () => import('./components/page2.component')},
] satisfies Routes;
```

### Application with a Router Outlet and Default Route
The application can have a primary router outlet (`<router-outlet/>`) and associate the `WorkbenchComponent` with the default route (`""`), enabling, for example, the redirection of unauthorized users to a forbidden page.

The example below defines a protected empty-path route with two child routes: the default route associated with the `WorkbenchComponent` and another empty-path route as the parent route for view and part routes. We also have a forbidden route, used for redirecting unauthorized users. Unknown URLs redirect to the application's default route (`""`).

```ts
import {CanActivateFn, GuardResult, MaybeAsync, provideRouter, RedirectCommand, Router} from '@angular/router';
import {canMatchWorkbenchOutlet, WorkbenchComponent} from '@scion/workbench';
import {bootstrapApplication} from '@angular/platform-browser';
import {inject} from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      // PROTECTED ROUTES
      {
        path: '',
        canActivate: [authorizedGuard()],
        children: [
          {
            path: '',
            canMatch: [canMatchWorkbenchOutlet(false)],
            component: WorkbenchComponent,
          },
          {
            path: '',
            canMatch: [canMatchWorkbenchOutlet(true)],
            children: [
              {path: 'path/to/page1', component: Page1Component},
              {path: 'path/to/page2', component: Page2Component},
            ],
          },
        ],
      },
      // UNPROTECTED ROUTES
      {
        path: 'forbidden',
        loadComponent: () => import('./components/forbidden.component'),
      },
      {
        path: '**',
        redirectTo: '',
      },
    ]),
  ],
});

/**
 * Sample guard redirecting unauthorized users to the forbidden page.
 */
function authorizedGuard(): CanActivateFn {
  return (): MaybeAsync<GuardResult> => {
    const router = inject(Router);
    const authService = inject(AuthService); // The `AuthService` is illustrative and not part of the Workbench API.

    if (!authService.isAuthorized()) {
      return new RedirectCommand(router.parseUrl('/forbidden'));
    }
    return true;
  };
}
```
> [!IMPORTANT]
> - Guard the application's default route (`""`) with `canMatchWorkbenchOutlet(false)` to prevent matching views and parts.
> - Guard view and part routes with `canMatchWorkbenchOutlet(true)` to prevent matching the primary router outlet.


### Workbench-Specific Route Matchers
The workbench provides a set of `canMatch` guards to match routes only for views or parts.

- **`canMatchWorkbenchOutlet`**\
  Configures a route to only or never match workbench outlets (views, parts, ...). See chapter [Using a Router Outlet](#using-a-router-outlet) for an example.
- **`canMatchWorkbenchView`**\
  Configures a route to only or never match workbench views, or only views navigated with a specific hint.
- **`canMatchWorkbenchPart`**\
  Configures a route to only or never match workbench parts, or only parts navigated with a specific hint.

The functions `canMatchWorkbenchView` and `canMatchWorkbenchPart` can be passed a `boolean` or a `string`. Passing a `boolean` controls whether to match or never match a route for a view or part.
```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';
import {canMatchWorkbenchPart, canMatchWorkbenchView} from '@scion/workbench';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      {path: 'path/to/page1', canMatch: [canMatchWorkbenchView(true)], component: Page1Component},
      {path: 'path/to/page2', canMatch: [canMatchWorkbenchPart(true)], component: Page2Component},
    ]),
  ],
});
```

To match specific views or parts, a hint can be passed instead. The route then matches only views or parts navigated with that hint. This allows for differentiation between routes with identical paths.
For example, multiple views can navigate to the same path while resolving to different routes, such as the empty-path route (`""`) to maintain a clean URL.
```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';
import {canMatchWorkbenchPart, canMatchWorkbenchView} from '@scion/workbench';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      {path: '', canMatch: [canMatchWorkbenchView('search')], component: SearchComponent},
      {path: '', canMatch: [canMatchWorkbenchPart('navigator')], component: NavigatorComponent},
    ]),
  ],
});
```
The first route only matches views navigated with the `search` hint, and the second only parts navigated with the `navigator` hint.

The hint can be passed to the navigation in navigation extras:

```ts
import {inject} from '@angular/core';
import {WorkbenchRouter} from '@scion/workbench';

// Navigate a view to the empty-path route, passing a hint to select the route of the `SearchComponent`.
inject(WorkbenchRouter).navigate([], {hint: 'search'});

// Navigate a part to the empty-path route, passing a hint to select the route of the `NavigatorComponent`.
inject(WorkbenchRouter).navigate(layout => layout.navigatePart('some-part', [], {hint: 'navigator'}));
```

### Associating Data with Routes
The workbench supports associating view-specific data with a route, like a view title or CSS class(es).

```ts
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';
import {WorkbenchRouteData} from '@scion/workbench';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      {
        path: 'path/to/view',
        loadComponent: () => import('./components/view.component'),
        data: {
          [WorkbenchRouteData.title]: 'View Title',
          [WorkbenchRouteData.cssClass]: ['class 1', 'class 2'],
        },
      },
    ]),
  ],
});
```

Alternatively, data can be set in the view using its view handle `WorkbenchView`. Refer to [How to Interact with a View](how-to-interact-with-view.md) for more information.

***
**Further Reading:**
- [How to Open a View](how-to-open-view.md)
- [How to Display Content in a Part](how-to-navigate-part.md)
- [How to Define the Workbench Layout](how-to-define-layout.md)
***

[menu-how-to]: /docs/site/howto/how-to.md
[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
