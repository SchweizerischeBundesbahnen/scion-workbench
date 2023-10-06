/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceArray, fromRect, isPresent, waitUntilStable} from './helper/testing.util';
import {StartPagePO} from './start-page.po';
import {Locator, Page} from '@playwright/test';
import {PartPO} from './part.po';
import {ViewPO} from './view.po';
import {ViewTabPO} from './view-tab.po';
import {PopupPO} from './popup.po';
import {MessageBoxPO} from './message-box.po';
import {NotificationPO} from './notification.po';
import {AppHeaderPO} from './app-header.po';

export class AppPO {

  private _workbenchStartupQueryParams = new URLSearchParams();

  /**
   * Handle for interacting with the header of the testing application.
   */
  public readonly header = new AppHeaderPO(this.page.locator('app-header'));
  /**
   * Locates the 'wb-workbench' element.
   */
  public readonly workbenchLocator = this.page.locator('wb-workbench');

  constructor(public readonly page: Page) {
  }

  /**
   * Navigates to the testing app.
   *
   * By passing a features object, you can control how to start the workbench and which app features to enable.
   */
  public async navigateTo(options?: Options): Promise<void> {
    this._workbenchStartupQueryParams = new URLSearchParams();
    this._workbenchStartupQueryParams.append(WorkenchStartupQueryParams.LAUNCHER, options?.launcher ?? 'LAZY');
    this._workbenchStartupQueryParams.append(WorkenchStartupQueryParams.STANDALONE, `${(options?.microfrontendSupport ?? true) === false}`);
    this._workbenchStartupQueryParams.append(WorkenchStartupQueryParams.CONFIRM_STARTUP, `${options?.confirmStartup ?? false}`);
    this._workbenchStartupQueryParams.append(WorkenchStartupQueryParams.SIMULATE_SLOW_CAPABILITY_LOOKUP, `${options?.simulateSlowCapabilityLookup ?? false}`);
    this._workbenchStartupQueryParams.append(WorkenchStartupQueryParams.PERSPECTIVES, `${(options?.perspectives ?? []).join(';')}`);

    const featureQueryParams = new URLSearchParams();
    if (options?.stickyStartViewTab !== undefined) {
      featureQueryParams.append('stickyStartViewTab', `${options.stickyStartViewTab}`);
    }

    // Perform navigation.
    await this.page.goto((() => {
      const [baseUrl = '/', hashedUrl = ''] = (options?.url?.split('#') ?? []);

      // Add startup query params to the base URL part.
      const url = `${baseUrl}?${this._workbenchStartupQueryParams.toString()}#${hashedUrl}`;
      if (!featureQueryParams.size) {
        return url;
      }
      // Add feature query params to the hashed URL part.
      return hashedUrl.includes('?') ? `${url}&${featureQueryParams}` : `${url}?${featureQueryParams}`;
    })());

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
    await waitUntilStable(() => this.getCurrentNavigationId());
  }

  /**
   * Instructs the browser to move back one page in the session history.
   */
  public async navigateBack(): Promise<void> {
    await this.page.goBack();
    await waitUntilStable(() => this.getCurrentNavigationId());
  }

  /**
   * Instructs the browser to move forward one page in the session history.
   */
  public async navigateForward(): Promise<void> {
    await this.page.goForward();
    await waitUntilStable(() => this.getCurrentNavigationId());
  }

  /**
   * Handle for interacting with the currently active workbench part in the specified area.
   */
  public activePart(locateBy: {inMainArea: boolean}): PartPO {
    if (locateBy.inMainArea) {
      return new PartPO(this.page.locator('wb-part.e2e-main-area.active'));
    }
    else {
      return new PartPO(this.page.locator('wb-part:not(.e2e-main-area).active'));
    }
  }

  /**
   * Handle to the specified part in the workbench layout.
   *
   * @param locateBy - Specifies how to locate the part.
   *        @property partId - Identifies the part by its id
   */
  public part(locateBy: {partId: string}): PartPO {
    return new PartPO(this.page.locator(`wb-part[data-partid="${locateBy.partId}"]`));
  }

  /**
   * Returns parts visible in the layout.
   */
  public async partIds(): Promise<string[]> {
    const partLocators = await this.page.locator('wb-part').all();
    return Promise.all(partLocators.map(async locator => (await locator.getAttribute('data-partid'))!));
  }

