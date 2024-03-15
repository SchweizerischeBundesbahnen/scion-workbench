/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceArray, DomRect, fromRect, waitForCondition, waitUntilStable} from './helper/testing.util';
import {StartPagePO} from './start-page.po';
import {Locator, Page} from '@playwright/test';
import {PartPO} from './part.po';
import {ViewPO} from './view.po';
import {ViewTabPO} from './view-tab.po';
import {PopupPO} from './popup.po';
import {MessageBoxPO} from './message-box.po';
import {NotificationPO} from './notification.po';
import {AppHeaderPO} from './app-header.po';
import {DialogPO} from './dialog.po';
import {ViewId} from '@scion/workbench';

export class AppPO {

  private _workbenchStartupQueryParams = new URLSearchParams();

  /**
   * Handle for interacting with the header of the testing application.
   */
  public readonly header = new AppHeaderPO(this.page.locator('app-header'));
  /**
   * Locates the 'wb-workbench' element.
   */
  public readonly workbench = this.page.locator('wb-workbench');

  /**
   * Locates workbench notifications.
   */
  public readonly notifications = this.page.locator('wb-notification');

  /**
   * Locates workbench dialogs.
   */
  public readonly dialogs = this.page.locator('wb-dialog');

  constructor(public readonly page: Page) {
  }

  /**
   * Navigates to the testing app.
   *
   * By passing a features object, you can control how to start the workbench and which app features to enable.
   */
  public async navigateTo(options?: Options): Promise<void> {
    // Prepare local storage.
    if (options?.localStorage) {
      await this.navigateTo({microfrontendSupport: false});
      await this.page.evaluate(data => {
        Object.entries(data).forEach(([key, value]) => window.localStorage.setItem(key, value));
      }, options.localStorage);
      await this.page.goto('about:blank');
    }

    this._workbenchStartupQueryParams = new URLSearchParams();
    this._workbenchStartupQueryParams.append(WorkenchStartupQueryParams.LAUNCHER, options?.launcher ?? 'LAZY');
    this._workbenchStartupQueryParams.append(WorkenchStartupQueryParams.STANDALONE, `${(options?.microfrontendSupport ?? true) === false}`);
    this._workbenchStartupQueryParams.append(WorkenchStartupQueryParams.CONFIRM_STARTUP, `${options?.confirmStartup ?? false}`);
    this._workbenchStartupQueryParams.append(WorkenchStartupQueryParams.SIMULATE_SLOW_CAPABILITY_LOOKUP, `${options?.simulateSlowCapabilityLookup ?? false}`);
    this._workbenchStartupQueryParams.append(WorkenchStartupQueryParams.PERSPECTIVES, `${(options?.perspectives ?? []).join(';')}`);
    this._workbenchStartupQueryParams.append(WorkenchStartupQueryParams.DIALOG_MODALITY_SCOPE, options?.dialogModalityScope ?? 'workbench');

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
    // Playwright does not navigate when navigating to the same URL, so we navigate to 'about:blank' first.
    await this.page.goto('about:blank');
    await this.page.goto(reloadUrl.toString());
    // Wait until the workbench completed startup.
    await this.waitUntilWorkbenchStarted();
    await waitUntilStable(() => this.getCurrentNavigationId());
  }

