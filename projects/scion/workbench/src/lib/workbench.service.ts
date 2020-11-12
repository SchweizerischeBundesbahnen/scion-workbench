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
import { BehaviorSubject, Observable } from 'rxjs';
import { WorkbenchViewRegistry } from './view/workbench-view.registry';
import { Disposable } from './disposable';
import { InternalWorkbenchViewPart, WorkbenchMenuItemFactoryFn, WorkbenchViewPartAction } from './workbench.model';
import { ViewOutletNavigator } from './routing/view-outlet-navigator.service';
import { Arrays } from '@scion/toolkit/util';
import { UUID } from '@scion/toolkit/uuid';
import { WorkbenchLayoutService } from './workbench-layout.service';
import { WorkbenchViewPartRegistry } from './view-part/workbench-view-part.registry';

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
}

@Injectable()
export class InternalWorkbenchService implements WorkbenchService {

  public readonly viewPartActions$ = new BehaviorSubject<WorkbenchViewPartAction[]>([]);
  public readonly viewMenuItemProviders$ = new BehaviorSubject<WorkbenchMenuItemFactoryFn[]>([]);
  public readonly appInstanceId = UUID.randomUUID();

  constructor(private _viewOutletNavigator: ViewOutletNavigator,
              private _layoutService: WorkbenchLayoutService,
              private _viewPartRegistry: WorkbenchViewPartRegistry,
              private _viewRegistry: WorkbenchViewRegistry) {
  }

  public destroyView(...viewIds: string[]): Promise<boolean> {
    const destroyViewFn = (viewId: string): Promise<boolean> => {
      return this._viewOutletNavigator.navigate({
        viewOutlet: {name: viewId, commands: null},
        partsLayout: this._layoutService.layout
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
    return this.resolveViewPartElseThrow(viewId).activateView(viewId);
  }

  public resolveViewPart(viewId: string): string {
    return this.resolveViewPartElseThrow(viewId).partId;
  }

  private resolveViewPartElseThrow(viewId: string): InternalWorkbenchViewPart | null {
    const part = this._layoutService.layout.findPartByViewId(viewId, {orElseThrow: true});
    return this._viewPartRegistry.getElseThrow(part.partId);
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
      dispose: (): void => this.viewMenuItemProviders$.next(Arrays.remove(this.viewMenuItemProviders$.value, factoryFn, {firstOnly: false})),
    };
  }
}
