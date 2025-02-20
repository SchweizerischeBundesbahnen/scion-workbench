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
import {styleFixture, waitForInitialWorkbenchLayout, waitUntilStable} from '../testing/testing.util';
import {WorkbenchComponent} from '../workbench.component';
import {WORKBENCH_VIEW_REGISTRY} from '../view/workbench-view.registry';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {WORKBENCH_PART_REGISTRY} from './workbench-part.registry';
import {provideRouter} from '@angular/router';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {Component, DestroyRef, Directive, inject, OnDestroy} from '@angular/core';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {ɵWorkbenchPart} from './ɵworkbench-part.model';
import {WorkbenchPartNavigation} from './workbench-part.model';

describe('WorkbenchPart', () => {

  it('should destroy handle\'s injector when removing the part', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

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
    await waitForInitialWorkbenchLayout();

    // Expect part 'left-top' to be active.
    expect(TestBed.inject(WORKBENCH_PART_REGISTRY).get('part.left-top').active()).toBeTrue();
    expect(TestBed.inject(WORKBENCH_PART_REGISTRY).get('part.left-bottom').active()).toBeFalse();

    // WHEN activating already active view
    await TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.102').activate();

    // THEN expect part to be activated.
    expect(TestBed.inject(WORKBENCH_PART_REGISTRY).get('part.left-top').active()).toBeFalse();
    expect(TestBed.inject(WORKBENCH_PART_REGISTRY).get('part.left-bottom').active()).toBeTrue();
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
    await waitForInitialWorkbenchLayout();

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
});
