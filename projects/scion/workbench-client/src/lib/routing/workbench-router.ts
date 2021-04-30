/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Intent, IntentClient, ManifestService, mapToBody, MessageClient, Qualifier, QualifierMatcher, RequestError } from '@scion/microfrontend-platform';
import { Beans } from '@scion/toolkit/bean-manager';
import { WorkbenchViewCapability } from '../view/workbench-view-capability';
import { catchError, take } from 'rxjs/operators';
import { WorkbenchView } from '../view/workbench-view';
import { WorkbenchCapabilities } from '../workbench-capabilities.enum';
import { Dictionary, Maps } from '@scion/toolkit/util';
import { ɵWorkbenchCommands } from '../ɵworkbench-commands';
import { ɵWorkbenchRouterNavigateCommand } from './workbench-router-navigate-command';
import { throwError } from 'rxjs';
import { filterArray } from '@scion/toolkit/operators';

/**
 * Allows navigating to a microfrontend in a workbench view.
 *
 * A view is a visual workbench component for displaying content stacked or arranged side by side in the workbench layout.
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
   * The qualifier identifies the microfrontend which to display in a workbench view. When you navigate in the context of a view microfrontend,
   * by default, that microfrontend is replaced, unless you set a different target strategy via navigation extras.
   *
   * Using the navigation extras you can control whether to navigate to an already open view or close views.
   *
   * If multiple view capabilities match the qualifier, they are all opened.
   *
   * @param  qualifier - Identifies the view capability that provides the microfrontend.
   *                     By passing an empty qualifier (`{}`), the currently loaded view can update its parameters in the workbench URL, e.g., to support
   *                     persistent navigation. This type of navigation is referred to as self-navigation and is supported only if in the context
   *                     of a view. Setting {@link WorkbenchNavigationExtras#paramsHandling} allows instructing the workbench router how to handle
   *                     params. By default, new params replace params contained in the URL.
   * @param  extras - Options to control navigation.
   * @return Promise that resolves to `true` when navigation succeeds, to `false` when navigation fails, or is rejected on error,
   *         e.g., if not qualified or because no application provides the requested view.
   */
  public async navigate(qualifier: Qualifier | {}, extras?: WorkbenchNavigationExtras): Promise<boolean> {
    // To be able to integrate views from apps without workbench integration, we do not delegate the navigation to the app
    // that provides the requested view, but interact with the workbench directly. Nevertheless, we issue an intent so that
    // the platform throws an error in case of unqualified interaction.
    if (!this.isSelfNavigation(qualifier)) {
      await Beans.get(IntentClient).publish({type: WorkbenchCapabilities.View, qualifier, params: Maps.coerce(extras?.params)}, extras);
    }

    const navigateCommand = await this.constructNavigateCommand(qualifier, extras);
    return Beans.get(MessageClient).request$<boolean>(ɵWorkbenchCommands.navigate, navigateCommand)
      .pipe(
        mapToBody(),
        catchError(error => throwError(error instanceof RequestError ? error.message : error)),
      )
      .toPromise();
  }

  /**
   * Constructs the command to instruct the Workbench Router to navigate to the microfrontend of given view capability(-ies).
   */
  private async constructNavigateCommand(qualifier: Qualifier, extras: WorkbenchNavigationExtras | undefined): Promise<ɵWorkbenchRouterNavigateCommand> {
    if (this.isSelfNavigation(qualifier)) {
      const {intent, capability} = await this.currentNavigation();
      return {
        capabilities: [capability],
        qualifier: intent.qualifier!, // a view must always be qualified
        extras: {
          ...extras,
          target: 'self',
          selfViewId: Beans.get(WorkbenchView).viewId,
          paramsHandling: extras?.paramsHandling ?? 'replace',
        },
      };
    }

    return {
      capabilities: await this.lookupViewCapabilities(qualifier),
      qualifier,
      extras: {
        ...extras,
        selfViewId: extras?.selfViewId ?? Beans.opt(WorkbenchView)?.viewId,
        paramsHandling: undefined, // `paramsHandling` cannot be set for navigations other than self-navigation
      },
    };
  }

  /**
   * Looks up the requested view capabilities.
   *
   * Returns a Promise that resolves to the requested capabilities. Only capabilities for which the requester is qualified are returned.
   */
  private async lookupViewCapabilities(qualifier: Qualifier): Promise<WorkbenchViewCapability[]> {
    const viewCapabilities = await Beans.get(ManifestService).lookupCapabilities$<WorkbenchViewCapability>({type: WorkbenchCapabilities.View})
      .pipe(
        filterArray(viewCapability => new QualifierMatcher(viewCapability.qualifier, {evalOptional: true, evalAsterisk: true}).matches(qualifier)),
        take(1),
      )
      .toPromise();

    if (viewCapabilities.length === 0) {
      throw Error(`[NullProviderError] Qualifier matches no view capability. Maybe, the requested view capability is not public API or the providing application not available. [type=${WorkbenchCapabilities.View}, qualifier=${JSON.stringify(qualifier)}]`);
    }

    return viewCapabilities;
  }

  private async currentNavigation(): Promise<CurrentNavigation> {
    const view = Beans.get(WorkbenchView);
    const currentCapability = await view.capability$
      .pipe(take(1))
      .toPromise();
    const currentParams = await view.params$
      .pipe(take(1))
      .toPromise();

    return {
      capability: currentCapability,
      intent: this.deriveViewIntent(currentCapability.qualifier!, currentParams), // a view must always be qualified
    };
  }

  /**
   * Checks whether requesting a self-navigation.
   *
   * Self-navigation must be performed in the context of a view, allowing a view to update its parameters in the workbench URL
   * to support persistent navigation. A self-navigation is initiated by passing an empty qualifier.
   */
  private isSelfNavigation(qualifier: Qualifier): boolean {
    if (!Beans.opt(WorkbenchView)) {
      return false;
    }
    return !qualifier || Object.keys(qualifier).length === 0;
  }

  /**
   * Derives the intent that was issued to open the view of the passed capability.
   */
  private deriveViewIntent(capabilityQualifier: Qualifier, params: Map<string, any>): Intent {
    const intentQualifier = Object.entries(capabilityQualifier).reduce<Qualifier>((acc, [key, value]) => {
      if (!params.has(key) && value !== '?') {
        throw Error(`[ViewContextError] Missing required qualifier param '${key}'.`);
      }

      if (params.has(key)) {
        acc[key] = params.get(key);
      }
      return acc;
    }, {});

    return {type: WorkbenchCapabilities.View, qualifier: intentQualifier};
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
  paramsHandling?: 'merge' | 'replace' | undefined;

  /**
   * Activates the view if present. Note that you can only activate views for which you have an intention and which are visible to your app.
   * If no qualified view is present, the requested view is opened according to the specified target strategy.
   */
  activateIfPresent?: boolean;
  /**
   * Closes views matching the qualifier. Note that you can only close views for which you have an intention and which are visible to your app.
   */
  closeIfPresent?: boolean;
  /**
   * Controls where to open the view.
   *
   * One of:
   * * `self`:  Opens the microfrontend in the current view tab, replacing the currently displaying microfrontend (which is by default if not set).
   * * `blank`: Opens the microfrontend in a new view tab.
   */
  target?: 'self' | 'blank';
  /**
   * Specifies the view which to replace when using 'self' view target strategy.
   * If not specified and if in the context of a workbench microfrontend view, the current view is used as the target.
   */
  selfViewId?: string;
  /**
   * Specifies the position where to insert the view into the tab bar when using 'blank' view target strategy.
   * If not specified, the view is inserted after the active view. Set the index to 'start' or 'end' for inserting
   * the view at the beginning or at the end.
   */
  blankInsertionIndex?: number | 'start' | 'end';
}

/**
 * Represents the current navigation.
 *
 * @ignore
 */
interface CurrentNavigation {
  intent: Intent;
  capability: WorkbenchViewCapability;
}

