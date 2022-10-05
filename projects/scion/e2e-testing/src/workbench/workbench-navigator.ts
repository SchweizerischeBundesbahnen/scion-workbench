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
import {NotificationOpenerPagePO} from './page-object/notification-opener-page.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {RouterPagePO} from './page-object/router-page.po';
import {ViewPagePO} from './page-object/view-page.po';

export interface Type<T> extends Function {
  new(...args: any[]): T;
}

/**
 * Navigates to pages of the 'workbench-testing-app' in a new workbench view tab.
 */
export class WorkbenchNavigator {

  constructor(private _appPO: AppPO) {
  }

  /**
   * Opens the page to test the message box in a new workbench tab.
   */
  public openInNewTab(page: Type<MessageBoxOpenerPagePO>): Promise<MessageBoxOpenerPagePO>;
  /**
   * Opens the page to test the notification in a new workbench tab.
   */
  public openInNewTab(page: Type<NotificationOpenerPagePO>): Promise<NotificationOpenerPagePO>;
  /**
   * Opens the page to open popups in a new workbench tab.
   */
  public openInNewTab(page: Type<PopupOpenerPagePO>): Promise<PopupOpenerPagePO>;
  /**
   * Opens the page to navigate to views in a new workbench tab.
   */
  public openInNewTab(page: Type<RouterPagePO>): Promise<RouterPagePO>;
  /**
   * Opens the page to inspect view properties in a new workbench tab.
   */
  public openInNewTab(page: Type<ViewPagePO>): Promise<ViewPagePO>;

  public async openInNewTab(page: Type<any>): Promise<any> {
    const startPO = await this._appPO.openNewViewTab();
    const viewId = startPO.viewId!;

    switch (page) {
      case MessageBoxOpenerPagePO: {
        await startPO.openWorkbenchView('e2e-test-message-box');
        return new MessageBoxOpenerPagePO(this._appPO, viewId);
      }
      case NotificationOpenerPagePO: {
        await startPO.openWorkbenchView('e2e-test-notification');
        return new NotificationOpenerPagePO(this._appPO, viewId);
      }
      case PopupOpenerPagePO: {
        await startPO.openWorkbenchView('e2e-test-popup');
        return new PopupOpenerPagePO(this._appPO, viewId);
      }
      case RouterPagePO: {
        await startPO.openWorkbenchView('e2e-test-router');
        return new RouterPagePO(this._appPO, viewId);
      }
      case ViewPagePO: {
        await startPO.openWorkbenchView('e2e-test-view');
        return new ViewPagePO(this._appPO, viewId);
      }
      default: {
        throw Error(`[TestError] Page not supported to be opened in a new tab. [page=${page}]`);
      }
    }
  }
}
