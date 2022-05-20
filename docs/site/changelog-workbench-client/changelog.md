<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| [SCION Workbench][menu-home] | [Projects Overview][menu-projects-overview] | Changelog | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [Changelog][menu-changelog] > Workbench Client (@scion/workbench-client)


# [1.0.0-beta.10](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.9...workbench-client-1.0.0-beta.10) (2022-05-20)


### Dependencies

* **workbench-client:** migrate to the framework-agnostic package `@scion/toolkit` ([38368e9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/38368e93fffb7ecf3bcf0338f6f43ee2a760de9a))


### BREAKING CHANGES

* **workbench-client:** Migrating to the framework-agnostic package `@scion/toolkit` introduced a breaking change.

  Previously, framework-agnostic and Angular-specific tools were published in the same NPM package `@scion/toolkit`, which often led to confusion and prevented framework-agnostic tools from having a release cycle independent of the Angular project. Therefore, Angular-specific tools have been moved to the NPM package `@scion/components`. Framework-agnostic tools continue to be released under `@scion/toolkit`, but now starting with version `1.0.0` instead of pre-release versions.

  To migrate:
  - Install the NPM package `@scion/toolkit` in version `1.0.0` using the following command: `npm install @scion/toolkit@latest --save`. Note that the toolkit was previously released as pre-releases of version `13.0.0` or older.
  - If you are using Angular components from the toolkit in your project, for example the `<sci-viewport>` component, please follow the migration instructions of the [SCION Toolkit Changelog](https://github.com/SchweizerischeBundesbahnen/scion-toolkit/blob/master/docs/site/changelog-components/changelog.md#migration-of-angular-specific-components-and-directives). Components of the toolkit have been moved to the NPM package `@scion/components`.



# [1.0.0-beta.9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.8...workbench-client-1.0.0-beta.9) (2022-05-02)


### Bug Fixes

* **workbench/view:** discard parameter if set to `undefined` ([b3b6a14](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/b3b6a1465c277f139bb7f2676deadab5970d5dd7)), closes [#325](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/325)
* **workbench/view:** preserve position and size of inactive views ([c0f869b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/c0f869bf25b34c9ca249f1bca91f2c974c81a75f))


### Dependencies

* **workbench-client:** migrate @scion/workbench-client to RxJS 7.5 ([e666841](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e666841593fafbf276cd5cb1e18c8dc3317b8929)), closes [#298](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/298)


### BREAKING CHANGES

* **workbench-client:** Migrating `@scion/workbench-client` to RxJS 7.5 introduced a breaking change.

  To migrate:
  - migrate your application to RxJS 7.5; for detailed migration instructions, refer to https://rxjs.dev/6-to-7-change-summary;
  - update @scion/toolkit to version 13; for detailed migration instructions, refer to https://github.com/SchweizerischeBundesbahnen/scion-toolkit/blob/master/CHANGELOG.md;


# [1.0.0-beta.8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.7...workbench-client-1.0.0-beta.8) (2022-02-11)


### Code Refactoring

* **workbench/popup:** open popups from within an interceptor ([a11fd9d](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a11fd9dc96cd7265f3372ecff0723584dea7b7fd)), closes [#276](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/276)
* **workbench/view:** open views from within an interceptor ([137b8d0](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/137b8d073e5d0a9dc183cbed7451ceba852fc1e5))


### Features

* **workbench:** allow controlling which view params to persist in the URL ([dcb5ee1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/dcb5ee163ebb05b2881725e9291d36b5e2c49f07)), closes [#278](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/278)
* **workbench:** migrate to @scion/microfrontend-platform v1.0.0-beta.20 ([24dfec2](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/24dfec2251b85a1a380ee2299b26cb4452883097)), closes [SchweizerischeBundesbahnen/scion-microfrontend-platform/#96](https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/issues/96)


### BREAKING CHANGES

* **workbench:** Supporting `@scion/microfrontend-platform v1.0.0-beta.20` introduced a breaking change in the configuration of the host application and the host/client communication protocol.

  SCION Microfrontend Platform consolidated the API for configuring the platform, eliminating the different ways to configure the platform. Consequently, SCION Workbench could also simplify its API for enabling microfrontend support.

  Related issue of the SCION Microfrontend Platform: [SchweizerischeBundesbahnen/scion-microfrontend-platform/#96](https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/issues/96)

  #### Client App Migration
  - the micro application must now pass its identity (symbolic name) directly as the first argument, rather than via the options object;
  - the options object passed to `WorkbenchClient.connect` has been renamed from ` MicroApplicationConfig` to `ConnectOptions` and messaging options are now top-level options;
  - the bean `MicroApplicationConfig` has been removed; you can now obtain the application's symbolic name as following: `Beans.get<string>(APP_IDENTITY)`;

  For further instructions on how to migrate the client, refer to https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/blob/master/docs/site/changelog/changelog.md#client-app-migration

* **workbench/popup:** Opening popups from within an interceptor introduced a breaking change in the host/client communication protocol.

  The communication protocol between host and client HAS CHANGED for opening a popup. You need to update host and affected clients to the new version simultaneously. The API has not changed; the breaking change applies only to the version of @scion/workbench and @scion/workbench-client. To migrate, upgrade to @scion/workbench@12.0.0-beta.2 and @scion/workbench-client@1.0.0-beta.8, respectively.

* **workbench/view:** Opening views from within an interceptor introduced a breaking change in the host/client communication protocol.

  The communication protocol between host and client HAS CHANGED for opening a view. You need to update host and affected clients to the new version simultaneously. The API has not changed; the breaking change applies only to the version of @scion/workbench and @scion/workbench-client. To migrate, upgrade to @scion/workbench@12.0.0-beta.2 and @scion/workbench-client@1.0.0-beta.8, respectively.



# [1.0.0-beta.7](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.6...workbench-client-1.0.0-beta.7) (2021-07-09)


### chore

* compile with TypeScript strict checks enabled ([2f26260](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/2f26260b0f6e93eda8a6a6c71f102c0e60960e5f)), closes [#246](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/246)



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
