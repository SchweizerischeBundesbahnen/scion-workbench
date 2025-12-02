/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Represents a migration to migrate serialized workbench data to the next version.
 */
export interface WorkbenchMigration<CONTEXT = void> {

  /**
   * Migrates serialized workbench data to the next version.
   *
   * Depending on the migration, a context is passed to read and migrate referenced data,
   * such as referenced outlets when migrating a workbench grid.
   */
  migrate(json: string, context: CONTEXT): string;
}
