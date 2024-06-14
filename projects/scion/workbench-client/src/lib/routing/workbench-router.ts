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
 * Enables navigation of workbench views.
 *
 * A view is a visual workbench element for displaying content side-by-side or stacked.
 *
 * A microfrontend provided as a view capability can be opened in a view. The qualifier differentiates between different
 * view capabilities. An application can open the public view capabilities of other applications if it manifests a respective
 * intention.
 *
 * @category Router
 * @category View
 */
export class WorkbenchRouter {

  /**
   * Navigates to a microfrontend of a view capability based on the given qualifier and extras.
   *
   * By default, the router opens a new view if no view is found that matches the specified qualifier and required params. Optional parameters do not affect view resolution.
   * If one or more views match the qualifier and required params, they will be navigated instead of opening the microfrontend in a new view tab.
   * This behavior can be changed by setting an explicit navigation target in navigation extras.
   *
   * @param  qualifier - Identifies the view capability that provides the microfrontend to display in a view.
   *                     Passing an empty qualifier (`{}`) allows the microfrontend to update its parameters, restoring updated parameters when the page reloads.
   *                     Parameter handling can be controlled using the {@link WorkbenchNavigationExtras#paramsHandling} option.
   * @param  extras - Options to control navigation.
   * @return Promise that resolves to `true` on successful navigation, or `false` otherwise.
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
        throw Error('[NavigateError] Self-navigation is supported only if in the context of a view.');
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
   * Passes data to the view.
   *
   * The view can declare mandatory and optional parameters. No additional parameters are allowed. Refer to the documentation of the capability for more information.
   */
  params?: Map<string, any> | Dictionary;
  /**
   * Instructs the workbench router how to handle params in self-navigation.
   *
   * Self-navigation allows the microfrontend to update its parameters, restoring updated parameters when the page reloads.
   * Setting a `paramsHandling` strategy has no effect on navigations other than self-navigation. A self-navigation is
   * initiated by passing an empty qualifier.
   *
   * One of:
   * * `replace`: Replaces current parameters (default).
   * * `merge`:   Merges new parameters with current parameters, with new parameters of equal name overwriting existing parameters.
   *              A parameter can be removed by passing `undefined` as its value.
   */
  paramsHandling?: 'merge' | 'replace';
  /**
   * Controls where to open the view. Default is `auto`.
   *
   * One of:
   * - 'auto':   Navigates existing views that match the qualifier and required params, or opens a new view otherwise. Optional parameters do not affect view resolution.
   * - 'blank':  Navigates in a new view.
   * - <viewId>: Navigates the specified view. If already opened, replaces it, or opens a new view otherwise.
   */
  target?: string | 'blank' | 'auto';
  /**
   * Controls which part to navigate views in.
   *
   * If target is `blank`, opens the view in the specified part.
   * If target is `auto`, navigates matching views in the specified part, or opens a new view in that part otherwise.
   *
   * If the specified part is not in the layout, opens the view in the active part, with the active part of the main area taking precedence.
   */
  partId?: string;
  /**
   * Instructs the router to activate the view. Default is `true`.
   */
  activate?: boolean;
  /**
   * Closes views that match the specified qualifier and required parameters. Optional parameters do not affect view resolution.
   *
   * The parameters support the asterisk wildcard value (`*`) to match views with any value for a parameter.
   *
   * Only views for which the application has an intention can be closed.
   */
  close?: boolean;
  /**
   * Specifies where to insert the view into the tab bar. Has no effect if navigating an existing view. Default is after the active view.
   */
  position?: number | 'start' | 'end' | 'before-active-view' | 'after-active-view';
  /**
   * Specifies CSS class(es) to add to the view, e.g., to locate the view in tests.
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
