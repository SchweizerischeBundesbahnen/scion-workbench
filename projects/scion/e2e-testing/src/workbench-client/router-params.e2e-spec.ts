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

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    await expect.poll(() => testeeViewPage.getViewParams()).toMatchObject({
      id: '123',
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

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

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

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

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

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

    // expect the optional parameter with value `null` to be contained in view params
    await expect.poll(() => testeeViewPage.getViewParams()).toMatchObject({
      id: 'null',
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

    const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

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
        param2: 'null',
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
        param2: 'null',
        param3: 'PARAM 3',
      });
    });
  });

  test.describe('Transient params', () => {

    test('should have transient params', async ({appPO, microfrontendNavigator}) => {
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
        },
      });

      // navigate
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'testee'}, {
        target: 'view.100',
        params: {id: '123', param1: 'transient param1', param2: 'transient param2'},
      });

      const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

      // expect transient param to be contained in view params
      await expect.poll(() => testeeViewPage.getViewParams()).toMatchObject({
        id: '123',
        param1: 'transient param1',
        param2: 'transient param2',
      });
    });

    test('should preserve data type of transient params', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'testee'},
        params: [
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
          {
            name: 'param3',
            required: false,
            transient: true,
          },
          {
            name: 'param4',
            required: false,
            transient: true,
          },
          {
            name: 'param5',
            required: false,
            transient: true,
          },
          {
            name: 'param6',
            required: false,
            transient: true,
          },
          {
            name: 'param7',
            required: false,
            transient: true,
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

      // expect transient params to have actual data type
      const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
      await expect.poll(() => testeeViewPage.getViewParams()).toMatchObject({
        param1: 'value',
        param2: '0 [number]',
        param3: '2 [number]',
        param4: 'true [boolean]',
        param5: 'false [boolean]',
        param6: 'null [null]',
      });
    });

    test('should not have transient params after page reload', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      // We do not register any capability here but use the built-in capability instead.
      // Otherwise, the view could not be displayed after page reload.

      // navigate
      const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage.navigate({component: 'view', app: 'app1'}, {
        target: 'view.100',
        params: {initialTitle: 'TITLE', transientParam: 'TRANSIENT PARAM'},
      });

      const testeeViewPage = new ViewPagePO(appPO, {viewId: 'view.100'});

      // expect transient param to be contained in view params
      await expect.poll(() => testeeViewPage.getViewParams()).toMatchObject({
        initialTitle: 'TITLE',
        transientParam: 'TRANSIENT PARAM',
      });

      // expect transient param to be removed from view params after page reload
      await appPO.reload();
      await expect.poll(() => testeeViewPage.getViewParams()).toMatchObject({initialTitle: 'TITLE'});
      await expect.poll(() => testeeViewPage.getViewParams()).not.toMatchObject({transientParam: expect.stringMatching('TRANSIENT PARAM')});
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
      await expect.poll(() => viewPage.getViewParams()).toMatchObject({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3 (a)',
        transientParam: 'TRANSIENT PARAM (a)',
      });
      // expect the component to be the same instance
      await expect.poll(() => viewPage.getComponentInstanceId()).toEqual(componentInstanceId);

      await viewPage.navigateSelf({
        transientParam: 'TRANSIENT PARAM (b)',
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
        transientParam: 'TRANSIENT PARAM (b)',
      });
      await expect.poll(() => viewPage.getViewParams()).not.toMatchObject({param3: expect.stringMatching('PARAM 3 (a)')});
      await expect.poll(() => viewPage.getViewParams()).not.toMatchObject({transientParam: expect.stringMatching('TRANSIENT PARAM (a)')});
      // expect the component to be the same instance
      await expect.poll(() => viewPage.getComponentInstanceId()).toEqual(componentInstanceId);

      // expect transient param to be removed from view params after page reload
      await appPO.reload();
      await expect.poll(() => viewPage.getViewParams()).toMatchObject({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3 (b)',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
      });
      await expect.poll(() => viewPage.getViewParams()).not.toMatchObject({transientParam: expect.stringMatching('TRANSIENT PARAM (b)')});
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
      await expect.poll(() => viewPage.getViewParams()).toMatchObject({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3 (a)',
        transientParam: 'TRANSIENT PARAM (a)',
      });
      // expect the component to be the same instance
      await expect.poll(() => viewPage.getComponentInstanceId()).toEqual(componentInstanceId);

      await viewPage.navigateSelf({
        transientParam: 'TRANSIENT PARAM (b)',
        param3: 'PARAM 3 (b)',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
      }, {paramsHandling: 'replace'});

      // expect the view's params to be updated
      await expect.poll(() => viewPage.getViewParams()).toMatchObject({
        param3: 'PARAM 3 (b)',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
        transientParam: 'TRANSIENT PARAM (b)',
      });
      await expect.poll(() => viewPage.getViewParams()).not.toMatchObject({param1: expect.stringMatching('PARAM 1')});
      await expect.poll(() => viewPage.getViewParams()).not.toMatchObject({param2: expect.stringMatching('PARAM 2')});
      await expect.poll(() => viewPage.getViewParams()).not.toMatchObject({param3: expect.stringMatching('PARAM 3 (a)')});
      await expect.poll(() => viewPage.getViewParams()).not.toMatchObject({transientParam: expect.stringMatching('TRANSIENT PARAM (a)')});
      // expect the component to be the same instance
      await expect.poll(() => viewPage.getComponentInstanceId()).toEqual(componentInstanceId);

      // expect transient param to be removed from view params after page reload
      await appPO.reload();
      await expect.poll(() => viewPage.getViewParams()).toMatchObject({
        param3: 'PARAM 3 (b)',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
      });
      await expect.poll(() => viewPage.getViewParams()).not.toMatchObject({transientParam: expect.stringMatching('TRANSIENT PARAM (b)')});
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
      await expect.poll(() => viewPage.getViewParams()).toMatchObject({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
        transientParam: 'TRANSIENT PARAM',
      });

      // expect transient param to be removed from view params after page reload
      await appPO.reload();
      await expect.poll(() => viewPage.getViewParams()).toMatchObject({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
      });
      await expect.poll(() => viewPage.getViewParams()).not.toMatchObject({transientParam: expect.stringMatching('TRANSIENT PARAM')});
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
      await expect.poll(() => viewPage.getViewParams()).not.toMatchObject({param1: expect.stringMatching('PARAM 1')});
      await expect.poll(() => viewPage.getViewParams()).not.toMatchObject({param2: expect.stringMatching('PARAM 2')});
      await expect.poll(() => viewPage.getViewParams()).not.toMatchObject({param3: expect.stringMatching('PARAM 3')});
      await expect.poll(() => viewPage.getViewParams()).not.toMatchObject({param4: expect.stringMatching('PARAM 4')});
      await expect.poll(() => viewPage.getViewParams()).not.toMatchObject({param4: expect.stringMatching('PARAM 5')});
      await expect.poll(() => viewPage.getViewParams()).toMatchObject({transientParam: 'TRANSIENT PARAM'});

      // expect transient param to be removed from view params after page reload
      await appPO.reload();
      await expect.poll(() => viewPage.getViewParams()).not.toMatchObject({transientParam: expect.stringMatching('TRANSIENT PARAM')});
    });

    test('should correctly update params and transient params when a view is replaced by another view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'testee', app: 'app1'},
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
        },
      });

      await microfrontendNavigator.registerCapability('app2', {
        type: 'view',
        qualifier: {component: 'testee', app: 'app2'},
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
        },
      });

      // navigate to view of app1
      const routerPage1 = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage1.navigate({component: 'testee', app: 'app1'}, {
        target: 'blank',
        params: {param: 'param app1', transientParam: 'transient param app1'},
        cssClass: 'testee1',
      });

      const testeeViewPage1 = new ViewPagePO(appPO, {cssClass: 'testee1'});
      const testeeViewId = await testeeViewPage1.view.getViewId();

      // expect transient param to be contained in view params
      await expect.poll(() => testeeViewPage1.getViewParams()).toMatchObject({
        param: 'param app1',
        transientParam: 'transient param app1',
      });

      // self-navigate to view of app2
      const routerPage2 = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app2');
      await routerPage2.navigate({component: 'testee', app: 'app2'}, {
        target: testeeViewId,
        params: {param: 'param app2', transientParam: 'transient param app2'},
        cssClass: 'testee2',
      });

      const testeeViewPage2 = new ViewPagePO(appPO, {cssClass: 'testee2'});
      await testeeViewPage2.view.tab.click();

      // expect transient param to be contained in view params
      await expect.poll(() => testeeViewPage2.getViewParams()).toMatchObject({
        param: 'param app2',
        transientParam: 'transient param app2',
      });
    });

    test('should discard transient params when a view is replaced by another view', async ({appPO, microfrontendNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: true});

      await microfrontendNavigator.registerCapability('app1', {
        type: 'view',
        qualifier: {component: 'testee', app: 'app1'},
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
        },
      });

      // register testee view for app2
      await microfrontendNavigator.registerCapability('app2', {
        type: 'view',
        qualifier: {component: 'testee', app: 'app2'},
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
        },
      });

      // navigate to view of app1
      const routerPage1 = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
      await routerPage1.navigate({component: 'testee', app: 'app1'}, {
        target: 'blank',
        params: {transientParam: 'transient param app1'},
        cssClass: 'testee1',
      });

      const testeeViewPage1 = new ViewPagePO(appPO, {cssClass: 'testee1'});

      // expect transient param to be contained in view params
      const testeeViewId = await testeeViewPage1.view.getViewId();
      await expect.poll(() => testeeViewPage1.getViewParams()).toMatchObject({
        transientParam: 'transient param app1',
      });

      // self-navigate to view of app2
      const routerPage2 = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app2');
      await routerPage2.navigate({component: 'testee', app: 'app2'}, {
        target: testeeViewId,
        cssClass: 'testee2',
      });

      // expect transient param not to be contained in view params
      const testeeViewPage2 = new ViewPagePO(appPO, {cssClass: 'testee2'});
      await testeeViewPage2.view.tab.click();
      await expect.poll(() => testeeViewPage2.getViewParams()).not.toMatchObject({
        transientParam: 'transient param app1',
      });
    });
  });
});
