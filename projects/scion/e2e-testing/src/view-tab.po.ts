/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {DomRect, fromRect, getCssClasses, getPerspectiveId, hasCssClass} from './helper/testing.util';
import {Locator, Page} from '@playwright/test';
import {PartPO} from './part.po';
import {ViewTabContextMenuPO} from './view-tab-context-menu.po';
import {ViewMoveDialogTestPagePO} from './workbench/page-object/test-pages/view-move-dialog-test-page.po';
import {AppPO} from './app.po';
import {ViewId} from '@scion/workbench';
import {ViewInfo, ViewInfoDialogPO} from './workbench/page-object/view-info-dialog.po';
import {ViewDrageHandlePO} from './view-drag-handle.po';

/**
 * Handle for interacting with a workbench view tab.
 */
export class ViewTabPO {

  /**
   * Handle to the part in which this view tab is contained.
   */
  public readonly part: PartPO;

  /**
   * Locates the title of the view tab.
   */
  public readonly title = this.locator.locator('.e2e-title');

  /**
   * Locates the heading of the view tab.
   */
  public readonly heading = this.locator.locator('.e2e-heading');

  /**
   * Locates the close button of the view tab.
   */
  public readonly closeButton = this.locator.locator('.e2e-close');

  constructor(public readonly locator: Locator, part: PartPO) {
    this.part = part;
  }

  public async getViewId(): Promise<ViewId> {
    return (await this.locator.getAttribute('data-viewid'))! as ViewId;
  }

  public async click(): Promise<void> {
    await this.locator.click();
  }

  public async dblclick(): Promise<void> {
    await this.locator.dblclick();
  }

  public async close(): Promise<void> {
    await this.locator.hover();
    await this.locator.locator('.e2e-close').click();
  }

  public isDirty(): Promise<boolean> {
    return hasCssClass(this.locator, 'e2e-dirty');
  }

  public isActive(): Promise<boolean> {
    return hasCssClass(this.locator, 'active');
  }

  /**
   * Tests if this tab is fully scrolled into view.
   */
  public async isScrolledIntoView(): Promise<boolean> {
    const partId = await this.part.getPartId();

    return this.locator.evaluate((viewTabElement: HTMLElement, partId: string) => {
      const tabbarViewport = document.querySelector(`wb-part[data-partid="${partId}"] wb-part-bar sci-viewport.e2e-tabbar`);
      return new Promise<boolean>(resolve => {
        const intersectionObserver = new IntersectionObserver(([entry]) => {
          intersectionObserver.disconnect();
          resolve(entry.isIntersecting);
        }, {root: tabbarViewport, threshold: 1});
        intersectionObserver.observe(viewTabElement);
      });
    }, partId);
  }

  public getCssClasses(): Promise<string[]> {
    return getCssClasses(this.locator);
  }

  /**
   * Opens the context menu of this view tab.
   */
  public async openContextMenu(): Promise<ViewTabContextMenuPO> {
    await this.locator.click({button: 'right'});
    const viewId = await this.getViewId();
    return new ViewTabContextMenuPO(this.locator.page().locator(`div.cdk-overlay-pane wb-view-menu[data-viewid="${viewId}"]`));
  }

  /**
   * Moves this view to a new browser window.
   */
  public async moveToNewWindow(): Promise<AppPO> {
    const contextMenu = await this.openContextMenu();

    // Wait for the specified window to open; must be invoked prior to opening the window.
    const newPagePredicate = async (page: Page): Promise<boolean> => (await getPerspectiveId(page)).match(/anonymous\..+/) !== null;
    const [newPage] = await Promise.all([
      this.locator.page().waitForEvent('popup', {predicate: newPagePredicate}),
      contextMenu.menuItems.moveToNewWindow.click(),
    ]);

    // Wait until the workbench in the new page completed startup.
    const newAppPO = new AppPO(newPage);
    await newAppPO.waitUntilWorkbenchStarted();
    return newAppPO;
  }

  /**
   * Moves this view to a different or new part in the specified region.
   *
   * Unlike the {@link startDrag} method, this operation does not perform a native drag and drop operation but
   * moves the view programmatically. Use this method to move a view to another window as not supported
   * by Playwright.
   */
  public async moveTo(partId: string, options?: {region?: 'north' | 'south' | 'west' | 'east'; workbenchId?: string}): Promise<void> {
    await this.click();

    const contextMenu = await this.openContextMenu();
    await contextMenu.menuItems.moveView.click();

    const dialog = new AppPO(this.locator.page()).dialog({cssClass: 'e2e-move-view'});

    const dialogPage = new ViewMoveDialogTestPagePO(dialog);
    await dialogPage.enterWorkbenchId(options?.workbenchId ?? '');
    await dialogPage.enterPartId(partId);
    await dialogPage.enterRegion(options?.region ?? '');
    await dialogPage.pressOK();
  }

  /**
   * Starts dragging this tab.
   *
   * Use the returned drag handle to control the drag operation.
   */
  public async startDrag(): Promise<ViewDrageHandlePO> {
    const {hcenter, vcenter} = await this.getBoundingBox();
    const page = this.locator.page();

    await page.mouse.move(hcenter, vcenter, {steps: 1});
    await page.mouse.down();

    return new ViewDrageHandlePO(page.locator('wb-view-tab-drag-image'), {x: hcenter, y: vcenter});
  }

  /**
   * Opens a dialog with information about the view.
   */
  public async openInfoDialog(): Promise<ViewInfoDialogPO> {
    const contextMenu = await this.openContextMenu();
    await contextMenu.menuItems.showViewInfo.click();

    const dialog = new AppPO(this.locator.page()).dialog({cssClass: 'e2e-view-info'});
    return new ViewInfoDialogPO(dialog);
  }

  /**
   * Gets information about the view.
   */
  public async getInfo(): Promise<ViewInfo> {
    const infoDialog = await this.openInfoDialog();

    try {
      return await infoDialog.getInfo();
    }
    finally {
      await infoDialog.close();
    }
  }

  /**
   * Enters the title of the view.
   */
  public async setTitle(title: string): Promise<void> {
    const infoDialog = await this.openInfoDialog();
    await infoDialog.enterTitle(title);
    await infoDialog.close();
  }

  /**
   * Sets the width of a tab.
   */
  public async setWidth(width: string): Promise<void> {
    await this.locator.evaluate((viewTabElement: HTMLElement, width: string) => {
      viewTabElement.style.setProperty('width', width);
    }, width);
  }

  /**
   * Gets the boundings box of the tab.
   */
  public async getBoundingBox(): Promise<DomRect> {
    return fromRect(await this.locator.boundingBox());
  }
}
