# [1.0.0-beta.34](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.33...workbench-client-1.0.0-beta.34) (2025-11-11)


### Features

* **workbench-client/perspective:** enable contribution of microfrontend parts to a workbench perspective ([b6d25cf](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/b6d25cf23d3916f46780e25caff67618ad39597a)), closes [#683](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/683)
* **workbench-client/dialog:** add support for non-blocking dialog ([28b0291](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/28b0291c6a677e7ae2f81dcd2f9e6997195364c7))
* **workbench-client/dialog:** add support for part-modal dialog ([4411246](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/441124656bed66b227471fdb3f11a8e386733f63))
* **workbench-client/text:** support passing interpolation parameters via options ([17718d0](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/17718d034551bf0a1ae49ade36a2276d3a7d238e))


### Recommendations
* **workbench-client:** For Angular applications, provide `WorkbenchPart` for dependency injection. See [documentation](https://microfrontend-platform-developer-guide.scion.vercel.app/#chapter:angular-integration-guide:providing-platform-beans-for-dependency-injection) for details.
  ```ts
  import {WorkbenchPart} from '@scion/workbench-client';
  import {Beans} from '@scion/toolkit/bean-manager';
  
  {provide: WorkbenchPart, useFactory: () => Beans.opt(WorkbenchPart)}
  ```
* To use icons in docked parts, configure an icon provider in the workbench host application or include the Material icon font. See [documentation](https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/howto/how-to-icons.md#default-icon-provider) for details.


### Deprecations
* **workbench-client/perspective:** The modeling of a workbench perspective capability has changed: Parts must be modeled as separate part capabilities and views referenced from part capabilities. To migrate, refer to the documentation of [WorkbenchPerspectiveCapability](https://workbench-client-api.scion.vercel.app/interfaces/WorkbenchPerspectiveCapability.html) and [WorkbenchPartCapability](https://workbench-client-api.scion.vercel.app/interfaces/WorkbenchPartCapability.html). Support for the deprecated model will be removed in SCION Workbench version 22.

  **Before migration:**
  ```json
  {
    "type": "perspective",
    "qualifier": {
      "perspective": "sample-perspective"
    },
    "private": false,
    "properties": {
      "layout": [
        {
          "id": "main-area"
        },
        {
          "id": "navigator",
          "align": "left",
          "relativeTo": "main-area",
          "ratio": 0.25,
          "views": [
            {
              "qualifier": {
                "view": "navigator"
              }
            }
          ]
        }
      ]
    }
  }
  ```

  **After migration:**
  ```json
  {
    "type": "perspective",
    "qualifier": {
      "perspective": "sample-perspective"
    },
    "private": false,
    "properties": {
      "parts": [
        {
          "id": "main-area",
          "qualifier": {
            "part": "main-area"
          }
        },
        {
          "id": "navigator",
          "qualifier": {
            "part": "navigator"
          },
          "position": {
            "align": "left",
            "relativeTo": "main-area",
            "ratio": 0.25
          }
        }
      ]
    }
  },
  {
    "type": "part",
    "qualifier": {
      "part": "main-area"
    }
  },
  {
    "type": "part",
    "qualifier": {
      "part": "navigator"
    },
    "properties": {
      "views": [
        {
          "qualifier": {
            "view": "navigator"
          }
        }
      ]
    }
  }
  ```
* **workbench-client/popup:** Signature of `context` option in popup config has changed from object literal to string literal. Migrate `{context: {viewId: 'view.x'}}` to `{context: 'view.x'}`.
* **workbench-client/dialog:** Signature of `context` option in dialog options has changed from object literal to string literal. Migrate `{context: {viewId: 'view.x'}}` to `{context: 'view.x'}`.
* **workbench-client/messagebox:** Signature of `context` option in messagebox options has changed from object literal to string literal. Migrate `{context: {viewId: 'view.x'}}` to `{context: 'view.x'}`.
* **workbench-client/dialog:** `view` modality in dialog options was renamed to `context`.
* **workbench-client/messagebox:** `view` modality in messagebox options was renamed to `context`.
* **workbench-client/popup:** Referrer property on popup handle has been marked for removal. No replacement. Instead, add a parameter to the popup capability for the popup opener to pass required referrer information.
