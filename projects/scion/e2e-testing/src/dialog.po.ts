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
import {coerceArray, DomRect, fromRect, hasCssClass, selectBy, waitUntilBoundingBoxStable, waitUntilStable} from './helper/testing.util';
import {AppPO} from './app.po';
import {DialogId} from '@scion/workbench';
import {RequireOne} from './helper/utility-types';

/**
 * PO for interacting with a workbench dialog.
 */
export class DialogPO {

  public readonly locator: Locator;
  public readonly dialog: Locator;
  public readonly header: Locator;
  public readonly title: Locator;
  public readonly closeButton: Locator;
  public readonly resizeHandles: Locator;
  public readonly viewport: Locator;
  public readonly slot: Locator;
  public readonly footer: Locator;
  public readonly contentScrollbars: {vertical: Locator; horizontal: Locator};
  public readonly locateBy?: {id?: DialogId; cssClass?: string[]};

  constructor(page: Page, locateBy: RequireOne<{dialogId: DialogId; cssClass: string | string[]}>, options?: {nth?: number}) {
    this.locateBy = {id: locateBy.dialogId, cssClass: coerceArray(locateBy.cssClass)};
    this.locator = page.locator(selectBy('wb-dialog', {attributes: {'data-dialogid': locateBy.dialogId}, cssClass: locateBy.cssClass})).nth(options?.nth ?? 0);

    this.dialog = this.locator.locator('div.e2e-dialog');
    this.header = this.dialog.locator('header.e2e-dialog-header');
    this.title = this.header.locator('div.e2e-title > span');
    this.closeButton = this.header.locator('button.e2e-close');
    this.viewport = this.locator.locator('sci-viewport.e2e-dialog-slot');
    this.slot = this.locator.locator('div.e2e-dialog-slot-bounds');
    this.footer = this.dialog.locator('footer.e2e-dialog-footer');
    this.resizeHandles = this.dialog.locator('div.e2e-resize-handle');
    this.contentScrollbars = {
      vertical: this.viewport.locator('sci-scrollbar.e2e-vertical'),
      horizontal: this.viewport.locator('sci-scrollbar.e2e-horizontal'),
    };
  }

  public async getDialogId(): Promise<DialogId> {
    return (await waitUntilStable(() => this.locator.getAttribute('data-dialogid'))) as DialogId;
  }

  /**
   * Gets the bounding box of the dialog or a specific area in the dialog. Defaults to the bounding box of the dialog.
   *
   * Options:
   * - `dialog`: dialog bounds.
   * - `slot`: bounds for slotted content; may differ from the actual content size if content overflows or does not fill the slot.
   * - `header`: header bounds.
   * - `footer`: footer bounds.
   */
  public async getBoundingBox(selector: 'dialog' | 'slot' | 'header' | 'footer' = 'dialog'): Promise<DomRect> {
    switch (selector) {
      case 'dialog': {
        return waitUntilBoundingBoxStable(this.dialog);
      }
      case 'slot': {
        // Do not read bounds from 'div.e2e-dialog-slot-bounds' to test actual slot bounds.
        const {paddingTop, paddingRight, paddingBottom, paddingLeft} = await this.viewport.locator('div.viewport-client[part="content"]').evaluate((slot: HTMLElement) => getComputedStyle(slot));
        const viewportBounds = await waitUntilBoundingBoxStable(this.viewport);
        return fromRect({
          x: viewportBounds.x + parseFloat(paddingLeft),
          y: viewportBounds.y + parseFloat(paddingTop),
          width: viewportBounds.width - parseFloat(paddingLeft) - parseFloat(paddingRight),
          height: viewportBounds.height - parseFloat(paddingTop) - parseFloat(paddingBottom),
        });
      }
      case 'header': {
        return waitUntilBoundingBoxStable(this.header);
      }
      case 'footer': {
        return waitUntilBoundingBoxStable(this.footer);
      }
    }
  }

  public hasVerticalOverflow(): Promise<boolean> {
    return hasCssClass(this.locator.locator('sci-viewport.e2e-dialog-slot > sci-scrollbar.vertical'), 'overflow');
  }

  public hasHorizontalOverflow(): Promise<boolean> {
    return hasCssClass(this.locator.locator('sci-viewport.e2e-dialog-slot > sci-scrollbar.horizontal'), 'overflow');
  }

  public getComputedStyle(): Promise<CSSStyleDeclaration> {
    return this.dialog.evaluate((dialogElement: HTMLElement) => getComputedStyle(dialogElement));
  }

  public async getGlassPaneBoundingBoxes(): Promise<Set<DomRect>> {
    const glassPaneLocators = await this.locator.page().locator(`div.e2e-glasspane[data-owner="${await this.getDialogId()}"]`).all();

    const boundingBoxes = new Set<DomRect>();
    for (const glassPaneLocator of glassPaneLocators) {
      boundingBoxes.add(fromRect(await waitUntilBoundingBoxStable(glassPaneLocator)));
    }
    return boundingBoxes;
  }

  public async getDialogBorderWidth(): Promise<number> {
    return this.dialog.locator('div.e2e-dialog-box').evaluate((element: HTMLElement) => parseInt(getComputedStyle(element).borderWidth, 10));
  }

