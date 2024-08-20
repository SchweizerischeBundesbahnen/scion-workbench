<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

Right-clicking on a view tab opens a context menu, displaying menu items contributed by the application and built-in menu items provided by the workbench. Built-in menu items can be configured via the configuration passed to `provideWorkbench()`. 

### How to contribute a menu item
Menu items can be contributed declaratively from an HTML template or registered programmatically via the `WorkbenchService`.

Declaring a menu item in the HTML template of a workbench view adds it to that view only. To add it to every view, declare it outside a view context, such as in `app.component.html`, or register it programmatically.

#### Contribute a menu item via HTML template
Add a `<ng-template>` to an HTML template and decorate it with the `wbViewMenuItem` directive. The template content is used as the menu item content. The menu item shares the lifecycle of the containing component.

```html
<ng-template wbViewMenuItem [accelerator]="['ctrl', 'b']" (action)="..." let-view>
  Click me
</ng-template>
```

#### Contribute a menu item via WorkbenchService
As an alternative to modeling a menu item in HTML templates, menu items can be contributed programmatically as a factory function registered via the `WorkbenchService.registerViewMenuItem` method.
The function will be invoked when opening a view's context menu. Use the passed view handle to decide whether to display the menu item. The content of the menu item is specified in the form of a CDK portal, i.e., a component portal or a template portal. The component can inject `WorkbenchView`.

```ts
import {WorkbenchMenuItem, WorkbenchService, WorkbenchView} from '@scion/workbench';
import {inject} from '@angular/core';
import {ComponentPortal} from '@angular/cdk/portal';

inject(WorkbenchService).registerViewMenuItem((view: WorkbenchView): WorkbenchMenuItem | null => {
  return {
    portal: new ComponentPortal(YourComponent),
    accelerator: ['ctrl', 'alt', 1],
    group: 'some-group',
    onAction: () => {
      // do something
    },
  };
});
```

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
