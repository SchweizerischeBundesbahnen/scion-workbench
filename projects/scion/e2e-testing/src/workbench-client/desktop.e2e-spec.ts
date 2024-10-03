/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
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
import {SciRouterOutletPO} from './page-object/sci-router-outlet.po';
import {InputFieldTestPagePO} from './page-object/test-pages/input-field-test-page.po';
import {expect} from '@playwright/test';
import {ViewPagePO} from './page-object/view-page.po';

test.describe('Workbench Desktop', () => {

  test('should navigate desktop (layout with main area)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const perspective = await microfrontendNavigator.registerCapability('app1', {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        layout: [
          {id: MAIN_AREA},
        ],
        desktop: {
          path: 'test-desktop',
          cssClass: 'testee',
        },
      },
    });

    const desktopPage = new DesktopPagePO(appPO, {cssClass: 'testee'});

    // Switch perspective.
    await appPO.switchPerspective(perspective.metadata!.id);

    // Expect desktop to show.
    await expectDesktop(desktopPage).toBeVisible();

    // Open view.
    const viewPage = await appPO.openNewViewTab();

    // Expect desktop not to show.
    await expectDesktop(desktopPage).toBeHidden();

    // Close view.
    await viewPage.view.tab.close();

    // Expect desktop to show.
    await expectDesktop(desktopPage).toBeVisible();
  });

  test('should navigate desktop (layout without main area)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view 1.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'view-1'},
      properties: {
        path: 'test-view',
        title: 'Microfrontend View',
      },
    });

    const perspective = await microfrontendNavigator.registerCapability('app1', {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        layout: [
          {
            id: 'left',
            views: [
              {qualifier: {view: 'view-1'}, cssClass: 'view-1'},
            ],
          },
        ],
        desktop: {
          path: 'test-desktop',
          cssClass: 'testee',
        },
      },
    });

    const desktopPage = new DesktopPagePO(appPO, {cssClass: 'testee'});

    // Switch perspective.
    await appPO.switchPerspective(perspective.metadata!.id);

    // Expect desktop not to be attached.
    await expectDesktop(desktopPage).not.toBeAttached();

    // Close view.
    const viewPage1 = new ViewPagePO(appPO, {cssClass: 'view-1'});
    await viewPage1.view.tab.close();

    // Expect desktop to show.
    await expectDesktop(desktopPage).toBeVisible();

    // Open view.
    const viewPage = await appPO.openNewViewTab();

    // Expect desktop to be hidden.
    await expectDesktop(desktopPage).toBeHidden();

    // Close view.
    await viewPage.view.tab.close();

    // Expect desktop to show.
    await expectDesktop(desktopPage).toBeVisible();
  });

  test('should preserve component state when changing layout', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view 1.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'view-1'},
      properties: {
        path: 'test-view',
        title: 'Microfrontend View 1',
      },
    });

    // Register view 2.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'view-2'},
      properties: {
        path: 'test-view',
        title: 'Microfrontend View 2',
      },
    });

    // Register perspective.
    const perspective = await microfrontendNavigator.registerCapability('app1', {
      type: 'perspective',
      qualifier: {perspective: 'app-1'},
      properties: {
        layout: [
          {
            id: MAIN_AREA,
          },
          {
            id: 'left',
            align: 'left',
            views: [
              {qualifier: {view: 'view-1'}, cssClass: 'testee-1'},
            ],
          },
          {
            id: 'right',
            align: 'right',
            views: [
              {qualifier: {view: 'view-2'}, cssClass: 'testee-2'},
            ],
          },
        ],
        desktop: {
          path: 'test-pages/input-field-test-page',
          cssClass: 'testee',
        },
      },
    });

    // Switch perspective.
    await appPO.switchPerspective(perspective.metadata!.id);

    // Enter component state in desktop.
    const desktop = appPO.desktop({cssClass: 'testee'});
    const outlet = new SciRouterOutletPO(appPO, {cssClass: 'testee'});
    const testeeDesktopPage = new InputFieldTestPagePO(outlet, desktop);
    await testeeDesktopPage.enterText('A');
    await expect(testeeDesktopPage.input).toHaveValue('A');

    await test.step('open view in main area', async () => {
      // Open view in main area.
      const viewPage = await appPO.openNewViewTab();

      // Close view.
      await viewPage.view.tab.close();

      // Expect component state to be preserved.
      await expect(testeeDesktopPage.input).toHaveValue('A');
    });

    await test.step('move view to another part', async () => {
      // Move view to another part.
      const viewPage1 = new ViewPagePO(appPO, {cssClass: 'testee-1'});
      await viewPage1.view.tab.moveTo('right');

      // Expect component state to be preserved.
      await expect(testeeDesktopPage.input).toHaveValue('A');
    });

    await test.step('close views', async () => {
      // Close views.
      const viewPage1 = new ViewPagePO(appPO, {cssClass: 'testee-1'});
      const viewPage2 = new ViewPagePO(appPO, {cssClass: 'testee-2'});
      await viewPage1.view.tab.close();
      await viewPage2.view.tab.close();

      // Expect component state to be preserved.
      await expect(testeeDesktopPage.input).toHaveValue('A');
    });
  });
});
