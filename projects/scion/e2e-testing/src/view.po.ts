/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {DomRect, fromRect, getCssClasses} from './helper/testing.util';
import {Locator} from '@playwright/test';
import {PartPO} from './part.po';
import {ViewTabPO} from './view-tab.po';
import {ViewId} from '@scion/workbench';
import {ViewInfo} from './workbench/page-object/view-info-dialog.po';
import {ScrollbarPO} from './scrollbar.po';

/**
 * Handle for interacting with a workbench view.
 */
export class ViewPO {

  /**
   * Handle to the tab of the view in the tab bar.
   */
  public readonly tab: ViewTabPO;

  /**
   * Locates the message displayed if not navigated this view.
   */
  public readonly nullContentMessage: Locator;

  public readonly scrollbars: {
    vertical: ScrollbarPO;
    horizontal: ScrollbarPO;
  };

  constructor(public readonly locator: Locator, tab: ViewTabPO) {
    this.tab = tab;
    this.nullContentMessage = this.locator.locator('wb-null-content');
    this.scrollbars = {
      vertical: new ScrollbarPO(this.locator.locator(':scope > sci-viewport > sci-scrollbar.e2e-vertical')),
      horizontal: new ScrollbarPO(this.locator.locator(':scope > sci-viewport > sci-scrollbar.e2e-horizontal')),
    };
  }

  public getViewId(): Promise<ViewId> {
    return this.tab.getViewId();
  }

  public getInfo(): Promise<ViewInfo> {
    return this.tab.getInfo();
  }

  /**
   * Handle to the part in which this view is contained.
   */
  public get part(): PartPO {
    return this.tab.part;
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
    return this.locator.locator(':scope > sci-viewport > div.viewport').evaluate((viewport: HTMLElement, orientation: 'horizontal' | 'vertical') => {
      if (orientation === 'horizontal') {
        return viewport.scrollLeft / (viewport.scrollWidth - viewport.clientWidth);
      }
      else {
        return viewport.scrollTop / (viewport.scrollHeight - viewport.clientHeight);
      }
    }, orientation);
  }
}
