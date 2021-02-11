import { ApplicationManifest } from '@scion/microfrontend-platform';
import { WorkbenchCapabilities } from '@scion/workbench-client';

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
  ],
};
