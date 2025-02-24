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

test.describe('Activity Layout', () => {

  test.only('should contribute activities', async ({appPO, workbenchNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: false});

    await workbenchNavigator.createPerspective(factory => factory
      .addPart(MAIN_AREA)
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-1', ɵactivityId: 'activity.1'})
      .addPart('part.activity-2', {dockTo: 'left-top'}, {icon: 'folder', label: 'testee-2', ɵactivityId: 'activity.2'})
      .addPart('part.activity-3', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'testee-3', ɵactivityId: 'activity.3'})
      .addPart('part.activity-4', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'testee-4', ɵactivityId: 'activity.4'})
      .addPart('part.activity-5', {dockTo: 'right-top'}, {icon: 'folder', label: 'testee-5', ɵactivityId: 'activity.5'})
      .addPart('part.activity-6', {dockTo: 'right-top'}, {icon: 'folder', label: 'testee-6', ɵactivityId: 'activity.6'})
      .addPart('part.activity-7', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'testee-7', ɵactivityId: 'activity.7'})
      .addPart('part.activity-8', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'testee-8', ɵactivityId: 'activity.8'})
      .addPart('part.activity-9', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'testee-9', ɵactivityId: 'activity.9'})
      .addPart('part.activity-10', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'testee-10', ɵactivityId: 'activity.10'})
      .addPart('part.activity-11', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'testee-11', ɵactivityId: 'activity.11'})
      .addPart('part.activity-12', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'testee-12', ɵactivityId: 'activity.12'}),
    );

    // Open activities
    await appPO.activity({activityId: 'activity.1'}).toggle();
    await appPO.activity({activityId: 'activity.3'}).toggle();
    await appPO.activity({activityId: 'activity.5'}).toggle();
    await appPO.activity({activityId: 'activity.7'}).toggle();
    await appPO.activity({activityId: 'activity.9'}).toggle();
    await appPO.activity({activityId: 'activity.11'}).toggle();

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
            activeActivityId: 'activity.3',
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
            activeActivityId: 'activity.7',
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
            activeActivityId: 'activity.11',
          },
        },
        panels: {
          left: {},
          right: {},
          bottom: {},
        },
      },
    });
  });
});
