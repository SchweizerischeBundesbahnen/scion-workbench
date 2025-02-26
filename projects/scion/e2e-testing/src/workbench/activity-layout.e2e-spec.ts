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

test.describe('Activity Layout', () => {

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
            activeActivityId: undefined,
          },
          leftBottom: {
            activities: [
              {id: 'activity.3', icon: 'folder', label: 'testee-3'},
              {id: 'activity.4', icon: 'folder', label: 'testee-4'},
            ],
            activeActivityId: undefined,
          },
          rightTop: {
            activities: [
              {id: 'activity.5', icon: 'folder', label: 'testee-5'},
              {id: 'activity.6', icon: 'folder', label: 'testee-6'},
            ],
            activeActivityId: undefined,
          },
          rightBottom: {
            activities: [
              {id: 'activity.7', icon: 'folder', label: 'testee-7'},
              {id: 'activity.8', icon: 'folder', label: 'testee-8'},
            ],
            activeActivityId: undefined,
          },
          bottomLeft: {
            activities: [
              {id: 'activity.9', icon: 'folder', label: 'testee-9'},
              {id: 'activity.10', icon: 'folder', label: 'testee-10'},
            ],
            activeActivityId: undefined,
          },
          bottomRight: {
            activities: [
              {id: 'activity.11', icon: 'folder', label: 'testee-11'},
              {id: 'activity.12', icon: 'folder', label: 'testee-12'},
            ],
            activeActivityId: undefined,
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
              activeActivityId: undefined,
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'testee-5'},
                {id: 'activity.6', icon: 'folder', label: 'testee-6'},
              ],
              activeActivityId: undefined,
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'testee-7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: undefined,
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: undefined,
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: undefined,
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
              activeActivityId: undefined,
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'testee-3'},
                {id: 'activity.4', icon: 'folder', label: 'testee-4'},
              ],
              activeActivityId: undefined,
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'testee-5'},
                {id: 'activity.6', icon: 'folder', label: 'testee-6'},
              ],
              activeActivityId: undefined,
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'testee-7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: undefined,
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: undefined,
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: undefined,
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
              activeActivityId: undefined,
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
              activeActivityId: undefined,
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'testee-7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: undefined,
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: undefined,
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: undefined,
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
              activeActivityId: undefined,
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'testee-3'},
                {id: 'activity.4', icon: 'folder', label: 'testee-4'},
              ],
              activeActivityId: undefined,
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'testee-5'},
                {id: 'activity.6', icon: 'folder', label: 'testee-6'},
              ],
              activeActivityId: undefined,
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'testee-7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: undefined,
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: undefined,
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: undefined,
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
              activeActivityId: undefined,
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'testee-3'},
                {id: 'activity.4', icon: 'folder', label: 'testee-4'},
              ],
              activeActivityId: undefined,
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
              activeActivityId: undefined,
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: undefined,
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: undefined,
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
              activeActivityId: undefined,
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'testee-3'},
                {id: 'activity.4', icon: 'folder', label: 'testee-4'},
              ],
              activeActivityId: undefined,
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'testee-5'},
                {id: 'activity.6', icon: 'folder', label: 'testee-6'},
              ],
              activeActivityId: undefined,
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'testee-7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: undefined,
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: undefined,
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: undefined,
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
              activeActivityId: undefined,
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'testee-3'},
                {id: 'activity.4', icon: 'folder', label: 'testee-4'},
              ],
              activeActivityId: undefined,
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'testee-5'},
                {id: 'activity.6', icon: 'folder', label: 'testee-6'},
              ],
              activeActivityId: undefined,
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
              activeActivityId: undefined,
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: undefined,
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
              activeActivityId: undefined,
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'testee-3'},
                {id: 'activity.4', icon: 'folder', label: 'testee-4'},
              ],
              activeActivityId: undefined,
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'testee-5'},
                {id: 'activity.6', icon: 'folder', label: 'testee-6'},
              ],
              activeActivityId: undefined,
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'testee-7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: undefined,
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: undefined,
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: undefined,
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
              activeActivityId: undefined,
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'testee-3'},
                {id: 'activity.4', icon: 'folder', label: 'testee-4'},
              ],
              activeActivityId: undefined,
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'testee-5'},
                {id: 'activity.6', icon: 'folder', label: 'testee-6'},
              ],
              activeActivityId: undefined,
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'testee-7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: undefined,
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
              activeActivityId: undefined,
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
              activeActivityId: undefined,
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'testee-3'},
                {id: 'activity.4', icon: 'folder', label: 'testee-4'},
              ],
              activeActivityId: undefined,
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'testee-5'},
                {id: 'activity.6', icon: 'folder', label: 'testee-6'},
              ],
              activeActivityId: undefined,
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'testee-7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: undefined,
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: undefined,
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: undefined,
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
              activeActivityId: undefined,
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'testee-3'},
                {id: 'activity.4', icon: 'folder', label: 'testee-4'},
              ],
              activeActivityId: undefined,
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'testee-5'},
                {id: 'activity.6', icon: 'folder', label: 'testee-6'},
              ],
              activeActivityId: undefined,
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'testee-7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: undefined,
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: undefined,
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
              activeActivityId: undefined,
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'testee-3'},
                {id: 'activity.4', icon: 'folder', label: 'testee-4'},
              ],
              activeActivityId: undefined,
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'testee-5'},
                {id: 'activity.6', icon: 'folder', label: 'testee-6'},
              ],
              activeActivityId: undefined,
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'testee-7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: undefined,
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'testee-9'},
                {id: 'activity.10', icon: 'folder', label: 'testee-10'},
              ],
              activeActivityId: undefined,
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'testee-11'},
                {id: 'activity.12', icon: 'folder', label: 'testee-12'},
              ],
              activeActivityId: undefined,
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
            activeActivityId: undefined,
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

  // TODO
  // test.fixme('should widescreen mode', async ({appPO, workbenchNavigator}) => {
  // });
});
