/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ElementFinder} from 'protractor/built/element';
import {$} from 'protractor';
import {coerceArray} from '../../deps/angular/cdk/coercion';

/**
 * Provides element finders for SCION Workbench e2e tests.
 */
export namespace ElementFinders {

  /**
   * Finds the <sci-router-outlet> element with the given name or that has set the given CSS class(es).
   */
  export function routerOutlet(outletNameOrSelector: string | RouterOutletSelector): ElementFinder {
    if (typeof outletNameOrSelector === 'string') {
      return $(`sci-router-outlet[name="${outletNameOrSelector}"]`);
    }
    if (outletNameOrSelector.outletName) {
      return $(`sci-router-outlet[name="${outletNameOrSelector.outletName}"]`);
    }
    if (outletNameOrSelector.cssClass) {
      return $(`sci-router-outlet.${coerceArray(outletNameOrSelector.cssClass).join('.')}`);
    }
    throw Error('[ElementFinderInputError] Missing required outlet name or CSS class');
  }
}

/**
 * Instructions for selecting a <sci-router-outlet> element.
 */
export interface RouterOutletSelector {
  outletName?: string;
  cssClass?: string | string[];
}
