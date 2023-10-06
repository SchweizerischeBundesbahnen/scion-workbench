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
import {RouterPagePO} from './page-object/router-page.po';

test.describe('Workbench Router', () => {

  test('should navigate to own public views', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
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
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    // expect testee view to be opened as new tab
    const testeeViewTab = appPO.view({cssClass: 'testee'}).viewTab;
    const testeeViewPage = new ViewPagePO(appPO, await testeeViewTab.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await testeeViewTab.isActive()).toBe(true);
    await expect(await testeeViewPage.view.isPresent()).toBe(true);
    await expect(await testeeViewPage.isVisible()).toBe(true);
  });

  test('should navigate to own private views', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
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
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    // expect testee view to be opened as new tab
    const testeeViewTab = appPO.view({cssClass: 'testee'}).viewTab;
    const testeeViewPage = new ViewPagePO(appPO, await testeeViewTab.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await testeeViewTab.isActive()).toBe(true);
    await expect(await testeeViewPage.view.isPresent()).toBe(true);
    await expect(await testeeViewPage.isVisible()).toBe(true);
  });

  test('should not navigate to private views of other apps', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view as private view in app 2
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPage.registerCapability({
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
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'view', qualifier: {component: 'testee'}});

    // navigate to the testee view in app 1
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget('blank');
    await expect(routerPage.clickNavigate()).rejects.toThrow(/NullProviderError/);

    // expect testee view not to be opened
    const testeeView = appPO.view({cssClass: 'testee'});
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await routerPage.viewTab.isActive()).toBe(true);
    await expect(await testeeView.viewTab.isPresent()).toBe(false);
    await expect(await testeeView.isPresent()).toBe(false);
  });

  test('should navigate to public views of other apps', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view as public view in app 2
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPage.registerCapability({
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
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'view', qualifier: {component: 'testee'}});

    // navigate to the testee view in app 1
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    // expect testee view not to be opened
    const testeeViewTab = appPO.view({cssClass: 'testee'}).viewTab;
    const testeeViewPage = new ViewPagePO(appPO, await testeeViewTab.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);
    await expect(await testeeViewTab.isActive()).toBe(true);
    await expect(await testeeViewPage.view.isPresent()).toBe(true);
    await expect(await testeeViewPage.isVisible()).toBe(true);
  });

  test('should not navigate to public views of other apps if missing the intention', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view as public view in app 2
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPage.registerCapability({
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
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget('blank');
    await expect(routerPage.clickNavigate()).rejects.toThrow(/NotQualifiedError/);

    // expect testee view not to be opened
    const testeeView = appPO.view({cssClass: 'testee'});
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
    await expect(await routerPage.viewTab.isActive()).toBe(true);
    await expect(await testeeView.viewTab.isPresent()).toBe(false);
    await expect(await testeeView.isPresent()).toBe(false);
  });

  test('should open a view in a new view tab [target=blank]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate to the testee view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    // expect testee view to be opened as new tab
    const testeeViewTab = appPO.view({cssClass: 'testee'}).viewTab;
    const testeeViewPage = new ViewPagePO(appPO, await testeeViewTab.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await testeeViewTab.isActive()).toBe(true);
    await expect(await testeeViewPage.view.isPresent()).toBe(true);
    await expect(await testeeViewPage.isVisible()).toBe(true);

    // activate router page
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    // expect testee view to be opened as new tab
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);
  });

  test('should open a view in the current view tab [target=viewId]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate to the testee view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget(routerPage.viewId);
    await routerPage.clickNavigate();

    // expect testee view to be opened in the current tab
    const testeeViewTab = appPO.view({cssClass: 'testee'}).viewTab;
    const testeeViewPage = new ViewPagePO(appPO, await testeeViewTab.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
    await expect(await testeeViewTab.isActive()).toBe(true);
    await expect(await testeeViewPage.view.isPresent()).toBe(true);
    await expect(await testeeViewPage.isVisible()).toBe(true);
    await expect(await routerPage.isVisible()).toBe(false);
    await expect(testeeViewPage.viewId).toEqual(routerPage.viewId);
  });

  test('should open a view in a new view tab if no matching view is found [target=auto]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {
          name: 'param',
          required: true,
        },
      ],
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });

    // navigate to the testee view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterTarget('auto');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterCssClass('testee-1');
    await routerPage.enterParams({param: 'value1'});
    await routerPage.clickNavigate();

    // expect testee-1 view to be opened in a new tab
    const testee1ViewTab = appPO.view({cssClass: 'testee-1'}).viewTab;
    const testee1ViewPage = new ViewPagePO(appPO, await testee1ViewTab.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await testee1ViewTab.isActive()).toBe(true);
    await expect(await testee1ViewPage.view.isPresent()).toBe(true);
    await expect(await testee1ViewPage.isVisible()).toBe(true);
    await expect(await routerPage.isVisible()).toBe(false);
    await expect(testee1ViewPage.viewId).not.toEqual(routerPage.viewId);

    // activate router page
    await routerPage.viewTab.click();
    await routerPage.enterTarget('auto');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterCssClass('testee-2');
    await routerPage.enterParams({param: 'value2'});
    await routerPage.clickNavigate();

    // expect testee-2 view to be opened in a new tab
    const testee2ViewTab = appPO.view({cssClass: 'testee-2'}).viewTab;
    const testee2ViewPage = new ViewPagePO(appPO, await testee2ViewTab.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);
    await expect(await testee2ViewTab.isActive()).toBe(true);
    await expect(await testee2ViewPage.view.isPresent()).toBe(true);
    await expect(await testee2ViewPage.isVisible()).toBe(true);
    await expect(await routerPage.isVisible()).toBe(false);
    await expect(testee2ViewPage.viewId).not.toEqual(routerPage.viewId);
    await expect(testee2ViewPage.viewId).not.toEqual(testee1ViewPage.viewId);
  });

  test('should navigate existing view(s) of the same qualifier and required parameters (qualifier matches single view) [target=auto]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {
          name: 'param',
          required: false,
        },
      ],
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate to the testee view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterTarget('auto');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({param: 'value1'});
    await routerPage.clickNavigate();

    // expect testee view to be opened in a new tab
    const testeeViewTab = appPO.view({cssClass: 'testee'}).viewTab;
    const testeeViewPage = new ViewPagePO(appPO, await testeeViewTab.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await testeeViewPage.getViewParams()).toEqual(expect.objectContaining({param: 'value1 [string]'}));
    await expect(await testeeViewTab.isActive()).toBe(true);

    // activate router page
    await routerPage.viewTab.click();
    await routerPage.enterParams({param: 'value2'});
    await routerPage.clickNavigate();

    // expect testee view to be updated and activated
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await testeeViewPage.getViewParams()).toEqual(expect.objectContaining({param: 'value2 [string]'}));
    await expect(await testeeViewTab.isActive()).toBe(true);
  });

  test('should navigate existing view(s) of the same qualifier and required parameters (qualifier matches multiple views) [target=auto]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {
          name: 'param',
          required: false,
        },
      ],
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });

    // navigate to the testee-1 view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterTarget('blank');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterCssClass('testee-1');
    await routerPage.enterParams({param: 'value1'});
    await routerPage.clickNavigate();

    // expect testee-1 view to be opened in a new tab
    const testee1ViewTab = appPO.view({cssClass: 'testee-1'}).viewTab;
    const testee1ViewPage = new ViewPagePO(appPO, await testee1ViewTab.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await testee1ViewPage.getViewParams()).toEqual(expect.objectContaining({param: 'value1 [string]'}));
    await expect(await testee1ViewTab.isActive()).toBe(true);

    // navigate to the testee-2 view
    await routerPage.viewTab.click();
    await routerPage.enterTarget('blank');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterCssClass('testee-2');
    await routerPage.enterParams({param: 'value2'});
    await routerPage.clickNavigate();

    // expect testee-2 view to be opened in a new tab
    const testee2ViewTab = appPO.view({cssClass: 'testee-2'}).viewTab;
    const testee2ViewPage = new ViewPagePO(appPO, await testee2ViewTab.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);
    await expect(await testee2ViewPage.getViewParams()).toEqual(expect.objectContaining({param: 'value2 [string]'}));
    await expect(await testee2ViewTab.isActive()).toBe(true);

    // update present testee views
    await routerPage.viewTab.click();
    await routerPage.enterTarget('auto');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({param: 'value3'});
    await routerPage.clickNavigate();

    // expect testee views to be updated
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);
    await testee1ViewTab.click();
    await expect(await testee1ViewPage.getViewParams()).toEqual(expect.objectContaining({param: 'value3 [string]'}));
    await testee2ViewTab.click();
    await expect(await testee2ViewPage.getViewParams()).toEqual(expect.objectContaining({param: 'value3 [string]'}));
  });

  test('should navigate existing view(s) of the same qualifier and required parameters (qualifier and required parameter match multiple views) [target=auto]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {
          name: 'optionalParam',
          required: false,
        },
        {
          name: 'requiredParam',
          required: true,
        },
      ],
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });

    // navigate to the testee-1 view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterTarget('blank');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterCssClass('testee-1');
    await routerPage.enterParams({optionalParam: 'value1', requiredParam: 'value1'});
    await routerPage.clickNavigate();

    // expect testee-1 view to be opened in a new tab
    const testee1ViewTab = appPO.view({cssClass: 'testee-1'}).viewTab;
    const testee1ViewPage = new ViewPagePO(appPO, await testee1ViewTab.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await testee1ViewPage.getViewParams()).toEqual(expect.objectContaining({optionalParam: 'value1 [string]', requiredParam: 'value1 [string]'}));
    await expect(await testee1ViewTab.isActive()).toBe(true);

    // navigate to the testee-2 view
    await routerPage.viewTab.click();
    await routerPage.enterTarget('blank');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterCssClass('testee-2');
    await routerPage.enterParams({optionalParam: 'value2', requiredParam: 'value1'});
    await routerPage.clickNavigate();

    // expect testee-2 view to be opened in a new tab
    const testee2ViewTab = appPO.view({cssClass: 'testee-2'}).viewTab;
    const testee2ViewPage = new ViewPagePO(appPO, await testee2ViewTab.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);
    await expect(await testee2ViewPage.getViewParams()).toEqual(expect.objectContaining({optionalParam: 'value2 [string]', requiredParam: 'value1 [string]'}));
    await expect(await testee2ViewTab.isActive()).toBe(true);

    // navigate to the testee-3 view
    await routerPage.viewTab.click();
    await routerPage.enterTarget('blank');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterCssClass('testee-3');
    await routerPage.enterParams({optionalParam: 'value3', requiredParam: 'value2'});
    await routerPage.clickNavigate();

    // expect testee-3 view to be opened in a new tab
    const testee3ViewTab = appPO.view({cssClass: 'testee-3'}).viewTab;
    const testee3ViewPage = new ViewPagePO(appPO, await testee3ViewTab.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(5);
    await expect(await testee3ViewPage.getViewParams()).toEqual(expect.objectContaining({optionalParam: 'value3 [string]', requiredParam: 'value2 [string]'}));
    await expect(await testee3ViewTab.isActive()).toBe(true);

    // update present testee views
    await routerPage.viewTab.click();
    await routerPage.enterTarget('auto');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({optionalParam: 'value4', requiredParam: 'value1'});
    await routerPage.clickNavigate();

    // expect testee views to be updated
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(5);
    await testee1ViewTab.click();
    await expect(await testee1ViewPage.getViewParams()).toEqual(expect.objectContaining({optionalParam: 'value4 [string]', requiredParam: 'value1 [string]'}));
    await testee2ViewTab.click();
    await expect(await testee2ViewPage.getViewParams()).toEqual(expect.objectContaining({optionalParam: 'value4 [string]', requiredParam: 'value1 [string]'}));
    await testee3ViewTab.click();
    await expect(await testee3ViewPage.getViewParams()).toEqual(expect.objectContaining({optionalParam: 'value3 [string]', requiredParam: 'value2 [string]'}));
  });

  test('should, by default, open a new view if no matching view is found [target=`undefined`]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {
          name: 'param',
          required: true,
        },
      ],
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });

    // navigate to the testee view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterCssClass('testee-1');
    await routerPage.enterParams({param: 'value1'});
    await routerPage.clickNavigate();

    // expect testee-1 view to be opened in a new tab
    const testee1ViewTab = appPO.view({cssClass: 'testee-1'}).viewTab;
    const testee1ViewPage = new ViewPagePO(appPO, await testee1ViewTab.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await testee1ViewTab.isActive()).toBe(true);
    await expect(await testee1ViewPage.view.isPresent()).toBe(true);
    await expect(await testee1ViewPage.isVisible()).toBe(true);
    await expect(await routerPage.isVisible()).toBe(false);
    await expect(testee1ViewPage.viewId).not.toEqual(routerPage.viewId);

    // activate router page
    await routerPage.viewTab.click();
    await routerPage.enterCssClass('testee-2');
    await routerPage.enterParams({param: 'value2'});
    await routerPage.clickNavigate();

    // expect testee-2 view to be opened in a new tab
    const testee2ViewTab = appPO.view({cssClass: 'testee-2'}).viewTab;
    const testee2ViewPage = new ViewPagePO(appPO, await testee2ViewTab.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);
    await expect(await testee2ViewTab.isActive()).toBe(true);
    await expect(await testee2ViewPage.view.isPresent()).toBe(true);
    await expect(await testee2ViewPage.isVisible()).toBe(true);
    await expect(await routerPage.isVisible()).toBe(false);
    await expect(testee2ViewPage.viewId).not.toEqual(routerPage.viewId);
    await expect(testee2ViewPage.viewId).not.toEqual(testee1ViewPage.viewId);
  });

  test('should, by default, navigate existing view(s) of the same qualifier and required parameters (qualifier matches single view) [target=`undefined`]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {
          name: 'param',
          required: false,
        },
      ],
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate to the testee view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({param: 'value1'});
    await routerPage.clickNavigate();

    // expect testee view to be opened in a new tab
    const testeeViewTab = appPO.view({cssClass: 'testee'}).viewTab;
    const testeeViewPage = new ViewPagePO(appPO, await testeeViewTab.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await testeeViewPage.getViewParams()).toEqual(expect.objectContaining({param: 'value1 [string]'}));
    await expect(await testeeViewTab.isActive()).toBe(true);

    // activate router page
    await routerPage.viewTab.click();
    await routerPage.enterParams({param: 'value2'});
    await routerPage.clickNavigate();

    // expect testee view to be updated and activated
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await testeeViewPage.getViewParams()).toEqual(expect.objectContaining({param: 'value2 [string]'}));
    await expect(await testeeViewTab.isActive()).toBe(true);
  });

  test('should, by default, navigate existing view(s) of the same qualifier and required parameters (qualifier matches multiple views) [target=`undefined`]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {
          name: 'param',
          required: false,
        },
      ],
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });

    // navigate to the testee-1 view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterTarget('blank');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterCssClass('testee-1');
    await routerPage.enterParams({param: 'value1'});
    await routerPage.clickNavigate();

    // expect testee-1 view to be opened in a new tab
    const testee1ViewTab = appPO.view({cssClass: 'testee-1'}).viewTab;
    const testee1ViewPage = new ViewPagePO(appPO, await testee1ViewTab.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await testee1ViewPage.getViewParams()).toEqual(expect.objectContaining({param: 'value1 [string]'}));
    await expect(await testee1ViewTab.isActive()).toBe(true);

    // navigate to the testee-2 view
    await routerPage.viewTab.click();
    await routerPage.enterTarget('blank');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterCssClass('testee-2');
    await routerPage.enterParams({param: 'value2'});
    await routerPage.clickNavigate();

    // expect testee-2 view to be opened in a new tab
    const testee2ViewTab = appPO.view({cssClass: 'testee-2'}).viewTab;
    const testee2ViewPage = new ViewPagePO(appPO, await testee2ViewTab.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);
    await expect(await testee2ViewPage.getViewParams()).toEqual(expect.objectContaining({param: 'value2 [string]'}));
    await expect(await testee2ViewTab.isActive()).toBe(true);

    // update present testee views
    await routerPage.viewTab.click();
    await routerPage.enterTarget(undefined);
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({param: 'value3'});
    await routerPage.clickNavigate();

    // expect testee views to be updated
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);
    await testee1ViewTab.click();
    await expect(await testee1ViewPage.getViewParams()).toEqual(expect.objectContaining({param: 'value3 [string]'}));
    await testee2ViewTab.click();
    await expect(await testee2ViewPage.getViewParams()).toEqual(expect.objectContaining({param: 'value3 [string]'}));
  });

  test('should, by default, navigate existing view(s) of the same qualifier and required parameters (qualifier and required parameter match multiple views) [target=`undefined`]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {
          name: 'optionalParam',
          required: false,
        },
        {
          name: 'requiredParam',
          required: true,
        },
      ],
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });

    // navigate to the testee-1 view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterTarget('blank');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterCssClass('testee-1');
    await routerPage.enterParams({optionalParam: 'value1', requiredParam: 'value1'});
    await routerPage.clickNavigate();

    // expect testee-1 view to be opened in a new tab
    const testee1ViewTab = appPO.view({cssClass: 'testee-1'}).viewTab;
    const testee1ViewPage = new ViewPagePO(appPO, await testee1ViewTab.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await testee1ViewPage.getViewParams()).toEqual(expect.objectContaining({optionalParam: 'value1 [string]', requiredParam: 'value1 [string]'}));
    await expect(await testee1ViewTab.isActive()).toBe(true);

    // navigate to the testee-2 view
    await routerPage.viewTab.click();
    await routerPage.enterTarget('blank');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterCssClass('testee-2');
    await routerPage.enterParams({optionalParam: 'value2', requiredParam: 'value1'});
    await routerPage.clickNavigate();

    // expect testee-2 view to be opened in a new tab
    const testee2ViewTab = appPO.view({cssClass: 'testee-2'}).viewTab;
    const testee2ViewPage = new ViewPagePO(appPO, await testee2ViewTab.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);
    await expect(await testee2ViewPage.getViewParams()).toEqual(expect.objectContaining({optionalParam: 'value2 [string]', requiredParam: 'value1 [string]'}));
    await expect(await testee2ViewTab.isActive()).toBe(true);

    // navigate to the testee-3 view
    await routerPage.viewTab.click();
    await routerPage.enterTarget('blank');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterCssClass('testee-3');
    await routerPage.enterParams({optionalParam: 'value3', requiredParam: 'value2'});
    await routerPage.clickNavigate();

    // expect testee-3 view to be opened in a new tab
    const testee3ViewTab = appPO.view({cssClass: 'testee-3'}).viewTab;
    const testee3ViewPage = new ViewPagePO(appPO, await testee3ViewTab.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(5);
    await expect(await testee3ViewPage.getViewParams()).toEqual(expect.objectContaining({optionalParam: 'value3 [string]', requiredParam: 'value2 [string]'}));
    await expect(await testee3ViewTab.isActive()).toBe(true);

    // update present testee views
    await routerPage.viewTab.click();
    await routerPage.enterTarget(undefined);
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({optionalParam: 'value4', requiredParam: 'value1'});
    await routerPage.clickNavigate();

    // expect testee views to be updated
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(5);
    await testee1ViewTab.click();
    await expect(await testee1ViewPage.getViewParams()).toEqual(expect.objectContaining({optionalParam: 'value4 [string]', requiredParam: 'value1 [string]'}));
    await testee2ViewTab.click();
    await expect(await testee2ViewPage.getViewParams()).toEqual(expect.objectContaining({optionalParam: 'value4 [string]', requiredParam: 'value1 [string]'}));
    await testee3ViewTab.click();
    await expect(await testee3ViewPage.getViewParams()).toEqual(expect.objectContaining({optionalParam: 'value3 [string]', requiredParam: 'value2 [string]'}));
  });

  test('should open all views matching the qualifier', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view in app-1
    const registerCapabilityPage1 = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage1.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      private: false,
      properties: {
        path: 'test-view',
        title: 'testee 2',
        cssClass: 'testee-1',
      },
    });

    // register testee view in app-2
    const registerCapabilityPage2 = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPage2.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      private: false,
      properties: {
        path: 'test-view',
        title: 'testee 1',
        cssClass: 'testee-2',
      },
    });

    // register view intention in app 1
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'view', qualifier: {component: 'testee'}});

    // navigate to the testee view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    // expect testee view to be opened as new tab
    const testeeViewTab1 = appPO.view({cssClass: 'testee-1'}).viewTab;
    const testeeViewTab2 = appPO.view({cssClass: 'testee-2'}).viewTab;
    const testeeViewPage1 = new ViewPagePO(appPO, await testeeViewTab1.getViewId());
    const testeeViewPage2 = new ViewPagePO(appPO, await testeeViewTab2.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(6);
    await expect(await testeeViewTab1.isPresent()).toBe(true);
    await expect(await testeeViewTab2.isPresent()).toBe(true);
    await expect(await testeeViewTab1.isActive() || await testeeViewTab2.isActive()).toBe(true);
    await expect(await testeeViewPage1.view.isPresent() || await testeeViewPage2.view.isPresent()).toBe(true);
    await expect(await testeeViewPage1.view.isPresent()).not.toEqual(await testeeViewPage2.view.isPresent());
    await expect(await testeeViewPage1.isVisible() || await testeeViewPage2.isVisible()).toBe(true);
    await expect(await testeeViewPage1.isVisible()).not.toEqual(await testeeViewPage2.isVisible());
  });

  test('should reuse the same app instance when navigating between views of an app in the same view tab', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee-1 view
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

    // register testee-2 view
    const registerCapabilityPage2 = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage2.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-pages/view-test-page/view2',
        title: 'Testee 2',
        cssClass: 'testee-2',
      },
    });

    // navigate to testee-1 view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee-1'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    const testeeViewTab = appPO.view({cssClass: 'testee-1'}).viewTab;
    const testeeViewId = await testeeViewTab.getViewId();

    const componentInstanceIds = new Set<string>();

    // capture the app instance id
    const testeeViewPage = new ViewPagePO(appPO, testeeViewId);
    const appInstanceId = await testeeViewPage.getAppInstanceId();
    await componentInstanceIds.add(await testeeViewPage.getComponentInstanceId());

    // navigate to the testee-2 view
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee-2'});
    await routerPage.enterTarget(testeeViewId);
    await routerPage.clickNavigate();
    await testeeViewPage.view.viewTab.click();

    // expect the correct view to display
    await expect(await testeeViewPage.getViewParams()).toEqual(expect.objectContaining({component: 'testee-2 [string]'}));
    // expect no new view instance to be constructed
    await expect(await testeeViewPage.getAppInstanceId()).toEqual(appInstanceId);
    // expect a different component instance id
    await expect(componentInstanceIds.add(await testeeViewPage.getComponentInstanceId()).size).toEqual(2);

    // navigate to the testee-1 view
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee-1'});
    await routerPage.enterTarget(testeeViewId);
    await routerPage.clickNavigate();
    await testeeViewPage.view.viewTab.click();

    // expect the correct view to display
    await expect(await testeeViewPage.getViewParams()).toEqual(expect.objectContaining({component: 'testee-1 [string]'}));
    // expect no new view instance to be constructed
    await expect(await testeeViewPage.getAppInstanceId()).toEqual(appInstanceId);
    // expect a different component instance id
    await expect(componentInstanceIds.add(await testeeViewPage.getComponentInstanceId()).size).toEqual(3);

    // navigate to the testee-2 view
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee-2'});
    await routerPage.enterTarget(testeeViewId);
    await routerPage.clickNavigate();
    await testeeViewPage.view.viewTab.click();

    // expect the correct view to display
    await expect(await testeeViewPage.getViewParams()).toEqual(expect.objectContaining({component: 'testee-2 [string]'}));
    // expect no new view instance to be constructed
    await expect(await testeeViewPage.getAppInstanceId()).toEqual(appInstanceId);
    // expect a different component instance id
    await expect(componentInstanceIds.add(await testeeViewPage.getComponentInstanceId()).size).toEqual(4);
  });

  test('should open microfrontend with empty path', async ({page, appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    const testeeViewTab = appPO.view({cssClass: 'testee'}).viewTab;

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee', path: 'empty'},
      properties: {
        path: '<empty>',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate to the view with `empty` as path
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee', path: 'empty'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    // expect the view to be present
    await expect(await testeeViewTab.isPresent()).toBe(true);
    await expect(await testeeViewTab.isActive()).toBe(true);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await consoleLogs.get({severity: 'error', filter: /ViewProviderError|ViewError/, consume: true})).toEqual([]);

    await expect(page.locator('app-root')).toBeVisible();
  });

  test('should not open views if missing the view provider', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    const testeeViewTab = appPO.view({cssClass: 'testee'}).viewTab;

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate to the view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    // expect the view to be present
    const testeeViewPage = new ViewPagePO(appPO, await testeeViewTab.getViewId());
    await testeeViewPage.waitUntilAttached();
    await expect(await testeeViewTab.isActive()).toBe(true);
    await expect(await testeeViewPage.isVisible()).toBe(true);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);

    // reload the app; after the reload, the view is not registered anymore, as registered dynamically at runtime
    await appPO.reload();

    // expect the view not to be present
    await expect(await testeeViewTab.isPresent()).toBe(false);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
    await expect(await consoleLogs.get({severity: 'warning', filter: /NullViewError/})).not.toEqual([]);
  });

  test('should open views as contained in the URL on initial navigation', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // open 2 views
    const viewPage1 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewPage2 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app2');

    // reload the app
    await appPO.reload();
    await waitUntilAttached(viewPage1.locator, viewPage2.locator);

    // expect the views to be present
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
    await expect(await viewPage1.view.viewTab.isActive()).toBe(false);
    await expect(await viewPage1.isPresent()).toBe(true);
    await expect(await viewPage1.isVisible()).toBe(false);
    await expect(await viewPage2.view.viewTab.isActive()).toBe(true);
    await expect(await viewPage2.isVisible()).toBe(true);
  });

  test('should load microfrontends of inactive views on initial navigation', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // navigate to the view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'view', app: 'app1'});
    await routerPage.enterParams({initialTitle: 'INITIAL TITLE 1'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();
    const viewPage1 = new ViewPagePO(appPO, await appPO.activePart({inMainArea: true}).activeView.getViewId());

    // navigate to the view
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'view', app: 'app1'});
    await routerPage.enterParams({initialTitle: 'INITIAL TITLE 2'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();
    const viewPage2 = new ViewPagePO(appPO, await appPO.activePart({inMainArea: true}).activeView.getViewId());

    // reload the app
    await appPO.reload();
    await waitUntilAttached(viewPage1.locator, viewPage2.locator);

    // expect views to be present
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await viewPage1.view.viewTab.isActive()).toBe(false);
    await expect(await viewPage1.isPresent()).toBe(true);
    await expect(await viewPage1.isVisible()).toBe(false);
    await expect(await viewPage2.view.viewTab.isActive()).toBe(true);
    await expect(await viewPage2.isVisible()).toBe(true);

    // expect view microfrontends to have set their initial title
    await expect(await viewPage1.view.viewTab.getTitle()).toEqual('INITIAL TITLE 1');
    await expect(await viewPage2.view.viewTab.getTitle()).toEqual('INITIAL TITLE 2');
  });

  test('should set view properties upon initial view tab navigation', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
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
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    // expect view properties to be set
    const testeeViewTab = appPO.view({cssClass: 'testee'}).viewTab;
    await expect(await testeeViewTab.getTitle()).toEqual('VIEW TITLE');
    await expect(await testeeViewTab.getHeading()).toEqual('VIEW HEADING');
    await expect(await testeeViewTab.getCssClasses()).toEqual(expect.arrayContaining(['testee', 'class-1', 'class-2']));
  });

  test('should set view properties upon initial view tab navigation when replacing an existing workbench view', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
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
    const viewPage = await workbenchNavigator.openInNewTab(WorkbenchViewPagePO);
    await viewPage.enterTitle('WORKBENCH VIEW TITLE');
    await expect(await viewPage.viewTab.getTitle()).toEqual('WORKBENCH VIEW TITLE');

    // navigate to the testee view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget(viewPage.viewId);
    await routerPage.clickNavigate();

    // expect view properties to be set
    const testeeViewTab = appPO.view({cssClass: 'testee'}).viewTab;
    await expect(await testeeViewTab.getTitle()).toEqual('VIEW TITLE');
    await expect(await testeeViewTab.getHeading()).toEqual('VIEW HEADING');
    await expect(await testeeViewTab.getCssClasses()).toEqual(expect.arrayContaining(['testee', 'class-1', 'class-2']));
  });

  test('should set view properties when navigating in the current view tab', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

    // register testee-1 view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
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
    await registerCapabilityPage.registerCapability({
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
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee-1'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    const testeeViewId = await appPO.view({cssClass: 'testee-1'}).getViewId();
    const testeeView = appPO.view({viewId: testeeViewId});

    // expect view properties to be set
    await expect(await testeeView.viewTab.getTitle()).toEqual('VIEW TITLE 1');
    await expect(await testeeView.viewTab.getHeading()).toEqual('VIEW HEADING 1');
    await expect(await testeeView.viewTab.getCssClasses()).toEqual(expect.arrayContaining(['testee-1', 'class-1']));
    await expect(await testeeView.viewTab.isClosable()).toBe(true);

    // navigate to the testee-2 view
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee-2'});
    await routerPage.enterTarget(testeeViewId);
    await routerPage.clickNavigate();

    // expect view properties to be set
    await testeeView.viewTab.click();
    await expect(await testeeView.viewTab.getTitle()).toEqual('VIEW TITLE 2');
    await expect(await testeeView.viewTab.getHeading()).toEqual('VIEW HEADING 2');
    await expect(await testeeView.viewTab.getCssClasses()).toEqual(expect.arrayContaining(['testee-2', 'class-2']));
    await expect(await testeeView.viewTab.isClosable()).toBe(false);
  });

  test('should not set view properties when performing self navigation, e.g., when updating view params', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

    // register testee-1 view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
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
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    const testeeView = await appPO.view({cssClass: 'testee'});
    const testeeViewTab = testeeView.viewTab;
    const testeeViewId = await testeeView.getViewId();
    const viewPage = new ViewPagePO(appPO, testeeViewId);

    // expect view properties to be set
    await expect(await testeeViewTab.getTitle()).toEqual('VIEW TITLE');
    await expect(await testeeViewTab.getHeading()).toEqual('VIEW HEADING');
    await expect(await testeeViewTab.getCssClasses()).toEqual(expect.arrayContaining(['testee', 'class-1']));

    // update view properties
    await viewPage.enterTitle('UPDATED VIEW TITLE');
    await viewPage.enterHeading('UPDATED VIEW HEADING');

    // perform self navigation by setting view params
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget(testeeViewId);
    await routerPage.enterParams({param1: 'PARAM 1'});
    await routerPage.clickNavigate();

    // expect view properties not be updated
    await testeeViewTab.click();
    await expect(await testeeViewTab.getTitle()).toEqual('UPDATED VIEW TITLE');
    await expect(await testeeViewTab.getHeading()).toEqual('UPDATED VIEW HEADING');
    await expect(await testeeViewTab.getCssClasses()).toEqual(expect.arrayContaining(['testee', 'class-1']));
    await expect(await viewPage.getViewParams()).toEqual(expect.objectContaining({param1: 'PARAM 1 [string]'}));
  });

  test('should not unset the dirty state when performing self navigation, e.g., when updating view params', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
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
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    const testeeView = appPO.view({cssClass: 'testee'});
    const testeeViewTab = testeeView.viewTab;
    const testeeViewId = await testeeView.getViewId();
    const viewPage = new ViewPagePO(appPO, testeeViewId);

    // mark the view dirty
    await viewPage.markDirty();

    // perform self navigation by setting view params
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget(testeeViewId);
    await routerPage.enterParams({param1: 'PARAM 1'});
    await routerPage.clickNavigate();

    // expect the view to still be dirty
    await testeeViewTab.click();
    await expect(await testeeViewTab.isDirty()).toBe(true);
  });

  test('should make the view pristine when navigating to another view in the current view tab', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee-1 view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-view',
        title: 'testee-1',
        cssClass: 'testee-1',
      },
    });

    // register testee-2 view
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-view',
        title: 'testee-2',
        cssClass: 'testee-2',
      },
    });

    // navigate to the testee-1 view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee-1'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    const testeeViewId = await appPO.view({cssClass: 'testee-1'}).getViewId();
    const testeeView = appPO.view({viewId: testeeViewId});
    const viewPage = new ViewPagePO(appPO, testeeViewId);

    // mark the view dirty
    await viewPage.markDirty();
    await expect(await testeeView.viewTab.isDirty()).toBe(true);

    // navigate to another view in the testee view tab
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee-2'});
    await routerPage.enterTarget(testeeViewId);
    await routerPage.clickNavigate();

    // expect the view to be pristine
    await testeeView.viewTab.click();
    await expect(await testeeView.viewTab.isDirty()).toBe(false);
  });

  test('should close the view when removing the capability', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    const testeeViewTab = appPO.view({cssClass: 'testee'}).viewTab;

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    const capabilityId = (await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    })).metadata!.id;
    await registerCapabilityPage.viewTab.close();

    // navigate to the view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    // expect the view to be present
    const testeeViewPage = new ViewPagePO(appPO, await testeeViewTab.getViewId());
    await testeeViewPage.waitUntilAttached();
    await expect(await testeeViewTab.isActive()).toBe(true);
    await expect(await testeeViewPage.isVisible()).toBe(true);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);

    // unregister the capability
    const unregisterCapabilityPage = await microfrontendNavigator.openInNewTab(UnregisterWorkbenchCapabilityPagePO, 'app1');
    await unregisterCapabilityPage.unregisterCapability(capabilityId);
    await unregisterCapabilityPage.viewTab.close();

    // expect the view not to be present
    await expect(await testeeViewTab.isPresent()).toBe(false);
    await expect(await routerPage.viewTab.isActive()).toBe(true);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(1);
    await expect(await consoleLogs.get({severity: 'warning', filter: /NullViewError/})).not.toEqual([]);
  });

  test('should allow closing a single view by qualifier', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });
    await registerCapabilityPage.viewTab.close();

    // navigate to the view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    // expect the view to be present
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);

    // close the view via router
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget(undefined);
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

    // expect the view to be closed
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(1);
  });

  test('should reject closing a single view by viewId', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });
    await registerCapabilityPage.viewTab.close();

    // navigate to the view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();
    const testeeViewId = await appPO.view({cssClass: 'testee'}).getViewId();

    // expect the views to be present
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);

    // close the view by viewId via router
    await routerPage.viewTab.click();
    await routerPage.enterTarget(testeeViewId);
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.checkClose(true);

    // expect closing to be rejected
    await expect(routerPage.clickNavigate()).rejects.toThrow(/\[WorkbenchRouterError]\[IllegalArgumentError]/);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
  });

  test('should allow closing all views of the same qualifier', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view in app 1
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee-1',
      },
    });
    await registerCapabilityPage.viewTab.close();

    // register testee view in app 2
    const registerCapability2Page = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapability2Page.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      private: false,
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee-2',
      },
    });
    await registerCapability2Page.viewTab.close();

    // register view intention in app 1
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'view', qualifier: {component: 'testee'}});
    await registerIntentionPage.viewTab.close();

    // navigate to the view from within app 1 (two views are opened)
    const routerPage1 = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage1.enterQualifier({component: 'testee'});
    await routerPage1.enterTarget('blank');
    await routerPage1.clickNavigate();

    // navigate to the view from within app 1 (two views are opened)
    await routerPage1.viewTab.click();
    await routerPage1.enterQualifier({component: 'testee'});
    await routerPage1.enterTarget('blank');
    await routerPage1.clickNavigate();

    // navigate to the view from within app 2 (one view is opened)
    const routerPage2 = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app2');
    await routerPage2.enterQualifier({component: 'testee'});
    await routerPage2.enterTarget('blank');
    await routerPage2.clickNavigate();
    await routerPage2.viewTab.close();

    // expect the views to be present
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(6);

    // close the views via router
    await routerPage1.viewTab.click();
    await routerPage1.enterTarget(undefined);
    await routerPage1.enterQualifier({component: 'testee'});
    await routerPage1.checkClose(true);
    await routerPage1.clickNavigate({probeInterval: 250}); // Closing multiple views simultaneously can result in longer navigation times.

    // expect the views to be closed
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(1);
  });

  test('should not close private views of other apps', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view in app 1
    const registerCapability1Page = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapability1Page.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });
    await registerCapability1Page.viewTab.close();

    // register testee view in app 2
    const registerCapability2Page = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapability2Page.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      private: true, // PRIVATE
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });
    await registerCapability2Page.viewTab.close();

    // register view intention in app 1
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'view', qualifier: {component: 'testee'}});
    await registerIntentionPage.viewTab.close();

    // navigate to the view 1 of app 1
    const routerPage1 = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage1.enterQualifier({component: 'testee'});
    await routerPage1.enterTarget('blank');
    await routerPage1.enterCssClass('testee-1');
    await routerPage1.clickNavigate();

    // navigate to the view 2 of app 1
    await routerPage1.viewTab.click();
    await routerPage1.enterQualifier({component: 'testee'});
    await routerPage1.enterTarget('blank');
    await routerPage1.enterCssClass('testee-2');
    await routerPage1.clickNavigate();

    // navigate to the view of app 2
    const routerPage2 = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app2');
    await routerPage2.enterQualifier({component: 'testee'});
    await routerPage2.enterTarget('blank');
    await routerPage2.enterCssClass('testee-3');
    await routerPage2.clickNavigate();
    await routerPage2.viewTab.close();

    // expect the views to be present
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);

    // close the views via router
    await routerPage1.viewTab.click();
    await routerPage1.enterTarget(undefined);
    await routerPage1.enterQualifier({component: 'testee'});
    await routerPage1.checkClose(true);
    await routerPage1.clickNavigate();

    // expect only the views of app 1 to be closed
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
    await expect(await appPO.view({cssClass: 'testee-1'}).viewTab.isPresent()).toBe(false);
    await expect(await appPO.view({cssClass: 'testee-2'}).viewTab.isPresent()).toBe(false);
    await expect(await appPO.view({cssClass: 'testee-3'}).viewTab.isPresent()).toBe(true);
  });

  test('should not close public views of other apps if missing the intention', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view in app 1
    const registerCapability1Page = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapability1Page.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });
    await registerCapability1Page.viewTab.close();

    // register testee view in app 2
    const registerCapability2Page = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapability2Page.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });
    await registerCapability2Page.viewTab.close();

    // navigate to the view 1 of app 1
    const routerPage1 = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage1.enterQualifier({component: 'testee'});
    await routerPage1.enterTarget('blank');
    await routerPage1.enterCssClass('testee-1');
    await routerPage1.clickNavigate();

    // navigate to the view 2 of app 1
    await routerPage1.viewTab.click();
    await routerPage1.enterQualifier({component: 'testee'});
    await routerPage1.enterTarget('blank');
    await routerPage1.enterCssClass('testee-2');
    await routerPage1.clickNavigate();

    // navigate to the view of app 2
    const routerPage2 = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app2');
    await routerPage2.enterQualifier({component: 'testee'});
    await routerPage2.enterTarget('blank');
    await routerPage2.enterCssClass('testee-3');
    await routerPage2.clickNavigate();
    await routerPage2.viewTab.close();

    // expect the views to be present
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);

    // close the views via router
    await routerPage1.viewTab.click();
    await routerPage1.enterTarget(undefined);
    await routerPage1.enterQualifier({component: 'testee'});
    await routerPage1.checkClose(true);
    await routerPage1.clickNavigate();

    // expect only the views of app 1 to be closed
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
    await expect(await appPO.view({cssClass: 'testee-1'}).viewTab.isPresent()).toBe(false);
    await expect(await appPO.view({cssClass: 'testee-2'}).viewTab.isPresent()).toBe(false);
    await expect(await appPO.view({cssClass: 'testee-3'}).viewTab.isPresent()).toBe(true);
  });

  test('should allow closing all views of the same qualifier and a required param (seg1: 1)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {name: 'seg1', required: true},
      ],
      properties: {
        path: 'test-pages/view-test-page/:seg1',
        title: 'testee',
      },
    });
    await registerCapabilityPage.viewTab.close();

    // navigate to the view 1
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '1'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-1');
    await routerPage.clickNavigate();

    // navigate to the view 2
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '2'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-2');
    await routerPage.clickNavigate();

    // expect the views to be present
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);

    // close the view 1 via router
    await routerPage.viewTab.click();
    await routerPage.enterTarget(undefined);
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '1'});
    await routerPage.checkClose(true);
    await routerPage.clickNavigate({probeInterval: 250}); // Closing multiple views simultaneously can result in longer navigation times.

    // expect the view 1 to be closed
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
    await expect(await appPO.view({cssClass: 'testee-1'}).viewTab.isPresent()).toBe(false);
    await expect(await appPO.view({cssClass: 'testee-2'}).viewTab.isPresent()).toBe(true);
  });

  test('should allow closing all views of the same qualifier and a wildcard required param (seg1: *)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {name: 'seg1', required: true},
      ],
      properties: {
        path: 'test-pages/view-test-page/:seg1',
        title: 'testee',
        cssClass: 'testee',
      },
    });
    await registerCapabilityPage.viewTab.close();

    // navigate to the view 1
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '1'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    // navigate to the view 2
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '2'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    // expect the views to be present
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);

    // close the views via router
    await routerPage.viewTab.click();
    await routerPage.enterTarget(undefined);
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '*'});
    await routerPage.checkClose(true);
    await routerPage.clickNavigate({probeInterval: 250}); // Closing multiple views simultaneously can result in longer navigation times.

    // expect the views to be closed
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(1);
  });

  test('should allow closing all views of the same qualifier and multiple required params (seg1: 1, seg2: 1)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {name: 'seg1', required: true},
        {name: 'seg2', required: true},
      ],
      properties: {
        path: 'test-pages/view-test-page/:seg1/:seg2',
        title: 'testee',
      },
    });
    await registerCapabilityPage.viewTab.close();

    // navigate to the view 1
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '1', seg2: '1'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-1');
    await routerPage.clickNavigate();

    // navigate to the view 2
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '1', seg2: '2'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-2');
    await routerPage.clickNavigate();

    // navigate to the view 3
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '2', seg2: '1'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-3');
    await routerPage.clickNavigate();

    // navigate to the view 4
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '2', seg2: '2'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-4');
    await routerPage.clickNavigate();

    // expect the views to be present
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(5);

    // close the view 1 via router
    await routerPage.viewTab.click();
    await routerPage.enterTarget(undefined);
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '1', seg2: '1'});
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

    // expect the view to be closed
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);
    await expect(await appPO.view({cssClass: 'testee-1'}).viewTab.isPresent()).toBe(false);
    await expect(await appPO.view({cssClass: 'testee-2'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee-3'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee-4'}).viewTab.isPresent()).toBe(true);
  });

  test('should allow closing all views of the same qualifier and one wildcard and one non-wildcard required params (seg1: *, seg2: 1)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {name: 'seg1', required: true},
        {name: 'seg2', required: true},
      ],
      properties: {
        path: 'test-pages/view-test-page/:seg1/:seg2',
        title: 'testee',
      },
    });
    await registerCapabilityPage.viewTab.close();

    // navigate to the view 1
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '1', seg2: '1'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-1');
    await routerPage.clickNavigate();

    // navigate to the view 2
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '1', seg2: '2'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-2');
    await routerPage.clickNavigate();

    // navigate to the view 3
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '2', seg2: '1'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-3');
    await routerPage.clickNavigate();

    // navigate to the view 4
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '2', seg2: '2'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-4');
    await routerPage.clickNavigate();

    // expect the view to be present
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(5);

    // close the views 1 and 3 via router
    await routerPage.viewTab.click();
    await routerPage.enterTarget(undefined);
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '*', seg2: '1'});
    await routerPage.checkClose(true);
    await routerPage.clickNavigate({probeInterval: 250}); // Closing multiple views simultaneously can result in longer navigation times.

    // expect the view to be closed
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await appPO.view({cssClass: 'testee-1'}).viewTab.isPresent()).toBe(false);
    await expect(await appPO.view({cssClass: 'testee-2'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee-3'}).viewTab.isPresent()).toBe(false);
    await expect(await appPO.view({cssClass: 'testee-4'}).viewTab.isPresent()).toBe(true);
  });

  test('should allow closing all views of the same qualifier and multiple wildcard required params (seg1: *, seg2: *)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {name: 'seg1', required: true},
        {name: 'seg2', required: true},
      ],
      properties: {
        path: 'test-pages/view-test-page/:seg1/:seg2',
        title: 'testee',
      },
    });
    await registerCapabilityPage.viewTab.close();

    // navigate to the view 1
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '1', seg2: '1'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-1');
    await routerPage.clickNavigate();

    // navigate to the view 2
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '1', seg2: '2'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-2');
    await routerPage.clickNavigate();

    // navigate to the view 3
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '2', seg2: '1'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-3');
    await routerPage.clickNavigate();

    // navigate to the view 4
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '2', seg2: '2'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-4');
    await routerPage.clickNavigate();

    // expect the view to be present
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(5);

    // close the view via router
    await routerPage.viewTab.click();
    await routerPage.enterTarget(undefined);
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '*', seg2: '*'});
    await routerPage.checkClose(true);
    await routerPage.clickNavigate({probeInterval: 250}); // Closing multiple views simultaneously can result in longer navigation times.

    // expect the view to be closed
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(1);
    await expect(await appPO.view({cssClass: 'testee-1'}).viewTab.isPresent()).toBe(false);
    await expect(await appPO.view({cssClass: 'testee-2'}).viewTab.isPresent()).toBe(false);
    await expect(await appPO.view({cssClass: 'testee-3'}).viewTab.isPresent()).toBe(false);
    await expect(await appPO.view({cssClass: 'testee-4'}).viewTab.isPresent()).toBe(false);
  });

  test('should not close views of a different qualifier that require the same parameters', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-1'},
      params: [
        {name: 'seg1', required: true},
        {name: 'seg2', required: true},
      ],
      properties: {
        path: 'test-pages/view-test-page/:seg1/:seg2',
        title: 'testee-1',
      },
    });
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee-2'},
      params: [
        {name: 'seg1', required: true},
        {name: 'seg2', required: true},
      ],
      properties: {
        path: 'test-pages/view-test-page/:seg1/:seg2',
        title: 'testee-2',
      },
    });
    await registerCapabilityPage.viewTab.close();

    // navigate to the view 1
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee-1'});
    await routerPage.enterParams({seg1: '1', seg2: '1'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-1');
    await routerPage.clickNavigate();

    // navigate to the view 2
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee-1'});
    await routerPage.enterParams({seg1: '1', seg2: '2'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-2');
    await routerPage.clickNavigate();

    // navigate to the view 3
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee-2'});
    await routerPage.enterParams({seg1: '1', seg2: '1'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-3');
    await routerPage.clickNavigate();

    // navigate to the view 4
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee-2'});
    await routerPage.enterParams({seg1: '1', seg2: '2'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-4');
    await routerPage.clickNavigate();

    // expect the view to be present
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(5);

    // close the view via router
    await routerPage.viewTab.click();
    await routerPage.enterTarget(undefined);
    await routerPage.enterQualifier({component: 'testee-1'});
    await routerPage.enterParams({seg1: '*', seg2: '*'});
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

    // expect the view to be closed
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await appPO.view({cssClass: 'testee-1'}).viewTab.isPresent()).toBe(false);
    await expect(await appPO.view({cssClass: 'testee-2'}).viewTab.isPresent()).toBe(false);
    await expect(await appPO.view({cssClass: 'testee-3'}).viewTab.isPresent()).toBe(true);
    await expect(await appPO.view({cssClass: 'testee-4'}).viewTab.isPresent()).toBe(true);
  });

  test('should ignore optional params when matching views for closing', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {name: 'seg1', required: true},
        {name: 'opt', required: false},
      ],
      properties: {
        path: 'test-pages/view-test-page/:seg1',
        title: 'testee',
      },
    });
    await registerCapabilityPage.viewTab.close();

    // navigate to the view 1
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '1', opt: 'opt-1'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-1');
    await routerPage.clickNavigate();

    // navigate to the view 2
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '2', opt: 'opt-2'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-2');
    await routerPage.clickNavigate();

    // expect the views to be present
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);

    // close the views via router
    await routerPage.viewTab.click();
    await routerPage.enterTarget(undefined);
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '*', opt: 'opt-3'});
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

    // expect the views to be closed
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(1);
    await expect(await appPO.view({cssClass: 'testee-1'}).viewTab.isPresent()).toBe(false);
    await expect(await appPO.view({cssClass: 'testee-2'}).viewTab.isPresent()).toBe(false);
  });

  /**
   * When having loaded microfrontend 1 of an app, and when then navigating to microfrontend 2 of that app, and when then self-navigating
   * in microfrontend-2 upon its construction, the router should not navigate back to microfrontend 1.
   */
  test('should not navigate back to the previous microfrontend when self-navigating upon microfrontend construction', async ({appPO, microfrontendNavigator}) => {
    test.slow(); // increase timeout because this test simulates slow capability lookup
    await appPO.navigateTo({microfrontendSupport: true, simulateSlowCapabilityLookup: true});

    // register microfrontend-1 view
    const registerCapabilityApp1 = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityApp1.registerCapability({
      type: 'view',
      qualifier: {component: 'microfrontend-1'},
      properties: {
        path: 'test-pages/view-test-page/view1',
        title: 'Microfrontend 1',
        cssClass: 'microfrontend-1',
      },
    });

    // register microfrontend-2 view
    await registerCapabilityApp1.registerCapability({
      type: 'view',
      qualifier: {component: 'microfrontend-2'},
      properties: {
        path: 'test-pages/view-test-page/view2',
        title: 'Microfrontend 2',
        cssClass: 'microfrontend-2',
      },
    });

    // navigate to microfrontend-1 view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'microfrontend-1'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    // Construct the PO to interact with the opened view
    const viewId = await appPO.activePart({inMainArea: true}).activeView.getViewId();
    const viewTab = appPO.view({viewId}).viewTab;
    const viewPage = new ViewPagePO(appPO, viewId);

    // Assert the correct capability to be loaded
    await expect(await viewPage.getPath()).toEqual('/test-pages/view-test-page/view1');

    // navigate to microfrontend-2 view
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({component: 'microfrontend-2'});
    await routerPage.enterTarget(viewId);
    await routerPage.clickNavigate();

    // self-navigate in microfrontend-2 view
    await viewTab.click();
    await viewPage.navigateSelf({param: 'PARAM'});
    await expect(await viewPage.getPath()).toEqual('/test-pages/view-test-page/view2');
  });

  test('should propagate navigation error back to caller if navigation fails', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view as public view in app 2
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPage.registerCapability({
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
    const registerIntentionPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPage.registerIntention({type: 'view', qualifier: {component: 'testee'}});

    // navigate to the testee view in app 1
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({view: 'testee'});  // invalid qualifier
    await routerPage.enterTarget('blank');
    await expect(routerPage.clickNavigate()).rejects.toThrow(/\[NotQualifiedError] Application 'workbench-client-testing-app1' is not qualified/);

    // expect testee view not to be opened
    const testeeView = appPO.view({cssClass: 'testee'});
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await routerPage.viewTab.isActive()).toBe(true);
    await expect(await testeeView.viewTab.isPresent()).toBe(false);
    await expect(await testeeView.isPresent()).toBe(false);
  });

  test('should allow setting CSS class(es) via router', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    const activeView = await appPO.activePart({inMainArea: true}).activeView;

    await routerPage.enterQualifier({component: 'view', app: 'app1'});
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigate();

    await expect(await activeView.getCssClasses()).toEqual(expect.arrayContaining(['testee']));
    await expect(await activeView.viewTab.getCssClasses()).toEqual(expect.arrayContaining(['testee']));
  });

  test('should substitute named parameter in title/heading property of view capability', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

    // register testee microfrontend
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {name: 'title', required: false},
        {name: 'heading', required: false},
      ],
      properties: {
        path: 'test-pages/microfrontend-test-page',
        title: ':title',
        heading: ':heading',
        cssClass: 'testee',
      },
    });

    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({title: 'Title Param', heading: 'Heading Param'});
    await routerPage.enterCssClass('testee');
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    const testeeViewTab = appPO.view({cssClass: 'testee'}).viewTab;
    await expect(await testeeViewTab.getTitle()).toEqual('Title Param');
    await expect(await testeeViewTab.getHeading()).toEqual('Heading Param');
  });

  test('should substitute multiple named parameters in title/heading property of view capability', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

    // register testee microfrontend
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {name: 'param1', required: false},
        {name: 'param2', required: false},
      ],
      properties: {
        path: 'test-pages/microfrontend-test-page',
        title: ':param1/:param2/:param3 [component=:component]',
        heading: ':param1 :param2 :param3 [component=:component]',
        cssClass: 'testee',
      },
    });

    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({param1: 'value1', param2: 'value2'});
    await routerPage.enterCssClass('testee');
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    const testeeViewTab = appPO.view({cssClass: 'testee'}).viewTab;
    await expect(await testeeViewTab.getTitle()).toEqual('value1/value2/:param3 [component=testee]');
    await expect(await testeeViewTab.getHeading()).toEqual('value1 value2 :param3 [component=testee]');
  });
});
