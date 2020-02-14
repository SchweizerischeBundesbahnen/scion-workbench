/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { WbComponentPortal } from './portal/wb-component-portal';
import { ViewPartComponent } from './view-part/view-part.component';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { ViewComponent } from './view/view.component';
import { InternalWorkbenchService } from './workbench.service';
import { Arrays } from './array.util';
import { Injector, TemplateRef, Type } from '@angular/core';
import { Disposable } from './disposable';
import { ComponentPortal, ComponentType, TemplatePortal } from '@angular/cdk/portal';
import { ViewActivationInstantProvider } from './view-activation-instant-provider.service';
import { Router, UrlSegment } from '@angular/router';
import { ViewDragService } from './view-dnd/view-drag.service';
import { filterArray, mapArray } from './operators';
import { map } from 'rxjs/operators';
import { ViewPartGridProvider } from './view-part-grid/view-part-grid-provider.service';
import { WorkbenchViewPartRegistry } from './view-part-grid/workbench-view-part-registry.service';

/**
 * A view is a visual component within the Workbench to present content,
 * and which can be arranged in a view grid.
 */
export abstract class WorkbenchView {

  /**
   * View outlet identity which is unique in this application.
   */
  public readonly viewRef: string;

  /**
   * The viewpart which contains this view.
   *
   * Note: the viewpart of a view can change, e.g. when the view is moved to another viewpart.
   */
  public readonly viewPart: WorkbenchViewPart;

  /**
   * Specifies the title to be displayed in the view tab.
   */
  public title: string;

  /**
   * Specifies the sub title to be displayed in the view tab.
   */
  public heading: string;

  /**
   * Specifies CSS class(es) added to the <wb-view-tab> and <wb-view> elements, e.g. used for e2e testing.
   */
  public abstract set cssClass(cssClass: string | string[]);

  /**
   * Returns CSS classes specified, if any.
   */
  public abstract get cssClasses(): string[];

  /**
   * Specifies if the content of the current view is dirty.
   * If dirty, a dirty marker is displayed in the view tab.
   */
  public dirty: boolean;

  /**
   * Specifies if the view is blocked, e.g., not interactable because of showing a view-modal message box.
   */
  public blocked: boolean;

  /**
   * Specifies if a close button should be displayed in the view tab.
   */
  public closable: boolean;

  /**
   * Indicates whether this view is the active viewpart view.
   */
  public abstract get active(): boolean;

  /**
   * Indicates whether this view is the active viewpart view.
   * Emits the current state upon subscription.
   */
  public abstract get active$(): Observable<boolean>;

  /**
   * The position of this view in the tabbar.
   */
  public readonly position: number;

  /**
   * `True` when this view is the first view in the tabbar.
   */
  public readonly first: boolean;

  /**
   * `True` when this view is the last view in the tabbar.
   */
  public readonly last: boolean;

  /**
   * Indicates whether this view is destroyed.
   */
  public abstract get destroyed(): boolean;

  /**
   * Destroys this view (or sibling views) and the associated routed component.
   *
   * Note: This instruction runs asynchronously via URL routing.
   *
   * @param target
   *        Allows to control which view(s) to close:
   *
   *        - self: closes this view
   *        - all-views: closes all views of this viewpart
   *        - other-views: closes the other views of this viewpart
   *        - views-to-the-right: closes the views to the right of this view
   *        - views-to-the-left: closes the views to the left of this view
   *
   */
  public abstract close(target?: 'self' | 'all-views' | 'other-views' | 'views-to-the-right' | 'views-to-the-left'): Promise<boolean>;

  /**
   * Moves this view to a new viewpart in the specified region, or to a new browser window if 'blank-window'.
   */
  public abstract move(region: 'north' | 'south' | 'west' | 'east' | 'blank-window'): Promise<boolean>;

  /**
   * Returns the URL segments of this view.
   *
   * A {@link UrlSegment} is a part of a URL between the two slashes. It contains a path and the matrix parameters associated with the segment.
   */
  public abstract get urlSegments(): UrlSegment[];

  /**
   * Registers a menu item which is added to the context menu of the view tab.
   *
   * @return {@link Disposable} to unregister the menu item.
   */
  public abstract registerMenuItem(menuItem: WorkbenchMenuItem): Disposable;
}

export class InternalWorkbenchView implements WorkbenchView {

  private readonly _menuItemProviders$ = new BehaviorSubject<WorkbenchMenuItemFactoryFn[]>([]);

  public title: string;
  public heading: string;
  public dirty: boolean;
  public closable: boolean;
  public blocked: boolean;

  public scrollTop: number | null;
  public scrollLeft: number | null;
  public activationInstant: number;

  public readonly active$: BehaviorSubject<boolean>;
  public readonly cssClasses$: BehaviorSubject<string[]>;
  public readonly menuItems$: Observable<WorkbenchMenuItem[]>;

