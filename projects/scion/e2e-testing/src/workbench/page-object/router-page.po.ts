/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceArray, commandsToPath, rejectWhenAttached, waitForCondition} from '../../helper/testing.util';
import {AppPO} from '../../app.po';
import {ViewPO} from '../../view.po';
import {SciKeyValueFieldPO} from '../../@scion/components.internal/key-value-field.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {Locator} from '@playwright/test';
import {WorkbenchViewPagePO} from './workbench-view-page.po';
import {Commands, ViewId, ViewState, WorkbenchNavigationExtras} from '@scion/workbench';

/**
 * Page object to interact with {@link RouterPageComponent}.
 */
export class RouterPagePO implements WorkbenchViewPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;

  constructor(private _appPO: AppPO, locateBy: {viewId?: ViewId; cssClass?: string}) {
    this.view = this._appPO.view({viewId: locateBy?.viewId, cssClass: locateBy?.cssClass});
    this.locator = this.view.locator.locator('app-router-page');
  }

  /**
   * Navigates via {@link WorkbenchRouter}.
   */
  public async navigate(commands: Commands, extras?: WorkbenchNavigationExtras & RouterPageOptions): Promise<void> {
    await this.enterCommands(commands);
    await this.enterExtras(extras);

    const navigationId = await this._appPO.getCurrentNavigationId();
    await this.locator.locator('button.e2e-router-navigate').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    await Promise.race([
      waitForCondition(async () => (await this._appPO.getCurrentNavigationId()) !== navigationId),
      rejectWhenAttached(this.locator.locator('output.e2e-navigate-error')),
    ]);
  }

  /**
   * Navigates via workbench router link.
   */
  public async navigateViaRouterLink(commands: Commands, extras?: Omit<WorkbenchNavigationExtras, 'close'> & RouterPageOptions & RouterLinkPageOptions): Promise<void> {
    await this.enterCommands(commands);
    await this.enterExtras(extras);

    const navigationId = await this._appPO.getCurrentNavigationId();
    await this.locator.locator('a.e2e-router-link-navigate').click({modifiers: extras?.modifiers});

    // Wait until navigation completed.
    await waitForCondition(async () => (await this._appPO.getCurrentNavigationId()) !== navigationId);
  }

  private async enterCommands(commands: Commands): Promise<void> {
    await this.locator.locator('input.e2e-commands').fill(commandsToPath(commands));
  }

  private async enterExtras(extras: WorkbenchNavigationExtras & RouterPageOptions | undefined): Promise<void> {
    await this.enterTarget(extras?.target);
    await this.enterHint(extras?.hint);
    await this.enterState(extras?.state);
    await this.checkActivate(extras?.activate);
    await this.checkClose(extras?.close);
    await this.enterPosition(extras?.position);
    await this.enterPartId(extras?.partId);
    await this.checkViewContext(extras?.viewContextActive);
    await this.enterCssClass(extras?.cssClass);
  }

  private async enterState(state?: ViewState): Promise<void> {
    const keyValueField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-state'));
    await keyValueField.clear();
    await keyValueField.addEntries(state ?? {});
  }

  private async checkActivate(check?: boolean): Promise<void> {
    if (check !== undefined) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-activate')).toggle(check);
    }
  }

  private async checkClose(check?: boolean): Promise<void> {
    if (check !== undefined) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-close')).toggle(check);
    }
  }

  private async enterTarget(target?: string | 'blank' | 'auto'): Promise<void> {
    await this.locator.locator('input.e2e-target').fill(target ?? '');
  }

  private async enterHint(hint?: string): Promise<void> {
    await this.locator.locator('input.e2e-hint').fill(hint ?? '');
  }

  private async enterPosition(position?: number | 'start' | 'end' | 'before-active-view' | 'after-active-view'): Promise<void> {
    await this.locator.locator('input.e2e-position').fill(`${position ?? ''}`);
  }

  private async enterPartId(partId?: string): Promise<void> {
    await this.locator.locator('input.e2e-part-id').fill(partId ?? '');
  }

  private async enterCssClass(cssClass?: string | string[]): Promise<void> {
    await this.locator.locator('input.e2e-class').fill(coerceArray(cssClass).join(' '));
  }

  private async checkViewContext(check?: boolean): Promise<void> {
    if (check !== undefined) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-view-context')).toggle(check);
    }
  }
}

export interface RouterPageOptions {
  viewContextActive?: boolean;
}

export interface RouterLinkPageOptions {
  modifiers?: Array<'Alt' | 'Control' | 'Meta' | 'Shift'>;
}
