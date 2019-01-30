![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to interact with an activity
In the activity component, inject `WorkbenchActivity` to get a handle to the activity. For non Angular applications, get a reference to the handle via `Platform.getService(ActivityService)`.

```typescript
@Component({
  ...
  providers: [provideWorkbenchActivity(ContactActivityComponent)] ➀
})
export class ContactActivityComponent {

  constructor(activity: WorkbenchActivity) { ➁
  }
}
```
|#|Explanation|
|-|-|
|➀|Instructs given class to live in the context of an activity.|
|➁|Injects router to get URL parameters|

This activity handle allows interaction with the activity, e.g. to change the activity panel width.

[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md
