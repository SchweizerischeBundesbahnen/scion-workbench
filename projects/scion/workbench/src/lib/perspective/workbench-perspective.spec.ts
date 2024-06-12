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
import {styleFixture, waitForInitialWorkbenchLayout, waitUntilStable} from '../testing/testing.util';
import {WorkbenchComponent} from '../workbench.component';
import {WorkbenchService} from '../workbench.service';
import {TestComponent, withComponentContent} from '../testing/test.component';
import {By} from '@angular/platform-browser';
import {inject} from '@angular/core';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {WorkbenchLayoutComponent} from '../layout/workbench-layout.component';
import {firstValueFrom, Subject, timer} from 'rxjs';
import {MPart, MTreeNode, toEqualWorkbenchLayoutCustomMatcher} from '../testing/jasmine/matcher/to-equal-workbench-layout.matcher';
import {MAIN_AREA} from '../layout/workbench-layout';
import {WorkbenchLayoutFactory} from '../layout/workbench-layout.factory';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {provideRouter} from '@angular/router';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {canMatchWorkbenchView} from '../view/workbench-view-route-guards';

describe('Workbench Perspective', () => {

  beforeEach(() => jasmine.addMatchers(toEqualWorkbenchLayoutCustomMatcher));

  it('should support configuring different start page per perspective', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: {
            perspectives: [
              {id: 'perspective-1', layout: (factory: WorkbenchLayoutFactory) => factory.addPart(MAIN_AREA)},
              {id: 'perspective-2', layout: (factory: WorkbenchLayoutFactory) => factory.addPart(MAIN_AREA)},
            ],
          },
        }),
        provideRouter([
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
    const canActivate = new Subject<true>();

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart(MAIN_AREA)
            .addPart('left', {relativeTo: MAIN_AREA, align: 'left', ratio: .25})
            .addView('view.101', {partId: 'left'})
            .navigateView('view.101', [], {hint: 'navigator'}),
          startup: {launcher: 'APP_INITIALIZER'},
        }),
        provideRouter([
          {
            path: '',
            canMatch: [canMatchWorkbenchView('navigator')],
            component: TestComponent,
            canActivate: [() => firstValueFrom(canActivate)],
          },
        ]),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Delay activation of the perspective.
    await firstValueFrom(timer(1000));
    canActivate.next(true);
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
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
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('left')
            .addPart('right', {align: 'right'})
            .addView('view.101', {partId: 'left'})
            .addView('view.102', {partId: 'right'})
            .navigateView('view.101', [], {hint: 'list'})
            .navigateView('view.102', [], {hint: 'overview'})
            .activatePart('right'),
          startup: {launcher: 'APP_INITIALIZER'},
        }),
        provideRouter([
          {path: '', canMatch: [canMatchWorkbenchView('list')], component: TestComponent},
          {path: '', canMatch: [canMatchWorkbenchView('overview')], component: TestComponent},
          {path: 'details/:id', component: TestComponent},
        ]),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    expect(fixture).toEqualWorkbenchLayout({
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
    expect(fixture).toEqualWorkbenchLayout({
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

  it('should activate first view of each part if not specified', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('left')
            .addPart('right', {align: 'right'})
            .addView('view.101', {partId: 'left'})
            .addView('view.102', {partId: 'left'})
            .addView('view.103', {partId: 'left'})
            .addView('view.201', {partId: 'right'})
            .addView('view.202', {partId: 'right', activateView: true})
            .addView('view.203', {partId: 'right'}),
          startup: {launcher: 'APP_INITIALIZER'},
        }),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    expect(fixture).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'left', views: [{id: 'view.101'}, {id: 'view.102'}, {id: 'view.103'}], activeViewId: 'view.101'}),
          child2: new MPart({id: 'right', views: [{id: 'view.201'}, {id: 'view.202'}, {id: 'view.203'}], activeViewId: 'view.202'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
  });
});
