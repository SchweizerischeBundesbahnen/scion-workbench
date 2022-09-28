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
import {RouterModule} from '@angular/router';
import {Beans} from '@scion/toolkit/bean-manager';
import {APP_IDENTITY, ManifestService, MessageClient} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities, WorkbenchPopupCapability, WorkbenchViewCapability} from '@scion/workbench-client';

declare type TestingAppViewCapability = WorkbenchViewCapability & {properties: {pinToStartPage?: boolean}};

@NgModule({
  providers: [],
  imports: [
    RouterModule.forChild([]),
  ],
})
export class ActivatorModule {

  constructor(private _manifestService: ManifestService, @Inject(APP_IDENTITY) symbolicName: string) {
    this.registerManifestObjects(symbolicName).then(() => Beans.get(MessageClient).publish('activator-ready'));
  }

  private async registerManifestObjects(appSymbolicName: string): Promise<void> {
    const app = /workbench-client-testing-(?<app>.+)/.exec(appSymbolicName).groups['app'];
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
        pinToStartPage: true,
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
        pinToStartPage: true,
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
        pinToStartPage: true,
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
        pinToStartPage: true,
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
        pinToStartPage: true,
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
        path: 'test-popup',
        pinToStartPage: true,
        title: 'Workbench Popup',
        heading,
        cssClass: 'e2e-test-popup',
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
        path: 'popup',
        cssClass: 'e2e-test-popup',
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
        path: 'test-message-box',
        pinToStartPage: true,
        title: 'Workbench Message Box',
        heading,
        cssClass: 'e2e-test-message-box',
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
        path: 'test-notification',
        pinToStartPage: true,
        title: 'Workbench Notification',
        heading,
        cssClass: 'e2e-test-notification',
      },
    });

    // Register view to test bulk navigation, i.e. navigating to multiple views very quickly.
    await this._manifestService.registerCapability<TestingAppViewCapability>({
      type: WorkbenchCapabilities.View,
      qualifier: {
        component: 'bulk-navigation-test',
        app,
      },
      description: '[e2e] Allows testing bulk navigation',
      private: false,
      properties: {
        path: 'test-pages/bulk-navigation-test-page',
        title: 'Bulk Navigation Test',
        heading,
        cssClass: 'e2e-test-bulk-navigation',
      },
    });
  }
}
