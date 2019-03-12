![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to provide a viewpart action
The workbench allows contributing actions to the viewpart action bar located to the right of the view tabs.

Actions can be modelled in a component template, or contributed programmatically with `WorkbenchService`.

To model an action in a component template, add the directive `wbViewPartAction` to an `<ng-template>`. Its content is then used as viewpart action. The action shares the lifecycle of the template.

Modelled actions are scope aware, that is, if contributed in the context of a view, the action is added to the containing viewpart and is only visible when the view is active.

To contribute an action to every viewpart, the action is typically modelled in `app.component.html`, or added via `WorkbenchService`.

### Example how to provide a viewpart action in a component template

Open the component template and model the action inside a `<ng-template>` decorated with `wbViewPartAction` directive.

```typescript
  <ng-template wbViewPartAction align="end">
    <button [wbRouterLink]="'/welcome'" class="material-icons" [wbRouterLinkExtras]="{activateIfPresent: false}">
      add
    </button>
  </ng-template>
```

[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md
