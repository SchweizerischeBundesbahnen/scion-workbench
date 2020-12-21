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
 * Defines command endpoints for the communication between SCION Workbench and SCION Workbench Client.
 *
 * @docs-private Not public API, intended for internal use only.
 */
export namespace ɵWorkbenchCommands {

  /**
   * Topic via which to initiate a workbench navigation.
   *
   * Include navigation instructions in {@link ɵWorkbenchRouterMessageHeaders} message headers.
   */
  export const navigate = 'ɵworkbench/navigate';

  /**
   * Computes the topic via which the title of a workbench view tab can be set.
   */
  export function viewTitleTopic(viewId: string): string {
    return `ɵworkbench/views/${viewId}/title`;
  }

  /**
   * Computes the topic via which the heading of a workbench view tab can be set.
   */
  export function viewHeadingTopic(viewId: string): string {
    return `ɵworkbench/views/${viewId}/heading`;
  }

  /**
   * Computes the topic via which a view tab can be marked dirty or pristine.
   */
  export function viewDirtyTopic(viewId: string): string {
    return `ɵworkbench/views/${viewId}/dirty`;
  }

  /**
   * Computes the topic via which a view tab can be made closable.
   */
  export function viewClosableTopic(viewId: string): string {
    return `ɵworkbench/views/${viewId}/closable`;
  }

  /**
   * Computes the topic via which a view can be closed.
   */
  export function viewCloseTopic(viewId: string): string {
    return `ɵworkbench/views/${viewId}/close`;
  }

  /**
   * Computes the topic for notifying about view active state changes.
   *
   * The active state is published as a retained message.
   */
  export function viewActiveTopic(viewId: string): string {
    return `ɵworkbench/views/${viewId}/active`;
  }

  /**
   * Computes the topic for signaling that a view is about to be closed.
   *
   * Just before closing the view and if the microfrontend has subscribed to this topic, the workbench requests
   * a closing confirmation via this topic. By sending a `true` reply, the workbench continues with closing the view,
   * by sending a `false` reply, closing is prevented.
   */
  export function viewClosingTopic(viewId: string): string {
    return `ɵworkbench/views/${viewId}/closing`;
  }

  /**
   * Computes the topic for signaling that a microfrontend is about to be replaced by a microfrontend of another app.
   */
  export function viewUnloadingTopic(viewId: string): string {
    return `ɵworkbench/views/${viewId}/unloading`;
  }

  /**
   * Computes the topic for providing params to a microfrontend.
   *
   * Params include the {@link ɵMicrofrontendRouteParams#ɵVIEW_CAPABILITY_ID capability id}, matrix params as passed in {@link WorkbenchNavigationExtras.params}
   * and the view qualifier.
   *
   * Params are published as a retained message.
   */
  export function viewParamsTopic(viewId: string): string {
    return `ɵworkbench/views/${viewId}/params`;
  }
}
