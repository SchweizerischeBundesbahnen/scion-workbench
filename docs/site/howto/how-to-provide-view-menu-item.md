<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

Right-clicking on a view tab opens a context menu to interact with the view and its content.

### How to contribute to the view context menu
Context menu items can be added declaratively in an HTML template or via `WorkbenchService`.

#### Add a menu item via HTML template
Add an `<ng-template>` and decorate it with the `wbViewMenuItem` directive. The template content will be used as the menu item content. The menu item shares the lifecycle of its embedding context.

```html
<ng-template wbViewMenuItem [accelerator]="['ctrl', 'alt', '1']" (action)="...">
  ...
</ng-template>
```

Menu items are context-sensitive:
- Declaring the menu item in a view's template displays it only in the context menu of that view.
- Declaring the menu item outside a view context, such as within `<wb-workbench>`, displays it in the context menu of every view.

A predicate can be used to match a specific context, such as a particular view or condition.

```html
<ng-template wbViewMenuItem [canMatch]="canMatch">
  ...
</ng-template>
```

The function can call `inject` to get required dependencies and runs in a reactive context. The function is called again when tracked signals change.

```ts
import {Component} from '@angular/core';
import {WorkbenchView} from '@scion/workbench';

@Component({...})
class MenuItemComponent {
  canMatch = (view: WorkbenchView): boolean => view.part().isInMainArea; // matches views in the main area
}
```

The `WorkbenchView` is available as the default template variable (`let-view`).

```html
<ng-template wbViewMenuItem let-view>
  ...
</ng-template>
```

#### Add a menu item via WorkbenchService
Menu items can also be added using a factory function and registered via `WorkbenchService.registerViewMenuItem`. The content can be a component or a template.

```ts
import {inject} from '@angular/core';
import {WorkbenchService} from '@scion/workbench';

inject(WorkbenchService).registerViewMenuItem(() => ({
  content: MenuItemComponent,
  accelerator: ['ctrl', 'alt', '1'],
  group: 'some-group',
  onAction: () => {
    // do something
  },
}));
```

The function is called per view. Returning the menu item adds it to the context menu of the view, returning `null` skips it.

```ts
import {inject} from '@angular/core';
import {WorkbenchService} from '@scion/workbench';

inject(WorkbenchService).registerViewMenuItem(view => {
  if (!view.part().isInMainArea) { // matches views in the main area
    return null;
  }
  return {
    content: MenuItemComponent,
    onAction: () => {
      // do something
    },
  };
});
```

The function can call `inject` to get required dependencies and runs in a reactive context. The function is called again when tracked signals change.

Data can be passed to the component or template as inputs:

```ts
import {inject} from '@angular/core';
import {WorkbenchService} from '@scion/workbench';

inject(WorkbenchService).registerViewMenuItem(() => ({
  content: MenuItemComponent,
  input: {
    text: 'Do something...',
  },
  onAction: () => {
    // do something
  },
}));
```

If using a component, inputs are available as input properties.

```ts
@Component({...})
class MenuItemComponent {
  text = input.required<string>();
}
```

If using a template, inputs are available for binding via local template let declarations.

```html
<ng-template let-text="text">
  ...
</ng-template>
```

The component and template can inject the `WorkbenchView`, either through dependency injection or default template-local variable (`let-view`).

```ts
@Component({...})
class MenuItemComponent {
  view = inject(WorkbenchView);
}
```

```html
<ng-template let-view>
  ...
</ng-template>
```

A custom injector can be configured, giving control over the objects available for injection.

```ts
import {inject, Injector} from '@angular/core';
import {WorkbenchService} from '@scion/workbench';

inject(WorkbenchService).registerViewMenuItem(() => ({
  content: MenuItemComponent,
  injector: Injector.create({
    parent: inject(Injector),
    providers: [
      {provide: DI_TOKEN, useValue: 'value'},
    ],
  }),
  onAction: () => {
    // do something
  },
}));
```

### Built-in context menu items
Built-in context menu items can be customized or removed via configuration passed to `provideWorkbench()`. For example, to translate menu items or use different accelerators.

```ts
import {inject} from '@angular/core';
import {provideWorkbench, WorkbenchService} from '@scion/workbench';

provideWorkbench({
  viewMenuItems: {
    close: {
      text: () => inject(TranslateService).translate('close'), // translate menu item
      accelerator: ['F4'], // use different accelerator
    },
    closeAll: false, // remove from context menu
  },
});
```


[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
