/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {UrlSegment} from '@angular/router';
import {WorkbenchOutlet} from '../../workbench.identifiers';

/**
 * Context available while migrating a serialized workbench grid.
 *
 * Allows the migration to read, change and delete outlets.
 */
export class WorkbenchGridMigrationContext {

  private readonly _changedOutlets = new Map<WorkbenchOutlet, UrlSegment[]>();
  private readonly _deletedOutlets = new Set<WorkbenchOutlet>();

  constructor(private _outlets: ReadonlyMap<WorkbenchOutlet, UrlSegment[]>) {
  }

  /**
   * Gets the specified outlet, if found.
   */
  public getOutlet(name: WorkbenchOutlet): UrlSegment[] | undefined {
    return this._outlets.get(name);
  }

  /**
   * Adds or updates the specified outlet.
   */
  public setOutlet(name: WorkbenchOutlet, url: UrlSegment[]): void {
    this._changedOutlets.set(name, url);
  }

  /**
   * Deletes the specified outlet.
   */
  public deleteOutlet(name: WorkbenchOutlet): void {
    this._deletedOutlets.add(name);
  }

  /**
   * Iterates outlets that have been deleted.
   */
  public forEachDeletedOutlet(fn: (name: WorkbenchOutlet) => void): void {
    this._deletedOutlets.forEach(value => fn(value));
  }

  /**
   * Iterates outlets that have been changed or added.
   */
  public forEachChangedOutlet(fn: (name: WorkbenchOutlet, urlSegments: UrlSegment[]) => void): void {
    this._changedOutlets.forEach((urlSegments, name) => fn(name, urlSegments));
  }
}
