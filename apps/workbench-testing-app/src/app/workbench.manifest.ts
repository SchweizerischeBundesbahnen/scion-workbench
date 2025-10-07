import {WorkbenchCapabilities, WorkbenchDialogCapability, WorkbenchMessageBoxCapability, WorkbenchPartCapability, WorkbenchPopupCapability, WorkbenchViewCapability} from '@scion/workbench-client';
import {Capability, Manifest} from '@scion/microfrontend-platform';

/**
 * Represents the manifest of the Workbench Host App.
 */
export const workbenchManifest: Manifest = {
  name: 'Workbench Host App',
  capabilities: [
    {
      type: WorkbenchCapabilities.View,
      qualifier: {
        component: 'host-view',
        app: 'workbench-host-app',
      },
      description: 'Allows interacting with a workbench host view.',
      private: false,
      properties: {
        path: 'test-host-view',
        pinToDesktop: true,
        title: 'Workbench View',
        cssClass: 'e2e-test-host-view',
      },
    } satisfies TestingAppViewCapability,
    {
      type: WorkbenchCapabilities.View,
      qualifier: {
        component: 'register-workbench-capability',
        app: 'workbench-host-app',
      },
      description: 'Allows registering workbench capabilities.',
      private: false,
      properties: {
        path: 'register-workbench-capability',
        pinToDesktop: true,
        title: 'Register Capability',
        cssClass: 'e2e-register-workbench-capability',
      },
    } satisfies TestingAppViewCapability,
    {
      type: WorkbenchCapabilities.View,
      qualifier: {
        component: 'router',
        app: 'workbench-host-app',
      },
      description: 'Allows opening a microfrontend in a workbench view.',
      private: false,
      properties: {
        path: 'test-host-router',
        hostView: true,
        title: 'Workbench Router',
        cssClass: 'e2e-test-host-router',
      },
    } satisfies TestingAppViewCapability,
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
    // TODO [#271]: Remove this part capability when implemented the issue #271
    {
      type: WorkbenchCapabilities.Part,
      qualifier: {
        component: 'host-part',
      },
      private: false,
      description: 'Represents a part provided by the host app.',
      params: [
        {name: 'param', required: false},
      ],
      properties: {
        path: 'test-host-part;matrixParam=:param',
        extras: {
          label: 'projects',
          icon: 'folder',
        },
      },
    } satisfies WorkbenchPartCapability,
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
      properties: {
        path: 'test-host-dialog',
        title: 'Workbench Host Dialog',
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
    // TODO [#271]: Remove this dialog capability when implemented the issue #271
    {
      type: WorkbenchCapabilities.Dialog,
      qualifier: {
        component: 'host-dialog',
        variant: 'text-page',
      },
      private: false,
      description: 'Represents a dialog provided by the host app that displays the text test page.',
      properties: {
        path: 'test-pages/text-test-page',
        title: 'Dialog Title',
      },
    } satisfies WorkbenchDialogCapability,
    // TODO [#271]: Remove this dialog capability when implemented the issue #271
    {
      type: WorkbenchCapabilities.Dialog,
      qualifier: {
        component: 'host-dialog',
        variant: 'text-page::translatable-title',
      },
      private: false,
      description: 'Represents a dialog provided by the host app that displays the text test page and has a translatable title.',
      properties: {
        path: 'test-pages/text-test-page',
        title: '%dialog_title',
      },
    } satisfies WorkbenchDialogCapability,
    // TODO [#271]: Remove this dialog capability when implemented the issue #271
    {
      type: WorkbenchCapabilities.Dialog,
      qualifier: {
        component: 'host-dialog',
        variant: 'text-page::translatable-parameterized-title',
      },
      params: [
        {name: 'id', required: true},
      ],
      private: false,
      description: 'Represents a dialog provided by the host app that displays the text test page and has a translatable parameterized title.',
      properties: {
        path: 'test-pages/text-test-page',
        title: '%dialog_title;id=:id;name=:name;undefined=:undefined',
        resolve: {
          name: 'textprovider/workbench-host-app/values/:id',
        },
      },
    } satisfies WorkbenchDialogCapability,
    // TODO [#271]: Remove this dialog capability when implemented the issue #271
    {
      type: WorkbenchCapabilities.Dialog,
      qualifier: {
        component: 'host-dialog',
        variant: 'text-page::parameterized-title',
      },
      params: [
        {name: 'id', required: true},
      ],
      private: false,
      description: 'Represents a dialog provided by the host app that displays the text test page and has a parameterized title.',
      properties: {
        path: 'test-pages/text-test-page',
        title: 'Title - :id - :name - :undefined',
        resolve: {
          name: 'textprovider/workbench-host-app/values/:id',
        },
      },
    } satisfies WorkbenchDialogCapability,
    // TODO [#271]: Remove this dialog capability when implemented the issue #271
    {
      type: WorkbenchCapabilities.Dialog,
      qualifier: {
        component: 'host-dialog',
        variant: 'text-page::parameterized-title-with-semicolon',
      },
      params: [
        {name: 'id', required: true},
      ],
      private: false,
      description: 'Represents a dialog provided by the host app that displays the text test page and has a parameterized title with a semicolon.',
      properties: {
        path: 'test-pages/text-test-page',
        title: 'Dialog;Title - :id - :name',
        resolve: {
          name: 'textprovider/workbench-host-app/values/:id',
        },
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

type TestingAppViewCapability = WorkbenchViewCapability & {properties: {pinToDesktop?: boolean}};
