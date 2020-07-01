<a href="/docs/site/application-platform/README.md"><img src="/docs/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench Application Platform"></a>

| SCION Workbench Application Platform | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench Application Platform][menu-home] > [How To Guides][menu-how-to] > Popup

#### How to interact with a popup
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

[menu-how-to]: /docs/site/application-platform/howto/how-to.md

[menu-home]: /docs/site/application-platform/README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
