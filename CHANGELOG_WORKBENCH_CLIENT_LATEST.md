# [1.0.0-beta.42](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.41...workbench-client-1.0.0-beta.42) (2026-06-16)

### Features

* **workbench-client/dialog:** add referring application to `WorkbenchDialog` handle ([a6e55e0](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a6e55e09d4b9f0ab9f5da72759c98172c0699085))
* **workbench-client/popup:** add referring application to `WorkbenchPopup` handle ([b6b6d81](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/b6b6d81121df17f37f68de49e6fbb55c59f7ab75))


### Code Refactoring

* **workbench-client:** remove deprecated view context signature ([ef71fb3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ef71fb3516dcd5d8ceb3aae096195743852171f1))
* **workbench-client/notification:** remove deprecated Workbench Notification API ([e5f7b37](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e5f7b37edd343627705cff1bae933997f556e3b8))
* **workbench-client/popup:** remove deprecated Workbench Popup API ([0d63673](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0d63673c4c283761c51dea50da897fb3f585d194))
* **workbench-client/popup:** remove deprecated properties from `WorkbenchPopup` handle ([0b7f7e9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0b7f7e955bdad4c470c851e59a7155707885fd87))
* **workbench-client/view:** remove support for deprecated transient parameters ([87a4cea](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/87a4ceaa6761afd8d057ea2e4cdacb672d02fc7b))

### BREAKING CHANGES

* **workbench-client:** Deprecated view context signature has been removed.

  To migrate, refer to the Deprecations section in the changelog of version [`1.0.0-beta.34` (2025-11-11)](https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/changelog-workbench-client/changelog.md#100-beta34-2025-11-11).

* **workbench/notification:** Deprecated Notification API has been removed.

  To migrate, refer to the Deprecations section in the changelog of version [`1.0.0-beta.36` (2025-11-27)](https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/changelog-workbench-client/changelog.md#100-beta36-2025-11-27).

* **workbench-client/popup:** Deprecated Popup API has been removed.

  To migrate, refer to the Deprecations section in the changelog of version [`1.0.0-beta.36` (2025-11-27)](https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/changelog-workbench-client/changelog.md#100-beta36-2025-11-27).

* **workbench-client/popup:** Deprecated referrer properties `viewId` and `viewCapabilityId` have been removed from `WorkbenchPopup` handle.

  To migrate, refer to the Deprecations section in the changelog of version [`1.0.0-beta.34` (2025-11-11)](https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/changelog-workbench-client/changelog.md#100-beta34-2025-11-11).

* **workbench-client/view:** Support for deprecated transient parameters has been removed.

  To migrate, refer to the Deprecations section in the changelog of version [`1.0.0-beta.36` (2025-11-27)](https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/changelog-workbench-client/changelog.md#100-beta36-2025-11-27).
