import {Injectable} from '@angular/core';
import {NotificationService} from '@scion/workbench';
import {WorkbenchCapabilities, WorkbenchMessageBoxConfig, WorkbenchNotificationConfig} from '@scion/workbench-client';
import {IntentClient} from '@scion/microfrontend-platform';
import {Maps} from '@scion/toolkit/util';
import {InspectNotificationComponent} from './inspect-notification.component';

/**
 * Displays a custom notification for microfrontends to inspect notification properties.
 */
@Injectable()
export class InspectNotificationIntentHandler {

  constructor(intentClient: IntentClient, notificationService: NotificationService) {
    intentClient.onIntent<WorkbenchMessageBoxConfig, void>({type: WorkbenchCapabilities.Notification, qualifier: {component: 'inspector'}}, request => {
      const config: WorkbenchNotificationConfig = request.body;

      notificationService.notify({
        ...config,
        content: InspectNotificationComponent,
        componentInput: new Map([
          ...request.headers,
          ...request.intent.params,
          ...Maps.coerce(request.intent.qualifier),
          ['$implicit', config.content],
        ]),
        groupInputReduceFn: addNotificationCount,
      });
    });
  }
}

function addNotificationCount(prevInput: Map<string, any>, currInput: Map<string, any>): Map<string, any> {
  const count = prevInput.get('count') ?? 1;
  return new Map(currInput).set('count', count + 1);
}
