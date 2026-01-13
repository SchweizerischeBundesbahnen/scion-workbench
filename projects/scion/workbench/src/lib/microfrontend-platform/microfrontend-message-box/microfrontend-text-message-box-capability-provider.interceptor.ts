import {Injectable} from '@angular/core';
import {HostManifestInterceptor, Manifest} from '@scion/microfrontend-platform';
import {eMESSAGE_BOX_MESSAGE_PARAM, WorkbenchCapabilities, WorkbenchMessageBoxCapability} from '@scion/workbench-client';
import {TEXT_MESSAGE_BOX_CAPABILITY_IDENTITY, TEXT_MESSAGE_BOX_CAPABILITY_IDENTITY_PROPERTY} from '../microfrontend-host-message-box/text-message/text-message.component';

/**
 * Adds the built-in {@link WorkbenchMessageBoxCapability} to the host manifest.
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendTextMessageBoxCapabilityProvider implements HostManifestInterceptor {

  public intercept(hostManifest: Manifest): void {
    hostManifest.capabilities = [
      ...hostManifest.capabilities ?? [],
      {
        type: WorkbenchCapabilities.MessageBox,
        qualifier: {},
        params: [
          {
            name: eMESSAGE_BOX_MESSAGE_PARAM,
            required: false,
            description: 'Text to display in the message box.',
          },
        ],
        properties: {
          path: '',
          [TEXT_MESSAGE_BOX_CAPABILITY_IDENTITY_PROPERTY]: TEXT_MESSAGE_BOX_CAPABILITY_IDENTITY,
        },
        private: false,
        description: 'Displays a text message.',
      } satisfies WorkbenchMessageBoxCapability,
    ];
  }
}
