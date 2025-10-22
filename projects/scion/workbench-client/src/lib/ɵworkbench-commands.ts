/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {DialogId, PartId, PopupId, ViewId} from './workbench.identifiers';

/**
 * Defines command endpoints for the communication between SCION Workbench and SCION Workbench Client.
 *
 * @docs-private Not public API. For internal use only.
 */
export const ɵWorkbenchCommands = {

  /**
   * Computes the topic via which the title of a workbench view tab can be set.
   */
  viewTitleTopic: (viewId: ViewId | ':viewId') => `ɵworkbench/views/${viewId}/title`,

  /**
   * Computes the topic via which the heading of a workbench view tab can be set.
   */
  viewHeadingTopic: (viewId: ViewId | ':viewId') => `ɵworkbench/views/${viewId}/heading`,

  /**
   * Computes the topic via which a view tab can be marked dirty or pristine.
   */
  viewDirtyTopic: (viewId: ViewId | ':viewId') => `ɵworkbench/views/${viewId}/dirty`,

  /**
   * Computes the topic via which a view tab can be made closable.
   */
  viewClosableTopic: (viewId: ViewId | ':viewId') => `ɵworkbench/views/${viewId}/closable`,

  /**
   * Computes the topic via which a view can be closed.
   */
  viewCloseTopic: (viewId: ViewId | ':viewId') => `ɵworkbench/views/${viewId}/close`,

  /**
   * Computes the topic to notify the active state of a view.
   *
   * The active state is published as a retained message.
   */
  viewActiveTopic: (viewId: ViewId) => `ɵworkbench/views/${viewId}/active`,

  /**
   * Computes the topic to notify the active state of a part.
   *
   * The active state is published as a retained message.
   */
  partActiveTopic: (partId: PartId) => `ɵworkbench/parts/${partId}/active`,

  /**
   * Computes the topic to notify the focused state of a view.
   *
   * The focused state is published as a retained message.
   */
  viewFocusedTopic: (viewId: ViewId) => `ɵworkbench/views/${viewId}/focused`,

  /**
   * Computes the topic to notify the focused state of a part.
   *
   * The focused state is published as a retained message.
   */
  partFocusedTopic: (partId: PartId) => `ɵworkbench/parts/${partId}/focused`,

  /**
   * Computes the topic to notify the part of a view.
   *
   * The part identity is published as a retained message.
   */
  viewPartIdTopic: (viewId: ViewId) => `ɵworkbench/views/${viewId}/part/id`,

  /**
   * Computes the topic to request closing confirmation of a view.
   *
   * When closing a view and if the microfrontend has subscribed to this topic, the workbench requests closing confirmation
   * via this topic. By sending a `true` reply, the workbench continues with closing the view, by sending a `false` reply,
   * closing is prevented.
   */
  canCloseTopic: (viewId: ViewId) => `ɵworkbench/views/${viewId}/canClose`,

  /**
   * Computes the topic for signaling that a microfrontend is about to be replaced by a microfrontend of another app.
   */
  viewUnloadingTopic: (viewId: ViewId) => `ɵworkbench/views/${viewId}/unloading`,

  /**
   * Computes the topic for updating params of a microfrontend view.
   */
  viewParamsUpdateTopic: (viewId: ViewId, viewCapabilityId: string) => `ɵworkbench/views/${viewId}/capabilities/${viewCapabilityId}/params/update`,

  /**
   * Computes the topic for providing params to a view microfrontend.
   *
   * Params include the {@link ɵMicrofrontendRouteParams#ɵVIEW_CAPABILITY_ID capability id} and params as passed in {@link WorkbenchNavigationExtras.params}.
   *
   * Params are published as a retained message.
   */
  viewParamsTopic: (viewId: ViewId) => `ɵworkbench/views/${viewId}/params`,

  /**
   * Computes the topic for observing the popup origin.
   */
  popupOriginTopic: (popupId: PopupId) => `ɵworkbench/popups/${popupId}/origin`,

  /**
   * Computes the topic to notify the focused state of a popup.
   *
   * The focused state is published as a retained message.
   */
  popupFocusedTopic: (popupId: PopupId) => `ɵworkbench/popups/${popupId}/focused`,

  /**
   * Computes the topic via which a popup can be closed.
   */
  popupCloseTopic: (popupId: PopupId) => `ɵworkbench/popups/${popupId}/close`,

  /**
   * Computes the topic via which to set a result
   */
  popupResultTopic: (popupId: PopupId) => `ɵworkbench/popups/${popupId}/result`,

  /**
   * Computes the topic via which the title of a dialog can be set.
   */
  dialogTitleTopic: (dialogId: DialogId) => `ɵworkbench/dialogs/${dialogId}/title`,

  /**
   * Computes the topic to notify the focused state of a dialog.
   *
   * The focused state is published as a retained message.
   */
  dialogFocusedTopic: (dialogId: DialogId) => `ɵworkbench/dialogs/${dialogId}/focused`,

  /**
   * Computes the topic via which a dialog can be closed.
   */
  dialogCloseTopic: (dialogId: DialogId) => `ɵworkbench/dialogs/${dialogId}/close`,
} as const;
