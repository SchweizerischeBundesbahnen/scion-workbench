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
import {PageNotFoundPagePO} from '../workbench/page-object/page-not-found-page.po';
import {ViewInfo} from '../workbench/page-object/view-info-dialog.po';

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
      },
    });

    // navigate to the testee view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.100',
    });

    // expect testee view to be opened as new tab
    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
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
      },
    });

    // navigate to the testee view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.100',
    });

    // expect testee view to be opened as new tab
    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
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
      },
    });

    await microfrontendNavigator.registerIntention('app1', {type: 'view', qualifier: {component: 'testee'}});

    // navigate to the testee view in app 1
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await expect(routerPage.navigate({component: 'testee'}, {
      target: 'view.100',
    })).rejects.toThrow(/NullProviderError/);

    // expect testee view not to be opened
    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
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
      },
    });

    await microfrontendNavigator.registerIntention('app1', {type: 'view', qualifier: {component: 'testee'}});

    // navigate to the testee view in app 1
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.100',
    });

    // expect testee view not to be opened
    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
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
      },
    });

    // navigate to the testee view in app 1
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await expect(routerPage.navigate({component: 'testee'}, {
      target: 'view.100',
    })).rejects.toThrow(/NotQualifiedError/);

    // expect testee view not to be opened
    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
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
      },
    });

    // navigate to the testee view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.100',
    });

    // expect testee view to be opened as new tab
    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
    await expect(appPO.views()).toHaveCount(2);
    await expectView(testeeViewPage).toBeActive();

    // activate router page
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      target: 'blank',
    });

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
      },
    });

    // navigate to the testee view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    const routerPageId = await routerPage.view.getViewId();
    await routerPage.navigate({component: 'testee'}, {
      target: routerPageId,
    });

    const testeeViewPage = new ViewPagePO(appPO, {viewId: routerPageId});

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
    await routerPage.navigate({component: 'testee'}, {
      target: 'auto',
      params: {param: 'value1'},
      cssClass: 'testee-1',
    });

    const testee1ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-1'});

    // expect testee-1 view to be opened in a new tab
    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(2);
    await expect.poll(() => testee1ViewPage.view.getViewId()).not.toEqual(routerPageId);

    // activate router page
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      target: 'auto',
      params: {param: 'value2'},
      cssClass: 'testee-2',
    });

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
      },
    });

    // navigate to the testee view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.100',
      params: {param: 'value1'},
    });

    // expect testee view to be opened in a new tab
    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
    await expect(appPO.views()).toHaveCount(2);
    await expect.poll(() => testeeViewPage.getViewParams()).toMatchObject({param: 'value1'});
    await expectView(testeeViewPage).toBeActive();

    // activate router page
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      params: {param: 'value2'},
    });

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
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.101',
      params: {param: 'value1'},
    });

    // expect testee-1 view to be opened in a new tab
    const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    await expect(appPO.views()).toHaveCount(2);
    await expect.poll(() => testee1ViewPage.getViewParams()).toMatchObject({param: 'value1'});
    await expectView(testee1ViewPage).toBeActive();

    // navigate to the testee-2 view
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.102',
      params: {param: 'value2'},
    });

    // expect testee-2 view to be opened in a new tab
    const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.102'});
    await expect(appPO.views()).toHaveCount(3);
    await expect.poll(() => testee2ViewPage.getViewParams()).toMatchObject({param: 'value2'});
    await expectView(testee2ViewPage).toBeActive();

    // update present testee views
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      params: {param: 'value3'},
    });

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
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.101',
      params: {optionalParam: 'value1', requiredParam: 'value1'},
    });

    // expect testee-1 view to be opened in a new tab
    const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    await expect(appPO.views()).toHaveCount(2);
    await expect.poll(() => testee1ViewPage.getViewParams()).toMatchObject({optionalParam: 'value1', requiredParam: 'value1'});
    await expectView(testee1ViewPage).toBeActive();

    // navigate to the testee-2 view
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.102',
      params: {optionalParam: 'value2', requiredParam: 'value1'},
    });

    // expect testee-2 view to be opened in a new tab
    const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.102'});
    await expect(appPO.views()).toHaveCount(3);
    await expect.poll(() => testee2ViewPage.getViewParams()).toMatchObject({optionalParam: 'value2', requiredParam: 'value1'});
    await expectView(testee2ViewPage).toBeActive();

    // navigate to the testee-3 view
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.103',
      params: {optionalParam: 'value3', requiredParam: 'value2'},
    });

    // expect testee-3 view to be opened in a new tab
    const testee3ViewPage = new ViewPagePO(appPO, {viewId: 'view.103'});
    await expect(appPO.views()).toHaveCount(4);
    await expect.poll(() => testee3ViewPage.getViewParams()).toMatchObject({optionalParam: 'value3', requiredParam: 'value2'});
    await expectView(testee3ViewPage).toBeActive();

    // update present testee views
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      target: 'auto',
      params: {optionalParam: 'value4', requiredParam: 'value1'},
    });

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
    await routerPage.navigate({component: 'testee'}, {
      params: {param: 'value1'},
      cssClass: 'testee-1',
    });

    // expect testee-1 view to be opened in a new tab
    const testee1ViewPage = new ViewPagePO(appPO, {cssClass: 'testee-1'});
    await expect(appPO.views()).toHaveCount(2);
    await expectView(routerPage).toBeInactive();
    await expectView(testee1ViewPage).toBeActive();
    await expect.poll(() => testee1ViewPage.view.getViewId()).not.toEqual(await routerPage.view.getViewId());

    // activate router page
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      params: {param: 'value2'},
      cssClass: 'testee-2',
    });

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
      },
    });

    // navigate to the testee view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.100',
      params: {param: 'value1'},
    });

    // expect testee view to be opened in a new tab
    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
    await expect(appPO.views()).toHaveCount(2);
    await expect.poll(() => testeeViewPage.getViewParams()).toMatchObject({param: 'value1'});
    await expectView(testeeViewPage).toBeActive();

    // activate router page
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      params: {param: 'value2'},
    });

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
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.101',
      params: {param: 'value1'},
    });

    // expect testee-1 view to be opened in a new tab
    const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    await expect(appPO.views()).toHaveCount(2);
    await expect.poll(() => testee1ViewPage.getViewParams()).toMatchObject({param: 'value1'});
    await expectView(testee1ViewPage).toBeActive();

    // navigate to the testee-2 view
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.102',
      params: {param: 'value2'},
    });

    // expect testee-2 view to be opened in a new tab
    const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.102'});
    await expect(appPO.views()).toHaveCount(3);
    await expect.poll(() => testee2ViewPage.getViewParams()).toMatchObject({param: 'value2'});
    await expectView(testee2ViewPage).toBeActive();

    // update present testee views
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      params: {param: 'value3'},
    });

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
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.101',
      params: {optionalParam: 'value1', requiredParam: 'value1'},
    });

    // expect testee-1 view to be opened in a new tab
    const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    await expect(appPO.views()).toHaveCount(2);
    await expect.poll(() => testee1ViewPage.getViewParams()).toMatchObject({optionalParam: 'value1', requiredParam: 'value1'});
    await expectView(testee1ViewPage).toBeActive();

    // navigate to the testee-2 view
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.102',
      params: {optionalParam: 'value2', requiredParam: 'value1'},
    });

    // expect testee-2 view to be opened in a new tab
    const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.102'});
    await expect(appPO.views()).toHaveCount(3);
    await expect.poll(() => testee2ViewPage.getViewParams()).toMatchObject({optionalParam: 'value2', requiredParam: 'value1'});
    await expectView(testee2ViewPage).toBeActive();

    // navigate to the testee-3 view
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.103',
      params: {optionalParam: 'value3', requiredParam: 'value2'},
    });

    // expect testee-3 view to be opened in a new tab
    const testee3ViewPage = new ViewPagePO(appPO, {viewId: 'view.103'});
    await expect(appPO.views()).toHaveCount(4);
    await expect.poll(() => testee3ViewPage.getViewParams()).toMatchObject({optionalParam: 'value3', requiredParam: 'value2'});
    await expectView(testee3ViewPage).toBeActive();

    // update present testee views
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      params: {optionalParam: 'value4', requiredParam: 'value1'},
    });

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
    await routerPage.navigate({component: 'testee'}, {
      target: 'blank',
    });
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
        await expectView(testee2ViewPage).toBeInactive({loaded: false});
      }
      else {
        await expectView(testee1ViewPage).toBeInactive({loaded: false});
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
    await routerPage.navigate({component: 'testee-1'}, {
      target: 'view.100',
    });

    await expectView(testeeViewPage1).toBeActive();

    // capture the app instance id
    const appInstanceId = await testeeViewPage.getAppInstanceId();
    componentInstanceIds.add(await testeeViewPage.getComponentInstanceId());

    // navigate to the testee-2 view
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee-2'}, {
      target: 'view.100',
    });
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
    await routerPage.navigate({component: 'testee-1'}, {
      target: 'view.100',
    });
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
    await routerPage.navigate({component: 'testee-2'}, {
      target: 'view.100',
    });
    await testeeViewPage.view.tab.click();

    // expect the correct view to display
    await expectView(testeeViewPage1).not.toBeAttached();
    await expectView(testeeViewPage2).toBeActive();
    // expect application not to start anew
    await expect.poll(() => testeeViewPage.getAppInstanceId()).toEqual(appInstanceId);
    // expect a different component instance id
    expect(componentInstanceIds.add(await testeeViewPage.getComponentInstanceId()).size).toEqual(4);
  });

  test('should open microfrontend with empty-path', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee', path: 'empty'},
      properties: {
        path: '',
        title: 'testee',
      },
    });

    // navigate to the view with `empty` as path
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee', path: 'empty'}, {
      target: 'view.100',
    });

    // expect the view to display the component that is associated with the empty route
    const testeeViewPage = new MicrofrontendViewTestPagePO(appPO, {viewId: 'view.100'});
    await expectView(testeeViewPage).toBeActive();
  });

  test('should display "Not Found" page if missing the view provider', async ({appPO, microfrontendNavigator, consoleLogs}) => {
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
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.100',
    });

    // expect the view to be present
    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(2);

    // reload the app; after the reload, the view is not registered anymore, as registered dynamically at runtime
    await appPO.reload();

    // expect the view to display "Not Found" page
    const notFoundPage = new PageNotFoundPagePO(appPO.view({viewId: 'view.100'}));
    await expectView(notFoundPage).toBeActive();
    await expect(appPO.views()).toHaveCount(2);
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
    await expectView(viewPage1).toBeInactive({loaded: false});
    await expectView(viewPage2).toBeActive();
  });

  test('should not load microfrontends of inactive views on initial navigation', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // navigate to the view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'view', app: 'app1'}, {
      target: 'view.101',
      activate: false,
    });

    // navigate to the view
    await routerPage.navigate({component: 'view', app: 'app1'}, {
      target: 'view.102',
      activate: true,
    });

    const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.102'});

    await expectView(routerPage).toBeInactive({loaded: true});
    await expectView(testee1ViewPage).toBeInactive({loaded: false});
    await expectView(testee2ViewPage).toBeActive();

    // reload the app
    await appPO.reload();

    // expect views to be present
    await expect(appPO.views()).toHaveCount(3);
    await expectView(routerPage).toBeInactive({loaded: false});
    await expectView(testee1ViewPage).toBeInactive({loaded: false});
    await expectView(testee2ViewPage).toBeActive();
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
        cssClass: ['class-1', 'class-2'],
      },
    });

    // navigate to the testee view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.100',
    });

    // expect view properties to be set
    const testeeView = appPO.view({viewId: 'view.100'});
    await expect(testeeView.tab.title).toHaveText('VIEW TITLE');
    await expect(testeeView.tab.heading).toHaveText('VIEW HEADING');
    await expect.poll(() => testeeView.tab.getCssClasses()).toEqual(expect.arrayContaining(['class-1', 'class-2']));
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
        cssClass: ['class-1', 'class-2'],
      },
    });

    // open workbench view
    const viewPage = await workbenchNavigator.openInNewTab(WorkbenchViewPagePO);
    await viewPage.enterTitle('WORKBENCH VIEW TITLE');
    await expect(viewPage.view.tab.title).toHaveText('WORKBENCH VIEW TITLE');

    // navigate to the testee view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      target: await viewPage.view.getViewId(),
      cssClass: 'testee',
    });

    // expect view properties to be set
    const testeeView = appPO.view({cssClass: 'testee'});
    await expect(testeeView.tab.title).toHaveText('VIEW TITLE');
    await expect(testeeView.tab.heading).toHaveText('VIEW HEADING');
    await expect.poll(() => testeeView.tab.getCssClasses()).toEqual(expect.arrayContaining(['class-1', 'class-2']));
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
        cssClass: ['class-1'],
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
        cssClass: ['class-2'],
      },
    });

    // navigate to the testee-1 view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee-1'}, {
      target: 'view.100',
    });

    const testeeView = appPO.view({viewId: 'view.100'});

    // expect view properties to be set
    await expect(testeeView.tab.title).toHaveText('VIEW TITLE 1');
    await expect(testeeView.tab.heading).toHaveText('VIEW HEADING 1');
    await expect.poll(() => testeeView.tab.getCssClasses()).toEqual(expect.arrayContaining(['class-1']));
    await expect(testeeView.tab.closeButton).toBeVisible();

    // navigate to the testee-2 view
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee-2'}, {
      target: 'view.100',
    });

    // expect view properties to be set
    await testeeView.tab.click();
    await expect(testeeView.tab.title).toHaveText('VIEW TITLE 2');
    await expect(testeeView.tab.heading).toHaveText('VIEW HEADING 2');
    await expect.poll(() => testeeView.tab.getCssClasses()).toEqual(expect.arrayContaining(['class-2']));
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
        cssClass: ['class'],
      },
    });

    // navigate to the testee view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.100',
    });

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    // expect view properties to be set
    await expect(testeeViewPage.view.tab.title).toHaveText('VIEW TITLE');
    await expect(testeeViewPage.view.tab.heading).toHaveText('VIEW HEADING');
    await expect.poll(() => testeeViewPage.view.tab.getCssClasses()).toEqual(expect.arrayContaining(['class']));

    // update view properties
    await testeeViewPage.enterTitle('UPDATED VIEW TITLE');
    await testeeViewPage.enterHeading('UPDATED VIEW HEADING');

    // perform self navigation by setting view params
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.100',
      params: {param1: 'PARAM 1'},
    });

    // expect view properties not be updated
    await testeeViewPage.view.tab.click();
    await expect(testeeViewPage.view.tab.title).toHaveText('UPDATED VIEW TITLE');
    await expect(testeeViewPage.view.tab.heading).toHaveText('UPDATED VIEW HEADING');
    await expect.poll(() => testeeViewPage.view.tab.getCssClasses()).toEqual(expect.arrayContaining(['class']));
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
      },
    });

    // navigate to the testee view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.100',
    });

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    // mark the view dirty
    await testeeViewPage.markDirty();

    // perform self navigation by setting view params
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      target: await testeeViewPage.view.getViewId(),
      params: {param1: 'PARAM 1'},
    });

    // expect the view to still be dirty
    await testeeViewPage.view.tab.click();
    await expect(testeeViewPage.view.tab.state('dirty')).toBeVisible();
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
    await routerPage.navigate({component: 'testee-1'}, {
      target: 'view.99',
    });

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.99'});

    // mark the view dirty
    await testeeViewPage.markDirty();
    await expect(testeeViewPage.view.tab.state('dirty')).toBeVisible();

    // navigate to another view in the testee view tab
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee-2'}, {
      target: 'view.99',
    });

    // expect the view to be pristine
    await testeeViewPage.view.tab.click();
    await expect(testeeViewPage.view.tab.state('dirty')).not.toBeVisible();
  });

  test('should display "Not Found" page when removing the capability', async ({appPO, microfrontendNavigator, consoleLogs}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const capability = await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });

    // navigate to the view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.100',
    });

    // expect the view to be present
    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
    await expectView(testeeViewPage).toBeActive();
    await expect(appPO.views()).toHaveCount(2);

    // unregister the capability
    await microfrontendNavigator.unregisterCapability('app1', capability.metadata!.id);

    // expect the view to display "Not Found" page
    const notFoundPage = new PageNotFoundPagePO(appPO.view({viewId: 'view.100'}));
    await expectView(notFoundPage).toBeActive();
    await expectView(routerPage).toBeInactive();
    await expect(appPO.views()).toHaveCount(2);
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
      },
    });

    // navigate to the view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'});

    // expect the view to be present
    await expect(appPO.views()).toHaveCount(2);

    // close the view via router
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      close: true,
    });

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
      },
    });

    // navigate to the view
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.100',
    });

    // expect the views to be present
    await expect(appPO.views()).toHaveCount(2);

    // close the view by viewId via router
    // expect closing to be rejected
    await routerPage.view.tab.click();
    await expect(routerPage.navigate({component: 'testee'}, {
      target: 'view.100',
      close: true,
    })).rejects.toThrow(/\[NavigateError]/);
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
      },
    });

    await microfrontendNavigator.registerCapability('app2', {
      type: 'view',
      qualifier: {component: 'testee'},
      private: false,
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });

    await microfrontendNavigator.registerIntention('app1', {type: 'view', qualifier: {component: 'testee'}});

    // navigate to the view from within app 1 (two views are opened)
    const routerPage1 = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage1.navigate({component: 'testee'}, {
      target: 'blank',
    });

    // navigate to the view from within app 1 (two views are opened)
    await routerPage1.view.tab.click();
    await routerPage1.navigate({component: 'testee'}, {
      target: 'blank',
    });

    // navigate to the view from within app 2 (one view is opened)
    const routerPage2 = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app2');
    await routerPage2.navigate({component: 'testee'}, {
      target: 'blank',
    });
    await routerPage2.view.tab.close();

    // expect the views to be present
    await expect(appPO.views()).toHaveCount(6);

    // close the views via router
    await routerPage1.view.tab.click();
    await routerPage1.navigate({component: 'testee'}, {
      close: true,
    });

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
    await routerPage1.navigate({component: 'testee'}, {
      target: 'blank',
      cssClass: 'testee-1',
    });

    // navigate to the view 2 of app 1
    await routerPage1.view.tab.click();
    await routerPage1.navigate({component: 'testee'}, {
      target: 'blank',
      cssClass: 'testee-2',
    });

    // navigate to the view of app 2
    const routerPage2 = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app2');
    await routerPage2.navigate({component: 'testee'}, {
      target: 'blank',
      cssClass: 'testee-3',
    });
    await routerPage2.view.tab.close();

    // expect the views to be present
    await expect(appPO.views()).toHaveCount(4);

    // close the views via router
    await routerPage1.view.tab.click();
    await routerPage1.navigate({component: 'testee'}, {
      close: true,
    });

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
    await routerPage1.navigate({component: 'testee'}, {
      target: 'blank',
      cssClass: 'testee-1',
    });

    // navigate to the view 2 of app 1
    await routerPage1.view.tab.click();
    await routerPage1.navigate({component: 'testee'}, {
      target: 'blank',
      cssClass: 'testee-2',
    });

    // navigate to the view of app 2
    const routerPage2 = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app2');
    await routerPage2.navigate({component: 'testee'}, {
      target: 'blank',
      cssClass: 'testee-3',
    });
    await routerPage2.view.tab.close();

    // expect the views to be present
    await expect(appPO.views()).toHaveCount(4);

    // close the views via router
    await routerPage1.view.tab.click();
    await routerPage1.navigate({component: 'testee'}, {
      close: true,
    });

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
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.101',
      params: {seg1: '1'},
    });

    // navigate to the view 2
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.102',
      params: {seg1: '2'},
    });

    // expect the views to be present
    await expect(appPO.views()).toHaveCount(3);

    // close the view 1 via router
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      params: {seg1: '1'},
      close: true,
    });

    const testee1ViewPage = new ViewPagePO(appPO, {viewId: 'view.101'});
    const testee2ViewPage = new ViewPagePO(appPO, {viewId: 'view.102'});

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
      },
    });

    // navigate to the view 1
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      target: 'blank',
      params: {seg1: '1'},
    });

    // navigate to the view 2
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      target: 'blank',
      params: {seg1: '2'},
    });

    // expect the views to be present
    await expect(appPO.views()).toHaveCount(3);

    // close the views via router
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      params: {seg1: '*'},
      close: true,
    });

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
    await routerPage.navigate({component: 'testee'}, {
      target: 'blank',
      params: {seg1: '1', seg2: '1'},
      cssClass: 'testee-1',
    });

    // navigate to the view 2
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      target: 'blank',
      params: {seg1: '1', seg2: '2'},
      cssClass: 'testee-2',
    });

    // navigate to the view 3
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      target: 'blank',
      params: {seg1: '2', seg2: '1'},
      cssClass: 'testee-3',
    });

    // navigate to the view 4
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      target: 'blank',
      params: {seg1: '2', seg2: '2'},
      cssClass: 'testee-4',
    });

    // expect the views to be present
    await expect(appPO.views()).toHaveCount(5);

    // close the view 1 via router
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      params: {seg1: '1', seg2: '1'},
      close: true,
    });

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
    await routerPage.navigate({component: 'testee'}, {
      target: 'blank',
      params: {seg1: '1', seg2: '1'},
      cssClass: 'testee-1',
    });

    // navigate to the view 2
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      target: 'blank',
      params: {seg1: '1', seg2: '2'},
      cssClass: 'testee-2',
    });

    // navigate to the view 3
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      target: 'blank',
      params: {seg1: '2', seg2: '1'},
      cssClass: 'testee-3',
    });

    // navigate to the view 4
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      target: 'blank',
      params: {seg1: '2', seg2: '2'},
      cssClass: 'testee-4',
    });

    // expect the view to be present
    await expect(appPO.views()).toHaveCount(5);

    // close the views 1 and 3 via router
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      params: {seg1: '*', seg2: '1'},
      close: true,
    });

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
    await routerPage.navigate({component: 'testee'}, {
      target: 'blank',
      params: {seg1: '1', seg2: '1'},
      cssClass: 'testee-1',
    });

    // navigate to the view 2
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      target: 'blank',
      params: {seg1: '1', seg2: '2'},
      cssClass: 'testee-2',
    });

    // navigate to the view 3
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      target: 'blank',
      params: {seg1: '2', seg2: '1'},
      cssClass: 'testee-3',
    });

    // navigate to the view 4
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      target: 'blank',
      params: {seg1: '2', seg2: '2'},
      cssClass: 'testee-4',
    });

    // expect the view to be present
    await expect(appPO.views()).toHaveCount(5);

    // close the view via router
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      params: {seg1: '*', seg2: '*'},
      close: true,
    });

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
    await routerPage.navigate({component: 'testee-1'}, {
      target: 'blank',
      params: {seg1: '1', seg2: '1'},
      cssClass: 'testee-1',
    });

    // navigate to the view 2
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee-1'}, {
      target: 'blank',
      params: {seg1: '1', seg2: '2'},
      cssClass: 'testee-2',
    });

    // navigate to the view 3
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee-2'}, {
      target: 'blank',
      params: {seg1: '1', seg2: '1'},
      cssClass: 'testee-3',
    });

    // navigate to the view 4
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee-2'}, {
      target: 'blank',
      params: {seg1: '1', seg2: '2'},
      cssClass: 'testee-4',
    });

    // expect the view to be present
    await expect(appPO.views()).toHaveCount(5);

    // close the view via router
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee-1'}, {
      params: {seg1: '*', seg2: '*'},
      close: true,
    });

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
    await routerPage.navigate({component: 'testee'}, {
      target: 'blank',
      params: {seg1: '1', opt: 'opt-1'},
      cssClass: 'testee-1',
    });

    // navigate to the view 2
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      target: 'blank',
      params: {seg1: '2', opt: 'opt-2'},
      cssClass: 'testee-2',
    });

    // expect the views to be present
    await expect(appPO.views()).toHaveCount(3);

    // close the views via router
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      params: {seg1: '*', opt: 'opt-3'},
      close: true,
    });

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
    await routerPage.navigate({component: 'microfrontend-1'}, {
      target: 'view.99',
    });

    // Assert the correct capability to be loaded
    await expect(testeeViewPage.path).toHaveText('/test-pages/view-test-page/view1');

    // navigate to microfrontend-2 view
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'microfrontend-2'}, {
      target: 'view.99',
    });

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
      },
    });

    await microfrontendNavigator.registerIntention('app1', {type: 'view', qualifier: {component: 'testee'}});

    // navigate to the testee view in app 1
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await expect(routerPage.navigate({view: 'testee'}, { // invalid qualifier
      target: 'view.100',
    })).rejects.toThrow(/\[NotQualifiedError] Application 'workbench-client-testing-app1' is not qualified/);

    // expect testee view not to be opened
    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
    await expect(appPO.views()).toHaveCount(1);
    await expectView(routerPage).toBeActive();
    await expectView(testeeViewPage).not.toBeAttached();
  });

  test('should open view in the specified part', async ({appPO, workbenchNavigator, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Add parts on the left and right.
    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('part.left', {align: 'left', ratio: .25})
      .addPart('part.right', {align: 'right', ratio: .25}),
    );

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });

    // Open view in the left part.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      partId: 'part.left',
      cssClass: 'testee',
    });

    // Expect view to be opened in the left part.
    const view = appPO.view({cssClass: 'testee'});
    await expect.poll(() => view.getInfo()).toMatchObject(
      {
        partId: 'part.left',
      } satisfies Partial<ViewInfo>,
    );
    await expect(appPO.views()).toHaveCount(2);
  });

  test('should navigate existing view(s) in the specified part, or open a new view in the specified part otherwise', async ({appPO, workbenchNavigator, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Add parts on the left and right.
    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('part.left', {align: 'left', ratio: .25})
      .addPart('part.right', {align: 'right', ratio: .25}),
    );

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {name: 'state', required: false},
      ],
      properties: {
        path: 'test-view;state=:state',
        title: 'testee',
      },
    });

    const view1 = appPO.view({cssClass: 'testee-1'});
    const view2 = appPO.view({cssClass: 'testee-2'});
    const view3 = appPO.view({cssClass: 'testee-3'});

    // Open view in the left part.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      partId: 'part.left',
      params: {state: '1'},
      cssClass: 'testee-1',
    });

    // Expect view to be opened in the left part.
    await expect.poll(() => view1.getInfo()).toMatchObject(
      {
        partId: 'part.left',
        routeParams: {state: '1'},
      } satisfies Partial<ViewInfo>,
    );
    await expect(appPO.views()).toHaveCount(2);

    // Open view in the right part.
    await routerPage.navigate({component: 'testee'}, {
      partId: 'part.right',
      params: {state: '2'},
      cssClass: 'testee-2',
    });

    // Expect view in the left part not to be navigated.
    await expect.poll(() => view1.getInfo()).toMatchObject(
      {
        partId: 'part.left',
        routeParams: {state: '1'},
      } satisfies Partial<ViewInfo>,
    );
    // Expect view to be opened in the right part.
    await expect.poll(() => view2.getInfo()).toMatchObject(
      {
        partId: 'part.right',
        routeParams: {state: '2'},
      } satisfies Partial<ViewInfo>,
    );
    await expect(appPO.views()).toHaveCount(3);

    // Navigate view in the left part.
    await routerPage.navigate({component: 'testee'}, {
      partId: 'part.left',
      params: {state: '3'},
      cssClass: 'testee-1',
    });

    // Expect view in the left part to be navigated.
    await expect.poll(() => view1.getInfo()).toMatchObject(
      {
        partId: 'part.left',
        routeParams: {state: '3'},
      } satisfies Partial<ViewInfo>,
    );
    // Expect view in the right part not to be navigated.
    await expect.poll(() => view2.getInfo()).toMatchObject(
      {
        partId: 'part.right',
        routeParams: {state: '2'},
      } satisfies Partial<ViewInfo>,
    );
    await expect(appPO.views()).toHaveCount(3);

    // Open new view in the right part.
    await routerPage.navigate({component: 'testee'}, {
      partId: 'part.right',
      target: 'blank',
      params: {state: '4'},
      cssClass: 'testee-3',
    });

    // Expect view in the left part not to be navigated.
    await expect.poll(() => view1.getInfo()).toMatchObject(
      {
        partId: 'part.left',
        routeParams: {state: '3'},
      } satisfies Partial<ViewInfo>,
    );
    // Expect view in the right part not to be navigated.
    await expect.poll(() => view2.getInfo()).toMatchObject(
      {
        partId: 'part.right',
        routeParams: {state: '2'},
      } satisfies Partial<ViewInfo>,
    );
    // Expect view to be opened in the right part.
    await expect.poll(() => view3.getInfo()).toMatchObject(
      {
        partId: 'part.right',
        routeParams: {state: '4'},
      } satisfies Partial<ViewInfo>,
    );
    await expect(appPO.views()).toHaveCount(4);
  });

  test('should open view in the active part of the main area if specified part is not in the layout', async ({appPO, workbenchNavigator, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Add parts on the left and right.
    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('part.left', {align: 'left', ratio: .25})
      .addPart('part.right', {align: 'right', ratio: .25}),
    );

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });

    // Open view in a part not contained in the layout.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      partId: 'does-not-exist',
      cssClass: 'testee',
    });

    // Expect view to be opened in the main area.
    const view = appPO.view({cssClass: 'testee'});
    await expect.poll(() => view.getInfo()).toMatchObject(
      {
        partId: await appPO.activePart({grid: 'mainArea'}).getPartId(),
      } satisfies Partial<ViewInfo>,
    );
    await expect(appPO.views()).toHaveCount(2);
  });

  test('should close view in the specified part', async ({appPO, workbenchNavigator, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Add parts on the left and right.
    await workbenchNavigator.modifyLayout(layout => layout
      .addPart('part.left', {align: 'left', ratio: .25})
      .addPart('part.right', {align: 'right', ratio: .25}),
    );

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });

    const viewPage1 = new ViewPagePO(appPO, {cssClass: 'testee-1'});
    const viewPage2 = new ViewPagePO(appPO, {cssClass: 'testee-2'});

    // Open view in the left part.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      partId: 'part.left',
      cssClass: 'testee-1',
    });

    // Open view in the right part.
    await routerPage.navigate({component: 'testee'}, {
      partId: 'part.right',
      cssClass: 'testee-2',
    });

    // Expect view to be opened in the left part.
    await expect.poll(() => viewPage1.view.getInfo()).toMatchObject(
      {
        partId: 'part.left',
      } satisfies Partial<ViewInfo>,
    );
    // Expect view to be opened in the right part.
    await expect.poll(() => viewPage2.view.getInfo()).toMatchObject(
      {
        partId: 'part.right',
      } satisfies Partial<ViewInfo>,
    );
    await expect(appPO.views()).toHaveCount(3);

    // Close view in the right part.
    await routerPage.navigate({component: 'testee'}, {
      partId: 'part.right',
      close: true,
    });

    // Expect view in the right part to be closed.
    await expectView(viewPage1).toBeActive();
    await expectView(viewPage2).not.toBeAttached();
    await expect(appPO.views()).toHaveCount(2);

    // Close view in the left part.
    await routerPage.navigate({component: 'testee'}, {
      partId: 'part.left',
      close: true,
    });

    // Expect views in the left and right part to be closed.
    await expectView(viewPage1).not.toBeAttached();
    await expectView(viewPage2).not.toBeAttached();
    await expect(appPO.views()).toHaveCount(1);
  });

  test('should not close views of peripheral parts if not specifying part id', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Create perspective with a peripheral part.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addPart('part.activity', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity'})
      .addView('view.101', {partId: 'part.main'})
      .addView('view.102', {partId: 'part.activity'})
      .activatePart('part.activity'),
    );

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });

    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    const view101 = new ViewPagePO(appPO, {viewId: 'view.101'});
    const view102 = new ViewPagePO(appPO, {viewId: 'view.102'});

    // Prerequisite: Navigate view.101 to microfrontend view.
    await routerPage.navigate({component: 'testee'}, {target: 'view.101'});
    await expectView(view101).toBeActive();

    // Prerequisite: Navigate view.102 to microfrontend view.
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {target: 'view.102'});
    await expectView(view102).toBeActive();

    // Close view with path 'test-view'.
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {close: true});
    await routerPage.view.tab.close();

    // Expect view.101 to be closed.
    await expectView(view101).not.toBeAttached();

    // Expect view.102 not to be closed.
    await expectView(view102).toBeActive();
  });

  test('should close views of peripheral parts if specifying part id', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Create perspective with a peripheral part.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addPart('part.activity', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity'})
      .addView('view.101', {partId: 'part.main'})
      .addView('view.102', {partId: 'part.activity'})
      .activatePart('part.activity'),
    );

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });

    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    const view101 = new ViewPagePO(appPO, {viewId: 'view.101'});
    const view102 = new ViewPagePO(appPO, {viewId: 'view.102'});

    // Prerequisite: Navigate view.101 to microfrontend view.
    await routerPage.navigate({component: 'testee'}, {target: 'view.101'});
    await expectView(view101).toBeActive();

    // Prerequisite: Navigate view.102 to microfrontend view.
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {target: 'view.102'});
    await expectView(view102).toBeActive();

    // Close views in part.activity.
    await routerPage.navigate({component: 'testee'}, {partId: 'part.activity', close: true});
    await routerPage.view.tab.close();

    // Expect view.102 to be closed.
    await expectView(view101).toBeActive();
    await expectView(view102).not.toBeAttached();
  });

  test('should not navigate views in peripheral parts if not specifying view id or part id', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true, mainAreaInitialPartId: 'part.initial'});

    // Create perspective with a peripheral part.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addPart('part.activity', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity'})
      .addView('view.101', {partId: 'part.main'})
      .addView('view.102', {partId: 'part.activity'})
      .navigateView('view.101', ['test-view'], {data: {navigated: 'false'}})
      .navigateView('view.102', ['test-view'], {data: {navigated: 'false'}})
      .activatePart('part.activity'),
    );

    // Register view capability.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {name: 'navigated', required: false},
      ],
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });

    // Prerequisite: Navigate view.101 to microfrontend view.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {target: 'view.101', params: {navigated: 'false'}});

    // Prerequisite: Navigate view.102 to microfrontend view.
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {target: 'view.102', params: {navigated: 'false'}});

    // Navigate to test view.
    await routerPage.navigate({component: 'testee'}, {params: {navigated: 'true'}});
    await routerPage.view.tab.close();

    // Expect view.101 to be navigated.
    await expect.poll(() => appPO.view({viewId: 'view.101'}).tab.getInfo()).toMatchObject(
      {
        viewId: 'view.101',
        routeParams: {navigated: 'true'},
      } satisfies Partial<ViewInfo>,
    );

    // Expect view.102 not to be navigated
    await expect.poll(() => appPO.view({viewId: 'view.102'}).tab.getInfo()).toMatchObject(
      {
        viewId: 'view.102',
        routeParams: {navigated: 'false'},
      } satisfies Partial<ViewInfo>,
    );
  });

  test('should navigate views in peripheral parts by id', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true, mainAreaInitialPartId: 'part.initial'});

    // Create perspective with a peripheral part.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addPart('part.activity', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity'})
      .addView('view.101', {partId: 'part.main'})
      .addView('view.102', {partId: 'part.activity'})
      .navigateView('view.101', ['test-view'], {data: {navigated: 'false'}})
      .navigateView('view.102', ['test-view'], {data: {navigated: 'false'}})
      .activatePart('part.activity'),
    );

    // Register view capability.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {name: 'navigated', required: false},
      ],
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });

    // Prerequisite: Navigate view.101 to microfrontend view.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {target: 'view.101', params: {navigated: 'false'}});

    // Prerequisite: Navigate view.102 to microfrontend view.
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {target: 'view.102', params: {navigated: 'false'}});

    // Navigate to test view.
    await routerPage.navigate({component: 'testee'}, {target: 'view.102', params: {navigated: 'true'}});
    await routerPage.view.tab.close();

    // Expect view.101 not to be navigated.
    await expect.poll(() => appPO.view({viewId: 'view.101'}).tab.getInfo()).toMatchObject(
      {
        viewId: 'view.101',
        routeParams: {navigated: 'false'},
      } satisfies Partial<ViewInfo>,
    );

    // Expect view.102 to be navigated
    await expect.poll(() => appPO.view({viewId: 'view.102'}).tab.getInfo()).toMatchObject(
      {
        viewId: 'view.102',
        routeParams: {navigated: 'true'},
      } satisfies Partial<ViewInfo>,
    );
  });

  test('should navigate views in peripheral parts if specifying part id', async ({appPO, microfrontendNavigator, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true, mainAreaInitialPartId: 'part.initial'});

    // Create perspective with a peripheral part.
    await workbenchNavigator.createPerspective(factory => factory
      .addPart('part.main')
      .addPart('part.activity', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity'})
      .addView('view.101', {partId: 'part.main'})
      .addView('view.102', {partId: 'part.activity'})
      .navigateView('view.101', ['test-view'], {data: {navigated: 'false'}})
      .navigateView('view.102', ['test-view'], {data: {navigated: 'false'}})
      .activatePart('part.activity'),
    );

    // Register view capability.
    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {name: 'navigated', required: false},
      ],
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });

    // Prerequisite: Navigate view.101 to microfrontend view.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {target: 'view.101', params: {navigated: 'false'}});

    // Prerequisite: Navigate view.102 to microfrontend view.
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {target: 'view.102', params: {navigated: 'false'}});

    // Navigate to test view.
    await routerPage.navigate({component: 'testee'}, {partId: 'part.activity', params: {navigated: 'true'}});
    await routerPage.view.tab.close();

    // Expect view.101 not to be navigated.
    await expect.poll(() => appPO.view({viewId: 'view.101'}).tab.getInfo()).toMatchObject(
      {
        viewId: 'view.101',
        routeParams: {navigated: 'false'},
      } satisfies Partial<ViewInfo>,
    );

    // Expect view.102 to be navigated
    await expect.poll(() => appPO.view({viewId: 'view.102'}).tab.getInfo()).toMatchObject(
      {
        viewId: 'view.102',
        routeParams: {navigated: 'true'},
      } satisfies Partial<ViewInfo>,
    );
  });
});
