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
import {StartPagePO} from '../start-page.po';
import {ViewPagePO} from './page-object/view-page.po';

test.describe('Desktop', () => {

  test('should navigate desktop', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const desktopPage = new DesktopPagePO(appPO, {cssClass: 'testee'});

    // Open desktop page.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .navigateDesktop(['test-desktop'], {cssClass: 'testee'}),
    );

    // Expect desktop to show.
    await expectDesktop(desktopPage).toBeVisible();

    // Open view.
    await workbenchNavigator.openInNewTab(ViewPagePO);

    // Expect desktop not to be attached.
    await expectDesktop(desktopPage).not.toBeAttached();
  });

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
        data: {navigated: 'true'},
      }),
    );

    const desktopPage = new DesktopPagePO(appPO, {cssClass: 'testee'});

    // Expect desktop to display path-based route.
    await expectDesktop(desktopPage).toBeVisible();
    await expect(appPO.views()).toHaveCount(0);
    await expect.poll(() => desktopPage.getPath()).toEqual('test-desktop');
    await expect.poll(() => desktopPage.getNavigationHint()).toEqual('');
    await expect.poll(() => desktopPage.getNavigationData()).toMatchObject({
      navigated: 'true',
    });
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
        data: {navigated: 'true'},
      }),
    );

    const desktopPage = new DesktopPagePO(appPO, {cssClass: 'testee'});

    // Expect desktop to display empty-path route.
    await expectDesktop(desktopPage).toBeVisible();
    await expect(appPO.views()).toHaveCount(0);
    await expect.poll(() => desktopPage.getPath()).toEqual('');
    await expect.poll(() => desktopPage.getNavigationHint()).toEqual('test-desktop');
    await expect.poll(() => desktopPage.getNavigationData()).toMatchObject({
      navigated: 'true',
    });
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
        data: {navigated: 'true'},
      }),
    );

    const desktopPage = new DesktopPagePO(appPO, {cssClass: 'testee'});

    // Expect desktop to display path-based route.
    await expectDesktop(desktopPage).toBeVisible();
    await expect(appPO.views()).toHaveCount(0);
    await expect.poll(() => desktopPage.getPath()).toEqual('test-desktop');
    await expect.poll(() => desktopPage.getNavigationHint()).toEqual('');
    await expect.poll(() => desktopPage.getNavigationData()).toMatchObject({
      navigated: 'true',
    });
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
        data: {navigated: 'true'},
      }),
    );

    const desktopPage = new DesktopPagePO(appPO, {cssClass: 'testee'});

    // Expect desktop to display empty-path route.
    await expectDesktop(desktopPage).toBeVisible();
    await expect(appPO.views()).toHaveCount(0);
    await expect.poll(() => desktopPage.getPath()).toEqual('');
    await expect.poll(() => desktopPage.getNavigationHint()).toEqual('test-desktop');
    await expect.poll(() => desktopPage.getNavigationData()).toMatchObject({
      navigated: 'true',
    });
  });

  test('should navigate desktop per perspective (layout with main area)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const desktopPage1 = new DesktopPagePO(appPO, {cssClass: 'testee-1'});
    const desktopPage2 = new DesktopPagePO(appPO, {cssClass: 'testee-2'});

    const perspective1 = await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .navigateDesktop(['test-desktop'], {cssClass: 'testee-1'}),
    );

    const perspective2 = await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .navigateDesktop([''], {hint: 'test-desktop', cssClass: 'testee-2'}),
    );

    // Switch to perspective 1
    await appPO.switchPerspective(perspective1);
    await expectDesktop(desktopPage1).toBeVisible();

    // Switch to perspective 2
    await appPO.switchPerspective(perspective2);
    await expectDesktop(desktopPage2).toBeVisible();

    // Switch to perspective 1
    await appPO.switchPerspective(perspective1);
    await expectDesktop(desktopPage1).toBeVisible();
  });

  test('should navigate desktop per perspective (layout without main area)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const desktopPage1 = new DesktopPagePO(appPO, {cssClass: 'testee-1'});
    const desktopPage2 = new DesktopPagePO(appPO, {cssClass: 'testee-2'});

    const perspective1 = await workbenchNavigator.createPerspective(factory => factory
      .addPart('testee')
      .navigateDesktop(['test-desktop'], {cssClass: 'testee-1'}),
    );

    const perspective2 = await workbenchNavigator.createPerspective(factory => factory
      .addPart('testee')
      .navigateDesktop([''], {hint: 'test-desktop', cssClass: 'testee-2'}),
    );

    // Switch to perspective 1
    await appPO.switchPerspective(perspective1);
    await expectDesktop(desktopPage1).toBeVisible();

    // Switch to perspective 2
    await appPO.switchPerspective(perspective2);
    await expectDesktop(desktopPage2).toBeVisible();

    // Switch to perspective 1
    await appPO.switchPerspective(perspective1);
    await expectDesktop(desktopPage1).toBeVisible();
  });

  test('should mount primary router outlet when desktop is not navigated (layout with main area)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const desktopPage = new DesktopPagePO(appPO, {cssClass: 'testee'});
    const startPage = new StartPagePO(appPO);

    const perspective1 = await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .navigateDesktop(['test-desktop'], {cssClass: 'testee'}),
    );

    // Do not navigate desktop.
    const perspective2 = await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA),
    );

    // Switch to perspective 1
    await appPO.switchPerspective(perspective1);
    await expectDesktop(desktopPage).toBeVisible();

    // Switch to perspective 2
    await appPO.switchPerspective(perspective2);
    await expect(startPage.locator).toBeVisible();

    // Switch to perspective 1
    await appPO.switchPerspective(perspective1);
    await expectDesktop(desktopPage).toBeVisible();
  });

  test('should mount primary router outlet when desktop is not navigated (layout without main area)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const desktopPage = new DesktopPagePO(appPO, {cssClass: 'testee'});
    const startPage = new StartPagePO(appPO);

    const perspective1 = await workbenchNavigator.createPerspective(factory => factory
      .addPart('testee')
      .navigateDesktop(['test-desktop'], {cssClass: 'testee'}),
    );

    // Do not navigate desktop.
    const perspective2 = await workbenchNavigator.createPerspective(factory => factory
      .addPart('testee'),
    );

    // Switch to perspective 1
    await appPO.switchPerspective(perspective1);
    await expectDesktop(desktopPage).toBeVisible();

    // Switch to perspective 2
    await appPO.switchPerspective(perspective2);
    await expect(startPage.locator).toBeVisible();

    // Switch to perspective 1
    await appPO.switchPerspective(perspective1);
    await expectDesktop(desktopPage).toBeVisible();
  });
});
