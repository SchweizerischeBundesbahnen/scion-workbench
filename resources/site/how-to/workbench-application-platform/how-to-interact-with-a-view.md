![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to interact with a view
In the view component, inject `WorkbenchView` to get a handle to the view. For non Angular applications, get a reference to the handle via `Platform.getService(ViewService)`.

```typescript
@Component({
  ...
  providers: [provideWorkbenchView(ContactViewComponent)] ➀
})
export class ContactViewComponent {

  constructor(view: WorkbenchView) { ➁
  }
}
```
|#|Explanation|
|-|-|
|➀|Instructs given class to live in the context of a view.|
|➁|Injects router to get URL parameters|

This view handle allows interaction with the view, e.g. to change properties or to close it.

[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md