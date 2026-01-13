/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, NgModule} from '@angular/core';
import {Beans} from '@scion/toolkit/bean-manager';
import {Capability, ManifestService, MessageClient} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities, WorkbenchDialogCapability, WorkbenchMessageBoxCapability, WorkbenchPopupCapability, WorkbenchViewCapability} from '@scion/workbench-client';
import {APP_SYMBOLIC_NAME} from '../workbench-client/workbench-client.provider';
import {provideTextFromStorage, provideValueFromStorage} from './storage-text-provider';

@NgModule({})
export default class ActivatorModule {

  constructor() {
    // Register capabilities.
    void registerCapabilities().then(() => Beans.get(MessageClient).publish('activator-ready'));

    // Register text provider with texts from storage.
    provideTextFromStorage();

    // Register message listener that replies with values from session storage.
    provideValueFromStorage();
  }
}

async function registerCapabilities(): Promise<void> {
  const manifestService = inject(ManifestService);
  const appSymbolicName = inject(APP_SYMBOLIC_NAME);

  const app = /workbench-client-testing-(?<app>.+)/.exec(appSymbolicName)!.groups!['app'] as 'app1' | 'app2';
  const capabilities: Capability[] = [
    provideRouterViewCapability(app),
    provideDialogOpenerViewCapability(app),
    provideMessageBoxOpenerViewCapability(app),
    providePopupOpenerViewCapability(app),
    provideNotificationOpenerViewCapability(app),
    provideCapabilityRegisterViewCapability(app),
    provideCapabilityUnregisterViewCapability(app),
    provideIntentionRegisterViewCapability(app),
    provideMessagingViewCapability(app),
    provideViewCapability(app),
    provideDialogCapability(app),
    provideMessageBoxCapability(app),
    providePopupCapability(app),
  ];

  for (const capability of capabilities) {
    await manifestService.registerCapability(capability);
  }
}

function provideRouterViewCapability(app: 'app1' | 'app2'): WorkbenchViewCapability {
  return {
    type: WorkbenchCapabilities.View,
    qualifier: {component: 'router', app},
    description: 'View to interact with WorkbenchRouter',
    private: false,
    properties: {
      path: 'test-router',
      showSplash: true,
      pinToDesktop: true,
      title: 'Workbench Router',
      cssClass: 'e2e-test-router',
    },
  };
}

function provideDialogOpenerViewCapability(app: 'app1' | 'app2'): WorkbenchViewCapability {
  return {
    type: WorkbenchCapabilities.View,
    qualifier: {component: 'dialog', app},
    description: 'View to interact with WorkbenchDialogService',
    private: false,
    properties: {
      path: 'test-dialog-opener',
      showSplash: true,
      pinToDesktop: true,
      title: 'Workbench Dialog',
      cssClass: 'e2e-test-dialog-opener',
    },
  };
}

function provideMessageBoxOpenerViewCapability(app: 'app1' | 'app2'): WorkbenchViewCapability {
  return {
    type: WorkbenchCapabilities.View,
    qualifier: {component: 'messagebox', app},
    description: 'View to interact with WorkbenchMessageBoxService',
    private: false,
    properties: {
      path: 'test-message-box-opener',
      showSplash: true,
      pinToDesktop: true,
      title: 'Workbench Message Box',
      cssClass: 'e2e-test-message-box-opener',
    },
  };
}

function providePopupOpenerViewCapability(app: 'app1' | 'app2'): WorkbenchViewCapability {
  return {
    type: WorkbenchCapabilities.View,
    qualifier: {component: 'popup', app},
    description: 'View to interact with WorkbenchPopupService',
    private: false,
    properties: {
      path: 'test-popup-opener',
      showSplash: true,
      pinToDesktop: true,
      title: 'Workbench Popup',
      cssClass: 'e2e-test-popup-opener',
    },
  };
}

