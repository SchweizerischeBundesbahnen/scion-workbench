/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
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
import {ViewPagePO as WorkbenchViewPagePO} from '../workbench/page-object/view-page.po';
import {RouterPagePO} from './page-object/router-page.po';
import {expectView} from '../matcher/view-matcher';
import {MicrofrontendViewTestPagePO} from './page-object/test-pages/microfrontend-view-test-page.po';

test.describe('Workbench Router', () => {

  test('should navigate to own public views', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
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
    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect(appPO.views()).toHaveCount(2);
    await expectView(testeeViewPage).toBeActive();
  });

  test('should navigate to own private views', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
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
    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect(appPO.views()).toHaveCount(2);
    await expectView(testeeViewPage).toBeActive();
  });

  test('should not navigate to private views of other apps', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app2', {
      type: 'view',
      qualifier: {component: 'testee'},
      private: true, // PRIVATE
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    await microfrontendNavigator.registerIntention('app1', {type: 'view', qualifier: {component: 'testee'}});

    // navigate to the testee view in app 1
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget('blank');
    await expect(routerPage.clickNavigate()).rejects.toThrow(/NullProviderError/);

    // expect testee view not to be opened
    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect(appPO.views()).toHaveCount(1);
    await expectView(testeeViewPage).not.toBeAttached();
    await expectView(routerPage).toBeActive();
  });

  test('should navigate to public views of other apps', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app2', {
      type: 'view',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    await microfrontendNavigator.registerIntention('app1', {type: 'view', qualifier: {component: 'testee'}});

    // navigate to the testee view in app 1
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    // expect testee view not to be opened
    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect(appPO.views()).toHaveCount(2);
    await expectView(testeeViewPage).toBeActive();
  });

  test('should not navigate to public views of other apps if missing the intention', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app2', {
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
    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect(appPO.views()).toHaveCount(1);
    await expectView(routerPage).toBeActive();
    await expectView(testeeViewPage).not.toBeAttached();
  });

  test('should open a view in a new view tab [target=blank]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
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
    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect(appPO.views()).toHaveCount(2);
    await expectView(testeeViewPage).toBeActive();

    // activate router page
    await routerPage.view.tab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    // expect testee view to be opened as new tab
    await expect(appPO.views()).toHaveCount(3);
  });

  test('should open a view in the current view tab [target=viewId]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
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
    const routerPageId = await routerPage.view.getViewId();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget(routerPageId);
    await routerPage.clickNavigate();

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    // expect testee view to be opened in the current tab
    await expect(appPO.views()).toHaveCount(1);
    await expectView(testeeViewPage).toBeActive();
    await expectView(routerPage).not.toBeAttached();
    await expect.poll(() => testeeViewPage.view.getViewId()).toEqual(routerPageId);
  });

  test('should open a view in a new view tab if no matching view is found [target=auto]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
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
    const routerPageId = await routerPage.view.getViewId();
    await routerPage.enterTarget('auto');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterCssClass('testee-1');
    await routerPage.enterParams({param: 'value1'});
    await routerPage.clickNavigate();

    const testee1ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-1'});

    // expect testee-1 view to be opened in a new tab
    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(2);
    await expect.poll(() => testee1ViewPage.view.getViewId()).not.toEqual(routerPageId);

    // activate router page
    await routerPage.view.tab.click();
    await routerPage.enterTarget('auto');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterCssClass('testee-2');
    await routerPage.enterParams({param: 'value2'});
    await routerPage.clickNavigate();

    const testee2ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-2'});

    // expect testee-2 view to be opened in a new tab
    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(3);
    await expect.poll(() => testee2ViewPage.view.getViewId()).not.toEqual(routerPageId);
    await expect.poll(() => testee2ViewPage.view.getViewId()).not.toEqual(await testee1ViewPage.view.getViewId());
  });

  test('should navigate existing view(s) of the same qualifier and required parameters (qualifier matches single view) [target=auto]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
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
    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect(appPO.views()).toHaveCount(2);
    await expect.poll(() => testeeViewPage.getViewParams()).toMatchObject({param: 'value1'});
    await expectView(testeeViewPage).toBeActive();

    // activate router page
    await routerPage.view.tab.click();
    await routerPage.enterParams({param: 'value2'});
    await routerPage.clickNavigate();

    // expect testee view to be updated and activated
    await expect(appPO.views()).toHaveCount(2);
    await expect.poll(() => testeeViewPage.getViewParams()).toMatchObject({param: 'value2'});
    await expectView(testeeViewPage).toBeActive();
  });

  test('should navigate existing view(s) of the same qualifier and required parameters (qualifier matches multiple views) [target=auto]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
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
    await routerPage.enterTarget('view.101');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({param: 'value1'});
    await routerPage.clickNavigate();

    // expect testee-1 view to be opened in a new tab
    const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    await expect(appPO.views()).toHaveCount(2);
    await expect.poll(() => testee1ViewPage.getViewParams()).toMatchObject({param: 'value1'});
    await expectView(testee1ViewPage).toBeActive();

    // navigate to the testee-2 view
    await routerPage.view.tab.click();
    await routerPage.enterTarget('view.102');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({param: 'value2'});
    await routerPage.clickNavigate();

    // expect testee-2 view to be opened in a new tab
    const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.102'});
    await expect(appPO.views()).toHaveCount(3);
    await expect.poll(() => testee2ViewPage.getViewParams()).toMatchObject({param: 'value2'});
    await expectView(testee2ViewPage).toBeActive();

    // update present testee views
    await routerPage.view.tab.click();
    await routerPage.enterTarget('auto');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({param: 'value3'});
    await routerPage.clickNavigate();

    // expect testee views to be updated
    await expect(appPO.views()).toHaveCount(3);
    await testee1ViewPage.view.tab.click();
    await expect.poll(() => testee1ViewPage.getViewParams()).toMatchObject({param: 'value3'});
    await testee2ViewPage.view.tab.click();
    await expect.poll(() => testee2ViewPage.getViewParams()).toMatchObject({param: 'value3'});
  });

  test('should navigate existing view(s) of the same qualifier and required parameters (qualifier and required parameter match multiple views) [target=auto]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
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
    await routerPage.enterTarget('view.101');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({optionalParam: 'value1', requiredParam: 'value1'});
    await routerPage.clickNavigate();

    // expect testee-1 view to be opened in a new tab
    const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    await expect(appPO.views()).toHaveCount(2);
    await expect.poll(() => testee1ViewPage.getViewParams()).toMatchObject({optionalParam: 'value1', requiredParam: 'value1'});
    await expectView(testee1ViewPage).toBeActive();

    // navigate to the testee-2 view
    await routerPage.view.tab.click();
    await routerPage.enterTarget('view.102');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({optionalParam: 'value2', requiredParam: 'value1'});
    await routerPage.clickNavigate();

    // expect testee-2 view to be opened in a new tab
    const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.102'});
    await expect(appPO.views()).toHaveCount(3);
    await expect.poll(() => testee2ViewPage.getViewParams()).toMatchObject({optionalParam: 'value2', requiredParam: 'value1'});
    await expectView(testee2ViewPage).toBeActive();

    // navigate to the testee-3 view
    await routerPage.view.tab.click();
    await routerPage.enterTarget('view.103');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({optionalParam: 'value3', requiredParam: 'value2'});
    await routerPage.clickNavigate();

    // expect testee-3 view to be opened in a new tab
    const testee3ViewPage = new ViewPagePO(appPO, {viewId: 'view.103'});
    await expect(appPO.views()).toHaveCount(4);
    await expect.poll(() => testee3ViewPage.getViewParams()).toMatchObject({optionalParam: 'value3', requiredParam: 'value2'});
    await expectView(testee3ViewPage).toBeActive();

    // update present testee views
    await routerPage.view.tab.click();
    await routerPage.enterTarget('auto');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({optionalParam: 'value4', requiredParam: 'value1'});
    await routerPage.clickNavigate();

    // expect testee views to be updated
    await expect(appPO.views()).toHaveCount(4);
    await testee1ViewPage.view.tab.click();
    await expect.poll(() => testee1ViewPage.getViewParams()).toMatchObject({optionalParam: 'value4', requiredParam: 'value1'});
    await testee2ViewPage.view.tab.click();
    await expect.poll(() => testee2ViewPage.getViewParams()).toMatchObject({optionalParam: 'value4', requiredParam: 'value1'});
    await testee3ViewPage.view.tab.click();
    await expect.poll(() => testee3ViewPage.getViewParams()).toMatchObject({optionalParam: 'value3', requiredParam: 'value2'});
  });

  test('should, by default, open a new view if no matching view is found [target=`undefined`]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
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
    const testee1ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-1'});
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeActive();
    await expect.poll(() => testee1ViewPage.view.getViewId()).not.toEqual(await routerPage.view.getViewId());

    // activate router page
    await routerPage.view.tab.click();
    await routerPage.enterCssClass('testee-2');
    await routerPage.enterParams({param: 'value2'});
    await routerPage.clickNavigate();

    // expect testee-2 view to be opened in a new tab
    const testee2ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-2'});
    await expect(appPO.views()).toHaveCount(3);
    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeActive();
    await expect.poll(() => testee2ViewPage.view.getViewId()).not.toEqual(await routerPage.view.getViewId());
    await expect.poll(() => testee2ViewPage.view.getViewId()).not.toEqual(await testee1ViewPage.view.getViewId());
  });

  test('should, by default, navigate existing view(s) of the same qualifier and required parameters (qualifier matches single view) [target=`undefined`]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
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
    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect(appPO.views()).toHaveCount(2);
    await expect.poll(() => testeeViewPage.getViewParams()).toMatchObject({param: 'value1'});
    await expectView(testeeViewPage).toBeActive();

    // activate router page
    await routerPage.view.tab.click();
    await routerPage.enterParams({param: 'value2'});
    await routerPage.clickNavigate();

    // expect testee view to be updated and activated
    await expect(appPO.views()).toHaveCount(2);
    await expect.poll(() => testeeViewPage.getViewParams()).toMatchObject({param: 'value2'});
    await expectView(testeeViewPage).toBeActive();
  });

  test('should, by default, navigate existing view(s) of the same qualifier and required parameters (qualifier matches multiple views) [target=`undefined`]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
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
    await routerPage.enterTarget('view.101');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({param: 'value1'});
    await routerPage.clickNavigate();

    // expect testee-1 view to be opened in a new tab
    const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    await expect(appPO.views()).toHaveCount(2);
    await expect.poll(() => testee1ViewPage.getViewParams()).toMatchObject({param: 'value1'});
    await expectView(testee1ViewPage).toBeActive();

    // navigate to the testee-2 view
    await routerPage.view.tab.click();
    await routerPage.enterTarget('view.102');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({param: 'value2'});
    await routerPage.clickNavigate();

    // expect testee-2 view to be opened in a new tab
    const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.102'});
    await expect(appPO.views()).toHaveCount(3);
    await expect.poll(() => testee2ViewPage.getViewParams()).toMatchObject({param: 'value2'});
    await expectView(testee2ViewPage).toBeActive();

    // update present testee views
    await routerPage.view.tab.click();
    await routerPage.enterTarget(undefined);
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({param: 'value3'});
    await routerPage.clickNavigate();

    // expect testee views to be updated
    await expect(appPO.views()).toHaveCount(3);
    await testee1ViewPage.view.tab.click();
    await expect.poll(() => testee1ViewPage.getViewParams()).toMatchObject({param: 'value3'});
    await testee2ViewPage.view.tab.click();
    await expect.poll(() => testee2ViewPage.getViewParams()).toMatchObject({param: 'value3'});
  });

  test('should, by default, navigate existing view(s) of the same qualifier and required parameters (qualifier and required parameter match multiple views) [target=`undefined`]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
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
    await routerPage.enterTarget('view.101');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({optionalParam: 'value1', requiredParam: 'value1'});
    await routerPage.clickNavigate();

    // expect testee-1 view to be opened in a new tab
    const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    await expect(appPO.views()).toHaveCount(2);
    await expect.poll(() => testee1ViewPage.getViewParams()).toMatchObject({optionalParam: 'value1', requiredParam: 'value1'});
    await expectView(testee1ViewPage).toBeActive();

    // navigate to the testee-2 view
    await routerPage.view.tab.click();
    await routerPage.enterTarget('view.102');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({optionalParam: 'value2', requiredParam: 'value1'});
    await routerPage.clickNavigate();

    // expect testee-2 view to be opened in a new tab
    const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.102'});
    await expect(appPO.views()).toHaveCount(3);
    await expect.poll(() => testee2ViewPage.getViewParams()).toMatchObject({optionalParam: 'value2', requiredParam: 'value1'});
    await expectView(testee2ViewPage).toBeActive();

    // navigate to the testee-3 view
    await routerPage.view.tab.click();
    await routerPage.enterTarget('view.103');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({optionalParam: 'value3', requiredParam: 'value2'});
    await routerPage.clickNavigate();

    // expect testee-3 view to be opened in a new tab
    const testee3ViewPage = new ViewPagePO(appPO, {viewId: 'view.103'});
    await expect(appPO.views()).toHaveCount(4);
    await expect.poll(() => testee3ViewPage.getViewParams()).toMatchObject({optionalParam: 'value3', requiredParam: 'value2'});
    await expectView(testee3ViewPage).toBeActive();

    // update present testee views
    await routerPage.view.tab.click();
    await routerPage.enterTarget(undefined);
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({optionalParam: 'value4', requiredParam: 'value1'});
    await routerPage.clickNavigate();

    // expect testee views to be updated
    await expect(appPO.views()).toHaveCount(4);
    await testee1ViewPage.view.tab.click();
    await expect.poll(() => testee1ViewPage.getViewParams()).toMatchObject({optionalParam: 'value4', requiredParam: 'value1'});
    await testee2ViewPage.view.tab.click();
    await expect.poll(() => testee2ViewPage.getViewParams()).toMatchObject({optionalParam: 'value4', requiredParam: 'value1'});
    await testee3ViewPage.view.tab.click();
    await expect.poll(() => testee3ViewPage.getViewParams()).toMatchObject({optionalParam: 'value3', requiredParam: 'value2'});
  });

  test('should open all views matching the qualifier', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      private: false,
      properties: {
        path: 'test-view',
        title: 'testee 1',
        cssClass: 'testee-1',
      },
    });

    await microfrontendNavigator.registerCapability('app2', {
      type: 'view',
      qualifier: {component: 'testee'},
      private: false,
      properties: {
        path: 'test-view',
        title: 'testee 2',
        cssClass: 'testee-2',
      },
    });

    await microfrontendNavigator.registerIntention('app1', {type: 'view', qualifier: {component: 'testee'}});

    // navigate to the testee view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();
    await routerPage.view.tab.close();

    const testee1ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-1'});
    const testee2ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-2'});

    // expect testee views to be opened as new tab
    await expect(appPO.views()).toHaveCount(2);

    // expect either testee-1 or testee-2 view to be active, but not both.
    let i = 0;
    await expect(async () => {
      if (i++ % 2) {
        await expectView(testee1ViewPage).toBeActive();
        await expectView(testee2ViewPage).toBeInactive();
      }
      else {
        await expectView(testee1ViewPage).toBeInactive();
        await expectView(testee2ViewPage).toBeActive();
      }
    }).toPass();
  });

  test('should reuse the same app instance when navigating between views of an app in the same view tab', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-pages/view-test-page/view1',
        title: 'Testee 1',
        cssClass: 'testee-1',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-pages/view-test-page/view2',
        title: 'Testee 2',
        cssClass: 'testee-2',
      },
    });

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
    const testeeViewPage1 = new ViewPagePO(appPO, {cssClass: 'testee-1'});
    const testeeViewPage2 = new ViewPagePO(appPO, {cssClass: 'testee-2'});

    const componentInstanceIds = new Set<string>();

    // navigate to testee-1 view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee-1'});
    await routerPage.enterTarget('view.100');
    await routerPage.clickNavigate();

    await expectView(testeeViewPage1).toBeActive();

    // capture the app instance id
    const appInstanceId = await testeeViewPage.getAppInstanceId();
    componentInstanceIds.add(await testeeViewPage.getComponentInstanceId());

    // navigate to the testee-2 view
    await routerPage.view.tab.click();
    await routerPage.enterQualifier({component: 'testee-2'});
    await routerPage.enterTarget('view.100');
    await routerPage.clickNavigate();
    await testeeViewPage.view.tab.click();

    // expect the correct view to display
    await expectView(testeeViewPage1).not.toBeAttached();
    await expectView(testeeViewPage2).toBeActive();

    // expect application not to start anew
    await expect.poll(() => testeeViewPage.getAppInstanceId()).toEqual(appInstanceId);
    // expect a different component instance id
    expect(componentInstanceIds.add(await testeeViewPage.getComponentInstanceId()).size).toEqual(2);

    // navigate to the testee-1 view
    await routerPage.view.tab.click();
    await routerPage.enterQualifier({component: 'testee-1'});
    await routerPage.enterTarget('view.100');
    await routerPage.clickNavigate();
    await testeeViewPage.view.tab.click();

    // expect the correct view to display
    await expectView(testeeViewPage1).toBeActive();
    await expectView(testeeViewPage2).not.toBeAttached();
    // expect application not to start anew
    await expect.poll(() => testeeViewPage.getAppInstanceId()).toEqual(appInstanceId);
    // expect a different component instance id
    expect(componentInstanceIds.add(await testeeViewPage.getComponentInstanceId()).size).toEqual(3);

    // navigate to the testee-2 view
    await routerPage.view.tab.click();
    await routerPage.enterQualifier({component: 'testee-2'});
    await routerPage.enterTarget('view.100');
    await routerPage.clickNavigate();
    await testeeViewPage.view.tab.click();

    // expect the correct view to display
    await expectView(testeeViewPage1).not.toBeAttached();
    await expectView(testeeViewPage2).toBeActive();
    // expect application not to start anew
    await expect.poll(() => testeeViewPage.getAppInstanceId()).toEqual(appInstanceId);
    // expect a different component instance id
    expect(componentInstanceIds.add(await testeeViewPage.getComponentInstanceId()).size).toEqual(4);
  });

  test('should open microfrontend with empty path', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee', path: 'empty'},
      properties: {
        path: '',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate to the view with `empty` as path
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee', path: 'empty'});
    await routerPage.clickNavigate();

    // expect the view to display the component that is associated with the empty route
    const testeeViewPage = new MicrofrontendViewTestPagePO(appPO, {cssClass: 'testee'});
    await expectView(testeeViewPage).toBeActive();
  });

  test('should not open views if missing the view provider', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });

    // navigate to the view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee');
    await routerPage.clickNavigate();

    // expect the view to be present
    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(2);

    // reload the app; after the reload, the view is not registered anymore, as registered dynamically at runtime
    await appPO.reload();

    // expect the view not to be present
    await expectView(testeeViewPage).not.toBeAttached();
    await expect(appPO.views()).toHaveCount(1);
    await expect.poll(() => consoleLogs.get({severity: 'warning', message: /NullCapabilityError/})).not.toEqual([]);
  });

  test('should open views as contained in the URL on initial navigation', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // open 2 views
    const viewPage1 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
    const viewPage2 = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app2');

    // reload the app
    await appPO.reload();

    // expect the views to be present
    await expect(appPO.views()).toHaveCount(2);
    await expectView(viewPage1).toBeInactive();
    await expectView(viewPage2).toBeActive();
  });

  test('should load microfrontends of inactive views on initial navigation', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // navigate to the view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'view', app: 'app1'});
    await routerPage.enterParams({initialTitle: 'INITIAL TITLE 1'});
    await routerPage.checkActivate(false);
    await routerPage.enterTarget('view.101');
    await routerPage.clickNavigate();

    // navigate to the view
    await routerPage.enterQualifier({component: 'view', app: 'app1'});
    await routerPage.enterParams({initialTitle: 'INITIAL TITLE 2'});
    await routerPage.enterTarget('view.102');
    await routerPage.checkActivate(true);
    await routerPage.clickNavigate();

    const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.102'});

    // wait for views to be opened before reloading the application
    await expect(appPO.views()).toHaveCount(3);

    // reload the app
    await appPO.reload();

    // expect views to be present
    await expect(appPO.views()).toHaveCount(3);
    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeInactive();
    await expectView(testee2ViewPage).toBeActive();

    // expect view microfrontends to have set their initial title
    await expect(testee1ViewPage.view.tab.title).toHaveText('INITIAL TITLE 1');
    await expect(testee2ViewPage.view.tab.title).toHaveText('INITIAL TITLE 2');
  });

  test('should set view properties upon initial view tab navigation', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

    await microfrontendNavigator.registerCapability('app1', {
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
    const testeeView = appPO.view({cssClass: 'testee'});
    await expect(testeeView.tab.title).toHaveText('VIEW TITLE');
    await expect(testeeView.tab.heading).toHaveText('VIEW HEADING');
    await expect.poll(() => testeeView.tab.getCssClasses()).toEqual(expect.arrayContaining(['testee', 'class-1', 'class-2']));
  });

  test('should set view properties upon initial view tab navigation when replacing an existing workbench view', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

    await microfrontendNavigator.registerCapability('app1', {
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
    await expect(viewPage.view.tab.title).toHaveText('WORKBENCH VIEW TITLE');

    // navigate to the testee view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget(await viewPage.view.getViewId());
    await routerPage.clickNavigate();

    // expect view properties to be set
    const testeeView = appPO.view({cssClass: 'testee'});
    await expect(testeeView.tab.title).toHaveText('VIEW TITLE');
    await expect(testeeView.tab.heading).toHaveText('VIEW HEADING');
    await expect.poll(() => testeeView.tab.getCssClasses()).toEqual(expect.arrayContaining(['testee', 'class-1', 'class-2']));
  });

  test('should set view properties when navigating in the current view tab', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

    await microfrontendNavigator.registerCapability('app1', {
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

    await microfrontendNavigator.registerCapability('app1', {
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
    await expect(testeeView.tab.title).toHaveText('VIEW TITLE 1');
    await expect(testeeView.tab.heading).toHaveText('VIEW HEADING 1');
    await expect.poll(() => testeeView.tab.getCssClasses()).toEqual(expect.arrayContaining(['testee-1', 'class-1']));
    await expect(testeeView.tab.closeButton).toBeVisible();

    // navigate to the testee-2 view
    await routerPage.view.tab.click();
    await routerPage.enterQualifier({component: 'testee-2'});
    await routerPage.enterTarget(testeeViewId);
    await routerPage.clickNavigate();

    // expect view properties to be set
    await testeeView.tab.click();
    await expect(testeeView.tab.title).toHaveText('VIEW TITLE 2');
    await expect(testeeView.tab.heading).toHaveText('VIEW HEADING 2');
    await expect.poll(() => testeeView.tab.getCssClasses()).toEqual(expect.arrayContaining(['testee-2', 'class-2']));
    await expect(testeeView.tab.closeButton).not.toBeVisible();
  });

  test('should not set view properties when performing self navigation, e.g., when updating view params', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

    await microfrontendNavigator.registerCapability('app1', {
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

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    // expect view properties to be set
    await expect(testeeViewPage.view.tab.title).toHaveText('VIEW TITLE');
    await expect(testeeViewPage.view.tab.heading).toHaveText('VIEW HEADING');
    await expect.poll(() => testeeViewPage.view.tab.getCssClasses()).toEqual(expect.arrayContaining(['testee', 'class-1']));

    // update view properties
    await testeeViewPage.enterTitle('UPDATED VIEW TITLE');
    await testeeViewPage.enterHeading('UPDATED VIEW HEADING');

    // perform self navigation by setting view params
    await routerPage.view.tab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget(await testeeViewPage.view.getViewId());
    await routerPage.enterParams({param1: 'PARAM 1'});
    await routerPage.clickNavigate();

    // expect view properties not be updated
    await testeeViewPage.view.tab.click();
    await expect(testeeViewPage.view.tab.title).toHaveText('UPDATED VIEW TITLE');
    await expect(testeeViewPage.view.tab.heading).toHaveText('UPDATED VIEW HEADING');
    await expect.poll(() => testeeViewPage.view.tab.getCssClasses()).toEqual(expect.arrayContaining(['testee', 'class-1']));
    await expect.poll(() => testeeViewPage.getViewParams()).toMatchObject({param1: 'PARAM 1'});
  });

  test('should not unset the dirty state when performing self navigation, e.g., when updating view params', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
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

    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    // mark the view dirty
    await testeeViewPage.markDirty();

    // perform self navigation by setting view params
    await routerPage.view.tab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget(await testeeViewPage.view.getViewId());
    await routerPage.enterParams({param1: 'PARAM 1'});
    await routerPage.clickNavigate();

    // expect the view to still be dirty
    await testeeViewPage.view.tab.click();
    await expect.poll(() => testeeViewPage.view.tab.isDirty()).toBe(true);
  });

  test('should make the view pristine when navigating to another view in the current view tab', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee-1'},
      properties: {
        path: 'test-view',
        title: 'testee-1',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee-2'},
      properties: {
        path: 'test-view',
        title: 'testee-2',
      },
    });

    // navigate to the testee-1 view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee-1'});
    await routerPage.enterTarget('view.99');
    await routerPage.clickNavigate();

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.99'});

    // mark the view dirty
    await testeeViewPage.markDirty();
    await expect.poll(() => testeeViewPage.view.tab.isDirty()).toBe(true);

    // navigate to another view in the testee view tab
    await routerPage.view.tab.click();
    await routerPage.enterQualifier({component: 'testee-2'});
    await routerPage.enterTarget('view.99');
    await routerPage.clickNavigate();

    // expect the view to be pristine
    await testeeViewPage.view.tab.click();
    await expect.poll(() => testeeViewPage.view.tab.isDirty()).toBe(false);
  });

  test('should close the view when removing the capability', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const capability = await microfrontendNavigator.registerCapability('app1', {
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
    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(2);

    // unregister the capability
    await microfrontendNavigator.unregisterCapability('app1', capability.metadata!.id);

    // expect the view not to be present
    await expectView(testeeViewPage).not.toBeAttached();
    await expectView(routerPage).toBeActive();
    await expect(appPO.views()).toHaveCount(1);
    await expect.poll(() => consoleLogs.get({severity: 'warning', message: /NullCapabilityError/})).not.toEqual([]);
  });

  test('should allow closing a single view by qualifier', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
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
    await expect(appPO.views()).toHaveCount(2);

    // close the view via router
    await routerPage.view.tab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterTarget(undefined);
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

    // expect the view to be closed
    await expect(appPO.views()).toHaveCount(1);
  });

  test('should reject closing a single view by viewId', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
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

    const testeeViewId = await appPO.view({cssClass: 'testee'}).getViewId();

    // expect the views to be present
    await expect(appPO.views()).toHaveCount(2);

    // close the view by viewId via router
    await routerPage.view.tab.click();
    await routerPage.enterTarget(testeeViewId);
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.checkClose(true);

    // expect closing to be rejected
    await expect(routerPage.clickNavigate()).rejects.toThrow(/\[NavigateError]/);
    await expect(appPO.views()).toHaveCount(2);
  });

  test('should allow closing all views of the same qualifier', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee-1',
      },
    });

    await microfrontendNavigator.registerCapability('app2', {
      type: 'view',
      qualifier: {component: 'testee'},
      private: false,
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee-2',
      },
    });

    await microfrontendNavigator.registerIntention('app1', {type: 'view', qualifier: {component: 'testee'}});

    // navigate to the view from within app 1 (two views are opened)
    const routerPage1 = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage1.enterQualifier({component: 'testee'});
    await routerPage1.enterTarget('blank');
    await routerPage1.clickNavigate();

    // navigate to the view from within app 1 (two views are opened)
    await routerPage1.view.tab.click();
    await routerPage1.enterQualifier({component: 'testee'});
    await routerPage1.enterTarget('blank');
    await routerPage1.clickNavigate();

    // navigate to the view from within app 2 (one view is opened)
    const routerPage2 = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app2');
    await routerPage2.enterQualifier({component: 'testee'});
    await routerPage2.enterTarget('blank');
    await routerPage2.clickNavigate();
    await routerPage2.view.tab.close();

    // expect the views to be present
    await expect(appPO.views()).toHaveCount(6);

    // close the views via router
    await routerPage1.view.tab.click();
    await routerPage1.enterTarget(undefined);
    await routerPage1.enterQualifier({component: 'testee'});
    await routerPage1.checkClose(true);
    await routerPage1.clickNavigate();

    // expect the views to be closed
    await expect(appPO.views()).toHaveCount(1);
    await expectView(routerPage1).toBeActive();
  });

  test('should not close private views of other apps', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });

    await microfrontendNavigator.registerCapability('app2', {
      type: 'view',
      qualifier: {component: 'testee'},
      private: true, // PRIVATE
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });

    await microfrontendNavigator.registerIntention('app1', {type: 'view', qualifier: {component: 'testee'}});

    // navigate to the view 1 of app 1
    const routerPage1 = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage1.enterQualifier({component: 'testee'});
    await routerPage1.enterTarget('blank');
    await routerPage1.enterCssClass('testee-1');
    await routerPage1.clickNavigate();

    // navigate to the view 2 of app 1
    await routerPage1.view.tab.click();
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
    await routerPage2.view.tab.close();

    // expect the views to be present
    await expect(appPO.views()).toHaveCount(4);

    // close the views via router
    await routerPage1.view.tab.click();
    await routerPage1.enterTarget(undefined);
    await routerPage1.enterQualifier({component: 'testee'});
    await routerPage1.checkClose(true);
    await routerPage1.clickNavigate();

    const testee1ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-1'});
    const testee2ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-2'});
    const testee3ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-3'});

    // expect only the views of app 1 to be closed
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage1).toBeActive();
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).not.toBeAttached();
    await expectView(testee3ViewPage).toBeInactive();
  });

  test('should not close public views of other apps if missing the intention', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });

    await microfrontendNavigator.registerCapability('app2', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });

    // navigate to the view 1 of app 1
    const routerPage1 = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage1.enterQualifier({component: 'testee'});
    await routerPage1.enterTarget('blank');
    await routerPage1.enterCssClass('testee-1');
    await routerPage1.clickNavigate();

    // navigate to the view 2 of app 1
    await routerPage1.view.tab.click();
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
    await routerPage2.view.tab.close();

    // expect the views to be present
    await expect(appPO.views()).toHaveCount(4);

    // close the views via router
    await routerPage1.view.tab.click();
    await routerPage1.enterTarget(undefined);
    await routerPage1.enterQualifier({component: 'testee'});
    await routerPage1.checkClose(true);
    await routerPage1.clickNavigate();

    const testee1ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-1'});
    const testee2ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-2'});
    const testee3ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-3'});

    // expect only the views of app 1 to be closed
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage1).toBeActive();
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).not.toBeAttached();
    await expectView(testee3ViewPage).toBeInactive();
  });

  test('should allow closing all views of the same qualifier and a required param (seg1: 1)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
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

    // navigate to the view 1
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '1'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-1');
    await routerPage.clickNavigate();

    // navigate to the view 2
    await routerPage.view.tab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '2'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-2');
    await routerPage.clickNavigate();

    // expect the views to be present
    await expect(appPO.views()).toHaveCount(3);

    // close the view 1 via router
    await routerPage.view.tab.click();
    await routerPage.enterTarget(undefined);
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '1'});
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

    const testee1ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-1'});
    const testee2ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-2'});

    // expect the view 1 to be closed
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeActive();
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).toBeInactive();
  });

  test('should allow closing all views of the same qualifier and a wildcard required param (seg1: *)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
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

    // navigate to the view 1
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '1'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    // navigate to the view 2
    await routerPage.view.tab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '2'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    // expect the views to be present
    await expect(appPO.views()).toHaveCount(3);

    // close the views via router
    await routerPage.view.tab.click();
    await routerPage.enterTarget(undefined);
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '*'});
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

    // expect the views to be closed
    await expect(appPO.views()).toHaveCount(1);
  });

  test('should allow closing all views of the same qualifier and multiple required params (seg1: 1, seg2: 1)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
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

    // navigate to the view 1
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '1', seg2: '1'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-1');
    await routerPage.clickNavigate();

    // navigate to the view 2
    await routerPage.view.tab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '1', seg2: '2'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-2');
    await routerPage.clickNavigate();

    // navigate to the view 3
    await routerPage.view.tab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '2', seg2: '1'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-3');
    await routerPage.clickNavigate();

    // navigate to the view 4
    await routerPage.view.tab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '2', seg2: '2'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-4');
    await routerPage.clickNavigate();

    // expect the views to be present
    await expect(appPO.views()).toHaveCount(5);

    // close the view 1 via router
    await routerPage.view.tab.click();
    await routerPage.enterTarget(undefined);
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '1', seg2: '1'});
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

    const testee1ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-1'});
    const testee2ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-2'});
    const testee3ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-3'});
    const testee4ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-4'});

    // expect the view to be closed
    await expect(appPO.views()).toHaveCount(4);
    await expectView(routerPage).toBeActive();
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).toBeInactive();
    await expectView(testee3ViewPage).toBeInactive();
    await expectView(testee4ViewPage).toBeInactive();
  });

  test('should allow closing all views of the same qualifier and one wildcard and one non-wildcard required params (seg1: *, seg2: 1)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
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

    // navigate to the view 1
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '1', seg2: '1'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-1');
    await routerPage.clickNavigate();

    // navigate to the view 2
    await routerPage.view.tab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '1', seg2: '2'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-2');
    await routerPage.clickNavigate();

    // navigate to the view 3
    await routerPage.view.tab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '2', seg2: '1'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-3');
    await routerPage.clickNavigate();

    // navigate to the view 4
    await routerPage.view.tab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '2', seg2: '2'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-4');
    await routerPage.clickNavigate();

    // expect the view to be present
    await expect(appPO.views()).toHaveCount(5);

    // close the views 1 and 3 via router
    await routerPage.view.tab.click();
    await routerPage.enterTarget(undefined);
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '*', seg2: '1'});
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

    const testee3ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-3'});
    const testee1ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-1'});
    const testee2ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-2'});
    const testee4ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-4'});

    // expect the view to be closed
    await expect(appPO.views()).toHaveCount(3);
    await expectView(routerPage).toBeActive();
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).toBeInactive();
    await expectView(testee3ViewPage).not.toBeAttached();
    await expectView(testee4ViewPage).toBeInactive();
  });

  test('should allow closing all views of the same qualifier and multiple wildcard required params (seg1: *, seg2: *)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
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

    // navigate to the view 1
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '1', seg2: '1'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-1');
    await routerPage.clickNavigate();

    // navigate to the view 2
    await routerPage.view.tab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '1', seg2: '2'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-2');
    await routerPage.clickNavigate();

    // navigate to the view 3
    await routerPage.view.tab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '2', seg2: '1'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-3');
    await routerPage.clickNavigate();

    // navigate to the view 4
    await routerPage.view.tab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '2', seg2: '2'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-4');
    await routerPage.clickNavigate();

    // expect the view to be present
    await expect(appPO.views()).toHaveCount(5);

    // close the view via router
    await routerPage.view.tab.click();
    await routerPage.enterTarget(undefined);
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '*', seg2: '*'});
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

    const testee1ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-1'});
    const testee2ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-2'});
    const testee3ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-3'});
    const testee4ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-4'});

    // expect the view to be closed
    await expect(appPO.views()).toHaveCount(1);
    await expectView(routerPage).toBeActive();
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).not.toBeAttached();
    await expectView(testee3ViewPage).not.toBeAttached();
    await expectView(testee4ViewPage).not.toBeAttached();
  });

  test('should not close views of a different qualifier that require the same parameters', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
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
    await microfrontendNavigator.registerCapability('app1', {
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

    // navigate to the view 1
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee-1'});
    await routerPage.enterParams({seg1: '1', seg2: '1'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-1');
    await routerPage.clickNavigate();

    // navigate to the view 2
    await routerPage.view.tab.click();
    await routerPage.enterQualifier({component: 'testee-1'});
    await routerPage.enterParams({seg1: '1', seg2: '2'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-2');
    await routerPage.clickNavigate();

    // navigate to the view 3
    await routerPage.view.tab.click();
    await routerPage.enterQualifier({component: 'testee-2'});
    await routerPage.enterParams({seg1: '1', seg2: '1'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-3');
    await routerPage.clickNavigate();

    // navigate to the view 4
    await routerPage.view.tab.click();
    await routerPage.enterQualifier({component: 'testee-2'});
    await routerPage.enterParams({seg1: '1', seg2: '2'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-4');
    await routerPage.clickNavigate();

    // expect the view to be present
    await expect(appPO.views()).toHaveCount(5);

    // close the view via router
    await routerPage.view.tab.click();
    await routerPage.enterTarget(undefined);
    await routerPage.enterQualifier({component: 'testee-1'});
    await routerPage.enterParams({seg1: '*', seg2: '*'});
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

    const testee1ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-1'});
    const testee2ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-2'});
    const testee3ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-3'});
    const testee4ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-4'});

    // expect the view to be closed
    await expect(appPO.views()).toHaveCount(3);
    await expectView(routerPage).toBeActive();
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).not.toBeAttached();
    await expectView(testee3ViewPage).toBeInactive();
    await expectView(testee4ViewPage).toBeInactive();
  });

  test('should ignore optional params when matching views for closing', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
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

    // navigate to the view 1
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '1', opt: 'opt-1'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-1');
    await routerPage.clickNavigate();

    // navigate to the view 2
    await routerPage.view.tab.click();
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '2', opt: 'opt-2'});
    await routerPage.enterTarget('blank');
    await routerPage.enterCssClass('testee-2');
    await routerPage.clickNavigate();

    // expect the views to be present
    await expect(appPO.views()).toHaveCount(3);

    // close the views via router
    await routerPage.view.tab.click();
    await routerPage.enterTarget(undefined);
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({seg1: '*', opt: 'opt-3'});
    await routerPage.checkClose(true);
    await routerPage.clickNavigate();

    const testee1ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-1'});
    const testee2ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-2'});

    // expect the views to be closed
    await expect(appPO.views()).toHaveCount(1);
    await expectView(routerPage).toBeActive();
    await expectView(testee1ViewPage).not.toBeAttached();
    await expectView(testee2ViewPage).not.toBeAttached();
  });

  /**
   * When having loaded microfrontend 1 of an app, and when then navigating to microfrontend 2 of that app, and when then self-navigating
   * in microfrontend-2 upon its construction, the router should not navigate back to microfrontend 1.
   */
  test('should not navigate back to the previous microfrontend when self-navigating upon microfrontend construction', async ({appPO, microfrontendNavigator}) => {
    test.slow(); // increase timeout because this test simulates slow capability lookup
    await appPO.navigateTo({microfrontendSupport: true, simulateSlowCapabilityLookup: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'microfrontend-1'},
      properties: {
        path: 'test-pages/view-test-page/view1',
        title: 'Microfrontend 1',
        cssClass: 'microfrontend-1',
      },
    });

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'microfrontend-2'},
      properties: {
        path: 'test-pages/view-test-page/view2',
        title: 'Microfrontend 2',
        cssClass: 'microfrontend-2',
      },
    });

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.99'});

    // navigate to microfrontend-1 view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'microfrontend-1'});
    await routerPage.enterTarget('view.99');
    await routerPage.clickNavigate();

    // Assert the correct capability to be loaded
    await expect(testeeViewPage.path).toHaveText('/test-pages/view-test-page/view1');

    // navigate to microfrontend-2 view
    await routerPage.view.tab.click();
    await routerPage.enterQualifier({component: 'microfrontend-2'});
    await routerPage.enterTarget('view.99');
    await routerPage.clickNavigate();

    // self-navigate in microfrontend-2 view
    await testeeViewPage.view.tab.click();
    await testeeViewPage.navigateSelf({param: 'PARAM'});
    await expect(testeeViewPage.path).toHaveText('/test-pages/view-test-page/view2');
  });

  test('should propagate navigation error back to caller if navigation fails', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app2', {
      type: 'view',
      qualifier: {component: 'testee'},
      private: false, // PUBLIC
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    await microfrontendNavigator.registerIntention('app1', {type: 'view', qualifier: {component: 'testee'}});

    // navigate to the testee view in app 1
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({view: 'testee'});  // invalid qualifier
    await routerPage.enterTarget('blank');
    await expect(routerPage.clickNavigate()).rejects.toThrow(/\[NotQualifiedError] Application 'workbench-client-testing-app1' is not qualified/);

    // expect testee view not to be opened
    const testeeViewPage = new ViewPagePO(appPO, {cssClass: 'testee'});
    await expect(appPO.views()).toHaveCount(1);
    await expectView(routerPage).toBeActive();
    await expectView(testeeViewPage).not.toBeAttached();
  });

  test('should substitute named parameter in title/heading property of view capability', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

    await microfrontendNavigator.registerCapability('app1', {
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

    const testeeView = appPO.view({cssClass: 'testee'});
    await expect(testeeView.tab.title).toHaveText('Title Param');
    await expect(testeeView.tab.heading).toHaveText('Heading Param');
  });

  test('should substitute named parameters in title/heading property of view capability', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {name: 'param1', required: false},
        {name: 'param2', required: false},
      ],
      properties: {
        path: 'test-pages/microfrontend-test-page',
        title: ':param1/:param2/:param3',
        heading: ':param1 :param2 :param3',
        cssClass: 'testee',
      },
    });

    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee'});
    await routerPage.enterParams({param1: 'value1', param2: 'value2'});
    await routerPage.enterCssClass('testee');
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    const testeeView = appPO.view({cssClass: 'testee'});
    await expect(testeeView.tab.title).toHaveText('value1/value2/:param3');
    await expect(testeeView.tab.heading).toHaveText('value1 value2 :param3');
  });
});
