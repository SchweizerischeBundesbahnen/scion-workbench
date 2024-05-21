/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../fixtures';
import {expect} from '@playwright/test';
import {RouterPagePO} from './page-object/router-page.po';
import {ViewPagePO} from '../workbench/page-object/view-page.po';
import {expectView} from '../matcher/view-matcher';
import {WorkbenchViewCapability} from '../workbench/page-object/microfrontend-platform-page/register-capability-page.po';
import {ViewInfo} from '../workbench/page-object/view-info-dialog.po';

test.describe('Workbench Host View', () => {

  test('should open a view contributed by the host app', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('host', {
      type: 'view',
      qualifier: {component: 'testee'},
      private: false,
      properties: {
        path: 'test-view',
      },
    });
    await microfrontendNavigator.registerIntention('app1', {type: 'view', qualifier: {component: 'testee'}});

    // Open the view.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      cssClass: 'testee',
    });

    const viewPage = new ViewPagePO(appPO, {cssClass: 'testee'});

    // Expect view page to be displayed.
    await expectView(viewPage).toBeActive();
  });

  test('should substitute placeholders in the path', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('host', {
      type: 'view',
      qualifier: {component: 'testee'},
      private: false,
      params: [
        {name: 'param1', required: true},
        {name: 'param2', required: false},
      ],
      properties: {
        path: 'test-view;p1=:param1;p2=:param2',
      },
    });
    await microfrontendNavigator.registerIntention('app1', {type: 'view', qualifier: {component: 'testee'}});

    // Open the view.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      params: {param1: 'PARAM 1', param2: 'PARAM 2'},
      cssClass: 'testee',
    });

    // Expect params to be available in route params.
    const view = appPO.view({cssClass: 'testee'});
    await expect.poll(() => view.getInfo()).toMatchObject(
      {
        urlSegments: encodeURI('test-view;p1=PARAM 1;p2=PARAM 2'),
        routeParams: ({p1: 'PARAM 1', p2: 'PARAM 2'}),
      } satisfies Partial<ViewInfo>,
    );
  });

  test('should provide transient params as state', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
      type: 'view',
      qualifier: {component: 'testee'},
      private: false,
      params: [
        {name: 'param', required: true, transient: true},
      ],
      properties: {
        path: 'test-view;param=:param',
      },
    });
    await microfrontendNavigator.registerIntention('app1', {type: 'view', qualifier: {component: 'testee'}});

    // Open the view.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      params: {param: 'TRANSIENT PARAM'},
      cssClass: 'testee',
    });

    // Expect transient params to be available in state.
    const view = appPO.view({cssClass: 'testee'});
    await expect.poll(() => view.getInfo()).toMatchObject(
      {
        urlSegments: 'test-view;param=:param',
        routeParams: ({param: ':param'}),
        state: {'transientParams.param': 'TRANSIENT PARAM'},
      } satisfies Partial<ViewInfo>,
    );
  });

  test('should provide capability id for placeholder substitution in path', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const capability = await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
      type: 'view',
      qualifier: {component: 'testee'},
      private: false,
      properties: {
        path: 'test-view;capabilityId=:capabilityId',
      },
    });
    const capabilityId = capability.metadata!.id;
    await microfrontendNavigator.registerIntention('app1', {type: 'view', qualifier: {component: 'testee'}});

    // Open the view.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      cssClass: 'testee',
    });

    // Expect capability id to be substituted.
    const view = appPO.view({cssClass: 'testee'});
    await expect.poll(() => view.getInfo()).toMatchObject(
      {
        urlSegments: `test-view;capabilityId=${capabilityId}`,
        routeParams: ({capabilityId: capabilityId}),
      } satisfies Partial<ViewInfo>,
    );
  });

  test('should navigate existing view of same path (optional param does not match)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {name: 'optionalParam', required: false},
      ],
      private: false,
      properties: {
        path: 'test-pages/navigation-test-page;param=:optionalParam',
      },
    });
    await microfrontendNavigator.registerIntention('app1', {type: 'view', qualifier: {component: 'testee'}});

    // Open the view.
    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.100',
      params: {optionalParam: 'param1'},
      cssClass: ['testee', 'testee-1'],
    });

    // Expect view to be opened.
    const view1 = appPO.view({cssClass: 'testee-1'});
    await expect.poll(() => view1.getInfo()).toMatchObject(
      {
        urlSegments: 'test-pages/navigation-test-page;param=param1',
        routeParams: ({param: 'param1'}),
      } satisfies Partial<ViewInfo>,
    );
    await expect(appPO.views({cssClass: 'testee'})).toHaveCount(1);

    // Navigate with different optional param.
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      params: {optionalParam: 'param2'},
      cssClass: ['testee', 'testee-2'],
    });

    // Expect existing view to be navigated.
    const view2 = appPO.view({cssClass: 'testee-2'});
    await expect.poll(() => view2.getInfo()).toMatchObject(
      {
        viewId: 'view.100',
        urlSegments: 'test-pages/navigation-test-page;param=param2',
        routeParams: ({param: 'param2'}),
      } satisfies Partial<ViewInfo>,
    );
    await expect(appPO.views({cssClass: 'testee'})).toHaveCount(1);
  });

  test('should navigate existing view of same path (required param does not match)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
      type: 'view',
      qualifier: {component: 'testee'},
      params: [
        {name: 'requiredParam', required: true},
      ],
      private: false,
      properties: {
        path: 'test-pages/navigation-test-page/:requiredParam',
      },
    });
    await microfrontendNavigator.registerIntention('app1', {type: 'view', qualifier: {component: 'testee'}});

    const routerPage = await microfrontendNavigator.openInNewTab(RouterPagePO, 'app1');

    // Open the view.
    await routerPage.navigate({component: 'testee'}, {
      target: 'view.100',
      params: {requiredParam: 'param1'},
      cssClass: ['testee', 'testee-1'],
    });

    // Expect view to be opened.
    const view1 = appPO.view({cssClass: 'testee-1'});
    await expect.poll(() => view1.getInfo()).toMatchObject(
      {
        urlSegments: 'test-pages/navigation-test-page/param1',
        routeParams: ({segment1: 'param1'}),
      } satisfies Partial<ViewInfo>,
    );
    await expect(appPO.views({cssClass: 'testee'})).toHaveCount(1);

    // Navigate with different required param.
    await routerPage.view.tab.click();
    await routerPage.navigate({component: 'testee'}, {
      params: {requiredParam: 'param2'},
      cssClass: ['testee', 'testee-2'],
    });

    // Expect new view to be opened.
    await expect.poll(() => view1.getInfo()).toMatchObject(
      {
        viewId: expect.stringMatching('view.100') as any,
        urlSegments: 'test-pages/navigation-test-page/param1',
        routeParams: ({segment1: 'param1'}),
      } satisfies Partial<ViewInfo>,
    );
    const view2 = appPO.view({cssClass: 'testee-2'});
    await expect.poll(() => view2.getInfo()).toMatchObject(
      {
        viewId: expect.not.stringMatching('view.100') as any,
        urlSegments: 'test-pages/navigation-test-page/param2',
        routeParams: ({segment1: 'param2'}),
      } satisfies Partial<ViewInfo>,
    );
    await expect(appPO.views({cssClass: 'testee'})).toHaveCount(2);
  });

  // TODO:
  // ERROR when setting title or css class on capability --> or associate it with data in layout
  // Handle für Hosts entfernen (geht bei view nicht, ist vielleicht verwirrend)

  test('should error if host capability defines the "title" property', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'path/to/view',
        title: 'unsupported',
      },
    });
    await expect(registeredCapability).rejects.toThrow(/UnsupportedCapabilityProperty/);
  });

  test('should error if host capability defines the "heading" property', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'path/to/view',
        heading: 'unsupported',
      },
    });
    await expect(registeredCapability).rejects.toThrow(/UnsupportedCapabilityProperty/);
  });

  test('should error if host capability defines the "closable" property', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'path/to/view',
        closable: true, // unsupported
      },
    });
    await expect(registeredCapability).rejects.toThrow(/UnsupportedCapabilityProperty/);
  });

  test('should error if host capability defines the "cssClass" property', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'path/to/view',
        cssClass: 'unsupported',
      },
    });
    await expect(registeredCapability).rejects.toThrow(/UnsupportedCapabilityProperty/);
  });

  test('should error if host capability defines the "showSplash" property', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchViewCapability>('host', {
      type: 'view',
      qualifier: {component: 'testee'},
      properties: {
        path: 'path/to/view',
        showSplash: true, // unsupported
      },
    });
    await expect(registeredCapability).rejects.toThrow(/UnsupportedCapabilityProperty/);
  });
});
