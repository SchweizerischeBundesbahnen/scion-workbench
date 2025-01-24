<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

Part actions are displayed in the part bar, enabling interaction with the part and its content. Actions can be aligned to the left or right.

### How to add a part action
Actions can be added declaratively in an HTML template or via `WorkbenchService`.

Actions are context-sensitive:
- Declaring an action in a part's template displays it only in that part.
- Declaring an action in a view's template displays it only in that view.

To contribute an action based on other conditions, declare it as a child of `<wb-workbench>` or register it via `WorkbenchService`.

#### Contribute an action via HTML template
Add the directive `wbPartAction` to an `<ng-template>`. The template content will be used as the action content. The action shares the lifecycle of its embedding context.

```html
<ng-template wbPartAction>
  <button [wbRouterLink]="'/path/to/view'">
    Open View
  </button>
</ng-template>
```

#### Contribute an action via WorkbenchService
As an alternative to modeling an action in HTML templates, actions can be contributed using the `WorkbenchService.registerPartAction` method. The content is specified in the form of a CDK portal, i.e., a component portal or a template portal.

```ts
import {inject} from '@angular/core';
import {WorkbenchService} from '@scion/workbench';
import {ComponentPortal} from '@angular/cdk/portal';

inject(WorkbenchService).registerPartAction({portal: new ComponentPortal(YourComponent)});
```

#### Use a condition to control contribution 
The action can be configured with a `canMatch` function to match a specific context, such as a particular part or condition. Defaults to any context.

```html
<wb-workbench>
  <ng-template wbPartAction [canMatch]="canMatch">
    <button [wbRouterLink]="'/path/to/view'">
      Open View
    </button>
  </ng-template>
</wb-workbench>
```

The following function contributes the action only to parts in the perspective 'MyPerspective' located in the main area.

```ts
import {inject} from '@angular/core';
import {CanMatchPartFn, WorkbenchPart, WorkbenchService} from '@scion/workbench';

const canMatch: CanMatchPartFn = (part: WorkbenchPart): boolean => {
  if (inject(WorkbenchService).activePerspective()?.id === 'MyPerspective') {
    return false;
  }
  if (!part.isInMainArea) {
    return false;
  }
  return true;
};
```

#### Control alignment
By default, actions are aligned to the start, which can be changed using the `align` property.

```html
<ng-template wbPartAction align="end">
  ...
</ng-template>
```


[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
