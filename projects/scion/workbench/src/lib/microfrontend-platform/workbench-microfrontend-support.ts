import { MicrofrontendPlatformConfigLoader } from './microfrontend-platform-config-loader';
import { Injectable, Provider } from '@angular/core';
import { MICROFRONTEND_PLATFORM_PRE_ACTIVATION, MicrofrontendPlatformInitializerService } from './initialization/microfrontend-platform-initializer.service';
import { IntentClient, ManifestService, MessageClient, MicroApplicationConfig, OutletRouter, PlatformConfig, PlatformPropertyService } from '@scion/microfrontend-platform';
import { WorkbenchInitializer } from '../startup/workbench-initializer';
import { Beans } from '@scion/toolkit/bean-manager';
import { WorkbenchRouter } from '@scion/workbench-client';
import { MicrofrontendWorkbenchRouter } from './routing/microfrontend-workbench-router.service';
import { NgZoneIntentClientDecorator, NgZoneMessageClientDecorator } from './initialization/ng-zone-decorators';
import { WorkbenchModuleConfig } from '../workbench-module-config';
import { LogDelegate } from './initialization/log-delegate.service';
import { MicrofrontendViewCommandHandler } from './microfrontend-view/microfrontend-view-command-handler.service';

/**
 * Registers a set of DI providers to set up microfrontend support in the workbench.
 */
export function provideWorkbenchMicrofrontendSupport(workbenchModuleConfig: WorkbenchModuleConfig): Provider[] {
  // Angular is very strict when compiling module definitions ahead-of-time (if enabled the AOT compilation).
  // - use ES5 function instead of arrow function to specify the factory
  // - export functions referenced in module metadata definition
  // - use ternary check to conditionally provide a provider
  return [
    workbenchModuleConfig.microfrontends ? [
      {
        provide: WorkbenchInitializer,
        useClass: MicrofrontendPlatformInitializerService,
        multi: true,
      },
      {
        provide: MICROFRONTEND_PLATFORM_PRE_ACTIVATION,
        useExisting: MicrofrontendViewCommandHandler,
        multi: true,
      },
      {
        provide: MICROFRONTEND_PLATFORM_PRE_ACTIVATION,
        useExisting: MicrofrontendWorkbenchRouter,
        multi: true,
      },
      {
        provide: MicrofrontendPlatformConfigLoader,
        useClass: typeof workbenchModuleConfig.microfrontends.platform === 'function' ? workbenchModuleConfig.microfrontends.platform : MicrofrontendPlatformModuleConfigLoader,
      },
      LogDelegate,
      WorkbenchRouter,
      MicrofrontendWorkbenchRouter,
      MicrofrontendViewCommandHandler,
      NgZoneMessageClientDecorator,
      NgZoneIntentClientDecorator,
      provideMicrofrontendPlatformBeans(),
    ] : [],
  ];
}

/**
 * Provides the microfrontend platform config as passed to `WorkenchModule.forRoot({...})`.
 */
@Injectable()
class MicrofrontendPlatformModuleConfigLoader implements MicrofrontendPlatformConfigLoader {

  constructor(private _workbenchModuleConfig: WorkbenchModuleConfig) {
  }

  public load(): Promise<PlatformConfig> {
    return Promise.resolve(this._workbenchModuleConfig.microfrontends.platform as PlatformConfig);
  }
}

/**
 * Provides beans of SCION Microfrontend Platform for DI.
 */
function provideMicrofrontendPlatformBeans(): Provider[] {
  return [
    {provide: MicroApplicationConfig, useFactory: () => Beans.get(MicroApplicationConfig)},
    {provide: MessageClient, useFactory: () => Beans.get(MessageClient)},
    {provide: IntentClient, useFactory: () => Beans.get(IntentClient)},
    {provide: OutletRouter, useFactory: () => Beans.get(OutletRouter)},
    {provide: ManifestService, useFactory: () => Beans.get(ManifestService)},
    {provide: PlatformPropertyService, useFactory: () => Beans.get(PlatformPropertyService)},
  ];
}

