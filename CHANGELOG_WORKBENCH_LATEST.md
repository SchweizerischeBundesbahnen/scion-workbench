# [18.0.0-beta.9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/18.0.0-beta.8...18.0.0-beta.9) (2024-11-25)


### Bug Fixes

* **workbench/view:** invoke `CanClose` guard in view injection context ([07ba936](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/07ba93604ec6862936a11badf6957d8582a0b687)), closes [#578](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/578)
* **workbench/view:** prevent `CanClose` guard from blocking workbench navigation ([12e9e91](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/12e9e9140cf8db11c8fc188f463503ccaaf35195)), closes [#558](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/558)
* **workbench/view:** prevent closing views with a pending `CanClose` guard ([4326a63](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/4326a63665ac8a40bfb040250f9a66c582aed7c6))


### Features

* **workbench/view:** add functional `CanClose` guard, deprecate class-based guard ([c2ee531](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/c2ee531d483dbdbff72d468592908bb346002278))


### Deprecations

* **workbench/view:** The class-based `CanClose` guard has been deprecated in favor of a functional guard that can be registered on `WorkbenchView.canClose`.

  Migrate by registering a callback on `WorkbenchView.canClose` instead of implementing the `CanClose` interface.

  **Before migration:**
  ```ts
  import {CanClose} from '@scion/workbench';
  import {Component} from '@angular/core';
  
  @Component({})
  export class ViewComponent implements CanClose {
  
    public canClose(): boolean {
      return true;
    }
  }
  ```

  **After migration:**
  ```ts
  import {Component, inject} from '@angular/core';
  import {WorkbenchView} from '@scion/workbench';
  
  @Component({})
  export class ViewComponent {
  
    constructor() {
      inject(WorkbenchView).canClose(() => {
        return true;
      });
    }
  }
  ```
