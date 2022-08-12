/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from './app.po';
import {Locator, Page} from '@playwright/test';

/**
 * Page object to interact {@link TextMessageComponent}.
 */
export class TextMessagePO {

  private readonly _page: Page;
  private readonly _locator: Locator;

  constructor(appPO: AppPO, cssClass: string) {
    this._page = appPO.page;
    this._locator = appPO.findMessageBox({cssClass}).locator('wb-text-message');
  }

  public async isVisible(): Promise<boolean> {
    return this._locator.isVisible();
  }

  public async getText(): Promise<string> {
    return this._locator.innerText();
  }

  public async isContentSelectable(): Promise<boolean> {
    const text = await this._locator.innerText();

    await this._locator.dblclick();
    const selection: string = await this._page.evaluate(() => window.getSelection().toString());

    return selection && selection.length && text.includes(selection);
  }
}
