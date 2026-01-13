/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../fixtures';
import {RouterPagePO} from './page-object/router-page.po';
import {StandaloneViewTestPagePO} from './page-object/test-pages/standalone-view-test-page.po';
import {NonStandaloneViewTestPagePO} from './page-object/test-pages/non-standalone-view-test-page.po';
import {MAIN_AREA} from '../workbench.model';
import {expectView} from '../matcher/view-matcher';
import {ViewPagePO} from './page-object/view-page.po';
import {expect, Page} from '@playwright/test';
import {ActiveWorkbenchElementLogPagePO} from './page-object/test-pages/active-workbench-element-log-page.po';
import {PartId, WorkbenchLayout} from '@scion/workbench';

test.describe('Browser Session History', () => {

  test('should create single entry in browser session history when loading the application', async ({appPO, page}) => {
    const historyStackSizeBefore = await getBrowserHistoryStackSize(page);
    await appPO.navigateTo({microfrontendSupport: false});

    // Expect single entry added to the browser session history.
    await expect.poll(() => getBrowserHistoryStackSize(page)).toBe(historyStackSizeBefore + 1);
    // Expect state in browser session history to contain the workbench layout.
    await expect.poll(() => page.evaluate(() => (history.state as {ɵworkbench?: unknown}).ɵworkbench)).toBeDefined(); // state[WORKBENCH_NAVIGATION_STATE_KEY]: WorkbenchNavigationalState
  });

  test('should create new entry in browser session history when switching perspectives', async ({appPO, workbenchNavigator, page}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Create two perspectives (no activation).
    await workbenchNavigator.createPerspective('testee-1', factory => factory.addPart(MAIN_AREA), {activate: false});
    await workbenchNavigator.createPerspective('testee-2', factory => factory.addPart(MAIN_AREA), {activate: false});

    await test.step('Switching to perspective 1 (initial perspective activation)', async () => {
      // Capture browser session history count.
      const historyStackSizeBefore = await getBrowserHistoryStackSize(page);

      // Switch to perspective 1.
      await appPO.switchPerspective('testee-1');

      // Expect the browser session history to contain a single new entry.
      await expect.poll(() => appPO.getActivePerspectiveId()).toEqual('testee-1');
      await expect.poll(() => getBrowserHistoryStackSize(page)).toBe(historyStackSizeBefore + 1);
    });

    await test.step('Switching to perspective 2 (initial perspective activation)', async () => {
      // Capture browser session history count.
      const historyStackSizeBefore = await getBrowserHistoryStackSize(page);

      // Switch to perspective 2.
      await appPO.switchPerspective('testee-2');

      // Expect the browser session history to contain a single new entry.
      await expect.poll(() => appPO.getActivePerspectiveId()).toEqual('testee-2');
      await expect.poll(() => getBrowserHistoryStackSize(page)).toBe(historyStackSizeBefore + 1);
    });

    await test.step('Switching to perspective 1', async () => {
      // Capture browser session history count.
      const historyStackSizeBefore = await getBrowserHistoryStackSize(page);

      // Switch to perspective 1.
      await appPO.switchPerspective('testee-1');

      // Expect the browser session history to contain a single new entry.
      await expect.poll(() => appPO.getActivePerspectiveId()).toEqual('testee-1');
      await expect.poll(() => getBrowserHistoryStackSize(page)).toBe(historyStackSizeBefore + 1);
    });

    await test.step('Switching to perspective 2', async () => {
      // Capture browser session history count.
      const historyStackSizeBefore = await getBrowserHistoryStackSize(page);

      // Switch to perspective 2.
      await appPO.switchPerspective('testee-2');

      // Expect the browser session history to contain a single new entry.
      await expect.poll(() => appPO.getActivePerspectiveId()).toEqual('testee-2');
      await expect.poll(() => getBrowserHistoryStackSize(page)).toBe(historyStackSizeBefore + 1);
    });
  });

  test('should put main grid-related navigations into browser session history', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Add part to the main grid
    await workbenchNavigator.modifyLayout(layout => layout.addPart('part.left', {relativeTo: MAIN_AREA, align: 'left', ratio: .25}));

    // Add view-1 to the left part
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      target: 'view.101',
      partId: 'part.left',
      cssClass: 'testee',
    });

    // Expect view-1 to be active
    const testee1ViewPage = new ViewPagePO(appPO.view({viewId: 'view.101'}));
    await expectView(testee1ViewPage).toBeActive();

    // Add view-2 to the left part
    await routerPage.navigate(['test-view'], {
      target: 'view.102',
      partId: 'part.left',
      cssClass: 'testee',
    });

    // Expect view-2 to be active
    const testee2ViewPage = new ViewPagePO(appPO.view({viewId: 'view.102'}));
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeActive();

    // Activate view-1
    await testee1ViewPage.view.tab.click();
    await expectView(testee1ViewPage).toBeActive();
    await expectView(testee2ViewPage).toBeInactive();

    // Close view-1
    await testee1ViewPage.view.tab.close();
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).toBeActive();

    // WHEN: Performing navigation back
    await appPO.navigateBack();
    // THEN: Expect view-1 and view-2 to be present and view-1 to be active
    await expectView(testee1ViewPage).toBeActive();
    await expectView(testee2ViewPage).toBeInactive();

    // WHEN: Performing navigation back
    await appPO.navigateBack();
    // THEN: Expect view-1 and view-2 to be present and view-2 to be active
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeActive();

    // WHEN: Performing navigation back
    await appPO.navigateBack();
    // THEN: Expect view-2 not to be present
    await expectView(testee1ViewPage).toBeActive();
    await expectView(testee2ViewPage).not.toBeAttached();

    // WHEN: Performing navigation back
    await appPO.navigateBack();
    // THEN: Expect no test views to be present
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).not.toBeAttached();

    // WHEN: Performing navigation forward
    await appPO.navigateForward();
    // THEN: Expect view-1 to be present
    await expectView(testee1ViewPage).toBeActive();
    await expectView(testee2ViewPage).not.toBeAttached();

    // WHEN: Performing navigation forward
    await appPO.navigateForward();
    // THEN: Expect view-1 and view-2 to be present
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeActive();

    // WHEN: Performing navigation forward
    await appPO.navigateForward();
    // THEN: Expect view-1 to be active
    await expectView(testee1ViewPage).toBeActive();
    await expectView(testee2ViewPage).toBeInactive();

    // WHEN: Performing navigation forward
    await appPO.navigateForward();
    // THEN: Expect view-1 to be closed
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).toBeActive();
  });

  test('should put main-area grid-related navigations into browser session history', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Add view-1
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      target: 'view.101',
      activate: false,
      position: 'end',
      cssClass: 'testee',
    });

    // Add view-2
    await routerPage.navigate(['test-view'], {
      target: 'view.102',
      activate: false,
      position: 'end',
      cssClass: 'testee',
    });

    const testee1ViewPage = new ViewPagePO(appPO.view({viewId: 'view.101'}));
    const testee2ViewPage = new ViewPagePO(appPO.view({viewId: 'view.102'}));

    // Activate view-1
    await testee1ViewPage.view.tab.click();
    await expectView(testee1ViewPage).toBeActive();
    await expectView(testee2ViewPage).toBeInactive();

    // Activate view-2
    await testee2ViewPage.view.tab.click();
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeActive();

    // Activate view-1
    await testee1ViewPage.view.tab.click();
    await expectView(testee1ViewPage).toBeActive();
    await expectView(testee2ViewPage).toBeInactive();

    // Close view-1
    await testee1ViewPage.view.tab.close();
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).toBeActive();

    // WHEN: Performing navigation back
    await appPO.navigateBack();
    // THEN: Expect view-1 and view-2 to be present and view-1 to be active
    await expectView(testee1ViewPage).toBeActive();
    await expectView(testee2ViewPage).toBeInactive();

    // WHEN: Performing navigation back
    await appPO.navigateBack();
    // THEN: Expect view-1 and view-2 to be present and view-2 to be active
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeActive();

    // WHEN: Performing navigation back
    await appPO.navigateBack();
    // THEN: Expect view-1 and view-2 to be present and view-1 to be active
    await expectView(testee1ViewPage).toBeActive();
    await expectView(testee2ViewPage).toBeInactive();

    // WHEN: Performing navigation forward
    await appPO.navigateForward();
    // THEN: Expect view-2 to be active
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeActive();

    // WHEN: Performing navigation forward
    await appPO.navigateForward();
    // THEN: Expect view-1 to be active
    await expectView(testee1ViewPage).toBeActive();
    await expectView(testee2ViewPage).toBeInactive();

    // WHEN: Performing navigation forward
    await appPO.navigateForward();
    // THEN: Expect view-1 to be active
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).toBeActive();
  });

  /**
   * Navigating back and forward creates a new view handle with the same view id.
   *
   * This test verifies the component to operate on the "new" view handle.
   *
   * Prerequisite: Part has a single view that is removed on history back and restored on history forward.
   */
  test('should operate on "new" view handle after history back and forward if the only view of the part', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Create part on the right.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.right', {align: 'right'}),
    );

    // Add view.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {
      partId: 'part.right',
      target: 'view.1',
    });

    const viewPage = new ViewPagePO(appPO.view({viewId: 'view.1'}));
    await expectView(viewPage).toBeActive();

    // Enter title.
    await viewPage.enterTitle('A');
    await expect(appPO.view({viewId: 'view.1'}).tab.title).toHaveText('A');

    // Perform navigation back, undoing adding the view.
    await appPO.navigateBack();

    // Expect view not to be present (destroyed, not in the layout).
    await expectView(viewPage).not.toBeAttached();

    // Perform navigation forward.
    await appPO.navigateForward();

    // Expect view to be present and the title to be reset.
    await expectView(viewPage).toBeActive();
    await expect(appPO.view({viewId: 'view.1'}).tab.title).toHaveText('Workbench View');

    // Change title.
    await viewPage.enterTitle('B');

    // Expect title to be set on the "new" view handle. Would have no effect if set on the "old" handle.
    await expect(appPO.view({viewId: 'view.1'}).tab.title).toHaveText('B');
  });

  /**
   * This test clicks on active tabs located in different parts of the same grid, activating the containing part when clicked.
   */
  test('should not create entry in browser session history when clicking on active tabs located in different parts of the same grid', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.left')
      .addPart('part.right', {align: 'right'})
      .addView('view.1', {partId: 'part.left'})
      .addView('view.2', {partId: 'part.right'})
      .modify(addActiveWorkbenchElementPart('part.log')),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    const tab1 = appPO.view({viewId: 'view.1'}).tab;
    const tab2 = appPO.view({viewId: 'view.2'}).tab;

    // Open the activity panel, creating new entry in browser session history.
    await appPO.activityItem({activityId: 'activity.log'}).click();
    await logPart.clearLog();

    // PRECONDITION: Expect the bottom panel to be opened.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        panels: {
          bottom: 'opened',
        },
      },
    });

    // Click tab of 'view.1', not creating new entry in browser session history.
    await tab1.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1']);

    // Click tab of 'view.2', not creating new entry in browser session history.
    await tab2.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.2');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', 'view.2']);

    // Click tab of 'view.1', not creating new entry in browser session history.
    await tab1.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', 'view.2', 'view.1']);

    // Click tab of 'view.2', not creating new entry in browser session history.
    await tab2.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.2');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', 'view.2', 'view.1', 'view.2']);

    // TEST: Perform history back.
    await appPO.navigateBack();

    // Expect the bottom panel to be closed as tab activations should not create new browser session history entries.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        panels: {
          bottom: 'closed',
        },
      },
    });
  });

  /**
   * This test clicks on different active tabs located in different active parts of different grids.
   */
  test('should not create entry in browser session history when clicking on active tabs located in different active parts of different grids', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addPart('part.activity-1', {dockTo: 'left-top'}, {label: 'Activity 1', icon: 'folder', ɵactivityId: 'activity.1'})
      .addPart('part.activity-2', {dockTo: 'right-top'}, {label: 'Activity 2', icon: 'folder', ɵactivityId: 'activity.2'})
      .addView('view.1', {partId: 'part.activity-1'})
      .addView('view.2', {partId: 'part.activity-2'})
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const tab1 = appPO.view({viewId: 'view.1'}).tab;
    const tab2 = appPO.view({viewId: 'view.2'}).tab;

    // Open the activity panel, creating new entry in browser session history.
    await appPO.activityItem({activityId: 'activity.1'}).click();

    // Open the activity panel, creating new entry in browser session history.
    await appPO.activityItem({activityId: 'activity.2'}).click();

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // PRECONDITION: Expect the bottom panel to be opened.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        panels: {
          left: 'opened',
          right: 'opened',
          bottom: 'opened',
        },
      },
    });

    // Click tab of 'view.1', not creating new entry in browser session history.
    await tab1.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1']);

    // Click tab of 'view.2', not creating new entry in browser session history.
    await tab2.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.2');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', 'view.2']);

    // Click tab of 'view.1', not creating new entry in browser session history.
    await tab1.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', 'view.2', 'view.1']);

    // Click tab of 'view.2', not creating new entry in browser session history.
    await tab2.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.2');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', 'view.2', 'view.1', 'view.2']);

    // TEST: Perform history back.
    await appPO.navigateBack();

    // Expect the right panel to be closed as tab activations should not create new browser session history entries.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        panels: {
          left: 'opened',
          right: 'closed',
          bottom: 'opened',
        },
      },
    });

    // TEST: Perform history back.
    await appPO.navigateBack();

    // Expect the left panel to be closed as tab activations should not create new browser session history entries.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        panels: {
          left: 'closed',
          right: 'closed',
          bottom: 'opened',
        },
      },
    });
  });

  /**
   * This test clicks on different parts located in the same grid, activating the part when clicked.
   */
  test('should not create entry in browser session history when clicking on different parts located in the same grid', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.left', {title: 'Left Part'})
      .addPart('part.right', {align: 'right'}, {title: 'Right Part'})
      .navigatePart('part.left', ['path/to/part'])
      .navigatePart('part.right', ['path/to/part'])
      .modify(addActiveWorkbenchElementPart('part.log')),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    const leftPart = appPO.part({partId: 'part.left'});
    const rightPart = appPO.part({partId: 'part.right'});

    // Open the activity panel, creating new entry in browser session history.
    await appPO.activityItem({activityId: 'activity.log'}).click();
    await logPart.clearLog();

    // PRECONDITION: Expect the bottom panel to be opened.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        panels: {
          bottom: 'opened',
        },
      },
    });

    // Click 'part.left', not creating new entry in browser session history.
    await leftPart.bar.title.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.left');
    await expect.poll(() => logPart.getLog()).toEqual(['part.left']);

    // Click 'part.right', not creating new entry in browser session history.
    await rightPart.bar.title.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right');
    await expect.poll(() => logPart.getLog()).toEqual(['part.left', 'part.right']);

    // Click 'part.left', not creating new entry in browser session history.
    await leftPart.bar.title.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.left');
    await expect.poll(() => logPart.getLog()).toEqual(['part.left', 'part.right', 'part.left']);

    // Click 'part.right', not creating new entry in browser session history.
    await rightPart.bar.title.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right');
    await expect.poll(() => logPart.getLog()).toEqual(['part.left', 'part.right', 'part.left', 'part.right']);

    // TEST: Perform history back.
    await appPO.navigateBack();

    // Expect the bottom panel to be closed as tab activations should not create new browser session history entries.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        panels: {
          bottom: 'closed',
        },
      },
    });
  });

  /**
   * This test clicks on active parts located in different grids.
   */
  test('should not create entry in browser session history when clicking on active parts located in different grids', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addPart('part.activity-left', {dockTo: 'left-top'}, {label: 'Activity Left', icon: 'folder', ɵactivityId: 'activity.left'})
      .addPart('part.activity-right', {dockTo: 'right-top'}, {label: 'Activity Right', icon: 'folder', ɵactivityId: 'activity.right'})
      .navigatePart('part.activity-left', ['path/to/part'])
      .navigatePart('part.activity-right', ['path/to/part'])
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const leftPart = appPO.part({partId: 'part.activity-left'});
    const rightPart = appPO.part({partId: 'part.activity-right'});

    // Open the activity panel, creating new entry in browser session history.
    await appPO.activityItem({activityId: 'activity.left'}).click();

    // Open the activity panel, creating new entry in browser session history.
    await appPO.activityItem({activityId: 'activity.right'}).click();

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // PRECONDITION: Expect the bottom panel to be opened.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        panels: {
          left: 'opened',
          right: 'opened',
          bottom: 'opened',
        },
      },
    });

    // Click 'part.activity-left', not creating new entry in browser session history.
    await leftPart.bar.title.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity-left');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity-left']);

    // Click 'part.activity-right', not creating new entry in browser session history.
    await rightPart.bar.title.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity-right');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity-left', 'part.activity-right']);

    // Click 'part.activity-left', not creating new entry in browser session history.
    await leftPart.bar.title.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity-left');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity-left', 'part.activity-right', 'part.activity-left']);

    // Click 'part.activity-right', not creating new entry in browser session history.
    await rightPart.bar.title.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity-right');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity-left', 'part.activity-right', 'part.activity-left', 'part.activity-right']);

    // TEST: Perform history back.
    await appPO.navigateBack();

    // Expect the right panel to be closed as tab activations should not create new browser session history entries.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        panels: {
          left: 'opened',
          right: 'closed',
          bottom: 'opened',
        },
      },
    });

    // TEST: Perform history back.
    await appPO.navigateBack();

    // Expect the left panel to be closed as tab activations should not create new browser session history entries.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        panels: {
          left: 'closed',
          right: 'closed',
          bottom: 'opened',
        },
      },
    });
  });

  /**
   * This test switches between activities in the same activity stack.
   */
  test('should create entry in browser session history when switching between activities in the same activity stack', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addPart('part.activity-1', {dockTo: 'left-top'}, {label: 'Activity 1', icon: 'folder', ɵactivityId: 'activity.1'})
      .addPart('part.activity-2', {dockTo: 'left-top'}, {label: 'Activity 2', icon: 'folder', ɵactivityId: 'activity.2'})
      .navigatePart('part.activity-1', ['path/to/part'])
      .navigatePart('part.activity-2', ['path/to/part'])
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Click 'activity.1', creating new entry in browser session history.
    await appPO.activityItem({activityId: 'activity.1'}).click();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity-1');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity-1']);

    // Click 'activity.2', creating new entry in browser session history.
    await appPO.activityItem({activityId: 'activity.2'}).click();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity-2');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity-1', 'part.activity-2']);

    // Click 'activity.1', creating new entry in browser session history.
    await appPO.activityItem({activityId: 'activity.1'}).click();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity-1');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity-1', 'part.activity-2', 'part.activity-1']);

    // Click 'activity.2', creating new entry in browser session history.
    await appPO.activityItem({activityId: 'activity.2'}).click();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity-2');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity-1', 'part.activity-2', 'part.activity-1', 'part.activity-2']);

    // PRECONDITION: Expect 'activity.2' to be opened.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activeActivityId: 'activity.2',
            activities: [{id: 'activity.1'}, {id: 'activity.2'}],
          },
        },
      },
    });

    // TEST: Perform history back.
    await appPO.navigateBack();

    // Expect 'part.activity-1' to be active as created new entry in browser session history.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activeActivityId: 'activity.1',
            activities: [{id: 'activity.1'}, {id: 'activity.2'}],
          },
        },
      },
    });

    // TEST: Perform history back.
    await appPO.navigateBack();

    // Expect 'part.activity-2' to be active as created new entry in browser session history.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activeActivityId: 'activity.2',
            activities: [{id: 'activity.1'}, {id: 'activity.2'}],
          },
        },
      },
    });

    // TEST: Perform history back.
    await appPO.navigateBack();

    // Expect 'part.activity-1' to be active as created new entry in browser session history.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activeActivityId: 'activity.1',
            activities: [{id: 'activity.1'}, {id: 'activity.2'}],
          },
        },
      },
    });
  });

  /**
   * This test opens and closes an activity.
   */
  test('should create entry in browser session history when opening and closing an activity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addPart('part.activity-1', {dockTo: 'left-top'}, {label: 'Activity 1', icon: 'folder', ɵactivityId: 'activity.1'})
      .navigatePart('part.activity-1', ['path/to/part'])
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Open 'activity.1', creating new entry in browser session history.
    await appPO.activityItem({activityId: 'activity.1'}).click();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity-1');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity-1']);

    // Close 'activity.1', creating new entry in browser session history.
    await appPO.activityItem({activityId: 'activity.1'}).click();
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity-1', null]);

    // Open 'activity.1', creating new entry in browser session history.
    await appPO.activityItem({activityId: 'activity.1'}).click();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity-1');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity-1', null, 'part.activity-1']);

    // Close 'activity.1', creating new entry in browser session history.
    await appPO.activityItem({activityId: 'activity.1'}).click();
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity-1', null, 'part.activity-1', null]);

    // Expect no activity to be opened.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activeActivityId: 'none',
            activities: [{id: 'activity.1'}],
          },
        },
      },
    });

    // TEST: Perform history back.
    await appPO.navigateBack();

    // Expect 'activity.1' to be opened as created new entry in browser session history.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activeActivityId: 'activity.1',
            activities: [{id: 'activity.1'}],
          },
        },
      },
    });

    // Perform history back.
    await appPO.navigateBack();

    // Expect 'activity.1' to be closed as created new entry in browser session history.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activeActivityId: 'none',
            activities: [{id: 'activity.1'}],
          },
        },
      },
    });

    // Perform history back.
    await appPO.navigateBack();

    // Expect 'activity.1' to be opened as created new entry in browser session history.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activeActivityId: 'activity.1',
            activities: [{id: 'activity.1'}],
          },
        },
      },
    });
  });

  test.describe('Standalone Component', () => {

    test('should display standalone view component after browser back/forward navigation ({component: component})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate(['test-pages/standalone-view-test-page/component'], {
        target: await routerPage.view.getViewId(),
        cssClass: 'testee',
      });

      const standaloneViewTestPage = new StandaloneViewTestPagePO(appPO.view({cssClass: 'testee'}));
      await expectView(routerPage).not.toBeAttached();
      await expectView(standaloneViewTestPage).toBeActive();

      await appPO.navigateBack();
      await expectView(routerPage).toBeActive();
      await expectView(standaloneViewTestPage).not.toBeAttached();

      await appPO.navigateForward();
      await expectView(routerPage).not.toBeAttached();
      await expectView(standaloneViewTestPage).toBeActive();
    });

    test('should display standalone view component after browser back/forward navigation ({loadComponent: () => component})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate(['test-pages/standalone-view-test-page/load-component'], {
        target: await routerPage.view.getViewId(),
        cssClass: 'testee',
      });

      const standaloneViewTestPage = new StandaloneViewTestPagePO(appPO.view({cssClass: 'testee'}));
      await expectView(routerPage).not.toBeAttached();
      await expectView(standaloneViewTestPage).toBeActive();

      await appPO.navigateBack();
      await expectView(routerPage).toBeActive();
      await expectView(standaloneViewTestPage).not.toBeAttached();

      await appPO.navigateForward();
      await expectView(routerPage).not.toBeAttached();
      await expectView(standaloneViewTestPage).toBeActive();
    });

    test('should display standalone view component after browser back/forward navigation ({loadChildren: () => module})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate(['test-pages/standalone-view-test-page/load-children/module'], {
        target: await routerPage.view.getViewId(),
        cssClass: 'testee',
      });

      const standaloneViewTestPage = new StandaloneViewTestPagePO(appPO.view({cssClass: 'testee'}));
      await expectView(routerPage).not.toBeAttached();
      await expectView(standaloneViewTestPage).toBeActive();

      await appPO.navigateBack();
      await expectView(routerPage).toBeActive();
      await expectView(standaloneViewTestPage).not.toBeAttached();

      await appPO.navigateForward();
      await expectView(routerPage).not.toBeAttached();
      await expectView(standaloneViewTestPage).toBeActive();
    });

    test('should display standalone view component after browser back/forward navigation ({loadChildren: () => routes})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate(['test-pages/standalone-view-test-page/load-children/routes'], {
        target: await routerPage.view.getViewId(),
        cssClass: 'testee',
      });

      const standaloneViewTestPage = new StandaloneViewTestPagePO(appPO.view({cssClass: 'testee'}));
      await expectView(routerPage).not.toBeAttached();
      await expectView(standaloneViewTestPage).toBeActive();

      await appPO.navigateBack();
      await expectView(routerPage).toBeActive();
      await expectView(standaloneViewTestPage).not.toBeAttached();

      await appPO.navigateForward();
      await expectView(routerPage).not.toBeAttached();
      await expectView(standaloneViewTestPage).toBeActive();
    });

    test('should display standalone view component after browser back/forward navigation ({children: routes})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate(['test-pages/standalone-view-test-page/children'], {
        target: await routerPage.view.getViewId(),
        cssClass: 'testee',
      });

      const standaloneViewTestPage = new StandaloneViewTestPagePO(appPO.view({cssClass: 'testee'}));
      await expectView(routerPage).not.toBeAttached();
      await expectView(standaloneViewTestPage).toBeActive();

      await appPO.navigateBack();
      await expectView(routerPage).toBeActive();
      await expectView(standaloneViewTestPage).not.toBeAttached();

      await appPO.navigateForward();
      await expectView(routerPage).not.toBeAttached();
      await expectView(standaloneViewTestPage).toBeActive();
    });
  });

  test.describe('Non-Standalone Component', () => {

    test('should display non-standalone view component after browser back/forward navigation ({component: component})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate(['test-pages/non-standalone-view-test-page/component'], {
        target: await routerPage.view.getViewId(),
        cssClass: 'testee',
      });

      const nonStandaloneViewTestPage = new NonStandaloneViewTestPagePO(appPO.view({cssClass: 'testee'}));
      await expectView(routerPage).not.toBeAttached();
      await expectView(nonStandaloneViewTestPage).toBeActive();

      await appPO.navigateBack();
      await expectView(routerPage).toBeActive();
      await expectView(nonStandaloneViewTestPage).not.toBeAttached();

      await appPO.navigateForward();
      await expectView(routerPage).not.toBeAttached();
      await expectView(nonStandaloneViewTestPage).toBeActive();
    });

    test('should display non-standalone view component after browser back/forward navigation ({loadChildren: () => module})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate(['test-pages/non-standalone-view-test-page/load-children/module'], {
        target: await routerPage.view.getViewId(),
        cssClass: 'testee',
      });

      const nonStandaloneViewTestPage = new NonStandaloneViewTestPagePO(appPO.view({cssClass: 'testee'}));
      await expectView(routerPage).not.toBeAttached();
      await expectView(nonStandaloneViewTestPage).toBeActive();

      await appPO.navigateBack();
      await expectView(routerPage).toBeActive();
      await expectView(nonStandaloneViewTestPage).not.toBeAttached();

      await appPO.navigateForward();
      await expectView(routerPage).not.toBeAttached();
      await expectView(nonStandaloneViewTestPage).toBeActive();
    });

    test('should display non-standalone view component after browser back/forward navigation ({children: routes})', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
      await routerPage.navigate(['test-pages/non-standalone-view-test-page/children'], {
        target: await routerPage.view.getViewId(),
        cssClass: 'testee',
      });

      const nonStandaloneViewTestPage = new NonStandaloneViewTestPagePO(appPO.view({cssClass: 'testee'}));
      await expectView(routerPage).not.toBeAttached();
      await expectView(nonStandaloneViewTestPage).toBeActive();

      await appPO.navigateBack();
      await expectView(routerPage).toBeActive();
      await expectView(nonStandaloneViewTestPage).not.toBeAttached();

      await appPO.navigateForward();
      await expectView(routerPage).not.toBeAttached();
      await expectView(nonStandaloneViewTestPage).toBeActive();
    });
  });
});

/**
 * Reads the number of entries in browser session history.
 */
function getBrowserHistoryStackSize(page: Page): Promise<number> {
  return page.evaluate(() => history.length);
}

/**
 * Adds a part logging the active workbench element.
 */
function addActiveWorkbenchElementPart(partId: PartId, options?: {activate?: true}): (layout: WorkbenchLayout) => WorkbenchLayout {
  return (layout: WorkbenchLayout) => layout
    .addPart(partId, {dockTo: 'bottom-right'}, {label: 'Active Workbench Element Log', icon: 'terminal', ɵactivityId: 'activity.log'})
    .navigatePart(partId, [], {hint: 'active-workbench-element-log'})
    .modify(layout => options?.activate ? layout.activatePart(partId) : layout);
}
