/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {$, $$, browser, Button, ElementFinder, Key, protractor} from 'protractor';
import {getCssClasses, isActiveElement, isCssClassPresent, runOutsideAngularSynchronization} from './helper/testing.util';
import {StartPagePO} from './start-page.po';
import {coerceArray, coerceBooleanProperty} from '@angular/cdk/coercion';
import {WebdriverExecutionContexts} from './helper/webdriver-execution-context';
import {Dictionary} from '@scion/toolkit/util';

export class AppPO {

  private _workbenchStartupQueryParams: URLSearchParams;

  /**
   * Navigates to the testing app.
   *
   * By passing a features object, you can control how to start the workbench and which app features to enable.
   */
  public async navigateTo(features?: Features): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();

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

    const browserNavigateFn = async () => {
      await browser.get(`/?${this._workbenchStartupQueryParams.toString()}#/${featureQueryParams.toString() ? `?${featureQueryParams.toString()}` : ''}`);
    };

    // We need to navigate outside of Protractor's Angular sync if displaying an alert dialog to pause the workbench startup.
    const confirmStartup = coerceBooleanProperty(this._workbenchStartupQueryParams.get(WorkenchStartupQueryParams.CONFIRM_STARTUP));
    if (confirmStartup) {
      await runOutsideAngularSynchronization(browserNavigateFn);
    }
    else {
      await browserNavigateFn();
      // Wait until the workbench completed startup.
      await this.waitUntilWorkbenchStarted();
    }
  }

  /**
   * Reloads the app with current features preserved.
   */
  public async reload(): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();

    // We cannot call `browser.refresh()` because workbench startup options are not part of the hash-based URL
    // and would therefore be lost on a reload.
    const reloadUrl = new URL(await browser.getCurrentUrl());
    this._workbenchStartupQueryParams.forEach((value, key) => reloadUrl.searchParams.append(key, value));

    const browserNavigateFn = async () => {
      await browser.get(reloadUrl.toString());
    };

    // We need to navigate outside of Protractor's Angular sync if displaying an alert dialog to pause the workbench startup.
    const confirmStartup = coerceBooleanProperty(this._workbenchStartupQueryParams.get(WorkenchStartupQueryParams.CONFIRM_STARTUP));
    if (confirmStartup) {
      await runOutsideAngularSynchronization(browserNavigateFn);
    }
    else {
      await browserNavigateFn();
      // Wait until the workbench completed startup.
      await this.waitUntilWorkbenchStarted();
    }
  }

  /**
   * Returns a handle representing the view tab of given `viewId`, or which has given CSS class set.
   * This call does not send a command to the browser. Use 'isPresent()' to test its presence.
   *
   * @param findBy - Specifies how to find the view tab. If both `viewId` and `cssClass` are not set, then the finder refers to the active view tab.
   *        <ul>
   *          <li>partId?: Identifies the part containing the view. If not set, uses the active part to find the view.</li>
   *          <li>viewId?: Identifies the view by its id</li>
   *          <li>cssClass?: Identifies the view by its CSS class</li>
   *        </ul>
   */
  public findViewTab(findBy: {partId?: string; viewId?: string; cssClass?: string}): ViewTabPO {
    const viewTabFinder = createViewTabFinder(findBy);

    return new class implements ViewTabPO {
      public async isPresent(): Promise<boolean> {
        await WebdriverExecutionContexts.switchToDefault();
        return viewTabFinder.isPresent();
      }

      public async getViewId(): Promise<string> {
        await WebdriverExecutionContexts.switchToDefault();
        return viewTabFinder.getAttribute('data-viewid');
      }

      public async activate(): Promise<void> {
        await WebdriverExecutionContexts.switchToDefault();
        await viewTabFinder.click();
      }

      public async close(): Promise<void> {
        await WebdriverExecutionContexts.switchToDefault();
        // hover the view-tab to make the close button visible
        await browser.actions().mouseMove(viewTabFinder).perform();
        await viewTabFinder.$('.e2e-close').click();
      }

      public async getTitle(): Promise<string> {
        await WebdriverExecutionContexts.switchToDefault();
        return viewTabFinder.$('.e2e-title').getText();
      }

      public async getHeading(): Promise<string> {
        await WebdriverExecutionContexts.switchToDefault();
        return viewTabFinder.$('.e2e-heading').getText();
      }

      public async isDirty(): Promise<boolean> {
        await WebdriverExecutionContexts.switchToDefault();
        const cssClasses = await getCssClasses(viewTabFinder);
        return cssClasses.includes('dirty');
      }

      public async isClosable(): Promise<boolean> {
        await WebdriverExecutionContexts.switchToDefault();
        const element = viewTabFinder.$('.e2e-close');
        return await element.isPresent() && await element.isDisplayed();
      }

      public async isActive(): Promise<boolean> {
        await WebdriverExecutionContexts.switchToDefault();
        const cssClasses = await getCssClasses(viewTabFinder);
        return cssClasses.includes('active');
      }

      public async getCssClasses(): Promise<string[]> {
        await WebdriverExecutionContexts.switchToDefault();
        return getCssClasses(viewTabFinder);
      }

      public async openContextMenu(): Promise<ViewTabContextMenuPO> {
        await WebdriverExecutionContexts.switchToDefault();
        await browser.actions().click(viewTabFinder, Button.RIGHT).perform();
        const viewTabContextMenuFinder = $('wb-view-menu');

        return new class implements ViewTabContextMenuPO {
          public async closeAllTabs(): Promise<void> {
            return viewTabContextMenuFinder.$('.e2e-close-all-tabs').click();
          }
        };
      }
    };
  }

  /**
   * Returns a handle representing the active view tab.
   * This call does not send a command to the browser. Use 'isPresent()' to test its presence.
   */
  public findActiveViewTab(partId?: string): ViewTabPO {
    return this.findViewTab({partId});
  }

  /**
   * Returns a handle representing the view tab of given `viewId`, or which has given CSS class set.
   * This call does not send a command to the browser. Use 'isPresent()' to test its presence.
   *
   * @param findBy - Specifies how to find the view. If both `viewId` and `cssClass` are not set, then the finder refers to the active view.
   *        <ul>
   *          <li>partId?: Identifies the part containing the view. If not set, uses the active part to find the view.</li>
   *          <li>viewId?: Identifies the view by its id</li>
   *          <li>cssClass?: Identifies the view by its CSS class</li>
   *        </ul>
   */
  public findView(findBy: {partId?: string; viewId?: string; cssClass?: string}): ViewPO {
    const viewFinder = createViewFinder(findBy);
    const viewTabPO = this.findViewTab(findBy);

    return new class implements ViewPO {

      public viewTabPO = viewTabPO;

      public async isPresent(): Promise<boolean> {
        await WebdriverExecutionContexts.switchToDefault();
        return viewFinder.isPresent();
      }

      public async getViewId(): Promise<string> {
        await WebdriverExecutionContexts.switchToDefault();
        return viewFinder.getAttribute('data-viewid');
      }

      public $(selector: string): ElementFinder {
        return viewFinder.$(selector);
      }
    };
  }

  /**
   * Returns a handle representing the active view.
   * This call does not send a command to the browser. Use 'isPresent()' to test its presence.
   */
  public findActiveView(partId?: string): ViewPO {
    return this.findView({partId});
  }

  public findActivePart(): PartPO {
    const partFinder = createViewPartFinder();

    return new class implements PartPO {

      public async isPresent(): Promise<boolean> {
        await WebdriverExecutionContexts.switchToDefault();
        return partFinder.isPresent();
      }

      public async getPartId(): Promise<string> {
        await WebdriverExecutionContexts.switchToDefault();
        return partFinder.getAttribute('data-partid');
      }

      public $(selector: string): ElementFinder {
        return partFinder.$(selector);
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
    await WebdriverExecutionContexts.switchToDefault();

    const viewpartFinder = createViewPartBarFinder(partId);
    if (!viewCssClass) {
      return viewpartFinder.$$('wb-view-tab').count();
    }
    return viewpartFinder.$$(`wb-view-tab.${viewCssClass}`).count();
  }

  /**
   * Returns the view tab view references in the order as displayed in the view tab bar.
   */
  public async getViewTabs(partId?: string): Promise<string[]> {
    await WebdriverExecutionContexts.switchToDefault();

    const viewTabsFinder = createViewPartBarFinder(partId).$$('wb-view-tab');
    return viewTabsFinder.reduce((acc: string[], viewTabFinder: ElementFinder) => {
      return viewTabFinder.getAttribute('data-viewid').then(viewId => acc.concat(viewId));
    }, []);
  }

  /**
   * Returns whether the default page is displayed in the active part.
   * The default page is displayed if there are no open tabs in the part.
   */
  public async isDefaultPageShowing(componentSelector: string): Promise<boolean> {
    await WebdriverExecutionContexts.switchToDefault();
    const activePart = createViewPartFinder();
    return activePart.$('sci-viewport.views-absent-outlet').$(componentSelector).isPresent();
  }

  /**
   * Returns whether the tabbar is displayed in the active part.
   * The tab bar is displayed when at least one view is open or part actions are displayed.
   */
  public async isViewTabBarShowing(): Promise<boolean> {
    await WebdriverExecutionContexts.switchToDefault();
    return createViewPartBarFinder().isPresent();
  }

  /**
   * Returns a handle representing the popup having given CSS class(es) set.
   * This call does not send a command to the browser. Use 'isPresent()' to test its presence.
   */
  public findPopup(findBy: {cssClass: string | string[]}): PopupPO {
    const popupOverlayFinder = $(`.wb-popup.${coerceArray(findBy.cssClass).join('.')}`);
    const popupComponentFinder = popupOverlayFinder.$('wb-popup');

    return new class implements PopupPO {

      public async isPresent(): Promise<boolean> {
        await WebdriverExecutionContexts.switchToDefault();
        return await popupOverlayFinder.isPresent() && await popupComponentFinder.isPresent();
      }

      public async isDisplayed(): Promise<boolean> {
        await WebdriverExecutionContexts.switchToDefault();
        if (!await this.isPresent()) {
          return false;
        }
        return await popupOverlayFinder.isDisplayed() && await popupComponentFinder.isDisplayed();
      }

      public async getClientRect(selector: 'cdk-overlay' | 'wb-popup' = 'wb-popup'): Promise<ClientRect> {
        await WebdriverExecutionContexts.switchToDefault();
        const finder = selector === 'cdk-overlay' ? popupOverlayFinder : popupComponentFinder;
        const {width, height} = await finder.getSize();
        const {x, y} = await finder.getLocation();
        return {
          top: y,
          left: x,
          right: x + width,
          bottom: y + height,
          width,
          height,
        };
      }

      public async getAlign(): Promise<'east' | 'west' | 'north' | 'south'> {
        await WebdriverExecutionContexts.switchToDefault();
        const cssClasses = await getCssClasses(popupOverlayFinder);
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
        await WebdriverExecutionContexts.switchToDefault();
        return isCssClassPresent(popupComponentFinder.$('sci-viewport.e2e-popup-viewport > sci-scrollbar.vertical'), 'overflow');
      }

      public async hasHorizontalOverflow(): Promise<boolean> {
        await WebdriverExecutionContexts.switchToDefault();
        return isCssClassPresent(popupComponentFinder.$('sci-viewport.e2e-popup-viewport > sci-scrollbar.horizontal'), 'overflow');
      }

      public $(selector: string): ElementFinder {
        return popupComponentFinder.$(selector);
      }
    };
  }

  /**
   * Returns the number of opened popups.
   */
  public async getPopupCount(): Promise<number> {
    await WebdriverExecutionContexts.switchToDefault();
    return $$('.wb-popup').count();
  }

  /**
   * Returns the number of opened message boxes.
   */
  public async getMessageBoxCount(): Promise<number> {
    await WebdriverExecutionContexts.switchToDefault();
    return $('wb-workbench').$$('wb-message-box').count();
  }

  /**
   * Returns the number of displayed notifications.
   */
  public async getNotificationCount(): Promise<number> {
    await WebdriverExecutionContexts.switchToDefault();
    return $('wb-workbench').$$('wb-notification').count();
  }

  /**
   * Returns a handle representing the notification having given CSS class(es) set.
   * This call does not send a command to the browser. Use 'isPresent()' to test its presence.
   */
  public findNotification(findBy: {cssClass: string | string[]}): NotificationPO {
    const notificationFinder = $('wb-workbench').$(`wb-notification.${coerceArray(findBy.cssClass).join('.')}`);

    return new class implements NotificationPO {
      public async isPresent(): Promise<boolean> {
        await WebdriverExecutionContexts.switchToDefault();
        return notificationFinder.isPresent();
      }

      public async isDisplayed(): Promise<boolean> {
        await WebdriverExecutionContexts.switchToDefault();
        if (!await this.isPresent()) {
          return false;
        }
        return notificationFinder.isDisplayed();
      }

      public async getClientRect(): Promise<ClientRect> {
        await WebdriverExecutionContexts.switchToDefault();
        const {width, height} = await notificationFinder.getSize();
        const {x, y} = await notificationFinder.getLocation();
        return {
          top: y,
          left: x,
          right: x + width,
          bottom: y + height,
          width,
          height,
        };
      }

      public async getTitle(): Promise<string> {
        await WebdriverExecutionContexts.switchToDefault();
        return notificationFinder.$('.e2e-title').getText();
      }

      public async getSeverity(): Promise<'info' | 'warn' | 'error'> {
        await WebdriverExecutionContexts.switchToDefault();
        const cssClasses = await getCssClasses(notificationFinder);
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
        await WebdriverExecutionContexts.switchToDefault();
        const cssClasses = await getCssClasses(notificationFinder);
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
        await WebdriverExecutionContexts.switchToDefault();
        await notificationFinder.$('.e2e-close').click();
        // wait until the animation completes
        await browser.wait(protractor.ExpectedConditions.stalenessOf(notificationFinder), 5000);
      }

      public getCssClasses(): Promise<string[]> {
        return getCssClasses(notificationFinder);
      }

      public $(selector: string): ElementFinder {
        return notificationFinder.$(selector);
      }
    };
  }

  /**
   * Returns a handle representing the message box having given CSS class(es) set.
   * This call does not send a command to the browser. Use 'isPresent()' to test its presence.
   */
  public findMessageBox(findBy: {cssClass: string | string[]}): MessageBoxPO {
    const msgboxFinder = $(`wb-message-box.${coerceArray(findBy.cssClass).join('.')}`);
    const msgboxComponentFinder = msgboxFinder.$('.e2e-body');

    return new class implements MessageBoxPO {
      public async isPresent(): Promise<boolean> {
        await WebdriverExecutionContexts.switchToDefault();
        return await msgboxFinder.isPresent() && await msgboxComponentFinder.isPresent();
      }

      public async isDisplayed(): Promise<boolean> {
        await WebdriverExecutionContexts.switchToDefault();
        if (!await this.isPresent()) {
          return false;
        }
        return await msgboxFinder.isDisplayed() && await msgboxComponentFinder.isDisplayed();
      }

      public async getClientRect(): Promise<ClientRect> {
        await WebdriverExecutionContexts.switchToDefault();
        const {width, height} = await msgboxFinder.getSize();
        const {x, y} = await msgboxFinder.getLocation();
        return {
          top: y,
          left: x,
          right: x + width,
          bottom: y + height,
          width,
          height,
        };
      }

      public async getTitle(): Promise<string> {
        await WebdriverExecutionContexts.switchToDefault();
        return msgboxFinder.$('.e2e-title').getText();
      }

      public async getSeverity(): Promise<'info' | 'warn' | 'error'> {
        await WebdriverExecutionContexts.switchToDefault();
        const cssClasses = await getCssClasses(msgboxFinder);
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
        await WebdriverExecutionContexts.switchToDefault();

        if (await $(`wb-message-box-stack.e2e-view-modal ${msgboxFinder.locator().value}`).isPresent()) {
          return 'view';
        }
        if (await $(`wb-message-box-stack.e2e-application-modal ${msgboxFinder.locator().value}`).isPresent()) {
          return 'application';
        }
        throw Error('Message box not found in the view-modal nor in the application-modal message box stack.');
      }

      public async getActions(): Promise<Dictionary<string>> {
        await WebdriverExecutionContexts.switchToDefault();
        const actions: Dictionary<string> = {};

        const actionsFinder = msgboxFinder.$$('button.e2e-action');
        const count = await actionsFinder.count();
        for (let i = 0; i < count; i++) {
          const action: ElementFinder = await actionsFinder.get(i);
          const cssClasses = await getCssClasses(action);
          const actionKey = cssClasses.find(candidate => candidate.startsWith('e2e-action-key-'));
          actions[actionKey.substr('e2e-action-key-'.length)] = await action.getText();
        }

        return actions;
      }

      public async clickActionButton(action: string): Promise<void> {
        await WebdriverExecutionContexts.switchToDefault();
        await msgboxFinder.$(`button.e2e-action.e2e-action-key-${action}`).click();
      }

      public async isActionActive(actionKey: string): Promise<boolean> {
        await WebdriverExecutionContexts.switchToDefault();
        return isActiveElement(msgboxFinder.$('.e2e-button-bar').$(`button.e2e-action.e2e-action-key-${actionKey}`));
      }

      public getCssClasses(): Promise<string[]> {
        return getCssClasses(msgboxFinder);
      }

      public $(selector: string): ElementFinder {
        return msgboxComponentFinder.$(selector);
      }
    };
  }

  /**
   * Opens a new view tab.
   */
  public async openNewViewTab(): Promise<StartPagePO> {
    await WebdriverExecutionContexts.switchToDefault();

    const newTabViewPartActionPO = this.findViewPartAction({buttonCssClass: 'e2e-open-new-tab'});
    if (!await newTabViewPartActionPO.isPresent()) {
      throw Error('Opening a new view tab requires the part action \'e2e-open-new-tab\' to be present, but it could not be found. Have you disabled the \'showNewTabAction\' feature?');
    }
    await newTabViewPartActionPO.click();
    const viewId = await this.findActiveView().getViewId();
    return new StartPagePO(viewId);
  }

  /**
   * Closes all views of all viewparts.
   */
  public async closeAllViewTabs(partId?: string): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();

    const viewPartBarFinder = createViewPartBarFinder(partId);
    return viewPartBarFinder.$('wb-view-tab').sendKeys(Key.chord(Key.CONTROL, Key.ALT, Key.SHIFT, 'k'));
  }

  /**
   * Returns a handle representing the viewpart action which has given CSS class set.
   * This call does not send a command to the browser. Use 'isPresent()' to test its presence.
   */
  public findViewPartAction(findBy: {partId?: string; buttonCssClass: string}): ViewPartActionPO {
    const actionFinder = createViewPartActionBarFinder(findBy.partId).$(`button.${findBy.buttonCssClass}`);

    return new class implements ViewPartActionPO {
      public async isPresent(): Promise<boolean> {
        await WebdriverExecutionContexts.switchToDefault();
        return actionFinder.isPresent();
      }

      public async click(): Promise<void> {
        await WebdriverExecutionContexts.switchToDefault();
        return actionFinder.click();
      }
    };
  }

  /**
   * Waits until the workbench finished startup.
   */
  public async waitUntilWorkbenchStarted(): Promise<void> {
    await WebdriverExecutionContexts.switchToDefault();
    await browser.wait(protractor.ExpectedConditions.presenceOf($('wb-workbench:not(.starting)')));
  }
}

