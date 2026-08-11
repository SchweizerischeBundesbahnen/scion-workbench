/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {DomRect, fromRect, waitUntilStable} from '../../../helper/testing.util';
import {WorkbenchViewPagePO} from '../workbench-view-page.po';
import {ViewPO} from '../../../view.po';

/**
 * Page object to interact with {@link ViewportTestPageComponent}.
 */
export class ViewportTestPagePO implements WorkbenchViewPagePO {

  public readonly locator: Locator;
  public readonly scrollbar: ScrollbarPO;

  constructor(public view: ViewPO) {
    this.locator = view.locator.locator('app-viewport-test-page');
    this.scrollbar = new ScrollbarPO(this.locator.locator('sci-scrollbar[direction="vscroll"]'));
  }
}

export class ScrollbarPO {

  public readonly thumb: ThumbPO;

  constructor(public readonly locator: Locator) {
    this.thumb = new ThumbPO(locator.locator('div.e2e-thumb'));
  }

  public async innerBounds(): Promise<DomRect> {
    return fromRect(await this.locator.evaluate(element => {
      const {x, y} = element.getBoundingClientRect();
      return new DOMRect(x + element.clientLeft, y + element.clientTop, element.clientWidth, element.clientHeight);
    }));
  }
}

export class ThumbPO {

  constructor(public readonly locator: Locator) {
  }

  public async hover(): Promise<void> {
    await this.locator.hover();
  }

  public async vcenter(): Promise<number> {
    return waitUntilStable(async () => fromRect(await this.locator.boundingBox()).vcenter);
  }

  public async hcenter(): Promise<number> {
    return waitUntilStable(async () => fromRect(await this.locator.boundingBox()).hcenter);
  }
}
