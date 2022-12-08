/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from '../../app.po';
import {ViewTabPO} from '../../view-tab.po';
import {Intention, Qualifier} from '@scion/microfrontend-platform';
import {SciParamsEnterPO} from '../../@scion/components.internal/params-enter.po';
import {Locator} from '@playwright/test';
import {ElementSelectors} from '../../helper/element-selectors';
import {rejectWhenAttached} from '../../helper/testing.util';

/**
 * Page object to interact {@link RegisterWorkbenchIntentionPageComponent}.
 */
export class RegisterWorkbenchIntentionPagePO {

  private readonly _locator: Locator;

  public readonly viewTabPO: ViewTabPO;

  constructor(appPO: AppPO, public viewId: string) {
    this.viewTabPO = appPO.view({viewId}).viewTab;
    this._locator = appPO.page.frameLocator(ElementSelectors.routerOutletFrame(viewId)).locator('app-register-workbench-intention-page');
  }

  /**
   * Registers the given workbench intention.
   *
   * This method exists as a convenience method to not have to enter all fields separately.
   *
   * Returns a Promise that resolves to the intention ID upon successful registration, or that rejects on registration error.
   */
  public async registerIntention(intention: Intention & {type: 'view' | 'popup' | 'messagebox' | 'notification'}): Promise<string> {
    await this.selectType(intention.type);
    await this.enterQualifier(intention.qualifier);
    await this.clickRegister();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    const responseLocator = this._locator.locator('output.e2e-register-response');
    const errorLocator = this._locator.locator('output.e2e-register-error');
    return Promise.race([
      responseLocator.waitFor({state: 'attached'}).then(() => responseLocator.locator('span.e2e-intention-id').innerText()),
      rejectWhenAttached(errorLocator)
    ]);
  }

  public async selectType(type: 'view' | 'popup' | 'messagebox' | 'notification'): Promise<void> {
    await this._locator.locator('select.e2e-type').selectOption(type);
  }

  public async enterQualifier(qualifier: Qualifier | undefined): Promise<void> {
    const paramsEnterPO = new SciParamsEnterPO(this._locator.locator('sci-params-enter.e2e-qualifier'));
    await paramsEnterPO.clear();
    if (qualifier && Object.keys(qualifier).length) {
      await paramsEnterPO.enterParams(qualifier);
    }
  }

  public async clickRegister(): Promise<void> {
    await this._locator.locator('button.e2e-register').click();
  }
}

