# [22.0.0-beta.1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/21.0.0-beta.7...22.0.0-beta.1) (2026-06-16)

### Features

* **workbench:** add support for Angular 22 ([c652576](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/c652576738c26bd23c3919c1c151c33379c828a4))


### Code Refactoring


* **workbench/notification:** remove deprecated Workbench Notification API ([e5f7b37](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e5f7b37edd343627705cff1bae933997f556e3b8))
* **workbench/popup:** remove deprecated Workbench Popup API ([0d63673](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0d63673c4c283761c51dea50da897fb3f585d194))
* **workbench/part:** remove deprecated properties from `WorkbenchPart` handle ([8ce3c58](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/8ce3c58dd45cf96dbe8cc62769f161f625a95d4b))
* **workbench/view:** remove deprecated `preloadInactiveViews` flag ([d29f793](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/d29f793c285ec356860e6177bcf8f36721331d4a))
* **workbench:** remove deprecated view context signature ([ef71fb3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ef71fb3516dcd5d8ceb3aae096195743852171f1))


### BREAKING CHANGES

* **workbench:** SCION Workbench requires Angular 22.

  Note that SCION Workbench still requires `@angular/animations`. Removal is planned for 2026.

* **workbench/notification:** Deprecated Notification API has been removed.

  To migrate, refer to the Deprecations section in the changelog of version [`21.0.0-beta.1` (2025-11-27)](https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/changelog-workbench/changelog.md#2100-beta1-2025-11-27).

* **workbench/popup:** Deprecated Popup API has been removed.

  To migrate, refer to the Deprecations section in the changelog of version [`21.0.0-beta.1` (2025-11-27)](https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/changelog-workbench/changelog.md#2100-beta1-2025-11-27).

* **workbench/part:** Deprecated properties `viewIds` and `activeViewId` have been removed from `WorkbenchPart` handle.

  To migrate, refer to the Deprecations section in the changelog of version [`20.0.0-beta.4` (2025-07-15)](https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/changelog-workbench/changelog.md#2000-beta4-2025-07-15).

* **workbench/view:** The deprecated `preloadInactiveViews` flag has been removed. This flag was introduced in version `20.0.0-beta.6` to maintain compatibility with applications setting titles and headings in microfrontends. Views can continue eager loading by setting the `lazy` view capability property to `false`.

  To migrate, refer to the Deprecations section in the changelog of version [`20.0.0-beta.6` (2025-09-04)](https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/changelog-workbench/changelog.md#2000-beta6-2025-09-04).

* **workbench:** Deprecated view context signature has been removed.

  To migrate, refer to the Deprecations section in the changelog of version [`20.0.0-beta.9` (2025-11-11)](https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/changelog-workbench/changelog.md#2000-beta9-2025-11-11).
