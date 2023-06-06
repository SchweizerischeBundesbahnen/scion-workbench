/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {RouterPagePO} from './page-object/router-page.po';
import {ViewPagePO} from './page-object/view-page.po';

test.describe('Workbench View', () => {

  test('should allow updating the view tab title', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const viewPagePO = await workbenchNavigator.openInNewTab(ViewPagePO);

    await viewPagePO.enterTitle('TITLE');
    await expect(await viewPagePO.viewTabPO.getTitle()).toEqual('TITLE');

    await viewPagePO.enterTitle('title');
    await expect(await viewPagePO.viewTabPO.getTitle()).toEqual('title');
  });

  test('should allow updating the view tab heading', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const viewPagePO = await workbenchNavigator.openInNewTab(ViewPagePO);

    await viewPagePO.enterHeading('HEADING');
    await expect(await viewPagePO.viewTabPO.getHeading()).toEqual('HEADING');

    await viewPagePO.enterHeading('heading');
    await expect(await viewPagePO.viewTabPO.getHeading()).toEqual('heading');
  });

  test('should allow to mark the view dirty', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const viewPagePO = await workbenchNavigator.openInNewTab(ViewPagePO);

    // View tab expected to be pristine for new views
    await expect(await viewPagePO.viewTabPO.isDirty()).toBe(false);

    // Mark the view dirty
    await viewPagePO.checkDirty(true);
    await expect(await viewPagePO.viewTabPO.isDirty()).toBe(true);

    // Mark the view pristine
    await viewPagePO.checkDirty(false);
    await expect(await viewPagePO.viewTabPO.isDirty()).toBe(false);
  });

  test('should unset the dirty state when navigating to a different route', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    const viewPagePO = await workbenchNavigator.openInNewTab(ViewPagePO);
    const viewTabPO = viewPagePO.viewTabPO;
    const viewId = await viewTabPO.getViewId();

    // Mark the view dirty
    await viewPagePO.checkDirty(true);
    await expect(await viewTabPO.isDirty()).toBe(true);

    // Navigate to a different route in the same view
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-router');
    await routerPagePO.enterTarget(viewId);
    await routerPagePO.clickNavigate();

    // Expect the view to be pristine
    await expect(await viewTabPO.isDirty()).toBe(false);
  });

  test('should not unset the dirty state when the navigation resolves to the same route, e.g., when updating matrix params or route params', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    const viewPagePO = await workbenchNavigator.openInNewTab(ViewPagePO);
    const viewTabPO = viewPagePO.viewTabPO;
    const viewId = await viewTabPO.getViewId();

    // Mark the view dirty
    await viewPagePO.checkDirty(true);
    await expect(await viewTabPO.isDirty()).toBe(true);

    // Update matrix params (does not affect routing)
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterTarget(viewId);
    await routerPagePO.enterMatrixParams({matrixParam: 'value'});
    await routerPagePO.clickNavigate();

    // Expect the view to still be dirty
    await expect(await viewTabPO.isDirty()).toBe(true);

    // Verify matrix params have changed
    await viewTabPO.click();
    await expect(await viewPagePO.getRouteParams()).toEqual({matrixParam: 'value'});
  });

  test('should not unset the title when the navigation resolves to the same route, e.g., when updating matrix params or route params', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    const viewPagePO = await workbenchNavigator.openInNewTab(ViewPagePO);
    const viewTabPO = viewPagePO.viewTabPO;
    const viewId = await viewTabPO.getViewId();

    // Set the title
    await viewPagePO.enterTitle('TITLE');
    await expect(await viewTabPO.getTitle()).toEqual('TITLE');

    // Update matrix params (does not affect routing)
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterTarget(viewId);
    await routerPagePO.enterMatrixParams({matrixParam: 'value'});
    await routerPagePO.clickNavigate();

    // Expect the title has not changed
    await expect(await viewTabPO.getTitle()).toEqual('TITLE');
    // Verify matrix params have changed
    await viewTabPO.click();
    await expect(await viewPagePO.getRouteParams()).toEqual({matrixParam: 'value'});
  });

  test('should not unset the heading when the navigation resolves to the same route, e.g., when updating matrix params or route params', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPagePO = await workbenchNavigator.openInNewTab(RouterPagePO);
    const viewPagePO = await workbenchNavigator.openInNewTab(ViewPagePO);
    const viewTabPO = viewPagePO.viewTabPO;
    const viewId = await viewTabPO.getViewId();

    // Set the heading
    await viewPagePO.enterHeading('HEADING');
    await expect(await viewTabPO.getHeading()).toEqual('HEADING');

    // Update matrix params (does not affect routing)
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterPath('test-view');
    await routerPagePO.enterTarget(viewId);
    await routerPagePO.enterMatrixParams({matrixParam: 'value'});
    await routerPagePO.clickNavigate();

    // Expect the heading has not changed
    await expect(await viewTabPO.getHeading()).toEqual('HEADING');

    // Verify matrix params have changed
    await viewTabPO.click();
    await expect(await viewPagePO.getRouteParams()).toEqual({matrixParam: 'value'});
  });

  test('should remove the closing handle from the view tab', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const viewPagePO = await workbenchNavigator.openInNewTab(ViewPagePO);

    // View tab expected to be pristine for new views
    await expect(await viewPagePO.viewTabPO.isClosable()).toBe(true);

    // Prevent the view from being closed
    await viewPagePO.checkClosable(false);
    await expect(await viewPagePO.viewTabPO.isClosable()).toBe(false);

    // Mark the view closable
    await viewPagePO.checkClosable(true);
    await expect(await viewPagePO.viewTabPO.isClosable()).toBe(true);
  });

  test('should emit when activating or deactivating a viewtab', async ({appPO, workbenchNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // navigate to testee-1 view
    const testee1ViewPagePO = await workbenchNavigator.openInNewTab(ViewPagePO);
    const testee1ComponentInstanceId = await testee1ViewPagePO.getComponentInstanceId();

    // assert emitted view active/deactivated events
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewActivate|ViewDeactivate/, consume: true})).toEqualIgnoreOrder([
      `[ViewActivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
    ]);

    // navigate to testee-2 view
    const testee2ViewPagePO = await workbenchNavigator.openInNewTab(ViewPagePO);
    const testee2ComponentInstanceId = await testee2ViewPagePO.getComponentInstanceId();

    // assert emitted view active/deactivated events
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewActivate|ViewDeactivate/, consume: true})).toEqualIgnoreOrder([
      `[ViewDeactivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
    ]);

    // activate testee-1 view
    await testee1ViewPagePO.viewTabPO.click();
    await testee1ViewPagePO.isPresent();

    // assert emitted view active/deactivated events
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewActivate|ViewDeactivate/, consume: true})).toEqualIgnoreOrder([
      `[ViewDeactivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
    ]);

    // activate testee-2 view
    await testee2ViewPagePO.viewTabPO.click();
    await testee2ViewPagePO.isPresent();

    // assert emitted view active/deactivated events
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewActivate|ViewDeactivate/, consume: true})).toEqualIgnoreOrder([
      `[ViewDeactivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
    ]);

    // navigate to testee-3 view
    const testee3ViewPagePO = await workbenchNavigator.openInNewTab(ViewPagePO);
    const testee3ComponentInstanceId = await testee3ViewPagePO.getComponentInstanceId();

    // assert emitted view active/deactivated events
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewActivate|ViewDeactivate/, consume: true})).toEqualIgnoreOrder([
      `[ViewDeactivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
    ]);

    // activate testee-1 view
    await testee1ViewPagePO.viewTabPO.click();
    await testee1ViewPagePO.isPresent();

    // assert emitted view active/deactivated events
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewActivate|ViewDeactivate/, consume: true})).toEqualIgnoreOrder([
      `[ViewDeactivate] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
    ]);
  });

  test('should allow to close the view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const viewPagePO = await workbenchNavigator.openInNewTab(ViewPagePO);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(1);
    await expect(await viewPagePO.viewTabPO.isPresent()).toBe(true);
    await expect(await viewPagePO.viewPO.isPresent()).toBe(true);

    await viewPagePO.clickClose();

    await expect(await appPO.activePart.getViewIds()).toHaveLength(0);
    await expect(await viewPagePO.viewTabPO.isPresent()).toBe(false);
    await expect(await viewPagePO.viewPO.isPresent()).toBe(false);
  });
});
