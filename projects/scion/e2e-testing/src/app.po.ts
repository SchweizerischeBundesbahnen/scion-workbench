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
import {ActivityId, DialogId, PartId, PopupId, ViewId} from '@scion/workbench';
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
   * Locates workbench popups.
   */
  public readonly popups: Locator;

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
    this.desktop = new DesktopPO(this.page.locator('wb-desktop-slot'));
    this.notifications = this.page.locator('wb-notification');
    this.dialogs = this.page.locator('wb-dialog');
    this.popups = this.page.locator('wb-popup');
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
      this._workbenchStartupQueryParams.append(WorkbenchStartupQueryParams.APP_CONFIG_QUERY_PARAM, options.appConfig);
    }
    if (options?.launcher) {
      this._workbenchStartupQueryParams.append(WorkbenchStartupQueryParams.LAUNCHER, options.launcher);
    }
    if (!(options?.microfrontendSupport ?? true)) {
      this._workbenchStartupQueryParams.append(WorkbenchStartupQueryParams.STANDALONE, String(true));
    }
    if (options?.confirmStartup) {
      this._workbenchStartupQueryParams.append(WorkbenchStartupQueryParams.CONFIRM_STARTUP, String(true));
    }
    if (options?.simulateSlowCapabilityLookup) {
      this._workbenchStartupQueryParams.append(WorkbenchStartupQueryParams.SIMULATE_SLOW_CAPABILITY_LOOKUP, String(true));
    }
    if (options?.designTokens) {
      this._workbenchStartupQueryParams.append(WorkbenchStartupQueryParams.DESIGN_TOKENS, JSON.stringify(options.designTokens));
    }
    if (options?.dialogModalityScope) {
      this._workbenchStartupQueryParams.append(WorkbenchStartupQueryParams.DIALOG_MODALITY_SCOPE, options.dialogModalityScope);
    }
    if (options?.mainAreaInitialPartId) {
      this._workbenchStartupQueryParams.append(WorkbenchStartupQueryParams.MAIN_AREA_INITIAL_PART_ID, options.mainAreaInitialPartId);
    }
    if (options?.preloadInactiveMicrofrontendViews) {
      this._workbenchStartupQueryParams.append(WorkbenchStartupQueryParams.PRELOAD_INACTIVE_MICROFRONTEND_VIEWS, String(true));
    }
    if (options?.logLevel) {
      this._workbenchStartupQueryParams.append(WorkbenchStartupQueryParams.LOG_LEVEL, options.logLevel);
    }

    const featureQueryParams = new URLSearchParams();
    if (options?.stickyViewTab) {
      featureQueryParams.append('stickyViewTab', String(true));
    }
    if (options?.desktop) {
      featureQueryParams.append(WorkbenchStartupQueryParams.DESKTOP, options.desktop);
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
   * Handle for interacting with the active workbench part in the specified grid.
   */
  public activePart(locateBy: {grid: 'main' | 'mainArea' | ActivityId}): PartPO {
    return new PartPO(this.page.locator(`wb-part[data-grid="${dasherize(locateBy.grid)}"][data-active]`));
  }

  /**
   * Handle for interacting with the active workbench view in the specified part.
   */
  public activeView(locateBy: {partId: PartId}): ViewPO {
    return this.part({partId: locateBy.partId}).activeView;
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
    let locator: Locator;
    if (locateBy?.peripheral === true) {
      locator = this.page.locator('wb-part[data-peripheral] wb-view-tab');
    }
    else if (locateBy?.peripheral === false) {
      locator = this.page.locator(`wb-part:not([data-peripheral]):not([data-partid="${MAIN_AREA}"] wb-view-tab`);
    }
    else {
      locator = this.page.locator('wb-view-tab');
    }

    const cssClasses = coerceArray(locateBy?.cssClass);
    if (cssClasses.length) {
      locator = locator.locator(`:scope.${cssClasses.map(escapeCssClass).join('.')}`);
    }
    return locator;
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
  public popup(locateBy?: {popupId?: PopupId; cssClass?: string | string[]}): PopupPO {
    let locator = this.page.locator('wb-popup');
    if (locateBy?.popupId) {
      locator = locator.locator(`:scope[data-popupid="${locateBy.popupId}"]`);
    }
    const cssClasses = coerceArray(locateBy?.cssClass);
    if (cssClasses.length) {
      locator = locator.locator(`:scope.${cssClasses.map(escapeCssClass).join('.')}`);
    }
    return new PopupPO(locator);
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
    const cssClasses = coerceArray(locateBy?.cssClass).map(escapeCssClass);
    const locator = this.page.locator(['wb-notification'].concat(cssClasses).join('.'));
    return new NotificationPO(locateBy?.nth !== undefined ? locator.nth(locateBy.nth) : locator);
  }

  /**
   * Handle to the specified message box.
   */
  public messagebox(locateBy?: {dialogId?: DialogId; cssClass?: string | string[]; nth?: number}): MessageBoxPO {
    return new MessageBoxPO(this.dialog({dialogId: locateBy?.dialogId, cssClass: locateBy?.cssClass, nth: locateBy?.nth}));
  }

  /**
   * Handle to the specified dialog.
   */
  public dialog(locateBy?: {dialogId?: DialogId; cssClass?: string | string[]; nth?: number}): DialogPO {
    let locator = this.page.locator('wb-dialog');
    if (locateBy?.dialogId) {
      locator = locator.locator(`:scope[data-dialogid="${locateBy.dialogId}"]`);
    }
    const cssClasses = coerceArray(locateBy?.cssClass);
    if (cssClasses.length) {
      locator = locator.locator(`:scope.${cssClasses.map(escapeCssClass).join('.')}`);
    }
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
    const focusOwner = await waitUntilStable(() => this.focusOwner());
    if (!focusOwner?.startsWith('view.')) {
      throw Error(`[PageObjectError] Expected view to have focus, but was ${focusOwner}.`);
    }
    return new StartPagePO(this, {viewId: focusOwner as ViewId});
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
  public async waitForLayoutChange(options?: {navigationId?: number}): Promise<void> {
    const navigationId = options?.navigationId ?? await this.getCurrentNavigationId();
    await waitForCondition(async () => (await this.getCurrentNavigationId()) !== navigationId);
  }

  /**
   * Returns a unique id that increments with each navigation event.
   *
   * This flag is set in `app.component.ts` in the 'workbench-testing-app'.
   */
  public getCurrentNavigationId(): Promise<number> {
    return this.page.locator('app-root').getAttribute('data-navigationid').then(value => value ? Number.parseInt(value) : 0);
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
   * Returns the id of the focused workbench element, or `null` if no workbench element has the focus.
   *
   * Note that the focused workbench element does not necessarily correspond to the active DOM element.
   */
  public async focusOwner(): Promise<PartId | ViewId | DialogId | PopupId | null> {
    return this.workbench.activeElement();
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
   * Indicates if the specified part is blocked by a dialog.
   */
  public async isPartBlocked(partId: PartId | Promise<PartId>): Promise<boolean> {
    return (await this.page.locator(`.e2e-glasspane[data-partid="${await partId}"]`).count()) > 0;
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
  public async isDialogBlocked(dialogId: DialogId | Promise<string>): Promise<boolean> {
    return (await this.page.locator(`.e2e-glasspane[data-dialogid="${await dialogId}"]`).count()) > 0;
  }

  /**
   * Indicates if the specified popup is blocked by a dialog.
   */
  public async isPopupBlocked(popupId: PopupId | Promise<string>): Promise<boolean> {
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
   * Specifies the component to display as desktop. Defaults to `StartPageComponent`.
   *
   * Available desktops:
   * - 'legacy-start-page': Displays the start page using a primary router-outlet. No longer required with the removal of legacy start page support.
   * - 'desktop-page': Displays the 'DesktopPageComponent'.
   * - 'focus-page': Displays the 'FocusTestPageComponent'.
   * - 'layout-page': Displays the 'LayoutPageComponent'.
   */
  desktop?: 'legacy-start-page' | 'desktop-page' | 'focus-page' | 'layout-page';
  /**
   * Wait until the workbench completed startup.
   */
  waitUntilWorkbenchStarted?: false;
  /**
   * Sets the log level of the SCION Workbench. Defaults to `info`.
   */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  /**
   * Controls whether to preload inactive microfrontend views not defining the `lazy` property to maintain compatibility with applications setting view titles and headings in view microfrontends. Defaults to `false`.
   *
   * @deprecated since version 20.0.0-beta.6. Introduced in 20.0.0-beta.6 to maintain compatibility with applications setting view titles and headings in view microfrontends. API will be removed in version 22.
   */
  preloadInactiveMicrofrontendViews?: true;
}

/**
 * Query params to instrument the workbench startup.
 */
export enum WorkbenchStartupQueryParams {

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
   * Query param to provide design tokens to the application.
   */
  DESIGN_TOKENS = 'designTokens',

  /**
   * Query param to set the scope for application-modal dialogs.
   */
  DIALOG_MODALITY_SCOPE = 'dialogModalityScope',

  /**
   * Query param to set the component to display as desktop.
   */
  DESKTOP = 'desktop',

  /**
   * Query param to control the identity of the initial part in the main area.
   */
  MAIN_AREA_INITIAL_PART_ID = 'mainAreaInitialPartId',

  /**
   * Query param to set the log level of the SCION Workbench.
   */
  LOG_LEVEL = 'logLevel',

  /**
   * Query param to control whether to preload inactive microfrontend views not defining the `lazy` property.
   */
  PRELOAD_INACTIVE_MICROFRONTEND_VIEWS = 'preloadInactiveMicrofrontendViews',
}

/**
 * Escapes the CSS class to support passing a workbench element id (such as a view id) as CSS class.
 */
function escapeCssClass(cssClass: string): string {
  return cssClass.replace(/\./g, '\\.');
}
