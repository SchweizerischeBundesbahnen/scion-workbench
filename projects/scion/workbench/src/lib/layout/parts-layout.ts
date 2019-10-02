/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Part, TreeNode } from './parts-layout.model';
import { Defined, UUID } from '@scion/toolkit/util';
import { WorkbenchViewRegistry } from '../workbench-view-registry.service';
import { MAIN_PART_ID } from '../workbench.constants';

/**
 * Represents the arrangement of parts and provides methods to modify the layout.
 *
 * The layout is an immutable object, meaning that modifications have no side effect. It is serializable into a URL string.
 */
export class PartsLayout {

  private _root: TreeNode | Part;

  constructor(private _viewRegistry: WorkbenchViewRegistry, serializedTree?: string) {
    this._root = serializedTree ? parseSerializedTree(serializedTree) : createMainPrimaryPart();
  }

  /**
   * Returns this layout's root {@link TreeNode} or {@link Part}.
   */
  public get root(): TreeNode | Part {
    return Object.freeze(this._root);
  }

  /**
   * Adds a new part with the given id to this layout. Position and size are expressed relative to a reference part.
   *
   * @param partId
   *        The id for the new part. This must be unique within the layout to avoid collision with other parts.
   * @param relativeTo
   *        The reference part used to position and size the new part.
   * @param options
   *        Describes the characteristics of the new part.
   * @return copy of this layout with the new part added.
   */
  public addPart(partId: string, relativeTo: ReferencePart, options?: PartOptions): PartsLayout {
    return this.workingCopy()._addPart(partId, relativeTo, options);
  }

  /**
   * Removes the given part from this layout.
   *
   * @return copy of this layout with the part removed.
   */
  public removePart(partId: string): PartsLayout {
    return this.workingCopy()._removePart(partId);
  }

  /**
   * Removes all parts from this layout.
   *
   * @return copy of this layout with all parts removed.
   */
  public removeParts(): PartsLayout {
    return new PartsLayout(this._viewRegistry, null);
  }

  /**
   * Adds a view to the specified part and activates it.
   *
   * If adding the view to a multi-view part, you can control at which position to insert the view into the view tabbar.
   * If not specified, the view is added as the last view tab.
   *
   * @return copy of this layout with the view added.
   */
  public addView(partId: string, viewId: string, insertionIndex?: number): PartsLayout {
    return this.workingCopy()._addView(partId, viewId, insertionIndex);
  }

  /**
   * Moves a view to a different part, of if the same part, moves it within the tabbar.
   *
   * @return copy of this layout with the view moved.
   */
  public moveView(viewId: string, targetPartId: string, insertionIndex?: number): PartsLayout {
    return this.workingCopy()._moveView(viewId, targetPartId, insertionIndex);
  }

  /**
   * Removes a view from this layout.
   * If there are some other views in the part, the last recently activated view is activated.
   * If this is the last view of the part, the part is removed unless the part is configured to
   * not close with the last view.
   *
   * @return copy of this layout with the view removed.
   */
  public removeView(viewId: string): PartsLayout {
    return this.workingCopy()._removeView(viewId, {preventRemoveWithLastView: false});
  }

  /**
   * Activates the given view.
   *
   * @return copy of this layout with the view activated.
   */
  public activateView(viewId: string): PartsLayout {
    return this.workingCopy()._activateView(viewId);
  }

  /**
   * Activates the subsequent view, if any, or the preceding view.
   *
   * @return copy of this layout with the sibling view activated.
   */
  public activateSiblingView(viewId: string): PartsLayout {
    return this.workingCopy()._activateSiblingView(viewId);
  }

  /**
   * Tests if the given view is active.
   */
  public isViewActive(viewId: string): boolean {
    const part = this.findPartByViewId(viewId, {orElseThrow: false});
    return part && part.activeViewId === viewId || false;
  }

  /**
   * Sets the splitter position of a {@link TreeNode} as a ratio between 0 and 1.
   *
   * @return copy of this layout with the ratio set.
   */
  public setNodeSplitterPosition(treeNodeId: string, splitter: number): PartsLayout {
    return this.workingCopy()._setTreeNodeSplitterPosition(treeNodeId, splitter);
  }

