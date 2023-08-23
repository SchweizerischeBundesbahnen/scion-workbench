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
import {WorkbenchTestingModule} from '../testing/workbench-testing.module';
import {RouterTestingModule} from '@angular/router/testing';
import {styleFixture, waitForInitialWorkbenchLayout} from '../testing/testing.util';
import {WorkbenchComponent} from '../workbench.component';
import {WorkbenchService} from '../workbench.service';
import {TestComponent, withComponentContent} from '../testing/test.component';
import {By} from '@angular/platform-browser';
import {inject} from '@angular/core';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {WorkbenchLayoutComponent} from '../layout/workbench-layout.component';
import {MPart, MTreeNode} from '../layout/workbench-layout.model';
import {delay, of} from 'rxjs';
import {toEqualWorkbenchLayoutCustomMatcher} from '../testing/jasmine/matcher/to-equal-workbench-layout.matcher';
import {MAIN_AREA_PART_ID} from '../layout/workbench-layout';

describe('Workbench Perspective', () => {

  beforeEach(() => jasmine.addMatchers(toEqualWorkbenchLayoutCustomMatcher));

  it('should support configuring different start page per perspective', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({
          layout: {
            perspectives: [
              {id: 'perspective-1', layout: layout => layout},
              {id: 'perspective-2', layout: layout => layout},
            ],
          },
        }),
        RouterTestingModule.withRoutes([
          {
            path: '',
            loadComponent: () => import('../testing/test.component'),
            providers: [withComponentContent('Start Page Perspective 1')],
            canMatch: [() => inject(WorkbenchService).getPerspective('perspective-1')?.active],
          },
          {
            path: '',
            loadComponent: () => import('../testing/test.component'),
            providers: [withComponentContent('Start Page Perspective 2')],
            canMatch: [() => inject(WorkbenchService).getPerspective('perspective-2')?.active],
          },
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();
    const workbenchService = TestBed.inject(WorkbenchService);

    expect(fixture.debugElement.query(By.css('wb-part[data-partid="main"] > sci-viewport > router-outlet + spec-test-component')).nativeElement.innerText).toEqual('Start Page Perspective 1');

    // Switch to perspective-2
    await workbenchService.switchPerspective('perspective-2');
    expect(fixture.debugElement.query(By.css('wb-part[data-partid="main"] > sci-viewport > router-outlet + spec-test-component')).nativeElement.innerText).toEqual('Start Page Perspective 2');

    // Switch to perspective-1
    await workbenchService.switchPerspective('perspective-1');
    expect(fixture.debugElement.query(By.css('wb-part[data-partid="main"] > sci-viewport > router-outlet + spec-test-component')).nativeElement.innerText).toEqual('Start Page Perspective 1');
  });

  /**
   * Regression test for a bug where the perspective grid of the initial layout got replaced by the "default" grid deployed during the initial navigation,
   * resulting in only the main area being displayed.
   */
  it('should display the perspective also for asynchronous/slow initial navigation', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({
          layout: layout => layout
            .addPart('left', {relativeTo: MAIN_AREA_PART_ID, align: 'left', ratio: .25})
            .addView('navigator', {partId: 'left', activateView: true}),
        }),
        RouterTestingModule.withRoutes([
          {
            path: '',
            outlet: 'navigator',
            component: TestComponent,
            canActivate: [
              () => of(true).pipe(delay(1000)), // simulate slow initial navigation
            ],
          },
        ]),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    expect(fixture.debugElement.query(By.directive(WorkbenchLayoutComponent))).toEqualWorkbenchLayout({
      peripheralGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'left', views: [{id: 'navigator'}], activeViewId: 'navigator'}),
          child2: new MPart({id: MAIN_AREA_PART_ID}),
          direction: 'row',
          ratio: .25,
        }),
      },
      mainGrid: {
        root: new MPart({id: 'main', views: []}),
      },
    });
  });
});
