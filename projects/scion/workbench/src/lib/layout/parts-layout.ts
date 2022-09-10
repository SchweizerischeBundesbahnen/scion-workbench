/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {MPart, MPartsLayout, MTreeNode} from './parts-layout.model';
import {Defined} from '@scion/toolkit/util';
import {UUID} from '@scion/toolkit/uuid';
import {assertNotNullish, assertType} from '../asserts.util';

/**
 * Represents the arrangement of parts and provides methods to modify the layout.
 *
 * This layout is an immutable object, meaning that modifications have no side effect. It is serializable into a URL-safe base64 string.
 */
export class PartsLayout {

  private _root: MTreeNode | MPart;
  private _activePartId: string;

  /**
   * @param workbenchAccessor
   *        Provides required workbench services to this layout.
   * @param layout
   *        Initializes this layout instance with the given layout, given either as {@link MPartsLayout}, or as serialized base64 string.
   *        If not specified, a layout with a single {@link MPart} is created.
   */
  constructor(private workbenchAccessor: PartsLayoutWorkbenchAccessor, layout?: string | MPartsLayout) {
    layout = (typeof layout === 'string' ? deserializeLayout(layout) : layout) || createRootLayout(workbenchAccessor);

    this._root = layout.root;
    this._activePartId = layout.activePartId;

    assertType(this._root, {toBeOneOf: [MTreeNode, MPart]});
    assertNotNullish(this._root, {orElseThrow: () => Error(`[PartsLayoutError] Expected a root part/node to be set.`)});
    assertNotNullish(this._activePartId, {orElseThrow: () => Error(`[PartsLayoutError] Expected an active part to be set.`)});
    assertNotNullish(this.findPart(this._activePartId, {orElseThrow: false}), {orElseThrow: () => Error(`[PartsLayoutError] Expected active part to be contained in the layout, but was not found [partId=${this._activePartId}].`)});
  }

  /**
   * Returns this layout's root {@link MTreeNode} or {@link MPart}.
   */
  public get root(): Readonly<MTreeNode | MPart> {
    return this._root;
  }

  /**
   * Returns the active part. At any given time, only a single part can be the active part.
   * There is always an active part present.
   */
  public get activePart(): Readonly<MPart> {
    return this._findPart(this._activePartId, {orElseThrow: true});
  }

  /**
   * Adds a new part with the given id to this layout. Position and size are expressed relative to a reference part.
   *
   * @param  partId
   *         The id for the new part. The id must be unique within the layout to avoid collision with other parts.
   * @param  relativeTo
   *         The reference part used to position and size the new part.
   * @return copy of this layout, but with the new part added.
   */
  public addPart(partId: string, relativeTo: ReferencePart): PartsLayout {
    return this._workingCopy()._addPart(partId, relativeTo);
  }

  /**
   * Removes the given part from this layout.
   *
   * @return copy of this layout, but with the specified part removed.
   */
  public removePart(partId: string): PartsLayout {
    return this._workingCopy()._removePart(partId);
  }

  /**
   * Adds a view to the specified part and makes it the active view.
   *
   * If not specifying an insert position, then the view is added to the part as the last view.
   *
   * @return copy of this layout, but with the view added.
   */
  public addView(partId: string, viewId: string, insertionIndex?: number): PartsLayout {
    return this._workingCopy()._addView(partId, viewId, insertionIndex);
  }

  /**
   * Moves a view to a different part of this layout, or if the same part, moves it within the part.
   *
   * @return copy of this layout, but with the view moved.
   */
  public moveView(viewId: string, targetPartId: string, insertionIndex?: number): PartsLayout {
    return this._workingCopy()._moveView(viewId, targetPartId, insertionIndex);
  }

  /**
   * Removes a view from this layout.
   *
   * If the part contains other views, the most recently used view is activated.
   * If the view is the last view in the part, the part is removed from this layout,
   * except if being the last part.
   *
   * @return copy of this layout, but with the view (or the part) removed.
   */
  public removeView(viewId: string): PartsLayout {
    return this._workingCopy()._removeView(viewId, {preventPartRemoval: false});
  }

