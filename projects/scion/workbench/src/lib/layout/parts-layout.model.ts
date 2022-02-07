/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {assertType} from '../asserts.util';

/**
 * Represents the arrangement of parts.
 *
 * The M-prefix stands for model to indicate that {@link MPartsLayout} is a layout model object which is added to the URL in serialized form.
 */
export interface MPartsLayout {
  root: MTreeNode | MPart;
  activePartId: string;
}

/**
 * Represents a node in the tree layout.
 *
 * A node contains two children, which are either a {@link MPart} or a {@link MTreeNode}, respectively.
 * The ratio together with the direction describes how to arrange the two children.
 *
 * The M-prefix stands for model to indicate that {@link MTreeNode} is a layout model object which is attached to the URL in serialized form.
 */
export class MTreeNode {

  public nodeId!: string;
  public child1!: MTreeNode | MPart;
  public child2!: MTreeNode | MPart;
  public ratio!: number;
  public direction!: 'column' | 'row';
  public parent?: MTreeNode;

  constructor(treeNode: Partial<MTreeNode>) {
    treeNode.parent && assertType(treeNode.parent, {toBeOneOf: MTreeNode}); // check the type to ensure that it is not an object literal
    assertType(treeNode.child1, {toBeOneOf: [MTreeNode, MPart]}); // check the type to ensure that it is not an object literal
    assertType(treeNode.child2, {toBeOneOf: [MTreeNode, MPart]}); // check the type to ensure that it is not an object literal
    Object.assign(this, treeNode);
  }

  /**
   * Returns `true` if the given object looks like a {@link MTreeNode}.
   */
  public static isNodeLike(object: any): boolean {
    return object.hasOwnProperty('nodeId');
  }
}

/**
 * Represents a part in the parts layout.
 *
 * A part can be an outlet to show some content, or a container for views.
 *
 * The M-prefix stands for model to indicate that {@link MPart} is a layout model object which is attached to the URL in serialized form.
 */
export class MPart {

  public partId!: string;
  public parent?: MTreeNode;
  public viewIds: string[] = [];
  public activeViewId?: string;

  constructor(part: Partial<MPart>) {
    part.parent && assertType(part.parent, {toBeOneOf: MTreeNode}); // check the type to ensure that it is not an object literal
    Object.assign(this, part);
  }

  /**
   * Returns the position in the layout tree as path of parent node ids.
   */
  public getPath(): string[] {
    const path: string[] = [];
    let parent: MTreeNode | undefined = this.parent;
    while (parent) {
      path.push(parent.nodeId);
      parent = parent.parent;
    }
    return path;
  }

  /**
   * Returns `true` if this part contains no views, or returns `false` otherwise.
   */
  public isEmpty(): boolean {
    return this.viewIds.length === 0;
  }

  /**
   * Returns `true` if the given object looks like a {@link MPart}.
   */
  public static isPartLike(object: any): boolean {
    return object.hasOwnProperty('partId');
  }
}

