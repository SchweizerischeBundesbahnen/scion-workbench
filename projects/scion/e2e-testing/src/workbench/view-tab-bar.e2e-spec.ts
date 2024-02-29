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
import {PerspectivePagePO} from './page-object/perspective-page.po';
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';
import {LayoutPagePO} from './page-object/layout-page.po';

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

  test('should open new view to the right of the active view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Register Angular routes.
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerRoute({path: '', component: 'router-page', outlet: 'router'});

    const perspectivePage = await workbenchNavigator.openInNewTab(PerspectivePagePO);
    await perspectivePage.registerPerspective({
      id: 'perspective',
      parts: [
        {id: 'left'},
        {id: 'right', align: 'right', activate: true},
      ],
      views: [
        // Add views to the left part.
        {id: 'view.1', partId: 'left'},
        {id: 'router', partId: 'left', activateView: true}, // TODO [WB-LAYOUT] Change to view.2 and navigate to router page
        {id: 'view.3', partId: 'left'},
        {id: 'view.4', partId: 'left'},
        // Add views to the right part.
        {id: 'view.5', partId: 'right', activateView: true},
        {id: 'view.6', partId: 'right'},
      ],
    });
    await appPO.switchPerspective('perspective');

    // Open view in the active part (left part).
    const routerPage = new RouterPagePO(appPO, {viewId: 'router'});
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    // Expect view.2 to be opened to the right of the active view.
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MPart({
            id: 'left',
            views: [{id: 'view.1'}, {id: 'router'}, {id: 'view.2'}, {id: 'view.3'}, {id: 'view.4'}],
            activeViewId: 'view.2',
          }),
          child2: new MPart({
            id: 'right',
            views: [{id: 'view.5'}, {id: 'view.6'}],
            activeViewId: 'view.5',
          }),
          direction: 'row',
          ratio: .5,
        }),
        activePartId: 'left',
      },
    });

    // Open view in the right part.
    await routerPage.view.tab.click();
    await routerPage.enterPath('test-view');
    await routerPage.enterTarget('blank');
    await routerPage.enterBlankPartId('right');
    await routerPage.clickNavigate();

    // Expect view.7 to be opened to the right of the active view.
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MPart({
            id: 'left',
            views: [{id: 'view.1'}, {id: 'router'}, {id: 'view.2'}, {id: 'view.3'}, {id: 'view.4'}],
            activeViewId: 'router',
          }),
          child2: new MPart({
            id: 'right',
            views: [{id: 'view.5'}, {id: 'view.7'}, {id: 'view.6'}],
            activeViewId: 'view.7',
          }),
          direction: 'row',
          ratio: .5,
        }),
        activePartId: 'left',
      },
    });
  });

  test('should open view moved via drag & drop after the active view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const perspectivePage = await workbenchNavigator.openInNewTab(PerspectivePagePO);
    await perspectivePage.registerPerspective({
      id: 'perspective',
      parts: [
        {id: 'left'},
        {id: 'right', align: 'right', activate: true},
      ],
      views: [
        // Add views to the left part.
        {id: 'view.1', partId: 'left'},
        {id: 'view.2', partId: 'left'},
        {id: 'view.3', partId: 'left', activateView: true},
        {id: 'view.4', partId: 'left'},
        // Add views to the right part.
        {id: 'view.5', partId: 'right', activateView: true},
        {id: 'view.6', partId: 'right'},
      ],
    });
    await appPO.switchPerspective('perspective');

    // Move view.5 to the left part
    const view5 = appPO.view({viewId: 'view.5'});
    await view5.tab.dragTo({partId: 'left', region: 'center'});

    // Expect view.5 to be opened to the right of the active view.
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MPart({
            id: 'left',
            views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.3'}, {id: 'view.5'}, {id: 'view.4'}],
            activeViewId: 'view.5',
          }),
          child2: new MPart({
            id: 'right',
            views: [{id: 'view.6'}],
            activeViewId: 'view.6',
          }),
          direction: 'row',
          ratio: .5,
        }),
        activePartId: 'left',
      },
    });
  });

  test('should activate the view to the left of the view that is dragged out of the tab bar', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const perspectivePage = await workbenchNavigator.openInNewTab(PerspectivePagePO);
    await perspectivePage.registerPerspective({
      id: 'perspective',
      parts: [
        {id: 'part'},
      ],
      views: [
        {id: 'view.1', partId: 'part'},
        {id: 'view.2', partId: 'part'},
        {id: 'view.3', partId: 'part', activateView: true},
        {id: 'view.4', partId: 'part'},
      ],
    });
    await appPO.switchPerspective('perspective');

    // Drag view.3 out of the tabbar.
    const view3 = appPO.view({viewId: 'view.3'});
    await view3.tab.dragTo({partId: 'part', region: 'center'}, {steps: 100, performDrop: false});

    // Expect view.2 to be activated.
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({
          id: 'part',
          views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.4'}],
          activeViewId: 'view.2',
        }),
        activePartId: 'part',
      },
    });
  });

  test('should not change the view order when dragging a view to its own part (noop)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const perspectivePage = await workbenchNavigator.openInNewTab(PerspectivePagePO);
    await perspectivePage.registerPerspective({
      id: 'perspective',
      parts: [
        {id: 'part'},
      ],
      views: [
        {id: 'view.1', partId: 'part'},
        {id: 'view.2', partId: 'part'},
        {id: 'view.3', partId: 'part', activateView: true},
        {id: 'view.4', partId: 'part'},
      ],
    });
    await appPO.switchPerspective('perspective');

    // Drag view.3 to its own part.
    const view3 = appPO.view({viewId: 'view.3'});
    await view3.tab.dragTo({partId: 'part', region: 'center'}, {steps: 100});

    // Expect tab order not to be changed.
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({
          id: 'part',
          views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.3'}, {id: 'view.4'}],
          activeViewId: 'view.3',
        }),
        activePartId: 'part',
      },
    });
  });

  test('should cancel drag operation if pressing escape', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const perspectivePage = await workbenchNavigator.openInNewTab(PerspectivePagePO);
    await perspectivePage.registerPerspective({
      id: 'perspective',
      parts: [
        {id: 'part'},
      ],
      views: [
        {id: 'view.1', partId: 'part'},
        {id: 'view.2', partId: 'part'},
        {id: 'view.3', partId: 'part', activateView: true},
        {id: 'view.4', partId: 'part'},
      ],
    });
    await appPO.switchPerspective('perspective');

    // Drag view.3 out of the tabbar.
    const view3 = appPO.view({viewId: 'view.3'});
    await view3.tab.dragTo({partId: 'part', region: 'center'}, {steps: 100, performDrop: false});

    // Cancel drag operation.
    await appPO.workbench.press('Escape');

    // Expect views not to be changed.
    await expect(appPO.workbench).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({
          id: 'part',
          views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.3'}, {id: 'view.4'}],
          activeViewId: 'view.3',
        }),
        activePartId: 'part',
      },
    });
  });

  test('should allow opening view at the end', async ({appPO, workbenchNavigator}) => {
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

  test('should allow opening view at the start', async ({appPO, workbenchNavigator}) => {
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

  test('should allow opening view at a specific position', async ({appPO, workbenchNavigator}) => {
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