  constructor(public readonly viewRef: string,
              active: boolean,
              public readonly portal: WbComponentPortal<ViewComponent>,
              private _workbench: InternalWorkbenchService,
              private _viewActivationInstantProvider: ViewActivationInstantProvider,
              private _router: Router,
              private _viewDragService: ViewDragService,
              private _viewPartRegistry: WorkbenchViewPartRegistry,
              private _viewPartGridProvider: ViewPartGridProvider) {
    this.active$ = new BehaviorSubject<boolean>(active);
    this.cssClasses$ = new BehaviorSubject<string[]>([]);
    this.title = viewRef;
    this.closable = true;

    this.menuItems$ = combineLatest([this._menuItemProviders$, this._workbench.viewMenuItemProviders$])
      .pipe(
        map(([localMenuItemProviders, globalMenuItemProviders]) => localMenuItemProviders.concat(globalMenuItemProviders)),
        mapArray(menuItemFactoryFn => menuItemFactoryFn(this)),
        filterArray<WorkbenchMenuItem>(Boolean),
      );
  }

  public get first(): boolean {
    return this.position === 0;
  }

  public get last(): boolean {
    return this.position === this.viewPart.viewRefs.length - 1;
  }

  public get position(): number {
    return this.viewPart.viewRefs.indexOf(this.viewRef);
  }

  public set cssClass(cssClass: string | string[]) {
    this.cssClasses$.next(Arrays.from(cssClass));
  }

  public get cssClasses(): string[] {
    return this.cssClasses$.value;
  }

  public get active(): boolean {
    return this.active$.getValue();
  }

  public activate(activate: boolean): void {
    if (activate) {
      this.activationInstant = this._viewActivationInstantProvider.instant;
    }
    this.active$.next(activate);
  }

  public get viewPart(): WorkbenchViewPart {
    // DO NOT resolve the viewpart at construction time because it can change, e.g. when this view is moved to another viewpart.

    // Lookup the viewpart from the element injector.
    // The element injector is only available for the currently active view. Inactive views are removed
    // from the Angular component tree and have, therefore, no element injector.
    const viewPart = this.portal.injector.get(WorkbenchViewPart as Type<WorkbenchViewPart>, null);
    if (viewPart !== null) {
      return viewPart;
    }

    // Resolve the view part from the view part grid.
    const viewPartRef = this._viewPartGridProvider.grid.findContainingViewPartElseThrow(this.viewRef);
    return this._viewPartRegistry.getElseThrow(viewPartRef);
  }

  public close(target?: 'self' | 'all-views' | 'other-views' | 'views-to-the-right' | 'views-to-the-left'): Promise<boolean> {
    switch (target || 'self') {
      case 'self': {
        return this._workbench.destroyView(this.viewRef);
      }
      case 'all-views': {
        return this._workbench.destroyView(...this.viewPart.viewRefs);
      }
      case 'other-views': {
        return this._workbench.destroyView(...Arrays.remove(this.viewPart.viewRefs, this.viewRef));
      }
      case 'views-to-the-right': {
        const viewRefs = this.viewPart.viewRefs;
        return this._workbench.destroyView(...viewRefs.slice(viewRefs.indexOf(this.viewRef) + 1));
      }
      case 'views-to-the-left': {
        const viewRefs = this.viewPart.viewRefs;
        return this._workbench.destroyView(...viewRefs.slice(0, viewRefs.indexOf(this.viewRef)));
      }
    }
  }

  public move(region: 'north' | 'south' | 'west' | 'east' | 'blank-window'): Promise<boolean> {
    this._viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: this._workbench.appInstanceId,
        viewPartRef: this.viewPart.viewPartRef,
        viewRef: this.viewRef,
        viewUrlSegments: this.urlSegments,
      },
      target: {
        appInstanceId: region === 'blank-window' ? 'new' : this._workbench.appInstanceId,
        viewPartRef: region === 'blank-window' ? 'viewpart.1' : this.viewPart.viewPartRef,
        viewPartRegion: region === 'blank-window' ? 'center' : region,
      },
    });
    return Promise.resolve(true);
  }

  public get urlSegments(): UrlSegment[] {
    const urlTree = this._router.parseUrl(this._router.url);
    const urlSegmentGroups = urlTree.root.children;

    const viewOutlet = urlSegmentGroups[this.viewRef];
    if (!viewOutlet) {
      throw Error(`[ViewOutletNotFoundError] View outlet not part of the URL [outlet=${this.viewRef}]`);
    }

    return viewOutlet.segments;
  }

  public registerMenuItem(menuItem: WorkbenchMenuItem): Disposable {
    const factoryFn = (): WorkbenchMenuItem => menuItem;
    this._menuItemProviders$.next([...this._menuItemProviders$.value, factoryFn]);
    return {
      dispose: (): void => this._menuItemProviders$.next(Arrays.remove(this._menuItemProviders$.value, factoryFn)),
    };
  }

  public get destroyed(): boolean {
    return this.portal.isDestroyed;
  }
}

