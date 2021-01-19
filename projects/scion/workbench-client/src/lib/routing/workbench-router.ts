/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Intent, IntentClient, ManifestService, mapToBody, MessageClient, Qualifier, throwOnErrorStatus } from '@scion/microfrontend-platform';
import { Beans } from '@scion/toolkit/bean-manager';
import { WorkbenchViewCapability } from '../view/workbench-view-capability';
import { take } from 'rxjs/operators';
import { WorkbenchView } from '../view/workbench-view';
import { WorkbenchCapabilities } from '../workbench-capabilities.enum';
import { Dictionaries, Dictionary, Maps } from '@scion/toolkit/util';
import { ɵWorkbenchCommands } from '../ɵworkbench-commands';
import { ɵWorkbenchRouterNavigateCommand } from './workbench-router-navigate-command';

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
   *                     When navigating in the context of a view, you can pass an empty qualifier to navigate to the current view again, e.g.,
   *                     to update view parameters to reflect the view state in the URL.
   * @param  extras - Options to control navigation.
   * @return Promise that resolves to `true` when navigation succeeds, to `false` when navigation fails, or is rejected on error,
   *         e.g., if not qualified or because no application provides the requested view.
   */
  public async navigate(qualifier: Qualifier | {}, extras?: WorkbenchNavigationExtras): Promise<boolean> {
    // To be able to integrate views from apps without workbench integration, we do not delegate the navigation to the app
    // that provides the requested view, but interact with the workbench directly. Nevertheless, we issue an intent so that
    // the platform throws an error in case of unqualified interaction.
    if (!this.isSelfNavigation(qualifier)) {
      await Beans.get(IntentClient).publish({type: WorkbenchCapabilities.View, qualifier, params: Maps.coerce(extras.params)}, extras);
    }

    const navigateCommand = await this.constructNavigateCommand(qualifier, extras);
    return Beans.get(MessageClient).request$<boolean>(ɵWorkbenchCommands.navigate, navigateCommand)
      .pipe(
        take(1),
        throwOnErrorStatus(),
        mapToBody(),
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
        extras: this.constructNavigationExtras(intent.qualifier, extras),
      };
    }
    else {
      return {
        capabilities: await this.lookupViewCapabilities(qualifier),
        extras: this.constructNavigationExtras(qualifier, extras),
      };
    }
  }

  /**
   * Constructs navigation extras based on the given extras to instrument the Workbench Router.
   */
  private constructNavigationExtras(qualifier: Qualifier, extras: WorkbenchNavigationExtras | undefined): WorkbenchNavigationExtras {
    return {
      ...extras,
      selfViewId: extras?.selfViewId ?? Beans.opt(WorkbenchView)?.viewId,
      params: {
        ...Dictionaries.coerce(extras?.params),
        ...qualifier,
      },
    };
  }

  /**
   * Looks up the requested view capabilities.
   *
   * Returns a Promise that resolves to the requested capabilities. Only capabilities for which the requester is qualified are returned.
   */
  private async lookupViewCapabilities(qualifier: Qualifier): Promise<WorkbenchViewCapability[]> {
    return await Beans.get(ManifestService).lookupCapabilities$<WorkbenchViewCapability>({type: WorkbenchCapabilities.View, qualifier})
      .pipe(take(1))
      .toPromise();
  }

  private async currentNavigation(): Promise<CurrentNavigation> {
    const view = Beans.opt(WorkbenchView);
    if (!view) {
      throw Error('[NullViewContextError] Navigating to the current view requires you to be in the context of a view.');
    }
    const currentCapability = await view.capability$
      .pipe(take(1))
      .toPromise();
    const currentParams = await view.params$
      .pipe(take(1))
      .toPromise();
    const currentIntentQualifier = Object.keys(currentCapability.qualifier).reduce((acc, key) => {
      if (!currentParams.has(key)) {
        throw Error(`[ViewContextError] Missing required qualifier param '${key}'.`);
      }
      acc[key] = currentParams.get(key);
      return acc;
    }, {});

    return {
      capability: currentCapability,
      intent: {
        type: WorkbenchCapabilities.View,
        qualifier: currentIntentQualifier,
      },
    };
  }

  /**
   * Checks whether requesting a self navigation, e.g., for updating params to be reflected in the top-level URL (persistent workbench navigation).
   */
  private isSelfNavigation(qualifier: Qualifier): boolean {
    return !qualifier || Object.keys(qualifier).length === 0;
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
   * 'self':    opens the view in the current view tab (which is by default)
   * 'blank':   opens the view in a new view tab
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

