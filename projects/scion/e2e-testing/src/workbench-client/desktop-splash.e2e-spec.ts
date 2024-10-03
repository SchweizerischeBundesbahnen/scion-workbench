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
import {expect} from '@playwright/test';
import {MessagingPagePO} from './page-object/messaging-page.po';
import {MAIN_AREA} from '../workbench.model';
import {DesktopPagePO} from './page-object/desktop-page.po';

test.describe('Workbench Desktop', () => {

  test('should show splash', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'messaging'},
      properties: {
        path: 'messaging',
        cssClass: 'messaging',
      },
    });

    // Register perspective capability that shows splash for desktop.
    const perspective = await microfrontendNavigator.registerCapability('app1', {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        layout: [
          {id: MAIN_AREA},
          {
            id: 'left',
            align: 'left',
            views: [{
              qualifier: {component: 'messaging'},
            }],
          },
        ],
        desktop: {
          path: 'test-pages/signal-ready-test-page',
          cssClass: 'testee',
          showSplash: true,
        },
      },
    });

    const desktopPage = new DesktopPagePO(appPO, {cssClass: 'testee'});
    const messagingPage = new MessagingPagePO(appPO, {cssClass: 'messaging'});

    // Switch perspective.
    await appPO.switchPerspective(perspective.metadata!.id);

    // Expect splash to display.
    await expect(desktopPage.outlet.splash).toBeVisible();

    // Publish message to dispose splash.
    await messagingPage.publishMessage('signal-ready/desktop');

    // Expect splash not to display.
    await expect(desktopPage.outlet.splash).not.toBeVisible();
  });

  test('should show splash when switching perspective', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'messaging'},
      properties: {
        path: 'messaging',
        cssClass: 'messaging-1',
      },
    });

    await microfrontendNavigator.registerCapability('app2', {
      type: 'view',
      qualifier: {component: 'messaging'},
      properties: {
        path: 'messaging',
        cssClass: 'messaging-2',
      },
    });

    // Register perspective capability 1 that shows splash for desktop.
    const perspective1 = await microfrontendNavigator.registerCapability('app1', {
      type: 'perspective',
      qualifier: {perspective: 'testee-1'},
      properties: {
        layout: [
          {id: MAIN_AREA},
          {
            id: 'left',
            align: 'left',
            views: [{
              qualifier: {component: 'messaging'},
            }],
          },
        ],
        desktop: {
          path: 'test-pages/signal-ready-test-page',
          cssClass: 'testee-1',
          showSplash: true,
        },
      },
    });

    // Register perspective capability 2 that shows splash for desktop.
    const perspective2 = await microfrontendNavigator.registerCapability('app2', {
      type: 'perspective',
      qualifier: {perspective: 'testee-1'},
      properties: {
        layout: [
          {id: MAIN_AREA},
          {
            id: 'left',
            align: 'left',
            views: [{
              qualifier: {component: 'messaging'},
            }],
          },
        ],
        desktop: {
          path: 'test-pages/signal-ready-test-page',
          cssClass: 'testee-2',
          showSplash: true,
        },
      },
    });

    const desktopPage1 = new DesktopPagePO(appPO, {cssClass: 'testee-1'});
    const desktopPage2 = new DesktopPagePO(appPO, {cssClass: 'testee-2'});
    const messagingPage1 = new MessagingPagePO(appPO, {cssClass: 'messaging-1'});
    const messagingPage2 = new MessagingPagePO(appPO, {cssClass: 'messaging-2'});

    // Switch to perspective 1.
    await appPO.switchPerspective(perspective1.metadata!.id);

    // Expect splash to display.
    await expect(desktopPage1.outlet.splash).toBeVisible();

    // Publish message to dispose splash.
    await messagingPage1.publishMessage('signal-ready/desktop');

    // Expect splash not to display.
    await expect(desktopPage1.outlet.splash).not.toBeVisible();

    // Switch to perspective 2.
    await appPO.switchPerspective(perspective2.metadata!.id);

    // Expect splash to display.
    await expect(desktopPage2.outlet.splash).toBeVisible();

    // Publish message to dispose splash.
    await messagingPage2.publishMessage('signal-ready/desktop');

    // Expect splash not to display.
    await expect(desktopPage2.outlet.splash).not.toBeVisible();
  });

  test('should not show splash if `showSplash` is `false`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register perspective capability that does not show splash for desktop.
    const perspective = await microfrontendNavigator.registerCapability('app1', {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        layout: [
          {id: MAIN_AREA},
        ],
        desktop: {
          path: 'test-pages/signal-ready-test-page',
          cssClass: 'testee',
          showSplash: false,
        },
      },
    });

    const desktopPage = new DesktopPagePO(appPO, {cssClass: 'testee'});

    // Switch perspective.
    await appPO.switchPerspective(perspective.metadata!.id);

    // Expect splash not to display.
    await expect(desktopPage.outlet.splash).not.toBeVisible();
  });

  test('should not show splash if `showSplash` is not set (default)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register perspective capability that does not show splash for desktop.
    const perspective = await microfrontendNavigator.registerCapability('app1', {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        layout: [
          {id: MAIN_AREA},
        ],
        desktop: {
          path: 'test-pages/signal-ready-test-page',
          cssClass: 'testee',
        },
      },
    });

    const desktopPage = new DesktopPagePO(appPO, {cssClass: 'testee'});

    // Switch perspective.
    await appPO.switchPerspective(perspective.metadata!.id);

    // Expect splash not to display.
    await expect(desktopPage.outlet.splash).not.toBeVisible();
  });
});
