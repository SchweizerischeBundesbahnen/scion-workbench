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
import {ViewPagePO as WorkbenchViewPagePO} from '../workbench/page-object/view-page.po';
import {UnregisterWorkbenchCapabilityPagePO} from './page-object/unregister-workbench-capability-page.po';
import {RouterPageLegacyPO} from './page-object/router-page-legacy.po';

test.describe('Workbench Router Legacy (DEPRECATED: API will be removed in v16)', () => {

  test('should navigate to own public views', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate to the testee view
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // expect testee view to be opened as new tab
    const testeeViewTabPO = appPO.view({cssClass: 'testee'}).viewTab;
    const testeeViewPagePO = new ViewPagePO(appPO, await testeeViewTabPO.getViewId());
    await expect(await appPO.activePart.getViewIds()).toHaveLength(3);
    await expect(await testeeViewTabPO.isActive()).toBe(true);
    await expect(await testeeViewPagePO.view.isPresent()).toBe(true);
    await expect(await testeeViewPagePO.isVisible()).toBe(true);
  });

  test('should navigate to own private views', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      private: true, // PRIVATE
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate to the testee view
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // expect testee view to be opened as new tab
    const testeeViewTabPO = appPO.view({cssClass: 'testee'}).viewTab;
    const testeeViewPagePO = new ViewPagePO(appPO, await testeeViewTabPO.getViewId());
    await expect(await appPO.activePart.getViewIds()).toHaveLength(3);
    await expect(await testeeViewTabPO.isActive()).toBe(true);
    await expect(await testeeViewPagePO.view.isPresent()).toBe(true);
    await expect(await testeeViewPagePO.isVisible()).toBe(true);
  });

  test('should not navigate to private views of other apps', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view as private view in app 2
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      private: true, // PRIVATE
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // register view intention in app 1
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'view', qualifier: {component: 'testee'}});

    // navigate to the testee view in app 1
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await expect(routerPagePO.clickNavigate()).rejects.toThrow(/NullProviderError/);

    // expect testee view not to be opened
    const testeeViewPO = appPO.view({cssClass: 'testee'});
    await expect(await appPO.activePart.getViewIds()).toHaveLength(3);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await testeeViewPO.viewTab.isPresent()).toBe(false);
    await expect(await testeeViewPO.isPresent()).toBe(false);
  });

  test('should navigate to public views of other apps', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view as public view in app 2
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // register view intention in app 1
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'view', qualifier: {component: 'testee'}});

    // navigate to the testee view in app 1
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // expect testee view not to be opened
    const testeeViewTabPO = appPO.view({cssClass: 'testee'}).viewTab;
    const testeeViewPagePO = new ViewPagePO(appPO, await testeeViewTabPO.getViewId());
    await expect(await appPO.activePart.getViewIds()).toHaveLength(4);
    await expect(await testeeViewTabPO.isActive()).toBe(true);
    await expect(await testeeViewPagePO.view.isPresent()).toBe(true);
    await expect(await testeeViewPagePO.isVisible()).toBe(true);
  });

  test('should not navigate to public views of other apps if missing the intention', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view as public view in app 2
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate to the testee view in app 1
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await expect(routerPagePO.clickNavigate()).rejects.toThrow(/NotQualifiedError/);

    // expect testee view not to be opened
    const testeeViewPO = appPO.view({cssClass: 'testee'});
    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await testeeViewPO.viewTab.isPresent()).toBe(false);
    await expect(await testeeViewPO.isPresent()).toBe(false);
  });

  test('should open a view in a new view tab [target=blank]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate to the testee view
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // expect testee view to be opened as new tab
    const testeeViewTabPO = appPO.view({cssClass: 'testee'}).viewTab;
    const testeeViewPagePO = new ViewPagePO(appPO, await testeeViewTabPO.getViewId());
    await expect(await appPO.activePart.getViewIds()).toHaveLength(3);
    await expect(await testeeViewTabPO.isActive()).toBe(true);
    await expect(await testeeViewPagePO.view.isPresent()).toBe(true);
    await expect(await testeeViewPagePO.isVisible()).toBe(true);
  });

  test('should open a view in the current view tab [target=self]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate to the testee view
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('self');
    await routerPagePO.clickNavigate();

    // expect testee view to be opened in the current tab
    const testeeViewTabPO = appPO.view({cssClass: 'testee'}).viewTab;
    const testeeViewPagePO = new ViewPagePO(appPO, await testeeViewTabPO.getViewId());
    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);
    await expect(await testeeViewTabPO.isActive()).toBe(true);
    await expect(await testeeViewPagePO.view.isPresent()).toBe(true);
    await expect(await testeeViewPagePO.isVisible()).toBe(true);
    await expect(await routerPagePO.isVisible()).toBe(false);
    await expect(testeeViewPagePO.viewId).toEqual(routerPagePO.viewId);
  });

  test('should, by default, navigate in the current view tab if no target is specified', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate to the testee view
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.clickNavigate();

    // expect testee view to be opened in the current tab
    const testeeViewTabPO = appPO.view({cssClass: 'testee'}).viewTab;
    const testeeViewPagePO = new ViewPagePO(appPO, await testeeViewTabPO.getViewId());
    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);
    await expect(await testeeViewTabPO.isActive()).toBe(true);
    await expect(await testeeViewPagePO.view.isPresent()).toBe(true);
    await expect(await testeeViewPagePO.isVisible()).toBe(true);
    await expect(await routerPagePO.isVisible()).toBe(false);
    await expect(testeeViewPagePO.viewId).toEqual(routerPagePO.viewId);
  });

  test('should open all views if multiple views match the qualifier', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view in app-1
    const registerCapabilityPage1PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage1PO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      private: false,
      properties: {
        path: 'test-view',
        title: 'testee 1',
        cssClass: 'testee-1',
      },
    });

    // register testee view in app-2
    const registerCapabilityPage2PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPage2PO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      private: false,
      properties: {
        path: 'test-view',
        title: 'testee 2',
        cssClass: 'testee-2',
      },
    });

    // register view intention in app 1
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'view', qualifier: {component: 'testee'}});

    // navigate to the testee view
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // expect testee view to be opened as new tab
    const testeeViewTab1PO = appPO.view({cssClass: 'testee-1'}).viewTab;
    const testeeViewTab2PO = appPO.view({cssClass: 'testee-2'}).viewTab;
    const testeeViewPage1PO = new ViewPagePO(appPO, await testeeViewTab1PO.getViewId());
    const testeeViewPage2PO = new ViewPagePO(appPO, await testeeViewTab2PO.getViewId());
    await expect(await appPO.activePart.getViewIds()).toHaveLength(6);
    await expect(await testeeViewTab1PO.isPresent()).toBe(true);
    await expect(await testeeViewTab2PO.isPresent()).toBe(true);
    await expect(await testeeViewTab1PO.isActive() || await testeeViewTab2PO.isActive()).toBe(true);
    await expect(await testeeViewPage1PO.view.isPresent() || await testeeViewPage2PO.view.isPresent()).toBe(true);
    await expect(await testeeViewPage1PO.view.isPresent()).not.toEqual(await testeeViewPage2PO.view.isPresent());
    await expect(await testeeViewPage1PO.isVisible() || await testeeViewPage2PO.isVisible()).toBe(true);
    await expect(await testeeViewPage1PO.isVisible()).not.toEqual(await testeeViewPage2PO.isVisible());
  });

  test('should reuse the same app instance when navigating between views of an app in the same view tab', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee-1 view
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

    // register testee-2 view
    const registerCapabilityPage2PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage2PO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-view/view2',
        title: 'Testee 2',
        cssClass: 'testee-2',
      },
    });

    // navigate to testee-1 view
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee-1'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    const testeeViewTabPO = appPO.view({cssClass: 'testee-1'}).viewTab;
    const testeeViewId = await testeeViewTabPO.getViewId();

    const componentInstanceIds = new Set<string>();

    // capture the app instance id
    const testeeViewPagePO = new ViewPagePO(appPO, testeeViewId);
    const appInstanceId = await testeeViewPagePO.getAppInstanceId();
    await componentInstanceIds.add(await testeeViewPagePO.getComponentInstanceId());

    // navigate to the testee-2 view
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee-2'});
    await routerPagePO.selectTarget('self');
    await routerPagePO.enterSelfViewId(testeeViewId);
    await routerPagePO.clickNavigate();
    await testeeViewPagePO.view.viewTab.click();

    // expect the correct view to display
    await expect(await testeeViewPagePO.getViewParams()).toEqual(expect.objectContaining({component: 'testee-2 [string]'}));
    // expect no new view instance to be constructed
    await expect(await testeeViewPagePO.getAppInstanceId()).toEqual(appInstanceId);
    // expect a different component instance id
    await expect(componentInstanceIds.add(await testeeViewPagePO.getComponentInstanceId()).size).toEqual(2);

    // navigate to the testee-1 view
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee-1'});
    await routerPagePO.enterSelfViewId(testeeViewId);
    await routerPagePO.selectTarget('self');
    await routerPagePO.clickNavigate();
    await testeeViewPagePO.view.viewTab.click();

    // expect the correct view to display
    await expect(await testeeViewPagePO.getViewParams()).toEqual(expect.objectContaining({component: 'testee-1 [string]'}));
    // expect no new view instance to be constructed
    await expect(await testeeViewPagePO.getAppInstanceId()).toEqual(appInstanceId);
    // expect a different component instance id
    await expect(componentInstanceIds.add(await testeeViewPagePO.getComponentInstanceId()).size).toEqual(3);

    // navigate to the testee-2 view
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee-2'});
    await routerPagePO.enterSelfViewId(testeeViewId);
    await routerPagePO.selectTarget('self');
    await routerPagePO.clickNavigate();
    await testeeViewPagePO.view.viewTab.click();

    // expect the correct view to display
    await expect(await testeeViewPagePO.getViewParams()).toEqual(expect.objectContaining({component: 'testee-2 [string]'}));
    // expect no new view instance to be constructed
    await expect(await testeeViewPagePO.getAppInstanceId()).toEqual(appInstanceId);
    // expect a different component instance id
    await expect(componentInstanceIds.add(await testeeViewPagePO.getComponentInstanceId()).size).toEqual(4);
  });

  test('should open microfrontend with empty path', async ({page, appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    const testeeViewTabPO = appPO.view({cssClass: 'testee'}).viewTab;

    // register testee view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee', path: 'empty'},
      properties: {
        path: '<empty>',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate to the view with `empty` as path
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee', path: 'empty'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // expect the view to be present
    await expect(await testeeViewTabPO.isPresent()).toBe(true);
    await expect(await testeeViewTabPO.isActive()).toBe(true);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(3);
    await expect(await consoleLogs.get({severity: 'error', filter: /ViewProviderError|ViewError/, consume: true})).toEqual([]);

    await expect(page.locator('app-root')).toBeVisible();
  });

  test('should not open views if missing the view provider', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    const testeeViewTabPO = appPO.view({cssClass: 'testee'}).viewTab;

    // register testee view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate to the view
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // expect the view to be present
    const testeeViewPagePO = new ViewPagePO(appPO, await testeeViewTabPO.getViewId());
    await testeeViewPagePO.waitUntilAttached();
    await expect(await testeeViewTabPO.isActive()).toBe(true);
    await expect(await testeeViewPagePO.isVisible()).toBe(true);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(3);

    // reload the app; after the reload, the view is not registered anymore, as registered dynamically at runtime
    await appPO.reload();

    // expect the view not to be present
    await expect(await testeeViewTabPO.isPresent()).toBe(false);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);
    await expect(await consoleLogs.get({severity: 'warning', filter: /NullViewError/})).not.toEqual([]);
  });

  test('should open views as contained in the URL on initial navigation', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // open 2 views
    const viewPage1PO = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewPage2PO = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app2');

    // reload the app
    await appPO.reload();
    await waitUntilAttached(viewPage1PO.locator, viewPage2PO.locator);

    // expect the views to be present
    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);
    await expect(await viewPage1PO.view.viewTab.isActive()).toBe(false);
    await expect(await viewPage1PO.isPresent()).toBe(true);
    await expect(await viewPage1PO.isVisible()).toBe(false);
    await expect(await viewPage2PO.view.viewTab.isActive()).toBe(true);
    await expect(await viewPage2PO.isVisible()).toBe(true);
  });

  test('should load microfrontends of inactive views on initial navigation', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // navigate to the view
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    await routerPagePO.enterQualifier({component: 'view', app: 'app1'});
    await routerPagePO.enterParams({initialTitle: 'INITIAL TITLE 1'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();
    const viewPage1PO = new ViewPagePO(appPO, await appPO.activePart.activeView.getViewId());

    // navigate to the view
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'view', app: 'app1'});
    await routerPagePO.enterParams({initialTitle: 'INITIAL TITLE 2'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();
    const viewPage2PO = new ViewPagePO(appPO, await appPO.activePart.activeView.getViewId());

    // reload the app
    await appPO.reload();
    await waitUntilAttached(viewPage1PO.locator, viewPage2PO.locator);

    // expect views to be present
    await expect(await appPO.activePart.getViewIds()).toHaveLength(3);
    await expect(await viewPage1PO.view.viewTab.isActive()).toBe(false);
    await expect(await viewPage1PO.isPresent()).toBe(true);
    await expect(await viewPage1PO.isVisible()).toBe(false);
    await expect(await viewPage2PO.view.viewTab.isActive()).toBe(true);
    await expect(await viewPage2PO.isVisible()).toBe(true);

    // expect view microfrontends to have set their initial title
    await expect(await viewPage1PO.view.viewTab.getTitle()).toEqual('INITIAL TITLE 1');
    await expect(await viewPage2PO.view.viewTab.getTitle()).toEqual('INITIAL TITLE 2');
  });

  test('should set view properties upon initial view tab navigation', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'VIEW TITLE',
        heading: 'VIEW HEADING',
        cssClass: ['testee', 'class-1', 'class-2'],
      },
    });

    // navigate to the testee view
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // expect view properties to be set
    const testeeViewTabPO = appPO.view({cssClass: 'testee'}).viewTab;
    await expect(await testeeViewTabPO.getTitle()).toEqual('VIEW TITLE');
    await expect(await testeeViewTabPO.getHeading()).toEqual('VIEW HEADING');
    await expect(await testeeViewTabPO.getCssClasses()).toEqual(expect.arrayContaining(['testee', 'class-1', 'class-2']));
  });

  test('should set view properties upon initial view tab navigation when replacing an existing workbench view', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'VIEW TITLE',
        heading: 'VIEW HEADING',
        cssClass: ['testee', 'class-1', 'class-2'],
      },
    });

    // open workbench view
    const viewPagePO = await workbenchNavigator.openInNewTab(WorkbenchViewPagePO);
    await viewPagePO.enterTitle('WORKBENCH VIEW TITLE');
    await expect(await viewPagePO.viewTabPO.getTitle()).toEqual('WORKBENCH VIEW TITLE');

    // navigate to the testee view
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('self');
    await routerPagePO.enterSelfViewId(viewPagePO.viewId);
    await routerPagePO.clickNavigate();

    // expect view properties to be set
    const testeeViewTabPO = appPO.view({cssClass: 'testee'}).viewTab;
    await expect(await testeeViewTabPO.getTitle()).toEqual('VIEW TITLE');
    await expect(await testeeViewTabPO.getHeading()).toEqual('VIEW HEADING');
    await expect(await testeeViewTabPO.getCssClasses()).toEqual(expect.arrayContaining(['testee', 'class-1', 'class-2']));
  });

  test('should set view properties when navigating in the current view tab', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee-1 view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-view',
        title: 'VIEW TITLE 1',
        heading: 'VIEW HEADING 1',
        closable: true,
        cssClass: ['testee-1', 'class-1'],
      },
    });

    // register testee-2 view
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-view',
        title: 'VIEW TITLE 2',
        heading: 'VIEW HEADING 2',
        closable: false,
        cssClass: ['testee-2', 'class-2'],
      },
    });

    // navigate to the testee-1 view
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee-1'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    const testeeViewId = await appPO.view({cssClass: 'testee-1'}).getViewId();
    const testeeViewPO = appPO.view({viewId: testeeViewId});

    // expect view properties to be set
    await expect(await testeeViewPO.viewTab.getTitle()).toEqual('VIEW TITLE 1');
    await expect(await testeeViewPO.viewTab.getHeading()).toEqual('VIEW HEADING 1');
    await expect(await testeeViewPO.viewTab.getCssClasses()).toEqual(expect.arrayContaining(['testee-1', 'class-1']));
    await expect(await testeeViewPO.viewTab.isClosable()).toBe(true);

    // navigate to the testee-2 view
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee-2'});
    await routerPagePO.selectTarget('self');
    await routerPagePO.enterSelfViewId(testeeViewId);
    await routerPagePO.clickNavigate();

    // expect view properties to be set
    await testeeViewPO.viewTab.click();
    await expect(await testeeViewPO.viewTab.getTitle()).toEqual('VIEW TITLE 2');
    await expect(await testeeViewPO.viewTab.getHeading()).toEqual('VIEW HEADING 2');
    await expect(await testeeViewPO.viewTab.getCssClasses()).toEqual(expect.arrayContaining(['testee-2', 'class-2']));
    await expect(await testeeViewPO.viewTab.isClosable()).toBe(false);
  });

  test('should not set view properties when performing self navigation, e.g., when updating view params', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee-1 view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {name: 'param1', required: false},
      ],
      properties: {
        path: 'test-view',
        title: 'VIEW TITLE',
        heading: 'VIEW HEADING',
        cssClass: ['testee', 'class-1'],
      },
    });

    // navigate to the testee view
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    const testeeViewPO = await appPO.view({cssClass: 'testee'});
    const testeeViewTabPO = testeeViewPO.viewTab;
    const testeeViewId = await testeeViewPO.getViewId();
    const viewPagePO = new ViewPagePO(appPO, testeeViewId);

    // expect view properties to be set
    await expect(await testeeViewTabPO.getTitle()).toEqual('VIEW TITLE');
    await expect(await testeeViewTabPO.getHeading()).toEqual('VIEW HEADING');
    await expect(await testeeViewTabPO.getCssClasses()).toEqual(expect.arrayContaining(['testee', 'class-1']));

    // update view properties
    await viewPagePO.enterTitle('UPDATED VIEW TITLE');
    await viewPagePO.enterHeading('UPDATED VIEW HEADING');

    // perform self navigation by setting view params
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('self');
    await routerPagePO.enterSelfViewId(testeeViewId);
    await routerPagePO.enterParams({param1: 'PARAM 1'});
    await routerPagePO.clickNavigate();

    // expect view properties not be updated
    await testeeViewTabPO.click();
    await expect(await testeeViewTabPO.getTitle()).toEqual('UPDATED VIEW TITLE');
    await expect(await testeeViewTabPO.getHeading()).toEqual('UPDATED VIEW HEADING');
    await expect(await testeeViewTabPO.getCssClasses()).toEqual(expect.arrayContaining(['testee', 'class-1']));
    await expect(await viewPagePO.getViewParams()).toEqual(expect.objectContaining({param1: 'PARAM 1 [string]'}));
  });

  test('should not unset the dirty state when performing self navigation, e.g., when updating view params', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {name: 'param1', required: false},
      ],
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate to the testee view
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    const testeeViewPO = appPO.view({cssClass: 'testee'});
    const testeeViewTabPO = testeeViewPO.viewTab;
    const testeeViewId = await testeeViewPO.getViewId();
    const viewPagePO = new ViewPagePO(appPO, testeeViewId);

    // mark the view dirty
    await viewPagePO.markDirty();

    // perform self navigation by setting view params
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('self');
    await routerPagePO.enterSelfViewId(testeeViewId);
    await routerPagePO.enterParams({param1: 'PARAM 1'});
    await routerPagePO.clickNavigate();

    // expect the view to still be dirty
    await testeeViewTabPO.click();
    await expect(await testeeViewTabPO.isDirty()).toBe(true);
  });

  test('should make the view pristine when navigating to another view in the current view tab', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee-1 view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-view',
        title: 'testee-1',
        cssClass: 'testee-1',
      },
    });

    // register testee-2 view
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-view',
        title: 'testee-2',
        cssClass: 'testee-2',
      },
    });

    // navigate to the testee-1 view
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee-1'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    const testeeViewId = await appPO.view({cssClass: 'testee-1'}).getViewId();
    const testeeViewPO = appPO.view({viewId: testeeViewId});
    const viewPagePO = new ViewPagePO(appPO, testeeViewId);

    // mark the view dirty
    await viewPagePO.markDirty();
    await expect(await testeeViewPO.viewTab.isDirty()).toBe(true);

    // navigate to another view in the testee view tab
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee-2'});
    await routerPagePO.selectTarget('self');
    await routerPagePO.enterSelfViewId(testeeViewId);
    await routerPagePO.clickNavigate();

    // expect the view to be pristine
    await testeeViewPO.viewTab.click();
    await expect(await testeeViewPO.viewTab.isDirty()).toBe(false);
  });

  test('should close the view when removing the capability', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    const testeeViewTabPO = appPO.view({cssClass: 'testee'}).viewTab;

    // register testee view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const capabilityId = (await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    })).metadata!.id;
    await registerCapabilityPagePO.viewTabPO.close();

    // navigate to the view
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // expect the view to be present
    const testeeViewPagePO = new ViewPagePO(appPO, await testeeViewTabPO.getViewId());
    await testeeViewPagePO.waitUntilAttached();
    await expect(await testeeViewTabPO.isActive()).toBe(true);
    await expect(await testeeViewPagePO.isVisible()).toBe(true);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);

    // unregister the capability
    const unregisterCapabilityPagePO = await microfrontendNavigator.openInNewTab(UnregisterWorkbenchCapabilityPagePO, 'app1');
    await unregisterCapabilityPagePO.unregisterCapability(capabilityId);
    await unregisterCapabilityPagePO.viewTabPO.close();

    // expect the view not to be present
    await expect(await testeeViewTabPO.isPresent()).toBe(false);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await appPO.activePart.getViewIds()).toHaveLength(1);
    await expect(await consoleLogs.get({severity: 'warning', filter: /NullViewError/})).not.toEqual([]);
  });

  test('should allow closing a single view', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });
    await registerCapabilityPagePO.viewTabPO.close();

    // navigate to the view
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // expect the view to be present
    await expect(await appPO.activePart.getViewIds()).toHaveLength(2);

    // close the view via router
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.checkCloseIfPresent(true);
    await routerPagePO.clickNavigate();

    // expect the view to be closed
    await expect(await appPO.activePart.getViewIds()).toHaveLength(1);
  });

  test('should allow closing all views of the same qualifier', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });
    await registerCapabilityPagePO.viewTabPO.close();

    // navigate to the view
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // navigate to the view
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // expect the view to be present
    await expect(await appPO.activePart.getViewIds()).toHaveLength(3);

    // close the view via router
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.checkCloseIfPresent(true);
    await routerPagePO.clickNavigate();

    // expect the view to be closed
    await expect(await appPO.activePart.getViewIds()).toHaveLength(1);
  });

  /**
   * When having loaded microfrontend 1 of an app, and when then navigating to microfrontend 2 of that app, and when then self-navigating
   * in microfrontend-2 upon its construction, the router should not navigate back to microfrontend 1.
   */
  test('should not navigate back to the previous microfrontend when self-navigating upon microfrontend construction', async ({appPO, microfrontendNavigator}) => {
    test.slow(); // increase timeout because this test simulates slow capability lookup
    await appPO.navigateTo({microfrontendSupport: true, simulateSlowCapabilityLookup: true});

    // register microfrontend-1 view
    const registerCapabilityApp1PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityApp1PO.registerCapability({
      type: 'view',
      qualifier: {component: 'microfrontend-1'},
      properties: {
        path: 'test-view/view1',
        title: 'Microfrontend 1',
        cssClass: 'microfrontend-1',
      },
    });

    // register microfrontend-2 view
    await registerCapabilityApp1PO.registerCapability({
      type: 'view',
      qualifier: {component: 'microfrontend-2'},
      properties: {
        path: 'test-view/view2',
        title: 'Microfrontend 2',
        cssClass: 'microfrontend-2',
      },
    });

    // navigate to microfrontend-1 view
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    await routerPagePO.enterQualifier({component: 'microfrontend-1'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // Construct the PO to interact with the opened view
    const viewId = await appPO.activePart.activeView.getViewId();
    const viewTabPO = appPO.view({viewId}).viewTab;
    const viewPagePO = new ViewPagePO(appPO, viewId);

    // Assert the correct capability to be loaded
    await expect(await viewPagePO.getPath()).toEqual('/test-view/view1');

    // navigate to microfrontend-2 view
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'microfrontend-2'});
    await routerPagePO.enterSelfViewId(viewId);
    await routerPagePO.selectTarget('self');
    await routerPagePO.clickNavigate();

    // self-navigate in microfrontend-2 view
    await viewTabPO.click();
    await viewPagePO.navigateSelf({param: 'PARAM'});
    await expect(await viewPagePO.getPath()).toEqual('/test-view/view2');
  });

  test('should propagate navigation error back to caller if navigation fails', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view as public view in app 2
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // register view intention in app 1
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'view', qualifier: {component: 'testee'}});

    // navigate to the testee view in app 1
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    await routerPagePO.enterQualifier({view: 'testee'});  // invalid qualifier
    await routerPagePO.selectTarget('blank');
    await expect(routerPagePO.clickNavigate()).rejects.toThrow(/\[NotQualifiedError] Application 'workbench-client-testing-app1' is not qualified/);

    // expect testee view not to be opened
    const testeeViewPO = appPO.view({cssClass: 'testee'});
    await expect(await appPO.activePart.getViewIds()).toHaveLength(3);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await testeeViewPO.viewTab.isPresent()).toBe(false);
    await expect(await testeeViewPO.isPresent()).toBe(false);
  });

  test('should allow setting CSS class(es) via router', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    const activeViewPO = await appPO.activePart.activeView;

    await routerPagePO.enterQualifier({component: 'view', app: 'app1'});
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.clickNavigate();

    await expect(await activeViewPO.getCssClasses()).toEqual(expect.arrayContaining(['testee']));
    await expect(await activeViewPO.viewTab.getCssClasses()).toEqual(expect.arrayContaining(['testee']));
  });

  test('should allow setting view title via "wb.title" param (DEPRECATED: API will be removed in v16)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee microfrontend
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {name: 'wb.title', required: false},
      ],
      properties: {
        path: 'microfrontend',
        title: 'Capability Title',
        cssClass: 'testee',
      },
    });

    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({'wb.title': 'Param Title'}); // deprecated API
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    const testeeViewTab = appPO.view({cssClass: 'testee'}).viewTab;
    await expect(await testeeViewTab.getTitle()).toEqual('Param Title');
  });

  test('should allow setting view heading via "wb.heading" param (DEPRECATED: API will be removed in v16)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee microfrontend
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {name: 'wb.heading', required: false},
      ],
      properties: {
        path: 'microfrontend',
        heading: 'Capability Heading',
        cssClass: 'testee',
      },
    });

    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({'wb.heading': 'Param Heading'}); // deprecated API
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    const testeeViewTab = appPO.view({cssClass: 'testee'}).viewTab;
    await expect(await testeeViewTab.getHeading()).toEqual('Param Heading');
  });

  test('should substitute named parameter in title/heading property of view capability', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee microfrontend
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {name: 'title', required: false},
        {name: 'heading', required: false},
      ],
      properties: {
        path: 'microfrontend',
        title: ':title',
        heading: ':heading',
        cssClass: 'testee',
      },
    });

    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({title: 'Title Param', heading: 'Heading Param'});
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    const testeeViewTab = appPO.view({cssClass: 'testee'}).viewTab;
    await expect(await testeeViewTab.getTitle()).toEqual('Title Param');
    await expect(await testeeViewTab.getHeading()).toEqual('Heading Param');
  });

  test('should substitute multiple named parameters in title/heading property of view capability', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee microfrontend
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {name: 'param1', required: false},
        {name: 'param2', required: false},
      ],
      properties: {
        path: 'microfrontend',
        title: ':param1/:param2/:param3 [component=:component]',
        heading: ':param1 :param2 :param3 [component=:component]',
        cssClass: 'testee',
      },
    });

    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPageLegacyPO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({param1: 'value1', param2: 'value2'});
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    const testeeViewTab = appPO.view({cssClass: 'testee'}).viewTab;
    await expect(await testeeViewTab.getTitle()).toEqual('value1/value2/:param3 [component=testee]');
    await expect(await testeeViewTab.getHeading()).toEqual('value1 value2 :param3 [component=testee]');
  });
});
