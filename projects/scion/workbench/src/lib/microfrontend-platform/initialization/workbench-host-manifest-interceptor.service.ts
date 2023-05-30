import {Injectable} from '@angular/core';
import {HostManifestInterceptor, Intention, Manifest} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities, WorkbenchMessageBoxCapability, WorkbenchNotificationCapability} from '@scion/workbench-client';

/**
 * Intercepts the host manifest, registering workbench-specific intentions and capabilities.
 *
 * @internal
 */
@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class WorkbenchHostManifestInterceptor implements HostManifestInterceptor {

  public intercept(hostManifest: Manifest): void {
    hostManifest.intentions = [
      ...hostManifest.intentions || [],
      provideViewIntention(),
    ];
    hostManifest.capabilities = [
      ...hostManifest.capabilities || [],
      provideBuiltInMessageBoxCapability(),
      provideBuiltInNotificationCapability(),
    ];
  }
}

/**
 * Provides a wildcard view intention for the workbench to read view capabilities during microfrontend view routing.
 */
function provideViewIntention(): Intention {
  return {
    type: WorkbenchCapabilities.View,
    qualifier: {'*': '*'},
  };
}

/**
 * Provides the built-in notification capability.
 *
 * @see MicrofrontendNotificationIntentHandler
 */
function provideBuiltInNotificationCapability(): WorkbenchNotificationCapability {
  return {
    type: WorkbenchCapabilities.Notification,
    qualifier: {},
    private: false,
    description: 'Allows displaying a simple notification to the user.',
  };
}

/**
 * Provides the built-in message box capability.
 *
 * @see MicrofrontendMessageBoxIntentHandler
 */
function provideBuiltInMessageBoxCapability(): WorkbenchMessageBoxCapability {
  return {
    type: WorkbenchCapabilities.MessageBox,
    qualifier: {},
    private: false,
    description: 'Allows displaying a simple message to the user.',
  };
}
