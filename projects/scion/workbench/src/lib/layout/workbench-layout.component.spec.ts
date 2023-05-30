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
import {Router, RouterOutlet, UrlSegment} from '@angular/router';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {toEqualWorkbenchLayoutCustomMatcher} from '../testing/jasmine/matcher/to-equal-workbench-layout.matcher';
import {toBeRegisteredCustomMatcher} from '../testing/jasmine/matcher/to-be-registered.matcher';
import {WorkbenchLayoutComponent} from './workbench-layout.component';
import {Component} from '@angular/core';
import {expect, partialMPart, partialMTreeNode} from '../testing/jasmine/matcher/custom-matchers.definition';
import {ViewDragService} from '../view-dnd/view-drag.service';
import {WorkbenchModule} from '../workbench.module';
import {By} from '@angular/platform-browser';
import {MAIN_AREA_PART_ID} from './workbench-layout';
import {toHaveTransientStateCustomMatcher} from '../testing/jasmine/matcher/to-have-transient-state.matcher';
import {enterTransientViewState, TestComponent, withComponentContent, withTransientStateInputElement} from '../testing/test.component';
import {styleFixture, waitForInitialWorkbenchLayout, waitForWorkbenchLayoutChange} from '../testing/testing.util';
import {ɵWorkbenchService} from '../ɵworkbench.service';
import {WorkbenchTestingModule} from '../testing/workbench-testing.module';
import {RouterTestingModule} from '@angular/router/testing';

