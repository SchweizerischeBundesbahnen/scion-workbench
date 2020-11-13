/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { NavigationExtras, Router } from '@angular/router';
import { WorkbenchViewRegistry } from '../view/workbench-view.registry';
import { Defined } from '@scion/toolkit/util';
import { ViewOutletNavigator } from './view-outlet-navigator.service';
import { Injectable, IterableChanges } from '@angular/core';
import { WorkbenchLayoutService } from '../workbench-layout.service';
import { VIEW_NAV_STATE } from '../workbench.constants';
import { ɵWorkbenchService } from '../ɵworkbench.service';
import { PartsLayout } from '../layout/parts-layout';
import { filter, take } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

/**
 * Provides workbench view navigation capabilities based on Angular Router.
 */
@Injectable()
export class WorkbenchRouter {

  private _currentNavigationContext$ = new BehaviorSubject<WorkbenchNavigationContext>(null);

  constructor(private _router: Router,
              private _viewOutletNavigator: ViewOutletNavigator,
              private _workbench: ɵWorkbenchService,
              private _viewRegistry: WorkbenchViewRegistry,
              private _layoutService: WorkbenchLayoutService) {
  }

  /**
   * Navigates based on the provided array of commands, and is like 'Router.navigate(...)' but with a workbench view as the router outlet target.
   *
   * By default, navigation is absolute. Make it relative by providing a `relativeTo` route in navigational extras.
   * Navigation allows to close present views matching the routing commands if `closeIfPresent` is set in navigational extras.
   *
   * - Target view can be set via {WbNavigationExtras} object.
   * - Multiple static segments can be merged into one, e.g. `['/team/11/user', userName, {details: true}]`
   * - The first segment name can be prepended with `/`, `./`, or `../`
   * - Matrix parameters can be used to associate optional data with the URL, e.g. `['user', userName, {details: true}]`
   *   Matrix parameters are like regular URL parameters, but do not affect route resolution. Unlike query parameters, matrix parameters
   *   are not global but part of the routing path, which makes them suitable for auxiliary routes.
   *
   * ### Usage
   *
   * ```
   * router.navigate(['team', 33, 'user', 11]);
   * router.navigate(['team/11/user', userName, {details: true}]); // multiple static segments can be merged into one
   * router.navigate(['teams', {selection: 33'}]); // matrix parameter 'selection' with the value '33'.
   * ```
   *
   * @see WbRouterLinkDirective
   */
  public async navigate(commandList: any[], extras: WbNavigationExtras = {}): Promise<boolean> {
    const commands = this._viewOutletNavigator.normalizeCommands(commandList, extras.relativeTo);

    // Wait until the initial layout is available, i.e., after completion of Angular's initial navigation.
    // Otherwise, would override the initial layout as given in the URL.
    await this.waitForInitialLayout();

    // Do not interfere with a potentially running navigation. For example, if observing the view registry,
    // you would get events during navigation. If you would then start an extra navigation, e.g., when the
    // view count drops to zero, this could end up in an invalid routing state.
    await this.waitForNavigationToComplete();

    if (extras.closeIfPresent) {
      return this._workbench.destroyView(...this._viewOutletNavigator.resolvePresentViewIds(commands));
    }

    const activateIfPresent = Defined.orElse(extras.activateIfPresent, !commands.includes('new') && !commands.includes('create') /* coerce activation based on command segment names */);
    // If the view is present, activate it.
    if (activateIfPresent) {
      const presentViewId = this._viewOutletNavigator.resolvePresentViewIds(commands)[0];
      if (presentViewId) {
        return this._workbench.activateView(presentViewId);
      }
    }

    switch (extras.target || 'blank') {
      case 'blank': {
        const newViewId = this._viewRegistry.computeNextViewOutletIdentity();
        const viewNavigation: ViewNavigation = {
          partId: extras.blankPartId,
          viewIndex: extras.blankInsertionIndex,
        };

        return this._viewOutletNavigator.navigate({
          viewOutlet: {name: newViewId, commands},
          partsLayout: this._layoutService.layout.serialize(),
          extras: {
            ...extras,
            relativeTo: null, // commands are absolute because normalized
            state: {
              ...extras.state,
              [VIEW_NAV_STATE]: viewNavigation,
            },
          },
        });
      }
      case 'self': {
        if (!extras.selfViewId) {
          throw Error('[WorkbenchRouterError] Missing required navigation property \'selfViewId\'.');
        }

        const urlTree = this._router.parseUrl(this._router.url);
        const urlSegmentGroups = urlTree.root.children;
        if (!urlSegmentGroups[extras.selfViewId]) {
          throw Error(`[WorkbenchRouterError] Target view outlet not found: ${extras.selfViewId}'`);
        }

        return this._viewOutletNavigator.navigate({
          viewOutlet: {name: extras.selfViewId, commands},
          partsLayout: this._layoutService.layout.serialize(),
          extras: {
            ...extras,
            relativeTo: null, // commands are absolute because normalized
          },
        });
      }
      default: {
        throw Error(`[WorkbenchRouterError] Invalid routing target. Expected 'self' or 'blank', but received ${extras.target}'.`);
      }
    }
  }

