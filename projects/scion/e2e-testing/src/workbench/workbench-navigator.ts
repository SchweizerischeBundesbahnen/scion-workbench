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
import {LayoutPagePO} from './page-object/layout-page/layout-page.po';
import {DialogOpenerPagePO} from './page-object/dialog-opener-page.po';
import {WorkbenchLayout, WorkbenchLayoutFactory} from '@scion/workbench';

export interface Type<T> extends Function { // eslint-disable-line @typescript-eslint/ban-types
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
   * Opens the page to test the dialog in a new workbench tab.
   */
  public openInNewTab(page: Type<DialogOpenerPagePO>): Promise<DialogOpenerPagePO>;
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
   * Opens the page to change the layout in a new workbench tab.
   */
  public openInNewTab(page: Type<LayoutPagePO>): Promise<LayoutPagePO>;
  /**
   * Opens the page to inspect view properties in a new workbench tab.
   */
  public openInNewTab(page: Type<ViewPagePO>): Promise<ViewPagePO>;

  public async openInNewTab(page: Type<any>): Promise<any> {
    const startPage = await this._appPO.openNewViewTab();
    const viewId = await startPage.view.getViewId();

    switch (page) {
      case MessageBoxOpenerPagePO: {
        await startPage.openWorkbenchView('e2e-test-message-box-opener');
        return new MessageBoxOpenerPagePO(this._appPO, {viewId, cssClass: 'e2e-test-message-box-opener'});
      }
      case DialogOpenerPagePO: {
        await startPage.openWorkbenchView('e2e-test-dialog-opener');
        return new DialogOpenerPagePO(this._appPO.view({viewId, cssClass: 'e2e-test-dialog-opener'}));
      }
      case NotificationOpenerPagePO: {
        await startPage.openWorkbenchView('e2e-test-notification-opener');
        return new NotificationOpenerPagePO(this._appPO, {viewId, cssClass: 'e2e-test-notification-opener'});
      }
      case PopupOpenerPagePO: {
        await startPage.openWorkbenchView('e2e-test-popup-opener');
        return new PopupOpenerPagePO(this._appPO.view({viewId, cssClass: 'e2e-test-popup-opener'}));
      }
      case RouterPagePO: {
        await startPage.openWorkbenchView('e2e-test-router');
        return new RouterPagePO(this._appPO, {viewId, cssClass: 'e2e-test-router'});
      }
      case LayoutPagePO: {
        await startPage.openWorkbenchView('e2e-test-layout');
        return new LayoutPagePO(this._appPO, {viewId, cssClass: 'e2e-test-layout'});
      }
      case ViewPagePO: {
        await startPage.openWorkbenchView('e2e-test-view');
        return new ViewPagePO(this._appPO, {viewId, cssClass: 'e2e-test-view'});
      }
      default: {
        throw Error(`[TestError] Page not supported to be opened in a new tab. [page=${page}]`);
      }
    }
  }

  /**
   * Creates a perspective and activates it.
   *
   * @see WorkbenchService.registerPerspective
   * @see WorkbenchService.switchPerspective
   */
  public async createPerspective(defineLayoutFn: (factory: WorkbenchLayoutFactory) => WorkbenchLayout): Promise<string> {
    const id = crypto.randomUUID();
    const layoutPage = await this.openInNewTab(LayoutPagePO);
    await layoutPage.createPerspective(id, {layout: defineLayoutFn});
    await layoutPage.view.tab.close();
    await this._appPO.switchPerspective(id);
    return id;
  }

  /**
   * Modifies the current workbench layout.
   *
   * @see WorkbenchRouter.navigate
   */
  public async modifyLayout(modifyLayoutFn: (layout: WorkbenchLayout, activePartId: string) => WorkbenchLayout): Promise<void> {
    const layoutPage = await this.openInNewTab(LayoutPagePO);
    await layoutPage.modifyLayout(modifyLayoutFn);
    await layoutPage.view.tab.close();
  }
}
