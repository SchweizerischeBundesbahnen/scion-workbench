/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Translatable} from '../text/workbench-text-provider.model';

/**
 * Command to show a notification.
 *
 * @docs-private Not public API. For internal use only.
 * @ignore
 */
export interface ɵWorkbenchNotificationCommand {
  title?: Translatable;
  severity?: 'info' | 'warn' | 'error';
  duration?: 'short' | 'medium' | 'long' | 'infinite' | number;
  group?: string;
  cssClass?: string | string[];
}

/**
 * Parameter name for the message displayed in the built-in text {@link WorkbenchNotificationCapability}.
 *
 * @docs-private Not public API. For internal use only.
 * @ignore
 */
export const eNOTIFICATION_MESSAGE_PARAM = 'message';
