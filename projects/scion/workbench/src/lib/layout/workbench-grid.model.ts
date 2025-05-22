/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {assertType} from '../common/asserts.util';
import {ViewId} from '../view/workbench-view.model';
import {NavigationData} from '../routing/routing.model';
import {PartId} from '../part/workbench-part.model';
import {ActivityId} from '../activity/workbench-activity.model';

/**
 * Represents the arrangement of parts as grid.
 *
 * The M-prefix indicates this object is a model object that is serialized and stored, requiring migration on breaking change.
 */
export interface MPartGrid {
  root: MTreeNode | MPart;
  activePartId: PartId;
}

/**
 * {@link MPartGrid} with additional fields not serialized into the URL.
 */
export interface ɵMPartGrid extends MPartGrid {
  /**
   * Indicates if this grid was migrated from an older version.
   */
  migrated?: true;
}

/**
 * Represents a node in the grid.
 *
 * A node contains two children, which are either a {@link MPart} or a {@link MTreeNode}, respectively.
 * The ratio together with the direction describes how to arrange the two children.
 *
 * The M-prefix indicates this object is a model object that is serialized and stored, requiring migration on breaking change.
 */
export class MTreeNode {

  /**
   * Discriminator to unmarshall {@link MTreeNode} to its class type.
   */
  public readonly type = 'MTreeNode';
  public id!: string;
  public child1!: MTreeNode | MPart;
  public child2!: MTreeNode | MPart;
  public ratio!: number;
  public direction!: 'column' | 'row';
  public parent?: MTreeNode;

  constructor(treeNode: Omit<MTreeNode, 'type'>) {
    treeNode.parent && assertType(treeNode.parent, {toBeOneOf: MTreeNode}); // assert not to be an object literal
    assertType(treeNode.child1, {toBeOneOf: [MTreeNode, MPart]}); // assert not to be an object literal
    assertType(treeNode.child2, {toBeOneOf: [MTreeNode, MPart]}); // assert not to be an object literal
    Object.assign(this, treeNode);
  }

  /**
   * Tests if the given object is a {@link MTreeNode}.
   */
  public static isMTreeNode(object: unknown): object is MTreeNode {
    return !!object && (object as Partial<MTreeNode>).type === 'MTreeNode';
  }
}

/**
 * Represents a part in the grid.
 *
 * A part can be a stack of views or display content.
 *
 * The M-prefix indicates this object is a model object that is serialized and stored, requiring migration on breaking change.
 */
export class MPart {

  /**
   * Discriminator to unmarshall {@link MPart} to its class type.
   */
  public readonly type = 'MPart';
  public id!: PartId;
  public alternativeId?: string;
  public title?: string;
  public parent?: MTreeNode;
  public views!: MView[];
  public activeViewId?: ViewId;
  public structural!: boolean;
  public cssClass?: string[];
  public navigation?: {
    id: string;
    hint?: string;
    data?: NavigationData;
    cssClass?: string[];
  };

  constructor(part: Omit<MPart, 'type'>) {
    part.parent && assertType(part.parent, {toBeOneOf: MTreeNode}); // assert not to be an object literal
    Object.assign(this, part);
  }

  /**
   * Tests if the given object is a {@link MPart}.
   */
  public static isMPart(object: unknown): object is MPart {
    return !!object && (object as Partial<MPart>).type === 'MPart';
  }
}

/**
 * Represents a view contained in a {@link MPart}.
 *
 * The M-prefix indicates this object is a model object that is serialized and stored, requiring migration on breaking change.
 */
export interface MView {
  id: ViewId;
  alternativeId?: string;
  cssClass?: string[];
  markedForRemoval?: true;
  navigation?: {
    id: string;
    hint?: string;
    data?: NavigationData;
    cssClass?: string[];
  };
}

/**
 * Grids referenced in the workbench layout.
 */
export interface WorkbenchGrids<T = ɵMPartGrid> {
  /**
   * Reference to the "root" grid of the workbench layout.
   */
  main: T;
  /**
   * Reference to the main area grid, a sub-grid embedded by the main area part contained in the main grid.
   */
  mainArea?: T;

  /**
   * Grids associated with activities.
   *
   * An activity has at least one part, the reference part, specified when creating the activity (docked part).
   * Removing the reference part removes the activity. Most activities have a grid with only the reference part.
   */
  [activityId: ActivityId]: T;
}
