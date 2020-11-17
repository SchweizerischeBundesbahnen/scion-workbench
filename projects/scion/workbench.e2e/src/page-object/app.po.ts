/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { $, $$, browser, ElementFinder, Key, protractor } from 'protractor';
import { getCssClasses } from '../util/testing.util';
import { ISize } from 'selenium-webdriver';
import { WelcomePagePO } from './welcome-page.po';

declare type Duration = 'short' | 'medium' | 'long' | 'infinite';
declare type Severity = 'info' | 'warn' | 'error';

export class AppPO {

  /**
   * Returns a handle representing the view tab of given `viewId`, or which has given CSS class set.
   * This call does not send a command to the browser. Use 'isPresent()' to test its presence.
   *
   * @param findBy - Specifies how to find the view tab. Either `viewId` or `cssClass` must be set.
   *        <ul>
   *          <li>partId?: Identifies the part containing the view. If not set, uses the active part to find the view.</li>
   *          <li>viewId?: Identifies the view by its id/li>
   *          <li>cssClass?: Identifies the view by its CSS class</li>
   *        </ul>
   */
  public findViewTab(findBy: { partId?: string, viewId?: string, cssClass?: string }): ViewTabPO {
    const viewTabFinder = createViewTabFinder(findBy);

    return new class implements ViewTabPO {
      public async isPresent(): Promise<boolean> {
        return viewTabFinder.isPresent();
      }

      public async click(): Promise<void> {
        await viewTabFinder.click();
      }

      public async close(): Promise<void> {
        // hover the view-tab to make the close button visible
        await browser.actions().mouseMove(viewTabFinder).perform();
        await viewTabFinder.$('.e2e-close').click();
      }

      public async getTitle(): Promise<string> {
        return viewTabFinder.$('.e2e-title').getText();
      }

      public async getHeading(): Promise<string> {
        return viewTabFinder.$('.e2e-heading').getText();
      }

      public async isDirty(): Promise<boolean> {
        const cssClasses = await getCssClasses(viewTabFinder);
        return cssClasses.includes('e2e-dirty');
      }

      public async isClosable(): Promise<boolean> {
        const element = viewTabFinder.$('.e2e-close');
        return await element.isPresent() && await element.isDisplayed();
      }

      public async isActive(): Promise<boolean> {
        const cssClasses = await getCssClasses(viewTabFinder);
        return cssClasses.includes('e2e-active');
      }
    };
  }

  /**
   * Returns the number of view tabs in the specified viewpart, or in the active viewpart if not specifying a part.
   *
   * Optionally, provide a CSS class to only count view tabs of given view.
   */
  public async getViewTabCount(findBy?: { partId?: string, viewCssClass?: string }): Promise<number> {
    const {partId, viewCssClass} = findBy || {};

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
    const viewTabsFinder = createViewPartBarFinder(partId).$$('wb-view-tab');
    return viewTabsFinder.reduce((acc: string[], viewTabFinder: ElementFinder) => {
      return viewTabFinder.getAttribute('data-viewid').then(viewId => acc.concat(viewId));
    }, []);
  }

  /**
   * Returns the number of notifications.
   */
  public async getNotificationCount(): Promise<number> {
    return $$('wb-notification').count();
  }

  /**
   * Returns `true` if the activity bar is showing, or `false` otherwise.
   */
  public async isActivityBarShowing(): Promise<boolean> {
    return $('wb-workbench').$('wb-activity-part').isPresent();
  }

  /**
   * Returns `true` if the entry point page is showing, or `false` otherwise.
   */
  public async isDefaultPageShowing(componentSelector: string): Promise<boolean> {
    return $('wb-workbench').$('main').$(componentSelector).isPresent();
  }

  /**
   * Returns `true` if the view tab bar is showing, or `false` otherwise.
   */
  public async isViewTabBarShowing(): Promise<boolean> {
    return $('wb-workbench').$('wb-view-part-bar').isPresent();
  }

