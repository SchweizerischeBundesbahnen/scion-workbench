/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {AppPO} from '../../../app.po';
import {ElementSelectors} from '../../../helper/element-selectors';
import {SciAccordionPO} from '../../../@scion/components.internal/accordion.po';
import {SciCheckboxPO} from '../../../@scion/components.internal/checkbox.po';
import {MicrofrontendNavigator} from '../../microfrontend-navigator';
import {RegisterWorkbenchCapabilityPagePO} from '../register-workbench-capability-page.po';

export class AngularZoneTestPagePO {

  public readonly workbenchView: {
    capabilityPO: PanelPO;
    paramsPO: PanelPO;
    activePO: PanelPO;
  };

  constructor(private _appPO: AppPO, viewId: string) {
    const locator = this._appPO.page.frameLocator(ElementSelectors.routerOutletFrame(viewId)).locator('app-angular-zone-test-page');

    this.workbenchView = {
      capabilityPO: new PanelPO(locator.locator('sci-accordion'), 'e2e-workbench-view.e2e-capability'),
      paramsPO: new PanelPO(locator.locator('sci-accordion'), 'e2e-workbench-view.e2e-params'),
      activePO: new PanelPO(locator.locator('sci-accordion'), 'e2e-workbench-view.e2e-active'),
    };
  }

  public static async openInNewTab(appPO: AppPO, microfrontendNavigator: MicrofrontendNavigator): Promise<AngularZoneTestPagePO> {
    // Register the test page as view.
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {test: 'angular-zone'},
      properties: {
        path: 'test-pages/angular-zone-test-page',
        cssClass: 'e2e-test-angular-zone',
        title: 'Angular Zone Test Page',
        pinToStartPage: true,
      },
    });
    await registerCapabilityPagePO.viewTabPO.close();

    // Navigate to the view.
    const startPagePO = await appPO.openNewViewTab();
    await startPagePO.clickTestCapability('e2e-test-angular-zone', 'app1');

    // Create the page object.
    const view = await appPO.view({cssClass: 'e2e-test-angular-zone'});
    await view.waitUntilPresent();
    return new AngularZoneTestPagePO(appPO, await view.getViewId());
  }
}

/**
 * Allows interacting with the specified accordion panel.
 */
export class PanelPO {

  private _accordionPO: SciAccordionPO;

  constructor(accordionLocator: Locator, private _accordionItemCssClass: string) {
    this._accordionPO = new SciAccordionPO(accordionLocator);
  }

  public async expand(): Promise<void> {
    await this._accordionPO.expand(this._accordionItemCssClass);
  }

  public async subscribe(options: {subscribeInAngularZone: boolean}): Promise<void> {
    const locator = this._accordionPO.itemLocator(this._accordionItemCssClass);
    await new SciCheckboxPO(locator.locator('sci-checkbox.e2e-run-inside-angular')).toggle(options.subscribeInAngularZone);
    await locator.locator('button.e2e-subscribe').click();
  }

  public async isEmissionReceivedInAngularZone(emission: {nth: number}): Promise<boolean> {
    const locator = this._accordionPO.itemLocator(this._accordionItemCssClass);
    const zoneAttributeValue = await locator.locator('output.e2e-emission').nth(emission.nth).getAttribute('data-zone');

    switch (zoneAttributeValue) {
      case 'inside-angular':
        return true;
      case 'outside-angular':
        return false;
      default:
        throw Error(`[Unexpected] Expected attribute "data-zone" to be "inside-angular" or "outside-angular", but was "${zoneAttributeValue}"`);
    }
  }
}
