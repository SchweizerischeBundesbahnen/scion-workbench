/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceArray, fromRect, getCssClasses, isActiveElement, isCssClassPresent, isPresent, waitUntilBoundingBoxStable, waitUntilStable} from './helper/testing.util';
import {StartPagePO} from './start-page.po';
import {Locator, Page} from '@playwright/test';

export class AppPO {

  private _workbenchStartupQueryParams: URLSearchParams;

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
   * Returns a handle representing the view tab of given `viewId`, or which has given CSS class set.
   * This call does not send a command to the browser. Use 'isPresent()' to test its presence.
   *
   * @param findBy - Specifies how to locate the view tab. If both `viewId` and `cssClass` are not set, then the locator refers to the active view tab.
   *        <ul>
   *          <li>partId?: Identifies the part containing the view. If not set, uses the active part to find the view.</li>
   *          <li>viewId?: Identifies the view by its id</li>
   *          <li>cssClass?: Identifies the view by its CSS class</li>
   *        </ul>
   */
  public findViewTab(findBy?: {partId?: string; viewId?: string; cssClass?: string}): ViewTabPO {
    const page = this.page;
    const viewTabLocator = this.locateViewTab(findBy);

    return new class implements ViewTabPO {
      public async isPresent(): Promise<boolean> {
        return isPresent(viewTabLocator);
      }

      public async getViewId(): Promise<string> {
        return viewTabLocator.getAttribute('data-viewid');
      }

      public async activate(): Promise<void> {
        await viewTabLocator.click();
      }

      public async close(): Promise<void> {
        // hover the view-tab to make the close button visible
        await viewTabLocator.hover();
        await viewTabLocator.locator('.e2e-close').click();
      }

      public async getTitle(): Promise<string> {
        return viewTabLocator.locator('.e2e-title').innerText();
      }

      public async getHeading(): Promise<string> {
        return viewTabLocator.locator('.e2e-heading').innerText();
      }

      public async isDirty(): Promise<boolean> {
        const cssClasses = await getCssClasses(viewTabLocator);
        return cssClasses.includes('dirty');
      }

      public async isClosable(): Promise<boolean> {
        const closeButtonLocator = viewTabLocator.locator('.e2e-close');
        return await isPresent(closeButtonLocator) && await closeButtonLocator.isVisible();
      }

      public async isActive(): Promise<boolean> {
        const cssClasses = await getCssClasses(viewTabLocator);
        return cssClasses.includes('active');
      }

      public async getCssClasses(): Promise<string[]> {
        return getCssClasses(viewTabLocator);
      }

      public async openContextMenu(): Promise<ViewTabContextMenuPO> {
        await viewTabLocator.click({button: 'right'});
        const viewTabContextMenuLocator = page.locator('wb-view-menu');

        return new class implements ViewTabContextMenuPO {
          public async closeAllTabs(): Promise<void> {
            return viewTabContextMenuLocator.locator('.e2e-close-all-tabs').click();
          }
        };
      }
    };
  }

  /**
   * Returns a handle representing the view tab of given `viewId`, or which has given CSS class set.
   * This call does not send a command to the browser. Use 'isPresent()' to test its presence.
   *
   * @param findBy - Specifies how to locate the view. If both `viewId` and `cssClass` are not set, then the locator refers to the active view.
   *        <ul>
   *          <li>partId?: Identifies the part containing the view. If not set, uses the active part to find the view.</li>
   *          <li>viewId?: Identifies the view by its id</li>
   *          <li>cssClass?: Identifies the view by its CSS class</li>
   *        </ul>
   */
  public findView(findBy: {partId?: string; viewId?: string; cssClass?: string}): ViewPO {
    const viewLocator = this.locateView(findBy);
    const viewTabPO = this.findViewTab(findBy);

    return new class implements ViewPO {

      public viewTabPO = viewTabPO;

      public async isPresent(): Promise<boolean> {
        return isPresent(viewLocator);
      }

      public async isVisible(): Promise<boolean> {
        return viewLocator.isVisible();
      }

      public async getViewId(): Promise<string> {
        return viewLocator.getAttribute('data-viewid');
      }

      public waitUntilPresent(): Promise<void> {
        return viewLocator.waitFor({state: 'attached'});
      }

      public locator(selector: string): Locator {
        return viewLocator.locator(selector);
      }
    };
  }

