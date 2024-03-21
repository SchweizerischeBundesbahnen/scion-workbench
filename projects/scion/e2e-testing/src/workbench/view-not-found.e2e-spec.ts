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
import {LayoutPagePO} from './page-object/layout-page/layout-page.po';
import {expect} from '@playwright/test';
import {ViewNotFoundPagePO} from './page-object/view-not-found-page.po';
import {expectView} from '../matcher/view-matcher';
import {BlankViewPagePO} from './page-object/blank-view-page.po';
import {MAIN_AREA} from '../workbench.model';

test.describe('Workbench View Not Found', () => {

  test('should display blank page when adding a view but not navigating it', async ({appPO, workbenchNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Add view.101 in peripheral area
    // Add view.102 in main area
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.addPart('left', {align: 'left'});
    await layoutPage.addView('view.101', {partId: 'left', activateView: true});
    await layoutPage.addView('view.102', {partId: await appPO.activePart({inMainArea: true}).getPartId()});
    await layoutPage.view.tab.close();

    const viewPage1 = new BlankViewPagePO(appPO, {viewId: 'view.101'});
    const viewPage2 = new BlankViewPagePO(appPO, {viewId: 'view.102'});

    await expectView(viewPage1).toBeActive();
    await expectView(viewPage2).toBeActive();

    // Reload the application and expect the blank page to still be displayed.
    await test.step('Reloading the application', async () => {
      await appPO.reload();
      await expectView(viewPage1).toBeActive();
      await expectView(viewPage2).toBeActive();
    });

    // Expect Angular router not to error.
    await expect.poll(() => consoleLogs.get({severity: 'error'})).toHaveLength(0);
  });

  test('should display "Not Found Page" when navigating to an unknown path', async ({appPO, workbenchNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Add view.101 in peripheral area
    // Add view.102 in main area
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.addPart('left', {align: 'left'});
    await layoutPage.addView('view.101', {partId: 'left', activateView: true});
    await layoutPage.addView('view.102', {partId: await appPO.activePart({inMainArea: true}).getPartId()});
    await layoutPage.navigateView('view.101', ['does/not/exist']);
    await layoutPage.navigateView('view.102', ['does/not/exist']);
    await layoutPage.view.tab.close();

    const viewPage1 = new ViewNotFoundPagePO(appPO, {viewId: 'view.101'});
    const viewPage2 = new ViewNotFoundPagePO(appPO, {viewId: 'view.102'});

    await expectView(viewPage1).toBeActive();
    await expectView(viewPage2).toBeActive();

    // Reload the application and expect the "Not Found Page" to still be displayed.
    await test.step('Reloading the application', async () => {
      await appPO.reload();
      await expectView(viewPage1).toBeActive();
      await expectView(viewPage2).toBeActive();
    });

    // Expect Angular router not to error.
    await expect.poll(() => consoleLogs.get({severity: 'error'})).toHaveLength(0);
  });

  test('should display "Not Found Page" when navigating to an unknown outlet', async ({appPO, workbenchNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Add view.101 in peripheral area
    // Add view.102 in main area
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.addPart('left', {align: 'left'});
    await layoutPage.addView('view.101', {partId: 'left', activateView: true});
    await layoutPage.addView('view.102', {partId: await appPO.activePart({inMainArea: true}).getPartId()});
    await layoutPage.navigateView('view.101', [], {outlet: 'does-not-exist'});
    await layoutPage.navigateView('view.102', [], {outlet: 'does-not-exist'});
    await layoutPage.view.tab.close();

    const viewPage1 = new ViewNotFoundPagePO(appPO, {viewId: 'view.101'});
    const viewPage2 = new ViewNotFoundPagePO(appPO, {viewId: 'view.102'});

    await expectView(viewPage1).toBeActive();
    await expectView(viewPage2).toBeActive();

    // Reload the application and expect the "Not Found Page" to still be displayed.
    await test.step('Reloading the application', async () => {
      await appPO.reload();
      await expectView(viewPage1).toBeActive();
      await expectView(viewPage2).toBeActive();
    });

    // Expect Angular router not to error.
    await expect.poll(() => consoleLogs.get({severity: 'error'})).toHaveLength(0);
  });

  test('should display "Not Found Page" when navigating to an unknown path and outlet', async ({appPO, workbenchNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Add view.101 in peripheral area
    // Add view.102 in main area
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.addPart('left', {align: 'left'});
    await layoutPage.addView('view.101', {partId: 'left', activateView: true});
    await layoutPage.addView('view.102', {partId: await appPO.activePart({inMainArea: true}).getPartId()});
    await layoutPage.navigateView('view.101', ['does/not/exist'], {outlet: 'does-not-exist'});
    await layoutPage.navigateView('view.102', ['does/not/exist'], {outlet: 'does-not-exist'});
    await layoutPage.view.tab.close();

    const viewPage1 = new ViewNotFoundPagePO(appPO, {viewId: 'view.101'});
    const viewPage2 = new ViewNotFoundPagePO(appPO, {viewId: 'view.102'});

    await expectView(viewPage1).toBeActive();
    await expectView(viewPage2).toBeActive();

    // Reload the application and expect the "Not Found Page" to still be displayed.
    await test.step('Reloading the application', async () => {
      await appPO.reload();
      await expectView(viewPage1).toBeActive();
      await expectView(viewPage2).toBeActive();
    });

    // Expect Angular router not to error.
    await expect.poll(() => consoleLogs.get({severity: 'error'})).toHaveLength(0);
  });

  test('should drag "Not Found Page" to another part', async ({appPO, workbenchNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.addPart('left', {align: 'left'});
    await layoutPage.addPart('right', {align: 'right'});
    await layoutPage.addView('view.101', {partId: 'left', activateView: true});
    await layoutPage.addView('view.102', {partId: 'right', activateView: true});
    await layoutPage.navigateView('view.101', ['does/not/exist']);

    const viewPage = new ViewNotFoundPagePO(appPO, {viewId: 'view.101'});

    // Drag view to right part.
    await viewPage.view.tab.dragTo({partId: 'right', region: 'center'});

    // Except view to be moved to right part.
    await expectView(viewPage).toBeActive();
    await expect.poll(() => viewPage.view.part.getPartId()).toEqual('right');

    // Drag view to main area part
    const mainAreaPartId = await layoutPage.view.part.getPartId();
    await viewPage.view.tab.dragTo({partId: mainAreaPartId, region: 'center'});
    await expectView(viewPage).toBeActive();
    await expect.poll(() => viewPage.view.part.getPartId()).toEqual(mainAreaPartId);

    // Expect Angular router not to error.
    await expect.poll(() => consoleLogs.get({severity: 'error'})).toHaveLength(0);
  });

  test('should drag "Not Found Page" to a new window', async ({appPO, workbenchNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.addPart('left', {align: 'left'});
    await layoutPage.addPart('right', {align: 'right'});
    await layoutPage.addView('testee-1', {partId: 'left', activateView: true});
    await layoutPage.addView('testee-2', {partId: await appPO.activePart({inMainArea: true}).getPartId()});
    await layoutPage.addView('testee-3', {partId: 'right'});
    await layoutPage.navigateView('testee-1', ['does/not/exist']);
    await layoutPage.navigateView('testee-2', ['does/not/exist']);
    await layoutPage.navigateView('testee-3', [], {outlet: 'does-not-exist'});

    const viewPage1 = new ViewNotFoundPagePO(appPO, {viewId: await appPO.resolveViewId('testee-1')});
    const viewPage2 = new ViewNotFoundPagePO(appPO, {viewId: await appPO.resolveViewId('testee-2')});
    const viewPage3 = new ViewNotFoundPagePO(appPO, {viewId: await appPO.resolveViewId('testee-3')});

    // Move testee-1 view to new window (into main area).
    const newAppPO = await viewPage1.view.tab.moveToNewWindow();

    // Expect testee-1 view to be moved to new window.
    const newWindowViewPage1 = new ViewNotFoundPagePO(newAppPO, {viewId: await newAppPO.resolveViewId('testee-1')});
    await expectView(newWindowViewPage1).toBeActive();

    // Move testee-2 view to existing window (into peripheral area).
    await viewPage2.view.tab.moveTo(MAIN_AREA, {region: 'west', workbenchId: await newAppPO.getWorkbenchId()});

    // Expect testee-2 view to be moved to existing window.
    const newWindowViewPage2 = new ViewNotFoundPagePO(newAppPO, {viewId: await newAppPO.resolveViewId('testee-2')});
    await expectView(newWindowViewPage2).toBeActive();

    // Move testee-3 view to existing window (into peripheral area).
    await viewPage3.view.tab.moveTo(MAIN_AREA, {region: 'east', workbenchId: await newAppPO.getWorkbenchId()});

    // Expect testee-2 view to be moved to existing window.
    const newWindowViewPage3 = new ViewNotFoundPagePO(newAppPO, {viewId: await newAppPO.resolveViewId('testee-3')});
    await expectView(newWindowViewPage3).toBeActive();

    // Expect Angular router not to error.
    await expect.poll(() => consoleLogs.get({severity: 'error'})).toHaveLength(0);
  });
});
