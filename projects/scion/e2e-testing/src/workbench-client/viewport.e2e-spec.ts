/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {RouterPagePO} from '../workbench/page-object/router-page.po';
import {RouterPagePO as MicrofrontendRouterPagePO} from './page-object/router-page.po';
import {ViewportTestPagePO} from '../workbench/page-object/test-pages/viewport-test-page.po';
import {ViewportTestPagePO as MicrofrontendViewportTestPagePO} from './page-object/test-pages/viewport-test-page.po';
import {ViewPagePO as MicrofrontendViewPagePO} from './page-object/view-page.po';
import {ViewPagePO} from '../workbench/page-object/view-page.po';

test.describe('SciViewport', () => {

  test.describe('Viewport in Non-Microfrontend View', () => {

    test('should continue scrolling when moving pointer over microfrontend view', async ({appPO, workbenchNavigator, microfrontendNavigator, page}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Open non-microfrontend view with a viewport.
      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate(['test-pages/viewport-test-page'], {target: 'view.left'});

      // Open microfrontend view to the right.
      const microfrontendPage = await microfrontendNavigator.openInNewTab(MicrofrontendViewPagePO, 'app1');
      await microfrontendPage.view.tab.moveTo(await microfrontendPage.view.part.getPartId(), {region: 'east'});

      const viewportTestPage = new ViewportTestPagePO(appPO.view({viewId: 'view.left'}));
      const scrollbar = viewportTestPage.scrollbar;

      // Start dragging the scrollbar thumb.
      await scrollbar.thumb.hover();
      const scrollbarBounds = await scrollbar.innerBounds();
      await page.mouse.down();

      // Move pointer horizontally out of scrolltrack over microfrontend view.
      await page.mouse.move(scrollbarBounds.hcenter + 100, scrollbarBounds.top, {steps: 10});

      // Drag pointer downward over microfrontend view.
      await page.mouse.move(scrollbarBounds.hcenter + 100, scrollbarBounds.vcenter, {steps: 20});

      // Expect scrollbar to be scrolled to the middle.
      await expect.poll(() => scrollbar.thumb.vcenter()).toBeBetween(scrollbarBounds.vcenter - 1, scrollbarBounds.vcenter + 1);

      // Stop scrolling.
      await page.mouse.up();
    });

    test('should continue scrolling when moving pointer over non-microfrontend view', async ({appPO, workbenchNavigator, page}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      // Open non-microfrontend view with a viewport.
      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate(['test-pages/viewport-test-page'], {target: 'view.left'});

      // Open non-microfrontend view to the right.
      const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
      await viewPage.view.tab.moveTo(await viewPage.view.part.getPartId(), {region: 'east'});

      const viewportTestPage = new ViewportTestPagePO(appPO.view({viewId: 'view.left'}));
      const scrollbar = viewportTestPage.scrollbar;

      // Start dragging the scrollbar thumb.
      await scrollbar.thumb.hover();
      const scrollbarBounds = await scrollbar.innerBounds();
      await page.mouse.down();

      // Move pointer horizontally out of scrolltrack over non-microfrontend view.
      await page.mouse.move(scrollbarBounds.hcenter + 100, scrollbarBounds.top, {steps: 10});

      // Drag pointer downward over non-microfrontend view.
      await page.mouse.move(scrollbarBounds.hcenter + 100, scrollbarBounds.vcenter, {steps: 20});

      // Expect scrollbar to be scrolled to the middle.
      await expect.poll(() => scrollbar.thumb.vcenter()).toBeBetween(scrollbarBounds.vcenter - 1, scrollbarBounds.vcenter + 1);

      // Stop scrolling.
      await page.mouse.up();
    });
  });

  test.describe('Viewport in Microfrontend View', () => {

    test('should continue scrolling when moving pointer over microfrontend view', async ({appPO, microfrontendNavigator, page}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register microfrontend view with a viewport.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/viewport-test-page',
          title: 'Viewport',
        },
      });

      // Open microfrontend view with a viewport.
      const routerPage = await microfrontendNavigator.openInNewTab(MicrofrontendRouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {target: 'view.left'});

      // Open microfrontend view to the right.
      const microfrontendPage = await microfrontendNavigator.openInNewTab(MicrofrontendViewPagePO, 'app1');
      await microfrontendPage.view.tab.moveTo(await microfrontendPage.view.part.getPartId(), {region: 'east'});

      const viewportTestPage = new MicrofrontendViewportTestPagePO(appPO.view({viewId: 'view.left'}));
      const scrollbar = viewportTestPage.scrollbar;

      // Start dragging the scrollbar thumb.
      await scrollbar.thumb.hover();
      const scrollbarBounds = await scrollbar.innerBounds();
      await page.mouse.down();

      // Move pointer horizontally out of scrolltrack over microfrontend view.
      await page.mouse.move(scrollbarBounds.hcenter + 100, scrollbarBounds.top, {steps: 10});

      // Drag pointer downward over microfrontend view.
      await page.mouse.move(scrollbarBounds.hcenter + 100, scrollbarBounds.vcenter, {steps: 20});

      // Expect scrollbar to be scrolled to the middle.
      await expect.poll(() => scrollbar.thumb.vcenter()).toBeBetween(scrollbarBounds.vcenter - 1, scrollbarBounds.vcenter + 1);

      // Stop scrolling.
      await page.mouse.up();
    });

    test('should continue scrolling when moving pointer over non-microfrontend view', async ({appPO, workbenchNavigator, microfrontendNavigator, page}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register microfrontend view with a viewport.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/viewport-test-page',
          title: 'Viewport',
        },
      });

      // Open microfrontend view with a viewport.
      const routerPage = await microfrontendNavigator.openInNewTab(MicrofrontendRouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {target: 'view.left'});

      // Open non-microfrontend view to the right.
      const viewPage = await workbenchNavigator.openInNewTab(ViewPagePO);
      await viewPage.view.tab.moveTo(await viewPage.view.part.getPartId(), {region: 'east'});

      const viewportTestPage = new MicrofrontendViewportTestPagePO(appPO.view({viewId: 'view.left'}));
      const scrollbar = viewportTestPage.scrollbar;

      // Start dragging the scrollbar thumb.
      await scrollbar.thumb.hover();
      const scrollbarBounds = await scrollbar.innerBounds();
      await page.mouse.down();

      // Move pointer horizontally out of scrolltrack over non-microfrontend view.
      await page.mouse.move(scrollbarBounds.hcenter + 100, scrollbarBounds.top, {steps: 10});

      // Drag pointer downward over non-microfrontend view.
      await page.mouse.move(scrollbarBounds.hcenter + 100, scrollbarBounds.vcenter, {steps: 20});

      // Expect scrollbar to be scrolled to the middle.
      await expect.poll(() => scrollbar.thumb.vcenter()).toBeBetween(scrollbarBounds.vcenter - 1, scrollbarBounds.vcenter + 1);

      // Stop scrolling.
      await page.mouse.up();
    });
  });
});
