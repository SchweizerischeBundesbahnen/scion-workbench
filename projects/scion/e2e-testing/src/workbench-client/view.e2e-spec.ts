/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {waitUntilAttached} from '../helper/testing.util';
import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {RegisterWorkbenchIntentionPagePO} from './page-object/register-workbench-intention-page.po';
import {RegisterWorkbenchCapabilityPagePO} from './page-object/register-workbench-capability-page.po';
import {ViewPagePO} from './page-object/view-page.po';
import {RouterPagePO} from './page-object/router-page.po';

test.describe('Workbench View', () => {

  test('should complete view Observables on navigation', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    // Observable completion expectations:
    // - should complete params$, capability$, active$ observables only when navigating to a view capability of a different app
    // - should complete title$, heading$, dirty$ and closable$ observables when navigating to a different view capability
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee-1 view in app1
    const registerCapabilityPage1 = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage1.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-pages/view-test-page/view1',
        title: 'Testee 1',
        cssClass: 'testee-1',
      },
    });

    // register testee-2 view in app1
    await registerCapabilityPage1.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-pages/view-test-page/view2',
        title: 'Testee 2',
        cssClass: 'testee-2',
      },
    });

    // register testee-3 view in app2
    const registerCapabilityPage2 = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPage2.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-3'},
      private: false,
      properties: {
        path: 'test-view',
        title: 'Testee 3',
        cssClass: 'testee-3',
      },
    });

    // allow app1 to open testee-3 view
    const registerIntentionPage2 = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage2.registerIntention({type: 'view', qualifier: {component: 'testee-3'}});

    // navigate to testee-1 view (app1)
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee-1'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    const testeeViewId = await appPO.view({cssClass: 'testee-1'}).getViewId();
    const testeeView = appPO.view({viewId: testeeViewId});
    const testeeViewPage = new ViewPagePO(appPO, testeeViewId);

    // expect testee-1 to show
    await expect(await testeeView.viewTab.getTitle()).toEqual('Testee 1');
    const testee1ComponentInstanceId = await testeeViewPage.getComponentInstanceId();

    // navigate to testee-2 view (app1)
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee-2'});
    await routerPage.enterTarget(testeeViewId);
    await routerPage.clickNavigate();

    // expect testee-2 to show
    await expect(await testeeView.viewTab.getTitle()).toEqual('Testee 2');
    await testeeView.viewTab.click();
    const testee2ComponentInstanceId = await testeeViewPage.getComponentInstanceId();

    // expect following Observables to complete
    await expect(await consoleLogs.get({severity: 'debug', filter: /ObservableComplete/, consume: true})).toEqualIgnoreOrder([
      `[TitleObservableComplete] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[HeadingObservableComplete] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[DirtyObservableComplete] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[ClosableObservableComplete] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
    ]);

    // update params (no microfrontend change)
    await testeeViewPage.navigateSelf({param1: 'param-1'});

    // expect following Observables to complete
    await expect(await consoleLogs.get({severity: 'debug', filter: /ObservableComplete/, consume: true})).toEqual([]);

    // navigate to testee-3 view (app3)
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee-3'});
    await routerPage.enterTarget(testeeViewId);
    await routerPage.clickNavigate();

    // expect testee-3 to show
    await expect(await testeeView.viewTab.getTitle()).toEqual('Testee 3');
    await testeeView.viewTab.click();
    const testee3ComponentInstanceId = await testeeViewPage.getComponentInstanceId();

    // expect following Observables to complete
    await expect(await consoleLogs.get({severity: 'debug', filter: /ObservableComplete/, consume: true})).toEqualIgnoreOrder([
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

    // expect the component instances to be different
    expect(new Set([testee1ComponentInstanceId, testee2ComponentInstanceId, testee3ComponentInstanceId]).size).toEqual(3);

    // navigate to testee-1 view (app1)
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee-1'});
    await routerPage.enterTarget(testeeViewId);
    await routerPage.clickNavigate();

    // expect following Observables to complete
    await expect(await consoleLogs.get({severity: 'debug', filter: /ObservableComplete/, consume: true})).toEqualIgnoreOrder([
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
    const viewTab = viewPage.view.viewTab;

    await viewPage.enterTitle('UPDATED TITLE');
    await expect(await viewTab.getTitle()).toEqual('UPDATED TITLE');

    await viewPage.enterTitle('updated title');
    await expect(await viewTab.getTitle()).toEqual('updated title');
  });

  test('should allow updating the viewtab heading', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');
    const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTab = viewPage.view.viewTab;

    await viewPage.enterHeading('UPDATED HEADING');
    await expect(await viewTab.getHeading()).toEqual('UPDATED HEADING');

    await viewPage.enterHeading('updated heading');
    await expect(await viewTab.getHeading()).toEqual('updated heading');
  });

  test('should allow updating the viewtab dirty state', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTab = viewPage.view.viewTab;

    await viewPage.markDirty(true);
    await expect(await viewTab.isDirty()).toBe(true);

    await viewPage.markDirty(false);
    await expect(await viewTab.isDirty()).toBe(false);

    await viewPage.markDirty(); // noarg
    await expect(await viewTab.isDirty()).toBe(true);
  });

  test('should allow updating the viewtab closable flag', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTab = viewPage.view.viewTab;

    await viewPage.checkClosable(true);
    await expect(viewTab.closeButton).toBeVisible();

    await viewPage.checkClosable(false);
    await expect(viewTab.closeButton).not.toBeVisible();
  });

  test('should allow closing the view', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTab = viewPage.view.viewTab;

    await waitUntilAttached(viewPage.locator);
    await expect(await viewTab.isPresent()).toBe(true);
    await expect(await viewPage.isPresent()).toBe(true);

    // close the view
    await viewPage.clickClose();

    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(0);
    await expect(await viewTab.isPresent()).toBe(false);
    await expect(await viewPage.isPresent()).toBe(false);
  });

  test('should allow prevent the view from closing', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'messagebox'});

    const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTab = viewPage.view.viewTab;

    // prevent the view from closing
    await viewPage.checkConfirmClosing(true);

    // try closing the view
    await viewTab.close();
    const msgbox = appPO.messagebox({cssClass: ['e2e-close-view', viewPage.viewId]});
    await msgbox.clickActionButton('no');

    // expect the view not to be closed
    await expect(await viewTab.isPresent()).toBe(true);
    await expect(await viewPage.isPresent()).toBe(true);

    // try closing the view
    await viewPage.clickClose();
    await msgbox.clickActionButton('no');

    // expect the view not to be closed
    await expect(await viewTab.isPresent()).toBe(true);
    await expect(await viewPage.isPresent()).toBe(true);

    // try closing the view
    await viewTab.close();
    await msgbox.clickActionButton('yes');

    // expect the view to be closed
    await expect(await viewTab.isPresent()).toBe(false);
    await expect(await viewPage.isPresent()).toBe(false);
  });

  test('should only close confirmed views, leaving other views open', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'messagebox'});
    await registerIntentionPage.viewTab.close();

    // open test view 1
    const viewPage1 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTab1 = viewPage1.view.viewTab;
    await viewPage1.checkConfirmClosing(true); // prevent the view from closing

    // open test view 2
    const viewPage2 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTab2 = viewPage2.view.viewTab;
    await viewPage2.checkConfirmClosing(true); // prevent the view from closing

    // open test view 3
    const viewPage3 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTab3 = viewPage3.view.viewTab;
    await viewPage3.checkConfirmClosing(true); // prevent the view from closing

    // open context menu of viewtab 3
    const contextMenu = await viewTab3.openContextMenu();

    // click to close all tabs
    await contextMenu.menuItems.closeAll.click();

    // expect all views being still open
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);

    // confirm closing view 1
    const msgbox1 = appPO.messagebox({cssClass: ['e2e-close-view', viewPage1.viewId]});
    await msgbox1.clickActionButton('yes');

    // expect view 1 being closed
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);

    // prevent closing view 2
    const msgbox2 = appPO.messagebox({cssClass: ['e2e-close-view', viewPage2.viewId]});
    await msgbox2.clickActionButton('no');

    // expect view 2 being still open
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);

    // confirm closing view 3
    const msgbox3 = appPO.messagebox({cssClass: ['e2e-close-view', viewPage3.viewId]});
    await msgbox3.clickActionButton('yes');

    // expect view 3 to be closed
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(1);
    await expect(await viewTab3.isPresent()).toBe(false);
    await expect(await viewPage3.isPresent()).toBe(false);

    // expect view 2 not to be closed and active
    await expect(await viewTab2.isPresent()).toBe(true);
    await expect(await viewTab2.isActive()).toBe(true);
    await expect(await viewPage2.isPresent()).toBe(true);

    // expect view 1 to be closed
    await expect(await viewTab1.isPresent()).toBe(false);
    await expect(await viewPage1.isPresent()).toBe(false);
  });

  test('should activate viewtab when switching between tabs', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // open test view 1
    const viewPage1 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTab1 = viewPage1.view.viewTab;
    await waitUntilAttached(viewPage1.locator);

    // expect view 1 to be present and active
    expect(await viewTab1.isPresent()).toBe(true);
    expect(await viewTab1.isActive()).toBe(true);
    expect(await viewPage1.isVisible()).toBe(true);

    // open test view 2
    const viewPage2 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTab2 = viewPage2.view.viewTab;
    await waitUntilAttached(viewPage2.locator);

    // expect view 1 not to be displayed and its viewtab being inactive
    expect(await viewTab1.isPresent()).toBe(true);
    expect(await viewTab1.isActive()).toBe(false);
    expect(await viewPage1.isVisible()).toBe(false);

    // expect view 2 to be present and active
    expect(await viewTab2.isPresent()).toBe(true);
    expect(await viewTab2.isActive()).toBe(true);
    expect(await viewPage2.isVisible()).toBe(true);

    // activate view 1
    await viewTab1.click();

    // expect view 1 to be displayed and active
    expect(await viewTab1.isPresent()).toBe(true);
    expect(await viewTab1.isActive()).toBe(true);
    expect(await viewPage1.isVisible()).toBe(true);

    // expect view 2 not to be displayed and its viewtab being inactive
    expect(await viewTab2.isPresent()).toBe(true);
    expect(await viewTab2.isActive()).toBe(false);
    expect(await viewPage2.isVisible()).toBe(false);
  });

  test('should preserve the size of inactive views', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // open test view 1
    const viewPage1 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTab1 = viewPage1.view.viewTab;
    const activeViewSize = await viewPage1.getSize();

    // expect view 1 to be present and active
    expect(await viewTab1.isPresent()).toBe(true);
    expect(await viewTab1.isActive()).toBe(true);
    expect(await viewPage1.isVisible()).toBe(true);

    // open test view 2
    const viewPage2 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTab2 = viewPage2.view.viewTab;
    const inactiveViewSize = await viewPage1.getSize();

    // expect view 1 not to be displayed and its viewtab to be inactive
    expect(await viewTab1.isPresent()).toBe(true);
    expect(await viewTab1.isActive()).toBe(false);
    expect(await viewPage1.isVisible()).toBe(false);

    // expect view 2 to be present and active
    expect(await viewTab2.isPresent()).toBe(true);
    expect(await viewTab2.isActive()).toBe(true);
    expect(await viewPage2.isVisible()).toBe(true);

    // expect view size of inactive view not to have changed
    expect(activeViewSize).toEqual(inactiveViewSize);
  });

  test('should not confirm closing when switching between viewtabs', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'messagebox'});
    await registerIntentionPage.viewTab.close();

    // open test view 1
    const viewPage1 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTab1 = viewPage1.view.viewTab;
    await viewPage1.checkConfirmClosing(true); // prevent the view from closing

    // open test view 2
    const viewPage2 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTab2 = viewPage2.view.viewTab;
    await viewPage2.checkConfirmClosing(true); // prevent the view from closing

    // switch to view 1, should not ask for confirmation
    await viewTab1.click();
    expect(await appPO.messagebox({cssClass: 'e2e-close-view'}).isPresent()).toBe(false);

    // switch to view 2, should not ask for confirmation
    await viewTab2.click();
    expect(await appPO.messagebox({cssClass: 'e2e-close-view'}).isPresent()).toBe(false);
  });

  test('should emit when activating or deactivating a viewtab', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee-1 view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-view',
        title: 'Testee 1',
        cssClass: 'testee-1',
      },
    });

    // register testee-2 view
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-view',
        title: 'Testee 2',
        cssClass: 'testee-2',
      },
    });

    // navigate to testee-1 view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee-1'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();
    const testee1ViewTab = appPO.view({cssClass: 'testee-1'}).viewTab;
    const testee1ViewPage = new ViewPagePO(appPO, await testee1ViewTab.getViewId());
    const testee1ComponentInstanceId = await testee1ViewPage.getComponentInstanceId();

    // assert emitted view active/deactivated events
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewActivate|ViewDeactivate/, consume: true})).toEqual([
      `[ViewActivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
    ]);

    // navigate to testee-2 view
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee-2'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();
    const testee2ViewTab = appPO.view({cssClass: 'testee-2'}).viewTab;
    const testee2ViewPage = new ViewPagePO(appPO, await testee2ViewTab.getViewId());
    const testee2ComponentInstanceId = await testee2ViewPage.getComponentInstanceId();

    // assert emitted view active/deactivated events
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewActivate|ViewDeactivate/, consume: true})).toEqualIgnoreOrder([
      `[ViewDeactivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
    ]);

    // activate testee-1 view
    await testee1ViewTab.click();
    await testee1ViewPage.isPresent();

    // assert emitted view active/deactivated events
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewActivate|ViewDeactivate/, consume: true})).toEqualIgnoreOrder([
      `[ViewDeactivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
    ]);

    // activate testee-2 view
    await testee2ViewTab.click();
    await testee2ViewPage.isPresent();

    // assert emitted view active/deactivated events
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewActivate|ViewDeactivate/, consume: true})).toEqualIgnoreOrder([
      `[ViewDeactivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
    ]);

    // register testee-3 view
    await registerCapabilityPage.viewTab.click();

    // assert emitted view active/deactivated events
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewActivate|ViewDeactivate/, consume: true})).toEqual([
      `[ViewDeactivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
    ]);

    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-3'},
      properties: {
        path: 'test-view',
        title: 'Testee 3',
        cssClass: 'testee-3',
      },
    });

    // navigate to testee-3 view
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee-3'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();
    const testee3ViewTab = appPO.view({cssClass: 'testee-3'}).viewTab;
    const testee3ViewPage = new ViewPagePO(appPO, await testee3ViewTab.getViewId());
    const testee3ComponentInstanceId = await testee3ViewPage.getComponentInstanceId();

    // assert emitted view active/deactivated events
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewActivate|ViewDeactivate/, consume: true})).toEqual([
      `[ViewActivate] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
    ]);

    // activate testee-1 view
    await testee1ViewTab.click();
    await testee1ViewPage.isPresent();

    // assert emitted view active/deactivated events
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewActivate|ViewDeactivate/, consume: true})).toEqualIgnoreOrder([
      `[ViewDeactivate] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
    ]);
  });

  test('should provide the view\'s capability', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee-1 view in app1
    const registerCapabilityPage1 = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage1.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-view',
        title: 'Testee 1',
        cssClass: 'testee-1',
      },
    });

    // register testee-2 view in app1
    await registerCapabilityPage1.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-view',
        title: 'Testee 2',
        cssClass: 'testee-2',
      },
    });

    // register testee-3 view in app2
    const registerCapabilityPage2 = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPage2.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-3'},
      private: false,
      properties: {
        path: 'test-view',
        title: 'Testee 3',
        cssClass: 'testee-3',
      },
    });

    // allow app1 to open testee-3 view
    const registerIntentionPage2 = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage2.registerIntention({type: 'view', qualifier: {component: 'testee-3'}});

    // navigate to testee-1 view (app1)
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee-1'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    const testeeViewId = await appPO.view({cssClass: 'testee-1'}).getViewId();
    const testeeViewPage = new ViewPagePO(appPO, testeeViewId);

    await expect(await testeeViewPage.getViewCapability()).toEqual(expect.objectContaining({
      qualifier: {component: 'testee-1'},
      type: 'view',
      properties: expect.objectContaining({
        path: 'test-view',
        title: 'Testee 1',
        cssClass: ['testee-1'],
      }),
    }));

    // navigate to testee-2 view (app1)
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee-2'});
    await routerPage.enterTarget(testeeViewId);
    await routerPage.clickNavigate();

    await testeeViewPage.view.viewTab.click();
    await expect(await testeeViewPage.getViewCapability()).toEqual(expect.objectContaining({
      qualifier: {component: 'testee-2'},
      type: 'view',
      properties: expect.objectContaining({
        path: 'test-view',
        title: 'Testee 2',
        cssClass: ['testee-2'],
      }),
    }));

    // navigate to testee-3 view (app2)
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee-3'});
    await routerPage.enterTarget(testeeViewId);
    await routerPage.clickNavigate();

    await testeeViewPage.view.viewTab.click();
    await expect(await testeeViewPage.getViewCapability()).toEqual(expect.objectContaining({
      qualifier: {component: 'testee-3'},
      type: 'view',
      properties: expect.objectContaining({
        path: 'test-view',
        title: 'Testee 3',
        cssClass: ['testee-3'],
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

    // register testee-1 view in app1
    const registerCapabilityPageApp1 = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const capability1Id = (await registerCapabilityPageApp1.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-pages/view-test-page/view1',
        title: 'Testee 1',
        heading: 'app 1',
        cssClass: 'testee-1',
      },
    })).metadata!.id;

    // register testee-2 view in app1
    const capability2Id = (await registerCapabilityPageApp1.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-pages/view-test-page/view2',
        title: 'Testee 2',
        heading: 'app 1',
        cssClass: 'testee-2',
      },
    })).metadata!.id;

    // register testee-3 view in app2
    const registerCapabilityPageApp2 = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    const capability3Id = (await registerCapabilityPageApp2.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-3'},
      private: false,
      properties: {
        path: 'test-view',
        title: 'Testee 3',
        heading: 'app 2',
        cssClass: 'testee-3',
      },
    })).metadata!.id;

    // allow app1 to open testee-3 view of app2
    const registerIntentionPage2 = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage2.registerIntention({type: 'view', qualifier: {component: 'testee-3'}});

    // navigate to testee-1 view (app1)
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee-1'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    // Construct the PO to interact with the opened view
    const viewId = await appPO.activePart({inMainArea: true}).activeView.getViewId();
    const viewTab = appPO.view({viewId}).viewTab;
    const viewPage = new ViewPagePO(appPO, viewId);

    // Assert the correct capability to be loaded
    await expect(await viewPage.getViewCapability()).toEqual(expect.objectContaining({metadata: {id: capability1Id, appSymbolicName: 'workbench-client-testing-app1'}}));
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewCapability\$::first/, consume: true})).toEqual([
      `[ViewCapability$::first] [component=ViewPageComponent@${await viewPage.getComponentInstanceId()}, capabilityId=${capability1Id}]`,
    ]);

    // navigate to testee-2 view (app1)
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee-2'});
    await routerPage.enterTarget(viewId);
    await routerPage.clickNavigate();

    // Assert the correct capability to be loaded
    await viewTab.click();
    await expect(await viewPage.getViewCapability()).toEqual(expect.objectContaining({metadata: {id: capability2Id, appSymbolicName: 'workbench-client-testing-app1'}}));
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewCapability\$::first/, consume: true})).toEqual([
      `[ViewCapability$::first] [component=ViewPageComponent@${await viewPage.getComponentInstanceId()}, capabilityId=${capability2Id}]`,
    ]);

    // navigate to testee-1 view (app1)
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee-1'});
    await routerPage.enterTarget(viewId);
    await routerPage.clickNavigate();

    // Assert the correct capability to be loaded
    await viewTab.click();
    await expect(await viewPage.getViewCapability()).toEqual(expect.objectContaining({metadata: {id: capability1Id, appSymbolicName: 'workbench-client-testing-app1'}}));
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewCapability\$::first/, consume: true})).toEqual([
      `[ViewCapability$::first] [component=ViewPageComponent@${await viewPage.getComponentInstanceId()}, capabilityId=${capability1Id}]`,
    ]);

    // navigate to testee-3 view (app2)
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee-3'});
    await routerPage.enterTarget(viewId);
    await routerPage.clickNavigate();

    // Assert the correct capability to be loaded
    await viewTab.click();
    await expect(await viewPage.getViewCapability()).toEqual(expect.objectContaining({metadata: {id: capability3Id, appSymbolicName: 'workbench-client-testing-app2'}}));
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewCapability\$::first/, consume: true})).toEqual([
      `[ViewCapability$::first] [component=ViewPageComponent@${await viewPage.getComponentInstanceId()}, capabilityId=${capability3Id}]`,
    ]);
  });

  test('should provide the view\'s identity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee-1 view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-view',
        title: 'Testee 1',
        cssClass: 'testee-1',
      },
    });

    // register testee-2 view
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-view',
        title: 'Testee 2',
        cssClass: 'testee-2',
      },
    });

    // register testee-3 view
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-3'},
      properties: {
        path: 'test-view',
        title: 'Testee 3',
        cssClass: 'testee-3',
      },
    });

    // navigate to testee-1 view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee-1'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    const testee1ViewId = await appPO.view({cssClass: 'testee-1'}).getViewId();
    await expect(await new ViewPagePO(appPO, testee1ViewId).getViewId()).toEqual(testee1ViewId);

    // navigate to testee-2 view
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee-2'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    const testee2ViewId = await appPO.view({cssClass: 'testee-2'}).getViewId();
    await expect(await new ViewPagePO(appPO, testee2ViewId).getViewId()).toEqual(testee2ViewId);

    // navigate to testee-3 view
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee-3'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    const testee3ViewId = await appPO.view({cssClass: 'testee-3'}).getViewId();
    await expect(await new ViewPagePO(appPO, testee3ViewId).getViewId()).toEqual(testee3ViewId);
  });

  test.describe('keystroke bubbling of view context menu items', () => {

    test('should propagate `ctrl+k` for closing the current view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});
      const viewPage1 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      const viewPage2 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      const viewPage3 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

      await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);

      // Press 'ctrl+k' in view 2
      await viewPage2.view.viewTab.click();
      await viewPage2.sendKeys('Control+K');

      await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
      await expect(await viewPage1.isPresent()).toBe(true);
      await expect(await viewPage2.isPresent()).toBe(false);
      await expect(await viewPage3.isPresent()).toBe(true);
    });

    test('should propagate `ctrl+shift+k` for closing other views', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});
      const viewPage1 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      const viewPage2 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      const viewPage3 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

      await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);

      // Press 'ctrl+shift+k' in view 2
      await viewPage2.view.viewTab.click();
      await viewPage2.sendKeys('Control+Shift+K');

      await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(1);
      await expect(await viewPage1.isPresent()).toBe(false);
      await expect(await viewPage2.isPresent()).toBe(true);
      await expect(await viewPage3.isPresent()).toBe(false);
    });

    test('should propagate `ctrl+shift+alt+k` for closing all views', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});
      const viewPage1 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      const viewPage2 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      const viewPage3 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

      await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);

      // Press 'ctrl+shift+alt+k' in view 2
      await viewPage2.view.viewTab.click();
      await viewPage2.sendKeys('Control+Shift+Alt+K');

      await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(0);
      await expect(await viewPage1.isPresent()).toBe(false);
      await expect(await viewPage2.isPresent()).toBe(false);
      await expect(await viewPage3.isPresent()).toBe(false);
    });
  });

  test('should detach view if not active', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Open two views.
    const view1Page = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const view2Page = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

    // Expect view 2 to be visible.
    await expectMicrofrontendViewNotToBeVisible(view1Page);
    await expectMicrofrontendViewToBeVisible(view2Page);

    // Activate view 1.
    await view1Page.viewTab.click();

    // Expect view 1 to be visible.
    await expectMicrofrontendViewToBeVisible(view1Page);
    await expectMicrofrontendViewNotToBeVisible(view2Page);
  });

  test('should detach view if opened in peripheral area and the main area is maximized', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Open two views in main area.
    const view1Page = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const view2Page = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

    // Drag view 1 into peripheral area.
    await view1Page.viewTab.dragTo({grid: 'workbench', region: 'east'});
    await expectMicrofrontendViewToBeVisible(view1Page);
    await expectMicrofrontendViewToBeVisible(view2Page);

    // Maximize the main area.
    await view2Page.viewTab.dblclick();
    await expectMicrofrontendViewNotToBeVisible(view1Page);
    await expectMicrofrontendViewToBeVisible(view2Page);

    // Restore the layout.
    await view2Page.viewTab.dblclick();
    await expectMicrofrontendViewToBeVisible(view1Page);
    await expectMicrofrontendViewToBeVisible(view2Page);
  });
});

/**
 * Expects the visibility of the workbench view, the router outlet and the microfrontend.
 */
async function expectMicrofrontendViewToBeVisible(viewPage: ViewPagePO): Promise<void> {
  await expect(viewPage.view.locator).toBeVisible();
  await expect(viewPage.outlet.locator).toBeVisible();
  await expect(viewPage.locator).toBeVisible();
}

/**
 * Expects the visibility of the workbench view, the router outlet and the microfrontend.
 */
async function expectMicrofrontendViewNotToBeVisible(viewPage: ViewPagePO): Promise<void> {
  await expect(viewPage.view.locator).not.toBeAttached();
  await expect(viewPage.outlet.locator).toBeAttached();
  await expect(viewPage.outlet.locator).not.toBeVisible();
  await expect(viewPage.locator).toBeVisible(); // iframe content is always visible, but not displayed because the outlet is hidden
}
