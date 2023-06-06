<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

Part actions are displayed to the right of the view tabs, either left- or right-aligned. A part action can have any content and be associated with specific view(s), part(s), and/or an area. For example, if associated with a view, the action is only displayed when that view is active.

### How to provide a part action
Actions can be modelled in an HTML template or contributed programmatically via `WorkbenchService`.

#### Contribute an action via HTML template
Add a `<ng-template>` to an HTML template and decorate it with the `wbPartAction` directive. The template content is used as the action content. The action shares the lifecycle of the respective component.

```html
<ng-template wbPartAction align="end">
  <button [wbRouterLink]="'/path/to/view'">
    Open View
  </button>
</ng-template>
```

By default, if modeled in a view template, the action is associated with the view, i.e., it is displayed only if the view is active. To contribute an action to any part, model the action in the body of `wb-workbench` element.

```html
<wb-workbench>
  <ng-template wbPartAction align="end">
    <button [wbRouterLink]="'/path/to/view'">
      Open View
    </button>
  </ng-template>
</wb-workbench>
```

#### Contribute an action via WorkbenchService
As an alternative to modeling an action in HTML templates, actions can be contributed programmatically using the `WorkbenchService.registerPartAction` method. The content is specified in the form of a CDK portal, i.e., a component portal or a template portal.

```ts
const workbenchService = inject(WorkbenchService);

workbenchService.registerPartAction({
  portal: new ComponentPortal(YourComponent),
  align: 'end',
});
```

#### Control where to contribute an action
Actions can be associated with specific view(s), part(s), and/or an area. By default, if not modeled in the context of a view, an action is contributed to all parts.

```html
<wb-workbench>
  <ng-template wbPartAction [part]="['console', 'navigator']">
    <button [wbRouterLink]="'/path/to/view'">
      Open View
    </button>
  </ng-template>
</wb-workbench>
```

Or if registering the action programmatically:

```ts
const workbenchService = inject(WorkbenchService);

workbenchService.registerPartAction({
  portal: new ComponentPortal(YourComponent),
  target: {
    part: ['console', 'navigator'],
  },
});
```

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
