/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceArray} from './helper/testing.util';
import {StartPagePO} from './start-page.po';
import {Locator, Page} from '@playwright/test';
import {PartPO} from './part.po';
import {ViewPO} from './view.po';
import {ViewTabPO} from './view-tab.po';
import {PopupPO} from './popup.po';
import {MessageBoxPO} from './message-box.po';
import {NotificationPO} from './notification.po';

export class AppPO {

  private _workbenchStartupQueryParams!: URLSearchParams;

  /**
   * Handle for interacting with the currently active workbench part.
   */
  public readonly activePart = new PartPO(this.page.locator('wb-view-part.active'));

  constructor(public readonly page: Page) {
  }

  /**
   * Navigates to the testing app.
   *
   * By passing a features object, you can control how to start the workbench and which app features to enable.
   */
  public async navigateTo(features?: Features): Promise<void> {
    this._workbenchStartupQueryParams = new URLSearchParams();
    this._workbenchStartupQueryParams.append(WorkenchStartupQueryParams.LAUNCHER, features?.launcher ?? 'LAZY');
    this._workbenchStartupQueryParams.append(WorkenchStartupQueryParams.STANDALONE, `${(features?.microfrontendSupport ?? true) === false}`);
    this._workbenchStartupQueryParams.append(WorkenchStartupQueryParams.CONFIRM_STARTUP, `${features?.confirmStartup ?? false}`);
    this._workbenchStartupQueryParams.append(WorkenchStartupQueryParams.SIMULATE_SLOW_CAPABILITY_LOOKUP, `${features?.simulateSlowCapabilityLookup ?? false}`);

    const featureQueryParams = new URLSearchParams();
    if (features?.stickyStartViewTab !== undefined) {
      featureQueryParams.append('stickyStartViewTab', `${features.stickyStartViewTab}`);
    }

    if (features?.showNewTabAction !== undefined) {
      featureQueryParams.append('showNewTabAction', `${features.showNewTabAction}`);
    }

    await this.page.goto(`/?${this._workbenchStartupQueryParams.toString()}#/${featureQueryParams.toString() ? `?${featureQueryParams.toString()}` : ''}`);
    // Wait until the workbench completed startup.
    await this.waitUntilWorkbenchStarted();
  }

  /**
   * Reloads the app with current features preserved.
   */
  public async reload(): Promise<void> {
    // We cannot call `this._page.reload()` because workbench startup options are not part of the hash-based URL
    // and would therefore be lost on a reload.
    const reloadUrl = new URL(this.page.url());
    this._workbenchStartupQueryParams.forEach((value, key) => reloadUrl.searchParams.append(key, value));

    await this.page.goto(reloadUrl.toString());
    // Wait until the workbench completed startup.
    await this.waitUntilWorkbenchStarted();
  }

  /**
   * Handle to the specified part in the workbench layout.
   *
   * @param locateBy - Specifies how to locate the part.
   *        <ul>
   *          <li>partId: Identifies the part by its id</li>
   *        </ul>
   */
  public part(locateBy: {partId: string}): PartPO {
    return new PartPO(this.page.locator(`wb-view-part[data-partid="${locateBy.partId}"]`));
  }

  /**
   * Handle to the specified view in the workbench layout.
   *
   * @param locateBy - Specifies how to locate the view. Either `viewId` or `cssClass` must be set.
   *        <ul>
   *          <li>viewId?: Identifies the view by its id</li>
   *          <li>cssClass?: Identifies the view by its CSS class</li>
   *        </ul>
   */
  public view(locateBy: {viewId?: string; cssClass?: string}): ViewPO {
    if (locateBy.viewId !== undefined) {
      const viewLocator = this.page.locator(`wb-view[data-viewid="${locateBy.viewId}"]`);
      const viewTabLocator = this.page.locator(`wb-view-tab[data-viewid="${locateBy.viewId}"]`);
      const partLocator = this.page.locator('wb-view-part', {has: viewTabLocator});
      return new ViewPO(viewLocator, new ViewTabPO(viewTabLocator, new PartPO(partLocator)));
    }
    else if (locateBy.cssClass !== undefined) {
      const viewLocator = this.page.locator(`wb-view.${locateBy.cssClass}`);
      const viewTabLocator = this.page.locator(`wb-view-tab.${locateBy.cssClass}`);
      const partLocator: Locator = this.page.locator('wb-view-part', {has: viewTabLocator});
      return new ViewPO(viewLocator, new ViewTabPO(viewTabLocator, new PartPO(partLocator)));
    }
    throw Error(`[ViewLocateError] Missing required locator. Either 'viewId' or 'cssClass' must be set.`);
  }

