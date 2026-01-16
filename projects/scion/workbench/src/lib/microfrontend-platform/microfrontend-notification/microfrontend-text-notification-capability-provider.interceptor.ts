import {Injectable} from '@angular/core';
import {HostManifestInterceptor, Manifest} from '@scion/microfrontend-platform';
import {eNOTIFICATION_MESSAGE_PARAM, WorkbenchCapabilities, WorkbenchNotificationCapability} from '@scion/workbench-client';

/**
 * Intercepts the host manifest, registering the built-in text notification capability.
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendTextNotificationCapabilityProvider implements HostManifestInterceptor {

  public intercept(hostManifest: Manifest): void {
    hostManifest.capabilities = [
      ...hostManifest.capabilities ?? [],
      provideBuiltInTextNotificationCapability(),
    ];
  }
}

/**
 * Provides the built-in notification capability to display text.
 *
 * @see MicrofrontendNotificationIntentHandler
 */
function provideBuiltInTextNotificationCapability(): WorkbenchNotificationCapability {
  return {
    type: WorkbenchCapabilities.Notification,
    qualifier: {},
    params: [
      {
        name: eNOTIFICATION_MESSAGE_PARAM,
        required: false,
        description: 'Text to display in the notification.',
      },
    ],
    properties: {
      path: '',
    },
    private: false,
    description: 'Displays a text notification.',
  };
}