  /**
   * Returns the context of the current workbench navigation, when being invoked during navigation, or throws an error otherwise.
   *
   * @internal
   */
  public getCurrentNavigationContext(): WorkbenchNavigationContext {
    const context = this._currentNavigationContext$.value;
    if (!context) {
      throw Error('[WorkbenchRouterError] Navigation context not available as no navigation is in progress.');
    }
    return context;
  }

  /**
   * Sets navigational contextual data.
   *
   * @internal
   */
  public setCurrentNavigationContext(context: WorkbenchNavigationContext): void {
    this._currentNavigationContext$.next(context);
  }

  /**
   * Waits for a potentially running navigation to complete. Resolves immediately if there is no navigation in progress.
   */
  private async waitForNavigationToComplete(): Promise<void> {
    await this._currentNavigationContext$
      .pipe(
        filter(context => context === null),
        take(1),
      )
      .toPromise();
  }

  /**
   * Blocks until the initial layout is available, i.e. after completion of Angular's initial navigation.
   */
  private async waitForInitialLayout(): Promise<void> {
    await this._layoutService.layout$
      .pipe(take(1))
      .toPromise();
  }
}

/**
 * Represents the extra options used during navigation.
 */
export interface WbNavigationExtras extends NavigationExtras {
  /**
   * Activates the view if it is already present.
   * If not present, the view is opened according to the specified 'target' strategy.
   */
  activateIfPresent?: boolean;
  /**
   * Closes the view(s) that match the array of commands, if any.
   */
  closeIfPresent?: boolean;
  /**
   * Controls where to open the view.
   *
   * 'blank': opens the view in a new view tab (which is by default)
   * 'self':  opens the view in the current view tab
   */
  target?: 'blank' | 'self';
  /**
   * Specifies the view which to replace when using 'self' view target strategy.
   * If not specified and if in the context of a workbench view, that view is used as the self target.
   */
  selfViewId?: string;
  /**
   * Specifies the viewpart where to add the view when using 'blank' view target strategy.
   * If not specified, the currently active workbench viewpart is used.
   */
  blankPartId?: string;
  /**
   * Specifies the position where to insert the view into the tab bar when using 'blank' view target strategy.
   * If not specified, the view is inserted after the active view. Set the index to 'start' or 'end' for inserting
   * the view at the beginning or at the end.
   */
  blankInsertionIndex?: number | 'start' | 'end';
}

/**
 * Contains information about the view navigation.
 *
 * @internal
 */
export interface ViewNavigation {
  /**
   * Specifies the part where to add a view. If not set, adds it to its preferred part, if defined on its route, or to the currently active part.
   */
  partId?: string;
  /**
   * Specifies the position where to add the view tab into the tabbar.
   */
  viewIndex?: number | 'start' | 'end';
}

/**
 * Contextual data of a workbench navigation.
 *
 * @internal
 */
export interface WorkbenchNavigationContext {
  /**
   * Layout to be applied after successful navigation.
   */
  partsLayout: PartsLayout;
  /**
   * Parts that are added or removed by this navigation.
   */
  partChanges: IterableChanges<string> | null;
  /**
   * Views outlets that are added or removed by this navigation.
   */
  viewOutletChanges: IterableChanges<string> | null;
}
