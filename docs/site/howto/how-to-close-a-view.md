<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

#### How to close a view

A view can be closed in three ways:
- by the user if closing the view tab (if the view is closable)
- in the view component via `WorkbenchView` handle
- via view navigation

#### Closing the current view
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

#### Closing view(s) via navigation
Views can also be closed via router. This is useful if having to close views outside of a view context, e.g. when deleting some data to close related views.

Navigate to the views to be closed with the flag `close` set to `true`.

Similar to when opening a view, closing can be done from within a template or via router service.

 ```html
<a [wbRouterLink]="[...]" [wbRouterLinkExtras]="{close: true}">
```

```typescript
const extras: WbNavigationExtras = {close: true};
workbenchRouter.navigate([...], extras);
```

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
