/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {MenuItemConfig, WorkbenchConfig} from '../workbench-config';
import {WorkbenchTextProviderFn} from './workbench-text-provider.model';
import {Signal} from '@angular/core';

/**
 * Provides texts of menu items configured in {@link ViewMenuItemsConfig}.
 *
 * @deprecated since version 19.0.0-beta.3. Remove when dropping support for {@link MenuItemConfig.text}.
 */
export function workbenchViewMenuConfigTextProvider(config: WorkbenchConfig): WorkbenchTextProviderFn {
  if (!config.viewMenuItems) {
    return () => undefined;
  }

  const menuItemTexts = new Map<string, (() => string | Signal<string>) | string | undefined>()
    .set('workbench.close_tab.action', getConfiguredText(config.viewMenuItems.close))
    .set('workbench.close_other_tabs.action', getConfiguredText(config.viewMenuItems.closeOthers))
    .set('workbench.close_all_tabs.action', getConfiguredText(config.viewMenuItems.closeAll))
    .set('workbench.close_tabs_to_the_right.action', getConfiguredText(config.viewMenuItems.closeToTheRight))
    .set('workbench.close_tabs_to_the_left.action', getConfiguredText(config.viewMenuItems.closeToTheLeft))
    .set('workbench.move_tab_to_the_right.action', getConfiguredText(config.viewMenuItems.moveRight))
    .set('workbench.move_tab_to_the_left.action', getConfiguredText(config.viewMenuItems.moveLeft))
    .set('workbench.move_tab_up.action', getConfiguredText(config.viewMenuItems.moveUp))
    .set('workbench.move_tab_down.action', getConfiguredText(config.viewMenuItems.moveDown))
    .set('workbench.move_tab_to_new_window.action', getConfiguredText(config.viewMenuItems.moveToNewWindow));

  return (key: string): Signal<string> | string | undefined => {
    const menuItemText = menuItemTexts.get(key);
    if (menuItemText) {
      return typeof menuItemText === 'function' ? menuItemText() : menuItemText;
    }
    return undefined;
  };
}

function getConfiguredText(menuItemConfig: MenuItemConfig | false | undefined): (() => string | Signal<string>) | string | undefined {
  return menuItemConfig ? menuItemConfig.text : undefined;
}
