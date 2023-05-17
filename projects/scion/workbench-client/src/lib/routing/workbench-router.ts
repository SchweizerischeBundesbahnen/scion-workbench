/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {IntentClient, mapToBody, MessageClient, Qualifier, RequestError} from '@scion/microfrontend-platform';
import {Beans} from '@scion/toolkit/bean-manager';
import {WorkbenchView} from '../view/workbench-view';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';
import {Dictionaries, Dictionary, Maps} from '@scion/toolkit/util';
import {ɵWorkbenchCommands} from '../ɵworkbench-commands';
import {lastValueFrom} from 'rxjs';

/**
 * Allows navigating to a microfrontend in a workbench view.
 *
 * A view is a visual workbench component for displaying content stacked or side-by-side.
 *
 * In SCION Workbench Client, routing means instructing a workbench view to display the microfrontend of a registered view capability.
 * A qualifier is used to differentiate view capabilities. A micro application can provide multiple view capabilities and make them
 * publicly available to other micro applications.
 *
 * As a prerequisite for routing, the navigating micro application must declare a fulfilling view intention in its manifest unless navigating
 * to views that the app provides itself. Navigation to microfrontends of other apps is only allowed for public view capabilities.
 *
 * @category Router
 * @category View
 */
export class WorkbenchRouter {

  /**
   * Navigates to a view microfrontend based on the given qualifier.
   *
   * The qualifier identifies the view microfrontend(s) which to open. If multiple view microfrontends match the qualifier, they are all opened.
   *
   * By passing navigation extras, you can control where the microfrontend should open. By default, the router opens the microfrontend in a new view
   * tab if no view is found that matches the specified qualifier and required params. Optional parameters do not affect view resolution. If one
   * (or more) view(s) match the qualifier and required params, they are navigated instead of opening the microfrontend in a new view tab.
   *
   * @param  qualifier - Identifies the view capability that provides the microfrontend.
   *                     By passing an empty qualifier (`{}`), the currently loaded microfrontend can update its parameters in the workbench URL,
   *                     e.g., to support persistent navigation. This type of navigation is referred to as self-navigation and is supported only
   *                     if in the context of a view. Setting {@link WorkbenchNavigationExtras#paramsHandling} allows instructing the workbench
   *                     router how to handle params. By default, new params replace params contained in the URL.
   * @param  extras - Options to control navigation.
   * @return Promise that resolves to `true` when navigation succeeds, to `false` when navigation fails, or is rejected on error,
   *         e.g., if not qualified or because no application provides the requested view.
   */
  public async navigate(qualifier: Qualifier | {}, extras?: WorkbenchNavigationExtras): Promise<boolean> {
    if (this.isSelfNavigation(qualifier)) {
      return this.updateViewParams(extras);
    }
    else {
      return this.issueViewIntent(qualifier, extras);
    }
  }

  private async issueViewIntent(qualifier: Qualifier | {}, extras?: WorkbenchNavigationExtras): Promise<boolean> {
    const navigationExtras: WorkbenchNavigationExtras = {
      ...extras,
      params: undefined,         // included in the intent
      paramsHandling: undefined, // only applicable for self-navigation
    };
    const navigate$ = Beans.get(IntentClient).request$<boolean>({type: WorkbenchCapabilities.View, qualifier, params: Maps.coerce(extras?.params)}, navigationExtras);
    try {
      return await lastValueFrom(navigate$.pipe(mapToBody()));
    }
    catch (error) {
      throw (error instanceof RequestError ? error.message : error);
    }
  }

  private async updateViewParams(extras?: WorkbenchNavigationExtras): Promise<boolean> {
    const viewCapabilityId = Beans.get(WorkbenchView).snapshot.params.get(ɵMicrofrontendRouteParams.ɵVIEW_CAPABILITY_ID);
    if (viewCapabilityId === undefined) {
      return false; // Params cannot be updated until the loading of the view is completed
    }

    const command: ɵViewParamsUpdateCommand = {
      params: Dictionaries.coerce(extras?.params),
      paramsHandling: extras?.paramsHandling,
    };
    const updateParams$ = Beans.get(MessageClient).request$<boolean>(ɵWorkbenchCommands.viewParamsUpdateTopic(Beans.get(WorkbenchView).id, viewCapabilityId), command);
    try {
      return await lastValueFrom(updateParams$.pipe(mapToBody()));
    }
    catch (error) {
      throw (error instanceof RequestError ? error.message : error);
    }
  }

