/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
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
import {RegisterWorkbenchCapabilityPagePO} from './page-object/register-workbench-capability-page.po';
import {ViewPagePO} from './page-object/view-page.po';
import {UnregisterWorkbenchCapabilityPagePO} from './page-object/unregister-workbench-capability-page.po';
import {NotificationOpenerPagePO} from './page-object/notification-opener-page.po';
import {RouterPagePO} from './page-object/router-page.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';

export interface Type<T> extends Function {
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

  public async openInNewTab(page: Type<any>, app: 'app1' | 'app2'): Promise<any> {
    const startPO = await this._appPO.openNewViewTab();
    const viewId = await this._appPO.activePart({scope: 'mainArea'}).activeView.getViewId();

    switch (page) {
      case MessageBoxOpenerPagePO: {
        await startPO.openMicrofrontendView('e2e-test-message-box-opener', app);
        return new MessageBoxOpenerPagePO(this._appPO, viewId);
      }
      case RegisterWorkbenchIntentionPagePO: {
        await startPO.openMicrofrontendView('e2e-register-workbench-intention', app);
        return new RegisterWorkbenchIntentionPagePO(this._appPO, viewId);
      }
      case RegisterWorkbenchCapabilityPagePO: {
        await startPO.openMicrofrontendView('e2e-register-workbench-capability', app);
        return new RegisterWorkbenchCapabilityPagePO(this._appPO, viewId);
      }
      case ViewPagePO: {
        await startPO.openMicrofrontendView('e2e-test-view', app);
        return new ViewPagePO(this._appPO, viewId);
      }
      case UnregisterWorkbenchCapabilityPagePO: {
        await startPO.openMicrofrontendView('e2e-unregister-workbench-capability', app);
        return new UnregisterWorkbenchCapabilityPagePO(this._appPO, viewId);
      }
      case NotificationOpenerPagePO: {
        await startPO.openMicrofrontendView('e2e-test-notification-opener', app);
        return new NotificationOpenerPagePO(this._appPO, viewId);
      }
      case RouterPagePO: {
        await startPO.openMicrofrontendView('e2e-test-router', app);
        return new RouterPagePO(this._appPO, viewId);
      }
      case PopupOpenerPagePO: {
        await startPO.openMicrofrontendView('e2e-test-popup-opener', app);
        return new PopupOpenerPagePO(this._appPO, viewId);
      }
      default: {
        throw Error(`[TestError] Page not supported to be opened in a new tab. [page=${page}]`);
      }
    }
  }
}
