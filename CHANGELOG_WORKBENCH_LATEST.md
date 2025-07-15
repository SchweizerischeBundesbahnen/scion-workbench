# [20.0.0-beta.4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/20.0.0-beta.3...20.0.0-beta.4) (2025-07-15)


### Bug Fixes

* **workbench/part:** ensure docked part opens when its handle is activated ([0f2d247](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0f2d24774c01dcfa730a7dde4d8b2152b2b1beac))
* **workbench/part:** show part bar in docked parts with inline-grid and no visible parts ([984f337](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/984f33767acf0d6721b218030de42eccb7070f62))
* **workbench/popup:** stick popup anchor to part bounds when resizing part beyond view bounds ([197bf4b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/197bf4b067e2fceb2ac33aba2ce83733b4027e9c))
* **workbench:** preserve main area in perspectives without a main area ([c8f7fe6](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/c8f7fe62bfbebdbbc7f11b079ce985f334271263))


### Features

* **workbench/part:** preserve content of docked part when closed ([9cbd42f](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/9cbd42f7c28f246de8979c3b9a603a4f98c0d9ff))


### Deprecations

* **workbench/part:** Use `WorkbenchPart.views` instead of `WorkbenchPart.viewIds` to get the views of a part.
* **workbench/part:** Use `WorkbenchPart.activeView` instead of `WorkbenchPart.activeViewId` to get the active view of a part.



