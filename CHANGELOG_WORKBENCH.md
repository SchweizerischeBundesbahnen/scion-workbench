# [21.0.0-beta.4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/21.0.0-beta.3...21.0.0-beta.4) (2026-02-16)


### Features

* **workbench/part:** provide part bounds on `WorkbenchPart` handle ([7c211e2](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/7c211e297ce52ca4d0e8bbd4261028d13daff2ee))
* **workbench/view:** provide view bounds on `WorkbenchView` handle ([78f5797](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/78f57976840369aff8a92814969801624f80574c))
* **workbench/dialog:** provide dialog bounds on `WorkbenchDialog` handle ([09b3a1c](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/09b3a1cb3ca1305398905af0ecffb31ab1b6aaee))
* **workbench/popup:** provide popup bounds on `WorkbenchPopup` handle ([a41ed20](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a41ed208db21968cb831d9fbaab074b10004a1c3))


### Dependencies

* **workbench:** SCION Workbench requires `@scion/toolkit` `v2.1.0` or higher.
* **workbench:** SCION Workbench requires `@scion/workbench-client` `1.0.0-beta.39` or higher.



# [21.0.0-beta.3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/21.0.0-beta.2...21.0.0-beta.3) (2026-01-21)


### Features

* **workbench:** add support for `@scion/microfrontend-platform` version `2.0.0` ([690bfb0](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/690bfb0a9496144ed1a4d9177254b34cf32d82df))


### BREAKING CHANGES

* **workbench:** SCION Workbench now requires `@scion/microfrontend-platform` version `2.0.0` or higher. For more information, refer to the [changelog](https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/blob/master/CHANGELOG.md) of `@scion/microfrontend-platform`.
* **workbench:** SCION Workbench requires `@scion/workbench-client` version `1.0.0-beta.38` or later.



# [21.0.0-beta.2](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/21.0.0-beta.1...21.0.0-beta.2) (2026-01-19)


### Bug Fixes

