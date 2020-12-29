/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Intent, IntentClient, ManifestService, MessageClient, Qualifier, throwOnErrorStatus } from '@scion/microfrontend-platform';
import { Beans } from '@scion/toolkit/bean-manager';
import { WorkbenchViewCapability } from '../view/workbench-view-capability';
import { take } from 'rxjs/operators';
import { WorkbenchView } from '../view/workbench-view';
import { WorkbenchCapabilities } from '../workbench-capabilities.enum';
import { Dictionaries, Dictionary, Maps } from '@scion/toolkit/util';
import { ɵWorkbenchCommands } from '../ɵworkbench-commands';
import { mapArray } from '@scion/toolkit/operators';

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
   * @return Promise that resolves upon successful navigation, or that rejects if navigation failed, e.g., if missing the view intention declaration,
   *         or because no application provides the requested view.
   */
  public async navigate(qualifier: Qualifier | {}, extras?: WorkbenchNavigationExtras): Promise<void> {
    // To be able to integrate views from apps without workbench integration, we do not delegate the navigation to the app
    // that provides the requested view, but interact with the workbench directly. Nevertheless, we issue an intent so that
    // the platform throws an error in case of unqualified interaction.

    const navigateHeaders = new Map();
    // Check if to navigate to the current view, e.g., to update view parameters to reflect the view state in the URL.
    if (!qualifier || Object.keys(qualifier).length === 0) {
      const {capability, intent} = await this.currentNavigation();
      navigateHeaders
        .set(ɵWorkbenchNavigationMessageHeaders.CAPABILITY_IDS, [capability.metadata.id])
        .set(ɵWorkbenchNavigationMessageHeaders.NAVIGATION_EXTRAS, this.coerceNavigationExtras(intent.qualifier, extras));
    }
    else {
      await Beans.get(IntentClient).publish({type: WorkbenchCapabilities.View, qualifier, params: Maps.coerce(extras.params)});

      // Look up matching view capabilities. We only get views for which we have declared an intention and which are visible to us.
      const capabilityIds = await Beans.get(ManifestService).lookupCapabilities$<WorkbenchViewCapability>({type: WorkbenchCapabilities.View, qualifier})
        .pipe(mapArray(capability => capability.metadata.id), take(1))
        .toPromise();
      navigateHeaders
        .set(ɵWorkbenchNavigationMessageHeaders.CAPABILITY_IDS, capabilityIds)
        .set(ɵWorkbenchNavigationMessageHeaders.NAVIGATION_EXTRAS, this.coerceNavigationExtras(qualifier, extras));
    }

    // Trigger the navigation.
    await Beans.get(MessageClient).request$(ɵWorkbenchCommands.navigate, undefined, {headers: navigateHeaders})
      .pipe(
        take(1),
        throwOnErrorStatus(),
      )
      .toPromise();
  }

  private coerceNavigationExtras(qualifier: Qualifier, extras?: WorkbenchNavigationExtras): WorkbenchNavigationExtras {
    return {
      ...extras,
      selfViewId: extras?.selfViewId ?? Beans.opt(WorkbenchView)?.viewId,
      params: {
        ...Dictionaries.coerce(extras?.params),
        ...qualifier,
      },
    };
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
 */
interface CurrentNavigation {
  intent: Intent;
  capability: WorkbenchViewCapability;
}

/**
 * Message headers to instruct the Workbench router to navigate.
 *
 * @docs-private Not public API, intended for internal use only.
 * @ignore
 */
export enum ɵWorkbenchNavigationMessageHeaders {
  /**
   * View capability ids resolved for the current navigation.
   */
  CAPABILITY_IDS = 'ɵWORKBENCH-ROUTER:VIEW_CAPABILITY_IDS',
  /**
   * Options to control navigation.
   */
  NAVIGATION_EXTRAS = 'ɵWORKBENCH-ROUTER:NAVIGATION_EXTRAS',
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
