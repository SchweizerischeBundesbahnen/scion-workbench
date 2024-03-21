/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchMigration} from './workbench-migration';

/**
 * Migrates a workbench layout to the latest version.
 */
export class WorkbenchMigrator {

  private _migrators = new Map<number, WorkbenchMigration>();

  public registerMigration(fromVersion: number, migration: WorkbenchMigration): this {
    this._migrators.set(fromVersion, migration);
    return this;
  }

  /**
   * Migrates a workbench layout to the latest version.
   */
  public migrate(json: string, version: {from: number; to: number}): string {
    for (let v = version.from; v < version.to; v++) {
      const migrator = this._migrators.get(v);
      if (!migrator) {
        throw Error(`[WorkbenchLayoutError] Unsupported version ${v}. Unable to migrate to the latest version ${version.to}.`);
      }
      json = migrator.migrate(json);
    }
    return json;
  }
}