  private isSelfNavigation(qualifier: Qualifier | {}): boolean {
    if (!qualifier || Object.keys(qualifier).length === 0) {
      if (!Beans.opt(WorkbenchView)) {
        throw Error('[WorkbenchRouterError] Self-navigation is supported only if in the context of a view.');
      }
      return true;
    }
    return false;
  }
}

/**
 * Options to control the navigation.
 *
 * @category Router
 * @category View
 */
export interface WorkbenchNavigationExtras {
  /**
   * Allows passing additional data to the microfrontend. In contrast to the qualifier, params have no effect on the intent routing.
   * If the fulfilling capability(-ies) declare(s) mandatory parameters, be sure to include them, otherwise navigation will be rejected.
   */
  params?: Map<string, any> | Dictionary;
  /**
   * Instructs the workbench router how to handle params in self-navigation.
   *
   * Self-navigation allows a view to update its parameters in the workbench URL to support persistent navigation. Setting a `paramsHandling`
   * strategy has no effect on navigations other than self-navigation. A self-navigation is initiated by passing an empty qualifier.
   *
   * One of:
   * * `replace`: Discards parameters in the URL and uses the new parameters instead (which is by default if not set).
   * * `merge`:   Merges new parameters with the parameters currently contained in the URL. In case of a key collision, new parameters overwrite
   *              the parameters contained in the URL. A parameter can be removed by passing `undefined` as its value.
   */
  paramsHandling?: 'merge' | 'replace';
  /**
   * Instructs the router to activate the view. Defaults to `true` if not specified.
   */
  activate?: boolean;
  /**
   * Closes the view(s) that match the specified qualifier and required parameter(s). Optional parameters do not affect view resolution.
   *
   * To match views with any value for a specific required parameter, use the asterisk wildcard character (`*`) as the parameter value.
   *
   * Note that you can only close view(s) for which you have an intention and which are visible to your app.
   */
  close?: boolean;
  /**
   * Controls where to open the view.
   *
   * One of:
   * - 'auto':    Opens the microfrontend in a new view tab if no view is found that matches the specified qualifier and required params. Optional parameters
   *              do not affect view resolution. If one (or more) view(s) match the qualifier and required params, they are navigated instead of
   *              opening the microfrontend in a new view tab, e.g., to update optional parameters. This is the default behavior if not set.
   * - 'blank':   Opens the microfrontend in a new view tab.
   * - <view.id>: Navigates the specified view. If already opened, replaces it, or opens the view in a new view tab otherwise.
   *              Note that the passed view identifier must start with `view.`, e.g., `view.5`.
   *
   * If not specified, defaults to `auto`.
   */
  target?: string | 'blank' | 'auto';
  /**
   * Specifies the position where to insert the view into the tab bar when using 'blank' view target strategy.
   * If not specified, the view is inserted after the active view. Set the index to 'start' or 'end' for inserting
   * the view at the beginning or at the end.
   */
  blankInsertionIndex?: number | 'start' | 'end';
  /**
   * Specifies CSS class(es) to be added to the view, useful in end-to-end tests for locating view and view tab.
   * CSS class(es) will not be added to the browser URL, consequently will not survive a page reload.
   */
  cssClass?: string | string[];
}

/**
 * Command object for instructing the Workbench Router to update view params in self-navigation.
 *
 * @docs-private Not public API, intended for internal use only.
 * @ignore
 */
export interface ɵViewParamsUpdateCommand {
  /**
   * @see WorkbenchNavigationExtras#params
   */
  params: Dictionary;
  /**
   * @see WorkbenchNavigationExtras#paramsHandling
   */
  paramsHandling?: 'merge' | 'replace';
}

/**
 * Named parameters used in microfrontend routes.
 *
 * @docs-private Not public API, intended for internal use only.
 * @ignore
 */
export enum ɵMicrofrontendRouteParams {
  /**
   * Named path segment in the microfrontend route representing the view capability for which to embed its microfrontend.
   */
  ɵVIEW_CAPABILITY_ID = 'ɵViewCapabilityId',
}
