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
import {fromRect, getCssClasses, isActiveElement, isPresent} from './helper/testing.util';

/**
 * Handle for interacting with a workbench message box.
 */
export class MessageBoxPO {

  private readonly _contentLocator: Locator;

  constructor(private readonly _locator: Locator) {
    this._contentLocator = this._locator.locator('.e2e-body');
  }

  public async isPresent(): Promise<boolean> {
    return isPresent(this._contentLocator);
  }

  public async isVisible(): Promise<boolean> {
    return this._contentLocator.isVisible();
  }

  public async getBoundingBox(): Promise<DOMRect> {
    return fromRect(await this._locator.boundingBox());
  }

  public async getTitle(): Promise<string> {
    return this._locator.locator('header.e2e-title').innerText();
  }

  public async getSeverity(): Promise<'info' | 'warn' | 'error'> {
    const cssClasses = await getCssClasses(this._locator);
    if (cssClasses.includes('e2e-severity-info')) {
      return 'info';
    }
    else if (cssClasses.includes('e2e-severity-warn')) {
      return 'warn';
    }
    else if (cssClasses.includes('e2e-severity-error')) {
      return 'error';
    }
    throw Error('Expected severity CSS class to be present, but was not.');
  }

  public async getModality(): Promise<'application' | 'view'> {
    if (await isPresent(this._locator.page().locator('wb-message-box-stack.e2e-view-modal', {has: this._locator}))) {
      return 'view';
    }
    if (await isPresent(this._locator.page().locator('wb-message-box-stack.e2e-application-modal', {has: this._locator}))) {
      return 'application';
    }
    throw Error('Message box not found in the view-modal nor in the application-modal message box stack.');
  }

  public async getActions(): Promise<Record<string, string>> {
    const actions: Record<string, string> = {};

    const actionsLocator = this._locator.locator('button.e2e-action');
    const count = await actionsLocator.count();
    for (let i = 0; i < count; i++) {
      const action = await actionsLocator.nth(i);
      const cssClasses = await getCssClasses(action);
      const actionKey = cssClasses.find(candidate => candidate.startsWith('e2e-action-key-'))!;
      actions[actionKey.substring('e2e-action-key-'.length)] = await action.innerText();
    }

    return actions;
  }

  public async clickActionButton(action: string): Promise<void> {
    await this._locator.locator(`button.e2e-action.e2e-action-key-${action}`).click();
    await this._locator.waitFor({state: 'detached'});
  }

  public async isActionActive(actionKey: string): Promise<boolean> {
    return isActiveElement(this._locator.locator('.e2e-button-bar').locator(`button.e2e-action.e2e-action-key-${actionKey}`));
  }

  public getCssClasses(): Promise<string[]> {
    return getCssClasses(this._locator);
  }

  public async waitUntilAttached(): Promise<void> {
    await this._locator.waitFor({state: 'attached'});
  }

  public locator(selector: string): Locator {
    return this._contentLocator.locator(selector);
  }
}
