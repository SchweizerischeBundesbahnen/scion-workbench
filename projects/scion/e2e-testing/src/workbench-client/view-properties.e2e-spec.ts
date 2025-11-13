/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../fixtures';
import {RouterPagePO} from './page-object/router-page.po';
import {expect} from '@playwright/test';
import {ViewPropertiesTestPagePO} from './page-object/test-pages/view-properties-test-page.po';

test.describe('Workbench View Properties', () => {

  test('should set view dirty state via Observable in view constructor [emissions=true,false]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      params: [{name: 'dirty', required: true}],
      properties: {
        path: 'test-pages/view-properties-test-page',
      },
    });

    await test.step('navigating in current view [target="viewId"]', async () => {
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      const viewId = await routerPage.view.getViewId();

      await routerPage.navigate({component: 'testee'}, {
        target: viewId,
        params: {dirty: 'true,false'},
      });
      await expect(appPO.view({viewId}).tab.state('dirty')).not.toBeVisible();
    });

    await test.step('navigating to new view [target="blank"]', async () => {
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {
        target: 'blank',
        params: {dirty: 'true,false'},
        cssClass: 'testee-blank',
      });

      const viewId = await appPO.view({cssClass: 'testee-blank'}).getViewId();
      const viewPropertiesTest = new ViewPropertiesTestPagePO(appPO, viewId);
      await expect(viewPropertiesTest.view.tab.state('dirty')).not.toBeVisible();
    });
  });

  test('should set view dirty state via Observable in view constructor [emissions=true,false,true]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      params: [{name: 'dirty', required: true}],
      properties: {
        path: 'test-pages/view-properties-test-page',
      },
    });

    await test.step('navigating in current view [target="viewId"]', async () => {
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      const viewId = await routerPage.view.getViewId();

      await routerPage.navigate({component: 'testee'}, {
        target: viewId,
        params: {dirty: 'true,false,true'},
      });
      await expect(appPO.view({viewId}).tab.state('dirty')).toBeVisible();
    });

    await test.step('navigating to new view [target="blank"]', async () => {
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {
        target: 'blank',
        params: {dirty: 'true,false,true'},
        cssClass: 'testee-blank',
      });

      const viewId = await appPO.view({cssClass: 'testee-blank'}).getViewId();
      const viewPropertiesTest = new ViewPropertiesTestPagePO(appPO, viewId);
      await expect(viewPropertiesTest.view.tab.state('dirty')).toBeVisible();
    });
  });

  test('should set view closable property via Observable in view constructor [emissions=true,false]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      params: [{name: 'closable', required: true}],
      properties: {
        path: 'test-pages/view-properties-test-page',
      },
    });

    await test.step('navigating in current view [target="viewId"]', async () => {
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      const viewId = await routerPage.view.getViewId();

      await routerPage.navigate({component: 'testee'}, {
        target: viewId,
        params: {closable: 'true,false'},
      });
      await expect(appPO.view({viewId}).tab.closeButton).not.toBeVisible();
    });

    await test.step('navigating to new view [target="blank"]', async () => {
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {
        target: 'blank',
        params: {closable: 'true,false'},
        cssClass: 'testee-blank',
      });

      const viewId = await appPO.view({cssClass: 'testee-blank'}).getViewId();
      const viewPropertiesTest = new ViewPropertiesTestPagePO(appPO, viewId);
      await expect(viewPropertiesTest.view.tab.closeButton).not.toBeVisible();
    });
  });

  test('should set view closable property via Observable in view constructor [emissions=true,false,true]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      params: [{name: 'closable', required: true}],
      properties: {
        path: 'test-pages/view-properties-test-page',
      },
    });

    await test.step('navigating in current view [target="viewId"]', async () => {
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      const viewId = await routerPage.view.getViewId();

      await routerPage.navigate({component: 'testee'}, {
        target: viewId,
        params: {closable: 'true,false,true'},
      });
      await expect(appPO.view({viewId}).tab.closeButton).toBeVisible();
    });

    await test.step('navigating to new view [target="blank"]', async () => {
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {
        target: 'blank',
        params: {closable: 'true,false,true'},
        cssClass: 'testee-blank',
      });

      const viewId = await appPO.view({cssClass: 'testee-blank'}).getViewId();
      const viewPropertiesTest = new ViewPropertiesTestPagePO(appPO, viewId);
      await expect(viewPropertiesTest.view.tab.closeButton).toBeVisible();
    });
  });
});
