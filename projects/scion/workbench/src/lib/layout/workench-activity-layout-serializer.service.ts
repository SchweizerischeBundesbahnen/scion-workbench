/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';
import {WorkbenchMigrator} from '../migration/workbench-migrator';
import {stringify} from './stringifier';
import {MActivityLayout} from '../activity/workbench-activity.model';

/**
 * Serializes and deserializes a base64-encoded JSON into a {@link MActivityLayout}.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchActivityLayoutSerializer {

  private _layoutMigrator = new WorkbenchMigrator();

  public serializeActivityLayout(layout: MActivityLayout, flags?: ActivityLayoutSerializationFlags): string;
  public serializeActivityLayout(layout: MActivityLayout | undefined, flags?: ActivityLayoutSerializationFlags): string | undefined;
  public serializeActivityLayout(layout: MActivityLayout | undefined, flags?: ActivityLayoutSerializationFlags): string | undefined {
    if (layout === undefined) {
      return undefined;
    }

    const json = stringify(layout, {
      sort: flags?.sort,
    });
    return window.btoa(`${json}${VERSION_SEPARATOR}${WORKBENCH_ACTIVITY_LAYOUT_VERSION}`);
  }

  public deserializeActivityLayout(serialized: string): MActivityLayout {
    const [jsonLayout, jsonLayoutVersion] = window.atob(serialized).split(VERSION_SEPARATOR, 2);
    const layoutVersion = Number.isNaN(Number(jsonLayoutVersion)) ? 1 : Number(jsonLayoutVersion);
    const migratedJsonLayout = this._layoutMigrator.migrate(jsonLayout, {from: layoutVersion, to: WORKBENCH_ACTIVITY_LAYOUT_VERSION});
    return JSON.parse(migratedJsonLayout) as MActivityLayout;
  }
}

/**
 * Represents the current version of the workbench activity layout model.
 *
 * Increment this version and write a migrator when introducing a breaking layout model change.
 *
 * @see WorkbenchMigrator
 */
export const WORKBENCH_ACTIVITY_LAYOUT_VERSION = 1;

/**
 * Separates the serialized JSON model and its version in the base64-encoded string.
 *
 * Format: <json>//<version>
 */
const VERSION_SEPARATOR = '//';

/**
 * Controls how to serialize the activity layout.
 */
export interface ActivityLayoutSerializationFlags {
  /**
   * Assigns each activity a stable id based on its position in the tabbar.
   *
   * Stable part identifiers are required to compare the initial layout with the user-modified layout to detect layout changes.
   */
  assignStableActivityIdentifier?: true;
  /**
   * Controls if to sort the fields of the layout by name. Defaults to `false`.
   *
   * Stable sort order is required to compare the initial layout with the user-modified layout to detect layout changes.
   */
  sort?: true;
}
