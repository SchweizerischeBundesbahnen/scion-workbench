<a href="/docs/site/application-platform/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench Application Platform"></a>

| SCION Workbench Application Platform | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench Application Platform][menu-home] > [How To Guides][menu-how-to] > Activity

#### How to interact with an activity
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

[menu-how-to]: /docs/site/application-platform/howto/how-to.md

[menu-home]: /docs/site/application-platform/README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
