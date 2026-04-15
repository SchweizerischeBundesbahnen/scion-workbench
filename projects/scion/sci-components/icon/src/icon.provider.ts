/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';
import {SciIconProviderFn} from './icon-provider.model';
import {SCI_ICON_PROVIDER} from './icon-providers';

/**
 * Enables contribution or replacement of icons used in SCION.
 *
 * An icon provider is a function that returns a component for an icon. The component renders the icon.
 *
 * Multiple icon providers can be registered. Providers are called in registration order. If a provider does not provide the icon,
 * the next provider is called, and so on.
 *
 * Defaults to a Material icon provider, interpreting the icon as a Material icon ligature.
 *
 * The default icon provider requires the application to include the Material icon font, for example in `styles.scss`, as follows:
 * ```scss
 * @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded');
 * ```
 *
 * SCION uses the following icons:
 * - `scion.clear`: Clear button in input fields
 * - `scion.close`: Close button in views, dialogs and notifications
 * - `scion.dirty`: Visual indicator for view with unsaved content
 * - `scion.menu_down`: Menu button of drop down menus
 * - `scion.minimize`: Minimize button in docked parts
 * - `scion.pin`: Visual indicator for a pinned view
 * - `scion.search`: Visual indicator in search or filter fields
 *
 * To not replace built-in icons, the icon provider can return `undefined` for icons starting with the `scion.` prefix.
 *
 * The function can call `inject` to get any required dependencies.
 *
 * @see SciIconProviderFn
 * @see SciIconComponent
 */
export function provideIconProvider(iconProviderFn: SciIconProviderFn | undefined): EnvironmentProviders {
  return makeEnvironmentProviders(iconProviderFn ? [
    {
      provide: SCI_ICON_PROVIDER,
      useValue: iconProviderFn,
      multi: true,
    },
  ] : []);
}
