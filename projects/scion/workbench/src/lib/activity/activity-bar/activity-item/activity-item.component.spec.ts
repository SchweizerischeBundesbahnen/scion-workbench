/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, input, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {provideWorkbenchForTest} from '../../../testing/workbench.provider';
import {MAIN_AREA} from '../../../layout/workbench-layout';
import {WorkbenchComponent} from '../../../workbench.component';
import {waitUntilWorkbenchStarted} from '../../../testing/testing.util';

describe('Activity Item Component', () => {

  it('should render Material icon if not configured an icon provider', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart(MAIN_AREA)
            .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'icon-1', label: 'Activity 1', ɵactivityId: 'activity.1'})
            .addPart('part.activity-2', {dockTo: 'left-top'}, {icon: 'icon-2', label: 'Activity 2', ɵactivityId: 'activity.2'}),
        }),
      ],
    });
    const fixture = TestBed.createComponent(WorkbenchComponent);
    await waitUntilWorkbenchStarted();

    // Expect default icon component to be rendered.
    expect(fixture.debugElement.query(By.css('wb-activity-item[data-activityid="activity.1"] wb-icon.material-icons')).nativeElement.innerText).toEqual('icon-1');
    expect(fixture.debugElement.query(By.css('wb-activity-item[data-activityid="activity.2"] wb-icon.material-icons')).nativeElement.innerText).toEqual('icon-2');
  });

  it('should render custom icon', async () => {
    @Component({
      selector: 'spec-testee-icon',
      template: `<span class="custom-icon">{{icon()}}</span>`,
    })
    class TesteeIconComponent {
      public readonly icon = input.required<string>();
    }

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart(MAIN_AREA)
            .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'icon-1', label: 'Activity 1', ɵactivityId: 'activity.1'})
            .addPart('part.activity-2', {dockTo: 'left-top'}, {icon: 'icon-2', label: 'Activity 2', ɵactivityId: 'activity.2'}),
          iconProvider: icon => ({component: TesteeIconComponent, inputs: {icon}}),
        }),
      ],
    });
    const fixture = TestBed.createComponent(WorkbenchComponent);
    await waitUntilWorkbenchStarted();

    // Expect custom icon component to be rendered.
    expect(fixture.debugElement.query(By.css('wb-activity-item[data-activityid="activity.1"] span.custom-icon')).nativeElement.innerText).toEqual('icon-1');
    expect(fixture.debugElement.query(By.css('wb-activity-item[data-activityid="activity.2"] span.custom-icon')).nativeElement.innerText).toEqual('icon-2');
  });

  it('should show tooltip', async () => {
    const texts = {
      'tooltip-1': 'TOOLTIP-1',
      'tooltip-2': 'TOOLTIP-2',
    };

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart(MAIN_AREA)
            .addPart('part.activity-1', {dockTo: 'left-top'}, {tooltip: '%tooltip-1', label: 'Activity', icon: 'testee-1', ɵactivityId: 'activity.1'})
            .addPart('part.activity-2', {dockTo: 'left-top'}, {tooltip: 'tooltip-2', label: 'Activity', icon: 'testee-2', ɵactivityId: 'activity.2'}),
          textProvider: key => signal(texts[key as keyof typeof texts]),
        }),
      ],
    });
    const fixture = TestBed.createComponent(WorkbenchComponent);
    await waitUntilWorkbenchStarted();

    // Expect tooltip to show.
    expect(fixture.debugElement.query(By.css('wb-activity-item[data-activityid="activity.1"]')).nativeElement.getAttribute('title')).toEqual('TOOLTIP-1');
    expect(fixture.debugElement.query(By.css('wb-activity-item[data-activityid="activity.2"]')).nativeElement.getAttribute('title')).toEqual('tooltip-2');
  });

  it('should show tooltip if not set (fall back to label)', async () => {
    const texts = {
      'label-1': 'LABEL-1',
      'label-2': 'LABEL-2',
    };

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart(MAIN_AREA)
            .addPart('part.activity-1', {dockTo: 'left-top'}, {label: '%label-1', icon: 'testee-1', ɵactivityId: 'activity.1'})
            .addPart('part.activity-2', {dockTo: 'left-top'}, {label: 'label-2', icon: 'testee-2', ɵactivityId: 'activity.2'}),
          textProvider: key => signal(texts[key as keyof typeof texts]),
        }),
      ],
    });
    const fixture = TestBed.createComponent(WorkbenchComponent);
    await waitUntilWorkbenchStarted();

    // Expect tooltip to show.
    expect(fixture.debugElement.query(By.css('wb-activity-item[data-activityid="activity.1"]')).nativeElement.getAttribute('title')).toEqual('LABEL-1');
    expect(fixture.debugElement.query(By.css('wb-activity-item[data-activityid="activity.2"]')).nativeElement.getAttribute('title')).toEqual('label-2');
  });
});
