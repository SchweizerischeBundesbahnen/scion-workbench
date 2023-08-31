/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {MPart, MPartGrid, MTreeNode, MView, ɵMPartGrid} from './workbench-layout.model';
import {VIEW_ID_PREFIX} from '../workbench.constants';
import {assertType} from '../common/asserts.util';
import {UUID} from '@scion/toolkit/uuid';
import {MAIN_AREA, ReferencePart, WorkbenchLayout} from './workbench-layout';
import {WorkbenchLayoutSerializer} from './workench-layout-serializer.service';
import {WorkbenchViewRegistry} from '../view/workbench-view.registry';
import {WorkbenchPartRegistry} from '../part/workbench-part.registry';
import {inject, Injectable, InjectionToken, Injector, runInInjectionContext} from '@angular/core';

/**
 * @inheritDoc
 *
 * The workbench layout is a grid of parts. It contains at least one part. A special part, the main area part, is not a stack of views
 * but embeds a sub-grid, the main area grid. It defines the arrangement of parts in the main area. The main area is optional.
 *
 * The layout is serializable into a URL-safe base64 string.
 *
 * The layout is an immutable object that provides methods to modify the layout. Modifications have no
 * side effects. Each modification creates a new layout instance that can be used for further modifications.
 *
 * IMPORTANT: Methods starting with an underscore indicate they are not working on a working copy, but modifying the layout instance.
 */
export class ɵWorkbenchLayout implements WorkbenchLayout {

  private readonly _grids: Grids;
  private readonly _gridNames: Array<keyof Grids>;
  private readonly _partActivationInstantProvider = inject(PartActivationInstantProvider);
  private readonly _viewActivationInstantProvider = inject(ViewActivationInstantProvider);
  private readonly _serializer = inject(WorkbenchLayoutSerializer);
  private readonly _injector = inject(Injector);

  private _maximized: boolean;

  /** @internal **/
  constructor(config: {workbenchGrid?: string | MPartGrid | null; mainAreaGrid?: string | MPartGrid | null; maximized?: boolean}) {
    this._grids = {
      workbench: coerceMPartGrid(config.workbenchGrid ?? createDefaultWorkbenchGrid()),
    };
    if (this.hasPart(MAIN_AREA, {grid: 'workbench'})) {
      this._grids.mainArea = coerceMPartGrid(config.mainAreaGrid ?? createInitialMainAreaGrid());
    }
    this._gridNames = Object.keys(this._grids) as Array<keyof Grids>;
    this._maximized = config.maximized ?? false;
    this.parts().forEach(part => assertType(part, {toBeOneOf: [MTreeNode, MPart]}));
  }

  /**
   * Reference to the grid of the workbench.
   */
  public get workbenchGrid(): Readonly<ɵMPartGrid> {
    return this._grids.workbench;
  }

  /**
   * Reference to the grid of the main area, if any.
   *
   * The main area grid is a sub-grid included by the main area part, if any. It defines the arrangement of parts in the main area.
   */
  public get mainAreaGrid(): Readonly<ɵMPartGrid> | null {
    return this._grids.mainArea ?? null;
  }

  /**
   * Tests if given part is contained in specified grid.
   */
  public hasPart(partId: string, options?: {grid?: keyof Grids}): boolean {
    return this.part({by: {partId}, grid: options?.grid}, {orElse: null}) !== null;
  }

  /**
   * Depending on the current state, maximizes or minimizes the main area.
   *
   * @return a copy of this layout with the maximization changed.
   */
  public toggleMaximized(): ɵWorkbenchLayout {
    return this.workingCopy().__toggleMaximized();
  }

  /**
   * Indicates whether the main area is maximized.
   */
  public get maximized(): boolean {
    return this._maximized;
  }

  /**
   * Returns parts contained in the specified grid, or parts in any grid if not specifying a search grid.
   *
   * @param find - Search constraints
   *       @property grid - Limits the search scope. If not specified, all grids are searched.
   * @return parts matching the filter criteria.
   */
  public parts(find?: {grid?: keyof Grids}): readonly MPart[] {
    return this.findTreeElements((element: MTreeNode | MPart): element is MPart => element instanceof MPart, {grid: find?.grid});
  }

