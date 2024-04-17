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
 * Represents a migration to migrate a workbench object to the next version.
 */
export interface WorkbenchMigration {

  /**
   * Migrates serialized workbench data to the next version.
   */
  migrate(json: string): string;
}
