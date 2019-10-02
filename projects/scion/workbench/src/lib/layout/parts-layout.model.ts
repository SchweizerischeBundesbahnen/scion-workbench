/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Type } from '@angular/core';
import { coerceArray } from '@angular/cdk/coercion';

/**
 * Represents a node in the parts tree.
 *
 * A node always contains two children, which are either a {@link Part} or a {@link TreeNode}, respectively.
 */
export class TreeNode {

  public nodeId: string;
  public child1: TreeNode | Part;
  public child2: TreeNode | Part;
  public ratio: number;
  public direction: 'column' | 'row';
  public parent?: TreeNode;

  constructor(treeNode?: Partial<TreeNode>) {
    assertPrototype(treeNode && treeNode.parent, TreeNode);
    assertPrototype(treeNode && treeNode.child1, [TreeNode, Part]);
    assertPrototype(treeNode && treeNode.child2, [TreeNode, Part]);
    treeNode && copyProperties({sourceObject: treeNode, targetObject: this});
    makePropertyTransient(this, 'parent');
  }

  /**
   * Returns if the given object looks like a {@link TreeNode}.
   */
  public static isNodeLike(object: any): boolean {
    return object.hasOwnProperty('nodeId');
  }
}

/**
 * Represents a part in the parts tree.
 *
 * A part can be an outlet to show some content, or a container for views.
 */
export class Part {

  public partId: string;
  public parent?: TreeNode;
  public viewIds: string[] = [];
  public activeViewId: string;
  public removeWithLastView: boolean;
  public primary: boolean;
  public active?: boolean;
  public multi: boolean;
  public style: 'tabbed' | 'standalone';

  constructor(part?: Partial<Part>) {
    assertPrototype(part && part.parent, TreeNode);
    copyProperties({sourceObject: {...part}, targetObject: this});
    makePropertyTransient(this, 'parent');
  }

  /**
   * Returns the position in the layout tree as path of parent node ids.
   */
  public getPath(): string[] {
    const path: string[] = [];
    let parent: TreeNode = this.parent;
    while (parent) {
      path.push(parent.nodeId);
      parent = parent.parent;
    }
    return path;
  }

  /**
   * Returns if the given object looks like a {@link Part}.
   */
  public static isPartLike(object: any): boolean {
    return object.hasOwnProperty('partId');
  }
}

/**
 * Changes the given properties to 'non-enumerable' properties, so they are ignored when being serialized to JSON.
 */
function makePropertyTransient<T>(object: any, ...properties: string[]): void {
  properties.forEach(property => Object.defineProperty(object, property, {enumerable: false, writable: true}));
}

/**
 * Copies all properties (enumerable and not-enumerable) from the source to the target object.
 */
function copyProperties<T>(args: { targetObject: T, sourceObject: T }): void {
  // use Object.getOwnPropertyNames(...) instead of Object.keys(...) to also read non-enumerable properties, e.g. transient properties.
  Object.getOwnPropertyNames(args.sourceObject).forEach(propertyName => {
    args.targetObject[propertyName] = args.sourceObject[propertyName];
  });
}

/**
 * Asserts the given object to be of the given type (and not just a JavaScript object)
 *
 * Throws an error if not of the given type.
 */
function assertPrototype(object: any, isOneOf: Type<any>[] | Type<any>): void {
  if (object && !coerceArray(isOneOf).includes(object.constructor)) {
    const expectedType = coerceArray(isOneOf).map(it => it.name).join(' or ');
    const actualType = object.constructor.name;
    throw Error(`[TypeError] Object not of the expected type [expected=${expectedType}, actual=${actualType}]`);
  }
}
