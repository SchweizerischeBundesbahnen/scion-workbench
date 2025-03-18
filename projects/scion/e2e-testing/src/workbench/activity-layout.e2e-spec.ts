/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../fixtures';
import {MAIN_AREA} from '../workbench.model';
import {expect} from '@playwright/test';
import {expectPart} from '../matcher/part-matcher';
import {PartPagePO} from './page-object/part-page.po';
import {ViewPagePO} from './page-object/view-page.po';
import {expectView} from '../matcher/view-matcher';
import {RouterPagePO} from './page-object/router-page.po';

test.describe('Activity Layout', () => {

  // TODO
  // maximize / minimize assert activity grids instead of part page
  // - page reload (separate test? There are many cases. I would prefer to have it at the end of each test as an additional assertion instead)

  test('should contribute activities', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      // left-top
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-1', ɵactivityId: 'activity.1'})
      .navigatePart('part.activity-1', ['test-part'])
      .addPart('part.activity-2', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-2', ɵactivityId: 'activity.2'})
      .navigatePart('part.activity-2', ['test-part'])
      // left-bottom
      .addPart('part.activity-3', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'testee-3', ɵactivityId: 'activity.3'})
      .navigatePart('part.activity-3', ['test-part'])
      .addPart('part.activity-4', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'testee-4', ɵactivityId: 'activity.4'})
      .navigatePart('part.activity-4', ['test-part'])
      // right-top
      .addPart('part.activity-5', {dockTo: 'right-top'}, {icon: 'folder', label: 'testee-5', ɵactivityId: 'activity.5'})
      .navigatePart('part.activity-5', ['test-part'])
      .addPart('part.activity-6', {dockTo: 'right-top'}, {icon: 'folder', label: 'testee-6', ɵactivityId: 'activity.6'})
      .navigatePart('part.activity-6', ['test-part'])
      // right-bottom
      .addPart('part.activity-7', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'testee-7', ɵactivityId: 'activity.7'})
      .navigatePart('part.activity-7', ['test-part'])
      .addPart('part.activity-8', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'testee-8', ɵactivityId: 'activity.8'})
      .navigatePart('part.activity-8', ['test-part'])
      // bottom-left
      .addPart('part.activity-9', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'testee-9', ɵactivityId: 'activity.9'})
      .navigatePart('part.activity-9', ['test-part'])
      .addPart('part.activity-10', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'testee-10', ɵactivityId: 'activity.10'})
      .navigatePart('part.activity-10', ['test-part'])
      // bottom-right
      .addPart('part.activity-11', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'testee-11', ɵactivityId: 'activity.11'})
      .navigatePart('part.activity-11', ['test-part'])
      .addPart('part.activity-12', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'testee-12', ɵactivityId: 'activity.12'})
      .navigatePart('part.activity-12', ['test-part']),
    );

    // Assert activity layout
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'testee-1'},
              {id: 'activity.2', icon: 'folder', label: 'testee-2'},
            ],
            activeActivityId: 'none',
          },
          leftBottom: {
            activities: [
              {id: 'activity.3', icon: 'folder', label: 'testee-3'},
              {id: 'activity.4', icon: 'folder', label: 'testee-4'},
            ],
            activeActivityId: 'none',
          },
          rightTop: {
            activities: [
              {id: 'activity.5', icon: 'folder', label: 'testee-5'},
              {id: 'activity.6', icon: 'folder', label: 'testee-6'},
            ],
            activeActivityId: 'none',
          },
          rightBottom: {
            activities: [
              {id: 'activity.7', icon: 'folder', label: 'testee-7'},
              {id: 'activity.8', icon: 'folder', label: 'testee-8'},
            ],
            activeActivityId: 'none',
          },
          bottomLeft: {
            activities: [
              {id: 'activity.9', icon: 'folder', label: 'testee-9'},
              {id: 'activity.10', icon: 'folder', label: 'testee-10'},
            ],
            activeActivityId: 'none',
          },
          bottomRight: {
            activities: [
              {id: 'activity.11', icon: 'folder', label: 'testee-11'},
              {id: 'activity.12', icon: 'folder', label: 'testee-12'},
            ],
            activeActivityId: 'none',
          },
        },
      },
    });

    // Assert parts
    await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-4'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-8'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-9'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-12'})).not.toBeAttached();

    await test.step('toggle activity.1 (left-top)', async () => {
      // Activate activity.1
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Assert parts
      await expectPart(appPO.part({partId: 'part.activity-1'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-9'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).not.toBeAttached();

      // Assert activity layout
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'testee-1'},
                {id: 'activity.2', icon: 'folder', label: 'testee-2'},
              ],
              activeActivityId: 'activity.1',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'testee-3'},
                {id: 'activity.4', icon: 'folder', label: 'testee-4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'testee-5'},
                {id: 'activity.6', icon: 'folder', label: 'testee-6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'testee-7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });

      // Deactivate activity.1
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Assert parts
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-9'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).not.toBeAttached();

      // Assert activity layout
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'testee-1'},
                {id: 'activity.2', icon: 'folder', label: 'testee-2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'testee-3'},
                {id: 'activity.4', icon: 'folder', label: 'testee-4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'testee-5'},
                {id: 'activity.6', icon: 'folder', label: 'testee-6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'testee-7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });
    });

    await test.step('toggle activity.4 (left-bottom)', async () => {
      // Activate activity.3
      await appPO.activityItem({activityId: 'activity.4'}).click();

      // Assert parts
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-9'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).not.toBeAttached();

      // Assert activity layout
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'testee-1'},
                {id: 'activity.2', icon: 'folder', label: 'testee-2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'testee-3'},
                {id: 'activity.4', icon: 'folder', label: 'testee-4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'testee-5'},
                {id: 'activity.6', icon: 'folder', label: 'testee-6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'testee-7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });

      // Deactivate activity.3
      await appPO.activityItem({activityId: 'activity.4'}).click();

      // Assert parts
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-9'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).not.toBeAttached();

      // Assert activity layout
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'testee-1'},
                {id: 'activity.2', icon: 'folder', label: 'testee-2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'testee-3'},
                {id: 'activity.4', icon: 'folder', label: 'testee-4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'testee-5'},
                {id: 'activity.6', icon: 'folder', label: 'testee-6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'testee-7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });
    });

    await test.step('toggle activity.5 (right-top)', async () => {
      // Activate activity.5
      await appPO.activityItem({activityId: 'activity.5'}).click();

      // Assert parts
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-5'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-9'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).not.toBeAttached();

      // Assert activity layout
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'testee-1'},
                {id: 'activity.2', icon: 'folder', label: 'testee-2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'testee-3'},
                {id: 'activity.4', icon: 'folder', label: 'testee-4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'testee-5'},
                {id: 'activity.6', icon: 'folder', label: 'testee-6'},
              ],
              activeActivityId: 'activity.5',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'testee-7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });

      // Deactivate activity.5
      await appPO.activityItem({activityId: 'activity.5'}).click();

      // Assert parts
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-9'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).not.toBeAttached();

      // Assert activity layout
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'testee-1'},
                {id: 'activity.2', icon: 'folder', label: 'testee-2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'testee-3'},
                {id: 'activity.4', icon: 'folder', label: 'testee-4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'testee-5'},
                {id: 'activity.6', icon: 'folder', label: 'testee-6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'testee-7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });
    });

    await test.step('toggle activity.8 (right-bottom)', async () => {
      // Activate activity.8
      await appPO.activityItem({activityId: 'activity.8'}).click();

      // Assert parts
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-9'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).not.toBeAttached();

      // Assert activity layout
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'testee-1'},
                {id: 'activity.2', icon: 'folder', label: 'testee-2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'testee-3'},
                {id: 'activity.4', icon: 'folder', label: 'testee-4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'testee-5'},
                {id: 'activity.6', icon: 'folder', label: 'testee-6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'testee-7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'activity.8',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });

      // Deactivate activity.8
      await appPO.activityItem({activityId: 'activity.8'}).click();

      // Assert parts
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-9'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).not.toBeAttached();

      // Assert activity layout
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'testee-1'},
                {id: 'activity.2', icon: 'folder', label: 'testee-2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'testee-3'},
                {id: 'activity.4', icon: 'folder', label: 'testee-4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'testee-5'},
                {id: 'activity.6', icon: 'folder', label: 'testee-6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'testee-7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });
    });

    await test.step('toggle activity.9 (bottom-left)', async () => {
      // Activate activity.9
      await appPO.activityItem({activityId: 'activity.9'}).click();

      // Assert parts
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-9'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).not.toBeAttached();

      // Assert activity layout
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'testee-1'},
                {id: 'activity.2', icon: 'folder', label: 'testee-2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'testee-3'},
                {id: 'activity.4', icon: 'folder', label: 'testee-4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'testee-5'},
                {id: 'activity.6', icon: 'folder', label: 'testee-6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'testee-7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: 'activity.9',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });

      // Deactivate activity.9
      await appPO.activityItem({activityId: 'activity.9'}).click();

      // Assert parts
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-9'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).not.toBeAttached();

      // Assert activity layout
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'testee-1'},
                {id: 'activity.2', icon: 'folder', label: 'testee-2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'testee-3'},
                {id: 'activity.4', icon: 'folder', label: 'testee-4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'testee-5'},
                {id: 'activity.6', icon: 'folder', label: 'testee-6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'testee-7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });
    });

    await test.step('toggle activity.12 (bottom-right)', async () => {
      // Activate activity.12
      await appPO.activityItem({activityId: 'activity.12'}).click();

      // Assert parts
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-9'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).toDisplayComponent(PartPagePO.selector);

      // Assert activity layout
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'testee-1'},
                {id: 'activity.2', icon: 'folder', label: 'testee-2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'testee-3'},
                {id: 'activity.4', icon: 'folder', label: 'testee-4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'testee-5'},
                {id: 'activity.6', icon: 'folder', label: 'testee-6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'testee-7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: 'activity.12',
            },
          },
        },
      });

      // Deactivate activity.12
      await appPO.activityItem({activityId: 'activity.12'}).click();

      // Assert parts
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-9'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).not.toBeAttached();

      // Assert activity layout
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'testee-1'},
                {id: 'activity.2', icon: 'folder', label: 'testee-2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'testee-3'},
                {id: 'activity.4', icon: 'folder', label: 'testee-4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'testee-5'},
                {id: 'activity.6', icon: 'folder', label: 'testee-6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'testee-7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });
    });
  });

  test('should display grid in activity', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      // part.activity-1-left
      .addPart('part.activity-1-left', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee', ɵactivityId: 'activity.1'})
      .navigatePart('part.activity-1-left', ['test-part'])
      .addView('view.101', {partId: 'part.activity-1-left'})
      .addView('view.102', {partId: 'part.activity-1-left'})
      .navigateView('view.101', ['test-view'])
      .navigateView('view.102', ['test-view'])
      // part.activity-1-right
      .addPart('part.activity-1-right', {relativeTo: 'part.activity-1-left', align: 'right'})
      .navigatePart('part.activity-1-right', ['test-part'])
      .addView('view.201', {partId: 'part.activity-1-right'})
      .addView('view.202', {partId: 'part.activity-1-right'})
      .navigateView('view.201', ['test-view'])
      .navigateView('view.202', ['test-view']),
    );

    const view101 = new ViewPagePO(appPO, {viewId: 'view.101'});
    const view102 = new ViewPagePO(appPO, {viewId: 'view.102'});
    const view201 = new ViewPagePO(appPO, {viewId: 'view.201'});
    const view202 = new ViewPagePO(appPO, {viewId: 'view.202'});

    // Assert activity grid
    await expectPart(appPO.part({partId: 'part.activity-1-left'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-1-right'})).not.toBeAttached();

    await expectView(view101).not.toBeAttached();
    await expectView(view102).not.toBeAttached();
    await expectView(view201).not.toBeAttached();
    await expectView(view202).not.toBeAttached();

    // Assert activity layout
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [{id: 'activity.1'}],
            activeActivityId: 'none',
          },
        },
      },
    });

    // Activate activity
    await appPO.activityItem({activityId: 'activity.1'}).click();

    // Assert activity grid
    await expectPart(appPO.part({partId: 'part.activity-1-left'})).not.toDisplayComponent();
    await expectPart(appPO.part({partId: 'part.activity-1-right'})).not.toDisplayComponent();

    await expectView(view101).toBeActive();
    await expectView(view102).toBeInactive();
    await expectView(view201).toBeActive();
    await expectView(view202).toBeInactive();

    // Assert activity layout
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [{id: 'activity.1'}],
            activeActivityId: 'activity.1',
          },
        },
      },
    });
  });

  test('should activate activities specified in initial layout', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      // left-top
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-1', ɵactivityId: 'activity.1'})
      .navigatePart('part.activity-1', ['test-part'])
      .addPart('part.activity-2', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-2', ɵactivityId: 'activity.2'})
      .navigatePart('part.activity-2', ['test-part'])
      // left-bottom
      .addPart('part.activity-3', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'testee-3', ɵactivityId: 'activity.3'})
      .navigatePart('part.activity-3', ['test-part'])
      .addPart('part.activity-4', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'testee-4', ɵactivityId: 'activity.4'})
      .navigatePart('part.activity-4', ['test-part'])
      // right-top
      .addPart('part.activity-5', {dockTo: 'right-top'}, {icon: 'folder', label: 'testee-5', ɵactivityId: 'activity.5'})
      .navigatePart('part.activity-5', ['test-part'])
      .addPart('part.activity-6', {dockTo: 'right-top'}, {icon: 'folder', label: 'testee-6', ɵactivityId: 'activity.6'})
      .navigatePart('part.activity-6', ['test-part'])
      // right-bottom
      .addPart('part.activity-7', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'testee-7', ɵactivityId: 'activity.7'})
      .navigatePart('part.activity-7', ['test-part'])
      .addPart('part.activity-8', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'testee-8', ɵactivityId: 'activity.8'})
      .navigatePart('part.activity-8', ['test-part'])
      // bottom-left
      .addPart('part.activity-9', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'testee-9', ɵactivityId: 'activity.9'})
      .navigatePart('part.activity-9', ['test-part'])
      .addPart('part.activity-10', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'testee-10', ɵactivityId: 'activity.10'})
      .navigatePart('part.activity-10', ['test-part'])
      // bottom-right
      .addPart('part.activity-11', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'testee-11', ɵactivityId: 'activity.11'})
      .navigatePart('part.activity-11', ['test-part'])
      .addPart('part.activity-12', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'testee-12', ɵactivityId: 'activity.12'})
      .navigatePart('part.activity-12', ['test-part'])
      // activate activities
      .activatePart('part.activity-1')
      .activatePart('part.activity-4')
      .activatePart('part.activity-5')
      .activatePart('part.activity-8')
      .activatePart('part.activity-9')
      .activatePart('part.activity-12'),
    );

    // Assert activity layout
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'testee-1'},
              {id: 'activity.2', icon: 'folder', label: 'testee-2'},
            ],
            activeActivityId: 'activity.1',
          },
          leftBottom: {
            activities: [
              {id: 'activity.3', icon: 'folder', label: 'testee-3'},
              {id: 'activity.4', icon: 'folder', label: 'testee-4'},
            ],
            activeActivityId: 'activity.4',
          },
          rightTop: {
            activities: [
              {id: 'activity.5', icon: 'folder', label: 'testee-5'},
              {id: 'activity.6', icon: 'folder', label: 'testee-6'},
            ],
            activeActivityId: 'activity.5',
          },
          rightBottom: {
            activities: [
              {id: 'activity.7', icon: 'folder', label: 'testee-7'},
              {id: 'activity.8', icon: 'folder', label: 'testee-8'},
            ],
            activeActivityId: 'activity.8',
          },
          bottomLeft: {
            activities: [
              {id: 'activity.9', icon: 'folder', label: 'testee-9'},
              {id: 'activity.10', icon: 'folder', label: 'testee-10'},
            ],
            activeActivityId: 'activity.9',
          },
          bottomRight: {
            activities: [
              {id: 'activity.11', icon: 'folder', label: 'testee-11'},
              {id: 'activity.12', icon: 'folder', label: 'testee-12'},
            ],
            activeActivityId: 'activity.12',
          },
        },
      },
    });

    // Assert parts
    await expectPart(appPO.part({partId: 'part.activity-1'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-4'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-5'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-8'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-9'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-12'})).toDisplayComponent(PartPagePO.selector);
  });

  test('should show activity panels', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      // left-top
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-1', ɵactivityId: 'activity.1'})
      .navigatePart('part.activity-1', ['test-part'])
      // left-bottom
      .addPart('part.activity-2', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'testee-2', ɵactivityId: 'activity.2'})
      .navigatePart('part.activity-2', ['test-part'])
      // right-top
      .addPart('part.activity-3', {dockTo: 'right-top'}, {icon: 'folder', label: 'testee-3', ɵactivityId: 'activity.3'})
      .navigatePart('part.activity-3', ['test-part'])
      // right-bottom
      .addPart('part.activity-4', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'testee-4', ɵactivityId: 'activity.4'})
      .navigatePart('part.activity-4', ['test-part'])
      // bottom-left
      .addPart('part.activity-5', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'testee-5', ɵactivityId: 'activity.5'})
      .navigatePart('part.activity-5', ['test-part'])
      // bottom-right
      .addPart('part.activity-6', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'testee-6', ɵactivityId: 'activity.6'})
      .navigatePart('part.activity-6', ['test-part']),
    );

    // Assert activity panels
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        panels: {
          left: null,
          right: null,
          bottom: null,
        },
      },
    });

    await test.step('toggle activity.1 (left-top)', async () => {
      // Activate activity.1
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Assert activity panels
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {},
            right: null,
            bottom: null,
          },
        },
      });

      // Deactivate activity.1
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Assert activity panels
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: null,
            right: null,
            bottom: null,
          },
        },
      });
    });

    await test.step('toggle activity.2 (left-bottom)', async () => {
      // Activate activity.2
      await appPO.activityItem({activityId: 'activity.2'}).click();

      // Assert activity panels
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {},
            right: null,
            bottom: null,
          },
        },
      });

      // Deactivate activity.2
      await appPO.activityItem({activityId: 'activity.2'}).click();

      // Assert activity panels
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: null,
            right: null,
            bottom: null,
          },
        },
      });
    });

    await test.step('toggle activity.3 (right-top)', async () => {
      // Activate activity.3
      await appPO.activityItem({activityId: 'activity.3'}).click();

      // Assert activity panels
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: null,
            right: {},
            bottom: null,
          },
        },
      });

      // Deactivate activity.3
      await appPO.activityItem({activityId: 'activity.3'}).click();

      // Assert activity panels
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: null,
            right: null,
            bottom: null,
          },
        },
      });
    });

    await test.step('toggle activity.4 (right-bottom)', async () => {
      // Activate activity.4
      await appPO.activityItem({activityId: 'activity.4'}).click();

      // Assert activity panels
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: null,
            right: {},
            bottom: null,
          },
        },
      });

      // Deactivate activity.4
      await appPO.activityItem({activityId: 'activity.4'}).click();

      // Assert activity panels
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: null,
            right: null,
            bottom: null,
          },
        },
      });
    });

    await test.step('toggle activity.5 (bottom-left)', async () => {
      // Activate activity.5
      await appPO.activityItem({activityId: 'activity.5'}).click();

      // Assert activity panels
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: null,
            right: null,
            bottom: {},
          },
        },
      });

      // Deactivate activity.5
      await appPO.activityItem({activityId: 'activity.5'}).click();

      // Assert activity panels
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: null,
            right: null,
            bottom: null,
          },
        },
      });
    });

    await test.step('toggle activity.6 (bottom-right)', async () => {
      // Activate activity.6
      await appPO.activityItem({activityId: 'activity.6'}).click();

      // Assert activity panels
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: null,
            right: null,
            bottom: {},
          },
        },
      });

      // Deactivate activity.6
      await appPO.activityItem({activityId: 'activity.6'}).click();

      // Assert activity panels
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: null,
            right: null,
            bottom: null,
          },
        },
      });
    });
  });

  test('should resize activity panels', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      // left-top
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-1', ɵactivityId: 'activity.1'})
      .navigatePart('part.activity-1', ['test-part'])
      // left-bottom
      .addPart('part.activity-2', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'testee-2', ɵactivityId: 'activity.2'})
      .navigatePart('part.activity-2', ['test-part'])
      // right-top
      .addPart('part.activity-3', {dockTo: 'right-top'}, {icon: 'folder', label: 'testee-3', ɵactivityId: 'activity.3'})
      .navigatePart('part.activity-3', ['test-part'])
      // right-bottom
      .addPart('part.activity-4', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'testee-4', ɵactivityId: 'activity.4'})
      .navigatePart('part.activity-4', ['test-part'])
      // bottom-left
      .addPart('part.activity-5', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'testee-5', ɵactivityId: 'activity.5'})
      .navigatePart('part.activity-5', ['test-part'])
      // bottom-right
      .addPart('part.activity-6', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'testee-6', ɵactivityId: 'activity.6'})
      .navigatePart('part.activity-6', ['test-part'])
      // activate activities
      .activatePart('part.activity-1')
      .activatePart('part.activity-2')
      .activatePart('part.activity-3')
      .activatePart('part.activity-4')
      .activatePart('part.activity-5')
      .activatePart('part.activity-6'),
    );

    // Assert activity panels
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        panels: {
          left: {
            width: 200,
          },
          right: {
            width: 200,
          },
          bottom: {
            height: 150,
          },
        },
      },
    });

    await test.step('resize left activity panel', async () => {
      // Sash left activity panel 100px to the right
      await appPO.activityPanel('left').resize(100);

      // Assert activity panels
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {
              width: 300,
            },
            right: {
              width: 200,
            },
            bottom: {
              height: 150,
            },
          },
        },
      });

      // Sash left activity panel 100px to the left
      await appPO.activityPanel('left').resize(-100);

      // Assert activity panels
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {
              width: 200,
            },
            right: {
              width: 200,
            },
            bottom: {
              height: 150,
            },
          },
        },
      });
    });

    await test.step('resize right activity panel', async () => {
      // Sash right activity panel 100px to the left
      await appPO.activityPanel('right').resize(-100);

      // Assert activity panels
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {
              width: 200,
            },
            right: {
              width: 300,
            },
            bottom: {
              height: 150,
            },
          },
        },
      });

      // Sash right activity panel 100px to the right
      await appPO.activityPanel('right').resize(100);

      // Assert activity panels
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {
              width: 200,
            },
            right: {
              width: 200,
            },
            bottom: {
              height: 150,
            },
          },
        },
      });
    });

    await test.step('resize bottom activity panel', async () => {
      // Sash bottom activity panel 100px to the top
      await appPO.activityPanel('bottom').resize(-100);

      // Assert activity panels
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {
              width: 200,
            },
            right: {
              width: 200,
            },
            bottom: {
              height: 250,
            },
          },
        },
      });

      // Sash bottom activity panel 100px to the bottom
      await appPO.activityPanel('bottom').resize(100);

      // Assert activity panels
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {
              width: 200,
            },
            right: {
              width: 200,
            },
            bottom: {
              height: 150,
            },
          },
        },
      });
    });
  });

  test('should move splitter in activity panel', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      // left-top
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-1', ɵactivityId: 'activity.1'})
      .navigatePart('part.activity-1', ['test-part'])
      // left-bottom
      .addPart('part.activity-2', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'testee-2', ɵactivityId: 'activity.2'})
      .navigatePart('part.activity-2', ['test-part'])
      // right-top
      .addPart('part.activity-3', {dockTo: 'right-top'}, {icon: 'folder', label: 'testee-3', ɵactivityId: 'activity.3'})
      .navigatePart('part.activity-3', ['test-part'])
      // right-bottom
      .addPart('part.activity-4', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'testee-4', ɵactivityId: 'activity.4'})
      .navigatePart('part.activity-4', ['test-part'])
      // bottom-left
      .addPart('part.activity-5', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'testee-5', ɵactivityId: 'activity.5'})
      .navigatePart('part.activity-5', ['test-part'])
      // bottom-right
      .addPart('part.activity-6', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'testee-6', ɵactivityId: 'activity.6'})
      .navigatePart('part.activity-6', ['test-part'])
      // activate activities
      .activatePart('part.activity-1')
      .activatePart('part.activity-2')
      .activatePart('part.activity-3')
      .activatePart('part.activity-4')
      .activatePart('part.activity-5')
      .activatePart('part.activity-6'),
    );

    // Assert activity panels
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        panels: {
          left: {
            width: 200,
            ratio: .5,
          },
          right: {
            width: 200,
            ratio: .5,
          },
          bottom: {
            height: 150,
            ratio: .5,
          },
        },
      },
    });

    await test.step('move splitter in left activity panel', async () => {
      const activityPanel = appPO.activityPanel('left');

      // Capture bounding boxes
      const panelBoundingBox = await activityPanel.getBoundingBox();
      const [topActivityBoundingBox] = await activityPanel.getActivityBoundingBoxes();

      // Move splitter 100px to the top
      await activityPanel.moveSplitter(-100);

      // Calculate expected ratio
      const expectedRatio = (topActivityBoundingBox.height - 100) / panelBoundingBox.height;

      // Assert activity panels
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {
              width: 200,
              ratio: expectedRatio,
            },
            right: {
              width: 200,
              ratio: .5,
            },
            bottom: {
              height: 150,
              ratio: .5,
            },
          },
        },
      });

      // Move splitter 100px to the bottom
      await activityPanel.moveSplitter(100);

      // Assert activity panels
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {
              width: 200,
              ratio: .5,
            },
            right: {
              width: 200,
              ratio: .5,
            },
            bottom: {
              height: 150,
              ratio: .5,
            },
          },
        },
      });
    });

    await test.step('move splitter in right activity panel', async () => {
      const activityPanel = appPO.activityPanel('right');

      // Capture bounding boxes
      const panelBoundingBox = await activityPanel.getBoundingBox();
      const [topActivityBoundingBox] = await activityPanel.getActivityBoundingBoxes();

      // Move splitter 100px to the top
      await activityPanel.moveSplitter(-100);

      // Calculate expected ratio
      const expectedRatio = (topActivityBoundingBox.height - 100) / panelBoundingBox.height;

      // Assert activity panels
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {
              width: 200,
              ratio: .5,
            },
            right: {
              width: 200,
              ratio: expectedRatio,
            },
            bottom: {
              height: 150,
              ratio: .5,
            },
          },
        },
      });

      // Move splitter 100px to the bottom
      await activityPanel.moveSplitter(100);

      // Assert activity panels
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {
              width: 200,
              ratio: .5,
            },
            right: {
              width: 200,
              ratio: .5,
            },
            bottom: {
              height: 150,
              ratio: .5,
            },
          },
        },
      });
    });

    await test.step('move splitter in bottom activity panel', async () => {
      const activityPanel = appPO.activityPanel('bottom');

      // Capture bounding boxes
      const panelBoundingBox = await activityPanel.getBoundingBox();
      const [leftActivityBoundingBox] = await activityPanel.getActivityBoundingBoxes();

      // Move splitter 100px to the left
      await activityPanel.moveSplitter(-100);

      // Calculate expected ratio
      const expectedRatio = (leftActivityBoundingBox.width - 100) / panelBoundingBox.width;

      // Assert activity panels
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {
              width: 200,
              ratio: .5,
            },
            right: {
              width: 200,
              ratio: .5,
            },
            bottom: {
              height: 150,
              ratio: expectedRatio,
            },
          },
        },
      });

      // Move splitter 100px to the right
      await activityPanel.moveSplitter(100);

      // Assert activity panels
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {
              width: 200,
              ratio: .5,
            },
            right: {
              width: 200,
              ratio: .5,
            },
            bottom: {
              height: 150,
              ratio: .5,
            },
          },
        },
      });
    });
  });

  test('should remove activities', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});
    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      // left-top
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-1', ɵactivityId: 'activity.1'})
      .navigatePart('part.activity-1', ['test-part'])
      .addPart('part.activity-2', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-2', ɵactivityId: 'activity.2'})
      .navigatePart('part.activity-2', ['test-part'])
      // left-bottom
      .addPart('part.activity-3', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'testee-3', ɵactivityId: 'activity.3'})
      .navigatePart('part.activity-3', ['test-part'])
      .addPart('part.activity-4', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'testee-4', ɵactivityId: 'activity.4'})
      .navigatePart('part.activity-4', ['test-part'])
      // right-top
      .addPart('part.activity-5', {dockTo: 'right-top'}, {icon: 'folder', label: 'testee-5', ɵactivityId: 'activity.5'})
      .navigatePart('part.activity-5', ['test-part'])
      .addPart('part.activity-6', {dockTo: 'right-top'}, {icon: 'folder', label: 'testee-6', ɵactivityId: 'activity.6'})
      .navigatePart('part.activity-6', ['test-part'])
      // right-bottom
      .addPart('part.activity-7', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'testee-7', ɵactivityId: 'activity.7'})
      .navigatePart('part.activity-7', ['test-part'])
      .addPart('part.activity-8', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'testee-8', ɵactivityId: 'activity.8'})
      .navigatePart('part.activity-8', ['test-part'])
      // bottom-left
      .addPart('part.activity-9', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'testee-9', ɵactivityId: 'activity.9'})
      .navigatePart('part.activity-9', ['test-part'])
      .addPart('part.activity-10', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'testee-10', ɵactivityId: 'activity.10'})
      .navigatePart('part.activity-10', ['test-part'])
      // bottom-right
      .addPart('part.activity-11', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'testee-11', ɵactivityId: 'activity.11'})
      .navigatePart('part.activity-11', ['test-part'])
      .addPart('part.activity-12', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'testee-12', ɵactivityId: 'activity.12'})
      .navigatePart('part.activity-12', ['test-part'])
      // activate activities
      .activatePart('part.activity-1')
      .activatePart('part.activity-4')
      .activatePart('part.activity-5')
      .activatePart('part.activity-8')
      .activatePart('part.activity-9')
      .activatePart('part.activity-12'),
    );

    // Assert activity layout
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'testee-1'},
              {id: 'activity.2', icon: 'folder', label: 'testee-2'},
            ],
            activeActivityId: 'activity.1',
          },
          leftBottom: {
            activities: [
              {id: 'activity.3', icon: 'folder', label: 'testee-3'},
              {id: 'activity.4', icon: 'folder', label: 'testee-4'},
            ],
            activeActivityId: 'activity.4',
          },
          rightTop: {
            activities: [
              {id: 'activity.5', icon: 'folder', label: 'testee-5'},
              {id: 'activity.6', icon: 'folder', label: 'testee-6'},
            ],
            activeActivityId: 'activity.5',
          },
          rightBottom: {
            activities: [
              {id: 'activity.7', icon: 'folder', label: 'testee-7'},
              {id: 'activity.8', icon: 'folder', label: 'testee-8'},
            ],
            activeActivityId: 'activity.8',
          },
          bottomLeft: {
            activities: [
              {id: 'activity.9', icon: 'folder', label: 'testee-9'},
              {id: 'activity.10', icon: 'folder', label: 'testee-10'},
            ],
            activeActivityId: 'activity.9',
          },
          bottomRight: {
            activities: [
              {id: 'activity.11', icon: 'folder', label: 'testee-11'},
              {id: 'activity.12', icon: 'folder', label: 'testee-12'},
            ],
            activeActivityId: 'activity.12',
          },
        },
      },
    });

    // Assert parts
    await expectPart(appPO.part({partId: 'part.activity-1'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-4'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-5'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-8'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-9'})).toDisplayComponent(PartPagePO.selector);
    await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-12'})).toDisplayComponent(PartPagePO.selector);

    await test.step('remove left-top activities', async () => {
      // Remove activity.1
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-1'));

      // Assert activity layout
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.2', icon: 'folder', label: 'testee-2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'testee-3'},
                {id: 'activity.4', icon: 'folder', label: 'testee-4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'testee-5'},
                {id: 'activity.6', icon: 'folder', label: 'testee-6'},
              ],
              activeActivityId: 'activity.5',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'testee-7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'activity.8',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: 'activity.9',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: 'activity.12',
            },
          },
        },
      });

      // Assert parts
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-5'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-9'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).toDisplayComponent(PartPagePO.selector);

      // Remove activity.2
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-2'));

      // Assert activity layout
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'testee-3'},
                {id: 'activity.4', icon: 'folder', label: 'testee-4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'testee-5'},
                {id: 'activity.6', icon: 'folder', label: 'testee-6'},
              ],
              activeActivityId: 'activity.5',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'testee-7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'activity.8',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: 'activity.9',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: 'activity.12',
            },
          },
        },
      });

      // Assert parts
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-5'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-9'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).toDisplayComponent(PartPagePO.selector);
    });

    await test.step('remove left-bottom activities', async () => {
      // Remove activity.3
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-3'));

      // Assert activity layout
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.4', icon: 'folder', label: 'testee-4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'testee-5'},
                {id: 'activity.6', icon: 'folder', label: 'testee-6'},
              ],
              activeActivityId: 'activity.5',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'testee-7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'activity.8',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: 'activity.9',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: 'activity.12',
            },
          },
        },
      });

      // Assert parts
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-5'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-9'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).toDisplayComponent(PartPagePO.selector);

      // Remove activity.4
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-4'));

      // Assert activity layout
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'testee-5'},
                {id: 'activity.6', icon: 'folder', label: 'testee-6'},
              ],
              activeActivityId: 'activity.5',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'testee-7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'activity.8',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: 'activity.9',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: 'activity.12',
            },
          },
        },
      });

      // Assert parts
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-5'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-9'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).toDisplayComponent(PartPagePO.selector);
    });

    await test.step('remove right-top activities', async () => {
      // Remove activity.5
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-5'));

      // Assert activity layout
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.6', icon: 'folder', label: 'testee-6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'testee-7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'activity.8',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: 'activity.9',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: 'activity.12',
            },
          },
        },
      });

      // Assert parts
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-9'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).toDisplayComponent(PartPagePO.selector);

      // Remove activity.6
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-6'));

      // Assert activity layout
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'testee-7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'activity.8',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: 'activity.9',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: 'activity.12',
            },
          },
        },
      });

      // Assert parts
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-9'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).toDisplayComponent(PartPagePO.selector);
    });

    await test.step('remove right-bottom activities', async () => {
      // Remove activity.7
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-7'));

      // Assert activity layout
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'activity.8',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: 'activity.9',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: 'activity.12',
            },
          },
        },
      });

      // Assert parts
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-9'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).toDisplayComponent(PartPagePO.selector);

      // Remove activity.8
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-8'));

      // Assert activity layout
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: 'activity.9',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: 'activity.12',
            },
          },
        },
      });

      // Assert parts
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-9'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).toDisplayComponent(PartPagePO.selector);
    });

    await test.step('remove bottom-left activities', async () => {
      // Remove activity.9
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-9'));

      // Assert activity layout
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: 'activity.12',
            },
          },
        },
      });

      // Assert parts
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-9'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).toDisplayComponent(PartPagePO.selector);

      // Remove activity.10
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-10'));

      // Assert activity layout
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: 'activity.12',
            },
          },
        },
      });

      // Assert parts
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-9'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).toDisplayComponent(PartPagePO.selector);
    });

    await test.step('remove bottom-right activities', async () => {
      // Remove activity.11
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-11'));

      // Assert activity layout
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: 'activity.12',
            },
          },
        },
      });

      // Assert parts
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-9'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).toDisplayComponent(PartPagePO.selector);

      // Remove activity.12
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-12'));

      // Assert activity layout
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [],
              activeActivityId: 'none',
            },
          },
        },
      });

      // Assert parts
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-9'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).not.toBeAttached();
    });
  });

  test('should not activate activity when navigating part', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-1', ɵactivityId: 'activity.1'}),
    );

    // Assert activity layout
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'testee-1'},
            ],
            activeActivityId: 'none',
          },
          leftBottom: {activities: [], activeActivityId: 'none'},
          rightTop: {activities: [], activeActivityId: 'none'},
          rightBottom: {activities: [], activeActivityId: 'none'},
          bottomLeft: {activities: [], activeActivityId: 'none'},
          bottomRight: {activities: [], activeActivityId: 'none'},
        },
      },
    });

    // Expect part not to be attached
    await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();

    // Navigate part.activity-1
    await workbenchNavigator.modifyLayout(layout => layout.navigatePart('part.activity-1', ['test-part']));
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'testee-1'},
            ],
            activeActivityId: 'none',
          },
          leftBottom: {activities: [], activeActivityId: 'none'},
          rightTop: {activities: [], activeActivityId: 'none'},
          rightBottom: {activities: [], activeActivityId: 'none'},
          bottomLeft: {activities: [], activeActivityId: 'none'},
          bottomRight: {activities: [], activeActivityId: 'none'},
        },
      },
    });
    await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();

    // Activate part.activity-1
    await workbenchNavigator.modifyLayout(layout => layout.activatePart('part.activity-1'));
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'testee-1'},
            ],
            activeActivityId: 'activity.1',
          },
          leftBottom: {activities: [], activeActivityId: 'none'},
          rightTop: {activities: [], activeActivityId: 'none'},
          rightBottom: {activities: [], activeActivityId: 'none'},
          bottomLeft: {activities: [], activeActivityId: 'none'},
          bottomRight: {activities: [], activeActivityId: 'none'},
        },
      },
    });
    await expectPart(appPO.part({partId: 'part.activity-1'})).toDisplayComponent(PartPagePO.selector);
  });

  test('should activate activity when opening view via router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-1', ɵactivityId: 'activity.1'}),
    );

    // Assert activity layout
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'testee-1'},
            ],
            activeActivityId: 'none',
          },
          leftBottom: {activities: [], activeActivityId: 'none'},
          rightTop: {activities: [], activeActivityId: 'none'},
          rightBottom: {activities: [], activeActivityId: 'none'},
          bottomLeft: {activities: [], activeActivityId: 'none'},
          bottomRight: {activities: [], activeActivityId: 'none'},
        },
      },
    });

    // Assert part
    await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();

    // Open view.100
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {partId: 'part.activity-1', target: 'view.100'});

    // Assert activity layout
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'testee-1'},
            ],
            activeActivityId: 'activity.1',
          },
          leftBottom: {activities: [], activeActivityId: 'none'},
          rightTop: {activities: [], activeActivityId: 'none'},
          rightBottom: {activities: [], activeActivityId: 'none'},
          bottomLeft: {activities: [], activeActivityId: 'none'},
          bottomRight: {activities: [], activeActivityId: 'none'},
        },
      },
    });

    // Assert part
    await expectPart(appPO.part({partId: 'part.activity-1'})).not.toDisplayComponent();

    // Assert view
    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
    await expectView(viewPage).toBeActive();
  });

  test('should activate activity when navigating view via router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-1', ɵactivityId: 'activity.1'})
      .addView('view.100', {partId: 'part.activity-1'}),
    );

    // Assert activity layout
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'testee-1'},
            ],
            activeActivityId: 'none',
          },
          leftBottom: {activities: [], activeActivityId: 'none'},
          rightTop: {activities: [], activeActivityId: 'none'},
          rightBottom: {activities: [], activeActivityId: 'none'},
          bottomLeft: {activities: [], activeActivityId: 'none'},
          bottomRight: {activities: [], activeActivityId: 'none'},
        },
      },
    });

    // Assert view
    const viewPage = new ViewPagePO(appPO, {viewId: 'view.100'});
    await expectView(viewPage).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();

    // Navigate view
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {partId: 'part.activity-1', target: 'view.100'});

    // Assert activity layout
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'testee-1'},
            ],
            activeActivityId: 'activity.1',
          },
          leftBottom: {activities: [], activeActivityId: 'none'},
          rightTop: {activities: [], activeActivityId: 'none'},
          rightBottom: {activities: [], activeActivityId: 'none'},
          bottomLeft: {activities: [], activeActivityId: 'none'},
          bottomRight: {activities: [], activeActivityId: 'none'},
        },
      },
    });

    // Assert view
    await expectView(viewPage).toBeActive();
    await expectPart(appPO.part({partId: 'part.activity-1'})).not.toDisplayComponent();
  });
});
