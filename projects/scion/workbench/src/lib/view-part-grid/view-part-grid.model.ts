/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Region } from '../view-dnd/view-drop-zone.directive';
import { VIEW_PART_REF_PREFIX } from '../workbench.constants';
import { ACTIVE_VIEW_REF_INDEX, VIEW_PART_REF_INDEX, VIEW_REFS_START_INDEX, ViewPartGridSerializerService, ViewPartInfoArray, ViewPartSashBox } from './view-part-grid-serializer.service';
import { WorkbenchViewRegistry } from '../workbench-view-registry.service';
import { Defined } from '../defined.util';

/**
 * Represents the arrangement of viewparts in a grid and provides methods to modify the grid.
 *
 * {ViewPartGrid} is an immutable object, meaning that modifications have no side effect. The grid is serializable into a URL string.
 *
 * The grid is a tree of {ViewPartSashBox} and {ViewPartInfoArray} objects.
 */
export class ViewPartGrid {

  private _root: ViewPartSashBox | ViewPartInfoArray;

  constructor(serializedGrid: string, private _serializer: ViewPartGridSerializerService, private _viewRegistry: WorkbenchViewRegistry) {
    this._root = this._serializer.parseGrid(serializedGrid || this._serializer.emptySerializedGrid());
  }

  /**
   * Returns the root node of this grid, which is either a sashbox or viewpart.
   */
  public get root(): ViewPartSashBox | ViewPartInfoArray {
    return this._root;
  }

  /**
   * Returns a new copy of this grid.
   */
  public clone(): ViewPartGrid {
    const serializedGrid = this._serializer.serializeGrid(this._root);
    return new ViewPartGrid(serializedGrid, this._serializer, this._viewRegistry);
  }

  /**
   * Adds a view to the specified viewpart, and activates it.
   * Control the insertion position by providing an insertion index. If not specified, the view is added to the tail.
   *
   * Returns a copy of this grid with the specified view added.
   */
  public addView(viewPartRef: string, viewRef: string, insertionIndex?: number): ViewPartGrid {
    return this.clone()._addView(viewPartRef, viewRef, insertionIndex);
  }

  /**
   * Moves a view in the viewpart grid.
   * Control the insertion position by providing an insertion index. If not specified, the view is moved to the tail.
   *
   * Returns a copy of this grid with the view moved.
   */
  public moveView(viewRef: string, moveToViewPartRef: string, insertionIndex?: number): ViewPartGrid {
    return this.clone()._moveView(viewRef, moveToViewPartRef, insertionIndex);
  }

  /**
   * Removes a view and activates the preceding view.
   * In case the view was the last view of the viewpart, the viewpart is removed as well.
   *
   * Returns a copy of this grid with the specified view removed.
   */
  public removeView(viewRef: string): ViewPartGrid {
    return this.clone()._removeView(viewRef, {removeViewPartIfEmpty: true});
  }

  /**
   * Activates the view next to the given view.
   *
   * Returns a copy of this grid with most recent view activated.
   */
  public activateSiblingView(viewPartRef: string, viewRef: string): ViewPartGrid {
    return this.clone()._activateSiblingView(viewPartRef, viewRef);
  }

  /**
   * Activates a view of the specified viewpart.
   *
   * Returns a copy of this grid with the specified view activated.
   */
  public activateView(viewPartRef: string, viewRef: string): ViewPartGrid {
    return this.clone()._activateView(viewPartRef, viewRef);
  }

  /**
   * Sets the splitter position.
   *
   * Returns a copy of this grid with the specified splitter position changed.
   */
  public splitPosition(sashBoxId: number, splitter: number): ViewPartGrid {
    return this.clone()._splitPosition(sashBoxId, splitter);
  }

  /**
   * Adds a new viewpart as a sibling of another viewpart in the region as specified.
   *
   * Returns a copy of this grid with the specified viewpart added.
   */
  public addSiblingViewPart(region: Region, anchorViewPartRef: string, newViewPartRef: string): ViewPartGrid {
    return this.clone()._addSiblingViewPart(region, anchorViewPartRef, newViewPartRef);
  }

