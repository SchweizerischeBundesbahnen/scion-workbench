/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { ManifestCollector } from './manifest-collector.service';
import { ManifestRegistry } from './manifest-registry.service';
import { HttpClientModule } from '@angular/common/http';
import { ApplicationRegistry } from './application-registry.service';
import { Logger } from './logger.service';
import { MessageBus } from './message-bus.service';
import { IntentHandlerRegistrator } from './intent-handler-registrator.service';
import { AppOutletDirective } from './app-outlet.directive';

/**
 * Core functionality of workbench application platform.
 */
@NgModule({
  declarations: [
    AppOutletDirective,
  ],
  imports: [
    HttpClientModule,
  ],
  exports: [
    AppOutletDirective,
  ],
  providers: [
    Logger,
    ManifestCollector,
    ApplicationRegistry,
    ManifestRegistry,
    MessageBus,
    IntentHandlerRegistrator,
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: provideModuleInitializerFn,
      deps: [Injector, Logger]
    }
  ],
})
export class CoreModule {
}

export function provideModuleInitializerFn(injector: Injector, logger: Logger): () => Promise<void> {
  // use injector because Angular Router cannot be injected in `APP_INITIALIZER` function
  // do not return the function directly to not break the AOT build (add redundant assignment)
  const fn = (): Promise<void> => {
    return injector.get(ManifestCollector).collectAndRegister()
      .then(() => injector.get(IntentHandlerRegistrator).initializeHandlers())
      .catch(error => logger.error('Workbench Application Platform failed to initialize', error));
  };
  return fn;
}
