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
import {Intention, Qualifier} from '@scion/microfrontend-platform';
import {SciKeyValueFieldPO} from '../../@scion/components.internal/key-value-field.po';
import {Locator} from '@playwright/test';
import {rejectWhenAttached} from '../../helper/testing.util';
import {SciRouterOutletPO} from './sci-router-outlet.po';
import {MicrofrontendViewPagePO} from '../../workbench/page-object/workbench-view-page.po';
import {ViewPO} from '../../view.po';

/**
 * Page object to interact with {@link RegisterWorkbenchIntentionPageComponent}.
 */
export class RegisterWorkbenchIntentionPagePO implements MicrofrontendViewPagePO {

  public readonly locator: Locator;
  public readonly outlet: SciRouterOutletPO;
  public readonly view: ViewPO;

  constructor(appPO: AppPO, locateBy: {viewId?: string; cssClass?: string}) {
    this.view = appPO.view({viewId: locateBy.viewId, cssClass: locateBy.cssClass});
    this.outlet = new SciRouterOutletPO(appPO, {name: locateBy.viewId, cssClass: locateBy.cssClass});
    this.locator = this.outlet.frameLocator.locator('app-register-workbench-intention-page');
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
    const responseLocator = this.locator.locator('output.e2e-register-response');
    const errorLocator = this.locator.locator('output.e2e-register-error');
    return Promise.race([
      responseLocator.waitFor({state: 'attached'}).then(() => responseLocator.locator('span.e2e-intention-id').innerText()),
      rejectWhenAttached(errorLocator),
    ]);
  }

  public async selectType(type: 'view' | 'popup' | 'messagebox' | 'notification'): Promise<void> {
    await this.locator.locator('select.e2e-type').selectOption(type);
  }

  public async enterQualifier(qualifier: Qualifier | undefined): Promise<void> {
    const keyValueField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-qualifier'));
    await keyValueField.clear();
    if (qualifier && Object.keys(qualifier).length) {
      await keyValueField.addEntries(qualifier);
    }
  }

  public async clickRegister(): Promise<void> {
    await this.locator.locator('button.e2e-register').click();
  }
}

