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
import {PerspectivePagePO} from './page-object/perspective-page.po';
import {SelectionPagePO} from './page-object/selection-page/selection-page.po';
import {expect} from '@playwright/test';
import {RouterPagePO} from './page-object/router-page.po';
import {SelectionTestPagePO} from './page-object/test-pages/selection-test-page.po';

test.describe('Workbench Selection', () => {

  test('should set selection', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const perspectivePage = await workbenchNavigator.openInNewTab(PerspectivePagePO);
    await perspectivePage.registerPerspective({
      id: 'testee',
      parts: [
        {id: 'left'},
        {id: 'right', align: 'right'},
      ],
      views: [
        {id: 'selection-provider', partId: 'left', activateView: true, cssClass: 'selection-provider'},
        {id: 'selection-listener', partId: 'right', activateView: true, cssClass: 'selection-listener'},
      ],
      navigateViews: [
        {id: 'selection-provider', commands: ['test-selection']},
        {id: 'selection-listener', commands: ['test-selection']},
      ],
    });
    await appPO.switchPerspective('testee');

    const selectionProviderPage = new SelectionPagePO(appPO, {cssClass: 'selection-provider'});
    const selectionListenerPage = new SelectionPagePO(appPO, {cssClass: 'selection-listener'});

    // Subscribe to selection
    await selectionListenerPage.subscribe();

    // Set selection
    await selectionProviderPage.setSelection({
      testee: ['A', 'B'],
    });

    // Expect selection to be set
    await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
      testee: ['A', 'B'],
    });
  });

  test('should publish selection to late subscribers', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const perspectivePage = await workbenchNavigator.openInNewTab(PerspectivePagePO);
    await perspectivePage.registerPerspective({
      id: 'testee',
      parts: [
        {id: 'left'},
        {id: 'right', align: 'right'},
      ],
      views: [
        {id: 'selection-provider', partId: 'left', activateView: true, cssClass: 'selection-provider'},
        {id: 'selection-listener', partId: 'right', activateView: true, cssClass: 'selection-listener'},
      ],
      navigateViews: [
        {id: 'selection-provider', commands: ['test-selection']},
        {id: 'selection-listener', commands: ['test-selection']},
      ],
    });
    await appPO.switchPerspective('testee');

    const selectionProviderPage = new SelectionPagePO(appPO, {cssClass: 'selection-provider'});
    const selectionListenerPage = new SelectionPagePO(appPO, {cssClass: 'selection-listener'});

    // Set selection
    await selectionProviderPage.setSelection({
      testee1: ['A', 'B'],
      testee2: ['C', 'D'],
    });

    // Subscribe to selection after it has been set
    await selectionListenerPage.subscribe();
    await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
      testee1: ['A', 'B'],
      testee2: ['C', 'D'],
    });
  });

  test('should publish selection of active view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const perspectivePage = await workbenchNavigator.openInNewTab(PerspectivePagePO);
    await perspectivePage.registerPerspective({
      id: 'testee',
      parts: [
        {id: 'left'},
        {id: 'middle', relativeTo: 'left', align: 'right', ratio: .6},
        {id: 'right', relativeTo: 'middle', align: 'right'},
      ],
      views: [
        {id: 'selection-provider-1', partId: 'left', activateView: true, cssClass: 'selection-provider-1'},
        {id: 'selection-provider-2', partId: 'middle', activateView: true, cssClass: 'selection-provider-2'},
        {id: 'selection-listener', partId: 'right', activateView: true, cssClass: 'selection-listener'},
      ],
      navigateViews: [
        {id: 'selection-provider-1', commands: ['test-selection']},
        {id: 'selection-provider-2', commands: ['test-selection']},
        {id: 'selection-listener', commands: ['test-selection']},
      ],
    });
    await appPO.switchPerspective('testee');

    const selectionProviderPage1 = new SelectionPagePO(appPO, {cssClass: 'selection-provider-1'});
    const selectionProviderPage2 = new SelectionPagePO(appPO, {cssClass: 'selection-provider-2'});
    const selectionListenerPage = new SelectionPagePO(appPO, {cssClass: 'selection-listener'});

    // Subscribe to selection
    await selectionListenerPage.subscribe();

    // Set selection in page 1
    await selectionProviderPage1.setSelection({
      testee: ['A'],
    });

    // Set selection in page 2
    await selectionProviderPage2.setSelection({
      testee: ['B'],
    });

    // Activate selection page 1
    await selectionProviderPage1.view.tab.click();
    await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
      testee: ['A'],
    });

    // Activate selection page 2
    await selectionProviderPage2.view.tab.click();
    await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
      testee: ['B'],
    });
  });

  test('should not publish selection of inactive view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const perspectivePage = await workbenchNavigator.openInNewTab(PerspectivePagePO);
    await perspectivePage.registerPerspective({
      id: 'testee',
      parts: [
        {id: 'left'},
        {id: 'right', align: 'right'},
        {id: 'bottom', align: 'bottom'},
      ],
      views: [
        {id: 'selection-provider', partId: 'left', activateView: true, cssClass: 'selection-provider'},
        {id: 'selection-listener', partId: 'right', activateView: true, cssClass: 'selection-listener'},
        {id: 'selection-test-page', partId: 'bottom', activateView: true, cssClass: 'selection-test-page'},
      ],
      navigateViews: [
        {id: 'selection-provider', commands: ['test-selection']},
        {id: 'selection-listener', commands: ['test-selection']},
        {id: 'selection-test-page', commands: ['test-pages/selection-test-page']},
      ],
    });
    await appPO.switchPerspective('testee');

    const selectionProviderPage = new SelectionPagePO(appPO, {cssClass: 'selection-provider'});
    const selectionListenerPage = new SelectionPagePO(appPO, {cssClass: 'selection-listener'});
    const selectionTestPage = new SelectionTestPagePO(appPO, {cssClass: 'selection-test-page'});

    // Subscribe to selection
    await selectionListenerPage.subscribe();

    // Set selection in inactive view
    await selectionTestPage.setSelection(await selectionProviderPage.view.getViewId(), {
      testee: ['A'],
    });

    // Expect selection not to be set
    await expect.poll(() => selectionListenerPage.getSelection()).toEqual({});

    // Activate selection page
    await selectionProviderPage.view.tab.click();

    // Expect selection to be set
    await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
      testee: ['A'],
    });
  });

  test('should merge selection types', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const perspectivePage = await workbenchNavigator.openInNewTab(PerspectivePagePO);
    await perspectivePage.registerPerspective({
      id: 'testee',
      parts: [
        {id: 'left'},
        {id: 'middle', relativeTo: 'left', align: 'right', ratio: .6},
        {id: 'right', relativeTo: 'middle', align: 'right'},
      ],
      views: [
        {id: 'selection-provider-1', partId: 'left', activateView: true, cssClass: 'selection-provider-1'},
        {id: 'selection-provider-2', partId: 'middle', activateView: true, cssClass: 'selection-provider-2'},
        {id: 'selection-listener', partId: 'right', activateView: true, cssClass: 'selection-listener'},
      ],
      navigateViews: [
        {id: 'selection-provider-1', commands: ['test-selection']},
        {id: 'selection-provider-2', commands: ['test-selection']},
        {id: 'selection-listener', commands: ['test-selection']},
      ],
    });
    await appPO.switchPerspective('testee');

    const selectionProviderPage1 = new SelectionPagePO(appPO, {cssClass: 'selection-provider-1'});
    const selectionProviderPage2 = new SelectionPagePO(appPO, {cssClass: 'selection-provider-2'});
    const selectionListenerPage = new SelectionPagePO(appPO, {cssClass: 'selection-listener'});

    // Subscribe to selection
    await selectionListenerPage.subscribe();

    // Set selection in page 1
    await selectionProviderPage1.setSelection({
      testee1: ['A1'],
      testee2: ['B1'],
    });

    // Set selection in page 1
    await selectionProviderPage2.setSelection({
      testee2: ['B2'],
      testee3: ['C2'],
    });

    // Expect selection types to be merged
    await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
      testee1: ['A1'],
      testee2: ['B2'],
      testee3: ['C2'],
    });
  });

  test('should not receive own selection', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const selectionPage = await workbenchNavigator.openInNewTab(SelectionPagePO);

    // Subscribe to selection
    await selectionPage.subscribe();

    // Set selection
    await selectionPage.setSelection({
      testee1: ['A', 'B'],
      testee2: ['C', 'D'],
    });

    // Expect not to receive own selection
    await expect.poll(() => selectionPage.getSelection()).not.toEqual({
      testee1: ['A', 'B'],
      testee2: ['C', 'D'],
    });
  });

  test('should remove undefined selection entries', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const perspectivePage = await workbenchNavigator.openInNewTab(PerspectivePagePO);
    await perspectivePage.registerPerspective({
      id: 'testee',
      parts: [
        {id: 'left'},
        {id: 'right', align: 'right'},
      ],
      views: [
        {id: 'selection-provider', partId: 'left', activateView: true, cssClass: 'selection-provider'},
        {id: 'selection-listener', partId: 'right', activateView: true, cssClass: 'selection-listener'},
      ],
      navigateViews: [
        {id: 'selection-provider', commands: ['test-selection']},
        {id: 'selection-listener', commands: ['test-selection']},
      ],
    });
    await appPO.switchPerspective('testee');

    const selectionProviderPage = new SelectionPagePO(appPO, {cssClass: 'selection-provider'});
    const selectionListenerPage = new SelectionPagePO(appPO, {cssClass: 'selection-listener'});

    // Subscribe to selection
    await selectionListenerPage.subscribe();

    // Set selection
    await selectionProviderPage.setSelection({
      testee1: ['A1'],
    });
    await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
      testee1: ['A1'],
    });

    // Set selection of another type
    await selectionProviderPage.setSelection({
      testee2: ['B1'],
    });

    // Expect selection of type 'testee1' to be removed
    await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
      testee2: ['B1'],
    });
  });

  test('should empty selection', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const perspectivePage = await workbenchNavigator.openInNewTab(PerspectivePagePO);
    await perspectivePage.registerPerspective({
      id: 'testee',
      parts: [
        {id: 'left'},
        {id: 'right', align: 'right'},
      ],
      views: [
        {id: 'selection-provider', partId: 'left', activateView: true, cssClass: 'selection-provider'},
        {id: 'selection-listener', partId: 'right', activateView: true, cssClass: 'selection-listener'},
      ],
      navigateViews: [
        {id: 'selection-provider', commands: ['test-selection']},
        {id: 'selection-listener', commands: ['test-selection']},
      ],
    });
    await appPO.switchPerspective('testee');

    const selectionProviderPage = new SelectionPagePO(appPO, {cssClass: 'selection-provider'});
    const selectionListenerPage = new SelectionPagePO(appPO, {cssClass: 'selection-listener'});

    // Subscribe to selection
    await selectionListenerPage.subscribe();

    // Empty selection
    await selectionProviderPage.setSelection({
      testee: [],
    });

    // Expect selection to be empty
    await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
      testee: [],
    });
  });

  test('should retain selection when maximizing and minimizing main area', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const perspectivePage = await workbenchNavigator.openInNewTab(PerspectivePagePO);
    await perspectivePage.registerPerspective({
      id: 'testee',
      parts: [
        {id: 'main-area'},
        {id: 'left', align: 'left'},
      ],
      views: [
        {id: 'selection-provider', partId: 'left', activateView: true, cssClass: 'selection-provider'},
      ],
      navigateViews: [
        {id: 'selection-provider', commands: ['test-selection']},
      ],
    });
    await appPO.switchPerspective('testee');

    const selectionProviderPage = new SelectionPagePO(appPO, {cssClass: 'selection-provider'});
    const selectionListenerPage = await workbenchNavigator.openInNewTab(SelectionPagePO);

    // Subscribe to selection
    await selectionListenerPage.subscribe();

    // Set selection
    await selectionProviderPage.setSelection({
      testee: ['A'],
    });
    await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
      testee: ['A'],
    });

    // Maximize the main area
    await selectionListenerPage.view.tab.dblclick();

    // Expect selection to be retained
    await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
      testee: ['A'],
    });

    // Minimize the main area
    await selectionListenerPage.view.tab.dblclick();

    // Expect selection to be retained
    await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
      testee: ['A'],
    });
  });

  test.describe('Navigating View', () => {

    test('should remove selection if last provider of type when navigating view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const perspectivePage = await workbenchNavigator.openInNewTab(PerspectivePagePO);
      await perspectivePage.registerPerspective({
        id: 'testee',
        parts: [
          {id: 'left'},
          {id: 'right', align: 'right'},
          {id: 'bottom', align: 'bottom'},
        ],
        views: [
          {id: 'selection-provider', partId: 'left', activateView: true, cssClass: 'selection-provider'},
          {id: 'selection-listener', partId: 'right', activateView: true, cssClass: 'selection-listener'},
          {id: 'router', partId: 'bottom', activateView: true, cssClass: 'router'},
        ],
        navigateViews: [
          {id: 'selection-provider', commands: ['test-selection']},
          {id: 'selection-listener', commands: ['test-selection']},
          {id: 'router', commands: ['test-router']},
        ],
      });
      await appPO.switchPerspective('testee');

      const selectionProviderPage = new SelectionPagePO(appPO, {cssClass: 'selection-provider'});
      const selectionListenerPage = new SelectionPagePO(appPO, {cssClass: 'selection-listener'});
      const routerPage = new RouterPagePO(appPO, {cssClass: 'router'});

      // Subscribe to selection
      await selectionListenerPage.subscribe();

      // Set selection
      await selectionProviderPage.setSelection({
        testee: ['A'],
      });
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
        testee: ['A'],
      });

      // Navigate in selection page
      await routerPage.enterTarget(await selectionProviderPage.view.getViewId());
      await routerPage.enterPath('test-view');
      await routerPage.clickNavigate();

      // Expect selection 'testee' to be removed (no more providers).
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({});
    });

    test('should retain selection if NOT last provider of type when navigating view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const perspectivePage = await workbenchNavigator.openInNewTab(PerspectivePagePO);
      await perspectivePage.registerPerspective({
        id: 'testee',
        parts: [
          {id: 'left-top'},
          {id: 'left-bottom', relativeTo: 'left-top', align: 'bottom'},
          {id: 'right', align: 'right'},
          {id: 'bottom', align: 'bottom'},
        ],
        views: [
          {id: 'selection-provider-1', partId: 'left-top', activateView: true, cssClass: 'selection-provider-1'},
          {id: 'selection-provider-2', partId: 'left-bottom', activateView: true, cssClass: 'selection-provider-2'},
          {id: 'selection-listener', partId: 'right', activateView: true, cssClass: 'selection-listener'},
          {id: 'router', partId: 'bottom', activateView: true, cssClass: 'router'},
        ],
        navigateViews: [
          {id: 'selection-provider-1', commands: ['test-selection']},
          {id: 'selection-provider-2', commands: ['test-selection']},
          {id: 'selection-listener', commands: ['test-selection']},
          {id: 'router', commands: ['test-router']},
        ],
      });
      await appPO.switchPerspective('testee');

      const selectionProviderPage1 = new SelectionPagePO(appPO, {cssClass: 'selection-provider-1'});
      const selectionProviderPage2 = new SelectionPagePO(appPO, {cssClass: 'selection-provider-2'});
      const selectionListenerPage = new SelectionPagePO(appPO, {cssClass: 'selection-listener'});
      const routerPage = new RouterPagePO(appPO, {cssClass: 'router'});

      // Subscribe to selection
      await selectionListenerPage.subscribe();

      // Set selection in page 1
      await selectionProviderPage1.setSelection({
        testee: ['A1'],
      });
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
        testee: ['A1'],
      });

      // Set selection in page 2
      await selectionProviderPage2.setSelection({
        testee: ['A2'],
      });
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
        testee: ['A2'],
      });

      // Navigate in selection page 1
      await routerPage.enterTarget(await selectionProviderPage2.view.getViewId());
      await routerPage.enterPath('test-view');
      await routerPage.clickNavigate();

      // Expect the selection to be retained
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
        testee: ['A2'],
      });

      // The selection is only updated after activating a view that provides a selection of type 'testee'.
      // Activate selection page 1
      await selectionProviderPage1.view.tab.click();
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
        testee: ['A1'],
      });
    });
  });

  test.describe('Closing View', () => {

    test('should remove selection if last provider of type when closing view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const perspectivePage = await workbenchNavigator.openInNewTab(PerspectivePagePO);
      await perspectivePage.registerPerspective({
        id: 'testee',
        parts: [
          {id: 'left'},
          {id: 'right', align: 'right'},
          {id: 'bottom', align: 'bottom'},
        ],
        views: [
          {id: 'selection-provider', partId: 'left', activateView: true, cssClass: 'selection-provider'},
          {id: 'selection-listener', partId: 'right', activateView: true, cssClass: 'selection-listener'},
          {id: 'router', partId: 'bottom', activateView: true, cssClass: 'router'},
        ],
        navigateViews: [
          {id: 'selection-provider', commands: ['test-selection']},
          {id: 'selection-listener', commands: ['test-selection']},
          {id: 'router', commands: ['test-router']},
        ],
      });
      await appPO.switchPerspective('testee');

      const selectionProviderPage = new SelectionPagePO(appPO, {cssClass: 'selection-provider'});
      const selectionListenerPage = new SelectionPagePO(appPO, {cssClass: 'selection-listener'});
      const routerPage = new RouterPagePO(appPO, {cssClass: 'router'});

      // Subscribe to selection
      await selectionListenerPage.subscribe();

      // Set selection in page 1
      await selectionProviderPage.setSelection({
        testee: ['A'],
      });
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
        testee: ['A'],
      });

      // Close selection page
      await routerPage.enterTarget(await selectionProviderPage.view.getViewId());
      await routerPage.checkClose(true);
      await routerPage.clickNavigate();

      // Expect selection 'testee' to be removed (no more providers).
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({});
    });

    test('should retain selection if NOT last provider of type when closing view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const perspectivePage = await workbenchNavigator.openInNewTab(PerspectivePagePO);
      await perspectivePage.registerPerspective({
        id: 'testee',
        parts: [
          {id: 'left-top'},
          {id: 'left-bottom', relativeTo: 'left-top', align: 'bottom'},
          {id: 'right', align: 'right'},
          {id: 'bottom', align: 'bottom'},
        ],
        views: [
          {id: 'selection-provider-1', partId: 'left-top', activateView: true, cssClass: 'selection-provider-1'},
          {id: 'selection-provider-2', partId: 'left-bottom', activateView: true, cssClass: 'selection-provider-2'},
          {id: 'selection-listener', partId: 'right', activateView: true, cssClass: 'selection-listener'},
          {id: 'router', partId: 'bottom', activateView: true, cssClass: 'router'},
        ],
        navigateViews: [
          {id: 'selection-provider-1', commands: ['test-selection']},
          {id: 'selection-provider-2', commands: ['test-selection']},
          {id: 'selection-listener', commands: ['test-selection']},
          {id: 'router', commands: ['test-router']},
        ],
      });
      await appPO.switchPerspective('testee');

      const selectionProviderPage1 = new SelectionPagePO(appPO, {cssClass: 'selection-provider-1'});
      const selectionProviderPage2 = new SelectionPagePO(appPO, {cssClass: 'selection-provider-2'});
      const selectionListenerPage = new SelectionPagePO(appPO, {cssClass: 'selection-listener'});
      const routerPage = new RouterPagePO(appPO, {cssClass: 'router'});

      // Subscribe to selection
      await selectionListenerPage.subscribe();

      // Set selection in page 1
      await selectionProviderPage1.setSelection({
        testee: ['A1'],
      });
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
        testee: ['A1'],
      });

      // Set selection in page 2
      await selectionProviderPage2.setSelection({
        testee: ['A2'],
      });
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
        testee: ['A2'],
      });

      // Close selection page
      await routerPage.enterTarget(await selectionProviderPage2.view.getViewId());
      await routerPage.checkClose(true);
      await routerPage.clickNavigate();

      // Expect the selection to be retained
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
        testee: ['A2'],
      });

      // The selection is only updated after activating a view that provides a selection of the corresponding type.
      // Activate selection page 1
      await selectionProviderPage1.view.tab.click();
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
        testee: ['A1'],
      });
    });
  });
});
