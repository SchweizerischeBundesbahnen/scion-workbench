import {WorkbenchCapabilities, WorkbenchDialogCapability, WorkbenchMessageBoxCapability, WorkbenchPopupCapability} from '@scion/workbench-client';
import {Capability, Manifest} from '@scion/microfrontend-platform';

/**
 * Represents the manifest of the Workbench Host App.
 */
export const workbenchManifest: Manifest = {
  name: 'Workbench Host App',
  capabilities: [
    {
      type: WorkbenchCapabilities.Notification,
      qualifier: {component: 'notification-page'},
      private: false,
      params: [
        {name: 'param1', required: true},
        {name: 'param2', required: false},
      ],
      description: 'Allows interacting with a notification.',
    } satisfies Capability,
    // TODO [#271]: Remove this popup capability when implemented the issue #271
    {
      type: WorkbenchCapabilities.Popup,
      qualifier: {
        component: 'host-popup',
      },
      private: false,
      description: 'Represents a popup provided by the host app.',
      params: [
        {name: 'param', required: false},
      ],
      properties: {
        path: 'test-host-popup;matrixParam=:param',
      },
    } satisfies WorkbenchPopupCapability,
    // TODO [#271]: Remove this popup capability when implemented the issue #271
    {
      type: WorkbenchCapabilities.Popup,
      qualifier: {
        component: 'host-popup',
        variant: 'invalid-path',
      },
      private: false,
      description: 'Represents a popup provided by the host app that has an invalid path.',
      properties: {
        path: 'does/not/exist',
      },
    } satisfies WorkbenchPopupCapability,
    // TODO [#271]: Remove this popup capability when implemented the issue #271
    {
      type: WorkbenchCapabilities.Popup,
      qualifier: {
        component: 'host-popup',
        variant: 'focus-page',
      },
      private: false,
      description: 'Represents a popup provided by the host app that displays the focus test page.',
      properties: {
        path: 'test-pages/host-focus-test-page',
      },
    } satisfies WorkbenchPopupCapability,
    // TODO [#271]: Remove this dialog capability when implemented the issue #271
    {
      type: WorkbenchCapabilities.Dialog,
      qualifier: {
        component: 'host-dialog',
      },
      private: false,
      description: 'Represents a dialog provided by the host app.',
      params: [
        {name: 'param', required: false},
      ],
      properties: {
        path: 'test-host-dialog;matrixParam=:param',
      },
    } satisfies WorkbenchDialogCapability,
    // TODO [#271]: Remove this dialog capability when implemented the issue #271
    {
      type: WorkbenchCapabilities.Dialog,
      qualifier: {
        component: 'host-dialog',
        variant: 'invalid-path',
      },
      private: false,
      description: 'Represents a dialog provided by the host app that has an invalid path.',
      properties: {
        path: 'does/not/exist',
      },
    } satisfies WorkbenchDialogCapability,
    // TODO [#271]: Remove this dialog capability when implemented the issue #271
    {
      type: WorkbenchCapabilities.Dialog,
      qualifier: {
        component: 'host-dialog',
        variant: 'custom-properties',
      },
      private: false,
      description: 'Represents a dialog provided by the host app with non-default property values.',
      params: [
        {name: 'id', required: false},
      ],
      properties: {
        path: 'test-host-dialog',
        title: 'Workbench Host Dialog :id',
        closable: false,
        resizable: false,
        padding: false,
        size: {
          height: '500px',
          minHeight: '495px',
          maxHeight: '505px',
          width: '500px',
          minWidth: '495px',
          maxWidth: '505px',
        },
      },
    } satisfies WorkbenchDialogCapability,
    // TODO [#271]: Remove this dialog capability when implemented the issue #271
    {
      type: WorkbenchCapabilities.Dialog,
      qualifier: {
        component: 'host-dialog',
        variant: 'focus-page',
      },
      private: false,
      description: 'Represents a dialog provided by the host app that displays the focus test page.',
      properties: {
        path: 'test-pages/host-focus-test-page',
      },
    } satisfies WorkbenchDialogCapability,
    // TODO [#271]: Remove this messagebox capability when implemented the issue #271
    {
      type: WorkbenchCapabilities.MessageBox,
      qualifier: {
        component: 'host-messagebox',
      },
      private: false,
      description: 'Represents a message box provided by the host app.',
      params: [
        {name: 'param', required: false},
      ],
      properties: {
        path: 'test-host-message-box;matrixParam=:param',
      },
    } satisfies WorkbenchMessageBoxCapability,
    // TODO [#271]: Remove this messagebox capability when implemented the issue #271
    {
      type: WorkbenchCapabilities.MessageBox,
      qualifier: {
        component: 'host-messagebox',
        variant: 'invalid-path',
      },
      private: false,
      description: 'Represents a message box provided by the host app that has an invalid path.',
      properties: {
        path: 'does/not/exist',
      },
    } satisfies WorkbenchMessageBoxCapability,
    // TODO [#271]: Remove this messagebox capability when implemented the issue #271
    {
      type: WorkbenchCapabilities.MessageBox,
      qualifier: {
        component: 'host-messagebox',
        variant: 'explicit-size',
      },
      private: false,
      description: 'Represents a massage box provided by the host app with pre-defined custom size.',
      properties: {
        path: 'test-host-message-box',
        size: {
          height: '500px',
          minHeight: '495px',
          maxHeight: '505px',
          width: '350px',
          minWidth: '345px',
          maxWidth: '355px',
        },
      },
    } satisfies WorkbenchMessageBoxCapability,
    // TODO [#271]: Remove this messagebox capability when implemented the issue #271
    {
      type: WorkbenchCapabilities.MessageBox,
      qualifier: {
        component: 'host-messagebox',
        variant: 'focus-page',
      },
      private: false,
      description: 'Represents a message box provided by the host app that displays the focus test page.',
      properties: {
        path: 'test-pages/host-focus-test-page',
      },
    } satisfies WorkbenchMessageBoxCapability,
  ],
  intentions: [
    // allow opening test views
    {type: WorkbenchCapabilities.View, qualifier: {test: '*', '*': '*'}},
    // allow opening DevTools
    {type: WorkbenchCapabilities.View, qualifier: {component: 'devtools', vendor: 'scion'}},
    // allow opening test popups
    {type: WorkbenchCapabilities.Popup, qualifier: {test: '*', '*': '*'}},
  ],
};
