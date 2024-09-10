/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {withoutUndefinedEntries} from '../../helper/testing.util';
import {PopupPO} from '../../popup.po';
import {PopupReferrer, PopupSize} from '@scion/workbench';
import {SciAccordionPO} from '../../@scion/components.internal/accordion.po';
import {Locator} from '@playwright/test';
import {WorkbenchPopupPagePO} from './workbench-popup-page.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';

/**
 * Page object to interact with {@link PopupPageComponent}.
 */
export class PopupPagePO implements WorkbenchPopupPagePO {

  public readonly locator: Locator;
  public readonly input: Locator;

  constructor(public popup: PopupPO) {
    this.locator = this.popup.locator.locator('app-popup-page');
    this.input = this.locator.locator('output.e2e-input');
  }

  public async getComponentInstanceId(): Promise<string> {
    return this.locator.locator('span.e2e-component-instance-id').innerText();
  }

  public async enterComponentSize(size: PopupSize): Promise<void> {
    await this.locator.locator('input.e2e-width').fill(size.width ?? '');
    await this.locator.locator('input.e2e-height').fill(size.height ?? '');
    await this.locator.locator('input.e2e-min-width').fill(size.minWidth ?? '');
    await this.locator.locator('input.e2e-max-width').fill(size.maxWidth ?? '');
    await this.locator.locator('input.e2e-min-height').fill(size.minHeight ?? '');
    await this.locator.locator('input.e2e-max-height').fill(size.maxHeight ?? '');
  }

  public async close(options?: {returnValue?: string; closeWithError?: boolean}): Promise<void> {
    if (options?.returnValue !== undefined) {
      await this.enterReturnValue(options.returnValue);
    }

    if (options?.closeWithError) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-close-with-error')).toggle(true);
    }

    await this.locator.locator('button.e2e-close').click();
  }

  public async enterReturnValue(returnValue: string, options?: {apply?: boolean}): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-return-value'));
    await accordion.expand();
    try {
      await accordion.itemLocator().locator('input.e2e-return-value').fill(returnValue);

      if (options?.apply) {
        await this.locator.locator('button.e2e-apply-return-value').click();
      }
    }
    finally {
      await accordion.collapse();
    }
  }

  public async getReferrer(): Promise<PopupReferrer> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-referrer'));
    await accordion.expand();
    try {
      return withoutUndefinedEntries({
        viewId: await accordion.itemLocator().locator('output.e2e-view-id').innerText(),
      });
    }
    finally {
      await accordion.collapse();
    }
  }
}
