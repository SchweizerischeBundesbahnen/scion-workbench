# [17.0.0-beta.7](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/17.0.0-beta.6...17.0.0-beta.7) (2024-03-29)


### Bug Fixes

* **workbench/view:** do not overwrite CSS classes set in different scopes ([02bc372](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/02bc372892e9f48765390d0aa7fbeacfca28d172)), closes [#394](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/394)
* **workbench/view:** handle `undefined` keydown event key ([66358dd](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/66358ddc56639106d7010771cbb1452d97cca5eb))
* **workbench/view:** render tab content when dragging view quickly into the window ([73645d8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/73645d8c0874199f087bb611e2424f68a5eda22d))


### Code Refactoring

* **workbench/dialog:** consolidate API for closing a dialog ([40414c4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/40414c4a891a037f70d2c6b3309b48abba3a8e59))
* **workbench/view:** move navigational state from route data to view handle ([3d6a5ca](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/3d6a5ca1ffb16abacbb9b29c9ea2ec98027b09de))


### Features

* **workbench/dialog:** enable microfrontend display in a dialog ([11d762b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/11d762bb40539fdbdc263da8faf2177423a68d43))


### BREAKING CHANGES

* **workbench/dialog:** The method `closeWithError` has been removed from the `WorkbenchDialog` handle. Instead, pass an `Error` object to the `close` method.

  #### Before

  ```ts
  import {WorkbenchDialog} from '@scion/workbench';
  
  inject(WorkbenchDialog).closeWithError('some error');
  ```

  #### After

  ```ts
  import {WorkbenchDialog} from '@scion/workbench';
  
  inject(WorkbenchDialog).close(new Error('some error'));
  ```
* **workbench/view:** Removed `WorkbenchView.cssClasses` property for reading CSS classes. Use `WorkbenchView.cssClass` for both reading and setting CSS class(es) instead.
* **workbench/view:** Moving navigational state to the view handle has introduced a breaking change.

  To migrate, read the navigational view state from the view handle instead of the activated route data, as follows: `WorkbenchView.state`.


