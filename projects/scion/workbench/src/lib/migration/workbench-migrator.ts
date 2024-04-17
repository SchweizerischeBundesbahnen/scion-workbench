/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchMigration} from './workbench-migration';

/**
 * Migrates serialized workbench data to the latest version.
 */
export class WorkbenchMigrator {

  private _migrators = new Map<number, WorkbenchMigration>();

  /**
   * Registers a migration from a specific version to the next version.
   */
  public registerMigration(fromVersion: number, migration: WorkbenchMigration): this {
    this._migrators.set(fromVersion, migration);
    return this;
  }

  /**
   * Migrates serialized workbench data to the latest version.
   */
  public migrate(json: string, version: {from: number; to: number}): string {
    for (let v = version.from; v < version.to; v++) {
      const migrator = this._migrators.get(v);
      if (!migrator) {
        throw Error(`[NullMigrationError] Cannot perform workbench data migration. No migration registered for version ${v}.`);
      }
      json = migrator.migrate(json);
    }
    return json;
  }
}
