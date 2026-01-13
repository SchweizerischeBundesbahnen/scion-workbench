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
import {Qualifier} from '@scion/microfrontend-platform';
import {SciKeyValueFieldPO} from '../../@scion/components.internal/key-value-field.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {Locator} from '@playwright/test';
import {SciRouterOutletPO} from './sci-router-outlet.po';
import {ViewPO} from '../../view.po';
import {MicrofrontendViewPagePO, WorkbenchViewPagePO} from '../../workbench/page-object/workbench-view-page.po';
import {Translatable, WorkbenchMessageBoxOptions} from '@scion/workbench-client';
import {PartPO} from '../../part.po';
import {DialogPO} from '../../dialog.po';
import {PopupPO} from '../../popup.po';
import {MicrofrontendDialogPagePO, WorkbenchDialogPagePO} from '../../workbench/page-object/workbench-dialog-page.po';
import {MicrofrontendPopupPagePO, WorkbenchPopupPagePO} from '../../workbench/page-object/workbench-popup-page.po';
import {AppPO} from '../../app.po';

/**
 * Page object to interact with {@link MessageBoxOpenerPageComponent}.
 */
export class MessageBoxOpenerPagePO implements MicrofrontendViewPagePO, MicrofrontendDialogPagePO, MicrofrontendPopupPagePO, WorkbenchViewPagePO, WorkbenchDialogPagePO, WorkbenchPopupPagePO {

  public readonly locator: Locator;
  public readonly part: PartPO;
  public readonly view: ViewPO;
  public readonly dialog: DialogPO;
  public readonly popup: PopupPO;
  public readonly outlet: SciRouterOutletPO;
  public readonly closeAction: Locator;
  public readonly openButton: Locator;

  private readonly _appPO: AppPO;

  constructor(locateBy: PartPO | ViewPO | DialogPO | PopupPO, options?: {host?: boolean}) {
    this.outlet = new SciRouterOutletPO(locateBy.locator.page(), {name: locateBy.locateBy?.id, cssClass: locateBy.locateBy?.cssClass});
    this.locator = (options?.host ? locateBy.locator : this.outlet.frameLocator).locator('app-message-box-opener-page');

    this.part = locateBy instanceof PartPO ? locateBy : undefined!;
    this.view = locateBy instanceof ViewPO ? locateBy : undefined!;
    this.dialog = locateBy instanceof DialogPO ? locateBy : undefined!;
    this.popup = locateBy instanceof PopupPO ? locateBy : undefined!;

    this.closeAction = this.locator.locator('output.e2e-close-action');
    this.openButton = this.locator.locator('button.e2e-open');

    this._appPO = new AppPO(this.locator.page());
  }

  public async open(message: Translatable | null, options?: WorkbenchMessageBoxOptions): Promise<void>;
  public async open(qualifier: Qualifier, options?: WorkbenchMessageBoxOptions): Promise<void>;
  public async open(content: Translatable | null | Qualifier, options?: WorkbenchMessageBoxOptions): Promise<void> {
    const qualifierField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-qualifier'));
    await qualifierField.clear();

    if (content === null) {
      await this.locator.locator('input.e2e-text').fill('<null>');
    }
    else if (typeof content === 'string') {
      await this.locator.locator('input.e2e-text').fill(content);
    }
    else {
      await qualifierField.addEntries(content);
    }

    if (options?.params) {
      const paramsField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-params'));
      await paramsField.clear();
      await paramsField.addEntries(options.params);
    }

    if (options?.title) {
      await this.locator.locator('input.e2e-title').fill(options.title);
    }

    if (options?.actions) {
      const actionsField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-actions'));
      await actionsField.clear();
      await actionsField.addEntries(options.actions);
    }

    if (options?.severity) {
      await this.locator.locator('select.e2e-severity').selectOption(options.severity);
    }

    if (options?.modality) {
      await this.locator.locator('select.e2e-modality').selectOption(options.modality);
    }

    const context = options?.context && (typeof options.context === 'object' ? options.context.viewId : options.context);
    await this.locator.locator('input.e2e-context').fill(context || (context === null ? '<null>' : '<undefined>'));

    if (options?.contentSelectable) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-content-selectable')).toggle(options.contentSelectable);
    }

    if (options?.cssClass) {
      await this.locator.locator('input.e2e-class').fill(coerceArray(options.cssClass).join(' '));
    }

    const dialogCount = await this._appPO.dialogs.count();
    await this.openButton.click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    return Promise.race([
      waitUntilAttached(this._appPO.dialogs.nth(dialogCount)),
      rejectWhenAttached(this.locator.locator('output.e2e-open-error')),
    ]);
  }
}
