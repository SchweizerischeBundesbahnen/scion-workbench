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
import {RegisterWorkbenchCapabilityPagePO} from './page-object/register-workbench-capability-page.po';
import {ViewPagePO} from './page-object/view-page.po';
import {RouterPagePO} from './page-object/router-page.po';

test.describe('Workbench Router', () => {

  test('should contain the qualifier in view params', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {entity: 'products'},
      properties: {
        path: 'test-view',
        title: 'product',
        cssClass: 'products',
      },
    });

    // navigate
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({entity: 'products'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    // expect qualifier to be contained in view params
    const testeeViewId = await appPO.view({cssClass: 'products'}).getViewId();
    const testeeViewPage = new ViewPagePO(appPO, testeeViewId);

    await expect(await testeeViewPage.getViewParams()).toEqual(
      expect.objectContaining({
        entity: 'products [string]',
      }));
  });

  test('should contain the provided params in view params', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {entity: 'product'},
      params: [
        {name: 'id', required: true},
      ],
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({entity: 'product'});
    await routerPage.enterParams({id: '123'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    // expect qualifier to be contained in view params
    const testeeViewId = await appPO.view({cssClass: 'testee'}).getViewId();
    const testeeViewPage = new ViewPagePO(appPO, testeeViewId);

    await expect(await testeeViewPage.getViewParams()).toEqual(
      expect.objectContaining({
        entity: 'product [string]',
        id: '123 [string]',
      }));
  });

  test('should not overwrite qualifier values with param values', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {entity: 'product', mode: 'new'},
      params: [
        {name: 'mode', required: true},
      ],
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({entity: 'product', mode: 'new'});
    await routerPage.enterParams({mode: 'edit'}); // should be ignored
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    // expect qualifier values not to be overwritten by params
    const testeeViewId = await appPO.view({cssClass: 'testee'}).getViewId();
    const testeeViewPage = new ViewPagePO(appPO, testeeViewId);

    await expect(await testeeViewPage.getViewParams()).toEqual(
      expect.objectContaining({
        entity: 'product [string]',
        mode: 'new [string]',
      }));
  });

  test('should substitute named URL params with values of the qualifier and params', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {component: 'testee', seg1: 'SEG1', mp1: 'MP1', qp1: 'QP1'},
      params: [
        {name: 'seg3', required: true},
        {name: 'mp2', required: true},
        {name: 'qp2', required: true},
        {name: 'fragment', required: true},
      ],
      properties: {
        path: 'test-pages/view-test-page/:seg1/segment2/:seg3;mp1=:mp1;mp2=:mp2?qp1=:qp1&qp2=:qp2#:fragment',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({component: 'testee', seg1: 'SEG1', mp1: 'MP1', qp1: 'QP1'});
    await routerPage.enterParams({seg3: 'SEG3', mp2: 'MP2', qp2: 'QP2', fragment: 'FRAGMENT'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    // expect named params to be substituted
    const testeeViewId = await appPO.view({cssClass: 'testee'}).getViewId();
    const testeeViewPage = new ViewPagePO(appPO, testeeViewId);

    await expect(await testeeViewPage.getViewParams()).toEqual(
      expect.objectContaining({
        component: 'testee [string]',
        seg1: 'SEG1 [string]',
        seg3: 'SEG3 [string]',
        mp1: 'MP1 [string]',
        mp2: 'MP2 [string]',
        qp1: 'QP1 [string]',
        qp2: 'QP2 [string]',
        fragment: 'FRAGMENT [string]',
      }));
    await expect(await testeeViewPage.getRouteParams()).toEqual({segment1: 'SEG1', segment3: 'SEG3', mp1: 'MP1', mp2: 'MP2'});
    await expect(await testeeViewPage.getRouteQueryParams()).toEqual({qp1: 'QP1', qp2: 'QP2'});
    await expect(await testeeViewPage.getRouteFragment()).toEqual('FRAGMENT');
  });

  test('should update view params without constructing a new view instance', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {entity: 'product'},
      params: [
        {name: 'id', required: true},
      ],
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({entity: 'product'});
    await routerPage.enterParams({id: '123'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    const testeeViewId = await appPO.view({cssClass: 'testee'}).getViewId();
    const testeeViewPage = new ViewPagePO(appPO, testeeViewId);

    // capture the view's component instance id
    const testeeComponentInstanceId = await testeeViewPage.getComponentInstanceId();

    // navigate to update the view's params
    await routerPage.viewTab.click();
    await routerPage.enterQualifier({entity: 'product'});
    await routerPage.enterParams({id: '456'});
    await routerPage.enterTarget(testeeViewPage.viewId);
    await routerPage.clickNavigate();

    await testeeViewPage.view.viewTab.click();

    // expect the view's params to be updated
    await expect(await testeeViewPage.getViewParams()).toEqual(
      expect.objectContaining({
        entity: 'product [string]',
        id: '456 [string]',
      }));
    // expect no new view instance to be constructed
    await expect(await testeeViewPage.getComponentInstanceId()).toEqual(testeeComponentInstanceId);
  });

  test('should contain the provided param with value `null` in view params', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {entity: 'product'},
      params: [
        {
          name: 'id',
          required: true,
        },
      ],
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({entity: 'product'});
    await routerPage.enterParams({id: '<null>'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    // expect the qualifier and the optional parameter with value `null` to be contained in view params
    const testeeViewId = await appPO.view({cssClass: 'testee'}).getViewId();
    const testeeViewPage = new ViewPagePO(appPO, testeeViewId);

    await expect(await testeeViewPage.getViewParams()).toEqual(
      expect.objectContaining({
        entity: 'product [string]',
        id: 'null [string]',
      }));
  });

  test('should not contain the provided param with value `undefined` in view params', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
    await registerCapabilityPage.registerCapability({
      type: 'view',
      qualifier: {entity: 'product'},
      params: [
        {
          name: 'id',
          required: true,
        },
        {
          name: 'param1',
          required: false,
        },
      ],
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.enterQualifier({entity: 'product'});
    await routerPage.enterParams({id: '123', param1: '<undefined>'});
    await routerPage.enterTarget('blank');
    await routerPage.clickNavigate();

    // expect qualifier to be contained in view params, but the optional parameter with value `undefined` should not be contained
    const testeeViewId = await appPO.view({cssClass: 'testee'}).getViewId();
    const testeeViewPage = new ViewPagePO(appPO, testeeViewId);

    const params = await testeeViewPage.getViewParams();
    await expect(params).toEqual(
      expect.objectContaining({
        entity: 'product [string]',
        id: '123 [string]',
      }));
    await expect(params).not.toEqual(expect.objectContaining({param1: expect.anything()}));
  });

  test.describe('Self-Navigation', () => {

    test('should, by default, replace params', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      const componentInstanceId = await viewPage.getComponentInstanceId();

      await viewPage.navigateSelf({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3 (a)',
      });

      // expect the view's params to be updated
      await expect(await viewPage.getViewParams()).toEqual(
        expect.objectContaining({
          param1: 'PARAM 1 [string]',
          param2: 'PARAM 2 [string]',
          param3: 'PARAM 3 (a) [string]',
        }));
      // expect the component to be the same instance
      await expect(await viewPage.getComponentInstanceId()).toEqual(componentInstanceId);

      await viewPage.navigateSelf({
        param3: 'PARAM 3 (b)',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
      });

      // expect the view's params to be updated
      const params = await viewPage.getViewParams();
      await expect(params).toEqual(expect.objectContaining({
        param3: 'PARAM 3 (b) [string]',
        param4: 'PARAM 4 [string]',
        param5: 'PARAM 5 [string]',
      }));
      await expect(params).not.toEqual(expect.objectContaining({param1: expect.stringMatching('PARAM 1')}));
      await expect(params).not.toEqual(expect.objectContaining({param2: expect.stringMatching('PARAM 2')}));
      await expect(params).not.toEqual(expect.objectContaining({param3: expect.stringMatching('PARAM 3 (a)')}));

      // expect the component to be the same instance
      await expect(await viewPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should replace params', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      const componentInstanceId = await viewPage.getComponentInstanceId();

      await viewPage.navigateSelf({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3 (a)',
      });

      // expect the view's params to be updated
      await expect(await viewPage.getViewParams()).toEqual(
        expect.objectContaining({
          param1: 'PARAM 1 [string]',
          param2: 'PARAM 2 [string]',
          param3: 'PARAM 3 (a) [string]',
        }));
      // expect the component to be the same instance
      await expect(await viewPage.getComponentInstanceId()).toEqual(componentInstanceId);

      await viewPage.navigateSelf({
        param3: 'PARAM 3 (b)',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
      }, {paramsHandling: 'replace'});

      // expect the view's params to be updated
      const params = await viewPage.getViewParams();
      await expect(params).toEqual(
        expect.objectContaining({
          param3: 'PARAM 3 (b) [string]',
          param4: 'PARAM 4 [string]',
          param5: 'PARAM 5 [string]',
        }));
      await expect(params).not.toEqual(expect.objectContaining({param1: expect.stringMatching('PARAM 1')}));
      await expect(params).not.toEqual(expect.objectContaining({param2: expect.stringMatching('PARAM 2')}));
      await expect(params).not.toEqual(expect.objectContaining({param3: expect.stringMatching('PARAM 3 (a)')}));
      // expect the component to be the same instance
      await expect(await viewPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should merge params', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      const componentInstanceId = await viewPage.getComponentInstanceId();

      await viewPage.navigateSelf({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3 (a)',
      });

      // expect the view's params to be updated
      await expect(await viewPage.getViewParams()).toEqual(
        expect.objectContaining({
          param1: 'PARAM 1 [string]',
          param2: 'PARAM 2 [string]',
          param3: 'PARAM 3 (a) [string]',
        }));
      // expect the component to be the same instance
      await expect(await viewPage.getComponentInstanceId()).toEqual(componentInstanceId);

      await viewPage.navigateSelf({
        param3: 'PARAM 3 (b)',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
      }, {paramsHandling: 'merge'});

      // expect the view's params to be updated
      const params = await viewPage.getViewParams();
      await expect(params).toEqual(
        expect.objectContaining({
          param1: 'PARAM 1 [string]',
          param2: 'PARAM 2 [string]',
          param3: 'PARAM 3 (b) [string]',
          param4: 'PARAM 4 [string]',
          param5: 'PARAM 5 [string]',
        }));
      await expect(params).not.toEqual(expect.objectContaining({param3: expect.stringMatching('PARAM 3 (a)')}));
      // expect the component to be the same instance
      await expect(await viewPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should correctly merge params when performing bulk navigations', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      await viewPage.navigateSelf({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
      }, {paramsHandling: 'merge', navigatePerParam: true});

      // expect the view's params to be updated
      await expect(await viewPage.getViewParams()).toEqual(
        expect.objectContaining({
          param1: 'PARAM 1 [string]',
          param2: 'PARAM 2 [string]',
          param3: 'PARAM 3 [string]',
          param4: 'PARAM 4 [string]',
          param5: 'PARAM 5 [string]',
        }));
    });

    test('should correctly replace params when performing bulk navigations', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      await viewPage.navigateSelf({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
      }, {paramsHandling: 'replace', navigatePerParam: true});

      // expect the view's params to be updated
      const params = await viewPage.getViewParams();
      await expect(params).not.toEqual(expect.objectContaining({param1: expect.stringMatching('PARAM 1')}));
      await expect(params).not.toEqual(expect.objectContaining({param2: expect.stringMatching('PARAM 2')}));
      await expect(params).not.toEqual(expect.objectContaining({param3: expect.stringMatching('PARAM 3')}));
      await expect(params).not.toEqual(expect.objectContaining({param4: expect.stringMatching('PARAM 4')}));
      await expect(params).toEqual(expect.objectContaining({param5: 'PARAM 5 [string]'}));
    });

    test('should remove params having `undefined` as value [paramsHandling=replace]', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      await viewPage.navigateSelf({
        param1: 'PARAM 1',
        param2: '<undefined>',
        param3: 'PARAM 3',
      }, {paramsHandling: 'replace'});

      // expect the view's params to be updated
      const params = await viewPage.getViewParams();
      await expect(params).toEqual(
        expect.objectContaining({
          param1: 'PARAM 1 [string]',
          param3: 'PARAM 3 [string]',
        }));
      await expect(params).not.toEqual(expect.objectContaining({param2: expect.anything()}));
    });

    test('should remove params having `undefined` as their value [paramsHandling=merge]', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      await viewPage.navigateSelf({
        param1: 'PARAM 1',
        param2: '<undefined>',
        param3: 'PARAM 3',
      }, {paramsHandling: 'merge'});

      // expect the view's params to be updated
      const params = await viewPage.getViewParams();
      await expect(params).toEqual(expect.objectContaining({param1: 'PARAM 1 [string]', param3: 'PARAM 3 [string]'}));
      await expect(params).not.toEqual(expect.objectContaining({param2: expect.anything()}));
    });

    test('should not remove params having `null` as their value [paramsHandling=replace]', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      await viewPage.navigateSelf({
        param1: 'PARAM 1',
        param2: '<null>',
        param3: 'PARAM 3',
      }, {paramsHandling: 'replace'});

      // expect the view's params to be updated
      await expect(await viewPage.getViewParams()).toEqual(
        expect.objectContaining({
          param1: 'PARAM 1 [string]',
          param2: 'null [string]',
          param3: 'PARAM 3 [string]',
        }));
    });

    test('should not remove params having `null` as their value [paramsHandling=merge]', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      await viewPage.navigateSelf({
        param1: 'PARAM 1',
        param2: '<null>',
        param3: 'PARAM 3',
      }, {paramsHandling: 'merge'});

      // expect the view's params to be updated
      await expect(await viewPage.getViewParams()).toEqual(
        expect.objectContaining({
          param1: 'PARAM 1 [string]',
          param2: 'null [string]',
          param3: 'PARAM 3 [string]',
        }));
    });
  });

  test.describe('Transient params', () => {

    test('should contain the provided transient params in view params', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee view
      const registerCapabilityPage = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPage.registerCapability({
        type: 'view',
        qualifier: {entity: 'product'},
        params: [
          {
            name: 'id',
            required: true,
          },
          {
            name: 'param1',
            required: false,
            transient: true,
          },
          {
            name: 'param2',
            required: false,
            transient: true,
          },
        ],
        properties: {
          path: 'test-view',
          title: 'testee',
          cssClass: 'testee',
        },
      });

      // navigate
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.enterQualifier({entity: 'product'});
      await routerPage.enterParams({id: '123', param1: 'transient param1', param2: 'transient param2'});
      await routerPage.enterTarget('blank');
      await routerPage.clickNavigate();

      // expect transient param to be contained in view params
      const testeeViewId = await appPO.view({cssClass: 'testee'}).getViewId();
      const testeeViewPage = new ViewPagePO(appPO, testeeViewId);

      await expect(await testeeViewPage.getViewParams()).toEqual(
        expect.objectContaining({
          entity: 'product [string]',
          id: '123 [string]',
          param1: 'transient param1 [string]',
          param2: 'transient param2 [string]',
        }));
    });

    test('should not contain transient params in view params after page reload', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // We do not register any capability here but use the built-in capability instead.
      // Otherwise, the view could not be displayed after page reload.

      // navigate
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.enterQualifier({component: 'view', app: 'app1'});
      await routerPage.enterParams({initialTitle: 'TITLE', transientParam: 'TRANSIENT PARAM'});
      await routerPage.enterTarget('blank');
      await routerPage.clickNavigate();

      // expect transient param to be contained in view params
      const testeeViewId = await appPO.view({cssClass: 'e2e-test-view'}).getViewId();
      const testeeViewPage = new ViewPagePO(appPO, testeeViewId);

      await expect(await testeeViewPage.getViewParams()).toEqual(
        expect.objectContaining({
          initialTitle: 'TITLE [string]',
          transientParam: 'TRANSIENT PARAM [string]',
        }));

      // expect transient param to be removed from view params after page reload
      await appPO.reload();
      const testeeViewPage2 = new ViewPagePO(appPO, testeeViewId);
      await expect(await testeeViewPage2.getViewParams()).toEqual(expect.objectContaining({initialTitle: 'TITLE [string]'}));
      await expect(await testeeViewPage2.getViewParams()).not.toEqual(expect.objectContaining({transientParam: expect.stringMatching('TRANSIENT PARAM')}));
    });

    test('should merge params on self-navigation', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      const componentInstanceId = await viewPage.getComponentInstanceId();

      await viewPage.navigateSelf({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3 (a)',
        transientParam: 'TRANSIENT PARAM (a)',
      });

      // expect the view's params to be updated
      await expect(await viewPage.getViewParams()).toEqual(
        expect.objectContaining({
          param1: 'PARAM 1 [string]',
          param2: 'PARAM 2 [string]',
          param3: 'PARAM 3 (a) [string]',
          transientParam: 'TRANSIENT PARAM (a) [string]',
        }));
      // expect the component to be the same instance
      await expect(await viewPage.getComponentInstanceId()).toEqual(componentInstanceId);

      await viewPage.navigateSelf({
        transientParam: 'TRANSIENT PARAM (b)',
        param3: 'PARAM 3 (b)',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
      }, {paramsHandling: 'merge'});

      // expect the view's params to be updated
      const params = await viewPage.getViewParams();
      await expect(params).toEqual(
        expect.objectContaining({
          param1: 'PARAM 1 [string]',
          param2: 'PARAM 2 [string]',
          param3: 'PARAM 3 (b) [string]',
          param4: 'PARAM 4 [string]',
          param5: 'PARAM 5 [string]',
          transientParam: 'TRANSIENT PARAM (b) [string]',
        }));
      await expect(params).not.toEqual(expect.objectContaining({param3: expect.stringMatching('PARAM 3 (a)')}));
      await expect(params).not.toEqual(expect.objectContaining({transientParam: expect.stringMatching('TRANSIENT PARAM (a)')}));
      // expect the component to be the same instance
      await expect(await viewPage.getComponentInstanceId()).toEqual(componentInstanceId);

      // expect transient param to be removed from view params after page reload
      await appPO.reload();
      const paramsAfterReload = await viewPage.getViewParams();
      await expect(paramsAfterReload).toEqual(
        expect.objectContaining({
          param1: 'PARAM 1 [string]',
          param2: 'PARAM 2 [string]',
          param3: 'PARAM 3 (b) [string]',
          param4: 'PARAM 4 [string]',
          param5: 'PARAM 5 [string]',
        }));
      await expect(paramsAfterReload).not.toEqual(expect.objectContaining({transientParam: expect.stringMatching('TRANSIENT PARAM (b)')}));
    });

    test('should replace params on self-navigation', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      const componentInstanceId = await viewPage.getComponentInstanceId();

      await viewPage.navigateSelf({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3 (a)',
        transientParam: 'TRANSIENT PARAM (a)',
      });

      // expect the view's params to be updated
      await expect(await viewPage.getViewParams()).toEqual(
        expect.objectContaining({
          param1: 'PARAM 1 [string]',
          param2: 'PARAM 2 [string]',
          param3: 'PARAM 3 (a) [string]',
          transientParam: 'TRANSIENT PARAM (a) [string]',
        }));
      // expect the component to be the same instance
      await expect(await viewPage.getComponentInstanceId()).toEqual(componentInstanceId);

      await viewPage.navigateSelf({
        transientParam: 'TRANSIENT PARAM (b)',
        param3: 'PARAM 3 (b)',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
      }, {paramsHandling: 'replace'});

      // expect the view's params to be updated
      const params = await viewPage.getViewParams();
      await expect(params).toEqual(
        expect.objectContaining({
          param3: 'PARAM 3 (b) [string]',
          param4: 'PARAM 4 [string]',
          param5: 'PARAM 5 [string]',
          transientParam: 'TRANSIENT PARAM (b) [string]',
        }));
      await expect(params).not.toEqual(expect.objectContaining({param1: expect.stringMatching('PARAM 1')}));
      await expect(params).not.toEqual(expect.objectContaining({param2: expect.stringMatching('PARAM 2')}));
      await expect(params).not.toEqual(expect.objectContaining({param3: expect.stringMatching('PARAM 3 (a)')}));
      await expect(params).not.toEqual(expect.objectContaining({transientParam: expect.stringMatching('TRANSIENT PARAM (a)')}));
      // expect the component to be the same instance
      await expect(await viewPage.getComponentInstanceId()).toEqual(componentInstanceId);

      // expect transient param to be removed from view params after page reload
      await appPO.reload();
      const paramsAfterReload = await viewPage.getViewParams();
      await expect(paramsAfterReload).toEqual(
        expect.objectContaining({
          param3: 'PARAM 3 (b) [string]',
          param4: 'PARAM 4 [string]',
          param5: 'PARAM 5 [string]',
        }));
      await expect(paramsAfterReload).not.toEqual(expect.objectContaining({transientParam: expect.stringMatching('TRANSIENT PARAM (b)')}));
    });

    test('should correctly merge params when performing bulk navigations', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      await viewPage.navigateSelf({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
        transientParam: 'TRANSIENT PARAM',
      }, {paramsHandling: 'merge', navigatePerParam: true});

      // expect the view's params to be updated
      await expect(await viewPage.getViewParams()).toEqual(
        expect.objectContaining({
          param1: 'PARAM 1 [string]',
          param2: 'PARAM 2 [string]',
          param3: 'PARAM 3 [string]',
          param4: 'PARAM 4 [string]',
          param5: 'PARAM 5 [string]',
          transientParam: 'TRANSIENT PARAM [string]',
        }));

      // expect transient param to be removed from view params after page reload
      await appPO.reload();
      const paramsAfterReload = await viewPage.getViewParams();
      await expect(paramsAfterReload).toEqual(
        expect.objectContaining({
          param1: 'PARAM 1 [string]',
          param2: 'PARAM 2 [string]',
          param3: 'PARAM 3 [string]',
          param4: 'PARAM 4 [string]',
          param5: 'PARAM 5 [string]',
        }));
      await expect(paramsAfterReload).not.toEqual(expect.objectContaining({transientParam: expect.stringMatching('TRANSIENT PARAM')}));
    });

    test('should correctly replace params when performing bulk navigations', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      const viewPage = await microfrontendNavigator.openInNewTab(ViewPagePO, 'app1');
      await viewPage.navigateSelf({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
        transientParam: 'TRANSIENT PARAM',
      }, {paramsHandling: 'replace', navigatePerParam: true});

      // expect the view's params to be updated
      const params = await viewPage.getViewParams();
      await expect(params).not.toEqual(expect.objectContaining({param1: expect.stringMatching('PARAM 1')}));
      await expect(params).not.toEqual(expect.objectContaining({param2: expect.stringMatching('PARAM 2')}));
      await expect(params).not.toEqual(expect.objectContaining({param3: expect.stringMatching('PARAM 3')}));
      await expect(params).not.toEqual(expect.objectContaining({param4: expect.stringMatching('PARAM 4')}));
      await expect(params).not.toEqual(expect.objectContaining({param4: expect.stringMatching('PARAM 5')}));
      await expect(params).toEqual(expect.objectContaining({transientParam: 'TRANSIENT PARAM [string]'}));

      // expect transient param to be removed from view params after page reload
      await appPO.reload();
      const paramsAfterReload = await viewPage.getViewParams();
      await expect(paramsAfterReload).not.toEqual(expect.objectContaining({transientParam: expect.stringMatching('TRANSIENT PARAM')}));
    });

    test('should correctly update params and transient params when a view is replaced by another view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee view for app1
      const registerCapabilityPage1 = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPage1.registerCapability({
        type: 'view',
        qualifier: {entity: 'product', app: 'app1'},
        params: [
          {
            name: 'param',
            required: false,
          },
          {
            name: 'transientParam',
            required: false,
            transient: true,
          },
        ],
        properties: {
          path: 'test-view',
          title: 'testee1',
          cssClass: 'testee1',
        },
      });

      // register testee view for app2
      const registerCapabilityPage2 = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
      await registerCapabilityPage2.registerCapability({
        type: 'view',
        qualifier: {entity: 'product', app: 'app2'},
        params: [
          {
            name: 'param',
            required: false,
          },
          {
            name: 'transientParam',
            required: false,
            transient: true,
          },
        ],
        properties: {
          path: 'test-view',
          title: 'testee2',
          cssClass: 'testee2',
        },
      });

      // navigate to view of app1
      const routerPage1 = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage1.enterQualifier({entity: 'product', app: 'app1'});
      await routerPage1.enterParams({param: 'param app1', transientParam: 'transient param app1'});
      await routerPage1.enterTarget('blank');
      await routerPage1.clickNavigate();

      // expect transient param to be contained in view params
      const testeeView1 = appPO.view({cssClass: 'testee1'});
      const viewId = await testeeView1.getViewId();
      const testeeViewPage1 = new ViewPagePO(appPO, viewId);
      await expect(await testeeViewPage1.getViewParams()).toEqual(
        expect.objectContaining({
          entity: 'product [string]',
          app: 'app1 [string]',
          param: 'param app1 [string]',
          transientParam: 'transient param app1 [string]',
        }));

      // self-navigate to view of app2
      const routerPage2 = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app2');
      await routerPage2.enterQualifier({entity: 'product', app: 'app2'});
      await routerPage2.enterParams({param: 'param app2', transientParam: 'transient param app2'});
      await routerPage2.enterTarget(viewId);
      await routerPage2.clickNavigate();

      // expect transient param to be contained in view params
      const testeeViewTab2 = appPO.view({cssClass: 'testee2'}).viewTab;
      await testeeViewTab2.click();
      const testeeViewPage2 = new ViewPagePO(appPO, viewId);
      await expect(await testeeViewPage2.getViewParams()).toEqual(
        expect.objectContaining({
          entity: 'product [string]',
          app: 'app2 [string]',
          param: 'param app2 [string]',
          transientParam: 'transient param app2 [string]',
        }));
    });

    test('should discard transient params when a view is replaced by another view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee view for app1
      const registerCapabilityPage1 = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app1');
      await registerCapabilityPage1.registerCapability({
        type: 'view',
        qualifier: {entity: 'product', app: 'app1'},
        params: [
          {
            name: 'transientParam',
            required: false,
            transient: true,
          },
        ],
        properties: {
          path: 'test-view',
          title: 'testee1',
          cssClass: 'testee1',
        },
      });

      // register testee view for app2
      const registerCapabilityPage2 = await microfrontendNavigator.openInNewTab(RegisterWorkbenchCapabilityPagePO, 'app2');
      await registerCapabilityPage2.registerCapability({
        type: 'view',
        qualifier: {entity: 'product', app: 'app2'},
        params: [
          {
            name: 'transientParam',
            required: false,
            transient: true,
          },
        ],
        properties: {
          path: 'test-view',
          title: 'testee2',
          cssClass: 'testee2',
        },
      });

      // navigate to view of app1
      const routerPage1 = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage1.enterQualifier({entity: 'product', app: 'app1'});
      await routerPage1.enterParams({transientParam: 'transient param app1'});
      await routerPage1.enterTarget('blank');
      await routerPage1.clickNavigate();

      // expect transient param to be contained in view params
      const testeeView1 = appPO.view({cssClass: 'testee1'});
      const viewId = await testeeView1.getViewId();
      const testeeViewPage1 = new ViewPagePO(appPO, viewId);
      await expect(await testeeViewPage1.getViewParams()).toEqual(
        expect.objectContaining({
          entity: 'product [string]',
          app: 'app1 [string]',
          transientParam: 'transient param app1 [string]',
        }));

      // self-navigate to view of app2
      const routerPage2 = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app2');
      await routerPage2.enterQualifier({entity: 'product', app: 'app2'});
      await routerPage2.enterTarget(viewId);
      await routerPage2.clickNavigate();

      // expect transient param to be contained in view params
      const testeeViewTab2 = appPO.view({cssClass: 'testee2'}).viewTab;
      await testeeViewTab2.click();
      const testeeViewPage2 = new ViewPagePO(appPO, viewId);
      await expect(await testeeViewPage2.getViewParams()).toEqual(
        expect.objectContaining({
          entity: 'product [string]',
          app: 'app2 [string]',
        }));
    });
  });
});
