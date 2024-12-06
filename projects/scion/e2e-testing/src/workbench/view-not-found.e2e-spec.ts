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
import {expect} from '@playwright/test';
import {PageNotFoundPagePO} from './page-object/page-not-found-page.po';
import {expectView} from '../matcher/view-matcher';
import {BlankViewPagePO} from './page-object/blank-view-page.po';
import {MAIN_AREA} from '../workbench.model';
import {ConsoleLogs} from '../helper/console-logs';
import {ViewPagePO} from './page-object/view-page.po';

test.describe('Workbench Page Not Found', () => {

  test('should display blank page when adding a view but not navigating it', async ({appPO, workbenchNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Add view.101 in peripheral area
    // Add view.102 in main area
    await workbenchNavigator.modifyLayout((layout, activePartId) => layout
      .addPart('left', {align: 'left'})
      .addView('view.101', {partId: 'left', activateView: true})
      .addView('view.102', {partId: activePartId}),
    );

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

  test('should display "Not Found" page when navigating to an unknown path', async ({appPO, workbenchNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Add view.101 in peripheral area
    // Add view.102 in main area
    await workbenchNavigator.modifyLayout((layout, activePartId) => layout
      .addPart('left', {align: 'left'})
      .addView('view.101', {partId: 'left', activateView: true})
      .addView('view.102', {partId: activePartId})
      .navigateView('view.101', ['does/not/exist'])
      .navigateView('view.102', ['does/not/exist']),
    );

    const viewPage1 = new PageNotFoundPagePO(appPO, {viewId: 'view.101'});
    const viewPage2 = new PageNotFoundPagePO(appPO, {viewId: 'view.102'});

    await expectView(viewPage1).toBeActive();
    await expectView(viewPage2).toBeActive();

    // Reload the application and expect the "Not Found" page to still be displayed.
    await test.step('Reloading the application', async () => {
      await appPO.reload();
      await expectView(viewPage1).toBeActive();
      await expectView(viewPage2).toBeActive();
    });

    // Expect Angular router not to error.
    await expect.poll(() => consoleLogs.get({severity: 'error'})).toHaveLength(0);
  });

  test('should display "Not Found" page when navigating with a hint that matches no route', async ({appPO, workbenchNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Add view.101 in peripheral area
    // Add view.102 in main area
    await workbenchNavigator.modifyLayout((layout, activePartId) => layout
      .addPart('left', {align: 'left'})
      .addView('view.101', {partId: 'left', activateView: true})
      .addView('view.102', {partId: activePartId})
      .navigateView('view.101', [], {hint: 'does-not-match'})
      .navigateView('view.102', [], {hint: 'does-not-match'}),
    );

    const viewPage1 = new PageNotFoundPagePO(appPO, {viewId: 'view.101'});
    const viewPage2 = new PageNotFoundPagePO(appPO, {viewId: 'view.102'});

    await expectView(viewPage1).toBeActive();
    await expectView(viewPage2).toBeActive();

    // Reload the application and expect the "Not Found" page to still be displayed.
    await test.step('Reloading the application', async () => {
      await appPO.reload();
      await expectView(viewPage1).toBeActive();
      await expectView(viewPage2).toBeActive();
    });

    // Expect Angular router not to error.
    await expect.poll(() => consoleLogs.get({severity: 'error'})).toHaveLength(0);
  });

  test('should drag "Not Found" page to another part', async ({appPO, workbenchNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const initialPartView = await workbenchNavigator.openInNewTab(ViewPagePO);
    const initialPartId = await initialPartView.view.part.getPartId();

    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('left', {align: 'left'})
      .addPart('right', {align: 'right'})
      .addView('view.101', {partId: 'left', activateView: true})
      .addView('view.102', {partId: 'right', activateView: true})
      .navigateView('view.101', ['does/not/exist']),
    );

    const viewPage = new PageNotFoundPagePO(appPO, {viewId: 'view.101'});

    // Drag view to right part.
    const dragHandle1 = await viewPage.view.tab.startDrag();
    await dragHandle1.dragToPart('right', {region: 'center'});
    await dragHandle1.drop();

    // Expect view to be moved to right part.
    await expectView(viewPage).toBeActive();
    await expect.poll(() => viewPage.view.part.getPartId()).toEqual('right');

    // Drag view to main area part
    const dragHandle2 = await viewPage.view.tab.startDrag();
    await dragHandle2.dragToPart(initialPartId, {region: 'center'});
    await dragHandle2.drop();
    await expectView(viewPage).toBeActive();
    await expect.poll(() => viewPage.view.part.getPartId()).toEqual(initialPartId);

    // Expect Angular router not to error.
    await expect.poll(() => consoleLogs.get({severity: 'error'})).toHaveLength(0);
  });

  test('should drag "Not Found" page to a new window', async ({appPO, workbenchNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.modifyLayout((layout, activePartId) => layout
      .addPart('left', {align: 'left'})
      .addPart('right', {align: 'right'})
      .addView('testee-1', {partId: 'left', activateView: true, cssClass: 'testee-1'})
      .addView('testee-2', {partId: activePartId, cssClass: 'testee-2'})
      .addView('testee-3', {partId: 'right', cssClass: 'testee-3'})
      .navigateView('testee-1', ['does/not/exist'])
      .navigateView('testee-2', ['does/not/exist'])
      .navigateView('testee-3', [], {hint: 'does-not-match'}),
    );

    const viewPage1 = new PageNotFoundPagePO(appPO, {cssClass: 'testee-1'});
    const viewPage2 = new PageNotFoundPagePO(appPO, {cssClass: 'testee-2'});
    const viewPage3 = new PageNotFoundPagePO(appPO, {cssClass: 'testee-3'});

    // Move testee-1 view to new window (into main area).
    const newAppPO = await viewPage1.view.tab.moveToNewWindow();

    // Expect testee-1 view to be moved to new window.
    const newWindowViewPage1 = new PageNotFoundPagePO(newAppPO, {cssClass: 'testee-1'});
    await expectView(newWindowViewPage1).toBeActive();

    // Move testee-2 view to existing window (into peripheral area).
    await viewPage2.view.tab.moveTo(MAIN_AREA, {region: 'west', workbenchId: await newAppPO.getWorkbenchId()});

    // Expect testee-2 view to be moved to existing window.
    const newWindowViewPage2 = new PageNotFoundPagePO(newAppPO, {cssClass: 'testee-2'});
    await expectView(newWindowViewPage2).toBeActive();

    // Move testee-3 view to existing window (into peripheral area).
    await viewPage3.view.tab.moveTo(MAIN_AREA, {region: 'east', workbenchId: await newAppPO.getWorkbenchId()});

    // Expect testee-3 view to be moved to existing window.
    const newWindowViewPage3 = new PageNotFoundPagePO(newAppPO, {cssClass: 'testee-3'});
    await expectView(newWindowViewPage3).toBeActive();

    // Expect Angular router not to error.
    await expect.poll(() => consoleLogs.get({severity: 'error'})).toHaveLength(0);
    await expect.poll(() => new ConsoleLogs(newAppPO.page).get({severity: 'error'})).toHaveLength(0);
  });
});
