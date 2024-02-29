/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {WorkbenchDialogPagePO} from '../workbench-dialog-page.po';
import {DialogPO} from '../../../dialog.po';

/**
 * Page object to interact with {@link ViewMoveDialogTestPageComponent}.
 */
export class ViewMoveDialogTestPagePO implements WorkbenchDialogPagePO {

  public readonly locator: Locator;

  constructor(public dialog: DialogPO) {
    this.locator = this.dialog.locator.locator('app-view-move-dialog-test-page');
  }

  public async enterWorkbenchId(workbenchId: string): Promise<void> {
    await this.locator.locator('input.e2e-workbench-id').fill(workbenchId);
  }

  public async enterPartId(partId: string): Promise<void> {
    await this.locator.locator('input.e2e-part-id').fill(partId);
  }

  public async enterRegion(region: 'north' | 'south' | 'west' | 'east' | ''): Promise<void> {
    await this.locator.locator('select.e2e-region').selectOption(region);
  }

  public async pressOK(): Promise<void> {
    await this.dialog.footer.locator('button.e2e-ok').click();
  }
}
