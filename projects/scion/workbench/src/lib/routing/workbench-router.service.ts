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
import { InternalWorkbenchService } from '../workbench.service';
import { WorkbenchViewRegistry } from '../workbench-view-registry.service';
import { Defined } from '../defined.util';
import { WorkbenchViewPartRegistry } from '../view-part-grid/workbench-view-part-registry.service';
import { ViewPartGrid } from '../view-part-grid/view-part-grid.model';
import { ViewOutletNavigator } from './view-outlet-navigator.service';
import { Injectable } from '@angular/core';

/**
 * Provides workbench view navigation capabilities based on Angular Router.
 */
@Injectable()
export class WorkbenchRouter {

  constructor(private _router: Router,
              private _viewOutletNavigator: ViewOutletNavigator,
              private _workbench: InternalWorkbenchService,
              private _viewRegistry: WorkbenchViewRegistry,
              private _viewPartRegistry: WorkbenchViewPartRegistry) {
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
  public navigate(commandList: any[], extras: WbNavigationExtras = {}): Promise<boolean> {
    const commands = this._viewOutletNavigator.normalizeCommands(commandList, extras.relativeTo);

    if (extras.closeIfPresent) {
      return this._workbench.destroyView(...this._viewOutletNavigator.resolvePresentViewRefs(commands));
    }

    const activateIfPresent = Defined.orElse(extras.activateIfPresent, !commands.includes('new') && !commands.includes('create') /* coerce activation based on command segment names */);
    // If the view is present, activate it.
    if (activateIfPresent) {
      const presentViewRef = this._viewOutletNavigator.resolvePresentViewRefs(commands)[0];
      if (presentViewRef) {
        return this._workbench.activateView(presentViewRef);
      }
    }

    switch (extras.target || 'blank') {
      case 'blank': {
        const viewPartGrid = this._viewPartRegistry.grid;
        const newViewRef = this._viewRegistry.computeNextViewOutletIdentity();
        const viewPartRef = extras.blankViewPartRef || (this._workbench.activeViewPartService && this._workbench.activeViewPartService.viewPartRef) || viewPartGrid.viewPartRefs()[0];
        const viewInsertionIndex = this.coerceViewInsertionIndex(extras.blankInsertionIndex, viewPartRef, viewPartGrid);
        return this._viewOutletNavigator.navigate({
          viewOutlet: {name: newViewRef, commands},
          viewGrid: viewPartGrid.addView(viewPartRef, newViewRef, viewInsertionIndex).serialize(),
          extras: {
            ...extras,
            relativeTo: null, // commands are absolute because normalized
          },
        });
      }
      case 'self': {
        if (!extras.selfViewRef) {
          throw Error('Invalid argument: navigation property \'selfViewRef\' required for routing view target \'self\'.');
        }

        const urlTree = this._router.parseUrl(this._router.url);
        const urlSegmentGroups = urlTree.root.children;
        if (!urlSegmentGroups[extras.selfViewRef]) {
          throw Error(`Invalid argument: '${extras.selfViewRef}' is not a valid view outlet.`);
        }

        return this._viewOutletNavigator.navigate({
          viewOutlet: {name: extras.selfViewRef, commands},
          viewGrid: this._viewPartRegistry.grid.serialize(),
          extras: {
            ...extras,
            relativeTo: null, // commands are absolute because normalized
          },
        });
      }
      default: {
        throw Error('Not supported routing view target.');
      }
    }
  }

  /**
   * Computes the index for 'start' or 'last' literals, or coerces the index to a number.
   * If `undefined` is given as insertion index, it returns the position after the currently active view.
   */
  private coerceViewInsertionIndex(insertionIndex: number | 'start' | 'end' | undefined, viewPartRef: string, viewPartGrid: ViewPartGrid): number {
    switch (insertionIndex) {
      case undefined: {  // index after the active view, if any, or after the last view otherwise
        const viewPart = viewPartGrid.getViewPartElseThrow(viewPartRef);
        const index = viewPart.viewRefs.indexOf(viewPart.activeViewRef);
        return (index > -1 ? index + 1 : viewPartGrid.getViewPartElseThrow(viewPartRef).viewRefs.length);
      }
      case 'start': {
        return 0;
      }
      case 'end': {
        return viewPartGrid.getViewPartElseThrow(viewPartRef).viewRefs.length;
      }
      default: {
        return insertionIndex;
      }
    }
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
  selfViewRef?: string;
  /**
   * Specifies the viewpart where to add the view when using 'blank' view target strategy.
   * If not specified, the currently active workbench viewpart is used.
   */
  blankViewPartRef?: string;
  /**
   * Specifies the position where to insert the view into the tab bar when using 'blank' view target strategy.
   * If not specified, the view is inserted after the active view. Set the index to 'start' or 'end' for inserting
   * the view at the beginning or at the end.
   */
  blankInsertionIndex?: number | 'start' | 'end' | undefined;
}
