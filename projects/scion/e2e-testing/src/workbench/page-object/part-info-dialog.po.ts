/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {DialogPO} from '../../dialog.po';
import {WorkbenchDialogPagePO} from './workbench-dialog-page.po';
import {PartId} from '@scion/workbench';
import {toTypedString} from '../../helper/typed-value.util';

/**
 * Page object to interact with {@link PartInfoDialogComponent}.
 */
export class PartInfoDialogPO implements WorkbenchDialogPagePO {

  public readonly locator: Locator;

  constructor(public dialog: DialogPO) {
    this.locator = this.dialog.locator.locator('app-part-info-dialog');
  }

  public async enterPartId(partId: PartId): Promise<void> {
    await this.locator.locator('input.e2e-part-id').fill(partId);
  }

  public async enterBadge(badge: string | number | boolean | undefined): Promise<void> {
    await this.locator.locator('input.e2e-badge').fill(toTypedString(badge));
  }

  public close(): Promise<void> {
    return this.dialog.close();
  }
}
