/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {fromRect} from '../../helper/testing.util';
import {AppPO, PopupPO} from '../../app.po';
import {PopupSize} from '@scion/workbench';
import {Params} from '@angular/router';
import {WorkbenchPopupCapability} from '@scion/workbench-client';
import {SciAccordionPO} from '../../components.internal/accordion.po';
import {SciPropertyPO} from '../../components.internal/property.po';
import {ElementSelectors} from '../../helper/element-selectors';
import {Locator} from '@playwright/test';

/**
 * Page object to interact {@link PopupPageComponent}.
 */
export class PopupPagePO {

  private readonly _locator: Locator;

  public readonly popupPO: PopupPO;

  constructor(appPO: AppPO, cssClass: string) {
    this.popupPO = appPO.findPopup({cssClass});
    this._locator = appPO.page.frameLocator(ElementSelectors.routerOutlet({cssClass: ['e2e-popup'].concat(cssClass)})).locator('app-popup-page');
  }

  public async getComponentInstanceId(): Promise<string> {
    return this._locator.locator('span.e2e-component-instance-id').innerText();
  }

  public async getPopupCapability(): Promise<WorkbenchPopupCapability> {
    const accordionPO = new SciAccordionPO(this._locator.locator('sci-accordion.e2e-popup-capability'));
    await accordionPO.expand();
    try {
      return JSON.parse(await this._locator.locator('div.e2e-popup-capability').innerText());
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async getPopupParams(): Promise<Params> {
    const accordionPO = new SciAccordionPO(this._locator.locator('sci-accordion.e2e-popup-params'));
    await accordionPO.expand();
    try {
      return await new SciPropertyPO(this._locator.locator('sci-property.e2e-popup-params')).readProperties();
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async getRouteParams(): Promise<Params> {
    const accordionPO = new SciAccordionPO(this._locator.locator('sci-accordion.e2e-route-params'));
    await accordionPO.expand();
    try {
      return await new SciPropertyPO(this._locator.locator('sci-property.e2e-route-params')).readProperties();
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async getRouteQueryParams(): Promise<Params> {
    const accordionPO = new SciAccordionPO(this._locator.locator('sci-accordion.e2e-route-query-params'));
    await accordionPO.expand();
    try {
      return await new SciPropertyPO(this._locator.locator('sci-property.e2e-route-query-params')).readProperties();
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async getRouteFragment(): Promise<string> {
    const accordionPO = new SciAccordionPO(this._locator.locator('sci-accordion.e2e-route-fragment'));
    await accordionPO.expand();
    try {
      return this._locator.locator('span.e2e-route-fragment').innerText();
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async enterComponentSize(size: PopupSize): Promise<void> {
    await this._locator.locator('input.e2e-width').fill(size.width ?? '');
    await this._locator.locator('input.e2e-height').fill(size.height ?? '');
    await this._locator.locator('input.e2e-min-width').fill(size.minWidth ?? '');
    await this._locator.locator('input.e2e-max-width').fill(size.maxWidth ?? '');
    await this._locator.locator('input.e2e-min-height').fill(size.minHeight ?? '');
    await this._locator.locator('input.e2e-max-height').fill(size.maxHeight ?? '');
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

  public async clickClose(options?: {returnValue?: string; closeWithError?: boolean}): Promise<void> {
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

  public async getSize(): Promise<Size> {
    const {width, height} = fromRect(await this._locator.boundingBox());
    return {width, height};
  }
}

export interface Size {
  width: number;
  height: number;
}
