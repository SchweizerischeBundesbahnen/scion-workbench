/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../fixtures';
import {expect} from '@playwright/test';
import {MessagingPagePO} from './page-object/messaging-page.po';
import {MAIN_AREA} from '../workbench.model';
import {PartPagePO} from './page-object/part-page.po';
import {WorkbenchPartCapability, WorkbenchPerspectiveCapability} from './page-object/register-workbench-capability-page.po';
import {Manifest} from '@scion/microfrontend-platform';

test.describe('Workbench Part', () => {

  test('should show splash', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register part capability that shows splash.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'testee'},
      properties: {
        path: 'test-pages/signal-ready-test-page',
        showSplash: true,
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
            id: 'part.testee',
            qualifier: {part: 'testee'},
            position: {
              align: 'left',
            },
          },
        ],
      },
    });

    const testeePartPage = new PartPagePO(appPO, {partId: 'part.testee'});

    // Expect splash to display.
    await expect(testeePartPage.outlet.splash).toBeVisible();

    // Publish message to dispose splash.
    const messagingPage = await microfrontendNavigator.openInNewTab(MessagingPagePO, 'app1');
    await messagingPage.publishMessage('signal-ready/part.testee');
    await messagingPage.view.tab.close();

    // Expect splash not to display.
    await expect(testeePartPage.outlet.splash).not.toBeVisible();
  });

  test('should not show splash if `showSplash` is `false`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register part capability that does not show splash.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'testee'},
      properties: {
        path: 'test-pages/signal-ready-test-page',
        showSplash: false,
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
            id: 'part.testee',
            qualifier: {part: 'testee'},
            position: {
              align: 'left',
            },
          },
        ],
      },
    });

    const testeePartPage = new PartPagePO(appPO, {partId: 'part.testee'});

    // Expect splash not to display.
    await expect(testeePartPage.outlet.splash).not.toBeVisible();
  });

  test('should not show splash if `showSplash` is not set (default)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register part capability that does not show splash.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'testee'},
      properties: {
        path: 'test-pages/signal-ready-test-page',
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
            id: 'part.testee',
            qualifier: {part: 'testee'},
            position: {
              align: 'left',
            },
          },
        ],
      },
    });

    const testeePartPage = new PartPagePO(appPO, {partId: 'part.testee'});

    // Expect splash not to display.
    await expect(testeePartPage.outlet.splash).not.toBeVisible();
  });

  test('should show splash when opening docked part', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register part capability that shows splash.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'testee'},
      properties: {
        path: 'test-pages/signal-ready-test-page',
        showSplash: true,
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
            id: 'part.testee',
            qualifier: {part: 'testee'},
            position: 'left-top',
            ɵactivityId: 'activity.1',
          },
        ],
      },
    });

    const testeePartPage = new PartPagePO(appPO, {partId: 'part.testee'});

    // Open docked part.
    await appPO.activityItem({activityId: 'activity.1'}).click();

    // Expect splash to display.
    await expect(testeePartPage.outlet.splash).toBeVisible();

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
    await expect(testeePartPage.outlet.splash).toBeVisible();

    // Publish message to dispose splash.
    const messagingPage = await microfrontendNavigator.openInNewTab(MessagingPagePO, 'app1');
    await messagingPage.publishMessage('signal-ready/part.testee');
    await messagingPage.view.tab.close();

    // Expect splash not to display.
    await expect(testeePartPage.outlet.splash).not.toBeVisible();

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
    await expect(testeePartPage.outlet.splash).not.toBeVisible();
  });

  /**
   * This test verifies that the splash does not to display when navigating a part with a stable id (e.g., main-area) to the same microfrontend, which occurs when resetting the perspective.
   *
   * This test uses a perspective defined in the manifest to be available after page reload.
   */
  test('should dispose splash when resetting perspective', async ({appPO, microfrontendNavigator, page}) => {
    const perspectiveCapability: WorkbenchPerspectiveCapability = {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: MAIN_AREA,
            qualifier: {part: 'testee-1'},
            cssClass: 'testee-1',
          },
          {
            id: 'testee-2',
            qualifier: {part: 'testee-2'},
            position: {
              align: 'left',
            },
            cssClass: 'testee-2',
          },
        ],
      },
    };

    const testee1Capability: WorkbenchPartCapability = {
      type: 'part',
      qualifier: {part: 'testee-1'},
      properties: {
        path: 'test-part',
        showSplash: true,
      },
    };

    const testee2Capability: WorkbenchPartCapability = {
      type: 'part',
      qualifier: {part: 'testee-2'},
      properties: {
        path: 'test-part',
        showSplash: true,
      },
    };

    // Provide manifest.
    const manifest: Manifest = {
      name: 'Workbench Client Testing App 1',
      baseUrl: '#',
      capabilities: [
        perspectiveCapability,
        testee1Capability,
        testee2Capability,
        {
          type: 'activator',
          private: false,
          properties: {
            path: 'activator',
            readinessTopics: 'activator-ready',
          },
        },
      ],
    };

    await page.route('**/manifest-app1.json', async route => route.fulfill({
      json: manifest,
    }));

    // Open application.
    await appPO.navigateTo({microfrontendSupport: true});

    // Switch perspective.
    const messagingPage = await microfrontendNavigator.openInNewTab(MessagingPagePO, 'app1');
    await messagingPage.publishIntent({type: 'perspective', qualifier: {perspective: 'testee'}});
    await messagingPage.view.tab.close();

    const testee1 = new PartPagePO(appPO, {cssClass: 'testee-1'}); // Part with stable id (part.main-area); configured with showSplash=true.
    const testee2 = new PartPagePO(appPO, {cssClass: 'testee-2'}); // Part with random id (part.xxx); configured with showSplash=true.

    // Expect splash to be disposed.
    await expect(testee1.outlet.splash).not.toBeVisible();
    await expect(testee2.outlet.splash).not.toBeVisible();

    // Reload application to generate initial layout with different part ids.
    await appPO.reload();

    // Reset perspective.
    await appPO.workbench.resetPerspective();

    // Expect splash not to display.
    await expect(testee1.outlet.splash).not.toBeVisible();
    await expect(testee2.outlet.splash).not.toBeVisible();
  });
});
