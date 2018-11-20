![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to close a view

A view can be closed in three ways:
- by the user if closing the view tab (if the view is closable)
- in the view component via `WorkbenchView` handle
- via view navigation

### Closing the current view
Inject `WorkbenchView` handle and invoke `close` method.

```typescript
@Component({
  ...
  providers: [
    provideWorkbenchView(ContactViewComponent)
  ]
})
export class ContactViewComponent {

 constructor(private view: WorkbenchView) {
 }

 public onClose(): void {
   this.view.close();
 }
}
```

> For non Angular applications, close the current view via `Platform.getService(ViewService).close();`.


### Closing view(s) via navigation
Views can also be closed via router. This is useful if having to close views outside of a view context, e.g. when deleting some data to close related views.

Navigate to the views to be closed with the flag `closeIfPresent` set to `true`.

Similar to when opening a view, closing can be done from within a template or via router service.

 ```html
<a [wbRouterLink]="{...}" [wbRouterLinkExtras]="{closeIfPresent: true}">
```

```typescript
const qualifier: Qualifier = {...};
const extras: WbNavigationExtras = {closeIfPresent: true};
workbenchRouter.navigate(qualifier, extras);
```
> For Angular applications, inject `WorkbenchRouter`.

> For non Angular applications, get the router service via `Platform.getService(WorkbenchRouter)`.


[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md