  public async close(options?: {timeout?: number}): Promise<void> {
    await this.closeButton.click(options);
  }

  public async clickHeader(options?: {timeout?: number}): Promise<void> {
    await this.header.click(options);
  }

  public async moveDialog(distance: {x: number; y: number} | 'top-left-corner' | 'top-right-corner' | 'bottom-right-corner' | 'bottom-left-corner'): Promise<void> {
    const dialogBoundingBox = await this.getBoundingBox('dialog');
    const viewportBoundingBox = new AppPO(this.locator.page()).viewportBoundingBox();

    switch (distance) {
      case 'top-left-corner': {
        await this.moveDialog({x: viewportBoundingBox.left - dialogBoundingBox.left, y: viewportBoundingBox.top - dialogBoundingBox.top});
        break;
      }
      case 'top-right-corner': {
        await this.moveDialog({x: viewportBoundingBox.right - dialogBoundingBox.right, y: viewportBoundingBox.top - dialogBoundingBox.top});
        break;
      }
      case 'bottom-right-corner': {
        await this.moveDialog({x: viewportBoundingBox.right - dialogBoundingBox.right, y: viewportBoundingBox.bottom - dialogBoundingBox.bottom});
        break;
      }
      case 'bottom-left-corner': {
        await this.moveDialog({x: viewportBoundingBox.left - dialogBoundingBox.left, y: viewportBoundingBox.bottom - dialogBoundingBox.bottom});
        break;
      }
      default: {
        const {hcenter: x, vcenter: y} = await waitUntilBoundingBoxStable(this.header);

        const mouse = this.locator.page().mouse;
        await mouse.move(x, y);
        await mouse.down();
        await mouse.move(x + distance.x, y + distance.y, {steps: 10});
        await mouse.up();
      }
    }
  }

  public async resizeTop(distance: number, options?: {mouseup?: boolean}): Promise<void> {
    const dialogBounds = await this.getBoundingBox('dialog');

    await this.resize(
      {x: dialogBounds.hcenter, y: dialogBounds.top},
      {x: dialogBounds.hcenter, y: dialogBounds.top + distance},
      options,
    );
  }

  public async resizeBottom(distance: number, options?: {mouseup?: boolean}): Promise<void> {
    const dialogBounds = await this.getBoundingBox('dialog');

    await this.resize(
      {x: dialogBounds.hcenter, y: dialogBounds.bottom},
      {x: dialogBounds.hcenter, y: dialogBounds.bottom + distance},
      options,
    );
  }

  public async resizeLeft(distance: number, options?: {mouseup?: boolean}): Promise<void> {
    const dialogBounds = await this.getBoundingBox('dialog');

    await this.resize(
      {x: dialogBounds.left, y: dialogBounds.vcenter},
      {x: dialogBounds.left + distance, y: dialogBounds.vcenter},
      options,
    );
  }

  public async resizeRight(distance: number, options?: {mouseup?: boolean}): Promise<void> {
    const dialogBounds = await this.getBoundingBox('dialog');

    await this.resize(
      {x: dialogBounds.right, y: dialogBounds.vcenter},
      {x: dialogBounds.right + distance, y: dialogBounds.vcenter},
      options,
    );
  }

  public async resizeTopLeft(distance: {x: number; y: number}, options?: {mouseup?: boolean}): Promise<void> {
    const dialogBounds = await this.getBoundingBox('dialog');
    await this.resize(
      {x: dialogBounds.left, y: dialogBounds.top},
      {x: dialogBounds.left + distance.x, y: dialogBounds.top + distance.y},
      options,
    );
  }

  public async resizeTopRight(distance: {x: number; y: number}, options?: {mouseup?: boolean}): Promise<void> {
    const dialogBounds = await this.getBoundingBox('dialog');
    await this.resize(
      {x: dialogBounds.right, y: dialogBounds.top},
      {x: dialogBounds.right + distance.x, y: dialogBounds.top + distance.y},
      options,
    );
  }

  public async resizeBottomLeft(distance: {x: number; y: number}, options?: {mouseup?: boolean}): Promise<void> {
    const dialogBounds = await this.getBoundingBox('dialog');
    await this.resize(
      {x: dialogBounds.left, y: dialogBounds.bottom},
      {x: dialogBounds.left + distance.x, y: dialogBounds.bottom + distance.y},
      options,
    );
  }

  public async resizeBottomRight(distance: {x: number; y: number}, options?: {mouseup?: boolean}): Promise<void> {
    const dialogBounds = await this.getBoundingBox('dialog');
    await this.resize(
      {x: dialogBounds.right, y: dialogBounds.bottom},
      {x: dialogBounds.right + distance.x, y: dialogBounds.bottom + distance.y},
      options,
    );
  }

  private async resize(from: {x: number; y: number}, to: {x: number; y: number}, options?: {mouseup?: boolean}): Promise<void> {
    const mouse = this.locator.page().mouse;
    await mouse.move(from.x, from.y);
    await mouse.down();
    await mouse.move(to.x, to.y, {steps: 10});
    if (options?.mouseup ?? true) {
      await mouse.up();
    }
  }
}
