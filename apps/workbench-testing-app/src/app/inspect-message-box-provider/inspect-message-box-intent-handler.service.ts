import { Injectable } from '@angular/core';
import { MessageBoxService } from '@scion/workbench';
import { InspectMessageBoxComponent } from './inspect-message-box.component';
import { WorkbenchCapabilities, WorkbenchMessageBoxConfig } from '@scion/workbench-client';
import { IntentClient } from '@scion/microfrontend-platform';
import { Maps } from '@scion/toolkit/util';

/**
 * Displays a custom message box for microfrontends to inspect message box properties.
 */
@Injectable()
export class InspectMessageBoxIntentHandler {

  constructor(intentClient: IntentClient, messageBoxService: MessageBoxService) {
    intentClient.onIntent<WorkbenchMessageBoxConfig, string>({type: WorkbenchCapabilities.MessageBox, qualifier: {component: 'inspector'}}, request => {
      const config: WorkbenchMessageBoxConfig = request.body;
      return messageBoxService.open({
        ...config,
        content: InspectMessageBoxComponent,
        componentInput: new Map([
          ...request.headers,
          ...request.intent.params,
          ...Maps.coerce(request.intent.qualifier),
          ['$implicit', config.content],
        ]),
      });
    });
  }
}
