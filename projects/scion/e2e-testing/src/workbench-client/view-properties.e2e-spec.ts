/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
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
import {RegisterWorkbenchCapabilityPagePO} from './page-object/register-workbench-capability-page.po';
import {ViewPropertiesTestPagePO} from './page-object/test-pages/view-properties-test-page.po';

test.describe('Workbench View Properties', () => {

  test('should set view title via Observable in view constructor', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register the test page as view.
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability(
      {
        type: 'view',
        qualifier: {test: 'view-properties'},
        params: [{name: 'title', required: true}],
        properties: {
          path: 'test-pages/view-properties-test-page',
        },
      },
    );

    await test.step('navigating in current view [target="viewId"]', async () => {
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      const viewId = routerPage.viewId;
      await routerPage.enterQualifier({test: 'view-properties'});
      await routerPage.enterParams({title: 'Title 1,Title 2,Title 3'});
      await routerPage.enterTarget(viewId);
      await routerPage.clickNavigate();
      await expect(await appPO.view({viewId}).viewTab.getTitle()).toEqual('Title 3');
    });

    await test.step('navigating to new view [target="blank"]', async () => {
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.enterQualifier({test: 'view-properties'});
      await routerPage.enterParams({title: 'Title 1,Title 2,Title 3'});
      await routerPage.enterTarget('blank');
      await routerPage.enterCssClass('testee-blank');
      await routerPage.clickNavigate();

      const viewId = await appPO.view({cssClass: 'testee-blank'}).getViewId();
      const viewPropertiesTest = new ViewPropertiesTestPagePO(appPO, viewId);
      await viewPropertiesTest.waitUntilPresent();
      await expect(await viewPropertiesTest.viewTab.getTitle()).toEqual('Title 3');
    });
  });

  test('should set view heading via Observable in view constructor', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

    // Register the test page as view.
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability(
      {
        type: 'view',
        qualifier: {test: 'view-properties'},
        params: [{name: 'heading', required: true}],
        properties: {
          path: 'test-pages/view-properties-test-page',
        },
      },
    );

    await test.step('navigating in current view [target="viewId"]', async () => {
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      const viewId = routerPage.viewId;
      await routerPage.enterQualifier({test: 'view-properties'});
      await routerPage.enterParams({heading: 'Heading 1,Heading 2,Heading 3'});
      await routerPage.enterTarget(viewId);
      await routerPage.clickNavigate();
      await expect(await appPO.view({viewId}).viewTab.getHeading()).toEqual('Heading 3');
    });

    await test.step('navigating to new view [target="blank"]', async () => {
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.enterQualifier({test: 'view-properties'});
      await routerPage.enterParams({heading: 'Heading 1,Heading 2,Heading 3'});
      await routerPage.enterTarget('blank');
      await routerPage.enterCssClass('testee-blank');
      await routerPage.clickNavigate();

      const viewId = await appPO.view({cssClass: 'testee-blank'}).getViewId();
      const viewPropertiesTest = new ViewPropertiesTestPagePO(appPO, viewId);
      await viewPropertiesTest.waitUntilPresent();
      await expect(await viewPropertiesTest.viewTab.getHeading()).toEqual('Heading 3');
    });
  });

  test('should set view dirty state via Observable in view constructor [emissions=true,false]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register the test page as view.
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability(
      {
        type: 'view',
        qualifier: {test: 'view-properties'},
        params: [{name: 'dirty', required: true}],
        properties: {
          path: 'test-pages/view-properties-test-page',
        },
      },
    );

    await test.step('navigating in current view [target="viewId"]', async () => {
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      const viewId = routerPage.viewId;
      await routerPage.enterQualifier({test: 'view-properties'});
      await routerPage.enterParams({dirty: 'true,false'});
      await routerPage.enterTarget(viewId);
      await routerPage.clickNavigate();
      await expect(await appPO.view({viewId}).viewTab.isDirty()).toBe(false);
    });

    await test.step('navigating to new view [target="blank"]', async () => {
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.enterQualifier({test: 'view-properties'});
      await routerPage.enterParams({dirty: 'true,false'});
      await routerPage.enterTarget('blank');
      await routerPage.enterCssClass('testee-blank');
      await routerPage.clickNavigate();

      const viewId = await appPO.view({cssClass: 'testee-blank'}).getViewId();
      const viewPropertiesTest = new ViewPropertiesTestPagePO(appPO, viewId);
      await viewPropertiesTest.waitUntilPresent();
      await expect(await viewPropertiesTest.viewTab.isDirty()).toBe(false);
    });
  });

  test('should set view dirty state via Observable in view constructor [emissions=true,false,true]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register the test page as view.
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability(
      {
        type: 'view',
        qualifier: {test: 'view-properties'},
        params: [{name: 'dirty', required: true}],
        properties: {
          path: 'test-pages/view-properties-test-page',
        },
      },
    );

    await test.step('navigating in current view [target="viewId"]', async () => {
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      const viewId = routerPage.viewId;
      await routerPage.enterQualifier({test: 'view-properties'});
      await routerPage.enterParams({dirty: 'true,false,true'});
      await routerPage.enterTarget(viewId);
      await routerPage.clickNavigate();
      await expect(await appPO.view({viewId}).viewTab.isDirty()).toBe(true);
    });

    await test.step('navigating to new view [target="blank"]', async () => {
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.enterQualifier({test: 'view-properties'});
      await routerPage.enterParams({dirty: 'true,false,true'});
      await routerPage.enterTarget('blank');
      await routerPage.enterCssClass('testee-blank');
      await routerPage.clickNavigate();

      const viewId = await appPO.view({cssClass: 'testee-blank'}).getViewId();
      const viewPropertiesTest = new ViewPropertiesTestPagePO(appPO, viewId);
      await viewPropertiesTest.waitUntilPresent();
      await expect(await viewPropertiesTest.viewTab.isDirty()).toBe(true);
    });
  });

  test('should set view closable property via Observable in view constructor [emissions=true,false]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register the test page as view.
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability(
      {
        type: 'view',
        qualifier: {test: 'view-properties'},
        params: [{name: 'closable', required: true}],
        properties: {
          path: 'test-pages/view-properties-test-page',
        },
      },
    );

    await test.step('navigating in current view [target="viewId"]', async () => {
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      const viewId = routerPage.viewId;
      await routerPage.enterQualifier({test: 'view-properties'});
      await routerPage.enterParams({closable: 'true,false'});
      await routerPage.enterTarget(viewId);
      await routerPage.clickNavigate();
      await expect(await appPO.view({viewId}).viewTab.isClosable()).toBe(false);
    });

    await test.step('navigating to new view [target="blank"]', async () => {
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.enterQualifier({test: 'view-properties'});
      await routerPage.enterParams({closable: 'true,false'});
      await routerPage.enterTarget('blank');
      await routerPage.enterCssClass('testee-blank');
      await routerPage.clickNavigate();

      const viewId = await appPO.view({cssClass: 'testee-blank'}).getViewId();
      const viewPropertiesTest = new ViewPropertiesTestPagePO(appPO, viewId);
      await viewPropertiesTest.waitUntilPresent();
      await expect(await viewPropertiesTest.viewTab.isClosable()).toBe(false);
    });
  });

  test('should set view closable property via Observable in view constructor [emissions=true,false,true]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register the test page as view.
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability(
      {
        type: 'view',
        qualifier: {test: 'view-properties'},
        params: [{name: 'closable', required: true}],
        properties: {
          path: 'test-pages/view-properties-test-page',
        },
      },
    );

    await test.step('navigating in current view [target="viewId"]', async () => {
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      const viewId = routerPage.viewId;
      await routerPage.enterQualifier({test: 'view-properties'});
      await routerPage.enterParams({closable: 'true,false,true'});
      await routerPage.enterTarget(viewId);
      await routerPage.clickNavigate();
      await expect(await appPO.view({viewId}).viewTab.isClosable()).toBe(true);
    });

    await test.step('navigating to new view [target="blank"]', async () => {
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.enterQualifier({test: 'view-properties'});
      await routerPage.enterParams({closable: 'true,false,true'});
      await routerPage.enterTarget('blank');
      await routerPage.enterCssClass('testee-blank');
      await routerPage.clickNavigate();

      const viewId = await appPO.view({cssClass: 'testee-blank'}).getViewId();
      const viewPropertiesTest = new ViewPropertiesTestPagePO(appPO, viewId);
      await viewPropertiesTest.waitUntilPresent();
      await expect(await viewPropertiesTest.viewTab.isClosable()).toBe(true);
    });
  });
});
