# [1.0.0-beta.31](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.30...workbench-client-1.0.0-beta.31) (2025-09-04)


### Features

* **workbench-client:** enable localization of texts in the manifest ([69343b3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/69343b3fe23e750f2a16ef61f6f215316cd83c78)), closes [#255](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/255)
* **workbench-client:** enable localization of texts in a message box ([a1fdf77](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a1fdf77302ee52c4e7853f6359dc7e63cad1741f))
* **workbench-client:** enable localization of texts in a notification ([325388e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/325388eae0e2cae72532ab98722d893404b6b2c6)), closes [#401](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/401)


### Performance Improvements

* **workbench/view:** enable lazy loading of inactive microfrontend views ([5a334a4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/5a334a433a320987366ca52475a244347761b817)), closes [#681](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/681)


### BREAKING CHANGES

* **workbench/view:** Microfrontend views require titles and headings set in the manifest due to lazy loading. Previously, these may have been set in the microfrontends.

  To migrate, set the view titles and headings in the manifest. Otherwise, inactive views would not have a title and heading. Alternatively, enable compat mode as described below.

  Example of setting the title in the manifest:
  ```json
  {
    "type": "view",
    "qualifier": {
      "entity": "product"
    },
    "properties": {
      "path": "products/:id",
      "title": "Product"
   }
  }
  ```

  Texts can be localized using a translation key:
  ```json
  {
    "type": "view",
    "qualifier": {
      "entity": "product"
    },
    "properties": {
      "path": "products/:id",
      "title": "%product.title"
    }
  }
  ```
  Translation keys start with the percent symbol (`%`) and are passed to the text provider for translation, with the percent symbol omitted. Register the text provider via `WorkbenchClient.registerTextProvider` in the activator.

  ```ts
  import {WorkbenchClient} from '@scion/workbench-client';
  import {inject} from '@angular/core';
  
  WorkbenchClient.registerTextProvider((key, params) => {
    return translate(key, params); // `translate` is illustrative and not part of the Workbench API
  });
  ```
  Translation keys may include parameters for text interpolation. Interpolation parameters can reference capability parameters and resolvers. See documentation for details: https://workbench-client-api.scion.vercel.app/interfaces/WorkbenchViewCapability.html`.

  ```json
  {
    "type": "view",
    "qualifier": {
      "entity": "product"
    },
    "params": [
       {"name": "id", "required":  true}
    ],
    "properties": {
      "path": "products/:id",
      "title": "%product.title;name=:productName", // `:productName` references a resolver
      "resolve": {
        "productName": "products/:id/name" // `:id` references a capability parameter
      }
    }
  }
  ```
  Register a message listener in the activator to reply to resolve requests:
  ```ts
  import {Beans} from '@scion/toolkit/bean-manager';
  import {MessageClient} from '@scion/microfrontend-platform';
  
  Beans.get(MessageClient).onMessage('products/:id/name', request => {
    const id = request.params!.get('id');
    return `Product ${id}`;
  });
  ```

  #### Enable Compat Mode in Host App
  For compatibility with micro applications setting view titles and headings in microfrontends, enable the `preloadInactiveViews` flag in the workbench config. This will continue eager loading microfrontend views and log a deprecation warning, giving applications time to migrate to capability-based titles and headings. Note that this flag will be removed in version 22.

  Example of enabling the compatibility flag:
  ```ts
  import {provideWorkbench} from '@scion/workbench';
  
  provideWorkbench({
    microfrontendPlatform: {
      preloadInactiveViews: true,
      // ... other config skipped
    },
  });
  ```
