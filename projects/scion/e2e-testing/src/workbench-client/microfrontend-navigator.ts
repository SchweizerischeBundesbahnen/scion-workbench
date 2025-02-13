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
import {RegisterWorkbenchIntentionPagePO} from './page-object/register-workbench-intention-page.po';
import {RegisterWorkbenchCapabilityPagePO, WorkbenchDialogCapability, WorkbenchMessageBoxCapability, WorkbenchPerspectiveCapability, WorkbenchPopupCapability, WorkbenchViewCapability} from './page-object/register-workbench-capability-page.po';
import {ViewPagePO} from './page-object/view-page.po';
import {UnregisterWorkbenchCapabilityPagePO} from './page-object/unregister-workbench-capability-page.po';
import {NotificationOpenerPagePO} from './page-object/notification-opener-page.po';
import {RouterPagePO} from './page-object/router-page.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {MessagingPagePO} from './page-object/messaging-page.po';
import {Capability, Intention} from '@scion/microfrontend-platform';
import {DialogOpenerPagePO} from './page-object/dialog-opener-page.po';

export interface Type<T> extends Function { // eslint-disable-line @typescript-eslint/no-unsafe-function-type
  new(...args: any[]): T; // eslint-disable-line @typescript-eslint/prefer-function-type
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
   * Opens the page to register intentions in a new workbench tab.
   */
  public openInNewTab(page: Type<RegisterWorkbenchIntentionPagePO>, app: 'app1' | 'app2'): Promise<RegisterWorkbenchIntentionPagePO>;
  /**
   * Opens the page to register capabilities in a new workbench tab.
   */
  public openInNewTab(page: Type<RegisterWorkbenchCapabilityPagePO>, app: 'app1' | 'app2'): Promise<RegisterWorkbenchCapabilityPagePO>;
  /**
   * Opens the page to unregister capabilities in a new workbench tab.
   */
  public openInNewTab(page: Type<UnregisterWorkbenchCapabilityPagePO>, app: 'app1' | 'app2'): Promise<UnregisterWorkbenchCapabilityPagePO>;
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
   * Opens the page to exchange messages in a new workbench tab.
   */
  public openInNewTab(page: Type<MessagingPagePO>, app: 'app1' | 'app2'): Promise<MessagingPagePO>;

  public async openInNewTab(page: Type<any>, app: 'app1' | 'app2'): Promise<any> {
    const startPage = await this._appPO.openNewViewTab();
    const viewId = await startPage.view.getViewId();

    switch (page) {
      case MessageBoxOpenerPagePO: {
        await startPage.openMicrofrontendView('e2e-test-message-box-opener', app);
        return new MessageBoxOpenerPagePO(this._appPO, {viewId, cssClass: 'e2e-test-message-box-opener'});
      }
      case RegisterWorkbenchIntentionPagePO: {
        await startPage.openMicrofrontendView('e2e-register-workbench-intention', app);
        return new RegisterWorkbenchIntentionPagePO(this._appPO, {viewId, cssClass: 'e2e-register-workbench-intention'});
      }
      case RegisterWorkbenchCapabilityPagePO: {
        await startPage.openMicrofrontendView('e2e-register-workbench-capability', app);
        return new RegisterWorkbenchCapabilityPagePO(this._appPO, {viewId, cssClass: 'e2e-register-workbench-capability'});
      }
      case ViewPagePO: {
        await startPage.openMicrofrontendView('e2e-test-view', app);
        return new ViewPagePO(this._appPO, {viewId, cssClass: 'e2e-test-view'});
      }
      case UnregisterWorkbenchCapabilityPagePO: {
        await startPage.openMicrofrontendView('e2e-unregister-workbench-capability', app);
        return new UnregisterWorkbenchCapabilityPagePO(this._appPO, {viewId, cssClass: 'e2e-unregister-workbench-capability'});
      }
      case NotificationOpenerPagePO: {
        await startPage.openMicrofrontendView('e2e-test-notification-opener', app);
        return new NotificationOpenerPagePO(this._appPO, {viewId, cssClass: 'e2e-test-notification-opener'});
      }
      case RouterPagePO: {
        await startPage.openMicrofrontendView('e2e-test-router', app);
        return new RouterPagePO(this._appPO, {viewId, cssClass: 'e2e-test-router'});
      }
      case PopupOpenerPagePO: {
        await startPage.openMicrofrontendView('e2e-test-popup-opener', app);
        return new PopupOpenerPagePO(this._appPO, {viewId, cssClass: 'e2e-test-popup-opener'});
      }
      case DialogOpenerPagePO: {
        await startPage.openMicrofrontendView('e2e-test-dialog-opener', app);
        return new DialogOpenerPagePO(this._appPO, {viewId, cssClass: 'e2e-test-dialog-opener'});
      }
      case MessagingPagePO: {
        await startPage.openMicrofrontendView('e2e-messaging', app);
        return new MessagingPagePO(this._appPO, {viewId, cssClass: 'e2e-messaging'});
      }
      default: {
        throw Error(`[TestError] Page not supported to be opened in a new tab. [page=${page}]`);
      }
    }
  }

  /**
   * Use to register a workbench capability.
   */
  public async registerCapability<T extends WorkbenchViewCapability | WorkbenchPopupCapability | WorkbenchDialogCapability | WorkbenchMessageBoxCapability | WorkbenchPerspectiveCapability>(app: 'app1' | 'app2', capability: T): Promise<T & Capability> {
    const registerCapabilityPage = await this.openInNewTab(RegisterWorkbenchCapabilityPagePO, app);
    try {
      return await registerCapabilityPage.registerCapability(capability);
    }
    finally {
      await registerCapabilityPage.view.tab.close();
    }
  }

  /**
   * Use to register a workbench intention.
   */
  public async registerIntention(app: 'app1' | 'app2', intention: Intention & {type: 'perspective' | 'view' | 'dialog' | 'popup' | 'messagebox' | 'notification'}): Promise<string> {
    const registerIntentionPage = await this.openInNewTab(RegisterWorkbenchIntentionPagePO, app);
    try {
      return await registerIntentionPage.registerIntention(intention);
    }
    finally {
      await registerIntentionPage.view.tab.close();
    }
  }

  /**
   * Use to unregister a workbench capability.
   */
  public async unregisterCapability(app: 'app1' | 'app2', id: string): Promise<void> {
    const unregisterCapabilityPage = await this.openInNewTab(UnregisterWorkbenchCapabilityPagePO, app);
    try {
      await unregisterCapabilityPage.unregisterCapability(id);
    }
    finally {
      await unregisterCapabilityPage.view.tab.close();
    }
  }
}
