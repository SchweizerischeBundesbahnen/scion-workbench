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
import {MPart, MPartGrid, MTreeNode, WorkbenchGrids, ɵMPartGrid} from './workbench-grid.model';
import {Outlets} from '../routing/routing.model';
import {UrlSegment} from '@angular/router';
import {WorkbenchMigrator} from '../migration/workbench-migrator';
import {WorkbenchGridMigrationV3} from './migration/workbench-grid-migration-v3.service';
import {WorkbenchGridMigrationV4} from './migration/workbench-grid-migration-v4.service';
import {WorkbenchGridMigrationV5} from './migration/workbench-grid-migration-v5.service';
import {WorkbenchGridMigrationV6} from './migration/workbench-grid-migration-v6.service';
import {Exclusion, stringify} from './stringifier';
import {WorkbenchOutlet} from '../workbench.identifiers';
import {WorkbenchGridMigrationV7} from './migration/workbench-grid-migration-v7.service';
import {MActivityLayout} from '../activity/workbench-activity.model';
import {WorkbenchLayoutMigrationV2} from './migration/workbench-layout-migration-v2.service';
import {WorkbenchLayoutMigrationV3} from './migration/workbench-layout-migration-v3.service';
import {WorkbenchLayoutMigrationV4} from './migration/workbench-layout-migration-v4.service';
import {WorkbenchLayoutMigrationV5} from './migration/workbench-layout-migration-v5.service';
import {MAIN_AREA, MWorkbenchLayout} from './workbench-layout';
import {WorkbenchLayouts} from './workbench-layouts.util';
import {WorkbenchLayoutMigrationV6} from './migration/workbench-layout-migration-v6.service';
import {throwError} from '../common/throw-error.util';
import {Objects} from '../common/objects.util';

