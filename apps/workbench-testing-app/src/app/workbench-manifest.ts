import {WorkbenchCapabilities} from '@scion/workbench-client';
import {Manifest} from '@scion/microfrontend-platform';

/**
 * Represents the manifest of the Workbench Host App.
 */
export const workbenchManifest: Manifest = {
  name: 'Workbench Host App',
  capabilities: [
    {
      type: WorkbenchCapabilities.MessageBox,
      qualifier: {component: 'inspector'},
      private: false,
      params: [
        {name: 'param1', required: true},
        {name: 'param2', required: false},
      ],
      description: 'Allows inspecting a message box.',
    },
    {
      type: WorkbenchCapabilities.Notification,
      qualifier: {component: 'inspector'},
      private: false,
      params: [
        {name: 'param1', required: true},
        {name: 'param2', required: false},
      ],
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
      params: [
        {name: 'param1', required: false},
      ],
      properties: {
        path: 'host-popup;matrixParam1=:param1;matrixParam2=:component',
        cssClass: 'host-popup',
      },
    },
  ],
};
