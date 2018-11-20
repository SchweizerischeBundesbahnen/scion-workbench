![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to interact with a popup
In the popup component, inject `WorkbenchPopup` to get a handle to the popup. For non Angular applications, get a reference to the handle via `Platform.getService(PopupService)`.

```typescript
@Component({
  ...
  providers: [provideWorkbenchPopup(ContactNewPopupComponent)] ➀
})
export class ContactNewPopupComponent {

  constructor(popup: WorkbenchPopup) { ➁
  }
}
```
|#|Explanation|
|-|-|
|➀|Instructs given class to live in the context of a popup.|
|➁|Injects router to get URL parameters|

This popup handle allows interaction with the popup, e.g. to close it and return a result to the caller.

[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md