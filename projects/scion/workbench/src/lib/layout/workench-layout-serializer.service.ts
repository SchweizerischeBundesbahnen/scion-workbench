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
import {MPart, MPartGrid, MTreeNode, ɵMPartGrid} from './workbench-layout.model';
import {ViewOutlets} from '../routing/routing.model';
import {UrlSegment} from '@angular/router';
import {WorkbenchLayoutMigrationV3} from './migration/workbench-layout-migration-v3.service';
import {WorkbenchMigrator} from '../migration/workbench-migrator';
import {ViewId} from '../view/workbench-view.model';
import {WorkbenchLayoutMigrationV4} from './migration/workbench-layout-migration-v4.service';
import {randomUUID} from '../common/uuid.util';

/**
 * Serializes and deserializes a base64-encoded JSON into a {@link MPartGrid}.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchLayoutSerializer {

  private _workbenchLayoutMigrator = new WorkbenchMigrator()
    .registerMigration(2, inject(WorkbenchLayoutMigrationV3))
    .registerMigration(3, inject(WorkbenchLayoutMigrationV4));

  /**
   * Serializes the given grid into a URL-safe base64 string.
   *
   * @param grid - Specifies the grid to be serialized.
   * @param options - Controls the serialization.
   * @param options.includeNodeId - Controls if to include the `nodeId`. By default, if not set, the `nodeId` is excluded from serialization.
   * @param options.includeUid - Controls if to include the view `uid`. By default, if not set, the `uid` is excluded from serialization.
   * @param options.includeMarkRemovedFlag - Controls if to include the `markedForRemoval` flag. By default, if not set, the `markedForRemoval` is excluded from serialization.
   */
  public serializeGrid(grid: MPartGrid, options?: {includeNodeId?: boolean; includeUid?: boolean; includeMarkedForRemovalFlag?: boolean}): string;
  public serializeGrid(grid: MPartGrid | undefined | null, options?: {includeNodeId?: boolean; includeUid?: boolean; includeMarkedForRemovalFlag?: boolean}): null | string;
  public serializeGrid(grid: MPartGrid | undefined | null, options?: {includeNodeId?: boolean; includeUid?: boolean; includeMarkedForRemovalFlag?: boolean}): string | null {
    if (grid === null || grid === undefined) {
      return null;
    }

    const transientFields = new Set<string>(TRANSIENT_FIELDS);
    if (!options?.includeNodeId) {
      transientFields.add('nodeId');
    }
    if (!options?.includeUid) {
      transientFields.add('uid');
    }
    if (!options?.includeMarkedForRemovalFlag) {
      transientFields.add('markedForRemoval');
    }

    const json = JSON.stringify(grid, (key, value) => {
      return transientFields.has(key) ? undefined : value;
    });
    return window.btoa(`${json}${VERSION_SEPARATOR}${WORKBENCH_LAYOUT_VERSION}`);
  }

  /**
   * Deserializes the given base64-serialized grid, applying necessary migrations if the serialized grid is outdated.
   */
  public deserializeGrid(serialized: string): ɵMPartGrid {
    const [jsonGrid, jsonGridVersion] = window.atob(serialized).split(VERSION_SEPARATOR, 2);
    const gridVersion = Number.isNaN(Number(jsonGridVersion)) ? 1 : Number(jsonGridVersion);
    const migratedJsonGrid = this._workbenchLayoutMigrator.migrate(jsonGrid, {from: gridVersion, to: WORKBENCH_LAYOUT_VERSION});

    // Parse the JSON.
    const grid: MPartGrid = JSON.parse(migratedJsonGrid, (key, value) => {
      if (MPart.isMPart(value)) {
        const views = value.views.map(view => ({...view, uid: view.uid ?? randomUUID()}));
        return new MPart({...value, views}); // create a class object from the object literal
      }
      if (MTreeNode.isMTreeNode(value)) {
        return new MTreeNode({...value, nodeId: value.nodeId ?? randomUUID()}); // create a class object from the object literal
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

    return (gridVersion < WORKBENCH_LAYOUT_VERSION) ? {...grid, migrated: true} : grid;
  }

  /**
   * Serializes the given outlets.
   */
  public serializeViewOutlets(viewOutlets: ViewOutlets): string {
    return JSON.stringify(Object.fromEntries(Object.entries(viewOutlets)
      .map(([viewId, segments]: [string, UrlSegment[]]): [string, MUrlSegment[]] => {
        return [viewId, segments.map(segment => ({path: segment.path, parameters: segment.parameters}))];
      })));
  }

  /**
   * Deserializes the given outlets.
   */
  public deserializeViewOutlets(serialized: string): ViewOutlets {
    const viewOutlets: {[viewId: ViewId]: MUrlSegment[]} = JSON.parse(serialized);

    return Object.fromEntries(Object.entries(viewOutlets)
      .map(([viewId, segments]: [string, MUrlSegment[]]): [string, UrlSegment[]] => {
        return [viewId, segments.map(segment => new UrlSegment(segment.path, segment.parameters))];
      }));
  }
}

/**
 * Represents the current version of the workbench layout model.
 *
 * Increment this version and write a migrator when introducting a breaking layout model change.
 *
 * @see WorkbenchMigrator
 */
export const WORKBENCH_LAYOUT_VERSION = 4;

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

/**
 * Represents a segment in the URL.
 *
 * The M-prefix indicates this object is a model object that is serialized and stored, requiring migration on breaking change.
 */
interface MUrlSegment {
  path: string;
  parameters: {[name: string]: string};
}