  /**
   * Returns a handle representing the notification which has given CSS class set.
   * This call does not send a command to the browser. Use 'isPresent()' to test its presence.
   */
  public findNotification(cssClass: string): NotificationPO {
    const notificationFinder = $(`wb-notification.${cssClass}`);

    return new class implements NotificationPO {
      public async isPresent(): Promise<boolean> {
        return notificationFinder.isPresent();
      }

      public async getTitle(): Promise<string> {
        return notificationFinder.$('.e2e-title').getText();
      }

      public async getText(): Promise<string> {
        return notificationFinder.$('.e2e-text').getText();
      }

      public async getSeverity(): Promise<Severity> {
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

      public async getDuration(): Promise<Duration> {
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

      public async close(): Promise<void> {
        await notificationFinder.$('.e2e-close').click();
        // wait until the animation completes
        await browser.wait(protractor.ExpectedConditions.stalenessOf(notificationFinder), 5000);
      }
    };
  }

  /**
   * Returns a handle representing the message box which has given CSS class set.
   * This call does not send a command to the browser. Use 'isPresent()' to test its presence.
   */
  public findMessageBox(cssClass: string): MessageBoxPO {
    const msgboxFinder = $(`wb-message-box.${cssClass}`);

    return new class implements MessageBoxPO {
      public async isPresent(): Promise<boolean> {
        return msgboxFinder.isPresent();
      }

      public async getTitle(): Promise<string> {
        return msgboxFinder.$('.e2e-title').getText();
      }

      public async getText(): Promise<string> {
        return msgboxFinder.$('.e2e-text').getText();
      }

      public async getSeverity(): Promise<Severity | null> {
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
        return null;
      }

      public async getModality(): Promise<'application' | 'view' | null> {
        const cssClasses = await getCssClasses(msgboxFinder);
        if (cssClasses.includes('e2e-modality-application')) {
          return 'application';
        }
        else if (cssClasses.includes('e2e-severity-view')) {
          return 'view';
        }
        return null;
      }

      public async isContentSelectable(): Promise<boolean> {
        const text = await msgboxFinder.$('.e2e-text').getText();

        await browser.actions().mouseMove(msgboxFinder.$('.e2e-text')).perform();
        await browser.actions().doubleClick().perform();
        const selection: string = await browser.executeScript('return window.getSelection().toString();') as string;

        return selection && selection.length && text.includes(selection);
      }

      public async getActions(): Promise<{ [key: string]: string }> {
        const actions: { [key: string]: string } = {};

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

      public async close(action: string): Promise<void> {
        await msgboxFinder.$(`button.e2e-action.e2e-action-key-${action}`).click();
        // wait until the animation completes
        await browser.wait(protractor.ExpectedConditions.stalenessOf(msgboxFinder), 5000);
      }

      public async isDisplayed(): Promise<boolean> {
        return msgboxFinder.isDisplayed();
      }
    };
  }

  /**
   * Opens a new view tab.
   */
  public async openNewViewTab(): Promise<WelcomePagePO> {
    const viewPartActionPO = this.findViewPartAction('e2e-open-new-tab');
    await viewPartActionPO.click();
    return new WelcomePagePO();
  }

  /**
   * Closes all views of all viewparts.
   */
  public async closeAllViewTabs(partId?: string): Promise<void> {
    const viewPartBarFinder = createViewPartBarFinder(partId);
    return viewPartBarFinder.$('wb-view-tab').sendKeys(Key.chord(Key.CONTROL, Key.ALT, Key.SHIFT, 'k'));
  }

  /**
   * Returns a handle representing the viewpart action which has given CSS class set.
   * This call does not send a command to the browser. Use 'isPresent()' to test its presence.
   */
  public findViewPartAction(buttonCssClass: string): ViewPartActionPO {
    const actionFinder = $(`wb-workbench wb-view-part wb-view-part-action-bar button.${buttonCssClass}`);

    return new class implements ViewPartActionPO {
      public async isPresent(): Promise<boolean> {
        return actionFinder.isPresent();
      }

      public async click(): Promise<void> {
        return actionFinder.click();
      }
    };
  }

  /**
   * Clicks the activity item which has given CSS class set.
   *
   * The promise returned is rejected if not found.
   */
  public async clickActivityItem(cssClass: string): Promise<void> {
    const activityItemPO = this.findActivityItem(cssClass);
    if (!await activityItemPO.isPresent()) {
      return Promise.reject(`Activity item not found [cssClass=${cssClass}]`);
    }
    await activityItemPO.click();
  }

  /**
   * Returns a handle representing the activity item which has given CSS class set.
   * This call does not send a command to the browser. Use 'isPresent()' to test its presence.
   */
  public findActivityItem(cssClass: string): ActivityItemPO {
    const activityItemFinder = $(`wb-activity-part .e2e-activity-bar a.e2e-activity-item.${cssClass}`);
    const activityPanelFinder = $(`wb-activity-part .e2e-activity-panel.${cssClass}`);

    return new class implements ActivityItemPO {
      public async isPresent(): Promise<boolean> {
        return activityItemFinder.isPresent();
      }

      public async getTitle(): Promise<string> {
        return await activityItemFinder.getAttribute('title');
      }

      public async getText(): Promise<string> {
        return await activityItemFinder.getText();
      }

      public async getCssClasses(): Promise<string[]> {
        return await getCssClasses(activityItemFinder);
      }

      public async click(): Promise<void> {
        const cssClasses = await this.getCssClasses();
        const closePanel = cssClasses.includes('e2e-active');
        await activityItemFinder.click();
        // wait until the animation completes
        closePanel && await browser.wait(protractor.ExpectedConditions.stalenessOf(activityPanelFinder), 5000);
      }
    };
  }

  /**
   * Returns a handle representing the activity panel which has given CSS class set.
   * This call does not send a command to the browser. Use 'isPresent()' to test its presence.
   */
  public findActivityPanel(cssClass: string): ActivityPanelPO {
    const activityPanelFinder = $(`wb-activity-part .e2e-activity-panel.${cssClass}`);

    return new class implements ActivityPanelPO {
      public async isPresent(): Promise<boolean> {
        return activityPanelFinder.isPresent();
      }

      public async getTitle(): Promise<string> {
        return activityPanelFinder.$('.e2e-activity-title').getText();
      }

      public async getSize(): Promise<ISize> {
        return activityPanelFinder.getSize();
      }

      public async getCssClasses(): Promise<string[]> {
        return getCssClasses(activityPanelFinder);
      }
    };
  }

  /**
   * Enlarges or shrinks the activity panel.
   */
  public async moveActivitySash(delta: number): Promise<void> {
    await browser.actions().mouseMove($('div.e2e-activity-sash'), {x: 0, y: 0}).perform();
    await browser.actions()
      .mouseDown()
      .mouseMove({x: delta, y: 0})
      .mouseUp()
      .perform();
  }

  /**
   * Returns a handle representing the activity action which has given CSS class set.
   * This call does not send a command to the browser. Use 'isPresent()' to test its presence.
   */
  public findActivityAction(cssClass: string): ActivityActionPO {
    const actionFinder = $(`wb-activity-part .e2e-activity-actions .${cssClass}`);

    return new class implements ActivityActionPO {
      public async isPresent(): Promise<boolean> {
        return actionFinder.isPresent();
      }

      public async click(): Promise<void> {
        await actionFinder.click();
      }
    };
  }
}

export interface ViewTabPO {
  isPresent(): Promise<boolean>;

  getTitle(): Promise<string>;

  getHeading(): Promise<string>;

  isDirty(): Promise<boolean>;

  isClosable(): Promise<boolean>;

  close(): Promise<void>;

  click(): Promise<void>;

  isActive(): Promise<boolean>;
}

export interface NotificationPO {
  isPresent(): Promise<boolean>;

  getTitle(): Promise<string>;

  getText(): Promise<string>;

  getSeverity(): Promise<Severity | null>;

  getDuration(): Promise<Duration | null>;

  close(): Promise<void>;
}

export interface MessageBoxPO {
  isPresent(): Promise<boolean>;

  getTitle(): Promise<string>;

  getText(): Promise<string>;

  getSeverity(): Promise<Severity | null>;

  getModality(): Promise<'view' | 'application' | null>;

  isContentSelectable(): Promise<boolean>;

  getActions(): Promise<{ [key: string]: string }>;

  close(action: string): Promise<void>;

  isDisplayed(): Promise<boolean>;
}

/**
 * Represents an activity item in the activity bar.
 */
export interface ActivityItemPO {
  isPresent(): Promise<boolean>;

  getTitle(): Promise<string>;

  getText(): Promise<string>;

  getCssClasses(): Promise<string[]>;

  click(): Promise<void>;
}

/**
 * Represents an activity panel in the activity part.
 */
export interface ActivityPanelPO {
  isPresent(): Promise<boolean>;

  getTitle(): Promise<string>;

  getSize(): Promise<ISize>;

  getCssClasses(): Promise<string[]>;
}

/*
* Represents a clickable activity action
*/
export interface ActivityActionPO {
  isPresent(): Promise<boolean>;

  click(): Promise<void>;
}

export interface ViewPartActionPO {
  isPresent(): Promise<boolean>;

  click(): Promise<void>;
}

/**
 * Allows finding the tabbar in the given part, or in the active part if not specifying a part.
 */
function createViewPartBarFinder(partId?: string): ElementFinder {
  if (partId) {
    return $(`wb-view-part[data-partid="${partId}"]`).$('wb-view-part-bar');
  }
  return $('wb-view-part.active').$('wb-view-part-bar');
}

/**
 * Allows finding a view tab.
 *
 * @param findBy - Specifies how to find the view tab. Either `viewId` or `cssClass` must be set.
 *        <ul>
 *          <li>partId?: Identifies the part containing the view. If not set, uses the active part to find the view.</li>
 *          <li>viewId?: Identifies the view by its id/li>
 *          <li>cssClass?: Identifies the view by its CSS class</li>
 *        </ul>
 */
function createViewTabFinder(findBy: { partId?: string, viewId?: string, cssClass?: string }): ElementFinder {
  const viewPartBarFinder = createViewPartBarFinder(findBy.partId);

  if (findBy.viewId !== undefined) {
    return viewPartBarFinder.$(`wb-view-tab[data-viewid="${findBy.viewId}"]`);
  }
  else if (findBy.cssClass !== undefined) {
    return viewPartBarFinder.$(`wb-view-tab.${findBy.cssClass}`);
  }
  throw Error('[IllegalArgumentError] \'viewId\' or \'cssClass\' required to find a view tab');
}
