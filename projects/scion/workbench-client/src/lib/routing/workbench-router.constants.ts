/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

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
  ɵVIEW_CAPABILITY_IDS = 'ɵWORKBENCH-ROUTER:VIEW_CAPABILITY_IDS',
  /**
   * Qualifier of the view intent.
   */
  ɵINTENT_QUALIFIER = 'ɵWORKBENCH-ROUTER:INTENT_QUALIFIER',
  /**
   * Options to control navigation.
   */
  ɵNAVIGATION_EXTRAS = 'ɵWORKBENCH-ROUTER:NAVIGATION_EXTRAS',
  /**
   * Identity of the view initiating the navigation.
   */
  ɵSELF_VIEW_ID = 'ɵWORKBENCH-ROUTER:SELF_VIEW_ID',
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