describe('WorkbenchLayout', () => {

  beforeEach(() => {
    jasmine.addMatchers(toEqualWorkbenchLayoutCustomMatcher);
    jasmine.addMatchers(toBeRegisteredCustomMatcher);
    jasmine.addMatchers(toHaveTransientStateCustomMatcher);
  });

  /**
   * Tests that the workbench layout is not discarded when navigating through the Angular router,
   * e.g., to navigate the content of an application-specific named router outlet.
   */
  it('should support navigating via Angular router', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest(),
        RouterTestingModule.withRoutes([
          {path: 'view', component: TestComponent},
          {path: 'outlet', component: TestComponent, outlet: 'outlet', providers: [withComponentContent('routed content')]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(RouterOutletPlusWorkbenchTestFixtureComponent));
    await waitForInitialWorkbenchLayout();

    // Create initial workbench layout.
    await TestBed.inject(WorkbenchRouter).ɵnavigate(layout => {
      return {
        layout: layout
          .addPart('left', {relativeTo: MAIN_AREA_PART_ID, align: 'left', ratio: .2})
          .addPart('right', {relativeTo: 'main', align: 'right', ratio: .5})
          .addView('view.1', {partId: 'left', activateView: true})
          .addView('view.2', {partId: 'main', activateView: true})
          .addView('view.3', {partId: 'right', activateView: true})
        ,
        viewOutlets: {
          'view.1': ['view'],
          'view.2': ['view'],
          'view.3': ['view'],
        },
      };
    });
    await waitForWorkbenchLayoutChange();

    // Assert initial workbench layout
    expect(fixture.debugElement.query(By.directive(WorkbenchLayoutComponent))).toEqualWorkbenchLayout({
      peripheralGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'left', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: partialMPart({id: MAIN_AREA_PART_ID}),
          direction: 'row',
          ratio: .2,
        }),
      },
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          child2: partialMPart({id: 'right', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });

    // Navigate using the Angular router.
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['outlet']}}]);
    await waitForWorkbenchLayoutChange();

    // Expect the layout not to be discarded.
    expect(fixture.debugElement.query(By.directive(WorkbenchLayoutComponent))).toEqualWorkbenchLayout({
      peripheralGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'left', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: partialMPart({id: MAIN_AREA_PART_ID}),
          direction: 'row',
          ratio: .2,
        }),
      },
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          child2: partialMPart({id: 'right', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });

    // Navigate using the Workbench router.
    await TestBed.inject(WorkbenchRouter).navigate(['view'], {target: 'blank'});
    await waitForWorkbenchLayoutChange();

    // Expect the layout to be changed.
    expect(fixture.debugElement.query(By.directive(WorkbenchLayoutComponent))).toEqualWorkbenchLayout({
      peripheralGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'left', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: partialMPart({id: MAIN_AREA_PART_ID}),
          direction: 'row',
          ratio: .2,
        }),
      },
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.2'}, {id: 'view.4'}], activeViewId: 'view.4'}),
          child2: partialMPart({id: 'right', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
  });

  it('allows to move a view to a new part in the east', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'view-1', component: TestComponent, providers: [withTransientStateInputElement()]},
          {path: 'view-2', component: TestComponent, providers: [withTransientStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['view-1']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['view-2']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveTransientState('B');

    // Move view 2 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'east',
        newPartId: 'EAST',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: partialMPart({id: 'EAST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'EAST', active: true});
    expect('view.2').toHaveTransientState('B');
  });

  it('allows to move a view to a new part in the west', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'view-1', component: TestComponent, providers: [withTransientStateInputElement()]},
          {path: 'view-2', component: TestComponent, providers: [withTransientStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['view-1']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['view-2']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveTransientState('B');

    // Move view 2 to a new part in the west
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'west',
        newPartId: 'WEST',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'WEST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          child2: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'WEST', active: true});
    expect('view.2').toHaveTransientState('B');
  });

  it('allows to move a view to a new part in the north', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'view-1', component: TestComponent, providers: [withTransientStateInputElement()]},
          {path: 'view-2', component: TestComponent, providers: [withTransientStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['view-1']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['view-2']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveTransientState('B');

    // Move view 1 to a new part in the north
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'north',
        newPartId: 'NORTH',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'NORTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          child2: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          direction: 'column',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'NORTH', active: true});
    expect('view.2').toHaveTransientState('B');
  });

  it('allows to move a view to a new part in the south', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'view-1', component: TestComponent, providers: [withTransientStateInputElement()]},
          {path: 'view-2', component: TestComponent, providers: [withTransientStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['view-1']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['view-2']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveTransientState('B');

    // Move view 1 to a new part in the south
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'south',
        newPartId: 'SOUTH',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: partialMPart({id: 'SOUTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'column',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'SOUTH', active: true});
    expect('view.2').toHaveTransientState('B');
  });

  it('disallows to move a view to a new part in the center', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'view-1', component: TestComponent, providers: [withTransientStateInputElement()]},
          {path: 'view-2', component: TestComponent, providers: [withTransientStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['view-1']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['view-2']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveTransientState('B');

    // Move view 1 to a new part in the center
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'center',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveTransientState('B');
  });

  it('allows to move views to another part', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'view-1', component: TestComponent, providers: [withTransientStateInputElement()]},
          {path: 'view-2', component: TestComponent, providers: [withTransientStateInputElement()]},
          {path: 'view-3', component: TestComponent, providers: [withTransientStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['view-1']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['view-2']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveTransientState('B');

    // Add view 3
    await TestBed.inject(WorkbenchRouter).navigate(['view-3']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.3', 'C');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.3'}], activeViewId: 'view.3'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: false});
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toBeRegistered({partId: 'main', active: true});
    expect('view.3').toHaveTransientState('C');

    // Move view 3 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.3',
        viewUrlSegments: [new UrlSegment('view-3', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'east',
        newPartId: 'EAST',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
          child2: partialMPart({id: 'EAST', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });

    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toBeRegistered({partId: 'EAST', active: true});
    expect('view.3').toHaveTransientState('C');

    // Move view 2 to the new part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'EAST',
        region: 'center',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: partialMPart({id: 'EAST', views: [{id: 'view.3'}, {id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'EAST', active: true});
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toBeRegistered({partId: 'EAST', active: false});
    expect('view.3').toHaveTransientState('C');

    // Move view 1 to the new part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.1',
        viewUrlSegments: [new UrlSegment('view-1', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'EAST',
        region: 'center',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'EAST', views: [{id: 'view.3'}, {id: 'view.2'}, {id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });

    expect('view.1').toBeRegistered({partId: 'EAST', active: true});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'EAST', active: false});
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toBeRegistered({partId: 'EAST', active: false});
    expect('view.3').toHaveTransientState('C');
  });

  it('allows to move the last view of a part to a new part in the east', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'view-1', component: TestComponent, providers: [withTransientStateInputElement()]},
          {path: 'view-2', component: TestComponent, providers: [withTransientStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['view-1']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['view-2']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveTransientState('B');

    // Move view 2 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'east',
        newPartId: 'EAST-1',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: partialMPart({id: 'EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });

    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'EAST-1', active: true});
    expect('view.2').toHaveTransientState('B');

    // Move view 2 to a new part in the east of part EAST-1
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'EAST-1',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'east',
        newPartId: 'EAST-2',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: partialMPart({id: 'EAST-2', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'EAST-2', active: true});
    expect('view.2').toHaveTransientState('B');
  });

  it('allows to move the last view of a part to a new part in the west', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'view-1', component: TestComponent, providers: [withTransientStateInputElement()]},
          {path: 'view-2', component: TestComponent, providers: [withTransientStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['view-1']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['view-2']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveTransientState('B');

    // Move view 2 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'east',
        newPartId: 'EAST',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: partialMPart({id: 'EAST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });

    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'EAST', active: true});
    expect('view.2').toHaveTransientState('B');

    // Move view 2 to a new part in the west of part 1
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'EAST',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'west',
        newPartId: 'WEST-2',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'WEST-2', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          child2: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'WEST-2', active: true});
    expect('view.2').toHaveTransientState('B');
  });

  it('allows to move the last view of a part to a new part in the north', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'view-1', component: TestComponent, providers: [withTransientStateInputElement()]},
          {path: 'view-2', component: TestComponent, providers: [withTransientStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['view-1']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['view-2']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveTransientState('B');

    // Move view 2 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'east',
        newPartId: 'EAST',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: partialMPart({id: 'EAST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'EAST', active: true});
    expect('view.2').toHaveTransientState('B');

    // Move view 2 to a new part in the north of part 1
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'EAST',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'north',
        newPartId: 'NORTH',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'NORTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          child2: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          direction: 'column',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'NORTH', active: true});
    expect('view.2').toHaveTransientState('B');
  });

  it('allows to move the last view of a part to a new part in the south', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'view-1', component: TestComponent, providers: [withTransientStateInputElement()]},
          {path: 'view-2', component: TestComponent, providers: [withTransientStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['view-1']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['view-2']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveTransientState('B');

    // Move view 2 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'east',
        newPartId: 'EAST',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: partialMPart({id: 'EAST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'EAST', active: true});
    expect('view.2').toHaveTransientState('B');

    // Move view 2 to a new part in the south of part 1
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'EAST',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'south',
        newPartId: 'SOUTH',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: partialMPart({id: 'SOUTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'column',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'SOUTH', active: true});
    expect('view.2').toHaveTransientState('B');
  });

  it('allows to move a view around parts', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'view-1', component: TestComponent, providers: [withTransientStateInputElement()]},
          {path: 'view-2', component: TestComponent, providers: [withTransientStateInputElement()]},
          {path: 'view-3', component: TestComponent, providers: [withTransientStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['view-1']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['view-2']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveTransientState('B');

    // Add view 3
    await TestBed.inject(WorkbenchRouter).navigate(['view-3']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.3', 'C');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.3'}], activeViewId: 'view.3'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: false});
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toBeRegistered({partId: 'main', active: true});
    expect('view.3').toHaveTransientState('C');

    // Move view 3 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.3',
        viewUrlSegments: [new UrlSegment('view-3', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'east',
        newPartId: 'EAST',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
          child2: partialMPart({id: 'EAST', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });

    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toBeRegistered({partId: 'EAST', active: true});
    expect('view.3').toHaveTransientState('C');

    // Move view 2 to a new part in the south of part 2
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'EAST',
        region: 'south',
        newPartId: 'SOUTH-EAST',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: partialMTreeNode({
            child1: partialMPart({id: 'EAST', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            child2: partialMPart({id: 'SOUTH-EAST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'column',
            ratio: .5,
          }),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'SOUTH-EAST', active: true});
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toBeRegistered({partId: 'EAST', active: true});
    expect('view.3').toHaveTransientState('C');

    // Move view 2 to a new part in the south of part 1
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'SOUTH-EAST',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        newPartId: 'SOUTH-WEST',
        region: 'south',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMTreeNode({
            child1: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: partialMPart({id: 'SOUTH-WEST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'column',
            ratio: .5,
          }),
          child2: partialMPart({id: 'EAST', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'SOUTH-WEST', active: true});
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toBeRegistered({partId: 'EAST', active: true});
    expect('view.3').toHaveTransientState('C');
  });

  it('allows to move a view to a new part in the south and back to the main part ', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'view-1', component: TestComponent, providers: [withTransientStateInputElement()]},
          {path: 'view-2', component: TestComponent, providers: [withTransientStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['view-1']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['view-2']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveTransientState('B');

    // Move view 2 to a new part in the south
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'south',
        newPartId: 'SOUTH',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: partialMPart({id: 'SOUTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'column',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'SOUTH', active: true});
    expect('view.2').toHaveTransientState('B');

    // Move view 2 back to the main part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'SOUTH',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'center',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveTransientState('B');
  });

  it('allows to move a view to a new part in the east and then to the south of the main part ', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'view-1', component: TestComponent, providers: [withTransientStateInputElement()]},
          {path: 'view-2', component: TestComponent, providers: [withTransientStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['view-1']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['view-2']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveTransientState('B');

    // Move view 2 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'east',
        newPartId: 'EAST',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: partialMPart({id: 'EAST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'EAST', active: true});
    expect('view.2').toHaveTransientState('B');

    // Move view 2 to a new part in the south
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'EAST',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'south',
        newPartId: 'SOUTH',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: partialMPart({id: 'SOUTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'column',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'SOUTH', active: true});
    expect('view.2').toHaveTransientState('B');
  });

  it('allows to move a view to a new part in the west and then to the south of the main part ', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'view-1', component: TestComponent, providers: [withTransientStateInputElement()]},
          {path: 'view-2', component: TestComponent, providers: [withTransientStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['view-1']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['view-2']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveTransientState('B');

    // Move view 2 to a new part in the west
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'west',
        newPartId: 'WEST',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'WEST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          child2: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'WEST', active: true});
    expect('view.2').toHaveTransientState('B');

    // Move view 2 to a new part in the south
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'WEST',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'south',
        newPartId: 'SOUTH',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: partialMPart({id: 'SOUTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'column',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'SOUTH', active: true});
    expect('view.2').toHaveTransientState('B');
  });

  it('should open the same view multiple times', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'view-1', component: TestComponent, providers: [withTransientStateInputElement()]},
          {path: 'view-2', component: TestComponent, providers: [withTransientStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['view-1']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });

    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['view-2']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveTransientState('B');

    // Add view 2 again
    await TestBed.inject(WorkbenchRouter).navigate(['view-2'], {blankPartId: 'main'});
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveTransientState('B');
  });

  it('should open the same view multiple times', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'view-1', component: TestComponent, providers: [withTransientStateInputElement()]},
          {path: 'view-2', component: TestComponent, providers: [withTransientStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['view-1']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['view-2']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveTransientState('B');

    // Add view 2 again
    await TestBed.inject(WorkbenchRouter).navigate(['view-2'], {blankPartId: 'main', target: 'blank'});
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.3', 'C');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.3'}], activeViewId: 'view.3'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: false});
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toBeRegistered({partId: 'main', active: true});
    expect('view.3').toHaveTransientState('C');
  });

  it('should open views to the right and to the left, and then close them', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'view-1', component: TestComponent, providers: [withTransientStateInputElement()]},
          {path: 'view-2', component: TestComponent, providers: [withTransientStateInputElement()]},
          {path: 'view-3', component: TestComponent, providers: [withTransientStateInputElement()]},
          {path: 'view-4', component: TestComponent, providers: [withTransientStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['view-1']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['view-2']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveTransientState('B');

    // Move view 2 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'east',
        newPartId: 'EAST-1',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: partialMPart({id: 'EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'EAST-1', active: true});
    expect('view.2').toHaveTransientState('B');

    // Add view 3 to part EAST-1
    await TestBed.inject(WorkbenchRouter).navigate(['view-3']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.3', 'C');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: partialMPart({id: 'EAST-1', views: [{id: 'view.2'}, {id: 'view.3'}], activeViewId: 'view.3'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'EAST-1', active: false});
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toBeRegistered({partId: 'EAST-1', active: true});
    expect('view.3').toHaveTransientState('C');

    // Move view 3 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'EAST-1',
        viewId: 'view.3',
        viewUrlSegments: [new UrlSegment('view-3', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'EAST-1',
        region: 'east',
        newPartId: 'EAST-2',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: partialMTreeNode({
            child1: partialMPart({id: 'EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: partialMPart({id: 'EAST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            direction: 'row',
            ratio: .5,
          }),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'EAST-1', active: true});
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toBeRegistered({partId: 'EAST-2', active: true});
    expect('view.3').toHaveTransientState('C');

    // Add view 4 to part EAST-2
    await TestBed.inject(WorkbenchRouter).navigate(['view-4']);
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.4', 'D');

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: partialMTreeNode({
            child1: partialMPart({id: 'EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: partialMPart({id: 'EAST-2', views: [{id: 'view.3'}, {id: 'view.4'}], activeViewId: 'view.4'}),
            direction: 'row',
            ratio: .5,
          }),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'EAST-1', active: true});
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toBeRegistered({partId: 'EAST-2', active: false});
    expect('view.3').toHaveTransientState('C');
    expect('view.4').toBeRegistered({partId: 'EAST-2', active: true});
    expect('view.4').toHaveTransientState('D');

    // Move view 4 to a new part in the west
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'EAST-2',
        viewId: 'view.4',
        viewUrlSegments: [new UrlSegment('view-4', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'west',
        newPartId: 'WEST-1',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMTreeNode({
            child1: partialMPart({id: 'WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
            child2: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            direction: 'row',
            ratio: .5,
          }),
          child2: partialMTreeNode({
            child1: partialMPart({id: 'EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: partialMPart({id: 'EAST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            direction: 'row',
            ratio: .5,
          }),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'EAST-1', active: true});
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toBeRegistered({partId: 'EAST-2', active: true});
    expect('view.3').toHaveTransientState('C');
    expect('view.4').toBeRegistered({partId: 'WEST-1', active: true});
    expect('view.4').toHaveTransientState('D');

    // Move view 3 to a new part in the west
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'EAST-2',
        viewId: 'view.3',
        viewUrlSegments: [new UrlSegment('view-3', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'WEST-1',
        region: 'west',
        newPartId: 'WEST-2',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMTreeNode({
            child1: partialMTreeNode({
              child1: partialMPart({id: 'WEST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
              child2: partialMPart({id: 'WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
              direction: 'row',
              ratio: .5,
            }),
            child2: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            direction: 'row',
            ratio: .5,
          }),
          child2: partialMPart({id: 'EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toBeRegistered({partId: 'EAST-1', active: true});
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toBeRegistered({partId: 'WEST-2', active: true});
    expect('view.3').toHaveTransientState('C');
    expect('view.4').toBeRegistered({partId: 'WEST-1', active: true});
    expect('view.4').toHaveTransientState('D');

    // Move view 2 to a new part in the north
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'EAST-1',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'north',
        newPartId: 'NORTH-1',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMTreeNode({
            child1: partialMPart({id: 'WEST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            child2: partialMPart({id: 'WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
            direction: 'row',
            ratio: .5,
          }),
          child2: partialMTreeNode({
            child1: partialMPart({id: 'NORTH-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            direction: 'column',
            ratio: .5,
          }),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveTransientState('A');

    expect('view.2').toBeRegistered({partId: 'NORTH-1', active: true});
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toBeRegistered({partId: 'WEST-2', active: true});
    expect('view.3').toHaveTransientState('C');
    expect('view.4').toBeRegistered({partId: 'WEST-1', active: true});
    expect('view.4').toHaveTransientState('D');

    // Close view 1
    await TestBed.inject(WorkbenchRouter).navigate(['view-1'], {close: true});
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMTreeNode({
            child1: partialMPart({id: 'WEST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            child2: partialMPart({id: 'WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
            direction: 'row',
            ratio: .5,
          }),
          child2: partialMPart({id: 'NORTH-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').not.toBeRegistered({partId: 'main', active: true});
    expect('view.2').toBeRegistered({partId: 'NORTH-1', active: true});
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toBeRegistered({partId: 'WEST-2', active: true});
    expect('view.3').toHaveTransientState('C');
    expect('view.4').toBeRegistered({partId: 'WEST-1', active: true});
    expect('view.4').toHaveTransientState('D');

    // Close view 3
    await TestBed.inject(WorkbenchRouter).navigate(['view-3'], {close: true});
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
          child2: partialMPart({id: 'NORTH-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').not.toBeRegistered({partId: 'main', active: true});
    expect('view.2').toBeRegistered({partId: 'NORTH-1', active: true});
    expect('view.2').toHaveTransientState('B');
    expect('view.3').not.toBeRegistered({partId: 'WEST-2', active: true});
    expect('view.4').toBeRegistered({partId: 'WEST-1', active: true});
    expect('view.4').toHaveTransientState('D');

    // Close view 4
    await TestBed.inject(WorkbenchRouter).navigate(['view-4'], {close: true});
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'NORTH-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').not.toBeRegistered({partId: 'main', active: true});
    expect('view.2').toBeRegistered({partId: 'NORTH-1', active: true});
    expect('view.2').toHaveTransientState('B');
    expect('view.3').not.toBeRegistered({partId: 'WEST-2', active: true});
    expect('view.4').not.toBeRegistered({partId: 'WEST-1', active: true});
  });

  it('should detach views before being re-parented in the DOM (1)', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'view', component: TestComponent, providers: [withTransientStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Create initial workbench layout.
    await TestBed.inject(WorkbenchRouter).ɵnavigate(layout => {
      return {
        layout: layout
          .addView('view.1', {partId: 'main'})
          .addView('view.2', {partId: 'main'})
          .addView('view.3', {partId: 'main'})
          .activateView('view.3'),
        viewOutlets: {
          'view.1': ['view'],
          'view.2': ['view'],
          'view.3': ['view'],
        },
      };
    });
    await waitForWorkbenchLayoutChange();

    // Enter transient states.
    await TestBed.inject(WorkbenchRouter).ɵnavigate(layout => layout.activateView('view.1'));
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.1', 'A');

    await TestBed.inject(WorkbenchRouter).ɵnavigate(layout => layout.activateView('view.2'));
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.2', 'B');

    await TestBed.inject(WorkbenchRouter).ɵnavigate(layout => layout.activateView('view.3'));
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.3', 'C');

    // Move view.2 to the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'east',
        newPartId: 'right',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.3'}], activeViewId: 'view.3'}),
          child2: partialMPart({id: 'right', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toHaveTransientState('C');

    // Move view.3 to the north of view.2
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.3',
        viewUrlSegments: [new UrlSegment('view', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'right',
        region: 'north',
        newPartId: 'top-right',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: partialMTreeNode({
            child1: partialMPart({id: 'top-right', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            child2: partialMPart({id: 'right', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'column',
            ratio: .5,
          }),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toHaveTransientState('C');
  });

  it('should detach views before being re-parented in the DOM (2)', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'view', component: TestComponent, providers: [withTransientStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Create initial workbench layout.
    await TestBed.inject(WorkbenchRouter).ɵnavigate(layout => {
      return {
        layout: layout
          .addView('view.1', {partId: 'main'})
          .addView('view.2', {partId: 'main'})
          .addView('view.3', {partId: 'main'})
          .activateView('view.3'),
        viewOutlets: {
          'view.1': ['view'],
          'view.2': ['view'],
          'view.3': ['view'],
        },
      };
    });
    await waitForWorkbenchLayoutChange();

    // Enter transient states.
    await TestBed.inject(WorkbenchRouter).ɵnavigate(layout => layout.activateView('view.1'));
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.1', 'A');

    await TestBed.inject(WorkbenchRouter).ɵnavigate(layout => layout.activateView('view.2'));
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.2', 'B');

    await TestBed.inject(WorkbenchRouter).ɵnavigate(layout => layout.activateView('view.3'));
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.3', 'C');

    // Move view 2 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'east',
        newPartId: 'EAST',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.3'}], activeViewId: 'view.3'}),
          child2: partialMPart({id: 'EAST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toHaveTransientState('C');

    // Move view 2 to a new part in the west of the main part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'EAST',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'west',
        newPartId: 'WEST-2',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'WEST-2', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          child2: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.3'}], activeViewId: 'view.3'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toHaveTransientState('C');
  });

  it('should detach views before being re-parented in the DOM (3)', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'view', component: TestComponent, providers: [withTransientStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Create initial workbench layout.
    await TestBed.inject(WorkbenchRouter).ɵnavigate(layout => {
      return {
        layout: layout
          .addView('view.1', {partId: 'main'})
          .addView('view.2', {partId: 'main'})
          .addView('view.3', {partId: 'main'})
          .addView('view.4', {partId: 'main'})
          .activateView('view.4'),
        viewOutlets: {
          'view.1': ['view'],
          'view.2': ['view'],
          'view.3': ['view'],
          'view.4': ['view'],
        },
      };
    });
    await waitForWorkbenchLayoutChange();

    // Enter transient states.
    await TestBed.inject(WorkbenchRouter).ɵnavigate(layout => layout.activateView('view.1'));
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.1', 'A');

    await TestBed.inject(WorkbenchRouter).ɵnavigate(layout => layout.activateView('view.2'));
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.2', 'B');

    await TestBed.inject(WorkbenchRouter).ɵnavigate(layout => layout.activateView('view.3'));
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.3', 'C');

    await TestBed.inject(WorkbenchRouter).ɵnavigate(layout => layout.activateView('view.4'));
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.4', 'D');

    // Move view 2 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'east',
        newPartId: 'EAST-1',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.3'}, {id: 'view.4'}], activeViewId: 'view.4'}),
          child2: partialMPart({id: 'EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toHaveTransientState('C');
    expect('view.4').toHaveTransientState('D');

    // Move view 3 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.3',
        viewUrlSegments: [new UrlSegment('view', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'EAST-1',
        region: 'east',
        newPartId: 'EAST-2',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.4'}], activeViewId: 'view.4'}),
          child2: partialMTreeNode({
            child1: partialMPart({id: 'EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: partialMPart({id: 'EAST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            direction: 'row',
            ratio: .5,
          }),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toHaveTransientState('C');
    expect('view.4').toHaveTransientState('D');

    // Move view 4 to a new part in the west
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.4',
        viewUrlSegments: [new UrlSegment('view', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'west',
        newPartId: 'WEST-1',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMTreeNode({
            child1: partialMPart({id: 'WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
            child2: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            direction: 'row',
            ratio: .5,
          }),
          child2: partialMTreeNode({
            child1: partialMPart({id: 'EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: partialMPart({id: 'EAST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            direction: 'row',
            ratio: .5,
          }),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toHaveTransientState('C');
    expect('view.4').toHaveTransientState('D');

    // Move view 3 to a new part in the west
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'EAST-2',
        viewId: 'view.3',
        viewUrlSegments: [new UrlSegment('view', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'WEST-1',
        region: 'west',
        newPartId: 'WEST-2',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMTreeNode({
            child1: partialMTreeNode({
              child1: partialMPart({id: 'WEST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
              child2: partialMPart({id: 'WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
              direction: 'row',
              ratio: .5,
            }),
            child2: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            direction: 'row',
            ratio: .5,
          }),
          child2: partialMPart({id: 'EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toHaveTransientState('C');
    expect('view.4').toHaveTransientState('D');

    // Move view 2 to a new part in the north
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'EAST-1',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'north',
        newPartId: 'NORTH-1',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMTreeNode({
            child1: partialMPart({id: 'WEST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            child2: partialMPart({id: 'WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
            direction: 'row',
            ratio: .5,
          }),
          child2: partialMTreeNode({
            child1: partialMPart({id: 'NORTH-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            direction: 'column',
            ratio: .5,
          }),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toHaveTransientState('C');
    expect('view.4').toHaveTransientState('D');

    // Close view 1
    await TestBed.inject(WorkbenchRouter).navigate([], {target: 'view.1', close: true});
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMTreeNode({
            child1: partialMPart({id: 'WEST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            child2: partialMPart({id: 'WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
            direction: 'row',
            ratio: .5,
          }),
          child2: partialMPart({id: 'NORTH-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toHaveTransientState('C');
    expect('view.4').toHaveTransientState('D');

    // Close view 3
    await TestBed.inject(WorkbenchRouter).navigate([], {target: 'view.3', close: true});
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
          child2: partialMPart({id: 'NORTH-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.2').toHaveTransientState('B');
    expect('view.4').toHaveTransientState('D');

    // Close view 4
    await TestBed.inject(WorkbenchRouter).navigate([], {target: 'view.4', close: true});
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'NORTH-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.2').toHaveTransientState('B');
  });

  it('should detach views before being re-parented in the DOM (4)', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'view', component: TestComponent, providers: [withTransientStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Create initial workbench layout.
    await TestBed.inject(WorkbenchRouter).ɵnavigate(layout => {
      return {
        layout: layout
          .addView('view.1', {partId: 'main'})
          .addView('view.2', {partId: 'main'})
          .addView('view.3', {partId: 'main'})
          .activateView('view.3'),
        viewOutlets: {
          'view.1': ['view'],
          'view.2': ['view'],
          'view.3': ['view'],
        },
      };
    });
    await waitForWorkbenchLayoutChange();

    // Enter transient states.
    await TestBed.inject(WorkbenchRouter).ɵnavigate(layout => layout.activateView('view.1'));
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.1', 'A');

    await TestBed.inject(WorkbenchRouter).ɵnavigate(layout => layout.activateView('view.2'));
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.2', 'B');

    await TestBed.inject(WorkbenchRouter).ɵnavigate(layout => layout.activateView('view.3'));
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.3', 'C');

    // Move view 3 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.3',
        viewUrlSegments: [new UrlSegment('view', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'east',
        newPartId: 'EAST',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
          child2: partialMPart({id: 'EAST', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toHaveTransientState('C');

    // Move view 2 to a new part in the south of EAST part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'EAST',
        region: 'south',
        newPartId: 'SOUTH',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: partialMTreeNode({
            child1: partialMPart({id: 'EAST', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            child2: partialMPart({id: 'SOUTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'column',
            ratio: .5,
          }),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toHaveTransientState('C');

    // Move view 2 to a new part in the north of EAST part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'EAST',
        region: 'north',
        newPartId: 'NORTH',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: partialMTreeNode({
            child1: partialMPart({id: 'NORTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: partialMPart({id: 'EAST', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            direction: 'column',
            ratio: .5,
          }),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toHaveTransientState('C');
  });

  it('should detach views before being re-parented in the DOM (5)', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'view', component: TestComponent, providers: [withTransientStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Create initial workbench layout.
    await TestBed.inject(WorkbenchRouter).ɵnavigate(layout => {
      return {
        layout: layout
          .addView('view.1', {partId: 'main'})
          .addView('view.2', {partId: 'main'})
          .addView('view.3', {partId: 'main'})
          .activateView('view.3'),
        viewOutlets: {
          'view.1': ['view'],
          'view.2': ['view'],
          'view.3': ['view'],
        },
      };
    });
    await waitForWorkbenchLayoutChange();

    // Enter transient states.
    await TestBed.inject(WorkbenchRouter).ɵnavigate(layout => layout.activateView('view.1'));
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.1', 'A');

    await TestBed.inject(WorkbenchRouter).ɵnavigate(layout => layout.activateView('view.2'));
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.2', 'B');

    await TestBed.inject(WorkbenchRouter).ɵnavigate(layout => layout.activateView('view.3'));
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.3', 'C');

    // Move view 3 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.3',
        viewUrlSegments: [new UrlSegment('view', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'east',
        newPartId: 'EAST',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
          child2: partialMPart({id: 'EAST', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toHaveTransientState('C');

    // Move view 2 to a new part in the north of EAST part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'EAST',
        region: 'north',
        newPartId: 'NORTH',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: partialMTreeNode({
            child1: partialMPart({id: 'NORTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: partialMPart({id: 'EAST', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            direction: 'column',
            ratio: .5,
          }),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toHaveTransientState('C');

    // Move view 3 to a new part in the south of NORTH part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'EAST',
        viewId: 'view.3',
        viewUrlSegments: [new UrlSegment('view', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'NORTH',
        region: 'south',
        newPartId: 'SOUTH',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: partialMTreeNode({
            child1: partialMPart({id: 'NORTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: partialMPart({id: 'SOUTH', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            direction: 'column',
            ratio: .5,
          }),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toHaveTransientState('B');
    expect('view.3').toHaveTransientState('C');
  });

  it('should detach views before being re-parented in the DOM (6)', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'view', component: TestComponent, providers: [withTransientStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Create initial workbench layout.
    await TestBed.inject(WorkbenchRouter).ɵnavigate(layout => {
      return {
        layout: layout
          .addView('view.1', {partId: 'main'})
          .addView('view.2', {partId: 'main'})
          .activateView('view.2'),
        viewOutlets: {
          'view.1': ['view'],
          'view.2': ['view'],
        },
      };
    });
    await waitForWorkbenchLayoutChange();

    // Enter transient states.
    await TestBed.inject(WorkbenchRouter).ɵnavigate(layout => layout.activateView('view.1'));
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.1', 'A');

    await TestBed.inject(WorkbenchRouter).ɵnavigate(layout => layout.activateView('view.2'));
    await waitForWorkbenchLayoutChange();
    enterTransientViewState(fixture, 'view.2', 'B');

    // Move view 2 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'east',
        newPartId: 'EAST',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: partialMPart({id: 'EAST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toHaveTransientState('B');

    // Move view 2 to a new part in the west of main part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'EAST',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view', {})],
      },
      target: {
        appInstanceId: TestBed.inject(ɵWorkbenchService).appInstanceId,
        partId: 'main',
        region: 'west',
        newPartId: 'WEST',
      },
    });
    await waitForWorkbenchLayoutChange();

    expect(fixture).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          child1: partialMPart({id: 'WEST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          child2: partialMPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveTransientState('A');
    expect('view.2').toHaveTransientState('B');
  });
});

/****************************************************************************************************
 * Fixtures                                                                                         *
 ****************************************************************************************************/
@Component({
  selector: 'spec-router-outlet-plus-workbench-fixture',
  template: `
    <section class="outlet">
      <router-outlet name="outlet"></router-outlet>
    </section>
    <wb-workbench/>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
      }

      section.outlet {
        flex: none;
        border: 1px solid rgb(255, 0, 0);
        padding: .5em;
        background: rgba(255, 0, 0, .25);
      }

      wb-workbench {
        flex: auto;
      }
    `,
  ],
  standalone: true,
  imports: [
    RouterOutlet,
    WorkbenchModule,
  ],
})
class RouterOutletPlusWorkbenchTestFixtureComponent {
}

