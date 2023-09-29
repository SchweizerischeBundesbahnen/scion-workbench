/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {fromRect} from './helper/testing.util';

/**
 * PO for interacting with a workbench dialog.
 */
export class DialogPO {

  public readonly header: Locator;
  public readonly title: Locator;
  public readonly closeButton: Locator;

  constructor(public readonly locator: Locator) {
    this.header = this.locator.locator('header');
    this.title = this.locator.locator('header > div.e2e-title > span');
    this.closeButton = locator.locator('header > button.e2e-close');
  }

  public async getDialogBoundingBox(): Promise<DOMRect> {
    return fromRect(await this.locator.locator('.e2e-dialog-pane').boundingBox());
  }

  public async getGlassPaneBoundingBox(): Promise<DOMRect> {
    return fromRect(await this.locator.page().locator('.cdk-overlay-pane.wb-dialog-glass-pane', {has: this.locator}).boundingBox());
  }

  public async close(options?: {timeout?: number}): Promise<void> {
    await this.closeButton.click(options);
  }

  public async clickHeader(options?: {timeout?: number}): Promise<void> {
    await this.header.click(options);
  }
}
