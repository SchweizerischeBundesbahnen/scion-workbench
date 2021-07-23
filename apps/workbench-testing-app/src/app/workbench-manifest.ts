import {ApplicationManifest} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities} from '@scion/workbench-client';

/**
 * Represents the manifest of the Workbench Host App.
 */
export const workbenchManifest: ApplicationManifest = {
  name: 'Workbench Host App',
  capabilities: [
    {
      type: WorkbenchCapabilities.MessageBox,
      qualifier: {component: 'inspector'},
      private: false,
      requiredParams: ['param1'],
      optionalParams: ['param2'],
      description: 'Allows inspecting a message box.',
    },
    {
      type: WorkbenchCapabilities.Notification,
      qualifier: {component: 'inspector'},
      private: false,
      requiredParams: ['param1'],
      optionalParams: ['param2'],
      description: 'Allows inspecting a notification.',
    },
    // TODO [#271]: Remove this popup capability when implemented the issue #271
    {
      type: WorkbenchCapabilities.Popup,
      qualifier: {
        component: 'host-popup',
      },
      private: false,
      description: 'Represents a popup provided by the host app.',
      optionalParams: ['param1'],
      properties: {
        path: 'host-popup;matrixParam1=:param1;matrixParam2=:component',
        cssClass: 'host-popup',
      },
    },
  ],
};
