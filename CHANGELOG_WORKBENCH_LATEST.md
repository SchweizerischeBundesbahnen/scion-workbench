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
