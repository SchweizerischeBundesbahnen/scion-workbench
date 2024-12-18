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
import {PartPO} from '../../part.po';

/**
 * Represents the page displayed in a workbench part.
 */
export interface WorkbenchPartPagePO {
  /**
   * Locates the workbench part.
   */
  readonly part: PartPO;
  /**
   * Locates the page displayed in the workbench part.
   */
  readonly locator: Locator;
}
