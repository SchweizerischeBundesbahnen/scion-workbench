import {WorkbenchCapabilities, WorkbenchDialogCapability, WorkbenchMessageBoxCapability, WorkbenchNotificationCapability, WorkbenchPartCapability, WorkbenchPopupCapability, WorkbenchViewCapability} from '@scion/workbench-client';
import {Manifest} from '@scion/microfrontend-platform';
import {Route, Routes, ROUTES} from '@angular/router';
import {canMatchWorkbenchDialogCapability, canMatchWorkbenchMessageBoxCapability, canMatchWorkbenchNotificationCapability, canMatchWorkbenchPartCapability, canMatchWorkbenchPopupCapability, canMatchWorkbenchViewCapability} from '@scion/workbench';
import {EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';

/**
 * Represents the manifest of the Workbench Host App.
 */
export const hostAppManifest: Manifest = {
  name: 'Workbench Host App',
  capabilities: [
    provideRouterViewCapability(),
    providePartOpenerViewCapability(),
    provideDialogOpenerViewCapability(),
    provideMessageBoxOpenerViewCapability(),
    providePopupOpenerViewCapability(),
    provideNotificationOpenerViewCapability(),
    provideCapabilityRegisterViewCapability(),
    provideCapabilityUnregisterViewCapability(),
    provideIntentionRegisterViewCapability(),
    provideMessagingViewCapability(),
    providePartCapability(),
    provideViewCapability(),
    provideDialogCapability(),
    provideMessageBoxCapability(),
    providePopupCapability(),
    provideNotificationCapability(),
  ],
  intentions: [
    // allow opening DevTools
    {type: WorkbenchCapabilities.View, qualifier: {component: 'devtools', vendor: 'scion'}},
  ],
};

/**
 * Routes used by host app capabilities.
 */
export const hostCapabilityRoutes: Routes = [
  provideRouterViewCapabilityRoute(),
  providePartOpenerViewCapabilityRoute(),
  provideDialogOpenerViewCapabilityRoute(),
  provideMessageBoxOpenerViewCapabilityRoute(),
  providePopupOpenerViewCapabilityRoute(),
  provideNotificationOpenerViewCapabilityRoute(),
  provideCapabilityRegisterViewCapabilityRoute(),
  provideCapabilityUnregisterViewCapabilityRoute(),
  provideIntentionRegisterViewCapabilityRoute(),
  provideMessagingViewCapabilityRoute(),
  providePartCapabilityRoute(),
  provideViewCapabilityRoute(),
  provideDialogCapabilityRoute(),
  provideMessageBoxCapabilityRoute(),
  providePopupCapabilityRoute(),
  provideNotificationCapabilityRoute(),
];

/**
 * Provides routes used by host app capabilities.
 */
export function provideRoutesForHostCapabilities(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: ROUTES,
      useValue: hostCapabilityRoutes,
      multi: true,
    },
  ]);
}

function provideRouterViewCapability(): WorkbenchViewCapability {
  return {
    type: WorkbenchCapabilities.View,
    qualifier: {component: 'router', app: 'host'},
    description: 'View to interact with WorkbenchRouter',
    properties: {
      path: '',
      pinToDesktop: true,
      title: 'Workbench Router',
      cssClass: 'e2e-test-router',
    },
  };
}

function provideRouterViewCapabilityRoute(): Route {
  return {
    path: '',
    canMatch: [canMatchWorkbenchViewCapability({component: 'router', app: 'host'})],
    loadComponent: () => import('workbench-client-testing-app-common').then(m => m.RouterPageComponent),
  };
}

function providePartOpenerViewCapability(): WorkbenchViewCapability {
  return {
    type: WorkbenchCapabilities.View,
    qualifier: {component: 'part', app: 'host'},
    description: 'View to contribute parts',
    properties: {
      path: '',
      pinToDesktop: true,
      title: 'Workbench Part',
    },
  };
}

function providePartOpenerViewCapabilityRoute(): Route {
  return {
    path: '',
    canMatch: [canMatchWorkbenchViewCapability({component: 'part', app: 'host'})],
    loadComponent: () => import('./microfrontend-part-opener-page/microfrontend-part-opener-page.component'),
  };
}

function provideDialogOpenerViewCapability(): WorkbenchViewCapability {
  return {
    type: WorkbenchCapabilities.View,
    qualifier: {component: 'dialog', app: 'host'},
    description: 'View to interact with WorkbenchDialogService',
    properties: {
      path: '',
      pinToDesktop: true,
      title: 'Workbench Dialog',
      cssClass: 'e2e-test-dialog-opener',
    },
  };
}

