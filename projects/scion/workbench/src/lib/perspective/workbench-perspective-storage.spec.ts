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
import {MAIN_AREA_PART_ID, WorkbenchLayout} from '../layout/workbench-layout';
import {styleFixture, waitForInitialWorkbenchLayout, waitForWorkbenchLayoutChange} from '../testing/testing.util';
import {WorkbenchTestingModule} from '../testing/workbench-testing.module';
import {RouterTestingModule} from '@angular/router/testing';
import {WorkbenchLayoutComponent} from '../layout/workbench-layout.component';
import {MPart, MTreeNode} from '../layout/workbench-layout.model';
import {WorkbenchLayoutFactory} from '../layout/workbench-layout-factory.service';
import {WorkbenchService} from '../workbench.service';

import {PerspectiveData} from './workbench-perspective-storage.service';

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
                layout: layout => layout
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
    await waitForWorkbenchLayoutChange();

    // THEN: Expect the layout to be stored.
    expect(deserializePerspectiveData(localStorage.getItem('scion.workbench.perspectives.perspective'))).toEqualWorkbenchLayout({
      peripheralGrid: {
        root: new MTreeNode({
          child1: new MTreeNode({
            child1: new MPart({id: 'left-top', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MPart({id: 'left-bottom', views: []}),
          }),
          child2: new MPart({id: MAIN_AREA_PART_ID}),
        }),
      },
    });

    // WHEN: Opening view.2 in part 'left-bottom'
    await TestBed.inject(WorkbenchRouter).navigate(['view'], {blankPartId: 'left-bottom', target: 'view.2'});
    await waitForWorkbenchLayoutChange();

    // THEN: Expect the layout to be stored.
    expect(deserializePerspectiveData(localStorage.getItem('scion.workbench.perspectives.perspective'))).toEqualWorkbenchLayout({
      peripheralGrid: {
        root: new MTreeNode({
          child1: new MTreeNode({
            child1: new MPart({id: 'left-top', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MPart({id: 'left-bottom', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          }),
          child2: new MPart({id: MAIN_AREA_PART_ID}),
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
                layout: layout => layout.addPart('left', {align: 'left'}),
              },
              {
                id: 'perspective-2',
                layout: layout => layout.addPart('right', {align: 'right'}),
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
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      peripheralGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'left', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: MAIN_AREA_PART_ID}),
        }),
      },
    });

    // Memoize current layout.
    const layout = localStorage.getItem('scion.workbench.perspectives.perspective-1')!;

    // Open view.2 in perspective-1.
    await TestBed.inject(WorkbenchRouter).navigate(['view'], {blankPartId: 'left', target: 'view.2'});
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      peripheralGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'left', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
          child2: new MPart({id: MAIN_AREA_PART_ID}),
        }),
      },
    });

    // Switch to perspective-2.
    await TestBed.inject(WorkbenchService).switchPerspective('perspective-2');
    await waitForWorkbenchLayoutChange();

    // Simulate the storage to change.
    localStorage.setItem('scion.workbench.perspectives.perspective-1', layout);

    // WHEN: Switching to perspective-1
    await TestBed.inject(WorkbenchService).switchPerspective('perspective-1');
    await waitForWorkbenchLayoutChange();

    // THEN: Expect the perspective to have the stored layout.
    expect(fixture).toEqualWorkbenchLayout({
      peripheralGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'left', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: MAIN_AREA_PART_ID}),
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
                layout: layout => layout.addPart('left', {align: 'left'}),
              },
              {
                id: 'perspective-2',
                layout: layout => layout.addPart('left', {align: 'left'}),
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
    styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // WHEN: Opening view.1 in perspective-1
    await TestBed.inject(WorkbenchRouter).navigate(['view'], {blankPartId: 'left', target: 'view.1'});
    await waitForWorkbenchLayoutChange();

    // THEN: Expect the layout of perspective-1 to be stored.
    expect(deserializePerspectiveData(localStorage.getItem('scion.workbench.perspectives.perspective-1'))).toEqualWorkbenchLayout({
      peripheralGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'left', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: MAIN_AREA_PART_ID}),
        }),
      },
    });
    // THEN: Expect the layout of perspective-2 not to be stored.
    expect(deserializePerspectiveData(localStorage.getItem('scion.workbench.perspectives.perspective-2'))).toBeNull();

    // Switch to perspective-2.
    await TestBed.inject(WorkbenchService).switchPerspective('perspective-2');
    await waitForWorkbenchLayoutChange();

    // Clear storage.
    localStorage.clear();

    // WHEN: Opening view.1 in perspective-2
    await TestBed.inject(WorkbenchRouter).navigate(['view'], {blankPartId: 'left', target: 'view.1'});
    await waitForWorkbenchLayoutChange();

    // THEN: Expect the layout of perspective-2 to be stored.
    expect(deserializePerspectiveData(localStorage.getItem('scion.workbench.perspectives.perspective-2'))).toEqualWorkbenchLayout({
      peripheralGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'left', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: MAIN_AREA_PART_ID}),
        }),
      },
    });
    // THEN: Expect the layout of perspective-1 not to be stored.
    expect(deserializePerspectiveData(localStorage.getItem('scion.workbench.perspectives.perspective-1'))).toBeNull();
  });
});

/**
 * Deserializes given perspective data.
 */
function deserializePerspectiveData(serializedPerspectiveData: string | null): WorkbenchLayout | null {
  if (!serializedPerspectiveData) {
    return null;
  }
  const perspectiveData: PerspectiveData = JSON.parse(window.atob(serializedPerspectiveData));
  return TestBed.inject(WorkbenchLayoutFactory).create({peripheralGrid: perspectiveData.grid});
}
