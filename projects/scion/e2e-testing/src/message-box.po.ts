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
import {DialogPO} from './dialog.po';
import {DomRect, fromRect} from './helper/testing.util';

/**
 * PO for interacting with a workbench message box.
 */
export class MessageBoxPO {

  private readonly _header: Locator;
  private readonly _footer: Locator;

  public readonly locator: Locator;
  public readonly title: Locator;
  public readonly actions: Locator;

  constructor(public dialog: DialogPO) {
    this.locator = this.dialog.locator.locator('wb-message-box');
    this._header = this.dialog.header.locator('wb-message-box-header');
    this._footer = this.dialog.footer.locator('wb-message-box-footer');
    this.title = this._header.locator('span.e2e-title');
    this.actions = this._footer.locator('button.e2e-action');
  }

  public async getSeverity(): Promise<'info' | 'warn' | 'error'> {
    return await this._header.getAttribute('data-severity') as 'info' | 'warn' | 'error';
  }

  public async getActions(): Promise<{[key: string]: string}> {
    const actions = new Map<string, string>();
    for (const locator of await this.actions.all()) {
      const action = await locator.getAttribute('data-action') ?? '?';
      const label = await locator.innerText();
      actions.set(action, label);
    }
    return Object.fromEntries(actions);
  }

  public async clickActionButton(action: string): Promise<void> {
    await this.actions.locator(`:scope[data-action="${action}"]`).click();
  }

  /**
   * Gets the bounding box of the message box slot.
   */
  public async getSlotBoundingBox(): Promise<DomRect> {
    return fromRect(await this.locator.locator('> div.e2e-slot').boundingBox());
  }
}
