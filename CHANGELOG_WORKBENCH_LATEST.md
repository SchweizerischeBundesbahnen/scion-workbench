# [18.0.0-beta.8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/18.0.0-beta.7...18.0.0-beta.8) (2024-10-28)


### Bug Fixes

* **workbench/popup:** ensure the popup anchor not leaving view boundaries ([c629f49](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/c629f49f3ba520c2cd700a008e4ed0af1c86e01f))
* **workbench/view:** ensure view overlays align with view boundaries when view position changes ([2998295](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/29982951bf8290108d3b09104ebc456f3acb9f6c))


### Features

* **workbench:** prevent tracking unwanted dependencies in effects ([7a7eaf8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/7a7eaf847f3ed54dcc7eeab300cbde53700b8e46))


### BREAKING CHANGES

* **workbench:** SCION Workbench requires `@scion/toolkit` version `1.6.0` or later.
* **workbench:** SCION Workbench requires `@scion/components` version `18.1.1` or later.
* **workbench:** Calling following workbench methods in a reactive (tracking) context (e.g., `effect`) now throws an error. Migrate by using Angular's `untracked()` function.
  - `WorkbenchRouter.navigate`
  - `WorkbenchService.registerPerspective`
  - `WorkbenchService.switchPerspective`
  - `WorkbenchService.resetPerspective`
  - `WorkbenchService.closeViews`
  - `WorkbenchService.switchTheme`
  - `WorkbenchService.registerPartAction`
  - `WorkbenchService.registerViewMenuItem`
  - `WorkbenchLauncher.launch`
  - `WorkbenchDialogService.open`
  - `WorkbenchMessageBoxService.open`
  - `NotificationService.notify`
  - `PopupService.open`
  - `WorkbenchPart.activate`
  - `WorkbenchView.activate`
  - `WorkbenchView.close`
  - `WorkbenchView.move`
  - `WorkbenchView.registerMenuItem`
  - `WorkbenchDialog.close`
  - `Popup.close`
  
  **Migration Example**
  ```ts
  import {effect, inject, untracked} from '@angular/core';
  import {WorkbenchRouter} from '@scion/workbench';
  
  const workbenchRouter = inject(WorkbenchRouter);
  
  // Before
  effect(() => {
    if (someSignal()) {
      workbenchRouter.navigate(['path/to/view']);
    }
  });
  
  // After
  effect(() => {
    if (someSignal()) {
      untracked(() => workbenchRouter.navigate(['path/to/view']));
    }
  });
  ```



