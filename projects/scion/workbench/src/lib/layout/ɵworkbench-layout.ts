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
import {UID} from '../common/uid.util';
import {DockingArea, MAIN_AREA, MAIN_AREA_ALTERNATIVE_ID, PartExtras, ReferencePart, WorkbenchLayout} from './workbench-layout';
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
import {WorkbenchLayouts} from './workbench-layouts.util';
import {Logger} from '../logging';
import {ACTIVITY_ID_PREFIX, PART_ID_PREFIX, WorkbenchOutlet} from '../workbench.constants';
import {PartId} from '../part/workbench-part.model';
import {ActivityId, MActivity, MActivityGroup, MActivityLayout} from '../activity/workbench-activity.model';
import {WorkbenchActivityLayoutSerializer} from './workench-activity-layout-serializer.service';
import {Objects} from '../common/objects.util';
import {WorkbenchGrids} from './workbench-grids.model';
import {RequireOne} from '../common/utility-types';

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

  private readonly _grids: WorkbenchGrids;
  private readonly _activityLayout: MActivityLayout;
  private readonly _outlets: Map<WorkbenchOutlet, UrlSegment[]>;
  private readonly _navigationStates: Map<WorkbenchOutlet, NavigationState>;
  private readonly _partActivationInstantProvider = inject(PartActivationInstantProvider);
  private readonly _viewActivationInstantProvider = inject(ViewActivationInstantProvider);
  private readonly _gridSerializer = inject(WorkbenchLayoutSerializer);
  private readonly _activityLayoutSerializer = inject(WorkbenchActivityLayoutSerializer);
  private readonly _injector = inject(Injector);

  /** Identifies the perspective of this layout, if any. */
  public readonly perspectiveId: string | undefined;

  /**
   * Creates a workbench layout based on given config.
   *
   * @see WorkbenchLayoutConstructConfig
   */
  constructor(config?: WorkbenchLayoutConstructConfig) {
    this._grids = {
      main: coerceMPartGrid(config?.grids?.main, {default: createDefaultMainGrid}),
      mainArea: coerceMPartGrid(config?.grids?.mainArea, {default: createDefaultMainAreaGrid}),
      ...WorkbenchLayouts.pickActivityGrids(config?.grids, grid => coerceMPartGrid(grid)),
    };

    this._activityLayout = coerceMActivityLayout(config?.activityLayout, {default: createDefaultActivityLayout});
    this._outlets = new Map(Objects.entries(coerceOutlets(config?.outlets)));
    this._navigationStates = new Map(Objects.entries(config?.navigationStates ?? {}));
    this.perspectiveId = config?.perspectiveId;

    // Delete main area grid if not contained in the main grid.
    if (!this.hasPart(MAIN_AREA, {grid: 'main'})) {
      delete this._grids.mainArea;
    }

    this.assertActivities();
  }

  public get activityLayout(): MActivityLayout {
    return this._activityLayout;
  }

  public get grids(): WorkbenchGrids {
    return this._grids;
  }

  /**
   * Tests if given activity is contained in this layout.
   */
  public hasActivity(id: ActivityId): boolean {
    return this.activities({id}).length > 0;
  }

  /**
   * Indicates if this layout contains activities.
   */
  public hasActivities(): boolean {
    return this.activities().length > 0;
  }

  /**
   * Tests if given part is contained in the specified grid.
   */
  public hasPart(id: string, options?: {grid?: keyof WorkbenchGrids}): boolean {
    return this.parts({id, grid: options?.grid}).length > 0;
  }

  /**
   * Tests if given view is contained in the specified grid.
   */
  public hasView(id: string, options?: {grid?: keyof WorkbenchGrids}): boolean {
    return this.views({id, grid: options?.grid}).length > 0;
  }

  /**
   * Finds the URL of outlets based on the specified filter.
   *
   * @param selector - Defines the search scope.
   * @return outlets matching the filter criteria.
   */
  public outlets(selector: RequireOne<{mainGrid: true; mainAreaGrid: true; activityGrids: true}>): Outlets {
    const parts = new Array<MPart>();
    const views = new Array<MView>();

    // Add outlets of parts and views in the main grid.
    if (selector.mainGrid) {
      parts.push(...this.parts({grid: 'main'}));
      views.push(...this.views({grid: 'main'}));
    }

    // Add outlets of parts and views in the main area grid.
    if (selector.mainAreaGrid) {
      parts.push(...this.parts({grid: 'mainArea'}));
      views.push(...this.views({grid: 'mainArea'}));
    }

    // Add outlets of parts and views in the activity grids.
    if (selector.activityGrids) {
      Objects.keys(WorkbenchLayouts.pickActivityGrids(this._grids)).forEach(activityId => {
        parts.push(...this.parts({grid: activityId}));
        views.push(...this.views({grid: activityId}));
      });
    }

    return [...parts, ...views].reduce((acc, element) => {
      if (this._outlets.has(element.id)) {
        acc[element.id] = this._outlets.get(element.id)!;
      }
      return acc;
    }, {} as Outlets);
  }

  /**
   * Finds navigational state based on the specified filter.
   *
   * @param findBy - Defines the search scope.
   * @param findBy.grid - Searches outlets in the specified grid.
   * @return state matching the filter criteria.
   */
  public navigationStates(findBy?: {grid?: keyof WorkbenchGrids}): NavigationStates {
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
   * TODO [activity] dwie
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
   * Finds activities based on the specified filter.
   *
   * @param findBy - Defines the search scope.
   * @param findBy.id - Searches for activities with the specified id.
   * @param findBy.active - Searches for activities which are active.
   * @param findBy.partId - Searches for activities that contain the specified part.
   * @param options - Controls the search.
   * @param options.throwIfEmpty - Controls to error if no activity is found.
   * @param options.throwIfMulti - Controls to error if multiple activities are found.
   * @return activities matching the filter criteria.
   */
  public activities(findBy: {id?: ActivityId; active?: boolean; partId?: PartId}, options: {throwIfEmpty: (() => Error) | true; throwIfMulti: (() => Error) | true}): readonly [MActivity];
  public activities(findBy: {id?: ActivityId; active?: boolean; partId?: PartId}, options: {throwIfEmpty: (() => Error) | true; throwIfMulti?: (() => Error) | true}): readonly [MActivity, ...MActivity[]];
  public activities(findBy?: {id?: ActivityId; active?: boolean; partId?: PartId}, options?: {throwIfEmpty?: (() => Error) | true; throwIfMulti?: (() => Error) | true}): readonly MActivity[];
  public activities(findBy?: {id?: ActivityId; active?: boolean; partId?: PartId}, options?: {throwIfEmpty?: (() => Error) | true; throwIfMulti?: (() => Error) | true}): readonly MActivity[] {
    const activities = this.activityGroups().flatMap(activityGroup => activityGroup.activities.filter(activity => {
      if (findBy?.id && activity.id !== findBy.id) {
        return false;
      }
      if (findBy?.active !== undefined && activityGroup.activeActivityId !== activity.id) {
        return false;
      }
      if (findBy?.partId && !this.part({partId: findBy.partId, grid: activity.id}, {orElse: null})) {
        return false;
      }
      return true;
    }));

    if (options?.throwIfEmpty && !activities.length) {
      throw typeof options.throwIfEmpty === 'function' ? options.throwIfEmpty() : Error(`[NullActivityError] No matching activity found: [${stringifyFilter(findBy ?? {})}]`);
    }
    if (options?.throwIfMulti && activities.length > 1) {
      throw typeof options.throwIfMulti === 'function' ? options.throwIfMulti() : Error(`[MultiActivityError] Multiple activities found: [${stringifyFilter(findBy ?? {})}]`);
    }
    return activities;
  }

  /**
   * Finds an activity based on the specified filter. If not found, by default, throws an error unless setting the `orElseNull` option.
   *
   * @param findBy - Defines the search scope.
   * @param findBy.id - Searches for an activity with the specified id.
   * @param findBy.active - Searches for an activity which is active.
   * @param findBy.partId - Searches for an activity that contains the specified part.
   * @param options - Controls the search.
   * @param options.orElse - Controls to return `null` instead of throwing an error if no activity is found.
   * @return activity matching the filter criteria.
   */
  public activity(findBy: RequireOne<{id: ActivityId; active: boolean; partId: PartId}>): MActivity;
  public activity(findBy: RequireOne<{id: ActivityId; active: boolean; partId: PartId}>, options: {orElse: null}): MActivity | null;
  public activity(findBy: RequireOne<{id: ActivityId; active: boolean; partId: PartId}>, options?: {orElse: null}): MActivity | null {
    const [activity] = this.activities({id: findBy.id, active: findBy.active, partId: findBy.partId});
    if (!activity && !options) {
      throw Error(`[NullActivityError] No matching activity found: [${stringifyFilter(findBy)}]`);
    }
    return activity ?? null;
  }

  /**
   * Finds activity groups based on the specified filter.
   *
   * @param findBy - Defines the search scope.
   * @param findBy.activityId - Searches for an activity group that contains the specified activity.
   * @param findBy.dockTo - Searches for an activity group docked to the specified area.
   * @param options - Controls the search.
   * @param options.throwIfEmpty - Controls to error if no activity group is found.
   * @param options.throwIfMulti - Controls to error if multiple activity groups are found.
   * @return activity groups matching the filter criteria.
   */
  public activityGroups(findBy: {activityId?: ActivityId; dockTo?: DockingArea; partId?: PartId}, options: {throwIfEmpty: (() => Error) | true; throwIfMulti: (() => Error) | true}): readonly [MActivityGroup];
  public activityGroups(findBy: {activityId?: ActivityId; dockTo?: DockingArea; partId?: PartId}, options: {throwIfEmpty: (() => Error) | true; throwIfMulti?: (() => Error) | true}): readonly [MActivityGroup, ...MActivityGroup[]];
  public activityGroups(findBy?: {activityId?: ActivityId; dockTo?: DockingArea; partId?: PartId}, options?: {throwIfEmpty?: (() => Error) | true; throwIfMulti?: (() => Error) | true}): readonly MActivityGroup[];
  public activityGroups(findBy?: {activityId?: ActivityId; dockTo?: DockingArea; partId?: PartId}, options?: {throwIfEmpty?: (() => Error) | true; throwIfMulti?: (() => Error) | true}): readonly MActivityGroup[] {
    const activityGroups = {
      'left-top': this.activityLayout.toolbars.leftTop,
      'left-bottom': this.activityLayout.toolbars.leftBottom,
      'right-top': this.activityLayout.toolbars.rightTop,
      'right-bottom': this.activityLayout.toolbars.rightBottom,
      'bottom-left': this.activityLayout.toolbars.bottomLeft,
      'bottom-right': this.activityLayout.toolbars.bottomRight,
    };

    return Objects.entries(activityGroups)
      .filter(([dockTo, activityGroup]) => {
        const activities = activityGroup.activities;
        if (findBy?.dockTo && findBy.dockTo.dockTo !== dockTo) {
          return false;
        }
        if (findBy?.activityId && !activities.some(activity => activity.id === findBy.activityId)) {
          return false;
        }
        if (findBy?.partId && !activities.some(activity => !!this.part({partId: findBy.partId!, grid: activity.id}), {orElse: null})) {
          return false;
        }
        return true;
      })
      .map(([_dockTo, activityGroup]) => activityGroup);
  }

  /**
   * Finds an activity group based on the specified filter. If not found, by default, throws an error unless setting the `orElseNull` option.
   *
   * @param findBy - Defines the search scope.
   * @param findBy.activityId - Searches for an activity group that contains the specified activity.
   * @param findBy.dockTo - Searches for an activity group docked to the specified area.
   * @param options - Controls the search.
   * @param options.orElse - Controls to return `null` instead of throwing an error if no activity group is found.
   * @return activity group matching the filter criteria.
   */
  public activityGroup(findBy: RequireOne<{activityId: ActivityId; dockTo: DockingArea; partId: PartId}>): MActivityGroup;
  public activityGroup(findBy: RequireOne<{activityId: ActivityId; dockTo: DockingArea; partId: PartId}>, options: {orElse: null}): MActivityGroup | null;
  public activityGroup(findBy: RequireOne<{activityId: ActivityId; dockTo: DockingArea; partId: PartId}>, options?: {orElse: null}): MActivityGroup | null {
    const [activityGroup] = this.activityGroups({activityId: findBy.activityId, dockTo: findBy.dockTo, partId: findBy.partId});
    if (!activityGroup && !options) {
      throw Error(`[NullActivityGroupError] No matching activity group found: [${stringifyFilter(findBy)}]`);
    }
    return activityGroup ?? null;
  }

  /**
   * Toggles the specified activity.
   */
  public toggleActivity(id: ActivityId): ɵWorkbenchLayout {
    const workingCopy = this.workingCopy();
    workingCopy.__toggleActivity(id);
    return workingCopy;
  }

  /**
   * Sets the size of the specified activity panel.
   */
  public setActivityPanelSize(panel: 'left' | 'right' | 'bottom', size: number): ɵWorkbenchLayout {
    const workingCopy = this.workingCopy();
    workingCopy.__setActivityPanelSize(panel, size);
    return workingCopy;
  }

  /**
   * Sets the split ratio of two activities displayed in the specified panel.
   */
  public setActivityPanelSplitRatio(panel: 'left' | 'right' | 'bottom', ratio: number): ɵWorkbenchLayout {
    const workingCopy = this.workingCopy();
    workingCopy.__setActivityPanelSplitRatio(panel, ratio);
    return workingCopy;
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
  public parts(findBy: {id?: string; viewId?: string; grid?: keyof WorkbenchGrids | Array<keyof WorkbenchGrids>}, options: {throwIfEmpty: (() => Error) | true; throwIfMulti: (() => Error) | true}): readonly [MPart];
  public parts(findBy: {id?: string; viewId?: string; grid?: keyof WorkbenchGrids | Array<keyof WorkbenchGrids>}, options: {throwIfEmpty: (() => Error) | true; throwIfMulti?: (() => Error) | true}): readonly [MPart, ...MPart[]];
  public parts(findBy?: {id?: string; viewId?: string; grid?: keyof WorkbenchGrids | Array<keyof WorkbenchGrids>}, options?: {throwIfEmpty?: (() => Error) | true; throwIfMulti?: (() => Error) | true}): readonly MPart[];
  public parts(findBy?: {id?: string; viewId?: string; grid?: keyof WorkbenchGrids | Array<keyof WorkbenchGrids>}, options?: {throwIfEmpty?: (() => Error) | true; throwIfMulti?: (() => Error) | true}): readonly MPart[] {
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
  public part(findBy: RequireOne<{partId: PartId; viewId: string}> & {grid?: keyof WorkbenchGrids}): MPart;
  public part(findBy: RequireOne<{partId: PartId; viewId: string}> & {grid?: keyof WorkbenchGrids}, options: {orElse: null}): MPart | null;
  public part(findBy: RequireOne<{partId: PartId; viewId: string}> & {grid?: keyof WorkbenchGrids}, options?: {orElse: null}): MPart | null {
    const [part] = this.parts({id: findBy.partId, viewId: findBy.viewId, grid: findBy.grid});
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
   * @param extras - @inheritDoc
   * @param extras.activate - @inheritDoc
   * @param extras.structural - Specifies if this is a structural part. A structural part will not be removed when removing its last view. Defaults to `true`.
   */
  public addPart(id: string | MAIN_AREA, relativeTo: ReferenceElement, extras?: {activate?: boolean; structural?: boolean}): ɵWorkbenchLayout;
  public addPart(id: string, dockTo: DockingArea, extras: PartExtras): WorkbenchLayout;
  public addPart(id: string, reference: ReferencePart | DockingArea, extras?: {activate?: boolean; structural?: boolean} | PartExtras): WorkbenchLayout {
    const partId = isPartId(id) ? id : (id === MAIN_AREA_ALTERNATIVE_ID ? MAIN_AREA : WorkbenchLayouts.computePartId());
    const alternativeId = isPartId(id) ? (id === MAIN_AREA ? MAIN_AREA_ALTERNATIVE_ID : undefined) : id;

    const workingCopy = this.workingCopy();

    if ((reference as Partial<DockingArea>).dockTo) {
      workingCopy.__addActivity(partId, reference as DockingArea, {...extras, alternativeId} as PartExtras & {alternativeId?: string});
    }
    else {
      workingCopy.__addPart(partId, reference as ReferencePart, {...extras, alternativeId});
    }
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
  public activePart(find: {grid: 'main'}): Readonly<MPart>;
  public activePart(find: {grid: keyof WorkbenchGrids}): Readonly<MPart> | null;
  public activePart(find: {grid: keyof WorkbenchGrids}): Readonly<MPart> | null {
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
    const [view] = this.views({id: findBy.viewId});
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
  public views(findBy: {id?: string; partId?: string; segments?: UrlSegmentMatcher; navigationHint?: string | null; markedForRemoval?: boolean; grid?: keyof WorkbenchGrids | Array<keyof WorkbenchGrids>}, options: {throwIfEmpty: (() => Error) | true; throwIfMulti: (() => Error) | true}): readonly [MView];
  public views(findBy: {id?: string; partId?: string; segments?: UrlSegmentMatcher; navigationHint?: string | null; markedForRemoval?: boolean; grid?: keyof WorkbenchGrids | Array<keyof WorkbenchGrids>}, options: {throwIfEmpty: (() => Error) | true; throwIfMulti?: (() => Error) | true}): readonly [MView, ...MView[]];
  public views(findBy?: {id?: string; partId?: string; segments?: UrlSegmentMatcher; navigationHint?: string | null; markedForRemoval?: boolean; grid?: keyof WorkbenchGrids | Array<keyof WorkbenchGrids>}, options?: {throwIfEmpty?: (() => Error) | true; throwIfMulti?: (() => Error) | true}): readonly MView[];
  public views(findBy?: {id?: string; partId?: string; segments?: UrlSegmentMatcher; navigationHint?: string | null; markedForRemoval?: boolean; grid?: keyof WorkbenchGrids | Array<keyof WorkbenchGrids>}, options?: {throwIfEmpty?: (() => Error) | true; throwIfMulti?: (() => Error) | true}): readonly MView[] {
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
  public addView(id: string, extras: {partId: string; position?: number | 'start' | 'end' | 'before-active-view' | 'after-active-view'; activateView?: boolean; activatePart?: boolean; cssClass?: string | string[]}): ɵWorkbenchLayout {
    const workingCopy = this.workingCopy();
    if (isViewId(id)) {
      workingCopy.__addView({id}, extras);
    }
    else {
      workingCopy.__addView({id: this.computeNextViewId(), alternativeId: id}, extras);
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
  public setTreeNodeSplitRatio(nodeId: string, ratio: number): ɵWorkbenchLayout {
    const workingCopy = this.workingCopy();
    workingCopy.__setTreeNodeSplitRatio(nodeId, ratio);
    return workingCopy;
  }

  /**
   * Serializes this layout into a URL-safe base64 string.
   */
  public serialize(flags?: GridSerializationFlags): SerializedWorkbenchLayout {
    const workingCopy = this.workingCopy();

    // Check if to assign each part a stable id based on its position in the grid.
    if (flags?.assignStablePartIdentifier) {
      workingCopy.__assignStablePartIdentifier();
    }

    // Check if to assign each activity a stable id based on its position in the activity layout.
    if (flags?.assignStableActivityIdentifier) {
      workingCopy.__assignStableActivityIdentifier();
    }

    return {
      grids: this._gridSerializer.serializeGrids(workingCopy.grids, flags),
      activityLayout: this._activityLayoutSerializer.serializeActivityLayout(workingCopy.activityLayout),
      outlets: (selector: RequireOne<{mainGrid: true; mainAreaGrid: true; activityGrids: true}>): string => {
        return this._gridSerializer.serializeOutlets(workingCopy.outlets(selector));
      },
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
      Objects.isEqual(layout1.grids, layout2.grids) &&
      layout1.activityLayout === layout2.activityLayout &&
      layout1.outlets({mainGrid: true}) === layout2.outlets({mainGrid: true}) &&
      layout1.outlets({mainAreaGrid: true}) === layout2.outlets({mainAreaGrid: true}) &&
      layout1.outlets({activityGrids: true}) === layout2.outlets({activityGrids: true}) &&
      this.perspectiveId === other.perspectiveId
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
  private __addActivity(id: PartId, dockTo: DockingArea, extras: PartExtras & {alternativeId?: string}): void {
    if (this.hasPart(id)) {
      throw Error(`[PartAddError] Part id must be unique. The layout already contains a part with the id '${id}'.`);
    }

    if (extras.ɵactivityId && this.hasActivity(extras.ɵactivityId)) {
      throw Error(`[ActivityAddError] Activity id must be unique. The layout already contains an activity with the id '${extras.ɵactivityId}'.`);
    }

    const activityId = extras.ɵactivityId ?? WorkbenchLayouts.computeActivityId();
    this._grids[activityId] = {
      root: new MPart({id, alternativeId: extras.alternativeId, structural: true, views: []}),
      activePartId: id,
    };

    const activityGroup = this.activityGroup({dockTo});
    activityGroup.activities.push({
      id: activityId,
      referencePartId: id,
      icon: extras.icon,
      label: extras.label,
      tooltip: extras.tooltip,
      cssClass: extras.cssClass,
    });
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __removeActivity(activity: MActivity): void {
    // Remove outlets and state of views and parts contained in this activity.
    this.parts({grid: activity.id}).forEach(part => {
      this._outlets.delete(part.id);
      this._navigationStates.delete(part.id);

      part.views.forEach(view => {
        this._outlets.delete(view.id);
        this._navigationStates.delete(view.id);
      });
    });

    // Remove activity grid.
    delete this._grids[activity.id]; // eslint-disable-line @typescript-eslint/no-dynamic-delete

    // Remove activity from layout.
    const activityGroup = this.activityGroup({activityId: activity.id});
    Arrays.remove(activityGroup.activities, activity);
    if (activityGroup.activeActivityId === activity.id) {
      delete activityGroup.activeActivityId;
    }
    if (activityGroup.minimizedActivityId === activity.id) {
      delete activityGroup.minimizedActivityId;
    }
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __toggleActivity(id: ActivityId): void {
    const group = this.activityGroup({activityId: id});
    if (group.activeActivityId === id) {
      delete group.activeActivityId;
    }
    else {
      group.activeActivityId = id;
    }
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __assignStableActivityIdentifier(): void {
    this.activities().forEach((activity, index) => this.__renameActivity(activity, `${ACTIVITY_ID_PREFIX}${index + 1}`));
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __renameActivity(activity: MActivity, newActivityId: ActivityId): void {
    if (this.hasActivity(newActivityId)) {
      throw Error(`[ActivityRenameError] Activity id must be unique. The layout already contains an activity with the id '${newActivityId}'.`);
    }

    // Rename grid.
    this._grids[newActivityId] = this.grids[activity.id]!;
    delete this.grids[activity.id]; // eslint-disable-line @typescript-eslint/no-dynamic-delete

    // Rename references in activity group.
    const group = this.activityGroup({activityId: activity.id});
    if (group.activeActivityId === activity.id) {
      group.activeActivityId = newActivityId;
    }
    if (group.minimizedActivityId === activity.id) {
      group.minimizedActivityId = newActivityId;
    }

    // Rename activity.
    activity.id = newActivityId;
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __toggleMaximized(): void {
    if (!this.hasActivities()) {
      return;
    }

    const minimize = this.activities({active: true}).length > 0;
    this.activityGroups().forEach(activityGroup => {
      if (minimize) {
        activityGroup.minimizedActivityId = activityGroup.activeActivityId;
        activityGroup.activeActivityId = undefined;
      }
      else {
        activityGroup.activeActivityId = activityGroup.minimizedActivityId;
        activityGroup.minimizedActivityId = undefined;
      }
    });
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __setActivityPanelSize(panel: 'left' | 'right' | 'bottom', size: number): void {
    if (size < 0) {
      throw Error(`[LayoutModifyError] '${panel}' activity panel size must be 0 or greater, but was '${size}'.`);
    }
    switch (panel) {
      case 'left':
        this._activityLayout.panels.left.width = `${size}px`;
        break;
      case 'right':
        this._activityLayout.panels.right.width = `${size}px`;
        break;
      case 'bottom':
        this._activityLayout.panels.bottom.height = `${size}px`;
        break;
    }
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __setActivityPanelSplitRatio(panel: 'left' | 'right' | 'bottom', ratio: number): void {
    if (ratio < 0 || ratio > 1) {
      throw Error(`[LayoutModifyError] Ratio for '${panel}' activity panel must be in the closed interval [0,1], but was '${ratio}'.`);
    }
    switch (panel) {
      case 'left':
        this._activityLayout.panels.left.ratio = ratio;
        break;
      case 'right':
        this._activityLayout.panels.right.ratio = ratio;
        break;
      case 'bottom':
        this._activityLayout.panels.bottom.ratio = ratio;
        break;
    }
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __addPart(id: PartId, relativeTo: ReferenceElement, extras?: {alternativeId?: string; activate?: boolean; structural?: boolean}): void {
    if (this.hasPart(id)) {
      throw Error(`[PartAddError] Part id must be unique. The layout already contains a part with the id '${id}'.`);
    }

    const newPart = new MPart({id, alternativeId: extras?.alternativeId, structural: extras?.structural ?? true, views: []});

    // Find the reference element, if specified, or use the layout root as reference otherwise.
    const referenceElement = relativeTo.relativeTo ? this.findTreeElement({id: relativeTo.relativeTo}) : this.grids.main.root;
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
      const grid = this.grid(referenceElement.type === 'MPart' ? {partId: referenceElement.id} : {nodeId: referenceElement.id});
      grid.root = newTreeNode; // top-level node
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
    if (extras?.activate) {
      this.__activatePart(newPart);
    }
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __removePart(part: MPart, options?: {force?: boolean}): void {
    // Remove activity if this part is the reference part of the activity.
    const activity = this.activity({partId: part.id}, {orElse: null});
    if (activity?.referencePartId === part.id) {
      this.__removeActivity(activity);
      return;
    }

    const grid = this.grid({partId: part.id});
    const gridName = Objects.keys(this._grids).find(gridName => this._grids[gridName] === grid);

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
      grid.activePartId = activePart!.id;
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

    const grid = this.grid({partId: part.id});
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

    const position = coerceViewPosition(options.position ?? 'end', part);
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
      const position = coerceViewPosition(options.position, targetPart);
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
      const [lastUsedViewId] = part.views
        .map(view => view.id)
        .sort((viewId1, viewId2) => {
          const activationInstantView1 = this._viewActivationInstantProvider.getActivationInstant(viewId1);
          const activationInstantView2 = this._viewActivationInstantProvider.getActivationInstant(viewId2);
          return activationInstantView2 - activationInstantView1;
        });
      part.activeViewId = lastUsedViewId;
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
  private __setTreeNodeSplitRatio(nodeId: string, ratio: number): void {
    if (ratio < 0 || ratio > 1) {
      throw Error(`[LayoutModifyError] Ratio for node '${nodeId}' must be in the closed interval [0,1], but was '${ratio}'.`);
    }
    this.findTreeElement<MTreeNode>({id: nodeId}).ratio = ratio;
  }

  /**
   * Note: This method name begins with underscores, indicating that it does not operate on a working copy, but modifies this layout instead.
   */
  private __activatePart(part: MPart): void {
    // Activate part.
    this.grid({partId: part.id}).activePartId = part.id;

    // Activate activity.
    const activity = this.activity({partId: part.id}, {orElse: null});
    if (activity) {
      this.activityGroup({activityId: activity.id}).activeActivityId = activity.id;
    }
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
   * Finds a grid based on the specified filter. If not found, by default, throws an error unless setting the `orElseNull` option.
   *
   * @param findBy - Defines the search scope.
   * @param findBy.partId - Searches for a grid that contains the specified part.
   * @param findBy.viewId - Searches for a grid that contains the specified view.
   * @param findBy.nodeId - Searches for a grid that contains the specified node.
   * @param options - Controls the search.
   * @param options.orElse - Controls to return `null` instead of throwing an error if no grid is found.
   * @return grid matching the filter criteria.
   */
  public grid(findBy: RequireOne<{partId: PartId; viewId: ViewId; nodeId: string}>): MPartGrid;
  public grid(findBy: RequireOne<{partId: PartId; viewId: ViewId; nodeId: string}>, options: {orElse: null}): MPartGrid | null;
  public grid(findBy: RequireOne<{partId: PartId; viewId: ViewId; nodeId: string}>, options?: {orElse: null}): MPartGrid | null {
    const gridName = Objects.keys(this._grids).find(gridName => {
      return this.findTreeElements((element: MTreeNode | MPart): element is MPart | MTreeNode => {
        if (findBy?.partId && (element.type !== 'MPart' || element.id !== findBy.partId)) {
          return false;
        }
        if (findBy?.nodeId && (element.type !== 'MTreeNode' || element.id !== findBy.nodeId)) {
          return false;
        }
        if (findBy?.viewId && (element.type !== 'MPart' || !element.views.some(view => matchesViewId(findBy.viewId!, view)))) {
          return false;
        }
        return true;
      }, {findFirst: true, grid: gridName}).length > 0;
    });

    if (!gridName && !options) {
      throw Error(`[NullGridError] No matching grid found: [${stringifyFilter(findBy)}]`);
    }
    return (gridName && this._grids[gridName]) ?? null;
  }

  /**
   * Traverses the tree to find an element that matches the given predicate.
   *
   * @param findBy - Defines the search scope.
   * @param findBy.id - Searches for an element with the specified id.
   * @return Element matching the filter criteria.
   */
  private findTreeElement<T extends MTreeNode | MPart>(findBy: {id: string}): T {
    const [element] = this.findTreeElements((element: MTreeNode | MPart): element is T => {
      if (element instanceof MPart) {
        return matchesPartId(findBy.id, element);
      }
      return element.id === findBy.id;
    }, {findFirst: true});

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
  private findTreeElements<T extends MTreeNode | MPart>(predicateFn: (element: MTreeNode | MPart) => element is T, options?: {findFirst?: boolean; grid?: keyof WorkbenchGrids | Array<keyof WorkbenchGrids>}): T[] {
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

    const gridFilter = options?.grid ? new Set<keyof WorkbenchGrids>(Arrays.coerce(options.grid)) : null;
    for (const [gridName, grid] of Objects.entries(this._grids)) {
      if (!grid) {
        continue;
      }
      if (gridFilter && !gridFilter.has(gridName)) {
        continue;
      }
      if (!visitParts(grid.root)) {
        break;
      }
    }

    return result;
  }

  /**
   * Asserts each activity to have a grid.
   */
  private assertActivities(): void {
    const mActivities = this.activityGroups().flatMap(activityGroup => activityGroup.activities);

    // Assert each MActivity to have a MPartGrid.
    mActivities.forEach(activity => {
      if (!this._grids[activity.id]) {
        throw Error(`[NullGridError] Missing MPartGrid for activity ${activity.id}.`);
      }
    });

    // Assert each activity MPartGrid to have a MActivity.
    Objects.keys(WorkbenchLayouts.pickActivityGrids(this._grids)).forEach(activityId => {
      if (!mActivities.some(activity => activity.id === activityId)) {
        throw Error(`[NullActivityError] Missing MActivity ${activityId}.`);
      }
    });
  }

  /**
   * Creates a copy of this layout.
   */
  private workingCopy(): ɵWorkbenchLayout {
    const activityLayout1 = this._activityLayoutSerializer.serializeActivityLayout(this._activityLayout);
    return runInInjectionContext(this._injector, () => new ɵWorkbenchLayout({
      grids: this._gridSerializer.serializeGrids(this._grids),
      activityLayout: activityLayout1,
      perspectiveId: this.perspectiveId,
      outlets: Object.fromEntries(this._outlets),
      navigationStates: Object.fromEntries(this._navigationStates),
    }));
  }
}

/**
 * Creates the layout to dock parts to well-defined areas in the workbench layout.
 */
function createDefaultActivityLayout(): MActivityLayout {
  return {
    toolbars: {
      leftTop: {activities: []},
      leftBottom: {activities: []},
      rightTop: {activities: []},
      rightBottom: {activities: []},
      bottomLeft: {activities: []},
      bottomRight: {activities: []},
    },
    panels: {
      left: {
        width: '200px',
      },
      right: {
        width: '200px',
      },
      bottom: {
        height: '150px',
      },
    },
  };
}

/**
 * Creates the default main grid with a main area.
 */
function createDefaultMainGrid(): MPartGrid {
  return {
    root: new MPart({id: MAIN_AREA, alternativeId: MAIN_AREA_ALTERNATIVE_ID, structural: true, views: []}),
    activePartId: MAIN_AREA,
  };
}

/**
 * Creates the default main area grid with an initial part.
 *
 * The DI token {@link MAIN_AREA_INITIAL_PART_ID} is used to assign the initial part its identity.
 */
function createDefaultMainAreaGrid(): MPartGrid {
  return {
    root: new MPart({id: inject(MAIN_AREA_INITIAL_PART_ID), structural: false, views: []}),
    activePartId: inject(MAIN_AREA_INITIAL_PART_ID),
  };
}

/**
 * Coerces {@link MActivityLayout}, applying necessary migrations if the serialized layout is outdated.
 */
function coerceMActivityLayout(layout: string | MActivityLayout | undefined, options: {default: () => MActivityLayout}): MActivityLayout {
  if (!layout) {
    return options.default();
  }
  if (typeof layout === 'object') {
    return layout;
  }

  try {
    return inject(WorkbenchActivityLayoutSerializer).deserializeActivityLayout(layout);
  }
  catch (error) {
    inject(Logger).error('[SerializeError] Failed to deserialize "MActivityLayout". Please clear your browser storage and reload the application.', error);
    return options.default();
  }
}

/**
 * Coerces {@link MPartGrid}, applying necessary migrations if the serialized grid is outdated.
 */
function coerceMPartGrid(grid: string | MPartGrid | undefined): ɵMPartGrid | undefined;
function coerceMPartGrid(grid: string | MPartGrid | undefined, options: {default: () => MPartGrid}): ɵMPartGrid;
function coerceMPartGrid(grid: string | MPartGrid | undefined, options?: {default: () => MPartGrid}): ɵMPartGrid | undefined {
  if (!grid) {
    return options?.default();
  }
  if (typeof grid === 'object') {
    return grid;
  }

  try {
    return inject(WorkbenchLayoutSerializer).deserializeGrid(grid);
  }
  catch (error) {
    inject(Logger).error('[SerializeError] Failed to deserialize "MPartGrid". Please clear your browser storage and reload the application.', error);
    return options?.default ? {...options.default(), migrated: true} : undefined;
  }
}

/**
 * Coerces {@link Outlets}, applying necessary migrations if the serialized outlets are outdated.
 */
function coerceOutlets(outlets: string | Outlets | undefined): Outlets {
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
    inject(Logger).error('[SerializeError] Failed to deserialize "Outlets". Please clear your browser storage and reload the application.', error);
    return {};
  }
}

/**
 * Coerces a view position, returning the given position if it is a number, or computes it from the given literal otherwise.
 */
function coerceViewPosition(position: number | 'start' | 'end' | 'before-active-view' | 'after-active-view', part: MPart): number {
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
 * Tests if the given id matches the format of an activity identifier.
 */
export function isActivityId(activityId: string | undefined | null): activityId is ActivityId {
  return activityId?.startsWith(ACTIVITY_ID_PREFIX) ?? false;
}

/**
 * Tests if the given id matches the format of a part identifier.
 */
export function isPartId(partId: string | undefined | null): partId is PartId {
  return Routing.isPartOutlet(partId);
}

/**
 * Tests if the given id matches the format of a view identifier.
 */
function isViewId(viewId: string | undefined | null): viewId is ViewId {
  return Routing.isViewOutlet(viewId);
}

/**
 * Serialized artifacts of the workbench layout.
 */
export interface SerializedWorkbenchLayout {
  grids: WorkbenchGrids<string>;
  activityLayout: string;
  outlets: (selector: RequireOne<{mainGrid: true; mainAreaGrid: true; activityGrids: true}>) => string;
}

/**
 * Configuration for constructing the workbench layout.
 *
 * Grids and the activity layout can be passed in serialized or deserialized form.
 * If they are not provided, default layouts will be created.
 *
 * The following rules apply:
 * - If the main grid is not provided, it defaults to a layout with a main area.
 * - If the grid for the main area is not provided, but the main grid has a main area part,
 *   it defaults to a main area grid with an initial part. The DI token {@link MAIN_AREA_INITIAL_PART_ID}
 *   can be used to assign the initial part its identity.
 */
export interface WorkbenchLayoutConstructConfig {
  grids?: Partial<WorkbenchGrids<MPartGrid | string>>;
  activityLayout?: MActivityLayout | string;
  perspectiveId?: string;
  outlets?: Outlets | string;
  navigationStates?: NavigationStates;
}
