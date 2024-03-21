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
import {assertType} from '../common/asserts.util';
import {UUID} from '@scion/toolkit/uuid';
import {MAIN_AREA, ReferencePart, WorkbenchLayout} from './workbench-layout';
import {WorkbenchLayoutSerializer} from './workench-layout-serializer.service';
import {WorkbenchViewRegistry} from '../view/workbench-view.registry';
import {WorkbenchPartRegistry} from '../part/workbench-part.registry';
import {inject, Injectable, InjectionToken, Injector, Predicate, runInInjectionContext} from '@angular/core';
import {RouterUtils} from '../routing/router.util';
import {Commands, ViewOutlets, ViewState, ViewStates} from '../routing/routing.model';
import {ActivatedRoute, PRIMARY_OUTLET, UrlSegment} from '@angular/router';
import {ViewId} from '../view/workbench-view.model';
import {Arrays} from '@scion/toolkit/util';
import {UrlSegmentMatcher} from '../routing/url-segment-matcher';
import {Objects} from '../common/objects.util';
import {WorkbenchLayouts} from './workbench-layouts.util';

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
  private readonly _viewOutlets: Map<ViewId, UrlSegment[]>;
  private readonly _viewStates: Map<ViewId, ViewState>;
  private readonly _gridNames: Array<keyof Grids>;
  private readonly _partActivationInstantProvider = inject(PartActivationInstantProvider);
  private readonly _viewActivationInstantProvider = inject(ViewActivationInstantProvider);
  private readonly _serializer = inject(WorkbenchLayoutSerializer);
  private readonly _injector = inject(Injector);

  private _maximized: boolean;

  /** @internal **/
  constructor(config: {workbenchGrid?: string | MPartGrid | null; mainAreaGrid?: string | MPartGrid | null; viewOutlets?: ViewOutlets; viewStates?: ViewStates; maximized?: boolean}) {
    this._grids = {
      workbench: coerceMPartGrid(config.workbenchGrid ?? createDefaultWorkbenchGrid()),
    };
    if (this.hasPart(MAIN_AREA, {grid: 'workbench'})) {
      this._grids.mainArea = coerceMPartGrid(config.mainAreaGrid ?? createInitialMainAreaGrid());
    }
    this._gridNames = Objects.keys(this._grids);
    this._maximized = config.maximized ?? false;
    this._viewOutlets = new Map<ViewId, UrlSegment[]>(Objects.entries(config.viewOutlets ?? {}));
    this._viewStates = new Map<ViewId, ViewState>(Objects.entries(config.viewStates ?? {}));
    this.parts().forEach(part => assertType(part, {toBeOneOf: [MTreeNode, MPart]}));

    // Remove view state of views not contained in this layout.
    this._viewOutlets.forEach((_, viewId) => {
      if (!this.hasView(viewId)) {
        this._viewOutlets.delete(viewId);
      }
    });
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
  public hasPart(id: string, options?: {grid?: keyof Grids}): boolean {
    return this.part({by: {partId: id}, grid: options?.grid}, {orElse: null}) !== null;
  }

  /**
   * Tests if given view is contained in specified grid.
   */
  public hasView(id: string, options?: {grid?: keyof Grids}): boolean {
    return this.views({grid: options?.grid, id: id}).length > 0;
  }

  /**
   * Returns the URL segments of non-static views that match the given search criteria.
   *
   * @param find - Search constraints
   *       @property grid - Limits the search scope. If not specified, all grids are searched.
   * @return view outlets matching the filter criteria.
   */
  public viewOutlets(find?: {grid?: keyof Grids}): ViewOutlets {
    const viewOutletEntries = this.views({grid: find?.grid}).map(view => [view.id, this._viewOutlets.get(view.id) ?? []]);
    return Object.fromEntries(viewOutletEntries);
  }

  /**
   * View state to be passed to the navigation when activating this layout.
   *
   * State can be read from {@link WorkbenchView.state}, or the browser's session history via `history.state`. During navigation, state is available via navigation extras.
   */
  public viewStates(find?: {grid?: keyof Grids}): ViewStates {
    const viewStateEntries = this.views({grid: find?.grid}).map(view => [view.id, this._viewStates.get(view.id) ?? {}]);
    return Object.fromEntries(viewStateEntries);
  }

  public viewState(find: {by: {viewId: ViewId}}): ViewState {
    return this._viewStates.get(find.by.viewId) ?? {};
  }

  public urlSegments(find: {by: {viewId: ViewId}}): UrlSegment[] {
    return this._viewOutlets.get(find.by.viewId) ?? [];
  }

  /**
   * Depending on the current state, maximizes or minimizes the main area.
   *
   * @return a copy of this layout with the maximization changed.
   */
  public toggleMaximized(): ɵWorkbenchLayout {
    const workingCopy = this.workingCopy();
    workingCopy.__toggleMaximized();
    return workingCopy;
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
      if (find.by.viewId && !element.views.some(matchViewById(find.by.viewId!))) {
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
    const workingCopy = this.workingCopy();
    workingCopy.__addPart(id, relativeTo, options);
    return workingCopy;
  }

  /**
   * @inheritDoc
   */
  public removePart(id: string): ɵWorkbenchLayout {
    const workingCopy = this.workingCopy();
    workingCopy.__removePart(id);
    return workingCopy;
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
    const workingCopy = this.workingCopy();
    workingCopy.__activatePart(id);
    return workingCopy;
  }

  public view(find: {by: {viewId: ViewId}}): MView;
  public view(find: {by: {viewId: ViewId}}, options: {orElse: null}): MView | null;
  public view(find: {by: {viewId: ViewId}}, options?: {orElse: null}): MView | null {
    const viewId = find.by.viewId;
    if (!RouterUtils.isPrimaryViewId(viewId)) {
      throw Error(`[ViewError] Expected view id to be primary view id, but was "${viewId}".`);
    }

    const view = this.views({id: viewId}).at(0);
    if (!view && !options) {
      throw Error(`[NullViewError] No view found with id "${viewId}".`);
    }
    return view ?? null;
  }

  /**
   * Returns views contained in the specified grid, or views in any grid if not specifying any.
   *
   * @param find - Search constraints
   *       @property grid - Limits the search scope. If not specified, all grids are searched.
   * @return views maching the filter criteria.
   */
  public views(find?: {id?: string; segments?: UrlSegmentMatcher; outlet?: string; grid?: keyof Grids}): readonly MView[] {
    return this.parts({grid: find?.grid})
      .flatMap(part => part.views)
      .filter(view => {
        if (find?.id && !matchViewById(find.id)(view)) {
          return false;
        }
        if (find?.segments && !find.segments.matches(this._viewOutlets.get(view.id) ?? [])) {
          return false;
        }
        if (find?.outlet && find.outlet !== view.navigation?.outlet) {
          return false;
        }
        return true;
      });
  }

  /**
   * @inheritDoc
   */
  public addView(id: string, options: {partId: string; position?: number | 'start' | 'end' | 'before-active-view' | 'after-active-view'; activateView?: boolean; activatePart?: boolean; cssClass?: string | string[]}): ɵWorkbenchLayout {
    const workingCopy = this.workingCopy();
    if (RouterUtils.isPrimaryViewId(id)) {
      workingCopy.__addView({id}, options);
    }
    else {
      workingCopy.__addView({id: this.computeNextViewId(), alternativeId: id}, options);
    }
    return workingCopy;
  }

  /**
   * @inheritDoc
   */
  public navigateView(id: string, commands: Commands, extras?: {outlet?: string; relativeTo?: ActivatedRoute | null; state?: ViewState; cssClass?: string | string[]}): ɵWorkbenchLayout {
    const workingCopy = this.workingCopy();
    workingCopy.views({id}).forEach(view => workingCopy.__navigateView(view, commands, extras));
    return workingCopy;
  }

  /**
   * @inheritDoc
   */
  public removeView(id: string, options?: {grid?: keyof Grids}): ɵWorkbenchLayout {
    const workingCopy = this.workingCopy();
    workingCopy.views({id}).forEach(view => workingCopy.__removeView(view, options));
    return workingCopy;
  }

  /**
   * Moves a view to a different part or moves it within a part.
   *
   * @param id - The id of the view to be moved.
   * @param targetPartId - The id of the part to which to move the view.
   * @param options - Controls how to move the view in the layout.
   *        @property position - Specifies the position where to move the view in the target part. The position is zero-based. If not set and moving the view to a different part, adds it at the end.
   *        @property activateView - Controls whether to activate the view. If not set, defaults to `false`.
   *        @property activatePart - Controls whether to activate the target part. If not set, defaults to `false`.
   *
   * @return a copy of this layout with the view moved.
   */
  public moveView(id: string, targetPartId: string, options?: {position?: number | 'start' | 'end' | 'before-active-view' | 'after-active-view'; activateView?: boolean; activatePart?: boolean}): ɵWorkbenchLayout {
    const workingCopy = this.workingCopy();
    workingCopy.views({id}).forEach(view => workingCopy.__moveView(view, targetPartId, options));
    return workingCopy;
  }

  /**
   * @inheritDoc
   */
  public activateView(id: string, options?: {activatePart?: boolean}): ɵWorkbenchLayout {
    const workingCopy = this.workingCopy();
    workingCopy.views({id}).forEach(view => workingCopy.__activateView(view, options));
    return workingCopy;
  }

  /**
   * Activates the preceding view if it exists, or the subsequent view otherwise.
   *
   * @param id - The id of the view for which to activate its adjacent view.
   * @param options - Controls view activation.
   *        @property activatePart - Controls whether to activate the part. If not set, defaults to `false`.
   * @return a copy of this layout with the adjacent view activated.
   */
  public activateAdjacentView(id: string, options?: {activatePart?: boolean}): ɵWorkbenchLayout {
    const workingCopy = this.workingCopy();
    workingCopy.views({id}).forEach(view => workingCopy.__activateAdjacentView(view, options));
    return workingCopy;
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
  public renameView(id: ViewId, newViewId: ViewId, options?: {grid?: keyof Grids}): ɵWorkbenchLayout {
    const workingCopy = this.workingCopy();
    workingCopy.__renameView(workingCopy.view({by: {viewId: id}}), newViewId, {grid: options?.grid});
    return workingCopy;
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
    const workingCopy = this.workingCopy();
    workingCopy.__setSplitRatio(nodeId, ratio);
    return workingCopy;
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
   * Computes the next available view id.
   */
  public computeNextViewId(): ViewId {
    return WorkbenchLayouts.computeNextViewId(this.views().map(view => view.id));
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __addPart(id: string, relativeTo: ReferenceElement, options?: {activate?: boolean; structural?: boolean}): void {
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
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __removePart(id: string): void {
    const part = this.part({by: {partId: id}});
    const grid = this.grid({by: {element: part}});
    const gridName = this._gridNames.find(gridName => this._grids[gridName] === grid);

    // The last part is never removed.
    const parts = this.parts({grid: gridName});
    if (parts.length === 1) {
      return;
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

    // Remove outlets and states of views contained in the part.
    part.views.forEach(view => {
      this._viewOutlets.delete(view.id);
      this._viewStates.delete(view.id);
    });

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
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __addView(view: MView, options: {partId: string; position?: number | 'start' | 'end' | 'before-active-view' | 'after-active-view'; activateView?: boolean; activatePart?: boolean; cssClass?: string | string[]}): void {
    if (this.hasView(view.id)) {
      throw Error(`[IllegalArgumentError] View id must be unique. The layout already contains a view with the id '${view.id}'.`);
    }

    const part = this.part({by: {partId: options.partId}});
    const position = coercePosition(options.position ?? 'end', part);
    part.views.splice(position, 0, view);

    if (options.activateView) {
      this.__activateView(view);
    }
    if (options.activatePart) {
      this.__activatePart(options.partId);
    }
    if (options.cssClass) {
      view.cssClass = Arrays.coerce(options.cssClass);
    }
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __navigateView(view: MView, commands: Commands, extras?: {outlet?: string; relativeTo?: ActivatedRoute | null; state?: ViewState; cssClass?: string | string[]}): void {
    // TODO [WB-LAYOUT] Consider throwing an error if outlet is not set for empty commands
    // TODO [WB-LAYOUT] Consider throwing an error if outlet is set for non-empty commands
    // TODO [WB-LAYOUT] Navigating for the second time (with empty path) is outlet cleared?
    const urlSegments = runInInjectionContext(this._injector, () => RouterUtils.commandsToSegments(commands, {relativeTo: extras?.relativeTo}));
    if (urlSegments.length) {
      this._viewOutlets.set(view.id, urlSegments);
    }
    else {
      this._viewOutlets.delete(view.id);
    }

    if (extras?.state) {
      this._viewStates.set(view.id, extras.state);
    }
    else {
      this._viewStates.delete(view.id);
    }

    view.navigation = {
      outlet: extras?.outlet ?? PRIMARY_OUTLET,
      cssClass: extras?.cssClass ? Arrays.coerce(extras.cssClass) : undefined,
    };
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __moveView(view: MView, targetPartId: string, options?: {position?: number | 'start' | 'end' | 'before-active-view' | 'after-active-view'; activateView?: boolean; activatePart?: boolean}): void {
    const sourcePart = this.part({by: {viewId: view.id}});
    const targetPart = this.part({by: {partId: targetPartId}});

    // Move the view.
    if (sourcePart !== targetPart) {
      // TODO [WB-LAYOUT] Consider passing object to removeView to not remove outlet. Consequently, perform navigation after adding the view
      const urlSegments = this._viewOutlets.get(view.id);
      const state = this._viewStates.get(view.id);
      this.__removeView(view);
      this.__addView(view, {partId: targetPartId, position: options?.position});
      urlSegments && this._viewOutlets.set(view.id, urlSegments);
      state && this._viewStates.set(view.id, state);
    }
    else if (options?.position !== undefined) {
      const position = coercePosition(options.position, targetPart);
      const referenceView: MView | undefined = sourcePart.views.at(position);
      sourcePart.views.splice(sourcePart.views.indexOf(view), 1);
      sourcePart.views.splice(referenceView ? sourcePart.views.indexOf(referenceView) : sourcePart.views.length, 0, view);

    }

    // Activate view and part.
    if (options?.activatePart) {
      this.__activatePart(targetPartId);
    }
    if (options?.activateView) {
      this.__activateView(view);
    }
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __removeView(view: MView, options?: {grid?: keyof Grids}): void {
    const part = this.part({by: {viewId: view.id}, grid: options?.grid});

    // Remove the view.
    part.views.splice(part.views.indexOf(view), 1);
    this._viewOutlets.delete(view.id);
    this._viewStates.delete(view.id);

    // Activate the last used view if this view was active.
    if (part.activeViewId === view.id) {
      part.activeViewId = part.views
        .map(view => view.id)
        .sort((viewId1, viewId2) => {
          const activationInstantView1 = this._viewActivationInstantProvider.getActivationInstant(viewId1);
          const activationInstantView2 = this._viewActivationInstantProvider.getActivationInstant(viewId2);
          return activationInstantView2 - activationInstantView1;
        }).at(0);
    }

    // Remove the part if this is the last view of the part and not a structural part.
    if (part.views.length === 0 && !part.structural) {
      this.__removePart(part.id);
    }
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __activateView(view: MView, options?: {activatePart?: boolean}): void {
    // Activate the view.
    const part = this.part({by: {viewId: view.id}});
    part.activeViewId = view.id;

    // Activate the part.
    if (options?.activatePart) {
      this.__activatePart(part.id);
    }
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __activateAdjacentView(view: MView, options?: {activatePart?: boolean}): void {
    const part = this.part({by: {viewId: view.id}});
    const viewIndex = part.views.indexOf(view);
    part.activeViewId = (part.views[viewIndex - 1] || part.views[viewIndex + 1])?.id; // is `undefined` if it is the last view of the part

    // Activate the part.
    if (options?.activatePart) {
      this.__activatePart(part.id);
    }
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __setSplitRatio(nodeId: string, ratio: number): void {
    if (ratio < 0 || ratio > 1) {
      throw Error(`[IllegalArgumentError] Ratio for node '${nodeId}' must be in the closed interval [0,1], but was '${ratio}'.`);
    }
    this.node({by: {nodeId}}).ratio = ratio;
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __activatePart(id: string): void {
    const part = this.part({by: {partId: id}});
    this.grid({by: {element: part}}).activePartId = id;
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __toggleMaximized(): void {
    this._maximized = !this._maximized;
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __renameView(view: MView, newViewId: ViewId, options?: {grid?: keyof Grids}): void {
    if (this.hasView(newViewId)) {
      throw Error(`[IllegalArgumentError] View id must be unique. The layout already contains a view with the id '${newViewId}'.`);
    }

    const part = this.part({by: {viewId: view.id}, grid: options?.grid});

    if (this._viewOutlets.has(view.id)) {
      this._viewOutlets.set(newViewId, this._viewOutlets.get(view.id)!);
      this._viewOutlets.delete(view.id);
    }
    if (this._viewStates.has(view.id)) {
      this._viewStates.set(newViewId, this._viewStates.get(view.id)!);
      this._viewStates.delete(view.id);
    }

    if (part.activeViewId === view.id) {
      part.activeViewId = newViewId;
    }

    view.id = newViewId;
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
      viewOutlets: Object.fromEntries(this._viewOutlets),
      viewStates: Object.fromEntries(this._viewStates),
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
 * Returns the position if a number, or computes it from the given literal otherwise.
 */
function coercePosition(position: number | 'start' | 'end' | 'before-active-view' | 'after-active-view', part: MPart): number {
  switch (position) {
    case 'start': {
      return 0;
    }
    case 'end': {
      return part.views.length;
    }
    case 'before-active-view': {
      const activeViewIndex = part.views.findIndex(view => view.id === part.activeViewId);
      return (activeViewIndex > -1 ? activeViewIndex : part.views.length);
    }
    case 'after-active-view': {
      const activeViewIndex = part.views.findIndex(view => view.id === part.activeViewId);
      return (activeViewIndex > -1 ? activeViewIndex + 1 : part.views.length);
    }
    default: {
      return position;
    }
  }
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

/**
 * Creates a predicate to match a view by its primary or alternative id, depending on the type of the passed id.
 */
function matchViewById(id: string): Predicate<MView> {
  if (RouterUtils.isPrimaryViewId(id)) {
    return view => view.id === id;
  }
  else {
    return view => view.alternativeId === id;
  }
}
