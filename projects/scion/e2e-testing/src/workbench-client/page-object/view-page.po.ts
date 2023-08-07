/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {fromRect, isPresent} from '../../helper/testing.util';
import {AppPO} from '../../app.po';
import {ViewPO} from '../../view.po';
import {Params} from '@angular/router';
import {WorkbenchViewCapability} from '@scion/workbench-client';
import {SciAccordionPO} from '../../@scion/components.internal/accordion.po';
import {SciKeyValuePO} from '../../@scion/components.internal/key-value.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {SciKeyValueFieldPO} from '../../@scion/components.internal/key-value-field.po';
import {Locator} from '@playwright/test';
import {ElementSelectors} from '../../helper/element-selectors';
import {SciRouterOutletPO} from './sci-router-outlet.po';

/**
 * Page object to interact {@link ViewPageComponent} of workbench-client testing app.
 */
export class ViewPagePO {

  public readonly locator: Locator;

  public readonly view: ViewPO;
  public readonly outlet: SciRouterOutletPO;

  constructor(appPO: AppPO, public viewId: string) {
    this.view = appPO.view({viewId});
    this.outlet = new SciRouterOutletPO(appPO, viewId);
    this.locator = appPO.page.frameLocator(ElementSelectors.routerOutletFrame(viewId)).locator('app-view-page');
  }

  public async waitUntilAttached(): Promise<void> {
    await this.locator.waitFor({state: 'attached'});
  }

  public async isPresent(): Promise<boolean> {
    return await this.view.viewTab.isPresent() && await isPresent(this.locator);
  }

  public async isVisible(): Promise<boolean> {
    return await this.view.isVisible() && await this.locator.isVisible();
  }

  public async getViewId(): Promise<string> {
    return this.locator.locator('span.e2e-view-id').innerText();
  }

  public async getComponentInstanceId(): Promise<string> {
    return this.locator.locator('span.e2e-component-instance-id').innerText();
  }

  public async getPath(): Promise<string> {
    return this.locator.locator('span.e2e-path').innerText();
  }

  public async getAppInstanceId(): Promise<string> {
    return this.locator.locator('span.e2e-app-instance-id').innerText();
  }

  public async getViewCapability(): Promise<WorkbenchViewCapability> {
    const capabilityAccordionLocator = this.locator.locator('sci-accordion.e2e-view-capability');
    const accordionPO = new SciAccordionPO(capabilityAccordionLocator);
    await accordionPO.expand();
    try {
      return JSON.parse(await this.locator.locator('div.e2e-view-capability').innerText());
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async getViewParams(): Promise<Params> {
    const accordionPO = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-view-params'));
    await accordionPO.expand();
    try {
      return await new SciKeyValuePO(this.locator.locator('sci-key-value.e2e-view-params')).readEntries();
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async getRouteParams(): Promise<Params> {
    const accordionPO = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-route-params'));
    await accordionPO.expand();
    try {
      return await new SciKeyValuePO(this.locator.locator('sci-key-value.e2e-route-params')).readEntries();
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async getRouteQueryParams(): Promise<Params> {
    const accordionPO = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-route-query-params'));
    await accordionPO.expand();
    try {
      return await new SciKeyValuePO(this.locator.locator('sci-key-value.e2e-route-query-params')).readEntries();
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async getRouteFragment(): Promise<string> {
    const accordionPO = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-route-fragment'));
    await accordionPO.expand();
    try {
      return this.locator.locator('span.e2e-route-fragment').innerText();
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async enterTitle(title: string): Promise<void> {
    await this.locator.locator('input.e2e-title').fill(title);
  }

  public async enterHeading(heading: string): Promise<void> {
    await this.locator.locator('input.e2e-heading').fill(heading);
  }

  public async markDirty(dirty?: boolean): Promise<void> {
    switch (dirty) {
      case true: {
        await this.locator.locator('button.e2e-mark-dirty').click();
        break;
      }
      case false: {
        await this.locator.locator('button.e2e-mark-pristine').click();
        break;
      }
      default: {
        await this.locator.locator('button.e2e-mark-dirty-noarg').click();
        break;
      }
    }
  }

  public async checkClosable(check: boolean): Promise<void> {
    await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-closable')).toggle(check);
  }

  public async checkConfirmClosing(check: boolean): Promise<void> {
    await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-confirm-closing')).toggle(check);
  }

  public async clickClose(): Promise<void> {
    const accordionPO = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-view-actions'));
    await accordionPO.expand();
    await this.locator.locator('button.e2e-close').click();
    // do not close the accordion as this action removes the iframe from the DOM.
  }

  public async getSize(): Promise<Size> {
    const {width, height} = fromRect(await this.locator.boundingBox());
    return {width, height};
  }

  public async navigateSelf(params: Params, options?: {paramsHandling?: 'merge' | 'replace'; navigatePerParam?: boolean}): Promise<void> {
    const accordionPO = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-self-navigation'));
    await accordionPO.expand();
    try {
      const keyValueFieldPO = new SciKeyValueFieldPO(this.locator.locator('sci-accordion.e2e-self-navigation').locator('sci-key-value-field.e2e-params'));
      await keyValueFieldPO.clear();
      await keyValueFieldPO.addEntries(params);
      await this.locator.locator('sci-accordion.e2e-self-navigation').locator('select.e2e-param-handling').selectOption(options?.paramsHandling || '');
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-navigate-per-param')).toggle(options?.navigatePerParam ?? false);
      await this.locator.locator('sci-accordion.e2e-self-navigation').locator('button.e2e-navigate-self').click();
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async sendKeys(key: string): Promise<void> {
    await this.locator.locator('input.e2e-title').press(key);
  }
}

export interface Size {
  width: number;
  height: number;
}
