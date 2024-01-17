import {EnvironmentProviders, Injectable, makeEnvironmentProviders} from '@angular/core';
import {MICROFRONTEND_PLATFORM_POST_STARTUP, WorkbenchMessageBoxService} from '@scion/workbench';
import {WorkbenchCapabilities, WorkbenchMessageBoxConfig} from '@scion/workbench-client';
import {IntentClient} from '@scion/microfrontend-platform';
import {InspectMessageBoxComponent} from './inspect-message-box.component';

/**
 * Displays a custom message box for microfrontends to inspect message box properties.
 */
@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as registered via workbench startup hook. */)
class InspectMessageBoxIntentHandler {

  constructor(intentClient: IntentClient, messageBoxService: WorkbenchMessageBoxService) {
    intentClient.onIntent<WorkbenchMessageBoxConfig, string>({type: WorkbenchCapabilities.MessageBox, qualifier: {component: 'inspector'}}, request => {
      const config: WorkbenchMessageBoxConfig = request.body!;
      const params = request.intent.params!;
      return messageBoxService.open(InspectMessageBoxComponent, {
        ...config,
        inputs: {
          input: config.content,
          param1: params.get('param1'),
          param2: params.get('param2'),
        },
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
