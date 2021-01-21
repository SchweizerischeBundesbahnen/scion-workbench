import { Injectable, Provider } from '@angular/core';
import { MicrofrontendMessageBoxProvider } from '@scion/workbench';
import { InspectMessageBoxComponent } from './inspect-message-box.component';
import { WorkbenchStartupQueryParams } from '../workbench/workbench-startup-query-params';

/**
 * Allows inspecting a message box.
 */
@Injectable()
export class InspectMessageBoxProvider implements MicrofrontendMessageBoxProvider {
  public qualifier = {component: 'inspector'};
  public component = InspectMessageBoxComponent;
  public requiredParams = ['param1'];
  public optionalParams = ['param2'];
  public description = 'Allows inspecting a message box.';
}

/**
 * Provides a {@link MicrofrontendMessageBoxProvider} to inspect a message box.
 *
 * Returns an empty provider array if microfrontend support is disabled.
 */
export function provideInspectMessageBoxProvider(): Provider[] {
  if (WorkbenchStartupQueryParams.standalone()) {
    return [];
  }

  return [
    {
      provide: MicrofrontendMessageBoxProvider,
      useClass: InspectMessageBoxProvider,
      multi: true,
    },
  ];
}