  /**
   * Returns the part matching the given criteria. If not found, by default, throws an error unless setting the `orElseNull` option.
   *
   * @param find - Search constraints
   *        @property by
   *          @property partId - If specified, searches the part of given identity.
   *          @property viewId - If specified, searches the part that contains given view.
   *        @property grid - Limits the search scope. If not specified, all grids are searched.
   * @param options - Search options
   *       @property orElse - If set, returns `null` instead of throwing an error if no part is found.
   * @return part matching the filter criteria.
   */
  public part(find: {by: {partId?: string; viewId?: string}; grid?: keyof Grids}): MPart;
  public part(find: {by: {partId?: string; viewId?: string}; grid?: keyof Grids}, options: {orElse: null}): MPart | null;
  public part(find: {by: {partId?: string; viewId?: string}; grid?: keyof Grids}, options?: {orElse: null}): MPart | null {
    if (!find.by.partId && !find.by.viewId) {
      throw Error('[IllegalArgumentError] Missing required argument. Specify either "partId" or "viewId".');
    }
    const part = this.findTreeElements((element: MTreeNode | MPart): element is MPart => {
      if (!(element instanceof MPart)) {
        return false;
      }
      if (find.by.partId && element.id !== find.by.partId) {
        return false;
      }
      if (find.by.viewId && !element.views.some(view => view.id === find.by.viewId)) {
        return false;
      }
      return true;
    }, {findFirst: true, grid: find.grid})[0];

    if (!part && !options) {
      throw Error(`[NullPartError] No part found matching "${JSON.stringify(find)}".`);
    }
    return part ?? null;
  }

  /**
   * @inheritDoc
   *
   * @param id - @inheritDoc
   * @param relativeTo - @inheritDoc
   * @param options - Controls how to add the part to the layout.
   *        @property structural - Specifies whether this is a structural part. A structural part is not removed
   *                               from the layout when removing its last view. If not set, defaults to `true`.
   */
  public addPart(id: string | MAIN_AREA, relativeTo: ReferenceElement, options?: {activate?: boolean; structural?: boolean}): ɵWorkbenchLayout {
    return this.workingCopy().__addPart(id, relativeTo, options);
  }

  /**
   * @inheritDoc
   */
  public removePart(id: string): ɵWorkbenchLayout {
    return this.workingCopy().__removePart(id);
  }

  /**
   * Returns the active part of the specified grid, or `null` if specified grid is not present.
   */
  public activePart(find: {grid: 'workbench'}): Readonly<MPart>;
  public activePart(find: {grid: keyof Grids}): Readonly<MPart> | null;
  public activePart(find: {grid: keyof Grids}): Readonly<MPart> | null {
    const grid = this._grids[find.grid];
    if (!grid) {
      return null;
    }
    return this.part({by: {partId: grid.activePartId}, grid: find.grid});
  }

  /**
   * @inheritDoc
   */
  public activatePart(id: string): ɵWorkbenchLayout {
    return this.workingCopy().__activatePart(id);
  }

  /**
   * Returns views contained in the specified grid, or views in any grid if not specifying any.
   *
   * @param find - Search constraints
   *       @property grid - Limits the search scope. If not specified, all grids are searched.
   * @return views maching the filter criteria.
   */
  public views(find?: {grid?: keyof Grids}): readonly MView[] {
    return this.parts(find).reduce((views, part) => views.concat(part.views), new Array<MView>());
  }

  /**
   * @inheritDoc
   */
  public addView(id: string, options: {partId: string; position?: number; activateView?: boolean; activatePart?: boolean}): ɵWorkbenchLayout {
    return this.workingCopy().__addView(id, options);
  }

  /**
   * @inheritDoc
   */
  public removeView(id: string, options?: {grid?: keyof Grids}): ɵWorkbenchLayout {
    return this.workingCopy().__removeView(id, options);
  }

