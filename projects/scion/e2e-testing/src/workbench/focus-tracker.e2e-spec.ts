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
import {ActiveWorkbenchElementLogPagePO} from './page-object/test-pages/active-workbench-element-log-page.po';
import {LayoutPagePO} from './page-object/layout-page/layout-page.po';
import {DialogOpenerPagePO} from './page-object/dialog-opener-page.po';
import {MessageBoxOpenerPagePO} from './page-object/message-box-opener-page.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';
import {FocusTestPagePO} from './page-object/test-pages/focus-test-page.po';
import {MAIN_AREA} from '../workbench.model';
import {PartId, WorkbenchLayout} from '@scion/workbench';

test.describe('Focus Tracker', () => {

  test('should focus active view in active part when clicking its tab', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addPart('part.activity', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder'})
      .addView('view.1', {partId: 'part.main'})
      .activatePart('part.main')
      .activatePart('part.activity')
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Focus 'part.activity-1'.
    await appPO.part({partId: 'part.activity'}).bar.locator.click();

    // PRECONDITION: Expect 'view.1' and its part 'part.main' to be active, but not focused.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity']);
    await expect(appPO.part({partId: 'part.activity'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.activity'}).locator).toContainFocus();
    await expect(appPO.part({partId: 'part.main'}).state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).locator).not.toContainFocus();

    // TEST: Click tab of 'view.1'.
    await appPO.view({viewId: 'view.1'}).tab.click();

    // Expect 'view.1' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity', 'view.1']);
    await expect(appPO.part({partId: 'part.activity'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.activity'}).locator).not.toContainFocus();
    await expect(appPO.part({partId: 'part.main'}).state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).locator).toContainFocus();
  });

  test('should focus active view in active part when clicking its content', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addPart('part.activity', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder'})
      .addView('view.1', {partId: 'part.main'})
      .navigateView('view.1', ['test-pages/focus-test-page'])
      .activatePart('part.main')
      .activatePart('part.activity')
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Focus 'part.activity-1'.
    await appPO.part({partId: 'part.activity'}).bar.locator.click();

    // PRECONDITION: Expect 'view.1' and its part 'part.main' to be active, but not focused.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity']);
    await expect(appPO.part({partId: 'part.activity'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.activity'}).locator).toContainFocus();
    await expect(appPO.part({partId: 'part.main'}).state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).locator).not.toContainFocus();

    // TEST: Click content of 'view.1'.
    const viewPage = new FocusTestPagePO(appPO.view({viewId: 'view.1'}));
    await viewPage.firstField.click();

    // Expect 'view.1' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity', 'view.1']);
    await expect(appPO.part({partId: 'part.activity'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.activity'}).locator).not.toContainFocus();
    await expect(appPO.part({partId: 'part.main'}).state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).locator).toContainFocus();
  });

  test('should focus active view in active part when activating it', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addPart('part.activity', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder'})
      .addView('view.1', {partId: 'part.main'})
      .activatePart('part.main')
      .activatePart('part.activity')
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Focus 'part.activity-1'.
    await appPO.part({partId: 'part.activity'}).bar.locator.click();

    // PRECONDITION: Expect 'view.1' and its part 'part.main' to be active, but not focused.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity']);
    await expect(appPO.part({partId: 'part.activity'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.activity'}).locator).toContainFocus();
    await expect(appPO.part({partId: 'part.main'}).state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).locator).not.toContainFocus();

    // TEST: Activate 'view.1'.
    await appPO.workbench.activateView('view.1');

    // Expect 'view.1' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity', 'view.1']);
    await expect(appPO.part({partId: 'part.activity'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.activity'}).locator).not.toContainFocus();
    await expect(appPO.part({partId: 'part.main'}).state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).locator).toContainFocus();
  });

  test('should focus active view in inactive part when clicking its tab', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.left')
      .addPart('part.right', {align: 'right'})
      .navigatePart('part.left', ['path/to/part'])
      .addView('view.1', {partId: 'part.right'})
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Focus 'part.left'.
    await appPO.part({partId: 'part.left'}).bar.locator.click();

    // PRECONDITION: Expect 'view.1' to be active but not focused and its part 'part.right' to be inactive.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.left');
    await expect.poll(() => logPart.getLog()).toEqual(['part.left']);
    await expect(appPO.part({partId: 'part.left'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.left'}).locator).toContainFocus();
    await expect(appPO.part({partId: 'part.right'}).state('active')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).locator).not.toContainFocus();

    // TEST: Click tab of 'view.1'.
    await appPO.view({viewId: 'view.1'}).tab.click();

    // Expect 'view.1' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['part.left', 'view.1']);
    await expect(appPO.part({partId: 'part.left'}).state('active')).not.toBeVisible();
    await expect(appPO.part({partId: 'part.left'}).locator).not.toContainFocus();
    await expect(appPO.part({partId: 'part.right'}).state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).locator).toContainFocus();
  });

  test('should focus active view in inactive part when clicking its content', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.left')
      .addPart('part.right', {align: 'right'})
      .navigatePart('part.left', ['path/to/part'])
      .addView('view.1', {partId: 'part.right'})
      .navigateView('view.1', ['test-pages/focus-test-page'])
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Focus 'part.left'.
    await appPO.part({partId: 'part.left'}).bar.locator.click();

    // PRECONDITION: Expect 'view.1' to be active but not focused and its part 'part.right' to be inactive.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.left');
    await expect.poll(() => logPart.getLog()).toEqual(['part.left']);
    await expect(appPO.part({partId: 'part.left'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.left'}).locator).toContainFocus();
    await expect(appPO.part({partId: 'part.right'}).state('active')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).locator).not.toContainFocus();

    // TEST: Click content of 'view.1'.
    const viewPage = new FocusTestPagePO(appPO.view({viewId: 'view.1'}));
    await viewPage.firstField.click();

    // Expect 'view.1' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['part.left', 'view.1']);
    await expect(appPO.part({partId: 'part.left'}).state('active')).not.toBeVisible();
    await expect(appPO.part({partId: 'part.left'}).locator).not.toContainFocus();
    await expect(appPO.part({partId: 'part.right'}).state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).locator).toContainFocus();
  });

  test('should focus active view in inactive part when activating it', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.left')
      .addPart('part.right', {align: 'right'})
      .navigatePart('part.left', ['path/to/part'])
      .addView('view.1', {partId: 'part.right'})
      .navigateView('view.1', ['test-pages/focus-test-page'])
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Focus 'part.left'.
    await appPO.part({partId: 'part.left'}).bar.locator.click();

    // PRECONDITION: Expect 'view.1' to be active but not focused and its part 'part.right' to be inactive.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.left');
    await expect.poll(() => logPart.getLog()).toEqual(['part.left']);
    await expect(appPO.part({partId: 'part.left'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.left'}).locator).toContainFocus();
    await expect(appPO.part({partId: 'part.right'}).state('active')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).locator).not.toContainFocus();

    // TEST: Activate 'view.1'.
    await appPO.workbench.activateView('view.1');

    // Expect 'view.1' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['part.left', 'view.1']);
    await expect(appPO.part({partId: 'part.left'}).state('active')).not.toBeVisible();
    await expect(appPO.part({partId: 'part.left'}).locator).not.toContainFocus();
    await expect(appPO.part({partId: 'part.right'}).state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).locator).toContainFocus();
  });

  test('should focus inactive view in active part when clicking its tab', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addPart('part.activity', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder'})
      .addView('view.1', {partId: 'part.main'})
      .addView('view.2', {partId: 'part.main'})
      .activatePart('part.main')
      .activatePart('part.activity')
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Focus 'part.activity-1'.
    await appPO.part({partId: 'part.activity'}).bar.locator.click();

    // PRECONDITION: Expect 'view.2' to be inactive and its part 'part.main' to be active.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity']);
    await expect(appPO.part({partId: 'part.activity'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.activity'}).locator).toContainFocus();
    await expect(appPO.part({partId: 'part.main'}).state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.2'}).tab.state('active')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.2'}).tab.state('focus-within-view')).not.toBeVisible();

    // TEST: Click tab of 'view.2'.
    await appPO.view({viewId: 'view.2'}).tab.click();

    // Expect 'view.2' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.2');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity', 'view.2']);
    await expect(appPO.part({partId: 'part.activity'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.activity'}).locator).not.toContainFocus();
    await expect(appPO.part({partId: 'part.main'}).state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.2'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.2'}).tab.state('focus-within-view')).toBeVisible();
    await expect(appPO.view({viewId: 'view.2'}).locator).toContainFocus();
  });

  test('should focus inactive view in active part when activating it', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addPart('part.activity', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder'})
      .addView('view.1', {partId: 'part.main'})
      .addView('view.2', {partId: 'part.main'})
      .activatePart('part.main')
      .activatePart('part.activity')
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Focus 'part.activity-1'.
    await appPO.part({partId: 'part.activity'}).bar.locator.click();

    // PRECONDITION: Expect 'view.2' to be inactive and its part 'part.main' to be active.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity']);
    await expect(appPO.part({partId: 'part.activity'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.activity'}).locator).toContainFocus();
    await expect(appPO.part({partId: 'part.main'}).state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.2'}).tab.state('active')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.2'}).tab.state('focus-within-view')).not.toBeVisible();

    // TEST: Activate 'view.2'.
    await appPO.workbench.activateView('view.2');

    // Expect 'view.1' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.2');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity', 'view.2']);
    await expect(appPO.part({partId: 'part.activity'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.activity'}).locator).not.toContainFocus();
    await expect(appPO.part({partId: 'part.main'}).state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.2'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.2'}).tab.state('focus-within-view')).toBeVisible();
    await expect(appPO.view({viewId: 'view.2'}).locator).toContainFocus();
  });

  test('should focus inactive view in inactive part when clicking its tab', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.left')
      .addPart('part.right', {align: 'right'})
      .navigatePart('part.left', ['path/to/part'])
      .addView('view.1', {partId: 'part.right'})
      .addView('view.2', {partId: 'part.right'})
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Focus 'part.left'.
    await appPO.part({partId: 'part.left'}).bar.locator.click();

    // PRECONDITION: Expect 'view.2' to be inactive and its part 'part.right' to be inactive.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.left');
    await expect.poll(() => logPart.getLog()).toEqual(['part.left']);
    await expect(appPO.part({partId: 'part.left'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.left'}).locator).toContainFocus();
    await expect(appPO.part({partId: 'part.right'}).state('active')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.2'}).tab.state('active')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.2'}).tab.state('focus-within-view')).not.toBeVisible();

    // TEST: Click tab of 'view.2'.
    await appPO.view({viewId: 'view.2'}).tab.click();

    // Expect 'view.2' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.2');
    await expect.poll(() => logPart.getLog()).toEqual(['part.left', 'view.2']);
    await expect(appPO.part({partId: 'part.left'}).state('active')).not.toBeVisible();
    await expect(appPO.part({partId: 'part.left'}).locator).not.toContainFocus();
    await expect(appPO.part({partId: 'part.right'}).state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.2'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.2'}).tab.state('focus-within-view')).toBeVisible();
    await expect(appPO.view({viewId: 'view.2'}).locator).toContainFocus();
  });

  test('should focus inactive view in inactive part when activating it', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.left')
      .addPart('part.right', {align: 'right'})
      .navigatePart('part.left', ['path/to/part'])
      .addView('view.1', {partId: 'part.right'})
      .addView('view.2', {partId: 'part.right'})
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Focus 'part.left'.
    await appPO.part({partId: 'part.left'}).bar.locator.click();

    // PRECONDITION: Expect 'view.2' to be inactive and its part 'part.right' to be inactive.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.left');
    await expect.poll(() => logPart.getLog()).toEqual(['part.left']);
    await expect(appPO.part({partId: 'part.left'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.left'}).locator).toContainFocus();
    await expect(appPO.part({partId: 'part.right'}).state('active')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.2'}).tab.state('active')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.2'}).tab.state('focus-within-view')).not.toBeVisible();

    // TEST: Activate 'view.2'.
    await appPO.workbench.activateView('view.2');

    // Expect 'view.2' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.2');
    await expect.poll(() => logPart.getLog()).toEqual(['part.left', 'view.2']);
    await expect(appPO.part({partId: 'part.left'}).state('active')).not.toBeVisible();
    await expect(appPO.part({partId: 'part.left'}).locator).not.toContainFocus();
    await expect(appPO.part({partId: 'part.right'}).state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.2'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.2'}).tab.state('focus-within-view')).toBeVisible();
    await expect(appPO.view({viewId: 'view.2'}).locator).toContainFocus();
  });

  test('should focus active part when clicking its bar', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addPart('part.activity', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder'})
      .navigatePart('part.main', ['path/to/part'])
      .activatePart('part.main')
      .activatePart('part.activity')
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Focus 'part.activity-1'.
    await appPO.part({partId: 'part.activity'}).bar.locator.click();

    // PRECONDITION: Expect 'part.main' to be active, but not focused.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity']);
    await expect(appPO.part({partId: 'part.activity'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.activity'}).locator).toContainFocus();
    await expect(appPO.part({partId: 'part.main'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.main'}).locator).not.toContainFocus();

    // TEST: Click bar of 'part.main'.
    await appPO.part({partId: 'part.main'}).bar.filler.click();

    // Expect 'part.main' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.main');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity', 'part.main']);
    await expect(appPO.part({partId: 'part.activity'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.activity'}).locator).not.toContainFocus();
    await expect(appPO.part({partId: 'part.main'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.main'}).locator).toContainFocus();
  });

  test('should focus active part when clicking its content', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addPart('part.activity', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder'})
      .navigatePart('part.main', ['test-pages/focus-test-page'])
      .activatePart('part.main')
      .activatePart('part.activity')
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Focus 'part.activity-1'.
    await appPO.part({partId: 'part.activity'}).bar.locator.click();

    // PRECONDITION: Expect 'part.main' to be active, but not focused.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity']);
    await expect(appPO.part({partId: 'part.activity'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.activity'}).locator).toContainFocus();
    await expect(appPO.part({partId: 'part.main'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.main'}).locator).not.toContainFocus();

    // TEST: Click content of 'part.main'.
    const partPage = new FocusTestPagePO(appPO.part({partId: 'part.main'}));
    await partPage.firstField.click();

    // Expect 'part.main' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.main');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity', 'part.main']);
    await expect(appPO.part({partId: 'part.activity'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.activity'}).locator).not.toContainFocus();
    await expect(appPO.part({partId: 'part.main'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.main'}).locator).toContainFocus();
  });

  test('should focus active part when activating it', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addPart('part.activity', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder'})
      .navigatePart('part.main', ['path/to/part'])
      .activatePart('part.main')
      .activatePart('part.activity')
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Focus 'part.activity-1'.
    await appPO.part({partId: 'part.activity'}).bar.locator.click();

    // PRECONDITION: Expect 'part.main' to be active, but not focused.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity']);
    await expect(appPO.part({partId: 'part.activity'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.activity'}).locator).toContainFocus();
    await expect(appPO.part({partId: 'part.main'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.main'}).locator).not.toContainFocus();

    // TEST: Activate 'part.main'.
    await appPO.workbench.activatePart('part.main');

    // Expect 'part.main' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.main');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity', 'part.main']);
    await expect(appPO.part({partId: 'part.activity'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.activity'}).locator).not.toContainFocus();
    await expect(appPO.part({partId: 'part.main'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.main'}).locator).toContainFocus();
  });

  test('should focus inactive part when clicking its bar', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.left')
      .addPart('part.right', {align: 'right'})
      .navigatePart('part.left', ['path/to/part'])
      .navigatePart('part.right', ['path/to/part'])
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Focus 'part.left'.
    await appPO.part({partId: 'part.left'}).bar.locator.click();

    // PRECONDITION: Expect 'part.right' to be inactive.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.left');
    await expect.poll(() => logPart.getLog()).toEqual(['part.left']);
    await expect(appPO.part({partId: 'part.left'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.left'}).locator).toContainFocus();
    await expect(appPO.part({partId: 'part.right'}).state('active')).not.toBeVisible();
    await expect(appPO.part({partId: 'part.right'}).locator).not.toContainFocus();

    // TEST: Click bar of 'part.right'.
    await appPO.part({partId: 'part.right'}).bar.locator.click();

    // Expect 'part.right' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right');
    await expect.poll(() => logPart.getLog()).toEqual(['part.left', 'part.right']);
    await expect(appPO.part({partId: 'part.left'}).state('active')).not.toBeVisible();
    await expect(appPO.part({partId: 'part.left'}).locator).not.toContainFocus();
    await expect(appPO.part({partId: 'part.right'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.right'}).locator).toContainFocus();
  });

  test('should focus inactive part when clicking its content', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.left')
      .addPart('part.right', {align: 'right'})
      .navigatePart('part.left', ['path/to/part'])
      .navigatePart('part.right', ['test-pages/focus-test-page'])
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Focus 'part.left'.
    await appPO.part({partId: 'part.left'}).bar.locator.click();

    // PRECONDITION: Expect 'part.right' to be inactive.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.left');
    await expect.poll(() => logPart.getLog()).toEqual(['part.left']);
    await expect(appPO.part({partId: 'part.left'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.left'}).locator).toContainFocus();
    await expect(appPO.part({partId: 'part.right'}).state('active')).not.toBeVisible();
    await expect(appPO.part({partId: 'part.right'}).locator).not.toContainFocus();

    // TEST: Click content of 'part.right'.
    const partPage = new FocusTestPagePO(appPO.part({partId: 'part.right'}));
    await partPage.firstField.click();

    // Expect 'part.right' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right');
    await expect.poll(() => logPart.getLog()).toEqual(['part.left', 'part.right']);
    await expect(appPO.part({partId: 'part.left'}).state('active')).not.toBeVisible();
    await expect(appPO.part({partId: 'part.left'}).locator).not.toContainFocus();
    await expect(appPO.part({partId: 'part.right'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.right'}).locator).toContainFocus();
  });

  test('should focus inactive part when activating it', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.left')
      .addPart('part.right', {align: 'right'})
      .navigatePart('part.left', ['path/to/part'])
      .navigatePart('part.right', ['path/to/part'])
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Focus 'part.left'.
    await appPO.part({partId: 'part.left'}).bar.locator.click();

    // PRECONDITION: Expect 'part.right' to be inactive.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.left');
    await expect.poll(() => logPart.getLog()).toEqual(['part.left']);
    await expect(appPO.part({partId: 'part.left'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.left'}).locator).toContainFocus();
    await expect(appPO.part({partId: 'part.right'}).state('active')).not.toBeVisible();
    await expect(appPO.part({partId: 'part.right'}).locator).not.toContainFocus();

    // TEST: Activate 'part.right'.
    await appPO.workbench.activatePart('part.right');

    // Expect 'part.right' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right');
    await expect.poll(() => logPart.getLog()).toEqual(['part.left', 'part.right']);
    await expect(appPO.part({partId: 'part.left'}).state('active')).not.toBeVisible();
    await expect(appPO.part({partId: 'part.left'}).locator).not.toContainFocus();
    await expect(appPO.part({partId: 'part.right'}).state('active')).toBeVisible();
    await expect(appPO.part({partId: 'part.right'}).locator).toContainFocus();
  });

  test('should switch focus when switching tabs', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.1', {partId: 'part.main'})
      .addView('view.2', {partId: 'part.main'})
      .addView('view.3', {partId: 'part.main'})
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // TEST: Click 'view.1'.
    await appPO.view({viewId: 'view.1'}).tab.click();

    // Expect 'view.1' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1']);
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).locator).toContainFocus();
    await expect(appPO.view({viewId: 'view.2'}).tab.state('active')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.2'}).tab.state('focus-within-view')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.3'}).tab.state('active')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.3'}).tab.state('focus-within-view')).not.toBeVisible();
    await expect(appPO.part({partId: 'part.main'}).state('active')).toBeVisible();

    // TEST: Click 'view.2'.
    await appPO.view({viewId: 'view.2'}).tab.click();

    // Expect 'view.2' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.2');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', 'view.2']);
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.2'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.2'}).tab.state('focus-within-view')).toBeVisible();
    await expect(appPO.view({viewId: 'view.2'}).locator).toContainFocus();
    await expect(appPO.view({viewId: 'view.3'}).tab.state('active')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.3'}).tab.state('focus-within-view')).not.toBeVisible();
    await expect(appPO.part({partId: 'part.main'}).state('active')).toBeVisible();

    // TEST: Click 'view.3'.
    await appPO.view({viewId: 'view.3'}).tab.click();

    // Expect 'view.3' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.3');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', 'view.2', 'view.3']);
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.2'}).tab.state('active')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.2'}).tab.state('focus-within-view')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.3'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.3'}).tab.state('focus-within-view')).toBeVisible();
    await expect(appPO.view({viewId: 'view.3'}).locator).toContainFocus();
    await expect(appPO.part({partId: 'part.main'}).state('active')).toBeVisible();
  });

  test('should focus activity when opening it (activity without views)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addPart('part.activity', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder', ɵactivityId: 'activity.1'})
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // TEST: Open 'activity.1'.
    await appPO.activityItem({activityId: 'activity.1'}).click();

    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity']);
    await expect(appPO.part({partId: 'part.activity'}).locator).toContainFocus();
    await expect(appPO.part({partId: 'part.activity'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).toBeVisible();

    // TEST: Close 'activity.1'.
    await appPO.activityItem({activityId: 'activity.1'}).click();

    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity', null]);
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).locator).toContainFocus();

    // TEST: Activate 'part.activity'.
    await appPO.workbench.activatePart('part.activity');

    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity', null, 'part.activity']);
    await expect(appPO.part({partId: 'part.activity'}).locator).toContainFocus();
    await expect(appPO.part({partId: 'part.activity'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).toBeVisible();
  });

  test('should focus activity when opening it (activity with views)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addPart('part.activity', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder', ɵactivityId: 'activity.1'})
      .addView('view.1', {partId: 'part.activity'})
      .addView('view.2', {partId: 'part.activity'})
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // TEST: Open 'activity.1'.
    await appPO.activityItem({activityId: 'activity.1'}).click();

    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1']);
    await expect(appPO.part({partId: 'part.activity'}).locator).toContainFocus();
    await expect(appPO.part({partId: 'part.activity'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).locator).toContainFocus();

    // TEST: Close 'activity.1'.
    await appPO.activityItem({activityId: 'activity.1'}).click();

    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', null]);
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).locator).toContainFocus();

    // TEST: Activate 'part.activity'.
    await appPO.workbench.activatePart('part.activity');

    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', null, 'view.1']);
    await expect(appPO.part({partId: 'part.activity'}).locator).toContainFocus();
    await expect(appPO.part({partId: 'part.activity'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).locator).toContainFocus();
  });

  test('should not focus activity on restore after minimization (activity without views)', async ({appPO, workbenchNavigator, page}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addPart('part.activity', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder', ɵactivityId: 'activity.1'})
      .navigatePart('part.activity', ['test-pages/focus-test-page'])
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // TEST: Open 'activity.1'.
    await appPO.activityItem({activityId: 'activity.1'}).click();

    // TEST: Click content of 'part.activity'.
    const partPage = new FocusTestPagePO(appPO.part({partId: 'part.activity'}));
    await partPage.firstField.click();

    // PRECONDITION: Expect activity to be opened.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity');
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity']);
    await expect(appPO.part({partId: 'part.activity'}).locator).toContainFocus();
    await expect(appPO.part({partId: 'part.activity'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).toBeVisible();

    // TEST: Close activities via minimize.
    await page.keyboard.press('Control+Shift+F12');

    // Expect activity to be closed and not focused.
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).not.toBeVisible();

    // TEST: Open activities via maximize.
    await page.keyboard.press('Control+Shift+F12');

    // Expect activity not to be focused.
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect.poll(() => logPart.getLog()).toEqual(['part.activity', null]);
    await expect(appPO.part({partId: 'part.activity'}).locator).not.toContainFocus();
    await expect(appPO.part({partId: 'part.activity'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).not.toBeVisible();
  });

  test('should not focus activity on restore after minimization (activity with views)', async ({appPO, workbenchNavigator, page}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addPart('part.activity', {dockTo: 'left-top'}, {label: 'Activity', icon: 'folder', ɵactivityId: 'activity.1'})
      .addView('view.1', {partId: 'part.activity'})
      .navigateView('view.1', ['test-pages/focus-test-page'])
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // TEST: Open 'activity.1'.
    await appPO.activityItem({activityId: 'activity.1'}).click();

    // TEST: Click content of 'view.1'.
    const partPage = new FocusTestPagePO(appPO.part({partId: 'part.activity'}));
    await partPage.firstField.click();

    // PRECONDITION: Expect activity to be opened.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1']);
    await expect(appPO.view({viewId: 'view.1'}).locator).toContainFocus();
    await expect(appPO.part({partId: 'part.activity'}).locator).toContainFocus();
    await expect(appPO.part({partId: 'part.activity'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).toBeVisible();

    // TEST: Close activities via minimize.
    await page.keyboard.press('Control+Shift+F12');

    // Expect activity to be closed and not focused.
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).not.toBeVisible();

    // TEST: Open activities via maximize.
    await page.keyboard.press('Control+Shift+F12');

    // Expect activity not to be focused.
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', null]);
    await expect(appPO.view({viewId: 'view.1'}).locator).not.toContainFocus();
    await expect(appPO.part({partId: 'part.activity'}).locator).not.toContainFocus();
    await expect(appPO.part({partId: 'part.activity'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).not.toBeVisible();
  });

  test('should not lose workbench view focus when clicking tab', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.1', {partId: 'part.main'})
      .navigateView('view.1', ['test-pages/focus-test-page'])
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Focus content of 'view.1'.
    const viewPage = new FocusTestPagePO(appPO.view({viewId: 'view.1'}));
    await viewPage.firstField.click();

    // PRECONDITION: Expect 'view.1' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1']);
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).toBeVisible();
    await expect(viewPage.firstField).toBeFocused();

    // TEST: Click tab of 'view.1'.
    await appPO.view({viewId: 'view.1'}).tab.click();

    // Expect tab of 'view.1' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1']);
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.locator).toContainFocus();
  });

  test('should not lose workbench view focus when clicking part action', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.1', {partId: 'part.main'})
      .navigateView('view.1', ['test-pages/focus-test-page'])
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    // Register part action.
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('<button>search</button>', {viewId: 'view.1', cssClass: 'testee'});

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();
    await layoutPage.view.tab.close();

    // Focus content of 'view.1'.
    const viewPage = new FocusTestPagePO(appPO.view({viewId: 'view.1'}));
    await viewPage.firstField.click();

    // PRECONDITION: Expect 'view.1' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1']);
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).toBeVisible();
    await expect(viewPage.firstField).toBeFocused();

    // TEST: Click part action.
    const partAction = appPO.part({partId: 'part.main'}).bar.action({cssClass: 'testee'});
    await partAction.locator.click();

    // Expect tab of 'view.1' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1']);
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).toBeVisible();
    await expect(partAction.locator).toContainFocus();
  });

  test('should not lose workbench view focus when clicking view menu', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.1', {partId: 'part.main'})
      .navigateView('view.1', ['test-pages/focus-test-page'])
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Focus content of 'view.1'.
    const viewPage = new FocusTestPagePO(appPO.view({viewId: 'view.1'}));
    await viewPage.firstField.click();

    // PRECONDITION: Expect 'view.1' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1']);
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).toBeVisible();
    await expect(viewPage.firstField).toBeFocused();

    // TEST: Open view list menu.
    const viewListMenu = await appPO.part({partId: 'part.main'}).bar.openViewListMenu();

    // Expect tab of 'view.1' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1']);
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).toBeVisible();
    await expect(viewListMenu.filter).toBeFocused();
  });

  test('should not lose DOM focus when clicking part title', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main', {title: 'Part'})
      .addView('view.1', {partId: 'part.main'})
      .navigateView('view.1', ['test-pages/focus-test-page'])
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Focus content of 'view.1'.
    const viewPage = new FocusTestPagePO(appPO.view({viewId: 'view.1'}));
    await viewPage.firstField.click();

    // PRECONDITION: Expect 'view.1' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1']);
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).toBeVisible();
    await expect(viewPage.firstField).toBeFocused();

    // TEST: Click part title.
    await appPO.part({partId: 'part.main'}).bar.title.click();

    // Expect 'view.1' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1']);
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).toBeVisible();
    await expect(viewPage.firstField).toBeFocused();
  });

  test('should not lose DOM focus when clicking part bar', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main', {title: 'Part'})
      .addView('view.1', {partId: 'part.main'})
      .navigateView('view.1', ['test-pages/focus-test-page'])
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Focus content of 'view.1'.
    const viewPage = new FocusTestPagePO(appPO.view({viewId: 'view.1'}));
    await viewPage.firstField.click();

    // PRECONDITION: Expect 'view.1' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1']);
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).toBeVisible();
    await expect(viewPage.firstField).toBeFocused();

    // TEST: Click part bar.
    await appPO.part({partId: 'part.main'}).bar.filler.click();

    // Expect 'view.1' to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1']);
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).toBeVisible();
    await expect(viewPage.firstField).toBeFocused();
  });

  test('should preserve view focus on re-layout', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.1', {partId: 'part.main'})
      .navigateView('view.1', ['test-layout'])
      .activateView('view.1')
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Focus 'view.1'.
    await appPO.view({viewId: 'view.1'}).tab.click();

    // PRECONDITION: Expect 'view.1' to be active and focused.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1']);
    await expect(appPO.view({viewId: 'view.1'}).viewport).toContainFocus();

    // Force a relayout by creating a part on the left.
    const layoutPage = new LayoutPagePO(appPO.view({viewId: 'view.1'}));
    await layoutPage.modifyLayout(layout => layout
      .addPart('part.left', {align: 'left', relativeTo: 'part.main'})
      .navigatePart('part.left', ['path/to/part']),
    );

    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MPart({
              id: 'part.left',
              views: [],
            }),
            child2: new MPart({
              id: 'part.main',
              views: [{id: 'view.1'}],
              activeViewId: 'view.1',
            }),
          }),
          activePartId: 'part.main',
        },
      },
    });

    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1']);
    await expect.poll(() => appPO.activePart({grid: 'main'}).getPartId()).toEqual('part.main');
    await expect(appPO.view({viewId: 'view.1'}).viewport).toContainFocus();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).toBeVisible();
  });

  test('should preserve part focus on re-layout', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .navigatePart('part.main', ['test-layout'])
      .activatePart('part.main')
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Focus 'part.main'.
    await appPO.part({partId: 'part.main'}).bar.filler.click();

    // PRECONDITION: Expect 'part.main' to be active and focused.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.main');
    await expect.poll(() => logPart.getLog()).toEqual(['part.main']);
    await expect(appPO.part({partId: 'part.main'}).slot.viewport).toContainFocus();

    // Force a relayout by creating a part on the left.
    const layoutPage = new LayoutPagePO(appPO.part({partId: 'part.main'}));
    await layoutPage.modifyLayout(layout => layout
      .addPart('part.left', {align: 'left', relativeTo: 'part.main'})
      .navigatePart('part.left', ['path/to/part']),
    );

    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MPart({
              id: 'part.left',
              views: [],
            }),
            child2: new MPart({
              id: 'part.main',
              views: [],
            }),
          }),
          activePartId: 'part.main',
        },
      },
    });

    await expect.poll(() => appPO.focusOwner()).toEqual('part.main');
    await expect.poll(() => logPart.getLog()).toEqual(['part.main']);
    await expect.poll(() => appPO.activePart({grid: 'main'}).getPartId()).toEqual('part.main');
    await expect(appPO.part({partId: 'part.main'}).slot.viewport).toContainFocus();
  });

  test('should preserve desktop focus on re-layout', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, desktop: 'layout-page'});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // PRECONDITION: Expect 'part.main' to be active and focused.
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect.poll(() => logPart.getLog()).toEqual([]);

    // Force a relayout by creating a part on the left.
    const layoutPage = new LayoutPagePO(appPO.desktop);
    await layoutPage.modifyLayout(layout => layout
      .addPart('part.left', {align: 'left'})
      .navigatePart('part.left', ['path/to/part']),
    );

    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MPart({
              id: 'part.left',
              views: [],
            }),
            child2: new MPart({
              id: MAIN_AREA,
              views: [],
            }),
          }),
          activePartId: MAIN_AREA,
        },
      },
    });

    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect.poll(() => logPart.getLog()).toEqual([]);
    await expect.poll(() => appPO.activePart({grid: 'main'}).getPartId()).toEqual(MAIN_AREA);
    await expect(layoutPage.locator).toContainFocus();
  });

  test('should focus dialog when opening dialog', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.left', {title: 'Part Left'})
      .addPart('part.right', {align: 'right'})
      .addView('view.1', {partId: 'part.left'})
      .addView('view.2', {partId: 'part.right'})
      .navigateView('view.1', ['test-dialog-opener'])
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Focus 'view.1'.
    await appPO.view({viewId: 'view.1'}).tab.click();

    // PRECONDITION: Expect dialog opener view to have workbench focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1']);

    // TEST: Open dialog.
    const dialogOpener = new DialogOpenerPagePO(appPO.view({viewId: 'view.1'}));
    await dialogOpener.open('focus-test-page', {cssClass: 'testee'});
    const dialogPage = new FocusTestPagePO(appPO.dialog({cssClass: 'testee'}));
    const dialogId = await dialogPage.dialog.getDialogId();

    // Expect dialog to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', dialogId]);
    await expect(dialogPage.firstField).toBeFocused();

    // TEST: Focus element outside the dialog: Click bar of 'part.left'.
    await appPO.part({partId: 'part.left'}).bar.filler.click();

    // Expect dialog to still have the DOM focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', dialogId]);
    await expect(dialogPage.firstField).toBeFocused();

    // TEST: Focus element outside the dialog: Click title of 'part.left'.
    await appPO.part({partId: 'part.left'}).bar.title.click();

    // Expect dialog to still have the DOM focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', dialogId]);
    await expect(dialogPage.firstField).toBeFocused();

    // TEST: Focus element outside the dialog: Click tab of 'view.1'.
    await appPO.view({viewId: 'view.1'}).tab.click();

    // Expect dialog to still have the workbench focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', dialogId]);
    await expect(appPO.view({viewId: 'view.1'}).tab.locator).toContainFocus();

    // TEST: Focus element outside the dialog: Click tab of 'view.2'.
    await appPO.view({viewId: 'view.2'}).tab.click();

    // Expect dialog not to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.2');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', dialogId, 'view.2']);
    await expect(appPO.view({viewId: 'view.2'}).locator).toContainFocus();

    // TEST: Focus dialog.
    await dialogPage.firstField.click();

    // Expect dialog to have the focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', dialogId, 'view.2', dialogId]);
    await expect(dialogPage.firstField).toBeFocused();

    // TEST: Close the dialog.
    await dialogPage.dialog.close();

    // Expect dialog opener view to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', dialogId, 'view.2', dialogId, 'view.1']);
    await expect(dialogOpener.openButton).toBeFocused();
  });

  test('should focus dialog when activating view with dialog', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.1', {partId: 'part.main'})
      .addView('view.2', {partId: 'part.main'})
      .navigateView('view.1', ['test-dialog-opener'])
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    // Open dialog.
    const dialogOpener = new DialogOpenerPagePO(appPO.view({viewId: 'view.1'}));
    await dialogOpener.open('focus-test-page', {cssClass: 'testee'});
    const dialogPage = new FocusTestPagePO(appPO.dialog({cssClass: 'testee'}));
    const dialogId = await dialogPage.dialog.getDialogId();

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Activate other view.
    await appPO.view({viewId: 'view.2'}).tab.click();

    // PRECONDITION: Expect 'view.2' to have focus and the dialog not to display.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.2');
    await expect.poll(() => logPart.getLog()).toEqual(['view.2']);
    await expect(dialogPage.dialog.locator).not.toBeVisible();

    // TEST: Activate view with dialog.
    await dialogOpener.view.tab.click();

    // Expect dialog to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual(['view.2', dialogId]);
    await expect(dialogPage.dialog.locator).toBeVisible();
    await expect(dialogPage.firstField).toBeFocused();
  });

  test('should focus dialog when application-modal dialog is opened and activating view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.1', {partId: 'part.main'})
      .navigateView('view.1', ['test-dialog-opener'])
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Open application-modal dialog.
    const dialogOpener = new DialogOpenerPagePO(appPO.view({viewId: 'view.1'}));
    await dialogOpener.open('focus-test-page', {cssClass: 'testee', modality: 'application'});
    const dialogPage = new FocusTestPagePO(appPO.dialog({cssClass: 'testee'}));
    const dialogId = await dialogPage.dialog.getDialogId();

    // PRECONDITION: Expect dialog to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', dialogId]);
    await expect(dialogPage.firstField).toBeFocused();

    // TEST: Activate view.
    await appPO.workbench.activateView('view.1');

    // Expect dialog to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', dialogId]);
    await expect(dialogPage.firstField).toBeFocused();
  });

  test('should focus dialog when clicking dialog header', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.left', {title: 'Part Left'})
      .addPart('part.right', {align: 'right'})
      .addView('view.1', {partId: 'part.left'})
      .addView('view.2', {partId: 'part.right'})
      .navigateView('view.1', ['test-dialog-opener'])
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    // Open dialog.
    const dialogOpener = new DialogOpenerPagePO(appPO.view({viewId: 'view.1'}));
    await dialogOpener.open('focus-test-page', {cssClass: 'testee'});
    const dialogPage = new FocusTestPagePO(appPO.dialog({cssClass: 'testee'}));
    const dialogId = await dialogPage.dialog.getDialogId();

    // Click bar of 'part.right'.
    await appPO.part({partId: 'part.right'}).bar.filler.click();

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // PRECONDITION: Expect dialog not to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.2');
    await expect.poll(() => logPart.getLog()).toEqual([]);
    await expect(appPO.view({viewId: 'view.2'}).locator).toContainFocus();

    // TEST: Focus dialog header.
    await dialogPage.dialog.header.click();

    // Expect dialog to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual([dialogId]);
    await expect(appPO.dialog({dialogId}).dialog).toContainFocus();
  });

  test('should focus messagebox when opening messagebox', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.1', {partId: 'part.main'})
      .navigateView('view.1', ['test-message-box-opener'])
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Focus 'view.1'.
    await appPO.view({viewId: 'view.1'}).tab.click();

    // PRECONDITION: Expect messagebox opener view to have workbench focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1']);

    // TEST: Open messagebox.
    const messageboxOpener = new MessageBoxOpenerPagePO(appPO, {viewId: 'view.1'});
    await messageboxOpener.open('component:focus-test-page', {cssClass: 'testee'});
    const messageboxPage = new FocusTestPagePO(appPO.dialog({cssClass: 'testee'}));
    const dialogId = await messageboxPage.dialog.getDialogId();

    // Expect messagebox to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', dialogId]);
    await expect(messageboxPage.firstField).toBeFocused();

    // TEST: Close the messagebox.
    await appPO.messagebox({dialogId}).clickActionButton('ok');

    // Expect messagebox opener view to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', dialogId, 'view.1']);
    await expect(messageboxOpener.openButton).toBeFocused();
  });

  test('should focus messagebox when activating view with messagebox', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.1', {partId: 'part.main'})
      .addView('view.2', {partId: 'part.main'})
      .navigateView('view.1', ['test-message-box-opener'])
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    // Open messagebox.
    const messageboxOpener = new MessageBoxOpenerPagePO(appPO, {viewId: 'view.1'});
    await messageboxOpener.open('component:focus-test-page', {cssClass: 'testee'});
    const messageboxPage = new FocusTestPagePO(appPO.dialog({cssClass: 'testee'}));
    const dialogId = await messageboxPage.dialog.getDialogId();

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Activate other view.
    await appPO.view({viewId: 'view.2'}).tab.click();

    // PRECONDITION: Expect 'view.2' to have focus and the messagebox not to display.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.2');
    await expect.poll(() => logPart.getLog()).toEqual(['view.2']);
    await expect(appPO.messagebox({dialogId}).locator).not.toBeVisible();

    // TEST: Activate view with messagebox.
    await messageboxOpener.view.tab.click();

    // Expect messagebox to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual(['view.2', dialogId]);
    await expect(appPO.messagebox({dialogId}).locator).toBeVisible();
    await expect(messageboxPage.firstField).toBeFocused();
  });

  test('should focus popup when opening popup', async ({appPO, workbenchNavigator, page}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.left', {title: 'Part Left'})
      .addPart('part.right', {align: 'right'})
      .addView('view.1', {partId: 'part.left'})
      .addView('view.2', {partId: 'part.right'})
      .navigateView('view.1', ['test-popup-opener'])
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Focus 'view.1'.
    await appPO.view({viewId: 'view.1'}).tab.click();

    // PRECONDITION: Expect popup opener view to have workbench focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1']);

    // TEST: Open popup.
    const popupOpener = new PopupOpenerPagePO(appPO.view({viewId: 'view.1'}));
    await popupOpener.selectPopupComponent('focus-test-page');
    await popupOpener.enterCssClass('testee');
    await popupOpener.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpener.open();

    const popupPage = new FocusTestPagePO(appPO.popup({cssClass: 'testee'}));
    const popupId = await popupPage.popup.getPopupId();

    // Expect popup to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(popupId);
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', popupId]);
    await expect(popupPage.firstField).toBeFocused();

    // TEST: Focus element outside the popup: Click tab of 'view.2'.
    await appPO.view({viewId: 'view.2'}).tab.click();

    // Expect popup not to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.2');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', popupId, 'view.2']);
    await expect(appPO.view({viewId: 'view.2'}).locator).toContainFocus();

    // TEST: Focus popup.
    await popupPage.firstField.click();

    // Expect popup to have the focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(popupId);
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', popupId, 'view.2', popupId]);
    await expect(popupPage.firstField).toBeFocused();

    // TEST: Close the popup by pressing Escape.
    await page.keyboard.press('Escape');

    // Expect popup opener view to have focus.
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', popupId, 'view.2', popupId, null]);
  });

  test('should focus popup when activating view with popup', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.1', {partId: 'part.main'})
      .addView('view.2', {partId: 'part.main'})
      .navigateView('view.1', ['test-popup-opener'])
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    // Open popup.
    const popupOpener = new PopupOpenerPagePO(appPO.view({viewId: 'view.1'}));
    await popupOpener.selectPopupComponent('focus-test-page');
    await popupOpener.enterCssClass('testee');
    await popupOpener.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpener.open();

    const popupPage = new FocusTestPagePO(appPO.popup({cssClass: 'testee'}));
    const popupId = await popupPage.popup.getPopupId();

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Activate other view.
    await appPO.view({viewId: 'view.2'}).tab.click();

    // PRECONDITION: Expect 'view.2' to have focus and the popup not to display.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.2');
    await expect.poll(() => logPart.getLog()).toEqual(['view.2']);
    await expect(appPO.popup({popupId}).locator).not.toBeVisible();

    // TEST: Activate view with popup.
    await popupOpener.view.tab.click();

    // Expect popup to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(popupId);
    await expect.poll(() => logPart.getLog()).toEqual(['view.2', popupId]);
    await expect(appPO.popup({popupId}).locator).toBeVisible();
    await expect(popupPage.firstField).toBeFocused();
  });

  test('should preserve workbench focus when focusing non-workbench element', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.1', {partId: 'part.main'})
      .navigateView('view.1', ['test-pages/focus-test-page'])
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Focus content of 'view.1'.
    const viewPage = new FocusTestPagePO(appPO.view({viewId: 'view.1'}));
    await viewPage.firstField.click();

    // PRECONDITION: Expect 'view.1' to have workbench focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1']);
    await expect(appPO.view({viewId: 'view.1'}).locator).toContainFocus();

    // TEST: Click application header.
    await appPO.header.openSettingsMenu();

    // Expect workbench focus not to be unset.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1']);
    await expect(appPO.workbenchRoot).not.toContainFocus();
  });

  test('should focus part if navigated and removing its last view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.1', {partId: 'part.main'})
      .addView('view.2', {partId: 'part.main'})
      .navigatePart('part.main', ['path/to/part'])
      .activateView('view.1')
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Focus 'view.1'.
    await appPO.view({viewId: 'view.1'}).tab.click();

    // PRECONDITION: Expect 'view.1' to be active and focused.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1']);
    await expect(appPO.view({viewId: 'view.1'}).viewport).toContainFocus();

    // Close view.1.
    await appPO.view({viewId: 'view.1'}).tab.close();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.2');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', 'view.2']);
    await expect(appPO.view({viewId: 'view.2'}).viewport).toContainFocus();

    // Close view.2.
    await appPO.view({viewId: 'view.2'}).tab.close();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.main');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', 'view.2', 'part.main']);
    await expect(appPO.part({partId: 'part.main'}).slot.viewport).toContainFocus();
  });

  test('should focus tab when start dragging active but not focused tab', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.1', {partId: 'part.main'})
      .addView('view.2', {partId: 'part.main'})
      .activateView('view.1')
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // PRECONDITION: Expect 'view.2' to be inactive and not focused.
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect.poll(() => logPart.getLog()).toEqual([]);
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();

    // Start dragging 'view.1'.
    const dragHandle = await appPO.view({viewId: 'view.1'}).tab.startDrag();
    await dragHandle.dragTo({deltaX: 200, deltaY: 0});

    // Expect 'view.1' to be active and focused.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1']);
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeAttached();
  });

  test('should focus tab when start dragging inactive tab', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.1', {partId: 'part.main'})
      .addView('view.2', {partId: 'part.main'})
      .activateView('view.1')
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // PRECONDITION: Expect 'view.2' to be inactive and not focused.
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect.poll(() => logPart.getLog()).toEqual([]);
    await expect(appPO.view({viewId: 'view.2'}).tab.state('active')).not.toBeVisible();

    // Start dragging 'view.2'.
    const dragHandle = await appPO.view({viewId: 'view.2'}).tab.startDrag();
    await dragHandle.dragTo({deltaX: 200, deltaY: 0});

    // Expect 'view.2' to be active and focused.
    await expect.poll(() => appPO.focusOwner()).toEqual('view.2');
    await expect.poll(() => logPart.getLog()).toEqual(['view.2']);
    await expect(appPO.view({viewId: 'view.2'}).tab.state('active')).toBeAttached();
  });

  test('should not focus parts and views contained the initial perspective layout', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.left')
      .addPart('part.right', {align: 'right'})
      .addView('view.1', {partId: 'part.left'})
      .addView('view.2', {partId: 'part.right'})
      .activatePart('part.right')
      .activateView('view.1')
      .activateView('view.2'),
    );

    await expect.poll(() => appPO.focusOwner()).toBeNull();
  });

  test('should not emit `null` when closing view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.1', {partId: 'part.main'})
      .addView('view.2', {partId: 'part.main'})
      .addView('view.3', {partId: 'part.main'})
      .modify(addActiveWorkbenchElementPart('part.log', {activate: true})),
    );

    const logPart = new ActiveWorkbenchElementLogPagePO(appPO.part({partId: 'part.log'}));
    await logPart.clearLog();

    // Activate 'view.1'.
    await appPO.view({viewId: 'view.1'}).tab.click();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1']);

    // Close 'view.1'.
    await appPO.view({viewId: 'view.1'}).tab.close();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.2');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', 'view.2']);

    // Close 'view.2'.
    await appPO.view({viewId: 'view.2'}).tab.close();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.3');
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', 'view.2', 'view.3']);

    // Close 'view.3'.
    await appPO.view({viewId: 'view.3'}).tab.close();
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect.poll(() => logPart.getLog()).toEqual(['view.1', 'view.2', 'view.3', null]);
  });

  test('should focus main area part when clicking navigated main area content', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.left', {align: 'left'})
      .navigatePart(MAIN_AREA, ['test-pages/focus-test-page'])
      .navigatePart('part.left', ['test-pages/focus-test-page']),
    );

    // Click content of 'part.main-area'.
    const mainAreaPartPage = new FocusTestPagePO(appPO.part({partId: MAIN_AREA}));
    await mainAreaPartPage.clickField('first-field');

    await expect.poll(() => appPO.focusOwner()).toEqual(MAIN_AREA);
    await expect(mainAreaPartPage.firstField).toBeFocused();
    await expect(appPO.part({partId: MAIN_AREA}).state('active')).toBeVisible();

    // Click content of 'part.left'.
    const leftPartPage = new FocusTestPagePO(appPO.part({partId: 'part.left'}));
    await leftPartPage.clickField('first-field');

    await expect.poll(() => appPO.focusOwner()).toEqual('part.left');
    await expect(leftPartPage.firstField).toBeFocused();
    await expect(appPO.part({partId: 'part.left'}).state('active')).toBeVisible();
  });

  test('should not focus main area part when clicking desktop content', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, desktop: 'focus-page'});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.left', {align: 'left'})
      .navigatePart('part.left', ['test-pages/focus-test-page']),
    );

    // Click content on desktop.
    const desktopPage = new FocusTestPagePO(appPO.desktop);
    await desktopPage.clickField('first-field');

    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect(desktopPage.firstField).toBeFocused();
    await expect(appPO.part({partId: MAIN_AREA}).state('active')).toBeVisible();

    // Click content of 'part.left'.
    const leftPartPage = new FocusTestPagePO(appPO.part({partId: 'part.left'}));
    await leftPartPage.clickField('first-field');

    await expect.poll(() => appPO.focusOwner()).toEqual('part.left');
    await expect(leftPartPage.firstField).toBeFocused();
    await expect(appPO.part({partId: 'part.left'}).state('active')).toBeVisible();
  });

  test.describe('View Activation Navigation', () => {

    test('should perform single navigation when clicking view tab', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.left')
        .addPart('part.right', {align: 'right'})
        .addView('view.1', {partId: 'part.left'})
        .addView('view.2', {partId: 'part.right'})
        .activatePart('part.left')
        .activateView('view.1')
        .activateView('view.2'),
      );

      // Focus view 'view.1'.
      await appPO.view({viewId: 'view.1'}).tab.click();

      // PRECONDITION: Expect 'view.1' to be focused.
      await expect.poll(() => appPO.focusOwner()).toEqual('view.1');

      // Capture the current navigation id.
      const navigationId = await appPO.getCurrentNavigationId();

      // Click tab of 'view.2'.
      await appPO.view({viewId: 'view.2'}).tab.click();

      // Expect 'view.2' to be active and focused.
      await expect.poll(() => appPO.focusOwner()).toEqual('view.2');
      await expect(appPO.view({viewId: 'view.2'}).tab.state('active')).toBeVisible();
      await expect(appPO.view({viewId: 'view.2'}).viewport).toContainFocus();

      // Expect single navigation to be performed.
      await expect.poll(() => appPO.getCurrentNavigationId()).toBe(navigationId + 1);
    });

    test('should not perform navigation when clicking view tab of focused view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.main')
        .addView('view.1', {partId: 'part.main'})
        .activatePart('part.main')
        .activateView('view.1'),
      );

      // Focus view 'view.1'.
      await appPO.view({viewId: 'view.1'}).tab.click();

      // PRECONDITION: Expect 'view.1' to be focused.
      await expect.poll(() => appPO.focusOwner()).toEqual('view.1');

      // Capture the current navigation id.
      const navigationId = await appPO.getCurrentNavigationId();

      // Click tab of 'view.1'.
      await appPO.view({viewId: 'view.1'}).tab.click();

      // Expect 'view.1' to be active and focused.
      await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
      await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
      await expect(appPO.view({viewId: 'view.1'}).tab.locator).toContainFocus();

      // Expect no navigation to be performed.
      await expect.poll(() => appPO.getCurrentNavigationId()).toBe(navigationId);

      // Click tab of 'view.1' again.
      await appPO.view({viewId: 'view.1'}).tab.click();

      // Expect 'view.1' to be active and focused.
      await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
      await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
      await expect(appPO.view({viewId: 'view.1'}).tab.locator).toContainFocus();

      // Expect no navigation to be performed.
      await expect.poll(() => appPO.getCurrentNavigationId()).toBe(navigationId);
    });

    test('should perform single navigation when clicking view content', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.left')
        .addPart('part.right', {align: 'right'})
        .addView('view.1', {partId: 'part.left'})
        .addView('view.2', {partId: 'part.right'})
        .navigateView('view.2', ['test-pages/focus-test-page'])
        .activatePart('part.left')
        .activateView('view.1')
        .activateView('view.2'),
      );

      // Focus view 'view.1'.
      await appPO.view({viewId: 'view.1'}).tab.click();

      // PRECONDITION: Expect 'view.1' to be focused.
      await expect.poll(() => appPO.focusOwner()).toEqual('view.1');

      // Capture the current navigation id.
      const navigationId = await appPO.getCurrentNavigationId();

      // Click content of 'view.2'.
      const viewPage2 = new FocusTestPagePO(appPO.view({viewId: 'view.2'}));
      await viewPage2.clickField('first-field');

      // Expect 'view.2' to be active and focused.
      await expect.poll(() => appPO.focusOwner()).toEqual('view.2');
      await expect(appPO.view({viewId: 'view.2'}).tab.state('active')).toBeVisible();
      await expect(viewPage2.firstField).toBeFocused();

      // Expect single navigation to be performed.
      await expect.poll(() => appPO.getCurrentNavigationId()).toBe(navigationId + 1);
    });

    test('should not perform navigation when clicking on view content of focused view', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.main')
        .addView('view.1', {partId: 'part.main'})
        .navigateView('view.1', ['test-pages/focus-test-page'])
        .activatePart('part.main')
        .activateView('view.1'),
      );

      // Focus view 'view.1'.
      await appPO.view({viewId: 'view.1'}).tab.click();

      // PRECONDITION: Expect 'view.1' to be focused.
      await expect.poll(() => appPO.focusOwner()).toEqual('view.1');

      // Capture the current navigation id.
      const navigationId = await appPO.getCurrentNavigationId();

      // Click content of 'view.1'.
      const viewPage = new FocusTestPagePO(appPO.view({viewId: 'view.1'}));
      await viewPage.clickField('first-field');

      // Expect 'view.1' to be active and focused.
      await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
      await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
      await expect(viewPage.firstField).toBeFocused();

      // Expect no navigation to be performed.
      await expect.poll(() => appPO.getCurrentNavigationId()).toBe(navigationId);

      // Focus another element of 'view.1'.
      await viewPage.clickField('middle-field');

      // Expect 'view.1' to be active and focused.
      await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
      await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
      await expect(viewPage.middleField).toBeFocused();

      // Expect no navigation to be performed.
      await expect.poll(() => appPO.getCurrentNavigationId()).toBe(navigationId);
    });
  });

  test.describe('Part Activation Navigation', () => {

    test('should perform single navigation when clicking part title', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.left', {title: 'left'})
        .addPart('part.right', {align: 'right'}, {title: 'right'})
        .navigatePart('part.left', ['test-part'])
        .navigatePart('part.right', ['test-part'])
        .activatePart('part.left'),
      );

      // Focus part 'part.left'.
      await appPO.part({partId: 'part.left'}).bar.title.click();

      // PRECONDITION: Expect 'part.left' to be focused.
      await expect.poll(() => appPO.focusOwner()).toEqual('part.left');

      // Capture the current navigation id.
      const navigationId = await appPO.getCurrentNavigationId();

      // Click on title of 'part.right'.
      await appPO.part({partId: 'part.right'}).bar.title.click();

      // Expect 'part.right' to be active and focused.
      await expect.poll(() => appPO.focusOwner()).toEqual('part.right');
      await expect(appPO.part({partId: 'part.right'}).state('active')).toBeVisible();
      await expect(appPO.part({partId: 'part.right'}).slot.viewport).toContainFocus();

      // Expect single navigation to be performed.
      await expect.poll(() => appPO.getCurrentNavigationId()).toBe(navigationId + 1);
    });

    test('should not perform navigation when clicking title of focused part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.main', {title: 'main'})
        .navigatePart('part.main', ['test-part'])
        .activatePart('part.main'),
      );

      // Focus part 'part.main'.
      await appPO.part({partId: 'part.main'}).bar.title.click();

      // PRECONDITION: Expect 'part.main' to be focused.
      await expect.poll(() => appPO.focusOwner()).toEqual('part.main');

      // Capture the current navigation id.
      const navigationId = await appPO.getCurrentNavigationId();

      // Click on title of 'part.main'.
      await appPO.part({partId: 'part.main'}).bar.title.click();

      // Expect 'part.main' to be active and focused.
      await expect.poll(() => appPO.focusOwner()).toEqual('part.main');
      await expect(appPO.part({partId: 'part.main'}).state('active')).toBeVisible();
      await expect(appPO.part({partId: 'part.main'}).slot.viewport).toContainFocus();

      // Expect no navigation to be performed.
      await expect.poll(() => appPO.getCurrentNavigationId()).toBe(navigationId);

      // Click on title of 'part.main' again.
      await appPO.part({partId: 'part.main'}).bar.title.click();

      // Expect 'view.1' to be active and focused.
      await expect.poll(() => appPO.focusOwner()).toEqual('part.main');
      await expect(appPO.part({partId: 'part.main'}).state('active')).toBeVisible();
      await expect(appPO.part({partId: 'part.main'}).slot.viewport).toContainFocus();

      // Expect no navigation to be performed.
      await expect.poll(() => appPO.getCurrentNavigationId()).toBe(navigationId);
    });

    test('should perform single navigation when clicking part content', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.left', {title: 'left'})
        .addPart('part.right', {align: 'right'}, {title: 'right'})
        .navigatePart('part.left', ['test-pages/focus-test-page'])
        .navigatePart('part.right', ['test-pages/focus-test-page'])
        .activatePart('part.left'),
      );

      // Focus part 'part.left'.
      await appPO.part({partId: 'part.left'}).bar.title.click();

      // PRECONDITION: Expect 'part.left' to be focused.
      await expect.poll(() => appPO.focusOwner()).toEqual('part.left');

      // Capture the current navigation id.
      const navigationId = await appPO.getCurrentNavigationId();

      // Click content of 'part.right'.
      const partPageRight = new FocusTestPagePO(appPO.part({partId: 'part.right'}));
      await partPageRight.clickField('first-field');

      // Expect 'part.right' to be active and focused.
      await expect.poll(() => appPO.focusOwner()).toEqual('part.right');
      await expect(appPO.part({partId: 'part.right'}).state('active')).toBeVisible();
      await expect(partPageRight.firstField).toBeFocused();

      // Expect single navigation to be performed.
      await expect.poll(() => appPO.getCurrentNavigationId()).toBe(navigationId + 1);
    });

    test('should not perform navigation when clicking part content of focused part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart('part.main', {title: 'main'})
        .navigatePart('part.main', ['test-pages/focus-test-page'])
        .activatePart('part.main'),
      );

      // Focus part 'part.main'.
      await appPO.part({partId: 'part.main'}).bar.title.click();

      // PRECONDITION: Expect 'part.main' to be focused.
      await expect.poll(() => appPO.focusOwner()).toEqual('part.main');

      // Capture the current navigation id.
      const navigationId = await appPO.getCurrentNavigationId();

      // Click content of 'part.main'.
      const partPage = new FocusTestPagePO(appPO.part({partId: 'part.main'}));
      await partPage.clickField('first-field');

      // Expect 'part.main' to be active and focused.
      await expect.poll(() => appPO.focusOwner()).toEqual('part.main');
      await expect(appPO.part({partId: 'part.main'}).state('active')).toBeVisible();
      await expect(partPage.firstField).toBeFocused();

      // Expect no navigation to be performed.
      await expect.poll(() => appPO.getCurrentNavigationId()).toBe(navigationId);

      // Focus another element of 'part.main'.
      await partPage.clickField('middle-field');

      // Expect 'part.main' to be active and focused.
      await expect.poll(() => appPO.focusOwner()).toEqual('part.main');
      await expect(appPO.part({partId: 'part.main'}).state('active')).toBeVisible();
      await expect(partPage.middleField).toBeFocused();

      // Expect no navigation to be performed.
      await expect.poll(() => appPO.getCurrentNavigationId()).toBe(navigationId);
    });
  });
});

/**
 * Adds a part logging the active workbench element.
 */
function addActiveWorkbenchElementPart(partId: PartId, options?: {activate?: true}): (layout: WorkbenchLayout) => WorkbenchLayout {
  return (layout: WorkbenchLayout) => layout
    .addPart(partId, {dockTo: 'bottom-right'}, {label: 'Active Workbench Element Log', icon: 'terminal', ɵactivityId: 'activity.log'})
    .navigatePart(partId, [], {hint: 'active-workbench-element-log'})
    .modify(layout => options?.activate ? layout.activatePart(partId) : layout);
}
