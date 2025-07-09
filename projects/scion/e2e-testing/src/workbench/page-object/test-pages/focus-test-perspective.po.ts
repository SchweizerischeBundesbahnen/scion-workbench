/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {DialogId, PartId, PopupId, ViewId} from '@scion/workbench';
import {FocusTestPagePO} from './focus-test-page.po';
import {AppPO} from '../../../app.po';
import {RequireOne} from '../../../helper/utility-types';
import {Locator} from '@playwright/test';
import {WorkbenchElementLogPagePagePO} from './workbench-element-log-page-page.po';

export class FocusTestPerspectivePO {

  constructor(private _appPO: AppPO) {
  }

  public async switchTo(): Promise<void> {
    await this._appPO.header.showTestPerspectives();
    await this._appPO.header.highlightFocus();
    await this._appPO.switchPerspective('e2e-focus-test-perspective');
  }

  public async clickPart(locator: RequireOne<{partId: PartId}>): Promise<void> {
    await this._appPO.part({partId: locator.partId}).content.locator.click({position: {x: 10, y: 10}});
  }

  public async clickPartBar(locator: RequireOne<{partId: PartId}>): Promise<void> {
    await this._appPO.part({partId: locator.partId}).bar.locator.click();
  }

  public async clickViewTab(locator: RequireOne<{viewId: ViewId}>): Promise<void> {
    await this._appPO.view({viewId: locator.viewId}).tab.click();
  }

  public async clickDesktop(): Promise<void> {
    await this._appPO.desktop.locator.click({position: {x: 10, y: 10}});
  }

  public async clickPartInput(locator: RequireOne<{partId: PartId}>): Promise<void> {
    await this.partInput(locator).click();
  }

  public async clickViewInput(locator: RequireOne<{viewId: ViewId}>): Promise<void> {
    await this.viewInput(locator).click();
  }

  public async clickDesktopInput(): Promise<void> {
    await this.desktopInput().click();
  }

  public async clickDialogInput(locator: RequireOne<{dialogId: DialogId}>): Promise<void> {
    await this.dialogInput(locator).click();
  }

  public async clickDialogHeader(locator: RequireOne<{dialogId: DialogId}>): Promise<void> {
    await this._appPO.dialog({dialogId: locator.dialogId}).header.click();
  }

  public async clickPopupInput(locator: RequireOne<{popupId: PopupId}>): Promise<void> {
    await this.popupInput(locator).click();
  }

  public partInput(locator: RequireOne<{partId: PartId}>): Locator {
    return new FocusTestPagePO(this._appPO.part({partId: locator.partId})).firstField;
  }

  public viewInput(locator: RequireOne<{viewId: ViewId}>): Locator {
    return new FocusTestPagePO(this._appPO.view({viewId: locator.viewId})).firstField;
  }

  public dialogInput(locator: RequireOne<{dialogId: DialogId}>): Locator {
    return new FocusTestPagePO(this._appPO.dialog({dialogId: locator.dialogId})).firstField;
  }

  public popupInput(locator: RequireOne<{popupId: PopupId}>): Locator {
    return new FocusTestPagePO(this._appPO.popup({popupId: locator.popupId})).firstField;
  }

  public desktopInput(): Locator {
    return new FocusTestPagePO(this._appPO.desktop).firstField;
  }

  public async openLogActivity(options?: {clearLog?: boolean}): Promise<WorkbenchElementLogPagePagePO> {
    await this._appPO.activityItem({cssClass: 'e2e-log'}).click();
    const logPart = new WorkbenchElementLogPagePagePO(this._appPO);
    if (options?.clearLog) {
      await logPart.clearLog();
    }
    return logPart;
  }
}
