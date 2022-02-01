/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from '../app.po';
import {RouterPagePO} from './page-object/router-page.po';
import {installSeleniumWebDriverClickFix} from '../helper/selenium-webdriver-click-fix';
import {RegisterWorkbenchCapabilityPagePO} from './page-object/register-workbench-capability-page.po';
import {ViewPagePO} from './page-object/view-page.po';
import {consumeBrowserLog} from '../helper/testing.util';

export declare type HTMLElement = any;

describe('Workbench Router', () => {

  const appPO = new AppPO();

  installSeleniumWebDriverClickFix();

  beforeEach(async () => consumeBrowserLog());

  it('should contain the qualifier in view params', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {entity: 'product', id: '*'},
      properties: {
        path: 'test-view',
        title: 'product',
        cssClass: 'product',
      },
    });

    // navigate
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({entity: 'product', id: '123'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // expect qualifier to be contained in view params
    const testeeViewTabPO = appPO.findViewTab({cssClass: 'product'});
    const testeeViewPagePO = new ViewPagePO(await testeeViewTabPO.getViewId());

    await expect(await testeeViewPagePO.getViewParams()).toEqual(jasmine.objectContaining({entity: 'product', id: '123'}));
  });

  it('should contain the provided params in view params', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {entity: 'product', id: '*'},
      requiredParams: ['readonly'],
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({entity: 'product', id: '123'});
    await routerPagePO.enterParams({readonly: 'true'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // expect qualifier to be contained in view params
    const testeeViewTabPO = appPO.findViewTab({cssClass: 'testee'});
    const testeeViewPagePO = new ViewPagePO(await testeeViewTabPO.getViewId());

    await expect(await testeeViewPagePO.getViewParams()).toEqual(jasmine.objectContaining({entity: 'product', id: '123', readonly: 'true'}));
  });

  it('should not overwrite qualifier values with param values', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {entity: 'product', id: '*'},
      requiredParams: ['id'],
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({entity: 'product', id: '123'});
    await routerPagePO.enterParams({id: '456'}); // should be ignored
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // expect qualifier values not to be overwritten by params
    const testeeViewTabPO = appPO.findViewTab({cssClass: 'testee'});
    const testeeViewPagePO = new ViewPagePO(await testeeViewTabPO.getViewId());

    await expect(await testeeViewPagePO.getViewParams()).toEqual(jasmine.objectContaining({entity: 'product', id: '123'}));
  });

  it('should substitute named URL params with values of the qualifier and params', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {component: 'testee', seg1: '*', mp1: '*', qp1: '*'},
      requiredParams: ['seg3', 'mp2', 'qp2', 'fragment'],
      properties: {
        path: 'test-view/:seg1/segment2/:seg3;mp1=:mp1;mp2=:mp2?qp1=:qp1&qp2=:qp2#:fragment',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({component: 'testee', seg1: 'SEG1', mp1: 'MP1', qp1: 'QP1'});
    await routerPagePO.enterParams({seg3: 'SEG3', mp2: 'MP2', qp2: 'QP2', fragment: 'FRAGMENT'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    // expect named params to be substituted
    const testeeViewTabPO = appPO.findViewTab({cssClass: 'testee'});
    const testeeViewPagePO = new ViewPagePO(await testeeViewTabPO.getViewId());

    await expect(await testeeViewPagePO.getViewParams()).toEqual(jasmine.objectContaining({component: 'testee', seg1: 'SEG1', seg3: 'SEG3', mp1: 'MP1', mp2: 'MP2', qp1: 'QP1', qp2: 'QP2', fragment: 'FRAGMENT'}));
    await expect(await testeeViewPagePO.getRouteParams()).toEqual({segment1: 'SEG1', segment3: 'SEG3', mp1: 'MP1', mp2: 'MP2'});
    await expect(await testeeViewPagePO.getRouteQueryParams()).toEqual({qp1: 'QP1', qp2: 'QP2'});
    await expect(await testeeViewPagePO.getRouteFragment()).toEqual('FRAGMENT');
  });

  it('should update view params without constructing a new view instance', async () => {
    await appPO.navigateTo({microfrontendSupport: true});

    // register testee view
    const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
    await registerCapabilityPagePO.registerCapability({
      type: 'view',
      qualifier: {entity: 'product', id: '*'},
      requiredParams: ['readonly'],
      properties: {
        path: 'test-view',
        title: 'testee',
        cssClass: 'testee',
      },
    });

    // navigate
    const routerPagePO = await RouterPagePO.openInNewTab('app1');
    await routerPagePO.enterQualifier({entity: 'product', id: '123'});
    await routerPagePO.enterParams({readonly: 'true'});
    await routerPagePO.selectTarget('blank');
    await routerPagePO.clickNavigate();

    const testeeViewTabPO = appPO.findViewTab({cssClass: 'testee'});
    const testeeViewPagePO = new ViewPagePO(await testeeViewTabPO.getViewId());

    // capture the view's component instance id
    const testeeComponentInstanceId = await testeeViewPagePO.getComponentInstanceId();

    // navigate to update the view's params
    await routerPagePO.viewTabPO.activate();
    await routerPagePO.enterQualifier({entity: 'product', id: '123'});
    await routerPagePO.enterParams({readonly: 'false'});
    await routerPagePO.selectTarget('self');
    await routerPagePO.enterSelfViewId(testeeViewPagePO.viewId);
    await routerPagePO.clickNavigate();

    await testeeViewPagePO.viewTabPO.activate();

    // expect the view's params to be updated
    await expect(await testeeViewPagePO.getViewParams()).toEqual(jasmine.objectContaining({entity: 'product', id: '123', readonly: 'false'}));
    // expect no new view instance to be constructed
    await expect(await testeeViewPagePO.getComponentInstanceId()).toEqual(testeeComponentInstanceId);
  });

  describe('Self-Navigation', () => {

    it('should, by default, replace params', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      const viewPagePO = await ViewPagePO.openInNewTab('app1');
      const componentInstanceId = await viewPagePO.getComponentInstanceId();

      await viewPagePO.navigateSelf({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3 (a)',
      });

      // expect the view's params to be updated
      await expect(await viewPagePO.getViewParams()).toEqual(jasmine.objectContaining({param1: 'PARAM 1', param2: 'PARAM 2', param3: 'PARAM 3 (a)'}));
      // expect the component to be the same instance
      await expect(await viewPagePO.getComponentInstanceId()).toEqual(componentInstanceId);

      await viewPagePO.navigateSelf({
        param3: 'PARAM 3 (b)',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
      });

      // expect the view's params to be updated
      const params = await viewPagePO.getViewParams();
      await expect(params).toEqual(jasmine.objectContaining({param3: 'PARAM 3 (b)', param4: 'PARAM 4', param5: 'PARAM 5'}));
      await expect(params).not.toEqual(jasmine.objectContaining({param1: 'PARAM 1'}));
      await expect(params).not.toEqual(jasmine.objectContaining({param2: 'PARAM 2'}));
      await expect(params).not.toEqual(jasmine.objectContaining({param3: 'PARAM 3 (a)'}));

      // expect the component to be the same instance
      await expect(await viewPagePO.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    it('should replace params', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      const viewPagePO = await ViewPagePO.openInNewTab('app1');
      const componentInstanceId = await viewPagePO.getComponentInstanceId();

      await viewPagePO.navigateSelf({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3 (a)',
      });

      // expect the view's params to be updated
      await expect(await viewPagePO.getViewParams()).toEqual(jasmine.objectContaining({param1: 'PARAM 1', param2: 'PARAM 2', param3: 'PARAM 3 (a)'}));
      // expect the component to be the same instance
      await expect(await viewPagePO.getComponentInstanceId()).toEqual(componentInstanceId);

      await viewPagePO.navigateSelf({
        param3: 'PARAM 3 (b)',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
      }, {paramsHandling: 'replace'});

      // expect the view's params to be updated
      const params = await viewPagePO.getViewParams();
      await expect(params).toEqual(jasmine.objectContaining({param3: 'PARAM 3 (b)', param4: 'PARAM 4', param5: 'PARAM 5'}));
      await expect(params).not.toEqual(jasmine.objectContaining({param1: 'PARAM 1'}));
      await expect(params).not.toEqual(jasmine.objectContaining({param2: 'PARAM 2'}));
      await expect(params).not.toEqual(jasmine.objectContaining({param3: 'PARAM 3 (a)'}));
      // expect the component to be the same instance
      await expect(await viewPagePO.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    it('should merge params', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      const viewPagePO = await ViewPagePO.openInNewTab('app1');
      const componentInstanceId = await viewPagePO.getComponentInstanceId();

      await viewPagePO.navigateSelf({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3 (a)',
      });

      // expect the view's params to be updated
      await expect(await viewPagePO.getViewParams()).toEqual(jasmine.objectContaining({param1: 'PARAM 1', param2: 'PARAM 2', param3: 'PARAM 3 (a)'}));
      // expect the component to be the same instance
      await expect(await viewPagePO.getComponentInstanceId()).toEqual(componentInstanceId);

      await viewPagePO.navigateSelf({
        param3: 'PARAM 3 (b)',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
      }, {paramsHandling: 'merge'});

      // expect the view's params to be updated
      const params = await viewPagePO.getViewParams();
      await expect(params).toEqual(jasmine.objectContaining({param1: 'PARAM 1', param2: 'PARAM 2', param3: 'PARAM 3 (b)', param4: 'PARAM 4', param5: 'PARAM 5'}));
      await expect(params).not.toEqual(jasmine.objectContaining({param3: 'PARAM 3 (a)'}));
      // expect the component to be the same instance
      await expect(await viewPagePO.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    it('should correctly merge params when performing bulk navigations', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      const viewPagePO = await ViewPagePO.openInNewTab('app1');
      await viewPagePO.navigateSelf({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
      }, {paramsHandling: 'merge', navigatePerParam: true});

      // expect the view's params to be updated
      await expect(await viewPagePO.getViewParams()).toEqual(jasmine.objectContaining({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
      }));
    });

    it('should correctly replace params when performing bulk navigations', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      const viewPagePO = await ViewPagePO.openInNewTab('app1');
      await viewPagePO.navigateSelf({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
      }, {paramsHandling: 'replace', navigatePerParam: true});

      // expect the view's params to be updated
      const params = await viewPagePO.getViewParams();
      await expect(params).not.toEqual(jasmine.objectContaining({param1: 'PARAM 1'}));
      await expect(params).not.toEqual(jasmine.objectContaining({param2: 'PARAM 2'}));
      await expect(params).not.toEqual(jasmine.objectContaining({param3: 'PARAM 3'}));
      await expect(params).not.toEqual(jasmine.objectContaining({param4: 'PARAM 4'}));
      await expect(params).toEqual(jasmine.objectContaining({param5: 'PARAM 5'}));
    });

    it('should remove params having `undefined` as value [paramsHandling=replace]', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      const viewPagePO = await ViewPagePO.openInNewTab('app1');
      await viewPagePO.navigateSelf({
        param1: 'PARAM 1',
        param2: '<undefined>',
        param3: 'PARAM 3',
      }, {paramsHandling: 'replace'});

      // expect the view's params to be updated
      const params = await viewPagePO.getViewParams();
      await expect(params).toEqual(jasmine.objectContaining({param1: 'PARAM 1', param3: 'PARAM 3'}));
      await expect(params).not.toEqual(jasmine.objectContaining({param2: jasmine.anything()}));
    });

    it('should remove params having `undefined` as their value [paramsHandling=merge]', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      const viewPagePO = await ViewPagePO.openInNewTab('app1');
      await viewPagePO.navigateSelf({
        param1: 'PARAM 1',
        param2: '<undefined>',
        param3: 'PARAM 3',
      }, {paramsHandling: 'merge'});

      // expect the view's params to be updated
      const params = await viewPagePO.getViewParams();
      await expect(params).toEqual(jasmine.objectContaining({param1: 'PARAM 1', param3: 'PARAM 3'}));
      await expect(params).not.toEqual(jasmine.objectContaining({param2: jasmine.anything()}));
    });

    it('should not remove params having `null` as their value [paramsHandling=replace]', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      const viewPagePO = await ViewPagePO.openInNewTab('app1');
      await viewPagePO.navigateSelf({
        param1: 'PARAM 1',
        param2: '<null>',
        param3: 'PARAM 3',
      }, {paramsHandling: 'replace'});

      // expect the view's params to be updated
      const params = await viewPagePO.getViewParams();
      await expect(params).toEqual(jasmine.objectContaining({param1: 'PARAM 1', param2: 'null', param3: 'PARAM 3'}));
    });

    it('should not remove params having `null` as their value [paramsHandling=merge]', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      const viewPagePO = await ViewPagePO.openInNewTab('app1');
      await viewPagePO.navigateSelf({
        param1: 'PARAM 1',
        param2: '<null>',
        param3: 'PARAM 3',
      }, {paramsHandling: 'merge'});

      // expect the view's params to be updated
      const params = await viewPagePO.getViewParams();
      await expect(params).toEqual(jasmine.objectContaining({param1: 'PARAM 1', param2: 'null', param3: 'PARAM 3'}));
    });
  });

  describe('Transient params', () => {

    it('should contain the provided transient params in view params', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee view
      const registerCapabilityPagePO = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
      await registerCapabilityPagePO.registerCapability({
        type: 'view',
        qualifier: {entity: 'product', id: '*'},
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
        ],
        properties: {
          path: 'test-view',
          title: 'testee',
          cssClass: 'testee',
        },
      });

      // navigate
      const routerPagePO = await RouterPagePO.openInNewTab('app1');
      await routerPagePO.enterQualifier({entity: 'product', id: '123'});
      await routerPagePO.enterParams({param1: 'transient param1', param2: 'transient param2'});
      await routerPagePO.selectTarget('blank');
      await routerPagePO.clickNavigate();

      // expect transient param to be contained in view params
      const testeeViewTabPO = appPO.findViewTab({cssClass: 'testee'});
      const testeeViewPagePO = new ViewPagePO(await testeeViewTabPO.getViewId());

      await expect(await testeeViewPagePO.getViewParams()).toEqual(jasmine.objectContaining({entity: 'product', id: '123', param1: 'transient param1', param2: 'transient param2'}));
    });

    it('should not contain transient params in view params after page reload', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // We do not register any capability here but use the built-in capability instead.
      // Otherwise, the view could not be displayed after page reload.

      // navigate
      const routerPagePO = await RouterPagePO.openInNewTab('app1');
      await routerPagePO.enterQualifier({component: 'view', app: 'app1'});
      await routerPagePO.enterParams({initialTitle: 'TITLE', transientParam: 'TRANSIENT PARAM'});
      await routerPagePO.selectTarget('blank');
      await routerPagePO.clickNavigate();

      // expect transient param to be contained in view params
      const testeeViewTabPO = appPO.findViewTab({cssClass: 'e2e-test-view'});
      const testeeViewPagePO = new ViewPagePO(await testeeViewTabPO.getViewId());

      await expect(await testeeViewPagePO.getViewParams()).toEqual(jasmine.objectContaining({initialTitle: 'TITLE', transientParam: 'TRANSIENT PARAM'}));

      // expect transient param to be removed from view params after page reload
      await appPO.reload();
      const testeeViewTabPO2 = appPO.findViewTab({cssClass: 'e2e-test-view'});
      const testeeViewPagePO2 = new ViewPagePO(await testeeViewTabPO2.getViewId());
      await expect(await testeeViewPagePO2.getViewParams()).toEqual(jasmine.objectContaining({initialTitle: 'TITLE'}));
      await expect(await testeeViewPagePO2.getViewParams()).not.toEqual(jasmine.objectContaining({transientParam: 'TRANSIENT PARAM'}));
    });

    it('should merge params on self-navigation', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      const viewPagePO = await ViewPagePO.openInNewTab('app1');
      const componentInstanceId = await viewPagePO.getComponentInstanceId();

      await viewPagePO.navigateSelf({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3 (a)',
        transientParam: 'TRANSIENT PARAM (a)',
      });

      // expect the view's params to be updated
      await expect(await viewPagePO.getViewParams()).toEqual(jasmine.objectContaining({param1: 'PARAM 1', param2: 'PARAM 2', param3: 'PARAM 3 (a)', transientParam: 'TRANSIENT PARAM (a)'}));
      // expect the component to be the same instance
      await expect(await viewPagePO.getComponentInstanceId()).toEqual(componentInstanceId);

      await viewPagePO.navigateSelf({
        transientParam: 'TRANSIENT PARAM (b)',
        param3: 'PARAM 3 (b)',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
      }, {paramsHandling: 'merge'});

      // expect the view's params to be updated
      const params = await viewPagePO.getViewParams();
      await expect(params).toEqual(jasmine.objectContaining({param1: 'PARAM 1', param2: 'PARAM 2', param3: 'PARAM 3 (b)', param4: 'PARAM 4', param5: 'PARAM 5', transientParam: 'TRANSIENT PARAM (b)'}));
      await expect(params).not.toEqual(jasmine.objectContaining({param3: 'PARAM 3 (a)'}));
      await expect(params).not.toEqual(jasmine.objectContaining({transientParam: 'TRANSIENT PARAM (a)'}));
      // expect the component to be the same instance
      await expect(await viewPagePO.getComponentInstanceId()).toEqual(componentInstanceId);

      // expect transient param to be removed from view params after page reload
      await appPO.reload();
      const paramsAfterReload = await viewPagePO.getViewParams();
      await expect(paramsAfterReload).toEqual(jasmine.objectContaining({param1: 'PARAM 1', param2: 'PARAM 2', param3: 'PARAM 3 (b)', param4: 'PARAM 4', param5: 'PARAM 5'}));
      await expect(paramsAfterReload).not.toEqual(jasmine.objectContaining({transientParam: 'TRANSIENT PARAM (b)'}));
    });

    it('should replace params on self-navigation', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      const viewPagePO = await ViewPagePO.openInNewTab('app1');
      const componentInstanceId = await viewPagePO.getComponentInstanceId();

      await viewPagePO.navigateSelf({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3 (a)',
        transientParam: 'TRANSIENT PARAM (a)',
      });

      // expect the view's params to be updated
      await expect(await viewPagePO.getViewParams()).toEqual(jasmine.objectContaining({param1: 'PARAM 1', param2: 'PARAM 2', param3: 'PARAM 3 (a)', transientParam: 'TRANSIENT PARAM (a)'}));
      // expect the component to be the same instance
      await expect(await viewPagePO.getComponentInstanceId()).toEqual(componentInstanceId);

      await viewPagePO.navigateSelf({
        transientParam: 'TRANSIENT PARAM (b)',
        param3: 'PARAM 3 (b)',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
      }, {paramsHandling: 'replace'});

      // expect the view's params to be updated
      const params = await viewPagePO.getViewParams();
      await expect(params).toEqual(jasmine.objectContaining({param3: 'PARAM 3 (b)', param4: 'PARAM 4', param5: 'PARAM 5', transientParam: 'TRANSIENT PARAM (b)'}));
      await expect(params).not.toEqual(jasmine.objectContaining({param1: 'PARAM 1'}));
      await expect(params).not.toEqual(jasmine.objectContaining({param2: 'PARAM 2'}));
      await expect(params).not.toEqual(jasmine.objectContaining({param3: 'PARAM 3 (a)'}));
      await expect(params).not.toEqual(jasmine.objectContaining({transientParam: 'TRANSIENT PARAM (a)'}));
      // expect the component to be the same instance
      await expect(await viewPagePO.getComponentInstanceId()).toEqual(componentInstanceId);

      // expect transient param to be removed from view params after page reload
      await appPO.reload();
      const paramsAfterReload = await viewPagePO.getViewParams();
      await expect(paramsAfterReload).toEqual(jasmine.objectContaining({param3: 'PARAM 3 (b)', param4: 'PARAM 4', param5: 'PARAM 5'}));
      await expect(paramsAfterReload).not.toEqual(jasmine.objectContaining({transientParam: 'TRANSIENT PARAM (b)'}));
    });

    it('should correctly merge params when performing bulk navigations', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      const viewPagePO = await ViewPagePO.openInNewTab('app1');
      await viewPagePO.navigateSelf({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
        transientParam: 'TRANSIENT PARAM',
      }, {paramsHandling: 'merge', navigatePerParam: true});

      // expect the view's params to be updated
      await expect(await viewPagePO.getViewParams()).toEqual(jasmine.objectContaining({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
        transientParam: 'TRANSIENT PARAM',
      }));

      // expect transient param to be removed from view params after page reload
      await appPO.reload();
      const paramsAfterReload = await viewPagePO.getViewParams();
      await expect(paramsAfterReload).toEqual(jasmine.objectContaining({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
      }));
      await expect(paramsAfterReload).not.toEqual(jasmine.objectContaining({transientParam: 'TRANSIENT PARAM'}));
    });

    it('should correctly replace params when performing bulk navigations', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      const viewPagePO = await ViewPagePO.openInNewTab('app1');
      await viewPagePO.navigateSelf({
        param1: 'PARAM 1',
        param2: 'PARAM 2',
        param3: 'PARAM 3',
        param4: 'PARAM 4',
        param5: 'PARAM 5',
        transientParam: 'TRANSIENT PARAM',
      }, {paramsHandling: 'replace', navigatePerParam: true});

      // expect the view's params to be updated
      const params = await viewPagePO.getViewParams();
      await expect(params).not.toEqual(jasmine.objectContaining({param1: 'PARAM 1'}));
      await expect(params).not.toEqual(jasmine.objectContaining({param2: 'PARAM 2'}));
      await expect(params).not.toEqual(jasmine.objectContaining({param3: 'PARAM 3'}));
      await expect(params).not.toEqual(jasmine.objectContaining({param4: 'PARAM 4'}));
      await expect(params).not.toEqual(jasmine.objectContaining({param4: 'PARAM 5'}));
      await expect(params).toEqual(jasmine.objectContaining({transientParam: 'TRANSIENT PARAM'}));

      // expect transient param to be removed from view params after page reload
      await appPO.reload();
      const paramsAfterReload = await viewPagePO.getViewParams();
      await expect(paramsAfterReload).not.toEqual(jasmine.objectContaining({transientParam: 'TRANSIENT PARAM'}));
    });

    it('should correctly update params and transient params when a view is replaced by another view', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee view for app1
      const registerCapabilityPagePO1 = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
      await registerCapabilityPagePO1.registerCapability({
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
      const registerCapabilityPagePO2 = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app2');
      await registerCapabilityPagePO2.registerCapability({
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
      const routerPagePO1 = await RouterPagePO.openInNewTab('app1');
      await routerPagePO1.enterQualifier({entity: 'product', app: 'app1'});
      await routerPagePO1.enterParams({param: 'param app1', transientParam: 'transient param app1'});
      await routerPagePO1.selectTarget('blank');
      await routerPagePO1.clickNavigate();

      // expect transient param to be contained in view params
      const testeeViewTabPO1 = appPO.findViewTab({cssClass: 'testee1'});
      const viewId = await testeeViewTabPO1.getViewId();
      const testeeViewPagePO1 = new ViewPagePO(viewId);
      await expect(await testeeViewPagePO1.getViewParams()).toEqual(jasmine.objectContaining({entity: 'product', app: 'app1', param: 'param app1', transientParam: 'transient param app1'}));

      // self-navigate to view of app2
      const routerPagePO2 = await RouterPagePO.openInNewTab('app2');
      await routerPagePO2.enterQualifier({entity: 'product', app: 'app2'});
      await routerPagePO2.enterParams({param: 'param app2', transientParam: 'transient param app2'});
      await routerPagePO2.selectTarget('self');
      await routerPagePO2.enterSelfViewId(viewId);
      await routerPagePO2.clickNavigate();

      // expect transient param to be contained in view params
      const testeeViewTabPO2 = appPO.findViewTab({cssClass: 'testee2'});
      await testeeViewTabPO2.activate();
      const testeeViewPagePO2 = new ViewPagePO(viewId);
      await expect(await testeeViewPagePO2.getViewParams()).toEqual(jasmine.objectContaining({entity: 'product', app: 'app2', param: 'param app2', transientParam: 'transient param app2'}));
    });

    it('should discard transient params when a view is replaced by another view', async () => {
      await appPO.navigateTo({microfrontendSupport: true});

      // register testee view for app1
      const registerCapabilityPagePO1 = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app1');
      await registerCapabilityPagePO1.registerCapability({
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
      const registerCapabilityPagePO2 = await RegisterWorkbenchCapabilityPagePO.openInNewTab('app2');
      await registerCapabilityPagePO2.registerCapability({
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
      const routerPagePO1 = await RouterPagePO.openInNewTab('app1');
      await routerPagePO1.enterQualifier({entity: 'product', app: 'app1'});
      await routerPagePO1.enterParams({transientParam: 'transient param app1'});
      await routerPagePO1.selectTarget('blank');
      await routerPagePO1.clickNavigate();

      // expect transient param to be contained in view params
      const testeeViewTabPO1 = appPO.findViewTab({cssClass: 'testee1'});
      const viewId = await testeeViewTabPO1.getViewId();
      const testeeViewPagePO1 = new ViewPagePO(viewId);
      await expect(await testeeViewPagePO1.getViewParams()).toEqual(jasmine.objectContaining({entity: 'product', app: 'app1', transientParam: 'transient param app1'}));

      // self-navigate to view of app2
      const routerPagePO2 = await RouterPagePO.openInNewTab('app2');
      await routerPagePO2.enterQualifier({entity: 'product', app: 'app2'});
      await routerPagePO2.selectTarget('self');
      await routerPagePO2.enterSelfViewId(viewId);
      await routerPagePO2.clickNavigate();

      // expect transient param to be contained in view params
      const testeeViewTabPO2 = appPO.findViewTab({cssClass: 'testee2'});
      await testeeViewTabPO2.activate();
      const testeeViewPagePO2 = new ViewPagePO(viewId);
      await expect(await testeeViewPagePO2.getViewParams()).toEqual(jasmine.objectContaining({entity: 'product', app: 'app2'}));
    });
  });
});
