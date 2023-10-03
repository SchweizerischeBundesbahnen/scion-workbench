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
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability(
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
      const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      const viewId = routerPagePO.viewId;
      await routerPagePO.enterQualifier({test: 'view-properties'});
      await routerPagePO.enterParams({title: 'Title 1,Title 2,Title 3'});
      await routerPagePO.enterTarget(viewId);
      await routerPagePO.clickNavigate();
      await expect(await appPO.view({viewId}).viewTab.getTitle()).toEqual('Title 3');
    });

    await test.step('navigating to new view [target="blank"]', async () => {
      const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPagePO.enterQualifier({test: 'view-properties'});
      await routerPagePO.enterParams({title: 'Title 1,Title 2,Title 3'});
      await routerPagePO.enterTarget('blank');
      await routerPagePO.enterCssClass('testee-blank');
      await routerPagePO.clickNavigate();

      const viewId = await appPO.view({cssClass: 'testee-blank'}).getViewId();
      const viewPropertiesTestPO = new ViewPropertiesTestPagePO(appPO, viewId);
      await viewPropertiesTestPO.waitUntilPresent();
      await expect(await viewPropertiesTestPO.viewTab.getTitle()).toEqual('Title 3');
    });
  });

  test('should set view heading via Observable in view constructor', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});
    await appPO.setDesignToken('--sci-workbench-tab-height', '3.5rem');

    // Register the test page as view.
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability(
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
      const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      const viewId = routerPagePO.viewId;
      await routerPagePO.enterQualifier({test: 'view-properties'});
      await routerPagePO.enterParams({heading: 'Heading 1,Heading 2,Heading 3'});
      await routerPagePO.enterTarget(viewId);
      await routerPagePO.clickNavigate();
      await expect(await appPO.view({viewId}).viewTab.getHeading()).toEqual('Heading 3');
    });

    await test.step('navigating to new view [target="blank"]', async () => {
      const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPagePO.enterQualifier({test: 'view-properties'});
      await routerPagePO.enterParams({heading: 'Heading 1,Heading 2,Heading 3'});
      await routerPagePO.enterTarget('blank');
      await routerPagePO.enterCssClass('testee-blank');
      await routerPagePO.clickNavigate();

      const viewId = await appPO.view({cssClass: 'testee-blank'}).getViewId();
      const viewPropertiesTestPO = new ViewPropertiesTestPagePO(appPO, viewId);
      await viewPropertiesTestPO.waitUntilPresent();
      await expect(await viewPropertiesTestPO.viewTab.getHeading()).toEqual('Heading 3');
    });
  });

  test('should set view dirty state via Observable in view constructor [emissions=true,false]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register the test page as view.
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability(
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
      const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      const viewId = routerPagePO.viewId;
      await routerPagePO.enterQualifier({test: 'view-properties'});
      await routerPagePO.enterParams({dirty: 'true,false'});
      await routerPagePO.enterTarget(viewId);
      await routerPagePO.clickNavigate();
      await expect(await appPO.view({viewId}).viewTab.isDirty()).toBe(false);
    });

    await test.step('navigating to new view [target="blank"]', async () => {
      const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPagePO.enterQualifier({test: 'view-properties'});
      await routerPagePO.enterParams({dirty: 'true,false'});
      await routerPagePO.enterTarget('blank');
      await routerPagePO.enterCssClass('testee-blank');
      await routerPagePO.clickNavigate();

      const viewId = await appPO.view({cssClass: 'testee-blank'}).getViewId();
      const viewPropertiesTestPO = new ViewPropertiesTestPagePO(appPO, viewId);
      await viewPropertiesTestPO.waitUntilPresent();
      await expect(await viewPropertiesTestPO.viewTab.isDirty()).toBe(false);
    });
  });

  test('should set view dirty state via Observable in view constructor [emissions=true,false,true]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register the test page as view.
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability(
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
      const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      const viewId = routerPagePO.viewId;
      await routerPagePO.enterQualifier({test: 'view-properties'});
      await routerPagePO.enterParams({dirty: 'true,false,true'});
      await routerPagePO.enterTarget(viewId);
      await routerPagePO.clickNavigate();
      await expect(await appPO.view({viewId}).viewTab.isDirty()).toBe(true);
    });

    await test.step('navigating to new view [target="blank"]', async () => {
      const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPagePO.enterQualifier({test: 'view-properties'});
      await routerPagePO.enterParams({dirty: 'true,false,true'});
      await routerPagePO.enterTarget('blank');
      await routerPagePO.enterCssClass('testee-blank');
      await routerPagePO.clickNavigate();

      const viewId = await appPO.view({cssClass: 'testee-blank'}).getViewId();
      const viewPropertiesTestPO = new ViewPropertiesTestPagePO(appPO, viewId);
      await viewPropertiesTestPO.waitUntilPresent();
      await expect(await viewPropertiesTestPO.viewTab.isDirty()).toBe(true);
    });
  });

  test('should set view closable property via Observable in view constructor [emissions=true,false]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register the test page as view.
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability(
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
      const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      const viewId = routerPagePO.viewId;
      await routerPagePO.enterQualifier({test: 'view-properties'});
      await routerPagePO.enterParams({closable: 'true,false'});
      await routerPagePO.enterTarget(viewId);
      await routerPagePO.clickNavigate();
      await expect(await appPO.view({viewId}).viewTab.isClosable()).toBe(false);
    });

    await test.step('navigating to new view [target="blank"]', async () => {
      const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPagePO.enterQualifier({test: 'view-properties'});
      await routerPagePO.enterParams({closable: 'true,false'});
      await routerPagePO.enterTarget('blank');
      await routerPagePO.enterCssClass('testee-blank');
      await routerPagePO.clickNavigate();

      const viewId = await appPO.view({cssClass: 'testee-blank'}).getViewId();
      const viewPropertiesTestPO = new ViewPropertiesTestPagePO(appPO, viewId);
      await viewPropertiesTestPO.waitUntilPresent();
      await expect(await viewPropertiesTestPO.viewTab.isClosable()).toBe(false);
    });
  });

  test('should set view closable property via Observable in view constructor [emissions=true,false,true]', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // Register the test page as view.
    const registerCapabilityPagePO = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPagePO.registerCapability(
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
      const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      const viewId = routerPagePO.viewId;
      await routerPagePO.enterQualifier({test: 'view-properties'});
      await routerPagePO.enterParams({closable: 'true,false,true'});
      await routerPagePO.enterTarget(viewId);
      await routerPagePO.clickNavigate();
      await expect(await appPO.view({viewId}).viewTab.isClosable()).toBe(true);
    });

    await test.step('navigating to new view [target="blank"]', async () => {
      const routerPagePO = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPagePO.enterQualifier({test: 'view-properties'});
      await routerPagePO.enterParams({closable: 'true,false,true'});
      await routerPagePO.enterTarget('blank');
      await routerPagePO.enterCssClass('testee-blank');
      await routerPagePO.clickNavigate();

      const viewId = await appPO.view({cssClass: 'testee-blank'}).getViewId();
      const viewPropertiesTestPO = new ViewPropertiesTestPagePO(appPO, viewId);
      await viewPropertiesTestPO.waitUntilPresent();
      await expect(await viewPropertiesTestPO.viewTab.isClosable()).toBe(true);
    });
  });
});
