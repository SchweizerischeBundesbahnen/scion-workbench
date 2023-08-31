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
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();

    // expect testee view to be opened as new tab
    const testeeViewTabPO = appPO.view({cssClass: 'testee'}).viewTab;
    const testeeViewPagePO = new ViewPagePO(appPO, await testeeViewTabPO.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
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
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();

    // expect testee view to be opened as new tab
    const testeeViewTabPO = appPO.view({cssClass: 'testee'}).viewTab;
    const testeeViewPagePO = new ViewPagePO(appPO, await testeeViewTabPO.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
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
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterTarget('blank');
    await expect(routerPagePO.clickNavigate()).rejects.toThrow(/NullProviderError/);

    // expect testee view not to be opened
    const testeeViewPO = appPO.view({cssClass: 'testee'});
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
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
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();

    // expect testee view not to be opened
    const testeeViewTabPO = appPO.view({cssClass: 'testee'}).viewTab;
    const testeeViewPagePO = new ViewPagePO(appPO, await testeeViewTabPO.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);
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
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterTarget('blank');
    await expect(routerPagePO.clickNavigate()).rejects.toThrow(/NotQualifiedError/);

    // expect testee view not to be opened
    const testeeViewPO = appPO.view({cssClass: 'testee'});
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
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
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();

    // expect testee view to be opened as new tab
    const testeeViewTabPO = appPO.view({cssClass: 'testee'}).viewTab;
    const testeeViewPagePO = new ViewPagePO(appPO, await testeeViewTabPO.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await testeeViewTabPO.isActive()).toBe(true);
    await expect(await testeeViewPagePO.view.isPresent()).toBe(true);
    await expect(await testeeViewPagePO.isVisible()).toBe(true);

    // activate router page
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();

    // expect testee view to be opened as new tab
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);
  });

  test('should open a view in the current view tab [target=viewId]', async ({appPO, microfrontendNavigator}) => {
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
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterTarget(routerPagePO.viewId);
    await routerPagePO.clickNavigate();

    // expect testee view to be opened in the current tab
    const testeeViewTabPO = appPO.view({cssClass: 'testee'}).viewTab;
    const testeeViewPagePO = new ViewPagePO(appPO, await testeeViewTabPO.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
    await expect(await testeeViewTabPO.isActive()).toBe(true);
    await expect(await testeeViewPagePO.view.isPresent()).toBe(true);
    await expect(await testeeViewPagePO.isVisible()).toBe(true);
    await expect(await routerPagePO.isVisible()).toBe(false);
    await expect(testeeViewPagePO.viewId).toEqual(routerPagePO.viewId);
  });

  test('should open a view in a new view tab if no matching view is found [target=auto]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
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
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterTarget('auto');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterCssClass('testee-1');
    await routerPagePO.enterParams({param: 'value1'});
    await routerPagePO.clickNavigate();

    // expect testee-1 view to be opened in a new tab
    const testee1ViewTabPO = appPO.view({cssClass: 'testee-1'}).viewTab;
    const testee1ViewPagePO = new ViewPagePO(appPO, await testee1ViewTabPO.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await testee1ViewTabPO.isActive()).toBe(true);
    await expect(await testee1ViewPagePO.view.isPresent()).toBe(true);
    await expect(await testee1ViewPagePO.isVisible()).toBe(true);
    await expect(await routerPagePO.isVisible()).toBe(false);
    await expect(testee1ViewPagePO.viewId).not.toEqual(routerPagePO.viewId);

    // activate router page
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterTarget('auto');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterCssClass('testee-2');
    await routerPagePO.enterParams({param: 'value2'});
    await routerPagePO.clickNavigate();

    // expect testee-2 view to be opened in a new tab
    const testee2ViewTabPO = appPO.view({cssClass: 'testee-2'}).viewTab;
    const testee2ViewPagePO = new ViewPagePO(appPO, await testee2ViewTabPO.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);
    await expect(await testee2ViewTabPO.isActive()).toBe(true);
    await expect(await testee2ViewPagePO.view.isPresent()).toBe(true);
    await expect(await testee2ViewPagePO.isVisible()).toBe(true);
    await expect(await routerPagePO.isVisible()).toBe(false);
    await expect(testee2ViewPagePO.viewId).not.toEqual(routerPagePO.viewId);
    await expect(testee2ViewPagePO.viewId).not.toEqual(testee1ViewPagePO.viewId);
  });

  test('should navigate existing view(s) of the same qualifier and required parameters (qualifier matches single view) [target=auto]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
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
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterTarget('auto');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({param: 'value1'});
    await routerPagePO.clickNavigate();

    // expect testee view to be opened in a new tab
    const testeeViewTabPO = appPO.view({cssClass: 'testee'}).viewTab;
    const testeeViewPagePO = new ViewPagePO(appPO, await testeeViewTabPO.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await testeeViewPagePO.getViewParams()).toEqual(expect.objectContaining({param: 'value1 [string]'}));
    await expect(await testeeViewTabPO.isActive()).toBe(true);

    // activate router page
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterParams({param: 'value2'});
    await routerPagePO.clickNavigate();

    // expect testee view to be updated and activated
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await testeeViewPagePO.getViewParams()).toEqual(expect.objectContaining({param: 'value2 [string]'}));
    await expect(await testeeViewTabPO.isActive()).toBe(true);
  });

  test('should navigate existing view(s) of the same qualifier and required parameters (qualifier matches multiple views) [target=auto]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
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
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterCssClass('testee-1');
    await routerPagePO.enterParams({param: 'value1'});
    await routerPagePO.clickNavigate();

    // expect testee-1 view to be opened in a new tab
    const testee1ViewTabPO = appPO.view({cssClass: 'testee-1'}).viewTab;
    const testee1ViewPagePO = new ViewPagePO(appPO, await testee1ViewTabPO.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await testee1ViewPagePO.getViewParams()).toEqual(expect.objectContaining({param: 'value1 [string]'}));
    await expect(await testee1ViewTabPO.isActive()).toBe(true);

    // navigate to the testee-2 view
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterCssClass('testee-2');
    await routerPagePO.enterParams({param: 'value2'});
    await routerPagePO.clickNavigate();

    // expect testee-2 view to be opened in a new tab
    const testee2ViewTabPO = appPO.view({cssClass: 'testee-2'}).viewTab;
    const testee2ViewPagePO = new ViewPagePO(appPO, await testee2ViewTabPO.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);
    await expect(await testee2ViewPagePO.getViewParams()).toEqual(expect.objectContaining({param: 'value2 [string]'}));
    await expect(await testee2ViewTabPO.isActive()).toBe(true);

    // update present testee views
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterTarget('auto');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({param: 'value3'});
    await routerPagePO.clickNavigate();

    // expect testee views to be updated
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);
    await testee1ViewTabPO.click();
    await expect(await testee1ViewPagePO.getViewParams()).toEqual(expect.objectContaining({param: 'value3 [string]'}));
    await testee2ViewTabPO.click();
    await expect(await testee2ViewPagePO.getViewParams()).toEqual(expect.objectContaining({param: 'value3 [string]'}));
  });

  test('should navigate existing view(s) of the same qualifier and required parameters (qualifier and required parameter match multiple views) [target=auto]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
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
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterCssClass('testee-1');
    await routerPagePO.enterParams({optionalParam: 'value1', requiredParam: 'value1'});
    await routerPagePO.clickNavigate();

    // expect testee-1 view to be opened in a new tab
    const testee1ViewTabPO = appPO.view({cssClass: 'testee-1'}).viewTab;
    const testee1ViewPagePO = new ViewPagePO(appPO, await testee1ViewTabPO.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await testee1ViewPagePO.getViewParams()).toEqual(expect.objectContaining({optionalParam: 'value1 [string]', requiredParam: 'value1 [string]'}));
    await expect(await testee1ViewTabPO.isActive()).toBe(true);

    // navigate to the testee-2 view
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterCssClass('testee-2');
    await routerPagePO.enterParams({optionalParam: 'value2', requiredParam: 'value1'});
    await routerPagePO.clickNavigate();

    // expect testee-2 view to be opened in a new tab
    const testee2ViewTabPO = appPO.view({cssClass: 'testee-2'}).viewTab;
    const testee2ViewPagePO = new ViewPagePO(appPO, await testee2ViewTabPO.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);
    await expect(await testee2ViewPagePO.getViewParams()).toEqual(expect.objectContaining({optionalParam: 'value2 [string]', requiredParam: 'value1 [string]'}));
    await expect(await testee2ViewTabPO.isActive()).toBe(true);

    // navigate to the testee-3 view
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterCssClass('testee-3');
    await routerPagePO.enterParams({optionalParam: 'value3', requiredParam: 'value2'});
    await routerPagePO.clickNavigate();

    // expect testee-3 view to be opened in a new tab
    const testee3ViewTabPO = appPO.view({cssClass: 'testee-3'}).viewTab;
    const testee3ViewPagePO = new ViewPagePO(appPO, await testee3ViewTabPO.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(5);
    await expect(await testee3ViewPagePO.getViewParams()).toEqual(expect.objectContaining({optionalParam: 'value3 [string]', requiredParam: 'value2 [string]'}));
    await expect(await testee3ViewTabPO.isActive()).toBe(true);

    // update present testee views
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterTarget('auto');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({optionalParam: 'value4', requiredParam: 'value1'});
    await routerPagePO.clickNavigate();

    // expect testee views to be updated
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(5);
    await testee1ViewTabPO.click();
    await expect(await testee1ViewPagePO.getViewParams()).toEqual(expect.objectContaining({optionalParam: 'value4 [string]', requiredParam: 'value1 [string]'}));
    await testee2ViewTabPO.click();
    await expect(await testee2ViewPagePO.getViewParams()).toEqual(expect.objectContaining({optionalParam: 'value4 [string]', requiredParam: 'value1 [string]'}));
    await testee3ViewTabPO.click();
    await expect(await testee3ViewPagePO.getViewParams()).toEqual(expect.objectContaining({optionalParam: 'value3 [string]', requiredParam: 'value2 [string]'}));
  });

  test('should, by default, open a new view if no matching view is found [target=`undefined`]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
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
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterCssClass('testee-1');
    await routerPagePO.enterParams({param: 'value1'});
    await routerPagePO.clickNavigate();

    // expect testee-1 view to be opened in a new tab
    const testee1ViewTabPO = appPO.view({cssClass: 'testee-1'}).viewTab;
    const testee1ViewPagePO = new ViewPagePO(appPO, await testee1ViewTabPO.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await testee1ViewTabPO.isActive()).toBe(true);
    await expect(await testee1ViewPagePO.view.isPresent()).toBe(true);
    await expect(await testee1ViewPagePO.isVisible()).toBe(true);
    await expect(await routerPagePO.isVisible()).toBe(false);
    await expect(testee1ViewPagePO.viewId).not.toEqual(routerPagePO.viewId);

    // activate router page
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterCssClass('testee-2');
    await routerPagePO.enterParams({param: 'value2'});
    await routerPagePO.clickNavigate();

    // expect testee-2 view to be opened in a new tab
    const testee2ViewTabPO = appPO.view({cssClass: 'testee-2'}).viewTab;
    const testee2ViewPagePO = new ViewPagePO(appPO, await testee2ViewTabPO.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);
    await expect(await testee2ViewTabPO.isActive()).toBe(true);
    await expect(await testee2ViewPagePO.view.isPresent()).toBe(true);
    await expect(await testee2ViewPagePO.isVisible()).toBe(true);
    await expect(await routerPagePO.isVisible()).toBe(false);
    await expect(testee2ViewPagePO.viewId).not.toEqual(routerPagePO.viewId);
    await expect(testee2ViewPagePO.viewId).not.toEqual(testee1ViewPagePO.viewId);
  });

  test('should, by default, navigate existing view(s) of the same qualifier and required parameters (qualifier matches single view) [target=`undefined`]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
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
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({param: 'value1'});
    await routerPagePO.clickNavigate();

    // expect testee view to be opened in a new tab
    const testeeViewTabPO = appPO.view({cssClass: 'testee'}).viewTab;
    const testeeViewPagePO = new ViewPagePO(appPO, await testeeViewTabPO.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await testeeViewPagePO.getViewParams()).toEqual(expect.objectContaining({param: 'value1 [string]'}));
    await expect(await testeeViewTabPO.isActive()).toBe(true);

    // activate router page
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterParams({param: 'value2'});
    await routerPagePO.clickNavigate();

    // expect testee view to be updated and activated
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await testeeViewPagePO.getViewParams()).toEqual(expect.objectContaining({param: 'value2 [string]'}));
    await expect(await testeeViewTabPO.isActive()).toBe(true);
  });

  test('should, by default, navigate existing view(s) of the same qualifier and required parameters (qualifier matches multiple views) [target=`undefined`]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
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
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterCssClass('testee-1');
    await routerPagePO.enterParams({param: 'value1'});
    await routerPagePO.clickNavigate();

    // expect testee-1 view to be opened in a new tab
    const testee1ViewTabPO = appPO.view({cssClass: 'testee-1'}).viewTab;
    const testee1ViewPagePO = new ViewPagePO(appPO, await testee1ViewTabPO.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await testee1ViewPagePO.getViewParams()).toEqual(expect.objectContaining({param: 'value1 [string]'}));
    await expect(await testee1ViewTabPO.isActive()).toBe(true);

    // navigate to the testee-2 view
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterCssClass('testee-2');
    await routerPagePO.enterParams({param: 'value2'});
    await routerPagePO.clickNavigate();

    // expect testee-2 view to be opened in a new tab
    const testee2ViewTabPO = appPO.view({cssClass: 'testee-2'}).viewTab;
    const testee2ViewPagePO = new ViewPagePO(appPO, await testee2ViewTabPO.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);
    await expect(await testee2ViewPagePO.getViewParams()).toEqual(expect.objectContaining({param: 'value2 [string]'}));
    await expect(await testee2ViewTabPO.isActive()).toBe(true);

    // update present testee views
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterTarget(undefined);
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({param: 'value3'});
    await routerPagePO.clickNavigate();

    // expect testee views to be updated
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);
    await testee1ViewTabPO.click();
    await expect(await testee1ViewPagePO.getViewParams()).toEqual(expect.objectContaining({param: 'value3 [string]'}));
    await testee2ViewTabPO.click();
    await expect(await testee2ViewPagePO.getViewParams()).toEqual(expect.objectContaining({param: 'value3 [string]'}));
  });

  test('should, by default, navigate existing view(s) of the same qualifier and required parameters (qualifier and required parameter match multiple views) [target=`undefined`]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
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
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterCssClass('testee-1');
    await routerPagePO.enterParams({optionalParam: 'value1', requiredParam: 'value1'});
    await routerPagePO.clickNavigate();

    // expect testee-1 view to be opened in a new tab
    const testee1ViewTabPO = appPO.view({cssClass: 'testee-1'}).viewTab;
    const testee1ViewPagePO = new ViewPagePO(appPO, await testee1ViewTabPO.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await testee1ViewPagePO.getViewParams()).toEqual(expect.objectContaining({optionalParam: 'value1 [string]', requiredParam: 'value1 [string]'}));
    await expect(await testee1ViewTabPO.isActive()).toBe(true);

    // navigate to the testee-2 view
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterCssClass('testee-2');
    await routerPagePO.enterParams({optionalParam: 'value2', requiredParam: 'value1'});
    await routerPagePO.clickNavigate();

    // expect testee-2 view to be opened in a new tab
    const testee2ViewTabPO = appPO.view({cssClass: 'testee-2'}).viewTab;
    const testee2ViewPagePO = new ViewPagePO(appPO, await testee2ViewTabPO.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);
    await expect(await testee2ViewPagePO.getViewParams()).toEqual(expect.objectContaining({optionalParam: 'value2 [string]', requiredParam: 'value1 [string]'}));
    await expect(await testee2ViewTabPO.isActive()).toBe(true);

    // navigate to the testee-3 view
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterCssClass('testee-3');
    await routerPagePO.enterParams({optionalParam: 'value3', requiredParam: 'value2'});
    await routerPagePO.clickNavigate();

    // expect testee-3 view to be opened in a new tab
    const testee3ViewTabPO = appPO.view({cssClass: 'testee-3'}).viewTab;
    const testee3ViewPagePO = new ViewPagePO(appPO, await testee3ViewTabPO.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(5);
    await expect(await testee3ViewPagePO.getViewParams()).toEqual(expect.objectContaining({optionalParam: 'value3 [string]', requiredParam: 'value2 [string]'}));
    await expect(await testee3ViewTabPO.isActive()).toBe(true);

    // update present testee views
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterTarget(undefined);
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({optionalParam: 'value4', requiredParam: 'value1'});
    await routerPagePO.clickNavigate();

    // expect testee views to be updated
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(5);
    await testee1ViewTabPO.click();
    await expect(await testee1ViewPagePO.getViewParams()).toEqual(expect.objectContaining({optionalParam: 'value4 [string]', requiredParam: 'value1 [string]'}));
    await testee2ViewTabPO.click();
    await expect(await testee2ViewPagePO.getViewParams()).toEqual(expect.objectContaining({optionalParam: 'value4 [string]', requiredParam: 'value1 [string]'}));
    await testee3ViewTabPO.click();
    await expect(await testee3ViewPagePO.getViewParams()).toEqual(expect.objectContaining({optionalParam: 'value3 [string]', requiredParam: 'value2 [string]'}));
  });

  test('should open all views matching the qualifier', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view in app-1
    const registerCapabilityPage1PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage1PO.registerCapability({
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
    const registerCapabilityPage2PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapabilityPage2PO.registerCapability({
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
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'view', qualifier: {component: 'testee'}});

    // navigate to the testee view
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();

    // expect testee view to be opened as new tab
    const testeeViewTab1PO = appPO.view({cssClass: 'testee-1'}).viewTab;
    const testeeViewTab2PO = appPO.view({cssClass: 'testee-2'}).viewTab;
    const testeeViewPage1PO = new ViewPagePO(appPO, await testeeViewTab1PO.getViewId());
    const testeeViewPage2PO = new ViewPagePO(appPO, await testeeViewTab2PO.getViewId());
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(6);
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
        path: 'test-pages/view-test-page/view1',
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
        path: 'test-pages/view-test-page/view2',
        title: 'Testee 2',
        cssClass: 'testee-2',
      },
    });

    // navigate to testee-1 view
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee-1'});
    await routerPagePO.enterTarget('blank');
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
    await routerPagePO.enterTarget(testeeViewId);
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
    await routerPagePO.enterTarget(testeeViewId);
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
    await routerPagePO.enterTarget(testeeViewId);
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
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee', path: 'empty'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();

    // expect the view to be present
    await expect(await testeeViewTabPO.isPresent()).toBe(true);
    await expect(await testeeViewTabPO.isActive()).toBe(true);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
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
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();

    // expect the view to be present
    const testeeViewPagePO = new ViewPagePO(appPO, await testeeViewTabPO.getViewId());
    await testeeViewPagePO.waitUntilAttached();
    await expect(await testeeViewTabPO.isActive()).toBe(true);
    await expect(await testeeViewPagePO.isVisible()).toBe(true);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);

    // reload the app; after the reload, the view is not registered anymore, as registered dynamically at runtime
    await appPO.reload();

    // expect the view not to be present
    await expect(await testeeViewTabPO.isPresent()).toBe(false);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
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
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
    await expect(await viewPage1PO.view.viewTab.isActive()).toBe(false);
    await expect(await viewPage1PO.isPresent()).toBe(true);
    await expect(await viewPage1PO.isVisible()).toBe(false);
    await expect(await viewPage2PO.view.viewTab.isActive()).toBe(true);
    await expect(await viewPage2PO.isVisible()).toBe(true);
  });

  test('should load microfrontends of inactive views on initial navigation', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // navigate to the view
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'view', app: 'app1'});
    await routerPagePO.enterParams({initialTitle: 'INITIAL TITLE 1'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();
    const viewPage1PO = new ViewPagePO(appPO, await appPO.activePart({inMainArea: true}).activeView.getViewId());

    // navigate to the view
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'view', app: 'app1'});
    await routerPagePO.enterParams({initialTitle: 'INITIAL TITLE 2'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();
    const viewPage2PO = new ViewPagePO(appPO, await appPO.activePart({inMainArea: true}).activeView.getViewId());

    // reload the app
    await appPO.reload();
    await waitUntilAttached(viewPage1PO.locator, viewPage2PO.locator);

    // expect views to be present
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
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
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterTarget('blank');
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
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterTarget(viewPagePO.viewId);
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
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee-1'});
    await routerPagePO.enterTarget('blank');
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
    await routerPagePO.enterTarget(testeeViewId);
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
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterTarget('blank');
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
    await routerPagePO.enterTarget(testeeViewId);
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
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterTarget('blank');
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
    await routerPagePO.enterTarget(testeeViewId);
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
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee-1'});
    await routerPagePO.enterTarget('blank');
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
    await routerPagePO.enterTarget(testeeViewId);
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
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();

    // expect the view to be present
    const testeeViewPagePO = new ViewPagePO(appPO, await testeeViewTabPO.getViewId());
    await testeeViewPagePO.waitUntilAttached();
    await expect(await testeeViewTabPO.isActive()).toBe(true);
    await expect(await testeeViewPagePO.isVisible()).toBe(true);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);

    // unregister the capability
    const unregisterCapabilityPagePO = await microfrontendNavigator.openInNewTab(UnregisterWorkbenchCapabilityPagePO, 'app1');
    await unregisterCapabilityPagePO.unregisterCapability(capabilityId);
    await unregisterCapabilityPagePO.viewTabPO.close();

    // expect the view not to be present
    await expect(await testeeViewTabPO.isPresent()).toBe(false);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(1);
    await expect(await consoleLogs.get({severity: 'warning', filter: /NullViewError/})).not.toEqual([]);
  });

  test('should allow closing a single view by qualifier', async ({appPO, microfrontendNavigator}) => {
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
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();

    // expect the view to be present
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);

    // close the view via router
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterTarget(undefined);
    await routerPagePO.checkClose(true);
    await routerPagePO.clickNavigate();

    // expect the view to be closed
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(1);
  });

  test('should reject closing a single view by viewId', async ({appPO, microfrontendNavigator}) => {
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
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();
    const testeeViewId = await appPO.view({cssClass: 'testee'}).getViewId();

    // expect the views to be present
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);

    // close the view by viewId via router
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterTarget(testeeViewId);
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.checkClose(true);

    // expect closing to be rejected
    await expect(routerPagePO.clickNavigate()).rejects.toThrow(/\[WorkbenchRouterError]\[IllegalArgumentError]/);
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
  });

  test('should allow closing all views of the same qualifier', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view in app 1
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee-1',
      },
    });
    await registerCapabilityPagePO.viewTabPO.close();

    // register testee view in app 2
    const registerCapability2PagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapability2PagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      private: false,
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee-2',
      },
    });
    await registerCapability2PagePO.viewTabPO.close();

    // register view intention in app 1
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'view', qualifier: {component: 'testee'}});
    await registerIntentionPagePO.viewTabPO.close();

    // navigate to the view from within app 1 (two views are opened)
    const routerPage1PO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage1PO.enterQualifier({component: 'testee'});
    await routerPage1PO.enterTarget('blank');
    await routerPage1PO.clickNavigate();

    // navigate to the view from within app 1 (two views are opened)
    await routerPage1PO.viewTabPO.click();
    await routerPage1PO.enterQualifier({component: 'testee'});
    await routerPage1PO.enterTarget('blank');
    await routerPage1PO.clickNavigate();

    // navigate to the view from within app 2 (one view is opened)
    const routerPage2PO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app2');
    await routerPage2PO.enterQualifier({component: 'testee'});
    await routerPage2PO.enterTarget('blank');
    await routerPage2PO.clickNavigate();
    await routerPage2PO.viewTabPO.close();

    // expect the views to be present
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(6);

    // close the views via router
    await routerPage1PO.viewTabPO.click();
    await routerPage1PO.enterTarget(undefined);
    await routerPage1PO.enterQualifier({component: 'testee'});
    await routerPage1PO.checkClose(true);
    await routerPage1PO.clickNavigate({probeInterval: 250}); // Closing multiple views simultaneously can result in longer navigation times.

    // expect the views to be closed
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(1);
  });

  test('should not close private views of other apps', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view in app 1
    const registerCapability1PagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapability1PagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });
    await registerCapability1PagePO.viewTabPO.close();

    // register testee view in app 2
    const registerCapability2PagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapability2PagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      private: true, // PRIVATE
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });
    await registerCapability2PagePO.viewTabPO.close();

    // register view intention in app 1
    const registerIntentionPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchIntentionPagePO, 'app1');
    await registerIntentionPagePO.registerIntention({type: 'view', qualifier: {component: 'testee'}});
    await registerIntentionPagePO.viewTabPO.close();

    // navigate to the view 1 of app 1
    const routerPage1PO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage1PO.enterQualifier({component: 'testee'});
    await routerPage1PO.enterTarget('blank');
    await routerPage1PO.enterCssClass('testee-1');
    await routerPage1PO.clickNavigate();

    // navigate to the view 2 of app 1
    await routerPage1PO.viewTabPO.click();
    await routerPage1PO.enterQualifier({component: 'testee'});
    await routerPage1PO.enterTarget('blank');
    await routerPage1PO.enterCssClass('testee-2');
    await routerPage1PO.clickNavigate();

    // navigate to the view of app 2
    const routerPage2PO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app2');
    await routerPage2PO.enterQualifier({component: 'testee'});
    await routerPage2PO.enterTarget('blank');
    await routerPage2PO.enterCssClass('testee-3');
    await routerPage2PO.clickNavigate();
    await routerPage2PO.viewTabPO.close();

    // expect the views to be present
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);

    // close the views via router
    await routerPage1PO.viewTabPO.click();
    await routerPage1PO.enterTarget(undefined);
    await routerPage1PO.enterQualifier({component: 'testee'});
    await routerPage1PO.checkClose(true);
    await routerPage1PO.clickNavigate();

    // expect only the views of app 1 to be closed
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
    await expect(await appPO.view({cssClass: 'testee-1'}).viewTab.isPresent()).toBe(false);
    await expect(await appPO.view({cssClass: 'testee-2'}).viewTab.isPresent()).toBe(false);
    await expect(await appPO.view({cssClass: 'testee-3'}).viewTab.isPresent()).toBe(true);
  });

  test('should not close public views of other apps if missing the intention', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view in app 1
    const registerCapability1PagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapability1PagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });
    await registerCapability1PagePO.viewTabPO.close();

    // register testee view in app 2
    const registerCapability2PagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
    await registerCapability2PagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });
    await registerCapability2PagePO.viewTabPO.close();

    // navigate to the view 1 of app 1
    const routerPage1PO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage1PO.enterQualifier({component: 'testee'});
    await routerPage1PO.enterTarget('blank');
    await routerPage1PO.enterCssClass('testee-1');
    await routerPage1PO.clickNavigate();

    // navigate to the view 2 of app 1
    await routerPage1PO.viewTabPO.click();
    await routerPage1PO.enterQualifier({component: 'testee'});
    await routerPage1PO.enterTarget('blank');
    await routerPage1PO.enterCssClass('testee-2');
    await routerPage1PO.clickNavigate();

    // navigate to the view of app 2
    const routerPage2PO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app2');
    await routerPage2PO.enterQualifier({component: 'testee'});
    await routerPage2PO.enterTarget('blank');
    await routerPage2PO.enterCssClass('testee-3');
    await routerPage2PO.clickNavigate();
    await routerPage2PO.viewTabPO.close();

    // expect the views to be present
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(4);

    // close the views via router
    await routerPage1PO.viewTabPO.click();
    await routerPage1PO.enterTarget(undefined);
    await routerPage1PO.enterQualifier({component: 'testee'});
    await routerPage1PO.checkClose(true);
    await routerPage1PO.clickNavigate();

    // expect only the views of app 1 to be closed
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
    await expect(await appPO.view({cssClass: 'testee-1'}).viewTab.isPresent()).toBe(false);
    await expect(await appPO.view({cssClass: 'testee-2'}).viewTab.isPresent()).toBe(false);
    await expect(await appPO.view({cssClass: 'testee-3'}).viewTab.isPresent()).toBe(true);
  });

  test('should allow closing all views of the same qualifier and a required param (seg1: 1)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
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
    await registerCapabilityPagePO.viewTabPO.close();

    // navigate to the view 1
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({seg1: '1'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-1');
    await routerPagePO.clickNavigate();

    // navigate to the view 2
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({seg1: '2'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-2');
    await routerPagePO.clickNavigate();

    // expect the views to be present
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);

    // close the view 1 via router
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterTarget(undefined);
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({seg1: '1'});
    await routerPagePO.checkClose(true);
    await routerPagePO.clickNavigate({probeInterval: 250}); // Closing multiple views simultaneously can result in longer navigation times.

    // expect the view 1 to be closed
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(2);
    await expect(await appPO.view({cssClass: 'testee-1'}).viewTab.isPresent()).toBe(false);
    await expect(await appPO.view({cssClass: 'testee-2'}).viewTab.isPresent()).toBe(true);
  });

  test('should allow closing all views of the same qualifier and a wildcard required param (seg1: *)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
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
    await registerCapabilityPagePO.viewTabPO.close();

    // navigate to the view 1
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({seg1: '1'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();

    // navigate to the view 2
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({seg1: '2'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();

    // expect the views to be present
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);

    // close the views via router
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterTarget(undefined);
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({seg1: '*'});
    await routerPagePO.checkClose(true);
    await routerPagePO.clickNavigate({probeInterval: 250}); // Closing multiple views simultaneously can result in longer navigation times.

    // expect the views to be closed
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(1);
  });

  test('should allow closing all views of the same qualifier and multiple required params (seg1: 1, seg2: 1)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
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
    await registerCapabilityPagePO.viewTabPO.close();

    // navigate to the view 1
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({seg1: '1', seg2: '1'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-1');
    await routerPagePO.clickNavigate();

    // navigate to the view 2
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({seg1: '1', seg2: '2'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-2');
    await routerPagePO.clickNavigate();

    // navigate to the view 3
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({seg1: '2', seg2: '1'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-3');
    await routerPagePO.clickNavigate();

    // navigate to the view 4
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({seg1: '2', seg2: '2'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-4');
    await routerPagePO.clickNavigate();

    // expect the views to be present
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(5);

    // close the view 1 via router
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterTarget(undefined);
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({seg1: '1', seg2: '1'});
    await routerPagePO.checkClose(true);
    await routerPagePO.clickNavigate();

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
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
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
    await registerCapabilityPagePO.viewTabPO.close();

    // navigate to the view 1
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({seg1: '1', seg2: '1'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-1');
    await routerPagePO.clickNavigate();

    // navigate to the view 2
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({seg1: '1', seg2: '2'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-2');
    await routerPagePO.clickNavigate();

    // navigate to the view 3
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({seg1: '2', seg2: '1'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-3');
    await routerPagePO.clickNavigate();

    // navigate to the view 4
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({seg1: '2', seg2: '2'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-4');
    await routerPagePO.clickNavigate();

    // expect the view to be present
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(5);

    // close the views 1 and 3 via router
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterTarget(undefined);
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({seg1: '*', seg2: '1'});
    await routerPagePO.checkClose(true);
    await routerPagePO.clickNavigate({probeInterval: 250}); // Closing multiple views simultaneously can result in longer navigation times.

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
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
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
    await registerCapabilityPagePO.viewTabPO.close();

    // navigate to the view 1
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({seg1: '1', seg2: '1'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-1');
    await routerPagePO.clickNavigate();

    // navigate to the view 2
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({seg1: '1', seg2: '2'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-2');
    await routerPagePO.clickNavigate();

    // navigate to the view 3
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({seg1: '2', seg2: '1'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-3');
    await routerPagePO.clickNavigate();

    // navigate to the view 4
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({seg1: '2', seg2: '2'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-4');
    await routerPagePO.clickNavigate();

    // expect the view to be present
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(5);

    // close the view via router
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterTarget(undefined);
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({seg1: '*', seg2: '*'});
    await routerPagePO.checkClose(true);
    await routerPagePO.clickNavigate({probeInterval: 250}); // Closing multiple views simultaneously can result in longer navigation times.

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
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
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
    await registerCapabilityPagePO.registerCapability({
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
    await registerCapabilityPagePO.viewTabPO.close();

    // navigate to the view 1
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee-1'});
    await routerPagePO.enterParams({seg1: '1', seg2: '1'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-1');
    await routerPagePO.clickNavigate();

    // navigate to the view 2
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee-1'});
    await routerPagePO.enterParams({seg1: '1', seg2: '2'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-2');
    await routerPagePO.clickNavigate();

    // navigate to the view 3
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee-2'});
    await routerPagePO.enterParams({seg1: '1', seg2: '1'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-3');
    await routerPagePO.clickNavigate();

    // navigate to the view 4
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee-2'});
    await routerPagePO.enterParams({seg1: '1', seg2: '2'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-4');
    await routerPagePO.clickNavigate();

    // expect the view to be present
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(5);

    // close the view via router
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterTarget(undefined);
    await routerPagePO.enterQualifier({component: 'testee-1'});
    await routerPagePO.enterParams({seg1: '*', seg2: '*'});
    await routerPagePO.checkClose(true);
    await routerPagePO.clickNavigate();

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
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability({
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
    await registerCapabilityPagePO.viewTabPO.close();

    // navigate to the view 1
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({seg1: '1', opt: 'opt-1'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-1');
    await routerPagePO.clickNavigate();

    // navigate to the view 2
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({seg1: '2', opt: 'opt-2'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.enterCssClass('testee-2');
    await routerPagePO.clickNavigate();

    // expect the views to be present
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);

    // close the views via router
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterTarget(undefined);
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({seg1: '*', opt: 'opt-3'});
    await routerPagePO.checkClose(true);
    await routerPagePO.clickNavigate();

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
    const registerCapabilityApp1PO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityApp1PO.registerCapability({
      type: 'view',
      qualifier: {component: 'microfrontend-1'},
      properties: {
        path: 'test-pages/view-test-page/view1',
        title: 'Microfrontend 1',
        cssClass: 'microfrontend-1',
      },
    });

    // register microfrontend-2 view
    await registerCapabilityApp1PO.registerCapability({
      type: 'view',
      qualifier: {component: 'microfrontend-2'},
      properties: {
        path: 'test-pages/view-test-page/view2',
        title: 'Microfrontend 2',
        cssClass: 'microfrontend-2',
      },
    });

    // navigate to microfrontend-1 view
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'microfrontend-1'});
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();

    // Construct the PO to interact with the opened view
    const viewId = await appPO.activePart({inMainArea: true}).activeView.getViewId();
    const viewTabPO = appPO.view({viewId}).viewTab;
    const viewPagePO = new ViewPagePO(appPO, viewId);

    // Assert the correct capability to be loaded
    await expect(await viewPagePO.getPath()).toEqual('/test-pages/view-test-page/view1');

    // navigate to microfrontend-2 view
    await routerPagePO.viewTabPO.click();
    await routerPagePO.enterQualifier({component: 'microfrontend-2'});
    await routerPagePO.enterTarget(viewId);
    await routerPagePO.clickNavigate();

    // self-navigate in microfrontend-2 view
    await viewTabPO.click();
    await viewPagePO.navigateSelf({param: 'PARAM'});
    await expect(await viewPagePO.getPath()).toEqual('/test-pages/view-test-page/view2');
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
    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({view: 'testee'});  // invalid qualifier
    await routerPagePO.enterTarget('blank');
    await expect(routerPagePO.clickNavigate()).rejects.toThrow(/\[NotQualifiedError] Application 'workbench-client-testing-app1' is not qualified/);

    // expect testee view not to be opened
    const testeeViewPO = appPO.view({cssClass: 'testee'});
    await expect(await appPO.activePart({inMainArea: true}).getViewIds()).toHaveLength(3);
    await expect(await routerPagePO.viewTabPO.isActive()).toBe(true);
    await expect(await testeeViewPO.viewTab.isPresent()).toBe(false);
    await expect(await testeeViewPO.isPresent()).toBe(false);
  });

  test('should allow setting CSS class(es) via router', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    const activeViewPO = await appPO.activePart({inMainArea: true}).activeView;

    await routerPagePO.enterQualifier({component: 'view', app: 'app1'});
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.clickNavigate();

    await expect(await activeViewPO.getCssClasses()).toEqual(expect.arrayContaining(['testee']));
    await expect(await activeViewPO.viewTab.getCssClasses()).toEqual(expect.arrayContaining(['testee']));
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
        path: 'test-pages/microfrontend-test-page',
        title: ':title',
        heading: ':heading',
        cssClass: 'testee',
      },
    });

    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({title: 'Title Param', heading: 'Heading Param'});
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.enterTarget('blank');
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
        path: 'test-pages/microfrontend-test-page',
        title: ':param1/:param2/:param3 [component=:component]',
        heading: ':param1 :param2 :param3 [component=:component]',
        cssClass: 'testee',
      },
    });

    const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPagePO.enterQualifier({component: 'testee'});
    await routerPagePO.enterParams({param1: 'value1', param2: 'value2'});
    await routerPagePO.enterCssClass('testee');
    await routerPagePO.enterTarget('blank');
    await routerPagePO.clickNavigate();

    const testeeViewTab = appPO.view({cssClass: 'testee'}).viewTab;
    await expect(await testeeViewTab.getTitle()).toEqual('value1/value2/:param3 [component=testee]');
    await expect(await testeeViewTab.getHeading()).toEqual('value1 value2 :param3 [component=testee]');
  });
});
