/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {BehaviorSubject, combineLatest, EMPTY, Observable, Subject, switchMap} from 'rxjs';
import {ChildrenOutletContexts, Router, UrlSegment} from '@angular/router';
import {ViewDragService} from '../view-dnd/view-drag.service';
import {distinctUntilChanged, filter, map, takeUntil} from 'rxjs/operators';
import {filterArray, mapArray} from '@scion/toolkit/operators';
import {Arrays, Defined} from '@scion/toolkit/util';
import {Disposable} from '../common/disposable';
import {WorkbenchMenuItem, WorkbenchMenuItemFactoryFn} from '../workbench.model';
import {WorkbenchView} from './workbench-view.model';
import {WorkbenchPart} from '../part/workbench-part.model';
import {ɵWorkbenchService} from '../ɵworkbench.service';
import {ComponentType} from '@angular/cdk/portal';
import {WbComponentPortal} from '../portal/wb-component-portal';
import {inject} from '@angular/core';
import {ɵWorkbenchPart} from '../part/ɵworkbench-part.model';
import {ActivationInstantProvider} from '../activation-instant.provider';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {WorkbenchPartRegistry} from '../part/workbench-part.registry';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {bufferLatestUntilLayoutChange} from '../common/operators';

export class ɵWorkbenchView implements WorkbenchView {

  private readonly _workbenchService = inject(ɵWorkbenchService);
  private readonly _workbenchLayoutService = inject(WorkbenchLayoutService);
  private readonly _workbenchRouter = inject(WorkbenchRouter);
  private readonly _partRegistry = inject(WorkbenchPartRegistry);
  private readonly _viewDragService = inject(ViewDragService);
  private readonly _router = inject(Router);
  private readonly _activationInstantProvider = inject(ActivationInstantProvider);

  private readonly _part$ = new BehaviorSubject<ɵWorkbenchPart | undefined>(undefined);
  private readonly _menuItemProviders$ = new BehaviorSubject<WorkbenchMenuItemFactoryFn[]>([]);
  private readonly _scrolledIntoView$ = new BehaviorSubject<boolean>(true);
  private readonly _destroy$ = new Subject<void>();

  private _activationInstant: number | undefined;

  public title: string | null = null;
  public heading: string | null = null;
  public dirty = false;
  public closable = true;
  public scrollTop = 0;
  public scrollLeft = 0;

  public readonly active$ = new BehaviorSubject<boolean>(false);
  public readonly cssClasses$ = new BehaviorSubject<string[]>([]);
  public readonly menuItems$: Observable<WorkbenchMenuItem[]>;
  public readonly blocked$ = new BehaviorSubject(false);
  public readonly portal: WbComponentPortal;

  constructor(public readonly id: string, options: {component: ComponentType<ViewComponent>}) {
    this.menuItems$ = combineLatest([this._menuItemProviders$, this._workbenchService.viewMenuItemProviders$])
      .pipe(
        map(([localMenuItemProviders, globalMenuItemProviders]) => localMenuItemProviders.concat(globalMenuItemProviders)),
        mapArray<WorkbenchMenuItemFactoryFn, WorkbenchMenuItem>(menuItemFactoryFn => menuItemFactoryFn(this)),
        filterArray<WorkbenchMenuItem>(Boolean),
      );
    this.portal = this.createPortal(options.component);
    this.trackViewActivation();
    this.touchOnActivate();
  }

  private createPortal(viewComponent: ComponentType<ViewComponent>): WbComponentPortal {
    return new WbComponentPortal(viewComponent, {
      providers: [
        {provide: ɵWorkbenchView, useValue: this},
        {provide: WorkbenchView, useExisting: ɵWorkbenchView},
        // For each primary top-level route, the workbench registers corresponding secondary top-level view routes.
        // However, if the workbench component is displayed in a router outlet, view outlets are not top-level outlets anymore.
        // Therefore, we instruct the view's router outlet to act as a top-level outlet to be the target of the registered top-level view routes.
        {provide: ChildrenOutletContexts, useValue: inject(ChildrenOutletContexts)},
        // Prevent injecting this part into the view because the view may be dragged to a different part.
        {provide: WorkbenchPart, useValue: null},
        {provide: ɵWorkbenchPart, useValue: null},
      ],
    });
  }

  /**
   * Method invoked to update this workbench model object when the workbench layout changes.
   */
  public onLayoutChange(layout: ɵWorkbenchLayout): void {
    const partId = layout.part({by: {viewId: this.id}}).id;
    this._part$.next(this._partRegistry.get(partId));
  }

  public get first(): boolean {
    return this.position === 0;
  }

  public get last(): boolean {
    return this.position === this.part.viewIds.length - 1;
  }

  public get position(): number {
    return this.part.viewIds.indexOf(this.id);
  }

  public set cssClass(cssClass: string | string[]) {
    this.cssClasses$.next(Arrays.coerce(cssClass));
  }

