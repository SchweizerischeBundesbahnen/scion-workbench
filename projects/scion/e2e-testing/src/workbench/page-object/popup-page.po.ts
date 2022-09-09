/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {assertElementVisible, fromRect, isPresent} from '../../helper/testing.util';
import {AppPO, PopupPO} from '../../app.po';
import {PopupSize} from '@scion/workbench';
import {SciAccordionPO} from '../../components.internal/accordion.po';
import {Locator} from '@playwright/test';

/**
 * Page object to interact {@link PopupPageComponent}.
 */
export class PopupPagePO {

  private readonly _locator: Locator;

  public readonly popupPO: PopupPO;

  constructor(appPO: AppPO, cssClass: string) {
    this.popupPO = appPO.findPopup({cssClass});
    this._locator = this.popupPO.locator('app-popup-page');
  }

  public async isPresent(): Promise<boolean> {
    return isPresent(this._locator);
  }

  public async isVisible(): Promise<boolean> {
    return this._locator.isVisible();
  }

  public async getComponentInstanceId(): Promise<string> {
    await assertElementVisible(this._locator);
    return this._locator.locator('span.e2e-component-instance-id').innerText();
  }

  public async enterComponentSize(size: PopupSize): Promise<void> {
    await assertElementVisible(this._locator);

    await this._locator.locator('input.e2e-width').fill(size.width ?? '');
    await this._locator.locator('input.e2e-height').fill(size.height ?? '');
    await this._locator.locator('input.e2e-min-width').fill(size.minWidth ?? '');
    await this._locator.locator('input.e2e-max-width').fill(size.maxWidth ?? '');
    await this._locator.locator('input.e2e-min-height').fill(size.minHeight ?? '');
    await this._locator.locator('input.e2e-max-height').fill(size.maxHeight ?? '');
  }

  public async clickClose(options?: {returnValue?: string; closeWithError?: boolean}): Promise<void> {
    await assertElementVisible(this._locator);

    if (options?.returnValue !== undefined) {
      await this.enterReturnValue(options.returnValue);
    }

    if (options?.closeWithError === true) {
      await this._locator.locator('button.e2e-close-with-error').click();
    }
    else {
      await this._locator.locator('button.e2e-close').click();
    }
  }

  public async enterReturnValue(returnValue: string): Promise<void> {
    const accordionPO = new SciAccordionPO(this._locator.locator('sci-accordion.e2e-return-value'));
    await accordionPO.expand();
    try {
      await this._locator.locator('input.e2e-return-value').fill(returnValue);
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async getInput(): Promise<string> {
    await assertElementVisible(this._locator);

    return this._locator.locator('output.e2e-input').innerText();
  }

  public async getPreferredOverlaySize(): Promise<PopupSize> {
    await assertElementVisible(this._locator);

    const accordionPO = new SciAccordionPO(this._locator.locator('sci-accordion.e2e-preferred-overlay-size'));
    await accordionPO.expand();
    try {
      return JSON.parse(await this._locator.locator('div.e2e-preferred-overlay-size').innerText());
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async getSize(): Promise<Size> {
    await assertElementVisible(this._locator);
    const {width, height} = fromRect(await this._locator.boundingBox());
    return {width, height};
  }
}

export interface Size {
  width: number;
  height: number;
}
