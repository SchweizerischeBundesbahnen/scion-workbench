import { Injectable, Provider } from '@angular/core';
import { MicrofrontendNotificationProvider } from '@scion/workbench';
import { InspectNotificationComponent } from './inspect-notification.component';
import { WorkbenchStartupQueryParams } from '../workbench/workbench-startup-query-params';

/**
 * Allows inspecting a notification.
 */
@Injectable()
export class InspectNotificationProvider implements MicrofrontendNotificationProvider {
  public qualifier = {component: 'inspector'};
  public component = InspectNotificationComponent;
  public description = 'Allows inspecting a notification.';
  public requiredParams = ['param1'];
  public optionalParams = ['param2'];
  public groupInputReduceFn = addNotificationCount;
}

/**
 * Provides a {@link MicrofrontendNotificationProvider} to inspect a notification.
 *
 * Returns an empty provider array if microfrontend support is disabled.
 */
export function provideInspectNotificationProvider(): Provider[] {
  if (WorkbenchStartupQueryParams.standalone()) {
    return [];
  }

  return [
    {
      provide: MicrofrontendNotificationProvider,
      useClass: InspectNotificationProvider,
      multi: true,
    },
  ];
}

function addNotificationCount(prevInput: Map<string, any>, currInput: Map<string, any>): Map<string, any> {
  const count = prevInput.get('count') ?? 1;
  return new Map(currInput).set('count', count + 1);
}
