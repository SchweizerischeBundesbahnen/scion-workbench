/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable} from '@angular/core';
import {MPerspectiveLayouts} from '../perspective/workbench-perspective.model';
import {WorkbenchMigrator} from '../migration/workbench-migrator';
import {WorkbenchPerspectiveMigrationV2} from './migration/workbench-perspective-migration-v2.service';

/**
 * Serializes and deserializes a base64-encoded JSON into a {@link MPartGrid}.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchPerspectiveSerializer {

  private _workbenchPerspectiveMigrator = new WorkbenchMigrator()
    .registerMigration(1, inject(WorkbenchPerspectiveMigrationV2));

  /**
   * Serializes the given grid into a URL-safe base64 string.
   */
  public serialize(data: MPerspectiveLayouts): string {
    const json = JSON.stringify(data);
    return window.btoa(`${json}${VERSION_SEPARATOR}${WORKBENCH_PERSPECTIVE_VERSION}`);
  }

  /**
   * Deserializes the given base64-serialized grid.
   */
  public deserialize(serialized: string | null | undefined): MPerspectiveLayouts | null {
    if (!serialized?.length) {
      return null;
    }

    const [json, version] = window.atob(serialized).split(VERSION_SEPARATOR, 2);
    const serializedVersion = Number.isNaN(Number(version)) ? 1 : Number(version);
    const migrated = this._workbenchPerspectiveMigrator.migrate(json, {from: serializedVersion, to: WORKBENCH_PERSPECTIVE_VERSION});
    return JSON.parse(migrated);
  }
}

/**
 * Represents the current version of the workbench layout model.
 *
 * Increment this version and write a migrator when introducting a breaking layout model change.
 *
 * @see WorkbenchMigrator
 */
export const WORKBENCH_PERSPECTIVE_VERSION = 2;

/**
 * Separates the serialized JSON model and its version in the base64-encoded string.
 *
 * Format: <json>//<version>
 */
const VERSION_SEPARATOR = '//';
