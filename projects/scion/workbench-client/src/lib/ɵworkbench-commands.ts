/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Defines command endpoints for the communication between SCION Workbench and SCION Workbench Client.
 *
 * @docs-private Not public API, intended for internal use only.
 */
export const ɵWorkbenchCommands = {

  /**
   * Computes the topic via which the title of a workbench view tab can be set.
   */
  viewTitleTopic: (viewId: string) => `ɵworkbench/views/${viewId}/title`,

  /**
   * Computes the topic via which the heading of a workbench view tab can be set.
   */
  viewHeadingTopic: (viewId: string) => `ɵworkbench/views/${viewId}/heading`,

  /**
   * Computes the topic via which a view tab can be marked dirty or pristine.
   */
  viewDirtyTopic: (viewId: string) => `ɵworkbench/views/${viewId}/dirty`,

  /**
   * Computes the topic via which a view tab can be made closable.
   */
  viewClosableTopic: (viewId: string) => `ɵworkbench/views/${viewId}/closable`,

  /**
   * Computes the topic via which a view can be closed.
   */
  viewCloseTopic: (viewId: string) => `ɵworkbench/views/${viewId}/close`,

  /**
   * Computes the topic for notifying about view active state changes.
   *
   * The active state is published as a retained message.
   */
  viewActiveTopic: (viewId: string) => `ɵworkbench/views/${viewId}/active`,

  /**
   * Computes the topic for signaling that a view is about to be closed.
   *
   * Just before closing the view and if the microfrontend has subscribed to this topic, the workbench requests
   * a closing confirmation via this topic. By sending a `true` reply, the workbench continues with closing the view,
   * by sending a `false` reply, closing is prevented.
   */
  viewClosingTopic: (viewId: string) => `ɵworkbench/views/${viewId}/closing`,

  /**
   * Computes the topic for signaling that a microfrontend is about to be replaced by a microfrontend of another app.
   */
  viewUnloadingTopic: (viewId: string) => `ɵworkbench/views/${viewId}/unloading`,

  /**
   * Computes the topic for updating params of a microfrontend view.
   */
  viewParamsUpdateTopic: (viewId: string, viewCapabilityId: string) => `ɵworkbench/views/${viewId}/capabilities/${viewCapabilityId}/params/update`,

  /**
   * Computes the topic for providing params to a view microfrontend.
   *
   * Params include the {@link ɵMicrofrontendRouteParams#ɵVIEW_CAPABILITY_ID capability id}, params as passed in {@link WorkbenchNavigationExtras.params},
   * and the view qualifier.
   *
   * Params are published as a retained message.
   */
  viewParamsTopic: (viewId: string) => `ɵworkbench/views/${viewId}/params`,

  /**
   * Computes the topic for observing the popup origin.
   */
  popupOriginTopic: (popupId: string) => `ɵworkbench/popups/${popupId}/origin`,

  /**
   * Computes the topic via which a popup can be closed.
   */
  popupCloseTopic: (popupId: string) => `ɵworkbench/popups/${popupId}/close`,
} as const;
