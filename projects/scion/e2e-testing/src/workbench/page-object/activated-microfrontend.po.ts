/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {ViewId, WorkbenchPopupReferrer} from '@scion/workbench-client';
import {SciAccordionPO} from '../../@scion/components.internal/accordion.po';
import {Params} from '@angular/router';
import {SciKeyValuePO} from '../../@scion/components.internal/key-value.po';
import {prune} from '../../helper/testing.util';
import {parseTypedString} from '../../helper/typed-value.util';
import {Capability} from '@scion/microfrontend-platform';

/**
 * Page object to interact with {@link ActivatedMicrofrontendComponent}.
 */
export class ActivatedMicrofrontendPO {

  public readonly accordion: SciAccordionPO;

  constructor(public locator: Locator) {
    this.accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-activated-microfrontend'));
  }

  public async getCapability(): Promise<Capability> {
    await this.accordion.expand();
    try {
      return JSON.parse(await this.accordion.itemLocator().locator('div.e2e-capability').innerText()) as Capability;
    }
    finally {
      await this.accordion.collapse();
    }
  }

  public async getParams(): Promise<Params> {
    const params = this.accordion.itemLocator().locator('sci-key-value.e2e-params');

    await this.accordion.expand();
    try {
      return await params.isVisible() ? await new SciKeyValuePO(params).readEntries() : {};
    }
    finally {
      await this.accordion.collapse();
    }
  }

  public async getReferrer(): Promise<string> {
    await this.accordion.expand();
    try {
      return parseTypedString<string>(await this.accordion.itemLocator().locator('output.e2e-referrer').innerText())!;
    }
    finally {
      await this.accordion.collapse();
    }
  }

  public async getPopupLegacyReferrer(): Promise<WorkbenchPopupReferrer> {
    await this.accordion.expand();
    try {
      return prune({
        viewId: parseTypedString(await this.accordion.itemLocator().locator('output.e2e-popup-legacy-referrer-view-id').innerText()) as ViewId | undefined,
        viewCapabilityId: parseTypedString(await this.accordion.itemLocator().locator('output.e2e-popup-legacy-referrer-view-capability-id').innerText()) as string | undefined,
      });
    }
    finally {
      await this.accordion.collapse();
    }
  }
}