/**
 * Allows finding the given part, or the active part if not specifying a part.
 */
function createViewPartFinder(partId?: string): ElementFinder {
  if (partId) {
    return $('wb-workbench').$(`wb-view-part[data-partid="${partId}"]`);
  }
  else {
    return $('wb-workbench').$('wb-view-part.active');
  }
}

/**
 * Allows finding the tabbar in the given part, or in the active part if not specifying a part.
 */
function createViewPartBarFinder(partId?: string): ElementFinder {
  return createViewPartFinder(partId).$('wb-view-part-bar');
}

/**
 * Allows finding the action bar in the given part, or in the active part if not specifying a part.
 */
function createViewPartActionBarFinder(partId?: string): ElementFinder {
  return createViewPartBarFinder(partId).$('wb-view-part-action-bar');
}

/**
 * Allows finding a view tab.
 *
 * @param findBy - Specifies how to find the view tab. If both `viewId` and `cssClass` are not set, then the finder refers to the active view tab.
 *        <ul>
 *          <li>partId?: Identifies the part containing the view. If not set, uses the active part to find the view.</li>
 *          <li>viewId?: Identifies the view by its id</li>
 *          <li>cssClass?: Identifies the view by its CSS class</li>
 *        </ul>
 */
function createViewTabFinder(findBy: {partId?: string; viewId?: string; cssClass?: string}): ElementFinder {
  const viewPartBarFinder = createViewPartBarFinder(findBy.partId);

  if (findBy.viewId !== undefined) {
    return viewPartBarFinder.$(`wb-view-tab[data-viewid="${findBy.viewId}"]`);
  }
  else if (findBy.cssClass !== undefined) {
    return viewPartBarFinder.$(`wb-view-tab.${findBy.cssClass}`);
  }
  else {
    return viewPartBarFinder.$(`wb-view-tab.active`);
  }
}

