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
    const registerCapabilityPage1PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage1PO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-view/view1',
        title: 'Testee 1',
        cssClass: 'testee-1',
      },
    });

    // register testee-2 view in app1
    await registerCapabilityPage1PO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-view/view2',
        title: 'Testee 2',
        cssClass: 'testee-2',
      },
    });

    // register testee-3 view in app2
    const registerCapabilityPage2PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPage2PO.registerCapability({
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
    const registerIntentionPage2PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage2PO.registerIntention({type: 'view', qualifier: {component: 'testee-3'}});

    // navigate to testee-1 view (app1)
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee-1'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();

    const testeeViewId = await appPO.view({cssClass: 'testee-1'}).getViewId();
    const testeeViewPO = appPO.view({viewId: testeeViewId});
    const testeeViewPagePO = new ViewPagePO(appPO, testeeViewId);

    // expect testee-1 to show
    await expect(await testeeViewPO.viewTab.getTitle()).toEqual('Testee 1');
    const testee1ComponentInstanceId = await testeeViewPagePO.getComponentInstanceId();

    // navigate to testee-2 view (app1)
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee-2'});
    await routerPagePO.enterTarget(testeeViewId);
    await routerPagePO.clickNavigate();

    // expect testee-2 to show
    await expect(await testeeViewPO.viewTab.getTitle()).toEqual('Testee 2');
    await testeeViewPO.viewTab.click();
    const testee2ComponentInstanceId = await testeeViewPagePO.getComponentInstanceId();

    // expect following Observables to complete
    await expect(await consoleLogs.get({severity: 'debug', filter: /ObservableComplete/, consume: true})).toEqualIgnoreOrder([
      `[TitleObservableComplete] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[HeadingObservableComplete] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[DirtyObservableComplete] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[ClosableObservableComplete] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
    ]);

    // update params (no microfrontend change)
    await testeeViewPagePO.navigateSelf({param1: 'param-1'});

    // expect following Observables to complete
    await expect(await consoleLogs.get({severity: 'debug', filter: /ObservableComplete/, consume: true})).toEqual([]);

    // navigate to testee-3 view (app3)
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee-3'});
    await routerPagePO.enterTarget(testeeViewId);
    await routerPagePO.clickNavigate();

    // expect testee-3 to show
    await expect(await testeeViewPO.viewTab.getTitle()).toEqual('Testee 3');
    await testeeViewPO.viewTab.click();
    const testee3ComponentInstanceId = await testeeViewPagePO.getComponentInstanceId();

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
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee-1'});
    await routerPagePO.enterTarget(testeeViewId);
    await routerPagePO.clickNavigate();

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
    const viewPagePO = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTabPO = viewPagePO.view.viewTab;

    await viewPagePO.enterTitle('UPDATED TITLE');
    await expect(await viewTabPO.getTitle()).toEqual('UPDATED TITLE');

    await viewPagePO.enterTitle('updated title');
    await expect(await viewTabPO.getTitle()).toEqual('updated title');
  });

  test('should allow updating the viewtab heading', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    const viewPagePO = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTabPO = viewPagePO.view.viewTab;

    await viewPagePO.enterHeading('UPDATED HEADING');
    await expect(await viewTabPO.getHeading()).toEqual('UPDATED HEADING');

    await viewPagePO.enterHeading('updated heading');
    await expect(await viewTabPO.getHeading()).toEqual('updated heading');
  });

  test('should allow updating the viewtab dirty state', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    const viewPagePO = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTabPO = viewPagePO.view.viewTab;

    await viewPagePO.markDirty(true);
    await expect(await viewTabPO.isDirty()).toBe(true);

    await viewPagePO.markDirty(false);
    await expect(await viewTabPO.isDirty()).toBe(false);

    await viewPagePO.markDirty(); // noarg
    await expect(await viewTabPO.isDirty()).toBe(true);
  });

  test('should allow updating the viewtab closable flag', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    const viewPagePO = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTabPO = viewPagePO.view.viewTab;

    await viewPagePO.checkClosable(true);
    await expect(await viewTabPO.isClosable()).toBe(true);

    await viewPagePO.checkClosable(false);
    await expect(await viewTabPO.isClosable()).toBe(false);
  });

  test('should allow closing the view', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    const viewPagePO = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTabPO = viewPagePO.view.viewTab;

    await waitUntilAttached(viewPagePO.locator);
    await expect(await viewTabPO.isPresent()).toBe(true);
    await expect(await viewPagePO.isPresent()).toBe(true);

    // close the view
    await viewPagePO.clickClose();

    await expect(await appPO.activePart.getViewIds()).toHaveLength(0);
    await expect(await viewTabPO.isPresent()).toBe(false);
    await expect(await viewPagePO.isPresent()).toBe(false);
  });

  test('should allow prevent the view from closing', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});

    const viewPagePO = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTabPO = viewPagePO.view.viewTab;

    // prevent the view from closing
    await viewPagePO.checkConfirmClosing(true);

    // try closing the view
    await viewTabPO.close();
    const msgboxPO = appPO.messagebox({cssClass: ['e2e-close-view', viewPagePO.viewId]});
    await msgboxPO.clickActionButton('no');

    // expect the view not to be closed
    await expect(await viewTabPO.isPresent()).toBe(true);
    await expect(await viewPagePO.isPresent()).toBe(true);

    // try closing the view
    await viewPagePO.clickClose();
    await msgboxPO.clickActionButton('no');

    // expect the view not to be closed
    await expect(await viewTabPO.isPresent()).toBe(true);
    await expect(await viewPagePO.isPresent()).toBe(true);

    // try closing the view
    await viewTabPO.close();
    await msgboxPO.clickActionButton('yes');

    // expect the view to be closed
    await expect(await viewTabPO.isPresent()).toBe(false);
    await expect(await viewPagePO.isPresent()).toBe(false);
  });

  test('should only close confirmed views, leaving other views open', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});
    await registerIntentionPagePO.viewTabPO.close();

    // open test view 1
    const viewPagePO1 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTabPO1 = viewPagePO1.view.viewTab;
    await viewPagePO1.checkConfirmClosing(true); // prevent the view from closing

    // open test view 2
    const viewPagePO2 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTabPO2 = viewPagePO2.view.viewTab;
    await viewPagePO2.checkConfirmClosing(true); // prevent the view from closing

    // open test view 3
    const viewPagePO3 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTabPO3 = viewPagePO3.view.viewTab;
    await viewPagePO3.checkConfirmClosing(true); // prevent the view from closing

    // open context menu of viewtab 3
    const contextMenu = await viewTabPO3.openContextMenu();

    // click to close all tabs
    await contextMenu.closeAllTabs();

    // expect all views being still open
    await expect(await appPO.activePart.getViewIds()).toHaveLength(3);

    // confirm closing view 1
    const msgboxPO1 = appPO.messagebox({cssClass: ['e2e-close-view', viewPagePO1.viewId]});
    await msgboxPO1.clickActionButton('yes');

    // expect view 1 being closed
    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);

    // prevent closing view 2
    const msgboxPO2 = appPO.messagebox({cssClass: ['e2e-close-view', viewPagePO2.viewId]});
    await msgboxPO2.clickActionButton('no');

    // expect view 2 being still open
    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);

    // confirm closing view 3
    const msgboxPO3 = appPO.messagebox({cssClass: ['e2e-close-view', viewPagePO3.viewId]});
    await msgboxPO3.clickActionButton('yes');

    // expect view 3 to be closed
    await expect(await appPO.activePart.getViewIds()).toHaveLength(1);
    await expect(await viewTabPO3.isPresent()).toBe(false);
    await expect(await viewPagePO3.isPresent()).toBe(false);

    // expect view 2 not to be closed and active
    await expect(await viewTabPO2.isPresent()).toBe(true);
    await expect(await viewTabPO2.isActive()).toBe(true);
    await expect(await viewPagePO2.isPresent()).toBe(true);

    // expect view 1 to be closed
    await expect(await viewTabPO1.isPresent()).toBe(false);
    await expect(await viewPagePO1.isPresent()).toBe(false);
  });

  test('should activate viewtab when switching between tabs', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // open test view 1
    const viewPagePO1 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTabPO1 = viewPagePO1.view.viewTab;
    await waitUntilAttached(viewPagePO1.locator);

    // expect view 1 to be present and active
    expect(await viewTabPO1.isPresent()).toBe(true);
    expect(await viewTabPO1.isActive()).toBe(true);
    expect(await viewPagePO1.isVisible()).toBe(true);

    // open test view 2
    const viewPagePO2 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTabPO2 = viewPagePO2.view.viewTab;
    await waitUntilAttached(viewPagePO2.locator);

    // expect view 1 not to be displayed and its viewtab being inactive
    expect(await viewTabPO1.isPresent()).toBe(true);
    expect(await viewTabPO1.isActive()).toBe(false);
    expect(await viewPagePO1.isVisible()).toBe(false);

    // expect view 2 to be present and active
    expect(await viewTabPO2.isPresent()).toBe(true);
    expect(await viewTabPO2.isActive()).toBe(true);
    expect(await viewPagePO2.isVisible()).toBe(true);

    // activate view 1
    await viewTabPO1.click();

    // expect view 1 to be displayed and active
    expect(await viewTabPO1.isPresent()).toBe(true);
    expect(await viewTabPO1.isActive()).toBe(true);
    expect(await viewPagePO1.isVisible()).toBe(true);

    // expect view 2 not to be displayed and its viewtab being inactive
    expect(await viewTabPO2.isPresent()).toBe(true);
    expect(await viewTabPO2.isActive()).toBe(false);
    expect(await viewPagePO2.isVisible()).toBe(false);
  });

  test('should preserve the size of inactive views', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // open test view 1
    const viewPagePO1 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTabPO1 = viewPagePO1.view.viewTab;
    const activeViewSize = await viewPagePO1.getSize();

    // expect view 1 to be present and active
    expect(await viewTabPO1.isPresent()).toBe(true);
    expect(await viewTabPO1.isActive()).toBe(true);
    expect(await viewPagePO1.isVisible()).toBe(true);

    // open test view 2
    const viewPagePO2 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTabPO2 = viewPagePO2.view.viewTab;
    const inactiveViewSize = await viewPagePO1.getSize();

    // expect view 1 not to be displayed and its viewtab to be inactive
    expect(await viewTabPO1.isPresent()).toBe(true);
    expect(await viewTabPO1.isActive()).toBe(false);
    expect(await viewPagePO1.isVisible()).toBe(false);

    // expect view 2 to be present and active
    expect(await viewTabPO2.isPresent()).toBe(true);
    expect(await viewTabPO2.isActive()).toBe(true);
    expect(await viewPagePO2.isVisible()).toBe(true);

    // expect view size of inactive view not to have changed
    expect(activeViewSize).toEqual(inactiveViewSize);
  });

  test('should not confirm closing when switching between viewtabs', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register message box intention
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'messagebox'});
    await registerIntentionPagePO.viewTabPO.close();

    // open test view 1
    const viewPagePO1 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTabPO1 = viewPagePO1.view.viewTab;
    await viewPagePO1.checkConfirmClosing(true); // prevent the view from closing

    // open test view 2
    const viewPagePO2 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewTabPO2 = viewPagePO2.view.viewTab;
    await viewPagePO2.checkConfirmClosing(true); // prevent the view from closing

    // switch to view 1, should not ask for confirmation
    await viewTabPO1.click();
    expect(await appPO.messagebox({cssClass: 'e2e-close-view'}).isPresent()).toBe(false);

    // switch to view 2, should not ask for confirmation
    await viewTabPO2.click();
    expect(await appPO.messagebox({cssClass: 'e2e-close-view'}).isPresent()).toBe(false);
  });

  test('should emit when activating or deactivating a viewtab', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee-1 view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-view',
        title: 'Testee 1',
        cssClass: 'testee-1',
      },
    });

    // register testee-2 view
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-view',
        title: 'Testee 2',
        cssClass: 'testee-2',
      },
    });

    // navigate to testee-1 view
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee-1'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();
    const testee1ViewTabPO = appPO.view({cssClass: 'testee-1'}).viewTab;
    const testee1ViewPagePO = new ViewPagePO(appPO, await testee1ViewTabPO.getViewId());
    const testee1ComponentInstanceId = await testee1ViewPagePO.getComponentInstanceId();

    // assert emitted view active/deactivated events
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewActivate|ViewDeactivate/, consume: true})).toEqual([
      `[ViewActivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
    ]);

    // navigate to testee-2 view
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee-2'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();
    const testee2ViewTabPO = appPO.view({cssClass: 'testee-2'}).viewTab;
    const testee2ViewPagePO = new ViewPagePO(appPO, await testee2ViewTabPO.getViewId());
    const testee2ComponentInstanceId = await testee2ViewPagePO.getComponentInstanceId();

    // assert emitted view active/deactivated events
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewActivate|ViewDeactivate/, consume: true})).toEqualIgnoreOrder([
      `[ViewDeactivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
    ]);

    // activate testee-1 view
    await testee1ViewTabPO.click();
    await testee1ViewPagePO.isPresent();

    // assert emitted view active/deactivated events
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewActivate|ViewDeactivate/, consume: true})).toEqualIgnoreOrder([
      `[ViewDeactivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
    ]);

    // activate testee-2 view
    await testee2ViewTabPO.click();
    await testee2ViewPagePO.isPresent();

    // assert emitted view active/deactivated events
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewActivate|ViewDeactivate/, consume: true})).toEqualIgnoreOrder([
      `[ViewDeactivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
    ]);

    // register testee-3 view
    await registerCapabilityPagePO.viewTabPO.click();

    // assert emitted view active/deactivated events
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewActivate|ViewDeactivate/, consume: true})).toEqual([
      `[ViewDeactivate] [component=ViewPageComponent@${testee2ComponentInstanceId}]`,
    ]);

    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-3'},
      properties: {
        path: 'test-view',
        title: 'Testee 3',
        cssClass: 'testee-3',
      },
    });

    // navigate to testee-3 view
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee-3'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();
    const testee3ViewTabPO = appPO.view({cssClass: 'testee-3'}).viewTab;
    const testee3ViewPagePO = new ViewPagePO(appPO, await testee3ViewTabPO.getViewId());
    const testee3ComponentInstanceId = await testee3ViewPagePO.getComponentInstanceId();

    // assert emitted view active/deactivated events
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewActivate|ViewDeactivate/, consume: true})).toEqual([
      `[ViewActivate] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
    ]);

    // activate testee-1 view
    await testee1ViewTabPO.click();
    await testee1ViewPagePO.isPresent();

    // assert emitted view active/deactivated events
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewActivate|ViewDeactivate/, consume: true})).toEqualIgnoreOrder([
      `[ViewDeactivate] [component=ViewPageComponent@${testee3ComponentInstanceId}]`,
      `[ViewActivate] [component=ViewPageComponent@${testee1ComponentInstanceId}]`,
    ]);
  });

  test('should provide the view\'s capability', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee-1 view in app1
    const registerCapabilityPage1PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage1PO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-view',
        title: 'Testee 1',
        cssClass: 'testee-1',
      },
    });

    // register testee-2 view in app1
    await registerCapabilityPage1PO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-view',
        title: 'Testee 2',
        cssClass: 'testee-2',
      },
    });

    // register testee-3 view in app2
    const registerCapabilityPage2PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPage2PO.registerCapability({
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
    const registerIntentionPage2PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage2PO.registerIntention({type: 'view', qualifier: {component: 'testee-3'}});

    // navigate to testee-1 view (app1)
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee-1'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();

    const testeeViewId = await appPO.view({cssClass: 'testee-1'}).getViewId();
    const testeeViewPagePO = new ViewPagePO(appPO, testeeViewId);

    await expect(await testeeViewPagePO.getViewCapability()).toEqual(expect.objectContaining({
      qualifier: {component: 'testee-1'},
      type: 'view',
      properties: expect.objectContaining({
        path: 'test-view',
        title: 'Testee 1',
        cssClass: ['testee-1'],
      }),
    }));

    // navigate to testee-2 view (app1)
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee-2'});
    await routerPagePO.enterTarget(testeeViewId);
    await routerPagePO.clickNavigate();

    await testeeViewPagePO.view.viewTab.click();
    await expect(await testeeViewPagePO.getViewCapability()).toEqual(expect.objectContaining({
      qualifier: {component: 'testee-2'},
      type: 'view',
      properties: expect.objectContaining({
        path: 'test-view',
        title: 'Testee 2',
        cssClass: ['testee-2'],
      }),
    }));

    // navigate to testee-3 view (app2)
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee-3'});
    await routerPagePO.enterTarget(testeeViewId);
    await routerPagePO.clickNavigate();

    await testeeViewPagePO.view.viewTab.click();
    await expect(await testeeViewPagePO.getViewCapability()).toEqual(expect.objectContaining({
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
    await appPO.navigateTo({microfrontendSupport: true, simulateSlowCapabilityLookup: true});

    // register testee-1 view in app1
    const registerCapabilityApp1PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const capability1Id = (await registerCapabilityApp1PO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-view/view1',
        title: 'Testee 1',
        heading: 'app 1',
        cssClass: 'testee-1',
      },
    })).metadata!.id;

    // register testee-2 view in app1
    const capability2Id = (await registerCapabilityApp1PO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-view/view2',
        title: 'Testee 2',
        heading: 'app 1',
        cssClass: 'testee-2',
      },
    })).metadata!.id;

    // register testee-3 view in app2
    const registerCapabilityApp2PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    const capability3Id = (await registerCapabilityApp2PO.registerCapability({
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
    const registerIntentionPage2PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage2PO.registerIntention({type: 'view', qualifier: {component: 'testee-3'}});

    // navigate to testee-1 view (app1)
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee-1'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();

    // Construct the PO to interact with the opened view
    const viewId = await appPO.activePart.activeView.getViewId();
    const viewTabPO = appPO.view({viewId}).viewTab;
    const viewPagePO = new ViewPagePO(appPO, viewId);

    // Assert the correct capability to be loaded
    await expect(await viewPagePO.getViewCapability()).toEqual(expect.objectContaining({metadata: {id: capability1Id, appSymbolicName: 'workbench-client-testing-app1'}}));
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewCapability\$::first/, consume: true})).toEqual([
      `[ViewCapability$::first] [component=ViewPageComponent@${await viewPagePO.getComponentInstanceId()}, capabilityId=${capability1Id}]`,
    ]);

    // navigate to testee-2 view (app1)
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee-2'});
    await routerPagePO.enterTarget(viewId);
    await routerPagePO.clickNavigate();

    // Assert the correct capability to be loaded
    await viewTabPO.click();
    await expect(await viewPagePO.getViewCapability()).toEqual(expect.objectContaining({metadata: {id: capability2Id, appSymbolicName: 'workbench-client-testing-app1'}}));
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewCapability\$::first/, consume: true})).toEqual([
      `[ViewCapability$::first] [component=ViewPageComponent@${await viewPagePO.getComponentInstanceId()}, capabilityId=${capability2Id}]`,
    ]);

    // navigate to testee-1 view (app1)
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee-1'});
    await routerPagePO.enterTarget(viewId);
    await routerPagePO.clickNavigate();

    // Assert the correct capability to be loaded
    await viewTabPO.click();
    await expect(await viewPagePO.getViewCapability()).toEqual(expect.objectContaining({metadata: {id: capability1Id, appSymbolicName: 'workbench-client-testing-app1'}}));
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewCapability\$::first/, consume: true})).toEqual([
      `[ViewCapability$::first] [component=ViewPageComponent@${await viewPagePO.getComponentInstanceId()}, capabilityId=${capability1Id}]`,
    ]);

    // navigate to testee-3 view (app2)
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee-3'});
    await routerPagePO.enterTarget(viewId);
    await routerPagePO.clickNavigate();

    // Assert the correct capability to be loaded
    await viewTabPO.click();
    await expect(await viewPagePO.getViewCapability()).toEqual(expect.objectContaining({metadata: {id: capability3Id, appSymbolicName: 'workbench-client-testing-app2'}}));
    await expect(await consoleLogs.get({severity: 'debug', filter: /ViewCapability\$::first/, consume: true})).toEqual([
      `[ViewCapability$::first] [component=ViewPageComponent@${await viewPagePO.getComponentInstanceId()}, capabilityId=${capability3Id}]`,
    ]);
  });

  test('should provide the view\'s identity', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee-1 view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-view',
        title: 'Testee 1',
        cssClass: 'testee-1',
      },
    });

    // register testee-2 view
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-view',
        title: 'Testee 2',
        cssClass: 'testee-2',
      },
    });

    // register testee-3 view
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-3'},
      properties: {
        path: 'test-view',
        title: 'Testee 3',
        cssClass: 'testee-3',
      },
    });

    // navigate to testee-1 view
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee-1'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();

    const testee1ViewId = await appPO.view({cssClass: 'testee-1'}).getViewId();
    await expect(await new ViewPagePO(appPO, testee1ViewId).getViewId()).toEqual(testee1ViewId);

    // navigate to testee-2 view
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee-2'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();

    const testee2ViewId = await appPO.view({cssClass: 'testee-2'}).getViewId();
    await expect(await new ViewPagePO(appPO, testee2ViewId).getViewId()).toEqual(testee2ViewId);

    // navigate to testee-3 view
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee-3'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();

    const testee3ViewId = await appPO.view({cssClass: 'testee-3'}).getViewId();
    await expect(await new ViewPagePO(appPO, testee3ViewId).getViewId()).toEqual(testee3ViewId);
  });

  test.describe('keystroke bubbling of view context menu items', () => {

    test('should propagate `ctrl+k` for closing the current view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});
      const viewPage1PO = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      const viewPage2PO = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      const viewPage3PO = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

      await expect(await appPO.activePart.getViewIds()).toHaveLength(3);

      // Press 'ctrl+k' in view 2
      await viewPage2PO.view.viewTab.click();
      await viewPage2PO.sendKeys('Control+K');

      await expect(await appPO.activePart.getViewIds()).toHaveLength(2);
      await expect(await viewPage1PO.isPresent()).toBe(true);
      await expect(await viewPage2PO.isPresent()).toBe(false);
      await expect(await viewPage3PO.isPresent()).toBe(true);
    });

    test('should propagate `ctrl+shift+k` for closing other views', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});
      const viewPage1PO = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      const viewPage2PO = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      const viewPage3PO = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

      await expect(await appPO.activePart.getViewIds()).toHaveLength(3);

      // Press 'ctrl+shift+k' in view 2
      await viewPage2PO.view.viewTab.click();
      await viewPage2PO.sendKeys('Control+Shift+K');

      await expect(await appPO.activePart.getViewIds()).toHaveLength(1);
      await expect(await viewPage1PO.isPresent()).toBe(false);
      await expect(await viewPage2PO.isPresent()).toBe(true);
      await expect(await viewPage3PO.isPresent()).toBe(false);
    });

    test('should propagate `ctrl+shift+alt+k` for closing all views', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});
      const viewPage1PO = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      const viewPage2PO = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      const viewPage3PO = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');

      await expect(await appPO.activePart.getViewIds()).toHaveLength(3);

      // Press 'ctrl+shift+alt+k' in view 2
      await viewPage2PO.view.viewTab.click();
      await viewPage2PO.sendKeys('Control+Shift+Alt+K');

      await expect(await appPO.activePart.getViewIds()).toHaveLength(0);
      await expect(await viewPage1PO.isPresent()).toBe(false);
      await expect(await viewPage2PO.isPresent()).toBe(false);
      await expect(await viewPage3PO.isPresent()).toBe(false);
    });
  });
});

