/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable } from '@angular/core';
import { WorkbenchViewPartService } from './view-part/workbench-view-part.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { WorkbenchViewRegistry } from './workbench-view-registry.service';
import { Disposable } from './disposable';
import { WorkbenchMenuItemFactoryFn, WorkbenchViewPartAction } from './workbench.model';
import { UUID } from './uuid.util';
import { ViewOutletNavigator } from './routing/view-outlet-navigator.service';
import { Arrays } from './array.util';
import { PartsLayoutProvider } from './view-part-grid/view-part-grid-provider.service';
import { PartsLayout } from '@scion/workbench';

/**
 * Root object for the SCION Workbench.
 *
 * It consists of one or more viewparts containing views which can be flexibly arranged and dragged around by the user.
 *
 * The Workbench provides core features of a modern rich web application.
 *
 * - tabbed, movable and stackable views
 * - activity panel as application entry point
 * - global notifications
 * - global or view-local message boxes
 * - URL encoded navigational state
 *
 * Activities are modelled in `app.component.html` as content children of <wb-workbench> in the form of <wb-activity> elements.
 *
 * Views are opened via Angular routing mechanism. To open a component in a view, it has to be registered as a route in the routing module.
 * Use `wbRouterLink` directive or `WorkbenchRouter` service for view-based navigation.
 */
export abstract class WorkbenchService {

  /**
   * A unique ID per instance of the app. If opened in a different browser tab, it has a different instance ID.
   */
  public readonly appInstanceId: string;

  /**
   * Destroys the specified workbench view(s) and associated routed component.
   * If it is the last view in the viewpart, the viewpart is removed as well.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public abstract destroyView(...viewIds: string[]): Promise<boolean>;

  /**
   * Activates the specified view.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public abstract activateView(viewId: string): Promise<boolean>;

  /**
   * Returns the identity of the viewpart which contains the specified view.
   *
   * Throws an error if no viewpart contains the view.
   */
  public abstract resolveViewPart(viewId: string): string;

  /**
   * Emits the views opened in the workbench.
   *
   * Upon subscription, the currently opened views are emitted, and then emits continuously
   * when new views are opened or existing views closed. It never completes.
   */
  public abstract get views$(): Observable<string[]>;

  /**
   * Registers an action which is added to every viewpart.
   *
   * Viewpart actions are displayed next to the opened view tabs.
   *
   * @return {@link Disposable} to unregister the action.
   */
  public abstract registerViewPartAction(action: WorkbenchViewPartAction): Disposable;

  /**
   * Registers a view menu item which is added to the context menu of every view tab.
   *
   * The factory function is invoked with the view as its argument when the menu is about to show.
   *
   * @return {@link Disposable} to unregister the menu item.
   */
  public abstract registerViewMenuItem(factoryFn: WorkbenchMenuItemFactoryFn): Disposable;

  public abstract getPartsLayout(): PartsLayout;

  public abstract updateLayout(partsLayout: PartsLayout): void;
}

@Injectable()
export class InternalWorkbenchService implements WorkbenchService {

  private _activeViewPartService: WorkbenchViewPartService;
  private _viewPartServices: WorkbenchViewPartService[] = [];
  public readonly viewPartActions$ = new BehaviorSubject<WorkbenchViewPartAction[]>([]);
  public readonly viewMenuItemProviders$ = new BehaviorSubject<WorkbenchMenuItemFactoryFn[]>([]);
  public readonly appInstanceId = UUID.randomUUID();

  constructor(private _viewOutletNavigator: ViewOutletNavigator,
              private _partsLayoutProvider: PartsLayoutProvider,
              private _viewRegistry: WorkbenchViewRegistry) {
  }

  public destroyView(...viewIds: string[]): Promise<boolean> {
    const destroyViewFn = (viewId: string): Promise<boolean> => {
      return this._viewOutletNavigator.navigate({
        viewOutlet: {name: viewId, commands: null},
        partsLayout: this._partsLayoutProvider.layout
          .removeView(viewId)
          .serialize(),
      });
    };

    // Use a separate navigate command to remove each view separately. Otherwise, if a view would reject destruction,
    // no view would be removed at all. Also, removal must be done sequentially to have a proper grid snapshot.
    return viewIds.reduce((prevDestroyPromise, viewId) => {
      return prevDestroyPromise.then(() => destroyViewFn(viewId));
    }, Promise.resolve(true));
  }

  public activateView(viewId: string): Promise<boolean> {
    return this.resolveViewPartServiceElseThrow(viewId).activateView(viewId);
  }

  public resolveViewPart(viewId: string): string {
    return this.resolveViewPartServiceElseThrow(viewId).partId;
  }

  private resolveViewPartServiceElseThrow(viewId: string): WorkbenchViewPartService | null {
    const viewPartService = this._viewPartServices.find(it => it.containsView(viewId));
    if (!viewPartService) {
      throw Error(`No ViewPartService for View found [view=${viewId}]`);
    }
    return viewPartService;
  }

  public registerViewPartService(viewPartService: WorkbenchViewPartService): void {
    this._viewPartServices.push(viewPartService);
  }

  public unregisterViewPartService(viewPartService: WorkbenchViewPartService): void {
    const index = this._viewPartServices.indexOf(viewPartService);
    this._viewPartServices.splice(index, 1);
    if (viewPartService === this.activeViewPartService) {
      this.activeViewPartService = this._viewPartServices[index] || this._viewPartServices[this._viewPartServices.length - 1];
    }
  }

  /**
   * Sets the active viewpart service for this workbench.
   */
  public set activeViewPartService(viewPart: WorkbenchViewPartService) {
    this._activeViewPartService = viewPart;
  }

  /**
   * Returns the active viewpart service for this workbench, or `null` if no viewpart is currently active.
   */
  public get activeViewPartService(): WorkbenchViewPartService {
    return this._activeViewPartService;
  }

  public get views$(): Observable<string[]> {
    return this._viewRegistry.viewIds$;
  }

  public registerViewPartAction(action: WorkbenchViewPartAction): Disposable {
    this.viewPartActions$.next([...this.viewPartActions$.value, action]);
    return {
      dispose: (): void => this.viewPartActions$.next(this.viewPartActions$.value.filter(it => it !== action)),
    };
  }

  public registerViewMenuItem(factoryFn: WorkbenchMenuItemFactoryFn): Disposable {
    this.viewMenuItemProviders$.next([...this.viewMenuItemProviders$.value, factoryFn]);
    return {
      dispose: (): void => this.viewMenuItemProviders$.next(Arrays.remove(this.viewMenuItemProviders$.value, factoryFn)),
    };
  }

  public getPartsLayout(): PartsLayout {
    return this._partsLayoutProvider.layout;
  }

  public updateLayout(partsLayout: PartsLayout): void {
    this._viewOutletNavigator.navigate({partsLayout: partsLayout.serialize()});
  }
}
