/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Params} from '@angular/router';
import {WorkbenchPartCapability} from '@scion/workbench-client';
import {SciAccordionPO} from '../../@scion/components.internal/accordion.po';
import {SciKeyValuePO} from '../../@scion/components.internal/key-value.po';
import {Locator} from '@playwright/test';
import {SciRouterOutletPO} from './sci-router-outlet.po';
import {PartPO} from '../../part.po';

/**
 * Page object to interact with {@link PartPageComponent} of workbench-client testing app.
 */
export class PartPagePO {

  public static readonly selector = 'app-part-page';
  public readonly locator: Locator;
  public readonly partId: Locator;
  public readonly outlet: SciRouterOutletPO;
  public readonly path: Locator;

  constructor(public part: PartPO) {
    this.outlet = new SciRouterOutletPO(part.locator.page(), {name: part.locateBy?.id, cssClass: part.locateBy?.cssClass});
    this.locator = this.outlet.frameLocator.locator('app-part-page');
    this.partId = this.locator.locator('span.e2e-part-id');
    this.path = this.locator.locator('span.e2e-path');
  }

  public getComponentInstanceId(): Promise<string> {
    return this.locator.locator('span.e2e-component-instance-id').innerText();
  }

  public async getPartCapability(): Promise<WorkbenchPartCapability> {
    const capabilityAccordionLocator = this.locator.locator('sci-accordion.e2e-part-capability');
    const accordion = new SciAccordionPO(capabilityAccordionLocator);
    await accordion.expand();
    try {
      return JSON.parse(await this.locator.locator('div.e2e-part-capability').innerText()) as WorkbenchPartCapability;
    }
    finally {
      await accordion.collapse();
    }
  }

  public async getPartParams(): Promise<Params> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-part-params'));
    await accordion.expand();
    try {
      return await new SciKeyValuePO(this.locator.locator('sci-key-value.e2e-part-params')).readEntries();
    }
    finally {
      await accordion.collapse();
    }
  }

  public async getRouteParams(): Promise<Params> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-route-params'));
    await accordion.expand();
    try {
      return await new SciKeyValuePO(this.locator.locator('sci-key-value.e2e-route-params')).readEntries();
    }
    finally {
      await accordion.collapse();
    }
  }

  public async getRouteQueryParams(): Promise<Params> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-route-query-params'));
    await accordion.expand();
    try {
      return await new SciKeyValuePO(this.locator.locator('sci-key-value.e2e-route-query-params')).readEntries();
    }
    finally {
      await accordion.collapse();
    }
  }

  public async getRouteFragment(): Promise<string> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-route-fragment'));
    await accordion.expand();
    try {
      return await this.locator.locator('span.e2e-route-fragment').innerText();
    }
    finally {
      await accordion.collapse();
    }
  }
}