  /**
   * Moves a view to a different part or moves it within a part.
   *
   * @param id - The id of the view to be moved.
   * @param targetPartId - The id of the part to which to move the view.
   * @param options - Controls how to move the view in the layout.
   *        @property position - Specifies the position where to move the view in the target part. The position is zero-based. If not set, moves the view to the end.
   *        @property activateView - Controls whether to activate the view. If not set, defaults to `false`.
   *        @property activatePart - Controls whether to activate the target part. If not set, defaults to `false`.
   *
   * @return a copy of this layout with the view moved.
   */
  public moveView(id: string, targetPartId: string, options?: {position?: number; activateView?: boolean; activatePart?: boolean}): ɵWorkbenchLayout {
    return this.workingCopy().__moveView(id, targetPartId, options);
  }

  /**
   * @inheritDoc
   */
  public activateView(id: string, options?: {activatePart?: boolean}): ɵWorkbenchLayout {
    return this.workingCopy().__activateView(id, options);
  }

  /**
   * Activates the subsequent view if it exists, or the preceding view otherwise.
   *
   * @param id - The id of the view for which to activate its adjacent view.
   * @param options - Controls view activation.
   *        @property activatePart - Controls whether to activate the part. If not set, defaults to `false`.
   * @return a copy of this layout with the adjacent view activated.
   */
  public activateAdjacentView(id: string, options?: {activatePart?: boolean}): ɵWorkbenchLayout {
    return this.workingCopy().__activateAdjacentView(id, options);
  }

  /**
   * Gives a view a new identity.
   *
   * @param id - The id of the view which to give a new identity.
   * @param newViewId - The new identity of the view.
   * @param options - Controls how to locate the view.
   *       @property grid - Grid to constrain where to find the view for rename.
   * @return a copy of this layout with the view renamed.
   */
  public renameView(id: string, newViewId: string, options?: {grid?: keyof Grids}): ɵWorkbenchLayout {
    return this.workingCopy().__renameView(id, newViewId, options);
  }

  /**
   * Serializes this layout into a URL-safe base64 string.
   */
  public serialize(): {workbenchGrid: string; mainAreaGrid: string | null} {
    const isMainAreaEmpty = (this.mainAreaGrid?.root instanceof MPart && this.mainAreaGrid.root.views.length === 0) ?? true;
    return {
      workbenchGrid: this._serializer.serialize(this.workbenchGrid),
      mainAreaGrid: isMainAreaEmpty ? null : this._serializer.serialize(this._grids.mainArea),
    };
  }

  /**
   * Computes the next available view id to be the target of a primary route.
   *
   * @see VIEW_ID_PREFIX
   */
  public computeNextViewId(): string {
    const ids = this.views()
      .filter(view => view.id.startsWith(VIEW_ID_PREFIX))
      .map(view => Number(view.id.substring(VIEW_ID_PREFIX.length)))
      .reduce((set, viewId) => set.add(viewId), new Set<number>());

    for (let i = 1; i <= ids.size; i++) {
      if (!ids.has(i)) {
        return VIEW_ID_PREFIX.concat(`${i}`);
      }
    }
    return VIEW_ID_PREFIX.concat(`${ids.size + 1}`);
  }

  /**
   * Computes the index for 'start' or 'last' literals, or, if `undefined`, returns the position after the currently active view.
   */
  public computeViewInsertionIndex(insertionIndex: number | 'start' | 'end' | undefined, partId: string): number {
    switch (insertionIndex) {
      case undefined: {  // index after the active view, if any, or after the last view otherwise
        const part = this.part({by: {partId}});
        const activeViewIndex = part.views.findIndex(view => view.id === part.activeViewId);
        return (activeViewIndex > -1 ? activeViewIndex + 1 : part.views.length);
      }
      case 'start': {
        return 0;
      }
      case 'end': {
        return this.part({by: {partId}}).views.length;
      }
      default: {
        return insertionIndex;
      }
    }
  }

