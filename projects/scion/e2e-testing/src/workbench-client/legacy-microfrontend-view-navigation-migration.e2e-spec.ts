/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {MPart} from '../matcher/to-equal-workbench-layout.matcher';
import {MAIN_AREA} from '../workbench.model';
import {expectView} from '../matcher/view-matcher';
import {ViewPagePO} from '../workbench/page-object/view-page.po';
import {ViewPagePO as MicrofrontendViewPagePO} from './page-object/view-page.po';
import {WorkbenchViewNavigationE2E} from '../workbench-accessor';

/**
 * TODO [Angular 23] Remove when dropping legacy microfrontend view navigation support.
 *
 * @see provideLegacyMicrofrontendViewRoute
 */
test.describe('Legacy Microfrontend View Navigation Migrator', () => {

  /**
   * Tests that:
   * - microfrontend view navigations (~/capabilityId) are migrated to empty-path hint-based navigations
   * - microfrontend view capability identifiers are migrated to the new format (including capability type in the hash)
   *
   * Reference Layout:
   * +----------------+
   * |   MAIN AREA    |
   * +----------------+
   *
   * User Layer:
   * Activities                     MAIN AREA
   * +---------------------------+ +-------------------------+
   * | Activity: activity.1      | | Part: part.initial      |
   * | Part: part.activity-1     | | Views: [view.3, view.4] |
   * | Views: [view.1, view.2]   | |                         |
   * +---------------------------+ +-------------------------+
   *
   * ## Before migration:
   * - view.1: path='~/a538d2a', navigation={} // microfrontend view
   * - view.2: path='test-view', navigation={} // non-microfrontend view
   * - view.3: path='~/a538d2a', navigation={} // microfrontend view
   * - view.4: path='test-view', navigation={} // non-microfrontend view
   *
   * ## After migration:
   * - view.1: path='', navigation={hint: 'scion.workbench.microfrontend-view', data: {capabilityId: '7d239e3'}}
   * - view.2: path='test-view', navigation={}
   * - view.3: path='', navigation={hint: 'scion.workbench.microfrontend-view', data: {capabilityId: '7d239e3'}}
   * - view.4: path='test-view', navigation={}
   */
  test('should migrate microfrontend view navigations (~/capabilityId) to empty-path hint-based navigations', async ({appPO}) => {
    await appPO.navigateTo({
      url: '#/(view.1:~/a538d2a//view.2:test-view//view.3:~/a538d2a//view.4:test-view)?main_area=eyJyb290Ijp7InR5cGUiOiJNUGFydCIsImlkIjoicGFydC5pbml0aWFsIiwidmlld3MiOlt7ImlkIjoidmlldy4zIiwibmF2aWdhdGlvbiI6eyJpZCI6IjRmNjQ4MjhhIn0sImFjdGl2YXRpb25JbnN0YW50IjoxNzY4MjMwNzgwMTIwfSx7ImlkIjoidmlldy40IiwibmF2aWdhdGlvbiI6eyJpZCI6ImE3MWExN2QxIn0sImFjdGl2YXRpb25JbnN0YW50IjoxNzY4MjMwNzgwMTE5fV0sImFjdGl2ZVZpZXdJZCI6InZpZXcuMyIsInN0cnVjdHVyYWwiOmZhbHNlLCJhY3RpdmF0aW9uSW5zdGFudCI6MTc2ODIzMDc4MDEyMH0sImFjdGl2ZVBhcnRJZCI6InBhcnQuaW5pdGlhbCJ9Ly83',
      microfrontendSupport: true,
      localStorage: {
        'scion.workbench.perspective': 'e2e-perspective-with-main-area',
        'scion.workbench.perspectives.e2e-perspective-with-main-area': 'eyJyZWZlcmVuY2VMYXlvdXQiOnsiZ3JpZHMiOnsibWFpbiI6ImV5SnliMjkwSWpwN0luUjVjR1VpT2lKTlVHRnlkQ0lzSW1sa0lqb2ljR0Z5ZEM1dFlXbHVMV0Z5WldFaUxDSmhiSFJsY201aGRHbDJaVWxrSWpvaWJXRnBiaTFoY21WaElpd2lkbWxsZDNNaU9sdGRMQ0p6ZEhKMVkzUjFjbUZzSWpwMGNuVmxmU3dpWVdOMGFYWmxVR0Z5ZEVsa0lqb2ljR0Z5ZEM1dFlXbHVMV0Z5WldFaWZTOHZOdz09In0sImFjdGl2aXR5TGF5b3V0IjoiZXlKMGIyOXNZbUZ5Y3lJNmV5SnNaV1owVkc5d0lqcDdJbUZqZEdsMmFYUnBaWE1pT2x0ZGZTd2liR1ZtZEVKdmRIUnZiU0k2ZXlKaFkzUnBkbWwwYVdWeklqcGJYWDBzSW5KcFoyaDBWRzl3SWpwN0ltRmpkR2wyYVhScFpYTWlPbHRkZlN3aWNtbG5hSFJDYjNSMGIyMGlPbnNpWVdOMGFYWnBkR2xsY3lJNlcxMTlMQ0ppYjNSMGIyMU1aV1owSWpwN0ltRmpkR2wyYVhScFpYTWlPbHRkZlN3aVltOTBkRzl0VW1sbmFIUWlPbnNpWVdOMGFYWnBkR2xsY3lJNlcxMTlmU3dpY0dGdVpXeHpJanA3SW14bFpuUWlPbnNpZDJsa2RHZ2lPak13TUN3aWNtRjBhVzhpT2pBdU5YMHNJbkpwWjJoMElqcDdJbmRwWkhSb0lqb3pNREFzSW5KaGRHbHZJam93TGpWOUxDSmliM1IwYjIwaU9uc2lhR1ZwWjJoMElqb3lOVEFzSW5KaGRHbHZJam93TGpWOWZYMHZMekU9Iiwib3V0bGV0cyI6Int9In0sInVzZXJMYXlvdXQiOnsiZ3JpZHMiOnsibWFpbiI6ImV5SnliMjkwSWpwN0luUjVjR1VpT2lKTlVHRnlkQ0lzSW1sa0lqb2ljR0Z5ZEM1dFlXbHVMV0Z5WldFaUxDSmhiSFJsY201aGRHbDJaVWxrSWpvaWJXRnBiaTFoY21WaElpd2lkbWxsZDNNaU9sdGRMQ0p6ZEhKMVkzUjFjbUZzSWpwMGNuVmxmU3dpWVdOMGFYWmxVR0Z5ZEVsa0lqb2ljR0Z5ZEM1dFlXbHVMV0Z5WldFaWZTOHZOdz09IiwiYWN0aXZpdHkuMSI6ImV5SnliMjkwSWpwN0luUjVjR1VpT2lKTlVHRnlkQ0lzSW1sa0lqb2ljR0Z5ZEM1aFkzUnBkbWwwZVMweElpd2lkR2wwYkdVaU9pSkJZM1JwZG1sMGVTQXhJaXdpZG1sbGQzTWlPbHQ3SW1sa0lqb2lkbWxsZHk0eElpd2libUYyYVdkaGRHbHZiaUk2ZXlKcFpDSTZJamt6Wm1SaU5HUmhJbjBzSW1GamRHbDJZWFJwYjI1SmJuTjBZVzUwSWpveE56WTRNak13Tnpnd01USXhmU3g3SW1sa0lqb2lkbWxsZHk0eUlpd2libUYyYVdkaGRHbHZiaUk2ZXlKcFpDSTZJamczTlRZeU1HVTVJbjBzSW1GamRHbDJZWFJwYjI1SmJuTjBZVzUwSWpveE56WTRNak13Tnpnd01URTJmVjBzSW1GamRHbDJaVlpwWlhkSlpDSTZJblpwWlhjdU1TSXNJbk4wY25WamRIVnlZV3dpT25SeWRXVXNJbUZqZEdsMllYUnBiMjVKYm5OMFlXNTBJam94TnpZNE1qTXdOemd3TVRJeGZTd2lZV04wYVhabFVHRnlkRWxrSWpvaWNHRnlkQzVoWTNScGRtbDBlUzB4SWl3aWNtVm1aWEpsYm1ObFVHRnlkRWxrSWpvaWNHRnlkQzVoWTNScGRtbDBlUzB4SW4wdkx6Yz0ifSwiYWN0aXZpdHlMYXlvdXQiOiJleUowYjI5c1ltRnljeUk2ZXlKc1pXWjBWRzl3SWpwN0ltRmpkR2wyYVhScFpYTWlPbHQ3SW1sa0lqb2lZV04wYVhacGRIa3VNU0lzSW1samIyNGlPaUptYjJ4a1pYSWlMQ0pzWVdKbGJDSTZJa0ZqZEdsMmFYUjVJREVpTENKMGIyOXNkR2x3SWpvaVFXTjBhWFpwZEhrZ01TSjlYU3dpWVdOMGFYWmxRV04wYVhacGRIbEpaQ0k2SW1GamRHbDJhWFI1TGpFaWZTd2liR1ZtZEVKdmRIUnZiU0k2ZXlKaFkzUnBkbWwwYVdWeklqcGJYWDBzSW5KcFoyaDBWRzl3SWpwN0ltRmpkR2wyYVhScFpYTWlPbHRkZlN3aWNtbG5hSFJDYjNSMGIyMGlPbnNpWVdOMGFYWnBkR2xsY3lJNlcxMTlMQ0ppYjNSMGIyMU1aV1owSWpwN0ltRmpkR2wyYVhScFpYTWlPbHRkZlN3aVltOTBkRzl0VW1sbmFIUWlPbnNpWVdOMGFYWnBkR2xsY3lJNlcxMTlmU3dpY0dGdVpXeHpJanA3SW14bFpuUWlPbnNpZDJsa2RHZ2lPalF6TXl3aWNtRjBhVzhpT2pBdU5YMHNJbkpwWjJoMElqcDdJbmRwWkhSb0lqb3pNREFzSW5KaGRHbHZJam93TGpWOUxDSmliM1IwYjIwaU9uc2lhR1ZwWjJoMElqb3lOVEFzSW5KaGRHbHZJam93TGpWOWZYMHZMekU9Iiwib3V0bGV0cyI6IntcInZpZXcuMVwiOlt7XCJwYXRoXCI6XCJ+XCIsXCJwYXJhbWV0ZXJzXCI6e319LHtcInBhdGhcIjpcImE1MzhkMmFcIixcInBhcmFtZXRlcnNcIjp7fX1dLFwidmlldy4yXCI6W3tcInBhdGhcIjpcInRlc3Qtdmlld1wiLFwicGFyYW1ldGVyc1wiOnt9fV19In19Ly82',
      },
    });

    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [{id: 'activity.1'}],
            activeActivityId: 'activity.1',
          },
        },
      },
      grids: {
        main: {
          root: new MPart({id: MAIN_AREA}),
          activePartId: MAIN_AREA,
        },
        mainArea: {
          root: new MPart({
            id: 'part.initial',
            views: [
              {id: 'view.3'},
              {id: 'view.4'},
            ],
            activeViewId: 'view.3',
          }),
        },
        'activity.1': {
          root: new MPart({
            id: 'part.activity-1',
            views: [
              {id: 'view.1'},
              {id: 'view.2'},
            ],
            activeViewId: 'view.1',
          }),
          activePartId: 'part.activity-1',
          referencePartId: 'part.activity-1',
        },
      },
    });

    // Assert view content.
    const viewPage1 = new MicrofrontendViewPagePO(appPO.view({viewId: 'view.1'}));
    const viewPage2 = new ViewPagePO(appPO.view({viewId: 'view.2'}));
    const viewPage3 = new MicrofrontendViewPagePO(appPO.view({viewId: 'view.3'}));
    const viewPage4 = new ViewPagePO(appPO.view({viewId: 'view.4'}));

    await viewPage1.view.tab.click();
    await expectView(viewPage1).toBeActive();

    await viewPage2.view.tab.click();
    await expectView(viewPage2).toBeActive();

    await viewPage3.view.tab.click();
    await expectView(viewPage3).toBeActive();

    await viewPage4.view.tab.click();
    await expectView(viewPage4).toBeActive();

    // Assert migrated microfrontend view.1.
    // - path: '~/a538d2a' => ''
    // - navigation: {} => {hint: 'scion.workbench.microfrontend-view', data: {capabilityId: '7d239e3'}}
    expect((await appPO.workbench.view({viewId: 'view.1'})).navigation).toEqual(expect.objectContaining({
      path: '',
      hint: 'scion.workbench.microfrontend-view',
      data: {
        capabilityId: '7d239e3',
        params: {},
        referrer: '',
      },
    } satisfies WorkbenchViewNavigationE2E));

    // Assert non-microfrontend view.2.
    expect((await appPO.workbench.view({viewId: 'view.2'})).navigation).toEqual(expect.objectContaining({
      path: 'test-view',
    } satisfies WorkbenchViewNavigationE2E));

    // Assert migrated microfrontend view.3.
    // - path: '~/a538d2a' => ''
    // - navigation: {} => {hint: 'scion.workbench.microfrontend-view', data: {capabilityId: '7d239e3'}}
    expect((await appPO.workbench.view({viewId: 'view.3'})).navigation).toEqual(expect.objectContaining({
      path: '',
      hint: 'scion.workbench.microfrontend-view',
      data: {
        capabilityId: '7d239e3',
        params: {},
        referrer: '',
      },
    } satisfies WorkbenchViewNavigationE2E));

    // Assert non-microfrontend view.4.
    expect((await appPO.workbench.view({viewId: 'view.4'})).navigation).toEqual(expect.objectContaining({
      path: 'test-view',
    } satisfies WorkbenchViewNavigationE2E));
  });
});
