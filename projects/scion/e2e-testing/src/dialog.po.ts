/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {DomRect, fromRect} from './helper/testing.util';

/**
 * PO for interacting with a workbench dialog.
 */
export class DialogPO {

  private readonly _dialogPane: Locator;

  public readonly header: Locator;
  public readonly title: Locator;
  public readonly closeButton: Locator;
  public readonly resizeHandles: Locator;

  constructor(public readonly locator: Locator) {
    this._dialogPane = this.locator.locator('div.e2e-dialog-pane');
    this.header = this._dialogPane.locator('header.e2e-dialog-header');
    this.title = this.header.locator('div.e2e-title > span');
    this.closeButton = this.header.locator('button.e2e-close');
    this.resizeHandles = this._dialogPane.locator('div.e2e-resize-handle');
  }

  public async getDialogBoundingBox(): Promise<DomRect> {
    return fromRect(await this._dialogPane.boundingBox());
  }

  public async getGlassPaneBoundingBox(): Promise<DomRect> {
    return fromRect(await this.locator.page().locator('.cdk-overlay-pane.wb-dialog-glass-pane', {has: this.locator}).boundingBox());
  }

  public async close(options?: {timeout?: number}): Promise<void> {
    await this.closeButton.click(options);
  }

  public async clickHeader(options?: {timeout?: number}): Promise<void> {
    await this.header.click(options);
  }

  public async moveDialog(distance: {x: number; y: number}): Promise<void> {
    const {hcenter: x, vcenter: y} = fromRect(await this.header.boundingBox());

    const mouse = this.locator.page().mouse;
    await mouse.move(x, y);
    await mouse.down();
    await mouse.move(x + distance.x, y + distance.y, {steps: 10});
    await mouse.up();
  }

  public async resizeTop(distance: number, options?: {mouseup?: boolean}): Promise<void> {
    const dialogBounds = await this.getDialogBoundingBox();

    await this.resize(
      {x: dialogBounds.hcenter, y: dialogBounds.top},
      {x: dialogBounds.hcenter, y: dialogBounds.top + distance},
      options,
    );
  }

  public async resizeBottom(distance: number, options?: {mouseup?: boolean}): Promise<void> {
    const dialogBounds = await this.getDialogBoundingBox();

    await this.resize(
      {x: dialogBounds.hcenter, y: dialogBounds.bottom},
      {x: dialogBounds.hcenter, y: dialogBounds.bottom + distance},
      options,
    );
  }

  public async resizeLeft(distance: number, options?: {mouseup?: boolean}): Promise<void> {
    const dialogBounds = await this.getDialogBoundingBox();

    await this.resize(
      {x: dialogBounds.left, y: dialogBounds.vcenter},
      {x: dialogBounds.left + distance, y: dialogBounds.vcenter},
      options,
    );
  }

  public async resizeRight(distance: number, options?: {mouseup?: boolean}): Promise<void> {
    const dialogBounds = await this.getDialogBoundingBox();

    await this.resize(
      {x: dialogBounds.right, y: dialogBounds.vcenter},
      {x: dialogBounds.right + distance, y: dialogBounds.vcenter},
      options,
    );
  }

  public async resizeTopLeft(distance: {x: number; y: number}, options?: {mouseup?: boolean}): Promise<void> {
    const dialogBounds = await this.getDialogBoundingBox();
    await this.resize(
      {x: dialogBounds.left, y: dialogBounds.top},
      {x: dialogBounds.left + distance.x, y: dialogBounds.top + distance.y},
      options,
    );
  }

  public async resizeTopRight(distance: {x: number; y: number}, options?: {mouseup?: boolean}): Promise<void> {
    const dialogBounds = await this.getDialogBoundingBox();
    await this.resize(
      {x: dialogBounds.right, y: dialogBounds.top},
      {x: dialogBounds.right + distance.x, y: dialogBounds.top + distance.y},
      options,
    );
  }

  public async resizeBottomLeft(distance: {x: number; y: number}, options?: {mouseup?: boolean}): Promise<void> {
    const dialogBounds = await this.getDialogBoundingBox();
    await this.resize(
      {x: dialogBounds.left, y: dialogBounds.bottom},
      {x: dialogBounds.left + distance.x, y: dialogBounds.bottom + distance.y},
      options,
    );
  }

  public async resizeBottomRight(distance: {x: number; y: number}, options?: {mouseup?: boolean}): Promise<void> {
    const dialogBounds = await this.getDialogBoundingBox();
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
