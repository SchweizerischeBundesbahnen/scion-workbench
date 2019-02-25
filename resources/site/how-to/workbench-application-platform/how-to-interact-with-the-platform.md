![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to interact with the platform

To interact with the platform, the application must install `workbench-application.core` or `workbench-application.angular` module.

### For Angular applications
For Angular applications, install `workbench-application.angular` module which provides a convenience API for Angular applications. Internally, it depends on `workbench-application.core`

#### 1. Install `@scion/workbench-application.angular`.

Use NPM command-line tool to install `@scion/workbench-application.angular` as follows:

```
npm install --save @scion/workbench-application.angular
```

#### 2. Import 'WorkbenchApplicationModule'

Open `app.module.ts` and import `WorkbenchApplicationModule` as follows:

```typescript
@NgModule({
  imports: [
    ...
    WorkbenchApplicationModule.forRoot(), ➀
  ]
})
export class AppModule {
}
```

|#|Explanation|
|-|-|
|➀|Imports `SCION Workbench Application` module for Angular. When providing a config object, you can configure some aspects of the app, like the focus handling.

#### 3. Interact with the platform
To interact with the platform, inject respective platform service or workbench handle. Some functionality is also available in the form of an Angular directive.

See the other how-to's for more detailed instructions.

### For Non-Angular applications
For non Angular applications, install `workbench-application.core` module. 

#### 1. Install `@scion/workbench-application.core`.

Use NPM command-line tool to install `@scion/workbench-application.core` as follows:

```
npm install --save @scion/workbench-application.core rxjs
```
> Workbench Application requires RxJS (Reactive Extensions for JavaScript) as its peer dependency to be installed. By using the above command, it is installed as well.

#### 2. Start the platform

When the application loads, start the platform to allow interacting with the platform.

```typescript
PlatformActivator.start();
```

The platform is stopped automatically when the application unloads.

#### 3. Interact with the platform

Use the global Platform object to obtain respective service reference, e.g.:

```typescript 
Platform.getService(RouterService).navigate(...);
```

See the other how-to's for more detailed instructions.

### Main platform services to interact with the platform

|Service|Explanation|
|-|-|
|RouterService|Allows view navigation|
|ViewService|Allows interaction with views.|
|PopupService|Use to open popups and to interact with popups.|
|ActivityService|Allows interaction with activities.|
|MessageBoxService|Use to display message boxes.|
|NotificationService|Use to show notifications.|

[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md