  public get cssClasses(): string[] {
    return this.cssClasses$.value;
  }

  public get active(): boolean {
    return this.active$.value;
  }

  public async activate(options?: {skipLocationChange?: boolean}): Promise<boolean> {
    if (this.active && this.part.active) {
      return true;
    }

    const currentLayout = this._workbenchLayoutService.layout;
    return this._workbenchRouter.ɵnavigate(
      layout => currentLayout === layout ? layout.activateView(this.id, {activatePart: true}) : null, // cancel navigation if the layout has become stale
      {skipLocationChange: options?.skipLocationChange},
    );
  }

  /**
   * Sets whether the tab of this view is scrolled into view in the tabbar.
   */
  public set scrolledIntoView(scrolledIntoView: boolean) {
    if (scrolledIntoView !== this._scrolledIntoView$.value) {
      this._scrolledIntoView$.next(scrolledIntoView);
    }
  }

  /**
   * @inheritDoc
   */
  public get scrolledIntoView(): boolean {
    return this._scrolledIntoView$.value;
  }

  /**
   * Informs whether the tab of this view is scrolled into view in the tabbar.
   * Emits the current state upon subscription, and then continuously when the state changes.
   */
  public get scrolledIntoView$(): Observable<boolean> {
    return this._scrolledIntoView$;
  }

  public get activationInstant(): number | undefined {
    return this._activationInstant;
  }

  public get part(): WorkbenchPart {
    return Defined.orElseThrow(this._part$.value, () => Error(`[NullPartError] Part reference missing for view '${this.id}'.`));
  }

  public close(target?: 'self' | 'all-views' | 'other-views' | 'views-to-the-right' | 'views-to-the-left'): Promise<boolean> {
    switch (target || 'self') {
      case 'self': {
        return this._workbenchService.closeViews(this.id);
      }
      case 'all-views': {
        return this._workbenchService.closeViews(...this.part.viewIds);
      }
      case 'other-views': {
        return this._workbenchService.closeViews(...this.part.viewIds.filter(viewId => viewId !== this.id));
      }
      case 'views-to-the-right': {
        const viewIds = this.part.viewIds;
        return this._workbenchService.closeViews(...viewIds.slice(viewIds.indexOf(this.id) + 1));
      }
      case 'views-to-the-left': {
        const viewIds = this.part.viewIds;
        return this._workbenchService.closeViews(...viewIds.slice(0, viewIds.indexOf(this.id)));
      }
      default: {
        return Promise.resolve(false);
      }
    }
  }

  public move(region: 'north' | 'south' | 'west' | 'east' | 'blank-window'): Promise<boolean> {
    const moveToNewWindow = region === 'blank-window';

    this._viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: this._workbenchService.appInstanceId,
        partId: this.part.id,
        viewId: this.id,
        viewUrlSegments: this.urlSegments,
      },
      target: {
        appInstanceId: moveToNewWindow ? 'new' : this._workbenchService.appInstanceId,
        elementId: moveToNewWindow ? undefined : this.part.id,
        region: moveToNewWindow ? undefined : region,
      },
    });
    return Promise.resolve(true);
  }

  public get urlSegments(): UrlSegment[] {
    const urlTree = this._router.parseUrl(this._router.url);
    return urlTree.root.children[this.id]?.segments ?? [];
  }

  public registerMenuItem(menuItem: WorkbenchMenuItem): Disposable {
    const factoryFn = (): WorkbenchMenuItem => menuItem;
    this._menuItemProviders$.next(this._menuItemProviders$.value.concat(factoryFn));
    return {
      dispose: (): void => {
        this._menuItemProviders$.next(this._menuItemProviders$.value.filter(it => it !== factoryFn));
      },
    };
  }

  public get blocked(): boolean {
    return this.blocked$.value;
  }

  public set blocked(blocked: boolean) {
    this.blocked$.next(blocked);
  }

  public get destroyed(): boolean {
    return this.portal.isDestroyed;
  }

  /**
   * Monitors the associated part to check if this view is currently active, updating the active state of this view accordingly.
   */
  private trackViewActivation(): void {
    this._part$
      .pipe(
        switchMap(part => part?.activeViewId$ ?? EMPTY),
        map(activeViewId => activeViewId === this.id),
        bufferLatestUntilLayoutChange(), // Prevent the (de-)activation of potentially wrong views while updating the layout.
        distinctUntilChanged(),
        takeUntil(this._destroy$),
      )
      .subscribe(this.active$);
  }

  /**
   * Updates the activation instant when this view is activated.
   */
  private touchOnActivate(): void {
    this.active$
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      )
      .subscribe(() => {
        this._activationInstant = this._activationInstantProvider.now();
      });
  }

  public destroy(): void {
    this._destroy$.next();
    this.portal.destroy();
  }
}

/**
 * Represents a pseudo-type for the actual {@link ViewComponent} which must not be referenced in order to avoid import cycles.
 */
type ViewComponent = any;
