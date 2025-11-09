/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {ViewPagePO} from './page-object/view-page.po';
import {RouterPagePO} from './page-object/router-page.po';
import {RouterPagePO as StandaloneRouterPagePO} from '../workbench/page-object/router-page.po';
import {expectView} from '../matcher/view-matcher';
import {TextMessageBoxPagePO} from '../text-message-box-page.po';
import {expectMessageBox} from '../matcher/message-box-matcher';
import {ViewInfo} from '../workbench/page-object/view-info-dialog.po';
import {TextMessagePO} from './page-object/text-message.po';
import {SizeTestPagePO} from './page-object/test-pages/size-test-page.po';
import {MAIN_AREA} from '../workbench.model';
import {InputFieldTestPagePO} from './page-object/test-pages/input-field-test-page.po';
import {waitForCondition} from '../helper/testing.util';
import {MicrofrontendTestPage1PO} from './page-object/microfrontend-test-page-1.po';
import {MicrofrontendTestPage2PO} from './page-object/microfrontend-test-page-2.po';
import {MicrofrontendTestPage3PO} from './page-object/microfrontend-test-page-3.po';
import {WorkbenchViewCapability} from './page-object/register-workbench-capability-page.po';
import {TextTestPagePO} from './page-object/test-pages/text-test-page.po';

