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
import {InputFieldTestPagePO as MicrofrontendInputFieldTestPagePO} from './page-object/test-pages/input-field-test-page.po';
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';
import {ViewPagePO} from './page-object/view-page.po';
import {MAIN_AREA} from '../workbench.model';
import {PartPagePO} from './page-object/part-page.po';

test.describe('Workbench Part', () => {

  test('should activate part when view microfrontend gains focus', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Open test view "left".
    const leftTestPage = await MicrofrontendInputFieldTestPagePO.openInNewTab(appPO, microfrontendNavigator);
    // Open test view "right".
    const rightTestPage = await MicrofrontendInputFieldTestPagePO.openInNewTab(appPO, microfrontendNavigator);
    // Move test view to the right
    const dragHandle = await rightTestPage.view.tab.startDrag();
    await dragHandle.dragToPart(await appPO.activePart({grid: 'mainArea'}).getPartId(), {region: 'east'});
    await dragHandle.drop();

    // Capture part and view identities.
    const leftPartId = await leftTestPage.view.part.getPartId();
    const rightPartId = await rightTestPage.view.part.getPartId();
    const leftViewId = await leftTestPage.view.getViewId();
    const rightViewId = await rightTestPage.view.getViewId();

    // Expect right part to be activated.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MPart({
              id: leftPartId,
              views: [{id: leftViewId}],
              activeViewId: leftViewId,
            }),
            child2: new MPart({
              id: rightPartId,
              views: [{id: rightViewId}],
              activeViewId: rightViewId,
            }),
          }),
          activePartId: rightPartId,
        },
      },
    });

    // When clicking left test view.
    await leftTestPage.clickInputField();

    // Expect left part to be activated.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MPart({
              id: leftPartId,
              views: [{id: leftViewId}],
              activeViewId: leftViewId,
            }),
            child2: new MPart({
              id: rightPartId,
              views: [{id: rightViewId}],
              activeViewId: rightViewId,
            }),
          }),
          activePartId: leftPartId,
        },
      },
    });
  });

  test('should close view list menu when view microfrontend gains focus', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Open test view.
    const testPage = await MicrofrontendInputFieldTestPagePO.openInNewTab(appPO, microfrontendNavigator);

    // Open view list menu.
    const viewListMenu = await testPage.view.part.bar.openViewListMenu();
    await expect(viewListMenu.locator).toBeAttached();

    // When focusing the view.
    await testPage.clickInputField();
    // Expect the view list menu to be closed.
    await expect(viewListMenu.locator).not.toBeAttached();
    // Expect focus to remain in the input field that caused focus loss of the menu.
    await expect(testPage.input).toBeFocused();
  });

  test('should close view list menu when popup microfrontend gains focus', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Open test view.
    const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

    // Open test popup.
    const testPage = await MicrofrontendInputFieldTestPagePO.openInPopup(appPO, microfrontendNavigator, {closeOnFocusLost: false});

    // Open view list menu.
    const viewListMenu = await viewPage.view.part.bar.openViewListMenu();
    await expect(viewListMenu.locator).toBeAttached();

    // When focusing the popup.
    await testPage.clickInputField();
    // Expect the view list menu to be closed.
    await expect(viewListMenu.locator).not.toBeAttached();
    // Expect focus to remain in the input field that caused focus loss of the menu.
    await expect(testPage.input).toBeFocused();
  });

  test('should not create new part component instance when closing and opening docked part', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'main-area'},
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'testee'},
      properties: {
        path: 'test-part',
        extras: {
          icon: 'folder',
          label: 'testee',
        },
      },
    });

    const perspective = await microfrontendNavigator.registerCapability('app1', {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: MAIN_AREA,
            qualifier: {part: 'main-area'},
          },
          {
            id: 'part.testee',
            qualifier: {part: 'testee'},
            position: 'left-top',
            active: true,
            ɵactivityId: 'activity.1',
          },
        ],
      },
    });

    // Switch perspective.
    await appPO.switchPerspective(perspective.metadata!.id);

    // Expect layout.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({
            id: MAIN_AREA,
          }),
        },
        'activity.1': {
          root: new MPart({
            id: 'part.testee',
          }),
        },
      },
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [{id: 'activity.1'}],
            activeActivityId: 'activity.1',
          },
        },
      },
    });

    const partPage = new PartPagePO(appPO, {partId: 'part.testee'});

    // Capture the part's component instance id.
    const componentInstanceId = await partPage.getComponentInstanceId();

    // Close activity.
    await appPO.activityItem({activityId: 'activity.1'}).click();

    // Expect activity to be closed.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [{id: 'activity.1'}],
            activeActivityId: 'none',
          },
        },
      },
    });

    // Open activity.
    await appPO.activityItem({activityId: 'activity.1'}).click();

    // Expect the part's component instance id to stay the same.
    await expect.poll(() => partPage.getComponentInstanceId()).toEqual(componentInstanceId);
  });

  test('should substitute named URL segments in part', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'testee'},
      params: [
        {name: 'segment1', required: true},
        {name: 'segment2', required: true},
        {name: 'mp1', required: true},
        {name: 'mp2', required: true},
        {name: 'qp1', required: true},
        {name: 'qp2', required: true},
        {name: 'fragment', required: true},
      ],
      properties: {
        path: 'test-pages/part-test-page/:segment1/:segment2;mp1=:mp1;mp2=:mp2?qp1=:qp1&qp2=:qp2#:fragment',
      },
    });

    const perspective = await microfrontendNavigator.registerCapability('app1', {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        parts: [
          {
            id: 'part.testee',
            qualifier: {part: 'testee'},
            params: {segment1: 'SEG1', segment2: 'SEG2', mp1: 'MP1', mp2: 'MP2', qp1: 'QP1', qp2: 'QP2', fragment: 'FRAGMENT'},
            active: true,
          },
        ],
      },
    });

    // Switch perspective.
    await appPO.switchPerspective(perspective.metadata!.id);

    const partPage = new PartPagePO(appPO, {partId: 'part.testee'});

    // Expect named params to be substituted.
    await expect.poll(() => partPage.getPartParams()).toMatchObject({
      segment1: 'SEG1',
      segment2: 'SEG2',
      mp1: 'MP1',
      mp2: 'MP2',
      qp1: 'QP1',
      qp2: 'QP2',
      fragment: 'FRAGMENT',
    });
    await expect.poll(() => partPage.getRouteParams()).toEqual({segment1: 'SEG1', segment2: 'SEG2', mp1: 'MP1', mp2: 'MP2'});
    await expect.poll(() => partPage.getRouteQueryParams()).toEqual({qp1: 'QP1', qp2: 'QP2'});
    await expect.poll(() => partPage.getRouteFragment()).toEqual('FRAGMENT');
  });
});
