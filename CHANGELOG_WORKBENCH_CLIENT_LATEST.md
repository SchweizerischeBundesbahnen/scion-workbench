# [1.0.0-beta.29](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.28...workbench-client-1.0.0-beta.29) (2025-06-06)


### Code Refactoring

* **workbench-client/messagebox:** remove deprecated API to open a message box ([e385c2c](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e385c2ca2fa300cef81ce724728167d4cd48a72f))
* **workbench-client/view:** remove deprecated API to prevent view from closing ([9f9bf91](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/9f9bf91b5abe2642fc81d00d6d434360863e512f))


### BREAKING CHANGES

* **workbench-client:** SCION Workbench Client now requires `@scion/toolkit` version `1.6.0` or higher.
  For more information, refer to the changelog of `@scion/toolkit`: https://github.com/SchweizerischeBundesbahnen/scion-toolkit/blob/master/CHANGELOG_TOOLKIT.md.

* **workbench-client:** SCION Workbench Client now requires `@scion/microfrontend-platform` version `1.4.0` or higher.
  For more information, refer to the changelog of `@scion/microfrontend-platform`: https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/blob/master/CHANGELOG.md.

* **workbench-client/messagebox:** Removed deprecated API to open a message box.

  To migrate:
  - To display a text message, pass the message as the first argument, not via the `content` property in the options.
  - To display a custom message box, pass the qualifier as the first argument and options, if any, as the second argument.

  **Example migration to display a text message**
  ```ts
  // Before Migration
  inject(WorkbenchMessageBoxService).open({
    content: 'Do you want to continue?',
    actions: {yes: 'Yes', no: 'No'},
  });
  
  // After Migration
  inject(WorkbenchMessageBoxService).open('Do you want to continue?', {
    actions: {yes: 'Yes', no: 'No'},
  });
  ```

  **Example migration to open a custom message box capability**
  ```ts
  // Before Migration
  inject(WorkbenchMessageBoxService).open({
    title: 'Unsaved Changes',
    params: {changes: ['change 1', 'change 2']},
    actions: {yes: 'Yes', no: 'No'},
    },
    {confirmation: 'unsaved-changes'},
  );
  
  // After Migration
  inject(WorkbenchMessageBoxService).open({confirmation: 'unsaved-changes'}, {
    title: 'Unsaved Changes',
    params: {changes: ['change 1', 'change 2']},
    actions: {yes: 'Yes', no: 'No'},
  });
  ```
* **workbench-client/view:** Removed deprecated API to prevent view from closing.

  To migrate, register a callback on `WorkbenchView.canClose` instead of implementing the `CanClose` interface.

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
