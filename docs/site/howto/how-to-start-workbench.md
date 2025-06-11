<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
|-----------------|---------------------------------------------|-----------------------------|-----------------------------------|-------------------------------|

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Startup

### How to Start the SCION Workbench

The SCION Workbench starts automatically when the `<wb-workbench>` component is added to the DOM. Alternatively, the workbench can be
started manually using the `WorkbenchLauncher`, such as in an app initializer or a route guard.

Example of starting the workbench in an app initializer:

```ts
import {provideWorkbench, WorkbenchLauncher} from '@scion/workbench';
import {bootstrapApplication} from '@angular/platform-browser';
import {inject, provideAppInitializer} from '@angular/core';

bootstrapApplication(App, {
  providers: [
    provideWorkbench(),
    provideAppInitializer(() => inject(WorkbenchLauncher).launch())
  ]
});
```

> [!NOTE]
> Starting the workbench in an app initializer will block Angular's app startup until the workbench is ready.

#### Startup Progress
The application can inject `WorkbenchStartup` to check if the workbench has completed startup.

```ts
import {WorkbenchStartup} from '@scion/workbench';
import {inject} from '@angular/core';

inject(WorkbenchStartup).done();
```

#### Splash
The workbench component displays a splash during startup. The default splash shows a loading indicator (ellipsis throbber).

The default splash can be replaced via config object passed to the `provideWorkbench()` function.

```ts
import {provideWorkbench} from '@scion/workbench';
import {bootstrapApplication} from '@angular/platform-browser';
import {Component} from '@angular/core';

bootstrapApplication(App, {
  providers: [
    provideWorkbench({
      splashComponent: CustomSplashComponent
    })
  ],
});

@Component({
  selector: 'app-splash',
  template: 'Loading...',
})
export class CustomSplashComponent {
}
```

#### Startup Hooks
The application can hook into the startup process of the SCION Workbench by providing one or more initializers to the `provideWorkbenchInitializer()` function.
Initializers execute at defined points during startup, enabling the application's controlled initialization.

```ts
import {provideWorkbench, provideWorkbenchInitializer} from '@scion/workbench';
import {bootstrapApplication} from '@angular/platform-browser';
import {inject} from '@angular/core';

bootstrapApplication(App, {
  providers: [
    provideWorkbench(),
    provideWorkbenchInitializer(() => inject(SomeService).init()),
  ],
});
```

Initializers can be synchronous or asynchronous. The workbench is fully started once all initializers have completed.

Initializers can specify a phase for execution: `PreStartup`, `Startup`, `PostStartup`. Initializers in lower phases execute before initializers in higher phases.
Initializers in the same phase may execute in parallel. If no phase is specified, the initializer executes in the `Startup` phase.

```ts
import {provideWorkbench, provideWorkbenchInitializer, WorkbenchStartupPhase} from '@scion/workbench';
import {bootstrapApplication} from '@angular/platform-browser';
import {inject} from '@angular/core';

bootstrapApplication(App, {
  providers: [
    provideWorkbench(),
    provideWorkbenchInitializer(() => inject(SomeService).init(), {phase: WorkbenchStartupPhase.PostStartup}),
  ],
});
```

[menu-how-to]: /docs/site/howto/how-to.md
[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
