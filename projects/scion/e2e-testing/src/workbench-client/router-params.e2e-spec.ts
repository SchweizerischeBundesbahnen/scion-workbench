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
import {RouterPagePO} from './page-object/router-page.po';

test.describe('Workbench Router', () => {

  test('should contain provided params in view params', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {name: 'id', required: true},
      ],
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });

    // navigate
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.100',
      params: {id: '123'},
    });

    const testeeViewPage = new ViewPagePO(appPO.view({viewId: 'view.100'}));

    await expect.poll(() => testeeViewPage.getViewParams()).toMatchObject({
      id: '123',
    });
  });

  test('should preserve data type of params', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {
          name: 'param1',
          required: false,
        },
        {
          name: 'param2',
          required: false,
        },
        {
          name: 'param3',
          required: false,
        },
        {
          name: 'param4',
          required: false,
        },
        {
          name: 'param5',
          required: false,
        },
        {
          name: 'param6',
          required: false,
        },
        {
          name: 'param7',
          required: false,
        },
      ],
      properties: {
        path: 'test-view',
      },
    });

    // Navigate to view.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.1',
      params: {
        param1: 'value',
        param2: '<number>0</number>',
        param3: '<number>2</number>',
        param4: '<boolean>true</boolean>',
        param5: '<boolean>false</boolean>',
        param6: '<null>',
        param7: '<undefined>',
      },
    });

    // Expect params to have actual data type.
    const testeeViewPage = new ViewPagePO(appPO.view({viewId: 'view.1'}));
    await expect.poll(() => testeeViewPage.getViewParams()).toMatchObject({
      param1: 'value',
      param2: '0 [number]',
      param3: '2 [number]',
      param4: 'true [boolean]',
      param5: 'false [boolean]',
      param6: 'null [null]',
    });
  });

  test('should substitute named URL segments with values from the params', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {name: 'segment1', required: true},
        {name: 'segment2', required: true},
        {name: 'mp1', required: true},
        {name: 'mp2', required: true},
        {name: 'qp1', required: true},
        {name: 'qp2', required: true},
        {name: 'fragment', required: true},
      ],
      properties: {
        path: 'test-pages/view-test-page/:segment1/:segment2;mp1=:mp1;mp2=:mp2?qp1=:qp1&qp2=:qp2#:fragment',
        title: 'testee',
      },
    });

    // navigate
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.100',
      params: {segment1: 'SEG1', segment2: 'SEG2', mp1: 'MP1', mp2: 'MP2', qp1: 'QP1', qp2: 'QP2', fragment: 'FRAGMENT'},
    });

    const testeeViewPage = new ViewPagePO(appPO.view({viewId: 'view.100'}));

    // expect named params to be substituted
    await expect.poll(() => testeeViewPage.getViewParams()).toMatchObject({
      segment1: 'SEG1',
      segment2: 'SEG2',
      mp1: 'MP1',
      mp2: 'MP2',
      qp1: 'QP1',
      qp2: 'QP2',
      fragment: 'FRAGMENT',
    });
    await expect.poll(() => testeeViewPage.getRouteParams()).toEqual({segment1: 'SEG1', segment2: 'SEG2', mp1: 'MP1', mp2: 'MP2'});
    await expect.poll(() => testeeViewPage.getRouteQueryParams()).toEqual({qp1: 'QP1', qp2: 'QP2'});
    await expect.poll(() => testeeViewPage.getRouteFragment()).toEqual('FRAGMENT');
  });

  test('should update view params without constructing a new view instance', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {name: 'id', required: true},
      ],
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });

    // navigate
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.100',
      params: {id: '123'},
    });

    const testeeViewPage = new ViewPagePO(appPO.view({viewId: 'view.100'}));

    // capture the view's component instance id
    const testeeComponentInstanceId = await testeeViewPage.getComponentInstanceId();

    // navigate to update the view's params
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.100',
      params: {id: '456'},
    });

    await testeeViewPage.view.tab.click();

    // expect the view's params to be updated
    await expect.poll(() => testeeViewPage.getViewParams()).toMatchObject({
      id: '456',
    });
    // expect no new view instance to be constructed
    await expect.poll(() => testeeViewPage.getComponentInstanceId()).toEqual(testeeComponentInstanceId);
  });

  test('should contain the provided param with value `null` in view params', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {
          name: 'id',
          required: true,
        },
      ],
      properties: {
        path: 'test-view',
        title: 'testee',
      },
    });

    // navigate
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.100',
      params: {id: '<null>'},
    });

    const testeeViewPage = new ViewPagePO(appPO.view({viewId: 'view.100'}));

    // expect the optional parameter with value `null` to be contained in view params
    await expect.poll(() => testeeViewPage.getViewParams()).toMatchObject({
      id: 'null [null]',
    });
  });

  test('should not contain the provided param with value `undefined` in view params', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'view',
      qualifier: {component: 'testee'},
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
      },
    });

    // navigate
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.100',
      params: {id: '123', param1: '<undefined>'},
    });

    const testeeViewPage = new ViewPagePO(appPO.view({viewId: 'view.100'}));

    await expect.poll(() => testeeViewPage.getViewParams()).toMatchObject({
      id: '123',
    });
    await expect.poll(() => testeeViewPage.getViewParams()).not.toMatchObject({param1: expect.anything()});
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
      await expect.poll(() => viewPage.getViewParams()).toMatchObject({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3 (a)',
      });
      // expect the component to be the same instance
      await expect.poll(() => viewPage.getComponentInstanceId()).toEqual(componentInstanceId);

      await viewPage.navigateSelf({
        param3: 'PARAM 3 (b)',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
      });

      // expect the view's params to be updated
      await expect.poll(() => viewPage.getViewParams()).toMatchObject({
        param3: 'PARAM 3 (b)',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
      });
      await expect.poll(() => viewPage.getViewParams()).not.toMatchObject({param1: expect.stringMatching('PARAM 1')});
      await expect.poll(() => viewPage.getViewParams()).not.toMatchObject({param2: expect.stringMatching('PARAM 2')});
      await expect.poll(() => viewPage.getViewParams()).not.toMatchObject({param3: expect.stringMatching('PARAM 3 (a)')});

      // expect the component to be the same instance
      await expect.poll(() => viewPage.getComponentInstanceId()).toEqual(componentInstanceId);
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
      await expect.poll(() => viewPage.getViewParams()).toMatchObject({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3 (a)',
      });
      // expect the component to be the same instance
      await expect.poll(() => viewPage.getComponentInstanceId()).toEqual(componentInstanceId);

      await viewPage.navigateSelf({
        param3: 'PARAM 3 (b)',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
      }, {paramsHandling: 'replace'});

      // expect the view's params to be updated
      await expect.poll(() => viewPage.getViewParams()).toMatchObject({
        param3: 'PARAM 3 (b)',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
      });
      await expect.poll(() => viewPage.getViewParams()).not.toMatchObject({param1: expect.stringMatching('PARAM 1')});
      await expect.poll(() => viewPage.getViewParams()).not.toMatchObject({param2: expect.stringMatching('PARAM 2')});
      await expect.poll(() => viewPage.getViewParams()).not.toMatchObject({param3: expect.stringMatching('PARAM 3 (a)')});
      // expect the component to be the same instance
      await expect.poll(() => viewPage.getComponentInstanceId()).toEqual(componentInstanceId);
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
      await expect.poll(() => viewPage.getViewParams()).toMatchObject({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3 (a)',
      });
      // expect the component to be the same instance
      await expect.poll(() => viewPage.getComponentInstanceId()).toEqual(componentInstanceId);

      await viewPage.navigateSelf({
        param3: 'PARAM 3 (b)',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
      }, {paramsHandling: 'merge'});

      // expect the view's params to be updated
      await expect.poll(() => viewPage.getViewParams()).toMatchObject({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3 (b)',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
      });
      await expect.poll(() => viewPage.getViewParams()).not.toMatchObject({param3: expect.stringMatching('PARAM 3 (a)')});
      // expect the component to be the same instance
      await expect.poll(() => viewPage.getComponentInstanceId()).toEqual(componentInstanceId);
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
      await expect.poll(() => viewPage.getViewParams()).toMatchObject({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
      });
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
      await expect.poll(() => viewPage.getViewParams()).not.toMatchObject({param1: expect.stringMatching('PARAM 1')});
      await expect.poll(() => viewPage.getViewParams()).not.toMatchObject({param2: expect.stringMatching('PARAM 2')});
      await expect.poll(() => viewPage.getViewParams()).not.toMatchObject({param3: expect.stringMatching('PARAM 3')});
      await expect.poll(() => viewPage.getViewParams()).not.toMatchObject({param4: expect.stringMatching('PARAM 4')});
      await expect.poll(() => viewPage.getViewParams()).toMatchObject({param5: 'PARAM 5'});
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
      await expect.poll(() => viewPage.getViewParams()).toMatchObject({
        param1: 'PARAM 1',
        param3: 'PARAM 3',
      });
      await expect.poll(() => viewPage.getViewParams()).not.toMatchObject({param2: expect.anything()});
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
      await expect.poll(() => viewPage.getViewParams()).toMatchObject({param1: 'PARAM 1', param3: 'PARAM 3'});
      await expect.poll(() => viewPage.getViewParams()).not.toMatchObject({param2: expect.anything()});
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
      await expect.poll(() => viewPage.getViewParams()).toMatchObject({
        param1: 'PARAM 1',
        param2: 'null [null]',
        param3: 'PARAM 3',
      });
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
      await expect.poll(() => viewPage.getViewParams()).toMatchObject({
        param1: 'PARAM 1',
        param2: 'null [null]',
        param3: 'PARAM 3',
      });
    });
  });
});
