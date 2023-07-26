/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';
import {MPart, MPartGrid, MTreeNode, ɵMPartGrid} from './workbench-layout.model';
import {WorkbenchLayoutMigrator} from './migration/workbench-layout-migrator.service';
import {UUID} from '@scion/toolkit/uuid';

/**
 * Serializes and deserializes a base64-encoded JSON into a {@link MPartGrid}.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchLayoutSerializer {

  constructor(private _workbenchLayoutMigrator: WorkbenchLayoutMigrator) {
  }

  /**
   * Serializes the given grid into a URL-safe base64 string.
   *
   * @param grid - Specifies the grid to be serialized.
   * @param options - Controls the serialization.
   *                  @property nullIfEmpty - If `true` or if not specified, returns `null` for the grid if it contains a single part with no views added to it.
   *                  @property includeNodeId - Controls if to include the `nodeId`. By default, if not set, the `nodeId` is excluded from serialization.
   */
  public serialize(grid: MPartGrid, options: {nullIfEmpty: boolean; includeNodeId?: boolean}): string | null {
    if (options.nullIfEmpty && grid.root instanceof MPart && !grid.root.views.length) {
      return null;
    }

    const transientFields = new Set<string>(TRANSIENT_FIELDS);
    if (!options.includeNodeId) {
      transientFields.add('nodeId');
    }

    const json = JSON.stringify(grid, (key, value) => {
      return transientFields.has(key) ? undefined : value;
    });
    return window.btoa(`${json}${VERSION_SEPARATOR}${WORKBENCH_LAYOUT_VERSION}`);
  }

  /**
   * Deserializes the given base64-serialized grid.
   */
  public deserialize(serializedGrid: string): ɵMPartGrid {
    const [jsonGrid, jsonGridVersion] = window.atob(serializedGrid).split(VERSION_SEPARATOR, 2);
    const gridVersion = Number.isNaN(Number(jsonGridVersion)) ? 1 : Number(jsonGridVersion);
    const isGridOutdated = gridVersion < WORKBENCH_LAYOUT_VERSION;
    const migratedJsonGrid = isGridOutdated ? this._workbenchLayoutMigrator.migrate(gridVersion, jsonGrid) : jsonGrid;

    // Parse the JSON.
    const grid: MPartGrid = JSON.parse(migratedJsonGrid, (key, value) => {
      if (MPart.isMPart(value)) {
        return new MPart(value); // create a class object from the object literal
      }
      if (MTreeNode.isMTreeNode(value)) {
        return new MTreeNode({...value, nodeId: value.nodeId ?? UUID.randomUUID()}); // create a class object from the object literal
      }
      return value;
    });

    // Link parent tree nodes
    (function linkParentNodes(node: MTreeNode | MPart, parent: MTreeNode | undefined): void {
      node.parent = parent;

      if (node instanceof MTreeNode) {
        linkParentNodes(node.child1, node);
        linkParentNodes(node.child2, node);
      }
    })(grid.root, undefined);

    return {...grid, migrated: isGridOutdated};
  }
}

/**
 * Represents the current version of the workbench layout model.
 *
 * Increment this version and write a migrator when introducting a breaking layout model change.
 *
 * @see WorkbenchLayoutMigrator
 */
const WORKBENCH_LAYOUT_VERSION = 2;
/**
 * Fields not serialized into JSON representation.
 */
const TRANSIENT_FIELDS = new Set<string>().add('parent').add('migrated');
/**
 * Separates the serialized JSON model and its version in the base64-encoded string.
 *
 * Format: <json>//<version>
 */
const VERSION_SEPARATOR = '//';
