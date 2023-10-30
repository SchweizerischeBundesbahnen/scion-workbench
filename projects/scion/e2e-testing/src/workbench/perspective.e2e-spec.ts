import {test} from '../fixtures';
import {LayoutPagePO} from './page-object/layout-page.po';
import {expect} from '@playwright/test';
import {BinaryMTreeNode, MPart} from '../matcher/to-equal-workbench-layout.matcher';
import {MAIN_AREA} from '../workbench.model';
import {waitUntilStable} from '../helper/testing.util';

test.describe('Workbench Perspective', () => {

  test('should add parts and views to perspective', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    const layoutPagePO = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPagePO.addPart('left', {align: 'left', ratio: .25});
    await layoutPagePO.addPart('left-bottom', {relativeTo: 'left', align: 'bottom', ratio: .5});
    await layoutPagePO.addPart('right', {align: 'right', ratio: .3});
    await layoutPagePO.addView('view-1', {partId: 'left', activateView: true});
    await layoutPagePO.addView('view-2', {partId: 'left-bottom', activateView: true});
    await layoutPagePO.addView('view-3', {partId: 'right', activateView: true});
    await layoutPagePO.registerRoute({path: '', outlet: 'view-1', component: 'view-page'}, {title: 'View 1'});
    await layoutPagePO.registerRoute({path: '', outlet: 'view-2', component: 'view-page'}, {title: 'View 2'});
    await layoutPagePO.registerRoute({path: '', outlet: 'view-3', component: 'view-page'}, {title: 'View 3'});

    await waitUntilStable(() => appPO.getCurrentNavigationId());

    await expect(appPO.workbenchLocator).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new BinaryMTreeNode({
          direction: 'row',
          ratio: .7,
          child1: new BinaryMTreeNode({
            direction: 'row',
            ratio: .25,
            child1: new BinaryMTreeNode({
              direction: 'column',
              ratio: .5,
              child1: new MPart({
                id: 'left',
                views: [{id: 'view-1'}],
                activeViewId: 'view-1',
              }),
              child2: new MPart({
                id: 'left-bottom',
                views: [{id: 'view-2'}],
                activeViewId: 'view-2',
              }),
            }),
            child2: new MPart({
              id: MAIN_AREA,
            }),
          }),
          child2: new MPart({
            id: 'right',
            views: [{id: 'view-3'}],
          }),
        }),
      },
    });
  });
});