  /**
   * Activates the given view and its part.
   *
   * @return copy of this layout, but with the given view and part activated.
   */
  public activateView(viewId: string): PartsLayout {
    return this._workingCopy()._activateView(viewId);
  }

  /**
   * Activates the given part.
   *
   * @return copy of this layout, but with the given part activated.
   */
  public activatePart(partId: string): PartsLayout {
    return this._workingCopy()._activatePart(partId);
  }

  /**
   * Activates the directly adjacent view, if present, or the preceding view otherwise.
   *
   * @return copy of this layout with the sibling view activated.
   */
  public activateAdjacentView(viewId: string): PartsLayout {
    return this._workingCopy()._activateAdjacentView(viewId);
  }

  /**
   * Sets the split ratio of the parts of a {@link MTreeNode}.
   *
   * @param  treeNodeId
   *         Identifies the tree node for which to set the ratio of its parts.
   * @param  ratio
   *         Ratio as numeric value between 0 and 1.
   *
   * @return copy of this layout, but with the new split ratio set.
   */
  public setSplitRatio(treeNodeId: string, ratio: number): PartsLayout {
    return this._workingCopy()._setSplitRatio(treeNodeId, ratio);
  }

  /**
   * Removes all parts and views, returning a layout with a single {@link MPart}.
   */
  public clear(): PartsLayout {
    return this._workingCopy()._clear();
  }

  /**
   * Returns all parts of the layout.
   */
  public get parts(): ReadonlyArray<MPart> {
    return this._findTreeElements(element => element instanceof MPart) as MPart[];
  }

  /**
   * Returns all views of the layout.
   */
  public get viewsIds(): string[] {
    return this.parts.reduce((viewIds, part) => viewIds.concat(part.viewIds), new Array<string>());
  }

  /**
   * Finds the part with the given id.
   *
   * By providing an options object, you can control if to throw an error if not found.
   */
  public findPart(partId: string, options: {orElseThrow: true}): Readonly<NonNullable<MPart>>;
  public findPart(partId: string, options: {orElseThrow: false} | {}): Readonly<MPart | null>;
  public findPart(partId: string, options: {orElseThrow: boolean}): Readonly<MPart | null> {
    return this._findPart(partId, options);
  }

  /**
   * Finds the part which contains the given view.
   *
   * By providing an object object, you can control if to throw an error if not found.
   */
  public findPartByViewId(viewId: string, options: {orElseThrow: true}): Readonly<NonNullable<MPart>>;
  public findPartByViewId(viewId: string, options: {orElseThrow: false} | {}): Readonly<MPart | null>;
  public findPartByViewId(viewId: string, options: {orElseThrow: boolean}): Readonly<MPart | null> {
    assertNotNullish(viewId, {orElseThrow: () => Error(`[PartsLayoutError] ViewId must not be 'null' or 'undefined'.`)});
    return this._findPartByViewId(viewId, options);
  }

  /**
   * Serializes this layout into a URL-safe base64 string.
   *
   * If this layout consists of a single root part with no views added to it, by default, this method returns `null`.
   *
   * @param options - Controls the serialization into a URL-safe base64 string.
   *                  - `nullIfEmpty`: if `true` (or if not specified), returns `null` if containing a single root part with no views added to it.
   *                  - `uuid`: identity of the layout; if not specified, generates a new UUID.
   */
  public serialize(options: {nullIfEmpty: false; uuid?: string}): string;
  public serialize(options?: {nullIfEmpty?: true; uuid?: string} | {}): string | null;
  public serialize(options?: {nullIfEmpty?: boolean; uuid?: string}): string | null {
    if ((options?.nullIfEmpty ?? true) && this._root instanceof MPart && this._root.isEmpty()) {
      return null;
    }

    // We assign a new UUID to force the layout query parameter to change, so that resolvers of routes configured with {@link Route#runGuardsAndResolvers} will evaluate, e.g. {@link NavigationStateResolver}.
    return serializeLayout({root: this._root, activePartId: this._activePartId, uuid: options?.uuid || UUID.randomUUID()});
  }

