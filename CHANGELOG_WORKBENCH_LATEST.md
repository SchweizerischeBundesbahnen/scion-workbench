# [18.0.0-beta.2](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/18.0.0-beta.1...18.0.0-beta.2) (2024-06-13)


### Code Refactoring

* **workbench:** change default icon font directory from `/assets/fonts` to `/fonts` ([d347dae](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/d347daebc40f3917b867435586929725fc8c1acd))


### BREAKING CHANGES

* **workbench:** The default icon font directory has changed from `/assets/fonts` to `/fonts`.

  To migrate:
  - Move the `fonts` folder from `/src/assets` to `/public`.
  - Include content of the `public` folder in angular.json:
    ```json
    "assets": [
      {
        "glob": "**/*",
        "input": "public"
      }
    ]
    ```
  - Alternatively, to not change the folder structure, you can configure a custom path to the icon font directory in your `styles.scss`:
    ```scss
    use '@scion/workbench' with (
      $icon-font: (
        directory: 'assets/fonts'
      )
    );
    ```