  /**
   * Removes a viewpart from the grid.
   *
   * Returns a copy of this grid with the specified viewpart removed.
   */
  public removeViewPart(viewPartRef: string): ViewPartGrid {
    return this.clone()._removeViewPart(viewPartRef);
  }

  private _addView(viewPartRef: string, viewRef: string, insertionIndex?: number): this {
    const viewPartInfoArray = this.getViewPartElseThrow(viewPartRef).viewPartInfoArray;

    const views = viewPartInfoArray.slice(VIEW_REFS_START_INDEX);
    const newViewIndex = Defined.orElse(insertionIndex, views.length);
    if (newViewIndex < 0 || newViewIndex > views.length) {
      throw Error(`[IndexOutOfRangeError] View index ${newViewIndex} must be in the following range: [0, ${views.length}]`);
    }

    // Add the view and make it the active view
    viewPartInfoArray[ACTIVE_VIEW_REF_INDEX] = viewRef;
    viewPartInfoArray.splice(VIEW_REFS_START_INDEX + newViewIndex, 0, viewRef);

    return this;
  }

  private _moveView(viewRef: string, moveToViewPartRef: string, insertionIndex?: number): this {
    const targetPartInfoArray = this.getViewPartElseThrow(moveToViewPartRef).viewPartInfoArray;
    const targetViewRef = insertionIndex !== undefined ? targetPartInfoArray[VIEW_REFS_START_INDEX + insertionIndex] : undefined;
    const moveToDifferentViewPart = this.findContainingViewPartElseThrow(viewRef) !== moveToViewPartRef;

    this._removeView(viewRef, {removeViewPartIfEmpty: moveToDifferentViewPart});
    const targetInsertionIndex = targetViewRef ? targetPartInfoArray.slice(VIEW_REFS_START_INDEX).indexOf(targetViewRef) : undefined;
    this._addView(moveToViewPartRef, viewRef, targetInsertionIndex);

    return this;
  }

  private _removeView(viewRef: string, options: { removeViewPartIfEmpty: boolean }): this {
    const viewPartRef = this.findContainingViewPartElseThrow(viewRef);
    const viewPartInfoArray = this.getViewPartElseThrow(viewPartRef).viewPartInfoArray;

    const viewIndex = viewPartInfoArray.indexOf(viewRef, VIEW_REFS_START_INDEX);
    if (viewIndex === -1) {
      throw Error(`[ViewNotFoundError] View not found in viewpart [viewPartRef=${viewPartRef}, viewRef=${viewRef}]`);
    }

    // Remove the view
    viewPartInfoArray.splice(viewIndex, 1);

    // Activate next view if this view was active
    if (viewPartInfoArray[ACTIVE_VIEW_REF_INDEX] === viewRef) {
      const viewRefs = viewPartInfoArray.slice(VIEW_REFS_START_INDEX);
      viewPartInfoArray[ACTIVE_VIEW_REF_INDEX] = this.findMostRecentView(viewRefs);
    }

    // Remove viewpart if its last view is removed.
    const lastView = !(viewPartInfoArray.length > VIEW_REFS_START_INDEX);
    if (lastView && options.removeViewPartIfEmpty) {
      this._removeViewPart(viewPartRef);
    }

    return this;
  }

  private _activateSiblingView(viewPartRef: string, viewRef: string): this {
    const viewPartInfoArray = this.getViewPartElseThrow(viewPartRef).viewPartInfoArray;
    const viewIndex = viewPartInfoArray.indexOf(viewRef, VIEW_REFS_START_INDEX);
    viewPartInfoArray[ACTIVE_VIEW_REF_INDEX] = viewPartInfoArray[viewIndex + 1] || viewPartInfoArray[viewIndex - 1];

    return this;
  }

  private findMostRecentView(viewRefs: string[]): string | null {
    const viewsSorted = viewRefs
      .map(viewRef => this._viewRegistry.getElseThrow(viewRef))
      .sort((view1, view2) => view2.activationInstant - view1.activationInstant);

    return viewsSorted.length > 0 ? viewsSorted[0].viewRef : null;
  }

