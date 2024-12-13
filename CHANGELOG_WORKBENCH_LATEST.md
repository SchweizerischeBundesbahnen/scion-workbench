# [19.0.0-beta.1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/18.0.0-beta.10...19.0.0-beta.1) (2024-12-13)


### Dependencies

* **workbench:** update @scion/workbench to Angular 19 ([e3f358f](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e3f358fe328a61ff43f37fc368a184067b16f8b4))


### Chore

* **workbench:** remove deprecated workbench modules ([df3eb4e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/df3eb4e72cd90c921b8b1385b960a63f7c9c2ac4))


### BREAKING CHANGES

* **workbench:** Updating `@scion/workbench` to Angular 19 introduced a breaking change.

  To migrate:
    - Update your application to Angular 19; for detailed migration instructions, refer to https://v19.angular.dev/update-guide;
* **workbench:** Removing deprecated workbench modules introduced the following breaking changes.

  The following APIs have been removed:
    - `WorkbenchModule.forRoot` => register SCION Workbench providers using `provideWorkbench` function and import standalone components and directives instead;
    - `WorkbenchModule.forChild` => no replacement; import standalone workbench components and directives instead;
    - `WorkbenchTestingModule.forTest` => no replacement; use `provideWorkbench` instead;
    - `provideWorkbenchForTest` => no replacement; use `provideWorkbench` instead;



