/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { browser, ElementFinder } from 'protractor';
import { SciListItemPO } from './list-item.po';
import { Defined } from '@scion/toolkit/util';

/**
 * Page object for {@link SciListComponent}.
 */
export class SciListPO {

  constructor(private _sciListFinder: ElementFinder) {
  }

  public async getListItems(waitUntil?: WaitUntil): Promise<SciListItemPO[]> {
    waitUntil && await this.waitForListItems(waitUntil);

    const listItemFinders: ElementFinder[] = await this._sciListFinder.$$('sci-list-item');
    return listItemFinders.map(listItemFinder => new SciListItemPO(listItemFinder));
  }

  /**
   * Waits until the given number of list items is rendered.
   */
  private async waitForListItems(waitUntil: WaitUntil): Promise<void> {
    const listItemsFinder = this._sciListFinder.$$('sci-list-item');
    const timeout = Defined.orElse(waitUntil.timeout, 5000);

    await browser.wait(async (): Promise<boolean> => {
      const listItemCount = await listItemsFinder.count();

      if (waitUntil.matcher === 'eq' && waitUntil.itemCount === listItemCount) {
        return true;
      }
      else if (waitUntil.matcher === 'gt' && waitUntil.itemCount >= listItemCount) {
        return true;
      }
      return false;
    }, timeout, `[TimeoutError] Timeout has expired for waiting for list items [timeout=${timeout}ms, waitUntil=${JSON.stringify(waitUntil)}].`);
  }
}

export interface WaitUntil {
  itemCount: number;
  matcher: 'gt' | 'eq';
  timeout?: number;
}
