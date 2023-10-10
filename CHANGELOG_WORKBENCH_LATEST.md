# [16.0.0-beta.8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/16.0.0-beta.7...16.0.0-beta.8) (2023-10-10)


### Bug Fixes

* **workbench:** activate part when activating view ([2e2368a](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/2e2368af89349c2410d4e854b20baf80fc1ae192))
* **workbench:** activate part when microfrontend gains focus ([6e05d8c](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/6e05d8cb28b523ebfa5a5fa695c3a5528a093be2))
* **workbench:** allow to focus element outside the context menu when opened ([2556b04](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/2556b04ab4eb49cb7880af829f719b43c12cc5db))
* **workbench:** close view list menu when microfrontend gains focus ([629cd8d](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/629cd8d368d26e6ccfbb200478b61cadc803c08e))
* **workbench:** detach overlays associated with peripheral views when maximizing the main area ([6cf3388](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/6cf33886fa095a007c18d0a9ad82fbb60388f916))
* **workbench:** do not close views that are not closable ([cf9993b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/cf9993bcef30cdb37dd223768c07bc47fdd509d4))


### Features

* **workbench:** rework tab design and styling of the SCION Workbench ([5cbd354](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/5cbd3544019192f3f01de5faf985b78f0a5ba63b)), closes [#110](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/110)


### BREAKING CHANGES

* **workbench:** The new tab design and theming of the SCION Workbench has introduced a breaking change.

  To migrate:
  - update `@scion/components` to version `16.2.0` or higher
  - update `@scion/workbench-client` to version `1.0.0-beta.19` or higher
  - The workbench can now be styled using well-defined design tokens instead of undocumented CSS selectors. See [How to theme SCION Workbench](https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/howto/how-to-theme-workbench.md) for a list of supported tokens.
  - The tab height has changed from two lines to one line, not displaying the heading anymore. You can change the tab height back to two lines by setting the `--sci-workbench-tab-height` design token to `3.5rem`.
    ```scss
    :root {
      --sci-workbench-tab-height: 3.5rem;
    }
    ```
  - Custom icon font is now configured top-level in `@scion/workbench` SCSS module. Previously, the custom icon font was configured under the `$theme` map entry.
    #### Before:
    ```scss
    @use '@scion/workbench' with (
      $theme: (
        icon-font: (
          filename: 'custom-workbench-icons',
          version: '1.0.0'
        )
      )
    );
    ```
    #### After:
    ```scss
    @use '@scion/workbench' with (
      icon-font: (
        filename: 'custom-workbench-icons',
        version: '1.0.0'
      )
    );
    ```
  - Contribution of custom tab component has changed:
    - Close button is now rendered separately and can be removed from the custom tab component.
    - Custom tab component should add a right margin if rendered in the context of a tab or drag image to not overlap the close button.
    - Inject current rendering context using `VIEW_TAB_RENDERING_CONTEXT` DI token instead of `VIEW_TAB_CONTEXT` DI token. Supported contexts are `tab`, `list-item` and `drag-image`.
