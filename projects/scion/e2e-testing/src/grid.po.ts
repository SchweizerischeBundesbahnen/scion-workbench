/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {ActivityId} from '@scion/workbench';
import {DomRect, fromRect} from './helper/testing.util';

/**
 * Handle for interacting with a workbench grid.
 */
export class GridPO {

  constructor(public readonly locator: Locator) {
  }

  public async getGridName(): Promise<'main' | 'mainArea' | ActivityId> {
    return (await this.locator.getAttribute('data-grid')) as 'main' | 'mainArea' | ActivityId;
  }

  /**
   * Gets the active drop zone when dragging near the grid edge.
   */
  public async getActiveDropZone(): Promise<'north' | 'east' | 'south' | 'west' | 'center' | null> {
    const gridName = await this.getGridName();
    const dropZone = this.locator.locator(`div.e2e-drop-zone[data-grid="${gridName}"]`);
    if (!await dropZone.isVisible()) {
      return null;
    }

    const dropZoneId = await dropZone.getAttribute('data-id');
    const dropPlaceholder = this.locator.page().locator(`div.e2e-drop-placeholder[data-dropzoneid="${dropZoneId}"]`);
    if (!await dropPlaceholder.isVisible()) {
      return null;
    }

    return await dropZone.getAttribute('data-region') as 'north' | 'east' | 'south' | 'west' | null;
  }

  /**
   * Gets the bounding box of this grid.
   */
  public async getBoundingBox(): Promise<DomRect> {
    return fromRect(await this.locator.boundingBox());
  }
}
