<a href="/docs/site/application-platform/README.md"><img src="/docs/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench Application Platform"></a>

| SCION Workbench Application Platform | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench Application Platform][menu-home] > [How To Guides][menu-how-to] > Platform

#### How to interact with the platform

To interact with the platform, the application must install `workbench-application.core` or `workbench-application.angular` module.

##### For Angular applications
For Angular applications, install `workbench-application.angular` module which provides a convenience API for Angular applications. Internally, it depends on `workbench-application.core`

###### 1. Install `@scion/workbench-application.angular`.

Use NPM command-line tool to install `@scion/workbench-application.angular` as follows:

```
npm install --save @scion/workbench-application.angular
```

###### 2. Import 'WorkbenchApplicationModule'

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

###### 3. Interact with the platform
To interact with the platform, inject respective platform service or workbench handle. Some functionality is also available in the form of an Angular directive.

See the other how-to's for more detailed instructions.

##### For Non-Angular applications
For non Angular applications, install `workbench-application.core` module. 

###### 1. Install `@scion/workbench-application.core`.

Use NPM command-line tool to install `@scion/workbench-application.core` as follows:

```
npm install --save @scion/workbench-application.core rxjs
```
> Workbench Application requires RxJS (Reactive Extensions for JavaScript) as its peer dependency to be installed. By using the above command, it is installed as well.

###### 2. Start the platform

When the application loads, start the platform to allow interacting with the platform.

```typescript
PlatformActivator.start();
```

The platform is stopped automatically when the application unloads.

###### 3. Interact with the platform

Use the global Platform object to obtain respective service reference, e.g.:

```typescript 
Platform.getService(RouterService).navigate(...);
```

To query if an application is running standalone or inside the platform, call the following function:

```typescript 
Platform.isRunningStandalone();
```

See the other how-to's for more detailed instructions.

##### Main platform services to interact with the platform

|Service|Explanation|
|-|-|
|RouterService|Allows view navigation|
|ViewService|Allows interaction with views.|
|PopupService|Use to open popups and to interact with popups.|
|ActivityService|Allows interaction with activities.|
|MessageBoxService|Use to display message boxes.|
|NotificationService|Use to show notifications.|

[menu-how-to]: /docs/site/application-platform/howto/how-to.md

[menu-home]: /docs/site/application-platform/README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
