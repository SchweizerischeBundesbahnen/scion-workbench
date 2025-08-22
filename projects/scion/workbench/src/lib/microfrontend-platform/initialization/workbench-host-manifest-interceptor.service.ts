import {Injectable} from '@angular/core';
import {HostManifestInterceptor, Intention, Manifest} from '@scion/microfrontend-platform';
import {eMESSAGE_BOX_MESSAGE_PARAM, WorkbenchCapabilities, WorkbenchMessageBoxCapability, WorkbenchNotificationCapability} from '@scion/workbench-client';
import {TEXT_MESSAGE_BOX_CAPABILITY_IDENTITY, TEXT_MESSAGE_BOX_CAPABILITY_IDENTITY_PROPERTY, TEXT_MESSAGE_BOX_CAPABILITY_ROUTE} from '../microfrontend-host-message-box/text-message/text-message.component';

/**
 * Intercepts the host manifest, registering workbench-specific intentions and capabilities.
 *
 * @internal
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class WorkbenchHostManifestInterceptor implements HostManifestInterceptor {

  public intercept(hostManifest: Manifest): void {
    hostManifest.intentions = [
      ...hostManifest.intentions ?? [],
      providePerspectiveIntention(),
      provideViewIntention(),
      provideTextProviderIntention(),
    ];
    hostManifest.capabilities = [
      ...hostManifest.capabilities ?? [],
      provideBuiltInTextMessageBoxCapability(),
      provideBuiltInTextNotificationCapability(),
    ];
  }
}

/**
 * Provides a wildcard perspective intention for the workbench to register perspective capabilities as workbench perspectives.
 */
function providePerspectiveIntention(): Intention {
  return {
    type: WorkbenchCapabilities.Perspective,
    qualifier: {'*': '*'},
  };
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
 * Provides a wildcard intention for the workbench to request texts from any application.
 */
export function provideTextProviderIntention(): Intention {
  return {
    type: WorkbenchCapabilities.TextProvider,
    qualifier: {provider: '*'},
  };
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
    private: false,
    description: 'Displays a text notification to the user.',
  };
}

/**
 * Provides the built-in {@link WorkbenchMessageBoxCapability} to display text.
 *
 * @see MicrofrontendMessageBoxIntentHandler
 */
function provideBuiltInTextMessageBoxCapability(): WorkbenchMessageBoxCapability {
  return {
    type: WorkbenchCapabilities.MessageBox,
    qualifier: {},
    params: [
      {
        name: eMESSAGE_BOX_MESSAGE_PARAM,
        required: false,
        description: 'Text to display to the user.',
      }],
    properties: {
      path: TEXT_MESSAGE_BOX_CAPABILITY_ROUTE,
      [TEXT_MESSAGE_BOX_CAPABILITY_IDENTITY_PROPERTY]: TEXT_MESSAGE_BOX_CAPABILITY_IDENTITY,
    },
    private: false,
    description: 'Displays a text message to the user.',
  };
}
