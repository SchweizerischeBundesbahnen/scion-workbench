<a href="/docs/site/application-platform/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench Application Platform"></a>

| SCION Workbench Application Platform | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench Application Platform][menu-home] > [How To Guides][menu-how-to] > View

#### How to navigate to a view

##### 1. Declare the intent (if invoking an external view)

If the view is provided by another application, open your application manifest and declare the respective intent:
  
```javascript
{
  "intents": [
    {
      "type": "view",
      "qualifier": {...} ➀
    }
  ]
}
```
|#|Explanation|
|-|-|
|➀|Declares the qualifier of the view to open. This step is only required for views provided by other applications.|

##### 2. Navigate to the view

For Angular applications, there are two ways to navigate to a view, either from within the template or in the component.

- **Navigate from within the template**

    In its simplest form, decorate a hyperlink with `wbRouterLink` directive and provide the respective qualifier.

    ```html
    <a [wbRouterLink]="{...}"➀>Open some view</a>
    ```
    |#|Explanation|
    |-|-|
    |➀|Sets the qualifier of the view to open, e.g `{entity: 'contact', id: 5}`.|

    Additionally, router link allows providing some options to control the navigation, like whether to open the view in a new view-tab. Options are provided with `wbRouterLinkExtras` directive.

    ```html
    <a [wbRouterLink]="{...}" [wbRouterLinkExtras]="{activateIfPresent: false, target: 'blank'}">
    ```

    > Default behavior if using [wbRouterLink]:\
    If in the context of a view and CTRL or META (Mac: ⌘, Windows: ⊞) key is pressed, by default, the view is opened in a new view tab (or activated if present). If CTRL key is not pressed, by default, the content of the current view is replaced.

- **Navigate in the component**

    To navigate in the component, inject `WorkbenchRouter` and navigate to the view.

    Like in the directive, it allows providing some options to control the navigation.

    ```typescript
    const qualifier: Qualifier = {...};
    const extras: WbNavigationExtras = {
      target: 'blank',
      queryParams: {...},
    };
    workbenchRouter.navigate(qualifier, extras);
    ```

> For non Angular applications, get the router service via `Platform.getService(WorkbenchRouter)`.

Following properties are supported in `WbNavigationExtras`:

|property|type|description|
|-|-|-|
|queryParams|dictionary|Specifies optional query parameters to open the view.|
|matrixParams|dictionary|Specifies optional matrix parameters to open the view.<br>Matrix parameters can be used to associate optional data with the URL and are like regular URL parameters, but do not affect route resolution.|
|activateIfPresent|boolean|Activates the view if it is already present. If not present, the view is opened according to the specified 'target' strategy.|
|target|blank&nbsp;\|&nbsp;self|Controls where to open the view.<p>blank: opens the view as a new workbench view (which is by default)<br>self:  opens the view in the current workbench view|
|closeIfPresent|boolean|Closes the view if present. Has no effect if no view is present which matches the qualifier.|


[menu-how-to]: /docs/site/application-platform/howto/how-to.md

[menu-home]: /docs/site/application-platform/README.md
[menu-projects-overview]: https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/projects-overview.md
[menu-changelog]: https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/changelog/changelog.md
[menu-contributing]: https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/CONTRIBUTING.md
[menu-sponsoring]: https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/sponsoring.md
