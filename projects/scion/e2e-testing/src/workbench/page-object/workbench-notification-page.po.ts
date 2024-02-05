/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {NotificationPO} from '../../notification.po';

/**
 * Represents a workbench notification.
 */
export interface WorkbenchNotificationPagePO {
  /**
   * Locates the workbench notification.
   */
  readonly notification: NotificationPO;
  /**
   * Locates the page displayed in the workbench notification.
   */
  readonly locator: Locator;
}
