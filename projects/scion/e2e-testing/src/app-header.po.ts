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
    await this._locator.locator('button.e2e-perspective-switcher-menu-button').click();

    const menuItem = this._locator.page()
      .locator('.e2e-application-menu') // CDK overlay
      .locator('app-menu')
      .locator(`button.e2e-menu-item[data-perspectiveid="${perspectiveId}"]`);

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
   * Configures how to align the bottom activity panel.
   */
  public async setPanelAlignment(alignment: 'left' | 'right' | 'center' | 'justify'): Promise<void> {
    await this.clickSettingMenuItem({cssClass: `e2e-change-panel-alignment-${alignment}`});
  }

  /**
   * Clicks specified setting in settings menu.
   */
  public async clickSettingMenuItem(locateBy: {cssClass: string}, options?: {check?: boolean}): Promise<void> {
    await this._locator.locator('button.e2e-settings-menu-button').click();

    const menuItem = this._locator.page()
      .locator('.e2e-application-menu') // CDK overlay
      .locator('app-menu')
      .locator(`button.e2e-menu-item.${locateBy.cssClass}`);

    // Wait until the menu is attached.
    await menuItem.waitFor({state: 'attached'});

    // Do not toggle the menu item if already in the expected state.
    if (options?.check !== undefined && (await menuItem.locator('span.e2e-check-mark').isVisible()) === options.check) {
      return this._locator.page().keyboard.press('Escape');
    }

    return menuItem.click();
  }
}
