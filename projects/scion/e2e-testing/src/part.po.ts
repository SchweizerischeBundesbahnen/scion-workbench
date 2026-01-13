/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator, Page} from '@playwright/test';
import {ViewPO} from './view.po';
import {ViewTabPO} from './view-tab.po';
import {PartSashPO} from './part-sash.po';
import {PartBarPO} from './part-bar.po';
import {PartId} from '@scion/workbench';
import {coerceArray, DomRect, fromRect, getCssClasses, selectBy} from './helper/testing.util';
import {PartSlotPO} from './part-slot.po';
import {WorkbenchAccessor, WorkbenchPartNavigationE2E} from './workbench-accessor';
import {RequireOne} from './helper/utility-types';

/**
 * Handle for interacting with a workbench part.
 */
export class PartPO {

  private readonly _workbenchAccessor: WorkbenchAccessor;

  public readonly locator: Locator;

  /**
   * Handle for interacting with the part bar.
   */
  public readonly bar: PartBarPO;

  /**
   * Handle to the active view of this part.
   */
  public readonly activeView: ViewPO;

  /**
   * Locates the content displayed in the part.
   */
  public readonly slot: PartSlotPO;

  /**
   * Handle to resize this part.
   */
  public readonly sash: PartSashPO;

  public readonly locateBy?: {id?: PartId; cssClass?: string[]};

  constructor(page: Page, locateBy: RequireOne<{partId: PartId; cssClass: string | string[]}> | Locator) {
    if ('page' in locateBy) {
      this.locator = locateBy;
    }
    else {
      this.locateBy = {id: locateBy.partId, cssClass: coerceArray(locateBy.cssClass)};
      this.locator = page.locator(selectBy('wb-part', {attributes: {'data-partid': locateBy.partId}, cssClass: locateBy.cssClass}));
    }

    this.bar = new PartBarPO(this.locator.locator('wb-part-bar'), this);
    this.slot = new PartSlotPO(this.locator.locator('wb-part-slot'));
    this.sash = new PartSashPO(this.locator);
    this.activeView = new ViewPO(page, {
      locator: this.locator.locator('wb-view-slot'),
      viewTab: new ViewTabPO(this.locator.locator('wb-view-tab[data-active]'), this),
    });
    this._workbenchAccessor = new WorkbenchAccessor(page);
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
    const dropZone = this.locator.locator(`div.e2e-drop-zone[data-partid="${partId}"]`);
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
   * Gets the activation instant of this part.
   */
  public async activationInstant(): Promise<number> {
    const partId = await this.getPartId();
    return this._workbenchAccessor.part({partId}).then(part => part.activationInstant);
  }

  /**
   * Gets navigation details of this part.
   */
  public async navigation(): Promise<WorkbenchPartNavigationE2E> {
    const partId = await this.getPartId();
    return this._workbenchAccessor.part({partId}).then(part => part.navigation);
  }

  /**
   * Gets the bounding box of this part (inclusive partbar) or its content (exclusive partbar). Defaults to the bounding box of the part.
   */
  public async getBoundingBox(selector: 'part' | 'content' = 'part'): Promise<DomRect> {
    return fromRect(await this.locator.locator(selector === 'part' ? ':scope' : ':scope > .e2e-content').boundingBox());
  }

  /**
   * Locates this part in the specified state.
   */
  public state(state: 'active'): Locator {
    switch (state) {
      case 'active': // eslint-disable-line @typescript-eslint/no-unnecessary-condition
        return this.locator.locator(':scope[data-active]');
      default:
        throw Error('[PageObjectError] Unsupported state.');
    }
  }

  public getCssClasses(): Promise<string[]> {
    return getCssClasses(this.locator);
  }
}
