<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
|-----------------|---------------------------------------------|-----------------------------|-----------------------------------|-------------------------------|

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Part

Part actions are displayed in the part bar, enabling interaction with the part, its active view or content. Actions can be aligned to the left or right.

### How to Add a Part Action
Actions can be added declaratively in an HTML template or via `WorkbenchService`.

#### Add a Part Action via HTML Template
Add an `<ng-template>` and decorate it with the `wbPartAction` directive. The template content is used as the action content. The action shares the lifecycle of its embedding context.

```html
<ng-template wbPartAction>
  ...
</ng-template>
```

Part actions are context-sensitive:
- Declaring the action in a part's template displays it only in that part.
- Declaring the action in a view's template displays it only when that view is active.
- Declaring the action outside a part and view context, such as within `<wb-workbench>`, displays it in every part.

A predicate can be used to match a specific context, such as a particular part or condition.

```html
<ng-template wbPartAction [canMatch]="canMatch">
  ...
</ng-template>
```

> [!TIP]
> The function can call `inject` to get required dependencies and runs in a reactive context. The function is called again when tracked signals change.

```ts
import {Component} from '@angular/core';
import {WorkbenchPart} from '@scion/workbench';

@Component({...})
class ActionComponent {
  canMatch = (part: WorkbenchPart): boolean => part.isInMainArea; // matches parts in the main area
}
```

> [!TIP]
> The `WorkbenchPart` is available as the default template variable (`let-part`).

```html
<ng-template wbPartAction let-part>
  ...
</ng-template>
```

#### Add a Part Action via WorkbenchService
Part actions can also be added using a factory function and registered via `WorkbenchService.registerPartAction`. The content can be a component or a template.

```ts
import {inject} from '@angular/core';
import {WorkbenchService} from '@scion/workbench';

inject(WorkbenchService).registerPartAction(() => ActionComponent);
```

The function is called per part. Returning the action adds it to the part, returning `null` skips it.

```ts
import {inject} from '@angular/core';
import {WorkbenchService} from '@scion/workbench';

inject(WorkbenchService).registerPartAction(part => {
  return part.isInMainArea ? ActionComponent : null; // matches parts in the main area
});
```

> [!TIP]
> - For more control, return an object literal.
> - The function can call `inject` to get required dependencies and runs in a reactive context.
 
> [!NOTE]
> The function is called again when tracked signals change.

```ts
import {inject} from '@angular/core';
import {WorkbenchService} from '@scion/workbench';

inject(WorkbenchService).registerPartAction(() => {
  return {
    content: ActionComponent,
    align: 'start',
  };
});
```

Data can be passed to the component or template as inputs:
```ts
import {inject} from '@angular/core';
import {WorkbenchService} from '@scion/workbench';

inject(WorkbenchService).registerPartAction(() => {
  return {
    content: ActionComponent,
    inputs: {
      icon: 'icon',
    },
  };
});
```

If using a component, inputs are available as input properties.
```ts
@Component({...})
class ActionComponent {
  icon = input.required<string>();
}
```

If using a template, inputs are available for binding via local template let declarations.
```html
<ng-template let-icon="icon">
  ...
</ng-template>
```

The component and template can inject the `WorkbenchPart`, either through dependency injection or default template-local variable (`let-part`).

```ts
@Component({...})
class ActionComponent {
  part = inject(WorkbenchPart);
}
```

```html
<ng-template let-part>
  ...
</ng-template>
```

A custom injector can be configured, giving control over the objects available for injection.
```ts
import {inject, Injector} from '@angular/core';
import {WorkbenchService} from '@scion/workbench';

inject(WorkbenchService).registerPartAction(() => {
  return {
    content: ActionComponent,
    injector: Injector.create({
      parent: inject(Injector),
      providers: [
        {provide: DI_TOKEN, useValue: 'value'},
      ],
    }),
  };
});
```


[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
