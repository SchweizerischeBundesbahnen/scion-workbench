/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { AppPO } from './page-object/app.po';
import { ViewNavigationPO } from './page-object/view-navigation.po';
import { browser } from 'protractor';

describe('Workbench Router', () => {

  const appPO = new AppPO();
  const viewNavigationPO = new ViewNavigationPO();

  it('should match matrix params when resolving views for activation or closing', async () => {
    await viewNavigationPO.navigateTo();
    await expect(appPO.getViewTabCount()).toEqual(1);

    // open view-1
    await viewNavigationPO.enterPath('view');
    await viewNavigationPO.enterMatrixParams({viewCssClass: 'e2e-view-1', viewTitle: 'view-1'});
    await viewNavigationPO.checkActivateIfPresent(true);
    await viewNavigationPO.selectTarget('blank');
    await viewNavigationPO.navigate();

    await expect(appPO.findViewTab('e2e-view-1').isActive()).toBeTruthy();
    await expect(appPO.getViewTabCount()).toEqual(2);

    // open view-2
    await viewNavigationPO.activateViewTab();
    await viewNavigationPO.enterPath('view');
    await viewNavigationPO.enterMatrixParams({viewCssClass: 'e2e-view-2', viewTitle: 'view-2'});
    await viewNavigationPO.checkActivateIfPresent(true);
    await viewNavigationPO.selectTarget('blank');
    await viewNavigationPO.navigate();

    await expect(appPO.findViewTab('e2e-view-2').isActive()).toBeTruthy();
    await expect(appPO.getViewTabCount()).toEqual(3);

    // open view-3
    await viewNavigationPO.activateViewTab();
    await viewNavigationPO.enterPath('view');
    await viewNavigationPO.enterMatrixParams({viewCssClass: 'e2e-view-3', viewTitle: 'view-3'});
    await viewNavigationPO.checkActivateIfPresent(true);
    await viewNavigationPO.selectTarget('blank');
    await viewNavigationPO.navigate();

    await expect(appPO.findViewTab('e2e-view-3').isActive()).toBeTruthy();
    await expect(appPO.getViewTabCount()).toEqual(4);

    // activate view-1
    await viewNavigationPO.activateViewTab();
    await viewNavigationPO.enterPath('view');
    await viewNavigationPO.enterMatrixParams({viewCssClass: 'e2e-view-1', viewTitle: 'view-1'});
    await viewNavigationPO.checkActivateIfPresent(true);
    await viewNavigationPO.navigate();

    await expect(appPO.findViewTab('e2e-view-1').isActive()).toBeTruthy();
    await expect(appPO.getViewTabCount()).toEqual(4);

    // activate view-2
    await viewNavigationPO.activateViewTab();
    await viewNavigationPO.enterPath('view');
    await viewNavigationPO.enterMatrixParams({viewCssClass: 'e2e-view-2', viewTitle: 'view-2'});
    await viewNavigationPO.checkActivateIfPresent(true);
    await viewNavigationPO.navigate();

    await expect(appPO.findViewTab('e2e-view-2').isActive()).toBeTruthy();
    await expect(appPO.getViewTabCount()).toEqual(4);

    // activate view-3
    await viewNavigationPO.activateViewTab();
    await viewNavigationPO.enterPath('view');
    await viewNavigationPO.enterMatrixParams({viewCssClass: 'e2e-view-3', viewTitle: 'view-3'});
    await viewNavigationPO.checkActivateIfPresent(true);
    await viewNavigationPO.navigate();

    await expect(appPO.findViewTab('e2e-view-3').isActive()).toBeTruthy();
    await expect(appPO.getViewTabCount()).toEqual(4);

    // close view-1
    await viewNavigationPO.activateViewTab();
    await viewNavigationPO.enterPath('view');
    await viewNavigationPO.enterMatrixParams({viewCssClass: 'e2e-view-1', viewTitle: 'view-1'});
    await viewNavigationPO.checkCloseIfPresent(true);
    await viewNavigationPO.navigate();

    await expect(viewNavigationPO.isActiveViewTab).toBeTruthy();
    await expect(appPO.getViewTabCount()).toEqual(3);

    // close view-2
    await viewNavigationPO.activateViewTab();
    await viewNavigationPO.enterPath('view');
    await viewNavigationPO.enterMatrixParams({viewCssClass: 'e2e-view-2', viewTitle: 'view-2'});
    await viewNavigationPO.checkCloseIfPresent(true);
    await viewNavigationPO.navigate();

    await expect(viewNavigationPO.isActiveViewTab).toBeTruthy();
    await expect(appPO.getViewTabCount()).toEqual(2);

    // close view-3
    await viewNavigationPO.activateViewTab();
    await viewNavigationPO.enterPath('view');
    await viewNavigationPO.enterMatrixParams({viewCssClass: 'e2e-view-3', viewTitle: 'view-3'});
    await viewNavigationPO.checkCloseIfPresent(true);
    await viewNavigationPO.navigate();

    await expect(viewNavigationPO.isActiveViewTab).toBeTruthy();
    await expect(appPO.getViewTabCount()).toEqual(1);
  });

  it('should show title of inactive views when reloading the application', async () => {
    await viewNavigationPO.navigateTo();

    // open view-1
    await viewNavigationPO.enterPath('view');
    await viewNavigationPO.enterMatrixParams({viewCssClass: 'e2e-view-1', viewTitle: 'view-1-title'});
    await viewNavigationPO.navigate();

    // open view-2
    await viewNavigationPO.activateViewTab();
    await viewNavigationPO.enterPath('view');
    await viewNavigationPO.enterMatrixParams({viewCssClass: 'e2e-view-2', viewTitle: 'view-2-title'});
    await viewNavigationPO.navigate();

    // reload the application
    await browser.refresh();

    await expect(appPO.findViewTab('e2e-view-1').isActive()).toBeFalsy();
    await expect(appPO.findViewTab('e2e-view-1').getTitle()).toEqual('view-1-title');

    await expect(appPO.findViewTab('e2e-view-2').isActive()).toBeTruthy();
    await expect(appPO.findViewTab('e2e-view-2').getTitle()).toEqual('view-2-title');

    await expect((await browser.manage().logs().get('browser')).length).toEqual(0);
  });

  it('should not throw outlet activation error when opening a new view tab once a view tab was closed', async () => {
    await browser.get('/');

    // open view tab
    await appPO.openNewViewTab();
    await expect(appPO.getViewTabCount('e2e-welcome-page')).toEqual(1);

    // close view tab
    await appPO.findViewTab('e2e-welcome-page').close();
    await expect(appPO.getViewTabCount('e2e-welcome-page')).toEqual(0);

    // open view tab
    await appPO.openNewViewTab();
    await expect(appPO.getViewTabCount('e2e-welcome-page')).toEqual(1);
    // expect no error to be thrown
    await expect(browser.manage().logs().get('browser')).toEqual([]);

    // open view tab
    await appPO.openNewViewTab();
    await expect(appPO.getViewTabCount('e2e-welcome-page')).toEqual(2);
    // expect no error to be thrown
    await expect(browser.manage().logs().get('browser')).toEqual([]);
  });

  it('should close all views in a row', async () => {
    await browser.get('/');

    // open multiple view tabs
    await appPO.openNewViewTab();
    await appPO.openNewViewTab();
    await appPO.openNewViewTab();
    await appPO.openNewViewTab();
    await appPO.openNewViewTab();
    await appPO.openNewViewTab();
    await appPO.openNewViewTab();
    await appPO.openNewViewTab();
    await appPO.openNewViewTab();

    // close all view tabs
    await appPO.closeAllViewTabs();

    await expect(appPO.getViewTabCount()).toEqual(0);

    // expect no error to be thrown
    await expect(browser.manage().logs().get('browser')).toEqual([]);
  });
});