  public getActiveView(partId?: string): ViewPO {
    return this.findView({partId});
  }

  public getActivePart(): PartPO {
    const partLocator = this.locateViewPart();

    return new class implements PartPO {

      public async isPresent(): Promise<boolean> {
        return isPresent(partLocator);
      }

      public async getPartId(): Promise<string> {
        return partLocator.getAttribute('data-partid');
      }

      public locator(selector: string): Locator {
        return partLocator.locator(selector);
      }
    };
  }

  /**
   * Returns the number of view tabs in the specified viewpart, or in the active viewpart if not specifying a part.
   *
   * Optionally, provide a CSS class to only count view tabs of given view.
   */
  public async getViewTabCount(findBy?: {partId?: string; viewCssClass?: string}): Promise<number> {
    const {partId, viewCssClass} = findBy || {};

    const viewpartLocator = this.locateViewPartBar(partId);
    const viewTabLocator = viewCssClass ? viewpartLocator.locator(`wb-view-tab.${viewCssClass}`) : viewpartLocator.locator('wb-view-tab');
    // It may take some time to insert or remove a view tab from the DOM.
    // In order to return the correct view tab count, we wait for it to become stable.
    return waitUntilStable(() => viewTabLocator.count());
  }

  /**
   * Returns the view ids in the order as displayed in the view tab bar.
   */
  public async getViewTabs(partId?: string): Promise<string[]> {
    const viewTabsLocator = this.locateViewPartBar(partId).locator('wb-view-tab');
    const viewReferences = [];

    for (let i = 0; i < await viewTabsLocator.count(); i++) {
      viewReferences.push(await viewTabsLocator.nth(i).getAttribute('data-viewid'));
    }

    return viewReferences;
  }

  /**
   * Returns whether the default page is displayed in the active part.
   * The default page is displayed if there are no open tabs in the part.
   */
  public async isDefaultPageShowing(componentSelector: string): Promise<boolean> {
    const activePart = this.locateViewPart();
    return isPresent(activePart.locator('sci-viewport.views-absent-outlet').locator(componentSelector));
  }

  /**
   * Returns whether the tabbar is displayed in the active part.
   * The tab bar is displayed when at least one view is open or part actions are displayed.
   */
  public async isViewTabBarShowing(): Promise<boolean> {
    return isPresent(this.locateViewPartBar());
  }

  /**
   * Returns a handle representing the popup having given CSS class(es) set.
   * This call does not send a command to the browser. Use 'isPresent()' to test its presence.
   */
  public findPopup(findBy: {cssClass: string | string[]}): PopupPO {
    const popupOverlayLocator = this.page.locator(`.wb-popup.${coerceArray(findBy.cssClass).join('.')}`);
    const popupComponentLocator = popupOverlayLocator.locator('wb-popup');

    return new class implements PopupPO {

      public async isPresent(): Promise<boolean> {
        return isPresent(popupComponentLocator);
      }

      public async isVisible(): Promise<boolean> {
        return popupComponentLocator.isVisible();
      }

      public async getClientRect(selector: 'cdk-overlay' | 'wb-popup' = 'wb-popup'): Promise<DOMRect> {
        const locator = selector === 'cdk-overlay' ? popupOverlayLocator : popupComponentLocator;
        await locator.waitFor({state: 'visible'});
        return waitUntilBoundingBoxStable(locator);
      }

      public async getAlign(): Promise<'east' | 'west' | 'north' | 'south'> {
        const cssClasses = await getCssClasses(popupOverlayLocator);
        if (cssClasses.includes('wb-east')) {
          return 'east';
        }
        if (cssClasses.includes('wb-west')) {
          return 'west';
        }
        if (cssClasses.includes('wb-north')) {
          return 'north';
        }
        if (cssClasses.includes('wb-south')) {
          return 'south';
        }
        throw Error('[PopupAlignError] Popup not aligned.');
      }

      public async hasVerticalOverflow(): Promise<boolean> {
        return isCssClassPresent(popupComponentLocator.locator('sci-viewport.e2e-popup-viewport > sci-scrollbar.vertical'), 'overflow');
      }

      public async hasHorizontalOverflow(): Promise<boolean> {
        return isCssClassPresent(popupComponentLocator.locator('sci-viewport.e2e-popup-viewport > sci-scrollbar.horizontal'), 'overflow');
      }

      public locator(selector: string): Locator {
        return popupComponentLocator.locator(selector);
      }

      public async waitUntilClosed(): Promise<void> {
        await popupComponentLocator.waitFor({state: 'detached'});
      }
    };
  }

