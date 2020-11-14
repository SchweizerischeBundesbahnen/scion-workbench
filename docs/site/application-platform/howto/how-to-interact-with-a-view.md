<a href="/docs/site/application-platform/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench Application Platform"></a>

| SCION Workbench Application Platform | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench Application Platform][menu-home] > [How To Guides][menu-how-to] > View

#### How to interact with a view
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

[menu-how-to]: /docs/site/application-platform/howto/how-to.md

[menu-home]: /docs/site/application-platform/README.md
[menu-projects-overview]: https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/projects-overview.md
[menu-changelog]: https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/changelog/changelog.md
[menu-contributing]: https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/CONTRIBUTING.md
[menu-sponsoring]: https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/sponsoring.md
