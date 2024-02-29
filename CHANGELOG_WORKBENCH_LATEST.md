# [17.0.0-beta.5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/17.0.0-beta.4...17.0.0-beta.5) (2024-02-29)


### Bug Fixes

* **workbench/router:** support moving empty-path view to new window ([acebd4c](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/acebd4cedda7768dd81f12f8aa2d2268d769ec7b))
* **workbench/view:** display arrow cursor when hovering over context menu items ([5f41151](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/5f4115110bc10f2b0934b02e8036d4e50151a3cd))
* **workbench/view:** ensure `sci-router-outlet` of inactive microfrontend view has correct attributes in the DOM ([3e6be3f](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/3e6be3f01791294133a0c45d71b6cb50328b3f66))
* **workbench/view:** open view moved via drag & drop after the active view ([78dc249](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/78dc249452700bc49119a3c8f0dd9987286e3af2))


### Features

* **workbench/view:** enable dependency injection in context menu action callback ([7d8d041](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/7d8d0414dcc0d0b3dcd6fb15279fcd70025b2fc9))
* **workbench/view:** support moving view to different workbench window ([408f634](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/408f634b60a2250ac59d0d215bd4e763294ff5e2))


### BREAKING CHANGES

* **workbench/view:** Support for programmatically moving view to different workbench window has introduced a breaking change.

  The signature of `WorkbenchView#move` has changed.

  To migrate:
    - Specify the target part as the first argument, optionally defining the region via options object.
    - Pass `new-window` instead of `blank-window` to move the view to a new window.
    - To move a view to a specific workbench window, pass the target workbench id via options object. The target workbench id is available via `WORKBENCH_ID` DI token in the target application.
    - Note that the built-in view context menu has been renamed from `moveBlank` to `moveToNewWindow`, breaking if overriding defaults such as text or accelerators.
 