  /**
   * Returns views visible in the layout.
   */
  public async viewIds(): Promise<string[]> {
    const viewLocators = await this.page.locator('wb-view').all();
    return Promise.all(viewLocators.map(async locator => (await locator.getAttribute('data-viewid'))!));
  }

  /**
   * Returns the number of opened views.
   */
  public viewCount(): Promise<number> {
    return this.page.locator('wb-view').count();
  }

  /**
   * Handle to the specified view in the workbench layout.
   *
   * @param locateBy - Specifies how to locate the view. Either `viewId` or `cssClass`, or both must be set.
   *        @property viewId? - Identifies the view by its id
   *        @property cssClass? - Identifies the view by its CSS class
   */
  public view(locateBy: {viewId?: string; cssClass?: string}): ViewPO {
    if (locateBy.viewId !== undefined && locateBy.cssClass !== undefined) {
      const viewLocator = this.page.locator(`wb-view[data-viewid="${locateBy.viewId}"].${locateBy.cssClass}`);
      const viewTabLocator = this.page.locator(`wb-view-tab[data-viewid="${locateBy.viewId}"].${locateBy.cssClass}`);
      const partLocator = this.page.locator('wb-part', {has: viewTabLocator});
      return new ViewPO(viewLocator, new ViewTabPO(viewTabLocator, new PartPO(partLocator)));
    }
    else if (locateBy.viewId !== undefined) {
      const viewLocator = this.page.locator(`wb-view[data-viewid="${locateBy.viewId}"]`);
      const viewTabLocator = this.page.locator(`wb-view-tab[data-viewid="${locateBy.viewId}"]`);
      const partLocator = this.page.locator('wb-part', {has: viewTabLocator});
      return new ViewPO(viewLocator, new ViewTabPO(viewTabLocator, new PartPO(partLocator)));
    }
    else if (locateBy.cssClass !== undefined) {
      const viewLocator = this.page.locator(`wb-view.${locateBy.cssClass}`);
      const viewTabLocator = this.page.locator(`wb-view-tab.${locateBy.cssClass}`);
      const partLocator: Locator = this.page.locator('wb-part', {has: viewTabLocator});
      return new ViewPO(viewLocator, new ViewTabPO(viewTabLocator, new PartPO(partLocator)));
    }
    throw Error(`[ViewLocateError] Missing required locator. Either 'viewId' or 'cssClass', or both must be set.`);
  }

  /**
   * Handle to the specified popup.
   */
  public popup(locateBy?: {cssClass?: string | string[]}): PopupPO {
    const cssClasses = coerceArray(locateBy?.cssClass).map(cssClass => cssClass.replace(/\./g, '\\.'));
    return new PopupPO(this.page.locator(['.wb-popup'].concat(cssClasses).join('.')));
  }

  /**
   * Returns the size of the page viewport.
   */
  public size(): {width: number; height: number} {
    return {
      width: this.page.viewportSize()?.width ?? 0,
      height: this.page.viewportSize()?.height ?? 0,
    };
  }

  /**
   * Handle to the specified notification.
   */
  public notification(locateBy?: {cssClass?: string | string[]; nth?: number}): NotificationPO {
    const cssClasses = coerceArray(locateBy?.cssClass).map(cssClass => cssClass.replace(/\./g, '\\.'));
    const locator = this.page.locator(['wb-notification'].concat(cssClasses).join('.'));
    return new NotificationPO(locateBy?.nth !== undefined ? locator.nth(locateBy.nth) : locator);
  }

