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

/**
 * Enables an application to monitor the workbench theme.
 */
export abstract class WorkbenchThemeMonitor {

  /**
   * Emits the name of the current workbench theme.
   *
   * Upon subscription, emits the name of the current theme, and then continuously emits when switching the theme. It never completes.
   */
  public abstract readonly theme$: Observable<string | null>;
}
