# [1.0.0-beta.28](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.27...workbench-client-1.0.0-beta.28) (2024-11-25)


### Features

* **workbench-client/view:** add functional `CanClose` guard, deprecate class-based guard ([ecd52b3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ecd52b3afe82c0e1353cf96be550f925e76a72d5))


### Deprecations

* **workbench-client/view:** The class-based `CanClose` guard has been deprecated in favor of a functional guard that can be registered on `WorkbenchView.canClose`.

  Migrate by registering a callback on `WorkbenchView.canClose` instead of implementing the `CanClose` interface.

  **Before migration:**
  ```ts
  import {CanClose, WorkbenchView} from '@scion/workbench-client';
  import {Beans} from '@scion/toolkit/bean-manager';
  
  export class ViewComponent implements CanClose {
  
    constructor() {
      Beans.get(WorkbenchView).addCanClose(this);
    }
  
    public canClose(): boolean {
      return true;
    }
  }
  ```

  **After migration:**
  ```ts
  import {WorkbenchView} from '@scion/workbench-client';
  import {Beans} from '@scion/toolkit/bean-manager';
  
  export class ViewComponent {
  
    constructor() {
      Beans.get(WorkbenchView).canClose(() => {
        return true;
      });
    }
  }
  ```
