/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {TestBed} from '@angular/core/testing';
import {TestComponent} from '../testing/test.component';
import {styleFixture, waitUntilStable, waitUntilWorkbenchStarted} from '../testing/testing.util';
import {WorkbenchComponent} from '../workbench.component';
import {WORKBENCH_VIEW_REGISTRY} from '../view/workbench-view.registry';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {WORKBENCH_PART_REGISTRY} from './workbench-part.registry';
import {provideRouter} from '@angular/router';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {Component, DestroyRef, Directive, inject, OnDestroy, signal} from '@angular/core';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {ɵWorkbenchPart} from './ɵworkbench-part.model';
import {WorkbenchPartNavigation} from './workbench-part.model';
import {By} from '@angular/platform-browser';
import {WorkbenchService} from '../workbench.service';
import {MAIN_AREA} from '../layout/workbench-layout';
import {SciViewportComponent} from '@scion/components/viewport';
import {ɵWorkbenchService} from '../ɵworkbench.service';
import {MPart, MTreeNode, toEqualWorkbenchLayoutCustomMatcher} from '../testing/jasmine/matcher/to-equal-workbench-layout.matcher';

describe('WorkbenchPart', () => {

  beforeEach(() => {
    jasmine.addMatchers(toEqualWorkbenchLayoutCustomMatcher);
  });

  it('should destroy handle\'s injector when removing the part', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Add part to the right.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.addPart('part.right', {align: 'right'}));
    await waitUntilStable();

    // Get reference to the part injector.
    const part = TestBed.inject(WORKBENCH_PART_REGISTRY).get('part.right');
    let injectorDestroyed = false;
    part.injector.get(DestroyRef).onDestroy(() => injectorDestroyed = true);

    // Remove the part.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.removePart('part.right'));
    await waitUntilStable();

    // Expect the injector to be destroyed.
    expect(injectorDestroyed).toBeTrue();
  });

  it('should activate part even if view is already active', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.left-top')
            .addPart('part.left-bottom', {relativeTo: 'part.left-top', align: 'bottom'})
            .addView('view.101', {partId: 'part.left-top'})
            .addView('view.102', {partId: 'part.left-bottom'})
            .navigateView('view.101', ['test-page'])
            .navigateView('view.102', ['test-page'])
            .activatePart('part.left-top'),
        }),
        provideRouter([
          {path: 'test-page', component: TestComponent},
        ]),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Expect part 'left-top' to be active.
    expect(TestBed.inject(WORKBENCH_PART_REGISTRY).get('part.left-top').active()).toBeTrue();
    expect(TestBed.inject(WORKBENCH_PART_REGISTRY).get('part.left-bottom').active()).toBeFalse();

    // WHEN activating already active view
    await TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.102').activate();

    // THEN expect part to be activated.
    expect(TestBed.inject(WORKBENCH_PART_REGISTRY).get('part.left-top').active()).toBeFalse();
    expect(TestBed.inject(WORKBENCH_PART_REGISTRY).get('part.left-bottom').active()).toBeTrue();
  });

  it('should activate part using `Part.activate()`', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.left')
            .addPart('part.right', {align: 'right'})
            .navigatePart('part.left', ['path/to/part'])
            .navigatePart('part.right', ['path/to/part']),
        }),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.left'}),
            child2: new MPart({id: 'part.right'}),
            direction: 'row',
            ratio: .5,
          }),
          activePartId: 'part.left',
        },
      },
    });

    // Activate right part.
    const rightPart = TestBed.inject(ɵWorkbenchService).getPart('part.right')!;
    await rightPart.activate();
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.left'}),
            child2: new MPart({id: 'part.right'}),
            direction: 'row',
            ratio: .5,
          }),
          activePartId: 'part.right',
        },
      },
    });

    // Activate left part.
    const leftPart = TestBed.inject(ɵWorkbenchService).getPart('part.left')!;
    await leftPart.activate();
    await waitUntilStable();
    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.left'}),
            child2: new MPart({id: 'part.right'}),
            direction: 'row',
            ratio: .5,
          }),
          activePartId: 'part.left',
        },
      },
    });

    // Activate left part again.
    const layout = TestBed.inject(WorkbenchService).layout();
    await leftPart.activate();
    await waitUntilStable();

    // Expect layout not to change.
    expect(TestBed.inject(WorkbenchService).layout()).toEqual(layout);
  });

  it('should activate activity using `Part.activate()`', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.main')
            .addPart('part.activity-1', {dockTo: 'left-top'}, {label: 'Activity 1', icon: 'folder', ɵactivityId: 'activity.1'})
            .addPart('part.activity-2', {dockTo: 'left-top'}, {label: 'Activity 2', icon: 'folder', ɵactivityId: 'activity.2'})
            .addPart('part.activity-3-top', {dockTo: 'left-top'}, {label: 'Activity 3', icon: 'folder', ɵactivityId: 'activity.3'})
            .addPart('part.activity-3-bottom', {align: 'bottom', relativeTo: 'part.activity-3-top'})
            .navigatePart('part.activity-1', ['path/to/part'])
            .navigatePart('part.activity-2', ['path/to/part'])
            .navigatePart('part.activity-3-top', ['path/to/part'])
            .navigatePart('part.activity-3-bottom', ['path/to/part'])
            .navigatePart('part.main', ['path/to/part']),
        }),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Assert layout.
    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({id: 'part.main'}),
          activePartId: 'part.main',
        },
      },
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [{id: 'activity.1'}, {id: 'activity.2'}, {id: 'activity.3'}],
            activeActivityId: 'none',
          },
        },
      },
    });

    const layout = TestBed.inject(ɵWorkbenchService).layout;
    const activity1Part = TestBed.inject(ɵWorkbenchService).getPart('part.activity-1')!;
    const activity2Part = TestBed.inject(ɵWorkbenchService).getPart('part.activity-2')!;
    const activity3TopPart = TestBed.inject(ɵWorkbenchService).getPart('part.activity-3-top')!;
    const activity3BottomPart = TestBed.inject(ɵWorkbenchService).getPart('part.activity-3-bottom')!;

    // Assert active state of Part handles.
    expect(activity1Part.active()).toBeFalse();
    expect(activity2Part.active()).toBeFalse();
    expect(activity3TopPart.active()).toBeFalse();
    expect(activity3BottomPart.active()).toBeFalse();

    // Assert active state of MParts.
    expect(layout().activePart({grid: 'activity.1'})!.id).toEqual('part.activity-1');
    expect(layout().activePart({grid: 'activity.2'})!.id).toEqual('part.activity-2');
    expect(layout().activePart({grid: 'activity.3'})!.id).toEqual('part.activity-3-top');

    // TEST: Activate part.activity-1.
    await activity1Part.activate();
    await waitUntilStable();

    // Assert layout.
    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        'activity.1': {
          root: new MPart({id: 'part.activity-1'}),
          activePartId: 'part.activity-1',
        },
        main: {
          root: new MPart({id: 'part.main'}),
          activePartId: 'part.main',
        },
      },
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [{id: 'activity.1'}, {id: 'activity.2'}, {id: 'activity.3'}],
            activeActivityId: 'activity.1',
          },
        },
      },
    });

    // Assert active state of Part handles.
    expect(activity1Part.active()).toBeTrue();
    expect(activity2Part.active()).toBeFalse();
    expect(activity3TopPart.active()).toBeFalse();
    expect(activity3BottomPart.active()).toBeFalse();

    // Assert active state of MParts.
    expect(layout().activePart({grid: 'activity.1'})!.id).toEqual('part.activity-1');
    expect(layout().activePart({grid: 'activity.2'})!.id).toEqual('part.activity-2');
    expect(layout().activePart({grid: 'activity.3'})!.id).toEqual('part.activity-3-top');

    // TEST: Activate part.activity-2.
    await activity2Part.activate();
    await waitUntilStable();

    // Assert layout.
    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        'activity.2': {
          root: new MPart({id: 'part.activity-2'}),
          activePartId: 'part.activity-2',
        },
        main: {
          root: new MPart({id: 'part.main'}),
          activePartId: 'part.main',
        },
      },
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [{id: 'activity.1'}, {id: 'activity.2'}, {id: 'activity.3'}],
            activeActivityId: 'activity.2',
          },
        },
      },
    });

    // Assert active state of Part handles.
    expect(activity1Part.active()).toBeFalse();
    expect(activity2Part.active()).toBeTrue();
    expect(activity3TopPart.active()).toBeFalse();
    expect(activity3BottomPart.active()).toBeFalse();

    // Assert active state of MParts.
    expect(layout().activePart({grid: 'activity.1'})!.id).toEqual('part.activity-1');
    expect(layout().activePart({grid: 'activity.2'})!.id).toEqual('part.activity-2');
    expect(layout().activePart({grid: 'activity.3'})!.id).toEqual('part.activity-3-top');

    // TEST: Activate part.activity-3-top.
    await activity3TopPart.activate();
    await waitUntilStable();

    // Assert layout.
    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        'activity.3': {
          root: new MTreeNode({
            child1: new MPart({id: 'part.activity-3-top'}),
            child2: new MPart({id: 'part.activity-3-bottom'}),
            direction: 'column',
            ratio: .5,
          }),
          activePartId: 'part.activity-3-top',
        },
        main: {
          root: new MPart({id: 'part.main'}),
          activePartId: 'part.main',
        },
      },
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [{id: 'activity.1'}, {id: 'activity.2'}, {id: 'activity.3'}],
            activeActivityId: 'activity.3',
          },
        },
      },
    });

    // Assert active state of Part handles.
    expect(activity1Part.active()).toBeFalse();
    expect(activity2Part.active()).toBeFalse();
    expect(activity3TopPart.active()).toBeTrue();
    expect(activity3BottomPart.active()).toBeFalse();

    // Assert active state of MParts.
    expect(layout().activePart({grid: 'activity.1'})!.id).toEqual('part.activity-1');
    expect(layout().activePart({grid: 'activity.2'})!.id).toEqual('part.activity-2');
    expect(layout().activePart({grid: 'activity.3'})!.id).toEqual('part.activity-3-top');

    // TEST: Activate part.activity-3-bottom.
    await activity3BottomPart.activate();
    await waitUntilStable();

    // Assert layout.
    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        'activity.3': {
          root: new MTreeNode({
            child1: new MPart({id: 'part.activity-3-top'}),
            child2: new MPart({id: 'part.activity-3-bottom'}),
            direction: 'column',
            ratio: .5,
          }),
          activePartId: 'part.activity-3-bottom',
        },
        main: {
          root: new MPart({id: 'part.main'}),
          activePartId: 'part.main',
        },
      },
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [{id: 'activity.1'}, {id: 'activity.2'}, {id: 'activity.3'}],
            activeActivityId: 'activity.3',
          },
        },
      },
    });

    // Assert active state of Part handles.
    expect(activity1Part.active()).toBeFalse();
    expect(activity2Part.active()).toBeFalse();
    expect(activity3TopPart.active()).toBeFalse();
    expect(activity3BottomPart.active()).toBeTrue();

    // Assert active state of MParts.
    expect(layout().activePart({grid: 'activity.1'})!.id).toEqual('part.activity-1');
    expect(layout().activePart({grid: 'activity.2'})!.id).toEqual('part.activity-2');
    expect(layout().activePart({grid: 'activity.3'})!.id).toEqual('part.activity-3-bottom');

    // TEST: Activate part.activity-2.
    await activity2Part.activate();
    await waitUntilStable();

    // Assert layout.
    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        'activity.2': {
          root: new MPart({id: 'part.activity-2'}),
          activePartId: 'part.activity-2',
        },
        main: {
          root: new MPart({id: 'part.main'}),
          activePartId: 'part.main',
        },
      },
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [{id: 'activity.1'}, {id: 'activity.2'}, {id: 'activity.3'}],
            activeActivityId: 'activity.2',
          },
        },
      },
    });

    // Assert active state of Part handles.
    expect(activity1Part.active()).toBeFalse();
    expect(activity2Part.active()).toBeTrue();
    expect(activity3TopPart.active()).toBeFalse();
    expect(activity3BottomPart.active()).toBeFalse();

    // Assert active state of MParts.
    expect(layout().activePart({grid: 'activity.1'})!.id).toEqual('part.activity-1');
    expect(layout().activePart({grid: 'activity.2'})!.id).toEqual('part.activity-2');
    expect(layout().activePart({grid: 'activity.3'})!.id).toEqual('part.activity-3-bottom');

    // TEST: Activate part.activity-3-bottom.
    await activity3BottomPart.activate();
    await waitUntilStable();

    // Assert layout.
    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        'activity.3': {
          root: new MTreeNode({
            child1: new MPart({id: 'part.activity-3-top'}),
            child2: new MPart({id: 'part.activity-3-bottom'}),
            direction: 'column',
            ratio: .5,
          }),
          activePartId: 'part.activity-3-bottom',
        },
        main: {
          root: new MPart({id: 'part.main'}),
          activePartId: 'part.main',
        },
      },
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [{id: 'activity.1'}, {id: 'activity.2'}, {id: 'activity.3'}],
            activeActivityId: 'activity.3',
          },
        },
      },
    });

    // Assert active state of Part handles.
    expect(activity1Part.active()).toBeFalse();
    expect(activity2Part.active()).toBeFalse();
    expect(activity3TopPart.active()).toBeFalse();
    expect(activity3BottomPart.active()).toBeTrue();

    // Assert active state of MParts.
    expect(layout().activePart({grid: 'activity.1'})!.id).toEqual('part.activity-1');
    expect(layout().activePart({grid: 'activity.2'})!.id).toEqual('part.activity-2');
    expect(layout().activePart({grid: 'activity.3'})!.id).toEqual('part.activity-3-bottom');

    // TEST: Activate part.activity-2.
    await activity2Part.activate();
    await waitUntilStable();

    // Assert layout.
    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        'activity.2': {
          root: new MPart({id: 'part.activity-2'}),
          activePartId: 'part.activity-2',
        },
        main: {
          root: new MPart({id: 'part.main'}),
          activePartId: 'part.main',
        },
      },
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [{id: 'activity.1'}, {id: 'activity.2'}, {id: 'activity.3'}],
            activeActivityId: 'activity.2',
          },
        },
      },
    });

    // Assert active state of Part handles.
    expect(activity1Part.active()).toBeFalse();
    expect(activity2Part.active()).toBeTrue();
    expect(activity3TopPart.active()).toBeFalse();
    expect(activity3BottomPart.active()).toBeFalse();

    // Assert active state of MParts.
    expect(layout().activePart({grid: 'activity.1'})!.id).toEqual('part.activity-1');
    expect(layout().activePart({grid: 'activity.2'})!.id).toEqual('part.activity-2');
    expect(layout().activePart({grid: 'activity.3'})!.id).toEqual('part.activity-3-bottom');

    // TEST: Activate part.activity-3-top.
    await activity3TopPart.activate();
    await waitUntilStable();

    // Assert layout.
    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        'activity.3': {
          root: new MTreeNode({
            child1: new MPart({id: 'part.activity-3-top'}),
            child2: new MPart({id: 'part.activity-3-bottom'}),
            direction: 'column',
            ratio: .5,
          }),
          activePartId: 'part.activity-3-top',
        },
        main: {
          root: new MPart({id: 'part.main'}),
          activePartId: 'part.main',
        },
      },
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [{id: 'activity.1'}, {id: 'activity.2'}, {id: 'activity.3'}],
            activeActivityId: 'activity.3',
          },
        },
      },
    });

    // Assert active state of Part handles.
    expect(activity1Part.active()).toBeFalse();
    expect(activity2Part.active()).toBeFalse();
    expect(activity3TopPart.active()).toBeTrue();
    expect(activity3BottomPart.active()).toBeFalse();

    // Assert active state of MParts.
    expect(layout().activePart({grid: 'activity.1'})!.id).toEqual('part.activity-1');
    expect(layout().activePart({grid: 'activity.2'})!.id).toEqual('part.activity-2');
    expect(layout().activePart({grid: 'activity.3'})!.id).toEqual('part.activity-3-top');
  });

  /**
   * Verifies that part properties are set after destroying the current component but before constructing the new component.
   *
   * This test navigates a part to the following routes. Properties are associated with the routes and navigation.
   *
   * Routes:
   * - /part-1
   * - /part-2
   * - /part/3
   * - /part/4
   * - /path/to/module-a/part-5
   * - /path/to/module-b/part/6
   * - /path/to/module-b/part/7
   */
  it('should set part and navigation properties after destroying the current component (if any) but before constructing new component', async () => {
    @Directive()
    abstract class AbstractSpecPartComponent implements OnDestroy {

      private _part = inject(ɵWorkbenchPart);

      public navigationReadInConstructor: WorkbenchPartNavigation | undefined;
      public navigationReadInDestroy: WorkbenchPartNavigation | undefined;

      public navigationCssClassReadInConstructor: string[];
      public navigationCssClassReadInDestroy: string[] | undefined;

      constructor() {
        // Navigation
        this.navigationReadInConstructor = this._part.navigation();
        // Navigation CSS Class
        this.navigationCssClassReadInConstructor = this._part.classList.navigation();
      }

      public ngOnDestroy(): void {
        // Navigation
        this.navigationReadInDestroy = this._part.navigation();

        // Navigation CSS Class
        this.navigationCssClassReadInDestroy = this._part.classList.navigation();
      }
    }

    @Component({selector: 'spec-part-1', template: 'Part 1'})
    class SpecPart1Component extends AbstractSpecPartComponent {
    }

    @Component({selector: 'spec-part-2', template: 'Part 2'})
    class SpecPart2Component extends AbstractSpecPartComponent {
    }

    @Component({selector: 'spec-part-3', template: 'Part 3'})
    class SpecPart3Component extends AbstractSpecPartComponent {
    }

    @Component({selector: 'spec-part-4', template: 'Part 4'})
    class SpecPart4Component extends AbstractSpecPartComponent {
    }

    @Component({selector: 'spec-part-5', template: 'Part 5'})
    class SpecPart5Component extends AbstractSpecPartComponent {
    }

    @Component({selector: 'spec-part-6', template: 'Part 6'})
    class SpecPart6Component extends AbstractSpecPartComponent {
    }

    @Component({selector: 'spec-part-7', template: 'Part 7'})
    class SpecPart7Component extends AbstractSpecPartComponent {
    }

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {
            path: 'part-1',
            loadComponent: () => SpecPart1Component,
          },
          {
            path: 'part-2',
            loadComponent: () => SpecPart2Component,
          },
          {
            path: 'part/3',
            loadComponent: () => SpecPart3Component,
          },
          {
            path: 'part/4',
            loadComponent: () => SpecPart4Component,
          },
          {
            path: 'path/to/module-a',
            loadChildren: () => [
              {
                path: 'part-5',
                loadComponent: () => SpecPart5Component,
              },
            ],
          },
          {
            path: 'path/to/module-b',
            loadChildren: () => [
              {
                path: 'part/6',
                loadComponent: () => SpecPart6Component,
              },
              {
                path: 'part/7',
                loadComponent: () => SpecPart7Component,
              },
            ],
          },
        ]),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchComponent));
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await waitUntilWorkbenchStarted();

    // Add part.
    await workbenchRouter.navigate(layout => layout.addPart('part.testee', {align: 'left'}));

    // Navigate to 'part-1'.
    await workbenchRouter.navigate(layout => layout.navigatePart('part.testee', ['part-1'], {data: {data: 'part-1'}, state: {state: 'part-1'}, hint: 'part-1', cssClass: 'part-1'}));
    await waitUntilStable();
    // Expect properties to be set in constructor.
    const componentInstancePart1 = TestBed.inject(WORKBENCH_PART_REGISTRY).get('part.testee').getComponent<SpecPart1Component>()!;
    expect(componentInstancePart1).toBeInstanceOf(SpecPart1Component);
    expect(componentInstancePart1.navigationReadInConstructor).toEqual(jasmine.objectContaining({data: {data: 'part-1'}, state: {state: 'part-1'}, hint: 'part-1'}));
    expect(componentInstancePart1.navigationCssClassReadInConstructor).toEqual(['part-1']);

    // Navigate to 'part-2'.
    await workbenchRouter.navigate(layout => layout.navigatePart('part.testee', ['part-2'], {data: {data: 'part-2'}, state: {state: 'part-2'}, hint: 'part-2', cssClass: 'part-2'}));
    await waitUntilStable();
    // Expect properties to be set in constructor.
    const componentInstancePart2 = TestBed.inject(WORKBENCH_PART_REGISTRY).get('part.testee').getComponent<SpecPart2Component>()!;
    expect(componentInstancePart2).toBeInstanceOf(SpecPart2Component);
    expect(componentInstancePart2.navigationReadInConstructor).toEqual(jasmine.objectContaining({data: {data: 'part-2'}, state: {state: 'part-2'}, hint: 'part-2'}));
    expect(componentInstancePart2.navigationCssClassReadInConstructor).toEqual(['part-2']);
    // Expect properties not to be changed until destroyed previous component.
    expect(componentInstancePart1.navigationReadInDestroy).toEqual(jasmine.objectContaining({data: {data: 'part-1'}, state: {state: 'part-1'}, hint: 'part-1'}));
    expect(componentInstancePart1.navigationCssClassReadInDestroy).toEqual(['part-1']);

    // Navigate to 'part/3'.
    await workbenchRouter.navigate(layout => layout.navigatePart('part.testee', ['part/3'], {data: {data: 'part-3'}, state: {state: 'part-3'}, hint: 'part-3', cssClass: 'part-3'}));
    await waitUntilStable();
    // Expect properties to be set in constructor.
    const componentInstancePart3 = TestBed.inject(WORKBENCH_PART_REGISTRY).get('part.testee').getComponent<SpecPart3Component>()!;
    expect(componentInstancePart3).toBeInstanceOf(SpecPart3Component);
    expect(componentInstancePart3.navigationReadInConstructor).toEqual(jasmine.objectContaining({data: {data: 'part-3'}, state: {state: 'part-3'}, hint: 'part-3'}));
    expect(componentInstancePart3.navigationCssClassReadInConstructor).toEqual(['part-3']);
    // Expect properties not to be changed until destroyed previous component.
    expect(componentInstancePart2.navigationReadInDestroy).toEqual(jasmine.objectContaining({data: {data: 'part-2'}, state: {state: 'part-2'}, hint: 'part-2'}));
    expect(componentInstancePart2.navigationCssClassReadInDestroy).toEqual(['part-2']);

    // Navigate to 'part/4'.
    await workbenchRouter.navigate(layout => layout.navigatePart('part.testee', ['part/4'], {data: {data: 'part-4'}, state: {state: 'part-4'}, hint: 'part-4', cssClass: 'part-4'}));
    await waitUntilStable();
    // Expect properties to be set in constructor.
    const componentInstancePart4 = TestBed.inject(WORKBENCH_PART_REGISTRY).get('part.testee').getComponent<SpecPart4Component>()!;
    expect(componentInstancePart4).toBeInstanceOf(SpecPart4Component);
    expect(componentInstancePart4.navigationReadInConstructor).toEqual(jasmine.objectContaining({data: {data: 'part-4'}, state: {state: 'part-4'}, hint: 'part-4'}));
    expect(componentInstancePart4.navigationCssClassReadInConstructor).toEqual(['part-4']);
    // Expect properties not to be changed until destroyed previous component.
    expect(componentInstancePart3.navigationReadInDestroy).toEqual(jasmine.objectContaining({data: {data: 'part-3'}, state: {state: 'part-3'}, hint: 'part-3'}));
    expect(componentInstancePart3.navigationCssClassReadInDestroy).toEqual(['part-3']);

    // Navigate to 'path/to/module-a/part-5'.
    await workbenchRouter.navigate(layout => layout.navigatePart('part.testee', ['path/to/module-a/part-5'], {data: {data: 'part-5'}, state: {state: 'part-5'}, hint: 'part-5', cssClass: 'part-5'}));
    await waitUntilStable();
    // Expect properties to be set in constructor.
    const componentInstancePart5 = TestBed.inject(WORKBENCH_PART_REGISTRY).get('part.testee').getComponent<SpecPart5Component>()!;
    expect(componentInstancePart5).toBeInstanceOf(SpecPart5Component);
    expect(componentInstancePart5.navigationReadInConstructor).toEqual(jasmine.objectContaining({data: {data: 'part-5'}, state: {state: 'part-5'}, hint: 'part-5'}));
    expect(componentInstancePart5.navigationCssClassReadInConstructor).toEqual(['part-5']);
    // Expect properties not to be changed until destroyed previous component.
    expect(componentInstancePart4.navigationReadInDestroy).toEqual(jasmine.objectContaining({data: {data: 'part-4'}, state: {state: 'part-4'}, hint: 'part-4'}));
    expect(componentInstancePart4.navigationCssClassReadInDestroy).toEqual(['part-4']);

    // Navigate to 'path/to/module-b/part/6'.
    await workbenchRouter.navigate(layout => layout.navigatePart('part.testee', ['path/to/module-b/part/6'], {data: {data: 'part-6'}, state: {state: 'part-6'}, hint: 'part-6', cssClass: 'part-6'}));
    await waitUntilStable();
    // Expect properties to be set in constructor.
    const componentInstancePart6 = TestBed.inject(WORKBENCH_PART_REGISTRY).get('part.testee').getComponent<SpecPart6Component>()!;
    expect(componentInstancePart6).toBeInstanceOf(SpecPart6Component);
    expect(componentInstancePart6.navigationReadInConstructor).toEqual(jasmine.objectContaining({data: {data: 'part-6'}, state: {state: 'part-6'}, hint: 'part-6'}));
    expect(componentInstancePart6.navigationCssClassReadInConstructor).toEqual(['part-6']);
    // Expect properties not to be changed until destroyed previous component.
    expect(componentInstancePart5.navigationReadInDestroy).toEqual(jasmine.objectContaining({data: {data: 'part-5'}, state: {state: 'part-5'}, hint: 'part-5'}));
    expect(componentInstancePart5.navigationCssClassReadInDestroy).toEqual(['part-5']);

    // Navigate to 'path/to/module-b/part/7'.
    await workbenchRouter.navigate(layout => layout.navigatePart('part.testee', ['path/to/module-b/part/7'], {data: {data: 'part-7'}, state: {state: 'part-7'}, hint: 'part-7', cssClass: 'part-7'}));
    await waitUntilStable();
    // Expect properties to be set in constructor.
    const componentInstancePart7 = TestBed.inject(WORKBENCH_PART_REGISTRY).get('part.testee').getComponent<SpecPart7Component>()!;
    expect(componentInstancePart7).toBeInstanceOf(SpecPart7Component);
    expect(componentInstancePart7.navigationReadInConstructor).toEqual(jasmine.objectContaining({data: {data: 'part-7'}, state: {state: 'part-7'}, hint: 'part-7'}));
    expect(componentInstancePart7.navigationCssClassReadInConstructor).toEqual(['part-7']);
    // Expect properties not to be changed until destroyed previous component.
    expect(componentInstancePart6.navigationReadInDestroy).toEqual(jasmine.objectContaining({data: {data: 'part-6'}, state: {state: 'part-6'}, hint: 'part-6'}));
    expect(componentInstancePart6.navigationCssClassReadInDestroy).toEqual(['part-6']);

    // Remove part.
    await workbenchRouter.navigate(layout => layout.removePart('part.testee'));
    await waitUntilStable();
    // Expect properties not to be changed until destroyed previous component.
    expect(componentInstancePart7.navigationReadInDestroy).toEqual(jasmine.objectContaining({data: {data: 'part-7'}, state: {state: 'part-7'}, hint: 'part-7'}));
    expect(componentInstancePart7.navigationCssClassReadInDestroy).toEqual(['part-7']);
  });

  it('should set part title', async () => {
    const texts = {
      'title-1': 'TITLE-1',
      'title-2': 'TITLE-2',
      'title-3': 'TITLE-3',
    };

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => {
            return factory
              .addPart('part.left', {title: '%title-1'})
              .addPart('part.right', {align: 'right'}, {title: 'title-2'})
              .navigatePart('part.left', ['test-part'])
              .navigatePart('part.right', ['test-part']);
          },
          textProvider: key => signal(texts[key as keyof typeof texts]),
        }),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Expect title to be set.
    expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.left"] > wb-part-bar > span.e2e-title')).nativeElement.innerText).toEqual('TITLE-1');
    expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.right"] > wb-part-bar > span.e2e-title')).nativeElement.innerText).toEqual('title-2');

    // Set title via handle.
    TestBed.inject(WorkbenchService).getPart('part.left')!.title = 'title-3';
    await waitUntilStable();
    expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.left"] > wb-part-bar > span.e2e-title')).nativeElement.innerText).toEqual('title-3');

    // Set translatable title via handle.
    TestBed.inject(WorkbenchService).getPart('part.left')!.title = '%title-3';
    await waitUntilStable();
    expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.left"] > wb-part-bar > span.e2e-title')).nativeElement.innerText).toEqual('TITLE-3');
  });

  it('should indicate whether part is in main area or not', async () => {
    TestBed.configureTestingModule({providers: [provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial'})]});
    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Create initial workbench layout.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout
      .addPart('part.inMainArea', {relativeTo: 'part.initial', align: 'left'})
      .addPart('part.notInMainArea', {align: 'left'}),
    );
    await waitUntilStable();

    // Expect part to be in main area.
    expect(TestBed.inject(WORKBENCH_PART_REGISTRY).get('part.inMainArea').isInMainArea).toBeTrue();

    // Expect part not to be in main area.
    expect(TestBed.inject(WORKBENCH_PART_REGISTRY).get('part.notInMainArea').isInMainArea).toBeFalse();
  });

  describe('Part Bar', () => {

    it('should show part bar if part has title', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            layout: factory => factory
              .addPart('part.testee', {title: 'Title'})
              .navigatePart('part.testee', ['test-part']),
          }),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Expect part bar to show.
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.testee"] > wb-part-bar'))).not.toBeNull();
    });

    it('should show activity title only in top-leftmost part in activity', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            layout: factory => factory
              .addPart(MAIN_AREA)
              .addPart('part.activity-top', {dockTo: 'left-top'}, {title: 'ACTIVITY', label: 'Activity', icon: 'folder'})
              .addPart('part.activity-bottom', {relativeTo: 'part.activity-top', align: 'bottom'})
              .navigatePart('part.activity-top', ['test-part'])
              .navigatePart('part.activity-bottom', ['test-part'])
              .activatePart('part.activity-top'),
          }),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Expect part bar of 'part.activity-top' to show with title.
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.activity-top"] > wb-part-bar > span.e2e-title')).nativeElement.innerText).toEqual('ACTIVITY');
      // Expect part bar of 'part.activity-bottom' not to show.
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.activity-bottom"] > wb-part-bar'))).toBeNull();
    });

    it('should show part bar if part has views', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            layout: factory => factory
              .addPart('part.testee')
              .addView('view.100', {partId: 'part.testee'}),
          }),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Expect part bar to show.
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.testee"] > wb-part-bar'))).not.toBeNull();
    });

    it('should show part bar if part has actions', async () => {
      @Component({
        selector: 'spec-action',
        template: 'spec-action',
      })
      class SpecActionComponent {
      }

      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            layout: factory => factory
              .addPart('part.testee')
              .navigatePart('part.testee', ['test-part']),
          }),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Register part action.
      TestBed.inject(WorkbenchService).registerPartAction(() => SpecActionComponent);
      await waitUntilStable();

      // Expect part bar to show.
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.testee"] > wb-part-bar'))).not.toBeNull();
    });

    it('should show part bar of activity\'s top-rightmost part even if not showing the activity title (to display minimize button)', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            layout: factory => factory
              .addPart(MAIN_AREA)
              .addPart('part.testee', {dockTo: 'left-top'}, {title: false, label: 'Activity', icon: 'folder'})
              .navigatePart('part.testee', ['test-part'])
              .activatePart('part.testee'),
          }),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Expect part bar to show.
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.testee"] > wb-part-bar'))).not.toBeNull();
    });

    it('should not show part bar if part has no title, no views, no actions and not in activity', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            layout: factory => factory
              .addPart('part.testee')
              .navigatePart('part.testee', ['test-part']),
          }),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Expect part bar not to show.
      expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.testee"] > wb-part-bar'))).toBeNull();
    });
  });

  describe('Scroll Position', () => {

    it('should retain part scroll position when switching activities', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            layout: factory => factory
              .addPart(MAIN_AREA)
              .addPart('part.activity-1', {dockTo: 'left-top'}, {label: 'Activity 1', icon: 'folder', ɵactivityId: 'activity.1'})
              .addPart('part.activity-2', {dockTo: 'left-top'}, {label: 'Activity 2', icon: 'folder', ɵactivityId: 'activity.2'})
              .navigatePart('part.activity-1', ['path/to/part'])
              .navigatePart('part.activity-2', ['path/to/part'])
              .activatePart('part.activity-1'),
          }),
          provideRouter([
            {path: 'path/to/part', loadComponent: () => TestPartComponent},
          ]),
        ],
      });

      @Component({
        selector: 'spec-part',
        template: '<div style="height: 2000px">Content</div>',
      })
      class TestPartComponent {
        public viewport = inject(SciViewportComponent);
      }

      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      // Assert activity layout.
      expect(fixture).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [{id: 'activity.1'}, {id: 'activity.2'}],
              activeActivityId: 'activity.1',
            },
          },
        },
        grids: {
          'activity.1': {
            root: new MPart({id: 'part.activity-1'}),
            activePartId: 'part.activity-1',
          },
        },
      });

      const part1 = TestBed.inject(ɵWorkbenchService).getPart('part.activity-1')!;
      const part2 = TestBed.inject(ɵWorkbenchService).getPart('part.activity-2')!;
      const viewportPart1 = part1.getComponent<TestPartComponent>()!.viewport;

      // Scroll part 1 to the bottom.
      viewportPart1.scrollTop = 2000;
      const scrollTop = viewportPart1.scrollTop;

      // Expect content to be scrolled.
      expect(scrollTop).toBeGreaterThan(0);

      // Activate activity 2.
      await part2.activate();
      await waitUntilStable();

      // Assert activity layout.
      expect(fixture).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [{id: 'activity.1'}, {id: 'activity.2'}],
              activeActivityId: 'activity.2',
            },
          },
        },
        grids: {
          'activity.2': {
            root: new MPart({id: 'part.activity-2'}),
            activePartId: 'part.activity-2',
          },
        },
      });

      // Activate activity 1.
      await part1.activate();
      await waitUntilStable();

      // Assert activity layout.
      expect(fixture).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [{id: 'activity.1'}, {id: 'activity.2'}],
              activeActivityId: 'activity.1',
            },
          },
        },
        grids: {
          'activity.1': {
            root: new MPart({id: 'part.activity-1'}),
            activePartId: 'part.activity-1',
          },
        },
      });

      // Expect scroll position to be restored.
      expect(viewportPart1.scrollTop).toBe(scrollTop);
    });

    it('should retain part scroll position when changing the layout', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            layout: factory => factory
              .addPart('part.right')
              .navigatePart('part.right', ['path/to/part']),
          }),
          provideRouter([
            {path: 'path/to/part', loadComponent: () => TestPartComponent},
          ]),
        ],
      });

      @Component({
        selector: 'spec-part',
        template: '<div style="height: 2000px">Content</div>',
      })
      class TestPartComponent {
        public viewport = inject(SciViewportComponent);
      }

      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();

      const partRight = TestBed.inject(ɵWorkbenchService).getPart('part.right')!;
      const viewportPartRight = partRight.getComponent<TestPartComponent>()!.viewport;

      // Scroll part to the bottom.
      viewportPartRight.scrollTop = 2000;
      const scrollTop = viewportPartRight.scrollTop;

      // Expect content to be scrolled.
      expect(scrollTop).toBeGreaterThan(0);

      // Change layout by adding a part to the left.
      await TestBed.inject(WorkbenchRouter).navigate(layout => layout
        .addPart('part.left', {align: 'left'})
        .navigatePart('part.left', ['path/to/part']),
      );
      await waitUntilStable();

      // Assert layout.
      expect(fixture).toEqualWorkbenchLayout({
        grids: {
          main: {
            root: new MTreeNode({
              child1: new MPart({id: 'part.left'}),
              child2: new MPart({id: 'part.right'}),
              direction: 'row',
              ratio: .5,
            }),
            activePartId: 'part.right',
          },
        },
      });

      // Expect scroll position to be restored.
      expect(viewportPartRight.scrollTop).toBe(scrollTop);
    });
  });
});
