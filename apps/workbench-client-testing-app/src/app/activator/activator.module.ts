/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Inject, NgModule} from '@angular/core';
import {Beans} from '@scion/toolkit/bean-manager';
import {APP_IDENTITY, Capability, Intention, ManifestService, MessageClient} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities, WorkbenchDialogCapability, WorkbenchMessageBoxCapability, WorkbenchPopupCapability, WorkbenchViewCapability} from '@scion/workbench-client';
import {firstValueFrom} from 'rxjs';

@NgModule({})
export default class ActivatorModule {

  constructor(private _manifestService: ManifestService,
              private _messageClient: MessageClient,
              @Inject(APP_IDENTITY) private _symbolicName: string) {
    this.registerManifestObjects(this._symbolicName).then(() => Beans.get(MessageClient).publish('activator-ready'));
    this.installCapabilityRegisterRequestHandler();
    this.installCapabilityUnregisterRequestHandler();
    this.installIntentionRegisterRequestHandler();
  }

  private async registerManifestObjects(appSymbolicName: string): Promise<void> {
    const app = /workbench-client-testing-(?<app>.+)/.exec(appSymbolicName)!.groups!['app'];
    const heading = `${app}: Workbench Client E2E Testpage`;

    // Register view to interact with the workbench view object.
    await this._manifestService.registerCapability<WorkbenchViewTestingAppCapability>({
      type: WorkbenchCapabilities.View,
      qualifier: {
        component: 'view',
        app,
      },
      params: [
        {
          name: 'initialTitle',
          required: false,
        },
        {
          name: 'transientParam',
          required: false,
          transient: true,
        },
      ],
      description: '[e2e] Provides access to the workbench view object',
      private: false,
      properties: {
        path: 'test-view',
        showSplash: true,
        title: 'Workbench View',
        heading,
        cssClass: 'e2e-test-view',
        tile: {
          label: 'Workbench View',
          cssClass: 'e2e-test-view',
        },
      },
    });

    // Register view to navigate using the workbench router.
    await this._manifestService.registerCapability<WorkbenchViewTestingAppCapability>({
      type: WorkbenchCapabilities.View,
      qualifier: {
        component: 'router',
        app,
      },
      description: '[e2e] Allows opening a microfrontend in a workbench view',
      private: false,
      properties: {
        path: 'test-router',
        showSplash: true,
        title: 'Workbench Router',
        heading,
        cssClass: 'e2e-test-router',
        tile: {
          label: 'Workbench Router',
          cssClass: 'e2e-test-router',
        },
      },
    });

    // Register view to open a workbench popup.
    await this._manifestService.registerCapability<WorkbenchViewTestingAppCapability>({
      type: WorkbenchCapabilities.View,
      qualifier: {
        component: 'popup',
        app,
      },
      description: '[e2e] Allows opening a microfrontend in a workbench popup',
      private: false,
      properties: {
        path: 'test-popup-opener',
        showSplash: true,
        title: 'Workbench Popup',
        heading,
        cssClass: 'e2e-test-popup-opener',
        tile: {
          label: 'Workbench Popup',
          cssClass: 'e2e-test-popup-opener',
        },
      },
    });

    // Register the popup microfrontend.
    await this._manifestService.registerCapability<WorkbenchPopupCapability>({
      type: WorkbenchCapabilities.Popup,
      qualifier: {
        component: 'popup',
        app,
      },
      description: '[e2e] Provides access to the workbench popup object',
      private: false,
      properties: {
        path: 'test-popup',
        showSplash: true,
      },
    });

    // Register view to open a workbench dialog.
    await this._manifestService.registerCapability<WorkbenchViewTestingAppCapability>({
      type: WorkbenchCapabilities.View,
      qualifier: {
        component: 'dialog',
        app,
      },
      description: '[e2e] Allows opening a microfrontend in a workbench dialog',
      private: false,
      properties: {
        path: 'test-dialog-opener',
        showSplash: true,
        title: 'Workbench Dialog',
        heading,
        cssClass: 'e2e-test-dialog-opener',
        tile: {
          label: 'Workbench Dialog',
          cssClass: 'e2e-test-dialog-opener',
        },
      },
    });

    // Register the dialog microfrontend.
    await this._manifestService.registerCapability<WorkbenchDialogCapability>({
      type: WorkbenchCapabilities.Dialog,
      qualifier: {
        component: 'dialog',
        app,
      },
      description: '[e2e] Provides access to the workbench dialog object',
      private: false,
      properties: {
        path: 'test-dialog',
        size: {
          width: '300px',
          height: '475px',
        },
        showSplash: true,
      },
    });

    // Register view to open a workbench message box.
    await this._manifestService.registerCapability<WorkbenchViewTestingAppCapability>({
      type: WorkbenchCapabilities.View,
      qualifier: {
        component: 'messagebox',
        app,
      },
      description: '[e2e] Allows displaying a message in a workbench message box',
      private: false,
      properties: {
        path: 'test-message-box-opener',
        showSplash: true,
        title: 'Workbench Message Box',
        heading,
        cssClass: 'e2e-test-message-box-opener',
        tile: {
          label: 'Workbench Message Box',
          cssClass: 'e2e-test-message-box-opener',
        },
      },
    });

    // Register the message box microfrontend.
    await this._manifestService.registerCapability<WorkbenchMessageBoxCapability>({
      type: WorkbenchCapabilities.MessageBox,
      qualifier: {
        component: 'message-box',
        app,
      },
      description: '[e2e] Provides access to the workbench message box object',
      private: false,
      properties: {
        path: 'test-message-box',
        size: {
          width: '260px',
          height: '290px',
        },
        showSplash: true,
      },
    });

    // Register view to display a workbench notification.
    await this._manifestService.registerCapability<WorkbenchViewTestingAppCapability>({
      type: WorkbenchCapabilities.View,
      qualifier: {
        component: 'notification',
        app,
      },
      description: '[e2e] Allows displaying a notification to the user.',
      private: false,
      properties: {
        path: 'test-notification-opener',
        showSplash: true,
        title: 'Workbench Notification',
        heading,
        cssClass: 'e2e-test-notification-opener',
        tile: {
          label: 'Workbench Notification',
          cssClass: 'e2e-test-notification-opener',
        },
      },
    });
  }

  private installCapabilityRegisterRequestHandler(): void {
    this._messageClient.onMessage<Capability>(`application/${this._symbolicName}/capability/register`, async ({body: capability}) => {
      const capabilityId = await this._manifestService.registerCapability(capability!);
      return (await firstValueFrom(this._manifestService.lookupCapabilities$({id: capabilityId})))[0];
    });
  }

  private installCapabilityUnregisterRequestHandler(): void {
    this._messageClient.onMessage<void>(`application/${this._symbolicName}/capability/:capabilityId/unregister`, async message => {
      await this._manifestService.unregisterCapabilities({id: message.params?.get('capabilityId')});
      return true;
    });
  }

  private installIntentionRegisterRequestHandler(): void {
    this._messageClient.onMessage<Intention>(`application/${this._symbolicName}/intention/register`, async ({body: intention}) => {
      return this._manifestService.registerIntention(intention!);
    });
  }
}

type WorkbenchViewTestingAppCapability = WorkbenchViewCapability & {
  properties: {
    tile: {
      label: string;
      cssClass: string;
    };
  };
};
