/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceArray, rejectWhenAttached, waitUntilAttached} from '../../helper/testing.util';
import {AppPO} from '../../app.po';
import {Qualifier} from '@scion/microfrontend-platform';
import {SciKeyValueFieldPO} from '../../@scion/components.internal/key-value-field.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {Locator} from '@playwright/test';
import {SciRouterOutletPO} from './sci-router-outlet.po';
import {ViewPO} from '../../view.po';
import {MicrofrontendViewPagePO} from '../../workbench/page-object/workbench-view-page.po';
import {ViewId, WorkbenchMessageBoxOptions} from '@scion/workbench-client';

/**
 * Page object to interact with {@link MessageBoxOpenerPageComponent}.
 */
export class MessageBoxOpenerPagePO implements MicrofrontendViewPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;
  public readonly outlet: SciRouterOutletPO;
  public readonly closeAction: Locator;

  constructor(private _appPO: AppPO, locateBy: {viewId?: ViewId; cssClass?: string}) {
    this.view = this._appPO.view({viewId: locateBy.viewId, cssClass: locateBy.cssClass});
    this.outlet = new SciRouterOutletPO(this._appPO, {name: locateBy.viewId, cssClass: locateBy.cssClass});
    this.locator = this.outlet.frameLocator.locator('app-message-box-opener-page');
    this.closeAction = this.locator.locator('output.e2e-close-action');
  }

  public async open(message: string, options?: WorkbenchMessageBoxOptions): Promise<void>;
  public async open(qualifier: Qualifier, options?: WorkbenchMessageBoxOptions): Promise<void>;
  public async open(content: string | Qualifier, options?: WorkbenchMessageBoxOptions): Promise<void> {
    if (typeof content === 'string') {
      await this.locator.locator('input.e2e-message').fill(content);
    }
    else {
      const qualifierKeyValueField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-qualifier'));
      await qualifierKeyValueField.clear();
      await qualifierKeyValueField.addEntries(content);
    }

    if (options?.params) {
      const paramsKeyValueField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-params'));
      await paramsKeyValueField.clear();
      await paramsKeyValueField.addEntries(options.params);
    }

    if (options?.title) {
      await this.locator.locator('input.e2e-title').fill(options.title);
    }

    if (options?.actions) {
      const keyValueField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-actions'));
      await keyValueField.clear();
      await keyValueField.addEntries(options.actions);
    }

    if (options?.severity) {
      await this.locator.locator('select.e2e-severity').selectOption(options.severity);
    }

    if (options?.modality) {
      await this.locator.locator('select.e2e-modality').selectOption(options.modality);
    }

    if (options?.context?.viewId) {
      await this.locator.locator('input.e2e-contextual-view-id').fill(options.context.viewId);
    }

    if (options?.contentSelectable) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-content-selectable')).toggle(options.contentSelectable);
    }

    if (options?.cssClass) {
      await this.locator.locator('app-multi-value-input.e2e-class input').fill(coerceArray(options.cssClass).join(' '));
    }

    await this.locator.locator('button.e2e-open').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    return Promise.race([
      waitUntilAttached(this._appPO.messagebox({cssClass: options?.cssClass}).locator),
      rejectWhenAttached(this.locator.locator('output.e2e-open-error')),
    ]);
  }
}
