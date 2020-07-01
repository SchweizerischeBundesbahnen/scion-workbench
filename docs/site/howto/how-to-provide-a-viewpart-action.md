<a href="/README.md"><img src="/docs/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

#### How to provide a viewpart action
The workbench allows contributing actions to the viewpart action bar located to the right of the view tabs.

Actions can be modelled in a component template, or contributed programmatically with `WorkbenchService`.

To model an action in a component template, add the directive `wbViewPartAction` to an `<ng-template>`. Its content is then used as viewpart action. The action shares the lifecycle of the template.

Modelled actions are scope aware, that is, if contributed in the context of a view, the action is added to the containing viewpart and is only visible when the view is active.

To contribute an action to every viewpart, the action is typically modelled in `app.component.html`, or added via `WorkbenchService`.

##### Example how to provide a viewpart action in a component template

Open the component template and model the action inside a `<ng-template>` decorated with `wbViewPartAction` directive.

```typescript
  <ng-template wbViewPartAction align="end">
    <button [wbRouterLink]="'/welcome'" class="material-icons" [wbRouterLinkExtras]="{activateIfPresent: false}">
      add
    </button>
  </ng-template>
```

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
