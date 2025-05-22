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
import {ViewPO} from './view.po';
import {ViewTabPO} from './view-tab.po';
import {PartSashPO} from './part-sash.po';
import {PartBarPO} from './part-bar.po';
import {PartId} from '@scion/workbench';
import {DomRect, fromRect, getCssClasses} from './helper/testing.util';

/**
 * Handle for interacting with a workbench part.
 */
export class PartPO {

  /**
   * Handle for interacting with the part bar.
   */
  public readonly bar: PartBarPO;

  /**
   * Handle to the active view of this part.
   */
  public readonly activeView: ViewPO;

  /**
   * Handle to resize this part.
   */
  public readonly sash: PartSashPO;

  /**
   * Locates the message displayed if not navigated this part and this part has no views.
   */
  public readonly nullContentMessage: Locator;

  constructor(public readonly locator: Locator) {
    this.bar = new PartBarPO(this.locator.locator('wb-part-bar'), this);
    this.activeView = new ViewPO(this.locator.locator('wb-view'), new ViewTabPO(this.locator.locator('wb-view-tab.active'), this));
    this.sash = new PartSashPO(this.locator);
    this.nullContentMessage = this.locator.locator('wb-null-content');
  }

  public async getPartId(): Promise<PartId> {
    return (await this.locator.getAttribute('data-partid')) as PartId;
  }

  /**
   * Indicates if this part is contained in the peripheral area.
   */
  public async isPeripheral(): Promise<boolean> {
    return (await this.locator.getAttribute('data-peripheral')) !== null;
  }

  /**
   * Gets the active drop zone when dragging a view over this part.
   */
  public async getActiveDropZone(): Promise<'north' | 'east' | 'south' | 'west' | 'center' | null> {
    const partId = await this.getPartId();
    const dropZone = this.locator.locator(`div.e2e-part-drop-zone[data-partid="${partId}"]`);
    if (!await dropZone.isVisible()) {
      return null;
    }

    const dropZoneId = await dropZone.getAttribute('data-id');
    const dropPlaceholder = this.locator.page().locator(`div.e2e-drop-placeholder[data-dropzoneid="${dropZoneId}"]`);
    if (!await dropPlaceholder.isVisible()) {
      return null;
    }

    return await dropZone.getAttribute('data-region') as 'north' | 'east' | 'south' | 'west' | 'center' | null;
  }

  /**
   * Gets the bounding box of this part (inclusive partbar) or its content (exclusive partbar). Defaults to the bounding box of the part.
   */
  public async getBoundingBox(selector: 'part' | 'content' = 'part'): Promise<DomRect> {
    return fromRect(await this.locator.locator(selector === 'part' ? ':scope' : ':scope > .e2e-content').boundingBox());
  }

  public getCssClasses(): Promise<string[]> {
    return getCssClasses(this.locator);
  }
}
