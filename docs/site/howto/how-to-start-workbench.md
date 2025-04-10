<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
|-----------------|---------------------------------------------|-----------------------------|-----------------------------------|-------------------------------|

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > Startup

### How to Start the SCION Workbench

Depending on the configured startup strategy, the SCION Workbench starts during application bootstrapping or when the `<wb-workbench>` component is added to the DOM.

#### Startup Strategy
The workbench supports two startup strategies:

- **LAZY** (default)\
  Starts the workbench when the `<wb-workbench>` component is added to the DOM or manually via `WorkbenchLauncher.launch()`, e.g., from a route guard or app initializer.
- **APP_INITIALIZER**\
  Starts the workbench during application bootstrapping, blocking Angular's app startup until the workbench is ready. No splash is displayed.

The startup strategy can be configured via config object passed to the `provideWorkbench()` function.

```ts
import {provideWorkbench} from '@scion/workbench';
import {bootstrapApplication} from '@angular/platform-browser';

bootstrapApplication(AppComponent, {
  providers: [
    provideWorkbench({
      startup: {launcher: 'APP_INITIALIZER'},
    })
  ]
});
```

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

bootstrapApplication(AppComponent, {
  providers: [
    provideWorkbench({
      startup: {splash: CustomSplashComponent}
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

bootstrapApplication(AppComponent, {
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

bootstrapApplication(AppComponent, {
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
