/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {browser, ElementArrayFinder, ElementFinder} from 'protractor';

/**
 * Page object for {@link SciListItemComponent}.
 */
export class SciListItemPO {

  public readonly contentFinder: ElementFinder;
  public readonly actionsFinder: ElementArrayFinder;

  constructor(sciListItemFinder: ElementFinder) {
    this.contentFinder = sciListItemFinder.$('div.e2e-item');
    this.actionsFinder = sciListItemFinder.$('ul.e2e-actions').$$('li.e2e-action');
  }

  public async clickAction(cssClass: string): Promise<void> {
    const actionButtonFinder = this.actionsFinder.$$(`button.${cssClass}`).first();
    await browser.actions().mouseMove(actionButtonFinder).perform(); // hover the action to make it visible
    await actionButtonFinder.click();
  }
}
