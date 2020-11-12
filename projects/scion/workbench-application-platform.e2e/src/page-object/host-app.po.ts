/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { $, $$, browser, ElementFinder, protractor } from 'protractor';
import { getCssClasses, switchToMainContext } from '../util/testing.util';
import { Duration, Severity } from '@scion/workbench-application-platform.api';
import { ISize } from 'selenium-webdriver';

export class HostAppPO {

  /**
   * Returns a handle representing the view tab of given `viewId` or which has given CSS class set.
   * This call does not send a command to the browser. Use 'isPresent()' to test its presence.
   */
  public findViewTab(findBy: { partId?: string, viewId?: string, cssClass?: string }): ViewTabPO {
    const viewTabFinder = createViewTabFinder(findBy);

    return new class implements ViewTabPO {
      async isPresent(): Promise<boolean> {
        await switchToMainContext();
        return viewTabFinder.isPresent();
      }

      async click(): Promise<void> {
        await switchToMainContext();
        await viewTabFinder.click();
      }

      async close(): Promise<void> {
        await switchToMainContext();

        // hover the view-tab to make the close button visible
        await browser.actions().mouseMove(viewTabFinder).perform();
        await viewTabFinder.$('.e2e-close').click();
      }

      async getTitle(): Promise<string> {
        await switchToMainContext();
        return viewTabFinder.$('.e2e-title').getText();
      }

      async getHeading(): Promise<string> {
        await switchToMainContext();
        return viewTabFinder.$('.e2e-heading').getText();
      }

      async isDirty(): Promise<boolean> {
        await switchToMainContext();
        const cssClasses = await getCssClasses(viewTabFinder);
        return cssClasses.includes('e2e-dirty');
      }

      async isClosable(): Promise<boolean> {
        await switchToMainContext();
        const element = viewTabFinder.$('.e2e-close');
        return await element.isPresent() && await element.isDisplayed();
      }
    };
  }

  /**
   * Returns the number of view tabs.
   */
  public async getViewTabCount(partId?: string): Promise<number> {
    await switchToMainContext();
    return createViewPartBarFinder(partId).$$('wb-view-tab').count();
  }

  /**
   * Returns the number of notifications.
   */
  public async getNotificationCount(): Promise<number> {
    await switchToMainContext();
    return $$('wb-notification').count();
  }

