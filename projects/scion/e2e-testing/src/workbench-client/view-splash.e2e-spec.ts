/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../fixtures';
import {RouterPagePO} from './page-object/router-page.po';
import {expect} from '@playwright/test';
import {ViewPagePO} from './page-object/view-page.po';
import {MessagingPagePO} from './page-object/messaging-page.po';
import {MAIN_AREA} from '../workbench.model';

test.describe('Workbench View', () => {

  test('should show splash', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view capability that shows splash.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/signal-ready-test-page',
        showSplash: true,
      },
      params: [
        {
          name: 'param',
          required: false,
        },
      ],
    });

    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.101',
    });

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});

    // Expect splash to display.
    await expect(testeeViewPage.outlet.splash).toBeVisible();

    // Publish message to dispose splash.
    const messagingPage = await microfrontendNavigator.openInNewTab(MessagingPagePO, 'app1');
    await messagingPage.publishMessage('signal-ready/view.101');
    await messagingPage.view.tab.close();

    // Expect splash not to display.
    await expect(testeeViewPage.outlet.splash).not.toBeVisible();

    await test.step('should not show splash if navigating to the same view again', async () => {
      // Navigate to the same view again.
      await routerPage.view.tab.click();
      await routerPage.navigate({component: 'testee'}, {
        target: 'view.101',
        params: {param: 'test'},
      });

      // Expect splash not to display.
      await testeeViewPage.view.tab.click();
      await expect(testeeViewPage.outlet.splash).not.toBeVisible();
    });
  });

  test('should not show splash if `showSplash` is `false`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view capability that does not show splash.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/signal-ready-test-page',
        showSplash: false,
      },
    });

    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.101',
    });

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});

    // Expect splash not to display.
    await expect(testeeViewPage.outlet.splash).not.toBeVisible();
  });

  test('should not show splash if `showSplash` is not set (default)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view capability that does not show splash.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/signal-ready-test-page',
      },
    });

    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.101',
    });

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});

    // Expect splash not to display.
    await expect(testeeViewPage.outlet.splash).not.toBeVisible();
  });

  test('should show splash when opening view in docked part', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view capability that shows splash.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'testee'},
      properties: {
        path: 'test-pages/signal-ready-test-page',
        showSplash: true,
        cssClass: 'testee',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'activity'},
      properties: {
        views: [
          {qualifier: {view: 'testee'}},
        ],
        extras: {
          icon: 'folder',
          label: 'Activity',
        },
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'main-area'},
    });

    await microfrontendNavigator.createPerspective('app1', {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: MAIN_AREA,
            qualifier: {part: 'main-area'},
          },
          {
            id: 'part.activity',
            qualifier: {part: 'activity'},
            position: 'left-top',
            ɵactivityId: 'activity.1',
          },
        ],
      },
    });

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    // Open docked part.
    await appPO.activityItem({activityId: 'activity.1'}).click();

    // Expect splash to display.
    await expect(testeeViewPage.outlet.splash).toBeVisible();

    // Close docked part.
    await appPO.activityItem({activityId: 'activity.1'}).click();

    // Expect docked part to be closed.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [{id: 'activity.1'}],
            activeActivityId: 'none',
          },
        },
      },
    });

    // Open docked part.
    await appPO.activityItem({activityId: 'activity.1'}).click();

    // Expect splash to display.
    await expect(testeeViewPage.outlet.splash).toBeVisible();

    // Publish message to dispose splash.
    const messagingPage = await microfrontendNavigator.openInNewTab(MessagingPagePO, 'app1');
    await messagingPage.publishMessage(`signal-ready/${await testeeViewPage.view.getViewId()}`);
    await messagingPage.view.tab.close();

    // Expect splash not to display.
    await expect(testeeViewPage.outlet.splash).not.toBeVisible();

    // Close docked part.
    await appPO.activityItem({activityId: 'activity.1'}).click();

    // Expect docked part to be closed.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [{id: 'activity.1'}],
            activeActivityId: 'none',
          },
        },
      },
    });

    // Open docked part.
    await appPO.activityItem({activityId: 'activity.1'}).click();

    // Expect splash not to display.
    await expect(testeeViewPage.outlet.splash).not.toBeVisible();
  });
});
