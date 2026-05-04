/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {ViewPO} from '../../../view.po';
import {DialogPO} from '../../../dialog.po';
import {WorkbenchDialogPagePO} from '../workbench-dialog-page.po';
import {WorkbenchViewPagePO} from '../workbench-view-page.po';
import {PopupPO} from '../../../popup.po';
import {WorkbenchPopupPagePO} from '../workbench-popup-page.po';
import {PartPO} from '../../../part.po';
import {SciKeyValuePO} from '../../../@scion/components.internal/key-value.po';
import {DomRect, fromRect} from '../../../helper/testing.util';
import {NotificationPO} from '../../../notification.po';
import {WorkbenchNotificationPagePO} from '../workbench-notification-page.po';

export class WorkbenchHandleBoundsTestPagePO implements WorkbenchViewPagePO, WorkbenchDialogPagePO, WorkbenchPopupPagePO, WorkbenchNotificationPagePO {

  public readonly locator: Locator;

  constructor(private _locateBy: PartPO | ViewPO | DialogPO | PopupPO | NotificationPO) {
    this.locator = this._locateBy.locator.locator('app-workbench-handle-bounds-test-page');
  }

  public async getBounds(): Promise<DomRect> {
    const bounds = await new SciKeyValuePO(this.locator.locator('sci-key-value.e2e-bounds')).readEntries();
    return fromRect({
      x: +bounds['x']!,
      y: +bounds['y']!,
      width: +bounds['width']!,
      height: +bounds['height']!,
    });
  }

  public async enterContentSize(size: {width?: string; height?: string}): Promise<void> {
    await this.locator.locator('input.e2e-width').fill(size.width ?? '');
    await this.locator.locator('input.e2e-height').fill(size.height ?? '');
  }

  public async enterDialogSize(size: {width?: string; height?: string}): Promise<void> {
    await this.locator.locator('input.e2e-dialog-width').fill(size.width ?? '');
    await this.locator.locator('input.e2e-dialog-height').fill(size.height ?? '');
  }

  public async enterNotificationSize(size: {height?: string}): Promise<void> {
    await this.locator.locator('input.e2e-notification-height').fill(size.height ?? '');
  }

  public get view(): ViewPO {
    if (this._locateBy instanceof ViewPO) {
      return this._locateBy;
    }
    else {
      throw Error('[PageObjectError] Test page not opened in a view.');
    }
  }

  public get dialog(): DialogPO {
    if (this._locateBy instanceof DialogPO) {
      return this._locateBy;
    }
    else {
      throw Error('[PageObjectError] Test page not opened in a dialog.');
    }
  }

  public get popup(): PopupPO {
    if (this._locateBy instanceof PopupPO) {
      return this._locateBy;
    }
    else {
      throw Error('[PageObjectError] Test page not opened in a popup.');
    }
  }

  public get notification(): NotificationPO {
    if (this._locateBy instanceof NotificationPO) {
      return this._locateBy;
    }
    else {
      throw Error('[PageObjectError] Test page not opened in a notification.');
    }
  }
}
