# [20.0.0-beta.6](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/20.0.0-beta.5...20.0.0-beta.6) (2025-09-04)


### Performance Improvements

* **workbench/view:** enable lazy loading of inactive microfrontend views ([5a334a4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/5a334a433a320987366ca52475a244347761b817)), closes [#681](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/681)

### Dependencies

* **workbench:** SCION Workbench requires `@scion/workbench-client` version `1.0.0-beta.31` or later.

### BREAKING CHANGES

* **workbench/view:** Microfrontend views require titles and headings set in the manifest due to lazy loading. Previously, these may have been set in the microfrontends.

  To migrate, set the view titles and headings in the manifest. Otherwise, inactive views would not have a title and heading. See [changelog](https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/CHANGELOG_WORKBENCH_CLIENT.md#100-beta31-2025-09-04) of `@scion/workbench-client` for details. Alternatively, enable compat mode as follows:

  ```ts
  import {provideWorkbench} from '@scion/workbench';
  
  provideWorkbench({
    microfrontendPlatform: {
      preloadInactiveViews: true,
      // ... other config skipped
    },
  });
  ```

This will continue eager loading microfrontend views and log a deprecation warning, giving micro applications time to migrate to capability-based titles and headings. Note that this flag will be removed in version 22.
