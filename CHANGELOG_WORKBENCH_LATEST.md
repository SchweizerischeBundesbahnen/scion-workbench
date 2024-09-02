# [18.0.0-beta.5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/18.0.0-beta.4...18.0.0-beta.5) (2024-09-02)


### Bug Fixes

* **workbench/perspective:** support browser back navigation after switching perspective ([5777728](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/57777288c740be813bdaec3f913fedc512ffa4c6)), closes [#579](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/579)


### BREAKING CHANGES

* **workbench/perspective:** The active perspective is now set after navigation completes (previously before navigation), so it is unavailable during route resolution/activation. Route guards (like `canMatch`) should use the `canMatchWorkbenchPerspective` function instead of `WorkbenchService` or `WorkbenchPerspective` to determine the perspective’s activation state.

  **Migration Example:**

  **Before:**
  ```ts
  import {Route} from '@angular/router';
  import {inject} from '@angular/core';
  import {WorkbenchService} from '@scion/workbench';
  
  const route: Route = {
    canMatch: [() => inject(WorkbenchService).activePerspective()?.id === 'perspective'],
    // or
    canMatch: [() => inject(WorkbenchService).perspectives().find(perspective => perspective.id === 'perspective')?.active()],
  };
  ```

  **After:**
  ```ts
  import {Route} from '@angular/router';
  import {canMatchWorkbenchPerspective} from '@scion/workbench';
  
  const route: Route = {
    canMatch: [canMatchWorkbenchPerspective('perspective')],
  };
  ```


