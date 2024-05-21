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
import {SciAccordionPO} from '../../../@scion/components.internal/accordion.po';
import {SciCheckboxPO} from '../../../@scion/components.internal/checkbox.po';
import {MicrofrontendNavigator} from '../../microfrontend-navigator';
import {SciRouterOutletPO} from '../sci-router-outlet.po';
import {MicrofrontendViewPagePO} from '../../../workbench/page-object/workbench-view-page.po';
import {ViewPO} from '../../../view.po';
import {RouterPagePO} from '../router-page.po';

export class AngularZoneTestPagePO implements MicrofrontendViewPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;
  public readonly outlet: SciRouterOutletPO;

  public readonly workbenchView: {
    capabilityPanel: PanelPO;
    paramsPanel: PanelPO;
    activePanel: PanelPO;
  };

  constructor(appPO: AppPO, locateBy: {cssClass: string}) {
    this.view = appPO.view({cssClass: locateBy.cssClass});
    this.outlet = new SciRouterOutletPO(appPO, {cssClass: locateBy.cssClass});
    this.locator = this.outlet.frameLocator.locator('app-angular-zone-test-page');

    this.workbenchView = {
      capabilityPanel: new PanelPO(this.locator.locator('sci-accordion'), 'e2e-workbench-view.e2e-capability'),
      paramsPanel: new PanelPO(this.locator.locator('sci-accordion'), 'e2e-workbench-view.e2e-params'),
      activePanel: new PanelPO(this.locator.locator('sci-accordion'), 'e2e-workbench-view.e2e-active'),
    };
  }

  public static async openInNewTab(appPO: AppPO, microfrontendNavigator: MicrofrontendNavigator): Promise<AngularZoneTestPagePO> {
    const identifier = `testee-${crypto.randomUUID()}`;
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {test: identifier},
      properties: {
        path: 'test-pages/angular-zone-test-page',
        title: 'Angular Zone Test Page',
      },
    });

    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({test: identifier}, {
      cssClass: identifier,
      target: 'blank',
    });
    await routerPage.view.tab.close();

    return new AngularZoneTestPagePO(appPO, {cssClass: identifier});
  }
}

/**
 * Allows interacting with the specified accordion panel.
 */
export class PanelPO {

  private _accordion: SciAccordionPO;

  constructor(accordionLocator: Locator, private _accordionItemCssClass: string) {
    this._accordion = new SciAccordionPO(accordionLocator);
  }

  public async expand(): Promise<void> {
    await this._accordion.expand(this._accordionItemCssClass);
  }

  public async subscribe(options: {subscribeInAngularZone: boolean}): Promise<void> {
    const locator = this._accordion.itemLocator(this._accordionItemCssClass);
    await new SciCheckboxPO(locator.locator('sci-checkbox.e2e-run-inside-angular')).toggle(options.subscribeInAngularZone);
    await locator.locator('button.e2e-subscribe').click();
  }

  public async isEmissionReceivedInAngularZone(emission: {nth: number}): Promise<boolean> {
    const locator = this._accordion.itemLocator(this._accordionItemCssClass);
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
