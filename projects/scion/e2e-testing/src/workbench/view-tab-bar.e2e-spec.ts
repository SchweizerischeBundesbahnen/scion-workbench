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
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';
import {waitForCondition} from '../helper/testing.util';

test.describe('View Tabbar', () => {

  test('should activate the most recent view when closing a view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    // open view-1
    await routerPage.navigate(['test-view'], {
      target: 'blank',
      cssClass: 'testee-1',
    });

    const testee1ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-1'});

    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(2);

    // open view-2
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view'], {
      target: 'blank',
      cssClass: 'testee-2',
    });

    const testee2ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-2'});

    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(3);

    // open view-3
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view'], {
      target: 'blank',
      cssClass: 'testee-3',
    });

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

  test('should open new view to the right of the active view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.left')
      .addPart('part.right', {align: 'right'})
      .addView('view.1', {partId: 'part.left'})
      .addView('view.2', {partId: 'part.left', activateView: true})
      .addView('view.3', {partId: 'part.left'})
      .addView('view.4', {partId: 'part.left'})
      .addView('view.5', {partId: 'part.right', activateView: true})
      .addView('view.6', {partId: 'part.right'})
      .navigateView('view.2', ['test-router']),
    );

    // Open view in the active part (left part).
    const routerPage = new RouterPagePO(appPO, {viewId: 'view.2'});
    await routerPage.navigate(['test-view'], {
      target: 'blank',
    });

    // Expect view.7 (new view) to be opened to the right of the active view.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MPart({
            id: 'part.left',
            views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.7'}, {id: 'view.3'}, {id: 'view.4'}],
            activeViewId: 'view.7',
          }),
          child2: new MPart({
            id: 'part.right',
            views: [{id: 'view.5'}, {id: 'view.6'}],
            activeViewId: 'view.5',
          }),
          direction: 'row',
          ratio: .5,
        }),
        activePartId: 'part.left',
      },
    });

    // Open view in the right part.
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view'], {
      target: 'blank',
      partId: 'part.right',
    });

    // Expect view.8 (new view) to be opened to the right of the active view.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MPart({
            id: 'part.left',
            views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.7'}, {id: 'view.3'}, {id: 'view.4'}],
            activeViewId: 'view.2',
          }),
          child2: new MPart({
            id: 'part.right',
            views: [{id: 'view.5'}, {id: 'view.8'}, {id: 'view.6'}],
            activeViewId: 'view.8',
          }),
          direction: 'row',
          ratio: .5,
        }),
        activePartId: 'part.right',
      },
    });
  });

  test('should open view moved via drag & drop after the active view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.left')
      .addPart('part.right', {align: 'right'}, {activate: true})
      .addView('view.1', {partId: 'part.left'})
      .addView('view.2', {partId: 'part.left'})
      .addView('view.3', {partId: 'part.left', activateView: true})
      .addView('view.4', {partId: 'part.left'})
      .addView('view.5', {partId: 'part.right', activateView: true})
      .addView('view.6', {partId: 'part.right'}),
    );

    // Move view.5 to the left part
    const view5 = appPO.view({viewId: 'view.5'});
    const dragHandle = await view5.tab.startDrag();
    await dragHandle.dragToPart('part.left', {region: 'center'});
    await dragHandle.drop();

    // Expect view.5 to be opened to the right of the active view.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MPart({
            id: 'part.left',
            views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.3'}, {id: 'view.5'}, {id: 'view.4'}],
            activeViewId: 'view.5',
          }),
          child2: new MPart({
            id: 'part.right',
            views: [{id: 'view.6'}],
            activeViewId: 'view.6',
          }),
          direction: 'row',
          ratio: .5,
        }),
        activePartId: 'part.left',
      },
    });
  });

  test('should activate the view to the left of the view that is dragged out of the tab bar', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.part')
      .addView('view.1', {partId: 'part.part'})
      .addView('view.2', {partId: 'part.part'})
      .addView('view.3', {partId: 'part.part'})
      .addView('view.4', {partId: 'part.part'}),
    );

    // Drag view.3 out of the tabbar.
    const view3 = appPO.view({viewId: 'view.3'});
    const dragHandle = await view3.tab.startDrag();
    await dragHandle.dragToPart('part.part', {region: 'center'});

    // Expect view.2 to be activated.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({
          id: 'part.part',
          views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.4'}],
          activeViewId: 'view.2',
        }),
        activePartId: 'part.part',
      },
    });
  });

  test('should not change the view order when dragging a view to its own part (noop)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.part')
      .addView('view.1', {partId: 'part.part'})
      .addView('view.2', {partId: 'part.part'})
      .addView('view.3', {partId: 'part.part'})
      .addView('view.4', {partId: 'part.part'}),
    );

    // Drag view.3 to its own part.
    const view3 = appPO.view({viewId: 'view.3'});
    const dragHandle = await view3.tab.startDrag();
    await dragHandle.dragToPart('part.part', {region: 'center'});
    await dragHandle.drop();

    // Expect tab order not to be changed.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({
          id: 'part.part',
          views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.3'}, {id: 'view.4'}],
          activeViewId: 'view.3',
        }),
        activePartId: 'part.part',
      },
    });
  });

  test('should cancel drag operation if pressing escape', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.part')
      .addView('view.1', {partId: 'part.part'})
      .addView('view.2', {partId: 'part.part'})
      .addView('view.3', {partId: 'part.part'})
      .addView('view.4', {partId: 'part.part'}),
    );

    // Drag view.3 out of the tabbar.
    const view3 = appPO.view({viewId: 'view.3'});
    const dragHandle = await view3.tab.startDrag();
    await dragHandle.dragToPart('part.part', {region: 'center'});

    // Cancel drag operation.
    await appPO.workbenchRoot.press('Escape');

    // Expect views not to be changed.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({
          id: 'part.part',
          views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.3'}, {id: 'view.4'}],
          activeViewId: 'view.3',
        }),
        activePartId: 'part.part',
      },
    });
  });

  test('should allow opening view at the end', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    // open view.2
    await routerPage.navigate(['test-view'], {
      target: 'blank',
      position: 'end',
    });

    const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.2'});

    await expectView(routerPage).toBeInactive();
    await expectView(testee2ViewPage).toBeActive();
    await expect.poll(() => appPO.activePart({inMainArea: true}).bar.viewTabBar.getViewIds()).toEqual(['view.1', 'view.2']);

    // open view.3
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view'], {
      target: 'blank',
      position: 'end',
    });

    const testee3ViewPage = new ViewPagePO(appPO, {viewId: 'view.3'});

    await expectView(routerPage).toBeInactive();
    await expectView(testee2ViewPage).toBeInactive();
    await expectView(testee3ViewPage).toBeActive();
    await expect.poll(() => appPO.activePart({inMainArea: true}).bar.viewTabBar.getViewIds()).toEqual(['view.1', 'view.2', 'view.3']);

    // open view.4
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view'], {
      target: 'blank',
      position: 'end',
    });

    const testee4ViewPage = new ViewPagePO(appPO, {viewId: 'view.4'});

    await expectView(routerPage).toBeInactive();
    await expectView(testee2ViewPage).toBeInactive();
    await expectView(testee3ViewPage).toBeInactive();
    await expectView(testee4ViewPage).toBeActive();
    await expect.poll(() => appPO.activePart({inMainArea: true}).bar.viewTabBar.getViewIds()).toEqual(['view.1', 'view.2', 'view.3', 'view.4']);
  });

  test('should allow opening view at the start', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    // open view.2
    await routerPage.navigate(['test-view'], {
      target: 'blank',
      position: 'start',
    });

    const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.2'});

    await expectView(routerPage).toBeInactive();
    await expectView(testee2ViewPage).toBeActive();
    await expect.poll(() => appPO.activePart({inMainArea: true}).bar.viewTabBar.getViewIds()).toEqual(['view.2', 'view.1']);

    // open view.3
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view'], {
      target: 'blank',
      position: 'start',
    });

    const testee3ViewPage = new ViewPagePO(appPO, {viewId: 'view.3'});

    await expectView(routerPage).toBeInactive();
    await expectView(testee2ViewPage).toBeInactive();
    await expectView(testee3ViewPage).toBeActive();
    await expect.poll(() => appPO.activePart({inMainArea: true}).bar.viewTabBar.getViewIds()).toEqual(['view.3', 'view.2', 'view.1']);

    // open view.4
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view'], {
      target: 'blank',
      position: 'start',
    });

    const testee4ViewPage = new ViewPagePO(appPO, {viewId: 'view.4'});

    await expectView(routerPage).toBeInactive();
    await expectView(testee2ViewPage).toBeInactive();
    await expectView(testee3ViewPage).toBeInactive();
    await expectView(testee4ViewPage).toBeActive();
    await expect.poll(() => appPO.activePart({inMainArea: true}).bar.viewTabBar.getViewIds()).toEqual(['view.4', 'view.3', 'view.2', 'view.1']);
  });

  test('should allow opening view at a specific position', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);

    // open view.2
    await routerPage.navigate(['test-view'], {
      target: 'blank',
      position: 1,
    });

    const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.2'});

    await expectView(routerPage).toBeInactive();
    await expectView(testee2ViewPage).toBeActive();
    await expect.poll(() => appPO.activePart({inMainArea: true}).bar.viewTabBar.getViewIds()).toEqual(['view.1', 'view.2']);

    // open view.3
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view'], {
      target: 'blank',
      position: 1,
    });

    const testee3ViewPage = new ViewPagePO(appPO, {viewId: 'view.3'});

    await expectView(routerPage).toBeInactive();
    await expectView(testee2ViewPage).toBeInactive();
    await expectView(testee3ViewPage).toBeActive();
    await expect.poll(() => appPO.activePart({inMainArea: true}).bar.viewTabBar.getViewIds()).toEqual(['view.1', 'view.3', 'view.2']);

    // open view.4
    await routerPage.view.tab.click();
    await routerPage.navigate(['test-view'], {
      target: 'blank',
      position: 1,
    });

    const testee4ViewPage = new ViewPagePO(appPO, {viewId: 'view.4'});

    await expectView(routerPage).toBeInactive();
    await expectView(testee2ViewPage).toBeInactive();
    await expectView(testee3ViewPage).toBeInactive();
    await expectView(testee4ViewPage).toBeActive();
    await expect.poll(() => appPO.activePart({inMainArea: true}).bar.viewTabBar.getViewIds()).toEqual(['view.1', 'view.4', 'view.3', 'view.2']);
  });

  test('should allow to have a sticky view tab', async ({appPO}) => {
    await appPO.navigateTo({microfrontendSupport: false, stickyViewTab: true});

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

  test.describe('Auto Scrolling of Active Tab', () => {

    test('should scroll the active tab into view when dragging it to the end of the viewport', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});
      await appPO.setDesignToken('--sci-workbench-tab-min-width', '5rem');

      await workbenchNavigator.createPerspective(layout => layout
        .addPart('part.left')
        .addPart('part.right', {align: 'right'})
        .addView('view.101', {partId: 'part.left', activateView: true})
        .addView('view.102', {partId: 'part.left'})
        .addView('view.103', {partId: 'part.left'})
        .addView('view.104', {partId: 'part.left'})
        .addView('view.105', {partId: 'part.left'})
        .addView('view.106', {partId: 'part.left'})
        .addView('view.107', {partId: 'part.left'})
        .addView('view.108', {partId: 'part.left'})
        .addView('view.109', {partId: 'part.left'})
        .addView('view.201', {partId: 'part.right'}),
      );
      const tab1 = appPO.view({viewId: 'view.101'}).tab;
      await tab1.setTitle('view.101');
      await tab1.setWidth('300px');

      const tab2 = appPO.view({viewId: 'view.102'}).tab;
      await tab2.setTitle('view.102');
      await tab2.setWidth('300px');

      const tab3 = appPO.view({viewId: 'view.103'}).tab;
      await tab3.setTitle('view.103');
      await tab3.setWidth('300px');

      const tab4 = appPO.view({viewId: 'view.104'}).tab;
      await tab4.setTitle('view.104');
      await tab4.setWidth('300px');

      const tab5 = appPO.view({viewId: 'view.105'}).tab;
      await tab5.setTitle('view.105');
      await tab5.setWidth('300px');

      const tab6 = appPO.view({viewId: 'view.106'}).tab;
      await tab6.setTitle('view.106');
      await tab6.setWidth('300px');

      const tab7 = appPO.view({viewId: 'view.107'}).tab;
      await tab7.setTitle('view.107');
      await tab7.setWidth('300px');

      const tab8 = appPO.view({viewId: 'view.108'}).tab;
      await tab8.setTitle('view.108');
      await tab8.setWidth('300px');

      const tab9 = appPO.view({viewId: 'view.109'}).tab;
      await tab9.setTitle('view.109');
      await tab9.setWidth('300px');

      const tabbar = appPO.part({partId: 'part.left'}).bar;
      const tabbarBoundingBox = await tabbar.viewTabBar.getBoundingBox();

      // Scroll tabbar to the start.
      await tabbar.viewTabBar.setViewportScrollLeft(0);

      // Expect tabbar to overflow (prerequisite).
      await expect.poll(() => tabbar.getHiddenTabCount()).toBeGreaterThan(0);

      // Expect first tab to be active and scrolled into view.
      await expect.poll(() => tab1.isActive()).toBe(true);
      await expect.poll(() => tab1.isScrolledIntoView()).toBe(true);

      // Drag tab to the end, scrolling the viewport.
      const dragHandle = await tab1.startDrag();

      // Keep scrolling until scrolled the last tab into view.
      // Since Playwright only triggers a single `dragover` event, we keep dragging to the same position with step count 1.
      await waitForCondition(async () => {
        await dragHandle.dragTo({x: tabbarBoundingBox.right - 1, y: tabbarBoundingBox.vcenter}, {steps: 1});
        return tab9.isScrolledIntoView();
      });

      // Perform drop.
      await dragHandle.drop();

      // Expect tab to be dropped at the end.
      await expect.poll(() => tabbar.viewTabBar.getViewIds({visible: true})).toEqual([
        'view.102',
        'view.103',
        'view.104',
        'view.105',
        'view.106',
        'view.107',
        'view.108',
        'view.109',
        'view.101',
      ]);

      // Expect tab to be fully scrolled into view.
      await expect.poll(() => tab1.isActive()).toBe(true);
      await expect.poll(() => tab1.isScrolledIntoView()).toBe(true);
    });

    test('should scroll the active tab into view when opening a new tab', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});
      await appPO.setDesignToken('--sci-workbench-tab-min-width', '5rem');

      // Add part with 10 views left to the main area.
      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.left', {align: 'left', ratio: .25})
        .addView('view.101', {partId: 'part.left', activateView: true})
        .addView('view.102', {partId: 'part.left'})
        .addView('view.103', {partId: 'part.left'})
        .addView('view.104', {partId: 'part.left'})
        .addView('view.105', {partId: 'part.left'})
        .addView('view.106', {partId: 'part.left'})
        .addView('view.107', {partId: 'part.left'})
        .addView('view.108', {partId: 'part.left'})
        .addView('view.109', {partId: 'part.left'})
        .addView('view.110', {partId: 'part.left'}),
      );

      // Expect tabbar to overflow (prerequisite).
      await expect.poll(() => appPO.part({partId: 'part.left'}).bar.getHiddenTabCount()).toBeGreaterThan(1);

      // Expect first tab to be active and scrolled into view.
      await expect.poll(() => appPO.view({viewId: 'view.101'}).tab.isActive()).toBe(true);
      await expect.poll(() => appPO.view({viewId: 'view.101'}).tab.isScrolledIntoView()).toBe(true);

      // Open new tab at the end.
      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate(['test-view'], {partId: 'part.left', target: 'view.999', position: 'end'});

      // Expect new tab to be active and scrolled into view.
      await expect.poll(() => appPO.view({viewId: 'view.999'}).tab.isActive()).toBe(true);
      await expect.poll(() => appPO.view({viewId: 'view.999'}).tab.isScrolledIntoView()).toBe(true);
    });

    test('should fully scroll active tab into view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});
      await appPO.setDesignToken('--sci-workbench-tab-min-width', '5rem');

      // Add part with 10 views left to the main area.
      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.left', {align: 'left', ratio: .25})
        .addView('view.101', {partId: 'part.left'})
        .addView('view.102', {partId: 'part.left'})
        .addView('view.103', {partId: 'part.left'})
        .addView('view.104', {partId: 'part.left'})
        .addView('view.105', {partId: 'part.left'})
        .addView('view.106', {partId: 'part.left'})
        .addView('view.107', {partId: 'part.left'})
        .addView('view.108', {partId: 'part.left'})
        .addView('view.109', {partId: 'part.left'})
        .addView('view.110', {partId: 'part.left', activateView: true}),
      );

      // Expect tabbar to overflow (prerequisite).
      await expect.poll(() => appPO.part({partId: 'part.left'}).bar.getHiddenTabCount()).toBeGreaterThan(1);

      // Open new tab at the end.
      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate(['test-pages/navigation-test-page', {title: 'Workbench Navigation Test Page (long title)'}], {target: 'view.110'});

      // Expect tab to be fully scrolled into view.
      await expect.poll(() => appPO.view({viewId: 'view.110'}).tab.isActive()).toBe(true);
      await expect.poll(() => appPO.view({viewId: 'view.110'}).tab.isScrolledIntoView()).toBe(true);
    });

    test('should scroll the active tab into view when opening/reloading the application', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});
      await appPO.setDesignToken('--sci-workbench-tab-min-width', '5rem');

      // Add part with 10 views left to the main area.
      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.left', {align: 'left', ratio: .25})
        .addView('view.101', {partId: 'part.left'})
        .addView('view.102', {partId: 'part.left'})
        .addView('view.103', {partId: 'part.left'})
        .addView('view.104', {partId: 'part.left'})
        .addView('view.105', {partId: 'part.left'})
        .addView('view.106', {partId: 'part.left'})
        .addView('view.107', {partId: 'part.left'})
        .addView('view.108', {partId: 'part.left'})
        .addView('view.109', {partId: 'part.left'})
        .addView('view.110', {partId: 'part.left', activateView: true}),
      );

      // Expect tabbar to overflow (prerequisite).
      await expect.poll(() => appPO.part({partId: 'part.left'}).bar.getHiddenTabCount()).toBeGreaterThan(1);

      // Expect last tab to be active and scrolled into view.
      await expect.poll(() => appPO.view({viewId: 'view.110'}).tab.isActive()).toBe(true);
      await expect.poll(() => appPO.view({viewId: 'view.110'}).tab.isScrolledIntoView()).toBe(true);

      // Reload the application.
      await appPO.reload();

      // Expect last tab to be active and scrolled into view.
      await expect.poll(() => appPO.view({viewId: 'view.110'}).tab.isActive()).toBe(true);
      await expect.poll(() => appPO.view({viewId: 'view.110'}).tab.isScrolledIntoView()).toBe(true);
    });

    test('should scroll the active tab into view when closing the active tab', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});
      await appPO.setDesignToken('--sci-workbench-tab-min-width', '5rem');

      // Add part with 10 views left to the main area.
      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.left', {align: 'left', ratio: .25})
        .addView('view.101', {partId: 'part.left'})
        .addView('view.102', {partId: 'part.left'})
        .addView('view.103', {partId: 'part.left', activateView: true})
        .addView('view.104', {partId: 'part.left'})
        .addView('view.105', {partId: 'part.left'})
        .addView('view.106', {partId: 'part.left'})
        .addView('view.107', {partId: 'part.left'})
        .addView('view.108', {partId: 'part.left'})
        .addView('view.109', {partId: 'part.left'})
        .addView('view.110', {partId: 'part.left'}),
      );

      // Expect tabbar to overflow (prerequisite).
      await expect.poll(() => appPO.part({partId: 'part.left'}).bar.getHiddenTabCount()).toBeGreaterThan(1);

      // Expect "view.103" to be active and scrolled into view.
      await expect.poll(() => appPO.view({viewId: 'view.103'}).tab.isActive()).toBe(true);
      await expect.poll(() => appPO.view({viewId: 'view.103'}).tab.isScrolledIntoView()).toBe(true);

      // Activate the last tab (view.110).
      await appPO.view({viewId: 'view.110'}).tab.click();
      await expect.poll(() => appPO.view({viewId: 'view.110'}).tab.isActive()).toBe(true);
      await expect.poll(() => appPO.view({viewId: 'view.110'}).tab.isScrolledIntoView()).toBe(true);

      // Close the active tab (view.110).
      await appPO.view({viewId: 'view.110'}).tab.close();

      // Expect "view.103" to be active and scrolled into view.
      await expect.poll(() => appPO.view({viewId: 'view.103'}).tab.isActive()).toBe(true);
      await expect.poll(() => appPO.view({viewId: 'view.103'}).tab.isScrolledIntoView()).toBe(true);
    });

    test('should scroll the active tab into view when navigating the active view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});
      await appPO.setDesignToken('--sci-workbench-tab-min-width', '5rem');

      // Add part with 10 views left to the main area.
      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.left', {align: 'left', ratio: .25})
        .addView('view.101', {partId: 'part.left'})
        .addView('view.102', {partId: 'part.left'})
        .addView('view.103', {partId: 'part.left', activateView: true})
        .addView('view.104', {partId: 'part.left'})
        .addView('view.105', {partId: 'part.left'})
        .addView('view.106', {partId: 'part.left'})
        .addView('view.107', {partId: 'part.left'})
        .addView('view.108', {partId: 'part.left'})
        .addView('view.109', {partId: 'part.left'})
        .addView('view.110', {partId: 'part.left'}),
      );

      // Expect tabbar to overflow (prerequisite).
      await expect.poll(() => appPO.part({partId: 'part.left'}).bar.getHiddenTabCount()).toBeGreaterThan(1);

      // Scroll tabbar to the end.
      await appPO.part({partId: 'part.left'}).bar.viewTabBar.setViewportScrollLeft(Number.MAX_SAFE_INTEGER);

      // Expect "view.103" to be active and scrolled out of view.
      await expect.poll(() => appPO.view({viewId: 'view.103'}).tab.isActive()).toBe(true);
      await expect.poll(() => appPO.view({viewId: 'view.103'}).tab.isScrolledIntoView()).toBe(false);

      // Navigate the active tab (view.103).
      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate(['test-view', {navigated: true}], {target: 'view.103'});

      // Expect active tab to be scrolled into view.
      await expect.poll(() => appPO.view({viewId: 'view.103'}).tab.isActive()).toBe(true);
      await expect.poll(() => appPO.view({viewId: 'view.103'}).tab.isScrolledIntoView()).toBe(true);
    });

    test('should not scroll the active tab into view when closing an inactive tab', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});
      await appPO.setDesignToken('--sci-workbench-tab-min-width', '5rem');

      // Add part with 10 views left to the main area.
      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.left', {align: 'left', ratio: .25})
        .addView('view.101', {partId: 'part.left'})
        .addView('view.102', {partId: 'part.left'})
        .addView('view.103', {partId: 'part.left'})
        .addView('view.104', {partId: 'part.left'})
        .addView('view.105', {partId: 'part.left'})
        .addView('view.106', {partId: 'part.left'})
        .addView('view.107', {partId: 'part.left'})
        .addView('view.108', {partId: 'part.left'})
        .addView('view.109', {partId: 'part.left'})
        .addView('view.110', {partId: 'part.left', activateView: true}),
      );

      // Expect tabbar to overflow (prerequisite).
      await expect.poll(() => appPO.part({partId: 'part.left'}).bar.getHiddenTabCount()).toBeGreaterThan(1);

      // Expect last tab to be active and scrolled into view.
      await appPO.view({viewId: 'view.110'}).tab.click();
      await expect.poll(() => appPO.view({viewId: 'view.110'}).tab.isActive()).toBe(true);
      await expect.poll(() => appPO.view({viewId: 'view.110'}).tab.isScrolledIntoView()).toBe(true);

      // Scroll tabbar to the start.
      await appPO.part({partId: 'part.left'}).bar.viewTabBar.setViewportScrollLeft(0);

      // Expect active tab (last tab) to be scrolled out of view.
      await expect.poll(() => appPO.view({viewId: 'view.110'}).tab.isScrolledIntoView()).toBe(false);

      // Close "view.103" (not active tab).
      await appPO.view({viewId: 'view.103'}).tab.close();

      // Expect active tab (last tab) to be active but not scrolled into view.
      await expect.poll(() => appPO.view({viewId: 'view.110'}).tab.isActive()).toBe(true);
      await expect.poll(() => appPO.view({viewId: 'view.110'}).tab.isScrolledIntoView()).toBe(false);
    });

    test('should not scroll the active tab into view when opening an inactive tab', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});
      await appPO.setDesignToken('--sci-workbench-tab-min-width', '5rem');

      // Add part with 10 views left to the main area.
      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.left', {align: 'left', ratio: .25})
        .addView('view.101', {partId: 'part.left', activateView: true})
        .addView('view.102', {partId: 'part.left'})
        .addView('view.103', {partId: 'part.left'})
        .addView('view.104', {partId: 'part.left'})
        .addView('view.105', {partId: 'part.left'})
        .addView('view.106', {partId: 'part.left'})
        .addView('view.107', {partId: 'part.left'})
        .addView('view.108', {partId: 'part.left'})
        .addView('view.109', {partId: 'part.left'})
        .addView('view.110', {partId: 'part.left'}),
      );

      // Expect tabbar to overflow (prerequisite).
      await expect.poll(() => appPO.part({partId: 'part.left'}).bar.getHiddenTabCount()).toBeGreaterThan(1);

      // Expect first tab to be active and scrolled into view.
      await expect.poll(() => appPO.view({viewId: 'view.101'}).tab.isActive()).toBe(true);
      await expect.poll(() => appPO.view({viewId: 'view.101'}).tab.isScrolledIntoView()).toBe(true);

      // Scroll tabbar to the end.
      await appPO.part({partId: 'part.left'}).bar.viewTabBar.setViewportScrollLeft(Number.MAX_SAFE_INTEGER);

      // Open new tab at the end.
      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate(['test-view'], {partId: 'part.left', target: 'view.999', position: 'end', activate: false});

      // Expect first tab to be active but not scrolled into view.
      await expect.poll(() => appPO.view({viewId: 'view.101'}).tab.isActive()).toBe(true);
      await expect.poll(() => appPO.view({viewId: 'view.101'}).tab.isScrolledIntoView()).toBe(false);
    });
  });
});
