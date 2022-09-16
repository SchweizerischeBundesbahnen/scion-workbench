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
import {AppPO, ViewPO, ViewTabPO} from '../../app.po';
import {Params} from '@angular/router';
import {WorkbenchViewCapability} from '@scion/workbench-client';
import {SciAccordionPO} from '../../components.internal/accordion.po';
import {SciPropertyPO} from '../../components.internal/property.po';
import {SciCheckboxPO} from '../../components.internal/checkbox.po';
import {SciParamsEnterPO} from '../../components.internal/params-enter.po';
import {Locator} from '@playwright/test';
import {ElementSelectors} from '../../helper/element-selectors';

/**
 * Page object to interact {@link ViewPageComponent} of workbench-client testing app.
 */
export class ViewPagePO {

  public readonly locator: Locator;

  public readonly viewPO: ViewPO;
  public readonly viewTabPO: ViewTabPO;

  constructor(appPO: AppPO, public viewId: string) {
    this.viewPO = appPO.findView({viewId: viewId});
    this.viewTabPO = appPO.findViewTab({viewId: viewId});
    this.locator = appPO.page.frameLocator(ElementSelectors.routerOutlet(viewId)).locator('app-view-page');
  }

  public async isPresent(): Promise<boolean> {
    return await this.viewTabPO.isPresent() && await isPresent(this.locator);
  }

  public async isVisible(): Promise<boolean> {
    return await this.viewPO.isVisible() && await this.locator.isVisible();
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
      return await new SciPropertyPO(this.locator.locator('sci-property.e2e-view-params')).readProperties();
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async getRouteParams(): Promise<Params> {
    const accordionPO = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-route-params'));
    await accordionPO.expand();
    try {
      return await new SciPropertyPO(this.locator.locator('sci-property.e2e-route-params')).readProperties();
    }
    finally {
      await accordionPO.collapse();
    }
  }

  public async getRouteQueryParams(): Promise<Params> {
    const accordionPO = new SciAccordionPO(this.locator.locator('sci-accordion.e2e-route-query-params'));
    await accordionPO.expand();
    try {
      return await new SciPropertyPO(this.locator.locator('sci-property.e2e-route-query-params')).readProperties();
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
      const paramsEnterPO = new SciParamsEnterPO(this.locator.locator('sci-accordion.e2e-self-navigation').locator('sci-params-enter.e2e-params'));
      await paramsEnterPO.clear();
      await paramsEnterPO.enterParams(params);
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
