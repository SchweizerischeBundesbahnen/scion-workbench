/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceArray, DomRect, fromRect, waitForCondition, waitUntilStable} from './helper/testing.util';
import {StartPagePO} from './start-page.po';
import {expect, Locator, Page} from '@playwright/test';
import {PartPO} from './part.po';
import {ViewPO} from './view.po';
import {ViewTabPO} from './view-tab.po';
import {PopupPO} from './popup.po';
import {MessageBoxPO} from './message-box.po';
import {NotificationPO} from './notification.po';
import {AppHeaderPO} from './app-header.po';
import {DialogPO} from './dialog.po';
import {ActivityId, PartId, ViewId} from '@scion/workbench';
import {WorkbenchAccessor} from './workbench-accessor';
import {ActivityItemPO} from './activity-item.po';
import {ActivityPanelPO} from './activity-panel.po';
import {RequireOne} from './helper/utility-types';
import {dasherize} from './helper/dasherize.util';
import {GridPO} from './grid.po';
import {DesktopPO} from './desktop.po';
import {ConsoleLogs} from './helper/console-logs';
import {MAIN_AREA} from './workbench.model';

/**
 * Central point to interact with the testing app in end-to-end tests.
 */
export class AppPO {

  private _workbenchStartupQueryParams = new URLSearchParams();

  /**
   * Handle for interacting with the header of the testing application.
   */
  public readonly header: AppHeaderPO;

  /**
   * Locates the workbench root element `<wb-workbench>`.
   */
  public readonly workbenchRoot: Locator;

  /**
   * Handle for interacting with the workbench desktop.
   */
  public readonly desktop: DesktopPO;

  /**
   * Locates workbench notifications.
   */
  public readonly notifications: Locator;

  /**
   * Locates workbench dialogs.
   */
  public readonly dialogs: Locator;

  /**
   * Locates the drop placeholder.
   */
  public readonly dropPlaceholder: Locator;

  /**
   * Locates the drop zones.
   */
  public readonly dropZones: Locator;

  /**
   * Enables programmatic interaction with the Workbench API.
   */
  public readonly workbench: WorkbenchAccessor;

  constructor(public readonly page: Page) {
    this.header = new AppHeaderPO(this.page.locator('app-header'));
    this.workbenchRoot = this.page.locator('wb-workbench');
    this.desktop = new DesktopPO(this.page);
    this.notifications = this.page.locator('wb-notification');
    this.dialogs = this.page.locator('wb-dialog');
    this.dropPlaceholder = this.page.locator('div.e2e-drop-placeholder');
    this.dropZones = this.page.locator('div.e2e-drop-zone');
    this.workbench = new WorkbenchAccessor(this.page);
  }

