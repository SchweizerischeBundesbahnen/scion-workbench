/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchIconDescriptor, WorkbenchIconProviderFn} from './workbench-icon-provider.model';
import {Component, input} from '@angular/core';

/**
 * Provides icons used by the SCION Workbench.
 *
 * Register this provider as the last icon provider, enabling replacement of built-in workbench icons.
 */
export const workbenchIconProvider: WorkbenchIconProviderFn = (icon: string): WorkbenchIconDescriptor | undefined => {
  const ligature = workbenchIcons[icon];
  if (ligature) {
    return {component: WorkbenchIconComponent, inputs: {ligature}};
  }
  return undefined;
};

/**
 * Maps icons to ligatures of the SCION Workbench icon font.
 */
const workbenchIcons: {[icon: string]: string} = {
  'workbench.clear': 'clear',
  'workbench.close': 'close',
  'workbench.dirty': 'dirty',
  'workbench.menu_down': 'chevron_down',
  'workbench.minimize': 'minimize',
  'workbench.pin': 'pin',
  'workbench.search': 'search',
};

/**
 * Renders a workbench icon based on its ligature.
 *
 * This component requires the workbench icon font 'scion-workbench-icons' to be included in the HTML.
 *
 * Supported ligatures:
 * - `chevron_down`: Menu button of drop down menus
 * - `clear`: Clear button in input fields
 * - `close`: Close button in views, dialogs and notifications
 * - `dirty`: Visual indicator for view with unsaved content
 * - `minimize`: Minimize button in docked parts
 * - `pin`: Visual indicator for a pinned view
 * - `search`: Visual indicator in search or filter fields
 */
@Component({
  selector: 'wb-workbench-icon',
  template: '{{ligature()}}',
  host: {
    '[class.scion-workbench-icons]': 'true',
  },
})
export class WorkbenchIconComponent {

  /**
   * Specifies the ligature of the icon.
   */
  public readonly ligature = input.required<string>();
}
