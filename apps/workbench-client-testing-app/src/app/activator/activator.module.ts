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
import {APP_IDENTITY, ManifestService, MessageClient} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities, WorkbenchDialogCapability, WorkbenchMessageBoxCapability, WorkbenchPopupCapability, WorkbenchViewCapability} from '@scion/workbench-client';

@NgModule({})
export default class ActivatorModule {

  constructor(private _manifestService: ManifestService, @Inject(APP_IDENTITY) symbolicName: string) {
    this.registerManifestObjects(symbolicName).then(() => Beans.get(MessageClient).publish('activator-ready'));
  }

  private async registerManifestObjects(appSymbolicName: string): Promise<void> {
    const app = /workbench-client-testing-(?<app>.+)/.exec(appSymbolicName)!.groups!['app'];
    const heading = `${app}: Workbench Client E2E Testpage`;

    // Register view to interact with the workbench view object.
    await this._manifestService.registerCapability<TestingAppViewCapability>({
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
        pinToDesktop: true,
        title: 'Workbench View',
        heading,
        cssClass: 'e2e-test-view',
      },
    });

    // Register view to navigate using the workbench router.
    await this._manifestService.registerCapability<TestingAppViewCapability>({
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
        pinToDesktop: true,
        title: 'Workbench Router',
        heading,
        cssClass: 'e2e-test-router',
      },
    });

    // Register view to register workbench capabilities dynamically at runtime.
    await this._manifestService.registerCapability<TestingAppViewCapability>({
      type: WorkbenchCapabilities.View,
      qualifier: {
        component: 'register-workbench-capability',
        app,
      },
      description: '[e2e] Allows registering workbench capabilities',
      private: false,
      properties: {
        path: 'register-workbench-capability',
        showSplash: true,
        pinToDesktop: true,
        title: 'Register Capability',
        heading,
        cssClass: 'e2e-register-workbench-capability',
      },
    });

    // Register view to unregister workbench capabilities dynamically at runtime.
    await this._manifestService.registerCapability<TestingAppViewCapability>({
      type: WorkbenchCapabilities.View,
      qualifier: {
        component: 'unregister-workbench-capability',
        app,
      },
      description: '[e2e] Allows unregistering workbench capabilities',
      private: false,
      properties: {
        path: 'unregister-workbench-capability',
        showSplash: true,
        pinToDesktop: true,
        title: 'Unregister Capability',
        heading,
        cssClass: 'e2e-unregister-workbench-capability',
      },
    });

    // Register view to register view intentions dynamically at runtime.
    await this._manifestService.registerCapability<TestingAppViewCapability>({
      type: WorkbenchCapabilities.View,
      qualifier: {
        component: 'register-workbench-intention',
        app,
      },
      description: '[e2e] Allows registering view intentions',
      private: false,
      properties: {
        path: 'register-workbench-intention',
        showSplash: true,
        pinToDesktop: true,
        title: 'Register Intention',
        heading,
        cssClass: 'e2e-register-workbench-intention',
      },
    });

    // Register view to open a workbench popup.
    await this._manifestService.registerCapability<TestingAppViewCapability>({
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
        pinToDesktop: true,
        title: 'Workbench Popup',
        heading,
        cssClass: 'e2e-test-popup-opener',
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
    await this._manifestService.registerCapability<TestingAppViewCapability>({
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
        pinToDesktop: true,
        title: 'Workbench Dialog',
        heading,
        cssClass: 'e2e-test-dialog-opener',
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
    await this._manifestService.registerCapability<TestingAppViewCapability>({
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
        pinToDesktop: true,
        title: 'Workbench Message Box',
        heading,
        cssClass: 'e2e-test-message-box-opener',
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
    await this._manifestService.registerCapability<TestingAppViewCapability>({
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
        pinToDesktop: true,
        title: 'Workbench Notification',
        heading,
        cssClass: 'e2e-test-notification-opener',
      },
    });

    // Register view to exchange messages via @scion/microfrontend-platform.
    await this._manifestService.registerCapability<TestingAppViewCapability>({
      type: WorkbenchCapabilities.View,
      qualifier: {
        component: 'messaging',
        app,
      },
      description: '[e2e] Allows exchanging messages via @scion/microfrontend-platform',
      private: false,
      properties: {
        path: 'messaging',
        showSplash: true,
        pinToDesktop: true,
        title: 'Messaging',
        heading,
        cssClass: 'e2e-messaging',
      },
    });
  }
}

type TestingAppViewCapability = WorkbenchViewCapability & {properties: {pinToDesktop?: boolean}};
