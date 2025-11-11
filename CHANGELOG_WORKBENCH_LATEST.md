# [20.0.0-beta.9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/20.0.0-beta.8...20.0.0-beta.9) (2025-11-11)


### Features

* **workbench/perspective:** enable contribution of microfrontend parts to a workbench perspective ([b6d25cf](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/b6d25cf23d3916f46780e25caff67618ad39597a)), closes [#683](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/683)
* **workbench/part:** support activating docked part when adding it to the layout ([89aba48](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/89aba48cbe66cbbf9733bb738a5a283dc8ca7a76))
* **workbench/dialog:** add support for non-blocking dialog ([28b0291](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/28b0291c6a677e7ae2f81dcd2f9e6997195364c7))
* **workbench/dialog:** add support for part-modal dialog ([4411246](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/441124656bed66b227471fdb3f11a8e386733f63))
* **workbench/notification:** enable closing notification via handle ([7b425bd](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/7b425bd0a1b192185acfb43e9c117bf137f3dfd9))
* **workbench/notification:** prevent notification from closing on hover ([903a912](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/903a912e2e77951bdaad151f7c28951f27eea3c5))


### BREAKING CHANGES

* **workbench:** SCION Workbench requires `@scion/microfrontend-platform` `v1.5.0` or higher.
* **workbench:** SCION Workbench requires `@scion/workbench-client` `v1.0.0-beta.34` or higher.

### Recommendations

* To use icons in docked parts, configure an icon provider in the workbench host application or include the Material icon font. See [documentation](https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/howto/how-to-icons.md#default-icon-provider) for details.

### Deprecations

* **workbench/popup:** Signature of `context` option in popup config has changed from object literal to string literal. Migrate `{context: {viewId: 'view.x'}}` to `{context: 'view.x'}`.
* **workbench/dialog:** Signature of `context` option in dialog options has changed from object literal to string literal. Migrate `{context: {viewId: 'view.x'}}` to `{context: 'view.x'}`.
* **workbench/messagebox:** Signature of `context` option in messagebox options has changed from object literal to string literal. Migrate `{context: {viewId: 'view.x'}}` to `{context: 'view.x'}`.
* **workbench/dialog:** `view` modality in dialog options was renamed to `context`.
* **workbench/messagebox:** `view` modality in messagebox options was renamed to `context`.
