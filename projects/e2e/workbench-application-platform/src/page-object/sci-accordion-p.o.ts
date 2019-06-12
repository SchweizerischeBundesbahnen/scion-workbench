/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ElementFinder } from 'protractor';
import { getCssClasses } from '../util/testing.util';

export class SciAccordionPO {

  /**
   * Opens or closes the accordion item of given CSS class.
   * If `open` is not specified, the item is toggled.
   */
  public async toggle(sciAccordionFinder: ElementFinder, cssClass: string, open?: boolean): Promise<void> {
    const accordionItem = sciAccordionFinder.$(`section.e2e-accordion-item.${cssClass}`);
    const cssClasses = await getCssClasses(accordionItem);

    if (open === undefined) {
      open = !cssClasses.includes('e2e-expanded');
    }

    const doOpen = open && !cssClasses.includes('e2e-expanded');
    const doClose = !open && cssClasses.includes('e2e-expanded');

    if (doOpen || doClose) {
      await accordionItem.$('.e2e-accordion-item-header').click();
    }
  }
}
