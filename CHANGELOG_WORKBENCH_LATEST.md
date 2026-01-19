# [21.0.0-beta.2](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/21.0.0-beta.1...21.0.0-beta.2) (2026-01-19)


### Bug Fixes

* **workbench/dialog:** allow dialog growing beyond context bounds ([6dcddce](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/6dcddce422c9ed5a318015c16c9382d5c0a32bbc)), closes [#730](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/730)
* **workbench/dialog:** prevent dragging user selection when moving dialog (e.g., by previous Ctrl+A) ([e72137a](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e72137ada1083fe4ab9d13ea72e25096db6ae61e))
* **workbench/dialog:** open microfrontend dialog in calling context ([9d1d06f](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/9d1d06f9f079c76558f57edeed658c9acb73abaf))
* **workbench/messagebox:** open microfrontend message box in calling context ([917c683](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/917c68371c6a2490b1cfbacc81cf6a7540133e4f))
* **workbench/popup:** open microfrontend popup in calling context ([992a544](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/992a5446266b8a91221b9f6fca6543d90c636933))


### Features

* **workbench/popup:** add option to position popup relative to context or viewport ([b21b08e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/b21b08eb68c3b54c85fea3ded06a57079e1879f9))
* **workbench:** enable host app to contribute microfrontends for parts and views ([6d8590c](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/6d8590c342f4e1698b7e9335c8f02338ef6b7ba2)), closes [#271](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271)


### BREAKING CHANGES

* **workbench:** The integration of host microfrontends has changed.
  - Dialog, popup, and messagebox microfrontends of the host application now require an empty path.\
    To migrate, set the path in the capability and route to empty string and use the new route matchers `canMatchWorkbenchDialogCapability`, `canMatchWorkbenchPopupCapability`, or `canMatchWorkbenchMessageBoxCapability`, respectively.

    Example — route matching a dialog capability with qualifier `{dialog: 'about'}`
    ```ts
    import {Routes} from '@angular/router';
    import {canMatchWorkbenchDialogCapability} from '@scion/workbench';
  
    const routes: Routes = [
      {path: '', canMatch: [canMatchWorkbenchDialogCapability({dialog: 'about'})], component: AboutComponent},
    ];
    ```

    Since the path must be empty, capability parameters cannot be referenced in the path anymore.\
    To migrate, inject `ActivatedMicrofrontend` in the microfrontend component to read the passed parameters.

    Example — inject `ActivatedMicrofrontend` in a host microfrontend to read capability and parameters:
    ```ts
    import {inject} from '@angular/core';
    import {ActivatedMicrofrontend} from '@scion/workbench';
  
    const {capability, params} = inject(ActivatedMicrofrontend);
    ```
  - Host dialog microfrontends must now inject `WorkbenchDialog` from `@scion/workbench` (previously from `@scion/workbench-client`).
  - Host messagebox microfrontends must now inject `WorkbenchDialog` from `@scion/workbench` (previously from `@scion/workbench-client`).
  - Host popup microfrontends must now inject `WorkbenchPopup` from `@scion/workbench` (previously from `@scion/workbench-client`).
  - Host popup microfrontends can read deprecated referrer information from the deprecated `WORKBENCH_POPUP_REFERRER` DI token (previously from `WorkbenchClient`).

### Dependencies

* **workbench:** SCION Workbench requires `@scion/workbench-client` version `1.0.0-beta.37` or later.