  /**
   * Sets the split ratio for the two children of a {@link MTreeNode}.
   *
   * @param  nodeId - The id of the node to set the split ratio for.
   * @param  ratio - The proportional size between the two children, expressed as closed interval [0,1].
   *                 Example: To give 1/3 of the space to the first child, set the ratio to `0.3`.
   * @return a copy of this layout with the split ratio set.
   */
  public setSplitRatio(nodeId: string, ratio: number): ɵWorkbenchLayout {
    return this.workingCopy().__setSplitRatio(nodeId, ratio);
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __addPart(id: string, relativeTo: ReferenceElement, options?: {activate?: boolean; structural?: boolean}): this {
    if (this.hasPart(id)) {
      throw Error(`[IllegalArgumentError] Part id must be unique. The layout already contains a part with the id '${id}'.`);
    }

    const newPart = new MPart({id, structural: options?.structural ?? true});

    // Find the reference element, if specified, or use the layout root as reference otherwise.
    const referenceElement = relativeTo.relativeTo ? this.element({by: {id: relativeTo.relativeTo}}) : this.workbenchGrid.root;
    const addBefore = relativeTo.align === 'left' || relativeTo.align === 'top';
    const ratio = relativeTo.ratio ?? .5;

    // Create a new tree node.
    const newTreeNode: MTreeNode = new MTreeNode({
      nodeId: UUID.randomUUID(),
      child1: addBefore ? newPart : referenceElement,
      child2: addBefore ? referenceElement : newPart,
      direction: relativeTo.align === 'left' || relativeTo.align === 'right' ? 'row' : 'column',
      ratio: addBefore ? ratio : 1 - ratio,
      parent: referenceElement.parent,
    });

    // Add the tree node to the layout.
    if (!referenceElement.parent) {
      this.grid({by: {element: referenceElement}}).root = newTreeNode; // top-level node
    }
    else if (referenceElement.parent.child1 === referenceElement) {
      referenceElement.parent.child1 = newTreeNode;
    }
    else {
      referenceElement.parent.child2 = newTreeNode;
    }
    referenceElement.parent = newTreeNode;
    newPart.parent = newTreeNode;

    // Activate the part.
    if (options?.activate) {
      this.__activatePart(newPart.id);
    }

    return this;
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __removePart(id: string): this {
    const part = this.part({by: {partId: id}});
    const grid = this.grid({by: {element: part}});
    const gridName = this._gridNames.find(gridName => this._grids[gridName] === grid);

    // The last part is never removed.
    const parts = this.parts({grid: gridName});
    if (parts.length === 1) {
      return this;
    }

    // Remove the part.
    const siblingElement = (part.parent!.child1 === part ? part.parent!.child2 : part.parent!.child1);
    if (!part.parent!.parent) {
      grid.root = siblingElement;
      grid.root.parent = undefined;
    }
    else if (part.parent!.parent.child1 === part.parent) {
      part.parent!.parent.child1 = siblingElement;
    }
    else {
      part.parent!.parent.child2 = siblingElement;
    }

    // If the removed part was the active part, make the last used part the active part.
    if (grid.activePartId === id) {
      const activePart = parts
        .filter(part => part.id !== id)
        .sort((part1, part2) => {
          const activationInstantPart1 = this._partActivationInstantProvider.getActivationInstant(part1.id);
          const activationInstantPart2 = this._partActivationInstantProvider.getActivationInstant(part2.id);
          return activationInstantPart2 - activationInstantPart1;
        })[0];
      grid.activePartId = activePart!.id;
    }

    return this;
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __addView(id: string, options: {partId: string; position?: number; activateView?: boolean; activatePart?: boolean}): this {
    if (this.views().find(view => view.id === id)) {
      throw Error(`[IllegalArgumentError] View id must be unique. The layout already contains a view with the id '${id}'.`);
    }

    const part = this.part({by: {partId: options.partId}});
    part.views.splice(options.position ?? part.views.length, 0, {id});

    // Activate view and part.
    if (options.activateView) {
      this.__activateView(id);
    }
    if (options.activatePart) {
      this.__activatePart(options.partId);
    }
    return this;
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __moveView(id: string, targetPartId: string, options?: {position?: number; activateView?: boolean; activatePart?: boolean}): this {
    const sourcePart = this.part({by: {viewId: id}});
    const targetPart = this.part({by: {partId: targetPartId}});
    const position = options?.position;

    // Move the view.
    if (sourcePart !== targetPart) {
      this.__removeView(id);
      this.__addView(id, {partId: targetPartId, position});
    }
    else if (position === undefined) {
      sourcePart.views.splice(sourcePart.views.findIndex(view => view.id === id), 1);
      sourcePart.views.push({id});
    }
    else {
      const referenceView = sourcePart.views[position];
      sourcePart.views.splice(sourcePart.views.findIndex(view => view.id === id), 1);
      sourcePart.views.splice(sourcePart.views.findIndex(view => view.id === referenceView.id), 0, {id});
    }

    // Activate view and part.
    if (options?.activatePart) {
      this.__activatePart(targetPartId);
    }
    if (options?.activateView) {
      this.__activateView(id);
    }

    return this;
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __removeView(id: string, options?: {grid?: keyof Grids}): this {
    const part = this.part({by: {viewId: id}, grid: options?.grid});

    // Remove the view.
    const viewIndex = part.views.findIndex(view => view.id === id);
    if (viewIndex === -1) {
      throw Error(`[IllegalArgumentError] View not found in the part [part=${part.id}, view=${id}]`);
    }

    part.views.splice(viewIndex, 1);

    // Activate the last used view if this view was active.
    if (part.activeViewId === id) {
      part.activeViewId = part.views
        .map(view => view.id)
        .sort((viewId1, viewId2) => {
          const activationInstantView1 = this._viewActivationInstantProvider.getActivationInstant(viewId1);
          const activationInstantView2 = this._viewActivationInstantProvider.getActivationInstant(viewId2);
          return activationInstantView2 - activationInstantView1;
        })[0];
    }

    // Remove the part if this is the last view of the part and not a structural part.
    if (part.views.length === 0 && !part.structural) {
      this.__removePart(part.id);
    }

    return this;
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __activateView(id: string, options?: {activatePart?: boolean}): this {
    // Activate the view.
    const part = this.part({by: {viewId: id}});
    part.activeViewId = id;

    // Activate the part.
    if (options?.activatePart) {
      this.__activatePart(part.id);
    }
    return this;
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __activateAdjacentView(id: string, options?: {activatePart?: boolean}): this {
    const part = this.part({by: {viewId: id}});
    const viewIndex = part.views.findIndex(view => view.id === id);
    part.activeViewId = (part.views[viewIndex + 1] || part.views[viewIndex - 1])?.id; // is `undefined` if it is the last view of the part

    // Activate the part.
    if (options?.activatePart) {
      this.__activatePart(part.id);
    }
    return this;
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __setSplitRatio(nodeId: string, ratio: number): this {
    if (ratio < 0 || ratio > 1) {
      throw Error(`[IllegalArgumentError] Ratio for node '${nodeId}' must be in the closed interval [0,1], but was '${ratio}'.`);
    }
    this.node({by: {nodeId}}).ratio = ratio;
    return this;
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __activatePart(id: string): this {
    const part = this.part({by: {partId: id}});
    this.grid({by: {element: part}}).activePartId = id;

    return this;
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __toggleMaximized(): this {
    this._maximized = !this._maximized;
    return this;
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __renameView(id: string, newViewId: string, options?: {grid?: keyof Grids}): this {
    if (this.views().find(view => view.id === newViewId)) {
      throw Error(`[IllegalArgumentError] View id must be unique. The layout already contains a view with the id '${newViewId}'.`);
    }

    const part = this.part({by: {viewId: id}, grid: options?.grid});
    const viewIndex = part.views.findIndex(view => view.id === id);
    part.views[viewIndex] = {...part.views[viewIndex], id: newViewId};

    if (part.activeViewId === id) {
      part.activeViewId = newViewId;
    }

    return this;
  }

  /**
   * Returns the grid that contains the given element. If not found, throws an error.
   */
  private grid(find: {by: {element: MPart | MTreeNode}}): MPartGrid {
    const gridName = this._gridNames.find(gridName => {
      return this.findTreeElements((element: MTreeNode | MPart): element is MPart | MTreeNode => element === find.by.element, {findFirst: true, grid: gridName}).length > 0;
    });

    if (!gridName) {
      if (find.by.element instanceof MPart) {
        throw Error(`[NullGridError] No grid found that contains the part '${find.by.element.id}'".`);
      }
      else {
        throw Error(`[NullGridError] No grid found that contains the node '${find.by.element.nodeId}'".`);
      }
    }

    return this._grids[gridName]!;
  }

  /**
   * Returns the element of given id. If not found, by default, throws an error unless setting the `orElseNull` option.
   *
   * @param find - Search constraints
   *        @property by
   *          @property id - Specifies the identity of the element.
   *        @property grid - Limits the search scope. If not specified, all grids are searched.
   * @param options - Search options
   *       @property orElse - If set, returns `null` instead of throwing an error if no element is found.
   * @return part maching the filter criteria.
   */
  private element(find: {by: {id: string}; grid?: keyof Grids}): MPart | MTreeNode;
  private element(find: {by: {id: string}; grid?: keyof Grids}, options: {orElse: null}): MPart | MTreeNode | null;
  private element(find: {by: {id: string}; grid?: keyof Grids}, options?: {orElse: null}): MPart | MTreeNode | null {
    const element = this.findTreeElements((element: MTreeNode | MPart): element is MPart | MTreeNode => {
      return element instanceof MPart ? element.id === find.by.id : element.nodeId === find.by.id;
    }, {findFirst: true, grid: find.grid})[0];

    if (!element && !options) {
      throw Error(`[NullElementError] Element with id '${find.by.id}' not found in the layout.`);
    }
    return element ?? null;
  }

  /**
   * Returns the node of given id. If not found, throws an error.
   */
  private node(find: {by: {nodeId: string}}): MTreeNode {
    const node = this.findTreeElements((element: MTreeNode | MPart): element is MTreeNode => element instanceof MTreeNode && element.nodeId === find.by.nodeId, {findFirst: true})[0];
    if (!node) {
      throw Error(`[NullNodeError] Node '${find.by.nodeId}' not found.`);
    }
    return node;
  }

  /**
   * Traverses the tree to find elements that match the given predicate.
   *
   * @param predicateFn - Predicate function to match.
   * @param options - Search options
   *        @property findFirst - If specified, stops traversing on first match. If not set, defaults to `false`.
   *        @property grid - Limits the search scope. If not specified, all grids are searched.
   */
  private findTreeElements<T extends MTreeNode | MPart>(predicateFn: (element: MTreeNode | MPart) => element is T, options?: {findFirst?: boolean; grid?: keyof Grids}): T[] {
    if (options?.grid && !this._grids[options.grid]) {
      return [];
    }

    const result: T[] = [];

    function visitParts(node: MTreeNode | MPart): boolean {
      if (predicateFn(node)) {
        result.push(node);
        if (options?.findFirst) {
          return false; // stop visiting other elements
        }
      }

      if (node instanceof MTreeNode) {
        return visitParts(node.child1) && visitParts(node.child2);
      }
      return true;
    }

    if (options?.grid) {
      visitParts(this._grids[options.grid]!.root);
    }
    else {
      for (const grid of Object.values(this._grids)) {
        if (grid && !visitParts(grid.root)) {
          break;
        }
      }
    }

    return result;
  }

  /**
   * Creates a copy of this layout.
   */
  private workingCopy(): ɵWorkbenchLayout {
    return runInInjectionContext(this._injector, () => new ɵWorkbenchLayout({
      workbenchGrid: this._serializer.serialize(this.workbenchGrid, {includeNodeId: true}),
      mainAreaGrid: this._serializer.serialize(this._grids.mainArea, {includeNodeId: true}),
      maximized: this._maximized,
    }));
  }
}

/**
 * Creates a default workbench grid with a main area.
 */
function createDefaultWorkbenchGrid(): MPartGrid {
  return {
    root: new MPart({id: MAIN_AREA, structural: true}),
    activePartId: MAIN_AREA,
  };
}

/**
 * Creates a main area grid with an initial part.
 *
 * The DI token {@link MAIN_AREA_INITIAL_PART_ID} is used to assign the initial part its identity.
 */
function createInitialMainAreaGrid(): MPartGrid {
  return {
    root: new MPart({id: inject(MAIN_AREA_INITIAL_PART_ID)}),
    activePartId: inject(MAIN_AREA_INITIAL_PART_ID),
  };
}

/**
 * Coerces {@link MPartGrid}, applying necessary migrations if the serialized grid is outdated.
 */
function coerceMPartGrid(grid: string | MPartGrid): ɵMPartGrid {
  if (typeof grid === 'string') {
    return {...inject(WorkbenchLayoutSerializer).deserialize(grid)};
  }
  return {...grid, migrated: false};
}

/**
 * Grids of the workbench layout.
 */
interface Grids {
  /**
   * Reference to the grid of the workbench.
   */
  workbench: ɵMPartGrid;
  /**
   * Reference to the grid of the main area, if any.
   *
   * The main area grid is a sub-grid embedded in the main area part, if any. It defines the arrangement of parts in the main area.
   */
  mainArea?: ɵMPartGrid;
}

/**
 * Tests if the given {@link MTreeNode} or {@link MPart} is visible.
 *
 * - A part is considered visible if it is the main area part or has at least one view.
 * - A node is considered visible if it has at least one visible part in its child hierarchy.
 */
export function isGridElementVisible(element: MTreeNode | MPart): boolean {
  if (element instanceof MPart) {
    return element.id === MAIN_AREA || element.views.length > 0;
  }
  return isGridElementVisible(element.child1) || isGridElementVisible(element.child2);
}

/**
 * Describes how to lay out a part relative to another part or node.
 */
export interface ReferenceElement extends ReferencePart {
  /**
   * Specifies the part or node which to use as the reference element to lay out the part.
   * If not set, the part will be aligned relative to the root of the workbench layout.
   */
  relativeTo?: string;
}

/**
 * DI token to control the identity of the initial part in the main area.
 *
 * The initial part is automatically created by the workbench if the main area has no part, but it has no
 * special meaning to the workbench and can be removed by the user. If not set, a UUID is assigned.
 *
 * Overwrite this DI token in tests to control the identity of the initial part.
 * ```
 * TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'main'})
 * ```
 */
export const MAIN_AREA_INITIAL_PART_ID = new InjectionToken<string>('MAIN_AREA_INITIAL_PART_ID', {
  providedIn: 'root',
  factory: () => UUID.randomUUID(),
});

/**
 * Provides the instant when a part was last activated.
 *
 * Overwrite DI token in tests to control part activation instants.
 * ```
 * TestBed.overrideProvider(PartActivationInstantProvider, {useValue: ...});
 * ```
 */
@Injectable({providedIn: 'root'})
export class PartActivationInstantProvider {

  constructor(private _partRegistry: WorkbenchPartRegistry) {
  }

  /**
   * Returns the instant when the specified part was last activated.
   */
  public getActivationInstant(partId: string): number {
    return this._partRegistry.get(partId, {orElse: null})?.activationInstant ?? 0;
  }
}

/**
 * Provides the instant when a view was last activated.
 *
 * Overwrite DI token in tests to control view activation instants.
 * ```
 * TestBed.overrideProvider(ViewActivationInstantProvider, {useValue: ...});
 * ```
 */
@Injectable({providedIn: 'root'})
export class ViewActivationInstantProvider {

  constructor(private _viewRegistry: WorkbenchViewRegistry) {
  }

  /**
   * Returns the instant when the specified view was last activated.
   */
  public getActivationInstant(viewId: string): number {
    return this._viewRegistry.get(viewId, {orElse: null})?.activationInstant ?? 0;
  }
}
