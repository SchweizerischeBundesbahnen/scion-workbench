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
import {DialogPO} from '../../dialog.po';

/**
 * Represents a workbench dialog.
 */
export interface WorkbenchDialogPagePO {
  /**
   * Locates the workbench dialog.
   */
  readonly dialog: DialogPO;
  /**
   * Locates the page displayed in the workbench dialog.
   */
  readonly locator: Locator;
}
