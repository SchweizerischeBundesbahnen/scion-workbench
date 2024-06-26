/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../fixtures';
import {MAIN_AREA} from '../workbench.model';
import {expectDesktop} from '../matcher/desktop-matcher';
import {DesktopPagePO} from './page-object/desktop-page.po';
import {expect} from '@playwright/test';
import {DesktopInfo} from '../desktop.po';

test.describe('Desktop', () => {

  test('should navigate desktop when navigating from path-based route to path-based route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open desktop page as path-based route.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .navigateDesktop(['test-desktop'], {cssClass: 'testee'}),
    );

    // Navigate to path-based route.
    await workbenchNavigator.modifyLayout(layout => layout
      .navigateDesktop(['test-desktop'], {
        cssClass: 'testee',
        state: {navigated: 'true'},
      }),
    );

    const desktopPage = new DesktopPagePO(appPO, {cssClass: 'testee'});

    // Expect desktop to display path-based route.
    await expectDesktop(desktopPage).toBeVisible();
    await expect(appPO.views()).toHaveCount(0);
    await expect.poll(() => desktopPage.desktop.getInfo()).toMatchObject({
        routeData: {
          path: 'test-desktop',
          navigationHint: '',
        },
        state: {navigated: 'true'},
      } satisfies Partial<DesktopInfo>,
    );
  });

  test('should navigate desktop when navigating from empty-path route to empty-path route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open desktop page as empty-path route.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .navigateDesktop([''], {hint: 'test-desktop', cssClass: 'testee'}),
    );

    // Navigate to empty-path route.
    await workbenchNavigator.modifyLayout(layout => layout
      .navigateDesktop([''], {
        hint: 'test-desktop',
        cssClass: 'testee',
        state: {navigated: 'true'},
      }),
    );

    const desktopPage = new DesktopPagePO(appPO, {cssClass: 'testee'});

    // Expect desktop to display empty-path route.
    await expectDesktop(desktopPage).toBeVisible();
    await expect(appPO.views()).toHaveCount(0);
    await expect.poll(() => desktopPage.desktop.getInfo()).toMatchObject({
        routeData: {
          path: '',
          navigationHint: 'test-desktop',
        },
        state: {navigated: 'true'},
      } satisfies Partial<DesktopInfo>,
    );
  });

  test('should navigate desktop when navigating from empty-path route to path-based route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open desktop page as empty-path route.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .navigateDesktop([''], {hint: 'test-desktop', cssClass: 'testee'}),
    );

    // Navigate to path-based route.
    await workbenchNavigator.modifyLayout(layout => layout
      .navigateDesktop(['test-desktop'], {
        cssClass: 'testee',
        state: {navigated: 'true'},
      }),
    );

    const desktopPage = new DesktopPagePO(appPO, {cssClass: 'testee'});

    // Expect desktop to display path-based route.
    await expectDesktop(desktopPage).toBeVisible();
    await expect(appPO.views()).toHaveCount(0);
    await expect.poll(() => desktopPage.desktop.getInfo()).toMatchObject({
        routeData: {
          path: 'test-desktop',
          navigationHint: '',
        },
        state: {navigated: 'true'},
      } satisfies Partial<DesktopInfo>,
    );
  });

  test('should navigate desktop when navigating from path-based route to empty-path route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Open desktop page as path-based route.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .navigateDesktop(['test-desktop'], {cssClass: 'testee'}),
    );

    // Navigate to empty-path route.
    await workbenchNavigator.modifyLayout(layout => layout
      .navigateDesktop([''], {
        hint: 'test-desktop',
        cssClass: 'testee',
        state: {navigated: 'true'},
      }),
    );

    const desktopPage = new DesktopPagePO(appPO, {cssClass: 'testee'});

    // Expect desktop to display empty-path route.
    await expectDesktop(desktopPage).toBeVisible();
    await expect(appPO.views()).toHaveCount(0);
    await expect.poll(() => desktopPage.desktop.getInfo()).toMatchObject({
        routeData: {
          path: '',
          navigationHint: 'test-desktop',
        },
        state: {navigated: 'true'},
      } satisfies Partial<DesktopInfo>,
    );
  });

  test('should navigate desktop per perspective', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const desktopPage1 = new DesktopPagePO(appPO, {cssClass: 'testee-1'});
    const desktopPage2 = new DesktopPagePO(appPO, {cssClass: 'testee-2'});

    const perspective1 = await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .navigateDesktop(['test-desktop'], {cssClass: 'testee-1'}),
    );

    const perspective2 = await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .navigateDesktop(['test-desktop'], {cssClass: 'testee-2'}),
    );

    // No desktop navigation
    const perspective3 = await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA),
    );

    // Switch to perspective 1
    await appPO.switchPerspective(perspective1);
    await expectDesktop(desktopPage1).toBeVisible();

    // Switch to perspective 2
    await appPO.switchPerspective(perspective2);
    await expectDesktop(desktopPage2).toBeVisible();

    // Switch to perspective 3
    await appPO.switchPerspective(perspective3);
    await expectDesktop(desktopPage1).not.toBeAttached();
    await expectDesktop(desktopPage2).not.toBeAttached();

    // Switch to perspective 1
    await appPO.switchPerspective(perspective1);
    await expectDesktop(desktopPage1).toBeVisible();

    // Switch to perspective 2
    await appPO.switchPerspective(perspective2);
    await expectDesktop(desktopPage2).toBeVisible();
  });
});
