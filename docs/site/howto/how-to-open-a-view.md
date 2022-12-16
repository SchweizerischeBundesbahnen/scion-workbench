<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

#### How to open a view
A view is a visual workbench element which the user can flexibly arrange in the view grid. Views are the principal elements to show data to the user.

There are two ways to navigate to a view, either from within the template or in the component.

- **Navigate from within the template**

  In its simplest form, decorate a hyperlink with `wbRouterLink` directive and provide the commands.

  ```html
  <a [wbRouterLink]="[...]"➀>Open some view</a>
  ```
  |#|Explanation|
  |-|-|
  |➀|Sets the routing path, e.g `['/persons', person.id]`.|

  Additionally, router link allows providing some options to control the navigation, like whether to open the view in a new view-tab. Options are provided with `wbRouterLinkExtras` directive.

    ```html
    <a [wbRouterLink]="[...]" [wbRouterLinkExtras]="{target: 'blank', activate: false}">
    ```

    > Default behavior if using [wbRouterLink]:\
    If in the context of a view and CTRL or META (Mac: ⌘, Windows: ⊞) key is pressed, by default, the view is opened in a new view tab (but not activated). If CTRL or META key is not pressed, by default, the content of the current view is replaced.


- **Navigate in the component**

  To navigate in the component, inject `WorkbenchRouter` and navigate to the view.

  Like in the directive, it allows providing some options to control the navigation.

  ```typescript
  const extras: WbNavigationExtras = {
    target: 'blank',
    queryParams: {...},
  };
  workbenchRouter.navigate([...], extras);
  ```

> Technically, every view has a separate router outlet. For every primary route, the platform creates corresponding auxiliary routes. Thus, it allows showing any routed component in a view. By changing the path of a view-outlet in the URL, you can control which component to display.

> `WorkbenchRouter` and  `wbRouterLink` both navigate based on the provided array of commands, thus routing is like 'Router.navigate(...)' of Angular, but with a workbench view as the target outlet.

> If using `wbRouterLink`, by default, navigation is relative to the currently activated route. Prepend the path with a forward slash '/' to navigate absolutely, or set `relativeTo` property in navigational extras to `null`. Unlike `wbRouterLink`, if using `WorkbenchRouter` service, navigation is always absolute.

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
