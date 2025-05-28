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
