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
import {SciAccordionPO} from '../../@scion/components.internal/accordion.po';
import {Locator} from '@playwright/test';
import {SciKeyValuePO} from '../../@scion/components.internal/key-value.po';
import {DomRect, fromRect} from '../../helper/testing.util';
import {WorkbenchMessageBoxPagePO} from '../../workbench/page-object/workbench-message-box-page.po';
import {MessageBoxPO} from '../../message-box.po';
import {WorkbenchMessageBoxCapability} from '@scion/workbench-client';

/**
 * Page object to interact with {@link HostMessageBoxPageComponent}.
 *
 * Note that {@link HostMessageBoxPageComponent} is not an actual microfrontend integrated via an iframe,
 * but displayed directly in the host app using an Angular router-outlet.
 */
export class HostMessageBoxPagePO implements WorkbenchMessageBoxPagePO {

  public readonly locator: Locator;

  constructor(public messageBox: MessageBoxPO) {
    this.locator = this.messageBox.locator.locator('app-host-message-box-page');
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

  public async getBoundingBox(): Promise<DomRect> {
    return fromRect(await this.messageBox.locator.locator('wb-microfrontend-host-message-box').boundingBox());
  }

  public getComputedStyle(): Promise<CSSStyleDeclaration> {
    return this.messageBox.locator.locator('wb-microfrontend-host-message-box').evaluate((hostMessageBoxElement: HTMLElement) => getComputedStyle(hostMessageBoxElement));
  }
}
