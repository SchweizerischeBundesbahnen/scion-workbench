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
import {MPerspectiveLayout} from '../perspective/workbench-perspective.model';
import {WorkbenchMigrator} from '../migration/workbench-migrator';
import {WorkbenchPerspectiveMigrationV2} from './migration/workbench-perspective-migration-v2.service';
import {WorkbenchPerspectiveMigrationV3} from './migration/workbench-perspective-migration-v3.service';

/**
 * Serializes and deserializes a base64-encoded JSON into a {@link MPerspectiveLayout}.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchPerspectiveSerializer {

  private _workbenchPerspectiveMigrator = new WorkbenchMigrator()
    .registerMigration(1, inject(WorkbenchPerspectiveMigrationV2))
    .registerMigration(2, inject(WorkbenchPerspectiveMigrationV3));

  /**
   * Serializes the given perspective layout into a URL-safe base64 string.
   */
  public serialize(data: MPerspectiveLayout): string {
    const json = JSON.stringify(data);
    return window.btoa(`${json}${VERSION_SEPARATOR}${WORKBENCH_PERSPECTIVE_LAYOUT_VERSION}`);
  }

  /**
   * Deserializes the given base64-serialized perspective layout, applying necessary migrations if the serialized layout is outdated.
   */
  public deserialize(serialized: string | null | undefined): MPerspectiveLayout | null {
    if (!serialized?.length) {
      return null;
    }

    const [json, version] = window.atob(serialized).split(VERSION_SEPARATOR, 2);
    const serializedVersion = Number.isNaN(Number(version)) ? 1 : Number(version);
    const migrated = this._workbenchPerspectiveMigrator.migrate(json, {from: serializedVersion, to: WORKBENCH_PERSPECTIVE_LAYOUT_VERSION});
    return JSON.parse(migrated) as MPerspectiveLayout;
  }
}

/**
 * Represents the current version of the workbench perspective layout.
 *
 * Increment this version and write a migrator when introducing a breaking change.
 *
 * @see WorkbenchMigrator
 */
export const WORKBENCH_PERSPECTIVE_LAYOUT_VERSION = 3;

/**
 * Separates the serialized JSON model and its version in the base64-encoded string.
 *
 * Format: <json>//<version>
 */
const VERSION_SEPARATOR = '//';
