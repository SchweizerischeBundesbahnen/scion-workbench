/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from '../../../app.po';
import {Locator} from '@playwright/test';
import {isActiveElement} from '../../../helper/testing.util';
import {ElementSelectors} from '../../../helper/element-selectors';
import {MicrofrontendNavigator} from '../../microfrontend-navigator';
import {RegisterWorkbenchCapabilityPagePO} from '../register-workbench-capability-page.po';
import {ViewPO} from '../../../view.po';

export class InputFieldTestPagePO {

  private readonly _locator: Locator;
  public readonly view: ViewPO;

  constructor(appPO: AppPO, viewId: string) {
    this.view = appPO.view({viewId});
    this._locator = appPO.page.frameLocator(ElementSelectors.routerOutletFrame(viewId)).locator('app-input-field-test-page');
  }

  public async clickInputField(): Promise<void> {
    await this._locator.locator('input.e2e-input').click();
  }

  public async isActiveElement(): Promise<boolean> {
    return isActiveElement(this._locator.locator('input.e2e-input'));
  }

  public static async openInNewTab(appPO: AppPO, microfrontendNavigator: MicrofrontendNavigator): Promise<InputFieldTestPagePO> {
    // Register the test page as view.
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {test: 'input-field'},
      properties: {
        path: 'test-pages/input-field-test-page',
        cssClass: 'e2e-test-input-field',
        title: 'Input Field Test Page',
        pinToStartPage: true,
      },
    });
    await registerCapabilityPagePO.viewTabPO.close();

    // Navigate to the view.
    const startPagePO = await appPO.openNewViewTab();
    await startPagePO.clickTestCapability('e2e-test-input-field', 'app1');

    // Create the page object.
    const view = await appPO.view({cssClass: 'e2e-test-input-field'});
    await view.waitUntilPresent();
    return new InputFieldTestPagePO(appPO, await view.getViewId());
  }
}