  private _addPart(partId: string, relativeTo: ReferencePart, options?: PartOptions): this {
    if (this.findPart(partId, {orElseThrow: false})) {
      throw Error(`[PartsLayoutError] Part id must be unique in the layout. Another part with the same id already found in the layout [id=${partId}].`);
    }

    const newPart = new Part({
      partId,
      primary: Defined.orElse(options && options.primary, false),
      removeWithLastView: Defined.orElse(options && options.removeWithLastView, true),
    });

    // Find the reference pat, if any, or insert the new part beside the root.
    const referenceElement = this.findPart(relativeTo.partId, {orElseThrow: false}) || this._root;
    const addBefore = relativeTo.align === 'left' || relativeTo.align === 'top';
    const ratio = Defined.orElse(relativeTo.ratio, .5);

    // Create a new tree node.
    const newTreeNode: TreeNode = new TreeNode({
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

    return this;
  }

  /**
   * Returns all parts of the layout.
   */
  public get parts(): Part[] {
    return this.findTreeElements(element => element instanceof Part) as Part[];
  }

  /**
   * Finds the part with the given id.
   *
   * By providing an options object, you can control if to throw an error if not found.
   */
  public findPart(partId: string, options: { orElseThrow: boolean }): Part | null {
    const part = this.findTreeElements(element => element instanceof Part && element.partId === partId, {findFirst: true})[0] as Part;
    if (!part && options.orElseThrow) {
      throw Error(`[PartsLayoutError] Part with the id '${partId}' not found in the layout.`);
    }
    return part || null;
  }

  /**
   * Finds the part which contains the given view.
   *
   * By providing an object object, you can control if to throw an error if not found.
   */
  public findPartByViewId(viewId: string, options: { orElseThrow: boolean }): Part | null {
    const part = this.findTreeElements(element => element instanceof Part && element.viewIds.includes(viewId), {findFirst: true})[0] as Part;
    if (!part && options.orElseThrow) {
      throw Error(`[PartsLayoutError] No part found to contain the view '${viewId}'.`);
    }
    return part || null;
  }

  private findTreeNode(nodeId: string, options: { orElseThrow: boolean }): TreeNode | null {
    const node = this.findTreeElements(element => element instanceof TreeNode && element.nodeId === nodeId, {findFirst: true})[0] as TreeNode;
    if (!node && options.orElseThrow) {
      throw Error(`[PartsLayoutError] Node with the id '${nodeId}' not found in the layout.`);
    }
    return node || null;
  }

  public findActivePrimaryPart(): Part {
    // TODO maintain active flag
    const part = this.findTreeElements(element => element instanceof Part && element.primary, {findFirst: true})[0] as Part;
    if (!part) {
      throw Error('[PartsLayoutError] No active primary part found');
    }
    return part;
  }

  private _removePart(partId: string): this {
    const part = this.findPart(partId, {orElseThrow: true});

    // Ensure to have one primary part at minimum
    if (part.primary && !this.parts.some(it => it !== part && it.primary)) {
      return this;
    }

    // Set the main part if removing the root node/part.
    if (!part.parent) {
      this._root = createMainPrimaryPart();
      return this;
    }

    const siblingElement = (part.parent.child1 === part ? part.parent.child2 : part.parent.child1);
    if (!part.parent.parent) {
      this._root = siblingElement;
    }
    else if (part.parent.parent.child1 === part.parent) {
      part.parent.parent.child1 = siblingElement;
    }
    else {
      part.parent.parent.child2 = siblingElement;
    }

    return this;
  }

  private _addView(partId: string, viewId: string, insertionIndex?: number): this {
    const part = this.findPart(partId, {orElseThrow: true});

    if (part.multi) {
      part.activeViewId = viewId;
      part.viewIds = [viewId];
    }
    else {
      const viewCount = part.viewIds.length;
      const index = Defined.orElse(insertionIndex, viewCount);
      if (index < 0 || index > viewCount) {
        throw Error(`[PartsLayoutError] View index ${index} must be in the following range: [0, ${viewCount}]`);
      }
      part.activeViewId = viewId;
      part.viewIds.splice(index, 0, viewId);
    }

    return this;
  }

  private _moveView(viewId: string, targetPartId: string, insertionIndex?: number): this {
    const sourcePart = this.findPartByViewId(viewId, {orElseThrow: true});
    const targetPart = this.findPart(targetPartId, {orElseThrow: true});
    const targetViewId = insertionIndex !== undefined ? targetPart.viewIds[insertionIndex] : undefined;

    this._removeView(viewId, {preventRemoveWithLastView: sourcePart === targetPart});
    const targetInsertionIndex = targetViewId ? targetPart.viewIds.indexOf(targetViewId) : undefined;
    this._addView(targetPartId, viewId, targetInsertionIndex);

    return this;
  }

  private _removeView(viewId: string, options: { preventRemoveWithLastView: boolean }): this {
    const part = this.findPartByViewId(viewId, {orElseThrow: true});

    const viewIndex = part.viewIds.indexOf(viewId);
    if (viewIndex === -1) {
      throw Error(`[PartsLayoutError] View not found in the part [part=${part.partId}, view=${viewId}]`);
    }

    part.viewIds.splice(viewIndex, 1);

    // Activate the last recently activated view if this view was active
    if (part.activeViewId === viewId) {
      part.activeViewId = [...part.viewIds].sort((viewId1, viewId2) => this._viewRegistry.getElseThrow(viewId2).activationInstant - this._viewRegistry.getElseThrow(viewId1).activationInstant)[0];
    }

    // Remove the part if this is the last view of the part.
    if (!options.preventRemoveWithLastView && part.removeWithLastView && part.viewIds.length === 0) {
      this._removePart(part.partId);
    }

    return this;
  }

  private _activateView(viewId: string): this {
    const part = this.findPartByViewId(viewId, {orElseThrow: true});
    part.activeViewId = viewId;
    return this;
  }

  private _activateSiblingView(viewId: string): this {
    const part = this.findPartByViewId(viewId, {orElseThrow: true});
    const viewIndex = part.viewIds.indexOf(viewId);
    part.activeViewId = part.viewIds[viewIndex + 1] || part.viewIds[viewIndex - 1];
    return this;
  }

  private _setTreeNodeSplitterPosition(nodeId: string, ratio: number): this {
    const treeNode = this.findTreeNode(nodeId, {orElseThrow: true});
    treeNode.ratio = ratio;
    return this;
  }

  /**
   * Traverses the tree to find the part that matches the given predicate.
   *
   * By providing an object object, you can control if to stop traversing on first match.
   */
  private findTreeElements(predicateFn: (element: Part | TreeNode) => boolean, options?: { findFirst: boolean }): (Part | TreeNode)[] {
    const result: (Part | TreeNode)[] = [];
    (function visitParts(node: TreeNode | Part): boolean {
      if (predicateFn(node)) {
        result.push(node);
        if (options && options.findFirst) {
          return false; // stop visiting other elements
        }
      }

      if (node instanceof TreeNode) {
        return visitParts(node.child1) && visitParts(node.child2);
      }
      return true;
    })(this._root);

    return result;
  }

  /**
   * Creates a copy of this layout.
   */
  private workingCopy(): PartsLayout {
    return new PartsLayout(this._viewRegistry, this.serialize());
  }

  /**
   * Serializes this layout into a URL string.
   */
  public serialize(): string | null {
    return btoa(JSON.stringify(this._root));
  }
}

function createMainPrimaryPart(): Part {
  return new Part({
    partId: MAIN_PART_ID,
    removeWithLastView: true,
    primary: true,
  });
}

/**
 * Parses the given JSON tree into true node and part objects.
 */
function parseSerializedTree(serializedTree: string): TreeNode | Part {
  const root = JSON.parse(atob(serializedTree), (key, value) => {
    if (Part.isPartLike(value)) {
      return new Part({...value});
    }
    if (TreeNode.isNodeLike(value)) {
      return new TreeNode({...value});
    }
    return value;
  });

  // Link parent tree nodes
  (function linkParentNodes(node: TreeNode | Part, parent: TreeNode): void {
    node.parent = parent;

    if (node instanceof TreeNode) {
      linkParentNodes(node.child1, node);
      linkParentNodes(node.child2, node);
    }
  })(root, null);

  return root;
}

/**
 * Properties of a part.
 */
export interface PartOptions {
  /**
   * Characterizes the part to be a primary or auxiliary part.
   * Primary parts are the default part target for new views added to the layout, unless adding a view to a specific part.
   */
  primary?: boolean;
  /**
   * Specifies if to remove the part when closing its last view.
   */
  removeWithLastView?: boolean;
}

/**
 * Describes how to position and size a part relative to another part.
 */
export interface ReferencePart {
  /**
   * Specifies the part which is used as reference part to position and size the new part.
   * If not specified, it is aligned relative to the root part.
   */
  partId?: string;
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
 * Converts a region to a position.
 */
export function regionToLayoutPosition(region: 'north' | 'east' | 'south' | 'west' | 'center'): 'left' | 'right' | 'top' | 'bottom' {
  switch (region) {
    case 'west':
      return 'left';
    case 'east':
      return 'right';
    case 'north':
      return 'top';
    case 'south':
      return 'bottom';
    default:
      throw Error(`[UnsupportedRegionError] Supported regions are: \'north\', \'east\', \'south\' or \'west\' [actual=${region}]`);
  }
}