/**
 * Serializes and deserializes a base64-encoded JSON into a {@link MPartGrid}.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchLayoutSerializer {

  /**
   * Migrates a serialized {@link MWorkbenchLayout} to the latest version.
   */
  private _workbenchLayoutMigrator = new WorkbenchMigrator()
    .registerMigration(1, inject(WorkbenchLayoutMigrationV2))
    .registerMigration(2, inject(WorkbenchLayoutMigrationV3))
    .registerMigration(3, inject(WorkbenchLayoutMigrationV4))
    .registerMigration(4, inject(WorkbenchLayoutMigrationV5))
    .registerMigration(5, inject(WorkbenchLayoutMigrationV6));

  /**
   * Migrates a serialized {@link MPartGrid} to the latest version.
   */
  private _workbenchGridMigrator = new WorkbenchMigrator()
    .registerMigration(2, inject(WorkbenchGridMigrationV3))
    .registerMigration(3, inject(WorkbenchGridMigrationV4))
    .registerMigration(4, inject(WorkbenchGridMigrationV5))
    .registerMigration(5, inject(WorkbenchGridMigrationV6))
    .registerMigration(6, inject(WorkbenchGridMigrationV7));

  /**
   * Migrates a serialized {@link MActivityLayout} to the latest version.
   */
  private _workbenchActivityLayoutMigrator = new WorkbenchMigrator();

  /**
   * Serializes the given workbench layout into a URL-safe base64 string.
   */
  public serialize(data: MWorkbenchLayout): string {
    const json = JSON.stringify(data);
    return window.btoa(appendVersion(json, WORKBENCH_LAYOUT_VERSION));
  }

  /**
   * Deserializes the given base64-serialized workbench layout, applying necessary migrations if the serialized layout is outdated.
   */
  public deserialize(serialized: string | null | undefined): MWorkbenchLayout | null {
    if (!serialized?.length) {
      return null;
    }

    const {json, version} = parseVersion(window.atob(serialized));
    const migrated = this._workbenchLayoutMigrator.migrate(json, {from: version, to: WORKBENCH_LAYOUT_VERSION});
    return JSON.parse(migrated) as MWorkbenchLayout;
  }

  /**
   * Serializes given grid into a URL-safe base64 string.
   *
   * @param grid - Specifies the grid to serialize.
   * @param flags - Controls how to serialize the grids.
   */
  public serializeGrid(grid: MPartGrid, flags?: LayoutSerializationFlags): string {
    const json = stringify(grid, {
      exclusions: new Array<string | Exclusion>()
        .concat('**/parent')
        .concat('migrated')
        .concat('**/visible') // computed when deserializing the grid
        .concat(flags?.excludeTreeNodeId ? ({path: '**/id', predicate: context => context.at(-1) instanceof MTreeNode}) : [])
        .concat(flags?.excludeViewMarkedForRemoval ? '**/views/*/markedForRemoval' : [])
        .concat(flags?.excludeViewNavigationId ? '**/views/*/navigation/id' : [])
        .concat(flags?.excludePartNavigationId ? ({path: '**/navigation/id', predicate: context => context.at(-2) instanceof MPart}) : [])
        .concat(flags?.excludeViewActivationInstant ? '**/views/*/activationInstant' : [])
        .concat(flags?.excludePartActivationInstant ? ({path: '**/activationInstant', predicate: context => context.at(-1) instanceof MPart}) : []),
      sort: flags?.sort,
    });
    return window.btoa(appendVersion(json, WORKBENCH_GRID_VERSION));
  }

  /**
   * Serializes given grids into a URL-safe base64 string.
   *
   * @param grids - Specifies the grids to serialize.
   * @param flags - Controls how to serialize the grids.
   */
  public serializeGrids(grids: WorkbenchGrids, flags?: LayoutSerializationFlags): WorkbenchGrids<string> {
    return Objects.entries(grids).reduce((acc, [gridName, grid]) => {
      acc[gridName] = this.serializeGrid(grid, flags);
      return acc;
    }, {} as WorkbenchGrids<string>);
  }

  /**
   * Deserializes the given base64-serialized grid, applying necessary migrations if the serialized grid is outdated.
   */
  public deserializeGrid(serialized: string): ɵMPartGrid {
    const {json, version} = parseVersion(window.atob(serialized));
    const migratedJsonGrid = this._workbenchGridMigrator.migrate(json, {from: version, to: WORKBENCH_GRID_VERSION});

    // Parse the JSON.
    const grid = JSON.parse(migratedJsonGrid, (key: string, value: unknown) => {
      if (MPart.isMPart(value)) {
        const mPart = new MPart(value); // create a class object from the object literal
        // Compute part visibility.
        mPart.visible = value.id === MAIN_AREA || value.views.length > 0 || !!value.navigation;
        return mPart;
      }
      if (MTreeNode.isMTreeNode(value)) {
        const mTreeNode = new MTreeNode(value); // create a class object from the object literal
        // Compute node visibility.
        const child1Visible = value.child1.visible ?? throwError(`[GridDeserializeError] Missing required property 'visible' [elementId=${value.child1.id}]`);
        const child2Visible = value.child2.visible ?? throwError(`[GridDeserializeError] Missing required property 'visible' [elementId=${value.child2.id}]`);
        mTreeNode.visible = child1Visible || child2Visible;
        return mTreeNode;
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

    // If the grid is not visible, mark the reference part, if any, and its parent nodes as visible.
    if (!grid.root.visible) {
      const referencePart = WorkbenchLayouts.findPart(grid.root, part => part.id === grid.referencePartId);
      if (referencePart) {
        referencePart.visible = true;
        let parent = referencePart.parent;
        while (parent) {
          parent.visible = true;
          parent = parent.parent;
        }
      }
    }

    return (version < WORKBENCH_GRID_VERSION) ? {...grid, migrated: true} : grid;
  }

  /**
   * Serializes given activity layout into a URL-safe base64 string.
   *
   * @param layout - Specifies the activity layout to serialize.
   * @param flags - Controls how to serialize the activity layout.
   */
  public serializeActivityLayout(layout: MActivityLayout, flags?: LayoutSerializationFlags): string;
  public serializeActivityLayout(layout: MActivityLayout | undefined, flags?: LayoutSerializationFlags): string | undefined;
  public serializeActivityLayout(layout: MActivityLayout | undefined, flags?: LayoutSerializationFlags): string | undefined {
    if (layout === undefined) {
      return undefined;
    }

    const json = stringify(layout, {
      sort: flags?.sort,
    });
    return window.btoa(appendVersion(json, WORKBENCH_ACTIVITY_LAYOUT_VERSION));
  }

  /**
   * Deserializes the given base64-serialized activity layout, applying necessary migrations if the serialized layout is outdated.
   */
  public deserializeActivityLayout(serialized: string): MActivityLayout {
    const {json, version} = parseVersion(window.atob(serialized));
    const migratedJsonLayout = this._workbenchActivityLayoutMigrator.migrate(json, {from: version, to: WORKBENCH_ACTIVITY_LAYOUT_VERSION});
    return JSON.parse(migratedJsonLayout) as MActivityLayout;
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
 * Represents the current version of the workbench layout.
 *
 * Increment this version and write a migrator when introducing a breaking change.
 *
 * @see WorkbenchMigrator
 */
const WORKBENCH_LAYOUT_VERSION = 6;

/**
 * Represents the current version of the workbench grid model.
 *
 * Increment this version and write a migrator when introducing a breaking layout model change.
 *
 * @see WorkbenchMigrator
 */
const WORKBENCH_GRID_VERSION = 7;

/**
 * Represents the current version of the workbench activity layout model.
 *
 * Increment this version and write a migrator when introducing a breaking layout model change.
 *
 * @see WorkbenchMigrator
 */
const WORKBENCH_ACTIVITY_LAYOUT_VERSION = 1;

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
 * Controls how to serialize the workbench layout.
 */
export interface LayoutSerializationFlags {
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
   * Excludes the view activation instant from the serialization.
   */
  excludeViewActivationInstant?: true;
  /**
   * Excludes the part activation instant from the serialization.
   */
  excludePartActivationInstant?: true;
  /**
   * Assigns each view a stable id based on its position in the grid.
   *
   * Stable view identifiers are required to compare the initial grid with the user-modified grid to detect layout changes.
   */
  assignStableViewIdentifier?: true;
  /**
   * Assigns each part a stable id based on its position in the grid.
   *
   * Stable identifiers may be required to compare two layouts for equality.
   */
  assignStablePartIdentifier?: true;
  /**
   * Assigns each activity a stable id based on its position in the layout.
   *
   * Stable identifiers may be required to compare two layouts for equality.
   */
  assignStableActivityIdentifier?: true;
  /**
   * Controls if to sort the fields of object literals by name. Defaults to `false`.
   *
   * Stable sort order may be required to compare two layouts for equality.
   */
  sort?: true;
}

/**
 * Separator between serialized data and its version.
 */
const VERSION_SEPARATOR = '//';

/**
 * Regex to extract JSON and version from a versioned string.
 */
const VERSION_REGEX = /(?<json>.+)(\/\/(?<version>\d+)?)$/;

/**
 * Adds specified version to the JSON string.
 */
function appendVersion(json: string, version: number): string {
  return `${json}${VERSION_SEPARATOR}${version}`;
}

/**
 * Extracts JSON and version from a versioned string.
 */
function parseVersion(versioned: string): {json: string; version: number} {
  const match = VERSION_REGEX.exec(versioned);
  if (match) {
    return {json: match.groups!['json']!, version: +match.groups!['version']!};
  }
  return {json: versioned, version: 1}; // not versioned yet
}
