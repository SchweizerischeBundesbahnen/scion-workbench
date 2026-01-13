import {EnvironmentProviders, inject, makeEnvironmentProviders} from '@angular/core';
import {provideMicrofrontendPlatformInitializer} from '@scion/workbench';
import {WorkbenchCapabilities, ɵWorkbenchNotificationCommand} from '@scion/workbench-client';
import {IntentClient} from '@scion/microfrontend-platform';

/**
 * Installs an intent handler that logs host notification intents.
 */
function installHostNotificationIntentHandler(): void {
  inject(IntentClient).onIntent<ɵWorkbenchNotificationCommand, void>({type: WorkbenchCapabilities.Notification, qualifier: {component: 'notification', app: 'host'}}, request => {
    const command: ɵWorkbenchNotificationCommand = request.body!;
    const params = Array.from(request.intent.params?.entries() ?? []).map(([key, value]) => `${key}=${value}`).join(',');
    console.info(`[HostNotification] command=[title=${command.title}, severity=${command.severity}, duration=${command.duration}, group=${command.group}, cssClass=${command.cssClass}, params=[${params}]]`);
  });
}

/**
 * Provides a set of DI providers installing an intent handler for host notification intents.
 */
export function provideHostNotificationIntentHandler(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideMicrofrontendPlatformInitializer(() => installHostNotificationIntentHandler()),
  ]);
}
