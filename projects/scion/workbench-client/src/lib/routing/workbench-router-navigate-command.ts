/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { WorkbenchViewCapability } from '../view/workbench-view-capability';
import { WorkbenchNavigationExtras } from './workbench-router';

/**
 * Command object for instructing the Workbench Router to navigate to the microfrontend of given view capabilities.
 *
 * @docs-private Not public API, intended for internal use only.
 * @ignore
 */
export interface ɵWorkbenchRouterNavigateCommand { // tslint:disable-line:class-name
  capabilities: WorkbenchViewCapability[];
  extras: WorkbenchNavigationExtras;
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
