<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| [SCION Workbench][menu-home] | [Projects Overview][menu-projects-overview] | Changelog | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [Changelog][menu-changelog] > Workbench Client (@scion/workbench-client)


# [1.0.0-beta.28](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.27...workbench-client-1.0.0-beta.28) (2024-11-25)


### Features

* **workbench-client/view:** add functional `CanClose` guard, deprecate class-based guard ([ecd52b3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ecd52b3afe82c0e1353cf96be550f925e76a72d5))


### Deprecations

* **workbench-client/view:** The class-based `CanClose` guard has been deprecated in favor of a functional guard that can be registered on `WorkbenchView.canClose`.

  Migrate by registering a callback on `WorkbenchView.canClose` instead of implementing the `CanClose` interface.
  
  **Before migration:**
  ```ts
  import {CanClose, WorkbenchView} from '@scion/workbench-client';
  import {Beans} from '@scion/toolkit/bean-manager';
  
  export class ViewComponent implements CanClose {
  
    constructor() {
      Beans.get(WorkbenchView).addCanClose(this);
    }
  
    public canClose(): boolean {
      return true;
    }
  }
  ```
  
  **After migration:**
  ```ts
  import {WorkbenchView} from '@scion/workbench-client';
  import {Beans} from '@scion/toolkit/bean-manager';
  
  export class ViewComponent {
  
    constructor() {
      Beans.get(WorkbenchView).canClose(() => {
        return true;
      });
    }
  }
  ```


# [1.0.0-beta.27](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.26...workbench-client-1.0.0-beta.27) (2024-10-11)


### Bug Fixes

* **workbench-client:** position document root as required by `@scion/toolkit` ([007e9c3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/007e9c396dff4c2dde11c62d810b5997c034eca2))



# [1.0.0-beta.26](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.25...workbench-client-1.0.0-beta.26) (2024-09-11)


### Features

* **workbench-client/popup:** support returning result on focus loss ([ce5089e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ce5089e57ba48f53f17fede4ffe4fa72cf74a01b))


### BREAKING CHANGES

* **workbench-client/popup:** The method `closeWithError` has been removed from the `WorkbenchPopup` handle. Instead, pass an `Error` object to the `close` method.

**Before migration:**
```ts
import {Beans} from '@scion/toolkit/bean-manager';
import {WorkbenchPopup} from '@scion/workbench-client';

Beans.get(WorkbenchPopup).closeWithError('some error');
```

**After migration:**
```ts
import {Beans} from '@scion/toolkit/bean-manager';
import {WorkbenchPopup} from '@scion/workbench-client';

Beans.get(WorkbenchPopup).close(new Error('some error'));
```



# [1.0.0-beta.25](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.24...workbench-client-1.0.0-beta.25) (2024-08-28)


### Bug Fixes

* **workbench-client/dialog:** unsubscribe previous title observable when setting new title observable ([2e72b39](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/2e72b395cb11f53456bf2e929eb6dec97043f4c4))


# [1.0.0-beta.24](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.23...workbench-client-1.0.0-beta.24) (2024-06-21)


### Features

