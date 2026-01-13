/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

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

  constructor(public view: ViewPO, options?: {host?: boolean}) {
    this.outlet = new SciRouterOutletPO(view.locator.page(), {name: view.locateBy?.id, cssClass: view.locateBy?.cssClass});
    this.locator = (options?.host ? view.locator : this.outlet.frameLocator).locator('app-register-workbench-intention-page');
  }

  /**
   * Registers the given workbench intention.
   *
   * This method exists as a convenience method to not have to enter all fields separately.
   *
   * Returns a Promise that resolves to the intention ID upon successful registration, or that rejects on registration error.
   */
  public async registerIntention(intention: Intention & {type: 'perspective' | 'part' | 'view' | 'dialog' | 'popup' | 'messagebox' | 'notification' | 'text-provider'}): Promise<string> {
    await this.locator.locator('select.e2e-type').selectOption(intention.type);
    await this.enterQualifier(intention.qualifier);
    await this.locator.locator('button.e2e-register').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    const responseLocator = this.locator.locator('output.e2e-register-response');
    const errorLocator = this.locator.locator('output.e2e-register-error');
    return Promise.race([
      responseLocator.waitFor({state: 'attached'}).then(() => responseLocator.locator('span.e2e-intention-id').innerText()),
      rejectWhenAttached(errorLocator),
    ]);
  }

  private async enterQualifier(qualifier: Qualifier | undefined): Promise<void> {
    const qualifierField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-qualifier'));
    await qualifierField.clear();
    if (qualifier && Object.keys(qualifier).length) {
      await qualifierField.addEntries(qualifier);
    }
  }
}
