/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { IntentClient, ManifestService, MessageClient, Qualifier, throwOnErrorStatus } from '@scion/microfrontend-platform';
import { Beans } from '@scion/toolkit/bean-manager';
import { ViewCapability } from '../view/view-capability';
import { take } from 'rxjs/operators';
import { WorkbenchView } from '../view/workbench-view';
import { ɵWorkbenchNavigationMessageHeaders } from './workbench-router.constants';
import { WorkbenchCapabilities } from '../workbench-capabilities.enum';
import { Dictionary } from '@scion/toolkit/util';
import { ɵWorkbenchCommands } from '../ɵworkbench-commands';

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
   * @param  extras - Options to control navigation.
   * @return Promise that resolves upon successful navigation, or that rejects if navigation failed, e.g., if missing the view intention declaration,
   *         or because no application provides the requested view.
   */
  public async navigate(qualifier: Qualifier, extras?: WorkbenchNavigationExtras): Promise<void> {
    // We do not delegate routing to the app that provides the requested view, allowing to integrate views from apps that do not have platform integration.
    // But, we still issue the view intent, so we get a platform error if this app is not qualified (i.e., has not declared a respective intention in its
    // manifest), or if no app provides the requested view visible to this app.

    // TODO [scion-microfrontend-platform/#44]: Pass params along with the view intent, as follows: `await Beans.get(IntentClient).publish({type: WorkbenchCapabilities.View, qualifier, params: extras.params});`
    await Beans.get(IntentClient).publish({type: WorkbenchCapabilities.View, qualifier});

    // Look up matching view capabilities. We only get views for which we have declared an intention and which are visible to us.
    const viewCapabilities = await Beans.get(ManifestService).lookupCapabilities$<ViewCapability>({type: WorkbenchCapabilities.View, qualifier})
      .pipe(take(1))
      .toPromise();

    // Trigger the navigation.
    const headers = new Map()
      .set(ɵWorkbenchNavigationMessageHeaders.ɵVIEW_CAPABILITY_IDS, viewCapabilities.map(capability => capability.metadata.id))
      .set(ɵWorkbenchNavigationMessageHeaders.ɵINTENT_QUALIFIER, qualifier)
      .set(ɵWorkbenchNavigationMessageHeaders.ɵNAVIGATION_EXTRAS, extras)
      .set(ɵWorkbenchNavigationMessageHeaders.ɵSELF_VIEW_ID, Beans.opt(WorkbenchView)?.viewId);

    await Beans.get(MessageClient).request$(ɵWorkbenchCommands.navigate, undefined, {headers})
      .pipe(
        take(1),
        throwOnErrorStatus(),
      )
      .toPromise();
  }
}

/**
 * Options to control the navigation.
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
