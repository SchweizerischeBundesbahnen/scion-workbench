<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Layout

This chapter requires a perspective to be registered. See [Providing a Perspective][link-how-to-provide-perspective] to learn how to provide a perspective.

### How to query perspectives
Perspectives can be queried using the `WorkbenchService` via the `WorkbenchService.perspectives` or `WorkbenchService.perspectives$` properties.

### How to switch a perspective
Perspectives can be switched via the `WorkbenchService` by calling the `WorkbenchService.switchPerspective()` method.

### How to reset a perspectives
The active perspective can be reset to its initial layout via the `WorkbenchService` by calling the `WorkbenchService.resetPerspective()` method.

### How to test if a perspective is active
A perspective can be tested to be active using its perspective handle `WorkbenchPerspective`. The handle can be obtained via `WorkbenchService`.

***
The following code snippet illustrates how to query perspectives. The example renders a button for each perspective. Clicking a perspective button activates the perspective. The button is labeled with the name of the perspective as provided to the perspective registration.  

```ts
@Component({...})
export class PerspectivesComponent {

  constructor(public workbenchService: WorkbenchService) {
  }
}
```

```html
@for (perspective of workbenchService.perspectives$ | async; track perspective) {
  <button (click)="workbenchService.switchPerspective(perspective.id)"
          [class.active]="perspective.active$ | async">
    {{perspective.data['label']}}
  </button>
}
```
***

[link-how-to-provide-perspective]: /docs/site/howto/how-to-provide-perspective.md

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
