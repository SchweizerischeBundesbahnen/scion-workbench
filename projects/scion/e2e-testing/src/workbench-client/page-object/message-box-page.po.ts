/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Params} from '@angular/router';
import {WorkbenchMessageBoxCapability} from '@scion/workbench-client';
import {SciAccordionPO} from '../../@scion/components.internal/accordion.po';
import {Locator} from '@playwright/test';
import {SciKeyValuePO} from '../../@scion/components.internal/key-value.po';
import {SciRouterOutletPO} from './sci-router-outlet.po';

import {AppPO} from '../../app.po';
import {MicrofrontendMessageBoxPagePO} from '../../workbench/page-object/workbench-message-box-page.po';
import {MessageBoxPO} from '../../message-box.po';
import {DomRect, fromRect} from '../../helper/testing.util';

/**
 * Page object to interact with {@link MessageBoxPageComponent}.
 */
export class MessageBoxPagePO implements MicrofrontendMessageBoxPagePO {

  public readonly locator: Locator;
  public readonly outlet: SciRouterOutletPO;

  constructor(public messageBox: MessageBoxPO) {
    this.outlet = new SciRouterOutletPO(new AppPO(messageBox.locator.page()), {locator: messageBox.locator.locator('sci-router-outlet')});
    this.locator = this.outlet.frameLocator.locator('app-message-box-page');
  }

  public async getComponentInstanceId(): Promise<string> {
    return this.locator.locator('input.e2e-component-instance-id').innerText();
  }

  public async getMessageBoxCapability(): Promise<WorkbenchMessageBoxCapability> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-message-box-capability'));
    await accordion.expand();
    try {
      return JSON.parse(await accordion.itemLocator().locator('div.e2e-message-box-capability').innerText());
    }
    finally {
      await accordion.collapse();
    }
  }

  public async getMessageBoxParams(): Promise<Params> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-message-box-params'));
    await accordion.expand();
    try {
      return await new SciKeyValuePO(accordion.itemLocator().locator('sci-key-value.e2e-message-box-params')).readEntries();
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

  public async enterComponentSize(size: {width?: string; height?: string}): Promise<void> {
    const accordion = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-component-size'));
    await accordion.expand();
    try {
      await accordion.itemLocator().locator('input.e2e-width').fill(size.width ?? '');
      await accordion.itemLocator().locator('input.e2e-height').fill(size.height ?? '');
    }
    finally {
      await accordion.collapse();
    }
  }

  public async getBoundingBox(): Promise<DomRect> {
    return fromRect(await this.outlet.locator.boundingBox());
  }

  public getComputedStyle(): Promise<CSSStyleDeclaration> {
    return this.outlet.locator.evaluate((outletElement: HTMLElement) => getComputedStyle(outletElement));
  }
}