function provideDialogOpenerViewCapabilityRoute(): Route {
  return {
    path: '',
    canMatch: [canMatchWorkbenchViewCapability({component: 'dialog', app: 'host'})],
    loadComponent: () => import('workbench-client-testing-app-common').then(m => m.DialogOpenerPageComponent),
  };
}

function provideMessageBoxOpenerViewCapability(): WorkbenchViewCapability {
  return {
    type: WorkbenchCapabilities.View,
    qualifier: {component: 'messagebox', app: 'host'},
    description: 'View to interact with WorkbenchMessageBoxService',
    properties: {
      path: '',
      pinToDesktop: true,
      title: 'Workbench Message Box',
      cssClass: 'e2e-test-message-box-opener',
    },
  };
}

function provideMessageBoxOpenerViewCapabilityRoute(): Route {
  return {
    path: '',
    canMatch: [canMatchWorkbenchViewCapability({component: 'messagebox', app: 'host'})],
    loadComponent: () => import('workbench-client-testing-app-common').then(m => m.MessageBoxOpenerPageComponent),
  };
}

function providePopupOpenerViewCapability(): WorkbenchViewCapability {
  return {
    type: WorkbenchCapabilities.View,
    qualifier: {component: 'popup', app: 'host'},
    description: 'View to interact with WorkbenchPopupService',
    properties: {
      path: '',
      pinToDesktop: true,
      title: 'Workbench Popup',
      cssClass: 'e2e-test-popup-opener',
    },
  };
}

function providePopupOpenerViewCapabilityRoute(): Route {
  return {
    path: '',
    canMatch: [canMatchWorkbenchViewCapability({component: 'popup', app: 'host'})],
    loadComponent: () => import('workbench-client-testing-app-common').then(m => m.PopupOpenerPageComponent),
  };
}

function provideNotificationOpenerViewCapability(): WorkbenchViewCapability {
  return {
    type: WorkbenchCapabilities.View,
    qualifier: {component: 'notification', app: 'host'},
    description: 'View to interact with WorkbenchNotificationService',
    properties: {
      path: '',
      pinToDesktop: true,
      title: 'Workbench Notification',
      cssClass: 'e2e-test-notification-opener',
    },
  };
}

function provideNotificationOpenerViewCapabilityRoute(): Route {
  return {
    path: '',
    canMatch: [canMatchWorkbenchViewCapability({component: 'notification', app: 'host'})],
    loadComponent: () => import('workbench-client-testing-app-common').then(m => m.NotificationOpenerPageComponent),
  };
}

function provideCapabilityRegisterViewCapability(): WorkbenchViewCapability {
  return {
    type: WorkbenchCapabilities.View,
    qualifier: {component: 'register-workbench-capability', app: 'host'},
    description: 'View to register capabilities',
    properties: {
      path: '',
      pinToDesktop: true,
      title: 'Register Capability',
      cssClass: 'e2e-register-workbench-capability',
    },
  };
}

function provideCapabilityRegisterViewCapabilityRoute(): Route {
  return {
    path: '',
    canMatch: [canMatchWorkbenchViewCapability({component: 'register-workbench-capability', app: 'host'})],
    loadComponent: () => import('workbench-client-testing-app-common').then(m => m.RegisterWorkbenchCapabilityPageComponent),
  };
}

function provideCapabilityUnregisterViewCapability(): WorkbenchViewCapability {
  return {
    type: WorkbenchCapabilities.View,
    qualifier: {component: 'unregister-workbench-capability', app: 'host'},
    description: 'View to unregister capabilities',
    properties: {
      path: '',
      pinToDesktop: true,
      title: 'Unregister Capability',
      cssClass: 'e2e-unregister-workbench-capability',
    },
  };
}

function provideCapabilityUnregisterViewCapabilityRoute(): Route {
  return {
    path: '',
    canMatch: [canMatchWorkbenchViewCapability({component: 'unregister-workbench-capability', app: 'host'})],
    loadComponent: () => import('workbench-client-testing-app-common').then(m => m.UnregisterWorkbenchCapabilityPageComponent),
  };
}

function provideIntentionRegisterViewCapability(): WorkbenchViewCapability {
  return {
    type: WorkbenchCapabilities.View,
    qualifier: {component: 'register-workbench-intention', app: 'host'},
    description: 'View to register intentions',
    properties: {
      path: '',
      pinToDesktop: true,
      title: 'Register Intention',
      cssClass: 'e2e-register-workbench-intention',
    },
  };
}