test.describe('Workbench View', () => {

  test('should complete view Observables on navigation', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    // Observable completion expectations:
    // - should complete params$, capability$, active$, focused$ observables only when navigating to a view capability of a different app
    // - should complete title$, heading$, dirty$ and closable$ observables when navigating to a different view capability
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-pages/view-test-page/view1',
        title: 'Testee 1',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-pages/view-test-page/view2',
        title: 'Testee 2',
      },
    });

    await microfrontendNavigator.registerCapability('app2', {
      type: 'view',
      qualifier: {component: 'testee-3'},
      private: false,
      properties: {
        path: 'test-view',
        title: 'Testee 3',
      },
    });

    await microfrontendNavigator.registerIntention('app1', {type: 'view', qualifier: {component: 'testee-3'}});

    // navigate to testee-1 view (app1)
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee-1'}, {
      target: 'view.101',
    });

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});

    // expect testee-1 to show
    await expect(testeeViewPage.view.tab.title).toHaveText('Testee 1');
    const testee1ComponentInstanceId = await testeeViewPage.getComponentInstanceId();

    // navigate to testee-2 view (app1)
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee-2'}, {
      target: 'view.101',
    });

    // expect testee-2 to show
    await expect(testeeViewPage.view.tab.title).toHaveText('Testee 2');
    await testeeViewPage.view.tab.click();
    const testee2ComponentInstanceId = await testeeViewPage.getComponentInstanceId();

    // expect following Observables to complete
    await expect.poll(() => consoleLogs.get({severity: 'debug', message: /ObservableComplete/})).toEqualIgnoreOrder([
      `[TitleObservableComplete] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[HeadingObservableComplete] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[DirtyObservableComplete] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[ClosableObservableComplete] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
    ]);
    consoleLogs.clear();

    // update params (no microfrontend change)
    await testeeViewPage.navigateSelf({param1: 'param-1'});

    // expect following Observables to complete
    await expect.poll(() => consoleLogs.get({severity: 'debug', message: /ObservableComplete/})).toEqual([]);
    consoleLogs.clear();

    // navigate to testee-3 view (app3)
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee-3'}, {
      target: 'view.101',
    });

    // expect testee-3 to show
    await expect(testeeViewPage.view.tab.title).toHaveText('Testee 3');
    await testeeViewPage.view.tab.click();
    const testee3ComponentInstanceId = await testeeViewPage.getComponentInstanceId();

    // expect following Observables to complete
    await expect.poll(() => consoleLogs.get({severity: 'debug', message: /ObservableComplete/})).toEqualIgnoreOrder([
      `[ParamsObservableComplete] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[CapabilityObservableComplete] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[ActiveObservableComplete] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[FocusedObservableComplete] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,

      `[ParamsObservableComplete] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
      `[CapabilityObservableComplete] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
      `[ActiveObservableComplete] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
      `[FocusedObservableComplete] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,

      `[TitleObservableComplete] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
      `[HeadingObservableComplete] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
      `[DirtyObservableComplete] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
      `[ClosableObservableComplete] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
    ]);
    consoleLogs.clear();

    // expect the component instances to be different
    expect(new Set([testee1ComponentInstanceId, testee2ComponentInstanceId, testee3ComponentInstanceId]).size).toEqual(3);

    // navigate to testee-1 view (app1)
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee-1'}, {
      target: 'view.101',
    });

    // expect following Observables to complete
    await expect.poll(() => consoleLogs.get({severity: 'debug', message: /ObservableComplete/})).toEqualIgnoreOrder([
      `[ParamsObservableComplete] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
      `[CapabilityObservableComplete] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
      `[ActiveObservableComplete] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
      `[FocusedObservableComplete] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,

      `[TitleObservableComplete] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
      `[HeadingObservableComplete] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
      `[DirtyObservableComplete] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
      `[ClosableObservableComplete] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
    ]);
  });

  test('should allow updating the viewtab title', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

    await viewPage.enterTitle('UPDATED TITLE');
    await expect(viewPage.view.tab.title).toHaveText('UPDATED TITLE');

    await viewPage.enterTitle('updated title');
    await expect(viewPage.view.tab.title).toHaveText('updated title');
  });

  test('should allow updating the viewtab heading', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');
    const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

    await viewPage.enterHeading('UPDATED HEADING');
    await expect(viewPage.view.tab.heading).toHaveText('UPDATED HEADING');

    await viewPage.enterHeading('updated heading');
    await expect(viewPage.view.tab.heading).toHaveText('updated heading');
  });

  test('should allow updating the viewtab dirty state', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

    await viewPage.markDirty(true);
    await expect(viewPage.view.tab.state('dirty')).toBeVisible();

    await viewPage.markDirty(false);
    await expect(viewPage.view.tab.state('dirty')).not.toBeVisible();

    await viewPage.markDirty(); // noarg
    await expect(viewPage.view.tab.state('dirty')).toBeVisible();
  });

  test('should allow updating the viewtab closable flag', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

    await viewPage.checkClosable(true);
    await expect(viewPage.view.tab.closeButton).toBeVisible();

    await viewPage.checkClosable(false);
    await expect(viewPage.view.tab.closeButton).not.toBeVisible();
  });

  test('should close a view', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

    // expect view to be active
    await expectView(viewPage).toBeActive();

    // close the view
    await viewPage.clickClose();

    await expect(appPO.views()).toHaveCount(0);
    await expectView(viewPage).not.toBeAttached();
  });

  test('should prevent closing a view using a `CanClose` guard', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

    // Open view.
    const testeeViewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    await testeeViewPage.checkConfirmClosing(true);

    // Close view.
    await testeeViewPage.view.tab.close();

    // Expect the closing to be blocked.
    const canCloseMessageBox = appPO.messagebox({cssClass: ['e2e-close-view', await testeeViewPage.view.getViewId()]});
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox)).toBeVisible();
    await expectView(testeeViewPage).toBeActive();

    // Cancel closing.
    await canCloseMessageBox.clickActionButton('no');
    await expectView(testeeViewPage).toBeActive();

    // Close view.
    await testeeViewPage.view.tab.close();

    // Expect the closing to be blocked.
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox)).toBeVisible();
    await expectView(testeeViewPage).toBeActive();

    // Confirm closing.
    await canCloseMessageBox.clickActionButton('yes');
    await expectView(testeeViewPage).not.toBeAttached();
  });

  test('should unregister `CanClose` guard', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

    // Open view.
    const testeeViewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    await testeeViewPage.checkConfirmClosing(true);

    // Close view.
    await testeeViewPage.view.tab.close();

    // Expect the closing to be blocked.
    const canCloseMessageBox = appPO.messagebox({cssClass: ['e2e-close-view', await testeeViewPage.view.getViewId()]});
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox)).toBeVisible();
    await expectView(testeeViewPage).toBeActive();

    // Cancel closing.
    await canCloseMessageBox.clickActionButton('no');
    await expectView(testeeViewPage).toBeActive();

    // Unregister `CanClose` guard.
    await testeeViewPage.checkConfirmClosing(false);

    // Close view.
    await testeeViewPage.view.tab.close();
    await expectView(testeeViewPage).not.toBeAttached();
  });

  test('should close confirmed views, leaving other views open', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

    // Open test view 1.
    const testee1ViewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

    // Open test view 2.
    const testee2ViewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    await testee2ViewPage.checkConfirmClosing(true); // prevent the view from closing

    // Open test view 3.
    const testee3ViewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    await testee3ViewPage.checkConfirmClosing(true); // prevent the view from closing

    // Open test view 4.
    const testee4ViewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

    // Close all views.
    const contextMenu = await testee4ViewPage.view.tab.openContextMenu();
    await contextMenu.menuItems.closeAll.click();

    // Expect view 1 and view 4 to be closed.
    await expect(appPO.views()).toHaveCount(2);
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).toBeInactive();
    await expectView(testee3ViewPage).toBeActive();
    await expectView(testee4ViewPage).not.toBeAttached();

    const canCloseMessageBox2 = appPO.messagebox({cssClass: ['e2e-close-view', await testee2ViewPage.view.getViewId()]});
    const canCloseMessageBox3 = appPO.messagebox({cssClass: ['e2e-close-view', await testee3ViewPage.view.getViewId()]});

    // Test that the closing of view 2 and view 3 is blocked.
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox2)).toBeHidden();
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox3)).toBeVisible();

    // Confirm closing view 3.
    await canCloseMessageBox3.clickActionButton('yes');

    // Prevent closing view 2.
    await canCloseMessageBox2.clickActionButton('no');

    // Expect view 2 not to be closed.
    await expect(appPO.views()).toHaveCount(1);
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).toBeActive();
    await expectView(testee3ViewPage).not.toBeAttached();
    await expectView(testee4ViewPage).not.toBeAttached();
  });

  test('should close view and log error if `CanClose` guard throws an error', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

    // Open test view 1.
    const testee1ViewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

    // Open test view 2.
    const testee2ViewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const testee2ViewId = await testee2ViewPage.view.getViewId();
    await testee2ViewPage.checkConfirmClosing(true); // prevent the view from closing

    // Open test view 3.
    const testee3ViewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const testee3ViewId = await testee3ViewPage.view.getViewId();
    await testee3ViewPage.checkConfirmClosing(true); // prevent the view from closing

    // Open test view 4.
    const testee4ViewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

    // Close all views.
    const contextMenu = await testee4ViewPage.view.tab.openContextMenu();
    await contextMenu.menuItems.closeAll.click();

    // Expect view 1 and view 4 to be closed.
    await expect(appPO.views()).toHaveCount(2);
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).toBeInactive();
    await expectView(testee3ViewPage).toBeActive();
    await expectView(testee4ViewPage).not.toBeAttached();

    const canCloseMessageBox2 = appPO.messagebox({cssClass: ['e2e-close-view', testee2ViewId]});
    const canCloseMessageBox3 = appPO.messagebox({cssClass: ['e2e-close-view', testee3ViewId]});

    // Test that the closing of view 2 and view 3 is blocked.
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox2)).toBeHidden();
    await expectMessageBox(new TextMessageBoxPagePO(canCloseMessageBox3)).toBeVisible();

    // Simulate `CanClose` guard of view 3 to error.
    await canCloseMessageBox3.clickActionButton('error');

    // Assert error.
    const expectedMessage = new RegExp(`\\[CanCloseSpecError] Error in CanLoad of view '${testee3ViewId}'\\.`);
    await expect.poll(() => consoleLogs.contains({severity: 'error', message: expectedMessage})).toBe(true);

    // Prevent closing view 2.
    await canCloseMessageBox2.clickActionButton('no');

    // Expect view 2 not to be closed.
    await expect(appPO.views()).toHaveCount(1);
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).toBeActive();
    await expectView(testee3ViewPage).not.toBeAttached();
    await expectView(testee4ViewPage).not.toBeAttached();
  });

  test('should activate viewtab when switching between tabs', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // open test view 1
    const viewPage1 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    await expectView(viewPage1).toBeActive();

    // open test view 2
    const viewPage2 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    await expectView(viewPage1).toBeInactive();
    await expectView(viewPage2).toBeActive();

    // activate view 1
    await viewPage1.view.tab.click();
    await expectView(viewPage1).toBeActive();
    await expectView(viewPage2).toBeInactive();
  });

  test('should maintain view size if not active (to not flicker on reactivation; to support for virtual scrolling)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/size-test-page',
      },
    });

    // Open view.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {cssClass: 'testee'});

    const viewPage = new SizeTestPagePO(appPO, {cssClass: 'testee'});

    // Expect view to be visible.
    await expectView(viewPage).toBeActive();
    const viewSize = await viewPage.getBoundingBox();
    const sizeChanges = await viewPage.getRecordedSizeChanges();

    // Detach contextual view.
    await appPO.openNewViewTab();
    await expectView(viewPage).toBeInactive();

    // Expect view bounding box not to have changed.
    await expect.poll(() => viewPage.getBoundingBox()).toEqual(viewSize);

    // Attach contextual view.
    await viewPage.view.tab.click();
    await expectView(viewPage).toBeActive();

    // Expect view not to be resized.
    await expect.poll(() => viewPage.getRecordedSizeChanges()).toEqual(sizeChanges);
  });

  test('should not invoke `CanClose` guard when switching between viewtabs', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

    const messageBox = appPO.messagebox({cssClass: 'e2e-close-view'});
    const messageBoxPage = new TextMessageBoxPagePO(messageBox);

    // open test view 1
    const viewPage1 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    await viewPage1.checkConfirmClosing(true); // prevent the view from closing

    // open test view 2
    const viewPage2 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    await viewPage2.checkConfirmClosing(true); // prevent the view from closing

    // switch to view 1, should not ask for confirmation
    await viewPage1.view.tab.click();
    await expectMessageBox(messageBoxPage).not.toBeAttached();

    // switch to view 2, should not ask for confirmation
    await viewPage2.view.tab.click();
    await expectMessageBox(messageBoxPage).not.toBeAttached();
  });

  test('should unregister `CanClose` guard when navigating to different microfrontend (same app)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

    // Open view via router.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'view', app: 'app1'}, {
      target: 'view.101',
    });

    // Expect view to be opened.
    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    await expectView(testeeViewPage).toBeActive();

    // Prevent view from closing.
    await testeeViewPage.checkConfirmClosing(true);

    // Test that closing the view must be confirmed.
    await testeeViewPage.view.tab.close();
    const canCloseMessageBox = appPO.messagebox({cssClass: ['e2e-close-view', await testeeViewPage.view.getViewId()]});
    await canCloseMessageBox.clickActionButton('no');
    await expectView(testeeViewPage).toBeActive();

    // Navigate view to different microfrontend (RouterPage)
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'router', app: 'app1'}, {
      target: 'view.101',
    });

    // Expect view to be navigated.
    const differentPage = new RouterPagePO(appPO, {viewId: 'view.101'});
    await expectView(differentPage).toBeActive();
    await expect(appPO.views()).toHaveCount(2);

    // Close view.
    await differentPage.view.tab.close();

    // Expect view to be closed without confirmation.
    await expectView(differentPage).not.toBeAttached();
    await expectView(routerPage).toBeActive();
    await expect(appPO.views()).toHaveCount(1);
  });

  test('should unregister `CanClose` guard when navigating to different microfrontend (different app)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});
    await microfrontendNavigator.registerIntention('app1', {type: 'view', qualifier: {component: 'router', app: 'app2'}});

    // Open view via router.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'view', app: 'app1'}, {
      target: 'view.101',
    });

    // Expect view to be opened.
    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    await expectView(testeeViewPage).toBeActive();

    // Prevent view from closing.
    await testeeViewPage.checkConfirmClosing(true);

    // Test that closing the view must be confirmed.
    await testeeViewPage.view.tab.close();
    const canCloseMessageBox = appPO.messagebox({cssClass: ['e2e-close-view', await testeeViewPage.view.getViewId()]});
    await canCloseMessageBox.clickActionButton('no');
    await expectView(testeeViewPage).toBeActive();

    // Navigate view to different microfrontend of another app (RouterPage)
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'router', app: 'app2'}, {
      target: 'view.101',
    });

    // Expect view to be navigated.
    const differentPage = new RouterPagePO(appPO, {viewId: 'view.101'});
    await expectView(differentPage).toBeActive();
    await expect(appPO.views()).toHaveCount(2);

    // Close view.
    await differentPage.view.tab.close();

    // Expect view to be closed without confirmation.
    await expectView(differentPage).not.toBeAttached();
    await expectView(routerPage).toBeActive();
    await expect(appPO.views()).toHaveCount(1);
  });

  /**
   * This test verifies the view handle to unregister the `CanClose` guard of a previous microfrontend of the same app correctly,
   * i.e., before the registration of the `CanClose` guard of the new microfrontend.
   */
  test('should allow for registration of a `CanClose` guard if navigated to different microfrontend (same app)', async ({appPO, workbenchNavigator, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

    // Register view 1.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'view-1'},
      properties: {
        path: 'test-pages/view-test-page/view1',
        title: 'View 1',
        showSplash: true,
      },
    });

    // Register view 2.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'view-2'},
      properties: {
        path: 'test-pages/view-test-page/view2',
        title: 'View 2',
        showSplash: true,
      },
    });

    // Create layout to open views to the right.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.right', {align: 'right'}),
    );

    // Open view-1.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'view-1'}, {
      partId: 'part.right',
      target: 'view.100',
    });

    // Enable Close guard.
    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
    await viewPage.checkConfirmClosing(true);

    // Capture component instance.
    const componentInstance1 = await viewPage.getComponentInstanceId();

    // Close view.
    await viewPage.view.tab.close();

    // Expect the closing to be blocked.
    const canCloseMessageBox = new TextMessageBoxPagePO(appPO.messagebox({cssClass: ['e2e-close-view', 'view.100']}));
    await expectMessageBox(canCloseMessageBox).toBeVisible();
    await expectView(viewPage).toBeActive();

    // Cancel closing.
    await canCloseMessageBox.messageBox.clickActionButton('no');

    // Navigate view to view-2.
    await routerPage.navigate({component: 'view-2'}, {
      partId: 'part.right',
      target: 'view.100',
    });

    // Wait until displaying view-2.
    await waitForCondition(async () => (await viewPage.getComponentInstanceId()) !== componentInstance1);

    // Enable Close guard.
    await viewPage.checkConfirmClosing(true);

    // Close view.
    await viewPage.view.tab.close();

    // Expect the closing to be blocked.
    await expectMessageBox(canCloseMessageBox).toBeVisible();

    // Confirm closing.
    await canCloseMessageBox.messageBox.clickActionButton('yes');
    await expectView(viewPage).not.toBeAttached();
  });

  test('should display text and title of message box opened in `CanClose` guard', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

    const testeeViewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    await testeeViewPage.checkConfirmClosing(true);
    await testeeViewPage.view.tab.close();

    const messageBox = appPO.messagebox({cssClass: 'e2e-close-view'});
    const messageBoxPage = new TextMessagePO(messageBox);

    await expectMessageBox(messageBoxPage).toBeVisible();
    await expect(messageBoxPage.messageBox.title).toHaveText('Confirm Close');
    await expect(messageBoxPage.text).toHaveText('Do you want to close this view?');
  });

  test('should emit when activating or deactivating a viewtab', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-view',
        title: 'Testee 1',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-view',
        title: 'Testee 2',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee-3'},
      properties: {
        path: 'test-view',
        title: 'Testee 3',
      },
    });

    // navigate to testee-1 view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee-1'}, {
      target: 'view.101',
    });

    const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    const testee1ComponentInstanceId = await testee1ViewPage.getComponentInstanceId();

    // assert emitted view active/deactivated events
    await expect.poll(() => consoleLogs.get({severity: 'debug', message: /ViewActivate|ViewDeactivate/})).toEqual([
      `[ViewActivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
    ]);
    consoleLogs.clear();

    // navigate to testee-2 view
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee-2'}, {
      target: 'view.102',
    });

    const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.102'});
    const testee2ComponentInstanceId = await testee2ViewPage.getComponentInstanceId();

    // assert emitted view active/deactivated events
    await expect.poll(() => consoleLogs.get({severity: 'debug', message: /ViewActivate|ViewDeactivate/})).toEqualIgnoreOrder([
      `[ViewDeactivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
    ]);
    consoleLogs.clear();

    // activate testee-1 view
    await testee1ViewPage.view.tab.click();

    // assert emitted view active/deactivated events
    await expect.poll(() => consoleLogs.get({severity: 'debug', message: /ViewActivate|ViewDeactivate/})).toEqualIgnoreOrder([
      `[ViewDeactivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
    ]);
    consoleLogs.clear();

    // activate testee-2 view
    await testee2ViewPage.view.tab.click();

    // assert emitted view active/deactivated events
    await expect.poll(() => consoleLogs.get({severity: 'debug', message: /ViewActivate|ViewDeactivate/})).toEqualIgnoreOrder([
      `[ViewDeactivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
    ]);
    consoleLogs.clear();

    // navigate to testee-3 view
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee-3'}, {
      target: 'view.103',
    });

    const testee3ViewPage = new ViewPagePO(appPO, {viewId: 'view.103'});
    const testee3ComponentInstanceId = await testee3ViewPage.getComponentInstanceId();

    // assert emitted view active/deactivated events
    await expect.poll(() => consoleLogs.get({severity: 'debug', message: /ViewActivate|ViewDeactivate/})).toEqualIgnoreOrder([
      `[ViewDeactivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
    ]);
    consoleLogs.clear();

    // activate testee-1 view
    await testee1ViewPage.view.tab.click();

    // assert emitted view active/deactivated events
    await expect.poll(() => consoleLogs.get({severity: 'debug', message: /ViewActivate|ViewDeactivate/})).toEqualIgnoreOrder([
      `[ViewDeactivate] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
    ]);
  });

  test('should provide the view\'s capability', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-view',
        title: 'Testee 1',
      },
    });

    // register testee-2 view in app1
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-view',
        title: 'Testee 2',
      },
    });

    await microfrontendNavigator.registerCapability('app2', {
      type: 'view',
      qualifier: {component: 'testee-3'},
      private: false,
      properties: {
        path: 'test-view',
        title: 'Testee 3',
      },
    });

    await microfrontendNavigator.registerIntention('app1', {type: 'view', qualifier: {component: 'testee-3'}});

    // navigate to testee-1 view (app1)
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee-1'}, {
      target: 'view.100',
    });

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    await expect.poll(() => testeeViewPage.getViewCapability()).toEqual(expect.objectContaining({
      qualifier: {component: 'testee-1'},
      type: 'view',
      properties: expect.objectContaining({
        path: 'test-view',
        title: 'Testee 1',
      }),
    }));

    // navigate to testee-2 view (app1)
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee-2'}, {
      target: 'view.100',
    });

    await testeeViewPage.view.tab.click();
    await expect.poll(() => testeeViewPage.getViewCapability()).toEqual(expect.objectContaining({
      qualifier: {component: 'testee-2'},
      type: 'view',
      properties: expect.objectContaining({
        path: 'test-view',
        title: 'Testee 2',
      }),
    }));

    // navigate to testee-3 view (app2)
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee-3'}, {
      target: 'view.100',
    });

    await testeeViewPage.view.tab.click();
    await expect.poll(() => testeeViewPage.getViewCapability()).toEqual(expect.objectContaining({
      qualifier: {component: 'testee-3'},
      type: 'view',
      properties: expect.objectContaining({
        path: 'test-view',
        title: 'Testee 3',
      }),
    }));
  });

  /**
   * When having loaded a microfrontend of an app, and when then navigating to another microfrontend of the same app,
   * the new microfrontend should get its own capability and not the capability of the previous loaded microfrontend.
   */
  test('should emit the navigation\'s effective capability when navigating to another microfrontend of the same app', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    test.slow(); // increase timeout because this test simulates slow capability lookup
    await appPO.navigateTo({microfrontendSupport: true, simulateSlowCapabilityLookup: true});

    const capability1Id = (await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-pages/view-test-page/view1',
        title: 'Testee 1',
        heading: 'app 1',
      },
    })).metadata!.id;

    // register testee-2 view in app1
    const capability2Id = (await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-pages/view-test-page/view2',
        title: 'Testee 2',
        heading: 'app 1',
      },
    })).metadata!.id;

    // register testee-3 view in app2
    const capability3Id = (await microfrontendNavigator.registerCapability('app2', {
      type: 'view',
      qualifier: {component: 'testee-3'},
      private: false,
      properties: {
        path: 'test-view',
        title: 'Testee 3',
        heading: 'app 2',
      },
    })).metadata!.id;

    await microfrontendNavigator.registerIntention('app1', {type: 'view', qualifier: {component: 'testee-3'}});

    // navigate to testee-1 view (app1)
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee-1'}, {
      target: 'view.100',
    });

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    // Assert the correct capability to be loaded
    await expect.poll(() => testeeViewPage.getViewCapability()).toEqual(expect.objectContaining({metadata: {id: capability1Id, appSymbolicName: 'workbench-client-testing-app1'}}));
    await expect.poll(() => consoleLogs.get({severity: 'debug', message: /ViewCapability\$::first/})).toEqual([
      `[ViewCapability$::first] [component=ViewPageComponent@${await testeeViewPage.getComponentInstanceId()}, capabilityId=${capability1Id}]`,
    ]);
    consoleLogs.clear();

    // navigate to testee-2 view (app1)
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee-2'}, {
      target: 'view.100',
    });

    // Assert the correct capability to be loaded
    await testeeViewPage.view.tab.click();
    await expect.poll(() => testeeViewPage.getViewCapability()).toEqual(expect.objectContaining({metadata: {id: capability2Id, appSymbolicName: 'workbench-client-testing-app1'}}));
    await expect.poll(() => consoleLogs.get({severity: 'debug', message: /ViewCapability\$::first/})).toEqual([
      `[ViewCapability$::first] [component=ViewPageComponent@${await testeeViewPage.getComponentInstanceId()}, capabilityId=${capability2Id}]`,
    ]);
    consoleLogs.clear();

    // navigate to testee-1 view (app1)
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee-1'}, {
      target: 'view.100',
    });

    // Assert the correct capability to be loaded
    await testeeViewPage.view.tab.click();
    await expect.poll(() => testeeViewPage.getViewCapability()).toEqual(expect.objectContaining({metadata: {id: capability1Id, appSymbolicName: 'workbench-client-testing-app1'}}));
    await expect.poll(() => consoleLogs.get({severity: 'debug', message: /ViewCapability\$::first/})).toEqual([
      `[ViewCapability$::first] [component=ViewPageComponent@${await testeeViewPage.getComponentInstanceId()}, capabilityId=${capability1Id}]`,
    ]);
    consoleLogs.clear();

    // navigate to testee-3 view (app2)
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee-3'}, {
      target: 'view.100',
    });

    // Assert the correct capability to be loaded
    await testeeViewPage.view.tab.click();
    await expect.poll(() => testeeViewPage.getViewCapability()).toEqual(expect.objectContaining({metadata: {id: capability3Id, appSymbolicName: 'workbench-client-testing-app2'}}));
    await expect.poll(() => consoleLogs.get({severity: 'debug', message: /ViewCapability\$::first/})).toEqual([
      `[ViewCapability$::first] [component=ViewPageComponent@${await testeeViewPage.getComponentInstanceId()}, capabilityId=${capability3Id}]`,
    ]);
  });

  test('should provide the view\'s identity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-view',
        title: 'Testee 1',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-view',
        title: 'Testee 2',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee-3'},
      properties: {
        path: 'test-view',
        title: 'Testee 3',
      },
    });

    // navigate to testee-1 view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee-1'}, {
      target: 'view.101',
    });

    const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    await expect(testee1ViewPage.viewId).toHaveText('view.101');

    // navigate to testee-2 view
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee-2'}, {
      target: 'view.101',
    });

    await expect(testee1ViewPage.viewId).toHaveText('view.101');

    // navigate to testee-3 view
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee-3'}, {
      target: 'view.102',
    });

    const testee3ViewPage = new ViewPagePO(appPO, {viewId: 'view.102'});
    await expect(testee3ViewPage.viewId).toHaveText('view.102');
  });

  test('should provide the part', async ({appPO, workbenchNavigator, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'Testee',
      },
    });

    // Add parts on the left and right.
    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('part.right', {align: 'right'})
      .addPart('part.left', {align: 'left'}),
    );

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    // Open view in the right part.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      partId: 'part.right',
      cssClass: 'testee',
    });
    await expect(testeeViewPage.partId).toHaveText('part.right');

    // Move View to the left part.
    await testeeViewPage.view.tab.moveTo('part.left');
    await expect(testeeViewPage.partId).toHaveText('part.left');
  });

  test.describe('keystroke bubbling of view context menu items', () => {

    test('should propagate `ctrl+k` for closing the current view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});
      const viewPage1 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      const viewPage2 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      const viewPage3 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

      // Press 'ctrl+k' in view 2
      await viewPage2.view.tab.click();
      await viewPage2.sendKeys('Control+K');

      await expect(appPO.views()).toHaveCount(2);
      await expectView(viewPage1).toBeInactive();
      await expectView(viewPage2).not.toBeAttached();
      await expectView(viewPage3).toBeActive();
    });

    test('should propagate `ctrl+shift+k` for closing other views', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});
      const viewPage1 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      const viewPage2 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      const viewPage3 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

      // Press 'ctrl+shift+k' in view 2
      await viewPage2.view.tab.click();
      await viewPage2.sendKeys('Control+Shift+K');

      await expect(appPO.views()).toHaveCount(1);
      await expectView(viewPage1).not.toBeAttached();
      await expectView(viewPage2).toBeActive();
      await expectView(viewPage3).not.toBeAttached();
    });

    test('should propagate `ctrl+shift+alt+k` for closing all views', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});
      const viewPage1 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      const viewPage2 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      const viewPage3 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

      // Press 'ctrl+shift+alt+k' in view 2
      await viewPage2.view.tab.click();
      await viewPage2.sendKeys('Control+Shift+Alt+K');

      await expect(appPO.views()).toHaveCount(0);
      await expectView(viewPage1).not.toBeAttached();
      await expectView(viewPage2).not.toBeAttached();
      await expectView(viewPage3).not.toBeAttached();
    });
  });

  test('should detach view if not active', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Open two views.
    const viewPage1 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewPage2 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

    // Expect view 2 to be visible.
    await expectView(viewPage1).toBeInactive();
    await expectView(viewPage2).toBeActive();

    // Activate view 1.
    await viewPage1.view.tab.click();

    // Expect view 1 to be visible.
    await expectView(viewPage1).toBeActive();
    await expectView(viewPage2).toBeInactive();
  });

  test('should detach view if opened in peripheral area and the main area is maximized', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-1', ɵactivityId: 'activity.1'})
      .activatePart('part.activity-1'),
    );

    // Open view in main area.
    const viewInMainArea = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

    // Open view in peripheral area.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'view', app: 'app1'}, {partId: 'part.activity-1', target: 'view.100'});
    await routerPage.view.tab.close();

    // Capture instance id of test view.
    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
    const viewComponentId = await viewPage.getComponentInstanceId();

    await expectView(viewInMainArea).toBeActive();
    await expectView(viewPage).toBeActive();

    // Maximize the main area.
    await viewInMainArea.view.tab.dblclick();
    await expectView(viewInMainArea).toBeActive();
    await expect(viewPage.view.locator).not.toBeAttached();
    await expect(viewPage.view.tab.locator).not.toBeAttached();
    await expect(viewPage.outlet.locator).toBeAttached();
    await expect(viewPage.outlet.locator).not.toBeVisible();

    // Restore the layout.
    await viewInMainArea.view.tab.dblclick();
    await expectView(viewInMainArea).toBeActive();
    await expectView(viewPage).toBeActive();

    // Expect view 2 not to be instantiated anew
    expect(viewComponentId).toEqual(await viewPage.getComponentInstanceId());
  });

  test('should change detect active views after construction', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const capability = await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'Testee',
        cssClass: 'testee',
      },
    });

    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.100',
      activate: true,
    });

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
    await expect.poll(() => viewPage.outlet.getName()).toEqual('view.100');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee');
    await expect.poll(() => viewPage.outlet.getCssClasses()).toContain('testee');
    await expect.poll(() => viewPage.outlet.getCapabilityId()).toEqual(capability.metadata!.id);
    await expect.poll(() => viewPage.outlet.getAppSymbolicName()).toEqual(capability.metadata!.appSymbolicName);
    await expect(viewPage.view.tab.title).toHaveText('Testee');
  });

  test('should change detect inactive views after construction', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const capability = await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'Testee',
        cssClass: 'testee',
      },
    });

    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.100',
      activate: false,
    });

    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
    await expect.poll(() => viewPage.outlet.getName()).toEqual('view.100');
    await expect.poll(() => viewPage.view.tab.getCssClasses()).toContain('testee');
    await expect.poll(() => viewPage.outlet.getCssClasses()).toContain('testee');
    await expect.poll(() => viewPage.outlet.getCapabilityId()).toEqual(capability.metadata!.id);
    await expect.poll(() => viewPage.outlet.getAppSymbolicName()).toEqual(capability.metadata!.appSymbolicName);
    await expect(viewPage.view.tab.title).toHaveText('Testee');
  });

  /**
   * In this test, we have an inactive view which is navigated to a non-microfrontend component.
   * This test verifies that when this view is navigated to a microfrontend, the microfrontend is loaded, e.g., to set the title of the view.
   */
  test('should change detect view when navigating from inactive "standalone workbench" view to inactive microfrontend view', async ({appPO, workbenchNavigator, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view 1.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'view'},
      properties: {
        path: 'test-view',
        title: 'Microfrontend View',
      },
    });

    const standaloneRouter = await workbenchNavigator.openInNewTab(StandaloneRouterPagePO);
    const microfrontendRouter = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    const view = appPO.view({viewId: 'view.100'});

    // Navigate to standalone page.
    await standaloneRouter.view.tab.click();
    await standaloneRouter.navigate(['test-pages/navigation-test-page', {title: 'Standalone View'}], {target: 'view.100', activate: false});
    await expect.poll(() => view.getInfo()).toMatchObject(
      {
        viewId: 'view.100',
        title: 'Standalone View',
      } satisfies Partial<ViewInfo>,
    );

    // Navigate to microfrontend.
    await microfrontendRouter.view.tab.click();
    await microfrontendRouter.navigate({view: 'view'}, {target: 'view.100', activate: false});
    await expect.poll(() => view.getInfo()).toMatchObject(
      {
        viewId: 'view.100',
        title: 'Microfrontend View',
      } satisfies Partial<ViewInfo>,
    );

    // Navigate to standalone page.
    await standaloneRouter.view.tab.click();
    await standaloneRouter.navigate(['test-pages/navigation-test-page', {title: 'Standalone View'}], {target: 'view.100', activate: false});
    await expect.poll(() => view.getInfo()).toMatchObject(
      {
        viewId: 'view.100',
        title: 'Standalone View',
      } satisfies Partial<ViewInfo>,
    );
  });

  /**
   * In this test, we have an active view which is navigated to a non-microfrontend component.
   * This test verifies that when this view is navigated to a microfrontend, the microfrontend is loaded, e.g., to set the title of the view.
   */
  test('should change detect view when navigating from active "standalone workbench" view to active microfrontend view', async ({appPO, workbenchNavigator, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('part.right', {align: 'right'})
      .addView('view.100', {partId: 'part.right', activateView: true}),
    );

    // Register view 1.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'view'},
      properties: {
        path: 'test-view',
        title: 'Microfrontend View',
      },
    });

    const standaloneRouter = await workbenchNavigator.openInNewTab(StandaloneRouterPagePO);
    const microfrontendRouter = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    const view = appPO.view({viewId: 'view.100'});

    // Navigate to standalone page.
    await standaloneRouter.view.tab.click();
    await standaloneRouter.navigate(['test-pages/navigation-test-page', {title: 'Standalone View'}], {target: 'view.100'});
    await expect.poll(() => view.getInfo()).toMatchObject(
      {
        viewId: 'view.100',
        title: 'Standalone View',
      } satisfies Partial<ViewInfo>,
    );

    // Navigate to microfrontend.
    await microfrontendRouter.view.tab.click();
    await microfrontendRouter.navigate({view: 'view'}, {target: 'view.100'});
    await expect.poll(() => view.getInfo()).toMatchObject(
      {
        viewId: 'view.100',
        title: 'Microfrontend View',
      } satisfies Partial<ViewInfo>,
    );

    // Navigate to standalone page.
    await standaloneRouter.view.tab.click();
    await standaloneRouter.navigate(['test-pages/navigation-test-page', {title: 'Standalone View'}], {target: 'view.100'});
    await expect.poll(() => view.getInfo()).toMatchObject(
      {
        viewId: 'view.100',
        title: 'Standalone View',
      } satisfies Partial<ViewInfo>,
    );
  });

  /**
   * Regression test that a microfrontend was not correctly aligned when moved to another part of the same size.
   */
  test('should align microfrontend to view bounds when moving it to another part of the same size', async ({appPO, workbenchNavigator, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register view.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'testee'},
      properties: {
        path: 'test-view',
        title: 'Microfrontend View',
      },
    });

    // Create left and right part, both of equal size.
    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('part.left', {align: 'left', ratio: .25})
      .addPart('part.right', {align: 'right', ratio: .25}),
    );

    // Open view.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({view: 'testee'}, {
      target: 'view.100',
      activate: true,
    });
    await routerPage.view.tab.close();

    // Move view to the left part.
    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
    await appPO.view({viewId: 'view.100'}).tab.moveTo('part.left');
    // Expect the microfrontend to be aligned to the view bounds.
    await expect.poll(() => viewPage.view.getInfo()).toMatchObject({viewId: 'view.100', partId: 'part.left'} satisfies Partial<ViewInfo>);
    await expect(async () => {
      const outletBounds = await viewPage.outlet.getBoundingBox();
      const viewBounds = await viewPage.view.getBoundingBox();
      expect(outletBounds).toEqual(viewBounds);
    }).toPass();

    // Move view to the right part.
    await appPO.view({viewId: 'view.100'}).tab.moveTo('part.right');
    // Expect the microfrontend to be aligned to the view bounds.
    await expect.poll(() => viewPage.view.getInfo()).toMatchObject({viewId: 'view.100', partId: 'part.right'} satisfies Partial<ViewInfo>);
    await expect(async () => {
      const outletBounds = await viewPage.outlet.getBoundingBox();
      const viewBounds = await viewPage.view.getBoundingBox();
      expect(outletBounds).toEqual(viewBounds);
    }).toPass();
  });

  test('should preserve component state when changing layout', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register input field test page.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'input-test-page'},
      properties: {
        path: 'test-pages/input-field-test-page',
        title: 'Input Test Page',
      },
    });

    // Register view 1.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'view-1'},
      properties: {
        path: 'test-view',
        title: 'Microfrontend View 1',
      },
    });

    // Register view 2.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {view: 'view-2'},
      properties: {
        path: 'test-view',
        title: 'Microfrontend View 2',
      },
    });

    // Register main area part.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'main-area'},
    });

    // Register left part.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'left'},
      properties: {
        views: [
          {qualifier: {view: 'input-test-page'}, cssClass: 'testee'},
        ],
      },
    });

    // Register bottom part.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'bottom'},
      properties: {
        views: [
          {qualifier: {view: 'view-1'}, cssClass: 'testee-1'},
        ],
      },
    });

    // Register right part.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'part',
      qualifier: {part: 'right'},
      properties: {
        views: [
          {qualifier: {view: 'view-2'}, cssClass: 'testee-2'},
        ],
      },
    });

    // Register perspective.
    const perspective = await microfrontendNavigator.registerCapability('app1', {
      type: 'perspective',
      qualifier: {perspective: 'app-1'},
      properties: {
        parts: [
          {
            id: MAIN_AREA,
            qualifier: {part: 'main-area'},
          },
          {
            id: 'part.left',
            qualifier: {part: 'left'},
            position: {
              align: 'left',
            },
          },
          {
            id: 'part.bottom',
            qualifier: {part: 'bottom'},
            position: {
              align: 'bottom',
            },
          },
          {
            id: 'part.right',
            qualifier: {part: 'right'},
            position: {
              align: 'right',
            },
          },
        ],
      },
    });

    // Switch perspective.
    await appPO.switchPerspective(perspective.metadata!.id);

    // Enter component state in view.
    const testeeViewPage = new InputFieldTestPagePO(appPO, {cssClass: 'testee'});
    await testeeViewPage.enterText('A');
    await expect(testeeViewPage.input).toHaveValue('A');

    await test.step('move view to bottom part', async () => {
      // Move view to bottom part.
      await testeeViewPage.view.tab.moveTo('part.bottom');

      // Expect component state to be preserved.
      await expect(testeeViewPage.input).toHaveValue('A');
    });

    await test.step('activate another view in same part', async () => {
      // Activate another view in same part.
      const viewPage1 = new ViewPagePO(appPO, {cssClass: 'testee-1'});
      await viewPage1.view.tab.click();

      // Activate testee view.
      await testeeViewPage.view.tab.click();

      // Expect component state to be preserved.
      await expect(testeeViewPage.input).toHaveValue('A');
    });

    await test.step('split view to the east', async () => {
      // Split view to the east.
      await testeeViewPage.view.tab.moveTo('part.bottom', {region: 'east'});

      // Expect component state to be preserved.
      await expect(testeeViewPage.input).toHaveValue('A');
    });

    await test.step('close another view', async () => {
      // Activate another view in same part.
      const viewPage2 = new ViewPagePO(appPO, {cssClass: 'testee-2'});
      await viewPage2.view.tab.close();

      // Expect component state to be preserved.
      await expect(testeeViewPage.input).toHaveValue('A');
    });
  });

  test.describe('Workbench View Loading', () => {

    test('should load view lazy by default', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test view.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/microfrontend-test-page-1',
          title: 'Test View',
          lazy: undefined, // default
        },
      });

      // Open test view without activating it.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {target: 'view.1', activate: false});
      const testPage = new MicrofrontendTestPage1PO(appPO, {viewId: 'view.1'});

      // Expect microfrontend not to be loaded.
      await expectView(testPage).toBeInactive({loaded: false});
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqual([]);

      // Activate view.
      await testPage.view.tab.click();
      await expectView(testPage).toBeActive();
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqual([
        '[MicrofrontendTestPage1Component#construct]',
      ]);
    });

    test('should not load view lazy by default if compat mode is enabled', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true, preloadInactiveMicrofrontendViews: true});

      // Register test view without defining the `lazy` property.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/microfrontend-test-page-1',
          title: 'Test View',
          lazy: undefined, // default
        },
      });

      // Open test view without activating it.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {target: 'view.1', activate: false});
      const testPage = new MicrofrontendTestPage1PO(appPO, {viewId: 'view.1'});

      // Expect microfrontend to be loaded.
      await expectView(testPage).toBeInactive({loaded: true});
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqual([
        '[MicrofrontendTestPage1Component#construct]',
      ]);
    });

    test('should load lazy view when opened in new active view', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test view.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/microfrontend-test-page-1',
          title: 'Test View',
          lazy: true,
        },
      });

      // Open test view.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {target: 'view.1'});
      const testPage = new MicrofrontendTestPage1PO(appPO, {viewId: 'view.1'});

      // Expect microfrontend to be loaded.
      await expectView(testPage).toBeActive();
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqual([
        '[MicrofrontendTestPage1Component#construct]',
      ]);
    });

    test('should load lazy view when activating it', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test view 1.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'testee-1'},
        properties: {
          path: 'test-pages/microfrontend-test-page-1',
          title: 'Test View 1',
          lazy: true,
        },
      });

      // Register test view 2.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'testee-2'},
        properties: {
          path: 'test-pages/microfrontend-test-page-2',
          title: 'Test View 2',
          lazy: true,
        },
      });

      // Register test view 3.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'testee-3'},
        properties: {
          path: 'test-pages/microfrontend-test-page-3',
          title: 'Test View 3',
          lazy: true,
        },
      });

      // Register part.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'main'},
        properties: {
          views: [
            {qualifier: {component: 'testee-1'}, cssClass: 'testee-1'},
            {qualifier: {component: 'testee-2'}, cssClass: 'testee-2'},
            {qualifier: {component: 'testee-3'}, cssClass: 'testee-3'},
          ],
        },
      });

      // Create perspective with test view.
      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: 'part.main',
              qualifier: {part: 'main'},
            },
          ],
        },
      });

      const testPage1 = new MicrofrontendTestPage1PO(appPO, {cssClass: 'testee-1'});
      const testPage2 = new MicrofrontendTestPage2PO(appPO, {cssClass: 'testee-2'});
      const testPage3 = new MicrofrontendTestPage3PO(appPO, {cssClass: 'testee-3'});

      // Expect microfrontend of view 1 to be loaded.
      await expectView(testPage1).toBeActive();
      await expectView(testPage2).toBeInactive({loaded: false});
      await expectView(testPage3).toBeInactive({loaded: false});
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqual([
        '[MicrofrontendTestPage1Component#construct]',
      ]);
      consoleLogs.clear();

      // Activate view 2.
      await testPage2.view.tab.click();

      // Expect microfrontend of view 2 to be loaded.
      await expectView(testPage1).toBeInactive({loaded: true});
      await expectView(testPage2).toBeActive();
      await expectView(testPage3).toBeInactive({loaded: false});
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqual([
        '[MicrofrontendTestPage2Component#construct]',
      ]);
      consoleLogs.clear();

      // Activate view 3.
      await testPage3.view.tab.click();

      // Expect microfrontend of view 3 to be loaded.
      await expectView(testPage1).toBeInactive({loaded: true});
      await expectView(testPage2).toBeInactive({loaded: true});
      await expectView(testPage3).toBeActive();
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqual([
        '[MicrofrontendTestPage3Component#construct]',
      ]);
      consoleLogs.clear();

      // Activate view 2.
      await testPage2.view.tab.click();
      await expectView(testPage1).toBeInactive({loaded: true});
      await expectView(testPage2).toBeActive();
      await expectView(testPage3).toBeInactive({loaded: true});
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqual([]);

      // Activate view 1.
      await testPage1.view.tab.click();
      await expectView(testPage1).toBeActive();
      await expectView(testPage2).toBeInactive({loaded: true});
      await expectView(testPage3).toBeInactive({loaded: true});
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqual([]);
    });

    test('should load lazy view on first activation only', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true, logLevel: 'debug'});

      // Register test view.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/microfrontend-test-page-1',
          title: 'Test View',
          lazy: true,
        },
      });

      // Open test view.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {target: 'view.1'});
      const testPage = new MicrofrontendTestPage1PO(appPO, {viewId: 'view.1'});
      await expectView(testPage).toBeActive();
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqual([
        '[MicrofrontendTestPage1Component#construct]',
      ]);
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /Loading microfrontend into "view\.1"/})).toEqual([
        expect.stringMatching(/path=test-pages\/microfrontend-test-page-1/),
      ]);
      consoleLogs.clear();

      // Activate router view.
      await routerPage.view.tab.click();
      await expectView(testPage).toBeInactive({loaded: true});

      // Activate test view again.
      await testPage.view.tab.click();

      // Expect no new navigation.
      await expectView(testPage).toBeActive();
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqual([]);
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /Loading microfrontend into "view\.1"/})).toEqual([]);
    });

    test('should not load lazy view when opened in new inactive view', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test view.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/microfrontend-test-page-1',
          title: 'Test View',
          lazy: true,
        },
      });

      // Open test view without activating it.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {target: 'view.1', activate: false});
      const testPage = new MicrofrontendTestPage1PO(appPO, {viewId: 'view.1'});

      // Expect microfrontend not to be loaded.
      await expectView(testPage).toBeInactive({loaded: false});
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqual([]);

      // Activate view tab.
      await appPO.view({viewId: 'view.1'}).tab.click();
      await expectView(testPage).toBeActive();
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqual([
        '[MicrofrontendTestPage1Component#construct]',
      ]);
    });

    test('should not load lazy view when loaded into inactive lazy view that has already been loaded yet', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true, logLevel: 'debug'});

      // Register test view 1.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'testee-1'},
        properties: {
          path: 'test-pages/microfrontend-test-page-1',
          title: 'Test View 1',
          lazy: true,
        },
      });

      // Register test view 2.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'testee-2'},
        properties: {
          path: 'test-pages/microfrontend-test-page-2',
          title: 'Test View 2',
          lazy: true,
        },
      });

      // Open test view 1.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee-1'}, {target: 'view.1'});
      const testPage1 = new MicrofrontendTestPage1PO(appPO, {viewId: 'view.1'});
      await expectView(testPage1).toBeActive();
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqual([
        '[MicrofrontendTestPage1Component#construct]',
      ]);
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /Loading microfrontend into "view\.1"/})).toEqual([
        expect.stringMatching(/path=test-pages\/microfrontend-test-page-1/),
      ]);
      consoleLogs.clear();

      // Activate router view.
      await routerPage.view.tab.click();
      await expectView(testPage1).toBeInactive({loaded: true});

      // Navigate inactive "view.1" to other lazy view.
      await routerPage.navigate({component: 'testee-2'}, {target: 'view.1', activate: false});
      const testPage2 = new MicrofrontendTestPage2PO(appPO, {viewId: 'view.1'});

      // Expect no navigation.
      await expectView(testPage2).toBeInactive({loaded: false});
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqual([]);
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /Loading microfrontend into "view\.1"/})).toEqual([]);

      // Activate test view 2.
      await testPage2.view.tab.click();

      // Expect navigation.
      await expectView(testPage2).toBeActive();
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqual([
        '[MicrofrontendTestPage2Component#construct]',
      ]);
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /Loading microfrontend into "view\.1"/})).toEqual([
        expect.stringMatching(/path=test-pages\/microfrontend-test-page-2/),
      ]);
    });

    test('should not load lazy view when loaded into inactive lazy view that has not been loaded yet', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test view 1.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'testee-1'},
        properties: {
          path: 'test-pages/microfrontend-test-page-1',
          title: 'Test View 1',
          lazy: true,
        },
      });

      // Register test view 2.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'testee-2'},
        properties: {
          path: 'test-pages/microfrontend-test-page-2',
          title: 'Test View 2',
          lazy: true,
        },
      });

      // Open inactive view.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee-1'}, {target: 'view.1', activate: false});
      const testPage1 = new MicrofrontendTestPage1PO(appPO, {viewId: 'view.1'});
      await expectView(testPage1).toBeInactive({loaded: false});
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqual([]);

      // Navigate inactive view.
      await routerPage.navigate({component: 'testee-2'}, {target: 'view.1', activate: false});
      const testPage2 = new MicrofrontendTestPage2PO(appPO, {viewId: 'view.1'});
      await expectView(testPage2).toBeInactive({loaded: false});
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqual([]);

      // Activate view tab.
      await appPO.view({viewId: 'view.1'}).tab.click();
      await expectView(testPage2).toBeActive();
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqual([
        '[MicrofrontendTestPage2Component#construct]',
      ]);
    });

    test('should cancel stale navigation when navigating inactive view', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true, logLevel: 'debug'});

      // Register test view 1.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'testee-1'},
        properties: {
          path: 'test-pages/microfrontend-test-page-1',
          title: 'Test View 1',
          lazy: true,
        },
      });

      // Register test view 2.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'testee-2'},
        properties: {
          path: 'test-pages/microfrontend-test-page-2',
          title: 'Test View 2',
          lazy: true,
        },
      });

      // Register test view 3.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'testee-3'},
        properties: {
          path: 'test-pages/microfrontend-test-page-3',
          title: 'Test View 3',
          lazy: true,
        },
      });

      // Open inactive view with test page 1.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee-1'}, {target: 'view.1', activate: false});
      const testPage1 = new MicrofrontendTestPage1PO(appPO, {viewId: 'view.1'});
      await expectView(testPage1).toBeInactive({loaded: false});
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqual([]);
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /Loading microfrontend into "view\.1"/})).toEqual([]);

      // Navigate inactive view to test page 2.
      await routerPage.navigate({component: 'testee-2'}, {target: 'view.1', activate: false});
      const testPage2 = new MicrofrontendTestPage1PO(appPO, {viewId: 'view.1'});
      await expectView(testPage2).toBeInactive({loaded: false});
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqual([]);
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /Loading microfrontend into "view\.1"/})).toEqual([]);

      // Navigate inactive view to test page 3.
      await routerPage.navigate({component: 'testee-3'}, {target: 'view.1', activate: true});
      const testPage3 = new MicrofrontendTestPage3PO(appPO, {viewId: 'view.1'});
      await expectView(testPage3).toBeActive();
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqual([
        '[MicrofrontendTestPage3Component#construct]',
      ]);
      // Expect most recent navigation only.
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /Loading microfrontend into "view\.1"/})).toEqual([
        expect.stringMatching(/path=test-pages\/microfrontend-test-page-3/),
      ]);
    });

    test('should display title of lazy view if not loaded yet', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true, logLevel: 'debug'});

      // Register test view.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        properties: {
          path: 'test-pages/microfrontend-test-page-1',
          title: 'Test View',
          lazy: true,
        },
      });

      // Open test view without activating it.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {target: 'view.1', activate: false});
      const testPage = new MicrofrontendTestPage1PO(appPO, {viewId: 'view.1'});

      // Expect title to display and microfrontend not to be loaded.
      await expectView(testPage).toBeInactive({loaded: false});
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqual([]);
      await expect(testPage.view.tab.title).toHaveText('Test View');
    });

    test('should display translatable title of lazy view if not loaded yet', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true, logLevel: 'debug'});

      // Register text view.
      await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('app1', {
        type: 'view',
        qualifier: {component: 'text'},
        properties: {
          path: 'test-pages/text-test-page',
          title: 'Text Page',
        },
      });

      // Register test view.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        params: [{name: 'id', required: true}],
        properties: {
          path: 'test-pages/microfrontend-test-page-1',
          title: '%view.title;id=:id;name=:name',
          resolve: {
            name: 'textprovider/workbench-client-testing-app1/values/123',
          },
          lazy: true,
        },
      });

      // Prepare title and resolved value.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'text'}, {target: 'view.1'});

      const textPage = TextTestPagePO.newViewPO(appPO, {viewId: 'view.1'});
      await textPage.provideText('view.title', 'Test View {{id}} - {{name}}');
      await textPage.provideValue('123', 'RESOLVED');

      // Open test view without activating it.
      await routerPage.view.tab.click();
      await routerPage.navigate({component: 'testee'}, {params: {id: '123'}, target: 'view.1', activate: false});
      const testPage = new MicrofrontendTestPage1PO(appPO, {viewId: 'view.1'});

      // Expect title to display and microfrontend not to be loaded.
      await expectView(testPage).toBeInactive({loaded: false});
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqual([]);
      await expect(testPage.view.tab.title).toHaveText('Test View 123 - RESOLVED');
    });

    test('should load inactive non-lazy views', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test view 1.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'testee-1'},
        properties: {
          path: 'test-pages/microfrontend-test-page-1',
          title: 'Test View 1',
          lazy: false,
        },
      });

      // Register test view 2.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'testee-2'},
        properties: {
          path: 'test-pages/microfrontend-test-page-2',
          title: 'Test View 2',
          lazy: false,
        },
      });

      // Register test view 3.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'testee-3'},
        properties: {
          path: 'test-pages/microfrontend-test-page-3',
          title: 'Test View 3',
          lazy: false,
        },
      });

      // Register part.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'part',
        qualifier: {part: 'main'},
        properties: {
          views: [
            {qualifier: {component: 'testee-1'}, cssClass: 'testee-1'},
            {qualifier: {component: 'testee-2'}, cssClass: 'testee-2'},
            {qualifier: {component: 'testee-3'}, cssClass: 'testee-3'},
          ],
        },
      });

      // Create perspective with test view.
      await microfrontendNavigator.createPerspective('app1', {
        type: 'perspective',
        qualifier: {perspective: 'testee'},
        properties: {
          parts: [
            {
              id: 'part.main',
              qualifier: {part: 'main'},
            },
          ],
        },
      });

      const testPage1 = new MicrofrontendTestPage1PO(appPO, {cssClass: 'testee-1'});
      const testPage2 = new MicrofrontendTestPage2PO(appPO, {cssClass: 'testee-2'});
      const testPage3 = new MicrofrontendTestPage3PO(appPO, {cssClass: 'testee-3'});

      // Expect microfrontends to be loaded.
      await expectView(testPage1).toBeActive();
      await expectView(testPage2).toBeInactive({loaded: true});
      await expectView(testPage3).toBeInactive({loaded: true});
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqualIgnoreOrder([
        '[MicrofrontendTestPage1Component#construct]',
        '[MicrofrontendTestPage2Component#construct]',
        '[MicrofrontendTestPage3Component#construct]',
      ]);
      consoleLogs.clear();

      // Activate test view 2.
      await testPage2.view.tab.click();
      await expectView(testPage1).toBeInactive({loaded: true});
      await expectView(testPage2).toBeActive();
      await expectView(testPage3).toBeInactive({loaded: true});
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqual([]);

      // Activate test view 3.
      await testPage3.view.tab.click();
      await expectView(testPage1).toBeInactive({loaded: true});
      await expectView(testPage2).toBeInactive({loaded: true});
      await expectView(testPage3).toBeActive();
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqual([]);
    });

    test('should load non-lazy view when loaded into inactive view that has not been loaded yet', async ({appPO, microfrontendNavigator, consoleLogs}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // Register test view 1 (lazy).
      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'testee-1'},
        properties: {
          path: 'test-pages/microfrontend-test-page-1',
          title: 'Test View 1',
          lazy: true,
        },
      });

      // Register test view 2.
      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'testee-2'},
        properties: {
          path: 'test-pages/microfrontend-test-page-2',
          title: 'Test View 2',
          lazy: false,
        },
      });

      // Open test view without activating it.
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee-1'}, {target: 'view.1', activate: false});
      const testPage1 = new MicrofrontendTestPage1PO(appPO, {viewId: 'view.1'});
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqual([]);
      await expectView(testPage1).toBeInactive({loaded: false});

      // Navigate test view to non-lazy view.
      await routerPage.navigate({component: 'testee-2'}, {target: 'view.1', activate: false});
      const testPage2 = new MicrofrontendTestPage2PO(appPO, {viewId: 'view.1'});
      await expect.poll(() => consoleLogs.get({severity: 'debug', message: /MicrofrontendTestPage/})).toEqual([
        '[MicrofrontendTestPage2Component#construct]',
      ]);
      await expectView(testPage2).toBeInactive({loaded: true});
    });
  });
});
