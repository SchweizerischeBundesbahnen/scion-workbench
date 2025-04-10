import {EnvironmentProviders, inject, makeEnvironmentProviders} from '@angular/core';
import {NotificationService, provideMicrofrontendPlatformInitializer} from '@scion/workbench';
import {WorkbenchCapabilities, WorkbenchNotificationConfig} from '@scion/workbench-client';
import {IntentClient} from '@scion/microfrontend-platform';
import {Maps} from '@scion/toolkit/util';
import {NotificationPageComponent} from './notification-page.component';

/**
 * Installs an intent handler to show the {@link NotificationPageComponent} in a workbench notification.
 */
function installCustomNotificationIntentHandler(): void {
  const intentClient = inject(IntentClient);
  const notificationService = inject(NotificationService);

  intentClient.onIntent<WorkbenchNotificationConfig, void>({type: WorkbenchCapabilities.Notification, qualifier: {component: 'notification-page'}}, request => {
    const config: WorkbenchNotificationConfig = request.body!;

    notificationService.notify({
      ...config,
      content: NotificationPageComponent,
      componentInput: new Map([
        ...request.headers,
        ...request.intent.params ?? [],
        ...Maps.coerce(request.intent.qualifier),
        ['$implicit', config.content],
      ]),
      groupInputReduceFn: addNotificationCount,
    });
  });
}

function addNotificationCount(prevInput: Map<string, number>, currInput: Map<string, number>): Map<string, number> {
  const count = prevInput.get('count') ?? 1;
  return new Map(currInput).set('count', count + 1);
}

/**
 * Provides a set of DI providers installing an intent handler to show custom notifications.
 */
export function provideCustomNotificationIntentHandler(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideMicrofrontendPlatformInitializer(() => installCustomNotificationIntentHandler()),
  ]);
}
