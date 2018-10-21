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
export class WorkbenchConfig {

  /**
   * Specifies whether to reuse routes of activities.
   * If set to 'true', which is by default, activity components are not destroyed when toggling the activity.
   */
  reuseActivityRoutes?: boolean = true; // tslint:disable-line:no-inferrable-types

  constructor(config: WorkbenchConfig) {
    Object.keys(config)
      .filter(key => typeof config[key] !== 'undefined')
      .forEach(key => this[key] = config[key]);
  }
}
