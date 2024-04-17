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
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {toEqualWorkbenchLayoutCustomMatcher} from '../testing/jasmine/matcher/to-equal-workbench-layout.matcher';
import {TestComponent} from '../testing/test.component';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {MAIN_AREA, WorkbenchLayout} from '../layout/workbench-layout';
import {styleFixture, waitForInitialWorkbenchLayout, waitUntilStable} from '../testing/testing.util';
import {WorkbenchTestingModule} from '../testing/workbench-testing.module';
import {RouterTestingModule} from '@angular/router/testing';
import {WorkbenchLayoutComponent} from '../layout/workbench-layout.component';
import {MPart, MTreeNode} from '../layout/workbench-layout.model';
import {WorkbenchService} from '../workbench.service';
import {ɵWorkbenchLayoutFactory} from '../layout/ɵworkbench-layout.factory';
import {WorkbenchPerspectiveStorageService} from './workbench-perspective-storage.service';

describe('WorkbenchPerspectiveStorage', () => {

  beforeEach(() => {
    jasmine.addMatchers(toEqualWorkbenchLayoutCustomMatcher);
  });

  it('should write the layout to storage on every layout change', async () => {
    // GIVEN: Single perspective with two parts
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({
          layout: {
            perspectives: [
              {
                id: 'perspective',
                layout: factory => factory
                  .addPart(MAIN_AREA)
                  .addPart('left-top', {align: 'left'})
                  .addPart('left-bottom', {relativeTo: 'left-top', align: 'bottom'}),
              },
            ],
          },
          startup: {launcher: 'APP_INITIALIZER'},
        }),
        RouterTestingModule.withRoutes([
          {path: 'view', component: TestComponent},
        ]),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // WHEN: Opening view.1 in part 'left-top'
    await TestBed.inject(WorkbenchRouter).navigate(['view'], {blankPartId: 'left-top', target: 'view.1'});
    await waitUntilStable();

    // THEN: Expect the layout to be stored.
    expect(await loadPerspectiveLayoutFromStorage('perspective')).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MTreeNode({
            child1: new MPart({id: 'left-top', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MPart({id: 'left-bottom', views: []}),
          }),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
    });

    // WHEN: Opening view.2 in part 'left-bottom'
    await TestBed.inject(WorkbenchRouter).navigate(['view'], {blankPartId: 'left-bottom', target: 'view.2'});
    await waitUntilStable();

    // THEN: Expect the layout to be stored.
    expect(await loadPerspectiveLayoutFromStorage('perspective')).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MTreeNode({
            child1: new MPart({id: 'left-top', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MPart({id: 'left-bottom', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          }),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
    });
  });

  it('should load the layout from storage when activating the perspective', async () => {
    // GIVEN: Two perspectives with a part
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({
          layout: {
            perspectives: [
              {
                id: 'perspective-1',
                layout: factory => factory.addPart(MAIN_AREA).addPart('left', {align: 'left'}),
              },
              {
                id: 'perspective-2',
                layout: factory => factory.addPart(MAIN_AREA).addPart('right', {align: 'right'}),
              },
            ],
            initialPerspective: 'perspective-1',
          },
          startup: {launcher: 'APP_INITIALIZER'},
        }),
        RouterTestingModule.withRoutes([
          {path: 'view', component: TestComponent},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Open view.1 in perspective-1.
    await TestBed.inject(WorkbenchRouter).navigate(['view'], {blankPartId: 'left', target: 'view.1'});
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'left', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
    });

    // Memoize current layout.
    const layout = localStorage.getItem('scion.workbench.perspectives.perspective-1')!;

    // Open view.2 in perspective-1.
    await TestBed.inject(WorkbenchRouter).navigate(['view'], {blankPartId: 'left', target: 'view.2'});
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'left', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
    });

    // Switch to perspective-2.
    await TestBed.inject(WorkbenchService).switchPerspective('perspective-2');
    await waitUntilStable();

    // Simulate the storage to change.
    localStorage.setItem('scion.workbench.perspectives.perspective-1', layout);

    // WHEN: Switching to perspective-1
    await TestBed.inject(WorkbenchService).switchPerspective('perspective-1');
    await waitUntilStable();

    // THEN: Expect the perspective to have the stored layout.
    expect(fixture).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'left', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
    });
  });

  it('should only write the layout of the active perspective to storage', async () => {
    // GIVEN: Two perspectives with a part
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({
          layout: {
            perspectives: [
              {
                id: 'perspective-1',
                layout: factory => factory.addPart(MAIN_AREA).addPart('left', {align: 'left'}),
              },
              {
                id: 'perspective-2',
                layout: factory => factory.addPart(MAIN_AREA).addPart('left', {align: 'left'}),
              },
            ],
            initialPerspective: 'perspective-1',
          },
          startup: {launcher: 'APP_INITIALIZER'},
        }),
        RouterTestingModule.withRoutes([
          {path: 'path/to/view', component: TestComponent},
        ]),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // WHEN: Opening view.1 in perspective-1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {blankPartId: 'left', target: 'view.1'});
    await waitUntilStable();

    // THEN: Expect the layout of perspective-1 to be stored.
    expect(await loadPerspectiveLayoutFromStorage('perspective-1')).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'left', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
    });
    // THEN: Expect the layout of perspective-2 not to be stored.
    expect(await loadPerspectiveLayoutFromStorage('perspective-2')).toBeNull();

    // Switch to perspective-2.
    await TestBed.inject(WorkbenchService).switchPerspective('perspective-2');
    await waitUntilStable();

    // Clear storage.
    localStorage.clear();

    // WHEN: Opening view.1 in perspective-2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {blankPartId: 'left', target: 'view.1'});
    await waitUntilStable();

    // THEN: Expect the layout of perspective-2 to be stored.
    expect(await loadPerspectiveLayoutFromStorage('perspective-2')).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'left', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
    });
    // THEN: Expect the layout of perspective-1 not to be stored.
    expect(await loadPerspectiveLayoutFromStorage('perspective-1')).toBeNull();
  });
});

async function loadPerspectiveLayoutFromStorage(perspectiveId: string): Promise<WorkbenchLayout | null> {
  const perspectiveLayout = await TestBed.inject(WorkbenchPerspectiveStorageService).loadPerspectiveLayout(perspectiveId);
  if (!perspectiveLayout) {
    return null;
  }

  return TestBed.inject(ɵWorkbenchLayoutFactory).create({
    workbenchGrid: perspectiveLayout.userLayout.workbenchGrid,
    viewOutlets: perspectiveLayout.userLayout.viewOutlets,
  });
}
