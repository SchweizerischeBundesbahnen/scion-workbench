/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from '../../app.po';
import {FrameLocator, Locator} from '@playwright/test';
import {DomRect, fromRect, getCssClasses} from '../../helper/testing.util';

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

  constructor(appPO: AppPO, locateBy: {name?: string; cssClass?: string | string[]; locator?: Locator}) {
    this.locator = locateBy.locator ?? appPO.page.locator(this.createRouterOutletSelector(locateBy));
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

  private createRouterOutletSelector(locateBy: {name?: string; cssClass?: string | string[]}): string {
    if (locateBy.name && locateBy.cssClass) {
      return new Array<string>()
        .concat(`sci-router-outlet[name="${locateBy.name}"]`)
        .concat(locateBy.cssClass)
        .join('.');
    }
    else if (locateBy.name) {
      return `sci-router-outlet[name="${locateBy.name}"]`;
    }
    else if (locateBy.cssClass) {
      return new Array<string>()
        .concat('sci-router-outlet')
        .concat(locateBy.cssClass)
        .join('.');
    }
    throw Error('[RouterOutletSelectorError] Missing required outlet name or CSS class');
  }
}
