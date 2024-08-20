<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

Part actions are displayed to the right of the view tabs and enable interaction with the part and its content.

### How to contribute a part action
Actions can be contributed declaratively from an HTML template or registered programmatically via the `WorkbenchService`.

Declaring an action in the HTML template of a workbench view displays it only if that view is active. To display it for every view or based on some condition, declare it outside a view context, such as in `app.component.html`, or register it programmatically.

Specifying a `canMatch` function enables the action to match a specific part, parts in a specific area, or parts from a specific perspective.

The alignment of an action in the action bar can be controlled with the `align` property.


#### Contribute an action via HTML template
Add a `<ng-template>` to an HTML template and decorate it with the `wbPartAction` directive. The template content is used as the action content. The action shares the lifecycle of the containing component.

```html
<ng-template wbPartAction align="end">
  <button [wbRouterLink]="'/path/to/view'">
    Open View
  </button>
</ng-template>
```

#### Contribute an action via WorkbenchService
As an alternative to modeling an action in HTML templates, actions can be contributed programmatically using the `WorkbenchService.registerPartAction` method. The content is specified in the form of a CDK portal, i.e., a component portal or a template portal.

```ts
import {inject} from '@angular/core';
import {WorkbenchService} from '@scion/workbench';
import {ComponentPortal} from '@angular/cdk/portal';

inject(WorkbenchService).registerPartAction({
  portal: new ComponentPortal(YourComponent),
  align: 'end',
});
```

#### Control into which part to contribute an action
The action can be configured with a `canMatch` function to match a specific part, parts in a specific area, or parts from a specific perspective.

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

public canMatch: CanMatchPartFn = (part: WorkbenchPart): boolean => {
  if (!inject(WorkbenchService).getPerspective('MyPerspective')?.active) {
    return false;
  }
  if (!part.isInMainArea) {
    return false;
  }
  return true;
};
```

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