* **workbench/dialog:** allow dialog growing beyond context bounds ([6dcddce](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/6dcddce422c9ed5a318015c16c9382d5c0a32bbc)), closes [#730](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/730)
* **workbench/dialog:** prevent dragging user selection when moving dialog (e.g., by previous Ctrl+A) ([e72137a](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e72137ada1083fe4ab9d13ea72e25096db6ae61e))
* **workbench/dialog:** open microfrontend dialog in calling context ([9d1d06f](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/9d1d06f9f079c76558f57edeed658c9acb73abaf))
* **workbench/messagebox:** open microfrontend message box in calling context ([917c683](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/917c68371c6a2490b1cfbacc81cf6a7540133e4f))
* **workbench/popup:** open microfrontend popup in calling context ([992a544](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/992a5446266b8a91221b9f6fca6543d90c636933))


### Features

* **workbench/popup:** add option to position popup relative to context or viewport ([b21b08e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/b21b08eb68c3b54c85fea3ded06a57079e1879f9))
* **workbench:** enable host app to contribute microfrontends for parts and views ([6d8590c](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/6d8590c342f4e1698b7e9335c8f02338ef6b7ba2)), closes [#271](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/271)


### BREAKING CHANGES

* **workbench:** The integration of host microfrontends has changed. 
  - Dialog, popup, and messagebox microfrontends of the host application now require an empty path.\
    To migrate, set the path in the capability and route to empty string and use the new route matchers `canMatchWorkbenchDialogCapability`, `canMatchWorkbenchPopupCapability`, or `canMatchWorkbenchMessageBoxCapability`, respectively.

    Example — route matching a dialog capability with qualifier `{dialog: 'about'}`
    ```ts
    import {Routes} from '@angular/router';
    import {canMatchWorkbenchDialogCapability} from '@scion/workbench';
  
    const routes: Routes = [
      {path: '', canMatch: [canMatchWorkbenchDialogCapability({dialog: 'about'})], component: AboutComponent},
    ];
    ```
  
    Since the path must be empty, capability parameters cannot be referenced in the path anymore.\
    To migrate, inject `ActivatedMicrofrontend` in the microfrontend component to read the passed parameters.
  
    Example — inject `ActivatedMicrofrontend` in a host microfrontend to read capability and parameters:
    ```ts
    import {inject} from '@angular/core';
    import {ActivatedMicrofrontend} from '@scion/workbench';
  
    const {capability, params} = inject(ActivatedMicrofrontend);
    ```
  - Host dialog microfrontends must now inject `WorkbenchDialog` from `@scion/workbench` (previously from `@scion/workbench-client`).
  - Host messagebox microfrontends must now inject `WorkbenchDialog` from `@scion/workbench` (previously from `@scion/workbench-client`).
  - Host popup microfrontends must now inject `WorkbenchPopup` from `@scion/workbench` (previously from `@scion/workbench-client`).
  - Host popup microfrontends can read deprecated referrer information from the deprecated `WORKBENCH_POPUP_REFERRER` DI token (previously from `WorkbenchClient`).

### Dependencies

* **workbench:** SCION Workbench requires `@scion/workbench-client` version `1.0.0-beta.37` or later.



# [21.0.0-beta.1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/20.0.0-beta.9...21.0.0-beta.1) (2025-11-27)

### Features

* **workbench:** add support for Angular 21 ([37c1887](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/37c18873f4dcfd177ebc7031a97d9c92d88d131e))
* **workbench/dialog:** add option to configure providers available for injection ([b5c3197](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/b5c3197f374cad8c9f92dd7a13c88aa901ca471c))
* **workbench/messagebox:** add option to configure providers available for injection ([e95fb7f](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e95fb7f413e06268147c1e8287afeaa214d284a9))

### Bug Fixes

* **workbench/popup:** render popup at specified position on first rendering ([0e7139e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0e7139e6f12d9dc380e152763911f1628c081f62))

### Code Refactoring

* **workbench:** remove deprecated option to configure workbench startup ([96b548c](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/96b548ce37ef34e3bf68b46f920c95dd04c3e967))
* **workbench:** remove deprecated `WorkbenchStartup.isStarted` and `WorkbenchStartup.whenStarted` properties ([1ea7d11](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/1ea7d110fe0a3c1b6c567b51877445a360275d14))
* **workbench:** remove deprecated registration of workbench initializers ([e3856ef](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e3856efcb582d365f0d5d65ba0f05d712fca8fc7))
* **workbench:** remove deprecated option to configure workbench splash ([0314aab](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0314aab03479b1392024b0a1afb42ab51a8c0fa6))
* **workbench:** remove deprecated method to switch workbench theme ([bc5e697](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/bc5e6977485873d96ca69ba08ecf6bb338f537c8))
* **workbench:** remove deprecated `text` property from `MenuItemConfig` ([2a9f854](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/2a9f85477aecee4755769a0e877af34f7b07492b))
* **workbench:** remove deprecated `visible` property from `MenuItemConfig` ([ec6ba13](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ec6ba135f2c89d9f0bba64fbd8f4b651d47f6d6d))
* **workbench:** remove deprecated support for displaying the empty-path route as the start page ([6d76e32](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/6d76e32fdac85c33e37f161ab7a6757387b572bc))
* **workbench/view:** remove deprecated properties for accessing view's navigation details ([a6ededb](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a6ededb9422a16b012199491d3c0d7fd2decbcf5))
* **workbench/dialog:** remove generic from dialog handle ([fb1a664](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/fb1a6644c53bac28443dc265d1a6ef622b466b96))
* **workbench/popup:** refactor Workbench Popup API ([ff2ffaf](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ff2ffaf7ff9c8501fdd89d4327eee468a807e737))
* **workbench/notification:** remove deprecated API to set title as Observable ([419289a](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/419289aa6658bce1f69ae2fc39d7c74cbb46451d))
* **workbench/notification:** refactor Workbench Notification API ([8e0d109](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/8e0d10999c4e0e932b8340b4cb13adca678f30d0))

### BREAKING CHANGES

* **workbench:** SCION Workbench requires Angular 21.

  Note that:
  - SCION Workbench does not support zoneless. Support is planned for 2026.
  - SCION Workbench still requires `@angular/animations`. Removal is planned for 2026.

* **workbench:** SCION Workbench now requires `@scion/workbench-client` version `1.0.0-beta.36` or higher. For more information, refer to the [changelog](https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/CHANGELOG_WORKBENCH_CLIENT.md) of `@scion/workbench-client`.

* **workbench:** SCION Workbench now requires `@scion/toolkit` version `2.0.0` or higher. For more information, refer to the [changelog](https://github.com/SchweizerischeBundesbahnen/scion-toolkit/blob/master/CHANGELOG_TOOLKIT.md) of `@scion/toolkit`.

* **workbench:** SCION Workbench now requires `@scion/microfrontend-platform` version `1.6.0` or higher. For more information, refer to the [changelog](https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/blob/master/CHANGELOG.md) of `@scion/microfrontend-platform`.

* **workbench:** Removed deprecated option to configure workbench startup.

  To migrate:
  - Remove `WorkbenchConfig.startup.launcher` config passed to `provideWorkbench()`.
  - If using the `APP_INITIALIZER` option, start the workbench manually in an Angular app initializer using `WorkbenchLauncher.launch()`.
  - If using the `LAZY` option, remove the config, if any. No further migration is required because this is the default behavior.

  Migration example of starting the workbench in an app initializer:

  ```ts
  import {provideWorkbench, WorkbenchLauncher} from '@scion/workbench';
  import {bootstrapApplication} from '@angular/platform-browser';
  import {inject, provideAppInitializer} from '@angular/core';
  
  bootstrapApplication(AppComponent, {
    providers: [
      provideWorkbench(),
      provideAppInitializer(() => inject(WorkbenchLauncher).launch())
    ]
  });
  ```

* **workbench:** Removed deprecated `WorkbenchStartup.isStarted` and `WorkbenchStartup.whenStarted` properties.

  To migrate:
  - `WorkbenchStartup.isStarted` has been replaced by `WorkbenchStartup.done`.
  - `WorkbenchStartup.whenStarted` has been replaced by `WorkbenchStartup.whenDone`. Note that the type has changed to `void`.

* **workbench:** Removed deprecated option to configure workbench splash.

  To migrate, register a splash via `WorkbenchConfig.splashComponent` property, previously via `WorkbenchConfig.startup.splash`.

* **workbench:** Removed deprecated registration of workbench initializers.

  The registration of workbench initializers has changed. The new `provideWorkbenchInitializer()` and `provideMicrofrontendPlatformInitializer()` functions allow for registration of initializer functions, similar to Angular's `provideAppInitializer()` function. The previous DI-based registration has been removed.

  To migrate:
  - Use `provideWorkbenchInitializer()` to register initializer functions, optionally specifying the phase for execution.
    Previous DI tokens `WORKBENCH_PRE_STARTUP`, `WORKBENCH_STARTUP`, and `WORKBENCH_POST_STARTUP` have been removed.
  - Use `provideMicrofrontendPlatformInitializer()` to register microfrontend-related initializer functions, optionally specifying the phase for execution. Previous DI tokens `MICROFRONTEND_PLATFORM_PRE_STARTUP` and `MICROFRONTEND_PLATFORM_POST_STARTUP` have been removed.
  - Class-based initializers have been removed. Instead, register an initializer function and inject the class-based initializer.

  **Before Migration**
  ```ts
  import {MICROFRONTEND_PLATFORM_POST_STARTUP, provideWorkbench, WORKBENCH_POST_STARTUP, WORKBENCH_STARTUP} from '@scion/workbench';
  import {bootstrapApplication} from '@angular/platform-browser';
  
  bootstrapApplication(AppComponent, {
    providers: [
      provideWorkbench(),
      {
        provide: WORKBENCH_STARTUP,
        multi: true,
        useClass: SomeService1,
      },
      {
        provide: WORKBENCH_POST_STARTUP,
        multi: true,
        useClass: SomeService2,
      },
      {
        provide: MICROFRONTEND_PLATFORM_POST_STARTUP,
        multi: true,
        useClass: SomeService3,
      },
    ],
  });
  ```

  **After Migration**
  ```ts
  import {provideMicrofrontendPlatformInitializer, provideWorkbench, provideWorkbenchInitializer, WorkbenchStartupPhase} from '@scion/workbench';
  import {bootstrapApplication} from '@angular/platform-browser';
  import {inject} from '@angular/core';
  
  bootstrapApplication(AppComponent, {
    providers: [
      provideWorkbench(),
      provideWorkbenchInitializer(() => inject(SomeService1).init()),
      provideWorkbenchInitializer(() => inject(SomeService2).init(), {phase: WorkbenchStartupPhase.PostStartup}),
      provideMicrofrontendPlatformInitializer(() => inject(SomeService3).init()),
    ],
  });
  ```
* **workbench:** Removed deprecated method to switch workbench theme.

  Previously, the theme was switched using `WorkbenchService.switchTheme` method.

  To migrate:
  - Use `WorkbenchService.settings.theme` signal to switch and read the current theme.
  - Read current color scheme using `getComputedStyle(inject(DOCUMENT).documentElement).colorScheme`.

* **workbench:** Removed deprecated `text` property from `MenuItemConfig`.

  To migrate, register a text provider instead of configuring the text for each menu item.

  A text provider is a function that returns the text for a translation key. Register the text provider via configuration passed to the `provideWorkbench` function.

  **Before Migration**
  ```ts
  import {provideWorkbench} from '@scion/workbench';
  import {inject} from '@angular/core';
  
  provideWorkbench({
    viewMenuItems: {
      close: {text: () => inject(TranslateService).translate('workbench.close_tab.action')},
      closeOthers: {text: () => inject(TranslateService).translate('workbench.close_other_tabs.action')},
      closeAll: {text: () => inject(TranslateService).translate('workbench.close_all_tabs.action')},
      closeToTheRight: {text: () => inject(TranslateService).translate('workbench.close_tabs_to_the_right.action')},
      closeToTheLeft: {text: () => inject(TranslateService).translate('workbench.close_tabs_to_the_left.action')},
      moveRight: {text: () => inject(TranslateService).translate('workbench.move_tab_to_the_right.action')},
      moveLeft: {text: () => inject(TranslateService).translate('workbench.move_tab_to_the_left.action')},
      moveUp: {text: () => inject(TranslateService).translate('workbench.move_tab_up.action')},
      moveDown: {text: () => inject(TranslateService).translate('workbench.move_tab_down.action')},
      moveToNewWindow: {text: () => inject(TranslateService).translate('workbench.move_tab_to_new_window.action')},
    },
  });
  ```

  **After Migration**
  ```ts
  import {provideWorkbench} from '@scion/workbench';
  import {inject, Signal} from '@angular/core';
  
  provideWorkbench({
    textProvider: (key: string): Signal<string> | string | undefined => {
      return inject(TranslateService).translate(key); // `TranslateService` is illustrative and not part of the Workbench API.
    },
  });
  ```
  Translation keys of built-in view menus:
  - `workbench.close_tab.action` defaults to `Close`
  - `workbench.close_other_tabs.action` defaults to `Close Other Tabs`
  - `workbench.close_all_tabs.action` defaults to `Close All Tabs`
  - `workbench.close_tabs_to_the_right.action` defaults to `Close Tabs to the Right`
  - `workbench.close_tabs_to_the_left.action` defaults to `Close Tabs to the Left`
  - `workbench.move_tab_to_the_right.action` defaults to `Move Right`
  - `workbench.move_tab_to_the_left.action` defaults to `Move Left`
  - `workbench.move_tab_up.action` defaults to `Move Up`
  - `workbench.move_tab_down.action` defaults to `Move Down`
  - `workbench.move_tab_to_new_window.action` defaults to `Move to New Window`

* **workbench:** Removed deprecated `visible` property from `MenuItemConfig`.

  To migrate, set to `false` in `ViewMenuItemsConfig` to exclude the menu item.

* **workbench:** Removed deprecated support for displaying the empty-path route as the start page.

  Previously, the component associated with the empty-path route was used as the start page.

  - To migrate layouts with a main area, navigate the main area instead.

    **Example for navigating the main area:**
    ```ts
    bootstrapApplication(AppComponent, {
      providers: [
        provideWorkbench({
          layout: factory => factory
            .addPart(MAIN_AREA)
            .navigatePart(MAIN_AREA, ['path/to/desktop']),
        }),
        provideRouter([
          {
            path: 'path/to/desktop',
            component: DesktopComponent,
          },
        ]),
      ],
    });
    ```

    **Example for navigating the main area to the empty-path route:**
    ```ts
    bootstrapApplication(AppComponent, {
      providers: [
        provideWorkbench({
          layout: factory => factory
            .addPart(MAIN_AREA)
            .navigatePart(MAIN_AREA, [], {hint: 'desktop'}), // pass hint to match a specific empty-path route
        }),
        provideRouter([
          {
            path: '',
            component: DesktopComponent,
            canMatch: [canMatchWorkbenchPart('desktop')], // match only if navigating with the specified hint
          },
        ]),
      ],
    });
    ```
  - To migrate layouts without a main area, provide a desktop using an `<ng-template>` with the `wbDesktop` directive. The template content will be used as the desktop content.

    ```html
    <wb-workbench>
      <ng-template wbDesktop>
        Welcome
      </ng-template>
    </wb-workbench>
    ```

* **workbench/view:** Removed deprecated properties for accessing view's navigation details.

  To migrate:
  - `WorkbenchView.urlSegments` => `WorkbenchView.navigation.path`
  - `WorkbenchView.navigationHint` => `WorkbenchView.navigation.hint`
  - `WorkbenchView.navigationData` => `WorkbenchView.navigation.data`
  - `WorkbenchView.navigationState` => `WorkbenchView.navigation.state`

* **workbench/dialog:** Removed generic from dialog handle as not required on type-level.

* **workbench/notification:** Removed deprecated API to set title as Observable.

  To migrate, pass a translatable and provide the text using a text provider. See [documentation](https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/howto/how-to-localize.md) for details.

### Deprecations

* **workbench/popup:** Refactored the Workbench Popup API to align with other Workbench APIs like Dialog, MessageBox, and Notification. Deprecated the old API and marked it for removal.

  To migrate:
  - Use `WorkbenchPopupService` instead of `PopupService`.
  - Pass text or component directly as the first argument, not through options.
  - Pass inputs as key-value object literal. Inputs are available as input properties in the popup component.
  - Inject `WorkbenchPopup` instead of `Popup` to interact with the popup.
  - Set popup size via `WorkbenchPopup` handle instead of passing the size via options.
  - Configure custom injector and providers as top-level options.
  - Use `WorkbenchPopupOptions` instead of `PopupConfig`.

* **workbench/notification:** Refactored the Workbench Notification API to align with other Workbench APIs like Dialog, MessageBox, and Popup. Deprecated the old API and marked it for removal.

  To migrate:
  - Use `WorkbenchNotificationService` instead of `NotificationService`.
  - Pass text or component directly as the first argument, not through options.
  - Pass inputs as key-value object literal. Inputs are available as input properties in the notification component.
  - Refactor group reducer function to operate on input key-value object literals.
  - Set duration in milliseconds, not seconds.
  - Configure custom injector and providers as top-level options.
  - Inject `WorkbenchNotification` instead of `Notification` to interact with the notification.
  - Use `WorkbenchNotificationOptions` instead of `NotificationConfig`.


# [20.0.0-beta.9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/20.0.0-beta.8...20.0.0-beta.9) (2025-11-11)


### Features

* **workbench/perspective:** enable contribution of microfrontend parts to a workbench perspective ([b6d25cf](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/b6d25cf23d3916f46780e25caff67618ad39597a)), closes [#683](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/683)
* **workbench/part:** support activating docked part when adding it to the layout ([89aba48](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/89aba48cbe66cbbf9733bb738a5a283dc8ca7a76))
* **workbench/dialog:** add support for non-blocking dialog ([28b0291](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/28b0291c6a677e7ae2f81dcd2f9e6997195364c7))
* **workbench/dialog:** add support for part-modal dialog ([4411246](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/441124656bed66b227471fdb3f11a8e386733f63))
* **workbench/notification:** enable closing notification via handle ([7b425bd](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/7b425bd0a1b192185acfb43e9c117bf137f3dfd9))
* **workbench/notification:** prevent notification from closing on hover ([903a912](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/903a912e2e77951bdaad151f7c28951f27eea3c5))


### BREAKING CHANGES

* **workbench:** SCION Workbench requires `@scion/microfrontend-platform` `v1.5.0` or higher.
* **workbench:** SCION Workbench requires `@scion/workbench-client` `v1.0.0-beta.34` or higher.

### Recommendations

* To use icons in docked parts, configure an icon provider in the workbench host application or include the Material icon font. See [documentation](https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/howto/how-to-icons.md#default-icon-provider) for details.

### Deprecations
 
* **workbench/popup:** Signature of `context` option in popup config has changed from object literal to string literal. Migrate `{context: {viewId: 'view.x'}}` to `{context: 'view.x'}`.
* **workbench/dialog:** Signature of `context` option in dialog options has changed from object literal to string literal. Migrate `{context: {viewId: 'view.x'}}` to `{context: 'view.x'}`.
* **workbench/messagebox:** Signature of `context` option in messagebox options has changed from object literal to string literal. Migrate `{context: {viewId: 'view.x'}}` to `{context: 'view.x'}`.
* **workbench/dialog:** `view` modality in dialog options was renamed to `context`.
* **workbench/messagebox:** `view` modality in messagebox options was renamed to `context`.

# [20.0.0-beta.8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/20.0.0-beta.7...20.0.0-beta.8) (2025-09-17)


### Bug Fixes

* **workbench/view:** prevent stale view title after navigation ([11f3226](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/11f322602fb71da95bb245ba6c0fcad080d1be45))
* **workbench:** prevent flickering of translated texts on re-layout ([e4fdc4b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e4fdc4b2ca1edcb230b44f4c31e13c641f8e97dc)), closes [#255](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/255)


### Dependencies

* **workbench:** SCION Workbench requires `@scion/workbench-client` version `1.0.0-beta.33` or later.


# [20.0.0-beta.7](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/20.0.0-beta.6...20.0.0-beta.7) (2025-09-11)


### Features

* **workbench:** support placeholders in non-localized manifest texts ([1fc40a8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/1fc40a8c58d04deeebc7621e634f05204e5dc049)), closes [#255](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/255)


### Dependencies

* **workbench:** SCION Workbench requires `@scion/workbench-client` version `1.0.0-beta.32` or later.

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


# [20.0.0-beta.5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/20.0.0-beta.4...20.0.0-beta.5) (2025-07-25)


### Features

* **workbench:** provide active workbench element ([e94ea0c](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e94ea0caa9b67aaabfd3829095ebd629c84195b7)), closes [#550](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/550)
* **workbench:** highlight focused workbench element ([445a3a4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/445a3a49604398ec574f23f96decfc71dc9389fd))
* **workbench/desktop:** preserve content of desktop when detached ([88f92eb](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/88f92eb6b97fc9fa80156339afffb00debc1e627))
* **workbench/main-area:** preserve content of main area part when detached ([5a0acf9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/5a0acf902102ba27fe254ba3dbd10b7b444bd5fe))

### Dependencies

* **workbench:** SCION Workbench requires `@scion/workbench-client` version `1.0.0-beta.30` or later.

# [20.0.0-beta.4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/20.0.0-beta.3...20.0.0-beta.4) (2025-07-15)


### Bug Fixes

* **workbench/part:** ensure docked part opens when its handle is activated ([0f2d247](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0f2d24774c01dcfa730a7dde4d8b2152b2b1beac))
* **workbench/part:** show part bar in docked parts with inline-grid and no visible parts ([984f337](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/984f33767acf0d6721b218030de42eccb7070f62))
* **workbench/popup:** stick popup anchor to part bounds when resizing part beyond view bounds ([197bf4b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/197bf4b067e2fceb2ac33aba2ce83733b4027e9c))
* **workbench:** preserve main area in perspectives without a main area ([c8f7fe6](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/c8f7fe62bfbebdbbc7f11b079ce985f334271263))


### Features

* **workbench/part:** preserve content of docked part when closed ([9cbd42f](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/9cbd42f7c28f246de8979c3b9a603a4f98c0d9ff))


### Deprecations

* **workbench/part:** Use `WorkbenchPart.views` instead of `WorkbenchPart.viewIds` to get the views of a part.
* **workbench/part:** Use `WorkbenchPart.activeView` instead of `WorkbenchPart.activeViewId` to get the active view of a part.



# [20.0.0-beta.3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/20.0.0-beta.2...20.0.0-beta.3) (2025-07-02)


### Features

* **workbench:** localize view title of "Not Found" page ([518604e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/518604e7edf985db7073365d04005fdcb16e168b))
* **workbench:** provide experimental Text and Icon API ([ff92003](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ff920039c127f151d9a22c4c5b42f0531149f013))



# [20.0.0-beta.2](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/20.0.0-beta.1...20.0.0-beta.2) (2025-07-01)


### Bug Fixes

* **workbench:** fix issues related to child routes with an empty-path parent route ([cf088db](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/cf088db5367d96228a46b7b7fee42fc6129ab7d4)), closes [#655](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/655)


### Features

* **workbench:** adapt the content of the "Not Found" page to the specific context ([8d3bfdb](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/8d3bfdb130e8ac3f3c8813222e1e3ab83141fa5c))
* **workbench:** allow injection of dialog handle in host dialog and message box ([241b76e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/241b76ec4062cae9b8e0cdafcdc735d538ef26e2))



# [20.0.0-beta.1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/19.0.0-beta.3...20.0.0-beta.1) (2025-06-06)


### Features

* **workbench:** add support for Angular 20 ([ff042a9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ff042a931e4d87ad261213d4e81eb0a3e5cf598b))


### Code Refactoring

* **workbench/view:** remove deprecated API to prevent view from closing ([c4bcf00](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/c4bcf009c4ff1be445909193d925825bb717d1af))
* **workbench/popup:** remove deprecated `referrer` field ([d9021da](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/d9021da5f70608ee7436fa24ae6939351c849c77))


### BREAKING CHANGES

* **workbench:** Updating `@scion/workbench` to Angular 20 introduced a breaking change.
  Update your application to Angular 20. For detailed migration instructions, refer to Angular's update guide: https://v20.angular.dev/update-guide.

* **workbench:** SCION Workbench now requires `@scion/toolkit` version `1.6.0` or higher.
  For more information, refer to the changelog of `@scion/toolkit`: https://github.com/SchweizerischeBundesbahnen/scion-toolkit/blob/master/CHANGELOG_TOOLKIT.md.

* **workbench:** SCION Workbench now requires `@scion/components` version `20.0.0` or higher.
  For more information, refer to the changelog of `@scion/components`: https://github.com/SchweizerischeBundesbahnen/scion-toolkit/blob/master/CHANGELOG_COMPONENTS.md.

* **workbench:** SCION Workbench now requires `@scion/microfrontend-platform` version `1.4.0` or higher.
  For more information, refer to the changelog of `@scion/microfrontend-platform`: https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/blob/master/CHANGELOG.md.

* **workbench/view:** Removed deprecated API to prevent view from closing.
  To migrate, register a callback on `WorkbenchView.canClose` instead of implementing the `CanClose` interface.

  **Before migration:**
  ```ts
  import {CanClose} from '@scion/workbench';
  import {Component} from '@angular/core';
  
  @Component({})
  export class ViewComponent implements CanClose {
  
    public canClose(): boolean {
      return true;
    }
  }
  ```

  **After migration:**
  ```ts
  import {Component, inject} from '@angular/core';
  import {WorkbenchView} from '@scion/workbench';
  
  @Component({})
  export class ViewComponent {
  
    constructor() {
      inject(WorkbenchView).canClose(() => {
        return true;
      });
    }
  }
  ```

* **workbench/popup:** Removed deprecated `Popup.referrer` field.
  Inject `WorkbenchView` instead.
 


# [19.0.0-beta.3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/19.0.0-beta.2...19.0.0-beta.3) (2025-05-28)


### Features

* **workbench:** enable docking and stacking of workbench parts ([c3f3f48](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/c3f3f481aa532a394c7625a91a1a929ae850b4c6)), closes [#447](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/447)
* **workbench:** enable contribution of icons to the SCION Workbench ([858d4fe](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/858d4febe623d5febc6deb28bc0b9c5132d0f1ee))
* **workbench:** enable localization of texts used in the SCION Workbench ([b936b81](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/b936b817fb03fd495626f12a166b299543aeed67))
* **workbench:** provide `provideWorkbenchInitializer` function for simpler registration of initializers ([3afd8d4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/3afd8d4bc8c5b97e3ca45e2477fc40089fb3119f)), closes [#636](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/636)
* **workbench:** replace hover cursor on workbench buttons with subtle background color ([7ac0f5b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/7ac0f5bfc2d312cf4c409cbb83766ea5128c2f98))
* **workbench/view:** enable closing other tabs with Alt+click ([55db6ff](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/55db6ffd679e06becf5ec9649d5268a0e855594e))
* **workbench/view:** disable tab close button if view is blocked ([0606a5a](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0606a5a70fc1e36a6e5ba9d6c1bde08f921aaf7f))

### Bug Fixes

* **workbench:** create single entry in browser session history when loading the application ([9a36d5b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/9a36d5b55562efcc44d3733d1d7d94433048c5b6))
* **workbench:** position workbench element only if necessary ([e753d43](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e753d43d185c53fec55f1c02bd8ed5c4cc7f85cf))
* **workbench/view:** remove right tab margin if view is non-closable ([360223c](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/360223caa5a398075f7ca54eeca5850029239092))
* **workbench/view:** exclude 'Move to New Window' menu item from peripheral views ([4f18802](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/4f18802d0b6bd31d1d90cd3a32da79f3b1b1fb27))
* **workbench/popup:** constrain popup position to part bounds ([d125f5e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/d125f5e32bacb097aa8cfb74128d9c6d110263b7))
* **workbench/popup:** stick popup to anchor after re-layout of workbench parts ([37ddc84](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/37ddc844059f9c8c5724444a48d814b2a73c162d))


### BREAKING CHANGES

* **workbench:** SCION Workbench requires `@scion/components` `v19.2.0` or higher.
* **workbench:** SCION Workbench requires new icons.

  Download the new icon font from <a href="https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/resources/scion-workbench-icons/fonts/fonts.zip">GitHub</a>. After downloading, unzip the font files and place the extracted files in the `/public/fonts` folder.

### Deprecations

* **workbench:** The registration of workbench initializers has changed.

  The new `provideWorkbenchInitializer()` and `provideMicrofrontendPlatformInitializer()` functions allow for registration of initializer functions, similar to Angular's `provideAppInitializer()` function. The previous DI-based registration is deprecated.

  To migrate:
  - Use `provideWorkbenchInitializer()` to register initializer functions, optionally specifying the phase for execution.
    Previous DI tokens `WORKBENCH_PRE_STARTUP`, `WORKBENCH_STARTUP`, and `WORKBENCH_POST_STARTUP` have been deprecated.
  - Use `provideMicrofrontendPlatformInitializer()` to register microfrontend-related initializer functions, optionally specifying the phase for execution.
    Previous DI tokens `MICROFRONTEND_PLATFORM_PRE_STARTUP` and `MICROFRONTEND_PLATFORM_POST_STARTUP` have been deprecated.
  - Class-based initializers have been deprecated. Instead, register an initializer function and inject the class-based initializer.
  - `WorkbenchStartup.isStarted` has been deprecated and replaced by `WorkbenchStartup.done`.
  - `WorkbenchStartup.whenStarted` has been deprecated and replaced by `WorkbenchStartup.whenDone`. Note that the type has changed to `void`.

  **Migration example:**
  ```ts
  import {MICROFRONTEND_PLATFORM_POST_STARTUP, provideMicrofrontendPlatformInitializer, provideWorkbench, provideWorkbenchInitializer, WORKBENCH_STARTUP} from '@scion/workbench';
  import {bootstrapApplication} from '@angular/platform-browser';
  import {inject} from '@angular/core';
  
  bootstrapApplication(AppComponent, {
    providers: [
      provideWorkbench(),
  
      // -> NEW API for registering a workbench initializer.
      provideWorkbenchInitializer(() => inject(SomeService1).init()),
  
      // DEPRECATED API for registering a workbench initializer.
      {
        provide: WORKBENCH_STARTUP,
        multi: true,
        useClass: SomeService1,
      },
  
      // -> NEW API for registering a microfrontend initializer.
      provideMicrofrontendPlatformInitializer(() => inject(SomeService2).init()),
  
      // DEPRECATED API for registering a microfrontend initializer.
      {
        provide: MICROFRONTEND_PLATFORM_POST_STARTUP,
        multi: true,
        useClass: SomeService2,
      },
    ],
  });
  ```

* **workbench:** The option to configure the workbench launcher has been deprecated.

  To migrate:
  - Remove `WorkbenchConfig.startup.launcher` config passed to `provideWorkbench()`.
  - If using the `APP_INITIALIZER` option, start the workbench manually in an Angular app initializer using `WorkbenchLauncher.launch()`.
  - If using the `LAZY` option, remove the config, if any. No further migration is required because this is the default behavior.

  Migration example of starting the workbench in an app initializer:

  ```ts
  import {provideWorkbench, WorkbenchLauncher} from '@scion/workbench';
  import {bootstrapApplication} from '@angular/platform-browser';
  import {inject, provideAppInitializer} from '@angular/core';
  
  bootstrapApplication(AppComponent, {
    providers: [
      provideWorkbench(),
      provideAppInitializer(() => inject(WorkbenchLauncher).launch())
    ]
  });
  ```

* **workbench:** The option to configure a custom splash component has been moved.

  Register a custom splash via `WorkbenchConfig.splashComponent` property, previously via `WorkbenchConfig.startup.splash`.

* **workbench:** Translation of built-in view menu texts has changed.

  To migrate, register a text provider instead of configuring the text for each menu item.

  A text provider is a function that returns the text for a translation key. Register the text provider via configuration passed to the `provideWorkbench` function.

  **Before Migration**
  ```ts
  import {provideWorkbench} from '@scion/workbench';
  import {inject} from '@angular/core';
  
  provideWorkbench({
    viewMenuItems: {
      close: {text: () => inject(TranslateService).translate('workbench.close_tab.action')},
      closeOthers: {text: () => inject(TranslateService).translate('workbench.close_other_tabs.action')},
      closeAll: {text: () => inject(TranslateService).translate('workbench.close_all_tabs.action')},
      closeToTheRight: {text: () => inject(TranslateService).translate('workbench.close_tabs_to_the_right.action')},
      closeToTheLeft: {text: () => inject(TranslateService).translate('workbench.close_tabs_to_the_left.action')},
      moveRight: {text: () => inject(TranslateService).translate('workbench.move_tab_to_the_right.action')},
      moveLeft: {text: () => inject(TranslateService).translate('workbench.move_tab_to_the_left.action')},
      moveUp: {text: () => inject(TranslateService).translate('workbench.move_tab_up.action')},
      moveDown: {text: () => inject(TranslateService).translate('workbench.move_tab_down.action')},
      moveToNewWindow: {text: () => inject(TranslateService).translate('workbench.move_tab_to_new_window.action')},
    },
  });
  ```

  **After Migration**
  ```ts
  import {provideWorkbench} from '@scion/workbench';
  import {inject, Signal} from '@angular/core';
  
  provideWorkbench({
    textProvider: (key: string): Signal<string> | string | undefined => {
      return inject(TranslateService).translate(key);
    },
  });
  ```
  > The `TranslateService` is illustrative and not part of the Workbench API.

  Translation keys of built-in view menus:
  - `workbench.close_tab.action` defaults to `Close`
  - `workbench.close_other_tabs.action` defaults to `Close Other Tabs`
  - `workbench.close_all_tabs.action` defaults to `Close All Tabs`
  - `workbench.close_tabs_to_the_right.action` defaults to `Close Tabs to the Right`
  - `workbench.close_tabs_to_the_left.action` defaults to `Close Tabs to the Left`
  - `workbench.move_tab_to_the_right.action` defaults to `Move Right`
  - `workbench.move_tab_to_the_left.action` defaults to `Move Left`
  - `workbench.move_tab_up.action` defaults to `Move Up`
  - `workbench.move_tab_down.action` defaults to `Move Down`
  - `workbench.move_tab_to_new_window.action` defaults to `Move to New Window`

* **workbench:** Method to switch the workbench theme has changed.

  To migrate:
  - Use `WorkbenchService.settings.theme` signal to switch and read the current theme.
  - Read current color scheme using `getComputedStyle(inject(DOCUMENT).documentElement).colorScheme`.



# [19.0.0-beta.2](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/19.0.0-beta.1...19.0.0-beta.2) (2025-01-31)


### Bug Fixes

* **workbench/view:** prevent cropping the last view tab ([6ea7c92](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/6ea7c925ee7b4f4a189a8530fa75cc2b8428985f))


### Features

* **workbench/part:** enable displaying content in workbench parts ([2e9404e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/2e9404e9c53551e7af481287c3907e25f23512ba))
* **workbench/part:** align part actions to the right ([df309be](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/df309be9960cfd9bc57ea20f6e5e0bcb9c81bde1))
* **workbench/part:** enable updating part actions ([774d59b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/774d59be73ee84ff663392378ba272f4c0541ea8))
* **workbench/view:** enable updating view menu items ([ff4f83e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ff4f83e58b60719517fd16ae47f9299da31f731f))


### BREAKING CHANGES

* **workbench/part:** Default part action alignment is now to the right.

  To align an action to the left, set its alignment to `start`.

* **workbench/part:** The registration of part actions via `WorkbenchService.registerPartAction` method has changed. The declarative contribution of part actions via `wbPartAction` directive has not changed.

  To migrate:
  - Part actions now require a `ComponentType` or `TemplateRef` instead of a CDK portal. Pass data through input properties or a custom injector. See examples below.
  - The signature of `WorkbenchService.registerPartAction` has changed. Register the action using a factory function. Previously, no factory function was required.
    ```ts
    inject(WorkbenchService).registerPartAction(() => ActionComponent);
    ```

    For more control, return an object literal:
    ```ts
    inject(WorkbenchService).registerPartAction(() => {
      return {
        content: ActionComponent,
        align: 'end',
      };
    });
    ```
  - `WorkbenchService.registerPartAction` runs the passed function in a reactive context. Use Angular's `untracked` function to execute code outside the reactive context.
  - `WorkbenchPartAction.canMatch` property has been removed. Instead, move the condition to the factory function, returning `null` to not match a part.
    ```ts
    inject(WorkbenchService).registerPartAction(part => {
      return part.isInMainArea ? ActionComponent : null; // matches parts in the main area
    });
    ```

  **Example for passing data via inputs:**
  ```ts
  inject(WorkbenchService).registerPartAction(() => {
    return {
      content: ActionComponent,
      inputs: {
        data: 'value',
      },
    };
  });
  ```

  If using a component, inputs are available as input properties.
  ```ts
  @Component({...})
  class ActionComponent {
    data = input.required<string>();
  }
  ```

  If using a template, inputs are available for binding via local template let declarations.
  ```html
  <ng-template let-data="data">
    ...
  </ng-template>
  ```

  **Example for passing data via custom injector:**
  ```ts
  inject(WorkbenchService).registerPartAction(() => {
    return {
      content: ActionComponent,
      injector: Injector.create({
        parent: inject(Injector),
        providers: [
          {provide: DI_TOKEN, useValue: 'value'},
        ],
      }),
    };
  });
  ```

* **workbench/view:** The registration of view menu items via `WorkbenchService.registerViewMenuItem` method has changed. The declarative contribution of menu items via `wbViewMenuItem` directive has not changed.

  To migrate:
  - Menu items now require a `ComponentType` or `TemplateRef` instead of a CDK portal. Pass data through input properties or a custom injector. See examples below.
  - `WorkbenchService.registerViewMenuItem` now runs the passed function in a reactive context. Use Angular's `untracked` function to execute code outside the reactive context.
  - `WorkbenchMenuItemFactoryFn` has been renamed to `WorkbenchViewMenuItemFn`.
  - `WorkbenchView.registerMenuItem` has been removed. Use an `ng-template` with the `wbViewMenuItem` directive or register the menu item via `WorkbenchService.registerViewMenuItem`.
  - `WorkbenchMenuItem.isDisabled` has been renamed to `WorkbenchMenuItem.disabled` and its type changed from `function` to `boolean`. Update the disabled state using signals.

  **Example for passing data via inputs:**
  ```ts
  inject(WorkbenchService).registerViewMenuItem(() => {
    return {
      content: MenuItemComponent,
      inputs: {
        data: 'value',
      },
      onAction: () => {...},
    };
  });
  ```

  If using a component, inputs are available as input properties.
  ```ts
  @Component({...})
  class MenuItemComponent {
    data = input.required<string>();
  }
  ```

  If using a template, inputs are available for binding via local template let declarations.
  ```html
  <ng-template let-data="data">
    ...
  </ng-template>
  ```

  **Example for passing data via custom injector:**
  ```ts
  inject(WorkbenchService).registerViewMenuItem(() => {
    return {
      content: MenuItemComponent,
      onAction: () => {...},
      injector: Injector.create({
        parent: inject(Injector),
        providers: [
          {provide: DI_TOKEN, useValue: 'value'},
        ],
      }),
    };
  });
  ```

### Deprecations

* **workbench:** The configuration for displaying a start page in the workbench has changed.
  - For layouts with a main area:
    The main area must now be navigated. Previously, no navigation was required and the component associated with the empty path route was used as the start page.

    **Example for navigating the main area:**
    ```ts
    bootstrapApplication(AppComponent, {
      providers: [
        provideWorkbench({
          layout: factory => factory
            .addPart(MAIN_AREA)
            .navigatePart(MAIN_AREA, ['path/to/desktop'])
        }),
        provideRouter([
          {
            path: 'path/to/desktop',
            component: DesktopComponent,
          }
        ])
      ]
    });
    ```

    **Example for navigating the main area to the empty path route:**
    ```ts
    bootstrapApplication(AppComponent, {
      providers: [
        provideWorkbench({
          layout: factory => factory
            .addPart(MAIN_AREA)
            .navigatePart(MAIN_AREA, [], {hint: 'desktop'}) // pass hint to match a specific empty path route
        }),
        provideRouter([
          {
            path: '',
            component: DesktopComponent,
            canMatch: [canMatchWorkbenchPart('desktop')] // match only if navigating with the specified hint
          }
        ])
      ],
    });
    ```
  - For layouts without a main area:
    Provide a desktop using an `<ng-template>` with the `wbDesktop` directive. The template content will be used as the desktop content. Previously, the component associated with the empty path route was used as the start page.

    ```html
    <wb-workbench>
      <ng-template wbDesktop>
        Welcome
      </ng-template>
    </wb-workbench>
    ```

* **workbench:** Properties for accessing a view's navigation details have changed.

  Migrate as follows:
  - `WorkbenchView.urlSegments` => `WorkbenchView.navigation.path`
  - `WorkbenchView.navigationHint` => `WorkbenchView.navigation.hint`
  - `WorkbenchView.navigationData` => `WorkbenchView.navigation.data`
  - `WorkbenchView.navigationState` => `WorkbenchView.navigation.state`



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




# [18.0.0-beta.10](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/18.0.0-beta.9...18.0.0-beta.10) (2024-12-09)


### Bug Fixes

* **workbench/view:** do not scroll the active tab into view when opening or closing an inactive tab ([a5d4d7e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a5d4d7e8e2b7e62382ee8140c683acb7476cc4e3))
* **workbench/view:** scroll the active tab into view when navigating the active tab ([d10d25b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/d10d25b8852d8bf5b8f891c2d00e3ffd245e7f86))


### Performance Improvements

* **workbench:** improve drag experience when dragging tabs in the tabbar ([0ae78eb](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0ae78ebd89068857e1869a118e8e3eee95d018a0))



# [18.0.0-beta.9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/18.0.0-beta.8...18.0.0-beta.9) (2024-11-25)


### Bug Fixes

* **workbench/view:** invoke `CanClose` guard in view injection context ([07ba936](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/07ba93604ec6862936a11badf6957d8582a0b687)), closes [#578](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/578)
* **workbench/view:** prevent `CanClose` guard from blocking workbench navigation ([12e9e91](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/12e9e9140cf8db11c8fc188f463503ccaaf35195)), closes [#558](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/558)
* **workbench/view:** prevent closing views with a pending `CanClose` guard ([4326a63](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/4326a63665ac8a40bfb040250f9a66c582aed7c6))


### Features

* **workbench/view:** add functional `CanClose` guard, deprecate class-based guard ([c2ee531](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/c2ee531d483dbdbff72d468592908bb346002278))


### Deprecations

* **workbench/view:** The class-based `CanClose` guard has been deprecated in favor of a functional guard that can be registered on `WorkbenchView.canClose`.

  Migrate by registering a callback on `WorkbenchView.canClose` instead of implementing the `CanClose` interface.
  
  **Before migration:**
  ```ts
  import {CanClose} from '@scion/workbench';
  import {Component} from '@angular/core';
  
  @Component({})
  export class ViewComponent implements CanClose {
  
    public canClose(): boolean {
      return true;
    }
  }
  ```
  
  **After migration:**
  ```ts
  import {Component, inject} from '@angular/core';
  import {WorkbenchView} from '@scion/workbench';
  
  @Component({})
  export class ViewComponent {
  
    constructor() {
      inject(WorkbenchView).canClose(() => {
        return true;
      });
    }
  }
  ```


# [18.0.0-beta.8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/18.0.0-beta.7...18.0.0-beta.8) (2024-10-28)


### Bug Fixes

* **workbench/popup:** ensure the popup anchor not leaving view boundaries ([c629f49](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/c629f49f3ba520c2cd700a008e4ed0af1c86e01f))
* **workbench/view:** ensure view overlays align with view boundaries when view position changes ([2998295](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/29982951bf8290108d3b09104ebc456f3acb9f6c))


### Features

* **workbench:** prevent tracking unwanted dependencies in effects ([7a7eaf8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/7a7eaf847f3ed54dcc7eeab300cbde53700b8e46))


### BREAKING CHANGES

* **workbench:** SCION Workbench requires `@scion/toolkit` version `1.6.0` or later.
* **workbench:** SCION Workbench requires `@scion/components` version `18.1.1` or later.
* **workbench:** Calling following workbench methods in a reactive (tracking) context (e.g., `effect`) now throws an error. Migrate by using Angular's `untracked()` function.
  - `WorkbenchRouter.navigate`
  - `WorkbenchService.registerPerspective`
  - `WorkbenchService.switchPerspective`
  - `WorkbenchService.resetPerspective`
  - `WorkbenchService.closeViews`
  - `WorkbenchService.switchTheme`
  - `WorkbenchService.registerPartAction`
  - `WorkbenchService.registerViewMenuItem`
  - `WorkbenchLauncher.launch`
  - `WorkbenchDialogService.open`
  - `WorkbenchMessageBoxService.open`
  - `NotificationService.notify`
  - `PopupService.open`
  - `WorkbenchPart.activate`
  - `WorkbenchView.activate`
  - `WorkbenchView.close`
  - `WorkbenchView.move`
  - `WorkbenchView.registerMenuItem`
  - `WorkbenchDialog.close`
  - `Popup.close`
  
  **Migration Example**
  ```ts
  import {effect, inject, untracked} from '@angular/core';
  import {WorkbenchRouter} from '@scion/workbench';
  
  const workbenchRouter = inject(WorkbenchRouter);
  
  // Before
  effect(() => {
    if (someSignal()) {
      workbenchRouter.navigate(['path/to/view']);
    }
  });
  
  // After
  effect(() => {
    if (someSignal()) {
      untracked(() => workbenchRouter.navigate(['path/to/view']));
    }
  });
  ```



# [18.0.0-beta.7](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/18.0.0-beta.6...18.0.0-beta.7) (2024-10-11)


### Bug Fixes

* **workbench/dialog:** enable updating dialog properties in an Angular effect ([7da2418](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/7da24185e8cc94db2f45a31a6d367c190c5f4104))
* **workbench/view:** enable updating view properties in an Angular effect ([a7d3594](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a7d3594193c31715ac5fcb5da2d8015e803bb0aa))
* **workbench:** position document root as required by `@scion/toolkit` ([0d2f6c2](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0d2f6c2229d6c75f8271795b6e399affaa43eef1))



# [18.0.0-beta.6](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/18.0.0-beta.5...18.0.0-beta.6) (2024-09-11)


### Bug Fixes

* **workbench/messagebox:** display message if opened from a `CanClose` guard of a microfrontend view ([b0829b3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/b0829b31bd78e672ee90e37abc9ad735e46e9bd2)), closes [#591](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/591)
* **workbench/view:** restore scroll position when switching views ([9265951](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/92659517c830e36d4d819743cac4f24229e92486)), closes [#588](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/588)
* **workbench:** disable change detection during navigation to prevent inconsistent layout rendering ([68ecca7](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/68ecca76b421e23ff8fffcd3cf0b5ca573b4a852))


### Features

* **workbench/popup:** support returning result on focus loss ([ce5089e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ce5089e57ba48f53f17fede4ffe4fa72cf74a01b))
* **workbench/view:** enable translation of built-in context menu ([9bfdf74](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/9bfdf7497ab8557b060e88cdb2bb87b7de5a5e10))


### BREAKING CHANGES

* **workbench/popup:** The method `closeWithError` has been removed from the `Popup` handle. Instead, pass an `Error` object to the `close` method.

**Before migration:**
```ts
import {inject} from '@angular/core';
import {Popup} from '@scion/workbench';

inject(Popup).closeWithError('some error');
```

**After migration:**
```ts
import {inject} from '@angular/core';
import {Popup} from '@scion/workbench';

inject(Popup).close(new Error('some error'));
```



# [18.0.0-beta.5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/18.0.0-beta.4...18.0.0-beta.5) (2024-09-02)


### Bug Fixes

* **workbench/perspective:** support browser back navigation after switching perspective ([5777728](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/57777288c740be813bdaec3f913fedc512ffa4c6)), closes [#579](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/579)


### BREAKING CHANGES

* **workbench/perspective:** The active perspective is now set after navigation completes (previously before navigation), so it is unavailable during route resolution/activation. Route guards (like `canMatch`) should use the `canMatchWorkbenchPerspective` function instead of `WorkbenchService` or `WorkbenchPerspective` to determine the perspective’s activation state.

  **Migration Example:**
  
  **Before:**
  ```ts
  import {Route} from '@angular/router';
  import {inject} from '@angular/core';
  import {WorkbenchService} from '@scion/workbench';
  
  const route: Route = {
    canMatch: [() => inject(WorkbenchService).activePerspective()?.id === 'perspective'],
    // or
    canMatch: [() => inject(WorkbenchService).perspectives().find(perspective => perspective.id === 'perspective')?.active()],
  };
  ```
  
  **After:**
  ```ts
  import {Route} from '@angular/router';
  import {canMatchWorkbenchPerspective} from '@scion/workbench';
  
  const route: Route = {
    canMatch: [canMatchWorkbenchPerspective('perspective')],
  };
  ```



# [18.0.0-beta.4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/18.0.0-beta.3...18.0.0-beta.4) (2024-08-28)


### Bug Fixes

* **workbench/view:** update view properties between route deactivation and route activation ([5526eec](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/5526eeca84ca2c04d075fbc9414f1f27f89dd389))
* **workbench/router:** activate part only if specified by the navigation ([51ba3bb](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/51ba3bb5bcdc3d65d56967d9d3526cb5e9d88126))
* **workbench/popup:** render popup at the correct position when activating view ([a13e93f](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a13e93f5e27a2dd67d61f48807039448cc2efc7d))
* **workbench/layout:** debounce storing workbench layout ([076c241](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/076c241954483c079a19e4cd17b235047eddbc8c))
* **workbench/layout:** do not display "Not Found" page when closing a view ([03681b5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/03681b566355fc1915fc5e69d87f99a59b7e272e))
* **workbench/layout:** serialize properties with a `null` value ([49905f6](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/49905f6dc6da8bf9614255f72f93834a08773b2f))


### Features

* **workbench/perspective:** provide active perspective via `WorkbenchService` ([ee6d22b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ee6d22b419a35e0179fc70c2bd22f2f441ffd461))
* **workbench/view:** enable passing data to an empty-path navigation ([3b65d9b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/3b65d9ba564f5ed8abe02aafacc6a8621e0adf6b))
* **workbench:** change `WorkbenchService` properties to signals to integrate with Angular reactive contexts ([17280b3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/17280b34accc6127641fb053f321a8af0110b9c2))
* **workbench/perspective:** change `WorkbenchPerspective` properties to signals to integrate with Angular reactive contexts ([df6603a](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/df6603ac30415985f191567e5820ea12e7baa1dc))
* **workbench/part:** change `WorkbenchPart` properties to signals to integrate with Angular reactive contexts ([6aa6cd1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/6aa6cd18dcbf67aa2251b4ba1dccb526db3e14e8))
* **workbench/view:** change `WorkbenchView` properties to signals to integrate with Angular reactive contexts ([4498b52](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/4498b5271e4b8ffbbe957a39c014e248d3b81608))
* **workbench/dialog:** change `WorkbenchDialog` properties to signals to integrate with Angular reactive contexts ([53ab8bb](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/53ab8bb008cc205d3c7196f2a02ffff3ffd798c6))


### BREAKING CHANGES

* **workbench:** Migrating `WorkbenchService` properties to signals has introduced a breaking change.

  Migrate reading of `WorkbenchService` properties as follows:
  - `WorkbenchService.layout` => `WorkbenchService.layout()`
  - `WorkbenchService.layout$ ` => `WorkbenchService.layout()`
  - `WorkbenchService.parts` => `WorkbenchService.parts()`
  - `WorkbenchService.parts$ ` => `WorkbenchService.parts()`
  - `WorkbenchService.perspectives` => `WorkbenchService.perspectives()`
  - `WorkbenchService.perspectives$ ` => `WorkbenchService.perspectives()`
  - `WorkbenchService.theme$ ` => `WorkbenchService.theme()`
  - `WorkbenchService.views` => `WorkbenchService.views()`
  - `WorkbenchService.views$ ` => `WorkbenchService.views()`


* **workbench/perspective:** Migrating `WorkbenchPerspective` properties to signals has introduced a breaking change.

  Migrate reading of `WorkbenchPerspective` properties as follows:
  - `WorkbenchPerspective.active` => `WorkbenchPerspective.active()`
  - `WorkbenchPerspective.active$ ` => `WorkbenchPerspective.active()`


* **workbench/part:** Migrating `WorkbenchPart` properties to signals has introduced a breaking change.

  Migrate reading of `WorkbenchPart` properties as follows:
  - `WorkbenchPart.actions` => `WorkbenchPart.actions()`
  - `WorkbenchPart.actions$ ` => `WorkbenchPart.actions()`
  - `WorkbenchPart.active` => `WorkbenchPart.active()`
  - `WorkbenchPart.active$ ` => `WorkbenchPart.active()`
  - `WorkbenchPart.activeViewId` => `WorkbenchPart.activeViewId()`
  - `WorkbenchPart.activeViewId$ ` => `WorkbenchPart.activeViewId()`
  - `WorkbenchPart.viewIds$ ` => `WorkbenchPart.viewIds()`
  - `WorkbenchPart.viewIds` => `WorkbenchPart.viewIds()`


* **workbench/view:** Migrating `WorkbenchView` properties to signals has introduced a breaking change.

  The breaking change refers to reading property values. Writable properties are still updated through value assignment. Some properties have also been renamed for consistency reasons.

  Migrate reading of `WorkbenchView` properties as follows:
  - `WorkbenchView.active` => `WorkbenchView.active()`
  - `WorkbenchView.active$ ` => `WorkbenchView.active()`
  - `WorkbenchView.cssClass` => `WorkbenchView.cssClass()`
  - `WorkbenchView.closable` => `WorkbenchView.closable()`
  - `WorkbenchView.dirty` => `WorkbenchView.dirty()`
  - `WorkbenchView.first` => `WorkbenchView.first()`
  - `WorkbenchView.heading` => `WorkbenchView.heading()`
  - `WorkbenchView.last` => `WorkbenchView.last()`
  - `WorkbenchView.navigationHint` => `WorkbenchView.navigationHint()`
  - `WorkbenchView.part` => `WorkbenchView.part()`
  - `WorkbenchView.position` => `WorkbenchView.position()`
  - `WorkbenchView.urlSegments` => `WorkbenchView.urlSegments()`
  - `WorkbenchView.scrolledIntoView` => `WorkbenchView.scrolledIntoView()`
  - `WorkbenchView.state` => `WorkbenchView.navigationState()`
  - `WorkbenchView.title` => `WorkbenchView.title()`


* **workbench/dialog:** Migrating `WorkbenchDialog` properties to signals has introduced a breaking change.

  The breaking change refers to reading property values. Writable properties are still updated through value assignment.

  Migrate reading of `WorkbenchDialog` properties as follows:
  - `WorkbenchDialog.closable` => `WorkbenchDialog.closable()`
  - `WorkbenchDialog.cssClass` => `WorkbenchDialog.cssClass()`
  - `WorkbenchDialog.padding` => `WorkbenchDialog.padding()`
  - `WorkbenchDialog.resizable` => `WorkbenchDialog.resizable()`
  - `WorkbenchDialog.size.height` => `WorkbenchDialog.size.height()`
  - `WorkbenchDialog.size.width` => `WorkbenchDialog.size.width()`
  - `WorkbenchDialog.size.maxHeight` => `WorkbenchDialog.size.maxHeight()`
  - `WorkbenchDialog.size.minHeight` => `WorkbenchDialog.size.minHeight()`
  - `WorkbenchDialog.size.maxWidth` => `WorkbenchDialog.size.maxWidth()`
  - `WorkbenchDialog.size.minWidth` => `WorkbenchDialog.size.minWidth()`
  - `WorkbenchDialog.title` => `WorkbenchDialog.title()`
  - Setting an observable as dialog title is no longer supported. Instead, manually subscribe to the observable and set the title.




# [18.0.0-beta.3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/18.0.0-beta.2...18.0.0-beta.3) (2024-06-21)


### Bug Fixes

* **workbench/perspective:** create default perspective if no perspective exists ([7010623](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/701062314d580110d2e368eff899d55869bd046a))
* **workbench/view:** align microfrontend with view bounds when moving it to another part of the same size ([e57f0d0](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e57f0d00894851fb720cad70da4c77f2b3b5fcb1))
* **workbench/view:** do not error when initializing view in `ngOnInit` ([1374260](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/1374260523670f447ace5e9757890f5a24e81dc8))
* **workbench/view:** initialize microfrontend loaded into inactive view ([764f89e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/764f89eee64e06685db4c9144ccaaf072d784449))


### Features

* **workbench/perspective:** activate first view of each part if not specified ([161d05d](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/161d05d787caf0df2fbc74596b845a711e44891b))
* **workbench/perspective:** enable micro app to contribute perspective ([f20f607](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/f20f607333a480ad9f89f3c13f52ef472ff256c4)), closes [#449](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/449)
* **workbench/view:** display "Not Found" page if microfrontend is not available ([93be385](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/93be3853734b248cf29364c96f641d329eef8d5b))


### BREAKING CHANGES

* **workbench/perspective:** The return type of the function to select the initial perspective has changed. To migrate, return the perspective id instead of the perspective instance.
* **workbench:** SCION Workbench requires `@scion/microfrontend-platform` version `1.3.0` or later.
* **workbench:** SCION Workbench requires `@scion/workbench-client` version `1.0.0-beta.24` or later.



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



# [18.0.0-beta.1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/17.0.0-beta.9...18.0.0-beta.1) (2024-06-10)


### Dependencies

* **workbench:** update @scion/workbench to Angular 18 ([d39fa85](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/d39fa851908804fea3e54f3b25daedb539dd29a3))


### BREAKING CHANGES

* **workbench:** Updating `@scion/workbench` to Angular 18 introduced a breaking change.

  To migrate:
  - update your application to Angular 18; for detailed migration instructions, refer to https://v18.angular.dev/update-guide;
  - update @scion/components to version 18; for detailed migration instructions, refer to https://github.com/SchweizerischeBundesbahnen/scion-toolkit/blob/master/CHANGELOG_COMPONENTS.md;



# [17.0.0-beta.9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/17.0.0-beta.8...17.0.0-beta.9) (2024-05-22)


### Bug Fixes

* **workbench/dialog:** avoid `ExpressionChangedAfterItHasBeenCheckedError` when registering dialog header, footer and actions ([5554428](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/555442892c1231c0b4b8fbd06e1be15cc46041c6))
* **workbench/dialog:** set initial focus on delayed content ([312280e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/312280ea4240b146a10585b45a2246361c2ec8b0))


### Features

* **workbench/message-box:** enable microfrontend display in a message box ([3e9d88d](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/3e9d88d79665cbce03acfcf2bbd0e0bbda8d5c78))


### BREAKING CHANGES

* **workbench/message-box:** Support for displaying microfrontend in a message box has been added.

  To migrate, update to the latest version of `@scion/workbench-client`.



# [17.0.0-beta.8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/17.0.0-beta.7...17.0.0-beta.8) (2024-05-07)


### Bug Fixes

* **workbench/view:** fix issues to prevent a view from closing ([a280af9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a280af9011cb87bc97e4f29a78fbe3b54d05efb3)), closes [#27](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/27) [#344](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/344)
* **workbench/view:** update view properties when navigating an open view ([02a24ff](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/02a24ff443c28630c455c6df9c1b368d7fb01e02))


### Code Refactoring

* **workbench/router:** remove `blank` prefix from navigation extras ([446fa51](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/446fa51c24f1e616a1e4ebd80f42cfc9300b6970))
* **workbench/router:** remove option to close view via workbench router link ([88d1704](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/88d170410eff006c313f4be598853fd207dd4a3a))


### Dependencies

* **workbench:** require Angular version 17.0.6 or later to fix angular/angular[#53239](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/53239) ([dd78d07](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/dd78d0711fe4f462889708f59c573a64c2380e56))


### Features

* **workbench/router:** control workbench part to navigate views ([0bf35a7](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0bf35a7f59927037f18e46e3ad1720460bbd0bbc))
* **workbench/router:** provide API to modify the workbench layout ([46ea446](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/46ea4469dab2743aef414d8d85460ef1e7293eeb))
* **workbench/router:** support navigation to children of the empty path route ([da578a9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/da578a9244ad9db753751c875009ec89df847197)), closes [#487](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/487)
* **workbench:** provide function to set up the SCION Workbench ([1a506ef](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/1a506ef35b36147c81a4c99465eadabe35e830e3))
* **workbench:** support navigation of views in the initial layout (or perspective) ([1ffd757](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/1ffd7579fcfb574b7581b58138001b569ab47303)), closes [#445](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/445)


### BREAKING CHANGES

* **workbench/view:** Interface and method for preventing closing of a view have changed.

  To migrate, implement the `CanClose` instead of the `WorkbenchViewPreDestroy` interface.
  
  **Before migration:**
  ```ts
  class YourComponent implements WorkbenchViewPreDestroy {
    public async onWorkbenchViewPreDestroy(): Promise<boolean> {
      // return `true` to close the view, otherwise `false`.
    }
  }
  ```
  
  **After migration:**
  
  ```ts
  class YourComponent implements CanClose {
    public async canClose(): Promise<boolean> {
      // return `true` to close the view, otherwise `false`.
    }
  }
  ```
* **workbench/router:** Property `blankInsertionIndex` in `WorkbenchNavigationExtras` has been renamed.

  To migrate, update to the latest version of `@scion/workbench-client` and use `WorkbenchNavigationExtras.position` instead of `WorkbenchNavigationExtras.blankInsertionIndex`.
* **workbench/router:** Property `blankPartId` in `WorkbenchNavigationExtras` has been renamed.

  To migrate, use `WorkbenchNavigationExtras.partId` instead of `WorkbenchNavigationExtras.blankPartId`.
* **workbench:** Views in the initial layout (or perspective) must now be navigated.

  Previously, no explicit navigation was required because views and routes were coupled via route outlet and view id.

  **Migrate the layout as follows:**

  Explicitly navigate views, passing an empty array of commands and the view id as navigation hint.
  
  ```ts
  // Before Migration
  provideWorkbench({
    layout: (factory: WorkbenchLayoutFactory) => factory
      .addPart(MAIN_AREA)
      .addPart('left', {relativeTo: MAIN_AREA, align: 'left'})
      .addView('navigator', {partId: 'left', activateView: true}),
  });
  
  // After Migration
  provideWorkbench({
    layout: (factory: WorkbenchLayoutFactory) => factory
      .addPart(MAIN_AREA)
      .addPart('left', {relativeTo: MAIN_AREA, align: 'left'})
      .addView('navigator', {partId: 'left', activateView: true})
      // Navigate view, passing hint to match route.
      .navigateView('navigator', [], {hint: 'navigator'}),
  });
  ```
  
  **Migrate the routes as follows:**
  - Remove the `outlet` property;
  - Add `canMatchWorkbenchView` guard and initialize it with the hint passed to the navigation;
    
  ```ts
  // Before Migration
  provideRouter([
    {
      path: '',
      outlet: 'navigator',
      loadComponent: () => ...,
    },
  ]);
  
  // After Migration
  provideRouter([
    {
      path: '',
      // Match route only if navigated with specified hint.
      canMatch: [canMatchWorkbenchView('navigator')],
      loadComponent: () => ...,
    },
  ]);
  ```
* **workbench:** Changed type of view id from `string` to `ViewId`.

  If storing the view id in a variable, change its type from `string` to `ViewId`.
* **workbench/router:** Removed the option to close a view via the `wbRouterLink` directive.

  The router link can no longer be used to close a view. To close a view, use the `WorkbenchView`, the `WorkbenchRouter`, or the `WorkbenchService` instead.
  
  Examples:
  ```ts
  // Closing a view via `WorkbenchView` handle
  inject(WorkbenchView).close();
  
  // Closing view(s) via `WorkbenchRouter`
  inject(WorkbenchRouter).navigate(['path/*/view'], {close: true});
  
  // Closing view(s) via `WorkbenchService`
  inject(WorkbenchService).closeViews('view.1', 'view.2');
  ```
* **workbench:** SCION Workbench requires Angular version 17.0.6 or later to fix angular/angular#53239



# [17.0.0-beta.7](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/17.0.0-beta.6...17.0.0-beta.7) (2024-03-29)


### Bug Fixes

* **workbench/view:** do not overwrite CSS classes set in different scopes ([02bc372](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/02bc372892e9f48765390d0aa7fbeacfca28d172)), closes [#394](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/394)
* **workbench/view:** handle `undefined` keydown event key ([66358dd](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/66358ddc56639106d7010771cbb1452d97cca5eb))
* **workbench/view:** render tab content when dragging view quickly into the window ([73645d8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/73645d8c0874199f087bb611e2424f68a5eda22d))


### Code Refactoring

* **workbench/dialog:** consolidate API for closing a dialog ([40414c4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/40414c4a891a037f70d2c6b3309b48abba3a8e59))
* **workbench/view:** move navigational state from route data to view handle ([3d6a5ca](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/3d6a5ca1ffb16abacbb9b29c9ea2ec98027b09de))


### Features

* **workbench/dialog:** enable microfrontend display in a dialog ([11d762b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/11d762bb40539fdbdc263da8faf2177423a68d43))


### BREAKING CHANGES

* **workbench/dialog:** The method `closeWithError` has been removed from the `WorkbenchDialog` handle. Instead, pass an `Error` object to the `close` method.
  
  #### Before
  
  ```ts
  import {WorkbenchDialog} from '@scion/workbench';
  
  inject(WorkbenchDialog).closeWithError('some error');
  ```

  #### After
  
  ```ts
  import {WorkbenchDialog} from '@scion/workbench';
  
  inject(WorkbenchDialog).close(new Error('some error'));
  ```
* **workbench/view:** Removed `WorkbenchView.cssClasses` property for reading CSS classes. Use `WorkbenchView.cssClass` for both reading and setting CSS class(es) instead.
* **workbench/view:** Moving navigational state to the view handle has introduced a breaking change.

  To migrate, read the navigational view state from the view handle instead of the activated route data, as follows: `WorkbenchView.state`.



# [17.0.0-beta.6](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/17.0.0-beta.5...17.0.0-beta.6) (2024-03-14)


### Bug Fixes

* **workbench:** avoid Angular change detection cycle on keyboard event ([e99b9a6](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e99b9a64e00d4335f42867187f6595adebfda29b))
* **workbench:** fix moving view to empty main area ([3bbe5ca](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/3bbe5cad0b7433ec6fd20c5b91880e357c4b81a2))



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



# [17.0.0-beta.4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/17.0.0-beta.3...17.0.0-beta.4) (2024-01-26)


### Bug Fixes

* **workbench/dialog:** ensure letters of dialog title are not clipped ([b877d55](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/b877d552c11786aeac9d3d942634d09a92ea144a))
* **workbench/dialog:** prevent resizing blocked dialog ([9561166](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/9561166d2a9339d1123de4c93132ffb3fdde2c62))
* **workbench/dialog:** prevent user interaction when opening a blocked dialog ([b433cde](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/b433cdee3ff0f3c3144aa8f57938213db2fddd9b))
* **workbench/message-box:** align message on the left, not in the center ([d5950ce](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/d5950ce91bae2cab9f88a12067116e7825679ade))
* **workbench/message-box:** increase padding for better aesthetics ([3fef14c](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/3fef14c2aa7ee8f4f7047177a6d256ff5e9d95bc))
* **workbench/message-box:** wrap title if too long ([4bb5b89](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/4bb5b89dfc70aa95648984143a66f93a3ce9e62f))



# [17.0.0-beta.3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/17.0.0-beta.2...17.0.0-beta.3) (2024-01-23)


### Bug Fixes

* **workbench/dialog:** consider minimum size in resizing constraints ([408676c](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/408676c63da6d6395b0e93113165674eb5d758d2))
* **workbench/dialog:** do not block dialogs of other views ([0c1b88e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0c1b88e3209b9eab7b1929a579bf7dc426a1821e))
* **workbench/dialog:** propagate view context ([c22222f](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/c22222fa20e0f5f50f27998b2ad3955d6a91d57e))
* **workbench/popup:** propagate view context ([31e9700](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/31e97005fcb0875fd5530396dc91fb2ba59012cf))
* **workbench/message-box:** open message box in a dialog ([bdcd02b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/bdcd02be5661df895703a685d7b5d2e974fe64c5)), closes [#438](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/438)
* **workbench:** throw error for objects not available for dependency injection ([a36ae5e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a36ae5ece28a157a31a236821274fec97344b345))


### Features

* **workbench/dialog:** support custom header and footer ([5c6a4d6](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/5c6a4d66f7b98215334e80a5c00aeb78950b94c3))


### BREAKING CHANGES

* **workbench/message-box:** Consolidation of the MessageBox API has introduced a breaking change.

  Refer to the documentation for migration examples: https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/howto/how-to-open-message-box.md
  
  To migrate:
  - `MessageBoxService` is now `WorkbenchMessageBoxService`.
  - `MessageBoxConfig` is now `WorkbenchMessageBoxOptions`.
  - Signature of `WorkbenchMessageBoxService#open` method has changed. Pass the message (text or component) as the first argument, not via options object.
  - `injector` option has been moved to a top-level property (previously `MessageBoxConfig#componentConstructOptions`).
  - `viewContainerRef` option has been removed (no replacement).
  - `componentInput` option has been renamed to `inputs` with the type changed to a dictionary. Inputs are now available as input properties in the component, previously via `MessageBox#input` handle.
  - `MessageBox` handle has been removed. Configure the message box when opening the message box.
  - Registration of custom action handlers has been removed (no replacement).
  - Pressing the Escape key no longer closes the message box for an action with the 'close' key.
 
* **workbench/dialog:** Support for custom header and footer has introduced a breaking change.

  To migrate:
  - Type of `WorkbenchDialog.padding` is now `boolean`. Set to `false` to remove the padding, or set the CSS variable `--sci-workbench-dialog-padding` for a custom padding.
  - `--sci-workbench-dialog-header-divider-color` CSS variable has been removed (no replacement).



# [17.0.0-beta.2](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/17.0.0-beta.1...17.0.0-beta.2) (2023-11-29)


### Features

* **workbench/dialog:** make dialog resizable ([34ce415](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/34ce4157cdfc55a6786d8a4998f5d54f76b96c38))



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



# [16.0.0-beta.10](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/16.0.0-beta.9...16.0.0-beta.10) (2023-11-08)


### Bug Fixes

* **workbench:** show splash if instructed by the capability, but only if not navigating to the same capability ([54095b3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/54095b3703ae36ab56479dbe4870fa890205985c))
* **workbench:** do not render divider preceding tab dragged out of its tabbar ([390178a](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/390178a5629fee2ef5be9da81a6609f45fd914e6))



# [16.0.0-beta.9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/16.0.0-beta.8...16.0.0-beta.9) (2023-10-31)


### Features

* **workbench:** enable microfrontend to display a splash until loaded ([7a79065](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/7a79065543da636b545672fd01cfeceb2fbab323))
* **workbench:** enable customizing minimum tab width ([4052128](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/40521282642f3164941b1849cf9f92f49561678f))
* **workbench:** propagate color scheme to embedded content ([276fcf3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/276fcf3bc922951920379111319d3c50e655de4f))



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



# [16.0.0-beta.7](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/16.0.0-beta.6...16.0.0-beta.7) (2023-09-26)


### Code Refactoring

* **workbench:** display start page standalone, not nested in a workbench part ([37a1350](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/37a13501d165cd28308b407f88560fff3a40d7db)), closes [#492](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/492)


### BREAKING CHANGES

* **workbench:** Changing the display of the start page has introduced a breaking change.

  The workbench no longer supports displaying part actions on the start page. Instead, add controls (actions) directly to the start page.



# [16.0.0-beta.6](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/16.0.0-beta.5...16.0.0-beta.6) (2023-09-20)


### Bug Fixes

* **workbench:** do not publish changed layout objects until processed a layout change ([8286d65](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/8286d657487cfc23717cf02a502ea141e36357af))


### Features

* **workbench:** allow for a layout with an optional main area ([ff6697a](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ff6697a641b6719faedea966a5f1bc3e1099805f)), closes [#443](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/443)


### BREAKING CHANGES

* **workbench:** Adding support for optional main area introduced breaking changes.

  The following APIs have changed:
    - renamed `MAIN_AREA_PART_ID` to `MAIN_AREA`;
    - changed signature of `WorkbenchLayoutFn` to take `WorkbenchLayoutFactory` instead of `WorkbenchLayout` as argument;
    - layout definitions, if any, must now add the `MAIN_AREA` part explicitly;
    - changed inputs of `wbPartAction` directive to take `canMatch` function instead of `view`, `part` and `area` inputs;
  
  ### The following snippets illustrate how a migration could look like:
  
  #### Initial layout: Before migration
  
  ```ts
  import {MAIN_AREA_PART_ID, WorkbenchModule} from '@scion/workbench';
  
  WorkbenchModule.forRoot({
    layout: layout => layout
      .addPart('left', {relativeTo: MAIN_AREA_PART_ID, align: 'left', ratio: .25})
      .addView('navigator', {partId: 'left', activateView: true})
  });
  ```
  
  #### Initial layout: After migration
  
  ```ts
  import {MAIN_AREA, WorkbenchLayoutFactory, WorkbenchModule} from '@scion/workbench';
  
  WorkbenchModule.forRoot({
    layout: (factory: WorkbenchLayoutFactory) => factory
      .addPart(MAIN_AREA)
      .addPart('left', {relativeTo: MAIN_AREA, align: 'left', ratio: .25})
      .addView('navigator', {partId: 'left', activateView: true})
  });
  ```
  
  #### Part Action: Before migration
  
  ```html
  <wb-workbench>
    <ng-template wbPartAction area="main">
      <button [wbRouterLink]="'/path/to/view'">
        Open View
      </button>
    </ng-template>
  </wb-workbench>
  ```
  
  #### Part Action: After migration
  
  ```html
  <wb-workbench>
    <ng-template wbPartAction [canMatch]="isPartInMainArea">
      <button [wbRouterLink]="'/path/to/view'">
        Open View
      </button>
    </ng-template>
  </wb-workbench>
  ```
  
  ```ts
  isPartInMainArea = (part: WorkbenchPart): boolean => {
    return part.isInMainArea;
  };
  ```



# [16.0.0-beta.5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/16.0.0-beta.4...16.0.0-beta.5) (2023-08-24)


### Bug Fixes

* **workbench:** display perspective also for slow/asynchronous initial navigation ([da4bfe5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/da4bfe5581f4ff10a117af38262657142c4d8b93))
* **workbench:** display view 'standalone' when moving it to a new window ([3d851af](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/3d851af237a1f5126b2292ea6a6c945905344759)), closes [#477](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/477)
* **workbench:** ensure menu items in view context-menu to display in full-width ([0702fb1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0702fb119a40273f4c0dfb09d1596a313b71ee88))
* **workbench:** resolve perspective layout storage issues ([754747a](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/754747a973e576377712ba23d9f28ed785f4d110)), closes [#470](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/470) [#471](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/471) [#472](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/472)
* **workbench:** support application URL to contain view outlets of views contained the perspective grid ([1eead4b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/1eead4b3976e5b84400c3f40a324e1a97977f6ee)), closes [#474](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/474)


### Features

* **workbench:** allow for navigation to empty path auxiliary routes ([5397bee](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/5397beeee3c9441108b7d83b27ca5476b70ad499)), closes [#476](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/476)
* **workbench:** support asynchronous navigation in `WorkbenchRouter.ɵnavigate` ([e82495f](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e82495f8b226083ab82d64fef8beb963ce6d2bcd))



# [16.0.0-beta.4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/16.0.0-beta.3...16.0.0-beta.4) (2023-08-11)


### Bug Fixes

* **workbench:** fetch icon font for applications deployed in a subdirectory ([02db939](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/02db939e89ca918b93aca252ff82aa6346f7e56f)), closes [#466](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/466)



# [16.0.0-beta.3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/16.0.0-beta.2...16.0.0-beta.3) (2023-08-08)


### Bug Fixes

* **workbench:** fix moving view tabs in the tabbar ([cfc8482](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/cfc8482ac9f6c1cdba30cb8c81b6ed7228ab891f)), closes [#444](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/444)



# [16.0.0-beta.2](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/16.0.0-beta.1...16.0.0-beta.2) (2023-08-04)


### Bug Fixes

* **workbench:** allow re-mounting of the workbench component ([6fdc142](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/6fdc142c0d9aa51423be1b6636f03e8e336e5e52)), closes [#250](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/250)


### Features

* **workbench:** enable users to drag views to the side of the main or peripheral area ([5ea3fc9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/5ea3fc9e7281dce0075ba021714e59b63cfe197a)), closes [#444](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/444)



# [16.0.0-beta.1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/15.0.0-beta.8...16.0.0-beta.1) (2023-06-08)


### Dependencies

* **workbench:** update @scion/workbench to Angular 16 ([98af801](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/98af80190e5893698b7102bde5e3cd03fc1a3f50)), closes [#429](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/429)


### Features

* **workbench:** accept passing `undefined` in optional inputs ([b19f428](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/b19f42834b2cb85daa580f519da82ce3afa746ab))
* **workbench:** comply with basic accessibility rules ([ed52668](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ed526684d432e02380341c4f55e828d13846207d))
* **workbench:** mark required inputs as required ([e8ccb94](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e8ccb94e91ba7dcb90118933554f707fba653d42))


### BREAKING CHANGES

* **workbench:** Removing compatibility of deprecated router API introduced a breaking change in client applications.

  To migrate applications using @scion/workbench-client:
  - update @scion/workbench-client to version `1.0.0-beta.17` or greater

* **workbench:** Updating `@scion/workbench` to Angular 16 introduced a breaking change.
  
  To migrate:
  - update your application to Angular 16.x; for detailed migration instructions, refer to https://v16.angular.io/guide/update-to-latest-version;
  - update @scion/components to version 16; for detailed migration instructions, refer to https://github.com/SchweizerischeBundesbahnen/scion-toolkit/blob/master/CHANGELOG_COMPONENTS.md;



# [15.0.0-beta.8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/15.0.0-beta.7...15.0.0-beta.8) (2023-06-08)


### Bug Fixes

* **workbench:** reset part action list styling ([dde93b6](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/dde93b6758be547c581e59762620997e6d82edc8))



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
