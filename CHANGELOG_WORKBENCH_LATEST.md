# [20.0.0-beta.1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/19.0.0-beta.3...20.0.0-beta.1) (2025-06-06)


### Features

* **workbench:** add support for Angular 20 ([ff042a9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ff042a931e4d87ad261213d4e81eb0a3e5cf598b))


### Code Refactoring

* **workbench/view:** remove deprecated API to prevent view from closing ([c4bcf00](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/c4bcf009c4ff1be445909193d925825bb717d1af))
* **workbench/popup:** remove deprecated `referrer` field ([d9021da](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/d9021da5f70608ee7436fa24ae6939351c849c77))


### BREAKING CHANGES

* **workbench:** Updating `@scion/workbench` to Angular 20 introduced a breaking change.
  Update your application to Angular 20. For detailed migration instructions, refer to Angular's update guide: https://v20.angular.dev/update-guide.

* **workbench:** SCION Workbench now requires `@scion/toolkit` version `1.6.0` or higher.
  For more information, refer to the changelog of `@scion/toolkit`: https://github.com/SchweizerischeBundesbahnen/scion-toolkit/blob/master/CHANGELOG_TOOLKIT.md.

* **workbench:** SCION Workbench now requires `@scion/components` version `20.0.0` or higher.
  For more information, refer to the changelog of `@scion/components`: https://github.com/SchweizerischeBundesbahnen/scion-toolkit/blob/master/CHANGELOG_COMPONENTS.md.

* **workbench:** SCION Workbench now requires `@scion/microfrontend-platform` version `1.4.0` or higher.
  For more information, refer to the changelog of `@scion/microfrontend-platform`: https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/blob/master/CHANGELOG.md.

* **workbench/view:** Removed deprecated API to prevent view from closing.
  To migrate, register a callback on `WorkbenchView.canClose` instead of implementing the `CanClose` interface.

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

* **workbench/popup:** Removed deprecated `Popup.referrer` field.
  Inject `WorkbenchView` instead.
