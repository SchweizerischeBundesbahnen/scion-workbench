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
import {ɵSCI_TEXT_PROVIDER, SciTextProviderFn} from './text-provider.model';

/**
 * Enables localization of texts used in SCION.
 *
 * A text provider is a function that returns the text for a translation key.
 *
 * The translation keys of built-in SCION texts start with the `scion.` prefix. To not localize built-in SCION texts, the text provider can return `undefined` instead.
 *
 * The function:
 * - Can call `inject` to get any required dependencies.
 * - Can call `toSignal` to convert an Observable to a Signal.
 *
 * @see SciTextProviderFn
 * @see text
 */
export function provideTextProvider(textProviderFn: SciTextProviderFn): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: ɵSCI_TEXT_PROVIDER,
      useValue: textProviderFn,
      multi: true,
    },
  ]);
}
