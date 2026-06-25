/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {SciToggleButtonPO} from './@scion/components.internal/toggle-button.po';
import {MenuPO} from './menu.po';

/**
 * Handle for interacting with the header of the testing application.
 */
export class AppHeaderPO {

  constructor(private readonly _locator: Locator) {
  }

  /**
   * Switches to the specified perspective.
   */
  public async switchPerspective(perspectiveId: string): Promise<void> {
    await this._locator.locator('button.e2e-perspective-switcher-menu').click();

    const menuItem = this._locator.page()
      .locator('sci-menu.e2e-perspective-switcher-menu') // CDK overlay
      .locator(`button[data-perspectiveid="${perspectiveId}"]`);

    // Wait until the menu is attached.
    await menuItem.waitFor({state: 'attached'});

    // Do not switch perspective if already active.
    if (await menuItem.locator('span.e2e-check-mark').isVisible()) {
      return this._locator.page().keyboard.press('Escape');
    }

    return menuItem.click();
  }

  /**
   * Changes the color scheme of the workbench.
   */
  public async changeColorScheme(colorScheme: 'light' | 'dark'): Promise<void> {
    const toggleButton = new SciToggleButtonPO(this._locator.locator('sci-toggle-button.e2e-color-scheme'));
    await toggleButton.toggle(colorScheme === 'light');
  }

  /**
   * Clicks specified setting in settings menu.
   */
  public async clickSettingMenuItem(locateBy: {cssClass: string | string[]}, options?: {check?: boolean}): Promise<void> {
    const menu = await this.openSettingsMenu();
    return menu.clickMenuItem({cssClass: locateBy.cssClass}, {check: options?.check});
  }

  /**
   * Opens the settings menu.
   */
  public async openSettingsMenu(): Promise<MenuPO> {
    const menu = new MenuPO(this._locator.page().locator('sci-menu.e2e-settings-menu'));

    // Open the menu only if not yet opened.
    if (!await menu.locator.isVisible()) {
      await this._locator.locator('button.e2e-settings-menu').click();
      // Wait until the menu is opened.
      await menu.locator.waitFor({state: 'visible'});
    }
    return menu;
  }
}
