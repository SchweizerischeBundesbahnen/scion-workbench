import {EnvironmentProviders, InjectionToken, Injector, makeEnvironmentProviders, runInInjectionContext} from '@angular/core';

/**
 * Registers a function executed during the startup of the SCION Workbench Client.
 *
 * Initializers help to run initialization tasks (synchronous or asynchronous) during the startup of the SCION Workbench Client.
 * The client is fully started once all initializers have completed.
 *
 * Initializers can specify a phase for execution. Initializers in lower phases execute before initializers in higher phases.
 * Initializers in the same phase may execute in parallel. If no phase is specified, the initializer executes in the `PostConnect` phase.
 *
 * Available phases, in order of execution:
 * - {@link WorkbenchClientStartupPhase.PreConnect}
 * - {@link WorkbenchClientStartupPhase.PostConnect}
 *
 * The function can call `inject` to get any required dependencies.
 *
 * @param initializerFn - Specifies the function to execute.
 * @param options - Controls execution of the function.
 * @return A set of dependency-injection providers to be registered in Angular.
 */
export function provideWorkbenchClientInitializer(initializerFn: WorkbenchClientInitializerFn, options?: WorkbenchClientInitializerOptions): EnvironmentProviders {
  const token = WORKBENCH_CLIENT_STARTUP_TOKENS.get(options?.phase ?? WorkbenchClientStartupPhase.PostConnect);
  return makeEnvironmentProviders([{
    provide: token,
    useValue: initializerFn,
    multi: true,
  }]);
}

/**
 * Runs initializers associated with the given startup phase. Initializer functions can call `inject` to get required dependencies.
 */
export async function runWorkbenchClientInitializers(phase: WorkbenchClientStartupPhase, injector: Injector): Promise<void> {
  const token = WORKBENCH_CLIENT_STARTUP_TOKENS.get(phase)!;
  const initializers = injector.get<WorkbenchClientInitializerFn[]>(token, [], {optional: true});
  if (!initializers.length) {
    return;
  }

  // Run and await initializer functions in parallel.
  await Promise.all(initializers.map(initializer => runInInjectionContext(injector, initializer))); // eslint-disable-line @typescript-eslint/await-thenable
}

/**
 * The signature of a function executed during the startup of the SCION Workbench Client.
 *
 * Initializers help to run initialization tasks (synchronous or asynchronous) during the startup of the SCION Workbench Client.
 * The client is fully started once all initializers have completed. The function can call `inject` to get any required dependencies.
 *
 * Initializers are registered using the `provideWorkbenchClientInitializer()` function and can specify a phase for execution.
 *
 * ### Example:
 *
 * ```ts
 * import {bootstrapApplication} from '@angular/platform-browser';
 * import {inject} from '@angular/core';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideWorkbenchClientInitializer(() => inject(SomeService).init()),
 *   ],
 * });
 * ```
 * @see provideWorkbenchClientInitializer
 */
export type WorkbenchClientInitializerFn = () => void | Promise<void>;

/**
 * Controls the execution of an initializer function during the startup of the SCION Workbench Client.
 */
export interface WorkbenchClientInitializerOptions {
  /**
   * Controls in which phase to execute the initializer. Defauls to {@link WorkbenchClientStartupPhase.PostConnect}.
   */
  phase?: WorkbenchClientStartupPhase;
}

/**
 * Enumeration of phases for running a {@link WorkbenchClientInitializerFn} function during the startup of the SCION Workbench Client.
 *
 * Functions associated with the same phase may run in parallel. Defaults to {@link PostConnect} phase.
 */
export enum WorkbenchClientStartupPhase {
  /**
   * Use to run an initializer before connecting to the workbench host.
   */
  PreConnect = 0,
  /**
   * Use to run an initializer after connected to the workbench host.
   */
  PostConnect = 1,
}

/**
 * DI tokens called at specific times during the startup of the SCION Workbench Client.
 */
const WORKBENCH_CLIENT_STARTUP_TOKENS = new Map<WorkbenchClientStartupPhase, InjectionToken<WorkbenchClientInitializerFn>>()
  .set(WorkbenchClientStartupPhase.PreConnect, new InjectionToken<WorkbenchClientInitializerFn>('WORKBENCH_CLIENT_PRE_CONNECT'))
  .set(WorkbenchClientStartupPhase.PostConnect, new InjectionToken<WorkbenchClientInitializerFn>('WORKBENCH_CLIENT_POST_CONNECT'));
