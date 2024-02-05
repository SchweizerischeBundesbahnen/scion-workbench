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
import {StartPagePO} from '../start-page.po';
import {RouterPagePO} from './page-object/router-page.po';
import {ViewPagePO} from './page-object/view-page.po';
import {expectView} from '../matcher/view-matcher';

test.describe('View Tabbar', () => {

  test('should activate the most recent view when closing a view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    // open view-1
    await routerPage.enterPath('test-view');
    await routerPage.enterCssClass('testee-1');
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    const testee1ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-1'});

    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(2);

    // open view-2
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterCssClass('testee-2');
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    const testee2ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-2'});

    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(3);

    // open view-3
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterCssClass('testee-3');
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    const testee3ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-3'});

    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeInactive();
    await expectView(testee3ViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(4);

    // activate view-2
    await appPO.view({cssClass: 'testee-2'}).tab.click();
    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeActive();
    await expectView(testee3ViewPage).toBeInactive();

    // activate view-1
    await appPO.view({cssClass: 'testee-1'}).tab.click();
    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeActive();
    await expectView(testee2ViewPage).toBeInactive();
    await expectView(testee3ViewPage).toBeInactive();

    // activate view-3
    await appPO.view({cssClass: 'testee-3'}).tab.click();
    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeInactive();
    await expectView(testee3ViewPage).toBeActive();

    // close view-3
    await appPO.view({cssClass: 'testee-3'}).tab.close();
    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeActive();
    await expectView(testee2ViewPage).toBeInactive();
    await expectView(testee3ViewPage).not.toBeAttached();

    // close view-1
    await appPO.view({cssClass: 'testee-1'}).tab.close();
    await expectView(routerPage).toBeInactive();
    await expectView(testee3ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).toBeActive();
    await expectView(testee3ViewPage).not.toBeAttached();
  });

  test('should insert a new view tab into the tabbar after the active view tab by default', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    // open view.2
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.2'});

    await expectView(routerPage).toBeInactive();
    await expectView(testee2ViewPage).toBeActive();
    await expect.poll(() => appPO.activePart({inMainArea: true}).getViewIds()).toEqual(['view.1', 'view.2']);

    // open view.3
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    const testee3ViewPage = new ViewPagePO(appPO, {viewId: 'view.3'});

    await expectView(routerPage).toBeInactive();
    await expectView(testee2ViewPage).toBeInactive();
    await expectView(testee3ViewPage).toBeActive();
    await expect.poll(() => appPO.activePart({inMainArea: true}).getViewIds()).toEqual(['view.1', 'view.3', 'view.2']);

    // open view.4
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    const testee4ViewPage = new ViewPagePO(appPO, {viewId: 'view.4'});

    await expectView(routerPage).toBeInactive();
    await expectView(testee2ViewPage).toBeInactive();
    await expectView(testee3ViewPage).toBeInactive();
    await expectView(testee4ViewPage).toBeActive();
    await expect.poll(() => appPO.activePart({inMainArea: true}).getViewIds()).toEqual(['view.1', 'view.4', 'view.3', 'view.2']);
  });

  test('should insert a new view tab into the tabbar at the end', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    // open view.2
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('blank');
    await routerPage.enterInsertionIndex('end');
    await routerPage.clickNavigate();

    const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.2'});

    await expectView(routerPage).toBeInactive();
    await expectView(testee2ViewPage).toBeActive();
    await expect.poll(() => appPO.activePart({inMainArea: true}).getViewIds()).toEqual(['view.1', 'view.2']);

    // open view.3
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('blank');
    await routerPage.enterInsertionIndex('end');
    await routerPage.clickNavigate();

    const testee3ViewPage = new ViewPagePO(appPO, {viewId: 'view.3'});

    await expectView(routerPage).toBeInactive();
    await expectView(testee2ViewPage).toBeInactive();
    await expectView(testee3ViewPage).toBeActive();
    await expect.poll(() => appPO.activePart({inMainArea: true}).getViewIds()).toEqual(['view.1', 'view.2', 'view.3']);

    // open view.4
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('blank');
    await routerPage.enterInsertionIndex('end');
    await routerPage.clickNavigate();

    const testee4ViewPage = new ViewPagePO(appPO, {viewId: 'view.4'});

    await expectView(routerPage).toBeInactive();
    await expectView(testee2ViewPage).toBeInactive();
    await expectView(testee3ViewPage).toBeInactive();
    await expectView(testee4ViewPage).toBeActive();
    await expect.poll(() => appPO.activePart({inMainArea: true}).getViewIds()).toEqual(['view.1', 'view.2', 'view.3', 'view.4']);
  });

  test('should insert a new view tab into the tabbar at the start', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    // open view.2
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('blank');
    await routerPage.enterInsertionIndex('start');
    await routerPage.clickNavigate();

    const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.2'});

    await expectView(routerPage).toBeInactive();
    await expectView(testee2ViewPage).toBeActive();
    await expect.poll(() => appPO.activePart({inMainArea: true}).getViewIds()).toEqual(['view.2', 'view.1']);

    // open view.3
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('blank');
    await routerPage.enterInsertionIndex('start');
    await routerPage.clickNavigate();

    const testee3ViewPage = new ViewPagePO(appPO, {viewId: 'view.3'});

    await expectView(routerPage).toBeInactive();
    await expectView(testee2ViewPage).toBeInactive();
    await expectView(testee3ViewPage).toBeActive();
    await expect.poll(() => appPO.activePart({inMainArea: true}).getViewIds()).toEqual(['view.3', 'view.2', 'view.1']);

    // open view.4
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('blank');
    await routerPage.enterInsertionIndex('start');
    await routerPage.clickNavigate();

    const testee4ViewPage = new ViewPagePO(appPO, {viewId: 'view.4'});

    await expectView(routerPage).toBeInactive();
    await expectView(testee2ViewPage).toBeInactive();
    await expectView(testee3ViewPage).toBeInactive();
    await expectView(testee4ViewPage).toBeActive();
    await expect.poll(() => appPO.activePart({inMainArea: true}).getViewIds()).toEqual(['view.4', 'view.3', 'view.2', 'view.1']);
  });

  test('should insert a new view tab into the tabbar at a custom position', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    // open view.2
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('blank');
    await routerPage.enterInsertionIndex(1);
    await routerPage.clickNavigate();

    const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.2'});

    await expectView(routerPage).toBeInactive();
    await expectView(testee2ViewPage).toBeActive();
    await expect.poll(() => appPO.activePart({inMainArea: true}).getViewIds()).toEqual(['view.1', 'view.2']);

    // open view.3
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('blank');
    await routerPage.enterInsertionIndex(1);
    await routerPage.clickNavigate();

    const testee3ViewPage = new ViewPagePO(appPO, {viewId: 'view.3'});

    await expectView(routerPage).toBeInactive();
    await expectView(testee2ViewPage).toBeInactive();
    await expectView(testee3ViewPage).toBeActive();
    await expect.poll(() => appPO.activePart({inMainArea: true}).getViewIds()).toEqual(['view.1', 'view.3', 'view.2']);

    // open view.4
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('blank');
    await routerPage.enterInsertionIndex(1);
    await routerPage.clickNavigate();

    const testee4ViewPage = new ViewPagePO(appPO, {viewId: 'view.4'});

    await expectView(routerPage).toBeInactive();
    await expectView(testee2ViewPage).toBeInactive();
    await expectView(testee3ViewPage).toBeInactive();
    await expectView(testee4ViewPage).toBeActive();
    await expect.poll(() => appPO.activePart({inMainArea: true}).getViewIds()).toEqual(['view.1', 'view.4', 'view.3', 'view.2']);
  });

  test('should allow to have a sticky view tab', async ({appPO}) => {
    await appPO.navigateTo({microfrontendSupport: false, stickyStartViewTab: true});

    // expect the sticky view to be opened
    await expect(appPO.views()).toHaveCount(1);
    const stickyViewPage = new StartPagePO(appPO, {cssClass: 'e2e-start-page'});
    await expectView(stickyViewPage).toBeActive();

    // close the sticky view
    await stickyViewPage.view.tab.close();

    // expect the sticky view to be opened
    await expect(appPO.views()).toHaveCount(1);
    await expectView(stickyViewPage).toBeActive();
  });
});
