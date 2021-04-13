<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| [SCION Workbench][menu-home] | [Projects Overview][menu-projects-overview] | Changelog | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [Changelog][menu-changelog] > Workbench Client (@scion/workbench-client)


# [1.0.0-beta.6](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.5...workbench-client-1.0.0-beta.6) (2021-04-13)


### Features

* **workbench/popup:** allow the host app to provide popup capabilities ([a4e74b1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a4e74b1430c8cc3dc8fbc9c8de90f6f1d738dab6)), closes [#270](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/270)


### BREAKING CHANGES

* **workbench/popup:** Adding support for opening a popup of the host app from within a microfrontend introduced a breaking change in the host/client
  communication protocol.

  The communication protocol between host and client HAS CHANGED for opening a popup. You need to update host and clients to the new version simultaneously. The API has not changed; the breaking change applies only to the version of `@scion/workbench` and `@scion/workbench-client`. To migrate, upgrade to `@scion/workbench@11.0.0-beta.7` and `@scion/workbench-client@1.0.0-beta.6`, respectively.



# [1.0.0-beta.5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.4...workbench-client-1.0.0-beta.5) (2021-02-12)


### Bug Fixes

* **workbench-client/router:** provide microfrontends with the most recent view capability ([0b8f140](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0b8f140fcc87f5aa2b3672a0e939db9b2c91d993))


### Code Refactoring

* **workbench/popup:** configure contextual reference(s) via context object ([0591e7a](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0591e7a1e0c7080888b4a697ee70995dcb9cbbfc))


### BREAKING CHANGES

* **workbench/popup:** Changed popup config for passing contextual reference(s)

  To migrate: Set a popup's view reference via `PopupConfig#context#viewId` instead of `PopupConfig#viewRef`.



# [1.0.0-beta.4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.3...workbench-client-1.0.0-beta.4) (2021-02-10)


### Features

* support for merging parameters in self navigation ([a984ace](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a984ace36cdb66e34b25f1f62fc73bb71b36308e)), closes [#259](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/259)



# [1.0.0-beta.3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.2...workbench-client-1.0.0-beta.3) (2021-02-03)


### Bug Fixes

* **workbench-client/message-box:** provide the messagebox capability under the type `messagebox` instead of `message-box` ([ad15ba1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ad15ba1497ccac391eaa4c5ea11f83506510736e))
* **workbench-client/routing:** allow view navigation without specifying navigation extras ([4ade8a9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/4ade8a985b0dc8e9e86e72900a25b82f897a4810))


### Features

* **workbench/microfrontend:** upgrade to @scion/microfrontend-platform@1.0.0-beta.11 ([11c2f20](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/11c2f20d00d8a73f0fa32ec738bf4378971c5648))



# [1.0.0-beta.2](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.1...workbench-client-1.0.0-beta.2) (2021-01-25)


### Bug Fixes

* **workbench:** start microfrontend platform outside the Angular zone ([296f6b0](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/296f6b037a42c697c85c4b8974e4ce8884bf18ca))


### Code Refactoring

* **workbench-client/message-box:** consolidate message box API to be consistent with the popup API ([4a386c3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/4a386c3147b6c3c663ff86f636a883fcd9e896af))
* **workbench-client/notification:** consolidate notification API to be consistent with the message box and popup API ([162a70d](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/162a70d1fc6d7c8c2badd646d88a04befb4a1417))


### Features

* **workbench-client/message-box:** allow messages to be displayed from microfrontends ([30aef07](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/30aef07bf6cf9db5f267afd4560aedae79bd1ebe))
* **workbench-client/notification:** allow notifications to be displayed from microfrontends ([4757ac3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/4757ac3fb050692e1b4b6b56ec0691431cae98d8))
* **workbench-client/popup:** allow providing a microfrontend for display in a workbench popup ([bc23e65](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/bc23e65e835ba48bd71a762823b2cab0621a588f))
* **workbench/popup:** allow to open a popup from a screen coordinate and bind it to the lifecycle of a view ([864d75c](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/864d75c98172b49aa80ffd5b8ab4981107a60ef0))


### BREAKING CHANGES

* **workbench-client/notification:** The refactoring of the notification introduced a breaking change as properties were renamed:

    - To display a notification, pass a `NotificationConfig` instead of a `Notification` object. The `Notification` object is now used exclusively as the handle for injection into the notification component. It has the following new methods: `setTitle`, `setSeverity`, `setDuration`, `setCssClass`.
    - If passing data to the notification component, set it via `componentInput` config property instead of the `input` property.
* **workbench-client/message-box:** The refactoring of the message box introduced a breaking change as properties were renamed:

    - To display a message box, pass a `MessageBoxConfig` instead of a `MessageBox` object. The `MessageBox` object is now used exclusively as the handle for injection into the message box component. It has the following new methods: `setTitle`, `setSeverity`, `setActions`, `setCssClass`.
    - If passing data to the message box component, set it via `componentInput` config property instead of the `input` property.
* **workbench/popup:** consolidated the config for opening a popup in preparation for the microfrontend popup integration

    To migrate:
    - Rename the `position` property to `align`. This property is used for aligning the popup relative to its anchor.
    - Remove the closing strategy `onLayoutChange` as binding a popup to a Workbench view is now supported. This strategy existed only as a workaround to close popups when switching between views.
    - Pass the preferred popup overlay size as `PopupSize` object literal instead of separate top-level config properties, as follows:
        - `PopupConfig.width` -> `PopupConfig.size.width`
        - `PopupConfig.height`-> `PopupConfig.size.height`
        - `PopupConfig.minWidth` -> `PopupConfig.size.minWidth`
        - `PopupConfig.maxWidth` -> `PopupConfig.size.maxWidth`
        - `PopupConfig.minHeight` -> `PopupConfig.size.minHeight`
        - `PopupConfig.maxHeight`-> `PopupConfig.size.maxHeight`



# 1.0.0-beta.1 (2020-12-22)


### Features

* **workbench-client:** add project skeleton for @scion/workbench-client ([59895f4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/59895f43e9371c214b9690edeec233ac6a72ee65))
* **workbench-client:** provide core workbench API to microfrontends ([55fabc3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/55fabc37867b4891fb58dd73647c2acb1135d49a))


### BREAKING CHANGES

* **workbench-client:** Workbench Microfrontend support introduced the following breaking changes:

    - The workbench component is no longer positioned absolutely but in the normal document flow. To migrate, add the workbench component to your CSS layout and make sure it fills the remaining space vertically and horizontally.
    - Renamed the workbench config from `WorkbenchConfig` to `WorkbenchModuleConfig`.
    - Removed the e2e-testing related CSS classes `e2e-active` and `e2e-dirty`; to migrate, replace them with `active` and `dirty`.
    - Renamed flag to set popup closing strategy from `onGridLayoutChange` to `onLayoutChange`





[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
