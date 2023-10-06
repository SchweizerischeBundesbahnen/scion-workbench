/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {fromRect, isPresent, withoutUndefinedEntries} from '../../helper/testing.util';
import {AppPO} from '../../app.po';
import {PopupPO} from '../../popup.po';
import {PopupReferrer, PopupSize} from '@scion/workbench';
import {SciAccordionPO} from '../../@scion/components.internal/accordion.po';
import {Locator} from '@playwright/test';

/**
 * Page object to interact with {@link PopupPageComponent}.
 */
export class PopupPagePO {

  public readonly locator: Locator;
  public readonly popup: PopupPO;

  constructor(appPO: AppPO, locateBy: {cssClass: string}) {
    this.popup = appPO.popup({cssClass: locateBy.cssClass});
    this.locator = this.popup.locate('app-popup-page');
  }

  public async isPresent(): Promise<boolean> {
    return isPresent(this.locator);
  }

  public async isVisible(): Promise<boolean> {
    return this.locator.isVisible();
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

  public async clickClose(options?: {returnValue?: string; closeWithError?: boolean}): Promise<void> {
    if (options?.returnValue !== undefined) {
      await this.enterReturnValue(options.returnValue);
    }

    if (options?.closeWithError === true) {
      await this.locator.locator('button.e2e-close-with-error').click();
    }
    else {
      await this.locator.locator('button.e2e-close').click();
    }
  }

  public async enterReturnValue(returnValue: string): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-return-value'));
    await accordion.expand();
    try {
      await accordion.itemLocator().locator('input.e2e-return-value').fill(returnValue);
    }
    finally {
      await accordion.collapse();
    }
  }

  public async getInput(): Promise<string> {
    return this.locator.locator('output.e2e-input').innerText();
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

  public async getPreferredOverlaySize(): Promise<PopupSize> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-preferred-overlay-size'));
    await accordion.expand();
    try {
      return JSON.parse(await accordion.itemLocator().locator('div.e2e-preferred-overlay-size').innerText());
    }
    finally {
      await accordion.collapse();
    }
  }

  public async getSize(): Promise<Size> {
    const {width, height} = fromRect(await this.locator.boundingBox());
    return {width, height};
  }
}

export interface Size {
  width: number;
  height: number;
}
