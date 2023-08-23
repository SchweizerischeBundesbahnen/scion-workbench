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
import {By} from '@angular/platform-browser';
import {TestComponent, withComponentContent} from '../testing/test.component';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {WorkbenchService} from '../workbench.service';
import {MAIN_AREA_PART_ID} from '../layout/workbench-layout';
import {styleFixture, waitForInitialWorkbenchLayout, waitUntilStable} from '../testing/testing.util';
import {WorkbenchTestingModule} from '../testing/workbench-testing.module';
import {RouterTestingModule} from '@angular/router/testing';
import {WorkbenchLayoutComponent} from '../layout/workbench-layout.component';
import {MPart, MTreeNode} from '../layout/workbench-layout.model';

describe('WorkbenchPerspectiveViewConflictResolver', () => {

  beforeEach(() => {
    jasmine.addMatchers(toEqualWorkbenchLayoutCustomMatcher);
  });

  it('should resolve view conflicts when switching perspective', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({
          layout: {
            perspectives: [
              {id: 'perspective-1', layout: layout => layout.addPart('left', {align: 'left'})},
              {id: 'perspective-2', layout: layout => layout},
            ],
            initialPerspective: 'perspective-1',
          },
          startup: {launcher: 'APP_INITIALIZER'},
        }),
        RouterTestingModule.withRoutes([
          {path: 'view-1', component: TestComponent, providers: [withComponentContent('a')]},
          {path: 'view-2', component: TestComponent, providers: [withComponentContent('b')]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Open view.1 in perspective-1
    await TestBed.inject(WorkbenchRouter).navigate(['view-1'], {blankPartId: 'left', target: 'view.1'});
    await waitUntilStable();

    // Switch to perspective-2
    await TestBed.inject(WorkbenchService).switchPerspective('perspective-2');
    await waitUntilStable();

    // Open view.1 in main area
    await TestBed.inject(WorkbenchRouter).navigate(['view-2'], {target: 'view.1'});
    await waitUntilStable();

    // Switch back to perspective-1
    await TestBed.inject(WorkbenchService).switchPerspective('perspective-1');
    await waitUntilStable();

    // Expect view.1 in perspective-1 to be renamed to view.2
    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
      peripheralGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'left', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          child2: new MPart({id: MAIN_AREA_PART_ID}),
        }),
      },
    });

    // Expect view in main area to have TestComponent mounted with content 'b'
    expect(fixture.debugElement.query(By.css('wb-part[data-partid="main"] wb-view[data-viewid="view.1"] spec-test-component')).nativeElement.innerText).toEqual('b');

    // Expect view in peripheral grid to have TestComponent mounted with content 'a'
    expect(fixture.debugElement.query(By.css('wb-part[data-partid="left"] wb-view[data-viewid="view.2"] spec-test-component')).nativeElement.innerText).toEqual('a');
  });
});

