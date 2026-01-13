/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceArray, selectBy, DomRect, fromRect, getCssClasses} from './helper/testing.util';
import {Locator, Page} from '@playwright/test';
import {PartPO} from './part.po';
import {ViewTabPO} from './view-tab.po';
import {ViewId} from '@scion/workbench';
import {ViewInfo} from './workbench/page-object/view-info-dialog.po';
import {ScrollbarPO} from './scrollbar.po';
import {WorkbenchAccessor, WorkbenchViewNavigationE2E} from './workbench-accessor';
import {RequireOne} from './helper/utility-types';
import {MAIN_AREA} from './workbench.model';

/**
 * Handle for interacting with a workbench view.
 */
export class ViewPO {

  private readonly _workbenchAccessor: WorkbenchAccessor;

  public readonly locator: Locator;
  /**
   * Handle to the tab of the view in the tab bar.
   */
  public readonly tab: ViewTabPO;
  /**
   * Handle to the part in which this view tab is contained.
   */
  public readonly part: PartPO;

  public readonly viewport: Locator;
  public readonly scrollbars: {vertical: ScrollbarPO; horizontal: ScrollbarPO};
  public readonly locateBy?: {id?: ViewId; cssClass?: string[]};

  constructor(page: Page, locateBy: RequireOne<{viewId: ViewId; cssClass: string | string[]}> | {locator: Locator; viewTab: ViewTabPO}) {
    if ('locator' in locateBy) {
      this.locator = locateBy.locator;
      this.tab = locateBy.viewTab;
    }
    else {
      const viewTabLocator = page.locator(selectBy('wb-view-tab', {attributes: {'data-viewid': locateBy.viewId}, cssClass: locateBy.cssClass}));
      const partLocator = page.locator(`wb-part:not([data-partid="${MAIN_AREA}"])`, {has: viewTabLocator});
      this.locateBy = {id: locateBy.viewId, cssClass: coerceArray(locateBy.cssClass)};
      this.locator = page.locator(selectBy('wb-view-slot', {attributes: {'data-viewid': locateBy.viewId}, cssClass: locateBy.cssClass}));
      this.tab = new ViewTabPO(viewTabLocator, new PartPO(page, partLocator));
    }

    this._workbenchAccessor = new WorkbenchAccessor(page);
    this.part = this.tab.part;
    this.viewport = this.locator.locator('> sci-viewport');
    this.scrollbars = {
      vertical: new ScrollbarPO(this.viewport.locator('> sci-scrollbar.e2e-vertical')),
      horizontal: new ScrollbarPO(this.viewport.locator('> sci-scrollbar.e2e-horizontal')),
    };
  }

  public getViewId(): Promise<ViewId> {
    return this.tab.getViewId();
  }

  public getInfo(): Promise<ViewInfo> {
    return this.tab.getInfo();
  }

  /**
   * Gets the activation instant of this view.
   */
  public async activationInstant(): Promise<number> {
    const viewId = await this.getViewId();
    return this._workbenchAccessor.view({viewId}).then(view => view.activationInstant);
  }

  /**
   * Gets navigation details of this view.
   */
  public async navigation(): Promise<WorkbenchViewNavigationE2E> {
    const viewId = await this.getViewId();
    return this._workbenchAccessor.view({viewId}).then(view => view.navigation);
  }

  public waitUntilAttached(): Promise<void> {
    return this.locator.waitFor({state: 'attached'});
  }

  public getCssClasses(): Promise<string[]> {
    return getCssClasses(this.locator);
  }

  public async getBoundingBox(): Promise<DomRect> {
    return fromRect(await this.locator.boundingBox());
  }

  /**
   * Returns the scroll position as closed interval [0,1].
   */
  public getScrollPosition(orientation: 'horizontal' | 'vertical'): Promise<number> {
    return this.viewport.locator('> div.viewport').evaluate((viewport: HTMLElement, orientation: 'horizontal' | 'vertical') => {
      if (orientation === 'horizontal') {
        return viewport.scrollLeft / (viewport.scrollWidth - viewport.clientWidth);
      }
      else {
        return viewport.scrollTop / (viewport.scrollHeight - viewport.clientHeight);
      }
    }, orientation);
  }
}
