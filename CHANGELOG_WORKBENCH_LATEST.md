# [18.0.0-beta.4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/18.0.0-beta.3...18.0.0-beta.4) (2024-08-28)


### Bug Fixes

* **workbench/view:** update view properties between route deactivation and route activation ([5526eec](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/5526eeca84ca2c04d075fbc9414f1f27f89dd389))
* **workbench/router:** activate part only if specified by the navigation ([51ba3bb](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/51ba3bb5bcdc3d65d56967d9d3526cb5e9d88126))
* **workbench/popup:** render popup at the correct position when activating view ([a13e93f](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a13e93f5e27a2dd67d61f48807039448cc2efc7d))
* **workbench/layout:** debounce storing workbench layout ([076c241](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/076c241954483c079a19e4cd17b235047eddbc8c))
* **workbench/layout:** do not display "Not Found" page when closing a view ([03681b5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/03681b566355fc1915fc5e69d87f99a59b7e272e))
* **workbench/layout:** serialize properties with a `null` value ([49905f6](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/49905f6dc6da8bf9614255f72f93834a08773b2f))


### Features

* **workbench/perspective:** provide active perspective via `WorkbenchService` ([ee6d22b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ee6d22b419a35e0179fc70c2bd22f2f441ffd461))
* **workbench/view:** enable passing data to an empty-path navigation ([3b65d9b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/3b65d9ba564f5ed8abe02aafacc6a8621e0adf6b))
* **workbench:** change `WorkbenchService` properties to signals to integrate with Angular reactive contexts ([17280b3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/17280b34accc6127641fb053f321a8af0110b9c2))
* **workbench/perspective:** change `WorkbenchPerspective` properties to signals to integrate with Angular reactive contexts ([df6603a](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/df6603ac30415985f191567e5820ea12e7baa1dc))
* **workbench/part:** change `WorkbenchPart` properties to signals to integrate with Angular reactive contexts ([6aa6cd1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/6aa6cd18dcbf67aa2251b4ba1dccb526db3e14e8))
* **workbench/view:** change `WorkbenchView` properties to signals to integrate with Angular reactive contexts ([4498b52](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/4498b5271e4b8ffbbe957a39c014e248d3b81608))
* **workbench/dialog:** change `WorkbenchDialog` properties to signals to integrate with Angular reactive contexts ([53ab8bb](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/53ab8bb008cc205d3c7196f2a02ffff3ffd798c6))


### BREAKING CHANGES

* **workbench:** Migrating `WorkbenchService` properties to signals has introduced a breaking change.

  Migrate reading of `WorkbenchService` properties as follows:
  - `WorkbenchService.layout` => `WorkbenchService.layout()`
  - `WorkbenchService.layout$` => `WorkbenchService.layout()`
  - `WorkbenchService.parts` => `WorkbenchService.parts()`
  - `WorkbenchService.parts$` => `WorkbenchService.parts()`
  - `WorkbenchService.perspectives` => `WorkbenchService.perspectives()`
  - `WorkbenchService.perspectives$` => `WorkbenchService.perspectives()`
  - `WorkbenchService.theme$` => `WorkbenchService.theme()`
  - `WorkbenchService.views` => `WorkbenchService.views()`
  - `WorkbenchService.views$` => `WorkbenchService.views()`


* **workbench/perspective:** Migrating `WorkbenchPerspective` properties to signals has introduced a breaking change.

  Migrate reading of `WorkbenchPerspective` properties as follows:
  - `WorkbenchPerspective.active` => `WorkbenchPerspective.active()`
  - `WorkbenchPerspective.active$` => `WorkbenchPerspective.active()`


* **workbench/part:** Migrating `WorkbenchPart` properties to signals has introduced a breaking change.

  Migrate reading of `WorkbenchPart` properties as follows:
  - `WorkbenchPart.actions` => `WorkbenchPart.actions()`
  - `WorkbenchPart.actions$` => `WorkbenchPart.actions()`
  - `WorkbenchPart.active` => `WorkbenchPart.active()`
  - `WorkbenchPart.active$` => `WorkbenchPart.active()`
  - `WorkbenchPart.activeViewId` => `WorkbenchPart.activeViewId()`
  - `WorkbenchPart.activeViewId$` => `WorkbenchPart.activeViewId()`
  - `WorkbenchPart.viewIds$` => `WorkbenchPart.viewIds()`
  - `WorkbenchPart.viewIds` => `WorkbenchPart.viewIds()`


* **workbench/view:** Migrating `WorkbenchView` properties to signals has introduced a breaking change.

  The breaking change refers to reading property values. Writable properties are still updated through value assignment. Some properties have also been renamed for consistency reasons.

  Migrate reading of `WorkbenchView` properties as follows:
    - `WorkbenchView.active` => `WorkbenchView.active()`
    - `WorkbenchView.active$` => `WorkbenchView.active()`
    - `WorkbenchView.cssClass` => `WorkbenchView.cssClass()`
    - `WorkbenchView.closable` => `WorkbenchView.closable()`
    - `WorkbenchView.dirty` => `WorkbenchView.dirty()`
    - `WorkbenchView.first` => `WorkbenchView.first()`
    - `WorkbenchView.heading` => `WorkbenchView.heading()`
    - `WorkbenchView.last` => `WorkbenchView.last()`
    - `WorkbenchView.navigationHint` => `WorkbenchView.navigationHint()`
    - `WorkbenchView.part` => `WorkbenchView.part()`
    - `WorkbenchView.position` => `WorkbenchView.position()`
    - `WorkbenchView.urlSegments` => `WorkbenchView.urlSegments()`
    - `WorkbenchView.scrolledIntoView` => `WorkbenchView.scrolledIntoView()`
    - `WorkbenchView.state` => `WorkbenchView.navigationState()`
    - `WorkbenchView.title` => `WorkbenchView.title()`


* **workbench/dialog:** Migrating `WorkbenchDialog` properties to signals has introduced a breaking change.

  The breaking change refers to reading property values. Writable properties are still updated through value assignment.

  Migrate reading of `WorkbenchDialog` properties as follows:
    - `WorkbenchDialog.closable` => `WorkbenchDialog.closable()`
    - `WorkbenchDialog.cssClass` => `WorkbenchDialog.cssClass()`
    - `WorkbenchDialog.padding` => `WorkbenchDialog.padding()`
    - `WorkbenchDialog.resizable` => `WorkbenchDialog.resizable()`
    - `WorkbenchDialog.size.height` => `WorkbenchDialog.size.height()`
    - `WorkbenchDialog.size.width` => `WorkbenchDialog.size.width()`
    - `WorkbenchDialog.size.maxHeight` => `WorkbenchDialog.size.maxHeight()`
    - `WorkbenchDialog.size.minHeight` => `WorkbenchDialog.size.minHeight()`
    - `WorkbenchDialog.size.maxWidth` => `WorkbenchDialog.size.maxWidth()`
    - `WorkbenchDialog.size.minWidth` => `WorkbenchDialog.size.minWidth()`
    - `WorkbenchDialog.title` => `WorkbenchDialog.title()`
    - Setting an observable as dialog title is no longer supported. Instead, manually subscribe to the observable and set the title.
