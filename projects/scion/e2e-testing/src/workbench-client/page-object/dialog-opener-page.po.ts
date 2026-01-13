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
import {ViewPO} from '../../view.po';
import {Qualifier} from '@scion/microfrontend-platform';
import {SciKeyValueFieldPO} from '../../@scion/components.internal/key-value-field.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {Locator} from '@playwright/test';
import {SciRouterOutletPO} from './sci-router-outlet.po';
import {MicrofrontendViewPagePO} from '../../workbench/page-object/workbench-view-page.po';
import {WorkbenchDialogOptions} from '@scion/workbench-client';
import {PartPO} from '../../part.po';
import {PopupPO} from '../../popup.po';
import {DialogPO} from '../../dialog.po';
import {MicrofrontendDialogPagePO} from '../../workbench/page-object/workbench-dialog-page.po';
import {MicrofrontendPopupPagePO} from '../../workbench/page-object/workbench-popup-page.po';
import {AppPO} from '../../app.po';

/**
 * Page object to interact with {@link DialogOpenerPageComponent}.
 */
export class DialogOpenerPagePO implements MicrofrontendViewPagePO, MicrofrontendDialogPagePO, MicrofrontendPopupPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;
  public readonly part: PartPO;
  public readonly dialog: DialogPO;
  public readonly popup: PopupPO;
  public readonly outlet: SciRouterOutletPO;
  public readonly returnValue: Locator;
  public readonly error: Locator;
  public readonly openButton: Locator;

  private readonly _appPO: AppPO;

  constructor(locateBy: PartPO | ViewPO | DialogPO | PopupPO, options?: {host?: boolean}) {
    this.outlet = new SciRouterOutletPO(locateBy.locator.page(), {name: locateBy.locateBy?.id, cssClass: locateBy.locateBy?.cssClass});
    this.locator = (options?.host ? locateBy.locator : this.outlet.frameLocator).locator('app-dialog-opener-page');

    this.part = locateBy instanceof PartPO ? locateBy : undefined!;
    this.view = locateBy instanceof ViewPO ? locateBy : undefined!;
    this.dialog = locateBy instanceof DialogPO ? locateBy : undefined!;
    this.popup = locateBy instanceof PopupPO ? locateBy : undefined!;

    this.returnValue = this.locator.locator('output.e2e-return-value');
    this.error = this.locator.locator('output.e2e-dialog-error');
    this.openButton = this.locator.locator('button.e2e-open');

    this._appPO = new AppPO(this.locator.page());
  }

  public async open(qualifier: Qualifier, options?: WorkbenchDialogOptions): Promise<void> {
    const qualifierField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-qualifier'));
    await qualifierField.clear();
    await qualifierField.addEntries(qualifier);

    const paramsField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-params'));
    await paramsField.clear();
    await paramsField.addEntries(options?.params ?? {});

    if (options?.modality) {
      await this.locator.locator('select.e2e-modality').selectOption(options.modality);
    }

    const context = options?.context && (typeof options.context === 'object' ? options.context.viewId : options.context);
    await this.locator.locator('input.e2e-context').fill(context || (context === null ? '<null>' : '<undefined>'));

    if (options?.animate !== undefined) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-animate')).toggle(options.animate);
    }

    if (options?.cssClass) {
      await this.locator.locator('input.e2e-class').fill(coerceArray(options.cssClass).join(' '));
    }

    // open the dialog
    const dialogCount = await this._appPO.dialogs.count();
    await this.openButton.click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    await Promise.race([
      waitUntilAttached(this._appPO.dialogs.nth(dialogCount)),
      rejectWhenAttached(this.error),
    ]);
  }
}