  /**
   * Navigates to the testing app.
   *
   * By passing a features object, you can control how to start the workbench and which app features to enable.
   */
  public async navigateTo(options?: Options): Promise<void> {
    const consoleLogs = new ConsoleLogs(this.page);

    // Prepare local storage.
    if (options?.localStorage) {
      await this.navigateTo({microfrontendSupport: false});
      await this.page.evaluate(data => {
        Object.entries(data).forEach(([key, value]) => window.localStorage.setItem(key, value));
      }, options.localStorage);
      await this.page.goto('about:blank');
    }

    this._workbenchStartupQueryParams = new URLSearchParams();
    if (options?.appConfig) {
      this._workbenchStartupQueryParams.append(WorkenchStartupQueryParams.APP_CONFIG_QUERY_PARAM, options.appConfig);
    }
    if (options?.launcher) {
      this._workbenchStartupQueryParams.append(WorkenchStartupQueryParams.LAUNCHER, options.launcher);
    }
    if (!(options?.microfrontendSupport ?? true)) {
      this._workbenchStartupQueryParams.append(WorkenchStartupQueryParams.STANDALONE, String(true));
    }
    if (options?.confirmStartup) {
      this._workbenchStartupQueryParams.append(WorkenchStartupQueryParams.CONFIRM_STARTUP, String(true));
    }
    if (options?.simulateSlowCapabilityLookup) {
      this._workbenchStartupQueryParams.append(WorkenchStartupQueryParams.SIMULATE_SLOW_CAPABILITY_LOOKUP, String(true));
    }
    if (options?.perspectives?.length) {
      this._workbenchStartupQueryParams.append(WorkenchStartupQueryParams.PERSPECTIVES, options.perspectives.join(';'));
    }
    if (options?.designTokens) {
      this._workbenchStartupQueryParams.append(WorkenchStartupQueryParams.DESIGN_TOKENS, JSON.stringify(options.designTokens));
    }
    if (options?.dialogModalityScope) {
      this._workbenchStartupQueryParams.append(WorkenchStartupQueryParams.DIALOG_MODALITY_SCOPE, options.dialogModalityScope);
    }
    if (options?.mainAreaInitialPartId) {
      this._workbenchStartupQueryParams.append(WorkenchStartupQueryParams.MAIN_AREA_INITIAL_PART_ID, options.mainAreaInitialPartId);
    }

    const featureQueryParams = new URLSearchParams();
    if (options?.stickyViewTab) {
      featureQueryParams.append('stickyViewTab', String(true));
    }
    if (options?.useLegacyStartPage) {
      featureQueryParams.append('useLegacyStartPage', String(true));
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
    if (options?.waitUntilWorkbenchStarted ?? true) {
      await this.waitUntilWorkbenchStarted();
    }
    // Assert the application to be bootstraped with the specified app config.
    if (options?.appConfig) {
      await expect.poll(() => consoleLogs.get(), `Expected application to be bootstraped with app config "${options.appConfig}".`).toContain(`Bootstrapping application: "${options.appConfig}"`);
    }
    consoleLogs.dispose();
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
   * Clears the outlets in the URL.
   */
  public async clearOutlets(): Promise<void> {
    await this.page.goto('/#/');
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
   * Handle for interacting with the currently active workbench part in the specified grid.
   */
  public activePart(locateBy: {grid: 'main' | 'mainArea' | ActivityId}): PartPO {
    return new PartPO(this.page.locator(`wb-part[data-grid="${dasherize(locateBy.grid)}"].active`));
  }

  /**
   * Handle to the specified part in the workbench layout.
   *
   * @param locateBy - Specifies how to locate the part.
   * @param locateBy.partId - Identifies the part by its id.
   * @param locateBy.cssClass - Identifies the part by its CSS class.
   */
  public part(locateBy: {partId?: PartId; cssClass?: string}): PartPO {
    if (locateBy.partId !== undefined && locateBy.cssClass !== undefined) {
      return new PartPO(this.page.locator(`wb-part[data-partid="${locateBy.partId}"].${locateBy.cssClass}`));
    }
    else if (locateBy.partId !== undefined) {
      return new PartPO(this.page.locator(`wb-part[data-partid="${locateBy.partId}"]`));
    }
    else if (locateBy.cssClass !== undefined) {
      return new PartPO(this.page.locator(`wb-part.${locateBy.cssClass}`));
    }
    throw Error(`[PartLocateError] Missing required locator. Either 'partId' or 'cssClass', or both must be set.`);
  }

  /**
   * Locates opened views.
   *
   * @param locateBy - Controls which views to locate.
   * @param locateBy.peripheral - Controls whether to locate views located in the peripheral area.
   */
  public views(locateBy?: {peripheral?: boolean; cssClass?: string}): Locator {
    const locateByCssClass = locateBy?.cssClass ? `:scope.${locateBy.cssClass}` : ':scope';
    if (locateBy?.peripheral === true) {
      return this.page.locator('wb-part[data-peripheral] wb-view-tab').locator(locateByCssClass);
    }
    if (locateBy?.peripheral === false) {
      return this.page.locator(`wb-part:not([data-peripheral]):not([data-partid="${MAIN_AREA}"] wb-view-tab`).locator(locateByCssClass);
    }
    else {
      return this.page.locator('wb-view-tab').locator(locateByCssClass);
    }
  }

  /**
   * Handle to the specified view in the workbench layout.
   *
   * @param locateBy - Specifies how to locate the view. Either `viewId` or `cssClass`, or both must be set.
   * @param locateBy.viewId - Identifies the view by its id.
   * @param locateBy.cssClass - Identifies the view by its CSS class.
   */
  public view(locateBy: {viewId?: ViewId; cssClass?: string}): ViewPO {
    if (locateBy.viewId !== undefined && locateBy.cssClass !== undefined) {
      const viewLocator = this.page.locator(`wb-view-slot[data-viewid="${locateBy.viewId}"].${locateBy.cssClass}`);
      const viewTabLocator = this.page.locator(`wb-view-tab[data-viewid="${locateBy.viewId}"].${locateBy.cssClass}`);
      const partLocator = this.page.locator(`wb-part:not([data-partid="${MAIN_AREA}"])`, {has: viewTabLocator});
      return new ViewPO(viewLocator, new ViewTabPO(viewTabLocator, new PartPO(partLocator)));
    }
    else if (locateBy.viewId !== undefined) {
      const viewLocator = this.page.locator(`wb-view-slot[data-viewid="${locateBy.viewId}"]`);
      const viewTabLocator = this.page.locator(`wb-view-tab[data-viewid="${locateBy.viewId}"]`);
      const partLocator = this.page.locator(`wb-part:not([data-partid="${MAIN_AREA}"])`, {has: viewTabLocator});
      return new ViewPO(viewLocator, new ViewTabPO(viewTabLocator, new PartPO(partLocator)));
    }
    else if (locateBy.cssClass !== undefined) {
      const viewLocator = this.page.locator(`wb-view-slot.${locateBy.cssClass}`);
      const viewTabLocator = this.page.locator(`wb-view-tab.${locateBy.cssClass}`);
      const partLocator: Locator = this.page.locator(`wb-part:not([data-partid="${MAIN_AREA}"])`, {has: viewTabLocator});
      return new ViewPO(viewLocator, new ViewTabPO(viewTabLocator, new PartPO(partLocator)));
    }
    throw Error(`[ViewLocateError] Missing required locator. Either 'viewId' or 'cssClass', or both must be set.`);
  }

  /**
   * Handle to the specified grid in the workbench layout.
   *
   * @param locateBy - Specifies how to locate the grid.
   * @param locateBy.grid - Identifies the grid by its name.
   */
  public grid(locateBy: {grid: 'main' | 'mainArea' | ActivityId}): GridPO {
    return new GridPO(this.page.locator(`wb-grid[data-grid="${locateBy.grid}"]`));
  }

  /**
   * Handle to the specified activity item in the workbench layout.
   *
   * @param locateBy - Specifies how to locate the activity item.
   * @param locateBy.activityId - Identifies the activity by its id.
   * @param locateBy.cssClass - Identifies the activity by its CSS class.
   */
  public activityItem(locateBy: RequireOne<{activityId: ActivityId; cssClass: string}>): ActivityItemPO {
    if (locateBy.activityId !== undefined && locateBy.cssClass !== undefined) {
      return new ActivityItemPO(this.page.locator(`wb-activity-item[data-activityid="${locateBy.activityId}"].${locateBy.cssClass}`));
    }
    else if (locateBy.activityId !== undefined) {
      return new ActivityItemPO(this.page.locator(`wb-activity-item[data-activityid="${locateBy.activityId}"]`));
    }
    else {
      return new ActivityItemPO(this.page.locator(`wb-activity-item.${locateBy.cssClass}`));
    }
  }

  /**
   * Handle to the specified activity panel in the workbench layout.
   *
   * @param panel - Specifies which activity panel to locate.
   */
  public activityPanel(panel: 'left' | 'right' | 'bottom'): ActivityPanelPO {
    return new ActivityPanelPO(this.page.locator(`wb-activity-panel[data-panel="${panel}"]`));
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
    return fromRect(await this.workbenchRoot.boundingBox());
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
    await this.header.clickSettingMenuItem({cssClass: 'e2e-open-start-page'});
    // Wait until opened the start page to get its view id.
    await waitForCondition(async () => (await this.getCurrentNavigationId()) !== navigationId);
    const activePart = new PartPO(this.page.locator(`wb-part:not([data-peripheral]):not([data-partid="${MAIN_AREA}"]).active`));
    return new StartPagePO(this, {viewId: await activePart.activeView.getViewId()});
  }

  /**
   * Switches to the specified perspective.
   */
  public async switchPerspective(perspectiveId: string): Promise<void> {
    if (perspectiveId !== await this.getActivePerspectiveId()) {
      const navigationId = await this.getCurrentNavigationId();
      await this.header.switchPerspective(perspectiveId);
      await waitForCondition(async () => (await this.getCurrentNavigationId()) !== navigationId);
    }
  }

  /**
   * Waits until the workbench finished startup.
   */
  public async waitUntilWorkbenchStarted(): Promise<void> {
    await this.page.locator('wb-workbench wb-layout').waitFor({state: 'visible'});
  }

  /**
   * Waits for the layout to change.
   */
  public async waitForLayoutChange(options?: {navigationId?: string}): Promise<void> {
    const navigationId = options?.navigationId ?? await this.getCurrentNavigationId();
    await waitForCondition(async () => (await this.getCurrentNavigationId()) !== navigationId);
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
  public getWorkbenchId(): Promise<string> {
    return this.page.locator('app-root').getAttribute('data-workbench-id').then(id => id!);
  }

  /**
   * Returns the id of the currently active perspective.
   */
  public getActivePerspectiveId(): Promise<string> {
    return this.page.locator('app-root').getAttribute('data-perspective-id').then(id => id!);
  }

  /**
   * Sets given design token on the HTML root element.
   */
  public async setDesignToken(name: `--sci-${string}`, value: string): Promise<void> {
    await this.page.evaluate((token: {name: string; value: string}): void => {
      document.documentElement.style.setProperty(token.name, token.value);
    }, {name, value});
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
 * Options to control the startup of the testing app.
 */
export interface Options {
  /**
   * Specifies the URL to load into the browser. Defaults to the `baseURL` as specified in `playwright.config.ts`.
   */
  url?: string;
  /**
   * Controls launching of the testing app. Defaults to 'LAZY'.
   */
  launcher?: 'APP_INITIALIZER' | 'LAZY';
  /**
   * Controls if to enable microfrontend support. Defaults to `true`.
   */
  microfrontendSupport?: boolean;
  /**
   * Specifies the app config to bootstrap the testing app with.
   */
  appConfig?:
    'app-with-guard;forbidden=true' |
    'app-with-guard;forbidden=false' |
    'app-with-redirect;providers=workbench-before-router;routes=flat' |
    'app-with-redirect;providers=workbench-before-router;routes=nested' |
    'app-with-redirect;providers=workbench-after-router;routes=flat' |
    'app-with-redirect;providers=workbench-after-router;routes=nested';
  /**
   * Controls if to open the start page view when no other view is opened, e.g., on startup, or when closing all views. Defaults to `false`.
   */
  stickyViewTab?: boolean;
  /**
   * Pauses the workbench startup by displaying an alert dialog that the user must confirm in order to continue the workbench startup.
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
   * Controls the scope of application-modal workbench dialogs. Defaults to `workbench`.
   */
  dialogModalityScope?: 'workbench' | 'viewport';
  /**
   * Controls the identity of the initial part in the main area. Defaults to a UUID.
   */
  mainAreaInitialPartId?: PartId;
  /**
   * Specifies data to be in local storage.
   */
  localStorage?: {[key: string]: string};
  /**
   * Specifies design tokens available to the application.
   */
  designTokens?: {[name: string]: string};
  /**
   * Controls if to use the legacy start page (via empty-path route) instead of the desktop.
   *
   * @deprecated since version 19.0.0-beta.2. No longer required with the removal of legacy start page support.
   */
  useLegacyStartPage?: boolean;
  /**
   * Wait until the workbench completed startup.
   */
  waitUntilWorkbenchStarted?: false;
}

/**
 * Query params to instrument the workbench startup.
 */
export enum WorkenchStartupQueryParams {

  /**
   * Query param to bootstrap the app with a specific app config.
   *
   * Params can be passed in the form of matrix params: "app-with-guard;forbidden=true"
   *
   * Available configs:
   * - 'app-with-guard'
   * - 'app-with-redirect'
   *
   * See `main.ts`.
   */
  APP_CONFIG_QUERY_PARAM = 'appConfig',

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
   * Query param to provide design tokens to the application.
   */
  DESIGN_TOKENS = 'designTokens',

  /**
   * Query param to set the scope for application-modal dialogs.
   */
  DIALOG_MODALITY_SCOPE = 'dialogModalityScope',

  /**
   * Query param to control the identity of the initial part in the main area.
   */
  MAIN_AREA_INITIAL_PART_ID = 'mainAreaInitialPartId',
}
