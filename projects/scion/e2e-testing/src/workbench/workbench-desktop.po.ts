/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {DesktopPO} from '../desktop.po';
import {Locator} from '@playwright/test';

/**
 * Represents a workbench desktop.
 */
export interface WorkbenchDesktopPagePO {
  /**
   * Locates the workbench desktop.
   */
  readonly desktop: DesktopPO;
  /**
   * Locates the page displayed in the workbench desktop.
   */
  readonly locator: Locator;
}
