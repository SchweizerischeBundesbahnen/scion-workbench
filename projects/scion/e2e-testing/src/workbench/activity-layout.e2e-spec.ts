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
import {MPart, MTreeNode} from '../matcher/to-equal-workbench-layout.matcher';
import {ACTIVITY_PANEL_HEIGHT, ACTIVITY_PANEL_RATIO, ACTIVITY_PANEL_WIDTH} from './workbench-layout-constants';
import {DomRect} from '../helper/testing.util';
import {NullContentPagePO} from './page-object/null-content-page.po';

test.describe('Activity Layout', () => {

  test('should toggle activities', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      // left-top
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      .navigatePart('part.activity-1', ['test-part'])
      .addPart('part.activity-2', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
      .navigatePart('part.activity-2', ['test-part'])
      // left-bottom
      .addPart('part.activity-3', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'Activity 3', ɵactivityId: 'activity.3'})
      .navigatePart('part.activity-3', ['test-part'])
      .addPart('part.activity-4', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'Activity 4', ɵactivityId: 'activity.4'})
      .navigatePart('part.activity-4', ['test-part'])
      // right-top
      .addPart('part.activity-5', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity 5', ɵactivityId: 'activity.5'})
      .navigatePart('part.activity-5', ['test-part'])
      .addPart('part.activity-6', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity 6', ɵactivityId: 'activity.6'})
      .navigatePart('part.activity-6', ['test-part'])
      // right-bottom
      .addPart('part.activity-7', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'Activity 7', ɵactivityId: 'activity.7'})
      .navigatePart('part.activity-7', ['test-part'])
      .addPart('part.activity-8', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'Activity 8', ɵactivityId: 'activity.8'})
      .navigatePart('part.activity-8', ['test-part'])
      // top-left
      .addPart('part.activity-9', {dockTo: 'top-left'}, {icon: 'folder', label: 'Activity 9', ɵactivityId: 'activity.9'})
      .navigatePart('part.activity-9', ['test-part'])
      .addPart('part.activity-10', {dockTo: 'top-left'}, {icon: 'folder', label: 'Activity 10', ɵactivityId: 'activity.10'})
      .navigatePart('part.activity-10', ['test-part'])
      // top-right
      .addPart('part.activity-11', {dockTo: 'top-right'}, {icon: 'folder', label: 'Activity 11', ɵactivityId: 'activity.11'})
      .navigatePart('part.activity-11', ['test-part'])
      .addPart('part.activity-12', {dockTo: 'top-right'}, {icon: 'folder', label: 'Activity 12', ɵactivityId: 'activity.12'})
      .navigatePart('part.activity-12', ['test-part'])
      // bottom-left
      .addPart('part.activity-13', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 13', ɵactivityId: 'activity.13'})
      .navigatePart('part.activity-13', ['test-part'])
      .addPart('part.activity-14', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 14', ɵactivityId: 'activity.14'})
      .navigatePart('part.activity-14', ['test-part'])
      // bottom-right
      .addPart('part.activity-15', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'Activity 15', ɵactivityId: 'activity.15'})
      .navigatePart('part.activity-15', ['test-part'])
      .addPart('part.activity-16', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'Activity 16', ɵactivityId: 'activity.16'})
      .navigatePart('part.activity-16', ['test-part']),
    );

    // Assert activity layout.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
              {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
            ],
            activeActivityId: 'none',
          },
          leftBottom: {
            activities: [
              {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
              {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
            ],
            activeActivityId: 'none',
          },
          rightTop: {
            activities: [
              {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
              {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
            ],
            activeActivityId: 'none',
          },
          rightBottom: {
            activities: [
              {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
              {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
            ],
            activeActivityId: 'none',
          },
          topLeft: {
            activities: [
              {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
              {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
            ],
            activeActivityId: 'none',
          },
          topRight: {
            activities: [
              {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
              {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
            ],
            activeActivityId: 'none',
          },
          bottomLeft: {
            activities: [
              {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
              {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
            ],
            activeActivityId: 'none',
          },
          bottomRight: {
            activities: [
              {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
              {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
            ],
            activeActivityId: 'none',
          },
        },
      },
    });

    // Assert parts.
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
    await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

    await test.step('toggle activity.1 (left-top)', async () => {
      // Activate activity.1.
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Assert parts.
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
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.1',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'none',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });

      // Deactivate activity.1.
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Assert parts.
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
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'none',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });
    });

    await test.step('toggle activity.4 (left-bottom)', async () => {
      // Activate activity.4.
      await appPO.activityItem({activityId: 'activity.4'}).click();

      // Assert parts.
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
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'none',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });

      // Deactivate activity.4.
      await appPO.activityItem({activityId: 'activity.4'}).click();

      // Assert parts.
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
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'none',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });
    });

    await test.step('toggle activity.5 (right-top)', async () => {
      // Activate activity.5.
      await appPO.activityItem({activityId: 'activity.5'}).click();

      // Assert parts.
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
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'activity.5',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'none',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });

      // Deactivate activity.5
      await appPO.activityItem({activityId: 'activity.5'}).click();

      // Assert parts.
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
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'none',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
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

      // Assert parts.
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
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'activity.8',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });

      // Deactivate activity.8.
      await appPO.activityItem({activityId: 'activity.8'}).click();

      // Assert parts.
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
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'none',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });
    });

    await test.step('toggle activity.9 (top-left)', async () => {
      // Activate activity.9
      await appPO.activityItem({activityId: 'activity.9'}).click();

      // Assert parts.
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
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'none',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'activity.9',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });

      // Deactivate activity.9.
      await appPO.activityItem({activityId: 'activity.9'}).click();

      // Assert parts.
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
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'none',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });
    });

    await test.step('toggle activity.12 (top-right)', async () => {
      // Activate activity.12.
      await appPO.activityItem({activityId: 'activity.12'}).click();

      // Assert parts.
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
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'none',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'activity.12',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });

      // Deactivate activity.12.
      await appPO.activityItem({activityId: 'activity.12'}).click();

      // Assert parts.
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
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'none',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });
    });

    await test.step('toggle activity.13 (bottom-left)', async () => {
      // Activate activity.13.
      await appPO.activityItem({activityId: 'activity.13'}).click();

      // Assert parts.
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
      await expectPart(appPO.part({partId: 'part.activity-13'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'none',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'activity.13',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });

      // Deactivate activity.13.
      await appPO.activityItem({activityId: 'activity.13'}).click();

      // Assert parts.
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
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'none',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });
    });

    await test.step('toggle activity.16 (bottom-right)', async () => {
      // Activate activity.16.
      await appPO.activityItem({activityId: 'activity.16'}).click();

      // Assert parts.
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
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).toDisplayComponent(PartPagePO.selector);

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'none',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'activity.16',
            },
          },
        },
      });

      // Deactivate activity.16.
      await appPO.activityItem({activityId: 'activity.16'}).click();

      // Assert parts.
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
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'none',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });
    });
  });

  test('should switch activities', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      // left-top
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      .navigatePart('part.activity-1', ['test-part'])
      .addPart('part.activity-2', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
      .navigatePart('part.activity-2', ['test-part'])
      // left-bottom
      .addPart('part.activity-3', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'Activity 3', ɵactivityId: 'activity.3'})
      .navigatePart('part.activity-3', ['test-part'])
      .addPart('part.activity-4', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'Activity 4', ɵactivityId: 'activity.4'})
      .navigatePart('part.activity-4', ['test-part'])
      // right-top
      .addPart('part.activity-5', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity 5', ɵactivityId: 'activity.5'})
      .navigatePart('part.activity-5', ['test-part'])
      .addPart('part.activity-6', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity 6', ɵactivityId: 'activity.6'})
      .navigatePart('part.activity-6', ['test-part'])
      // right-bottom
      .addPart('part.activity-7', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'Activity 7', ɵactivityId: 'activity.7'})
      .navigatePart('part.activity-7', ['test-part'])
      .addPart('part.activity-8', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'Activity 8', ɵactivityId: 'activity.8'})
      .navigatePart('part.activity-8', ['test-part'])
      // top-left
      .addPart('part.activity-9', {dockTo: 'top-left'}, {icon: 'folder', label: 'Activity 9', ɵactivityId: 'activity.9'})
      .navigatePart('part.activity-9', ['test-part'])
      .addPart('part.activity-10', {dockTo: 'top-left'}, {icon: 'folder', label: 'Activity 10', ɵactivityId: 'activity.10'})
      .navigatePart('part.activity-10', ['test-part'])
      // top-right
      .addPart('part.activity-11', {dockTo: 'top-right'}, {icon: 'folder', label: 'Activity 11', ɵactivityId: 'activity.11'})
      .navigatePart('part.activity-11', ['test-part'])
      .addPart('part.activity-12', {dockTo: 'top-right'}, {icon: 'folder', label: 'Activity 12', ɵactivityId: 'activity.12'})
      .navigatePart('part.activity-12', ['test-part'])
      // bottom-left
      .addPart('part.activity-13', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 13', ɵactivityId: 'activity.13'})
      .navigatePart('part.activity-13', ['test-part'])
      .addPart('part.activity-14', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 14', ɵactivityId: 'activity.14'})
      .navigatePart('part.activity-14', ['test-part'])
      // bottom-right
      .addPart('part.activity-15', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'Activity 15', ɵactivityId: 'activity.15'})
      .navigatePart('part.activity-15', ['test-part'])
      .addPart('part.activity-16', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'Activity 16', ɵactivityId: 'activity.16'})
      .navigatePart('part.activity-16', ['test-part']),
    );

    // Assert activity layout.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
              {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
            ],
            activeActivityId: 'none',
          },
          leftBottom: {
            activities: [
              {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
              {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
            ],
            activeActivityId: 'none',
          },
          rightTop: {
            activities: [
              {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
              {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
            ],
            activeActivityId: 'none',
          },
          rightBottom: {
            activities: [
              {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
              {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
            ],
            activeActivityId: 'none',
          },
          topLeft: {
            activities: [
              {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
              {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
            ],
            activeActivityId: 'none',
          },
          topRight: {
            activities: [
              {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
              {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
            ],
            activeActivityId: 'none',
          },
          bottomLeft: {
            activities: [
              {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
              {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
            ],
            activeActivityId: 'none',
          },
          bottomRight: {
            activities: [
              {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
              {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
            ],
            activeActivityId: 'none',
          },
        },
      },
    });

    // Assert parts.
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
    await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
    await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

    await test.step('toggle activity.1 (left-top)', async () => {
      // Activate activity.1.
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Assert parts.
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
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.1',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'none',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });
    });

    await test.step('toggle activity.2 (left-top)', async () => {
      // Activate activity.2.
      await appPO.activityItem({activityId: 'activity.2'}).click();

      // Assert parts.
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).toDisplayComponent(PartPagePO.selector);
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
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.2',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'none',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });
    });

    await test.step('toggle activity.3 (left-bottom)', async () => {
      // Activate activity.3.
      await appPO.activityItem({activityId: 'activity.3'}).click();

      // Assert parts.
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-3'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-4'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-9'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.2',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'activity.3',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'none',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });
    });

    await test.step('toggle activity.4 (left-bottom)', async () => {
      // Activate activity.4.
      await appPO.activityItem({activityId: 'activity.4'}).click();

      // Assert parts.
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).toDisplayComponent(PartPagePO.selector);
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
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.2',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'none',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });
    });

    await test.step('toggle activity.5 (right-top)', async () => {
      // Activate activity.4.
      await appPO.activityItem({activityId: 'activity.5'}).click();

      // Assert parts.
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-5'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-6'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-9'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.2',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'activity.5',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'none',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });
    });

    await test.step('toggle activity.6 (right-top)', async () => {
      // Activate activity.6.
      await appPO.activityItem({activityId: 'activity.6'}).click();

      // Assert parts.
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-9'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.2',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'activity.6',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'none',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });
    });

    await test.step('toggle activity.7 (right-bottom)', async () => {
      // Activate activity.7.
      await appPO.activityItem({activityId: 'activity.7'}).click();

      // Assert parts.
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-7'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-8'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-9'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.2',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'activity.6',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'activity.7',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });
    });

    await test.step('toggle activity.8 (right-bottom)', async () => {
      // Activate activity.8.
      await appPO.activityItem({activityId: 'activity.8'}).click();

      // Assert parts.
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-9'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.2',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'activity.6',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'activity.8',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });
    });

    await test.step('toggle activity.9 (top-left)', async () => {
      // Activate activity.9.
      await appPO.activityItem({activityId: 'activity.9'}).click();

      // Assert parts.
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-9'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-10'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.2',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'activity.6',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'activity.8',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'activity.9',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });
    });

    await test.step('toggle activity.10 (top-left)', async () => {
      // Activate activity.10.
      await appPO.activityItem({activityId: 'activity.10'}).click();

      // Assert parts.
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-9'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-10'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.2',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'activity.6',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'activity.8',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'activity.10',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });
    });

    await test.step('toggle activity.11 (top-right)', async () => {
      // Activate activity.11.
      await appPO.activityItem({activityId: 'activity.11'}).click();

      // Assert parts.
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-9'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-10'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-11'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-12'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.2',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'activity.6',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'activity.8',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'activity.10',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'activity.11',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });
    });

    await test.step('toggle activity.12 (top-right)', async () => {
      // Activate activity.12.
      await appPO.activityItem({activityId: 'activity.12'}).click();

      // Assert parts.
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-9'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-10'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.2',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'activity.6',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'activity.8',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'activity.10',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'activity.12',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });
    });

    await test.step('toggle activity.13 (bottom-left)', async () => {
      // Activate activity.13.
      await appPO.activityItem({activityId: 'activity.13'}).click();

      // Assert parts.
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-9'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-10'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-13'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-14'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.2',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'activity.6',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'activity.8',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'activity.10',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'activity.12',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'activity.13',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });
    });

    await test.step('toggle activity.14 (bottom-left)', async () => {
      // Activate activity.14.
      await appPO.activityItem({activityId: 'activity.14'}).click();

      // Assert parts.
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-9'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-10'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.2',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'activity.6',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'activity.8',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'activity.10',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'activity.12',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'activity.14',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });
    });

    await test.step('toggle activity.15 (bottom-right)', async () => {
      // Activate activity.15.
      await appPO.activityItem({activityId: 'activity.15'}).click();

      // Assert parts.
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-9'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-10'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-15'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-16'})).not.toBeAttached();

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.2',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'activity.6',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'activity.8',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'activity.10',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'activity.12',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'activity.14',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'activity.15',
            },
          },
        },
      });
    });

    await test.step('toggle activity.16 (bottom-right)', async () => {
      // Activate activity.16.
      await appPO.activityItem({activityId: 'activity.16'}).click();

      // Assert parts.
      await expectPart(appPO.part({partId: 'part.activity-1'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-2'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-3'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-4'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-5'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-6'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-7'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-8'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-9'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-10'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-11'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-12'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-13'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-14'})).toDisplayComponent(PartPagePO.selector);
      await expectPart(appPO.part({partId: 'part.activity-15'})).not.toBeAttached();
      await expectPart(appPO.part({partId: 'part.activity-16'})).toDisplayComponent(PartPagePO.selector);

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.2',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'activity.6',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'activity.8',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'activity.10',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'activity.12',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'activity.14',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'activity.16',
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
      .addView('view.101', {partId: 'part.activity-1-left'})
      .addView('view.102', {partId: 'part.activity-1-left'})
      .navigateView('view.101', ['test-view'])
      .navigateView('view.102', ['test-view'])
      // part.activity-1-right
      .addPart('part.activity-1-right', {relativeTo: 'part.activity-1-left', align: 'right'})
      .addView('view.201', {partId: 'part.activity-1-right'})
      .addView('view.202', {partId: 'part.activity-1-right'})
      .navigateView('view.201', ['test-view'])
      .navigateView('view.202', ['test-view'])
      // activate activity.1
      .activatePart('part.activity-1-left'),
    );

    const view101 = new ViewPagePO(appPO.view({viewId: 'view.101'}));
    const view102 = new ViewPagePO(appPO.view({viewId: 'view.102'}));
    const view201 = new ViewPagePO(appPO.view({viewId: 'view.201'}));
    const view202 = new ViewPagePO(appPO.view({viewId: 'view.202'}));

    // Expect activity to display grid.
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
        'activity.1': {
          root: new MTreeNode({
            direction: 'row',
            ratio: ACTIVITY_PANEL_RATIO,
            child1: new MPart({
              id: 'part.activity-1-left',
              views: [{id: 'view.101'}, {id: 'view.102'}],
              activeViewId: 'view.101',
            }),
            child2: new MPart({
              id: 'part.activity-1-right',
              views: [{id: 'view.201'}, {id: 'view.202'}],
              activeViewId: 'view.201',
            }),
          }),
        },
      },
    });

    await expectPart(appPO.part({partId: 'part.activity-1-left'})).not.toDisplayComponent();
    await expectPart(appPO.part({partId: 'part.activity-1-right'})).not.toDisplayComponent();

    await expectView(view101).toBeActive();
    await expectView(view102).toBeInactive();
    await expectView(view201).toBeActive();
    await expectView(view202).toBeInactive();
  });

  test('should activate activities specified in initial layout', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      // left-top
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      .addPart('part.activity-2', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
      // left-bottom
      .addPart('part.activity-3', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'Activity 3', ɵactivityId: 'activity.3'})
      .addPart('part.activity-4', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'Activity 4', ɵactivityId: 'activity.4'})
      // right-top
      .addPart('part.activity-5', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity 5', ɵactivityId: 'activity.5'})
      .addPart('part.activity-6', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity 6', ɵactivityId: 'activity.6'})
      // right-bottom
      .addPart('part.activity-7', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'Activity 7', ɵactivityId: 'activity.7'})
      .addPart('part.activity-8', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'Activity 8', ɵactivityId: 'activity.8'})
      // top-left
      .addPart('part.activity-9', {dockTo: 'top-left'}, {icon: 'folder', label: 'Activity 9', ɵactivityId: 'activity.9'})
      .addPart('part.activity-10', {dockTo: 'top-left'}, {icon: 'folder', label: 'Activity 10', ɵactivityId: 'activity.10'})
      // top-right
      .addPart('part.activity-11', {dockTo: 'top-right'}, {icon: 'folder', label: 'Activity 11', ɵactivityId: 'activity.11'})
      .addPart('part.activity-12', {dockTo: 'top-right'}, {icon: 'folder', label: 'Activity 12', ɵactivityId: 'activity.12'})
      // bottom-left
      .addPart('part.activity-13', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 13', ɵactivityId: 'activity.13'})
      .addPart('part.activity-14', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 14', ɵactivityId: 'activity.14'})
      // bottom-right
      .addPart('part.activity-15', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'Activity 15', ɵactivityId: 'activity.15'})
      .addPart('part.activity-16', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'Activity 16', ɵactivityId: 'activity.16'})
      // activate activities
      .activatePart('part.activity-1')
      .activatePart('part.activity-4')
      .activatePart('part.activity-5')
      .activatePart('part.activity-8')
      .activatePart('part.activity-9')
      .activatePart('part.activity-12')
      .activatePart('part.activity-13')
      .activatePart('part.activity-16'),
    );

    // Expect activities to be activated.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
              {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
            ],
            activeActivityId: 'activity.1',
          },
          leftBottom: {
            activities: [
              {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
              {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
            ],
            activeActivityId: 'activity.4',
          },
          rightTop: {
            activities: [
              {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
              {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
            ],
            activeActivityId: 'activity.5',
          },
          rightBottom: {
            activities: [
              {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
              {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
            ],
            activeActivityId: 'activity.8',
          },
          topLeft: {
            activities: [
              {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
              {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
            ],
            activeActivityId: 'activity.9',
          },
          topRight: {
            activities: [
              {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
              {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
            ],
            activeActivityId: 'activity.12',
          },
          bottomLeft: {
            activities: [
              {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
              {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
            ],
            activeActivityId: 'activity.13',
          },
          bottomRight: {
            activities: [
              {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
              {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
            ],
            activeActivityId: 'activity.16',
          },
        },
      },
    });
  });

  test('should show activity panels', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      // left-top
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      // left-bottom
      .addPart('part.activity-2', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
      // right-top
      .addPart('part.activity-3', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity 3', ɵactivityId: 'activity.3'})
      // right-bottom
      .addPart('part.activity-4', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'Activity 4', ɵactivityId: 'activity.4'})
      // top-left
      .addPart('part.activity-5', {dockTo: 'top-left'}, {icon: 'folder', label: 'Activity 5', ɵactivityId: 'activity.5'})
      // top-right
      .addPart('part.activity-6', {dockTo: 'top-right'}, {icon: 'folder', label: 'Activity 6', ɵactivityId: 'activity.6'})
      // bottom-left
      .addPart('part.activity-7', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 7', ɵactivityId: 'activity.7'})
      // bottom-right
      .addPart('part.activity-8', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'Activity 8', ɵactivityId: 'activity.8'}),
    );

    // Assert activity panels.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        panels: {
          left: 'closed',
          right: 'closed',
          top: 'closed',
          bottom: 'closed',
        },
      },
    });

    /**
     * +-------+-----------+
     * |       |           |
     * | left  | MAIN_AREA |
     * | panel |           |
     * |       |           |
     * +-------+-----------+
     */
    await test.step('toggle activity.1 (left-top)', async () => {
      // Activate activity.1.
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {width: ACTIVITY_PANEL_WIDTH},
            right: 'closed',
            top: 'closed',
            bottom: 'closed',
          },
        },
      });

      // Deactivate activity.1.
      await appPO.activityItem({activityId: 'activity.1'}).click();

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: 'closed',
            right: 'closed',
            top: 'closed',
            bottom: 'closed',
          },
        },
      });
    });

    /**
     * +-------+-----------+
     * |       |           |
     * | left  | MAIN_AREA |
     * | panel |           |
     * |       |           |
     * +-------+-----------+
     */
    await test.step('toggle activity.2 (left-bottom)', async () => {
      // Activate activity.2.
      await appPO.activityItem({activityId: 'activity.2'}).click();

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {width: ACTIVITY_PANEL_WIDTH},
            right: 'closed',
            top: 'closed',
            bottom: 'closed',
          },
        },
      });

      // Deactivate activity.2.
      await appPO.activityItem({activityId: 'activity.2'}).click();

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: 'closed',
            right: 'closed',
            top: 'closed',
            bottom: 'closed',
          },
        },
      });
    });

    /**
     * +-----------+-------+
     * |           |       |
     * | MAIN_AREA | right |
     * |           | panel |
     * |           |       |
     * +-----------+-------+
     */
    await test.step('toggle activity.3 (right-top)', async () => {
      // Activate activity.3.
      await appPO.activityItem({activityId: 'activity.3'}).click();

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: 'closed',
            right: {width: ACTIVITY_PANEL_WIDTH},
            top: 'closed',
            bottom: 'closed',
          },
        },
      });

      // Deactivate activity.3.
      await appPO.activityItem({activityId: 'activity.3'}).click();

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: 'closed',
            right: 'closed',
            top: 'closed',
            bottom: 'closed',
          },
        },
      });
    });

    /**
     * +-----------+-------+
     * |           |       |
     * | MAIN_AREA | right |
     * |           | panel |
     * |           |       |
     * +-----------+-------+
     */
    await test.step('toggle activity.4 (right-bottom)', async () => {
      // Activate activity.4.
      await appPO.activityItem({activityId: 'activity.4'}).click();

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: 'closed',
            right: {width: ACTIVITY_PANEL_WIDTH},
            top: 'closed',
            bottom: 'closed',
          },
        },
      });

      // Deactivate activity.4.
      await appPO.activityItem({activityId: 'activity.4'}).click();

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: 'closed',
            right: 'closed',
            top: 'closed',
            bottom: 'closed',
          },
        },
      });
    });

    /**
     * +-------------------+
     * |     top panel     |
     * +-------------------+
     * |                   |
     * |     MAIN_AREA     |
     * |                   |
     * +-------------------+
     */
    await test.step('toggle activity.5 (top-left)', async () => {
      // Activate activity.5.
      await appPO.activityItem({activityId: 'activity.5'}).click();

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: 'closed',
            right: 'closed',
            top: {height: ACTIVITY_PANEL_HEIGHT},
            bottom: 'closed',
          },
        },
      });

      // Deactivate activity.5.
      await appPO.activityItem({activityId: 'activity.5'}).click();

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: 'closed',
            right: 'closed',
            top: 'closed',
            bottom: 'closed',
          },
        },
      });
    });

    /**
     * +-------------------+
     * |     top panel     |
     * +-------------------+
     * |                   |
     * |     MAIN_AREA     |
     * |                   |
     * +-------------------+
     */
    await test.step('toggle activity.6 (top-right)', async () => {
      // Activate activity.6.
      await appPO.activityItem({activityId: 'activity.6'}).click();

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: 'closed',
            right: 'closed',
            top: {height: ACTIVITY_PANEL_HEIGHT},
            bottom: 'closed',
          },
        },
      });

      // Deactivate activity.6.
      await appPO.activityItem({activityId: 'activity.6'}).click();

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: 'closed',
            right: 'closed',
            top: 'closed',
            bottom: 'closed',
          },
        },
      });
    });

    /**
     * +-------------------+
     * |                   |
     * |     MAIN_AREA     |
     * |                   |
     * +-------------------+
     * |   bottom panel    |
     * +-------------------+
     */
    await test.step('toggle activity.7 (bottom-left)', async () => {
      // Activate activity.7.
      await appPO.activityItem({activityId: 'activity.7'}).click();

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: 'closed',
            right: 'closed',
            top: 'closed',
            bottom: {height: ACTIVITY_PANEL_HEIGHT},
          },
        },
      });

      // Deactivate activity.7.
      await appPO.activityItem({activityId: 'activity.7'}).click();

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: 'closed',
            right: 'closed',
            top: 'closed',
            bottom: 'closed',
          },
        },
      });
    });

    /**
     * +-------------------+
     * |                   |
     * |     MAIN_AREA     |
     * |                   |
     * +-------------------+
     * |   bottom panel    |
     * +-------------------+
     */
    await test.step('toggle activity.8 (bottom-right)', async () => {
      // Activate activity.8.
      await appPO.activityItem({activityId: 'activity.8'}).click();

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: 'closed',
            right: 'closed',
            top: 'closed',
            bottom: {height: ACTIVITY_PANEL_HEIGHT},
          },
        },
      });

      // Deactivate activity.8.
      await appPO.activityItem({activityId: 'activity.8'}).click();

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: 'closed',
            right: 'closed',
            top: 'closed',
            bottom: 'closed',
          },
        },
      });
    });
  });

  test('should resize activity panels', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.modifyLayout(factory => factory
      // left-top
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      // left-bottom
      .addPart('part.activity-2', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
      // right-top
      .addPart('part.activity-3', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity 3', ɵactivityId: 'activity.3'})
      // right-bottom
      .addPart('part.activity-4', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'Activity 4', ɵactivityId: 'activity.4'})
      // top-left
      .addPart('part.activity-5', {dockTo: 'top-left'}, {icon: 'folder', label: 'Activity 5', ɵactivityId: 'activity.5'})
      // top-right
      .addPart('part.activity-6', {dockTo: 'top-right'}, {icon: 'folder', label: 'Activity 6', ɵactivityId: 'activity.6'})
      // bottom-left
      .addPart('part.activity-7', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 7', ɵactivityId: 'activity.7'})
      // bottom-right
      .addPart('part.activity-8', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'Activity 8', ɵactivityId: 'activity.8'})
      // activate activities
      .activatePart('part.activity-1')
      .activatePart('part.activity-2')
      .activatePart('part.activity-3')
      .activatePart('part.activity-4')
      .activatePart('part.activity-5')
      .activatePart('part.activity-6')
      .activatePart('part.activity-7')
      .activatePart('part.activity-8'),
    );

    // Assert activity panels.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        panels: {
          left: {
            width: ACTIVITY_PANEL_WIDTH,
          },
          right: {
            width: ACTIVITY_PANEL_WIDTH,
          },
          top: {
            height: ACTIVITY_PANEL_HEIGHT,
          },
          bottom: {
            height: ACTIVITY_PANEL_HEIGHT,
          },
        },
      },
    });

    await test.step('resize left activity panel', async () => {
      // Resize left activity panel 100px to the right.
      await appPO.activityPanel('left').resize(100);

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {
              width: ACTIVITY_PANEL_WIDTH + 100,
            },
            right: {
              width: ACTIVITY_PANEL_WIDTH,
            },
            top: {
              height: ACTIVITY_PANEL_HEIGHT,
            },
            bottom: {
              height: ACTIVITY_PANEL_HEIGHT,
            },
          },
        },
      });

      await test.step('reload application', async () => {
        // Reload the application.
        await appPO.reload();

        // Assert activity panels.
        await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
          activityLayout: {
            panels: {
              left: {
                width: ACTIVITY_PANEL_WIDTH + 100,
              },
              right: {
                width: ACTIVITY_PANEL_WIDTH,
              },
              top: {
                height: ACTIVITY_PANEL_HEIGHT,
              },
              bottom: {
                height: ACTIVITY_PANEL_HEIGHT,
              },
            },
          },
        });
      });

      // Resize left activity panel 100px to the left.
      await appPO.activityPanel('left').resize(-100);

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {
              width: ACTIVITY_PANEL_WIDTH,
            },
            right: {
              width: ACTIVITY_PANEL_WIDTH,
            },
            top: {
              height: ACTIVITY_PANEL_HEIGHT,
            },
            bottom: {
              height: ACTIVITY_PANEL_HEIGHT,
            },
          },
        },
      });
    });

    await test.step('resize right activity panel', async () => {
      // Resize right activity panel 100px to the left.
      await appPO.activityPanel('right').resize(-100);

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {
              width: ACTIVITY_PANEL_WIDTH,
            },
            right: {
              width: ACTIVITY_PANEL_WIDTH + 100,
            },
            top: {
              height: ACTIVITY_PANEL_HEIGHT,
            },
            bottom: {
              height: ACTIVITY_PANEL_HEIGHT,
            },
          },
        },
      });

      await test.step('reload application', async () => {
        // Reload the application.
        await appPO.reload();

        // Assert activity panels.
        await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
          activityLayout: {
            panels: {
              left: {
                width: ACTIVITY_PANEL_WIDTH,
              },
              right: {
                width: ACTIVITY_PANEL_WIDTH + 100,
              },
              top: {
                height: ACTIVITY_PANEL_HEIGHT,
              },
              bottom: {
                height: ACTIVITY_PANEL_HEIGHT,
              },
            },
          },
        });
      });

      // Resize right activity panel 100px to the right.
      await appPO.activityPanel('right').resize(100);

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {
              width: ACTIVITY_PANEL_WIDTH,
            },
            right: {
              width: ACTIVITY_PANEL_WIDTH,
            },
            top: {
              height: ACTIVITY_PANEL_HEIGHT,
            },
            bottom: {
              height: ACTIVITY_PANEL_HEIGHT,
            },
          },
        },
      });
    });

    await test.step('resize top activity panel', async () => {
      // Resize top activity panel 100px to the bottom.
      await appPO.activityPanel('top').resize(100);

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {
              width: ACTIVITY_PANEL_WIDTH,
            },
            right: {
              width: ACTIVITY_PANEL_WIDTH,
            },
            top: {
              height: ACTIVITY_PANEL_HEIGHT + 100,
            },
            bottom: {
              height: ACTIVITY_PANEL_HEIGHT,
            },
          },
        },
      });

      await test.step('reload application', async () => {
        // Reload the application.
        await appPO.reload();

        // Assert activity panels.
        await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
          activityLayout: {
            panels: {
              left: {
                width: ACTIVITY_PANEL_WIDTH,
              },
              right: {
                width: ACTIVITY_PANEL_WIDTH,
              },
              top: {
                height: ACTIVITY_PANEL_HEIGHT + 100,
              },
              bottom: {
                height: ACTIVITY_PANEL_HEIGHT,
              },
            },
          },
        });
      });

      // Resize top activity panel 100px to the top.
      await appPO.activityPanel('top').resize(-100);

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {
              width: ACTIVITY_PANEL_WIDTH,
            },
            right: {
              width: ACTIVITY_PANEL_WIDTH,
            },
            top: {
              height: ACTIVITY_PANEL_HEIGHT,
            },
            bottom: {
              height: ACTIVITY_PANEL_HEIGHT,
            },
          },
        },
      });
    });

    await test.step('resize bottom activity panel', async () => {
      // Resize bottom activity panel 100px to the top.
      await appPO.activityPanel('bottom').resize(-100);

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {
              width: ACTIVITY_PANEL_WIDTH,
            },
            right: {
              width: ACTIVITY_PANEL_WIDTH,
            },
            top: {
              height: ACTIVITY_PANEL_HEIGHT,
            },
            bottom: {
              height: ACTIVITY_PANEL_HEIGHT + 100,
            },
          },
        },
      });

      await test.step('reload application', async () => {
        // Reload the application.
        await appPO.reload();

        // Assert activity panels.
        await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
          activityLayout: {
            panels: {
              left: {
                width: ACTIVITY_PANEL_WIDTH,
              },
              right: {
                width: ACTIVITY_PANEL_WIDTH,
              },
              top: {
                height: ACTIVITY_PANEL_HEIGHT,
              },
              bottom: {
                height: ACTIVITY_PANEL_HEIGHT + 100,
              },
            },
          },
        });
      });

      // Resize bottom activity panel 100px to the bottom.
      await appPO.activityPanel('bottom').resize(100);

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {
              width: ACTIVITY_PANEL_WIDTH,
            },
            right: {
              width: ACTIVITY_PANEL_WIDTH,
            },
            top: {
              height: ACTIVITY_PANEL_HEIGHT,
            },
            bottom: {
              height: ACTIVITY_PANEL_HEIGHT,
            },
          },
        },
      });
    });
  });

  test('should size activity panels based on design tokens', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({
      microfrontendSupport: false, designTokens: {
        '--sci-workbench-layout-panel-left-width': '150',
        '--sci-workbench-layout-panel-right-width': '200',
        '--sci-workbench-layout-panel-top-height': '250',
        '--sci-workbench-layout-panel-bottom-height': '300',
      },
    });

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1'})
      .addPart('part.activity-2', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity 2'})
      .addPart('part.activity-3', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 3'})
      .addPart('part.activity-4', {dockTo: 'top-left'}, {icon: 'folder', label: 'Activity 4'})
      .activatePart('part.activity-1')
      .activatePart('part.activity-2')
      .activatePart('part.activity-3')
      .activatePart('part.activity-4'),
    );

    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        panels: {
          left: {width: 150},
          right: {width: 200},
          top: {height: 250},
          bottom: {height: 300},
        },
      },
    });
  });

  test('should move splitter in activity panel', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.modifyLayout(factory => factory
      // left-top
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      // left-bottom
      .addPart('part.activity-2', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
      // right-top
      .addPart('part.activity-3', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity 3', ɵactivityId: 'activity.3'})
      // right-bottom
      .addPart('part.activity-4', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'Activity 4', ɵactivityId: 'activity.4'})
      // top-left
      .addPart('part.activity-5', {dockTo: 'top-left'}, {icon: 'folder', label: 'Activity 5', ɵactivityId: 'activity.5'})
      // top-right
      .addPart('part.activity-6', {dockTo: 'top-right'}, {icon: 'folder', label: 'Activity 6', ɵactivityId: 'activity.6'})
      // bottom-left
      .addPart('part.activity-7', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 7', ɵactivityId: 'activity.7'})
      // bottom-right
      .addPart('part.activity-8', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'Activity 8', ɵactivityId: 'activity.8'})
      // activate activities
      .activatePart('part.activity-1')
      .activatePart('part.activity-2')
      .activatePart('part.activity-3')
      .activatePart('part.activity-4')
      .activatePart('part.activity-5')
      .activatePart('part.activity-6')
      .activatePart('part.activity-7')
      .activatePart('part.activity-8'),
    );

    // Assert activity panels.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        panels: {
          left: {
            width: ACTIVITY_PANEL_WIDTH,
            ratio: ACTIVITY_PANEL_RATIO,
          },
          right: {
            width: ACTIVITY_PANEL_WIDTH,
            ratio: ACTIVITY_PANEL_RATIO,
          },
          top: {
            height: ACTIVITY_PANEL_HEIGHT,
            ratio: ACTIVITY_PANEL_RATIO,
          },
          bottom: {
            height: ACTIVITY_PANEL_HEIGHT,
            ratio: ACTIVITY_PANEL_RATIO,
          },
        },
      },
    });

    await test.step('move splitter in left activity panel', async () => {
      const activityPanel = appPO.activityPanel('left');

      // Capture bounding boxes.
      const panelBoundingBox = await activityPanel.getBoundingBox();
      const [topActivityBoundingBox] = (await activityPanel.getActivityBoundingBoxes()) as [DomRect, ...DomRect[]];

      // Move splitter 100px to the top.
      await activityPanel.moveSplitter(-100);

      // Calculate expected ratio.
      const expectedRatio = (topActivityBoundingBox.height - 100) / panelBoundingBox.height;

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {
              width: ACTIVITY_PANEL_WIDTH,
              ratio: expectedRatio,
            },
            right: {
              width: ACTIVITY_PANEL_WIDTH,
              ratio: ACTIVITY_PANEL_RATIO,
            },
            top: {
              height: ACTIVITY_PANEL_HEIGHT,
              ratio: ACTIVITY_PANEL_RATIO,
            },
            bottom: {
              height: ACTIVITY_PANEL_HEIGHT,
              ratio: ACTIVITY_PANEL_RATIO,
            },
          },
        },
      });

      await test.step('reload application', async () => {
        // Reload the application.
        await appPO.reload();

        // Assert activity panels.
        await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
          activityLayout: {
            panels: {
              left: {
                width: ACTIVITY_PANEL_WIDTH,
                ratio: expectedRatio,
              },
              right: {
                width: ACTIVITY_PANEL_WIDTH,
                ratio: ACTIVITY_PANEL_RATIO,
              },
              top: {
                height: ACTIVITY_PANEL_HEIGHT,
                ratio: ACTIVITY_PANEL_RATIO,
              },
              bottom: {
                height: ACTIVITY_PANEL_HEIGHT,
                ratio: ACTIVITY_PANEL_RATIO,
              },
            },
          },
        });
      });

      // Move splitter 100px to the bottom.
      await activityPanel.moveSplitter(100);

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {
              width: ACTIVITY_PANEL_WIDTH,
              ratio: ACTIVITY_PANEL_RATIO,
            },
            right: {
              width: ACTIVITY_PANEL_WIDTH,
              ratio: ACTIVITY_PANEL_RATIO,
            },
            top: {
              height: ACTIVITY_PANEL_HEIGHT,
              ratio: ACTIVITY_PANEL_RATIO,
            },
            bottom: {
              height: ACTIVITY_PANEL_HEIGHT,
              ratio: ACTIVITY_PANEL_RATIO,
            },
          },
        },
      });
    });

    await test.step('move splitter in right activity panel', async () => {
      const activityPanel = appPO.activityPanel('right');

      // Capture bounding boxes.
      const panelBoundingBox = await activityPanel.getBoundingBox();
      const [topActivityBoundingBox] = (await activityPanel.getActivityBoundingBoxes()) as [DomRect, ...DomRect[]];

      // Move splitter 100px to the top.
      await activityPanel.moveSplitter(-100);

      // Calculate expected ratio.
      const expectedRatio = (topActivityBoundingBox.height - 100) / panelBoundingBox.height;

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {
              width: ACTIVITY_PANEL_WIDTH,
              ratio: ACTIVITY_PANEL_RATIO,
            },
            right: {
              width: ACTIVITY_PANEL_WIDTH,
              ratio: expectedRatio,
            },
            top: {
              height: ACTIVITY_PANEL_HEIGHT,
              ratio: ACTIVITY_PANEL_RATIO,
            },
            bottom: {
              height: ACTIVITY_PANEL_HEIGHT,
              ratio: ACTIVITY_PANEL_RATIO,
            },
          },
        },
      });

      await test.step('reload application', async () => {
        // Reload the application.
        await appPO.reload();

        // Assert activity panels.
        await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
          activityLayout: {
            panels: {
              left: {
                width: ACTIVITY_PANEL_WIDTH,
                ratio: ACTIVITY_PANEL_RATIO,
              },
              right: {
                width: ACTIVITY_PANEL_WIDTH,
                ratio: expectedRatio,
              },
              top: {
                height: ACTIVITY_PANEL_HEIGHT,
                ratio: ACTIVITY_PANEL_RATIO,
              },
              bottom: {
                height: ACTIVITY_PANEL_HEIGHT,
                ratio: ACTIVITY_PANEL_RATIO,
              },
            },
          },
        });
      });

      // Move splitter 100px to the bottom.
      await activityPanel.moveSplitter(100);

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {
              width: ACTIVITY_PANEL_WIDTH,
              ratio: ACTIVITY_PANEL_RATIO,
            },
            right: {
              width: ACTIVITY_PANEL_WIDTH,
              ratio: ACTIVITY_PANEL_RATIO,
            },
            top: {
              height: ACTIVITY_PANEL_HEIGHT,
              ratio: ACTIVITY_PANEL_RATIO,
            },
            bottom: {
              height: ACTIVITY_PANEL_HEIGHT,
              ratio: ACTIVITY_PANEL_RATIO,
            },
          },
        },
      });
    });

    await test.step('move splitter in top activity panel', async () => {
      const activityPanel = appPO.activityPanel('top');

      // Capture bounding boxes.
      const panelBoundingBox = await activityPanel.getBoundingBox();
      const [leftActivityBoundingBox] = (await activityPanel.getActivityBoundingBoxes()) as [DomRect, ...DomRect[]];

      // Move splitter 100px to the left.
      await activityPanel.moveSplitter(-100);

      // Calculate expected ratio.
      const expectedRatio = (leftActivityBoundingBox.width - 100) / panelBoundingBox.width;

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {
              width: ACTIVITY_PANEL_WIDTH,
              ratio: ACTIVITY_PANEL_RATIO,
            },
            right: {
              width: ACTIVITY_PANEL_WIDTH,
              ratio: ACTIVITY_PANEL_RATIO,
            },
            top: {
              height: ACTIVITY_PANEL_HEIGHT,
              ratio: expectedRatio,
            },
            bottom: {
              height: ACTIVITY_PANEL_HEIGHT,
              ratio: ACTIVITY_PANEL_RATIO,
            },
          },
        },
      });

      await test.step('reload application', async () => {
        // Reload the application.
        await appPO.reload();

        // Assert activity panels.
        await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
          activityLayout: {
            panels: {
              left: {
                width: ACTIVITY_PANEL_WIDTH,
                ratio: ACTIVITY_PANEL_RATIO,
              },
              right: {
                width: ACTIVITY_PANEL_WIDTH,
                ratio: ACTIVITY_PANEL_RATIO,
              },
              top: {
                height: ACTIVITY_PANEL_HEIGHT,
                ratio: expectedRatio,
              },
              bottom: {
                height: ACTIVITY_PANEL_HEIGHT,
                ratio: ACTIVITY_PANEL_RATIO,
              },
            },
          },
        });
      });

      // Move splitter 100px to the right.
      await activityPanel.moveSplitter(100);

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {
              width: ACTIVITY_PANEL_WIDTH,
              ratio: ACTIVITY_PANEL_RATIO,
            },
            right: {
              width: ACTIVITY_PANEL_WIDTH,
              ratio: ACTIVITY_PANEL_RATIO,
            },
            top: {
              height: ACTIVITY_PANEL_HEIGHT,
              ratio: ACTIVITY_PANEL_RATIO,
            },
            bottom: {
              height: ACTIVITY_PANEL_HEIGHT,
              ratio: ACTIVITY_PANEL_RATIO,
            },
          },
        },
      });
    });

    await test.step('move splitter in bottom activity panel', async () => {
      const activityPanel = appPO.activityPanel('bottom');

      // Capture bounding boxes.
      const panelBoundingBox = await activityPanel.getBoundingBox();
      const [leftActivityBoundingBox] = (await activityPanel.getActivityBoundingBoxes()) as [DomRect, ...DomRect[]];

      // Move splitter 100px to the left.
      await activityPanel.moveSplitter(-100);

      // Calculate expected ratio.
      const expectedRatio = (leftActivityBoundingBox.width - 100) / panelBoundingBox.width;

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {
              width: ACTIVITY_PANEL_WIDTH,
              ratio: ACTIVITY_PANEL_RATIO,
            },
            right: {
              width: ACTIVITY_PANEL_WIDTH,
              ratio: ACTIVITY_PANEL_RATIO,
            },
            top: {
              height: ACTIVITY_PANEL_HEIGHT,
              ratio: ACTIVITY_PANEL_RATIO,
            },
            bottom: {
              height: ACTIVITY_PANEL_HEIGHT,
              ratio: expectedRatio,
            },
          },
        },
      });

      await test.step('reload application', async () => {
        // Reload the application.
        await appPO.reload();

        // Assert activity panels.
        await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
          activityLayout: {
            panels: {
              left: {
                width: ACTIVITY_PANEL_WIDTH,
                ratio: ACTIVITY_PANEL_RATIO,
              },
              right: {
                width: ACTIVITY_PANEL_WIDTH,
                ratio: ACTIVITY_PANEL_RATIO,
              },
              top: {
                height: ACTIVITY_PANEL_HEIGHT,
                ratio: ACTIVITY_PANEL_RATIO,
              },
              bottom: {
                height: ACTIVITY_PANEL_HEIGHT,
                ratio: expectedRatio,
              },
            },
          },
        });
      });

      // Move splitter 100px to the right.
      await activityPanel.moveSplitter(100);

      // Assert activity panels.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          panels: {
            left: {
              width: ACTIVITY_PANEL_WIDTH,
              ratio: ACTIVITY_PANEL_RATIO,
            },
            right: {
              width: ACTIVITY_PANEL_WIDTH,
              ratio: ACTIVITY_PANEL_RATIO,
            },
            top: {
              height: ACTIVITY_PANEL_HEIGHT,
              ratio: ACTIVITY_PANEL_RATIO,
            },
            bottom: {
              height: ACTIVITY_PANEL_HEIGHT,
              ratio: ACTIVITY_PANEL_RATIO,
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
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      .addPart('part.activity-2', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
      // left-bottom
      .addPart('part.activity-3', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'Activity 3', ɵactivityId: 'activity.3'})
      .addPart('part.activity-4', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'Activity 4', ɵactivityId: 'activity.4'})
      // right-top
      .addPart('part.activity-5', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity 5', ɵactivityId: 'activity.5'})
      .addPart('part.activity-6', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity 6', ɵactivityId: 'activity.6'})
      // right-bottom
      .addPart('part.activity-7', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'Activity 7', ɵactivityId: 'activity.7'})
      .addPart('part.activity-8', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'Activity 8', ɵactivityId: 'activity.8'})
      // top-left
      .addPart('part.activity-9', {dockTo: 'top-left'}, {icon: 'folder', label: 'Activity 9', ɵactivityId: 'activity.9'})
      .addPart('part.activity-10', {dockTo: 'top-left'}, {icon: 'folder', label: 'Activity 10', ɵactivityId: 'activity.10'})
      // top-right
      .addPart('part.activity-11', {dockTo: 'top-right'}, {icon: 'folder', label: 'Activity 11', ɵactivityId: 'activity.11'})
      .addPart('part.activity-12', {dockTo: 'top-right'}, {icon: 'folder', label: 'Activity 12', ɵactivityId: 'activity.12'})
      // bottom-left
      .addPart('part.activity-13', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 13', ɵactivityId: 'activity.13'})
      .addPart('part.activity-14', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 14', ɵactivityId: 'activity.14'})
      // bottom-right
      .addPart('part.activity-15', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'Activity 15', ɵactivityId: 'activity.15'})
      .addPart('part.activity-16', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'Activity 16', ɵactivityId: 'activity.16'})
      // activate activities
      .activatePart('part.activity-1')
      .activatePart('part.activity-4')
      .activatePart('part.activity-5')
      .activatePart('part.activity-8')
      .activatePart('part.activity-9')
      .activatePart('part.activity-12')
      .activatePart('part.activity-13')
      .activatePart('part.activity-16'),
    );

    // Assert activity layout.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
              {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
            ],
            activeActivityId: 'activity.1',
          },
          leftBottom: {
            activities: [
              {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
              {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
            ],
            activeActivityId: 'activity.4',
          },
          rightTop: {
            activities: [
              {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
              {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
            ],
            activeActivityId: 'activity.5',
          },
          rightBottom: {
            activities: [
              {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
              {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
            ],
            activeActivityId: 'activity.8',
          },
          topLeft: {
            activities: [
              {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
              {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
            ],
            activeActivityId: 'activity.9',
          },
          topRight: {
            activities: [
              {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
              {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
            ],
            activeActivityId: 'activity.12',
          },
          bottomLeft: {
            activities: [
              {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
              {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
            ],
            activeActivityId: 'activity.13',
          },
          bottomRight: {
            activities: [
              {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
              {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
            ],
            activeActivityId: 'activity.16',
          },
        },
      },
    });

    await test.step('remove left-top activities', async () => {
      // Remove activity.1.
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-1'));

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'activity.5',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'activity.8',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'activity.9',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'activity.12',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'activity.13',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'activity.16',
            },
          },
        },
      });

      // Remove activity.2
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-2'));

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'activity.5',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'activity.8',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'activity.9',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'activity.12',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'activity.13',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'activity.16',
            },
          },
        },
      });
    });

    await test.step('remove left-bottom activities', async () => {
      // Remove activity.3.
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-3'));

      // Assert activity layout.
      await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'activity.5',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'activity.8',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'activity.9',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'activity.12',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'activity.13',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'activity.16',
            },
          },
        },
      });

      // Remove activity.4.
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-4'));

      // Assert activity .
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
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'activity.5',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'activity.8',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'activity.9',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'activity.12',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'activity.13',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'activity.16',
            },
          },
        },
      });
    });

    await test.step('remove right-top activities', async () => {
      // Remove activity.5
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-5'));

      // Assert activity layout.
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
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'activity.8',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'activity.9',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'activity.12',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'activity.13',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'activity.16',
            },
          },
        },
      });

      // Remove activity.6.
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-6'));

      // Assert activity layout.
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
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'activity.8',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'activity.9',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'activity.12',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'activity.13',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'activity.16',
            },
          },
        },
      });
    });

    await test.step('remove right-bottom activities', async () => {
      // Remove activity.7.
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-7'));

      // Assert activity layout.
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
                {id: 'activity.8', icon: 'folder', label: 'Activity 8'},
              ],
              activeActivityId: 'activity.8',
            },
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'activity.9',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'activity.12',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'activity.13',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'activity.16',
            },
          },
        },
      });

      // Remove activity.8.
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-8'));

      // Assert activity layout.
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
            topLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'activity.9',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'activity.12',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'activity.13',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'activity.16',
            },
          },
        },
      });
    });

    await test.step('remove top-left activities', async () => {
      // Remove activity.9.
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-9'));

      // Assert activity layout.
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
            topLeft: {
              activities: [
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'activity.12',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'activity.13',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'activity.16',
            },
          },
        },
      });

      // Remove activity.10.
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-10'));

      // Assert activity layout.
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
            topLeft: {
              activities: [],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'activity.12',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'activity.13',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'activity.16',
            },
          },
        },
      });
    });

    await test.step('remove top-right activities', async () => {
      // Remove activity.11.
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-11'));

      // Assert activity layout.
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
            topLeft: {
              activities: [],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'activity.12',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'activity.13',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'activity.16',
            },
          },
        },
      });

      // Remove activity.12.
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-12'));

      // Assert activity layout.
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
            topLeft: {
              activities: [],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.13', icon: 'folder', label: 'Activity 13'},
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'activity.13',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'activity.16',
            },
          },
        },
      });
    });

    await test.step('remove bottom-left activities', async () => {
      // Remove activity.13.
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-13'));

      // Assert activity layout.
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
            topLeft: {
              activities: [],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.14', icon: 'folder', label: 'Activity 14'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'activity.16',
            },
          },
        },
      });

      // Remove activity.14.
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-14'));

      // Assert activity layout.
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
            topLeft: {
              activities: [],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.15', icon: 'folder', label: 'Activity 15'},
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'activity.16',
            },
          },
        },
      });
    });

    await test.step('remove bottom-right activities', async () => {
      // Remove activity.15.
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-15'));

      // Assert activity layout.
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
            topLeft: {
              activities: [],
              activeActivityId: 'none',
            },
            topRight: {
              activities: [],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.16', icon: 'folder', label: 'Activity 16'},
              ],
              activeActivityId: 'activity.16',
            },
          },
        },
      });

      // Remove activity.16.
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-16'));

      // Assert activity layout.
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
            topLeft: {
              activities: [],
              activeActivityId: 'none',
            },
            topRight: {
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
    });
  });

  test('should not activate activity when navigating part', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'}),
    );

    // Assert activity not to be active.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'none',
          },
        },
      },
    });

    // Navigate part.activity-1.
    await workbenchNavigator.modifyLayout(layout => layout.navigatePart('part.activity-1', ['test-part']));

    // Assert activity not to be active.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'none',
          },
        },
      },
    });

    // Activate part.activity-1.
    await workbenchNavigator.modifyLayout(layout => layout.activatePart('part.activity-1'));

    // Expect activity to be active.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'activity.1',
          },
        },
      },
    });

    // Expect part to display.
    await expectPart(appPO.part({partId: 'part.activity-1'})).toDisplayComponent(PartPagePO.selector);
  });

  test('should activate activity when opening view via router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'}),
    );

    // Expect activity not to be active.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'none',
          },
        },
      },
    });

    // Open view.100.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {partId: 'part.activity-1', target: 'view.100'});

    // Expect activity to be active.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'activity.1',
          },
        },
      },
    });

    // Expect view to be active.
    const viewPage = new ViewPagePO(appPO.view({viewId: 'view.100'}));
    await expectView(viewPage).toBeActive();
  });

  test('should activate activity when navigating view via router', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      .addView('view.100', {partId: 'part.activity-1'}),
    );

    // Expect activity not to be active.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'none',
          },
        },
      },
    });

    // Navigate view.
    const routerPage = await workbenchNavigator.openInNewTab(RouterPagePO);
    await routerPage.navigate(['test-view'], {partId: 'part.activity-1', target: 'view.100'});

    // Expect activity to be active.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'activity.1',
          },
        },
      },
    });

    // Expect view to be active.
    const viewPage = new ViewPagePO(appPO.view({viewId: 'view.100'}));
    await expectView(viewPage).toBeActive();
    await expectPart(appPO.part({partId: 'part.activity-1'})).not.toDisplayComponent();
  });

  test('should restore activity layout when reloading application', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.modifyLayout(factory => factory
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      .activatePart('part.activity-1'),
    );

    // Expect activity to be activated.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'activity.1',
          },
          leftBottom: {activities: [], activeActivityId: 'none'},
          rightTop: {activities: [], activeActivityId: 'none'},
          rightBottom: {activities: [], activeActivityId: 'none'},
          topLeft: {activities: [], activeActivityId: 'none'},
          topRight: {activities: [], activeActivityId: 'none'},
          bottomLeft: {activities: [], activeActivityId: 'none'},
          bottomRight: {activities: [], activeActivityId: 'none'},
        },
      },
      grids: {
        'activity.1': {
          root: new MPart({id: 'part.activity-1'}),
        },
      },
    });

    // Reload the application.
    await appPO.reload();

    // Expect activity layout to be restored.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'activity.1',
          },
          leftBottom: {activities: [], activeActivityId: 'none'},
          rightTop: {activities: [], activeActivityId: 'none'},
          rightBottom: {activities: [], activeActivityId: 'none'},
          topLeft: {activities: [], activeActivityId: 'none'},
          topRight: {activities: [], activeActivityId: 'none'},
          bottomLeft: {activities: [], activeActivityId: 'none'},
          bottomRight: {activities: [], activeActivityId: 'none'},
        },
      },
      grids: {
        'activity.1': {
          root: new MPart({id: 'part.activity-1'}),
        },
      },
    });
  });

  test('should close activity when removing last view', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      .addView('view.100', {partId: 'part.activity-1'})
      .activatePart('part.activity-1'),
    );

    // Expect activity to be active.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'activity.1',
          },
        },
        panels: {
          left: {width: ACTIVITY_PANEL_WIDTH},
        },
      },
    });

    // Remove last view.
    await appPO.view({viewId: 'view.100'}).tab.close();

    // Expect activity to be inactive.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'none',
          },
        },
        panels: {
          left: 'closed',
        },
      },
    });
  });

  test('should not close activity when removing last view (part has navigation)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      .navigatePart('part.activity-1', ['test-part'])
      .addView('view.100', {partId: 'part.activity-1'})
      .activatePart('part.activity-1'),
    );

    // Expect activity to be active.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'activity.1',
          },
        },
        panels: {
          left: {width: ACTIVITY_PANEL_WIDTH},
        },
      },
    });

    // Remove last view.
    await appPO.view({viewId: 'view.100'}).tab.close();

    // Expect activity to still be active.
    await expect(appPO.workbenchRoot).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [
              {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
            ],
            activeActivityId: 'activity.1',
          },
        },
        panels: {
          left: {width: ACTIVITY_PANEL_WIDTH},
        },
      },
    });
  });

  test('should show "null content" hint if activity has single empty part (has no navigated parts or views)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1'})
      .activatePart('part.activity-1'),
    );

    // Expect hint to show.
    const activityPart = appPO.part({partId: 'part.activity-1'});
    await expectPart(activityPart).toDisplayComponent(NullContentPagePO.selector);
  });

  test('should show "null content" hint if activity has empty parts only (has no navigated parts or views)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-1-top', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity'})
      .addPart('part.activity-1-bottom', {relativeTo: 'part.activity-1-top', align: 'bottom'})
      .activatePart('part.activity-1-top'),
    );

    // Expect top part to show "null content".
    const topPart = appPO.part({partId: 'part.activity-1-top'});
    await expectPart(topPart).toDisplayComponent(NullContentPagePO.selector);

    // Expect bottom part not to be attached.
    const bottomPart = appPO.part({partId: 'part.activity-1-bottom'});
    await expectPart(bottomPart).not.toBeAttached();
  });

  test('should show "null content" hint if both activities in panel are empty (have no navigated parts or views)', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      .addPart('part.activity-2', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
      .activatePart('part.activity-1')
      .activatePart('part.activity-2'),
    );

    const activityPart1 = appPO.part({partId: 'part.activity-1'});
    const activityPart2 = appPO.part({partId: 'part.activity-2'});

    // Expect hint to show for activity.1.
    await expectPart(activityPart1).toDisplayComponent(NullContentPagePO.selector);

    // Expect hint to show for activity.2.
    await expectPart(activityPart2).toDisplayComponent(NullContentPagePO.selector);
  });

  test.describe('Title', () => {

    test('should display title of docked part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.activity', {dockTo: 'left-top'}, {title: 'ACTIVITY TITLE', icon: 'folder', label: 'Label'})
        .navigatePart('part.activity', ['test-part'])
        .activatePart('part.activity'),
      );

      const activityPartPage = new PartPagePO(appPO.part({partId: 'part.activity'}));

      // Expect title defined on the layout to display.
      await expect(activityPartPage.part.bar.title).toHaveText('ACTIVITY TITLE');

      // Set title via part handle.
      // Expect activity title not to change.
      await activityPartPage.enterTitle('testee-1');
      await expect(activityPartPage.part.bar.title).toHaveText('ACTIVITY TITLE');

      // Enter empty title.
      // Expect activity title not to change.
      await activityPartPage.enterTitle('');
      await expect(activityPartPage.part.bar.title).toHaveText('ACTIVITY TITLE');

      // Clear title.
      // Expect title defined on the layout to display.
      await activityPartPage.enterTitle(undefined);
      await expect(activityPartPage.part.bar.title).toHaveText('ACTIVITY TITLE');
    });

    test('should display title of part aligned relative to docked part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.activity-1-left', {dockTo: 'left-top'}, {title: 'ACTIVITY TITLE', icon: 'folder', label: 'Label'})
        .addPart('part.activity-1-right', {align: 'right', relativeTo: 'part.activity-1-left'}, {title: 'activity-1-right-title'})
        .navigatePart('part.activity-1-left', ['test-part'])
        .navigatePart('part.activity-1-right', ['test-part'])
        .activatePart('part.activity-1-left'),
      );

      const leftPartPage = new PartPagePO(appPO.part({partId: 'part.activity-1-left'}));
      const rightPartPage = new PartPagePO(appPO.part({partId: 'part.activity-1-right'}));

      // Expect title defined on the layout to display.
      await expect(leftPartPage.part.bar.title).toHaveText('ACTIVITY TITLE');
      await expect(rightPartPage.part.bar.title).toHaveText('activity-1-right-title');

      // Set title via part handle.
      // Expect activity title not to change.
      await leftPartPage.enterTitle('testee-1');
      await rightPartPage.enterTitle('testee-2');
      await expect(leftPartPage.part.bar.title).toHaveText('ACTIVITY TITLE');
      await expect(rightPartPage.part.bar.title).toHaveText('testee-2');

      // Enter empty title.
      // Expect activity title not to change.
      await leftPartPage.enterTitle('');
      await rightPartPage.enterTitle('');
      await expect(leftPartPage.part.bar.title).toHaveText('ACTIVITY TITLE');
      await expect(rightPartPage.part.bar.title).not.toBeAttached();

      // Clear title.
      // Expect title defined on the layout to display.
      await leftPartPage.enterTitle(undefined);
      await rightPartPage.enterTitle(undefined);
      await expect(leftPartPage.part.bar.title).toHaveText('ACTIVITY TITLE');
      await expect(rightPartPage.part.bar.title).toHaveText('activity-1-right-title');
    });

    test('should display title if not set (fall back to label)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.activity', {dockTo: 'left-top'}, {label: 'Label', icon: 'folder'})
        .activatePart('part.activity'),
      );

      // Expect title to display (fall back to label).
      await expect(appPO.part({partId: 'part.activity'}).bar.title).toHaveText('Label');
    });

    test('should not display title if set to false', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.activity', {dockTo: 'left-top'}, {title: false, label: 'testee', icon: 'folder'})
        .activatePart('part.activity'),
      );

      // Expect title not to display.
      await expect(appPO.part({partId: 'part.activity'}).bar.title).not.toBeAttached();
    });

    test('should display activity title in top-leftmost part', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.activity-1-bottom', {dockTo: 'left-top'}, {title: 'ACTIVITY TITLE', icon: 'folder', label: 'Activity 1'})
        .addPart('part.activity-1-top', {relativeTo: 'part.activity-1-bottom', align: 'top'}, {title: 'activity-1-top-title'})
        .addPart('part.activity-1-left', {relativeTo: 'part.activity-1-top', align: 'left'})
        .navigatePart('part.activity-1-bottom', ['test-part'])
        .navigatePart('part.activity-1-top', ['test-part'])
        .navigatePart('part.activity-1-left', ['test-part'])
        .activatePart('part.activity-1-bottom'),
      );

      const leftPartPage = new PartPagePO(appPO.part({partId: 'part.activity-1-left'}));
      const topPartPage = new PartPagePO(appPO.part({partId: 'part.activity-1-top'}));
      const bottomPartPage = new PartPagePO(appPO.part({partId: 'part.activity-1-bottom'}));

      // Expect activity title to display in top-leftmost part.
      await expect(leftPartPage.part.bar.title).toHaveText('ACTIVITY TITLE');
      await expect(topPartPage.part.bar.title).toHaveText('activity-1-top-title');
      await expect(bottomPartPage.part.bar.title).not.toBeAttached();

      // Update titles via handle.
      await leftPartPage.enterTitle('activity-1-left-TITLE');
      await topPartPage.enterTitle('activity-1-top-TITLE');
      await bottomPartPage.enterTitle('activity-1-bottom-TITLE');

      // Expect activity title not to be changed.
      await expect(leftPartPage.part.bar.title).toHaveText('ACTIVITY TITLE');
      await expect(topPartPage.part.bar.title).toHaveText('activity-1-top-TITLE');
      await expect(bottomPartPage.part.bar.title).toHaveText('activity-1-bottom-TITLE');

      // Clear titles.
      await leftPartPage.enterTitle(undefined);
      await topPartPage.enterTitle(undefined);
      await bottomPartPage.enterTitle(undefined);

      // Expect title to display only in top-leftmost part.
      await expect(leftPartPage.part.bar.title).toHaveText('ACTIVITY TITLE');
      await expect(topPartPage.part.bar.title).toHaveText('activity-1-top-title');
      await expect(bottomPartPage.part.bar.title).not.toBeAttached();

      // Remove top-leftmost part.
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-1-left'));

      // Expect title to display.
      await expect(topPartPage.part.bar.title).toHaveText('ACTIVITY TITLE');
      await expect(bottomPartPage.part.bar.title).not.toBeAttached();

      // Remove top-leftmost part.
      await workbenchNavigator.modifyLayout(layout => layout.removePart('part.activity-1-top'));

      // Expect title to display.
      await expect(bottomPartPage.part.bar.title).toHaveText('ACTIVITY TITLE');
    });
  });

  test.describe('Tooltip', () => {

    test('should display tooltip', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.activity', {dockTo: 'left-top'}, {tooltip: 'Tooltip', label: 'Label', icon: 'folder', ɵactivityId: 'activity.1'}),
      );

      const activityItem = appPO.activityItem({activityId: 'activity.1'});

      // Expect tooltip to display.
      await expect.poll(() => activityItem.getTooltip()).toEqual('Tooltip');
    });

    test('should display tooltip if not set (fall back to label)', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false});

      await workbenchNavigator.createPerspective(factory => factory
        .addPart(MAIN_AREA)
        .addPart('part.activity', {dockTo: 'left-top'}, {label: 'Label', icon: 'folder', ɵactivityId: 'activity.1'}),
      );

      const activityItem = appPO.activityItem({activityId: 'activity.1'});

      // Expect tooltip to display (fall back to label).
      await expect.poll(() => activityItem.getTooltip()).toEqual('Label');
    });
  });
});
