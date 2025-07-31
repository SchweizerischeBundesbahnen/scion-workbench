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
import {WorkbenchLayout, WorkbenchLayoutFn} from '@scion/workbench';
import {SelectionPagePO} from './page-object/selection-page/selection-page.po';

export interface Type<T> extends Function { // eslint-disable-line @typescript-eslint/no-unsafe-function-type
  new(...args: any[]): T; // eslint-disable-line @typescript-eslint/prefer-function-type
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
  /**
   * Opens the page to provide or listen to selections.
   */
  public openInNewTab(page: Type<SelectionPagePO>): Promise<SelectionPagePO>;

  public async openInNewTab(page: Type<unknown>): Promise<unknown> {
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
        return new LayoutPagePO(this._appPO.view({viewId, cssClass: 'e2e-test-layout'}));
      }
      case ViewPagePO: {
        await startPage.openWorkbenchView('e2e-test-view');
        return new ViewPagePO(this._appPO, {viewId, cssClass: 'e2e-test-view'});
      }
      case SelectionPagePO: {
        await startPage.openWorkbenchView('e2e-test-selection');
        return new SelectionPagePO(this._appPO.view({viewId, cssClass: 'e2e-test-selection'}));
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
  public async createPerspective(id: string, layoutFn: WorkbenchLayoutFn, options?: PerspectiveCreateOptions): Promise<string>;
  public async createPerspective(layoutFn: WorkbenchLayoutFn, options?: PerspectiveCreateOptions): Promise<string>;
  public async createPerspective(arg1: string | WorkbenchLayoutFn, arg2?: WorkbenchLayoutFn | PerspectiveCreateOptions, arg3?: PerspectiveCreateOptions): Promise<string> {
    const id = typeof arg1 === 'string' ? arg1 : crypto.randomUUID();
    const layoutFn = typeof arg1 === 'function' ? arg1 : arg2 as WorkbenchLayoutFn;
    const options = (typeof arg1 === 'function' ? arg2 : arg3) as PerspectiveCreateOptions | undefined;

    const layoutPage = await this.openInNewTab(LayoutPagePO);
    await layoutPage.createPerspective(id, {layout: layoutFn});
    await layoutPage.view.tab.close();
    if (options?.activate ?? true) {
      await this._appPO.switchPerspective(id);
    }
    return id;
  }

  /**
   * Modifies the current workbench layout.
   *
   * @see WorkbenchRouter.navigate
   */
  public async modifyLayout(layoutFn: (layout: WorkbenchLayout) => WorkbenchLayout): Promise<void> {
    const layoutPage = await this.openInNewTab(LayoutPagePO);
    await layoutPage.modifyLayout(layoutFn);
    await layoutPage.view.tab.close({programmatic: true});
  }
}

/**
 * Controls the creation of the perspective.
 */
export interface PerspectiveCreateOptions {
  /**
   * Controls if to activate the perspective.
   */
  activate?: boolean;
}
