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
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';
import {MAIN_AREA} from '../workbench.model';
import {PartPagePO} from '../workbench/page-object/part-page.po';
import {PartPagePO as MicrofrontendPartPagePO} from './page-object/part-page.po';
import {WorkbenchViewNavigationE2E} from '../workbench-accessor';
import {expectPart as expectMicrofrontendPart} from './matcher/part-matcher';
import {expectPart} from '../matcher/part-matcher';

/**
 * TODO [Angular 23] Remove when dropping legacy microfrontend part navigation support.
 *
 * @see provideLegacyMicrofrontendPartRoute
 */
test.describe('Legacy Microfrontend Part Navigation Migrator', () => {

  /**
   * Tests that microfrontend part capability identifiers are migrated to the new format (added capability type to hash).
   *
   * Reference Layout:
   * +----------------+
   * |   MAIN AREA    |
   * +----------------+
   *
   * User Layer:
   * Activities                     MAIN AREA
   * +---------------------------+ +-------------------------+
   * | Activity: activity.1      | | Part: part.top          |
   * | Part: part.activity-1     | |                         |
   * |                           | +-------------------------+
   * | Activity: activity.2      | | Part: part.bottom       |
   * | Part: part.activity-2     | |                         |
   * +---------------------------+ +-------------------------+
   *
   * ## Before migration:
   * - part.activity-1: path='', navigation={hint: 'scion.workbench.microfrontend-part', data: {capabilityId: '446e267'}}
   * - part.activity-2: path='test-part', navigation={}
   * - part.top: path='', navigation={hint: 'scion.workbench.microfrontend-part', data: {capabilityId: '446e267'}}
   * - part.bottom: path='test-part', navigation={}
   *
   * ## After migration:
   * - part.activity-1: path='', navigation={hint: 'scion.workbench.microfrontend-part', data: {capabilityId: 'a789986'}}
   * - part.activity-2: path='test-part', navigation={}
   * - part.top: path='', navigation={hint: 'scion.workbench.microfrontend-part', data: {capabilityId: 'a789986'}}
   * - part.bottom: path='test-part', navigation={}
   */
  test('should migrate microfrontend part capability identifiers to new format', async ({appPO}) => {
    await appPO.navigateTo({
      url: '#/(part.activity-2:test-part//part.bottom:test-part)?main_area=eyJyb290Ijp7InR5cGUiOiJNVHJlZU5vZGUiLCJpZCI6IjQwMzE3MjVmIiwiY2hpbGQxIjp7InR5cGUiOiJNUGFydCIsImlkIjoicGFydC50b3AiLCJ2aWV3cyI6W10sInN0cnVjdHVyYWwiOmZhbHNlLCJuYXZpZ2F0aW9uIjp7ImlkIjoiMGU4N2YxYjUiLCJoaW50Ijoic2Npb24ud29ya2JlbmNoLm1pY3JvZnJvbnRlbmQtcGFydCIsImRhdGEiOnsiY2FwYWJpbGl0eUlkIjoiNDQ2ZTI2NyIsInBhcmFtcyI6e319fX0sImNoaWxkMiI6eyJ0eXBlIjoiTVBhcnQiLCJpZCI6InBhcnQuYm90dG9tIiwidmlld3MiOltdLCJzdHJ1Y3R1cmFsIjp0cnVlLCJuYXZpZ2F0aW9uIjp7ImlkIjoiYjI4YWFhOTQifX0sInJhdGlvIjowLjUsImRpcmVjdGlvbiI6ImNvbHVtbiJ9LCJhY3RpdmVQYXJ0SWQiOiJwYXJ0LnRvcCJ9Ly83',
      microfrontendSupport: true,
      localStorage: {
        'scion.workbench.perspective': 'e2e-perspective-with-main-area',
        'scion.workbench.perspectives.e2e-perspective-with-main-area': 'eyJyZWZlcmVuY2VMYXlvdXQiOnsiZ3JpZHMiOnsibWFpbiI6ImV5SnliMjkwSWpwN0luUjVjR1VpT2lKTlVHRnlkQ0lzSW1sa0lqb2ljR0Z5ZEM1dFlXbHVMV0Z5WldFaUxDSmhiSFJsY201aGRHbDJaVWxrSWpvaWJXRnBiaTFoY21WaElpd2lkbWxsZDNNaU9sdGRMQ0p6ZEhKMVkzUjFjbUZzSWpwMGNuVmxmU3dpWVdOMGFYWmxVR0Z5ZEVsa0lqb2ljR0Z5ZEM1dFlXbHVMV0Z5WldFaWZTOHZOdz09In0sImFjdGl2aXR5TGF5b3V0IjoiZXlKMGIyOXNZbUZ5Y3lJNmV5SnNaV1owVkc5d0lqcDdJbUZqZEdsMmFYUnBaWE1pT2x0ZGZTd2liR1ZtZEVKdmRIUnZiU0k2ZXlKaFkzUnBkbWwwYVdWeklqcGJYWDBzSW5KcFoyaDBWRzl3SWpwN0ltRmpkR2wyYVhScFpYTWlPbHRkZlN3aWNtbG5hSFJDYjNSMGIyMGlPbnNpWVdOMGFYWnBkR2xsY3lJNlcxMTlMQ0ppYjNSMGIyMU1aV1owSWpwN0ltRmpkR2wyYVhScFpYTWlPbHRkZlN3aVltOTBkRzl0VW1sbmFIUWlPbnNpWVdOMGFYWnBkR2xsY3lJNlcxMTlmU3dpY0dGdVpXeHpJanA3SW14bFpuUWlPbnNpZDJsa2RHZ2lPak13TUN3aWNtRjBhVzhpT2pBdU5YMHNJbkpwWjJoMElqcDdJbmRwWkhSb0lqb3pNREFzSW5KaGRHbHZJam93TGpWOUxDSmliM1IwYjIwaU9uc2lhR1ZwWjJoMElqb3lOVEFzSW5KaGRHbHZJam93TGpWOWZYMHZMekU9Iiwib3V0bGV0cyI6Int9In0sInVzZXJMYXlvdXQiOnsiZ3JpZHMiOnsibWFpbiI6ImV5SnliMjkwSWpwN0luUjVjR1VpT2lKTlVHRnlkQ0lzSW1sa0lqb2ljR0Z5ZEM1dFlXbHVMV0Z5WldFaUxDSmhiSFJsY201aGRHbDJaVWxrSWpvaWJXRnBiaTFoY21WaElpd2lkbWxsZDNNaU9sdGRMQ0p6ZEhKMVkzUjFjbUZzSWpwMGNuVmxmU3dpWVdOMGFYWmxVR0Z5ZEVsa0lqb2ljR0Z5ZEM1dFlXbHVMV0Z5WldFaWZTOHZOdz09IiwiYWN0aXZpdHkuMSI6ImV5SnliMjkwSWpwN0luUjVjR1VpT2lKTlVHRnlkQ0lzSW1sa0lqb2ljR0Z5ZEM1aFkzUnBkbWwwZVMweElpd2lkR2wwYkdVaU9pSkJZM1JwZG1sMGVTQXhJaXdpZG1sbGQzTWlPbHRkTENKemRISjFZM1IxY21Gc0lqcDBjblZsTENKaFkzUnBkbUYwYVc5dVNXNXpkR0Z1ZENJNk1UYzJPRFUyT1RJNE1USTJOQ3dpYm1GMmFXZGhkR2x2YmlJNmV5SnBaQ0k2SW1KbE5qZzFNVFJtSWl3aWFHbHVkQ0k2SW5OamFXOXVMbmR2Y210aVpXNWphQzV0YVdOeWIyWnliMjUwWlc1a0xYQmhjblFpTENKa1lYUmhJanA3SW1OaGNHRmlhV3hwZEhsSlpDSTZJalEwTm1VeU5qY2lMQ0p3WVhKaGJYTWlPbnQ5ZlgxOUxDSmhZM1JwZG1WUVlYSjBTV1FpT2lKd1lYSjBMbUZqZEdsMmFYUjVMVEVpTENKeVpXWmxjbVZ1WTJWUVlYSjBTV1FpT2lKd1lYSjBMbUZqZEdsMmFYUjVMVEVpZlM4dk53PT0iLCJhY3Rpdml0eS4yIjoiZXlKeWIyOTBJanA3SW5SNWNHVWlPaUpOVUdGeWRDSXNJbWxrSWpvaWNHRnlkQzVoWTNScGRtbDBlUzB5SWl3aWRHbDBiR1VpT2lKQlkzUnBkbWwwZVNBeUlpd2lkbWxsZDNNaU9sdGRMQ0p6ZEhKMVkzUjFjbUZzSWpwMGNuVmxMQ0poWTNScGRtRjBhVzl1U1c1emRHRnVkQ0k2TVRjMk9EVTJPVEk0TVRJMk5Td2libUYyYVdkaGRHbHZiaUk2ZXlKcFpDSTZJbVV4TnpZNVlXWTRJbjE5TENKaFkzUnBkbVZRWVhKMFNXUWlPaUp3WVhKMExtRmpkR2wyYVhSNUxUSWlMQ0p5WldabGNtVnVZMlZRWVhKMFNXUWlPaUp3WVhKMExtRmpkR2wyYVhSNUxUSWlmUzh2Tnc9PSJ9LCJhY3Rpdml0eUxheW91dCI6ImV5SjBiMjlzWW1GeWN5STZleUpzWldaMFZHOXdJanA3SW1GamRHbDJhWFJwWlhNaU9sdDdJbWxrSWpvaVlXTjBhWFpwZEhrdU1TSXNJbWxqYjI0aU9pSkdiMnhrWlhJaUxDSnNZV0psYkNJNklrRmpkR2wyYVhSNUlERWlMQ0owYjI5c2RHbHdJam9pUVdOMGFYWnBkSGtnTVNKOVhTd2lZV04wYVhabFFXTjBhWFpwZEhsSlpDSTZJbUZqZEdsMmFYUjVMakVpZlN3aWJHVm1kRUp2ZEhSdmJTSTZleUpoWTNScGRtbDBhV1Z6SWpwYmV5SnBaQ0k2SW1GamRHbDJhWFI1TGpJaUxDSnBZMjl1SWpvaVJtOXNaR1Z5SWl3aWJHRmlaV3dpT2lKQlkzUnBkbWwwZVNBeUlpd2lkRzl2YkhScGNDSTZJa0ZqZEdsMmFYUjVJRElpZlYwc0ltRmpkR2wyWlVGamRHbDJhWFI1U1dRaU9pSmhZM1JwZG1sMGVTNHlJbjBzSW5KcFoyaDBWRzl3SWpwN0ltRmpkR2wyYVhScFpYTWlPbHRkZlN3aWNtbG5hSFJDYjNSMGIyMGlPbnNpWVdOMGFYWnBkR2xsY3lJNlcxMTlMQ0ppYjNSMGIyMU1aV1owSWpwN0ltRmpkR2wyYVhScFpYTWlPbHRkZlN3aVltOTBkRzl0VW1sbmFIUWlPbnNpWVdOMGFYWnBkR2xsY3lJNlcxMTlmU3dpY0dGdVpXeHpJanA3SW14bFpuUWlPbnNpZDJsa2RHZ2lPak13TUN3aWNtRjBhVzhpT2pBdU5YMHNJbkpwWjJoMElqcDdJbmRwWkhSb0lqb3pNREFzSW5KaGRHbHZJam93TGpWOUxDSmliM1IwYjIwaU9uc2lhR1ZwWjJoMElqb3lOVEFzSW5KaGRHbHZJam93TGpWOWZYMHZMekU9Iiwib3V0bGV0cyI6IntcInBhcnQuYWN0aXZpdHktMlwiOlt7XCJwYXRoXCI6XCJ0ZXN0LXBhcnRcIixcInBhcmFtZXRlcnNcIjp7fX1dfSJ9fS8vNg==',
      },
    });

    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [{id: 'activity.1'}],
            activeActivityId: 'activity.1',
          },
          leftBottom: {
            activities: [{id: 'activity.2'}],
            activeActivityId: 'activity.2',
          },
        },
      },
      grids: {
        main: {
          root: new MPart({id: MAIN_AREA}),
          activePartId: MAIN_AREA,
        },
        mainArea: {
          root: new MTreeNode({
            direction: 'column',
            ratio: .5,
            child1: new MPart({
              id: 'part.top',
              views: [],
            }),
            child2: new MPart({
              id: 'part.bottom',
              views: [],
            }),
          }),
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

    // Assert migrated microfrontend part.activity-1.
    // navigation: {hint: 'scion.workbench.microfrontend-part', data: {capabilityId: '446e267'}} => {hint: 'scion.workbench.microfrontend-part', data: {capabilityId: 'a789986'}}
    await expectMicrofrontendPart(appPO.part({partId: 'part.activity-1'})).toDisplayComponent(MicrofrontendPartPagePO.selector);
    expect((await appPO.workbench.part({partId: 'part.activity-1'})).navigation).toEqual(expect.objectContaining({
      path: '',
      hint: 'scion.workbench.microfrontend-part',
      data: {
        capabilityId: 'a789986',
        params: {},
        referrer: '',
      },
    } satisfies WorkbenchViewNavigationE2E));

    // Assert non-microfrontend part.activity-3.
    await expectPart(appPO.part({partId: 'part.activity-2'})).toDisplayComponent(PartPagePO.selector);
    expect((await appPO.workbench.part({partId: 'part.activity-2'})).navigation).toEqual(expect.objectContaining({
      path: 'test-part',
    } satisfies WorkbenchViewNavigationE2E));

    // Assert migrated microfrontend part.main-area-middle.
    // navigation: {hint: 'scion.workbench.microfrontend-part', data: {capabilityId: '446e267'}} => {hint: 'scion.workbench.microfrontend-part', data: {capabilityId: 'a789986'}}
    await expectMicrofrontendPart(appPO.part({partId: 'part.top'})).toDisplayComponent(MicrofrontendPartPagePO.selector);
    expect((await appPO.workbench.part({partId: 'part.top'})).navigation).toEqual(expect.objectContaining({
      path: '',
      hint: 'scion.workbench.microfrontend-part',
      data: {
        capabilityId: 'a789986',
        params: {},
        referrer: '',
      },
    } satisfies WorkbenchViewNavigationE2E));

    // Assert non-microfrontend part.main-area-bottom.
    await expectPart(appPO.part({partId: 'part.bottom'})).toDisplayComponent(PartPagePO.selector);
    expect((await appPO.workbench.part({partId: 'part.bottom'})).navigation).toEqual(expect.objectContaining({
      path: 'test-part',
    } satisfies WorkbenchViewNavigationE2E));
  });
});