  private _activateView(viewPartRef: string, viewRef: string): this {
    const viewPartInfoArray = this.getViewPartElseThrow(viewPartRef).viewPartInfoArray;
    if (viewPartInfoArray.indexOf(viewRef, VIEW_REFS_START_INDEX) === -1) {
      throw Error(`Illegal argument. View not found in viewpart [viewPartRef=${viewPartRef}, viewRef=${viewRef}]`);
    }
    viewPartInfoArray[ACTIVE_VIEW_REF_INDEX] = viewRef;
    return this;
  }

  private _splitPosition(sashBoxId: number, splitter: number): this {
    let sashBox: ViewPartSashBox;
    this.visit(() => true, (it: ViewPartSashBox): boolean => {
      if (it.id === sashBoxId) {
        sashBox = it;
        return false;
      }
      return true;
    });

    if (!sashBox) {
      throw Error(`Illegal argument. Sashbox not found to set splitter position [sashbox=${sashBoxId}]`);
    }

    sashBox.splitter = splitter;
    return this;
  }

  private _addSiblingViewPart(region: Region, anchorViewPartRef: string, newViewPartRef: string): this {
    if (!anchorViewPartRef) {
      throw Error('anchor viewpart must not be null');
    }

    const anchorViewPartNode = this.getViewPartElseThrow(anchorViewPartRef);
    const anchorViewPartInfoArray = anchorViewPartNode.viewPartInfoArray;

    const parentSashBox = anchorViewPartNode.path[anchorViewPartNode.path.length - 1] || null;
    const newViewPartInfoArray = [newViewPartRef];

    // Create a new sash box which consists of the new viewpart and the anchor viewpart
    const addBefore = ['west', 'north'].includes(region);
    const newSashBox: ViewPartSashBox = {
      id: this.computeNextSashBoxIdentity(),
      sash1: addBefore ? newViewPartInfoArray : anchorViewPartInfoArray,
      sash2: addBefore ? anchorViewPartInfoArray : newViewPartInfoArray,
      splitter: .5,
      hsplit: ['north', 'south'].includes(region),
    };

    // Insert the new sash box into the grid
    if (parentSashBox === null) {
      this._root = newSashBox;
    }
    else if (parentSashBox.sash1 === anchorViewPartInfoArray) {
      parentSashBox.sash1 = newSashBox;
    }
    else {
      parentSashBox.sash2 = newSashBox;
    }

    return this;
  }

  private _removeViewPart(viewPartRef: string): this {
    const viewPartNode = this.getViewPartElseThrow(viewPartRef);
    const viewPartInfoArray = viewPartNode.viewPartInfoArray;
    if (this._root === viewPartInfoArray) {
      this._root = null;
      return this;
    }

    const containingSashBox = viewPartNode.path[viewPartNode.path.length - 1];
    const siblingSash = (containingSashBox.sash1 === viewPartInfoArray ? containingSashBox.sash2 : containingSashBox.sash1);

    // Add sibling to new parent node
    const parentSashBox = viewPartNode.path[viewPartNode.path.length - 2] || null;
    if (parentSashBox === null) {
      this._root = siblingSash;
    }
    else if (parentSashBox.sash1 === containingSashBox) {
      parentSashBox.sash1 = siblingSash;
    }
    else {
      parentSashBox.sash2 = siblingSash;
    }

    return this;
  }

  /**
   * Computes a viewpart identity which is unique in this application.
   */
  public computeNextViewPartIdentity(): string {
    const viewPartIdentities = new Set<string>(this.viewPartRefs());
    let i = viewPartIdentities.size + 1;
    for (; viewPartIdentities.has(VIEW_PART_REF_PREFIX + i); i++) {
    }
    return VIEW_PART_REF_PREFIX + i;
  }

  /**
   * Computes a viewpart sashbox identity which is unique in this application.
   */
  private computeNextSashBoxIdentity(): number {
    const sashBoxIdentities = new Set<number>();
    this.visit(() => true, (it: ViewPartSashBox): boolean => {
      sashBoxIdentities.add(it.id);
      return true;
    });

    let i = sashBoxIdentities.size + 1;
    for (; sashBoxIdentities.has(i); i++) {
    }
    return i;
  }

