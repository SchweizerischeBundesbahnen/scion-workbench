/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Page} from '@playwright/test';

/**
 * Handle for interacting with the workbench desktop.
 */
export class DesktopPO {

  constructor(public readonly page: Page) {
  }

  /**
   * Gets the active drop zone when dragging a view over the desktop.
   */
  public async getActiveDropZone(): Promise<'north' | 'east' | 'south' | 'west' | 'center' | null> {
    const dropZone = this.page.locator('div.e2e-drop-zone[data-desktop]');
    if (!await dropZone.isVisible()) {
      return null;
    }

    const dropZoneId = await dropZone.getAttribute('data-id');
    const dropPlaceholder = this.page.locator(`div.e2e-drop-placeholder[data-dropzoneid="${dropZoneId}"]`);
    if (!await dropPlaceholder.isVisible()) {
      return null;
    }

    return await dropZone.getAttribute('data-region') as 'north' | 'east' | 'south' | 'west' | null;
  }
}
