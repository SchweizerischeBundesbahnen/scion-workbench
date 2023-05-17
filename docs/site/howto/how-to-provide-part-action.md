<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

Part actions are displayed to the right of the view tabs, either left- or right-aligned. An action can be any content and is either global, associated with a part, or stick to a view. Global actions are displayed in every part. View actions are displayed only if the view is the active view in the part.

### How to provide an action to a part
Actions can be modelled in an HTML template or contributed programmatically via `WorkbenchPart` or `WorkbenchService`.

#### Contribute action via HTML template
Add a `<ng-template>` to an HTML template and decorate it with the `wbPartAction` directive. The template content is used as the action content. The action shares the lifecycle of the template.

```html
<ng-template wbPartAction align="end">
  <button [wbRouterLink]="'/path/to/view'">
    Open View
  </button>
</ng-template>
```

If modelled in a view template, the action sticks to that view, i.e., is only displayed if the view is active.

#### Add action to every part
To add an action to every part, model the action in `app.component.html`, or add it programmatically via `WorkbenchService`. To add it programmatically, inject  `WorkbenchService` and register the action by calling `registerPartAction` and passing the action.

```ts
const workbenchService = inject(WorkbenchService);

workbenchService.registerPartAction({templateOrComponent: {component: MenuComponent, injector: inject(Injector)}});
```

#### Add action to a specific part
To add an action to a specific part, get a reference to the part to which to add the action. Then register the action by calling `registerPartAction` method and passing the action.

```ts
const workbenchService = inject(WorkbenchService);
const part = workbenchService.getPart('part');

part.registerPartAction({templateOrComponent: {component: MenuComponent, injector: inject(Injector)}});
```

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
