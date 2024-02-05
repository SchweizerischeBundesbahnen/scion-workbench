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
import {ViewPO} from '../../view.po';
import {SciRouterOutletPO} from '../../workbench-client/page-object/sci-router-outlet.po';

/**
 * Represents a workbench view.
 */
export interface WorkbenchViewPagePO {
  /**
   * Locates the workbench view.
   */
  readonly view: ViewPO;
  /**
   * Locates the page displayed in the workbench view.
   */
  readonly locator: Locator;
}

/**
 * Represents a workbench view displaying a microfrontend.
 */
export interface MicrofrontendViewPagePO extends WorkbenchViewPagePO {
  /**
   * Locates the outlet displaying the microfrontend.
   */
  readonly outlet: SciRouterOutletPO;
}
