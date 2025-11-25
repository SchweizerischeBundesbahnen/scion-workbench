/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {PopupPO} from '../../popup.po';
import {ViewId, WorkbenchPopupCapability, WorkbenchPopupReferrer} from '@scion/workbench-client';
import {Params} from '@angular/router';
import {SciAccordionPO} from '../../@scion/components.internal/accordion.po';
import {SciKeyValuePO} from '../../@scion/components.internal/key-value.po';
import {Locator} from '@playwright/test';
import {WorkbenchPopupPagePO} from '../../workbench/page-object/workbench-popup-page.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {prune} from '../../helper/testing.util';
import {parseTypedString} from '../../helper/parse-typed-value.util';

/**
 * Page object to interact with {@link HostPopupPageComponent}.
 *
 * Note that {@link HostPopupPageComponent} is not an actual microfrontend that is integrated via an iframe,
 * but is rendered directly in the host app.
 */
export class HostPopupPagePO implements WorkbenchPopupPagePO {

  public readonly locator: Locator;

  constructor(public popup: PopupPO) {
    this.locator = this.popup.locator.locator('app-host-popup-page');
  }

  public getComponentInstanceId(): Promise<string> {
    return this.locator.locator('span.e2e-component-instance-id').innerText();
  }

  public async getPopupCapability(): Promise<WorkbenchPopupCapability> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-popup-capability'));
    await accordion.expand();
    try {
      return JSON.parse(await accordion.itemLocator().locator('div.e2e-popup-capability').innerText()) as WorkbenchPopupCapability;
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

  public async getReferrer(): Promise<WorkbenchPopupReferrer> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-referrer'));
    await accordion.expand();
    try {
      return prune({
        viewId: parseTypedString(await accordion.itemLocator().locator('output.e2e-view-id').innerText()) as ViewId | undefined,
        viewCapabilityId: parseTypedString<string>(await accordion.itemLocator().locator('output.e2e-view-capability-id').innerText()) as string | undefined,
      });
    }
    finally {
      await accordion.collapse();
    }
  }

  public async enterComponentSize(size: WorkbenchPopupSize): Promise<void> {
    await this.locator.locator('input.e2e-width').fill(size.width ?? '');
    await this.locator.locator('input.e2e-height').fill(size.height ?? '');
    await this.locator.locator('input.e2e-min-width').fill(size.minWidth ?? '');
    await this.locator.locator('input.e2e-max-width').fill(size.maxWidth ?? '');
    await this.locator.locator('input.e2e-min-height').fill(size.minHeight ?? '');
    await this.locator.locator('input.e2e-max-height').fill(size.maxHeight ?? '');
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

  public async close(options?: {returnValue?: string; closeWithError?: boolean}): Promise<void> {
    if (options?.returnValue !== undefined) {
      await this.enterReturnValue(options.returnValue);
    }

    if (options?.closeWithError) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-close-with-error')).toggle(true);
    }

    await this.locator.locator('button.e2e-close').click();
  }
}

export interface WorkbenchPopupSize {
  height?: string;
  width?: string;
  minHeight?: string;
  maxHeight?: string;
  minWidth?: string;
  maxWidth?: string;
}
