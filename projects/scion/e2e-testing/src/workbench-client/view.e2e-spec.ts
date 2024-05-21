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
import {expectView} from '../matcher/view-matcher';
import {TextMessageBoxPagePO} from '../text-message-box-page.po';
import {expectMessageBox} from '../matcher/message-box-matcher';

test.describe('Workbench View', () => {

  test('should complete view Observables on navigation', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    // Observable completion expectations:
    // - should complete params$, capability$, active$ observables only when navigating to a view capability of a different app
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

      `[ParamsObservableComplete] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
      `[CapabilityObservableComplete] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
      `[ActiveObservableComplete] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,

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
    await expect.poll(() => viewPage.view.tab.isDirty()).toBe(true);

    await viewPage.markDirty(false);
    await expect.poll(() => viewPage.view.tab.isDirty()).toBe(false);

    await viewPage.markDirty(); // noarg
    await expect.poll(() => viewPage.view.tab.isDirty()).toBe(true);
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

  test('should prevent closing a view', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

    const testeeViewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

    // prevent the view from closing
    await testeeViewPage.checkConfirmClosing(true);

    // try closing the view via view tab.
    await testeeViewPage.view.tab.close();
    const messageBox = appPO.messagebox({cssClass: ['e2e-close-view', await testeeViewPage.view.getViewId()]});
    await messageBox.clickActionButton('no');

    // expect the view not to be closed
    await expectView(testeeViewPage).toBeActive();

    // try closing the view via handle.
    await testeeViewPage.clickClose();
    await messageBox.clickActionButton('no');

    // expect the view not to be closed
    await expectView(testeeViewPage).toBeActive();

    // close the view
    await testeeViewPage.view.tab.close();
    await messageBox.clickActionButton('yes');

    // expect the view to be closed
    await expectView(testeeViewPage).not.toBeAttached();
  });

  test('should close confirmed views, leaving other views open', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

    // open test view 1
    const testee1ViewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    await testee1ViewPage.checkConfirmClosing(true); // prevent the view from closing

    // open test view 2
    const testee2ViewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    await testee2ViewPage.checkConfirmClosing(true); // prevent the view from closing

    // open test view 3
    const testee3ViewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

    // open context menu of viewtab 3
    const contextMenu = await testee3ViewPage.view.tab.openContextMenu();

    // click to close all tabs
    await contextMenu.menuItems.closeAll.click();

    // expect all views to be opened
    await expect(appPO.views()).toHaveCount(3);

    // confirm closing view 1
    const messageBox1 = appPO.messagebox({cssClass: ['e2e-close-view', await testee1ViewPage.view.getViewId()]});
    await messageBox1.clickActionButton('yes');

    // prevent closing view 2
    const messageBox2 = appPO.messagebox({cssClass: ['e2e-close-view', await testee2ViewPage.view.getViewId()]});
    await messageBox2.clickActionButton('no');

    // expect view 1 and view 3 to be closed.
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).toBeActive();
    await expectView(testee3ViewPage).not.toBeAttached();
  });

  test('should close view and log error if `CanClose` guard throws an error', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerIntention('app1', {type: 'messagebox'});

    // open test view 1
    const testee1ViewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    await testee1ViewPage.checkConfirmClosing(true); // prevent the view from closing

    // open test view 2
    const testee2ViewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    await testee2ViewPage.checkConfirmClosing(true); // prevent the view from closing

    // open test view 3
    const testee3ViewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

    // open context menu of viewtab 3
    const contextMenu = await testee3ViewPage.view.tab.openContextMenu();

    // click to close all tabs
    await contextMenu.menuItems.closeAll.click();

    // expect all views to be opened
    await expect(appPO.views()).toHaveCount(3);

    // simulate view 1 to throw error
    const messageBox1 = appPO.messagebox({cssClass: ['e2e-close-view', await testee1ViewPage.view.getViewId()]});
    await messageBox1.clickActionButton('error');

    // prevent closing view 2
    const messageBox2 = appPO.messagebox({cssClass: ['e2e-close-view', await testee2ViewPage.view.getViewId()]});
    await messageBox2.clickActionButton('no');

    // expect view 1 and view 3 to be closed.
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).toBeActive();
    await expectView(testee3ViewPage).not.toBeAttached();

    await expect.poll(() => consoleLogs.contains({severity: 'error', message: /\[CanCloseSpecError] Error in CanLoad of view 'view\.1'\./})).toBe(true);
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

  test('should preserve the size of inactive views', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // open test view 1
    const viewPage1 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const activeViewSize = await viewPage1.getBoundingBox();
    await expectView(viewPage1).toBeActive();

    // open test view 2
    const viewPage2 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const inactiveViewSize = await viewPage1.getBoundingBox();
    await expectView(viewPage1).toBeInactive();
    await expectView(viewPage2).toBeActive();

    // expect view size of inactive view not to have changed
    expect(activeViewSize).toEqual(inactiveViewSize);
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

  test('should detach view if opened in peripheral area and the main area is maximized', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Open two views in main area.
    const viewPage1 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewPage2 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

    // Capture instance id of view 2
    const view2ComponentId = await viewPage2.getComponentInstanceId();

    // Drag view 2 into peripheral area.
    await viewPage2.view.tab.dragTo({grid: 'workbench', region: 'east'});

    await expectView(viewPage1).toBeActive();
    await expectView(viewPage2).toBeActive();

    // Maximize the main area.
    await viewPage1.view.tab.dblclick();
    await expectView(viewPage1).toBeActive();
    await expect(viewPage2.view.locator).not.toBeAttached();
    await expect(viewPage2.view.tab.locator).not.toBeAttached();
    await expect(viewPage2.outlet.locator).toBeAttached();
    await expect(viewPage2.outlet.locator).not.toBeVisible();

    // Restore the layout.
    await viewPage1.view.tab.dblclick();
    await expectView(viewPage1).toBeActive();
    await expectView(viewPage2).toBeActive();

    // Expect view 2 not to be instantiated anew
    expect(view2ComponentId).toEqual(await viewPage2.getComponentInstanceId());
  });

  test('should update Angular bindings for active views', async ({appPO, microfrontendNavigator}) => {
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
  });

  test('should update Angular bindings for inactive views', async ({appPO, microfrontendNavigator}) => {
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
  });
});
