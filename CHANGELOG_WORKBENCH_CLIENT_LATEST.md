# [1.0.0-beta.22](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.21...workbench-client-1.0.0-beta.22) (2024-05-07)


### Bug Fixes

* **workbench-client/view:** fix issues to prevent a view from closing ([a280af9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a280af9011cb87bc97e4f29a78fbe3b54d05efb3)), closes [#27](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/27) [#344](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/344)


### Refactor

* **workbench-client/router:** remove `blank` prefix from navigation extras ([446fa51](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/446fa51c24f1e616a1e4ebd80f42cfc9300b6970))


### BREAKING CHANGES

* **workbench-client/view:** Interface and method for preventing closing of a view have changed.

  To migrate, implement the `CanClose` instead of the `ViewClosingListener ` interface.

  **Before migration:**
  ```ts
  class YourComponent implements ViewClosingListener {
   
    constructor() {
      Beans.get(WorkbenchView).addClosingListener(this);
    }
   
    public async onClosing(event: ViewClosingEvent): Promise<void> {
      // invoke 'event.preventDefault()' to prevent closing the view.
    }
  }
  ```

  **After migration:**

  ```ts
  class YourComponent implements CanClose {
   
    constructor() {
      Beans.get(WorkbenchView).addCanClose(this);
    }
   
    public async canClose(): Promise<boolean> {
      // return `true` to close the view, otherwise `false`.
    }
  }
  ```

* **workbench-client/router:** Property `blankInsertionIndex` in `WorkbenchNavigationExtras` has been renamed.

  Use `WorkbenchNavigationExtras.position` instead of `WorkbenchNavigationExtras.blankInsertionIndex`.

* **workbench-client/view:** Changed type of view id from `string` to `ViewId`.

  If storing the view id in a variable, change its type from `string` to `ViewId`.



