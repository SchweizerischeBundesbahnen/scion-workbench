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
import {assertType} from '../asserts.util';
import {UUID} from '@scion/toolkit/uuid';
import {MAIN_AREA_PART_ID, ReferencePart, WorkbenchLayout} from './workbench-layout';
import {WorkbenchLayoutSerializer} from './workench-layout-serializer.service';

/**
 * The workbench layout defines the arrangement of parts in a grid. A part is a stack of views.
 *
 * @inheritDoc
 *
 * ## Grids
 * The workbench layout consists of two grids:
 *
 * - Main Grid:
 *   The main grid is the primary grid and common to all perspectives.
 *
 * - Peripheral Grid:
 *   The peripheral grid arranges parts around the main grid. It contains at least the main area part {@link MAIN_AREA_PART_ID},
 *   which is always present and common to all perspectives. The main area part embeds the main grid.
 *
 * ## Immutable Layout
 * The workbench layout is an immutable object that provides methods to modify the layout. Modifications have no side effects.
 * Each modification creates a new layout instance that can be used for further modifications. The layout is serializable into a URL-safe base64 string.
 *
 * NOTE: Methods starting with an underscore indicate they are not working on a working copy, but modifying the layout instance.
 *
 * @inheritDoc
 */
export class ɵWorkbenchLayout implements WorkbenchLayout {

  private readonly _grids: Grids;
  private readonly _scopes: Scope[];
  private readonly _workbenchAccessor: WorkbenchAccessor;

  private _maximized: boolean;

  /** @internal **/
  constructor(config: {mainGrid?: string | MPartGrid | null; peripheralGrid?: string | MPartGrid | null; maximized?: boolean; workbenchAccessor: WorkbenchAccessor}) {
    const {mainGrid, peripheralGrid} = config;
    const serializer = config.workbenchAccessor.serializer;
    this._grids = {
      main: coerceMPartGrid(mainGrid, {serializer, createInitialPartFn: () => ({id: config.workbenchAccessor.getInitialPartId()})}),
      peripheral: coerceMPartGrid(peripheralGrid, {serializer, createInitialPartFn: () => ({id: MAIN_AREA_PART_ID, structural: true})}),
    };
    this._scopes = Object.keys(this._grids) as Scope[];
    this._workbenchAccessor = config.workbenchAccessor;
    this._maximized = config.maximized ?? false;
    this.parts().forEach(part => assertType(part, {toBeOneOf: [MTreeNode, MPart]}));
  }

  /**
   * Reference to the grid of the main area.
   *
   * The main grid is the primary grid and common to all perspectives.
   */
  public get mainGrid(): Readonly<ɵMPartGrid> {
    return this._grids.main;
  }

  /**
   * Reference to the grid of the peripheral area.
   *
   * The peripheral grid arranges parts around the main grid. It contains at least the main area part {@link MAIN_AREA_PART_ID},
   * which is always present and common to all perspectives. The main area part embeds the main grid.
   */
  public get peripheralGrid(): Readonly<ɵMPartGrid> {
    return this._grids.peripheral;
  }

  /**
   * Checks if the specified part is contained in the main area.
   */
  public isInMainArea(partId: string): boolean {
    return this.part({by: {partId}, scope: 'main'}, {orElse: null}) !== null;
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
   * Returns parts contained in the specified scope, or parts in any scope if not specifying a search scope.
   *
   * @param find - Search constraints
   *       @property scope - Limits the search to parts in the specified scope. If not specified, all scopes are searched.
   * @return parts maching the filter criteria.
   */
  public parts(find?: {scope?: Scope}): readonly MPart[] {
    return this.findTreeElements((element: MTreeNode | MPart): element is MPart => element instanceof MPart, {scope: find?.scope});
  }

  /**
   * Returns the part matching the given criteria. If not found, by default, throws an error unless setting the `orElseNull` option.
   *
   * @param find - Search constraints
   *        @property by
   *          @property partId - If specified, searches the part of given identity.
   *          @property viewId - If specified, searches the part that contains given view.
   *        @property scope - Limits the search to parts in the specified scope. If not specified, all scopes are searched.
   * @param options - Search options
   *       @property orElse - If set, returns `null` instead of throwing an error if no part is found.
   * @return part maching the filter criteria.
   */
  public part(find: {by: {partId?: string; viewId?: string}; scope?: Scope}): MPart;
  public part(find: {by: {partId?: string; viewId?: string}; scope?: Scope}, options: {orElse: null}): MPart | null;
  public part(find: {by: {partId?: string; viewId?: string}; scope?: Scope}, options?: {orElse: null}): MPart | null {
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
    }, {findFirst: true, scope: find.scope})[0];

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
  public addPart(id: string, relativeTo: ReferencePart, options?: {activate?: boolean; structural?: boolean}): ɵWorkbenchLayout {
    return this.workingCopy().__addPart(id, relativeTo, options);
  }

