/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {WorkbenchMessageBoxPagePO} from './workbench/page-object/workbench-message-box-page.po';
import {MessageBoxPO} from './message-box.po';
import {DomRect, fromRect} from './helper/testing.util';

/**
 * Page object to interact with the default workbench message box displaying a text.
 */
export class TextMessageBoxPagePO implements WorkbenchMessageBoxPagePO {

  public readonly locator: Locator;
  public readonly text: Locator;

  constructor(public messageBox: MessageBoxPO) {
    this.locator = this.messageBox.locator.locator('div.e2e-message');
    this.text = this.locator;
  }

  public async isTextSelectable(): Promise<boolean> {
    const text = await this.text.innerText();

    await this.text.dblclick();
    const selection: string | undefined = await this.locator.page().evaluate(() => window.getSelection()?.toString());

    return selection?.length && text.includes(selection) || false;
  }

  public async getTextBoundingBox(): Promise<DomRect> {
    return fromRect(await this.text.boundingBox());
  }
}