/**
 * Allows finding a view.
 *
 * @param findBy - Specifies how to find the view. If both `viewId` and `cssClass` are not set, then the finder refers to the active view.
 *        <ul>
 *          <li>partId?: Identifies the part containing the view. If not set, uses the active part to find the view.</li>
 *          <li>viewId?: Identifies the view by its id</li>
 *          <li>cssClass?: Identifies the view by its CSS class</li>
 *        </ul>
 */
function createViewFinder(findBy: {partId?: string; viewId?: string; cssClass?: string}): ElementFinder {
  const viewPartFinder = createViewPartFinder(findBy.partId);

  if (findBy.viewId !== undefined) {
    return viewPartFinder.$(`wb-view[data-viewid="${findBy.viewId}"]`);
  }
  else if (findBy.cssClass !== undefined) {
    return viewPartFinder.$(`wb-view.${findBy.cssClass}`);
  }
  else {
    return viewPartFinder.$(`wb-view`);
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

  $(selector: string): ElementFinder;
}

export interface ViewPO {
  readonly viewTabPO: ViewTabPO;

  getViewId(): Promise<string>;

  isPresent(): Promise<boolean>;

  $(selector: string): ElementFinder;
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

  isDisplayed(): Promise<boolean>;

  getClientRect(selector?: 'cdk-overlay' | 'wb-popup'): Promise<ClientRect>;

  hasVerticalOverflow(): Promise<boolean>;

  hasHorizontalOverflow(): Promise<boolean>;

  getAlign(): Promise<'east' | 'west' | 'north' | 'south'>;

  $(selector: string): ElementFinder;
}

export interface NotificationPO {
  isDisplayed(): Promise<boolean>;

  isPresent(): Promise<boolean>;

  getClientRect(): Promise<ClientRect>;

  getTitle(): Promise<string>;

  getSeverity(): Promise<'info' | 'warn' | 'error' | null>;

  getDuration(): Promise<'short' | 'medium' | 'long' | 'infinite' | null>;

  clickClose(): Promise<void>;

  getCssClasses(): Promise<string[]>;

  $(selector: string): ElementFinder;
}

export interface MessageBoxPO {
  isPresent(): Promise<boolean>;

  isDisplayed(): Promise<boolean>;

  getClientRect(): Promise<ClientRect>;

  getTitle(): Promise<string>;

  getSeverity(): Promise<'info' | 'warn' | 'error' | null>;

  getModality(): Promise<'view' | 'application' | null>;

  getActions(): Promise<Dictionary<string>>;

  clickActionButton(action: string): Promise<void>;

  isActionActive(actionKey: string): Promise<boolean>;

  getCssClasses(): Promise<string[]>;

  $(selector: string): ElementFinder;
}

export interface ViewPartActionPO {
  isPresent(): Promise<boolean>;

  click(): Promise<void>;
}
