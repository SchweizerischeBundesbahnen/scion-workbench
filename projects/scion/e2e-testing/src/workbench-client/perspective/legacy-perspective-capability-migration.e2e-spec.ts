/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../../fixtures';
import {MAIN_AREA} from '../../workbench.model';
import {expectView} from '../../matcher/view-matcher';
import {ViewPagePO} from '../page-object/view-page.po';
import {expect} from '@playwright/test';
import {MPart, MTreeNode} from '../../matcher/to-equal-workbench-layout.matcher';
import {MessagingPagePO} from '../page-object/messaging-page.po';
import {Capability, Manifest, Qualifier} from '@scion/microfrontend-platform';
import {WorkbenchViewCapability} from '../page-object/register-workbench-capability-page.po';

test.describe('Workbench Perspective Capability Migration', () => {

  /**
   * TODO [Angular 22] Remove with Angular 22.
   */
  test('should migrate deprecated perspective capability', async ({appPO, microfrontendNavigator, page}) => {
    const viewCapability1: WorkbenchViewCapability = {
      type: 'view',
      qualifier: {view: 'testee-1'},
      properties: {
        path: 'test-view',
        cssClass: 'testee-1',
      },
      params: [
        {name: 'param1', required: true},
      ],
    };

    const viewCapability2: WorkbenchViewCapability = {
      type: 'view',
      qualifier: {view: 'testee-2'},
      properties: {
        path: 'test-view',
        cssClass: 'testee-2',
      },
      params: [
        {name: 'param2', required: true},
      ],
    };

    const viewCapability3: WorkbenchViewCapability = {
      type: 'view',
      qualifier: {view: 'testee-3'},
      properties: {
        path: 'test-view',
        cssClass: 'testee-3',
      },
    };

    const legacyPerspectiveCapability: WorkbenchPerspectiveCapabilityV1 = {
      type: 'perspective',
      qualifier: {perspective: 'testee'},
      properties: {
        data: {
          label: 'testee',
        },
        layout: [
          {
            id: MAIN_AREA,
          },
          {
            id: 'part.testee-1',
            relativeTo: MAIN_AREA,
            align: 'left',
            ratio: .4,
            views: [
              {
                qualifier: {view: 'testee-1'},
                active: false,
                cssClass: 'testee-1-a',
                params: {param1: 'value-1'},
              },
              {
                qualifier: {view: 'testee-2'},
                active: true,
                cssClass: 'testee-2-a',
                params: {param2: 'value-2'},
              },
            ],
          },
          {
            id: 'part.testee-2',
            relativeTo: 'part.testee-1',
            align: 'bottom',
            ratio: .5,
            views: [
              {
                qualifier: {view: 'testee-3'},
                cssClass: 'testee-3-a',
              },
            ],
          },
        ],
      },
    };

    const manifest: Manifest = {
      name: 'Workbench Client Testing App 1',
      baseUrl: '#',
      capabilities: [
        legacyPerspectiveCapability,
        viewCapability1,
        viewCapability2,
        viewCapability3,
        {
          type: 'activator',
          private: false,
          properties: {
            path: 'activator',
            readinessTopics: 'activator-ready',
          },
        },
      ],
    };

    // Provide manifest.
    await page.route('**/manifest-app1.json', async route => route.fulfill({json: manifest}));

    // Open application.
    await appPO.navigateTo({microfrontendSupport: true});

    // Switch perspective.
    const messagingPage = await microfrontendNavigator.openInNewTab(MessagingPagePO, 'app1');
    await messagingPage.publishIntent({type: 'perspective', qualifier: {perspective: 'testee'}});
    await messagingPage.view.tab.close();

    const testViewPage1 = new ViewPagePO(appPO, {cssClass: 'testee-1'});
    const testViewPage2 = new ViewPagePO(appPO, {cssClass: 'testee-2'});
    const testViewPage3 = new ViewPagePO(appPO, {cssClass: 'testee-3'});

    // Expect layout.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .4,
            child1: new MTreeNode({
              direction: 'column',
              ratio: .5,
              child1: new MPart({
                id: 'part.testee-1',
                views: [{id: await testViewPage1.view.getViewId()}, {id: await testViewPage2.view.getViewId()}],
                activeViewId: await testViewPage2.view.getViewId(),
              }),
              child2: new MPart({
                id: 'part.testee-2',
                views: [{id: await testViewPage3.view.getViewId()}],
                activeViewId: await testViewPage3.view.getViewId(),
              }),
            }),
            child2: new MPart({
              id: MAIN_AREA,
            }),
          }),
        },
      },
    });

    // Expect views.
    await expectView(testViewPage1).toBeInactive({loaded: false});
    await expectView(testViewPage2).toBeActive();
    await expectView(testViewPage3).toBeActive();

    // Assert view params.
    await testViewPage1.view.tab.click();
    await expect.poll(() => testViewPage1.getViewParams()).toMatchObject({
      param1: 'value-1',
    });

    await testViewPage2.view.tab.click();
    await expect.poll(() => testViewPage2.getViewParams()).toMatchObject({
      param2: 'value-2',
    });

    await testViewPage3.view.tab.click();
    await expect.poll(() => testViewPage3.getViewParams()).toMatchObject({});

    // Assert view css classes.
    await testViewPage1.view.tab.click();
    await expect.poll(() => testViewPage1.view.getCssClasses()).toEqual(expect.arrayContaining(['testee-1', 'testee-1-a']));

    await testViewPage2.view.tab.click();
    await expect.poll(() => testViewPage2.view.getCssClasses()).toEqual(expect.arrayContaining(['testee-2', 'testee-2-a']));

    await testViewPage3.view.tab.click();
    await expect.poll(() => testViewPage3.view.getCssClasses()).toEqual(expect.arrayContaining(['testee-3', 'testee-3-a']));
  });
});

interface WorkbenchPerspectiveCapabilityV1 extends Capability {
  type: 'perspective';
  qualifier: Qualifier;
  properties: {
    layout: [Pick<WorkbenchPerspectivePartV1, 'id' | 'views'>, ...WorkbenchPerspectivePartV1[]];
    data?: {[key: string]: unknown};
  };
}

interface WorkbenchPerspectivePartV1 {
  id: string | MAIN_AREA;
  relativeTo?: string;
  align: 'left' | 'right' | 'top' | 'bottom';
  ratio?: number;
  views?: WorkbenchPerspectiveViewV1[];
}

interface WorkbenchPerspectiveViewV1 {
  qualifier: Qualifier;
  params?: {[name: string]: unknown};
  active?: boolean;
  cssClass?: string | string[];
}
