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
import {styleFixture, waitForInitialWorkbenchLayout, waitUntilStable} from '../testing/testing.util';
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
import {MAIN_AREA} from '../layout/workbench-layout';
import {WorkbenchLayoutFactory} from '../layout/workbench-layout.factory';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {canMatchWorkbenchView} from '../view/workbench-view-route-guards';

describe('Workbench Perspective', () => {

  beforeEach(() => jasmine.addMatchers(toEqualWorkbenchLayoutCustomMatcher));

  it('should support configuring different start page per perspective', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({
          layout: {
            perspectives: [
              {id: 'perspective-1', layout: (factory: WorkbenchLayoutFactory) => factory.addPart(MAIN_AREA)},
              {id: 'perspective-2', layout: (factory: WorkbenchLayoutFactory) => factory.addPart(MAIN_AREA)},
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

    expect(fixture.debugElement.query(By.css('router-outlet + spec-test-component')).nativeElement.innerText).toEqual('Start Page Perspective 1');

    // Switch to perspective-2
    await workbenchService.switchPerspective('perspective-2');
    expect(fixture.debugElement.query(By.css('router-outlet + spec-test-component')).nativeElement.innerText).toEqual('Start Page Perspective 2');

    // Switch to perspective-1
    await workbenchService.switchPerspective('perspective-1');
    expect(fixture.debugElement.query(By.css('router-outlet + spec-test-component')).nativeElement.innerText).toEqual('Start Page Perspective 1');
  });

  /**
   * Regression test for a bug where the workbench grid of the initial layout got replaced by the "default" grid deployed during the initial navigation,
   * resulting in only the main area being displayed.
   */
  it('should display the perspective also for asynchronous/slow initial navigation', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({
          layout: factory => factory
            .addPart(MAIN_AREA)
            .addPart('left', {relativeTo: MAIN_AREA, align: 'left', ratio: .25})
            .addView('view.101', {partId: 'left', activateView: true})
            .navigateView('view.101', [], {hint: 'navigator'}),
        }),
        RouterTestingModule.withRoutes([
          {
            path: '',
            canMatch: [canMatchWorkbenchView('navigator')],
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
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'left', views: [{id: 'view.101'}], activeViewId: 'view.101'}),
          child2: new MPart({id: MAIN_AREA}),
          direction: 'row',
          ratio: .25,
        }),
      },
    });
  });

  it('should open a empty-path view in the active part of perspective without main area', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({
          layout: factory => factory
            .addPart('left')
            .addPart('right', {align: 'right'})
            .addView('view.101', {partId: 'left', activateView: true})
            .addView('view.102', {partId: 'right', activateView: true})
            .navigateView('view.101', [], {hint: 'list'})
            .navigateView('view.102', [], {hint: 'overview'})
            .activatePart('right'),
        }),
        RouterTestingModule.withRoutes([
          {path: '', canMatch: [canMatchWorkbenchView('list')], component: TestComponent},
          {path: '', canMatch: [canMatchWorkbenchView('overview')], component: TestComponent},
          {path: 'details/:id', component: TestComponent},
        ]),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    expect(fixture.debugElement.query(By.directive(WorkbenchLayoutComponent))).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'left', views: [{id: 'view.101'}], activeViewId: 'view.101'}),
          child2: new MPart({id: 'right', views: [{id: 'view.102'}], activeViewId: 'view.102'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });

    // open new details view
    await TestBed.inject(WorkbenchRouter).navigate(['details/1']);
    await waitUntilStable();

    // empty-path view should be opened in the active part (right) of the workbench grid
    expect(fixture.debugElement.query(By.directive(WorkbenchLayoutComponent))).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'left', views: [{id: 'view.101'}], activeViewId: 'view.101'}),
          child2: new MPart({id: 'right', views: [{id: 'view.102'}, {id: 'view.1'}], activeViewId: 'view.1'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
  });
});