  /**
   * Returns the locator of opened popups.
   */
  public popupLocator(): Locator {
    return this.page.locator('wb-popup');
  }

  /**
   * Returns the locator of opened message boxes.
   */
  public messageBoxLocator(): Locator {
    return this.page.locator('wb-workbench').locator('wb-message-box');
  }

  /**
   * Returns the number of opened message boxes.
   */
  public async getMessageBoxCount(): Promise<number> {
    return this.page.locator('wb-workbench').locator('wb-message-box').count();
  }

  /**
   * Returns the number of displayed notifications.
   */
  public async getNotificationCount(): Promise<number> {
    return this.page.locator('wb-workbench').locator('wb-notification').count();
  }

  /**
   * Returns a handle representing the notification having given CSS class(es) set.
   * This call does not send a command to the browser. Use 'isPresent()' to test its presence.
   */
  public findNotification(findBy: {cssClass: string | string[]}): NotificationPO {
    const notificationLocator = this.page.locator('wb-workbench').locator(`wb-notification.${coerceArray(findBy.cssClass).join('.')}`);

    return new class implements NotificationPO {
      public async isPresent(): Promise<boolean> {
        return isPresent(notificationLocator);
      }

      public async isVisible(): Promise<boolean> {
        return notificationLocator.isVisible();
      }

      public async getClientRect(): Promise<DOMRect> {
        return fromRect(await notificationLocator.boundingBox());
      }

      public async getTitle(): Promise<string> {
        return notificationLocator.locator('header.e2e-title').innerText();
      }

      public async getSeverity(): Promise<'info' | 'warn' | 'error'> {
        const cssClasses = await getCssClasses(notificationLocator);
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

      public async getDuration(): Promise<'short' | 'medium' | 'long' | 'infinite'> {
        const cssClasses = await getCssClasses(notificationLocator);
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
        await notificationLocator.locator('.e2e-close').click();
      }

      public getCssClasses(): Promise<string[]> {
        return getCssClasses(notificationLocator);
      }

      public locator(selector?: string): Locator {
        return selector ? notificationLocator.locator(selector) : notificationLocator;
      }
    };
  }

  /**
   * Returns a handle representing the message box having given CSS class(es) set.
   * This call does not send a command to the browser. Use 'isPresent()' to test its presence.
   */
  public findMessageBox(findBy: {cssClass: string | string[]}): MessageBoxPO {
    const page = this.page;
    const msgboxLocator = page.locator(`wb-message-box.${coerceArray(findBy.cssClass).join('.')}`);
    const msgboxComponentLocator = msgboxLocator.locator('.e2e-body');

    return new class implements MessageBoxPO {
      public async isPresent(): Promise<boolean> {
        return isPresent(msgboxComponentLocator);
      }

      public async isVisible(): Promise<boolean> {
        return msgboxComponentLocator.isVisible();
      }

      public async getClientRect(): Promise<DOMRect> {
        return fromRect(await msgboxLocator.boundingBox());
      }

      public async getTitle(): Promise<string> {
        return msgboxLocator.locator('header.e2e-title').innerText();
      }

      public async getSeverity(): Promise<'info' | 'warn' | 'error'> {
        const cssClasses = await getCssClasses(msgboxLocator);
        if (cssClasses.includes('e2e-severity-info')) {
          return 'info';
        }
        else if (cssClasses.includes('e2e-severity-warn')) {
          return 'warn';
        }
        else if (cssClasses.includes('e2e-severity-error')) {
          return 'error';
        }
        throw Error('Expected severity CSS class to be present, but was not.');
      }

      public async getModality(): Promise<'application' | 'view'> {
        if (await isPresent(page.locator('wb-message-box-stack.e2e-view-modal', {has: msgboxLocator}))) {
          return 'view';
        }
        if (await isPresent(page.locator('wb-message-box-stack.e2e-application-modal', {has: msgboxLocator}))) {
          return 'application';
        }
        throw Error('Message box not found in the view-modal nor in the application-modal message box stack.');
      }

      public async getActions(): Promise<Record<string, string>> {
        const actions: Record<string, string> = {};

        const actionsLocator = msgboxLocator.locator('button.e2e-action');
        const count = await actionsLocator.count();
        for (let i = 0; i < count; i++) {
          const action = await actionsLocator.nth(i);
          const cssClasses = await getCssClasses(action);
          const actionKey = cssClasses.find(candidate => candidate.startsWith('e2e-action-key-'));
          actions[actionKey.substring('e2e-action-key-'.length)] = await action.innerText();
        }

        return actions;
      }

      public async clickActionButton(action: string): Promise<void> {
        await msgboxLocator.locator(`button.e2e-action.e2e-action-key-${action}`).click();
        await msgboxLocator.waitFor({state: 'detached'});
      }

      public async isActionActive(actionKey: string): Promise<boolean> {
        return isActiveElement(msgboxLocator.locator('.e2e-button-bar').locator(`button.e2e-action.e2e-action-key-${actionKey}`));
      }

      public getCssClasses(): Promise<string[]> {
        return getCssClasses(msgboxLocator);
      }

      public locator(selector: string): Locator {
        return msgboxComponentLocator.locator(selector);
      }
    };
  }

  /**
   * Opens a new view tab.
   */
  public async openNewViewTab(): Promise<StartPagePO> {
    const newTabViewPartActionPO = this.findViewPartAction({buttonCssClass: 'e2e-open-new-tab'});
    if (!await newTabViewPartActionPO.isPresent()) {
      throw Error('Opening a new view tab requires the part action \'e2e-open-new-tab\' to be present, but it could not be found. Have you disabled the \'showNewTabAction\' feature?');
    }
    await newTabViewPartActionPO.click();
    const viewId = await this.getActiveView().getViewId();
    return new StartPagePO(this, viewId);
  }

  /**
   * Closes all views of all viewparts.
   */
  public async closeAllViewTabs(partId?: string): Promise<void> {
    const viewPartBarLocator = this.locateViewPartBar(partId);
    await viewPartBarLocator.locator('wb-view-tab').first().press('Control+Alt+Shift+K');
  }

  /**
   * Returns a handle representing the viewpart action which has given CSS class set.
   * This call does not send a command to the browser. Use 'isPresent()' to test its presence.
   */
  public findViewPartAction(findBy: {partId?: string; buttonCssClass: string}): ViewPartActionPO {
    const actionLocator = this.locateViewPartActionBar(findBy.partId).locator(`button.${findBy.buttonCssClass}`);

    return new class implements ViewPartActionPO {
      public async isPresent(): Promise<boolean> {
        return isPresent(actionLocator);
      }

      public async click(): Promise<void> {
        return actionLocator.click();
      }
    };
  }

  /**
   * Waits until the workbench finished startup.
   */
  public async waitUntilWorkbenchStarted(): Promise<void> {
    await this.page.locator('wb-workbench:not(.starting)').waitFor({state: 'visible'});
  }

  /**
   * Locates the given part, or the active part if not specifying a part.
   */
  private locateViewPart(partId?: string): Locator {
    if (partId) {
      return this.page.locator('wb-workbench').locator(`wb-view-part[data-partid="${partId}"]`);
    }
    else {
      return this.page.locator('wb-workbench').locator('wb-view-part.active');
    }
  }

  /**
   * Locates the tab bar in the given part, or in the active part if not specifying a part.
   */
  private locateViewPartBar(partId?: string): Locator {
    return this.locateViewPart(partId).locator('wb-view-part-bar');
  }

  /**
   * Locates the action bar in the given part, or in the active part if not specifying a part.
   */
  private locateViewPartActionBar(partId?: string): Locator {
    return this.locateViewPartBar(partId).locator('wb-view-part-action-bar');
  }

  /**
   * Locates a view tab based on given options.
   *
   * @param findBy - Specifies how to locate the view tab. If both `viewId` and `cssClass` are not set, then the locator refers to the active view tab.
   *        <ul>
   *          <li>partId?: Identifies the part containing the view. If not set, uses the active part to find the view.</li>
   *          <li>viewId?: Identifies the view by its id</li>
   *          <li>cssClass?: Identifies the view by its CSS class</li>
   *        </ul>
   */
  private locateViewTab(findBy?: {partId?: string; viewId?: string; cssClass?: string}): Locator {
    const viewPartBarLocator = this.locateViewPartBar(findBy?.partId);

    if (findBy?.viewId !== undefined) {
      return viewPartBarLocator.locator(`wb-view-tab[data-viewid="${findBy.viewId}"]`);
    }
    else if (findBy?.cssClass !== undefined) {
      return viewPartBarLocator.locator(`wb-view-tab.${findBy.cssClass}`);
    }
    else {
      return viewPartBarLocator.locator(`wb-view-tab.active`);
    }
  }

  /**
   * Locates a view based on given options.
   *
   * @param findBy - Specifies how to locate the view. If both `viewId` and `cssClass` are not set, then the locator refers to the active view.
   *        <ul>
   *          <li>partId?: Identifies the part containing the view. If not set, uses the active part to find the view.</li>
   *          <li>viewId?: Identifies the view by its id</li>
   *          <li>cssClass?: Identifies the view by its CSS class</li>
   *        </ul>
   */
  private locateView(findBy: {partId?: string; viewId?: string; cssClass?: string}): Locator {
    const viewPartLocator = this.locateViewPart(findBy.partId);

    if (findBy.viewId !== undefined) {
      return viewPartLocator.locator(`wb-view[data-viewid="${findBy.viewId}"]`);
    }
    else if (findBy.cssClass !== undefined) {
      return viewPartLocator.locator(`wb-view.${findBy.cssClass}`);
    }
    else {
      return viewPartLocator.locator(`wb-view`);
    }
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

export interface PartPO {

  getPartId(): Promise<string>;

  isPresent(): Promise<boolean>;

  locator(selector: string): Locator;
}

export interface ViewPO {
  readonly viewTabPO: ViewTabPO;

  getViewId(): Promise<string>;

  isPresent(): Promise<boolean>;

  isVisible(): Promise<boolean>;

  waitUntilPresent(): Promise<void>;

  locator(selector: string): Locator;
}

export interface ViewTabPO {
  isPresent(): Promise<boolean>;

  getViewId(): Promise<string>;

  getTitle(): Promise<string>;

  getHeading(): Promise<string>;

  isDirty(): Promise<boolean>;

  isClosable(): Promise<boolean>;

  close(): Promise<void>;

  activate(): Promise<void>;

  isActive(): Promise<boolean>;

  getCssClasses(): Promise<string[]>;

  openContextMenu(): Promise<ViewTabContextMenuPO>;
}

export interface ViewTabContextMenuPO {
  closeAllTabs(): Promise<void>;
}

export interface PopupPO {
  isPresent(): Promise<boolean>;

  isVisible(): Promise<boolean>;

  getClientRect(selector?: 'cdk-overlay' | 'wb-popup'): Promise<DOMRect>;

  hasVerticalOverflow(): Promise<boolean>;

  hasHorizontalOverflow(): Promise<boolean>;

  getAlign(): Promise<'east' | 'west' | 'north' | 'south'>;

  locator(selector: string): Locator;

  waitUntilClosed(): Promise<void>;
}

export interface NotificationPO {
  isPresent(): Promise<boolean>;

  isVisible(): Promise<boolean>;

  getClientRect(): Promise<DOMRect>;

  getTitle(): Promise<string>;

  getSeverity(): Promise<'info' | 'warn' | 'error' | null>;

  getDuration(): Promise<'short' | 'medium' | 'long' | 'infinite' | null>;

  clickClose(): Promise<void>;

  getCssClasses(): Promise<string[]>;

  locator(selector?: string): Locator;
}

export interface MessageBoxPO {
  isPresent(): Promise<boolean>;

  isVisible(): Promise<boolean>;

  getClientRect(): Promise<DOMRect>;

  getTitle(): Promise<string>;

  getSeverity(): Promise<'info' | 'warn' | 'error' | null>;

  getModality(): Promise<'view' | 'application' | null>;

  getActions(): Promise<Record<string, string>>;

  clickActionButton(action: string): Promise<void>;

  isActionActive(actionKey: string): Promise<boolean>;

  getCssClasses(): Promise<string[]>;

  locator(selector: string): Locator;
}

export interface ViewPartActionPO {
  isPresent(): Promise<boolean>;

  click(): Promise<void>;
}