  /**
   * Note: This method name begins with an underscore, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private _addPart(partId: string, relativeTo: ReferencePart): this {
    assertNotNullish(partId, {orElseThrow: () => Error(`[PartsLayoutError] PartId must not be 'null' or 'undefined'.`)});
    if (this._findPart(partId, {orElseThrow: false})) {
      throw Error(`[PartsLayoutError] Part id must be unique in the layout. Another part with the same id is already contained in the layout [id=${partId}].`);
    }

    const newPart = new MPart({partId});

    // Find the reference part, if any, or insert the new part beside the root.
    const referenceElement = relativeTo.relativeTo ? this._findPart(relativeTo.relativeTo, {orElseThrow: true}) : this._root;
    const addBefore = relativeTo.align === 'left' || relativeTo.align === 'top';
    const ratio = Defined.orElse(relativeTo.ratio, .5);

    // Create a new tree node.
    const newTreeNode: MTreeNode = new MTreeNode({
      nodeId: UUID.randomUUID(),
      child1: addBefore ? newPart : referenceElement,
      child2: addBefore ? referenceElement : newPart,
      direction: relativeTo.align === 'left' || relativeTo.align === 'right' ? 'row' : 'column',
      ratio: addBefore ? ratio : 1 - ratio,
      parent: referenceElement.parent,
    });

    if (!referenceElement.parent) {
      this._root = newTreeNode; // top-level part
    }
    else if (referenceElement.parent.child1 === referenceElement) {
      referenceElement.parent.child1 = newTreeNode;
    }
    else {
      referenceElement.parent.child2 = newTreeNode;
    }

    referenceElement.parent = newTreeNode;
    newPart.parent = newTreeNode;
    this._activatePart(newPart.partId);

    return this;
  }

  /**
   * Note: This method name begins with an underscore, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private _removePart(partId: string): this {
    assertNotNullish(partId, {orElseThrow: () => Error(`[PartsLayoutError] PartId must not be 'null' or 'undefined'.`)});

    // The last part is never removed.
    if (this.parts.length === 1) {
      return this;
    }

    const part = this._findPart(partId, {orElseThrow: true});
    const partIndex = this.parts.indexOf(part);
    const siblingElement = (part.parent!.child1 === part ? part.parent!.child2 : part.parent!.child1);
    if (!part.parent!.parent) {
      this._root = siblingElement;
    }
    else if (part.parent!.parent.child1 === part.parent) {
      part.parent!.parent.child1 = siblingElement;
    }
    else {
      part.parent!.parent.child2 = siblingElement;
    }

    // If the removed part was the active part, make it's adjacent part the active part.
    if (this._activePartId === partId) {
      this._activatePart(this.parts[partIndex - 1]?.partId || this.parts[partIndex]?.partId);
    }

    return this;
  }

  /**
   * Note: This method name begins with an underscore, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private _addView(partId: string, viewId: string, insertionIndex?: number): this {
    assertNotNullish(partId, {orElseThrow: () => Error(`[PartsLayoutError] PartId must not be 'null' or 'undefined'.`)});
    assertNotNullish(viewId, {orElseThrow: () => Error(`[PartsLayoutError] ViewId must not be 'null' or 'undefined'.`)});

    const part = this._findPart(partId, {orElseThrow: true});
    part.viewIds.splice(insertionIndex ?? part.viewIds.length, 0, viewId);
    this._activateView(viewId);
    return this;
  }

  /**
   * Note: This method name begins with an underscore, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private _moveView(viewId: string, targetPartId: string, insertionIndex?: number): this {
    assertNotNullish(viewId, {orElseThrow: () => Error(`[PartsLayoutError] ViewId must not be 'null' or 'undefined'.`)});
    assertNotNullish(targetPartId, {orElseThrow: () => Error(`[PartsLayoutError] TargetViewPartId must not be 'null' or 'undefined'.`)});

    const sourcePart = this._findPartByViewId(viewId, {orElseThrow: true});
    const targetPart = this._findPart(targetPartId, {orElseThrow: true});
    const targetViewId = insertionIndex !== undefined ? targetPart.viewIds[insertionIndex] : undefined;

    this._removeView(viewId, {preventPartRemoval: sourcePart === targetPart});
    const targetInsertionIndex = targetViewId ? targetPart.viewIds.indexOf(targetViewId) : undefined;
    this._addView(targetPartId, viewId, targetInsertionIndex);
    return this;
  }

  /**
   * Note: This method name begins with an underscore, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private _removeView(viewId: string, options: {preventPartRemoval: boolean}): this {
    assertNotNullish(viewId, {orElseThrow: () => Error(`[PartsLayoutError] ViewId must not be 'null' or 'undefined'.`)});

    const part = this._findPartByViewId(viewId, {orElseThrow: true});

    const viewIndex = part.viewIds.indexOf(viewId);
    if (viewIndex === -1) {
      throw Error(`[PartsLayoutError] View not found in the part [part=${part.partId}, view=${viewId}]`);
    }

    part.viewIds.splice(viewIndex, 1);

    // Activate the last recently activated view if this view was active
    if (part.activeViewId === viewId) {
      part.activeViewId = [...part.viewIds].sort((viewId1, viewId2) => this.workbenchAccessor.getViewActivationInstant(viewId2) - this.workbenchAccessor.getViewActivationInstant(viewId1))[0];
    }

    // Remove the part if this is the last view of the part.
    if (part.viewIds.length === 0 && !options.preventPartRemoval) {
      this._removePart(part.partId);
    }

    return this;
  }

  /**
   * Note: This method name begins with an underscore, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private _activatePart(partId: string): this {
    assertNotNullish(partId, {orElseThrow: () => Error(`[PartsLayoutError] PartId must not be 'null' or 'undefined'.`)});
    assertNotNullish(this.findPart(partId, {orElseThrow: false}), {orElseThrow: () => Error(`[PartsLayoutError] Part to activate expected to be contained in the layout, but was not found [partId=${partId}].`)});
    this._activePartId = partId;
    return this;
  }

  /**
   * Note: This method name begins with an underscore, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private _activateView(viewId: string): this {
    assertNotNullish(viewId, {orElseThrow: () => Error(`[PartsLayoutError] ViewId must not be 'null' or 'undefined'.`)});

    // Activate the view in the part
    const part = this._findPartByViewId(viewId, {orElseThrow: true});
    part.activeViewId = viewId;

    // Activate the part
    this._activatePart(part.partId);
    return this;
  }

  /**
   * Note: This method name begins with an underscore, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private _activateAdjacentView(viewId: string): this {
    assertNotNullish(viewId, {orElseThrow: () => Error(`[PartsLayoutError] ViewId must not be 'null' or 'undefined'.`)});

    const part = this._findPartByViewId(viewId, {orElseThrow: true});
    const viewIndex = part.viewIds.indexOf(viewId);
    part.activeViewId = part.viewIds[viewIndex + 1] || part.viewIds[viewIndex - 1]; // is `undefined` if it is the last view of the part
    this.activatePart(part.partId);
    return this;
  }

  /**
   * Note: This method name begins with an underscore, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private _setSplitRatio(nodeId: string, ratio: number): this {
    const treeNode = this._findTreeNode(nodeId, {orElseThrow: true});
    treeNode.ratio = ratio;
    return this;
  }

  /**
   * Note: This method name begins with an underscore, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private _clear(): this {
    ({root: this._root, activePartId: this._activePartId} = createRootLayout(this.workbenchAccessor));
    return this;
  }

  private _findPart(partId: string, options: {orElseThrow: true}): NonNullable<MPart>;
  private _findPart(partId: string, options: {orElseThrow: false} | {}): MPart | null;
  private _findPart(partId: string, options: {orElseThrow: boolean}): MPart | null {
    assertNotNullish(partId, {orElseThrow: () => Error(`[PartsLayoutError] PartId must not be 'null' or 'undefined'.`)});
    const part = this._findTreeElements(element => element instanceof MPart && element.partId === partId, {findFirst: true})[0] as MPart;
    if (!part && options.orElseThrow) {
      throw Error(`[PartsLayoutError] No part with id '${partId}' found in the layout.`);
    }
    return part || null;
  }

  private _findPartByViewId(viewId: string, options: {orElseThrow: true}): NonNullable<MPart>;
  private _findPartByViewId(viewId: string, options: {orElseThrow: false} | {}): MPart | null;
  private _findPartByViewId(viewId: string, options: {orElseThrow: boolean}): MPart | null {
    assertNotNullish(viewId, {orElseThrow: () => Error(`[PartsLayoutError] ViewId must not be 'null' or 'undefined'.`)});
    const part = this._findTreeElements(element => element instanceof MPart && element.viewIds.includes(viewId), {findFirst: true})[0] as MPart;
    if (!part && options.orElseThrow) {
      throw Error(`[PartsLayoutError] No part found in the layout containing the view '${viewId}'.`);
    }
    return part || null;
  }

  private _findTreeNode(nodeId: string, options: {orElseThrow: true}): NonNullable<MTreeNode>;
  private _findTreeNode(nodeId: string, options: {orElseThrow: false} | {}): MTreeNode | null;
  private _findTreeNode(nodeId: string, options: {orElseThrow: boolean}): MTreeNode | null {
    assertNotNullish(nodeId, {orElseThrow: () => Error(`[PartsLayoutError] NodeId must not be 'null' or 'undefined'.`)});

    const node = this._findTreeElements(element => element instanceof MTreeNode && element.nodeId === nodeId, {findFirst: true})[0] as MTreeNode;
    if (!node && options.orElseThrow) {
      throw Error(`[PartsLayoutError] No node with id '${nodeId}' found in the layout.`);
    }
    return node || null;
  }

  /**
   * Traverses the tree to find the part that matches the given predicate.
   *
   * By providing an object object, you can control if to stop traversing on first match.
   */
  private _findTreeElements(predicateFn: (element: MPart | MTreeNode) => boolean, options?: {findFirst: boolean}): (MPart | MTreeNode)[] {
    const result: (MPart | MTreeNode)[] = [];
    (function visitParts(node: MTreeNode | MPart): boolean {
      if (predicateFn(node)) {
        result.push(node);
        if (options && options.findFirst) {
          return false; // stop visiting other elements
        }
      }

      if (node instanceof MTreeNode) {
        return visitParts(node.child1) && visitParts(node.child2);
      }
      return true;
    })(this._root);

    return result;
  }

