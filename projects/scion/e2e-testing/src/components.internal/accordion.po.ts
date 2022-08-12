/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';

/**
 * Page object to interact {@link SciAccordionComponent}.
 */
export class SciAccordionPO {

  constructor(private _sciAccordionLocator: Locator) {
  }

  public async expand(itemCssClass?: string): Promise<void> {
    const expandButtonLocator = this.itemLocator(itemCssClass).locator('button.e2e-expand');
    await expandButtonLocator.click();
    await this.itemLocator(itemCssClass).locator('section').waitFor({state: 'visible'});
  }

  public async collapse(itemCssClass?: string): Promise<void> {
    const collapseButtonLocator = this.itemLocator(itemCssClass).locator('button.e2e-collapse');
    await collapseButtonLocator.click();
    await this.itemLocator(itemCssClass).locator('section').waitFor({state: 'detached'});
  }

  private itemLocator(itemCssClass?: string): Locator {
    if (!itemCssClass) {
      return this._sciAccordionLocator.locator('section.e2e-accordion-item');
    }
    return this._sciAccordionLocator.locator(`section.e2e-accordion-item.${itemCssClass}`);
  }
}