/**
 * A viewpart is a container for multiple views.
 */
export abstract class WorkbenchViewPart {

  /**
   * Viewpart outlet identity which is unique in this application.
   */
  public abstract readonly viewPartRef: string;

  /**
   * Emits the currently active view in this viewpart.
   */
  public abstract get activeViewRef$(): Observable<string | null>;

  /**
   * The currently active view, if any.
   */
  public abstract get activeViewRef(): string | null;

  /**
   * Emits the views opened in this viewpart.
   *
   * Upon subscription, the currently opened views are emitted, and then emits continuously
   * when new views are opened or existing views closed. It never completes.
   */
  public abstract get viewRefs$(): Observable<string[]>;

  public abstract get viewRefs(): string[];

  /**
   * Emits the actions of this viewpart.
   *
   * Upon subscription, the actions are emitted, and then emits continuously
   * when new actions are added or removed. It never completes.
   */
  public abstract get actions$(): Observable<WorkbenchViewPartAction[]>;

  /**
   * Registers an action with this viewpart.
   *
   * Viewpart actions are displayed next to the opened view tabs.
   *
   * @return {@link Disposable} to unregister the action.
   */
  public abstract registerViewPartAction(action: WorkbenchViewPartAction): Disposable;
}

export class InternalWorkbenchViewPart implements WorkbenchViewPart {

  public readonly viewRefs$ = new BehaviorSubject<string[]>([]);
  public readonly actions$ = new BehaviorSubject<WorkbenchViewPartAction[]>([]);
  public readonly activeViewRef$ = new BehaviorSubject<string | null>(null);

  public set viewRefs(viewRefs: string[]) {
    if (!Arrays.equal(viewRefs, this.viewRefs, true)) {
      this.viewRefs$.next(viewRefs);
    }
  }

  public get viewRefs(): string[] {
    return this.viewRefs$.value;
  }

  public set activeViewRef(viewRef: string) {
    if (viewRef !== this.activeViewRef) {
      this.activeViewRef$.next(viewRef);
    }
  }

  public get activeViewRef(): string {
    return this.activeViewRef$.value;
  }

  constructor(public readonly viewPartRef: string,
              public readonly portal: WbComponentPortal<ViewPartComponent>) {
  }

  public registerViewPartAction(action: WorkbenchViewPartAction): Disposable {
    this.actions$.next([...this.actions$.value, action]);
    return {
      dispose: (): void => this.actions$.next(Arrays.remove(this.actions$.value, action)),
    };
  }
}

/**
 * Lifecycle hook that is called when a view component is to be destroyed, and which is called before 'ngOnDestroy'.
 *
 * The return value controls whether destruction should be continued.
 */
export interface WbBeforeDestroy {

  /**
   * Lifecycle hook which is called upon view destruction.
   *
   * Return a falsy value to prevent view destruction, either as a boolean value or as an observable which emits a boolean value.
   */
  wbBeforeDestroy(): Observable<boolean> | Promise<boolean> | boolean;
}

/**
 * Action to be added to an action bar.
 */
export interface WorkbenchAction {
  /**
   * Specifies either a template or a component to render this action.
   */
  templateOrComponent: TemplateRef<void> | { component: ComponentType<any>; injector: Injector };

  /**
   * Specifies where to place this action.
   */
  align?: 'start' | 'end';
}

/**
 * Represents a viewpart action added to the viewpart action bar. Viewpart actions are displayed next to the view tabs.
 */
export interface WorkbenchViewPartAction extends WorkbenchAction {
  /**
   * Sticks this action to given view.
   *
   * If set, the action is only visible if the specified view is the active view in the viewpart.
   */
  viewRef?: string;
}

/**
 * Factory function to create a {@link WorkbenchMenuItem}.
 */
export type WorkbenchMenuItemFactoryFn = (view: WorkbenchView) => WorkbenchMenuItem;

/**
 * Menu item in a menu or context menu.
 */
export interface WorkbenchMenuItem {
  /**
   * Specifies the content of the menu item.
   */
  portal: TemplatePortal | ComponentPortal<any>;
  /**
   * Sets the listener invoked when the user performs the menu action, either by clicking the menu or via keyboard accelerator, if any.
   */
  onAction: () => void;
  /**
   * Allows the user to interact with the menu item using keys on the keyboard, e.g., ['ctrl', 'alt', 1].
   *
   * Supported modifiers are 'ctrl', 'shift', 'alt' and 'meta'.
   */
  accelerator?: string[];
  /**
   * Allows grouping menu items of the same group.
   */
  group?: string;
  /**
   * Allows disabling the menu item based on a condition.
   */
  isDisabled?: () => boolean;
}