  /**
   * @inheritDoc
   */
  public removePart(id: string): ɵWorkbenchLayout {
    return this.workingCopy().__removePart(id);
  }

  /**
   * Returns the active part in specified grid. At any given time, only a single part can be the active part in a grid.
   * There is always an active part present.
   */
  public activePart(find: {scope: Scope}): Readonly<MPart> {
    const activePartId = this._grids[find.scope].activePartId;
    return this.part({by: {partId: activePartId}, scope: find.scope});
  }

  /**
   * @inheritDoc
   */
  public activatePart(id: string): ɵWorkbenchLayout {
    return this.workingCopy().__activatePart(id);
  }

  /**
   * Returns views contained in the specified scope, or views in any scope if not specifying a search scope.
   *
   * @param find - Search constraints
   *       @property scope - Limits the search to views in the specified scope. If not specified, all scopes are searched.
   * @return views maching the filter criteria.
   */
  public views(find?: {scope?: Scope}): readonly MView[] {
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
  public removeView(id: string, options?: {scope?: Scope}): ɵWorkbenchLayout {
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
   *       @property scope - Scope to constrain where to find the view for rename.
   * @return a copy of this layout with the view renamed.
   */
  public renameView(id: string, newViewId: string, options?: {scope?: Scope}): ɵWorkbenchLayout {
    return this.workingCopy().__renameView(id, newViewId, options);
  }

  /**
   * Serializes this layout into a URL-safe base64 string.
   *
   * @param options - Controls the serialization.
   *                  @property nullIfEmpty - If `true` or if not specified, returns `null` for the grid if it contains a single part with no views added to it.
   *                  @property includeNodeId - Controls if to include the `nodeId`. By default, if not set, the `nodeId` is excluded from serialization.
   */
  public serialize(options: {nullIfEmpty: false; includeNodeId?: boolean}): {mainGrid: string; peripheralGrid: string};
  public serialize(options?: {nullIfEmpty?: true; includeNodeId?: boolean} | {}): {mainGrid: string | null; peripheralGrid: string | null};
  public serialize(options?: {nullIfEmpty?: boolean; includeNodeId?: boolean}): {mainGrid: string | null; peripheralGrid: string | null} {
    const nullIfEmpty = options?.nullIfEmpty ?? true;
    const includeNodeId = options?.includeNodeId;
    const serializer = this._workbenchAccessor.serializer;
    return {
      mainGrid: serializer.serialize(this.mainGrid, {nullIfEmpty, includeNodeId}),
      peripheralGrid: serializer.serialize(this.peripheralGrid, {nullIfEmpty, includeNodeId}),
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
  private __addPart(id: string, relativeTo: ReferencePart, options?: {activate?: boolean; structural?: boolean}): this {
    if (this.part({by: {partId: id}}, {orElse: null})) {
      throw Error(`[IllegalArgumentError] Part id must be unique. The layout already contains a part with the id '${id}'.`);
    }

    const newPart = new MPart({id, structural: options?.structural ?? true});

    // Find the reference part, if any, or insert the new part beside the root.
    const referenceElement = relativeTo.relativeTo ? this.part({by: {partId: relativeTo.relativeTo}}) : this.peripheralGrid.root;
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
    if (id === MAIN_AREA_PART_ID) {
      throw Error('[IllegalArgumentError] The main area part cannot be removed.');
    }

    const part = this.part({by: {partId: id}});
    const grid = this.grid({by: {element: part}});
    const scope = this._scopes.find(scope => this._grids[scope] === grid);

    // The last part is never removed.
    const parts = this.parts({scope});
    if (parts.length === 1) {
      return this;
    }

    // Remove the part.
    const siblingElement = (part.parent!.child1 === part ? part.parent!.child2 : part.parent!.child1);
    if (!part.parent!.parent) {
      grid.root = siblingElement;
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
        .sort((part1, part2) => this._workbenchAccessor.getPartActivationInstant(part2.id) - this._workbenchAccessor.getPartActivationInstant(part1.id))[0];
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
  private __removeView(id: string, options?: {scope?: Scope}): this {
    const part = this.part({by: {viewId: id}, scope: options?.scope});

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
        .sort((viewId1, viewId2) => this._workbenchAccessor.getViewActivationInstant(viewId2) - this._workbenchAccessor.getViewActivationInstant(viewId1))[0];
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
  private __renameView(id: string, newViewId: string, options?: {scope?: Scope}): this {
    if (this.views().find(view => view.id === newViewId)) {
      throw Error(`[IllegalArgumentError] View id must be unique. The layout already contains a view with the id '${newViewId}'.`);
    }

    const part = this.part({by: {viewId: id}, scope: options?.scope});
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
    const scope = this._scopes.find(scope => {
      return this.findTreeElements((element: MTreeNode | MPart): element is MPart | MTreeNode => element === find.by.element, {findFirst: true, scope}).length > 0;
    });

    if (!scope) {
      if (find.by.element instanceof MPart) {
        throw Error(`[NullGridError] No grid found that contains the part '${find.by.element.id}'".`);
      }
      else {
        throw Error(`[NullGridError] No grid found that contains the node '${find.by.element.nodeId}'".`);
      }
    }

    return this._grids[scope];
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
   *        @property scope - Limits the search to elements in the specified scope. If not specified, all scopes are searched.
   */
  private findTreeElements<T extends MTreeNode | MPart>(predicateFn: (element: MTreeNode | MPart) => element is T, options?: {findFirst?: boolean; scope?: Scope}): T[] {
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

    if (options?.scope) {
      visitParts(this._grids[options.scope].root);
    }
    else {
      for (const grid of Object.values(this._grids)) {
        if (!visitParts(grid.root)) {
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
    const {mainGrid, peripheralGrid} = this.serialize({nullIfEmpty: false, includeNodeId: true});
    return new ɵWorkbenchLayout({
      mainGrid,
      peripheralGrid,
      workbenchAccessor: this._workbenchAccessor,
      maximized: this._maximized,
    });
  }
}

/**
 * Coerces {@link MPartGrid}, applying necessary migrations if the serialized grid is outdated.
 */
function coerceMPartGrid(grid: string | MPartGrid | null | undefined, options: {serializer: WorkbenchLayoutSerializer; createInitialPartFn: () => Partial<MPart> & {id: string}}): ɵMPartGrid {
  if (grid === null || grid === undefined) {
    const initialPart = options.createInitialPartFn();
    return {root: new MPart(initialPart), activePartId: initialPart.id, migrated: false};
  }
  if (typeof grid === 'string') {
    return {...options.serializer.deserialize(grid)};
  }
  return {...grid, migrated: false};
}

/**
 * Provides {@link WorkbenchLayout} access to workbench resources.
 *
 * @internal
 */
export interface WorkbenchAccessor {
  /**
   * Serializes and deserializes a base64-encoded JSON into a {@link MPartGrid}.
   */
  readonly serializer: WorkbenchLayoutSerializer;

  /**
   * Returns the instant when the specified view was last activated.
   */
  getViewActivationInstant(viewId: string): number;

  /**
   * Returns the instant when the specified part was last activated.
   */
  getPartActivationInstant(partId: string): number;

  /**
   * Returns the identity to use when creating the initial part in the main area.
   *
   * The initial part is automatically created by the workbench if the main area has no part, but it has no
   * special meaning to the workbench and can be removed by the user.
   */
  getInitialPartId(): string;
}

/**
 * Controls in which scope to search for elements in the layout.
 */
export type Scope = keyof Grids;

/**
 * Grids of the workbench layout.
 */
interface Grids {
  /**
   * Reference to the grid of the main area.
   *
   * The main grid is the primary grid and common to all perspectives.
   */
  main: ɵMPartGrid;
  /**
   * Reference to the grid of the peripheral area.
   *
   * The peripheral grid arranges parts around the main grid. It contains at least the main area part {@link MAIN_AREA_PART_ID},
   * which is always present and common to all perspectives. The main area part embeds the main grid.
   */
  peripheral: ɵMPartGrid;
}
