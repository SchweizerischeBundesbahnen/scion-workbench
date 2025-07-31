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
import {SelectionPagePO} from './page-object/selection-page/selection-page.po';
import {expect} from '@playwright/test';
import {RouterPagePO} from './page-object/router-page.po';
import {LayoutPagePO} from './page-object/layout-page/layout-page.po';

test.describe('Workbench Selection', () => {

  test.describe('basic', () => {

    test('should publish selection', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.left')
        .addPart('part.right', {align: 'right'})
        .addView('view.selection-provider', {partId: 'part.left', activateView: true})
        .addView('view.selection-listener', {partId: 'part.right', activateView: true})
        .navigateView('view.selection-provider', ['test-selection'])
        .navigateView('view.selection-listener', ['test-selection']),
      );

      const selectionProviderPage = new SelectionPagePO(appPO.view({viewId: 'view.selection-provider'}));
      const selectionListenerPage = new SelectionPagePO(appPO.view({viewId: 'view.selection-listener'}));

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

      // Set selection
      await selectionProviderPage.setSelection({
        testee: ['C', 'D'],
      });

      // Expect selection to be set
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
        testee: ['C', 'D'],
      });
    });

    test('should publish selection (bug)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const selectionProviderPage = await workbenchNavigator.openInNewTab(SelectionPagePO);
      const selectionListenerPage = await workbenchNavigator.openInNewTab(SelectionPagePO);

      // Move selection listener to the east.
      await selectionListenerPage.view.tab.moveTo(await selectionListenerPage.view.part.getPartId(), {region: 'east'});

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

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.left')
        .addPart('part.right', {align: 'right'})
        .addView('view.selection-provider', {partId: 'part.left', activateView: true})
        .addView('view.selection-listener', {partId: 'part.right', activateView: true})
        .navigateView('view.selection-provider', ['test-selection'])
        .navigateView('view.selection-listener', ['test-selection']),
      );

      const selectionProviderPage = new SelectionPagePO(appPO.view({viewId: 'view.selection-provider'}));
      const selectionListenerPage = new SelectionPagePO(appPO.view({viewId: 'view.selection-listener'}));

      // Set selection
      await selectionProviderPage.setSelection({
        testee: ['A', 'B'],
      });

      // Subscribe to selection after it has been set
      await selectionListenerPage.subscribe();

      // Expect selection to be set
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
        testee: ['A', 'B'],
      });
    });

    test('should merge selection types', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.left')
        .addPart('part.middle', {relativeTo: 'part.left', align: 'right'})
        .addPart('part.right', {relativeTo: 'part.middle', align: 'right'})
        .addView('view.selection-provider-1', {partId: 'part.left', activateView: true})
        .addView('view.selection-provider-2', {partId: 'part.middle', activateView: true})
        .addView('view.selection-listener', {partId: 'part.right', activateView: true})
        .navigateView('view.selection-provider-1', ['test-selection'])
        .navigateView('view.selection-provider-2', ['test-selection'])
        .navigateView('view.selection-listener', ['test-selection']),
      );

      const selectionProviderPage1 = new SelectionPagePO(appPO.view({viewId: 'view.selection-provider-1'}));
      const selectionProviderPage2 = new SelectionPagePO(appPO.view({viewId: 'view.selection-provider-2'}));
      const selectionListenerPage = new SelectionPagePO(appPO.view({viewId: 'view.selection-listener'}));

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

      // TODO activate view 1 again
    });

    test('should remove undefined selection entries', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.left')
        .addPart('part.right', {align: 'right'})
        .addView('view.selection-provider', {partId: 'part.left', activateView: true})
        .addView('view.selection-listener', {partId: 'part.right', activateView: true})
        .navigateView('view.selection-provider', ['test-selection'])
        .navigateView('view.selection-listener', ['test-selection']),
      );

      const selectionProviderPage = new SelectionPagePO(appPO.view({viewId: 'view.selection-provider'}));
      const selectionListenerPage = new SelectionPagePO(appPO.view({viewId: 'view.selection-listener'}));

      // Subscribe to selection
      await selectionListenerPage.subscribe();

      // Set selection
      await selectionProviderPage.setSelection({
        testee1: ['A1'],
      });

      // Expect selection to be set
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

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.left')
        .addPart('part.right', {align: 'right'})
        .addView('view.selection-provider', {partId: 'part.left', activateView: true})
        .addView('view.selection-listener', {partId: 'part.right', activateView: true})
        .navigateView('view.selection-provider', ['test-selection'])
        .navigateView('view.selection-listener', ['test-selection']),
      );

      const selectionProviderPage = new SelectionPagePO(appPO.view({viewId: 'view.selection-provider'}));
      const selectionListenerPage = new SelectionPagePO(appPO.view({viewId: 'view.selection-listener'}));

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

    // TODO probably revert this change. maybe put a source property on selection so this could be filtered by the consumer?
    test('should not receive own selection', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const selectionPage = await workbenchNavigator.openInNewTab(SelectionPagePO);

      // Subscribe to selection
      await selectionPage.subscribe();

      // Set selection
      await selectionPage.setSelection({
        testee: ['A', 'B'],
      });

      // Expect not to receive own selection
      await expect.poll(() => selectionPage.getSelection()).toEqual({});
    });
  });

  test.describe('view', () => {

    test('should publish selection', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.left')
        .addPart('part.right', {align: 'right'})
        .addView('view.selection-provider', {partId: 'part.left', activateView: true})
        .addView('view.selection-listener', {partId: 'part.right', activateView: true})
        .navigateView('view.selection-provider', ['test-selection'])
        .navigateView('view.selection-listener', ['test-selection']),
      );

      const selectionProviderPage = new SelectionPagePO(appPO.view({viewId: 'view.selection-provider'}));
      const selectionListenerPage = new SelectionPagePO(appPO.view({viewId: 'view.selection-listener'}));

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

      // Set selection
      await selectionProviderPage.setSelection({
        testee: ['C', 'D'],
      });

      // Expect selection to be set
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
        testee: ['C', 'D'],
      });
    });

    test('should publish selection of focused view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.left')
        .addPart('part.middle', {relativeTo: 'part.left', align: 'right'})
        .addPart('part.right', {relativeTo: 'part.middle', align: 'right'})
        .addView('view.selection-provider-1', {partId: 'part.left', activateView: true})
        .addView('view.selection-provider-2', {partId: 'part.middle', activateView: true})
        .addView('view.selection-listener', {partId: 'part.right', activateView: true})
        .navigateView('view.selection-provider-1', ['test-selection'])
        .navigateView('view.selection-provider-2', ['test-selection'])
        .navigateView('view.selection-listener', ['test-selection']),
      );

      const selectionProviderPage1 = new SelectionPagePO(appPO.view({viewId: 'view.selection-provider-1'}));
      const selectionProviderPage2 = new SelectionPagePO(appPO.view({viewId: 'view.selection-provider-2'}));
      const selectionListenerPage = new SelectionPagePO(appPO.view({viewId: 'view.selection-listener'}));

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

    test('should not publish selection of non-focused view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.left')
        .addPart('part.middle', {relativeTo: 'part.left', align: 'right'})
        .addPart('part.right', {relativeTo: 'part.middle', align: 'right'})
        .addView('view.selection-provider-1', {partId: 'part.left', activateView: true})
        .addView('view.selection-provider-2', {partId: 'part.middle', activateView: true})
        .addView('view.selection-listener', {partId: 'part.right', activateView: true})
        .navigateView('view.selection-provider-1', ['test-selection'])
        .navigateView('view.selection-provider-2', ['test-selection'])
        .navigateView('view.selection-listener', ['test-selection']),
      );

      const selectionProviderPage1 = new SelectionPagePO(appPO.view({viewId: 'view.selection-provider-1'}));
      const selectionProviderPage2 = new SelectionPagePO(appPO.view({viewId: 'view.selection-provider-2'}));
      const selectionListenerPage = new SelectionPagePO(appPO.view({viewId: 'view.selection-listener'}));

      // Subscribe to selection.
      await selectionListenerPage.subscribe();

      // Enter selection in page 1 (do not publish).
      await selectionProviderPage1.selectionProvider.enterSelection({
        testee: ['A'],
      });
      // Focus another view.
      await selectionProviderPage2.view.tab.click();
      // Publish selection of non-focused view.
      await selectionProviderPage1.selectionProvider.publishSelection({programmatic: true});

      // Expect selection not to be published.
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({});

      // Activate selection provider page.
      await selectionProviderPage1.view.tab.click();

      // Expect selection to be published.
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
        testee: ['A'],
      });
    });

    test('should remove selection if last provider of type when navigating view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.left')
        .addPart('part.right', {align: 'right'})
        .addPart('part.bottom', {align: 'bottom'})
        .addView('view.selection-provider', {partId: 'part.left', activateView: true})
        .addView('view.selection-listener', {partId: 'part.right', activateView: true})
        .addView('view.router', {partId: 'part.bottom', activateView: true})
        .navigateView('view.selection-provider', ['test-selection'])
        .navigateView('view.selection-listener', ['test-selection'])
        .navigateView('view.router', ['test-router']),
      );

      const selectionProviderPage = new SelectionPagePO(appPO.view({viewId: 'view.selection-provider'}));
      const selectionListenerPage = new SelectionPagePO(appPO.view({viewId: 'view.selection-listener'}));
      const routerPage = new RouterPagePO(appPO, {viewId: 'view.router'});

      // Subscribe to selection.
      await selectionListenerPage.subscribe();

      // Set selection.
      await selectionProviderPage.setSelection({
        testee: ['A'],
      });

      // Expect selection to be set.
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
        testee: ['A'],
      });

      // Navigate in selection provider page.
      await routerPage.navigate(['test-view'], {
        target: 'view.selection-provider',
      });

      // Expect selection 'testee' to be removed (no more providers).
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({});
    });

    test('should retain selection if NOT last provider of type when navigating view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.left-top')
        .addPart('part.left-bottom', {relativeTo: 'part.left-top', align: 'bottom'})
        .addPart('part.right', {align: 'right'})
        .addPart('part.bottom', {align: 'bottom'})
        .addView('view.selection-provider-1', {partId: 'part.left-top', activateView: true})
        .addView('view.selection-provider-2', {partId: 'part.left-bottom', activateView: true})
        .addView('view.selection-listener', {partId: 'part.right', activateView: true})
        .addView('view.router', {partId: 'part.bottom', activateView: true})
        .navigateView('view.selection-provider-1', ['test-selection'])
        .navigateView('view.selection-provider-2', ['test-selection'])
        .navigateView('view.selection-listener', ['test-selection'])
        .navigateView('view.router', ['test-router']),
      );

      const selectionProviderPage1 = new SelectionPagePO(appPO.view({viewId: 'view.selection-provider-1'}));
      const selectionProviderPage2 = new SelectionPagePO(appPO.view({viewId: 'view.selection-provider-2'}));
      const selectionListenerPage = new SelectionPagePO(appPO.view({viewId: 'view.selection-listener'}));
      const routerPage = new RouterPagePO(appPO, {viewId: 'view.router'});

      // Subscribe to selection
      await selectionListenerPage.subscribe();

      // Set selection in page 1
      await selectionProviderPage1.setSelection({
        testee: ['A1'],
      });

      // Expect selection to be set
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
        testee: ['A1'],
      });

      // Set selection in page 2
      await selectionProviderPage2.setSelection({
        testee: ['A2'],
      });

      // Expect selection to be set
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
        testee: ['A2'],
      });

      // Navigate in selection page 1
      await routerPage.navigate(['test-view'], {
        target: 'view.selection-provider-2',
      });

      // Expect selection to be retained
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

    test('should remove selection if last provider of type when closing view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.left')
        .addPart('part.right', {align: 'right'})
        .addView('view.selection-provider', {partId: 'part.left', activateView: true})
        .addView('view.selection-listener', {partId: 'part.right', activateView: true})
        .navigateView('view.selection-provider', ['test-selection'])
        .navigateView('view.selection-listener', ['test-selection']),
      );

      const selectionProviderPage = new SelectionPagePO(appPO.view({viewId: 'view.selection-provider'}));
      const selectionListenerPage = new SelectionPagePO(appPO.view({viewId: 'view.selection-listener'}));

      // Subscribe to selection
      await selectionListenerPage.subscribe();

      // Set selection in page 1
      await selectionProviderPage.setSelection({
        testee: ['A'],
      });

      // Expect selection to be set
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
        testee: ['A'],
      });

      // Close selection provider view
      await selectionProviderPage.view.tab.close({programmatic: true});

      // Expect selection 'testee' to be removed (no more providers).
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({});
    });

    test('should retain selection if NOT last provider of type when closing view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.left-top')
        .addPart('part.left-bottom', {relativeTo: 'part.left-top', align: 'bottom'})
        .addPart('part.right', {align: 'right'})
        .addPart('part.bottom', {align: 'bottom'})
        .addView('view.selection-provider-1', {partId: 'part.left-top', activateView: true})
        .addView('view.selection-provider-2', {partId: 'part.left-bottom', activateView: true})
        .addView('view.selection-listener', {partId: 'part.right', activateView: true})
        .navigateView('view.selection-provider-1', ['test-selection'])
        .navigateView('view.selection-provider-2', ['test-selection'])
        .navigateView('view.selection-listener', ['test-selection']),
      );

      const selectionProviderPage1 = new SelectionPagePO(appPO.view({viewId: 'view.selection-provider-1'}));
      const selectionProviderPage2 = new SelectionPagePO(appPO.view({viewId: 'view.selection-provider-2'}));
      const selectionListenerPage = new SelectionPagePO(appPO.view({viewId: 'view.selection-listener'}));

      // Subscribe to selection
      await selectionListenerPage.subscribe();

      // Set selection in page 1
      await selectionProviderPage1.setSelection({
        testee: ['A1'],
      });

      // Expect selection to be set
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
        testee: ['A1'],
      });

      // Set selection in page 2
      await selectionProviderPage2.setSelection({
        testee: ['A2'],
      });

      // Expect selection to be set
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
        testee: ['A2'],
      });

      // Close selection provider page.
      await selectionProviderPage2.view.tab.close({programmatic: true});

      // Expect selection to be retained
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

    test('should retain selection when moving view to another part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.left')
        .addPart('part.right', {align: 'right'})
        .addPart('part.bottom', {align: 'bottom'})
        .addView('view.selection-provider', {partId: 'part.left', activateView: true})
        .addView('view.selection-listener', {partId: 'part.right', activateView: true})
        .navigateView('view.selection-provider', ['test-selection'])
        .navigateView('view.selection-listener', ['test-selection']),
      );

      const selectionProviderPage = new SelectionPagePO(appPO.view({viewId: 'view.selection-provider'}));
      const selectionListenerPage = new SelectionPagePO(appPO.view({viewId: 'view.selection-listener'}));

      // Subscribe to selection
      await selectionListenerPage.subscribe();

      // Set selection
      await selectionProviderPage.setSelection({
        testee: ['A'],
      });

      // Expect selection to be set
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
        testee: ['A'],
      });

      // Move selection provider page to bottom part
      await selectionProviderPage.view.tab.moveTo('part.bottom');

      // Expect selection to be retained
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
        testee: ['A'],
      });
    });
  });

  test.describe('part', () => {

    test('should publish selection', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.selection-provider')
        .addPart('part.selection-listener', {align: 'right'})
        .navigatePart('part.selection-provider', ['test-selection'])
        .navigatePart('part.selection-listener', ['test-selection']),
      );

      const selectionProviderPage = new SelectionPagePO(appPO.part({partId: 'part.selection-provider'}));
      const selectionListenerPage = new SelectionPagePO(appPO.part({partId: 'part.selection-listener'}));

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

      // Set selection
      await selectionProviderPage.setSelection({
        testee: ['C', 'D'],
      });

      // Expect selection to be set
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
        testee: ['C', 'D'],
      });
    });

    test('should publish selection of focused part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.selection-provider-1')
        .addPart('part.selection-provider-2', {relativeTo: 'part.selection-provider-1', align: 'right'})
        .addPart('part.selection-listener', {relativeTo: 'part.selection-provider-2', align: 'right'})
        .navigatePart('part.selection-provider-1', ['test-selection'])
        .navigatePart('part.selection-provider-2', ['test-selection'])
        .navigatePart('part.selection-listener', ['test-selection']),
      );

      const selectionProviderPage1 = new SelectionPagePO(appPO.part({partId: 'part.selection-provider-1'}));
      const selectionProviderPage2 = new SelectionPagePO(appPO.part({partId: 'part.selection-provider-2'}));
      const selectionListenerPage = new SelectionPagePO(appPO.part({partId: 'part.selection-listener'}));

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
      await selectionProviderPage1.part.bar.locator.click();
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
        testee: ['A'],
      });

      // Activate selection page 2
      await selectionProviderPage2.part.bar.locator.click();
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
        testee: ['B'],
      });
    });

    test('should not publish selection of non-focused part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.selection-provider-1')
        .addPart('part.selection-provider-2', {relativeTo: 'part.selection-provider-1', align: 'right'})
        .addPart('part.selection-listener', {relativeTo: 'part.selection-provider-2', align: 'right'})
        .navigatePart('part.selection-provider-1', ['test-selection'])
        .navigatePart('part.selection-provider-2', ['test-selection'])
        .navigatePart('part.selection-listener', ['test-selection']),
      );

      const selectionProviderPage1 = new SelectionPagePO(appPO.part({partId: 'part.selection-provider-1'}));
      const selectionProviderPage2 = new SelectionPagePO(appPO.part({partId: 'part.selection-provider-2'}));
      const selectionListenerPage = new SelectionPagePO(appPO.part({partId: 'part.selection-listener'}));

      // Subscribe to selection.
      await selectionListenerPage.subscribe();

      // Enter selection in page 1 (do not publish).
      await selectionProviderPage1.selectionProvider.enterSelection({
        testee: ['A'],
      });
      // Focus another part.
      await selectionProviderPage2.part.bar.locator.click();
      // Publish selection of non-focused part.
      await selectionProviderPage1.selectionProvider.publishSelection({programmatic: true});

      // Expect selection not to be published.
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({});

      // Activate selection provider page.
      await selectionProviderPage1.part.bar.locator.click();

      // Expect selection to be published.
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
        testee: ['A'],
      });
    });

    test.fixme('should remove selection if last provider of type when navigating part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.selection-provider')
        .addPart('part.selection-listener', {align: 'right'})
        .addPart('part.test-layout', {align: 'bottom'})
        .navigatePart('part.selection-provider', ['test-selection'])
        .navigatePart('part.selection-listener', ['test-selection'])
        .navigatePart('part.test-layout', ['test-layout']),
      );

      const selectionProviderPage = new SelectionPagePO(appPO.part({partId: 'part.selection-provider'}));
      const selectionListenerPage = new SelectionPagePO(appPO.part({partId: 'part.selection-listener'}));
      const layoutPage = new LayoutPagePO(appPO.part({partId: 'part.test-layout'}));

      // Subscribe to selection.
      await selectionListenerPage.subscribe();

      // Set selection.
      await selectionProviderPage.setSelection({
        testee: ['A'],
      });

      // Expect selection to be set.
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
        testee: ['A'],
      });

      // Navigate in selection provider page.
      await layoutPage.modifyLayout(layout => layout.navigatePart('part.selection-provider', ['test-part']));

      // Expect selection 'testee' to be removed (no more providers).
      await expect.poll(() => selectionListenerPage.getSelection()).toEqual({});
    });

  });

  // test('should retain selection when maximizing and minimizing main area', async ({appPO, workbenchNavigator}) => {
  //   await appPO.navigateTo({microfrontendSupport: false});
  //
  //   await workbenchNavigator.createPerspective(factory => factory
  //     .addPart(MAIN_AREA)
  //     .addPart('left', {align: 'left'})
  //     .addView('selection-provider', {partId: 'left', activateView: true, cssClass: 'selection-provider'})
  //     .navigateView('selection-provider', ['test-selection']),
  //   );
  //
  //   const selectionProviderPage = new SelectionPagePO(appPO, {cssClass: 'selection-provider'});
  //   const selectionListenerPage = await workbenchNavigator.openInNewTab(SelectionPagePO);
  //
  //   // Subscribe to selection
  //   await selectionListenerPage.subscribe();
  //
  //   // Set selection
  //   await selectionProviderPage.setSelection({
  //     testee: ['A'],
  //   });
  //
  //   // Expect selection to be set
  //   await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
  //     testee: ['A'],
  //   });
  //
  //   // Maximize the main area
  //   await selectionListenerPage.view.tab.dblclick();
  //
  //   // Expect selection to be retained
  //   await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
  //     testee: ['A'],
  //   });
  //
  //   // Minimize the main area
  //   await selectionListenerPage.view.tab.dblclick();
  //
  //   // Expect selection to be retained
  //   await expect.poll(() => selectionListenerPage.getSelection()).toEqual({
  //     testee: ['A'],
  //   });
  // });

});
