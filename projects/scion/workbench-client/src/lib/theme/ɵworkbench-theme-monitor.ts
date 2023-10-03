/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Observable} from 'rxjs';
import {Beans} from '@scion/toolkit/bean-manager';
import {ContextService} from '@scion/microfrontend-platform';
import {WorkbenchThemeMonitor} from './workbench-theme-monitor';

/**
 * @inheritDoc
 */
export class ɵWorkbenchThemeMonitor implements WorkbenchThemeMonitor {

  /**
   * @inheritDoc
   */
  public theme$: Observable<string | null> = Beans.get(ContextService).observe$<string>(ɵTHEME_CONTEXT_KEY);
}

/**
 * Context key to retrieve the theme for microfrontends embedded in a workbench router outlet.
 *
 * @docs-private Not public API, intended for internal use only.
 * @ignore
 * @see {@link ContextService}
 */
export const ɵTHEME_CONTEXT_KEY = 'ɵworkbench.theme';
