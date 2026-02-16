# [1.0.0-beta.39](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.38...workbench-client-1.0.0-beta.39) (2026-02-16)


### Bug Fixes

* **workbench-client/view:** navigate microfrontend view only if parameters or capability have changed ([61cbeeb](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/61cbeebf2bca232f3690a0af12634672699e745c))


### Features

* **workbench-client/notification:** support displaying a microfrontend in a workbench notification ([7082a05](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/7082a053ffee2539fe5beac3c4054c0607f70f96)), closes [#413](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/413)


### Dependencies

* **workbench-client:** SCION Workbench Client requires `@scion/toolkit` `v2.1.0` or higher.

### Recommendations

* **workbench-client:** For Angular applications, provide `WorkbenchNotification` for dependency injection. See [documentation](https://microfrontend-platform-developer-guide.scion.vercel.app/#chapter:angular-integration-guide:providing-platform-beans-for-dependency-injection) for details.
  ```ts
  {provide: WorkbenchNotification, useFactory: () => Beans.opt(WorkbenchNotification)}
  ```

