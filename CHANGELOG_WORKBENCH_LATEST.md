# [17.0.0-beta.8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/17.0.0-beta.7...17.0.0-beta.8) (2024-05-07)


### Bug Fixes

* **workbench/view:** fix issues to prevent a view from closing ([a280af9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a280af9011cb87bc97e4f29a78fbe3b54d05efb3)), closes [#27](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/27) [#344](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/344)
* **workbench/view:** update view properties when navigating an open view ([02a24ff](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/02a24ff443c28630c455c6df9c1b368d7fb01e02))


### Code Refactoring

* **workbench/router:** remove `blank` prefix from navigation extras ([446fa51](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/446fa51c24f1e616a1e4ebd80f42cfc9300b6970))
* **workbench/router:** remove option to close view via workbench router link ([88d1704](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/88d170410eff006c313f4be598853fd207dd4a3a))


### Dependencies

* **workbench:** require Angular version 17.0.6 or later to fix angular/angular[#53239](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/53239) ([dd78d07](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/dd78d0711fe4f462889708f59c573a64c2380e56))


### Features

* **workbench/router:** control workbench part to navigate views ([0bf35a7](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0bf35a7f59927037f18e46e3ad1720460bbd0bbc))
* **workbench/router:** provide API to modify the workbench layout ([46ea446](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/46ea4469dab2743aef414d8d85460ef1e7293eeb))
* **workbench/router:** support navigation to children of the empty path route ([da578a9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/da578a9244ad9db753751c875009ec89df847197)), closes [#487](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/487)
* **workbench:** provide function to set up the SCION Workbench ([1a506ef](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/1a506ef35b36147c81a4c99465eadabe35e830e3))
* **workbench:** support navigation of views in the initial layout (or perspective) ([1ffd757](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/1ffd7579fcfb574b7581b58138001b569ab47303)), closes [#445](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/445)


### BREAKING CHANGES

* **workbench/view:** Interface and method for preventing closing of a view have changed.

  To migrate, implement the `CanClose` instead of the `WorkbenchViewPreDestroy` interface.

  **Before migration:**
  ```ts
  class YourComponent implements WorkbenchViewPreDestroy {
    public async onWorkbenchViewPreDestroy(): Promise<boolean> {
      // return `true` to close the view, otherwise `false`.
    }
  }
  ```

  **After migration:**

  ```ts
  class YourComponent implements CanClose {
    public async canClose(): Promise<boolean> {
      // return `true` to close the view, otherwise `false`.
    }
  }
  ```
* **workbench/router:** Property `blankInsertionIndex` in `WorkbenchNavigationExtras` has been renamed.

  To migrate, update to the latest version of `@scion/workbench-client` and use `WorkbenchNavigationExtras.position` instead of `WorkbenchNavigationExtras.blankInsertionIndex`.
* **workbench/router:** Property `blankPartId` in `WorkbenchNavigationExtras` has been renamed.

  To migrate, use `WorkbenchNavigationExtras.partId` instead of `WorkbenchNavigationExtras.blankPartId`.
* **workbench:** Views in the initial layout (or perspective) must now be navigated.

  Previously, no explicit navigation was required because views and routes were coupled via route outlet and view id.

  **Migrate the layout as follows:**

  Explicitly navigate views, passing an empty array of commands and the view id as navigation hint.

  ```ts
  // Before Migration
  provideWorkbench({
    layout: (factory: WorkbenchLayoutFactory) => factory
      .addPart(MAIN_AREA)
      .addPart('left', {relativeTo: MAIN_AREA, align: 'left'})
      .addView('navigator', {partId: 'left', activateView: true}),
  });
  
  // After Migration
  provideWorkbench({
    layout: (factory: WorkbenchLayoutFactory) => factory
      .addPart(MAIN_AREA)
      .addPart('left', {relativeTo: MAIN_AREA, align: 'left'})
      .addView('navigator', {partId: 'left', activateView: true})
      // Navigate view, passing hint to match route.
      .navigateView('navigator', [], {hint: 'navigator'}),
  });
  ```

  **Migrate the routes as follows:**
    - Remove the `outlet` property;
    - Add `canMatchWorkbenchView` guard and initialize it with the hint passed to the navigation;

  ```ts
  // Before Migration
  provideRouter([
    {
      path: '',
      outlet: 'navigator',
      loadComponent: () => ...,
    },
  ]);
  
  // After Migration
  provideRouter([
    {
      path: '',
      // Match route only if navigated with specified hint.
      canMatch: [canMatchWorkbenchView('navigator')],
      loadComponent: () => ...,
    },
  ]);
  ```
* **workbench:** Changed type of view id from `string` to `ViewId`.

  If storing the view id in a variable, change its type from `string` to `ViewId`.
* **workbench/router:** Removed the option to close a view via the `wbRouterLink` directive.

  The router link can no longer be used to close a view. To close a view, use the `WorkbenchView`, the `WorkbenchRouter`, or the `WorkbenchService` instead.

  Examples:
  ```ts
  // Closing a view via `WorkbenchView` handle
  inject(WorkbenchView).close();
  
  // Closing view(s) via `WorkbenchRouter`
  inject(WorkbenchRouter).navigate(['path/*/view'], {close: true});
  
  // Closing view(s) via `WorkbenchService`
  inject(WorkbenchService).closeViews('view.1', 'view.2');
  ```
* **workbench:** SCION Workbench requires Angular version 17.0.6 or later to fix angular/angular#53239