  /**
   * Finds the notification which has given CSS class set.
   * If not found, the promise resolves to `null`.
   */
  public async findNotification(cssClass: string): Promise<NotificationPO | null> {
    await switchToMainContext();
    const notificationFinder = $(`wb-notification.${cssClass}`);

    const exists = await notificationFinder.isPresent();
    if (!exists) {
      return null;
    }

    return new class implements NotificationPO {
      async getTitle(): Promise<string> {
        await switchToMainContext();
        return notificationFinder.$('.e2e-title').getText();
      }

      async getText(): Promise<string> {
        await switchToMainContext();
        return notificationFinder.$('.e2e-text').getText();
      }

      async getSeverity(): Promise<Severity> {
        await switchToMainContext();

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

      async getDuration(): Promise<Duration> {
        await switchToMainContext();

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

      async close(): Promise<void> {
        await switchToMainContext();
        await notificationFinder.$('.e2e-close').click();
        // wait until the animation completes
        await browser.wait(protractor.ExpectedConditions.stalenessOf(notificationFinder), 5000);
      }
    };
  }

  /**
   * Finds the message box which has given CSS class set.
   * If not found, the promise resolves to `null`.
   */
  public async findMessageBox(cssClass: string): Promise<MessageBoxPO | null> {
    await switchToMainContext();
    const msgboxFinder = $(`wb-message-box.${cssClass}`);

    const exists = await msgboxFinder.isPresent();
    if (!exists) {
      return null;
    }

    return new class implements MessageBoxPO {
      async getTitle(): Promise<string> {
        await switchToMainContext();
        return msgboxFinder.$('.e2e-title').getText();
      }

      async getText(): Promise<string> {
        await switchToMainContext();
        return msgboxFinder.$('.e2e-text').getText();
      }

      async getSeverity(): Promise<Severity | null> {
        await switchToMainContext();
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

      async getModality(): Promise<'application' | 'view' | null> {
        await switchToMainContext();
        const cssClasses = await getCssClasses(msgboxFinder);
        if (cssClasses.includes('e2e-modality-application')) {
          return 'application';
        }
        else if (cssClasses.includes('e2e-severity-view')) {
          return 'view';
        }
        return null;
      }

      async isContentSelectable(): Promise<boolean> {
        await switchToMainContext();

        const text = await msgboxFinder.$('.e2e-text').getText();

        await browser.actions().mouseMove(msgboxFinder.$('.e2e-text')).perform();
        await browser.actions().doubleClick().perform();
        const selection: string = await browser.executeScript('return window.getSelection().toString();') as string;

        return selection && selection.length && text.includes(selection);
      }

      async getActions(): Promise<{ [key: string]: string }> {
        await switchToMainContext();
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

      async close(action: string): Promise<void> {
        await switchToMainContext();
        await msgboxFinder.$(`button.e2e-action.e2e-action-key-${action}`).click();
        // wait until the animation completes
        await browser.wait(protractor.ExpectedConditions.stalenessOf(msgboxFinder), 5000);
      }

      async isDisplayed(): Promise<boolean> {
        await switchToMainContext();
        return msgboxFinder.isDisplayed();
      }
    };
  }

  /**
   * Clicks the activity item which has given CSS class set.
   *
   * The promise returned is rejected if not found.
   */
  public async clickActivityItem(cssClass: string): Promise<void> {
    await switchToMainContext();
    const activityItemPO = await this.findActivityItem(cssClass);
    if (activityItemPO === null) {
      return Promise.reject(`Activity item not found [cssClass=${cssClass}]`);
    }
    await activityItemPO.click();
  }

  /**
   * Finds the activity item which has given CSS class set.
   * If not found, the promise resolves to `null`.
   */
  public async findActivityItem(cssClass: string): Promise<ActivityItemPO | null> {
    await switchToMainContext();
    const activityItemFinder = $(`wb-activity-part .e2e-activity-bar a.e2e-activity-item.${cssClass}`);
    const activityPanelFinder = $(`wb-activity-part .e2e-activity-panel.${cssClass}`);

    const exists = await activityItemFinder.isPresent();
    if (!exists) {
      return null;
    }

    return new class implements ActivityItemPO {
      async getTitle(): Promise<string> {
        await switchToMainContext();
        return await activityItemFinder.getAttribute('title');
      }

      async getText(): Promise<string> {
        await switchToMainContext();
        return await activityItemFinder.getText();
      }

      async getCssClasses(): Promise<string[]> {
        await switchToMainContext();
        return await getCssClasses(activityItemFinder);
      }

      async click(): Promise<void> {
        await switchToMainContext();

        const cssClasses = await this.getCssClasses();
        const closePanel = cssClasses.includes('e2e-active');
        await activityItemFinder.click();
        // wait until the animation completes
        closePanel && await browser.wait(protractor.ExpectedConditions.stalenessOf(activityPanelFinder), 5000);
      }
    };
  }

  /**
   * Finds the activity panel which has given CSS class set.
   * If not found, the promise resolves to `null`.
   */
  public async findActivityPanel(cssClass: string): Promise<ActivityPanelPO | null> {
    await switchToMainContext();
    const activityPanelFinder = $(`wb-activity-part .e2e-activity-panel.${cssClass}`);

    const exists = await activityPanelFinder.isPresent();
    if (!exists) {
      return null;
    }

    return new class implements ActivityPanelPO {
      async getTitle(): Promise<string> {
        await switchToMainContext();
        return activityPanelFinder.$('.e2e-activity-title').getText();
      }

      async getSize(): Promise<ISize> {
        await switchToMainContext();
        return activityPanelFinder.getSize();
      }

      async getCssClasses(): Promise<string[]> {
        await switchToMainContext();
        return getCssClasses(activityPanelFinder);
      }
    };
  }

  /**
   * Enlarges or shrinks the activity panel.
   */
  public async moveActivitySash(delta: number): Promise<void> {
    await switchToMainContext();
    await browser.actions().mouseMove($('div.e2e-activity-sash'), {x: 0, y: 0}).perform();
    await browser.actions()
      .mouseDown()
      .mouseMove({x: delta, y: 0})
      .mouseUp()
      .perform();
  }

  /**
   * Finds the activity action which has given CSS class set.
   */
  public async findActivityAction(cssClass: string): Promise<ActivityActionPO> {
    const actionFinder = $(`wb-activity-part .e2e-activity-actions .${cssClass}`);

    return new class implements ActivityActionPO {
      async isPresent(): Promise<boolean> {
        await switchToMainContext();
        return actionFinder.isPresent();
      }

      async click(): Promise<void> {
        await switchToMainContext();
        await actionFinder.click();
      }
    };
  }

  public async hasBrowserError(error: string): Promise<boolean> {
    await switchToMainContext();
    const logs = await browser.manage().logs().get('browser');
    return logs.some(log => log.message.includes(error));
  }

  public async getCurrentBrowserUrl(): Promise<string> {
    await switchToMainContext();
    return browser.getCurrentUrl();
  }

  public async navigateBack(): Promise<void> {
    await switchToMainContext();
    await browser.navigate().back();
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
}

export interface NotificationPO {
  getTitle(): Promise<string>;

  getText(): Promise<string>;

  getSeverity(): Promise<Severity | null>;

  getDuration(): Promise<Duration | null>;

  close(): Promise<void>;
}

export interface MessageBoxPO {
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
  getTitle(): Promise<string>;

  getText(): Promise<string>;

  getCssClasses(): Promise<string[]>;

  click(): Promise<void>;
}

/**
 * Represents an activity panel in the activity part.
 */
export interface ActivityPanelPO {
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

function createViewPartBarFinder(partId?: string): ElementFinder {
  if (partId) {
    return $(`wb-view-part[data-partid="${partId}"]`).$('wb-view-part-bar');
  }
  return $('wb-view-part.active').$('wb-view-part-bar');
}

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