  /**
   * Creates a copy of this layout.
   */
  private _workingCopy(): PartsLayout {
    return new PartsLayout(this.workbenchAccessor, this.serialize({nullIfEmpty: false}));
  }
}

/**
 * Creates a root layout that consists of a single, empty part.
 */
function createRootLayout(workbenchAccessor: PartsLayoutWorkbenchAccessor): MPartsLayout {
  const rootPart = new MPart({partId: workbenchAccessor.provideRootPartIdentity()});
  return {root: rootPart, activePartId: rootPart.partId};
}

/**
 * Serializes this layout into a URL-safe base64 string.
 */
function serializeLayout(layout: MPartsLayout & {uuid?: string}): string {
  return window.btoa(JSON.stringify(layout, (key, value) => {
    return (key === 'parent') ? undefined : value; // do not serialize node parents.
  }));
}

/**
 * Deserializes the given serialized layout.
 */
function deserializeLayout(serializedLayout: string): MPartsLayout {
  const layout: MPartsLayout = JSON.parse(window.atob(serializedLayout), (key, value) => {
    if (MPart.isPartLike(value)) {
      return new MPart(value); // create a class object from the object literal
    }
    if (MTreeNode.isNodeLike(value)) {
      return new MTreeNode(value); // create a class object from the object literal
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
  })(layout.root, undefined);

  return layout;
}

/**
 * Describes how to position and size a part relative to another part.
 */
export interface ReferencePart {
  /**
   * Specifies the part which to use as reference part to position and size the new part.
   * If not specified, it is aligned relative to the root part.
   */
  relativeTo?: string;
  /**
   * Specifies the side of the reference part where to add the new part.
   */
  align: 'left' | 'right' | 'top' | 'bottom';
  /**
   * Specifies the proportional size of the new part relative to the reference part.
   */
  ratio?: number;
}

/**
 * Provides required workbench services to a {@link PartsLayout}.
 */
export interface PartsLayoutWorkbenchAccessor {
  /**
   * Obtains the last activation instant for a given view.
   */
  getViewActivationInstant(viewId: string): number;

  /**
   * Provides an identity for the root part.
   */
  provideRootPartIdentity(): string;
}
