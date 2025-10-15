/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {InputFieldTestPagePO, InputFieldTestPagePO as MicrofrontendInputFieldTestPagePO} from './page-object/test-pages/input-field-test-page.po';
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';
import {ViewPagePO} from './page-object/view-page.po';
import {MAIN_AREA} from '../workbench.model';
import {PartPagePO} from './page-object/part-page.po';
import {NotificationOpenerPagePO} from '../workbench/page-object/notification-opener-page.po';
import {WorkbenchPartCapability} from './page-object/register-workbench-capability-page.po';
import {expectPart} from './matcher/part-matcher';
import {expectPart as expectWorkbenchPart} from '../matcher/part-matcher';
import {UnregisterWorkbenchCapabilityPagePO} from './page-object/unregister-workbench-capability-page.po';
import {PageNotFoundPagePO} from '../workbench/page-object/page-not-found-page.po';

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
        {name: 'seg1', required: true},
        {name: 'seg2', required: true},
        {name: 'mp1', required: true},
        {name: 'mp2', required: true},
        {name: 'qp1', required: true},
        {name: 'qp2', required: true},
        {name: 'fragment', required: true},
      ],
      properties: {
        path: 'test-pages/part-test-page/:seg1/:seg2;matrixParam1=:mp1;matrixParam2=:mp2?queryParam1=:qp1&queryParam2=:qp2#:fragment',
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
            params: {seg1: 'SEG1', seg2: 'SEG2', mp1: 'MP1', mp2: 'MP2', qp1: 'QP1', qp2: 'QP2', fragment: 'FRAGMENT'},
          },
        ],
      },
    });

    // Switch perspective.
    await appPO.switchPerspective(perspective.metadata!.id);

    const partPage = new PartPagePO(appPO, {partId: 'part.testee'});

    // Expect named params to be substituted.
    await expect.poll(() => partPage.getPartParams()).toMatchObject({
      seg1: 'SEG1',
      seg2: 'SEG2',
      mp1: 'MP1',
      mp2: 'MP2',
      qp1: 'QP1',
      qp2: 'QP2',
      fragment: 'FRAGMENT',
    });
    await expect.poll(() => partPage.getRouteParams()).toEqual({segment1: 'SEG1', segment2: 'SEG2', matrixParam1: 'MP1', matrixParam2: 'MP2'});
    await expect.poll(() => partPage.getRouteQueryParams()).toEqual({queryParam1: 'QP1', queryParam2: 'QP2'});
    await expect.poll(() => partPage.getRouteFragment()).toEqual('FRAGMENT');
  });

  test('should bubble Control+Shift+F12 keystroke across iframe boundaries', async ({appPO, page, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'main-area'},
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'testee'},
      properties: {
        path: 'test-pages/input-field-test-page',
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
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [{id: 'activity.1'}],
            activeActivityId: 'activity.1',
          },
        },
      },
    });

    // Focus part microfrontend.
    const partTestPage = InputFieldTestPagePO.newPartPO(appPO, {partId: 'part.testee'});
    await partTestPage.clickInputField();

    // Expect part microfrontend to have focus.
    await expect(partTestPage.input).toBeFocused();

    // Press Ctrl+Shift+F12 to maximize layout, retrying since the installation of keystrokes may take some time.
    await expect(async () => {
      await page.keyboard.press('Control+Shift+F12');

      // Expect layout to be maximized.
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
    }).toPass();
  });

  test('should bubble Escape keystroke across iframe boundaries', async ({appPO, page, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'main-area'},
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'testee'},
      properties: {
        path: 'test-pages/input-field-test-page',
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

    // Open notification.
    const notificationOpenerPage = await workbenchNavigator.openInNewTab(NotificationOpenerPagePO);
    await notificationOpenerPage.enterCssClass('testee');
    await notificationOpenerPage.enterContent('Notification');
    await notificationOpenerPage.open();
    const notification = appPO.notification({cssClass: 'testee'});

    // Expect notification to be visible.
    await expect(notification.locator).toBeVisible();

    // Focus part microfrontend.
    const partTestPage = InputFieldTestPagePO.newPartPO(appPO, {partId: 'part.testee'});
    await partTestPage.clickInputField();

    // Expect part microfrontend to have focus.
    await expect(partTestPage.input).toBeFocused();

    // Press Escape to close notification, retrying since the installation of keystrokes may take some time.
    await expect(async () => {
      // Press Escape to close notification.
      await page.keyboard.press('Escape');

      // Expect notification to be closed.
      await expect(notification.locator).not.toBeAttached();
    }).toPass();
  });

  test('should provide part id', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'testee'},
      properties: {
        path: 'test-part',
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
          },
        ],
      },
    });

    // Switch perspective.
    await appPO.switchPerspective(perspective.metadata!.id);

    const partPage = new PartPagePO(appPO, {partId: 'part.testee'});

    // Expect part id to be provided on part handle.
    await expect(partPage.partId).toHaveText('part.testee');
  });

  test('should provide the part capability', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
      type: 'part',
      qualifier: {part: 'testee'},
      properties: {
        path: 'test-part',
        title: 'Part Title',
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
          },
        ],
      },
    });

    // Switch perspective.
    await appPO.switchPerspective(perspective.metadata!.id);

    const partPage = new PartPagePO(appPO, {partId: 'part.testee'});

    // Expect part capability to be provided on part handle.
    await expect.poll(() => partPage.getPartCapability()).toEqual(expect.objectContaining({
      type: 'part',
      qualifier: {part: 'testee'},
      properties: expect.objectContaining({
        path: 'test-part',
        title: 'Part Title',
      }),
    }));
  });

  test('should display "Not Found" page when unregistering part capability', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'main-area'},
    });

    const testeePartCapability = await microfrontendNavigator.registerCapability<WorkbenchPartCapability>('app1', {
      type: 'part',
      qualifier: {part: 'testee'},
      properties: {
        path: 'test-part',
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
            position: {
              align: 'left',
            },
          },
        ],
      },
    });

    // Switch perspective.
    await appPO.switchPerspective(perspective.metadata!.id);

    const part = appPO.part({partId: 'part.testee'});

    // Expect part to display part test page.
    await expectPart(part).toDisplayComponent(PartPagePO.selector);

    // Remove part capability.
    const unregisterCapabilityPage = await microfrontendNavigator.openInNewTab(UnregisterWorkbenchCapabilityPagePO, 'app1');
    await unregisterCapabilityPage.unregisterCapability(testeePartCapability.metadata!.id);

    // Expect part to display "Not Found" page.
    await expectWorkbenchPart(part).toDisplayComponent(PageNotFoundPagePO.selector);
    await expect.poll(() => consoleLogs.get({severity: 'warning'})).toEqual([
      `[workbench:microfrontend/routing] [NullCapabilityError] No application found to provide a part capability of id '${testeePartCapability.metadata!.id}'. Maybe, the requested part is not public API or the providing application not available.`,
    ]);
  });
});
