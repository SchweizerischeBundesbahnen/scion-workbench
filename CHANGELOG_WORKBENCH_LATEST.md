# [17.0.0-beta.3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/17.0.0-beta.2...17.0.0-beta.3) (2024-01-23)


### Bug Fixes

* **workbench/dialog:** consider minimum size in resizing constraints ([408676c](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/408676c63da6d6395b0e93113165674eb5d758d2))
* **workbench/dialog:** do not block dialogs of other views ([0c1b88e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0c1b88e3209b9eab7b1929a579bf7dc426a1821e))
* **workbench/dialog:** propagate view context ([c22222f](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/c22222fa20e0f5f50f27998b2ad3955d6a91d57e))
* **workbench/popup:** propagate view context ([31e9700](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/31e97005fcb0875fd5530396dc91fb2ba59012cf))
* **workbench/message-box:** open message box in a dialog ([bdcd02b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/bdcd02be5661df895703a685d7b5d2e974fe64c5)), closes [#438](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/438)
* **workbench:** throw error for objects not available for dependency injection ([a36ae5e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a36ae5ece28a157a31a236821274fec97344b345))


### Features

* **workbench/dialog:** support custom header and footer ([5c6a4d6](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/5c6a4d66f7b98215334e80a5c00aeb78950b94c3))


### BREAKING CHANGES

* **workbench/message-box:** Consolidation of the MessageBox API has introduced a breaking change.

  Refer to the documentation for migration examples: https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/howto/how-to-open-message-box.md

  To migrate:
  - `MessageBoxService` is now `WorkbenchMessageBoxService`.
  - `MessageBoxConfig` is now `WorkbenchMessageBoxOptions`.
  - Signature of `WorkbenchMessageBoxService#open` method has changed. Pass the message (text or component) as the first argument, not via options object.
  - `injector` option has been moved to a top-level property (previously `MessageBoxConfig#componentConstructOptions`).
  - `viewContainerRef` option has been removed (no replacement).
  - `componentInput` option has been renamed to `inputs` with the type changed to a dictionary. Inputs are now available as input properties in the component, previously via `MessageBox#input` handle.
  - `MessageBox` handle has been removed. Configure the message box when opening the message box.
  - Registration of custom action handlers has been removed (no replacement).
  - Pressing the Escape key no longer closes the message box for an action with the 'close' key.

* **workbench/dialog:** Support for custom header and footer has introduced a breaking change.

  To migrate:
  - Type of `WorkbenchDialog.padding` is now `boolean`. Set to `false` to remove the padding, or set the CSS variable `--sci-workbench-dialog-padding` for a custom padding.
  - `--sci-workbench-dialog-header-divider-color` CSS variable has been removed (no replacement).