function provideIntentionRegisterViewCapabilityRoute(): Route {
  return {
    path: '',
    canMatch: [canMatchWorkbenchViewCapability({component: 'register-workbench-intention', app: 'host'})],
    loadComponent: () => import('workbench-client-testing-app-common').then(m => m.RegisterWorkbenchIntentionPageComponent),
  };
}

function provideMessagingViewCapability(): WorkbenchViewCapability {
  return {
    type: WorkbenchCapabilities.View,
    qualifier: {component: 'messaging', app: 'host'},
    description: 'View to interact with MessageClient',
    properties: {
      path: '',
      pinToDesktop: true,
      title: 'Messaging',
      cssClass: 'e2e-messaging',
    },
  };
}

function provideMessagingViewCapabilityRoute(): Route {
  return {
    path: '',
    canMatch: [canMatchWorkbenchViewCapability({component: 'messaging', app: 'host'})],
    loadComponent: () => import('workbench-client-testing-app-common').then(m => m.MessagingPageComponent),
  };
}

function providePartCapability(): WorkbenchPartCapability {
  return {
    type: WorkbenchCapabilities.Part,
    qualifier: {component: 'part', app: 'host'},
    description: 'Part to interact with WorkbenchPart handle',
    properties: {
      path: '',
      extras: {
        label: 'Workbench Part',
        icon: 'folder',
      },
    },
  };
}

function providePartCapabilityRoute(): Route {
  return {
    path: '',
    canMatch: [canMatchWorkbenchPartCapability({component: 'part', app: 'host'})],
    loadComponent: () => import('./part-page/part-page.component'),
  };
}

function provideViewCapability(): WorkbenchViewCapability {
  return {
    type: WorkbenchCapabilities.View,
    qualifier: {component: 'view', app: 'host'},
    description: 'View to interact with WorkbenchView handle',
    private: false,
    properties: {
      path: '',
      pinToDesktop: true,
      title: 'Workbench View',
      cssClass: 'e2e-test-view',
    },
  };
}

function provideViewCapabilityRoute(): Route {
  return {
    path: '',
    canMatch: [canMatchWorkbenchViewCapability({component: 'view', app: 'host'})],
    loadComponent: () => import('./view-page/view-page.component'),
  };
}

function provideDialogCapability(): WorkbenchDialogCapability {
  return {
    type: WorkbenchCapabilities.Dialog,
    qualifier: {component: 'dialog', app: 'host'},
    description: 'Dialog to interact with WorkbenchDialog handle',
    private: false,
    properties: {
      path: '',
    },
  };
}

function provideDialogCapabilityRoute(): Route {
  return {
    path: '',
    canMatch: [canMatchWorkbenchDialogCapability({component: 'dialog', app: 'host'})],
    loadComponent: () => import('./dialog-page/dialog-page.component'),
  };
}

function provideMessageBoxCapability(): WorkbenchMessageBoxCapability {
  return {
    type: WorkbenchCapabilities.MessageBox,
    qualifier: {component: 'messagebox', app: 'host'},
    description: 'MessageBox to interact with WorkbenchMessageBox handle',
    private: false,
    properties: {
      path: '',
    },
  };
}

function provideMessageBoxCapabilityRoute(): Route {
  return {
    path: '',
    canMatch: [canMatchWorkbenchMessageBoxCapability({component: 'messagebox', app: 'host'})],
    loadComponent: () => import('./message-box-page/message-box-page.component'),
  };
}

function providePopupCapability(): WorkbenchPopupCapability {
  return {
    type: WorkbenchCapabilities.Popup,
    qualifier: {component: 'popup', app: 'host'},
    description: 'Popup to interact with WorkbenchPopup handle',
    private: false,
    properties: {
      path: '',
    },
  };
}

function providePopupCapabilityRoute(): Route {
  return {
    path: '',
    canMatch: [canMatchWorkbenchPopupCapability({component: 'popup', app: 'host'})],
    loadComponent: () => import('./popup-page/popup-page.component'),
  };
}

function provideNotificationCapability(): WorkbenchNotificationCapability {
  return {
    type: WorkbenchCapabilities.Notification,
    qualifier: {component: 'notification', app: 'host'},
    description: 'Notification to interact with WorkbenchNotification handle',
    private: false,
    properties: {
      path: '',
    },
  };
}

function provideNotificationCapabilityRoute(): Route {
  return {
    path: '',
    canMatch: [canMatchWorkbenchNotificationCapability({component: 'notification', app: 'host'})],
    loadComponent: () => import('./notification-page/notification-page.component'),
  };
}
