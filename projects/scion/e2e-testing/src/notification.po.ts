/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {DomRect, fromRect, getCssClasses, isPresent} from './helper/testing.util';

/**
 * Handle for interacting with a workbench notification.
 */
export class NotificationPO {

  constructor(private readonly _locator: Locator) {
  }

  public async isPresent(): Promise<boolean> {
    return isPresent(this._locator);
  }

  public async isVisible(): Promise<boolean> {
    return this._locator.isVisible();
  }

  public async getBoundingBox(): Promise<DomRect> {
    return fromRect(await this._locator.boundingBox());
  }

  public async getTitle(): Promise<string> {
    return this._locator.locator('header.e2e-title').innerText();
  }

  public async getSeverity(): Promise<'info' | 'warn' | 'error' | null> {
    const cssClasses = await getCssClasses(this._locator);
    if (cssClasses.includes('e2e-severity-info')) {
      return 'info';
    }
    else if (cssClasses.includes('e2e-severity-warn')) {
      return 'warn';
    }
    else if (cssClasses.includes('e2e-severity-error')) {
      return 'error';
    }
    return null;
  }

  public async getDuration(): Promise<'short' | 'medium' | 'long' | 'infinite' | null> {
    const cssClasses = await getCssClasses(this._locator);
    if (cssClasses.includes('e2e-duration-short')) {
      return 'short';
    }
    else if (cssClasses.includes('e2e-duration-medium')) {
      return 'medium';
    }
    else if (cssClasses.includes('e2e-duration-long')) {
      return 'long';
    }
    else if (cssClasses.includes('infinite')) {
      return 'infinite';
    }
    return null;
  }

  public async clickClose(): Promise<void> {
    await this._locator.locator('.e2e-close').click();
  }

  public getCssClasses(): Promise<string[]> {
    return getCssClasses(this._locator);
  }

  public locator(selector?: string): Locator {
    return selector ? this._locator.locator(selector) : this._locator;
  }
}