  /**
   * Opens a new browser window.
   */
  public async openNewWindow(): Promise<AppPO> {
    return new AppPO(await this.page.context().newPage());
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
   * @param locateBy.partId - Identifies the part by its id
   */
  public part(locateBy: {partId: string}): PartPO {
    return new PartPO(this.page.locator(`wb-part[data-partid="${locateBy.partId}"]`));
  }

  /**
   * Locates opened views.
   *
   * @param locateBy - Controls which views to locate.
   * @param locateBy.inMainArea - Controls whether to locate views contained in the main area (`true`), not contained in the main area (`false`), or both (not specified).
   */
  public views(locateBy?: {inMainArea?: boolean; cssClass?: string}): Locator {
    const locateByCssClass = locateBy?.cssClass ? `:scope.${locateBy?.cssClass}` : ':scope';
    if (locateBy?.inMainArea === true) {
      return this.page.locator('wb-part.e2e-main-area wb-view-tab').locator(locateByCssClass);
    }
    if (locateBy?.inMainArea === false) {
      return this.page.locator('wb-part:not(.e2e-main-area) wb-view-tab').locator(locateByCssClass);
    }
    else {
      return this.page.locator('wb-view-tab').locator(locateByCssClass);
    }
  }

  /**
   * Handle to the specified view in the workbench layout.
   *
   * @param locateBy - Specifies how to locate the view. Either `viewId` or `cssClass`, or both must be set.
   * @param locateBy.viewId - Identifies the view by its id
   * @param locateBy.cssClass - Identifies the view by its CSS class
   */
  public view(locateBy: {viewId?: ViewId; cssClass?: string}): ViewPO {
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
    return new PopupPO(this.page.locator(['wb-popup'].concat(cssClasses).join('.')));
  }

  /**
   * Returns bounding box of the 'wb-workbench' element.
   */
  public async workbenchBoundingBox(): Promise<DomRect> {
    return fromRect(await this.workbench.boundingBox());
  }

  /**
   * Returns the bounding box of the browser page viewport.
   */
  public viewportBoundingBox(): DomRect {
    return fromRect(this.page.viewportSize());
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
    return new MessageBoxPO(this.dialog(locateBy));
  }

  /**
   * Handle to the specified dialog.
   */
  public dialog(locateBy?: {cssClass?: string | string[]; nth?: number}): DialogPO {
    const cssClasses = coerceArray(locateBy?.cssClass).map(cssClass => cssClass.replace(/\./g, '\\.'));
    const locator = this.page.locator(['wb-dialog'].concat(cssClasses).join('.'));
    return new DialogPO(locateBy?.nth !== undefined ? locator.nth(locateBy.nth) : locator);
  }

  /**
   * Opens a new view tab.
   */
  public async openNewViewTab(): Promise<StartPagePO> {
    const navigationId = await this.getCurrentNavigationId();
    await this.header.clickMenuItem({cssClass: 'e2e-open-start-page'});
    // Wait until opened the start page to get its view id.
    await waitForCondition(async () => (await this.getCurrentNavigationId()) !== navigationId);
    const inMainArea = await this.hasMainArea();
    return new StartPagePO(this, {viewId: await this.activePart({inMainArea}).activeView.getViewId()});
  }

  /**
   * Switches to the specified perspective.
   */
  public async switchPerspective(perspectiveId: string): Promise<void> {
    const navigationId = await this.getCurrentNavigationId();
    await this.header.perspectiveToggleButton({perspectiveId}).click();
    await waitForCondition(async () => (await this.getCurrentNavigationId()) !== navigationId);
  }

  /**
   * Changes the color scheme of the workbench.
   */
  public async changeColorScheme(colorScheme: 'light' | 'dark'): Promise<void> {
    await this.header.changeColorScheme(colorScheme);
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
  public getCurrentNavigationId(): Promise<string | undefined> {
    return this.page.locator('app-root').getAttribute('data-navigationid').then(value => value ?? undefined);
  }

  /**
   * Returns the unique id of this workbench.
   *
   * @see WORKBENCH_ID
   */
  public getWorkbenchId(): Promise<string | undefined> {
    return this.page.locator('app-root').getAttribute('data-workbench-id').then(value => value ?? undefined);
  }

  /**
   * Tests if specified drop zone is active, i.e., present in the DOM and armed for pointed events.
   */
  public async isDropZoneActive(target: {grid: 'workbench' | 'mainArea'; region: 'north' | 'east' | 'south' | 'west' | 'center'}): Promise<boolean> {
    const dropZoneCssClass = target.grid === 'mainArea' ? 'e2e-main-area-grid' : 'e2e-workbench-grid';
    const dropZoneLocator = this.page.locator(`div.e2e-view-drop-zone.e2e-${target.region}.${dropZoneCssClass}`);
    return await dropZoneLocator.count() > 0 && await dropZoneLocator.evaluate((element: HTMLElement) => getComputedStyle(element).pointerEvents) !== 'none';
  }

  /**
   * Returns the bounding box of the specified drop zone.
   */
  public async getDropZoneBoundingBox(target: {grid: 'workbench' | 'mainArea'; region: 'north' | 'east' | 'south' | 'west' | 'center'}): Promise<DomRect> {
    const dropZoneCssClass = target.grid === 'mainArea' ? 'e2e-main-area-grid' : 'e2e-workbench-grid';
    const dropZoneLocator = this.page.locator(`div.e2e-view-drop-zone.e2e-${target.region}.${dropZoneCssClass}`);
    return fromRect(await dropZoneLocator.boundingBox());
  }

  /**
   * Sets given design token on the workbench HTML element.
   */
  public async setDesignToken(name: string, value: string): Promise<void> {
    const pageFunction = (workbenchElement: HTMLElement, token: {name: string; value: string}): void => workbenchElement.style.setProperty(token.name, token.value);
    await this.workbench.evaluate(pageFunction, {name, value});
  }

  /**
   * Obtains the name of the current browser window.
   */
  public getWindowName(): Promise<string> {
    return this.page.evaluate(() => window.name);
  }

  /**
   * Obtains the value associated with the specified key from local storage.
   */
  public getLocalStorageItem(key: string): Promise<string | null> {
    return this.page.evaluate(key => localStorage.getItem(key), key);
  }

  /**
   * Tests if the layout has a main area.
   */
  public hasMainArea(): Promise<boolean> {
    return this.workbench.locator('wb-main-area-layout').isVisible();
  }

  /**
   * Indicates if the workbench is blocked by a dialog.
   */
  public async isWorkbenchBlocked(): Promise<boolean> {
    return (await this.page.locator('.e2e-glasspane.e2e-workbench').count()) > 0;
  }

  /**
   * Indicates if the specified view is blocked by a dialog.
   */
  public async isViewBlocked(viewId: ViewId | Promise<ViewId>): Promise<boolean> {
    return (await this.page.locator(`.e2e-glasspane[data-viewid="${await viewId}"]`).count()) > 0;
  }

  /**
   * Indicates if the specified dialog is blocked by a dialog.
   */
  public async isDialogBlocked(dialogId: string | Promise<string>): Promise<boolean> {
    return (await this.page.locator(`.e2e-glasspane[data-dialogid="${await dialogId}"]`).count()) > 0;
  }

  /**
   * Indicates if the specified popup is blocked by a dialog.
   */
  public async isPopupBlocked(popupId: string | Promise<string>): Promise<boolean> {
    return (await this.page.locator(`.e2e-glasspane[data-popupid="${await popupId}"]`).count()) > 0;
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
  /**
   * Controls the scope of application-modal workbench dialogs. By default, if not specified, workbench scope will be used.
   */
  dialogModalityScope?: 'workbench' | 'viewport';
  /**
   * Specifies data to be in local storage.
   */
  localStorage?: {[key: string]: string};
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

  /**
   * Query param to set the scope for application-modal dialogs.
   */
  DIALOG_MODALITY_SCOPE = 'dialogModalityScope',
}
