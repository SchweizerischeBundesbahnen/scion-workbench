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
import {PopupSize} from '@scion/workbench';
import {Params} from '@angular/router';
import {WorkbenchPopupCapability, WorkbenchPopupReferrer} from '@scion/workbench-client';
import {SciAccordionPO} from '../../@scion/components.internal/accordion.po';
import {Locator} from '@playwright/test';
import {SciKeyValuePO} from '../../@scion/components.internal/key-value.po';
import {SciRouterOutletPO} from './sci-router-outlet.po';
import {MicrofrontendPopupPagePO} from '../../workbench/page-object/workbench-popup-page.po';
import {AppPO} from '../../app.po';

/**
 * Page object to interact with {@link PopupPageComponent}.
 */
export class PopupPagePO implements MicrofrontendPopupPagePO {

  public readonly locator: Locator;
  public readonly outlet: SciRouterOutletPO;
  private readonly _hasFocusLocator: Locator;

  constructor(public popup: PopupPO) {
    this.outlet = new SciRouterOutletPO(new AppPO(popup.locator.page()), {locator: popup.locator.locator('sci-router-outlet')});
    this.locator = this.outlet.frameLocator.locator('app-popup-page');
    this._hasFocusLocator = this.outlet.frameLocator.locator('app-root').locator('.e2e-has-focus');
  }

  public async getComponentInstanceId(): Promise<string> {
    return this.locator.locator('span.e2e-component-instance-id').innerText();
  }

  public async getPopupCapability(): Promise<WorkbenchPopupCapability> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-popup-capability'));
    await accordion.expand();
    try {
      return JSON.parse(await accordion.itemLocator().locator('div.e2e-popup-capability').innerText());
    }
    finally {
      await accordion.collapse();
    }
  }

  public async getPopupParams(): Promise<Params> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-popup-params'));
    await accordion.expand();
    try {
      return await new SciKeyValuePO(accordion.itemLocator().locator('sci-key-value.e2e-popup-params')).readEntries();
    }
    finally {
      await accordion.collapse();
    }
  }

  public async getRouteParams(): Promise<Params> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-route-params'));
    await accordion.expand();
    try {
      return await new SciKeyValuePO(accordion.itemLocator().locator('sci-key-value.e2e-route-params')).readEntries();
    }
    finally {
      await accordion.collapse();
    }
  }

  public async getRouteQueryParams(): Promise<Params> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-route-query-params'));
    await accordion.expand();
    try {
      return await new SciKeyValuePO(accordion.itemLocator().locator('sci-key-value.e2e-route-query-params')).readEntries();
    }
    finally {
      await accordion.collapse();
    }
  }

  public async getRouteFragment(): Promise<string> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-route-fragment'));
    await accordion.expand();
    try {
      return accordion.itemLocator().locator('span.e2e-route-fragment').innerText();
    }
    finally {
      await accordion.collapse();
    }
  }

  public async getReferrer(): Promise<WorkbenchPopupReferrer> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-referrer'));
    await accordion.expand();
    try {
      return withoutUndefinedEntries({
        viewId: await accordion.itemLocator().locator('output.e2e-view-id').innerText(),
        viewCapabilityId: await accordion.itemLocator().locator('output.e2e-view-capability-id').innerText(),
      });
    }
    finally {
      await accordion.collapse();
    }
  }

  public async enterComponentSize(size: PopupSize): Promise<void> {
    await this.locator.locator('input.e2e-width').fill(size.width ?? '');
    await this.locator.locator('input.e2e-height').fill(size.height ?? '');
    await this.locator.locator('input.e2e-min-width').fill(size.minWidth ?? '');
    await this.locator.locator('input.e2e-max-width').fill(size.maxWidth ?? '');
    await this.locator.locator('input.e2e-min-height').fill(size.minHeight ?? '');
    await this.locator.locator('input.e2e-max-height').fill(size.maxHeight ?? '');
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

  public async close(options?: {returnValue?: string; closeWithError?: boolean}): Promise<void> {
    if (options?.returnValue !== undefined) {
      await this.enterReturnValue(options.returnValue);
    }

    if (options?.closeWithError) {
      await this.locator.locator('button.e2e-close-with-error').click();
    }
    else {
      await this.locator.locator('button.e2e-close').click();
    }
  }

  /**
   * Waits until this page gains focus.
   */
  public async waitForFocusIn(): Promise<void> {
    await this._hasFocusLocator.waitFor({state: 'visible'});
  }

  /**
   * Waits until this page loses focus.
   */
  public async waitForFocusOut(): Promise<void> {
    await this._hasFocusLocator.waitFor({state: 'detached'});
  }
}