  private getViewPartElseThrow(viewPartRef: string): ViewPartGridNode {
    let node: ViewPartGridNode = null;
    this.visit((it: ViewPartGridNode): boolean => {
      if (it.viewPartRef === viewPartRef) {
        node = it;
        return false;
      }
      return true;
    });

    if (!node) {
      throw Error(`Illegal argument. Viewpart not found [viewPartRef=${viewPartRef}]`);
    }

    return node;
  }

  /**
   * Returns the viewpart which contains the specified view.
   */
  public findContainingViewPartElseThrow(viewRef: string): string {
    let viewPartRef: string = null;
    this.visit((it: ViewPartGridNode): boolean => {
      const viewIndex = it.viewRefs.indexOf(viewRef);
      if (viewIndex !== -1) {
        viewPartRef = it.viewPartRef;
        return false;
      }
      return true;
    });

    if (!viewPartRef) {
      throw Error(`Illegal argument. View not found in any viewpart [viewRef=${viewRef}]`);
    }

    return viewPartRef;
  }

  public viewPartRefs(): string[] {
    const viewPartRefs: string[] = [];
    this.visit((it: ViewPartGridNode): boolean => {
      viewPartRefs.push(it.viewPartRef);
      return true;
    });
    return viewPartRefs;
  }

  /**
   * Visits grid tree nodes.
   *
   * Control whether to continue visiting subsequent tree nodes by returning 'true' in the visitor function, or 'false' to quit visiting.
   */
  public visit(viewPartVisitorFn: (viewPart: ViewPartGridNode) => boolean, sashBoxVisitorFn?: (sashBox: ViewPartSashBox) => boolean): void {
    visit(this._root, []);

    function visit(it: ViewPartSashBox | ViewPartInfoArray, path: ViewPartSashBox[]): boolean {
      if (Array.isArray(it)) {
        return viewPartVisitorFn({
          path: path,
          viewPartRef: it[VIEW_PART_REF_INDEX],
          activeViewRef: it[ACTIVE_VIEW_REF_INDEX],
          viewRefs: it.slice(VIEW_REFS_START_INDEX),
          viewPartInfoArray: it,
        });
      }

      if (sashBoxVisitorFn && !sashBoxVisitorFn(it)) {
        return false;
      }

      return visit(it.sash1, [...path, it]) && visit(it.sash2, [...path, it]);
    }
  }

  /**
   * Tests if the given view is active.
   *
   * Throws an error if the view is not found in the grid.
   */
  public isViewActive(viewRef: string): boolean {
    const viewPartRef = this.findContainingViewPartElseThrow(viewRef);
    const viewPartGridNode = this.getViewPartElseThrow(viewPartRef);
    return viewPartGridNode.activeViewRef === viewRef;
  }

  /**
   * Converts this grid into a url string.
   */
  public serialize(): string {
    return this._serializer.serializeGrid(this.root);
  }
}

/**
 * Represents a node in the viewpart grid.
 */
export interface ViewPartGridNode {
  /**
   * Tree path of {ViewPartSashBox} to this viewpart.
   */
  path: ViewPartSashBox[];
  /**
   * Specifies this viewpart's identity.
   */
  viewPartRef: string;
  /**
   * Specifies the active view of this viewpart.
   */
  activeViewRef: string;
  /**
   * Specifies the views of this viewpart.
   */
  viewRefs: string[];
  /**
   * Reference to the underlying data array which represents this viewpart in the grid.
   * Modifications to this array are serialized.
   *
   * Format:
   * [0]: viewpart identity; see {VIEW_PART_REF_INDEX}
   * [1]: active view of the viewpart; see {ACTIVE_VIEW_REF_INDEX}
   * [2]: start index in {ViewPartInfoArray} from where views are declared; see {VIEW_REFS_START_INDEX}
   */
  viewPartInfoArray: ViewPartInfoArray;
}