  /**
   * Handle to the specified popup.
   */
  public popup(locateBy?: {cssClass?: string | string[]}): PopupPO {
    const cssClasses = coerceArray(locateBy?.cssClass).map(cssClass => cssClass.replace(/\./g, '\\.'));
    return new PopupPO(this.page.locator(['.wb-popup'].concat(cssClasses).join('.')));
  }

  /**
   * Handle to the specified notification.
   */
  public notification(locateBy?: {cssClass?: string | string[]}): NotificationPO {
    const cssClasses = coerceArray(locateBy?.cssClass).map(cssClass => cssClass.replace(/\./g, '\\.'));
    return new NotificationPO(this.page.locator(['wb-notification'].concat(cssClasses).join('.')));
  }

  /**
   * Handle to the specified message box.
   */
  public messagebox(locateBy?: {cssClass?: string | string[]}): MessageBoxPO {
    const cssClasses = coerceArray(locateBy?.cssClass).map(cssClass => cssClass.replace(/\./g, '\\.'));
    return new MessageBoxPO(this.page.locator(['wb-message-box'].concat(cssClasses).join('.')));
  }

  /**
   * Returns the locator of opened popups.
   *
   * TODO [#358] Remove locator after fixed issue https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/358
   */
  public popupLocator(): Locator {
    return this.page.locator('wb-popup');
  }

  /**
   * Returns the number of opened message boxes.
   */
  public getMessageBoxCount(): Promise<number> {
    return this.page.locator('wb-message-box').count();
  }

  /**
   * Returns the number of displayed notifications.
   */
  public getNotificationCount(): Promise<number> {
    return this.page.locator('wb-notification').count();
  }

  /**
   * Opens a new view tab.
   */
  public async openNewViewTab(): Promise<StartPagePO> {
    const newTabViewPartActionPO = this.activePart.action({cssClass: 'e2e-open-new-tab'});
    if (!await newTabViewPartActionPO.isPresent()) {
      throw Error('Opening a new view tab requires the part action \'e2e-open-new-tab\' to be present, but it could not be found. Have you disabled the \'showNewTabAction\' feature?');
    }
    await newTabViewPartActionPO.click();
    return new StartPagePO(this, await this.activePart.activeView.getViewId());
  }

  /**
   * Waits until the workbench finished startup.
   */
  public async waitUntilWorkbenchStarted(): Promise<void> {
    await this.page.locator('wb-workbench:not(.starting)').waitFor({state: 'visible'});
  }
}

/**
 * Configures features of the testing app.
 */
export interface Features {
  /**
   * Controls launching of the testing app. By default, if not specified, starts the workbench lazy.
   */
  launcher?: 'APP_INITIALIZER' | 'LAZY';
  /**
   * Controls if to enable microfrontend support. By default, if not specified, microfrontend support is enabled.
   */
  microfrontendSupport?: boolean;
  /**
   * Controls whether the start view tab should always be opened when no other tabs are open, e.g., on startup, or when closing all views.
   * By default, if not specified, this feature is turned off.
   */
  stickyStartViewTab?: boolean;
  /**
   * Controls whether to display the part action for opening a new tab.
   * By default, if not specified, this feature is turned on.
   */
  showNewTabAction?: boolean;
  /**
   * Allows pausing the workbench startup by displaying an alert dialog that the user must confirm in order to continue the workbench startup.
   */
  confirmStartup?: boolean;
  /**
   * Simulates the slow retrieval of the microfrontend's current view capability by delaying capability lookups by 2000ms.
   */
  simulateSlowCapabilityLookup?: boolean;
}

/**
 * Query params to instrument the workbench startup.
 */
enum WorkenchStartupQueryParams {
  /**
   * Query param to set the workbench launch strategy.
   */
  LAUNCHER = 'launcher',

  /**
   * Query param to set if to run the workbench standalone, or to start it with microfrontend support.
   */
  STANDALONE = 'standalone',

  /**
   * Query param if to display an alert dialog during workbench startup to pause the workbench startup until the user confirms the alert.
   */
  CONFIRM_STARTUP = 'confirmStartup',

  /**
   * Query param to throttle capability lookups to simulate slow capability retrievals.
   */
  SIMULATE_SLOW_CAPABILITY_LOOKUP = 'simulateSlowCapabilityLookup',
}
