/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {NotificationId} from '../workbench.identifiers';
import {WorkbenchNotificationCapability} from '@scion/workbench-client';

/**
 * Information about the notification embedding a microfrontend.
 *
 * This object can be obtained from the {@link ContextService} using the name {@link ɵNOTIFICATION_CONTEXT}.
 *
 * @docs-private Not public API. For internal use only.
 * @ignore
 */
export interface ɵNotificationContext {
  notificationId: NotificationId;
  capability: WorkbenchNotificationCapability;
  params: Map<string, unknown>;
  /**
   * Provides information about where the notification was opened.
   */
  referrer: {
    /**
     * Symbolic name of the application that opened the notification.
     */
    appSymbolicName: string;
  };
}

/**
 * Key for obtaining the current notification context using {@link ContextService}.
 *
 * The notification context is only available to microfrontends loaded in a workbench notification.
 *
 * @docs-private Not public API. For internal use only.
 * @ignore
 * @see {@link ContextService}
 * @see {@link ɵNotificationContext}
 */
export const ɵNOTIFICATION_CONTEXT = 'ɵworkbench.notification';
