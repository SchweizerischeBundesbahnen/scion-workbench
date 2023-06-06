# [15.0.0-beta.7](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/15.0.0-beta.6...15.0.0-beta.7) (2023-06-06)


### Features

* **workbench:** enable action contribution to specific part or area ([10b5f6a](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/10b5f6a12e9f3d9b2cccacad1061a9c45e3f4fdf))


### BREAKING CHANGES

* **workbench:** Programmatic contribution of part actions has changed.

  To migrate:
  - Specify `Portal` instead of `ComponentRef` or `TemplateRef`.
  - Replace `WorkbenchPart.registerPartAction` with `WorkbenchService.registerPartAction`.

    ```ts
    const workbenchService = inject(WorkbenchService);
    
    workbenchService.registerPartAction({
      portal: new ComponentPortal(YourComponent),
      target: {
        partId: ['console', 'navigator'],
      },
    });
    ```



# [15.0.0-beta.6](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/15.0.0-beta.5...15.0.0-beta.6) (2023-05-25)


### Bug Fixes

* **workbench/notification:** highlight close button on hover ([5714503](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/5714503176ff413a7888870590afa5f4f251c800))
* **workbench/viewlist:** do not animate opening the menu ([d35de9a](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/d35de9a2674ad3de8ef94cc3c91e2486fcc7852a))
* **workbench/viewlist:** do not render top border if opened in the south ([cddac34](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/cddac3430d39132d3f49b6ef1032acc90faea267))
* **workbench/viewlist:** render active view marker in full height ([d68e860](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/d68e8600dac6e6cdaf61920b81d9e43c89e842dc))



# [15.0.0-beta.5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/15.0.0-beta.4...15.0.0-beta.5) (2023-05-23)


### Features

