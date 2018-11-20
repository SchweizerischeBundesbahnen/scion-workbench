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
@Component({...})
export class PersonComponent {

 constructor(private view: WorkbenchView) {
 }

 public onClose(): void {
   this.view.close();
 }
}
```

### Closing view(s) via navigation
Views can also be closed via router. This is useful if having to close views outside of a view context, e.g. when deleting some data to close related views.

Navigate to the views to be closed with the flag `closeIfPresent` set to `true`.

Similar to when opening a view, closing can be done from within a template or via router service.

 ```html
<a [wbRouterLink]="[...]" [wbRouterLinkExtras]="{closeIfPresent: true}">
```

```typescript
const extras: WbNavigationExtras = {closeIfPresent: true};
workbenchRouter.navigate([...], extras);
```

[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md