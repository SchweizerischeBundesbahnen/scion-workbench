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
import {SciRouterOutletPO} from '../../workbench-client/page-object/sci-router-outlet.po';
import {PopupPO} from '../../popup.po';

/**
 * Represents a workbench popup.
 */
export interface WorkbenchPopupPagePO {
  /**
   * Locates the workbench popup.
   */
  readonly popup: PopupPO;
  /**
   * Locates the page displayed in the workbench popup.
   */
  readonly locator: Locator;
}

/**
 * Represents a workbench popup displaying a microfrontend.
 */
export interface MicrofrontendPopupPagePO extends WorkbenchPopupPagePO {
  /**
   * Locates the outlet displaying the microfrontend.
   */
  readonly outlet: SciRouterOutletPO;
}