function provideNotificationOpenerViewCapability(app: 'app1' | 'app2'): WorkbenchViewCapability {
  return {
    type: WorkbenchCapabilities.View,
    qualifier: {component: 'notification', app},
    description: 'View to interact with WorkbenchNotificationService',
    private: false,
    properties: {
      path: 'test-notification-opener',
      showSplash: true,
      pinToDesktop: true,
      title: 'Workbench Notification',
      cssClass: 'e2e-test-notification-opener',
    },
  };
}

function provideCapabilityRegisterViewCapability(app: 'app1' | 'app2'): WorkbenchViewCapability {
  return {
    type: WorkbenchCapabilities.View,
    qualifier: {component: 'register-workbench-capability', app},
    description: 'View to register capabilities',
    private: false,
    properties: {
      path: 'register-workbench-capability',
      showSplash: true,
      pinToDesktop: true,
      title: 'Register Capability',
      cssClass: 'e2e-register-workbench-capability',
    },
  };
}

function provideCapabilityUnregisterViewCapability(app: 'app1' | 'app2'): WorkbenchViewCapability {
  return {
    type: WorkbenchCapabilities.View,
    qualifier: {component: 'unregister-workbench-capability', app},
    description: 'View to unregister capabilities',
    private: false,
    properties: {
      path: 'unregister-workbench-capability',
      showSplash: true,
      pinToDesktop: true,
      title: 'Unregister Capability',
      cssClass: 'e2e-unregister-workbench-capability',
    },
  };
}

function provideIntentionRegisterViewCapability(app: 'app1' | 'app2'): WorkbenchViewCapability {
  return {
    type: WorkbenchCapabilities.View,
    qualifier: {component: 'register-workbench-intention', app},
    description: 'View to register intentions',
    private: false,
    properties: {
      path: 'register-workbench-intention',
      showSplash: true,
      pinToDesktop: true,
      title: 'Register Intention',
      cssClass: 'e2e-register-workbench-intention',
    },
  };
}

function provideMessagingViewCapability(app: 'app1' | 'app2'): WorkbenchViewCapability {
  return {
    type: WorkbenchCapabilities.View,
    qualifier: {component: 'messaging', app},
    description: 'View to interact with MessageClient',
    private: false,
    properties: {
      path: 'messaging',
      showSplash: true,
      pinToDesktop: true,
      title: 'Messaging',
      cssClass: 'e2e-messaging',
    },
  };
}

function provideViewCapability(app: 'app1' | 'app2'): WorkbenchViewCapability {
  return {
    type: WorkbenchCapabilities.View,
    qualifier: {component: 'view', app},
    params: [
      {
        name: 'transientParam',
        required: false,
        transient: true,
      },
    ],
    description: 'View to interact with WorkbenchView handle',
    private: false,
    properties: {
      path: 'test-view',
      showSplash: true,
      pinToDesktop: true,
      title: 'Workbench View',
      cssClass: 'e2e-test-view',
    },
  };
}

function provideDialogCapability(app: 'app1' | 'app2'): WorkbenchDialogCapability {
  return {
    type: WorkbenchCapabilities.Dialog,
    qualifier: {component: 'dialog', app},
    description: 'Dialog to interact with WorkbenchDialog handle',
    private: false,
    properties: {
      path: 'test-dialog',
      size: {
        width: '300px',
        height: '475px',
      },
      showSplash: true,
    },
  };
}

function provideMessageBoxCapability(app: 'app1' | 'app2'): WorkbenchMessageBoxCapability {
  return {
    type: WorkbenchCapabilities.MessageBox,
    qualifier: {component: 'messagebox', app},
    description: 'MessageBox to interact with WorkbenchMessageBox handle',
    private: false,
    properties: {
      path: 'test-message-box',
      size: {
        width: '260px',
        height: '290px',
      },
      showSplash: true,
    },
  };
}

function providePopupCapability(app: 'app1' | 'app2'): WorkbenchPopupCapability {
  return {
    type: WorkbenchCapabilities.Popup,
    qualifier: {component: 'popup', app},
    description: 'Popup to interact with WorkbenchPopup handle',
    private: false,
    properties: {
      path: 'test-popup',
      showSplash: true,
    },
  };
}
