/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {FrameLocator, Locator, Page} from '@playwright/test';
import {selectBy, DomRect, fromRect, getCssClasses} from '../../helper/testing.util';

/**
 * Page object to interact with {@link SciRouterOutletElement}.
 */
export class SciRouterOutletPO {

  /**
   * Use to locate the <sci-router-outlet>.
   */
  public readonly locator: Locator;
  /**
   * Use to locate elements in the iframe of the <sci-router-outlet>.
   */
  public readonly frameLocator: FrameLocator;
  /**
   * Use to locate the splash displayed for microfrontends signaling ready.
   */
  public readonly splash: Locator;

  constructor(page: Page, locateBy: {name?: string; cssClass?: string | string[]}) {
    if (!locateBy.name && !locateBy.cssClass?.length) {
      throw Error('[PageObjectError] Missing required name or CSS class to locate SciRouterOutlet.');
    }
    this.locator = page.locator(selectBy('sci-router-outlet', {attributes: {name: locateBy.name}, cssClass: locateBy.cssClass}));
    this.frameLocator = this.locator.frameLocator('iframe');
    this.splash = this.locator.locator('wb-microfrontend-splash');
  }

  public async getName(): Promise<string> {
    return (await this.locator.getAttribute('name'))!;
  }

  public async getCapabilityId(): Promise<string> {
    return (await this.locator.getAttribute('data-capabilityid'))!;
  }

  public async getAppSymbolicName(): Promise<string> {
    return (await this.locator.getAttribute('data-app'))!;
  }

  public async getBoundingBox(): Promise<DomRect> {
    return fromRect(await this.locator.boundingBox());
  }

  public getCssClasses(): Promise<string[]> {
    return getCssClasses(this.locator);
  }
}
