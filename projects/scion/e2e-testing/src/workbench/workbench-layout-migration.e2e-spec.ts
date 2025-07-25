/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';
import {MAIN_AREA, MAIN_AREA_ALTERNATIVE_ID} from '../workbench.model';
import {expectView} from '../matcher/view-matcher';
import {ViewPagePO} from './page-object/view-page.po';
import {RouterPagePO} from './page-object/router-page.po';
import {ViewInfo} from './page-object/view-info-dialog.po';
import {throwError} from '../helper/testing.util';

test.describe('Workbench Layout Migration', () => {

  /**
   * ## Given layout in version 2:
   *
   *           PERIPHERAL AREA                                       MAIN AREA                                PERIPHERAL AREA
   * +--------------------------------------------+ +--------------------------------------------+ +--------------------------------------------+
   * | Part: 33b22f60-bf34-4704-885d-7de0d707430f | | Part: a25eb4cf-9da7-43e7-8db2-302fd38e59a1 | | Part: 9bc4c09f-67a7-4c69-a28b-532781a1c98f |
   * | Views: [view.3]                            | | Views: [view.1, test-view]                 | | Views: [test-router]                       |
   * | Active View: view.3                        | | Active View: test-view                     | | Active View: test-router                   |
   * |                                            | +--------------------------------------------+ |                                            |
   * |                                            | | Part: 2b534d97-ed7d-43b3-bb2c-0e59d9766e86 | |                                            |
   * |                                            | | Views: [view.2]                            | |                                            |
   * |                                            | | Active View: view.2                        | |                                            |
   * +--------------------------------------------+ +--------------------------------------------+ +--------------------------------------------+
   * view.1:      [path='test-view']
   * view.2:      [path='test-view']
   * view.3:      [path='test-view']
   * test-view:   [path='', outlet='test-view']
   * test-router: [path='', outlet='test-router']
   *
   * ## Migrated layout:
   *
   *          PERIPHERAL AREA                                       MAIN AREA                                PERIPHERAL AREA
   * +--------------------------------------------+ +--------------------------------------------+ +--------------------------------------------+
   * | Part: 33b22f60-bf34-4704-885d-7de0d707430f | | Part: a25eb4cf-9da7-43e7-8db2-302fd38e59a1 | | Part: 9bc4c09f-67a7-4c69-a28b-532781a1c98f |
   * | Views: [view.3 (random id)]                | | Views: [view.1, test-view (random id)]     | | Views: [test-router (random id)]           |
   * | Active View: view.3 (random id)            | | Active View: test-view (random id)         | | Active View: test-router (random id)       |
   * |                                            | +--------------------------------------------+ |                                            |
   * |                                            | | Part: 2b534d97-ed7d-43b3-bb2c-0e59d9766e86 | |                                            |
   * |                                            | | Views: [view.2]                            | |                                            |
   * |                                            | | Active View: view.2                        | |                                            |
   * +--------------------------------------------+ +--------------------------------------------+ +--------------------------------------------+
   * view.1: [path='test-view']
   * view.2: [path='test-view']
   * view.3: [path='test-view']
   * test-view: [path='', navigationHint='test-view']
   * test-router: [path='', navigationHint='test-router']
   */
  test('should migrate workbench layout v2 to the latest version', async ({appPO}) => {
    await appPO.navigateTo({
      url: '#/(view.1:test-view//view.2:test-view//view.3:test-view)?main_area=eyJyb290Ijp7InR5cGUiOiJNVHJlZU5vZGUiLCJjaGlsZDEiOnsidHlwZSI6Ik1QYXJ0Iiwidmlld3MiOlt7ImlkIjoidmlldy4xIn0seyJpZCI6InRlc3QtdmlldyJ9XSwiaWQiOiJhMjVlYjRjZi05ZGE3LTQzZTctOGRiMi0zMDJmZDM4ZTU5YTEiLCJzdHJ1Y3R1cmFsIjpmYWxzZSwiYWN0aXZlVmlld0lkIjoidGVzdC12aWV3In0sImNoaWxkMiI6eyJ0eXBlIjoiTVBhcnQiLCJ2aWV3cyI6W3siaWQiOiJ2aWV3LjIifV0sImlkIjoiMmI1MzRkOTctZWQ3ZC00M2IzLWJiMmMtMGU1OWQ5NzY2ZTg2Iiwic3RydWN0dXJhbCI6ZmFsc2UsImFjdGl2ZVZpZXdJZCI6InZpZXcuMiJ9LCJkaXJlY3Rpb24iOiJjb2x1bW4iLCJyYXRpbyI6MC41fSwiYWN0aXZlUGFydElkIjoiYTI1ZWI0Y2YtOWRhNy00M2U3LThkYjItMzAyZmQzOGU1OWExIn0vLzI%3D',
      microfrontendSupport: false,
      localStorage: {
        'scion.workbench.perspective': 'e2e-perspective-with-main-area',
        'scion.workbench.perspectives.e2e-perspective-with-main-area': 'eyJpbml0aWFsV29ya2JlbmNoR3JpZCI6ImV5SnliMjkwSWpwN0luUjVjR1VpT2lKTlVHRnlkQ0lzSW5acFpYZHpJanBiWFN3aWFXUWlPaUp0WVdsdUxXRnlaV0VpTENKemRISjFZM1IxY21Gc0lqcDBjblZsZlN3aVlXTjBhWFpsVUdGeWRFbGtJam9pYldGcGJpMWhjbVZoSW4wdkx6ST0iLCJ3b3JrYmVuY2hHcmlkIjoiZXlKeWIyOTBJanA3SW5SNWNHVWlPaUpOVkhKbFpVNXZaR1VpTENKamFHbHNaREVpT25zaWRIbHdaU0k2SWsxVWNtVmxUbTlrWlNJc0ltTm9hV3hrTVNJNmV5SjBlWEJsSWpvaVRWQmhjblFpTENKMmFXVjNjeUk2VzNzaWFXUWlPaUoyYVdWM0xqTWlmVjBzSW1sa0lqb2lNek5pTWpKbU5qQXRZbVl6TkMwME56QTBMVGc0TldRdE4yUmxNR1EzTURjME16Qm1JaXdpYzNSeWRXTjBkWEpoYkNJNlptRnNjMlVzSW1GamRHbDJaVlpwWlhkSlpDSTZJblpwWlhjdU15SjlMQ0pqYUdsc1pESWlPbnNpZEhsd1pTSTZJazFRWVhKMElpd2lkbWxsZDNNaU9sdGRMQ0pwWkNJNkltMWhhVzR0WVhKbFlTSXNJbk4wY25WamRIVnlZV3dpT25SeWRXVjlMQ0prYVhKbFkzUnBiMjRpT2lKeWIzY2lMQ0p5WVhScGJ5STZNQzR5ZlN3aVkyaHBiR1F5SWpwN0luUjVjR1VpT2lKTlVHRnlkQ0lzSW5acFpYZHpJanBiZXlKcFpDSTZJblJsYzNRdGNtOTFkR1Z5SW4xZExDSnBaQ0k2SWpsaVl6UmpNRGxtTFRZM1lUY3ROR00yT1MxaE1qaGlMVFV6TWpjNE1XRXhZems0WmlJc0luTjBjblZqZEhWeVlXd2lPbVpoYkhObExDSmhZM1JwZG1WV2FXVjNTV1FpT2lKMFpYTjBMWEp2ZFhSbGNpSjlMQ0prYVhKbFkzUnBiMjRpT2lKeWIzY2lMQ0p5WVhScGJ5STZNQzQ0ZlN3aVlXTjBhWFpsVUdGeWRFbGtJam9pTXpOaU1qSm1OakF0WW1Zek5DMDBOekEwTFRnNE5XUXROMlJsTUdRM01EYzBNekJtSW4wdkx6ST0iLCJ2aWV3T3V0bGV0cyI6eyJ2aWV3LjMiOlsidGVzdC12aWV3Il19fQ==',
      },
    });

    const _33b22f60Part = await appPO.workbench.part({alternativeId: '33b22f60-bf34-4704-885d-7de0d707430f'});
    const _9bc4c09fPart = await appPO.workbench.part({alternativeId: '9bc4c09f-67a7-4c69-a28b-532781a1c98f'});
    const _a25eb4cfPart = await appPO.workbench.part({alternativeId: 'a25eb4cf-9da7-43e7-8db2-302fd38e59a1'});
    const _2b534d97Part = await appPO.workbench.part({alternativeId: '2b534d97-ed7d-43b3-bb2c-0e59d9766e86'});

    const testRouterView = await appPO.workbench.view({alternativeId: 'test-router'});
    const testView = await appPO.workbench.view({alternativeId: 'test-view'});
    const view3 = (await appPO.workbench.views()).find(view => view.partId === _33b22f60Part.id) ?? throwError(`Migrated 'view.3' not found`);

    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .8,
            child1: new MTreeNode({
              direction: 'row',
              ratio: .2,
              child1: new MPart({
                id: _33b22f60Part.id,
                alternativeId: _33b22f60Part.alternativeId,
                views: [{id: view3.id}],
                activeViewId: view3.id,
              }),
              child2: new MPart({
                id: MAIN_AREA,
                alternativeId: MAIN_AREA_ALTERNATIVE_ID,
              }),
            }),
            child2: new MPart({
              id: _9bc4c09fPart.id,
              alternativeId: _9bc4c09fPart.alternativeId,
              views: [{id: testRouterView.id}],
              activeViewId: testRouterView.id,
            }),
          }),
          activePartId: _33b22f60Part.id,
        },
        mainArea: {
          root: new MTreeNode({
            direction: 'column',
            ratio: .5,
            child1: new MPart({
              id: _a25eb4cfPart.id,
              alternativeId: _a25eb4cfPart.alternativeId,
              views: [{id: 'view.1'}, {id: testView.id}],
              activeViewId: testView.id,
            }),
            child2: new MPart({
              id: _2b534d97Part.id,
              alternativeId: _2b534d97Part.alternativeId,
              views: [{id: 'view.2'}],
              activeViewId: 'view.2',
            }),
          }),
          activePartId: _a25eb4cfPart.id,
        },
      },
    });

    const viewPage1 = new ViewPagePO(appPO, {viewId: 'view.1'});
    await viewPage1.view.tab.click();
    await expectView(viewPage1).toBeActive();
    await expect.poll(() => viewPage1.view.getInfo()).toMatchObject(
      {
        routeData: {path: 'test-view', navigationHint: ''},
        urlSegments: 'test-view',
      } satisfies Partial<ViewInfo>,
    );

    const viewPage2 = new ViewPagePO(appPO, {viewId: 'view.2'});
    await viewPage2.view.tab.click();
    await expectView(viewPage2).toBeActive();
    await expect.poll(() => viewPage2.view.getInfo()).toMatchObject(
      {
        routeData: {path: 'test-view', navigationHint: ''},
        urlSegments: 'test-view',
      } satisfies Partial<ViewInfo>,
    );

    const viewPage3 = new ViewPagePO(appPO, {viewId: view3.id});
    await viewPage3.view.tab.click();
    await expectView(viewPage3).toBeActive();
    await expect.poll(() => viewPage3.view.getInfo()).toMatchObject(
      {
        routeData: {path: 'test-view', navigationHint: ''},
        urlSegments: 'test-view',
      } satisfies Partial<ViewInfo>,
    );

    const viewPage4 = new ViewPagePO(appPO, {viewId: testView.id});
    await viewPage4.view.tab.click();
    await expectView(viewPage4).toBeActive();
    await expect.poll(() => viewPage4.view.getInfo()).toMatchObject(
      {
        routeData: {path: '', navigationHint: 'test-view'},
        urlSegments: '',
      } satisfies Partial<ViewInfo>,
    );

    const viewPage5 = new RouterPagePO(appPO, {viewId: testRouterView.id});
    await viewPage5.view.tab.click();
    await expectView(viewPage5).toBeActive();
    await expect.poll(() => viewPage5.view.getInfo()).toMatchObject(
      {
        routeData: {path: '', navigationHint: 'test-router'},
        urlSegments: '',
      } satisfies Partial<ViewInfo>,
    );
  });

  /**
   * ## Given layout in version 4:
   *
   *           PERIPHERAL AREA                       MAIN AREA                                PERIPHERAL AREA
   * +-------------------------------+ +--------------------------------------------+ +-------------------------------+
   * | Part: left                    | | Part: 6f09e6e2-b63a-4f0d-9ae1-06624fdb37c7 | | Part: right                   |
   * | Views: [view.2, view.3]       | | Views: [view.1]                            | | Views: [view.4]               |
   * | Active View: view.2           | | Active View: view.1                        | | Active View: view.4           |
   * |                               | +--------------------------------------------+ |                               |
   * |                               | | Part: 1d94dcb6-76b6-47eb-b300-39448993d36b | |                               |
   * |                               | | Views: [view.5]                            | |                               |
   * |                               | | Active View: view.5                        | |                               |
   * +-------------------------------+ +--------------------------------------------+ +-------------------------------
   * view.1: [path='test-view']
   * view.2: [path='test-view']
   * view.3: [path='', navigationHint='test-view']
   * view.4: [path='test-view']
   * view.5: [path='test-view']
   */
  test('should migrate workbench layout v4 to the latest version', async ({appPO}) => {
    await appPO.navigateTo({
      url: '#/(view.1:test-view//view.2:test-view//view.4:test-view//view.5:test-view)?main_area=eyJyb290Ijp7InR5cGUiOiJNVHJlZU5vZGUiLCJjaGlsZDEiOnsidHlwZSI6Ik1QYXJ0IiwiaWQiOiI2ZjA5ZTZlMi1iNjNhLTRmMGQtOWFlMS0wNjYyNGZkYjM3YzciLCJzdHJ1Y3R1cmFsIjpmYWxzZSwidmlld3MiOlt7ImlkIjoidmlldy4xIiwibmF2aWdhdGlvbiI6e319XSwiYWN0aXZlVmlld0lkIjoidmlldy4xIn0sImNoaWxkMiI6eyJ0eXBlIjoiTVBhcnQiLCJpZCI6IjFkOTRkY2I2LTc2YjYtNDdlYi1iMzAwLTM5NDQ4OTkzZDM2YiIsInN0cnVjdHVyYWwiOmZhbHNlLCJ2aWV3cyI6W3siaWQiOiJ2aWV3LjUiLCJuYXZpZ2F0aW9uIjp7fX1dLCJhY3RpdmVWaWV3SWQiOiJ2aWV3LjUifSwiZGlyZWN0aW9uIjoiY29sdW1uIiwicmF0aW8iOjAuNX0sImFjdGl2ZVBhcnRJZCI6IjFkOTRkY2I2LTc2YjYtNDdlYi1iMzAwLTM5NDQ4OTkzZDM2YiJ9Ly80',
      microfrontendSupport: false,
      localStorage: {
        'scion.workbench.perspective': 'e2e-perspective-with-main-area',
        'scion.workbench.perspectives.e2e-perspective-with-main-area': 'eyJyZWZlcmVuY2VMYXlvdXQiOnsid29ya2JlbmNoR3JpZCI6ImV5SnliMjkwSWpwN0luUjVjR1VpT2lKTlVHRnlkQ0lzSW1sa0lqb2liV0ZwYmkxaGNtVmhJaXdpYzNSeWRXTjBkWEpoYkNJNmRISjFaU3dpZG1sbGQzTWlPbHRkZlN3aVlXTjBhWFpsVUdGeWRFbGtJam9pYldGcGJpMWhjbVZoSW4wdkx6UT0iLCJ2aWV3T3V0bGV0cyI6Int9In0sInVzZXJMYXlvdXQiOnsid29ya2JlbmNoR3JpZCI6ImV5SnliMjkwSWpwN0luUjVjR1VpT2lKTlZISmxaVTV2WkdVaUxDSmphR2xzWkRFaU9uc2lkSGx3WlNJNklrMVFZWEowSWl3aWFXUWlPaUpzWldaMElpd2ljM1J5ZFdOMGRYSmhiQ0k2ZEhKMVpTd2lkbWxsZDNNaU9sdDdJbWxrSWpvaWRtbGxkeTR5SWl3aWJtRjJhV2RoZEdsdmJpSTZlMzE5TEhzaWFXUWlPaUoyYVdWM0xqTWlMQ0p1WVhacFoyRjBhVzl1SWpwN0ltaHBiblFpT2lKMFpYTjBMWFpwWlhjaWZYMWRMQ0poWTNScGRtVldhV1YzU1dRaU9pSjJhV1YzTGpJaWZTd2lZMmhwYkdReUlqcDdJblI1Y0dVaU9pSk5WSEpsWlU1dlpHVWlMQ0pqYUdsc1pERWlPbnNpZEhsd1pTSTZJazFRWVhKMElpd2lhV1FpT2lKdFlXbHVMV0Z5WldFaUxDSnpkSEoxWTNSMWNtRnNJanAwY25WbExDSjJhV1YzY3lJNlcxMTlMQ0pqYUdsc1pESWlPbnNpZEhsd1pTSTZJazFRWVhKMElpd2lhV1FpT2lKeWFXZG9kQ0lzSW5OMGNuVmpkSFZ5WVd3aU9uUnlkV1VzSW5acFpYZHpJanBiZXlKcFpDSTZJblpwWlhjdU5DSXNJbTVoZG1sbllYUnBiMjRpT250OWZWMHNJbUZqZEdsMlpWWnBaWGRKWkNJNkluWnBaWGN1TkNKOUxDSmthWEpsWTNScGIyNGlPaUp5YjNjaUxDSnlZWFJwYnlJNk1DNDNOWDBzSW1ScGNtVmpkR2x2YmlJNkluSnZkeUlzSW5KaGRHbHZJam93TGpJMWZTd2lZV04wYVhabFVHRnlkRWxrSWpvaWJHVm1kQ0o5THk4MCIsInZpZXdPdXRsZXRzIjoie1widmlldy4yXCI6W3tcInBhdGhcIjpcInRlc3Qtdmlld1wiLFwicGFyYW1ldGVyc1wiOnt9fV0sXCJ2aWV3LjNcIjpbXSxcInZpZXcuNFwiOlt7XCJwYXRoXCI6XCJ0ZXN0LXZpZXdcIixcInBhcmFtZXRlcnNcIjp7fX1dfSJ9fS8vMg==',
      },
    });

    const leftPart = await appPO.workbench.part({alternativeId: 'left'});
    const rightPart = await appPO.workbench.part({alternativeId: 'right'});
    const _6f09e6e2Part = await appPO.workbench.part({alternativeId: '6f09e6e2-b63a-4f0d-9ae1-06624fdb37c7'});
    const _1d94dcb6Part = await appPO.workbench.part({alternativeId: '1d94dcb6-76b6-47eb-b300-39448993d36b'});

    const views = await appPO.workbench.views();
    const view2 = views.find(view => view.partId === leftPart.id) ?? throwError(`Migrated 'view.2' not found`);
    const view3 = views.filter(view => view.partId === leftPart.id)[1] ?? throwError(`Migrated 'view.3' not found`);
    const view4 = views.find(view => view.partId === rightPart.id) ?? throwError(`Migrated 'view.4' not found`);

    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .25,
            child1: new MPart({
              id: leftPart.id,
              alternativeId: leftPart.alternativeId,
              views: [{id: view2.id}, {id: view3.id}],
              activeViewId: view2.id,
            }),
            child2: new MTreeNode({
              direction: 'row',
              ratio: .75,
              child1: new MPart({
                id: MAIN_AREA,
                alternativeId: MAIN_AREA_ALTERNATIVE_ID,
              }),
              child2: new MPart({
                id: rightPart.id,
                alternativeId: rightPart.alternativeId,
                views: [{id: view4.id}],
                activeViewId: view4.id,
              }),
            }),
          }),
          activePartId: leftPart.id,
        },
        mainArea: {
          root: new MTreeNode({
            direction: 'column',
            ratio: .5,
            child1: new MPart({
              id: _6f09e6e2Part.id,
              alternativeId: _6f09e6e2Part.alternativeId,
              views: [{id: 'view.1'}],
              activeViewId: 'view.1',
            }),
            child2: new MPart({
              id: _1d94dcb6Part.id,
              alternativeId: _1d94dcb6Part.alternativeId,
              views: [{id: 'view.5'}],
              activeViewId: 'view.5',
            }),
          }),
          activePartId: _1d94dcb6Part.id,
        },
      },
    });

    const viewPage1 = new ViewPagePO(appPO, {viewId: 'view.1'});
    await viewPage1.view.tab.click();
    await expectView(viewPage1).toBeActive();
    await expect.poll(() => viewPage1.view.getInfo()).toMatchObject(
      {
        routeData: {path: 'test-view', navigationHint: ''},
        urlSegments: 'test-view',
      } satisfies Partial<ViewInfo>,
    );

    const viewPage2 = new ViewPagePO(appPO, {viewId: view2.id});
    await viewPage2.view.tab.click();
    await expectView(viewPage2).toBeActive();
    await expect.poll(() => viewPage2.view.getInfo()).toMatchObject(
      {
        routeData: {path: 'test-view', navigationHint: ''},
        urlSegments: 'test-view',
      } satisfies Partial<ViewInfo>,
    );

    const viewPage3 = new ViewPagePO(appPO, {viewId: view3.id});
    await viewPage3.view.tab.click();
    await expectView(viewPage3).toBeActive();
    await expect.poll(() => viewPage3.view.getInfo()).toMatchObject(
      {
        routeData: {path: '', navigationHint: 'test-view'},
        urlSegments: '',
      } satisfies Partial<ViewInfo>,
    );

    const viewPage4 = new ViewPagePO(appPO, {viewId: view4.id});
    await viewPage4.view.tab.click();
    await expectView(viewPage4).toBeActive();
    await expect.poll(() => viewPage4.view.getInfo()).toMatchObject(
      {
        routeData: {path: 'test-view', navigationHint: ''},
        urlSegments: 'test-view',
      } satisfies Partial<ViewInfo>,
    );

    const viewPage5 = new ViewPagePO(appPO, {viewId: 'view.5'});
    await viewPage5.view.tab.click();
    await expectView(viewPage5).toBeActive();
    await expect.poll(() => viewPage5.view.getInfo()).toMatchObject(
      {
        routeData: {path: 'test-view', navigationHint: ''},
        urlSegments: 'test-view',
      } satisfies Partial<ViewInfo>,
    );
  });

  /**
   * ## Given layout in version 5:
   *
   * Reference Layout:
   * +-------------------------------+ +-------------------+
   * | Activity: activity.1          | |     MAIN AREA     |
   * | Part: part.activity-1         | |                   |
   * +-------------------------------+ +-------------------+
   * part.activity.1: [path='test-part']
   *
   * User Layout:
   * +-------------------------------+ +-------------------+ +-------------------------------+
   * | Activity: activity.1          | |     MAIN AREA     | | Activity: activity.2          |
   * | Part: part.activity-1         | |                   | | Part: part.activity-2         |
   * +-------------------------------+ +-------------------+ +-------------------------------+
   *
   * part.activity.1: [path='test-part']
   * part.activity.2: [path='test-part']
   */
  test('should migrate workbench layout v5 to the latest version', async ({appPO}) => {
    await appPO.navigateTo({
      url: '#',
      microfrontendSupport: false,
      localStorage: {
        'scion.workbench.perspective': 'e2e-layout-migration-v5',
        'scion.workbench.perspectives.e2e-layout-migration-v5': 'eyJyZWZlcmVuY2VMYXlvdXQiOnsiZ3JpZHMiOnsibWFpbiI6ImV5SnliMjkwSWpwN0luUjVjR1VpT2lKTlVHRnlkQ0lzSW1sa0lqb2ljR0Z5ZEM1dFlXbHVMV0Z5WldFaUxDSmhiSFJsY201aGRHbDJaVWxrSWpvaWJXRnBiaTFoY21WaElpd2lkbWxsZDNNaU9sdGRMQ0p6ZEhKMVkzUjFjbUZzSWpwMGNuVmxmU3dpWVdOMGFYWmxVR0Z5ZEVsa0lqb2ljR0Z5ZEM1dFlXbHVMV0Z5WldFaWZTOHZOdz09IiwiYWN0aXZpdHkuMSI6ImV5SnliMjkwSWpwN0luUjVjR1VpT2lKTlVHRnlkQ0lzSW1sa0lqb2ljR0Z5ZEM1aFkzUnBkbWwwZVMweElpd2lkR2wwYkdVaU9pSkJZM1JwZG1sMGVTSXNJblpwWlhkeklqcGJYU3dpYzNSeWRXTjBkWEpoYkNJNmRISjFaU3dpYm1GMmFXZGhkR2x2YmlJNmV5SnBaQ0k2SWprNVlXWTFaVEF3SW4xOUxDSmhZM1JwZG1WUVlYSjBTV1FpT2lKd1lYSjBMbUZqZEdsMmFYUjVMVEVpZlM4dk53PT0ifSwiYWN0aXZpdHlMYXlvdXQiOiJleUowYjI5c1ltRnljeUk2ZXlKc1pXWjBWRzl3SWpwN0ltRmpkR2wyYVhScFpYTWlPbHQ3SW1sa0lqb2lZV04wYVhacGRIa3VNU0lzSW5KbFptVnlaVzVqWlZCaGNuUkpaQ0k2SW5CaGNuUXVZV04wYVhacGRIa3RNU0lzSW1samIyNGlPaUptYjJ4a1pYSWlMQ0pzWVdKbGJDSTZJa0ZqZEdsMmFYUjVJaXdpZEc5dmJIUnBjQ0k2SWtGamRHbDJhWFI1SW4xZExDSmhZM1JwZG1WQlkzUnBkbWwwZVVsa0lqb2lZV04wYVhacGRIa3VNU0o5TENKc1pXWjBRbTkwZEc5dElqcDdJbUZqZEdsMmFYUnBaWE1pT2x0ZGZTd2ljbWxuYUhSVWIzQWlPbnNpWVdOMGFYWnBkR2xsY3lJNlcxMTlMQ0p5YVdkb2RFSnZkSFJ2YlNJNmV5SmhZM1JwZG1sMGFXVnpJanBiWFgwc0ltSnZkSFJ2YlV4bFpuUWlPbnNpWVdOMGFYWnBkR2xsY3lJNlcxMTlMQ0ppYjNSMGIyMVNhV2RvZENJNmV5SmhZM1JwZG1sMGFXVnpJanBiWFgxOUxDSndZVzVsYkhNaU9uc2liR1ZtZENJNmV5SjNhV1IwYUNJNk16QXdMQ0p5WVhScGJ5STZNQzQxZlN3aWNtbG5hSFFpT25zaWQybGtkR2dpT2pNd01Dd2ljbUYwYVc4aU9qQXVOWDBzSW1KdmRIUnZiU0k2ZXlKb1pXbG5hSFFpT2pJMU1Dd2ljbUYwYVc4aU9qQXVOWDE5ZlM4dk1RPT0iLCJvdXRsZXRzIjoie1wicGFydC5hY3Rpdml0eS0xXCI6W3tcInBhdGhcIjpcInRlc3QtcGFydFwiLFwicGFyYW1ldGVyc1wiOnt9fV19In0sInVzZXJMYXlvdXQiOnsiZ3JpZHMiOnsibWFpbiI6ImV5SnliMjkwSWpwN0luUjVjR1VpT2lKTlVHRnlkQ0lzSW1sa0lqb2ljR0Z5ZEM1dFlXbHVMV0Z5WldFaUxDSmhiSFJsY201aGRHbDJaVWxrSWpvaWJXRnBiaTFoY21WaElpd2lkbWxsZDNNaU9sdGRMQ0p6ZEhKMVkzUjFjbUZzSWpwMGNuVmxmU3dpWVdOMGFYWmxVR0Z5ZEVsa0lqb2ljR0Z5ZEM1dFlXbHVMV0Z5WldFaWZTOHZOdz09IiwiYWN0aXZpdHkuMSI6ImV5SnliMjkwSWpwN0luUjVjR1VpT2lKTlVHRnlkQ0lzSW1sa0lqb2ljR0Z5ZEM1aFkzUnBkbWwwZVMweElpd2lkR2wwYkdVaU9pSkJZM1JwZG1sMGVTSXNJblpwWlhkeklqcGJYU3dpYzNSeWRXTjBkWEpoYkNJNmRISjFaU3dpYm1GMmFXZGhkR2x2YmlJNmV5SnBaQ0k2SWpneE5HUmhNVEE1SW4xOUxDSmhZM1JwZG1WUVlYSjBTV1FpT2lKd1lYSjBMbUZqZEdsMmFYUjVMVEVpZlM4dk53PT0iLCJhY3Rpdml0eS4yIjoiZXlKeWIyOTBJanA3SW5SNWNHVWlPaUpOVUdGeWRDSXNJbWxrSWpvaWNHRnlkQzVoWTNScGRtbDBlUzB5SWl3aWRHbDBiR1VpT2lKQlkzUnBkbWwwZVNBeUlpd2lkbWxsZDNNaU9sdGRMQ0p6ZEhKMVkzUjFjbUZzSWpwMGNuVmxMQ0p1WVhacFoyRjBhVzl1SWpwN0ltbGtJam9pTlRoaU4yRmxObVlpTENKa1lYUmhJanB1ZFd4c2ZYMHNJbUZqZEdsMlpWQmhjblJKWkNJNkluQmhjblF1WVdOMGFYWnBkSGt0TWlKOUx5ODMifSwiYWN0aXZpdHlMYXlvdXQiOiJleUowYjI5c1ltRnljeUk2ZXlKc1pXWjBWRzl3SWpwN0ltRmpkR2wyYVhScFpYTWlPbHQ3SW1sa0lqb2lZV04wYVhacGRIa3VNU0lzSW5KbFptVnlaVzVqWlZCaGNuUkpaQ0k2SW5CaGNuUXVZV04wYVhacGRIa3RNU0lzSW1samIyNGlPaUptYjJ4a1pYSWlMQ0pzWVdKbGJDSTZJa0ZqZEdsMmFYUjVJaXdpZEc5dmJIUnBjQ0k2SWtGamRHbDJhWFI1SW4xZExDSmhZM1JwZG1WQlkzUnBkbWwwZVVsa0lqb2lZV04wYVhacGRIa3VNU0o5TENKc1pXWjBRbTkwZEc5dElqcDdJbUZqZEdsMmFYUnBaWE1pT2x0ZGZTd2ljbWxuYUhSVWIzQWlPbnNpWVdOMGFYWnBkR2xsY3lJNlczc2lhV1FpT2lKaFkzUnBkbWwwZVM0eUlpd2ljbVZtWlhKbGJtTmxVR0Z5ZEVsa0lqb2ljR0Z5ZEM1aFkzUnBkbWwwZVMweUlpd2lhV052YmlJNkltWnZiR1JsY2lJc0lteGhZbVZzSWpvaVFXTjBhWFpwZEhrZ01pSXNJblJ2YjJ4MGFYQWlPaUpCWTNScGRtbDBlU0F5SWl3aVkzTnpRMnhoYzNNaU9tNTFiR3g5WFN3aVlXTjBhWFpsUVdOMGFYWnBkSGxKWkNJNkltRmpkR2wyYVhSNUxqSWlmU3dpY21sbmFIUkNiM1IwYjIwaU9uc2lZV04wYVhacGRHbGxjeUk2VzExOUxDSmliM1IwYjIxTVpXWjBJanA3SW1GamRHbDJhWFJwWlhNaU9sdGRmU3dpWW05MGRHOXRVbWxuYUhRaU9uc2lZV04wYVhacGRHbGxjeUk2VzExOWZTd2ljR0Z1Wld4eklqcDdJbXhsWm5RaU9uc2lkMmxrZEdnaU9qTXdNQ3dpY21GMGFXOGlPakF1Tlgwc0luSnBaMmgwSWpwN0luZHBaSFJvSWpvek1EQXNJbkpoZEdsdklqb3dMalY5TENKaWIzUjBiMjBpT25zaWFHVnBaMmgwSWpveU5UQXNJbkpoZEdsdklqb3dMalY5Zlgwdkx6RT0iLCJvdXRsZXRzIjoie1wicGFydC5hY3Rpdml0eS0xXCI6W3tcInBhdGhcIjpcInRlc3QtcGFydFwiLFwicGFyYW1ldGVyc1wiOnt9fV0sXCJwYXJ0LmFjdGl2aXR5LTJcIjpbe1wicGF0aFwiOlwidGVzdC1wYXJ0XCIsXCJwYXJhbWV0ZXJzXCI6e319XX0ifX0vLzU=',
      },
    });

    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [{id: 'activity.1'}],
            activeActivityId: 'activity.1',
          },
          rightTop: {
            activities: [{id: 'activity.2'}],
            activeActivityId: 'activity.2',
          },
        },
      },
      grids: {
        main: {
          root: new MPart({
            id: MAIN_AREA,
            alternativeId: MAIN_AREA_ALTERNATIVE_ID,
          }),
          activePartId: MAIN_AREA,
        },
        'activity.1': {
          root: new MPart({
            id: 'part.activity-1',
            views: [],
          }),
          activePartId: 'part.activity-1',
          referencePartId: 'part.activity-1',
        },
        'activity.2': {
          root: new MPart({
            id: 'part.activity-2',
            views: [],
          }),
          activePartId: 'part.activity-2',
          referencePartId: 'part.activity-2',
        },
      },
    });

    expect((await appPO.workbench.part({partId: 'part.activity-1'})).navigation.path).toEqual('test-part');
    expect((await appPO.workbench.part({partId: 'part.activity-2'})).navigation.path).toEqual('test-part');
  });
});
