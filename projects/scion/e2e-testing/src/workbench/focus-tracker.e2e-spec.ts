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
import {WorkbenchElementLogPagePagePO} from './page-object/test-pages/workbench-element-log-page-page.po';
import {FocusTestPerspectivePO} from './page-object/test-pages/focus-test-perspective.po';
import {LayoutPagePO} from './page-object/layout-page/layout-page.po';
import {DialogOpenerPagePO} from './page-object/dialog-opener-page.po';
import {MessageBoxOpenerPagePO} from './page-object/message-box-opener-page.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';

test.describe.only('Focus Tracker', () => {

  test.describe.configure({mode: 'serial'});

  test('should focus parts and views when clicking contained content (playbook)', async ({appPO}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Expect no element to have the focus.
    await expect.poll(() => appPO.focusOwner()).toBeNull();

    // Open log activity.
    await appPO.activityItem({cssClass: 'e2e-log'}).click();
    const logPart = new WorkbenchElementLogPagePagePO(appPO);
    await expect.poll(() => logPart.getLog()).toEqual(['<null>', 'part.log']);
    await logPart.clearLog();

    await test.step('Step through activities', async () => {
      // Open activity 1.
      await appPO.activityItem({activityId: 'activity.1'}).click();
      await expect.poll(() => appPO.focusOwner()).toEqual('part.activity-1a');
      await expect.poll(() => appPO.activePartId({grid: 'activity.1'})).toEqual('part.activity-1a');
      await expect(appPO.part({partId: 'part.activity-1a'}).slot.viewport).toContainFocus();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('active')).not.toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('focus-within-activity')).not.toBeVisible();
      await expect.poll(() => logPart.getLog()).toEqual([
        'part.activity-1a',
      ]);

      // Open activity.2.
      await appPO.activityItem({activityId: 'activity.2'}).click();
      await expect.poll(() => appPO.focusOwner()).toEqual('part.activity-2');
      await expect.poll(() => appPO.activePartId({grid: 'activity.2'})).toEqual('part.activity-2');
      await expect(appPO.part({partId: 'part.activity-2'}).slot.viewport).toContainFocus();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).not.toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('focus-within-activity')).toBeVisible();
      await expect.poll(() => logPart.getLog()).toEqual([
        'part.activity-1a',
        'part.activity-2',
      ]);

      // Click input on part 'part.activity-1a' in activity 'activity.1'.
      await testPerspective.clickPartInput({partId: 'part.activity-1a'});
      await expect.poll(() => appPO.focusOwner()).toEqual('part.activity-1a');
      await expect.poll(() => appPO.activePartId({grid: 'activity.1'})).toEqual('part.activity-1a');
      await expect(testPerspective.partInput({partId: 'part.activity-1a'})).toBeFocused();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('focus-within-activity')).not.toBeVisible();
      await expect.poll(() => logPart.getLog()).toEqual([
        'part.activity-1a',
        'part.activity-2',
        'part.activity-1a',
      ]);

      // Click input on part 'part.activity-1b' in activity 'activity.1'.
      await testPerspective.clickPartInput({partId: 'part.activity-1b'});
      await expect.poll(() => appPO.focusOwner()).toEqual('part.activity-1b');
      await expect.poll(() => appPO.activePartId({grid: 'activity.1'})).toEqual('part.activity-1b');
      await expect(testPerspective.partInput({partId: 'part.activity-1b'})).toBeFocused();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('focus-within-activity')).not.toBeVisible();
      await expect.poll(() => logPart.getLog()).toEqual([
        'part.activity-1a',
        'part.activity-2',
        'part.activity-1a',
        'part.activity-1b',
      ]);

      // Click input on view 'view.101' in part 'part.activity-1c' in activity 'activity.1'.
      await testPerspective.clickViewInput({viewId: 'view.101'});
      await expect.poll(() => appPO.focusOwner()).toEqual('view.101');
      await expect.poll(() => appPO.activePartId({grid: 'activity.1'})).toEqual('part.activity-1c');
      await expect.poll(() => appPO.activeViewId({partId: 'part.activity-1c'})).toEqual('view.101');
      await expect(testPerspective.viewInput({viewId: 'view.101'})).toBeFocused();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('focus-within-activity')).not.toBeVisible();
      await expect(appPO.view({viewId: 'view.101'}).tab.state('active')).toBeVisible();
      await expect(appPO.view({viewId: 'view.101'}).tab.state('focus-within-view')).toBeVisible();
      await expect(appPO.view({viewId: 'view.103'}).tab.state('active')).toBeVisible();
      await expect(appPO.view({viewId: 'view.103'}).tab.state('focus-within-view')).not.toBeVisible();
      await expect.poll(() => logPart.getLog()).toEqual([
        'part.activity-1a',
        'part.activity-2',
        'part.activity-1a',
        'part.activity-1b',
        'view.101',
      ]);

      // Click input on view 'view.103' in part 'part.activity-1d' in activity 'activity.1'.
      await testPerspective.clickViewInput({viewId: 'view.103'});
      await expect.poll(() => appPO.focusOwner()).toEqual('view.103');
      await expect.poll(() => appPO.activePartId({grid: 'activity.1'})).toEqual('part.activity-1d');
      await expect.poll(() => appPO.activeViewId({partId: 'part.activity-1d'})).toEqual('view.103');
      await expect(testPerspective.viewInput({viewId: 'view.103'})).toBeFocused();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('focus-within-activity')).not.toBeVisible();
      await expect(appPO.view({viewId: 'view.101'}).tab.state('active')).toBeVisible();
      await expect(appPO.view({viewId: 'view.101'}).tab.state('focus-within-view')).not.toBeVisible();
      await expect(appPO.view({viewId: 'view.103'}).tab.state('active')).toBeVisible();
      await expect(appPO.view({viewId: 'view.103'}).tab.state('focus-within-view')).toBeVisible();
      await expect.poll(() => logPart.getLog()).toEqual([
        'part.activity-1a',
        'part.activity-2',
        'part.activity-1a',
        'part.activity-1b',
        'view.101',
        'view.103',
      ]);

      // Click input on part 'part.activity-2' in activity 'activity.2'.
      await testPerspective.clickPartInput({partId: 'part.activity-2'});
      await expect.poll(() => appPO.focusOwner()).toEqual('part.activity-2');
      await expect.poll(() => appPO.activePartId({grid: 'activity.1'})).toEqual('part.activity-1d');
      await expect.poll(() => appPO.activePartId({grid: 'activity.2'})).toEqual('part.activity-2');
      await expect(testPerspective.partInput({partId: 'part.activity-2'})).toBeFocused();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).not.toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('focus-within-activity')).toBeVisible();
      await expect(appPO.view({viewId: 'view.101'}).tab.state('active')).toBeVisible();
      await expect(appPO.view({viewId: 'view.101'}).tab.state('focus-within-view')).not.toBeVisible();
      await expect(appPO.view({viewId: 'view.103'}).tab.state('active')).toBeVisible();
      await expect(appPO.view({viewId: 'view.103'}).tab.state('focus-within-view')).not.toBeVisible();
      await expect.poll(() => logPart.getLog()).toEqual([
        'part.activity-1a',
        'part.activity-2',
        'part.activity-1a',
        'part.activity-1b',
        'view.101',
        'view.103',
        'part.activity-2',
      ]);
    });

    // Click input on on desktop.
    await test.step('Focus input field on desktop', async () => {
      await testPerspective.clickDesktopInput();
      await expect.poll(() => appPO.focusOwner()).toBeNull();
      await expect.poll(() => appPO.activePartId({grid: 'activity.2'})).toEqual('part.activity-2');
      await expect(testPerspective.desktopInput()).toBeFocused();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).not.toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('focus-within-activity')).not.toBeVisible();
      await expect.poll(() => logPart.getLog()).toEqual([
        'part.activity-1a',
        'part.activity-2',
        'part.activity-1a',
        'part.activity-1b',
        'view.101',
        'view.103',
        'part.activity-2',
        '<null>',
      ]);
    });

    await test.step('Step through parts on the right', async () => {
      // Click input on part 'part.right-1'.
      await testPerspective.clickPartInput({partId: 'part.right-1'});
      await expect.poll(() => appPO.focusOwner()).toEqual('part.right-1');
      await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-1');
      await expect(testPerspective.partInput({partId: 'part.right-1'})).toBeFocused();
      await expect.poll(() => logPart.getLog()).toEqual([
        'part.activity-1a',
        'part.activity-2',
        'part.activity-1a',
        'part.activity-1b',
        'view.101',
        'view.103',
        'part.activity-2',
        '<null>',
        'part.right-1',
      ]);

      // Click input on part 'part.right-2'.
      await testPerspective.clickPartInput({partId: 'part.right-2'});
      await expect.poll(() => appPO.focusOwner()).toEqual('part.right-2');
      await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-2');
      await expect(testPerspective.partInput({partId: 'part.right-2'})).toBeFocused();
      await expect.poll(() => logPart.getLog()).toEqual([
        'part.activity-1a',
        'part.activity-2',
        'part.activity-1a',
        'part.activity-1b',
        'view.101',
        'view.103',
        'part.activity-2',
        '<null>',
        'part.right-1',
        'part.right-2',
      ]);

      // Click input on view 'view.201' in part 'part.right-3'.
      await testPerspective.clickViewInput({viewId: 'view.201'});
      await expect.poll(() => appPO.focusOwner()).toEqual('view.201');
      await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-3');
      await expect.poll(() => appPO.activeViewId({partId: 'part.right-3'})).toEqual('view.201');
      await expect(testPerspective.viewInput({viewId: 'view.201'})).toBeFocused();
      await expect(appPO.view({viewId: 'view.201'}).tab.state('active')).toBeVisible();
      await expect(appPO.view({viewId: 'view.201'}).tab.state('focus-within-view')).toBeVisible();
      await expect(appPO.view({viewId: 'view.203'}).tab.state('active')).toBeVisible();
      await expect(appPO.view({viewId: 'view.203'}).tab.state('focus-within-view')).not.toBeVisible();
      await expect.poll(() => logPart.getLog()).toEqual([
        'part.activity-1a',
        'part.activity-2',
        'part.activity-1a',
        'part.activity-1b',
        'view.101',
        'view.103',
        'part.activity-2',
        '<null>',
        'part.right-1',
        'part.right-2',
        'view.201',
      ]);

      // Click input on view 'view.203' in part 'part.right-4'.
      await testPerspective.clickViewInput({viewId: 'view.203'});
      await expect.poll(() => appPO.focusOwner()).toEqual('view.203');
      await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-4');
      await expect.poll(() => appPO.activeViewId({partId: 'part.right-4'})).toEqual('view.203');
      await expect(testPerspective.viewInput({viewId: 'view.203'})).toBeFocused();
      await expect(appPO.view({viewId: 'view.201'}).tab.state('active')).toBeVisible();
      await expect(appPO.view({viewId: 'view.201'}).tab.state('focus-within-view')).not.toBeVisible();
      await expect(appPO.view({viewId: 'view.203'}).tab.state('active')).toBeVisible();
      await expect(appPO.view({viewId: 'view.203'}).tab.state('focus-within-view')).toBeVisible();
      await expect.poll(() => logPart.getLog()).toEqual([
        'part.activity-1a',
        'part.activity-2',
        'part.activity-1a',
        'part.activity-1b',
        'view.101',
        'view.103',
        'part.activity-2',
        '<null>',
        'part.right-1',
        'part.right-2',
        'view.201',
        'view.203',
      ]);
    });

    // Click input on on desktop.
    await test.step('Focus input field on desktop', async () => {
      await testPerspective.clickDesktopInput();
      await expect.poll(() => appPO.focusOwner()).toBeNull();
      await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-4');
      await expect(testPerspective.desktopInput()).toBeFocused();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).not.toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('focus-within-activity')).not.toBeVisible();
      await expect(appPO.view({viewId: 'view.201'}).tab.state('active')).toBeVisible();
      await expect(appPO.view({viewId: 'view.201'}).tab.state('focus-within-view')).not.toBeVisible();
      await expect(appPO.view({viewId: 'view.203'}).tab.state('active')).toBeVisible();
      await expect(appPO.view({viewId: 'view.203'}).tab.state('focus-within-view')).not.toBeVisible();
      await expect.poll(() => logPart.getLog()).toEqual([
        'part.activity-1a',
        'part.activity-2',
        'part.activity-1a',
        'part.activity-1b',
        'view.101',
        'view.103',
        'part.activity-2',
        '<null>',
        'part.right-1',
        'part.right-2',
        'view.201',
        'view.203',
        '<null>',
      ]);
    });
  });

  test('should focus parts and views when clicking handle (playbook)', async ({appPO}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Expect no element to have the focus.
    await expect.poll(() => appPO.focusOwner()).toBeNull();

    // Open log activity.
    await appPO.activityItem({cssClass: 'e2e-log'}).click();
    const logPart = new WorkbenchElementLogPagePagePO(appPO);
    await expect.poll(() => logPart.getLog()).toEqual(['<null>', 'part.log']);
    await logPart.clearLog();

    await test.step('Step through activities', async () => {
      // Open activity 1.
      await appPO.activityItem({activityId: 'activity.1'}).click();
      await expect.poll(() => appPO.focusOwner()).toEqual('part.activity-1a');
      await expect.poll(() => appPO.activePartId({grid: 'activity.1'})).toEqual('part.activity-1a');
      await expect(appPO.part({partId: 'part.activity-1a'}).slot.viewport).toContainFocus();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('active')).not.toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('focus-within-activity')).not.toBeVisible();
      await expect.poll(() => logPart.getLog()).toEqual([
        'part.activity-1a',
      ]);

      // Open activity.2.
      await appPO.activityItem({activityId: 'activity.2'}).click();
      await expect.poll(() => appPO.focusOwner()).toEqual('part.activity-2');
      await expect.poll(() => appPO.activePartId({grid: 'activity.2'})).toEqual('part.activity-2');
      await expect(appPO.part({partId: 'part.activity-2'}).slot.viewport).toContainFocus();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).not.toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('focus-within-activity')).toBeVisible();
      await expect.poll(() => logPart.getLog()).toEqual([
        'part.activity-1a',
        'part.activity-2',
      ]);

      // Click partbar of activity 'activity.1'.
      await testPerspective.clickPartBar({partId: 'part.activity-1a'});
      await expect.poll(() => appPO.focusOwner()).toEqual('part.activity-1a');
      await expect.poll(() => appPO.activePartId({grid: 'activity.1'})).toEqual('part.activity-1a');
      await expect(appPO.part({partId: 'part.activity-1a'}).slot.viewport).toContainFocus();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('focus-within-activity')).not.toBeVisible();
      await expect.poll(() => logPart.getLog()).toEqual([
        'part.activity-1a',
        'part.activity-2',
        'part.activity-1a',
      ]);

      // Click part 'part.activity-1b' in activity 'activity.1'.
      await testPerspective.clickPart({partId: 'part.activity-1b'});
      await expect.poll(() => appPO.focusOwner()).toEqual('part.activity-1b');
      await expect.poll(() => appPO.activePartId({grid: 'activity.1'})).toEqual('part.activity-1b');
      await expect(appPO.part({partId: 'part.activity-1b'}).slot.viewport).toContainFocus();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('focus-within-activity')).not.toBeVisible();
      await expect.poll(() => logPart.getLog()).toEqual([
        'part.activity-1a',
        'part.activity-2',
        'part.activity-1a',
        'part.activity-1b',
      ]);

      // Click view tab of view 'view.101' in part 'part.activity-1c' in activity 'activity.1'.
      await testPerspective.clickViewTab({viewId: 'view.101'});
      await expect.poll(() => appPO.focusOwner()).toEqual('view.101');
      await expect.poll(() => appPO.activePartId({grid: 'activity.1'})).toEqual('part.activity-1c');
      await expect.poll(() => appPO.activeViewId({partId: 'part.activity-1c'})).toEqual('view.101');
      await expect(appPO.view({viewId: 'view.101'}).viewport).toContainFocus();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('focus-within-activity')).not.toBeVisible();
      await expect(appPO.view({viewId: 'view.101'}).tab.state('active')).toBeVisible();
      await expect(appPO.view({viewId: 'view.101'}).tab.state('focus-within-view')).toBeVisible();
      await expect(appPO.view({viewId: 'view.103'}).tab.state('active')).toBeVisible();
      await expect(appPO.view({viewId: 'view.103'}).tab.state('focus-within-view')).not.toBeVisible();
      await expect.poll(() => logPart.getLog()).toEqual([
        'part.activity-1a',
        'part.activity-2',
        'part.activity-1a',
        'part.activity-1b',
        'view.101',
      ]);

      // Click view tab of view 'view.103' in part 'part.activity-1d' in activity 'activity.1'.
      await testPerspective.clickViewTab({viewId: 'view.103'});
      await expect.poll(() => appPO.focusOwner()).toEqual('view.103');
      await expect.poll(() => appPO.activePartId({grid: 'activity.1'})).toEqual('part.activity-1d');
      await expect.poll(() => appPO.activeViewId({partId: 'part.activity-1d'})).toEqual('view.103');
      await expect(appPO.view({viewId: 'view.103'}).viewport).toContainFocus();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('focus-within-activity')).not.toBeVisible();
      await expect(appPO.view({viewId: 'view.101'}).tab.state('active')).toBeVisible();
      await expect(appPO.view({viewId: 'view.101'}).tab.state('focus-within-view')).not.toBeVisible();
      await expect(appPO.view({viewId: 'view.103'}).tab.state('active')).toBeVisible();
      await expect(appPO.view({viewId: 'view.103'}).tab.state('focus-within-view')).toBeVisible();
      await expect.poll(() => logPart.getLog()).toEqual([
        'part.activity-1a',
        'part.activity-2',
        'part.activity-1a',
        'part.activity-1b',
        'view.101',
        'view.103',
      ]);

      // Click partbar 'part.activity-2' in activity 'activity.2'.
      await testPerspective.clickPartBar({partId: 'part.activity-2'});
      await expect.poll(() => appPO.focusOwner()).toEqual('part.activity-2');
      await expect.poll(() => appPO.activePartId({grid: 'activity.1'})).toEqual('part.activity-1d');
      await expect.poll(() => appPO.activePartId({grid: 'activity.2'})).toEqual('part.activity-2');
      await expect(appPO.part({partId: 'part.activity-2'}).slot.viewport).toContainFocus();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).not.toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('focus-within-activity')).toBeVisible();
      await expect(appPO.view({viewId: 'view.101'}).tab.state('active')).toBeVisible();
      await expect(appPO.view({viewId: 'view.101'}).tab.state('focus-within-view')).not.toBeVisible();
      await expect(appPO.view({viewId: 'view.103'}).tab.state('active')).toBeVisible();
      await expect(appPO.view({viewId: 'view.103'}).tab.state('focus-within-view')).not.toBeVisible();
      await expect.poll(() => logPart.getLog()).toEqual([
        'part.activity-1a',
        'part.activity-2',
        'part.activity-1a',
        'part.activity-1b',
        'view.101',
        'view.103',
        'part.activity-2',
      ]);
    });

    // Click on desktop.
    await test.step('Focus input field on desktop', async () => {
      await testPerspective.clickDesktop();
      await expect.poll(() => appPO.focusOwner()).toBeNull();
      await expect.poll(() => appPO.activePartId({grid: 'activity.2'})).toEqual('part.activity-2');
      await expect(appPO.desktop.locator).toContainFocus();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).not.toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('focus-within-activity')).not.toBeVisible();
      await expect.poll(() => logPart.getLog()).toEqual([
        'part.activity-1a',
        'part.activity-2',
        'part.activity-1a',
        'part.activity-1b',
        'view.101',
        'view.103',
        'part.activity-2',
        '<null>',
      ]);
    });

    await test.step('Step through parts on the right', async () => {
      // Click partbar of 'part.right-1'.
      await testPerspective.clickPartBar({partId: 'part.right-1'});
      await expect.poll(() => appPO.focusOwner()).toEqual('part.right-1');
      await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-1');
      await expect(appPO.part({partId: 'part.right-1'}).slot.viewport).toContainFocus();
      await expect.poll(() => logPart.getLog()).toEqual([
        'part.activity-1a',
        'part.activity-2',
        'part.activity-1a',
        'part.activity-1b',
        'view.101',
        'view.103',
        'part.activity-2',
        '<null>',
        'part.right-1',
      ]);

      // Click partbar of 'part.right2'.
      await testPerspective.clickPartBar({partId: 'part.right-2'});
      await expect.poll(() => appPO.focusOwner()).toEqual('part.right-2');
      await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-2');
      await expect(appPO.part({partId: 'part.right-2'}).slot.viewport).toContainFocus();
      await expect.poll(() => logPart.getLog()).toEqual([
        'part.activity-1a',
        'part.activity-2',
        'part.activity-1a',
        'part.activity-1b',
        'view.101',
        'view.103',
        'part.activity-2',
        '<null>',
        'part.right-1',
        'part.right-2',
      ]);

      // Click view tab of view 'view.201' in part 'part.right-3'.
      await testPerspective.clickViewTab({viewId: 'view.201'});
      await expect.poll(() => appPO.focusOwner()).toEqual('view.201');
      await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-3');
      await expect.poll(() => appPO.activeViewId({partId: 'part.right-3'})).toEqual('view.201');
      await expect(appPO.view({viewId: 'view.201'}).viewport).toContainFocus();
      await expect(appPO.view({viewId: 'view.201'}).tab.state('active')).toBeVisible();
      await expect(appPO.view({viewId: 'view.201'}).tab.state('focus-within-view')).toBeVisible();
      await expect(appPO.view({viewId: 'view.203'}).tab.state('active')).toBeVisible();
      await expect(appPO.view({viewId: 'view.203'}).tab.state('focus-within-view')).not.toBeVisible();
      await expect.poll(() => logPart.getLog()).toEqual([
        'part.activity-1a',
        'part.activity-2',
        'part.activity-1a',
        'part.activity-1b',
        'view.101',
        'view.103',
        'part.activity-2',
        '<null>',
        'part.right-1',
        'part.right-2',
        'view.201',
      ]);

      // Click view tab of view 'view.203' in part 'part.right-4'.
      await testPerspective.clickViewTab({viewId: 'view.203'});
      await expect.poll(() => appPO.focusOwner()).toEqual('view.203');
      await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-4');
      await expect.poll(() => appPO.activeViewId({partId: 'part.right-4'})).toEqual('view.203');
      await expect(appPO.view({viewId: 'view.203'}).viewport).toContainFocus();
      await expect(appPO.view({viewId: 'view.201'}).tab.state('active')).toBeVisible();
      await expect(appPO.view({viewId: 'view.201'}).tab.state('focus-within-view')).not.toBeVisible();
      await expect(appPO.view({viewId: 'view.203'}).tab.state('active')).toBeVisible();
      await expect(appPO.view({viewId: 'view.203'}).tab.state('focus-within-view')).toBeVisible();
      await expect.poll(() => logPart.getLog()).toEqual([
        'part.activity-1a',
        'part.activity-2',
        'part.activity-1a',
        'part.activity-1b',
        'view.101',
        'view.103',
        'part.activity-2',
        '<null>',
        'part.right-1',
        'part.right-2',
        'view.201',
        'view.203',
      ]);
    });

    // Click on desktop.
    await test.step('Click desktop', async () => {
      await testPerspective.clickDesktop();
      await expect.poll(() => appPO.focusOwner()).toBeNull();
      await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-4');
      await expect(appPO.desktop.locator).toContainFocus();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).not.toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('active')).toBeVisible();
      await expect(appPO.activityItem({activityId: 'activity.2'}).state('focus-within-activity')).not.toBeVisible();
      await expect(appPO.view({viewId: 'view.201'}).tab.state('active')).toBeVisible();
      await expect(appPO.view({viewId: 'view.201'}).tab.state('focus-within-view')).not.toBeVisible();
      await expect(appPO.view({viewId: 'view.203'}).tab.state('active')).toBeVisible();
      await expect(appPO.view({viewId: 'view.203'}).tab.state('focus-within-view')).not.toBeVisible();
      await expect.poll(() => logPart.getLog()).toEqual([
        'part.activity-1a',
        'part.activity-2',
        'part.activity-1a',
        'part.activity-1b',
        'view.101',
        'view.103',
        'part.activity-2',
        '<null>',
        'part.right-1',
        'part.right-2',
        'view.201',
        'view.203',
        '<null>',
      ]);
    });
  });

  test('should focus active view when clicking its tab, also if the view and its part are already active', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity();

    // Open view in the main area grid (different grid than 'view.201' which is in the main grid).
    await workbenchNavigator.modifyLayout(layout => layout
      .addView('view.999', {partId: 'part.initial', activateView: true})
      .navigateView('view.999', ['test-pages/focus-test-page']),
    );

    // Activate 'part.right-3'.
    await workbenchNavigator.modifyLayout(layout => layout.activatePart('part.right-3'));

    // Focus view 'view.999'.
    await testPerspective.clickViewTab({viewId: 'view.999'});
    await logPart.clearLog();

    // PRECONDITION: Expect 'view.201' and its part 'part.right-3' to be active, but not focused.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-3');
    await expect.poll(() => appPO.activeViewId({partId: 'part.right-3'})).toEqual('view.201');
    await expect.poll(() => appPO.focusOwner()).toEqual('view.999');
    await expect(appPO.view({viewId: 'view.201'}).viewport).not.toContainFocus();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('focus-within-view')).not.toBeVisible();
    await expect.poll(() => logPart.getLog()).toEqual([]);

    // TEST: Click view 'view.201'.
    await testPerspective.clickViewTab({viewId: 'view.201'});

    // Expect view 'view.201' to have focus.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-3');
    await expect.poll(() => appPO.activeViewId({partId: 'part.right-3'})).toEqual('view.201');
    await expect.poll(() => appPO.focusOwner()).toEqual('view.201');
    await expect(appPO.view({viewId: 'view.201'}).viewport).toContainFocus();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('focus-within-view')).toBeVisible();
    await expect.poll(() => logPart.getLog()).toEqual(['view.201']);
  });

  test('should focus active view when clicking its content, also if the view and its part are already active', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity();

    // Open view in the main area grid (different grid than 'view.201' which is in the main grid).
    await workbenchNavigator.modifyLayout(layout => layout
      .addView('view.999', {partId: 'part.initial', activateView: true})
      .navigateView('view.999', ['test-pages/focus-test-page']),
    );

    // Activate 'part.right-3'.
    await workbenchNavigator.modifyLayout(layout => layout.activatePart('part.right-3'));

    // Focus view 'view.999'.
    await testPerspective.clickViewInput({viewId: 'view.999'});
    await logPart.clearLog();

    // PRECONDITION: Expect 'view.201' and its part 'part.right-3' to be active, but not focused.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-3');
    await expect.poll(() => appPO.activeViewId({partId: 'part.right-3'})).toEqual('view.201');
    await expect.poll(() => appPO.focusOwner()).toEqual('view.999');
    await expect(appPO.view({viewId: 'view.201'}).viewport).not.toContainFocus();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('focus-within-view')).not.toBeVisible();
    await expect.poll(() => logPart.getLog()).toEqual([]);

    // TEST: Click view 'view.201'.
    await testPerspective.clickViewTab({viewId: 'view.201'});

    // Expect view 'view.201' to have focus.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-3');
    await expect.poll(() => appPO.activeViewId({partId: 'part.right-3'})).toEqual('view.201');
    await expect.poll(() => appPO.focusOwner()).toEqual('view.201');
    await expect(appPO.view({viewId: 'view.201'}).viewport).toContainFocus();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('focus-within-view')).toBeVisible();
    await expect.poll(() => logPart.getLog()).toEqual(['view.201']);
  });

  test('should focus active view when activating it by router, also if the view and its part are already active', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity();

    // Activate 'part.right-3'.
    await workbenchNavigator.modifyLayout(layout => layout.activatePart('part.right-3'));
    await logPart.clearLog();

    // Focus desktop.
    await testPerspective.clickDesktopInput();
    await logPart.clearLog();

    // PRECONDITION: Expect 'view.201' and its part 'part.right-3' to be active, but not focused.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-3');
    await expect.poll(() => appPO.activeViewId({partId: 'part.right-3'})).toEqual('view.201');
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect(appPO.view({viewId: 'view.201'}).viewport).not.toContainFocus();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('focus-within-view')).not.toBeVisible();
    await expect.poll(() => logPart.getLog()).toEqual([]);

    // TEST: Activate view 'view.201' via router.
    await workbenchNavigator.modifyLayout(layout => layout.activateView('view.201'));

    // Expect view 'view.201' to have focus.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-3');
    await expect.poll(() => appPO.activeViewId({partId: 'part.right-3'})).toEqual('view.201');
    await expect.poll(() => appPO.focusOwner()).toEqual('view.201');
    await expect(appPO.view({viewId: 'view.201'}).viewport).toContainFocus();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('focus-within-view')).toBeVisible();
    await expect.poll(() => logPart.getLog()).toEqual([
      expect.anything(), // ignore ModifyLayoutPage
      'view.201',
    ]);
  });

  test('should focus inactive view when clicking its tab', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity();

    // Activate 'part.right-1'.
    await workbenchNavigator.modifyLayout(layout => layout.activatePart('part.right-1'));
    await logPart.clearLog();

    // PRECONDITION: Expect 'view.202' and its part not to be active.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-1');
    await expect.poll(() => appPO.activeViewId({partId: 'part.right-3'})).toEqual('view.201');
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right-1');
    await expect(appPO.part({partId: 'part.right-1'}).slot.viewport).toContainFocus();
    await expect(appPO.view({viewId: 'view.202'}).tab.state('active')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.202'}).tab.state('focus-within-view')).not.toBeVisible();
    await expect.poll(() => logPart.getLog()).toEqual([]);

    // TEST: Click view 'view.202'.
    await testPerspective.clickViewTab({viewId: 'view.202'});

    // Expect view 'view.202' to be active and have focus.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-3');
    await expect.poll(() => appPO.activeViewId({partId: 'part.right-3'})).toEqual('view.202');
    await expect.poll(() => appPO.focusOwner()).toEqual('view.202');
    await expect(appPO.view({viewId: 'view.202'}).viewport).toContainFocus();
    await expect(appPO.view({viewId: 'view.202'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.202'}).tab.state('focus-within-view')).toBeVisible();
    await expect.poll(() => logPart.getLog()).toEqual(['view.202']);
  });

  test('should focus inactive view when activating it by router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity();

    // Activate 'part.right-1'.
    await workbenchNavigator.modifyLayout(layout => layout.activatePart('part.right-1'));
    await logPart.clearLog();

    // Focus desktop to clear focus owner.
    await testPerspective.clickDesktopInput();
    await logPart.clearLog();

    // PRECONDITION: Expect 'view.202' and its part not to be active.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-1');
    await expect.poll(() => appPO.activeViewId({partId: 'part.right-3'})).toEqual('view.201');
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect(testPerspective.desktopInput()).toBeFocused();
    await expect(appPO.view({viewId: 'view.202'}).tab.state('active')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.202'}).tab.state('focus-within-view')).not.toBeVisible();
    await expect.poll(() => logPart.getLog()).toEqual([]);

    // TEST: Activate view 'view.202' via router.
    await workbenchNavigator.modifyLayout(layout => layout
      .activateView('view.202')
      .activatePart('part.right-3'),
    );

    // Expect view 'view.202' to be active and have focus.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-3');
    await expect.poll(() => appPO.activeViewId({partId: 'part.right-3'})).toEqual('view.202');
    await expect.poll(() => appPO.focusOwner()).toEqual('view.202');
    await expect(appPO.view({viewId: 'view.202'}).viewport).toContainFocus();
    await expect(appPO.view({viewId: 'view.202'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.202'}).tab.state('focus-within-view')).toBeVisible();
    await expect.poll(() => logPart.getLog()).toEqual([
      expect.anything(), // ignore ModifyLayoutPage
      'view.202',
    ]);
  });

  test('should focus active part when clicking it', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity();

    // Activate 'part.right-1'.
    await workbenchNavigator.modifyLayout(layout => layout.activatePart('part.right-1'));

    // Focus desktop.
    await testPerspective.clickDesktopInput();
    await logPart.clearLog();

    // PRECONDITION: Expect 'part.right-1' to be active, but not focused.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-1');
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect(appPO.part({partId: 'part.right-1'}).slot.viewport).not.toContainFocus();
    await expect.poll(() => logPart.getLog()).toEqual([]);

    // TEST: Click part 'part.right-1'.
    await testPerspective.clickPartBar({partId: 'part.right-1'});

    // Expect part 'part.right-1' to have focus.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-1');
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right-1');
    await expect(appPO.part({partId: 'part.right-1'}).slot.viewport).toContainFocus();
    await expect.poll(() => logPart.getLog()).toEqual(['part.right-1']);
  });

  test('should focus active part when clicking its content', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity();

    // Activate 'part.right-1'.
    await workbenchNavigator.modifyLayout(layout => layout.activatePart('part.right-1'));

    // Focus desktop.
    await testPerspective.clickDesktopInput();
    await logPart.clearLog();

    // PRECONDITION: Expect 'part.right-1' to be active, but not focused.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-1');
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect(appPO.part({partId: 'part.right-1'}).slot.viewport).not.toContainFocus();
    await expect.poll(() => logPart.getLog()).toEqual([]);

    // TEST: Click part 'part.right-1'.
    await testPerspective.clickPart({partId: 'part.right-1'});

    // Expect part 'part.right-1' to have focus.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-1');
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right-1');
    await expect(appPO.part({partId: 'part.right-1'}).slot.viewport).toContainFocus();
    await expect.poll(() => logPart.getLog()).toEqual(['part.right-1']);
  });

  test('should focus active part when activating it by router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity();

    // Activate 'part.right-1'.
    await workbenchNavigator.modifyLayout(layout => layout.activatePart('part.right-1'));

    // Focus desktop to clear focus owner.
    await testPerspective.clickDesktopInput();
    await logPart.clearLog();

    // PRECONDITION: Expect 'part.right-1' to be active, but not focused.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-1');
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect(appPO.part({partId: 'part.right-1'}).slot.viewport).not.toContainFocus();
    await expect.poll(() => logPart.getLog()).toEqual([]);

    // TEST: Activate part 'part.right-1' via router.
    await workbenchNavigator.modifyLayout(layout => layout.activatePart('part.right-1'));

    // Expect part 'part.right-1' to have focus.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-1');
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right-1');
    await expect(appPO.part({partId: 'part.right-1'}).slot.viewport).toContainFocus();
    await expect.poll(() => logPart.getLog()).toEqual([
      expect.anything(), // ignore ModifyLayoutPage
      'part.right-1',
    ]);
  });

  test('should focus inactive part when clicking it', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity();

    // Activate 'part.right-2'.
    await workbenchNavigator.modifyLayout(layout => layout.activatePart('part.right-2'));
    await logPart.clearLog();

    // PRECONDITION: Expect 'part.right-1' to be inactive and not focused.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-2');
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right-2');
    await expect(appPO.part({partId: 'part.right-1'}).slot.viewport).not.toContainFocus();
    await expect.poll(() => logPart.getLog()).toEqual([]);

    // TEST: Click part 'part.right-1'.
    await testPerspective.clickPartBar({partId: 'part.right-1'});

    // Expect part 'part.right-1' to be active and have focus.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-1');
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right-1');
    await expect(appPO.part({partId: 'part.right-1'}).slot.viewport).toContainFocus();
    await expect.poll(() => logPart.getLog()).toEqual(['part.right-1']);
  });

  test('should focus inactive part when clicking its content', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity();

    // Activate 'part.right-2'.
    await workbenchNavigator.modifyLayout(layout => layout.activatePart('part.right-2'));
    await logPart.clearLog();

    // PRECONDITION: Expect 'part.right-1' to be inactive and not focused.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-2');
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right-2');
    await expect(appPO.part({partId: 'part.right-1'}).slot.viewport).not.toContainFocus();
    await expect.poll(() => logPart.getLog()).toEqual([]);

    // TEST: Click part 'part.right-1'.
    await testPerspective.clickPart({partId: 'part.right-1'});

    // Expect part 'part.right-1' to be active and have focus.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-1');
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right-1');
    await expect(appPO.part({partId: 'part.right-1'}).slot.viewport).toContainFocus();
    await expect.poll(() => logPart.getLog()).toEqual(['part.right-1']);
  });

  test('should focus inactive part when activating it by router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity();

    // Activate 'part.right-2'.
    await workbenchNavigator.modifyLayout(layout => layout.activatePart('part.right-2'));
    await logPart.clearLog();

    // Focus desktop to clear focus owner.
    await testPerspective.clickDesktopInput();
    await logPart.clearLog();

    // PRECONDITION: Expect 'part.right-1' to be inactive and not focused.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-2');
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect(appPO.part({partId: 'part.right-1'}).slot.viewport).not.toContainFocus();
    await expect.poll(() => logPart.getLog()).toEqual([]);

    // TEST: Activate part 'part.right-1' via router.
    await workbenchNavigator.modifyLayout(layout => layout.activatePart('part.right-1'));

    // Expect part 'part.right-1' to be active and have focus.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-1');
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right-1');
    await expect(appPO.part({partId: 'part.right-1'}).slot.viewport).toContainFocus();
    await expect.poll(() => logPart.getLog()).toEqual([
      expect.anything(), // ignore ModifyLayoutPage
      'part.right-1',
    ]);
  });

  test('should retain workbench focus when clicking tab of focused view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity();

    // Activate 'view.201'.
    await workbenchNavigator.modifyLayout(layout => layout
      .activatePart('part.right-3')
      .activateView('view.201'),
    );
    await logPart.clearLog();

    // PRECONDITION: Expect 'view.201' to be active and focused.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-3');
    await expect.poll(() => appPO.activeViewId({partId: 'part.right-3'})).toEqual('view.201');
    await expect.poll(() => appPO.focusOwner()).toEqual('view.201');
    await expect(appPO.view({viewId: 'view.201'}).viewport).toContainFocus();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('focus-within-view')).toBeVisible();
    await expect.poll(() => logPart.getLog()).toEqual([]);

    // TEST: Click view 'view.201'.
    await testPerspective.clickViewTab({viewId: 'view.201'});

    // Expect view 'view.201' to have focus and no focus change.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-3');
    await expect.poll(() => appPO.activeViewId({partId: 'part.right-3'})).toEqual('view.201');
    await expect.poll(() => appPO.focusOwner()).toEqual('view.201');
    await expect(appPO.view({viewId: 'view.201'}).viewport).toContainFocus();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('focus-within-view')).toBeVisible();
    await expect.poll(() => logPart.getLog()).toEqual([]);
  });

  test('should switch focus when switching tabs', async ({appPO}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity();

    // TEST: Activate view 'view.201'.
    await testPerspective.clickViewTab({viewId: 'view.201'});
    await logPart.clearLog();

    // PRECONDITION: Expect 'view.201' to be active and focused.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-3');
    await expect.poll(() => appPO.activeViewId({partId: 'part.right-3'})).toEqual('view.201');
    await expect.poll(() => appPO.focusOwner()).toEqual('view.201');
    await expect(appPO.view({viewId: 'view.201'}).viewport).toContainFocus();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('focus-within-view')).toBeVisible();
    await expect.poll(() => logPart.getLog()).toEqual([]);

    // TEST: Click view 'view.202'.
    await testPerspective.clickViewTab({viewId: 'view.202'});

    // Expect view 'view.202' to be active and have focus.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-3');
    await expect.poll(() => appPO.activeViewId({partId: 'part.right-3'})).toEqual('view.202');
    await expect.poll(() => appPO.focusOwner()).toEqual('view.202');
    await expect(appPO.view({viewId: 'view.201'}).tab.state('active')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('focus-within-view')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.202'}).viewport).toContainFocus();
    await expect(appPO.view({viewId: 'view.202'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.202'}).tab.state('focus-within-view')).toBeVisible();
    await expect.poll(() => logPart.getLog()).toEqual([
      'view.202',
    ]);

    // TEST: Click view 'view.201'.
    await testPerspective.clickViewTab({viewId: 'view.201'});

    // Expect view 'view.201' to be active and have focus.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-3');
    await expect.poll(() => appPO.activeViewId({partId: 'part.right-3'})).toEqual('view.201');
    await expect.poll(() => appPO.focusOwner()).toEqual('view.201');
    await expect(appPO.view({viewId: 'view.201'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('focus-within-view')).toBeVisible();
    await expect(appPO.view({viewId: 'view.201'}).viewport).toContainFocus();
    await expect(appPO.view({viewId: 'view.202'}).tab.state('active')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.202'}).tab.state('focus-within-view')).not.toBeVisible();
    await expect.poll(() => logPart.getLog()).toEqual([
      'view.202',
      'view.201',
    ]);
  });

  test('should focus activity when opening it (by clicking the activity item)', async ({appPO}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity();

    // Focus desktop.
    await testPerspective.clickDesktopInput();
    await logPart.clearLog();

    // PRECONDITION: Expect activity to be closed.
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).not.toBeVisible();
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect.poll(() => logPart.getLog()).toEqual([]);

    // TEST: Open activity 'activity.1'.
    await appPO.activityItem({activityId: 'activity.1'}).click();

    await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).toBeVisible();
    await expect(appPO.part({partId: 'part.activity-1a'}).slot.viewport).toContainFocus();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity-1a');
    await expect.poll(() => appPO.activePartId({grid: 'activity.1'})).toEqual('part.activity-1a');
    await expect.poll(() => logPart.getLog()).toEqual([
      'part.activity-1a',
    ]);

    // TEST: Close activity 'activity.1'.
    await appPO.activityItem({activityId: 'activity.1'}).click();

    await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).button).toBeFocused();
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect.poll(() => logPart.getLog()).toEqual([
      'part.activity-1a',
      '<null>',
    ]);

    // TEST: Open activity 'activity.2'.
    await appPO.activityItem({activityId: 'activity.2'}).click();

    await expect(appPO.activityItem({activityId: 'activity.2'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.2'}).state('focus-within-activity')).toBeVisible();
    await expect(appPO.part({partId: 'part.activity-2'}).slot.viewport).toContainFocus();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity-2');
    await expect.poll(() => appPO.activePartId({grid: 'activity.2'})).toEqual('part.activity-2');
    await expect.poll(() => logPart.getLog()).toEqual([
      'part.activity-1a',
      '<null>',
      'part.activity-2',
    ]);

    // TEST: Close activity 'activity.2'.
    await appPO.activityItem({activityId: 'activity.2'}).click();

    await expect(appPO.activityItem({activityId: 'activity.2'}).state('active')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.2'}).state('focus-within-activity')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.2'}).button).toBeFocused();
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect.poll(() => logPart.getLog()).toEqual([
      'part.activity-1a',
      '<null>',
      'part.activity-2',
      '<null>',
    ]);

    // TEST: Open activity 'activity.1'.
    await appPO.activityItem({activityId: 'activity.1'}).click();

    await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).toBeVisible();
    await expect(appPO.part({partId: 'part.activity-1a'}).slot.viewport).toContainFocus();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity-1a');
    await expect.poll(() => appPO.activePartId({grid: 'activity.1'})).toEqual('part.activity-1a');
    await expect.poll(() => logPart.getLog()).toEqual([
      'part.activity-1a',
      '<null>',
      'part.activity-2',
      '<null>',
      'part.activity-1a',
    ]);

    // TEST: Close activity 'activity.1'.
    await appPO.activityItem({activityId: 'activity.1'}).click();

    await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).button).toBeFocused();
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect.poll(() => logPart.getLog()).toEqual([
      'part.activity-1a',
      '<null>',
      'part.activity-2',
      '<null>',
      'part.activity-1a',
      '<null>',
    ]);
  });

  test.only('should not focus activity on restore after minimization', async ({appPO, page}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity();
    await logPart.clearLog();

    // Open activity 'activity.1'.
    await appPO.activityItem({activityId: 'activity.1'}).click();

    // PRECONDITION: Expect activity to be opened.
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).toBeVisible();
    await expect(appPO.part({partId: 'part.activity-1a'}).slot.viewport).toContainFocus();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity-1a');
    await expect.poll(() => appPO.activePartId({grid: 'activity.1'})).toEqual('part.activity-1a');
    await expect.poll(() => logPart.getLog()).toEqual([
      'part.activity-1a',
    ]);

    // TEST: Close activities via minimize.
    await logPart.clearLog();
    await page.keyboard.press('Control+Shift+F12');

    // Expect activity to be closed and not focused.
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.2'}).state('active')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.2'}).state('focus-within-activity')).not.toBeVisible();
    await expect.poll(() => appPO.focusOwner()).toBeNull();

    // TEST: Open activities via maximize.
    await page.keyboard.press('Control+Shift+F12');

    // Expect activity.1 not to be focused.
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.2'}).state('active')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.2'}).state('focus-within-activity')).not.toBeVisible();
    await expect(appPO.part({partId: 'part.activity-1a'}).slot.viewport).not.toContainFocus();
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect.poll(() => appPO.activePartId({grid: 'activity.1'})).toEqual('part.activity-1a');
    await expect.poll(() => logPart.getLog()).toEqual([
      '<null>',
    ]);

    // TEST: Open activity 'activity.2'.
    await logPart.clearLog();
    await appPO.activityItem({activityId: 'activity.2'}).click();

    await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.2'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.2'}).state('focus-within-activity')).toBeVisible();
    await expect(appPO.part({partId: 'part.activity-2'}).slot.viewport).toContainFocus();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity-2');
    await expect.poll(() => appPO.activePartId({grid: 'activity.1'})).toEqual('part.activity-1a');
    await expect.poll(() => appPO.activePartId({grid: 'activity.2'})).toEqual('part.activity-2');
    await expect.poll(() => logPart.getLog()).toEqual([
      'part.activity-2',
    ]);

    // TEST: Close activities via minimize.
    await logPart.clearLog();
    await page.keyboard.press('Control+Shift+F12');

    // Expect activities to be closed and not focused.
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.2'}).state('active')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.2'}).state('focus-within-activity')).not.toBeVisible();
    await expect.poll(() => appPO.focusOwner()).toBeNull();

    // TEST: Open activities via maximize.
    await page.keyboard.press('Control+Shift+F12');

    // Expect activity.2 not to be focused.
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.2'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.2'}).state('focus-within-activity')).not.toBeVisible();
    await expect(appPO.part({partId: 'part.activity-2'}).slot.viewport).not.toContainFocus();
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect.poll(() => appPO.activePartId({grid: 'activity.1'})).toEqual('part.activity-1a');
    await expect.poll(() => appPO.activePartId({grid: 'activity.2'})).toEqual('part.activity-2');
    await expect.poll(() => logPart.getLog()).toEqual([
      '<null>',
    ]);

    // TEST: Focus activity.1
    await logPart.clearLog();
    await testPerspective.clickPartInput({partId: 'part.activity-1a'});

    // Expect activity.1 to be focused.
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.2'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.2'}).state('focus-within-activity')).not.toBeVisible();
    await expect(testPerspective.partInput({partId: 'part.activity-1a'})).toBeFocused();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.activity-1a');
    await expect.poll(() => appPO.activePartId({grid: 'activity.1'})).toEqual('part.activity-1a');
    await expect.poll(() => appPO.activePartId({grid: 'activity.2'})).toEqual('part.activity-2');
    await expect.poll(() => logPart.getLog()).toEqual([
      'part.activity-1a',
    ]);

    // TEST: Close activities via minimize.
    await logPart.clearLog();
    await page.keyboard.press('Control+Shift+F12');

    // Expect activities to be closed and not focused.
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.2'}).state('active')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.2'}).state('focus-within-activity')).not.toBeVisible();
    await expect.poll(() => appPO.focusOwner()).toBeNull();

    // TEST: Open activities via maximize.
    await page.keyboard.press('Control+Shift+F12');

    // Expect activity.1 not to be focused.
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.1'}).state('focus-within-activity')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.2'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.2'}).state('focus-within-activity')).not.toBeVisible();
    await expect(appPO.part({partId: 'part.activity-1a'}).slot.viewport).not.toContainFocus();
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect.poll(() => appPO.activePartId({grid: 'activity.1'})).toEqual('part.activity-1a');
    await expect.poll(() => appPO.activePartId({grid: 'activity.2'})).toEqual('part.activity-2');
    await expect.poll(() => logPart.getLog()).toEqual([
      '<null>',
    ]);
  });

  test('should focus activity (has views) when opening and closing it (by clicking the activity item)', async ({appPO}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity();

    // Focus desktop.
    await testPerspective.clickDesktopInput();
    await logPart.clearLog();

    // PRECONDITION: Expect activity to be closed.
    await expect(appPO.activityItem({activityId: 'activity.3'}).state('active')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.3'}).state('focus-within-activity')).not.toBeVisible();
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect.poll(() => logPart.getLog()).toEqual([]);

    // TEST: Open activity 'activity.3'.
    await appPO.activityItem({activityId: 'activity.3'}).click();

    // Expect activity to be opened.
    await expect(appPO.activityItem({activityId: 'activity.3'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.3'}).state('focus-within-activity')).toBeVisible();
    await expect(appPO.view({viewId: 'view.301'}).viewport).toContainFocus();
    await expect(appPO.view({viewId: 'view.301'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.301'}).tab.state('focus-within-view')).toBeVisible();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.301');
    await expect.poll(() => appPO.activePartId({grid: 'activity.3'})).toEqual('part.activity-3');
    await expect.poll(() => logPart.getLog()).toEqual([
      'view.301',
    ]);

    // TEST: Close activity 'activity.3'.
    await appPO.activityItem({activityId: 'activity.3'}).click();

    // Expect activity to be closed.
    await expect(appPO.activityItem({activityId: 'activity.3'}).state('active')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.3'}).state('focus-within-activity')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.3'}).button).toBeFocused();
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect.poll(() => logPart.getLog()).toEqual([
      'view.301',
      '<null>',
    ]);
  });

  test('should not focus activity (has views) on restore after minimization', async ({appPO, page}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity();

    // Open activity 'activity.3'.
    await appPO.activityItem({activityId: 'activity.3'}).click();
    await logPart.clearLog();

    // PRECONDITION: Expect activity to be opened.
    await expect(appPO.activityItem({activityId: 'activity.3'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.3'}).state('focus-within-activity')).toBeVisible();
    await expect(appPO.view({viewId: 'view.301'}).viewport).toContainFocus();
    await expect(appPO.view({viewId: 'view.301'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.301'}).tab.state('focus-within-view')).toBeVisible();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.301');
    await expect.poll(() => appPO.activePartId({grid: 'activity.3'})).toEqual('part.activity-3');
    await expect.poll(() => appPO.activeViewId({partId: 'part.activity-3'})).toEqual('view.301');
    await expect.poll(() => logPart.getLog()).toEqual([]);

    // TEST: Close activities via minimize.
    await page.keyboard.press('Control+Shift+F12');

    // Expect activity to be closed and not focused.
    await expect(appPO.activityItem({activityId: 'activity.3'}).state('active')).not.toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.3'}).state('focus-within-activity')).not.toBeVisible();
    await expect.poll(() => appPO.focusOwner()).toBeNull();

    // TEST: Open activities via maximize.
    await page.keyboard.press('Control+Shift+F12');

    // Expect activity not to be focused.
    await expect(appPO.activityItem({activityId: 'activity.3'}).state('active')).toBeVisible();
    await expect(appPO.activityItem({activityId: 'activity.3'}).state('focus-within-activity')).not.toBeVisible();
    await expect(appPO.view({viewId: 'view.301'}).viewport).not.toContainFocus();
    await expect.poll(() => appPO.focusOwner()).toBeNull();
    await expect.poll(() => appPO.activePartId({grid: 'activity.3'})).toEqual('part.activity-3');
    await expect.poll(() => appPO.activeViewId({partId: 'part.activity-3'})).toEqual('view.301');
    await expect.poll(() => logPart.getLog()).toEqual([
      '<null>',
    ]);
  });

  test('should not lose workbench focus when clicking part title', async ({appPO}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity();

    // TEST: Activate view 'view.201'.
    await testPerspective.clickViewTab({viewId: 'view.201'});
    await testPerspective.clickViewInput({viewId: 'view.201'});
    await logPart.clearLog();

    // PRECONDITION: Expect 'view.201' to be active and focused.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-3');
    await expect.poll(() => appPO.activeViewId({partId: 'part.right-3'})).toEqual('view.201');
    await expect.poll(() => appPO.focusOwner()).toEqual('view.201');
    await expect(testPerspective.viewInput({viewId: 'view.201'})).toBeFocused();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('focus-within-view')).toBeVisible();
    await expect.poll(() => logPart.getLog()).toEqual([]);

    // TEST: Click title of part bar.
    await appPO.part({partId: 'part.right-3'}).bar.title.click();

    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-3');
    await expect.poll(() => appPO.activeViewId({partId: 'part.right-3'})).toEqual('view.201');
    await expect.poll(() => appPO.focusOwner()).toEqual('view.201');
    await expect(testPerspective.viewInput({viewId: 'view.201'})).toBeFocused();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('focus-within-view')).toBeVisible();
    await expect.poll(() => logPart.getLog()).toEqual([]);
  });

  test('should not lose workbench focus when clicking part bar', async ({appPO}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity();

    // TEST: Activate view 'view.201'.
    await testPerspective.clickViewTab({viewId: 'view.201'});
    await testPerspective.clickViewInput({viewId: 'view.201'});
    await logPart.clearLog();

    // PRECONDITION: Expect 'view.201' to be active and focused.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-3');
    await expect.poll(() => appPO.activeViewId({partId: 'part.right-3'})).toEqual('view.201');
    await expect.poll(() => appPO.focusOwner()).toEqual('view.201');
    await expect(testPerspective.viewInput({viewId: 'view.201'})).toBeFocused();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('focus-within-view')).toBeVisible();
    await expect.poll(() => logPart.getLog()).toEqual([]);

    // TEST: Click part bar.
    await appPO.part({partId: 'part.right-3'}).bar.filler.click();

    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-3');
    await expect.poll(() => appPO.activeViewId({partId: 'part.right-3'})).toEqual('view.201');
    await expect.poll(() => appPO.focusOwner()).toEqual('view.201');
    await expect(testPerspective.viewInput({viewId: 'view.201'})).toBeFocused();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('focus-within-view')).toBeVisible();
    await expect.poll(() => logPart.getLog()).toEqual([]);
  });

  test('should not lose workbench focus when clicking part action', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Register part action.
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('<button>search</button>', {viewId: 'view.201', cssClass: 'testee'});
    await layoutPage.view.tab.close();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity();

    // TEST: Activate view 'view.201'.
    await testPerspective.clickViewTab({viewId: 'view.201'});
    await logPart.clearLog();

    // PRECONDITION: Expect 'view.201' to be active and focused.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-3');
    await expect.poll(() => appPO.activeViewId({partId: 'part.right-3'})).toEqual('view.201');
    await expect.poll(() => appPO.focusOwner()).toEqual('view.201');
    await expect(appPO.view({viewId: 'view.201'}).viewport).toContainFocus();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('focus-within-view')).toBeVisible();
    await expect.poll(() => logPart.getLog()).toEqual([]);

    // TEST: Click part action.
    await appPO.part({partId: 'part.right-3'}).bar.action({cssClass: 'testee'}).locator.click();

    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-3');
    await expect.poll(() => appPO.activeViewId({partId: 'part.right-3'})).toEqual('view.201');
    await expect.poll(() => appPO.focusOwner()).toEqual('view.201');
    await expect(appPO.part({partId: 'part.right-3'}).bar.action({cssClass: 'testee'}).locator.locator('button')).toBeFocused();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('focus-within-view')).toBeVisible();
    await expect.poll(() => logPart.getLog()).toEqual([]);
  });

  test('should not lose workbench focus when clicking view menu', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Register part action.
    const layoutPage = await workbenchNavigator.openInNewTab(LayoutPagePO);
    await layoutPage.registerPartAction('<button>search</button>', {viewId: 'view.201', cssClass: 'testee'});
    await layoutPage.view.tab.close();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity();

    // TEST: Activate view 'view.201'.
    await testPerspective.clickViewTab({viewId: 'view.201'});
    await logPart.clearLog();

    // PRECONDITION: Expect 'view.201' to be active and focused.
    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-3');
    await expect.poll(() => appPO.activeViewId({partId: 'part.right-3'})).toEqual('view.201');
    await expect.poll(() => appPO.focusOwner()).toEqual('view.201');
    await expect(appPO.view({viewId: 'view.201'}).viewport).toContainFocus();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('focus-within-view')).toBeVisible();
    await expect.poll(() => logPart.getLog()).toEqual([]);

    // TEST: Click part action.
    const viewListMenu = await appPO.part({partId: 'part.right-3'}).bar.openViewListMenu();

    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.right-3');
    await expect.poll(() => appPO.activeViewId({partId: 'part.right-3'})).toEqual('view.201');
    await expect.poll(() => appPO.focusOwner()).toEqual('view.201');
    await expect(viewListMenu.filter).toBeFocused();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.201'}).tab.state('focus-within-view')).toBeVisible();
    await expect.poll(() => logPart.getLog()).toEqual([]);
  });

  test('should not lose workbench focus of view on re-layout', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.1', {partId: 'part.main'})
      .navigateView('view.1', ['test-layout'])
      .activateView('view.1'),
    );

    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect(appPO.view({viewId: 'view.1'}).viewport).toContainFocus();

    // Force a relayout by creating a part on the left.
    const layoutPage = new LayoutPagePO(appPO.view({viewId: 'view.1'}))
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
    })

    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.main');
    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect(appPO.view({viewId: 'view.1'}).viewport).toContainFocus();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('active')).toBeVisible();
    await expect(appPO.view({viewId: 'view.1'}).tab.state('focus-within-view')).toBeVisible();
  });

  test('should not lose workbench focus of part on re-layout', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .navigatePart('part.main', ['test-layout'])
      .activatePart('part.main'),
    );

    await expect.poll(() => appPO.focusOwner()).toEqual('part.main');
    await expect(appPO.part({partId: 'part.main'}).slot.viewport).toContainFocus();

    // Force a relayout by creating a part on the left.
    const layoutPage = new LayoutPagePO(appPO.part({partId: 'part.main'}))
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
    })

    await expect.poll(() => appPO.activePartId({grid: 'main'})).toEqual('part.main');
    await expect.poll(() => appPO.focusOwner()).toEqual('part.main');
    await expect(appPO.part({partId: 'part.main'}).slot.viewport).toContainFocus();
  });

  test('should focus dialog when opening dialog', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity({clearLog: true});

    // Open dialog opener view.
    const dialogOpener = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
    const dialogOpenerViewId = await dialogOpener.view.tab.getViewId();
    await logPart.clearLog();

    // PRECONDITION: Expect dialog opener view to have workbench focus.
    await expect.poll(() => logPart.getLog()).toEqual([]);
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogOpenerViewId);

    // TEST: Open dialog.
    await dialogOpener.open('focus-test-page', {cssClass: 'testee'});
    const dialogId = await appPO.dialog({cssClass: 'testee'}).getDialogId();

    // Expect dialog to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual([
      dialogId,
    ]);
    await expect(testPerspective.dialogInput({dialogId})).toBeFocused();

    // TEST: Focus element outside the dialog
    await testPerspective.clickPartInput({partId: 'part.right-2'});

    // Expect dialog not to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right-2');
    await expect.poll(() => logPart.getLog()).toEqual([
      dialogId,
      'part.right-2',
    ]);

    // TEST: Focus element in the dialog.
    await testPerspective.clickDialogInput({dialogId});

    // Expect dialog to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual([
      dialogId,
      'part.right-2',
      dialogId,
    ]);
    await expect(testPerspective.dialogInput({dialogId})).toBeFocused();

    // TEST: Close the dialog.
    await appPO.dialog({dialogId}).close();

    // Expect dialog opener view to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogOpenerViewId);
    await expect.poll(() => logPart.getLog()).toEqual([
      dialogId,
      'part.right-2',
      dialogId,
      dialogOpenerViewId,
    ]);
    await expect(dialogOpener.openButton).toBeFocused();
  });

  test('should focus dialog when activating view with dialog', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity({clearLog: true});

    // Open dialog opener view.
    const dialogOpener = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);

    // Open dialog.
    await dialogOpener.open('focus-test-page', {cssClass: 'testee'});
    const dialogId = await appPO.dialog({cssClass: 'testee'}).getDialogId();

    // Open new tab.
    const startPage = await appPO.openNewViewTab();
    const startPageId = await startPage.view.getViewId();
    await logPart.clearLog();

    // PRECONDITION: Expect dialog not to be visible.
    await expect.poll(() => logPart.getLog()).toEqual([]);
    await expect.poll(() => appPO.focusOwner()).toEqual(startPageId);
    await expect(appPO.dialog({dialogId}).locator).not.toBeVisible();

    // TEST: Activate view with dialog.
    await dialogOpener.view.tab.click();

    // Expect dialog to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual([dialogId]);
    await expect(appPO.dialog({dialogId}).locator).toBeVisible();
    await expect(testPerspective.dialogInput({dialogId})).toBeFocused();
  });

  test('should focus dialog when clicking dialog header', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity({clearLog: true});

    // Open dialog.
    const dialogOpener = await workbenchNavigator.openInNewTab(DialogOpenerPagePO);
    await dialogOpener.open('focus-test-page', {cssClass: 'testee'});
    const dialogId = await appPO.dialog({cssClass: 'testee'}).getDialogId();
    await logPart.clearLog();

    // PRECONDITION: Expect dialog to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual([]);
    await expect(testPerspective.dialogInput({dialogId})).toBeFocused();

    // TEST: Focus element outside the dialog
    await testPerspective.clickPartInput({partId: 'part.right-2'});

    // Expect dialog not to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right-2');
    await expect.poll(() => logPart.getLog()).toEqual([
      'part.right-2',
    ]);
    await expect(testPerspective.partInput({partId: 'part.right-2'})).toBeFocused();

    // TEST: Focus dialog header.
    await testPerspective.clickDialogHeader({dialogId});

    // Expect dialog to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual([
      'part.right-2',
      dialogId,
    ]);
    await expect(appPO.dialog({dialogId}).dialog).toContainFocus();
  });

  test('should focus message box when opening message box', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity({clearLog: true});

    // Open message box opener view.
    const messageBoxOpener = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);
    const messageBoxOpenerViewId = await messageBoxOpener.view.tab.getViewId();
    await logPart.clearLog();

    // PRECONDITION: Expect message box opener view to have workbench focus.
    await expect.poll(() => logPart.getLog()).toEqual([]);
    await expect.poll(() => appPO.focusOwner()).toEqual(messageBoxOpenerViewId);

    // TEST: Open message box.
    await messageBoxOpener.open('component:focus-test-page', {cssClass: 'testee'});
    const dialogId = await appPO.dialog({cssClass: 'testee'}).getDialogId();

    // Expect message box to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual([dialogId]);
    await expect(testPerspective.dialogInput({dialogId})).toBeFocused();

    // TEST: Focus element outside the message box
    await testPerspective.clickPartInput({partId: 'part.right-2'});

    // Expect message box not to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right-2');
    await expect.poll(() => logPart.getLog()).toEqual([
      dialogId,
      'part.right-2',
    ]);

    // TEST: Focus element in the message box.
    await testPerspective.clickDialogInput({dialogId});

    // Expect message box to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual([
      dialogId,
      'part.right-2',
      dialogId,
    ]);
    await expect(testPerspective.dialogInput({dialogId})).toBeFocused();

    // TEST: Close the message box.
    await appPO.messagebox({dialogId}).clickActionButton('ok');

    // Expect message box opener view to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(messageBoxOpenerViewId);
    await expect.poll(() => logPart.getLog()).toEqual([
      dialogId,
      'part.right-2',
      dialogId,
      messageBoxOpenerViewId,
    ]);
    await expect(messageBoxOpener.openButton).toBeFocused();
  });

  test('should focus message box when activating view with dialog', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity({clearLog: true});

    // Open message box opener view.
    const messageBoxOpener = await workbenchNavigator.openInNewTab(MessageBoxOpenerPagePO);

    // Open message box.
    await messageBoxOpener.open('component:focus-test-page', {cssClass: 'testee'});
    const dialogId = await appPO.dialog({cssClass: 'testee'}).getDialogId();

    // Open new tab.
    const startPage = await appPO.openNewViewTab();
    const startPageId = await startPage.view.getViewId();
    await logPart.clearLog();

    // PRECONDITION: Expect message box not to be visible.
    await expect.poll(() => logPart.getLog()).toEqual([]);
    await expect.poll(() => appPO.focusOwner()).toEqual(startPageId);
    await expect(appPO.dialog({dialogId}).locator).not.toBeVisible();

    // TEST: Activate view with message box.
    await messageBoxOpener.view.tab.click();

    // Expect message box to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(dialogId);
    await expect.poll(() => logPart.getLog()).toEqual([dialogId]);
    await expect(appPO.dialog({dialogId}).locator).toBeVisible();
    await expect(testPerspective.dialogInput({dialogId})).toBeFocused();
  });

  test('should focus popup when opening popup', async ({appPO, workbenchNavigator, page}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity({clearLog: true});

    // Open popup opener view.
    const popupOpener = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);
    const popupOpenerViewId = await popupOpener.view.tab.getViewId();
    await logPart.clearLog();

    // PRECONDITION: Expect popup opener view to have workbench focus.
    await expect.poll(() => logPart.getLog()).toEqual([]);
    await expect.poll(() => appPO.focusOwner()).toEqual(popupOpenerViewId);

    // TEST: Open popup.
    await popupOpener.selectPopupComponent('focus-test-page');
    await popupOpener.enterCssClass('testee');
    await popupOpener.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpener.open();
    const popupId = await appPO.popup({cssClass: 'testee'}).getPopupId();

    // Expect popup to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(popupId);
    await expect.poll(() => logPart.getLog()).toEqual([
      popupId,
    ]);
    await expect(testPerspective.popupInput({popupId})).toBeFocused();

    // TEST: Focus element outside the popup
    await testPerspective.clickPartInput({partId: 'part.right-2'});

    // Expect popup not to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right-2');
    await expect.poll(() => logPart.getLog()).toEqual([
      popupId,
      'part.right-2',
    ]);

    // TEST: Focus element in the popup.
    await testPerspective.clickPopupInput({popupId});

    // Expect popup to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(popupId);
    await expect.poll(() => logPart.getLog()).toEqual([
      popupId,
      'part.right-2',
      popupId,
    ]);
    await expect(testPerspective.popupInput({popupId})).toBeFocused();

    // TEST: Close the popup by pressing Escape.
    await page.keyboard.press('Escape');

    // Expect popup opener view to have focus.
    await expect.poll(() => appPO.focusOwner()).toBe(null);
    await expect.poll(() => logPart.getLog()).toEqual([
      popupId,
      'part.right-2',
      popupId,
      '<null>',
    ]);
  });

  test('should focus popup when activating view with popup', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity({clearLog: true});

    // Open popup opener view.
    const popupOpener = await workbenchNavigator.openInNewTab(PopupOpenerPagePO);

    // Open dialog.
    await popupOpener.selectPopupComponent('focus-test-page');
    await popupOpener.enterCssClass('testee');
    await popupOpener.enterCloseStrategy({closeOnFocusLost: false});
    await popupOpener.open();
    const popupId = await appPO.popup({cssClass: 'testee'}).getPopupId();

    // Open new tab.
    const startPage = await appPO.openNewViewTab();
    const startPageId = await startPage.view.getViewId();
    await logPart.clearLog();

    // PRECONDITION: Expect popup not to be visible.
    await expect.poll(() => logPart.getLog()).toEqual([]);
    await expect.poll(() => appPO.focusOwner()).toEqual(startPageId);
    await expect(appPO.popup({popupId}).locator).not.toBeVisible();

    // TEST: Activate view with popup.
    await popupOpener.view.tab.click();

    // Expect popup to have focus.
    await expect.poll(() => appPO.focusOwner()).toEqual(popupId);
    await expect.poll(() => logPart.getLog()).toEqual([popupId]);
    await expect(appPO.popup({popupId}).locator).toBeVisible();
    await expect(testPerspective.popupInput({popupId})).toBeFocused();
  });

  test('should not unset workbench focus when focusing non-workbench element', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial'});

    // Switch to test perspective.
    const testPerspective = new FocusTestPerspectivePO(appPO);
    await testPerspective.switchTo();

    // Open log activity.
    const logPart = await testPerspective.openLogActivity();

    // Activate 'part.right-1'.
    await workbenchNavigator.modifyLayout(layout => layout.activatePart('part.right-1'));
    await logPart.clearLog();

    // PRECONDITION: Expect 'part.right-1' to have workbench focus.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right-1');
    await expect(appPO.part({partId: 'part.right-1'}).slot.viewport).toContainFocus();
    await expect.poll(() => logPart.getLog()).toEqual([]);

    // TEST: Click application header.
    await appPO.header.settingsMenuButton.click();

    // Expect workbench focus not to be unset.
    await expect.poll(() => appPO.focusOwner()).toEqual('part.right-1');
    await expect(appPO.header.settingsMenuButton).toBeFocused();
    await expect.poll(() => logPart.getLog()).toEqual([]);
  });

  test('should focus part if navigated and removing its last view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addView('view.1', {partId: 'part.main'})
      .addView('view.2', {partId: 'part.main'})
      .navigatePart('part.main', ['path/to/part'])
      .activateView('view.1'),
    );

    await expect.poll(() => appPO.focusOwner()).toEqual('view.1');
    await expect(appPO.view({viewId: 'view.1'}).viewport).toContainFocus();

    // Close view.1.
    await appPO.view({viewId: 'view.1'}).tab.close();
    await expect.poll(() => appPO.focusOwner()).toEqual('view.2');
    await expect(appPO.view({viewId: 'view.2'}).viewport).toContainFocus();

    // Close view.2.
    await appPO.view({viewId: 'view.2'}).tab.close();
    await expect.poll(() => appPO.focusOwner()).toEqual('part.main');
    await expect(appPO.part({partId: 'part.main'}).slot.viewport).toContainFocus();
  });
});