* **workbench:** contribute filter field to filter views in the viewlist menu ([4bb2781](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/4bb27817bd8541fd700589086499e2256503c771))
* **workbench:** list all views in the viewlist menu ([bce8fdf](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/bce8fdf230b9cd5d5799391e67e568dc5d89d103))
* **workbench:** do not clip view tabs if there are no part actions ([86f5412](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/86f541220f7299bf829954a737eecf8e295a6976))
* **workbench:** provide better user experience when dragging view tabs ([23ade70](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/23ade70ddea70d294f3ef39c3124d7025cf560a8)), closes [#303](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/303)
* **workbench:** support perspectives and initial view arrangement ([3f6fb22](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/3f6fb22e27b597f3c4a83f9cc1cb74fde4493f73)), closes [#305](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/305) [#231](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/231)


### BREAKING CHANGES

* **workbench:** adding support for perspectives introduced a breaking change.

  The following APIs have changed:
    - `WorkbenchViewPart` => `WorkbenchPart`
    - `WorkbenchViewPartAction` => `WorkbenchPartAction`
    - `ViewPartActionDirective` => `WorkbenchPartActionDirective`
    - `WbBeforeDestroy` => `WorkbenchViewPreDestroy`
    - `WbBeforeDestroy.wbBeforeDestroy` => `WorkbenchViewPreDestroy.onWorkbenchViewPreDestroy`
    - `ViewMenuItemDirective` => `WorkbenchViewMenuItemDirective`
    - `WbRouterLinkDirective` => `WorkbenchRouterLinkDirective`
    - `WbNavigationExtras` => `WorkbenchNavigationExtras`
    - `WorkbenchService.views$ ` was changed to emit a readonly array of `WorkbenchView` objects instead of a string array of view ids.
    - `WorkbenchService.destroyView` => `WorkbenchService.closeViews`
    - `WorkbenchService.registerViewPartAction` => `WorkbenchService.registerPartAction`
    - `WorkbenchViewPart.partId` => `WorkbenchPart.id`
    - `WorkbenchViewPart.registerViewPartAction` => `WorkbenchPart.registerPartAction`
    - `WorkbenchView.viewId` => `WorkbenchView.id`
    - `WorkbenchTestingModule.forRoot` => `WorkbenchTestingModule.forTest`
    - `WorkbenchTestingModule.forChild` => `WorkbenchTestingModule`
    -  Internal DOM structure of SCION Workbench has changed. To migrate custom workbench styling, inspect the new DOM structure.
  
  The following APIs have been removed:
    - Deprecated `Activity API` was removed. There is no replacement. Instead, define an initial layout. See the How-To Guide for more information.
    - Method `WorkbenchService.activateView` was removed. Instead, use the `WorkbenchRouter` to activate the view.
    - Route data `WorkbenchRouteData.part` was removed. There is no replacement.
  
  The selector of the following directives have changed:
    - `wbViewPartAction` => `wbPartAction`



# [15.0.0-beta.4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/15.0.0-beta.3...15.0.0-beta.4) (2023-04-04)


### Bug Fixes

* **workbench/theme:** remove Internet Explorer specific icon files ([02866e1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/02866e11796b511f8986e69ce106eaa5b4c61d98))
* **workbench:** do not display close button of active view in the viewlist menu ([de07443](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/de074432709fc7703051f9ec3d867a8b5e10718f))
* **workbench:** do not display viewlist menu button while dragging views ([3495d63](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/3495d63f7d592a70717a7feef33051ff159549fd))
* **workbench:** focus element which the user clicked to close the viewlist menu ([ac2a124](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ac2a124bd6cc7d474f27e31b34aff2ffeab780d0))
* **workbench:** render larger gap between items  in the viewlist menu ([ecfe8a4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ecfe8a4e8f3879e76b802b5cd0370219fddb5e9a))
* **workbench:** update @scion/components to display viewlist menu button only on tab overflow ([f169a72](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/f169a723372fd3e02decf4e1a66e2e53d7381a70)), closes [scion-toolkit@22baab7](https://github.com/SchweizerischeBundesbahnen/scion-toolkit/commit/22baab78c4bdf34caeb99c750079cd415aca046)


### Code Refactoring

* **workbench/theme:** rename workbench icon files ([a7cbf6b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a7cbf6bcd876e655f53ea07077f743661741ee3f))


### Features

* **workbench/theme:** invalidate browser cache when workbench icons change ([1291bba](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/1291bba06f7e2f89145d5dd450892104132a9bdb))
* **workbench/theme:** support configuration of a custom path to load workbench icon files ([bee949c](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/bee949c0e85fe431710e6d2a70bfaef74103bc70))
* **workbench:** change icon of viewlist menu button to "chevron down" ([b7135e5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/b7135e5bf46e995b7d44fd766120c234a3a57ecb))
* **workbench:** highlight active view in the viewlist menu ([6589db8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/6589db87e4f1806cd757543f17e2b1da7e3fb6d1))


### BREAKING CHANGES

* **workbench/theme:** renaming workbench icon files introduced a breaking change.

  To migrate, download the workbench icon files from <a href="https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/resources/scion-workbench-icons/fonts/fonts.zip">GitHub</a>, unzip them and place the extracted files in the `assets/fonts` folder.



# [15.0.0-beta.3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/15.0.0-beta.2...15.0.0-beta.3) (2023-02-22)


### Bug Fixes

* **workbench/view:** fix position of close button in view tabs in development build ([34de1e9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/34de1e942a0ea395c95d13155a6349bea265bae7))



# [15.0.0-beta.2](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/15.0.0-beta.1...15.0.0-beta.2) (2023-02-16)


### Bug Fixes

* **workbench/view:** fix position of close button in view tabs ([fe4590f](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/fe4590fad856b853e01d3614903ee60befdc9b37))



# [15.0.0-beta.1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/14.0.0-beta.9...15.0.0-beta.1) (2023-02-10)


### Bug Fixes

* **workbench/router:** do not throw error if closing a view via router link ([f0d4bde](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/f0d4bde74640d0153ab173389d03e2afb41544d5))
* **workbench/router:** ignore matrix params to resolve views for navigation ([ce133bf](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ce133bf7efec1edb5bb078db28371969a3ed0208)), closes [#239](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/239)


### Dependencies

* **workbench:** update @scion/workbench to Angular 15 ([f805faf](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/f805faf5a637ea73ba68a168bd9d5f1bf37692be)), closes [#347](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/347)


### Features

* **workbench/router:** support closing the current view via router link without explicit target ([b9f03fd](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/b9f03fdadaa9a2d75ff8e8619dc0c446455d726c))
* **workbench/router:** support closing views that match a pattern ([4d39107](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/4d391075d9e9e35a4ecf5497de6cfd03bc4ab67c)), closes [#240](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/240)


### BREAKING CHANGES

* **workbench:** Updating `@scion/workbench` to Angular 15 introduced a breaking change.

  To migrate:
  - update your application to Angular 15.x; for detailed migration instructions, refer to https://v15.angular.io/guide/update-to-latest-version;
  - update @scion/components to version 15; for detailed migration instructions, refer to https://github.com/SchweizerischeBundesbahnen/scion-toolkit/blob/master/CHANGELOG_COMPONENTS.md;
* **workbench/router:** adding support for closing views that match a pattern introduced a breaking change in the Workbench Router API.

  The communication protocol between host and client is backward compatible, so you can upgrade the host and clients independently.

  To migrate:
  - Use `close=true` instead of `closeIfPresent=true` in navigation extras to instruct the router to close matching view(s).
  - Matrix parameters do not affect view resolution anymore.
  - The array of commands (path) now supports the asterisk wildcard segment (`*`) to match view(s) with any value in that segment.
  - To close a specific view, set a view target instead of a path.

  ### The following snippets illustrate how a migration could look like:

  **Close views**
  ```ts
  // Before migration: matrix params affect view resolution
  this.workbenchRouter.navigate(['/view', {param: 1}], {target: 'blank'}); // opens view 1
  this.workbenchRouter.navigate(['/view', {param: 2}], {target: 'blank'}); // opens view 2
  this.workbenchRouter.navigate(['/view', {param: 1}], {closeIfPresent: true}); // closes view 1
  this.workbenchRouter.navigate(['/view', {param: 2}], {closeIfPresent: true}); // closes view 2
  
  // After migration: matrix params do not affect view resolution
  this.workbenchRouter.navigate(['/view', {param: 1}], {target: 'blank'}); // opens view 1
  this.workbenchRouter.navigate(['/view', {param: 2}], {target: 'blank'}); // opens view 2
  this.workbenchRouter.navigate(['/view'], {close: true}); // closes view 1 and view 2
  ```
  
  **Close views matching a pattern (NEW)**
  ```ts
  // Open 4 views
  this.workbenchRouter.navigate(['team', 33, 'user', 11], {target: 'blank'});  // opens view 1
  this.workbenchRouter.navigate(['team', 33, 'user', 12], {target: 'blank'});  // opens view 2
  this.workbenchRouter.navigate(['team', 44, 'user', 11], {target: 'blank'});  // opens view 3
  this.workbenchRouter.navigate(['team', 44, 'user', 12], {target: 'blank'});  // opens view 4
  
  // Closes view 1
  this.workbenchRouter.navigate(['team', 33, 'user', 11], {close: true});
  
  // Closes view 1 and view 2
  this.workbenchRouter.navigate(['team', 33, 'user', '*'], {close: true});
  
  // Closes view 2 and view 4
  this.workbenchRouter.navigate(['team', '*', 'user', 12], {close: true});
  
  // Closes all views
  this.workbenchRouter.navigate(['team', '*', 'user', '*'], {close: true});
  ```
  
  **Close view by providing a viewId (NEW)**
  ```ts
  this.workbenchRouter.navigate([], {target: 'view.1', close: true});  // commands array has to be empty
  ```
  
  > **_NOTE:_** The Workbench Router Link uses the exact same API as the Workbench Router, therefore the migration is identical.
* **workbench/router:** ignoring matrix params to resolve views for navigation introduced a breaking change in the Workbench Router API.

  The communication protocol between host and client is backward compatible, so you can upgrade the host and clients independently.

  To migrate:
  - Use `target=auto` instead of `activateIfPresent=true` in navigation extras.\
    Using `auto` as the navigation target navigates existing view(s) that match the array of commands (path). If not finding a matching view, the navigation opens a new view. This is the default behavior if no target is specified.
  - Use `target=blank` instead of `activateIfPresent=false` in navigation extras.\
    Using `blank` as the navigation target always navigates in a new view.
  - Use `target=<view.id>` instead of setting `target=self` and `selfViewId=<view.id>` in navigation extras.\
    Setting a view id as the navigation target replaces the specified view, or creates a new view if not found.
  - Use the property `activate` in navigation extras to instruct the router to activate the view after navigation. Defaults to `true` if not specified.
  - If using WorkbenchRouterLink directive and pressing CTRL or META (Mac: ⌘, Windows: ⊞), the view is opened in a new view tab but not activated anymore. By setting the property `activate=true`, this behavior can be overwritten.

  ### The following snippets illustrate how a migration could look like:

  **Navigate existing view(s)**
  ```ts
  // Before migration
  this.workbenchRouter.navigate(['/view'], {activateIfPresent: true});
  
  // After migration
  this.workbenchRouter.navigate(['/view']);
  this.workbenchRouter.navigate(['/view'], {target: 'auto'}); // this is equivalent to the above statement
  ```
  
  **Open view in new view tab**
  ```ts
  // Before migration
  this.workbenchRouter.navigate(['/view'], {activateIfPresent: false});
  
  // After migration
  this.workbenchRouter.navigate(['/view'], {target: 'blank'});
  ```
  
  **Replace existing view**
  ```ts
  // Before migration
  this.workbenchRouter.navigate(['/view'], {target: 'self', selfViewId: 'view.1'});
  
  // After migration
  this.workbenchRouter.navigate(['/view'], {target: 'view.1'});
  ```
  
  **Prevent view activation after navigation (NEW)**
  ```ts
  this.workbenchRouter.navigate(['/view'], {target: 'blank', activate: false});
  ```



# [14.0.0-beta.9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/14.0.0-beta.8...14.0.0-beta.9) (2023-01-31)


### Bug Fixes

* **workbench/messagebox:** fix registration of MessageBoxService in root injector ([47beed6](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/47beed631b6b553d1881873f7d5dca749e71aa74))



# [14.0.0-beta.8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/14.0.0-beta.7...14.0.0-beta.8) (2022-12-21)


### Bug Fixes

* **workbench/popup:** attach popup to the DOM even if the view is inactive ([24d7d7c](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/24d7d7c40c8e68ddb8b12fa6421d0d02d7ae772c))
* **workbench/popup:** do not provide popup config for injection ([1656679](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/1656679247bdc435d80055405070ee5bcc430bff))


### Features

* **workbench/host:** enable popup opener to locate popup via CSS class ([73a4ee0](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/73a4ee02cc8a6010956766f1e114a7791346031e)), closes [#358](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/358)


### Dependencies

* **workbench/host:** update `@scion/microfrontend-platform` to version `1.0.0-rc.12` ([1f674fa](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/1f674fa5b727003efdd99d845a401a0326290fb6))


# [14.0.0-beta.7](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/14.0.0-beta.6...14.0.0-beta.7) (2022-12-07)


### Bug Fixes

* **workbench/host:** destroy SCION Microfrontend Platform when destroying the Angular platform ([2f62e66](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/2f62e665b20e1f2f79155929dd72a344668d99ac))
* **workbench/host:** dispose view-related command handlers on platform shutdown ([f784a28](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/f784a28f5c9f477eb83e50ea57fdf46fa43b9932))
* **workbench/host:** fix zone synchronization when displaying a notification outside of the Angular zone ([db78df0](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/db78df033e6baba36af317707af04e4619408fd8))
* **workbench/host:** fix zone synchronization when opening a message box outside of the Angular zone ([d4e70fe](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/d4e70fec4cf84129d1c175b4e89c6ed8b920e6fc))
* **workbench/host:** inject initializers provided under `MICROFRONTEND_PLATFORM_POST_STARTUP` DI token in the Angular zone ([2581190](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/25811905780577d894e2d3372ae04228c5d7fed6))
* **workbench/host:** provide `WorkbenchNotificationService` for injection ([ee89380](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ee89380d36b9876aa1fd2659a080abb6bdec1b22))
* **workbench/host:** register application-specific messaging interceptors before workbench/platform interceptors ([3204973](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/32049738e0d7bc678b87c26e94af5988f49c3ee9))
* **workbench/host:** retain focus on element that closed popup due to loss of focus ([29c82bf](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/29c82bf0961b393bbc4396ceb399dcee07425e22))


### Dependencies

* **workbench/host:** update `@scion/microfrontend-platform` to version `1.0.0-rc.11` ([34fec1d](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/34fec1dd61499cfbed15af8dfa3a69c2a647044c))


### BREAKING CHANGES

* **workbench/host:** Updating `@scion/microfrontend-platform` to version `1.0.0-rc.11` introduced a breaking change.

  More information on how to migrate can be found in the [changelog](https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/blob/master/docs/site/changelog/changelog.md) of the SCION Microfrontend Platform.




# [14.0.0-beta.6](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/14.0.0-beta.5...14.0.0-beta.6) (2022-11-09)


### Bug Fixes

* **workbench:** resolve view-related data for views that are child of component-less routes ([2fb8ae9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/2fb8ae95f7dc3bd7673ce1faaf9931abb65c8a7c)), closes [#357](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/357)


### Features

* **workbench/host:** provide lifecycle hook invoked before starting the microfrontend platform ([0ee9982](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0ee9982b7caf061218497d1e37df9fc6992d0b94))


### Dependencies

* **workbench/host:** update `@scion/microfrontend-platform` to version `1.0.0-rc.10` ([966ec41](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/966ec41e8e1e4c8b4f98c233cba59c246c88b349))



# [14.0.0-beta.5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/14.0.0-beta.4...14.0.0-beta.5) (2022-10-13)


### Bug Fixes

* **workbench-client/router:** set title/heading as passed to navigation ([f182859](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/f18285912a900d33ca3f46837eefb03a58c6d241))


### Features

* **workbench-client/router:** support named parameters in title/heading of view capability ([98f4bbd](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/98f4bbd9396480aa18d1e4fb8f339c707d48043c))



# [14.0.0-beta.4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/14.0.0-beta.3...14.0.0-beta.4) (2022-10-11)


### Bug Fixes

* **workbench/view:** display title/heading of a view as specified in the constructor of the view ([74db341](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/74db3416f3f10e669aa8660853551219e73484d7))


### Features

* **workbench/popup:** add 'referrer' to popup handle to provide information about the calling context ([edf6f53](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/edf6f53244508f77bc6b8db3e32607b5211c4ccd))
* **workbench/popup:** associate `sci-router-outlet` with provider and capability identity ([71176b7](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/71176b723b275056df4bc79b1489b6ebd61f0036))
* **workbench/view:** associate `sci-router-outlet` with provider and capability identity ([47f0f96](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/47f0f96a1151f424df2f0775bdc6feca53932586))



# [14.0.0-beta.3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/14.0.0-beta.2...14.0.0-beta.3) (2022-10-10)


### Dependencies

* **workbench:** migrate to the asynchronous Interception API of `@scion/microfrontend-platform` ([ab8df30](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ab8df30fd43f0318c407d16dfc80a8b67fb9e1e7))


### BREAKING CHANGES

* **workbench:** Updating `@scion/microfrontend-platform` to version `1.0.0-rc.7` introduced a breaking change.

  To migrate, refer to the changelog of the SCION Microfrontend Platform: https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/blob/master/CHANGELOG.md#100-rc7-2022-10-07

# [14.0.0-beta.2](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/14.0.0-beta.1...14.0.0-beta.2) (2022-10-07)


### Bug Fixes

* **workbench/popup:** open popup inside Angular zone ([2cdd994](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/2cdd9947056261084a371df6d19d1b1b0bf70476))
* **workbench/router:** navigate inside Angular zone ([48e0e1a](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/48e0e1a615669b173640403c987ed788e3076ace))


### Features

* **workbench/popup:** allow positioning of a popup relative to its contextual view or the page viewport ([484d9bd](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/484d9bd60114e7313dcce53b5641477a017da6b0)), closes [#342](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/342)
* **workbench/router:** allow setting CSS classes on a view via router and route data definition ([3d46204](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/3d4620490f2ed1e19191bf0bc2ea8d0779b03d93))


### DEPRECATIONS

* **workbench/router:** deprecate constants for declaring view title and heading in route data definition

  - Constants for declaring a view's title and heading in its route data definition have been moved to `WorkbenchRouteData` and the former constants `WB_VIEW_TITLE_PARAM`, `WB_VIEW_HEADING_PARAM` and `WB_STATE_DATA` are deprecated. Deprecated constants will be removed in version 16.
  - Setting a view's title and heading via URL matrix parameters has been deprecated and will be removed in version 16. No replacement is planned.

  To migrate:
  - replace `WB_VIEW_TITLE_PARAM` with `WorkbenchRouteData.title`
  - replace `WB_VIEW_HEADING_PARAM` with `WorkbenchRouteData.heading`
  - replace `WB_STATE_DATA` with `WorkbenchRouteData.state`



# [14.0.0-beta.1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/13.0.0-beta.2...14.0.0-beta.1) (2022-09-14)


### Bug Fixes

* **workbench:** do not display backdrop when opening the view list menu ([d80582f](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/d80582f1fa1e3077999e6bf85c2d671ca698e1e5))
* **workbench:** fix resolution of SASS modules when linking the library via `tsconfig` path overrides ([213d58b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/213d58b8b70e88acfc0619a9d7468c19ca390acd))
* **workbench:** render view tabs smaller ([8d2b66e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/8d2b66e14e812b2ba3c1b49018367edc49cfa9c1))


### Dependencies

* **workbench:** update @scion/workbench to Angular 14 ([bd4bcd7](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/bd4bcd749969065799ae42f71e7383f2f65d73c7)), closes [#340](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/340)


### BREAKING CHANGES

* **workbench:** Updating `@scion/workbench` to Angular 14 introduced a breaking change.

  To migrate:
  - update your application to Angular 14.x; for detailed migration instructions, refer to https://v14.angular.io/guide/update-to-latest-version;
  - update @scion/components to version 14; for detailed migration instructions, refer to https://github.com/SchweizerischeBundesbahnen/scion-toolkit/blob/master/CHANGELOG_COMPONENTS.md;



# [13.0.0-beta.2](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/13.0.0-beta.1...13.0.0-beta.2) (2022-05-20)


### Bug Fixes

* **workbench:** support importing the workbench theme without using the tilde as `node_modules` alias ([a4556ac](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a4556ac4bb631756110a4e9ff1fb9a52427f665d))


### Dependencies

* **workbench:** migrate to the framework-agnostic package `@scion/toolkit` ([38368e9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/38368e93fffb7ecf3bcf0338f6f43ee2a760de9a))


### BREAKING CHANGES

* **workbench:** Migrating to the framework-agnostic package `@scion/toolkit` introduced a breaking change.

  Previously, framework-agnostic and Angular-specific tools were published in the same NPM package `@scion/toolkit`, which often led to confusion and prevented framework-agnostic tools from having a release cycle independent of the Angular project. Therefore, Angular-specific tools have been moved to the NPM package `@scion/components`. Framework-agnostic tools continue to be released under `@scion/toolkit`, but now starting with version `1.0.0` instead of pre-release versions.

  To migrate:
  - Install the NPM package `@scion/toolkit` in version `1.0.0` using the following command: `npm install @scion/toolkit@latest --save`. Note that the toolkit was previously released as pre-releases of version `13.0.0` or older.
  - Install the NPM module `@scion/components` in version `13.0.0` using the following command: `npm install @scion/components@latest --save`
  - If you are using Angular components from the toolkit in your project, for example the `<sci-viewport>` component, please follow the migration instructions of the [SCION Toolkit Changelog](https://github.com/SchweizerischeBundesbahnen/scion-toolkit/blob/master/docs/site/changelog-components/changelog.md#migration-of-angular-specific-components-and-directives). Components of the toolkit have been moved to the NPM package `@scion/components`.

* **workbench:** Adding support to import the workbench theme without using the tilde introduced a breaking change.

  Angular 13 has dropped the tilde support (`~`) for resolving Sass files located in the `node_modules` folder. For more information, refer to the Angular migration commit https://github.com/angular/components/commit/f2ff9e3.

  To migrate:
  - In `styles.scss`, import the SASS module `@scion/workbench` as follows: `@use '@scion/workbench'`.
    It is no longer necessary to include the "theme" mixin because applied as a side effect when importing the module.
  
    Before the migration:
    ```scss
    @import '~@scion/workbench/theming';
    @include wb-theme();
    ```
  
    After the migration:
    ```scss
    @use '@scion/workbench';
    ```



# [13.0.0-beta.1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/12.0.0-beta.3...13.0.0-beta.1) (2022-05-02)


### Bug Fixes

* **workbench/view:** discard parameter if set to `undefined` ([b3b6a14](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/b3b6a1465c277f139bb7f2676deadab5970d5dd7)), closes [#325](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/325)
* **workbench/view:** preserve position and size of inactive views ([c0f869b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/c0f869bf25b34c9ca249f1bca91f2c974c81a75f))


### Dependencies

* **workbench:** update @scion/workbench to Angular 13 and migrate to RxJS 7.5 ([e666841](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e666841593fafbf276cd5cb1e18c8dc3317b8929)), closes [#298](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/298)


### BREAKING CHANGES

* **workbench:** Updating `@scion/workbench` to Angular 13 and RxJS 7.5 introduced a breaking change.

  To migrate:
  - update your application to Angular 13; for detailed migration instructions, refer to https://github.com/angular/angular/blob/master/CHANGELOG.md;
  - migrate your application to RxJS 7.5; for detailed migration instructions, refer to https://rxjs.dev/6-to-7-change-summary;
  - update @scion/toolkit to version 13; for detailed migration instructions, refer to https://github.com/SchweizerischeBundesbahnen/scion-toolkit/blob/master/CHANGELOG.md;
  - removed option in `MessageBoxConfig` to configure a custom `componentFactoryResolver` as not needed in Angular 13 anymore;
  - removed option in `NotificationConfig` to configure a custom `componentFactoryResolver` as not needed in Angular 13 anymore;
  - removed option in `PopupConfig` to configure a custom `componentFactoryResolver` as not needed in Angular 13 anymore;



# [12.0.0-beta.3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/12.0.0-beta.2...12.0.0-beta.3) (2022-03-17)


### Bug Fixes

* **workbench/microfrontend-support:** do not delegate log messages from @scion/microfrontend-platform to the workbench logger ([f514a13](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/f514a139ad9b0d3a9e6c27d16d33ec761479ba78))

### Dependencies

* **workbench/microfrontend-support:** upgrade @scion/microfrontend-platform to v1.0.0-rc.1 ([048fabf](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/048fabf7315fad84855f5eae6ddc4b706de42fa4))


# [12.0.0-beta.2](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/12.0.0-beta.1...12.0.0-beta.2) (2022-02-11)


### Bug Fixes

* **workbench:** ensure calling `wbBeforeDestroy` only for the view to be closed ([e25cefb](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e25cefbf411862b36953e94728c9f8ade75736c2))
* **workbench:** set view properties of inactive views upon initial view tab navigation ([30d573f](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/30d573f7d7017d79cdf4ef8d474ac30d10c372b4))
* **workbench:** use transparent backdrop in the view's context menu ([236a41a](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/236a41ad07f5be0227179eaa596d7ec44fb98ba4))


### Code Refactoring

* **workbench/popup:** open popups from within an interceptor ([a11fd9d](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a11fd9dc96cd7265f3372ecff0723584dea7b7fd)), closes [#276](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/276)
* **workbench/view:** open views from within an interceptor ([137b8d0](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/137b8d073e5d0a9dc183cbed7451ceba852fc1e5))


### Features

* **workbench:** allow adding css classes to menu items ([791485a](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/791485a8d13a8ee2b19b009c81e5937cf7e4a60f))
* **workbench:** allow controlling which view params to persist in the URL ([dcb5ee1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/dcb5ee163ebb05b2881725e9291d36b5e2c49f07)), closes [#278](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/278)
* **workbench:** migrate to @scion/microfrontend-platform v1.0.0-beta.20 ([24dfec2](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/24dfec2251b85a1a380ee2299b26cb4452883097)), closes [SchweizerischeBundesbahnen/scion-microfrontend-platform/#96](https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/issues/96)


### BREAKING CHANGES

* **workbench:** Supporting `@scion/microfrontend-platform v1.0.0-beta.20` introduced a breaking change in the configuration of the host application and the host/client communication protocol.

  SCION Microfrontend Platform consolidated the API for configuring the platform, eliminating the different ways to configure the platform. Consequently, SCION Workbench could also simplify its API for enabling microfrontend support.

  Related issue of the SCION Microfrontend Platform: [SchweizerischeBundesbahnen/scion-microfrontend-platform/#96](https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/issues/96)

  #### Host App Migration
  - property `WorkbenchModuleConfig.microfrontends` has been renamed to `WorkbenchModuleConfig.microfrontendPlatform` and its type changed from `WorkbenchMicrofrontendConfig` to `MicrofrontendPlatformConfig` (provided by @scion/microfrontend-platform);
  - `MicrofrontendPlatformConfigLoader` has been changed to return an instance of `MicrofrontendPlatformConfig` instead of the `PlatformConfig`;
  - DI token `POST_MICROFRONTEND_PLATFORM_CONNECT` has been renamed to `MICROFRONTEND_PLATFORM_POST_STARTUP` in order to be consistent with other workbench DI tokens;
  - provide the host's manifest, if any, via `MicrofrontendPlatformConfig.host.manifest` instead of `WorkbenchMicrofrontendConfig.platformHost.manifest`; either as URL or object literal
  - register applications in `MicrofrontendPlatformConfig.applications` instead of `WorkbenchMicrofrontendConfig.platform.apps`;
  - specify the symbolic name of the host in `MicrofrontendPlatformConfig.host.symbolicName` instead of `WorkbenchMicrofrontendConfig.platformHost.symbolicName`;
  - configure properties in `MicrofrontendPlatformConfig.properties` instead of `WorkbenchMicrofrontendConfig.platform.properties`;
  - specify global `manifestLoadTimeout` in `MicrofrontendPlatformConfig.manifestLoadTimeout` instead of `WorkbenchMicrofrontendConfig.platform.manifestLoadTimeout`;
  - specify global `activatorLoadTimeout` in `MicrofrontendPlatformConfig.activatorLoadTimeout` instead of `WorkbenchMicrofrontendConfig.platform.activatorLoadTimeout`;
  - the bean `MicroApplicationConfig` has been removed; you can now obtain the application's symbolic name as following: `Beans.get<string>(APP_IDENTITY)`;
  - the interface `ApplicationManifest` has been renamed to `Manifest`;

  For further instructions on how to migrate the host, refer to https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/blob/master/docs/site/changelog/changelog.md#host-app-migration

* **workbench/popup:** Opening popups from within an interceptor introduced a breaking change in the host/client communication protocol.

  The communication protocol between host and client HAS CHANGED for opening a popup. You need to update host and affected clients to the new version simultaneously. The API has not changed; the breaking change applies only to the version of @scion/workbench and @scion/workbench-client. To migrate, upgrade to @scion/workbench@12.0.0-beta.2 and @scion/workbench-client@1.0.0-beta.8, respectively.

* **workbench/view:** Opening views from within an interceptor introduced a breaking change in the host/client communication protocol.

  The communication protocol between host and client HAS CHANGED for opening a view. You need to update host and affected clients to the new version simultaneously. The API has not changed; the breaking change applies only to the version of @scion/workbench and @scion/workbench-client. To migrate, upgrade to @scion/workbench@12.0.0-beta.2 and @scion/workbench-client@1.0.0-beta.8, respectively.



# [12.0.0-beta.1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/11.0.0-beta.8...12.0.0-beta.1) (2021-07-12)


### chore

* update project workspace to Angular 12 ([8be4410](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/8be4410c755a8cec150a84e0cfc0a1a43d0773b8)), closes [#277](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/277)



# [11.0.0-beta.8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/11.0.0-beta.7...11.0.0-beta.8) (2021-07-09)

### chore

* compile with TypeScript strict checks enabled ([c13e3b6](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/c13e3b6067df597bdf182ff27c482b0ec3b98b74)), closes [#246](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/246)



# [11.0.0-beta.7](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/11.0.0-beta.6...11.0.0-beta.7) (2021-04-13)


### Features

* **workbench/core:** allow getting a reference to a workbench view ([934ec66](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/934ec668828627a4f25c3fabe28bd4b86e532f6b))
* **workbench/popup:** allow registering providers for dependency injection ([c2cec23](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/c2cec233dda5773a0d7de181c63fcaf4b7a35305))
* **workbench/popup:** allow the host app to provide popup capabilities ([a4e74b1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a4e74b1430c8cc3dc8fbc9c8de90f6f1d738dab6)), closes [#270](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/270)


### BREAKING CHANGES

* **workbench/popup:** Adding support for opening a popup of the host app from within a microfrontend introduced a breaking change in the host/client
  communication protocol.

  The communication protocol between host and client HAS CHANGED for opening a popup. You need to update host and clients to the new version simultaneously. The API has not changed; the breaking change applies only to the version of `@scion/workbench` and `@scion/workbench-client`. To migrate, upgrade to `@scion/workbench@11.0.0-beta.7` and `@scion/workbench-client@1.0.0-beta.6`, respectively.



# [11.0.0-beta.6](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/11.0.0-beta.5...11.0.0-beta.6) (2021-02-12)


### Bug Fixes

* **workbench-client/router:** provide microfrontends with the most recent view capability ([0b8f140](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0b8f140fcc87f5aa2b3672a0e939db9b2c91d993))
* **workbench/view:** support workbench keystrokes from embedded content ([e031f96](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e031f96a621b86739dcb2242ffbe6f0e7b781b0d))


### Code Refactoring

* **workbench/popup:** configure contextual reference(s) via context object ([0591e7a](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0591e7a1e0c7080888b4a697ee70995dcb9cbbfc))


### Features

* **workbench/message-box:** allow controlling which view to block when opening a view-modal message box ([3434e5b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/3434e5bde65d08651c269cf6d602bb8afc0e95c9)), closes [#251](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/251)


### BREAKING CHANGES

* **workbench/popup:** Changed popup config for passing contextual reference(s)

  To migrate: Set a popup's view reference via `PopupConfig#context#viewId` instead of `PopupConfig#viewRef`.



# [11.0.0-beta.5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/11.0.0-beta.4...11.0.0-beta.5) (2021-02-10)


### Features

* support for merging parameters in self navigation ([a984ace](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a984ace36cdb66e34b25f1f62fc73bb71b36308e)), closes [#259](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/259)



# [11.0.0-beta.4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/11.0.0-beta.3...11.0.0-beta.4) (2021-02-03)


### Bug Fixes

* **workbench/message-box:** display message box with properties as set in message box component ([496249e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/496249e99502e156dd4bac34447e1e3b70eccc80)), closes [#253](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/253)
* **workbench/notification:** display notification with properties as set in notification component ([4159a09](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/4159a0958c7098b3f401d6db97e41a0b862a9c29)), closes [#253](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/253)
* **workbench/view:** allow setting a microfrontend's view title via matrix param ([c86b680](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/c86b6802cdc82c991a4e255547fc023755391ef3))
* **workbench/view:** fill content of views loaded from lazy modules vertically and horizontally ([24f6038](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/24f60384f626a5246f5eb12d2f6af1f31ea3e5a7))


### Features

* **workbench/microfrontend:** upgrade to @scion/microfrontend-platform@1.0.0-beta.11 ([11c2f20](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/11c2f20d00d8a73f0fa32ec738bf4378971c5648))



# [11.0.0-beta.3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/11.0.0-beta.2...11.0.0-beta.3) (2021-01-25)


### Bug Fixes

* **workbench:** start microfrontend platform outside the Angular zone ([296f6b0](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/296f6b037a42c697c85c4b8974e4ce8884bf18ca))


### Code Refactoring

* **workbench-client/message-box:** consolidate message box API to be consistent with the popup API ([4a386c3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/4a386c3147b6c3c663ff86f636a883fcd9e896af))
* **workbench-client/notification:** consolidate notification API to be consistent with the message box and popup API ([162a70d](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/162a70d1fc6d7c8c2badd646d88a04befb4a1417))


### Features

* **workbench-client/message-box:** allow messages to be displayed from microfrontends ([30aef07](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/30aef07bf6cf9db5f267afd4560aedae79bd1ebe))
* **workbench-client/notification:** allow notifications to be displayed from microfrontends ([4757ac3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/4757ac3fb050692e1b4b6b56ec0691431cae98d8))
* **workbench-client/popup:** allow providing a microfrontend for display in a workbench popup ([bc23e65](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/bc23e65e835ba48bd71a762823b2cab0621a588f))
* **workbench/popup:** allow to open a popup from a screen coordinate and bind it to the lifecycle of a view ([864d75c](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/864d75c98172b49aa80ffd5b8ab4981107a60ef0))
* **workbench/startup:** export workbench startup lifecycle hooks ([321e72b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/321e72b391e4f0d3c671219fdcda695e1bd7f9f8))


### BREAKING CHANGES

* **workbench-client/notification:** The refactoring of the notification introduced a breaking change as properties were renamed:

    - To display a notification, pass a `NotificationConfig` instead of a `Notification` object. The `Notification` object is now used exclusively as the handle for injection into the notification component. It has the following new methods: `setTitle`, `setSeverity`, `setDuration`, `setCssClass`.
    - If passing data to the notification component, set it via `componentInput` config property instead of the `input` property.
* **workbench-client/message-box:** The refactoring of the message box introduced a breaking change as properties were renamed:

    - To display a message box, pass a `MessageBoxConfig` instead of a `MessageBox` object. The `MessageBox` object is now used exclusively as the handle for injection into the message box component. It has the following new methods: `setTitle`, `setSeverity`, `setActions`, `setCssClass`.
    - If passing data to the message box component, set it via `componentInput` config property instead of the `input` property.
* **workbench/popup:** consolidated the config for opening a popup in preparation for the microfrontend popup integration

    To migrate:
    - Rename the `position` property to `align`. This property is used for aligning the popup relative to its anchor.
    - Remove the closing strategy `onLayoutChange` as binding a popup to a Workbench view is now supported. This strategy existed only as a workaround to close popups when switching between views.
    - Pass the preferred popup overlay size as `PopupSize` object literal instead of separate top-level config properties, as follows:
        - `PopupConfig.width` -> `PopupConfig.size.width`
        - `PopupConfig.height`-> `PopupConfig.size.height`
        - `PopupConfig.minWidth` -> `PopupConfig.size.minWidth`
        - `PopupConfig.maxWidth` -> `PopupConfig.size.maxWidth`
        - `PopupConfig.minHeight` -> `PopupConfig.size.minHeight`
        - `PopupConfig.maxHeight`-> `PopupConfig.size.maxHeight`



# [11.0.0-beta.2](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/11.0.0-beta.1...11.0.0-beta.2) (2020-12-22)


### Features

* **workbench-client:** provide core workbench API to microfrontends ([55fabc3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/55fabc37867b4891fb58dd73647c2acb1135d49a))


### BREAKING CHANGES

* **workbench-client:** Workbench Microfrontend support introduced the following breaking changes:

    - The workbench component is no longer positioned absolutely but in the normal document flow. To migrate, add the workbench component to your CSS layout and make sure it fills the remaining space vertically and horizontally.
    - Renamed the workbench config from `WorkbenchConfig` to `WorkbenchModuleConfig`.
    - Removed the e2e-testing related CSS classes `e2e-active` and `e2e-dirty`; to migrate, replace them with `active` and `dirty`.
    - Renamed flag to set popup closing strategy from `onGridLayoutChange` to `onLayoutChange`



# [11.0.0-beta.1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.35...11.0.0-beta.1) (2020-11-17)


### Bug Fixes

* **workbench:** remove flickering when dropping views ([46a9c4d](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/46a9c4dee209c3466d973b7590a009c5273b4561))
* **workbench:** wait to navigate until other navigations complete ([5448260](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/54482602078506d05163536378f4c47859656bdc))


### chore

* **application-platform:** delete SCION Workbench Application Platform ([3468a43](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/3468a434e7748084070511e68c010ca44f03aee5)), closes [#232](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/232)
* **dimension:** delete `@scion/dimension` module ([7c73203](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/7c73203b3312508f3618a7b118386e74eb989317))
* **viewport:** delete `@scion/viewport` module ([809b028](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/809b0284b4cd053a1fa934f61fcb4cb9efd35338))
* **workbench:** update @scion/workbench to Angular 11 ([5d45ce3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/5d45ce3aefb8c4d8faf8396c8271a5c0a255ff96)), closes [#234](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/234)


### Code Refactoring

* **workbench:** refactor the workbench layout as prerequisite for complex layouts with fixed parts ([84b764c](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/84b764cb872a5378e908b9a6279d64356c271aba))


### BREAKING CHANGES

* **workbench:** Added support for Angular 11.

    To migrate:
    Migrate your app to Angular 11 as following:
    - Run `ng update @angular/cli @angular/core @angular/cdk`.
    - Refer to the Angular Update Guide for detailed instructions on how to update Angular: https://update.angular.io/

* **dimension:** The dimension was moved from `@scion/dimension` to `@scion/toolkit` NPM module.

    SCION Toolkit is a collection of UI components and utilities. The toolkit is published as single NPM library with a separate entry point per tool, allowing for tree shaking away not used tools.
    Refer to https://github.com/SchweizerischeBundesbahnen/scion-toolkit/blob/master/docs/site/tools/dimension.md for more information about dimension directive.
    Refer to https://github.com/SchweizerischeBundesbahnen/scion-toolkit/blob/master/docs/site/tools/observable.md for more information about replacement of `DimensionService`.
    
    To migrate:
    - Uninstall NPM module `@scion/dimension`
    - Install NPM module `@scion/toolkit`
    - Replace ES2015 imports `@scion/dimension` with `@scion/toolkit/dimension`
    - Replace usage of `DimensionService` with `fromDimension$ ` Observable for observing the dimension of a DOM element.

* **viewport:** The viewport was moved from `@scion/viewport` to `@scion/toolkit` NPM module.

    SCION Toolkit is a collection of UI components and utilities. The toolkit is published as single NPM library with a separate entry point per tool, allowing for tree shaking away not used tools.
    Refer to https://github.com/SchweizerischeBundesbahnen/scion-toolkit/blob/master/docs/site/tools/viewport.md for more information.
    
    To migrate:
    - Uninstall NPM module `@scion/viewport`
    - Install NPM module `@scion/toolkit`
    - Replace ES2015 imports `@scion/viewport` with `@scion/toolkit/viewport`

* **application-platform:** The development of the SCION Application Platform was discontinued in favor of the new SCION Microfrontend Platform. SCION Microfrontend Platform is extremely lightweight and does not depend on SCION Workbench and Angular. Microfrontend support for the SCION Workbench will be back soon. We are working on the integration of the new SCION Microfrontend Platform into the workbench to enable a seamless integration of microfrontends as workbench views.

    We have deleted the SCION application platform from our Git repository and deprecated respective NPM modules. This project is discontinued and will no longer be maintained. Its documentation is still online. The following NPM modules are deprecated: `@scion/workbench-application-platform`, `@scion/workbench-application-platform.api`, `@scion/workbench-application.core`, `@scion/workbench-application. angular`, `@scion/mouse-dispatcher`, `@scion/dimension` (moved to `@scion/toolkit`), `@scion/viewport` (moved to `@scion/toolkit`).
    
    If you still need updates for new Angular versions, please let us know and submit a GitHub issue. Alternatively, micro applications can use the TypeScript module `@scion/workbench-application.core` instead of `@scion/workbench-application.angular`. We plan to release the new microfrontend support for the SCION Workbench by the end of 2020 so that you can migrate to Angular 11. Detailed migration instructions for upgrading to the new workbench microfrontend support will follow after its release.
    
    Refer to https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform for more information about SCION Microfrontend Platform.

* **workbench:** The refactoring of the workbench layout introduced a breaking change as properties were renamed, dependencies added or removed, and the internal DOM structure changed.

    To migrate:
    - Update the usage of following properties:
      - Property `selfViewRef` of `WbNavigationExtras` was renamed to `selfViewId`
      - Property `blankViewPartRef` of `WbNavigationExtras` was renamed to `blankPartId`
      - Property `viewRef` of `WorkbenchView` was renamed to `viewId`
      - Property `viewPart` of `WorkbenchView` was renamed to `part`
      - Property `viewPartRef` of `WorkbenchViewPart` was renamed to `partId`
      - Property `activeViewRef$ ` of `WorkbenchViewPart` was renamed to `activeViewId$ `
      - Property `activeViewRef` of `WorkbenchViewPart` was renamed to `activeViewId`
      - Property `viewRefs$ ` of `WorkbenchViewPart` was renamed to `viewIds$ `
      - Property `viewRefs` of `WorkbenchViewPart` was renamed to `viewIds`
      - Property `viewRef` of `WorkbenchViewPartAction` was renamed to `viewId`
    - Add the dependency `@scion/toolkit@10.0.0-beta.3` as required by the workbench
    - Remove the dependencies `@scion/dimension` and `@scion/viewport` as tools are now used from `@scion/toolkit`.
       Refer to https://github.com/SchweizerischeBundesbahnen/scion-toolkit for more information about its installation and usage.
    - If you rely on the workbench-internal DOM structure to style your app, change CSS selectors as following:
      - Attribute `viewpartref` of `<wb-view-part>` was changed to `data-partid`
      - Attribute `viewref` of `<wb-view>` was changed to `data-viewid`
      - Attribute `viewref` of `<wb-view-tab>` was changed to `data-viewid`
      - DOM element `<wb-view-part-grid>` was renamed to `<wb-parts-layout>`
      - DOM element `<wb-view-part-sash-box>` was renamed to `<wb-tree-node>`
      - Added `<sci-sashbox>` as child to `<wb-tree-node>` element
    - The serialized representation of the layout in the URL changed. For that reason, we renamed the query parameter `viewgrid` to `parts` so  that the app does not error when loading it from a bookmark into the browser.


# [0.0.0-beta.35](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.34...0.0.0-beta.35) (2020-07-17)


### chore

* update workbench to Angular 10 ([726e5b3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/726e5b357fff1cbf294aba14faa9a7b0d29ce3ad)), closes [#224](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/224)


### BREAKING CHANGES

* Added support for Angular 10.

To migrate:
- run `ng update @angular/cli @angular/core @angular/cdk` to migrate your app to Angular 10. For more information, see https://angular.io/guide/updating-to-version-10.



# [0.0.0-beta.34](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.33...0.0.0-beta.34) (2020-07-02)


### Bug Fixes

* remove deep imports to `@angular/core` ([0a3f4d0](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0a3f4d0bf9ac7ceda3979444554c86efe6854a08))
* set CSS classes to `ngClass` directive without function call ([64e3dde](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/64e3dde297d1bf9465c920fe1e444903bc508028))



# [0.0.0-beta.33](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.32...0.0.0-beta.33) (2020-02-21)

### Features

* chore: add support for angular 9, drop support for angular < 9 [#197](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/197)

# [0.0.0-beta.32](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.31...0.0.0-beta.32) (2019-11-13)


### Bug Fixes

* declare the type `viewref` to be of type `string` instead of a string literal ([7bc15c6](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/7bc15c6b814e62db5c5324338a19909d1b082149)), closes [#207](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/207)


# [0.0.0-beta.31](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.30...0.0.0-beta.31) (2019-11-13)


### Features

* allow a microfrontend to open a view in a specific view outlet ([6e44e1a](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/6e44e1aafea058d49a0cdf0e03793cd14db5e4ed)), closes [#207](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/207)


# [0.0.0-beta.30](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.29...0.0.0-beta.30) (2019-11-11)


### Bug Fixes

* add wildcard support for querying capabilities in the host app ([e6bde77](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e6bde77)), closes [#201](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/201)
* allow a microfrontend observing capabilities for which it declares an intent ([99ccdf5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/99ccdf5)), closes [#198](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/198) [#202](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/202)
* remove implicit intent when unregistering a capability ([0996a22](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0996a22)), closes [#200](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/200)
* unregister a capability by its type and qualifier instead of its id ([6044823](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/6044823)), closes [#199](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/199)


# [0.0.0-beta.29](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.28...0.0.0-beta.29) (2019-11-01)


### Bug Fixes

* provide fallback for the former 'query' property of manifest commands ([5431811](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/5431811))
* show entry point page inside a viewport ([818187e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/818187e)), closes [#129](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/129)
* support wildcard intents when querying capability consumers ([2332f10](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/2332f10))


### Features

* allow a microfrontend to register activator endpoints invoked at platform startup ([a5a97df](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a5a97df)), closes [#190](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/190)
* allow querying capabilities matching a given qualifier pattern ([16d1fa7](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/16d1fa7)), closes [#188](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/188)
* allow to register and unregister capabilities from inside a microfrontend ([782c831](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/782c831)), closes [#189](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/189)
* show metadata of capabilities in dev-tools ([0af6db8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0af6db8))


# [0.0.0-beta.28](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.27...0.0.0-beta.28) (2019-09-13)


### Bug Fixes

* use correct registry in package-lock.json ([28c3e05](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/28c3e05)), closes [#182](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/182)


# [0.0.0-beta.27](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.26...0.0.0-beta.27) (2019-09-13)


### Bug Fixes

* bundle stylesheets with scss-bundle ([5e2d141](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/5e2d141)), closes [#179](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/179)


# [0.0.0-beta.26](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.25...0.0.0-beta.26) (2019-09-10)


### Bug Fixes

* emit the initial element dimension also if using native resize observer ([5d88128](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/5d88128)), closes [#169](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/169)
* insert new view tab into the tab bar after the active view tab ([14d76f0](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/14d76f0)), closes [#167](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/167)
* match intent with wildcard qualifier key/value(s) ([5ea3981](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/5ea3981)), closes [#172](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/172)
* preserve line-breaks in message box content ([0060c11](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0060c11)), closes [#131](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/131)
* support mac command key when opening view in new view tab ([b2be851](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/b2be851)), closes [#155](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/155)


### Features

* add API to query if micro-frontend is running standalone ([10c2b45](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/10c2b45)), closes [#130](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/130)
* add context menu to view tabs and provide menu items for commonly used view tab actions ([cd41eb3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/cd41eb3)), closes [#174](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/174)
* allow defining capabilities with optional qualifier entries ([d462512](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/d462512)), closes [#154](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/154) [#173](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/173)
* allow dragging views to app instances running in different browser tabs or windows ([2ee9df3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/2ee9df3)), closes [#168](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/168)
* provide better feedback to the user when dragging views ([78f9c80](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/78f9c80)), closes [#164](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/164)


### BREAKING CHANGES

* removed support for the asterisk (*) wildcard as capability qualifier key: instead, use the question mark (?) as qualifier value to mark the qualifier entry as optional


# [0.0.0-beta.25](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.24...0.0.0-beta.25) (2019-07-26)


### Bug Fixes

* post the request in request-receive communication when subscribing to the observable ([f8a7f8c](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/f8a7f8c)), closes [#160](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/160)
* show the view dropdown only if some view tabs overflow ([ab57d4b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ab57d4b)), closes [#159](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/159)


### Features

* activate the most recent view when closing a view ([7896583](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/7896583)), closes [#74](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/74)
* control if to use native resize observable unless explicitly specified via options object ([0594320](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0594320)), closes [#156](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/156)


# [0.0.0-beta.24](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.23...0.0.0-beta.24) (2019-07-22)


### Bug Fixes

* observe element dimension changes natively ([f53f4b3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/f53f4b3)), closes [#156](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/156)
* remove 'web-animations-js' polyfill from host-app as it breaks the app ([2c55f2f](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/2c55f2f)), closes [#152](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/152)


### BREAKING CHANGES

* removed 'viewportChange' output property from `<sci-viewport>` component.\
  Migration: Add the dimension directive `[sciDimension]` to the viewport 
  and/or viewport client, and/or listen for viewport scroll events with 'scroll' output property.


# [0.0.0-beta.23](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.22...0.0.0-beta.23) (2019-06-12)


### Bug Fixes

* remove deprecated API ([24c6929](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/24c6929))
* remove workaround for Angular issue [#25313](https://github.com/angular/angular/issues/25313) ([5ba0d16](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/5ba0d16))


### Features

* remove support for Angular 7 ([6dda04e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/6dda04e)), closes [#147](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/147)
* support Angular 8 ([cbceba2](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/cbceba2)), closes [#147](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/147) [#37](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/37)


### BREAKING CHANGES

* SCION Workbench no longer supports Angular 6 and Angular 7. Migrate your project to run with Angular 8.
  See Angular Update Guide for detailed instructions on how to upgrade to a newer Angular version.
* removed WorkbenchRouter.resolve:  use `Router.navigate` and set `closeIfPresent` in `WbNavigationExtras`
* removed WbNavigationExtras.tryActivateView: use `WbNavigationExtras.activateIfPresent` instead

# [0.0.0-beta.22](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.21...0.0.0-beta.22) (2019-05-08)

### Bug Fixes

* allow interaction with the platform once navigated away from an application's root page ([80ddeab](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/80ddeab)), closes [#141](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/141)


# [0.0.0-beta.21](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.20...0.0.0-beta.21) (2019-05-01)

### Bug Fixes

* emit the host element's initial size ([c41509a](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/c41509a)), closes [#137](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/137)
* emit when the dimension changes due to a window orientation change ([c04a4f6](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/c04a4f6)), closes [#137](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/137)
* update angular and rxjs dependencies ([870b377](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/870b377))


# [0.0.0-beta.20](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.19...0.0.0-beta.20) (2019-04-24)


### Bug Fixes

* change the iframe url without adding an entry to the browser's history ([4ff1a6b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/4ff1a6b)), closes [#128](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/128)


### Features

* allow providing custom properties when loading app config via config loader ([64219b1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/64219b1)), closes [#133](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/133)


### BREAKING CHANGES

* Replaced `ApplicationConfigLoader` with `PlatformConfigLoader` to load a remote configuration for the workbench application platform.

To migrate (if loading platform config via config loader):
- change your loader to implement `PlatformConfigLoader` instead of `ApplicationConfigLoader`
- register your loader in `WorkbenchApplicationPlatformModule.forRoot(...)` config via `platformConfigLoader` instead of `applicationConfigLoader` property
- change your config json to return a `PlatformConfig` object instead of an array of `ApplicationConfig` objects

See https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/resources/site/how-to/workbench-application-platform/how-to-register-applications.md for more information.


# [0.0.0-beta.19](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.18...0.0.0-beta.19) (2019-03-18)


### Bug Fixes

* match matrix params when resolving views for activation or closing ([65ba4f0](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/65ba4f0)), closes [#120](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/120)
* re-export workbench-application-platform.api in workbench-application-platform bundle ([34cd8de](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/34cd8de)), closes [#118](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/118)
* show view tab title of inactive views when reloading the application ([f011b5b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/f011b5b)), closes [#121](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/121)


### Features

* control if an application is allowed to contribute activities ([dd9b81c](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/dd9b81c)), closes [#122](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/122)

# [0.0.0-beta.18](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.17...0.0.0-beta.18) (2019-03-15)


### Bug Fixes

* allow using `sciDimension` directive in 'OnPush' change detection context ([cc15561](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/cc15561)), closes [#106](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/106)


### Features

* allow adding actions to the viewpart action bar ([0b31ca3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0b31ca3)), closes [#104](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/104)
* allow scheduling tasks in micro or macro task queue ([58c643b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/58c643b))
* allow showing an entry page when no view is showing ([cd674d5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/cd674d5)), closes [#105](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/105)
* hide activity part if no activities are registered ([3d4d92e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/3d4d92e)), closes [#107](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/107)


### BREAKING CHANGES

* Removed input property `useTimer` because no longer required as now working in the context of 'OnPush' change detection context.

# [0.0.0-beta.17](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.16...0.0.0-beta.17) (2019-02-25)


### Features

* allow scrollbars to be used in an 'on-push' change detection context ([3b876fc](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/3b876fc)), closes [#100](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/100)
* allow to focus the viewport programmatically ([36e1387](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/36e1387))
* export viewport scrollbars as public api ([ff865fc](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ff865fc)), closes [#100](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/100)

# [0.0.0-beta.16](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.15...0.0.0-beta.16) (2019-02-21)


### Features

* provide API to simplify issuing custom intents from within client ([6c88558](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/6c88558)), closes [#96](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/96)


# [0.0.0-beta.15](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.14...0.0.0-beta.15) (2019-01-31)


### Bug Fixes

* re-export core module in `workbench-application.angular` ([ac8b58c](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ac8b58c))
* remove obsolete http dependency from 'workbench-application-platform' ([aea79d7](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/aea79d7))


# [0.0.0-beta.14](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.13...0.0.0-beta.14) (2019-01-31)


### Bug Fixes

* declare `workbench-application.core` as regular dependency of `workbench-application.angular` ([9855241](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/9855241))


# [0.0.0-beta.13](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.12...0.0.0-beta.13) (2019-01-30)


### Bug Fixes

* compute native scrollbar track size correctly even if not displayed at application startup ([e12718c](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e12718c)), closes [#87](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/87)
* do not enter minimize mode when closing views quickly in maximize mode ([375dace](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/375dace)), closes [#24](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/24)
* reduce the number of 'mousemove' events dispatched between application windows ([44c40f4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/44c40f4)), closes [#86](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/86)
* stretch content of `<sci-viewport>` if it overflows horizontally ([31d23d4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/31d23d4)), closes [#77](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/77)
* use an overlay to render view drop regions to not flicker while dragging views ([c738a1a](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/c738a1a)), closes [#79](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/79)


### Features

* allow giving CSS classes to workbench elements to have stable selectors available in e2e tests ([c985816](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/c985816)), closes [#78](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/78)
* allow to display a component in a popup ([eeb2390](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/eeb2390)), closes [#76](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/76)
* contribute 'Workbench Application Platform' to allow integrating content from multiple web applications ([84e1f08](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/84e1f08)), closes [#80](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/80)


### BREAKING CHANGES

* Properties of `Activity` and `WbActivityDirective` to set the activity label and CSS class(es) have changed as follows:
  
  - label => itemText
  - cssClass => itemCssClass
* CSS display property of `<sci-viewport>` flex container has changed from `flex` (column nowrap) to `grid` (one column).
  
  To migrate:
  - if having a single content child which stretches vertically by using `flex: auto`, remove that property
  - if having multiple content children with `flex: none`, wrap them inside a separate flex-container



# [0.0.0-beta.12](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.11...0.0.0-beta.12) (2018-11-23)


### Bug Fixes

* remove static initializers to be compatible with Angular 6 transpiled with TypeScript 2.x ([d5ce02e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/d5ce02e)), closes [#26](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/26)


### Code Refactoring

* extract `sci-dimension-module` into a separate NPM library ([eecccb8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/eecccb8)), closes [#44](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/44)
* extract `sci-viewport-module` into a separate NPM library ([a390b54](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a390b54)), closes [#45](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/45)


### Features

* add iframes of remote sites beyond workbench grid to not cover other parts of the workbench like sashes or view dropdown menu ([b0bf93e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/b0bf93e)), closes [#30](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/30)
* allow cross-origin communication with remote sites ([f492516](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/f492516)), closes [#31](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/31)
* allow programmatic registration of activities ([efc1344](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/efc1344)), closes [#28](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/28)
* continue scrolling in custom scrollbars even when the cursor enters or goes past the boundary of an iframe ([9cb34a5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/9cb34a5)), closes [#41](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/41)
* control if workbench part content is capable of being moved in the DOM ([303d29a](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/303d29a)), closes [#30](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/30)
* disable vertical scrolling in workbench viewtab bar ([e59ff5e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e59ff5e)), closes [#33](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/33)
* provide message box action texts when spawning the message box ([f589764](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/f589764)), closes [#32](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/32)
* register activity auxiliary routes only in root injector ([0f3c5d4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0f3c5d4)), closes [#28](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/28)
* register view auxiliary routes via `WorkbenchAuxiliaryRoutesRegistrator` and set view active state upon view creation ([e8718d9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e8718d9)), closes [#29](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/29)
* specify view-list dropdown anchor as `ElementRef` instead of native element to be compatible with Angular CDK 6 ([d8b1c87](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/d8b1c87)), closes [#42](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/42)
* use a separate routing navigate command when closing multiple views all at once ([688a3b8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/688a3b8)), closes [#34](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/34)
* use CDK overlay for the dropdown showing hidden view tabs ([53763e7](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/53763e7)), closes [#42](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/42)


### BREAKING CHANGES

* Workbench requires `@scion/viewport` as its peer-dependency which you can install as following:
`npm install --save @scion/viewport`
* Workbench requires `@scion/dimension` as its peer-dependency which you can install as following:
`npm install --save @scion/dimension`.
Why not use ResizeObserver: Web Performance Working Group is working on a W3C recommendation for natively observing changes to Element’s size. The Web API draft is still work in progress and support limited to Google Chrome and Opera. See https://wicg.github.io/ResizeObserver/
* Removed content projection from `RemoteSiteComponent` and added it to workbench part level. If using a remote site, wrap entire part content in a `<wb-content-as-overlay>` element, which causes it to be added to a top-level workbench DOM element and projected into that component's bounding box.
Removed support to use `RemoteSiteComponent` as a routing component because must be a child of `<wb-content-as-overlay>` element
* Message box action texts are no longer specified when importing the workbench module. Instead, message box texts are provided directly when spawning the message box.
* Removed output property to listen for URL changes because not allowed for cross-origin communication and internally using a timer to detect URL changes (as there is no change event emitted natively and `MutationObserver` is not applicable). Use `message` output property instead.
* Use added `visible` property over `ngIf` directive to show or hide an activity based on a conditional <wb-activity [visible]="conditional"></wb-activity>



# [0.0.0-beta.11](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.10...0.0.0-beta.11) (2018-10-26)


### Bug Fixes

* do not enter maximize mode when closing views quickly ([3959887](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/3959887))


### Features

* upgrade workbench to run with Angular 7 ([ce325a8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ce325a8)), closes [#26](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/26)



# [0.0.0-beta.10](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.9...0.0.0-beta.10) (2018-09-10)


### Features

* Allow lazily-loaded views to inject masked injection tokens ([3c212d0](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/3c212d0))



# [0.0.0-beta.9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.8...0.0.0-beta.9) (2018-08-23)


### Bug Fixes

* upgrade dependencies to fix potential security vulnerability in `url-parse@1.4.1` ([43d70ff](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/43d70ff))


### Features

* use momentum-based scrolling to continue to scroll after finishing the scroll gesture ([4a2f085](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/4a2f085))



# [0.0.0-beta.8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.7...0.0.0-beta.8) (2018-08-22)


### Features

* use native overflow scroll functionality in viewport ([8889279](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/8889279))


### BREAKING CHANGES

* Migration if using viewport component and dimension directive
	Manifest a dependency to `SciViewportModule` because packaged as separate module

	Remove custom CSS classes specified with `viewportCssClass` and `viewportClientCssClass` input properties; instead, CSS flexbox layout with flex-flow 'column nowrap' is applied to the viewport with `<ng-content>` as its flex item(s); migrate by styling `<ng-content>` as flex items, or provide your viewport client in a containing block and style it accordingly

	Replace `overflowAuto` input property with `scrollbarStyle` input property; by default, scrollbars are displayed on top of the viewport client

	Change selector from `wb-viewport` to `sci-viewport`

	Use `scrollHeight` and `scrollWidth` to get viewport client dimension

	Rename `ViewportComponent` to `SciViewportComponent` if injecting the viewport component

	Manifest a dependency to `SciDimensionModule` because packaged as separate module

	Change selector from `wbDimension` to `sciDimension`

	Rename `Dimension` to `SciDimension` which is emitted upon host element's dimension change

	Rename `wbDimensionChange` output property to `sciDimensionChange`

	Rename `wbDimensionUseTimer` input property to `sciDimensionUseTimer`



# [0.0.0-beta.7](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.6...0.0.0-beta.7) (2018-08-06)


### Bug Fixes

* allow to navigate relative to the current activated route ([#5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/5)) ([27adf69](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/27adf69))
* fix check which ensures that `Workbench.forRoot()` is not used in a lazy context ([ea3a1b0](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ea3a1b0)), closes [#5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/5)
* fix wrong typing of injected content children ([5a446fd](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/5a446fd))
* Render correct actions in the activity part header ([86b77f1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/86b77f1)), closes [#9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/9)


### Features

* Allow initial navigation to a conditionally registered activity ([065f7ce](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/065f7ce)), closes [#8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/8)
* Display component of currently activated activity ([f59a74d](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/f59a74d)), closes [angular/angular#25313](https://github.com/angular/angular/issues/25313) [#10](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/10)
* use `Router` instead of `DefaultUrlSerializer` to parse URL ([eedc5dc](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/eedc5dc)), closes [#5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/5)



# [0.0.0-beta.6](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.5...0.0.0-beta.6) (2018-07-24)


### Bug Fixes

* make parameter 'extras' of method 'WorkbenchRouter.navigate(any[], WbNavigationExtras)' optional ([b971447](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/b971447))



# [0.0.0-beta.5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.4...0.0.0-beta.5) (2018-07-24)


### Features

* allow to navigate to view/activity routes of lazy loaded modules ([e6054b6](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e6054b6)), closes [#23459](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/23459) [#13869](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/13869) [#20114](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/20114) [#5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/5)



# [0.0.0-beta.4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.3...0.0.0-beta.4) (2018-07-19)


### Features

* update project dependencies due to potential security vulnerability in one of the dependencies ([1fd83a4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/1fd83a4))



# [0.0.0-beta.3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.2...0.0.0-beta.3) (2018-07-19)


### Bug Fixes

* add missing exports to 'public_api' ([1266e85](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/1266e85))


### Features

* rename CSS class for workbench icon font from 'wb-font' to 'wb-icons' ([94d3b2b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/94d3b2b))



# [0.0.0-beta.2](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.1...0.0.0-beta.2) (2018-07-17)


### Features

* specify workbench icon font top-level in 'index.scss' ([6d3884b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/6d3884b))



# [0.0.0-beta.1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/0.0.0-beta.0...0.0.0-beta.1) (2018-07-17)


### Bug Fixes

* load workbench icon font relative to base href ([f538223](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/f538223))



# [0.0.0-beta.0](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/5e57ac9...0.0.0-beta.0) (2018-07-17)


### Features

* contribute [@scion](https://github.com/scion)/workbench source ([a4c81bc](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a4c81bc))
* generate library skeleton for [@scion](https://github.com/scion)/workbench library ([39eaa35](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/39eaa35))
* generate project skeleton for scion libraries ([5e57ac9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/5e57ac9))
