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
import {MessageBoxPO} from '../../message-box.po';
import {SciRouterOutletPO} from '../../workbench-client/page-object/sci-router-outlet.po';

/**
 * Represents a workbench message box.
 */
export interface WorkbenchMessageBoxPagePO {
  /**
   * Locates the workbench message box.
   */
  readonly messageBox: MessageBoxPO;
  /**
   * Locates the page displayed in the workbench message box.
   */
  readonly locator: Locator;
}

/**
 * Represents a workbench message box displaying a microfrontend.
 */
export interface MicrofrontendMessageBoxPagePO extends WorkbenchMessageBoxPagePO {
  /**
   * Locates the outlet displaying the microfrontend.
   */
  readonly outlet: SciRouterOutletPO;
}
