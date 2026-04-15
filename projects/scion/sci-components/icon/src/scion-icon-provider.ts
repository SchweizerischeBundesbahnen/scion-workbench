/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, input, inputBinding, signal} from '@angular/core';
import {SciIconProviderFn} from './icon-provider.model';
import {SciComponentDescriptor} from '@scion/sci-components/common';

/**
 * Provides icons used in SCION libraries.
 *
 * Register this provider as the last icon provider, enabling replacement of built-in SCION icons.
 */
export const scionIconProvider: SciIconProviderFn = (icon: string): SciComponentDescriptor | undefined => {
  const ligature = scionIcons[icon];
  if (ligature) {
    return {component: ScionIconComponent, bindings: [inputBinding('ligature', signal(ligature))]};
  }
  return undefined;
};

/**
 * Maps icons to ligatures of the SCION icon font.
 */
const scionIcons: {[icon: string]: string} = {
  'scion.clear': 'clear',
  'scion.close': 'close',
  'scion.dirty': 'dirty',
  'scion.menu_down': 'chevron_down',
  'scion.minimize': 'minimize',
  'scion.pin': 'pin',
  'scion.search': 'search',
};

/**
 * Renders the icon for a ligature of the SCION icon font.
 *
 * This component requires the SCION icon font 'scion-icons' to be included in the HTML.
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
  selector: 'sci-scion-icon',
  template: '{{ligature()}}',
  host: {
    '[class.scion-icons]': 'true',
  },
})
export class ScionIconComponent {

  /**
   * Specifies the ligature of the icon.
   */
  public readonly ligature = input.required<string>();
}