  /**
   * Handle to the specified message box.
   */
  public messagebox(locateBy?: {cssClass?: string | string[]; nth?: number}): MessageBoxPO {
    const cssClasses = coerceArray(locateBy?.cssClass).map(cssClass => cssClass.replace(/\./g, '\\.'));
    const locator = this.page.locator(['wb-message-box'].concat(cssClasses).join('.'));
    return new MessageBoxPO(locateBy?.nth !== undefined ? locator.nth(locateBy.nth) : locator);
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
   * Tests whether the workbench component is present in the DOM and is displaying the workbench layout.
   */
  public async isWorkbenchComponentPresent(): Promise<boolean> {
    return await isPresent(this.page.locator('wb-workbench')) && await this.page.locator('wb-workbench wb-workbench-layout').isVisible();
  }

  /**
   * Opens a new view tab.
   */
  public async openNewViewTab(): Promise<StartPagePO> {
    await this.header.clickMenuItem({cssClass: 'e2e-open-start-page'});
    return new StartPagePO(this, await this.activePart({inMainArea: true}).activeView.getViewId());
  }

  /**
   * Switches to the specified perspective.
   */
  public async switchPerspective(perspectiveId: string): Promise<void> {
    await this.header.perspectiveToggleButton({perspectiveId}).click();
  }

  /**
   * Waits until the workbench finished startup.
   */
  public async waitUntilWorkbenchStarted(): Promise<void> {
    await this.page.locator('wb-workbench wb-workbench-layout').waitFor({state: 'visible'});
  }

  /**
   * Returns a unique id set after a navigation has been performed.
   *
   * This identifier should be used to detect when the current navigation has completed.
   *
   * This flag is set in `app.component.ts` in the 'workbench-testing-app'.
   */
  public getCurrentNavigationId(): Promise<string | null> {
    return this.page.locator('app-root').getAttribute('data-navigationid');
  }

  /**
   * Tests if specified drop zone is active, i.e., present in the DOM and armed for pointed events.
   */
  public async isDropZoneActive(target: {grid: 'workbench' | 'mainArea'; region: 'north' | 'east' | 'south' | 'west' | 'center'}): Promise<boolean> {
    const dropZoneCssClass = target.grid === 'mainArea' ? 'e2e-main-area-grid' : 'e2e-workbench-grid';
    const dropZoneLocator = this.page.locator(`div.e2e-view-drop-zone.e2e-${target.region}.${dropZoneCssClass}`);
    return await isPresent(dropZoneLocator) && await dropZoneLocator.evaluate((element: HTMLElement) => getComputedStyle(element).pointerEvents) !== 'none';
  }

  /**
   * Returns the bounding box of the specified drop zone.
   */
  public async getDropZoneBoundingBox(target: {grid: 'workbench' | 'mainArea'; region: 'north' | 'east' | 'south' | 'west' | 'center'}): Promise<DOMRect & {hcenter: number; vcenter: number}> {
    const dropZoneCssClass = target.grid === 'mainArea' ? 'e2e-main-area-grid' : 'e2e-workbench-grid';
    const dropZoneLocator = this.page.locator(`div.e2e-view-drop-zone.e2e-${target.region}.${dropZoneCssClass}`);
    return fromRect(await dropZoneLocator.boundingBox());
  }

  /**
   * Waits for the specified window to open; must be invoked prior to opening the window.
   *
   * Example:
   *
   * ```ts
   * const [newAppPO] = await Promise.all([
   *   appPO.waitForWindow(async page => (await getPerspectiveName(page)) === 'testee'),
   *   buttonPO.openInNewWindow(),
   * ]);
   * ```
   */
  public async waitForWindow(predicate: (page: Page) => Promise<boolean>): Promise<AppPO> {
    const page = await this.page.waitForEvent('popup', {predicate});
    const newAppPO = new AppPO(page);
    // Wait until the workbench completed startup.
    await newAppPO.waitUntilWorkbenchStarted();
    return newAppPO;
  }

  /**
   * Sets given design token on the workbench HTML element.
   */
  public async setDesignToken(name: string, value: string): Promise<void> {
    const pageFunction = (workbenchElement: HTMLElement, token: {name: string; value: string}): void => workbenchElement.style.setProperty(token.name, token.value);
    await this.workbenchLocator.evaluate(pageFunction, {name, value});
  }
}

/**
 * Configures options to start the testing app.
 */
export interface Options {
  /**
   * Specifies the URL to load into the browser. If not set, defaults to the `baseURL` as specified in `playwright.config.ts`.
   */
  url?: string;
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
   * Allows pausing the workbench startup by displaying an alert dialog that the user must confirm in order to continue the workbench startup.
   */
  confirmStartup?: boolean;
  /**
   * Simulates the slow retrieval of the microfrontend's current view capability by delaying capability lookups by 2000ms.
   */
  simulateSlowCapabilityLookup?: boolean;
  /**
   * Specifies perspectives to be registered in the testing app. Separate multiple perspectives by semicolon.
   */
  perspectives?: string[];
}

/**
 * Query params to instrument the workbench startup.
 */
export enum WorkenchStartupQueryParams {
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

  /**
   * Query param to register perspectives. Multiple perspectives are separated by semicolon.
   */
  PERSPECTIVES = 'perspectives',
}