* **workbench-client/router:** control workbench part to navigate views ([af702d0](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/af702d043d0f353906888374e18a5ec5bf39e0eb))
* **workbench-client/view:** provide part via view handle ([849d7f3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/849d7f386f6c95b4dd07463daac3512849964a11))
* **workbench-client/perspective:** enable micro app to contribute perspective ([f20f607](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/f20f607333a480ad9f89f3c13f52ef472ff256c4)), closes [#449](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/449)



# [1.0.0-beta.23](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.22...workbench-client-1.0.0-beta.23) (2024-05-21)


### Features

* **workbench-client/message-box:** enable microfrontend display in a message box ([3e9d88d](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/3e9d88d79665cbce03acfcf2bbd0e0bbda8d5c78)), closes [#488](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/488)


### BREAKING CHANGES

* **workbench-client/message-box:** The signature of the `WorkbenchMessageBoxService.open` method has changed.
  
  To migrate:
  - To display a text message, pass the message as the first argument, not via the `content` property in the options.
  - To display a custom message box, pass the qualifier as the first argument and options, if any, as the second argument.
  
  **Example migration to display a text message**
  ```ts
  // Before Migration
  inject(WorkbenchMessageBoxService).open({
    content: 'Do you want to continue?',
    actions: {yes: 'Yes', no: 'No'},
  });
  
  // After Migration
  inject(WorkbenchMessageBoxService).open('Do you want to continue?', {
    actions: {yes: 'Yes', no: 'No'},
  });
  ```
  
  **Example migration to open a custom message box capability**
  ```ts
  // Before Migration
  inject(WorkbenchMessageBoxService).open({
      title: 'Unsaved Changes',
      params: {changes: ['change 1', 'change 2']},
      actions: {yes: 'Yes', no: 'No'},
    },
    {confirmation: 'unsaved-changes'},
  );
  
  // After Migration
  inject(WorkbenchMessageBoxService).open({confirmation: 'unsaved-changes'}, {
    title: 'Unsaved Changes',
    params: {changes: ['change 1', 'change 2']},
    actions: {yes: 'Yes', no: 'No'},
  });
  ```



# [1.0.0-beta.22](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.21...workbench-client-1.0.0-beta.22) (2024-05-07)


### Bug Fixes

* **workbench-client/view:** fix issues to prevent a view from closing ([a280af9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a280af9011cb87bc97e4f29a78fbe3b54d05efb3)), closes [#27](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/27) [#344](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/344)


### Refactor

* **workbench-client/router:** remove `blank` prefix from navigation extras ([446fa51](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/446fa51c24f1e616a1e4ebd80f42cfc9300b6970))


### BREAKING CHANGES

* **workbench-client/view:** Interface and method for preventing closing of a view have changed.

  To migrate, implement the `CanClose` instead of the `ViewClosingListener ` interface.

  **Before migration:**
  ```ts
  class YourComponent implements ViewClosingListener {
   
    constructor() {
      Beans.get(WorkbenchView).addClosingListener(this);
    }
   
    public async onClosing(event: ViewClosingEvent): Promise<void> {
      // invoke 'event.preventDefault()' to prevent closing the view.
    }
  }
  ```
  
  **After migration:**
  
  ```ts
  class YourComponent implements CanClose {
   
    constructor() {
      Beans.get(WorkbenchView).addCanClose(this);
    }
   
    public async canClose(): Promise<boolean> {
      // return `true` to close the view, otherwise `false`.
    }
  }
  ```
  
* **workbench-client/router:** Property `blankInsertionIndex` in `WorkbenchNavigationExtras` has been renamed.
  
  Use `WorkbenchNavigationExtras.position` instead of `WorkbenchNavigationExtras.blankInsertionIndex`.

* **workbench-client/view:** Changed type of view id from `string` to `ViewId`.
  
  If storing the view id in a variable, change its type from `string` to `ViewId`.



# [1.0.0-beta.21](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.20...workbench-client-1.0.0-beta.21) (2024-03-29)


### Bug Fixes

* **workbench-client/view:** remove qualifier from microfrontend URL and params ([57cfd9e](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/57cfd9e4d4090158393086b928a11aa69c38db2f))


### Features

* **workbench-client/dialog:** enable microfrontend display in a dialog ([11d762b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/11d762bb40539fdbdc263da8faf2177423a68d43))


### BREAKING CHANGES

* **workbench-client/view:** Removing qualifier from params has introduced a breaking change.

  The view qualifier has been removed from the view parameters as it is static.



# [1.0.0-beta.20](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.19...workbench-client-1.0.0-beta.20) (2023-10-31)


### Features

* **workbench-client:** enable microfrontend to display a splash until loaded ([7a79065](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/7a79065543da636b545672fd01cfeceb2fbab323))
* **workbench-client:** provide workbench color scheme ([ed63b22](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ed63b225976c23b39446d4095fded734937e030a))



# [1.0.0-beta.19](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.18...workbench-client-1.0.0-beta.19) (2023-10-10)


### Features

* **workbench-client:** rework tab design and styling of the SCION Workbench ([5cbd354](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/5cbd3544019192f3f01de5faf985b78f0a5ba63b)), closes [#110](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/110)



# [1.0.0-beta.18](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.17...workbench-client-1.0.0-beta.18) (2023-05-23)


### Features

* **workbench-client:** consolidate workbench view handle ([3f6fb22](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/3f6fb22e27b597f3c4a83f9cc1cb74fde4493f73))


### BREAKING CHANGES

* **workbench-client:** consolidating workbench view handle introduced a breaking change.

  The following APIs have changed:
    - `WorkbenchView.viewId` => `WorkbenchView.id`


# [1.0.0-beta.17](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.16...workbench-client-1.0.0-beta.17) (2023-02-10)


### Bug Fixes

* **workbench-client/router:** ignore matrix params to resolve views for navigation ([ce133bf](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ce133bf7efec1edb5bb078db28371969a3ed0208)), closes [#239](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/239)


### Features

* **workbench-client/router:** support closing views that match a pattern ([4d39107](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/4d391075d9e9e35a4ecf5497de6cfd03bc4ab67c)), closes [#240](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/240)


### BREAKING CHANGES

* **workbench-client/router:** adding support for closing views that match a pattern introduced a breaking change in the Workbench Router API.

  The communication protocol between host and client is backward compatible, so you can upgrade the host and clients independently.

  To migrate:
  - Use `close=true` instead of `closeIfPresent=true` in navigation extras to instruct the router to close matching view(s).
  - Parameters now support the asterisk wildcard value (`*`) to match views with any value for that parameter.

  ### The following snippets illustrate how a migration could look like:

  **Close views**
  ```ts
  // Capability
  this.manifestService.registerCapability({
    type: 'view',
    qualifier: {component: 'user'},
    params: [
      {name: 'id', required: true},
      {name: 'param', required: false},
    ],
    properties: {
      path: 'user/:id',
    },
  });
  
  // Before migration: optional params affect view resolution
  this.workbenchClientRouter.navigate({component: 'user'}, {target: 'blank', params: {id: 1, param: 1}}); // opens view 1
  this.workbenchClientRouter.navigate({component: 'user'}, {target: 'blank', params: {id: 1, param: 2}}); // opens view 2
  this.workbenchClientRouter.navigate({component: 'user'}, {close: true, params: {id: 1, param: 1}}); // closes view 1
  this.workbenchClientRouter.navigate({component: 'user'}, {close: true, params: {id: 1, param: 2}}); // closes view 2
  
  // After migration: optional params do not affect view resolution
  this.workbenchClientRouter.navigate({component: 'user'}, {target: 'blank', params: {id: 1, param: 1}}); // opens view 1
  this.workbenchClientRouter.navigate({component: 'user'}, {target: 'blank', params: {id: 1, param: 2}}); // opens view 2
  this.workbenchClientRouter.navigate({component: 'user'}, {close: true, params: {id: 1}}); // closes view 1 and view 2
  ```
  
  **Close views matching a pattern (NEW)**
  ```ts
  // Capability
  this.manifestService.registerCapability({
    type: 'view',
    qualifier: {component: 'team-member'},
    params: [
      {name: 'team', required: true},
      {name: 'user', required: true},
    ],
    properties: {
      path: 'team/:team/user/:user',
    },
  });
  
  // Open 4 views
  this.workbenchClientRouter.navigate({component: 'team-member'}, {params: {team: 33, user: 11}});  // opens view 1
  this.workbenchClientRouter.navigate({component: 'team-member'}, {params: {team: 33, user: 12}});  // opens view 2
  this.workbenchClientRouter.navigate({component: 'team-member'}, {params: {team: 44, user: 11}});  // opens view 3
  this.workbenchClientRouter.navigate({component: 'team-member'}, {params: {team: 44, user: 12}});  // opens view 4
  
  // Closes view 1
  this.workbenchClientRouter.navigate({component: 'team-member'}, {close: true, params: {team: 33, user: 11}});
  
  // Closes view 1 and view 2
  this.workbenchClientRouter.navigate({component: 'team-member'}, {close: true, params: {team: 33, user: '*'}});
  
  // Closes view 2 and view 4
  this.workbenchClientRouter.navigate({component: 'team-member'}, {close: true, params: {team: '*', user: 12}});
  
  // Closes all views
  this.workbenchClientRouter.navigate({component: 'team-member'}, {close: true, params: {team: '*', user: '*'}});
  ```
* **workbench-client/router:** ignoring matrix params to resolve views for navigation introduced a breaking change in the Workbench Router API.

  The communication protocol between host and client is backward compatible, so you can upgrade the host and clients independently.

  To migrate:
  - Use `target=auto` instead of `activateIfPresent=true` in navigation extras.\
    Using `auto` as the navigation target navigates existing view(s) that match the qualifier and required parameter(s), if any. If not finding a matching view, the navigation opens a new view. This is the default behavior if no target is specified.
  - Use `target=blank` instead of `activateIfPresent=false` in navigation extras.\
    Using `blank` as the navigation target always navigates in a new view.
  - Use `target=<view.id>` instead of setting `target=self` and `selfViewId=<view.id>` in navigation extras.\
    Setting a view id as the navigation target replaces the specified view, or creates a new view if not found.
  - Use the property `activate`  in navigation extras to instruct the router to activate the view after navigation. Defaults to `true` if not specified.
  - The router does not navigate the current view anymore. To navigate the current view, specify the current view as the navigation target in navigation extras.

  ### The following snippets illustrate how a migration could look like:
  
  **Navigate existing view(s)**
  ```ts
  // Before migration
  this.workbenchClientRouter.navigate({entity: 'person'}, {activateIfPresent: true});
  
  // After migration
  this.workbenchClientRouter.navigate({entity: 'person'});
  this.workbenchClientRouter.navigate({entity: 'person'}, {target: 'auto'}); // this is equivalent to the above statement
  ```
  
  **Open view in new view tab**
  ```ts
  // Before migration
  this.workbenchClientRouter.navigate({entity: 'person'}, {activateIfPresent: false});
  
  // After migration
  this.workbenchClientRouter.navigate({entity: 'person'}, {target: 'blank'});
  ```
  
  **Replace existing view**
  ```ts
  // Before migration
  this.workbenchClientRouter.navigate({entity: 'person'}, {target: 'self', selfViewId: 'view.1'});
  
  // After migration
  this.workbenchClientRouter.navigate({entity: 'person'}, {target: 'view.1'});
  ```
  
  **Prevent view activation after navigation (NEW)**
  ```ts
  this.workbenchClientRouter.navigate({entity: 'person'}, {target: 'blank', activate: false});
  ```



# [1.0.0-beta.16](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.15...workbench-client-1.0.0-beta.16) (2022-12-21)


### Features

* **workbench-client/popup:** enable popup opener to locate popup via CSS class ([73a4ee0](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/73a4ee02cc8a6010956766f1e114a7791346031e)), closes [#358](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/358)

### Dependencies

* **workbench-client:** update `@scion/microfrontend-platform` to version `1.0.0-rc.12` ([1f674fa](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/1f674fa5b727003efdd99d845a401a0326290fb6))


### BREAKING CHANGES


* **workbench-client:** Updating `@scion/microfrontend-platform` to version `1.0.0-rc.12` introduced a breaking change.

  More information on how to migrate can be found in the [changelog](https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/blob/master/docs/site/changelog/changelog.md) of the SCION Microfrontend Platform.

# [1.0.0-beta.15](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.14...workbench-client-1.0.0-beta.15) (2022-12-07)


### Bug Fixes

* **workbench-client:** do not focus nested microfrontend in a popup ([9293464](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/9293464762b2d1a1b123fda33af6224c7672d732))


### Dependencies

* **workbench-client:** update `@scion/microfrontend-platform` to version `1.0.0-rc.11` ([34fec1d](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/34fec1dd61499cfbed15af8dfa3a69c2a647044c))


### Features

* **workbench-client:** enable Observables of `WorkbenchView` to emit in the correct context ([ec0d808](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ec0d8088fbb2dae9b03624835f9f238c0b4f7053))


### BREAKING CHANGES

* **workbench-client:** Updating `@scion/microfrontend-platform` to version `1.0.0-rc.11` introduced a breaking change.

  More information on how to migrate can be found in the [changelog](https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/blob/master/docs/site/changelog/changelog.md) of the SCION Microfrontend Platform.
  
  **For Angular applications, we strongly recommend replacing zone-specific decorators for `MessageClient` and `IntentClient` with an `ObservableDecorator`. Otherwise, you may experience performance degradation due to frequent change detection cycles.**
  
  To migrate:
  - Remove decorators for `MessageClient` and `IntentClient`, including their registration in the bean manager (e.g., `NgZoneMessageClientDecorator` and `NgZoneIntentClientDecorator`).
  - Provide a `NgZoneObservableDecorator` and register it in the bean manager before starting the platform. Note to register it as a bean, not as a decorator.
  
  ##### Example of an `ObservableDecorator` for Angular Applications
  ```ts
  export class NgZoneObservableDecorator implements ObservableDecorator {
  
    constructor(private zone: NgZone) {
    }
  
    public decorate$<T>(source$: Observable<T>): Observable<T> {
      return new Observable<T>(observer => {
        const insideAngular = NgZone.isInAngularZone();
        const subscription = source$
          .pipe(
            subscribeInside(fn => this.zone.runOutsideAngular(fn)),
            observeInside(fn => insideAngular ? this.zone.run(fn) : this.zone.runOutsideAngular(fn)),
          )
          .subscribe(observer);
        return () => subscription.unsubscribe();
      });
    }
  }
  ```
  
  ##### Example of Registering an `ObservableDecorator` in Angular Applications
  ```ts
  const zone: NgZone = ...;
  
  // Register decorator
  Beans.register(ObservableDecorator, {useValue: new NgZoneObservableDecorator(zone)});
  // Connect to the host
  zone.runOutsideAngular(() => WorkbenchClient.connect(...));
  ```



# [1.0.0-beta.14](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.13...workbench-client-1.0.0-beta.14) (2022-11-09)


### Features

* **workbench-client/router:** support named parameters in title/heading of view capability ([98f4bbd](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/98f4bbd9396480aa18d1e4fb8f339c707d48043c))



# [1.0.0-beta.13](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.12...workbench-client-1.0.0-beta.13) (2022-10-11)


### Features

* **workbench-client/popup:** add 'referrer' to popup handle to provide information about the calling context ([920d831](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/920d83192a56ef0d4e0f2dac3ceb6e4ac9d17c12))



# [1.0.0-beta.12](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.11...workbench-client-1.0.0-beta.12) (2022-10-07)


### Features

* **workbench/popup:** allow positioning of a popup relative to its contextual view or the page viewport ([484d9bd](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/484d9bd60114e7313dcce53b5641477a017da6b0)), closes [#342](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/342)
* **workbench/router:** allow setting CSS classes on a view via router and route data definition ([3d46204](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/3d4620490f2ed1e19191bf0bc2ea8d0779b03d93))



# [1.0.0-beta.11](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.10...workbench-client-1.0.0-beta.11) (2022-09-14)


### Documentation

* **workbench-client:** change example to new parameter declaration API ([e83bd74](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e83bd744abd0c9f37dd5ec3a88aeaa6f9fa98593))
 
* **workbench-client:** fix TypeDoc links ([bd4bcd7](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/bd4bcd749969065799ae42f71e7383f2f65d73c7))



# [1.0.0-beta.10](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.9...workbench-client-1.0.0-beta.10) (2022-05-20)


### Dependencies

* **workbench-client:** migrate to the framework-agnostic package `@scion/toolkit` ([38368e9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/38368e93fffb7ecf3bcf0338f6f43ee2a760de9a))


### BREAKING CHANGES

* **workbench-client:** Migrating to the framework-agnostic package `@scion/toolkit` introduced a breaking change.

  Previously, framework-agnostic and Angular-specific tools were published in the same NPM package `@scion/toolkit`, which often led to confusion and prevented framework-agnostic tools from having a release cycle independent of the Angular project. Therefore, Angular-specific tools have been moved to the NPM package `@scion/components`. Framework-agnostic tools continue to be released under `@scion/toolkit`, but now starting with version `1.0.0` instead of pre-release versions.

  To migrate:
  - Install the NPM package `@scion/toolkit` in version `1.0.0` using the following command: `npm install @scion/toolkit@latest --save`. Note that the toolkit was previously released as pre-releases of version `13.0.0` or older.
  - If you are using Angular components from the toolkit in your project, for example the `<sci-viewport>` component, please follow the migration instructions of the [SCION Toolkit Changelog](https://github.com/SchweizerischeBundesbahnen/scion-toolkit/blob/master/docs/site/changelog-components/changelog.md#migration-of-angular-specific-components-and-directives). Components of the toolkit have been moved to the NPM package `@scion/components`.



# [1.0.0-beta.9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.8...workbench-client-1.0.0-beta.9) (2022-05-02)


### Bug Fixes

* **workbench/view:** discard parameter if set to `undefined` ([b3b6a14](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/b3b6a1465c277f139bb7f2676deadab5970d5dd7)), closes [#325](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/325)
* **workbench/view:** preserve position and size of inactive views ([c0f869b](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/c0f869bf25b34c9ca249f1bca91f2c974c81a75f))


### Dependencies

* **workbench-client:** migrate @scion/workbench-client to RxJS 7.5 ([e666841](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/e666841593fafbf276cd5cb1e18c8dc3317b8929)), closes [#298](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/298)


### BREAKING CHANGES

* **workbench-client:** Migrating `@scion/workbench-client` to RxJS 7.5 introduced a breaking change.

  To migrate:
  - migrate your application to RxJS 7.5; for detailed migration instructions, refer to https://rxjs.dev/6-to-7-change-summary;
  - update @scion/toolkit to version 13; for detailed migration instructions, refer to https://github.com/SchweizerischeBundesbahnen/scion-toolkit/blob/master/CHANGELOG.md;


# [1.0.0-beta.8](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.7...workbench-client-1.0.0-beta.8) (2022-02-11)


### Code Refactoring

* **workbench/popup:** open popups from within an interceptor ([a11fd9d](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a11fd9dc96cd7265f3372ecff0723584dea7b7fd)), closes [#276](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/276)
* **workbench/view:** open views from within an interceptor ([137b8d0](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/137b8d073e5d0a9dc183cbed7451ceba852fc1e5))


### Features

* **workbench:** allow controlling which view params to persist in the URL ([dcb5ee1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/dcb5ee163ebb05b2881725e9291d36b5e2c49f07)), closes [#278](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/278)
* **workbench:** migrate to @scion/microfrontend-platform v1.0.0-beta.20 ([24dfec2](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/24dfec2251b85a1a380ee2299b26cb4452883097)), closes [SchweizerischeBundesbahnen/scion-microfrontend-platform/#96](https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/issues/96)


### BREAKING CHANGES

* **workbench:** Supporting `@scion/microfrontend-platform v1.0.0-beta.20` introduced a breaking change in the configuration of the host application and the host/client communication protocol.

  SCION Microfrontend Platform consolidated the API for configuring the platform, eliminating the different ways to configure the platform. Consequently, SCION Workbench could also simplify its API for enabling microfrontend support.

  Related issue of the SCION Microfrontend Platform: [SchweizerischeBundesbahnen/scion-microfrontend-platform/#96](https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/issues/96)

  #### Client App Migration
  - the micro application must now pass its identity (symbolic name) directly as the first argument, rather than via the options object;
  - the options object passed to `WorkbenchClient.connect` has been renamed from ` MicroApplicationConfig` to `ConnectOptions` and messaging options are now top-level options;
  - the bean `MicroApplicationConfig` has been removed; you can now obtain the application's symbolic name as following: `Beans.get<string>(APP_IDENTITY)`;

  For further instructions on how to migrate the client, refer to https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/blob/master/docs/site/changelog/changelog.md#client-app-migration

* **workbench/popup:** Opening popups from within an interceptor introduced a breaking change in the host/client communication protocol.

  The communication protocol between host and client HAS CHANGED for opening a popup. You need to update host and affected clients to the new version simultaneously. The API has not changed; the breaking change applies only to the version of @scion/workbench and @scion/workbench-client. To migrate, upgrade to @scion/workbench@12.0.0-beta.2 and @scion/workbench-client@1.0.0-beta.8, respectively.

* **workbench/view:** Opening views from within an interceptor introduced a breaking change in the host/client communication protocol.

  The communication protocol between host and client HAS CHANGED for opening a view. You need to update host and affected clients to the new version simultaneously. The API has not changed; the breaking change applies only to the version of @scion/workbench and @scion/workbench-client. To migrate, upgrade to @scion/workbench@12.0.0-beta.2 and @scion/workbench-client@1.0.0-beta.8, respectively.



# [1.0.0-beta.7](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.6...workbench-client-1.0.0-beta.7) (2021-07-09)


### chore

* compile with TypeScript strict checks enabled ([2f26260](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/2f26260b0f6e93eda8a6a6c71f102c0e60960e5f)), closes [#246](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/246)



# [1.0.0-beta.6](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.5...workbench-client-1.0.0-beta.6) (2021-04-13)


### Features

* **workbench/popup:** allow the host app to provide popup capabilities ([a4e74b1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a4e74b1430c8cc3dc8fbc9c8de90f6f1d738dab6)), closes [#270](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/270)


### BREAKING CHANGES

* **workbench/popup:** Adding support for opening a popup of the host app from within a microfrontend introduced a breaking change in the host/client
  communication protocol.

  The communication protocol between host and client HAS CHANGED for opening a popup. You need to update host and clients to the new version simultaneously. The API has not changed; the breaking change applies only to the version of `@scion/workbench` and `@scion/workbench-client`. To migrate, upgrade to `@scion/workbench@11.0.0-beta.7` and `@scion/workbench-client@1.0.0-beta.6`, respectively.



# [1.0.0-beta.5](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.4...workbench-client-1.0.0-beta.5) (2021-02-12)


### Bug Fixes

* **workbench-client/router:** provide microfrontends with the most recent view capability ([0b8f140](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0b8f140fcc87f5aa2b3672a0e939db9b2c91d993))


### Code Refactoring

* **workbench/popup:** configure contextual reference(s) via context object ([0591e7a](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/0591e7a1e0c7080888b4a697ee70995dcb9cbbfc))


### BREAKING CHANGES

* **workbench/popup:** Changed popup config for passing contextual reference(s)

  To migrate: Set a popup's view reference via `PopupConfig#context#viewId` instead of `PopupConfig#viewRef`.



# [1.0.0-beta.4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.3...workbench-client-1.0.0-beta.4) (2021-02-10)


### Features

* support for merging parameters in self navigation ([a984ace](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a984ace36cdb66e34b25f1f62fc73bb71b36308e)), closes [#259](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/259)



# [1.0.0-beta.3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.2...workbench-client-1.0.0-beta.3) (2021-02-03)


### Bug Fixes

* **workbench-client/message-box:** provide the messagebox capability under the type `messagebox` instead of `message-box` ([ad15ba1](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ad15ba1497ccac391eaa4c5ea11f83506510736e))
* **workbench-client/routing:** allow view navigation without specifying navigation extras ([4ade8a9](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/4ade8a985b0dc8e9e86e72900a25b82f897a4810))


### Features

* **workbench/microfrontend:** upgrade to @scion/microfrontend-platform@1.0.0-beta.11 ([11c2f20](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/11c2f20d00d8a73f0fa32ec738bf4378971c5648))



# [1.0.0-beta.2](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.1...workbench-client-1.0.0-beta.2) (2021-01-25)


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



# 1.0.0-beta.1 (2020-12-22)


### Features

* **workbench-client:** add project skeleton for @scion/workbench-client ([59895f4](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/59895f43e9371c214b9690edeec233ac6a72ee65))
* **workbench-client:** provide core workbench API to microfrontends ([55fabc3](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/55fabc37867b4891fb58dd73647c2acb1135d49a))


### BREAKING CHANGES

* **workbench-client:** Workbench Microfrontend support introduced the following breaking changes:

    - The workbench component is no longer positioned absolutely but in the normal document flow. To migrate, add the workbench component to your CSS layout and make sure it fills the remaining space vertically and horizontally.
    - Renamed the workbench config from `WorkbenchConfig` to `WorkbenchModuleConfig`.
    - Removed the e2e-testing related CSS classes `e2e-active` and `e2e-dirty`; to migrate, replace them with `active` and `dirty`.
    - Renamed flag to set popup closing strategy from `onGridLayoutChange` to `onLayoutChange`





[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
