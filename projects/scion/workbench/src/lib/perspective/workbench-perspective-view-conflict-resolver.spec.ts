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
import {MPart, MTreeNode, toEqualWorkbenchLayoutCustomMatcher} from '../testing/jasmine/matcher/to-equal-workbench-layout.matcher';
import {By} from '@angular/platform-browser';
import {TestComponent, withComponentContent} from '../testing/test.component';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {WorkbenchService} from '../workbench.service';
import {MAIN_AREA} from '../layout/workbench-layout';
import {styleFixture, waitForInitialWorkbenchLayout, waitUntilStable} from '../testing/testing.util';
import {WorkbenchLayoutComponent} from '../layout/workbench-layout.component';
import {provideRouter} from '@angular/router';
import {provideWorkbenchForTest} from '../testing/workbench.provider';

describe('WorkbenchPerspectiveViewConflictResolver', () => {

  beforeEach(() => {
    jasmine.addMatchers(toEqualWorkbenchLayoutCustomMatcher);
  });

  it('should resolve view conflicts when switching perspective', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          mainAreaInitialPartId: 'part.initial',
          layout: {
            perspectives: [
              {id: 'perspective-1', layout: factory => factory.addPart(MAIN_AREA).addPart('part.left', {align: 'left'})},
              {id: 'perspective-2', layout: factory => factory.addPart(MAIN_AREA)},
            ],
            initialPerspective: 'perspective-1',
          },
          startup: {launcher: 'APP_INITIALIZER'},
        }),
        provideRouter([
          {path: 'view-1', component: TestComponent, providers: [withComponentContent('a')]},
          {path: 'view-2', component: TestComponent, providers: [withComponentContent('b')]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Open view.1 in perspective-1
    await TestBed.inject(WorkbenchRouter).navigate(['view-1'], {partId: 'part.left', target: 'view.1'});
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
      mainAreaGrid: {
        root: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'part.left', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
    });

    // Expect view in main area to have TestComponent mounted with content 'b'
    expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.initial"] wb-view[data-viewid="view.1"] spec-test-component')).nativeElement.innerText).toEqual('b');

    // Expect view in workbench grid to have TestComponent mounted with content 'a'
    expect(fixture.debugElement.query(By.css('wb-part[data-partid="part.left"] wb-view[data-viewid="view.2"] spec-test-component')).nativeElement.innerText).toEqual('a');
  });
});

