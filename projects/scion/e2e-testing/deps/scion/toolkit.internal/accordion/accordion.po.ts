/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {ElementFinder} from 'protractor';

/**
 * Page object to interact {@link SciAccordionComponent}.
 */
export class SciAccordionPO {

  constructor(private _sciAccordionFinder: ElementFinder) {
  }

  public async expand(itemCssClass?: string): Promise<boolean> {
    const expandButtonFinder = this.itemFinder(itemCssClass).$('button.e2e-expand');
    if (await expandButtonFinder.isPresent()) {
      await expandButtonFinder.click();
      return true;
    }
    return false;
  }

  public async collapse(itemCssClass?: string): Promise<boolean> {
    const collapseButtonFinder = this.itemFinder(itemCssClass).$('button.e2e-collapse');
    if (await collapseButtonFinder.isPresent()) {
      await collapseButtonFinder.click();
      return true;
    }
    return false;
  }

  private itemFinder(itemCssClass?: string): ElementFinder {
    if (!itemCssClass) {
      return this._sciAccordionFinder.$('section.e2e-accordion-item');
    }
    return this._sciAccordionFinder.$(`section.e2e-accordion-item.${itemCssClass}`);
  }
}
