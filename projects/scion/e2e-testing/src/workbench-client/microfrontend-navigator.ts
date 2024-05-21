/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from '../app.po';
import {MessageBoxOpenerPagePO} from './page-object/message-box-opener-page.po';
import {ViewPagePO} from './page-object/view-page.po';
import {NotificationOpenerPagePO} from './page-object/notification-opener-page.po';
import {RouterPagePO} from './page-object/router-page.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {Capability, Intention} from '@scion/microfrontend-platform';
import {DialogOpenerPagePO} from './page-object/dialog-opener-page.po';
import {MicrofrontendPlatformPagePO} from '../workbench/page-object/microfrontend-platform-page/microfrontend-platform-page.po';
import {Application} from '../workbench/page-object/microfrontend-platform-page/application';

export interface Type<T> extends Function { // eslint-disable-line @typescript-eslint/ban-types
  new(...args: any[]): T;
}

/**
 * Navigates to microfrontends of the 'workbench-client-testing-app' in a new workbench view tab.
 */
export class MicrofrontendNavigator {

  constructor(private _appPO: AppPO) {
  }

  /**
   * Opens the page to test the message box in a new workbench tab.
   */
  public openInNewTab(page: Type<MessageBoxOpenerPagePO>, app: 'app1' | 'app2'): Promise<MessageBoxOpenerPagePO>;
  /**
   * Opens the page to test the notification in a new workbench tab.
   */
  public openInNewTab(page: Type<NotificationOpenerPagePO>, app: 'app1' | 'app2'): Promise<NotificationOpenerPagePO>;
  /**
   * Opens the page to inspect view properties in a new workbench tab.
   */
  public openInNewTab(page: Type<ViewPagePO>, app: 'app1' | 'app2'): Promise<ViewPagePO>;
  /**
   * Opens the page to navigate to microfrontends in a new workbench tab.
   */
  public openInNewTab(page: Type<RouterPagePO>, app: 'app1' | 'app2'): Promise<RouterPagePO>;
  /**
   * Opens the page to open popups in a new workbench tab.
   */
  public openInNewTab(page: Type<PopupOpenerPagePO>, app: 'app1' | 'app2'): Promise<PopupOpenerPagePO>;
  /**
   * Opens the page to open dialog in a new workbench tab.
   */
  public openInNewTab(page: Type<DialogOpenerPagePO>, app: 'app1' | 'app2'): Promise<DialogOpenerPagePO>;
  /**
   * Opens the page to interact with the SCION Microfrontend Platform
   */
  public openInNewTab(page: Type<MicrofrontendPlatformPagePO>): Promise<MicrofrontendPlatformPagePO>;

  public async openInNewTab(page: Type<any>, app?: 'app1' | 'app2' | 'host'): Promise<any> {
    const application = this.resolveApplication(app ?? 'host');
    const startPage = await this._appPO.openNewViewTab();
    const viewId = await startPage.view.getViewId();

    switch (page) {
      case MessageBoxOpenerPagePO: {
        await startPage.openMicrofrontendView('e2e-test-message-box-opener', application);
        return new MessageBoxOpenerPagePO(this._appPO, {viewId, cssClass: 'e2e-test-message-box-opener'});
      }
      case ViewPagePO: {
        await startPage.openMicrofrontendView('e2e-test-view', application);
        return new ViewPagePO(this._appPO, {viewId, cssClass: 'e2e-test-view'});
      }
      case NotificationOpenerPagePO: {
        await startPage.openMicrofrontendView('e2e-test-notification-opener', application);
        return new NotificationOpenerPagePO(this._appPO, {viewId, cssClass: 'e2e-test-notification-opener'});
      }
      case RouterPagePO: {
        await startPage.openMicrofrontendView('e2e-test-router', application);
        return new RouterPagePO(this._appPO, {viewId, cssClass: 'e2e-test-router'});
      }
      case PopupOpenerPagePO: {
        await startPage.openMicrofrontendView('e2e-test-popup-opener', application);
        return new PopupOpenerPagePO(this._appPO, {viewId, cssClass: 'e2e-test-popup-opener'});
      }
      case DialogOpenerPagePO: {
        await startPage.openMicrofrontendView('e2e-test-dialog-opener', application);
        return new DialogOpenerPagePO(this._appPO, {viewId, cssClass: 'e2e-test-dialog-opener'});
      }
      case MicrofrontendPlatformPagePO: {
        await startPage.openMicrofrontendView('e2e-microfrontend-platform', application);
        return new MicrofrontendPlatformPagePO(this._appPO, {viewId, cssClass: 'e2e-microfrontend-platform'});
      }
      default: {
        throw Error(`[TestError] Page not supported to be opened in a new tab. [page=${page}]`);
      }
    }
  }

  /**
   * Use to register a workbench capability.
   */
  public async registerCapability<T extends Capability>(app: 'app1' | 'app2' | 'host', capability: T): Promise<T & Capability> {
    const microfrontendPlatformPage = await this.openInNewTab(MicrofrontendPlatformPagePO);
    try {
      return await microfrontendPlatformPage.registerCapability(this.resolveApplication(app), capability);
    }
    finally {
      await microfrontendPlatformPage.view.tab.close();
    }
  }

  /**
   * Use to register a workbench intention.
   */
  public async registerIntention(app: 'app1' | 'app2', intention: Intention & {type: 'view' | 'dialog' | 'popup' | 'messagebox' | 'notification'}): Promise<string> {
    const microfrontendPlatformPage = await this.openInNewTab(MicrofrontendPlatformPagePO);
    try {
      return await microfrontendPlatformPage.registerIntention(this.resolveApplication(app), intention);
    }
    finally {
      await microfrontendPlatformPage.view.tab.close();
    }
  }

  /**
   * Use to unregister a workbench capability.
   */
  public async unregisterCapability(app: 'app1' | 'app2', id: string): Promise<void> {
    const microfrontendPlatformPage = await this.openInNewTab(MicrofrontendPlatformPagePO);
    try {
      return await microfrontendPlatformPage.unregisterCapability(this.resolveApplication(app), id);
    }
    finally {
      await microfrontendPlatformPage.view.tab.close();
    }
  }

  private resolveApplication(app: 'host' | 'app1' | 'app2'): Application {
    switch (app) {
      case 'app1':
        return 'workbench-client-testing-app1';
      case 'app2':
        return 'workbench-client-testing-app2';
      case 'host':
        return 'workbench-host-app';
      default: {
        throw Error('[PageObjectError] Unkown application. Known applications are: ...');
      }
    }
  }
}
