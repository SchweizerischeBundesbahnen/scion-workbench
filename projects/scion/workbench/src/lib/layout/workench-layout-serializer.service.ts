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
import {Outlets} from '../routing/routing.model';
import {UrlSegment} from '@angular/router';
import {WorkbenchMigrator} from '../migration/workbench-migrator';
import {WorkbenchLayoutMigrationV3} from './migration/workbench-layout-migration-v3.service';
import {WorkbenchLayoutMigrationV4} from './migration/workbench-layout-migration-v4.service';
import {WorkbenchLayoutMigrationV5} from './migration/workbench-layout-migration-v5.service';
import {WorkbenchLayoutMigrationV6} from './migration/workbench-layout-migration-v6.service';
import {Exclusion, stringify} from './stringifier';
import {WorkbenchOutlet} from '../workbench.constants';
import {WorkbenchLayoutMigrationV7} from './migration/workbench-layout-migration-v7.service';

/**
 * Serializes and deserializes a base64-encoded JSON into a {@link MPartGrid}.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchLayoutSerializer {

  private _workbenchLayoutMigrator = new WorkbenchMigrator()
    .registerMigration(2, inject(WorkbenchLayoutMigrationV3))
    .registerMigration(3, inject(WorkbenchLayoutMigrationV4))
    .registerMigration(4, inject(WorkbenchLayoutMigrationV5))
    .registerMigration(5, inject(WorkbenchLayoutMigrationV6))
    .registerMigration(6, inject(WorkbenchLayoutMigrationV7));

  /**
   * Serializes the given grid into a URL-safe base64 string.
   *
   * @param grid - Specifies the grid to be serialized.
   * @param flags - Controls how to serialize the grid.
   */
  public serializeGrid(grid: MPartGrid, flags?: GridSerializationFlags): string;
  public serializeGrid(grid: MPartGrid | undefined | null, flags?: GridSerializationFlags): null | string;
  public serializeGrid(grid: MPartGrid | undefined | null, flags?: GridSerializationFlags): string | null {
    if (grid === null || grid === undefined) {
      return null;
    }

    const json = stringify(grid, {
      exclusions: new Array<string | Exclusion>()
        .concat('**/parent')
        .concat('migrated')
        .concat(flags?.excludeTreeNodeId ? ({path: '**/id', predicate: context => context.at(-1) instanceof MTreeNode}) : [])
        .concat(flags?.excludeViewMarkedForRemoval ? '**/views/*/markedForRemoval' : [])
        .concat(flags?.excludeViewNavigationId ? '**/views/*/navigation/id' : [])
        .concat(flags?.excludePartNavigationId ? ({path: '**/navigation/id', predicate: context => context.at(-2) instanceof MPart}) : []),
      sort: flags?.sort,
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
    const grid = JSON.parse(migratedJsonGrid, (key: string, value: unknown) => {
      if (MPart.isMPart(value)) {
        return new MPart(value); // create a class object from the object literal
      }
      if (MTreeNode.isMTreeNode(value)) {
        return new MTreeNode(value); // create a class object from the object literal
      }
      return value;
    }) as MPartGrid;

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
  public serializeOutlets(outlets: Outlets): string {
    return JSON.stringify(Object.fromEntries(Object.entries(outlets)
      .map(([outlet, segments]: [string, UrlSegment[]]): [string, MUrlSegment[]] => {
        return [outlet, segments.map(segment => ({path: segment.path, parameters: segment.parameters}))];
      })));
  }

  /**
   * Deserializes the given outlets.
   */
  public deserializeOutlets(serialized: string): Outlets {
    const outlets = JSON.parse(serialized) as {[outlet: WorkbenchOutlet]: MUrlSegment[]};

    return Object.fromEntries(Object.entries(outlets)
      .map(([outlet, segments]: [string, MUrlSegment[]]): [string, UrlSegment[]] => {
        return [outlet, segments.map(segment => new UrlSegment(segment.path, segment.parameters))];
      }));
  }
}

/**
 * Represents the current version of the workbench layout model.
 *
 * Increment this version and write a migrator when introducing a breaking layout model change.
 *
 * @see WorkbenchMigrator
 */
export const WORKBENCH_LAYOUT_VERSION = 7;

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

/**
 * Controls how to serialize the grid.
 */
export interface GridSerializationFlags {
  /**
   * Excludes the node id from the serialization.
   */
  excludeTreeNodeId?: true;
  /**
   * Excludes views marked for removal from the serialization.
   */
  excludeViewMarkedForRemoval?: true;
  /**
   * Excludes the view navigation id from the serialization.
   */
  excludeViewNavigationId?: true;
  /**
   * Excludes the part navigation id from the serialization.
   */
  excludePartNavigationId?: true;
  /**
   * Assigns each part a stable id based on its position in the grid.
   *
   * Stable part identifiers are required to compare the initial grid with the user-modified grid to detect layout changes.
   */
  assignStablePartIdentifier?: true;
  /**
   * Controls if to sort the fields of the grid by name. Defaults to `false`.
   *
   * Stable sort order is required to compare the initial grid with the user-modified grid to detect layout changes.
   */
  sort?: true;
}
