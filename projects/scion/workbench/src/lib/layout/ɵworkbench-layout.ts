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
import {UID} from '../common/uid.util';
import {MAIN_AREA, MAIN_AREA_ALTERNATIVE_ID, ReferencePart, WorkbenchLayout} from './workbench-layout';
import {GridSerializationFlags, WorkbenchLayoutSerializer} from './workench-layout-serializer.service';
import {WORKBENCH_VIEW_REGISTRY} from '../view/workbench-view.registry';
import {WORKBENCH_PART_REGISTRY} from '../part/workbench-part.registry';
import {inject, Injectable, InjectionToken, Injector, runInInjectionContext} from '@angular/core';
import {Routing} from '../routing/routing.util';
import {Commands, NavigationData, NavigationState, NavigationStates, Outlets} from '../routing/routing.model';
import {ActivatedRoute, UrlSegment} from '@angular/router';
import {ViewId} from '../view/workbench-view.model';
import {Arrays} from '@scion/toolkit/util';
import {UrlSegmentMatcher} from '../routing/url-segment-matcher';
import {Objects} from '../common/objects.util';
import {WorkbenchLayouts} from './workbench-layouts.util';
import {Logger} from '../logging';
import {PART_ID_PREFIX, WorkbenchOutlet} from '../workbench.constants';
import {PartId} from '../part/workbench-part.model';

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
  private readonly _outlets: Map<WorkbenchOutlet, UrlSegment[]>;
  private readonly _navigationStates: Map<WorkbenchOutlet, NavigationState>;
  private readonly _gridNames: Array<keyof Grids>;
  private readonly _partActivationInstantProvider = inject(PartActivationInstantProvider);
  private readonly _viewActivationInstantProvider = inject(ViewActivationInstantProvider);
  private readonly _serializer = inject(WorkbenchLayoutSerializer);
  private readonly _injector = inject(Injector);

  private _maximized: boolean;

  /** Identifies the perspective of this layout, if any. */
  public readonly perspectiveId: string | undefined;

  /** @internal **/
  constructor(config: {workbenchGrid?: string | MPartGrid | null; mainAreaGrid?: string | MPartGrid | null; perspectiveId?: string; outlets?: string | Outlets | null; navigationStates?: NavigationStates | null; maximized?: boolean}) {
    this._grids = {
      workbench: coerceMPartGrid(config.workbenchGrid, {default: createDefaultWorkbenchGrid}),
    };
    if (this.hasPart(MAIN_AREA, {grid: 'workbench'})) {
      this._grids.mainArea = coerceMPartGrid(config.mainAreaGrid, {default: createInitialMainAreaGrid});
    }
    this._gridNames = Objects.keys(this._grids);
    this._maximized = config.maximized ?? false;
    this._outlets = new Map(Objects.entries(coerceOutlets(config.outlets)));
    this._navigationStates = new Map(Objects.entries(config.navigationStates ?? {}));
    this.parts().forEach(part => assertType(part, {toBeOneOf: [MTreeNode, MPart]}));
    this.perspectiveId = config.perspectiveId;
  }

  /**
   * Reference to the main workbench grid.
   */
  public get workbenchGrid(): Readonly<ɵMPartGrid> {
    return this._grids.workbench;
  }

  /**
   * Reference to the main area grid, if any.
   *
   * The main area grid is a sub-grid included by the {@link MAIN_AREA} part. It defines the arrangement of parts in the main area.
   */
  public get mainAreaGrid(): Readonly<ɵMPartGrid> | null {
    return this._grids.mainArea ?? null;
  }

  /**
   * Tests if given part is contained in the specified grid.
   */
  public hasPart(id: string, options?: {grid?: keyof Grids}): boolean {
    return this.parts({id, grid: options?.grid}).length > 0;
  }

  /**
   * Tests if given view is contained in the specified grid.
   */
  public hasView(id: string, options?: {grid?: keyof Grids}): boolean {
    return this.views({id, grid: options?.grid}).length > 0;
  }

  /**
   * Finds the URL of outlets based on the specified filter.
   *
   * @param findBy - Defines the search scope.
   * @param findBy.grid - Searches outlets in the specified grid.
   * @return outlets matching the filter criteria.
   */
  public outlets(findBy?: {grid?: keyof Grids}): Outlets {
    const partOutlets = this.parts({grid: findBy?.grid}).filter(part => this._outlets.has(part.id)).map<[PartId, UrlSegment[]]>(part => [part.id, this._outlets.get(part.id)!]);
    const viewOutlets = this.views({grid: findBy?.grid}).filter(view => this._outlets.has(view.id)).map<[ViewId, UrlSegment[]]>(view => [view.id, this._outlets.get(view.id)!]);
    return Object.fromEntries([...partOutlets, ...viewOutlets]);
  }

  /**
   * Finds navigational state based on the specified filter.
   *
   * @param findBy - Defines the search scope.
   * @param findBy.grid - Searches outlets in the specified grid.
   * @return state matching the filter criteria.
   */
  public navigationStates(findBy?: {grid?: keyof Grids}): NavigationStates {
    const partStates = this.parts({grid: findBy?.grid}).filter(part => this._navigationStates.has(part.id)).map<[PartId, NavigationState]>(part => [part.id, this._navigationStates.get(part.id)!]);
    const viewStates = this.views({grid: findBy?.grid}).filter(view => this._navigationStates.has(view.id)).map<[ViewId, NavigationState]>(view => [view.id, this._navigationStates.get(view.id)!]);
    return Object.fromEntries([...partStates, ...viewStates]);
  }

  /**
   * Finds the navigational state of specified outlet.
   */
  public navigationState(findBy: {outlet: WorkbenchOutlet}): NavigationState {
    return this._navigationStates.get(findBy.outlet) ?? {};
  }

  /**
   * Finds the URL of specified outlet.
   */
  public urlSegments(findBy: {outlet: WorkbenchOutlet}): UrlSegment[] {
    return this._outlets.get(findBy.outlet) ?? [];
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
   * Finds parts based on the specified filter.
   *
   * @param findBy - Defines the search scope.
   * @param findBy.id - Searches for parts with the specified id.
   * @param findBy.viewId - Searches for parts that contain the specified view.
   * @param findBy.grid - Searches for parts contained in the specified grid.
   * @param options - Controls the search.
   * @param options.throwIfEmpty - Controls to error if no part is found.
   * @param options.throwIfMulti - Controls to error if multiple parts are found.
   * @return parts matching the filter criteria.
   */
  public parts(findBy?: {id?: string; viewId?: string; grid?: keyof Grids}, options?: {throwIfEmpty?: (() => Error) | true; throwIfMulti?: (() => Error) | true}): readonly MPart[] {
    const parts = this.findTreeElements((element: MTreeNode | MPart): element is MPart => {
      if (!(element instanceof MPart)) {
        return false;
      }
      if (findBy?.id !== undefined && !matchesPartId(findBy.id, element)) {
        return false;
      }
      if (findBy?.viewId !== undefined && !element.views.some(view => matchesViewId(findBy.viewId!, view))) {
        return false;
      }
      return true;
    }, {grid: findBy?.grid});

    if (options?.throwIfEmpty && !parts.length) {
      throw typeof options.throwIfEmpty === 'function' ? options.throwIfEmpty() : Error(`[NullPartError] No matching part found: [${stringifyFilter(findBy ?? {})}]`);
    }
    if (options?.throwIfMulti && parts.length > 1) {
      throw typeof options.throwIfMulti === 'function' ? options.throwIfMulti() : Error(`[MultiPartError] Multiple parts found: [${stringifyFilter(findBy ?? {})}]`);
    }
    return parts;
  }

  /**
   * Finds a part based on the specified filter. If not found, by default, throws an error unless setting the `orElseNull` option.
   *
   * @param findBy - Defines the search scope.
   * @param findBy.partId - Searches for a part with the specified id.
   * @param findBy.viewId - Searches for a part that contains the specified view.
   * @param findBy.grid - Searches for a part contained in the specified grid.
   * @param options - Controls the search.
   * @param options.orElse - Controls to return `null` instead of throwing an error if no part is found.
   * @return part matching the filter criteria.
   */
  public part(findBy: {partId?: PartId; viewId?: string; grid?: keyof Grids}): MPart;
  public part(findBy: {partId?: PartId; viewId?: string; grid?: keyof Grids}, options: {orElse: null}): MPart | null;
  public part(findBy: {partId?: PartId; viewId?: string; grid?: keyof Grids}, options?: {orElse: null}): MPart | null {
    if (!findBy.partId && !findBy.viewId) {
      throw Error(`[PartFindError] Missing required argument. Specify either 'partId' or 'viewId'.`);
    }

    const part = this.parts({id: findBy.partId, viewId: findBy.viewId, grid: findBy.grid}).at(0);
    if (!part && !options) {
      throw Error(`[NullPartError] No matching part found: [${stringifyFilter(findBy)}]`);
    }
    return part ?? null;
  }

  /**
   * @inheritDoc
   *
   * @param id - @inheritDoc
   * @param relativeTo - @inheritDoc
   * @param options - @inheritDoc
   * @param options.activate - @inheritDoc
   * @param options.structural - Specifies if this is a structural part. A structural part will not be removed when removing its last view. Defaults to `true`.
   */
  public addPart(id: string | MAIN_AREA, relativeTo: ReferenceElement, options?: {activate?: boolean; structural?: boolean}): ɵWorkbenchLayout {
    const partId = isPartId(id) ? id : (id === MAIN_AREA_ALTERNATIVE_ID ? MAIN_AREA : WorkbenchLayouts.computePartId());
    const alternativeId = isPartId(id) ? (id === MAIN_AREA ? MAIN_AREA_ALTERNATIVE_ID : undefined) : id;

    const workingCopy = this.workingCopy();
    workingCopy.__addPart(partId, relativeTo, {...options, alternativeId});
    return workingCopy;
  }

  /** @inheritDoc */
  public removePart(id: string): ɵWorkbenchLayout {
    const workingCopy = this.workingCopy();
    workingCopy.parts({id}, {throwIfEmpty: true}).forEach(part => workingCopy.__removePart(part));
    return workingCopy;
  }

  /** @inheritDoc */
  public navigatePart(id: string, commands: Commands, extras?: {hint?: string; relativeTo?: ActivatedRoute | null; data?: NavigationData; state?: NavigationState; cssClass?: string | string[]}): ɵWorkbenchLayout {
    const workingCopy = this.workingCopy();
    workingCopy.parts({id}, {throwIfEmpty: true}).forEach(part => workingCopy.__navigatePart(part, commands, extras));
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
    return this.part({partId: grid.activePartId, grid: find.grid});
  }

  /** @inheritDoc */
  public activatePart(id: string): ɵWorkbenchLayout {
    const workingCopy = this.workingCopy();
    workingCopy.parts({id}, {throwIfEmpty: true}).forEach(part => workingCopy.__activatePart(part));
    return workingCopy;
  }

  /**
   * Finds a view based on the specified filter. If not found, by default, throws an error unless setting the `orElseNull` option.
   *
   * @param findBy - Defines the search scope.
   * @param findBy.viewId - Searches for a view with the specified id.
   * @param options - Controls the search.
   * @param options.orElse - Controls to return `null` instead of throwing an error if no view is found.
   * @return view matching the filter criteria.
   */
  public view(findBy: {viewId: ViewId}): MView;
  public view(findBy: {viewId: ViewId}, options: {orElse: null}): MView | null;
  public view(findBy: {viewId: ViewId}, options?: {orElse: null}): MView | null {
    const view = this.views({id: findBy.viewId}).at(0);
    if (!view && !options) {
      throw Error(`[NullViewError] No view found with id '${findBy.viewId}'.`);
    }
    return view ?? null;
  }

  /**
   * Finds views based on the specified filter.
   *
   * @param findBy - Defines the search scope.
   * @param findBy.id - Searches for views with the specified id.
   * @param findBy.partId - Searches for views contained in the specified part.
   * @param findBy.segments - Searches for views navigated to the specified URL.
   * @param findBy.navigationHint - Searches for views navigated with given hint. Passing `null` searches for views navigated without a hint.
   * @param findBy.markedForRemoval - Searches for views marked (or not marked) for removal.
   * @param findBy.grid - Searches for views contained in the specified grid.
   * @param options - Controls the search.
   * @param options.throwIfEmpty - Controls to error if no view is found.
   * @param options.throwIfMulti - Controls to error if multiple views are found.
   * @return views matching the filter criteria.
   */
  public views(findBy?: {id?: string; partId?: string; segments?: UrlSegmentMatcher; navigationHint?: string | null; markedForRemoval?: boolean; grid?: keyof Grids}, options?: {throwIfEmpty?: (() => Error) | true; throwIfMulti?: (() => Error) | true}): readonly MView[] {
    const views = this.parts({id: findBy?.partId, grid: findBy?.grid})
      .flatMap(part => part.views)
      .filter(view => {
        if (findBy?.id !== undefined && !matchesViewId(findBy.id, view)) {
          return false;
        }
        if (findBy?.segments && !findBy.segments.matches(this.urlSegments({outlet: view.id}))) {
          return false;
        }
        if (findBy?.navigationHint !== undefined && findBy.navigationHint !== (view.navigation?.hint ?? null)) {
          return false;
        }
        if (findBy?.markedForRemoval !== undefined && findBy.markedForRemoval !== (view.markedForRemoval ?? false)) {
          return false;
        }
        return true;
      });

    if (options?.throwIfEmpty && !views.length) {
      throw typeof options.throwIfEmpty === 'function' ? options.throwIfEmpty() : Error(`[NullViewError] No matching view found: [${stringifyFilter(findBy ?? {})}]`);
    }
    if (options?.throwIfMulti && views.length > 1) {
      throw typeof options.throwIfMulti === 'function' ? options.throwIfMulti() : Error(`[MultiViewError] Multiple views found: [${stringifyFilter(findBy ?? {})}]`);
    }
    return views;
  }

  /** @inheritDoc */
  public addView(id: string, options: {partId: string; position?: number | 'start' | 'end' | 'before-active-view' | 'after-active-view'; activateView?: boolean; activatePart?: boolean; cssClass?: string | string[]}): ɵWorkbenchLayout {
    const workingCopy = this.workingCopy();
    if (isViewId(id)) {
      workingCopy.__addView({id}, options);
    }
    else {
      workingCopy.__addView({id: this.computeNextViewId(), alternativeId: id}, options);
    }
    return workingCopy;
  }

  /** @inheritDoc */
  public navigateView(id: string, commands: Commands, extras?: {hint?: string; relativeTo?: ActivatedRoute | null; data?: NavigationData; state?: NavigationState; cssClass?: string | string[]}): ɵWorkbenchLayout {
    const workingCopy = this.workingCopy();
    workingCopy.views({id}, {throwIfEmpty: true}).forEach(view => workingCopy.__navigateView(view, commands, extras));
    return workingCopy;
  }

  /**
   * @inheritDoc
   *
   * @param id - @inheritDoc
   * @param options - Controls removal of the view.
   * @param options.force - Specifies whether to force remove the view, bypassing `CanClose` guard.
   */
  public removeView(id: string, options?: {force?: boolean}): ɵWorkbenchLayout {
    const workingCopy = this.workingCopy();
    workingCopy.views({id}, {throwIfEmpty: true}).forEach(view => workingCopy.__removeView(view, {force: options?.force}));
    return workingCopy;
  }

  /** @inheritDoc */
  public moveView(id: string, targetPartId: string, options?: {position?: number | 'start' | 'end' | 'before-active-view' | 'after-active-view'; activateView?: boolean; activatePart?: boolean}): ɵWorkbenchLayout {
    const workingCopy = this.workingCopy();
    workingCopy.views({id}, {throwIfEmpty: true}).forEach(view => workingCopy.__moveView(view, targetPartId, options));
    return workingCopy;
  }

  /** @inheritDoc */
  public activateView(id: string, options?: {activatePart?: boolean}): ɵWorkbenchLayout {
    const workingCopy = this.workingCopy();
    workingCopy.views({id}, {throwIfEmpty: true}).forEach(view => workingCopy.__activateView(view, options));
    return workingCopy;
  }

  /**
   * Activates the preceding view if it exists, or the subsequent view otherwise.
   *
   * @param id - The id of the view to activate its adjacent view.
   * @param options - Controls view activation.
   * @param options.activatePart - Controls if to activate the part. Defaults to `false`.
   * @return a copy of this layout with the adjacent view activated.
   */
  public activateAdjacentView(id: string, options?: {activatePart?: boolean}): ɵWorkbenchLayout {
    const workingCopy = this.workingCopy();
    workingCopy.views({id}, {throwIfEmpty: true}).forEach(view => workingCopy.__activateAdjacentView(view, options));
    return workingCopy;
  }

  /**
   * Renames a view.
   *
   * @param id - The id of the view which to rename.
   * @param newViewId - The new identity of the view.
   * @return a copy of this layout with the view renamed.
   */
  public renameView(id: ViewId, newViewId: ViewId): ɵWorkbenchLayout {
    const workingCopy = this.workingCopy();
    workingCopy.__renameView(workingCopy.view({viewId: id}), newViewId);
    return workingCopy;
  }

  /** @inheritDoc */
  public modify(modifyFn: (layout: ɵWorkbenchLayout) => ɵWorkbenchLayout): ɵWorkbenchLayout {
    return modifyFn(this.workingCopy());
  }

  /**
   * Sets the split ratio for the two children of a {@link MTreeNode}.
   *
   * @param nodeId - The id of the node to set the split ratio for.
   * @param ratio - The proportional size between the two children, expressed as closed interval [0,1].
   *                Example: To give 1/3 of the space to the first child, set the ratio to `0.3`.
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
  public serialize(flags?: GridSerializationFlags): SerializedWorkbenchLayout {
    const root = this.mainAreaGrid?.root;
    const isMainAreaEmpty = root instanceof MPart && !root.views.length && !root.navigation && !root.structural;
    const workingCopy = this.workingCopy();

    // Check if to assign each part a stable id based on its position in the grid.
    if (flags?.assignStablePartIdentifier) {
      workingCopy.__assignStablePartIdentifier();
    }

    return {
      workbenchGrid: this._serializer.serializeGrid(workingCopy.workbenchGrid, flags),
      mainAreaGrid: isMainAreaEmpty ? null : this._serializer.serializeGrid(workingCopy.mainAreaGrid, flags),
      workbenchOutlets: this._serializer.serializeOutlets(workingCopy.outlets({grid: 'workbench'})),
      mainAreaOutlets: this._serializer.serializeOutlets(workingCopy.outlets({grid: 'mainArea'})),
    };
  }

  /**
   * Tests if the current layout is equal to another layout based on provided flags.
   */
  public equals(other: ɵWorkbenchLayout, flags?: GridSerializationFlags): boolean {
    if (this === other) {
      return true;
    }

    const layout1 = this.serialize(flags);
    const layout2 = other.serialize(flags);

    return (
      layout1.workbenchGrid === layout2.workbenchGrid &&
      layout1.mainAreaGrid === layout2.mainAreaGrid &&
      layout1.mainAreaOutlets === layout2.mainAreaOutlets &&
      layout1.workbenchOutlets === layout2.workbenchOutlets &&
      this.perspectiveId === other.perspectiveId &&
      this.maximized === other.maximized
      // Navigational state is not tested for equality as it is set through view navigation, resulting in a new navigation id when modified.
    );
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
  private __addPart(id: PartId, relativeTo: ReferenceElement, options?: {alternativeId?: string; activate?: boolean; structural?: boolean}): void {
    if (this.hasPart(id)) {
      throw Error(`[PartAddError] Part id must be unique. The layout already contains a part with the id '${id}'.`);
    }

    const newPart = new MPart({id, alternativeId: options?.alternativeId, structural: options?.structural ?? true, views: []});

    // Find the reference element, if specified, or use the layout root as reference otherwise.
    const referenceElement = relativeTo.relativeTo ? this.findTreeElement({id: relativeTo.relativeTo}) : this.workbenchGrid.root;
    const addBefore = relativeTo.align === 'left' || relativeTo.align === 'top';
    const ratio = relativeTo.ratio ?? .5;

    // Create a new tree node.
    const newTreeNode: MTreeNode = new MTreeNode({
      id: UID.randomUID(),
      child1: addBefore ? newPart : referenceElement,
      child2: addBefore ? referenceElement : newPart,
      direction: relativeTo.align === 'left' || relativeTo.align === 'right' ? 'row' : 'column',
      ratio: addBefore ? ratio : 1 - ratio,
      parent: referenceElement.parent,
    });

    // Add the tree node to the layout.
    if (!referenceElement.parent) {
      this.grid({element: referenceElement}).root = newTreeNode; // top-level node
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
      this.__activatePart(newPart);
    }
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __removePart(part: MPart): void {
    const grid = this.grid({element: part});
    const gridName = this._gridNames.find(gridName => this._grids[gridName] === grid);

    // The last part is never removed.
    const parts = this.parts({grid: gridName});
    if (parts.length === 1) {
      return;
    }

    // Remove the part.
    const parentPart = part.parent!;
    const siblingElement = (parentPart.child1 === part ? parentPart.child2 : parentPart.child1);
    if (!parentPart.parent) {
      grid.root = siblingElement;
      grid.root.parent = undefined;
    }
    else if (parentPart.parent.child1 === part.parent) {
      parentPart.parent.child1 = siblingElement;
    }
    else {
      parentPart.parent.child2 = siblingElement;
    }

    // Remove the part outlet.
    this._outlets.delete(part.id);

    // Remove navigation state.
    this._navigationStates.delete(part.id);

    // Remove outlets and state of views contained in the part.
    part.views.forEach(view => {
      this._outlets.delete(view.id);
      this._navigationStates.delete(view.id);
    });

    // If the removed part was the active part, make the last used part the active part.
    if (grid.activePartId === part.id) {
      const [activePart] = parts
        .filter(mPart => mPart.id !== part.id)
        .sort((part1, part2) => {
          const activationInstantPart1 = this._partActivationInstantProvider.getActivationInstant(part1.id);
          const activationInstantPart2 = this._partActivationInstantProvider.getActivationInstant(part2.id);
          return activationInstantPart2 - activationInstantPart1;
        });
      grid.activePartId = activePart.id;
    }
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __navigatePart(part: MPart, commands: Commands, extras?: {hint?: string; relativeTo?: ActivatedRoute | null; data?: NavigationData; state?: NavigationState; cssClass?: string | string[]}): void {
    if (!commands.length && !extras?.hint && !extras?.relativeTo) {
      throw Error('[NavigateError] Commands, relativeTo or hint must be set.');
    }

    const urlSegments = runInInjectionContext(this._injector, () => Routing.commandsToSegments(commands, {relativeTo: extras?.relativeTo}));
    if (urlSegments.length) {
      this._outlets.set(part.id, urlSegments);
    }
    else {
      this._outlets.delete(part.id);
    }

    if (extras?.state && Objects.keys(extras.state).length) {
      this._navigationStates.set(part.id, extras.state);
    }
    else {
      this._navigationStates.delete(part.id);
    }

    part.navigation = Objects.withoutUndefinedEntries({
      id: UID.randomUID(),
      hint: extras?.hint,
      data: extras?.data,
      cssClass: extras?.cssClass ? Arrays.coerce(extras.cssClass) : undefined,
    } satisfies MPart['navigation']);
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __renamePart(part: MPart, newPartId: PartId): void {
    if (this.hasPart(newPartId)) {
      throw Error(`[PartRenameError] Part id must be unique. The layout already contains a part with the id '${newPartId}'.`);
    }

    if (this._outlets.has(part.id)) {
      this._outlets.set(newPartId, this._outlets.get(part.id)!);
      this._outlets.delete(part.id);
    }
    if (this._navigationStates.has(part.id)) {
      this._navigationStates.set(newPartId, this._navigationStates.get(part.id)!);
      this._navigationStates.delete(part.id);
    }

    const grid = this.grid({element: part});
    if (grid.activePartId === part.id) {
      grid.activePartId = newPartId;
    }

    part.id = newPartId;
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __assignStablePartIdentifier(): void {
    this.parts().forEach((part, index) => this.__renamePart(part, `${PART_ID_PREFIX}${index + 1}`));
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __addView(view: MView, options: {partId: string; position?: number | 'start' | 'end' | 'before-active-view' | 'after-active-view'; activateView?: boolean; activatePart?: boolean; cssClass?: string | string[]}): void {
    if (this.hasView(view.id)) {
      throw Error(`[ViewAddError] View id must be unique. The layout already contains a view with the id '${view.id}'.`);
    }
    const [part] = this.parts({id: options.partId}, {
      throwIfEmpty: () => Error(`[ViewAddError] Cannot add view. No part found with id '${options.partId}'.`),
      throwIfMulti: () => Error(`[ViewAddError] Cannot add view to multiple parts. Multiple parts found with id '${options.partId}'.`),
    });

    const position = coercePosition(options.position ?? 'end', part);
    part.views.splice(position, 0, view);

    if (options.activateView) {
      this.__activateView(view);
    }
    if (options.activatePart) {
      this.__activatePart(part);
    }
    if (options.cssClass) {
      view.cssClass = Arrays.coerce(options.cssClass);
    }
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __navigateView(view: MView, commands: Commands, extras?: {hint?: string; relativeTo?: ActivatedRoute | null; data?: NavigationData; state?: NavigationState; cssClass?: string | string[]}): void {
    if (!commands.length && !extras?.hint && !extras?.relativeTo) {
      throw Error('[NavigateError] Commands, relativeTo or hint must be set.');
    }

    const urlSegments = runInInjectionContext(this._injector, () => Routing.commandsToSegments(commands, {relativeTo: extras?.relativeTo}));
    if (urlSegments.length) {
      this._outlets.set(view.id, urlSegments);
    }
    else {
      this._outlets.delete(view.id);
    }

    if (extras?.state && Objects.keys(extras.state).length) {
      this._navigationStates.set(view.id, extras.state);
    }
    else {
      this._navigationStates.delete(view.id);
    }

    view.navigation = Objects.withoutUndefinedEntries({
      id: UID.randomUID(),
      hint: extras?.hint,
      data: extras?.data,
      cssClass: extras?.cssClass ? Arrays.coerce(extras.cssClass) : undefined,
    } satisfies MView['navigation']);
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __moveView(view: MView, targetPartId: string, options?: {position?: number | 'start' | 'end' | 'before-active-view' | 'after-active-view'; activateView?: boolean; activatePart?: boolean}): void {
    const sourcePart = this.part({viewId: view.id});
    const [targetPart] = this.parts({id: targetPartId}, {
      throwIfEmpty: () => Error(`[ViewMoveError] Cannot move view. No part found with id '${targetPartId}'.`),
      throwIfMulti: () => Error(`[ViewMoveError] Cannot move view. Multiple parts found with id '${targetPartId}'.`),
    });

    // Move the view.
    if (sourcePart !== targetPart) {
      this.__removeView(view, {removeOutlet: false, removeNavigationState: false, force: true});
      this.__addView(view, {partId: targetPartId, position: options?.position});
    }
    else if (options?.position !== undefined) {
      const position = coercePosition(options.position, targetPart);
      const referenceView: MView | undefined = sourcePart.views.at(position);
      sourcePart.views.splice(sourcePart.views.indexOf(view), 1);
      sourcePart.views.splice(referenceView ? sourcePart.views.indexOf(referenceView) : sourcePart.views.length, 0, view);
    }

    // Activate view and part.
    if (options?.activatePart) {
      this.__activatePart(targetPart);
    }
    if (options?.activateView) {
      this.__activateView(view);
    }
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __removeView(view: MView, options?: {removeOutlet?: false; removeNavigationState?: false; force?: boolean}): void {
    if (!options?.force) {
      view.markedForRemoval = true;
      return;
    }

    const part = this.part({viewId: view.id});

    // Remove view.
    part.views.splice(part.views.indexOf(view), 1);

    // Remove outlet.
    if (options.removeOutlet ?? true) {
      this._outlets.delete(view.id);
    }

    // Remove navigation state.
    if (options.removeNavigationState ?? true) {
      this._navigationStates.delete(view.id);
    }

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

    // Remove the part when removing its last view, but only if the part has no navigation and is not a structural part.
    if (!part.views.length && !part.navigation && !part.structural) {
      this.__removePart(part);
    }
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __activateView(view: MView, options?: {activatePart?: boolean}): void {
    // Activate the view.
    const part = this.part({viewId: view.id});
    part.activeViewId = view.id;

    // Activate the part.
    if (options?.activatePart) {
      this.__activatePart(part);
    }
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __activateAdjacentView(view: MView, options?: {activatePart?: boolean}): void {
    const part = this.part({viewId: view.id});
    const viewIndex = part.views.indexOf(view);
    part.activeViewId = ((part.views[viewIndex - 1] ?? part.views[viewIndex + 1]) as MView | undefined)?.id; // is `undefined` if it is the last view of the part

    // Activate the part.
    if (options?.activatePart) {
      this.__activatePart(part);
    }
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __setSplitRatio(nodeId: string, ratio: number): void {
    if (ratio < 0 || ratio > 1) {
      throw Error(`[LayoutModifyError] Ratio for node '${nodeId}' must be in the closed interval [0,1], but was '${ratio}'.`);
    }
    this.findTreeElement<MTreeNode>({id: nodeId}).ratio = ratio;
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __activatePart(part: MPart): void {
    this.grid({element: part}).activePartId = part.id;
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
  private __renameView(view: MView, newViewId: ViewId): void {
    if (this.hasView(newViewId)) {
      throw Error(`[ViewRenameError] View id must be unique. The layout already contains a view with the id '${newViewId}'.`);
    }

    const part = this.part({viewId: view.id});

    if (this._outlets.has(view.id)) {
      this._outlets.set(newViewId, this._outlets.get(view.id)!);
      this._outlets.delete(view.id);
    }
    if (this._navigationStates.has(view.id)) {
      this._navigationStates.set(newViewId, this._navigationStates.get(view.id)!);
      this._navigationStates.delete(view.id);
    }

    if (part.activeViewId === view.id) {
      part.activeViewId = newViewId;
    }

    view.id = newViewId;
  }

  /**
   * Finds a grid based on the specified filter. If not found, throws an error.
   *
   * @param findBy - Defines the search scope.
   * @param findBy.element - Searches for a grid that contains the specified element.
   * @return Grid matching the filter criteria.
   */
  private grid(findBy: {element: MPart | MTreeNode}): MPartGrid {
    const gridName = this._gridNames.find(gridName => {
      return this.findTreeElements((element: MTreeNode | MPart): element is MPart | MTreeNode => element === findBy.element, {findFirst: true, grid: gridName}).length > 0;
    });

    if (!gridName) {
      throw Error(`[NullGridError] No grid found that contains the ${findBy.element instanceof MPart ? 'part' : 'node'} '${findBy.element.id}'".`);
    }

    return this._grids[gridName]!;
  }

  /**
   * Traverses the tree to find an element that matches the given predicate.
   *
   * @param findBy - Defines the search scope.
   * @param findBy.id - Searches for an element with the specified id.
   * @return Element matching the filter criteria.
   */
  private findTreeElement<T extends MTreeNode | MPart>(findBy: {id: string}): T {
    const element = this.findTreeElements((element: MTreeNode | MPart): element is T => {
      if (element instanceof MPart) {
        return matchesPartId(findBy.id, element);
      }
      return element.id === findBy.id;
    }, {findFirst: true}).at(0);

    if (!element) {
      throw Error(`[NullElementError] No element found with id '${findBy.id}'.`);
    }
    return element;
  }

  /**
   * Traverses the tree to find elements that match the given predicate.
   *
   * @param predicateFn - Predicate function to match.
   * @param options - Defines search scope and options.
   * @param options.findFirst - If specified, stops traversing on first match. If not set, defaults to `false`.
   * @param options.grid - Searches for an element contained in the specified grid.
   * @return Elements matching the filter criteria.
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
      for (const grid of Objects.values(this._grids)) {
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
      workbenchGrid: this._serializer.serializeGrid(this.workbenchGrid),
      mainAreaGrid: this._serializer.serializeGrid(this._grids.mainArea),
      perspectiveId: this.perspectiveId,
      outlets: Object.fromEntries(this._outlets),
      navigationStates: Object.fromEntries(this._navigationStates),
      maximized: this._maximized,
    }));
  }
}

/**
 * Creates a default workbench grid with a main area.
 */
function createDefaultWorkbenchGrid(): MPartGrid {
  return {
    root: new MPart({id: MAIN_AREA, alternativeId: MAIN_AREA_ALTERNATIVE_ID, structural: true, views: []}),
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
    root: new MPart({id: inject(MAIN_AREA_INITIAL_PART_ID), structural: false, views: []}),
    activePartId: inject(MAIN_AREA_INITIAL_PART_ID),
  };
}

/**
 * Coerces {@link MPartGrid}, applying necessary migrations if the serialized grid is outdated.
 */
function coerceMPartGrid(grid: string | MPartGrid | null | undefined, options: {default: () => MPartGrid}): ɵMPartGrid {
  grid ??= options.default();

  if (typeof grid === 'object') {
    return grid;
  }

  try {
    return inject(WorkbenchLayoutSerializer).deserializeGrid(grid);
  }
  catch (error) {
    inject(Logger).error('[SerializeError] Failed to deserialize workbench layout. Please clear your browser storage and reload the application.', error);
    return {...options.default(), migrated: true};
  }
}

/**
 * Coerces {@link Outlets}, applying necessary migrations if the serialized outlets are outdated.
 */
function coerceOutlets(outlets: string | Outlets | null | undefined): Outlets {
  if (!outlets) {
    return {};
  }

  if (typeof outlets === 'object') {
    return outlets;
  }

  try {
    return inject(WorkbenchLayoutSerializer).deserializeOutlets(outlets);
  }
  catch (error) {
    inject(Logger).error('[SerializeError] Failed to deserialize outlets. Please clear your browser storage and reload the application.', error);
    return {};
  }
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
 *
 * ```ts
 * TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'})
 * ```
 *
 * @docs-private Not public API, intended for internal use only.
 */
export const MAIN_AREA_INITIAL_PART_ID = new InjectionToken<PartId>('MAIN_AREA_INITIAL_PART_ID', {
  providedIn: 'root',
  factory: () => WorkbenchLayouts.computePartId(),
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

  private _partRegistry = inject(WORKBENCH_PART_REGISTRY);

  /**
   * Returns the instant when the specified part was last activated.
   */
  public getActivationInstant(partId: PartId): number {
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

  private _viewRegistry = inject(WORKBENCH_VIEW_REGISTRY);

  /**
   * Returns the instant when the specified view was last activated.
   */
  public getActivationInstant(viewId: ViewId): number {
    return this._viewRegistry.get(viewId, {orElse: null})?.activationInstant ?? 0;
  }
}

/**
 * Matches given view by its primary or alternative id, depending on the type of the passed id.
 */
function matchesViewId(id: ViewId | string, view: MView): boolean {
  if (isViewId(id)) {
    return view.id === id;
  }
  else {
    return view.alternativeId === id;
  }
}

/**
 * Matches given part by its primary or alternative id, depending on the type of the passed id.
 */
function matchesPartId(id: PartId | string, part: MPart): boolean {
  if (isPartId(id)) {
    return part.id === id;
  }
  else {
    return part.alternativeId === id;
  }
}

/**
 * Stringifies the given filter to be used in error messages.
 */
function stringifyFilter(filter: {[property: string]: unknown}): string {
  return Object.entries(filter).map(([key, value]) => `${key}=${value}`).join(', ');
}

/**
 * Tests if the given id matches the format of a view identifier.
 */
function isViewId(viewId: string | undefined | null): viewId is ViewId {
  return Routing.isViewOutlet(viewId);
}

/**
 * Tests if the given id matches the format of a part identifier.
 */
export function isPartId(partId: string | undefined | null): partId is PartId {
  return Routing.isPartOutlet(partId);
}

/**
 * Serialized artifacts of the workbench layout.
 */
export interface SerializedWorkbenchLayout {
  workbenchGrid: string;
  workbenchOutlets: string;
  mainAreaGrid: string | null;
  mainAreaOutlets: string;
}
