# [17.0.0-beta.1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/16.0.0-beta.10...17.0.0-beta.1) (2023-11-21)


### Dependencies

* **workbench:** update @scion/workbench to Angular 17 ([637e8bd](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/637e8bdce05a9e9ceeba4b9903ba5176b4e34901)), closes [#485](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/485)


### Features

* **workbench:** provide workbench dialog ([34e5acc](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/34e5acc96b6c1b7ee78625fa8a7b19434e35f778))


### BREAKING CHANGES

* **workbench:** Updating `@scion/workbench` to Angular 17 introduced a breaking change.

  To migrate:
  - update your application to Angular 17.x; for detailed migration instructions, refer to https://v17.angular.io/guide/update-to-latest-version;
  - update @scion/components to version 17; for detailed migration instructions, refer to https://github.com/SchweizerischeBundesbahnen/scion-toolkit/blob/master/CHANGELOG_COMPONENTS.md;
  - If deploying the application in a subdirectory, use a relative directory path for the browser to load the icon files relative to the document base URL (as specified in the `<base>` HTML tag). Note that using a relative path requires to exclude the icon files from the application build. Depending on building the application with esbuild `@angular-devkit/build-angular:application` or webpack `@angular-devkit/build-angular:browser`, different steps are required to exclude the icons from the build.

    **Using @angular-devkit/build-angular:application (esbuild)**

    Configure the `@scion/workbench` SCSS module to load the icon font relative to the document base URL:
    ```scss
    @use '@scion/workbench' with (
     $icon-font: (
       directory: 'path/to/font' // no leading slash, typically `assets/fonts`
     )
    );
    ```

    Add the path to the `externalDependencies` build option in the `angular.json` file:
    ```json
    "externalDependencies": [
      "path/to/font/scion-workbench-icons.*"
    ]
    ```

    **Using @angular-devkit/build-angular:browser (webpack)**

    Configure the `@scion/workbench` SCSS module to load the icon font relative to the document base URL:

    ```scss
    @use '@scion/workbench' with (
      $icon-font: (
        directory: '^path/to/font' // no leading slash but with a caret (^), typically `^assets/fonts`
      )
    );
    ```
