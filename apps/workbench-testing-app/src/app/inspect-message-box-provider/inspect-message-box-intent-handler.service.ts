import {EnvironmentProviders, Injectable, makeEnvironmentProviders} from '@angular/core';
import {MessageBoxService, MICROFRONTEND_PLATFORM_POST_STARTUP} from '@scion/workbench';
import {InspectMessageBoxComponent} from './inspect-message-box.component';
import {WorkbenchCapabilities, WorkbenchMessageBoxConfig} from '@scion/workbench-client';
import {IntentClient} from '@scion/microfrontend-platform';
import {Maps} from '@scion/toolkit/util';

/**
 * Displays a custom message box for microfrontends to inspect message box properties.
 */
@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as registered via workbench startup hook. */)
class InspectMessageBoxIntentHandler {

  constructor(intentClient: IntentClient, messageBoxService: MessageBoxService) {
    intentClient.onIntent<WorkbenchMessageBoxConfig, string>({type: WorkbenchCapabilities.MessageBox, qualifier: {component: 'inspector'}}, request => {
      const config: WorkbenchMessageBoxConfig = request.body!;
      return messageBoxService.open({
        ...config,
        content: InspectMessageBoxComponent,
        componentInput: new Map([
          ...request.headers,
          ...request.intent.params ?? [],
          ...Maps.coerce(request.intent.qualifier),
          ['$implicit', config.content],
        ]),
      });
    });
  }
}

/**
 * Provides a set of DI providers to provide a custom message box capability for inspecting message box properties.
 */
export function provideMessageBoxInspector(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: MICROFRONTEND_PLATFORM_POST_STARTUP,
      useClass: InspectMessageBoxIntentHandler,
      multi: true,
    },
  ]);
}
