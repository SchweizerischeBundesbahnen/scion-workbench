# [19.0.0-beta.2](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/19.0.0-beta.1...19.0.0-beta.2) (2025-01-31)


### Bug Fixes

* **workbench/view:** prevent cropping the last view tab ([6ea7c92](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/6ea7c925ee7b4f4a189a8530fa75cc2b8428985f))


### Features

* **workbench/part:** enable displaying content in workbench parts ([2e9404e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/2e9404e9c53551e7af481287c3907e25f23512ba))
* **workbench/part:** align part actions to the right ([df309be](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/df309be9960cfd9bc57ea20f6e5e0bcb9c81bde1))
* **workbench/part:** enable updating part actions ([774d59b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/774d59be73ee84ff663392378ba272f4c0541ea8))
* **workbench/view:** enable updating view menu items ([ff4f83e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ff4f83e58b60719517fd16ae47f9299da31f731f))


### BREAKING CHANGES

* **workbench/part:** Default part action alignment is now to the right.

  To align an action to the left, set its alignment to `start`.

* **workbench/part:** The registration of part actions via `WorkbenchService.registerPartAction` method has changed. The declarative contribution of part actions via `wbPartAction` directive has not changed.

  To migrate:
  - Part actions now require a `ComponentType` or `TemplateRef` instead of a CDK portal. Pass data through input properties or a custom injector. See examples below.
  - The signature of `WorkbenchService.registerPartAction` has changed. Register the action using a factory function. Previously, no factory function was required.
    ```ts
    inject(WorkbenchService).registerPartAction(() => ActionComponent);
    ```

    For more control, return an object literal:
    ```ts
    inject(WorkbenchService).registerPartAction(() => {
      return {
        content: ActionComponent,
        align: 'end',
      };
    });
    ```
  - `WorkbenchService.registerPartAction` runs the passed function in a reactive context. Use Angular's `untracked` function to execute code outside the reactive context.
  - `WorkbenchPartAction.canMatch` property has been removed. Instead, move the condition to the factory function, returning `null` to not match a part.
    ```ts
    inject(WorkbenchService).registerPartAction(part => {
      return part.isInMainArea ? ActionComponent : null; // matches parts in the main area
    });
    ```

  **Example for passing data via inputs:**
  ```ts
  inject(WorkbenchService).registerPartAction(() => {
    return {
      content: ActionComponent,
      inputs: {
        data: 'value',
      },
    };
  });
  ```

  If using a component, inputs are available as input properties.
  ```ts
  @Component({...})
  class ActionComponent {
    data = input.required<string>();
  }
  ```

  If using a template, inputs are available for binding via local template let declarations.
  ```html
  <ng-template let-data="data">
    ...
  </ng-template>
  ```

  **Example for passing data via custom injector:**
  ```ts
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

* **workbench/view:** The registration of view menu items via `WorkbenchService.registerViewMenuItem` method has changed. The declarative contribution of menu items via `wbViewMenuItem` directive has not changed.

  To migrate:
  - Menu items now require a `ComponentType` or `TemplateRef` instead of a CDK portal. Pass data through input properties or a custom injector. See examples below.
  - `WorkbenchService.registerViewMenuItem` now runs the passed function in a reactive context. Use Angular's `untracked` function to execute code outside the reactive context.
  - `WorkbenchMenuItemFactoryFn` has been renamed to `WorkbenchViewMenuItemFn`.
  - `WorkbenchView.registerMenuItem` has been removed. Use an `ng-template` with the `wbViewMenuItem` directive or register the menu item via `WorkbenchService.registerViewMenuItem`.
  - `WorkbenchMenuItem.isDisabled` has been renamed to `WorkbenchMenuItem.disabled` and its type changed from `function` to `boolean`. Update the disabled state using signals.

  **Example for passing data via inputs:**
  ```ts
  inject(WorkbenchService).registerViewMenuItem(() => {
    return {
      content: MenuItemComponent,
      inputs: {
        data: 'value',
      },
      onAction: () => {...},
    };
  });
  ```

  If using a component, inputs are available as input properties.
  ```ts
  @Component({...})
  class MenuItemComponent {
    data = input.required<string>();
  }
  ```

  If using a template, inputs are available for binding via local template let declarations.
  ```html
  <ng-template let-data="data">
    ...
  </ng-template>
  ```

  **Example for passing data via custom injector:**
  ```ts
  inject(WorkbenchService).registerViewMenuItem(() => {
    return {
      content: MenuItemComponent,
      onAction: () => {...},
      injector: Injector.create({
        parent: inject(Injector),
        providers: [
          {provide: DI_TOKEN, useValue: 'value'},
        ],
      }),
    };
  });
  ```

### Deprecations

* **workbench:** The configuration for displaying a start page in the workbench has changed.
  - For layouts with a main area:
    The main area must now be navigated. Previously, no navigation was required and the component associated with the empty path route was used as the start page.

    **Example for navigating the main area:**
    ```ts
    bootstrapApplication(AppComponent, {
      providers: [
        provideWorkbench({
          layout: factory => factory
            .addPart(MAIN_AREA)
            .navigatePart(MAIN_AREA, ['path/to/desktop'])
        }),
        provideRouter([
          {
            path: 'path/to/desktop',
            component: DesktopComponent,
          }
        ])
      ]
    });
    ```

    **Example for navigating the main area to the empty path route:**
    ```ts
    bootstrapApplication(AppComponent, {
      providers: [
        provideWorkbench({
          layout: factory => factory
            .addPart(MAIN_AREA)
            .navigatePart(MAIN_AREA, [], {hint: 'desktop'}) // pass hint to match a specific empty path route
        }),
        provideRouter([
          {
            path: '',
            component: DesktopComponent,
            canMatch: [canMatchWorkbenchPart('desktop')] // match only if navigating with the specified hint
          }
        ])
      ],
    });
    ```
  - For layouts without a main area:
    Provide a desktop using an `<ng-template>` with the `wbDesktop` directive. The template content will be used as the desktop content. Previously, the component associated with the empty path route was used as the start page.

    ```html
    <wb-workbench>
      <ng-template wbDesktop>
        Welcome
      </ng-template>
    </wb-workbench>
    ```

* **workbench:** Properties for accessing a view's navigation details have changed.

  Migrate as follows:
  - `WorkbenchView.urlSegments` => `WorkbenchView.navigation.path`
  - `WorkbenchView.navigationHint` => `WorkbenchView.navigation.hint`
  - `WorkbenchView.navigationData` => `WorkbenchView.navigation.data`
  - `WorkbenchView.navigationState` => `WorkbenchView.navigation.state`
