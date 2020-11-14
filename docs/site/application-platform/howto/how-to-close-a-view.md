<a href="/docs/site/application-platform/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench Application Platform"></a>

| SCION Workbench Application Platform | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench Application Platform][menu-home] > [How To Guides][menu-how-to] > View

#### How to close a view

A view can be closed in three ways:
- by the user if closing the view tab (if the view is closable)
- in the view component via `WorkbenchView` handle
- via view navigation

##### Closing the current view
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


##### Closing view(s) via navigation
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


[menu-how-to]: /docs/site/application-platform/howto/how-to.md

[menu-home]: /docs/site/application-platform/README.md
[menu-projects-overview]: https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/projects-overview.md
[menu-changelog]: https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/changelog/changelog.md
[menu-contributing]: https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/CONTRIBUTING.md
[menu-sponsoring]: https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/sponsoring.md
