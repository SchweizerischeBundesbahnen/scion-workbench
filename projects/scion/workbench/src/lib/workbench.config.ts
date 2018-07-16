/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

/**
 * Configuration for the Workbench.
 */
import { NLS_DEFAULTS } from './workbench.constants';

export class WorkbenchConfig {

  nls?: { [key: string]: string } = NLS_DEFAULTS;

  constructor(config: WorkbenchConfig) {
    Object.keys(config)
      .filter(key => typeof config[key] !== 'undefined')
      .forEach(key => this[key] = config[key]);
  }

  /**
   * Returns the NLS text for the given key.
   */
  public text?(key: string): string {
    return this.nls[key];
  }
}
