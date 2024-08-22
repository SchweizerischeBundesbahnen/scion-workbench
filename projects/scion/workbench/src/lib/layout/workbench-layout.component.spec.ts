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
import {provideRouter, Router, RouterOutlet} from '@angular/router';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {MPart, MTreeNode, toEqualWorkbenchLayoutCustomMatcher} from '../testing/jasmine/matcher/to-equal-workbench-layout.matcher';
import {toBeRegisteredCustomMatcher} from '../testing/jasmine/matcher/to-be-registered.matcher';
import {WorkbenchLayoutComponent} from './workbench-layout.component';
import {Component} from '@angular/core';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {ViewDragService} from '../view-dnd/view-drag.service';
import {By} from '@angular/platform-browser';
import {MAIN_AREA} from './workbench-layout';
import {toHaveComponentStateCustomMatcher} from '../testing/jasmine/matcher/to-have-component-state.matcher';
import {enterComponentState, TestComponent, withComponentContent, withComponentStateInputElement} from '../testing/test.component';
import {segments, styleFixture, waitForInitialWorkbenchLayout, waitUntilStable} from '../testing/testing.util';
import {WorkbenchPartRegistry} from '../part/workbench-part.registry';
import {WORKBENCH_ID} from '../workbench-id';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {WorkbenchComponent} from '../workbench.component';

describe('WorkbenchLayout', () => {

  beforeEach(() => {
    jasmine.addMatchers(toEqualWorkbenchLayoutCustomMatcher);
    jasmine.addMatchers(toBeRegisteredCustomMatcher);
    jasmine.addMatchers(toHaveComponentStateCustomMatcher);
  });

  /**
   * Tests that the workbench layout is not discarded when navigating through the Angular router,
   * e.g., to navigate the content of an application-specific named router outlet.
   */
  it('should support navigating via Angular router', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'path/to/view', component: TestComponent},
          {path: 'path/to/outlet', component: TestComponent, outlet: 'outlet', providers: [withComponentContent('routed content')]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(RouterOutletPlusWorkbenchTestFixtureComponent));
    await waitForInitialWorkbenchLayout();

    // Create initial workbench layout.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout
      .addPart('left', {relativeTo: MAIN_AREA, align: 'left', ratio: .2})
      .addPart('right', {relativeTo: 'main', align: 'right', ratio: .5})
      .addView('view.1', {partId: 'left', activateView: true})
      .addView('view.2', {partId: 'main', activateView: true})
      .addView('view.3', {partId: 'right', activateView: true}),
    );
    await waitUntilStable();

    // Assert initial workbench layout
    expect(fixture.debugElement.query(By.directive(WorkbenchLayoutComponent))).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'left', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: MAIN_AREA}),
          direction: 'row',
          ratio: .2,
        }),
      },
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          child2: new MPart({id: 'right', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });

    // Navigate using the Angular router.
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['path', 'to', 'outlet']}}]);
    await waitUntilStable();

    // Expect the layout not to be discarded.
    expect(fixture.debugElement.query(By.directive(WorkbenchLayoutComponent))).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'left', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: MAIN_AREA}),
          direction: 'row',
          ratio: .2,
        }),
      },
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          child2: new MPart({id: 'right', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });

    // Navigate using the Workbench router.
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'blank'});
    await waitUntilStable();

    // Expect the layout to be changed.
    expect(fixture.debugElement.query(By.directive(WorkbenchLayoutComponent))).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'left', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: MAIN_AREA}),
          direction: 'row',
          ratio: .2,
        }),
      },
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.2'}, {id: 'view.4'}], activeViewId: 'view.4'}),
          child2: new MPart({id: 'right', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
  });

  it('allows moving a view in the tabbar', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view', component: TestComponent},
        ]),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // GIVEN four views (view.1, view.2, view.3, view.4).
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'blank'});
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'blank'});
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'blank'});
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'blank'});

    // WHEN moving view.3 to position 0
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.3',
        viewUrlSegments: segments(['path/to/view']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        position: 'start',
      },
    });
    await waitUntilStable();

    // THEN expect view.3 to be moved: ['view.3', 'view.1', 'view.2', 'view.4']
    expect('view.3').toBeRegistered({partId: 'main', active: true});
    expect(TestBed.inject(WorkbenchPartRegistry).get('main').viewIds).toEqual(['view.3', 'view.1', 'view.2', 'view.4']);

    // WHEN moving view.3 to position 1
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.3',
        viewUrlSegments: segments(['path/to/view']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        position: 1,
      },
    });
    await waitUntilStable();

    // THEN expect view.3 not to be moved
    expect('view.3').toBeRegistered({partId: 'main', active: true});
    expect(TestBed.inject(WorkbenchPartRegistry).get('main').viewIds).toEqual(['view.3', 'view.1', 'view.2', 'view.4']);

    // WHEN moving view.3 to position 2
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.3',
        viewUrlSegments: segments(['path/to/view']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        position: 2,
      },
    });
    await waitUntilStable();

    // THEN view.3 to be moved as follows: ['view.1', 'view.3', 'view.2', 'view.4']
    expect('view.3').toBeRegistered({partId: 'main', active: true});
    expect(TestBed.inject(WorkbenchPartRegistry).get('main').viewIds).toEqual(['view.1', 'view.3', 'view.2', 'view.4']);

    // WHEN moving view.3 to position 3
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.3',
        viewUrlSegments: segments(['path/to/view']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        position: 3,
      },
    });
    await waitUntilStable();

    // THEN expect view.3 to be moved as follows: ['view.1', 'view.2', 'view.3', 'view.4']
    expect('view.3').toBeRegistered({partId: 'main', active: true});
    expect(TestBed.inject(WorkbenchPartRegistry).get('main').viewIds).toEqual(['view.1', 'view.2', 'view.3', 'view.4']);

    // WHEN moving view.3 to position 4
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.3',
        viewUrlSegments: segments(['path/to/view']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        position: 'end',
      },
    });
    await waitUntilStable();

    // THEN expect view.3 to be moved as follows: ['view.1', 'view.2', 'view.4', 'view.3']
    expect('view.3').toBeRegistered({partId: 'main', active: true});
    expect(TestBed.inject(WorkbenchPartRegistry).get('main').viewIds).toEqual(['view.1', 'view.2', 'view.4', 'view.3']);
  });

  it('allows to move a view to a new part in the east', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view/2']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'east',
        newPart: {id: 'EAST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: 'EAST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'EAST', active: true});
    expect('view.2').toHaveComponentState('B');
  });

  it('allows to move a view to a new part in the west', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the west
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view/2']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'west',
        newPart: {id: 'WEST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'WEST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          child2: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'WEST', active: true});
    expect('view.2').toHaveComponentState('B');
  });

  it('allows to move a view to a new part in the north', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 1 to a new part in the north
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view/2']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'north',
        newPart: {id: 'NORTH'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'NORTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          child2: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          direction: 'column',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'NORTH', active: true});
    expect('view.2').toHaveComponentState('B');
  });

  it('allows to move a view to a new part in the south', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 1 to a new part in the south
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view/2']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'south',
        newPart: {id: 'SOUTH'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: 'SOUTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'column',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'SOUTH', active: true});
    expect('view.2').toHaveComponentState('B');
  });

  it('disallows to move a view to a new part in the center', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 1 to a new part in the center
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view/2']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveComponentState('B');
  });

  it('allows to move views to another part', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/3', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveComponentState('B');

    // Add view 3
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/3']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.3', 'C');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.3'}], activeViewId: 'view.3'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: false});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'main', active: true});
    expect('view.3').toHaveComponentState('C');

    // Move view 3 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.3',
        viewUrlSegments: segments(['path/to/view/3']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'east',
        newPart: {id: 'EAST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
          child2: new MPart({id: 'EAST', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });

    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'EAST', active: true});
    expect('view.3').toHaveComponentState('C');

    // Move view 2 to the new part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view/2']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'EAST',
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: 'EAST', views: [{id: 'view.3'}, {id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'EAST', active: true});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'EAST', active: false});
    expect('view.3').toHaveComponentState('C');

    // Move view 1 to the new part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.1',
        viewUrlSegments: segments(['path/to/view/1']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'EAST',
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'EAST', views: [{id: 'view.3'}, {id: 'view.2'}, {id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });

    expect('view.1').toBeRegistered({partId: 'EAST', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'EAST', active: false});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'EAST', active: false});
    expect('view.3').toHaveComponentState('C');
  });

  it('allows to move the last view of a part to a new part in the east', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view/2']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'east',
        newPart: {id: 'EAST-1'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: 'EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });

    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'EAST-1', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the east of part EAST-1
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'EAST-1',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view/2']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'east',
        newPart: {id: 'EAST-2'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: 'EAST-2', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'EAST-2', active: true});
    expect('view.2').toHaveComponentState('B');
  });

  it('allows to move the last view of a part to a new part in the west', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view/2']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'east',
        newPart: {id: 'EAST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: 'EAST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });

    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'EAST', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the west of part 1
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'EAST',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view/2']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'west',
        newPart: {id: 'WEST-2'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'WEST-2', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          child2: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'WEST-2', active: true});
    expect('view.2').toHaveComponentState('B');
  });

  it('allows to move the last view of a part to a new part in the north', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view/2']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'east',
        newPart: {id: 'EAST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: 'EAST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'EAST', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the north of part 1
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'EAST',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view/2']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'north',
        newPart: {id: 'NORTH'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'NORTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          child2: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          direction: 'column',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'NORTH', active: true});
    expect('view.2').toHaveComponentState('B');
  });

  it('allows to move the last view of a part to a new part in the south', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view/2']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'east',
        newPart: {id: 'EAST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: 'EAST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'EAST', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the south of part 1
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'EAST',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view/2']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'south',
        newPart: {id: 'SOUTH'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: 'SOUTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'column',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'SOUTH', active: true});
    expect('view.2').toHaveComponentState('B');
  });

  it('allows to move a view around parts', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/3', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveComponentState('B');

    // Add view 3
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/3']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.3', 'C');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.3'}], activeViewId: 'view.3'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: false});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'main', active: true});
    expect('view.3').toHaveComponentState('C');

    // Move view 3 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.3',
        viewUrlSegments: segments(['path/to/view/3']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'east',
        newPart: {id: 'EAST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
          child2: new MPart({id: 'EAST', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });

    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'EAST', active: true});
    expect('view.3').toHaveComponentState('C');

    // Move view 2 to a new part in the south of part 2
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view/2']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'EAST',
        region: 'south',
        newPart: {id: 'SOUTH-EAST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MTreeNode({
            child1: new MPart({id: 'EAST', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            child2: new MPart({id: 'SOUTH-EAST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'column',
            ratio: .5,
          }),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'SOUTH-EAST', active: true});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'EAST', active: true});
    expect('view.3').toHaveComponentState('C');

    // Move view 2 to a new part in the south of part 1
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'SOUTH-EAST',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view/2']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        newPart: {id: 'SOUTH-WEST'},
        region: 'south',
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MTreeNode({
            child1: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MPart({id: 'SOUTH-WEST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'column',
            ratio: .5,
          }),
          child2: new MPart({id: 'EAST', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'SOUTH-WEST', active: true});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'EAST', active: true});
    expect('view.3').toHaveComponentState('C');
  });

  it('allows to move a view to a new part in the south and back to the initial part ', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the south
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view/2']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'south',
        newPart: {id: 'SOUTH'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: 'SOUTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'column',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'SOUTH', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 back to the initial part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'SOUTH',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view/2']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveComponentState('B');
  });

  it('allows to move a view to a new part in the east and then to the south of the initial part ', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view/2']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'east',
        newPart: {id: 'EAST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: 'EAST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'EAST', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the south
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'EAST',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view/2']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'south',
        newPart: {id: 'SOUTH'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: 'SOUTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'column',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'SOUTH', active: true});
    expect('view.2').toHaveComponentState('B');
  });

  it('allows to move a view to a new part in the west and then to the south of the initial part ', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the west
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view/2']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'west',
        newPart: {id: 'WEST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'WEST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          child2: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'WEST', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the south
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'WEST',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view/2']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'south',
        newPart: {id: 'SOUTH'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: 'SOUTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'column',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'SOUTH', active: true});
    expect('view.2').toHaveComponentState('B');
  });

  it('should open the same view multiple times', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });

    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveComponentState('B');

    // Add view 2 again
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2'], {partId: 'main'});
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveComponentState('B');
  });

  it('should open the same view multiple times', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveComponentState('B');

    // Add view 2 again
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2'], {partId: 'main', target: 'blank'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.3', 'C');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.3'}], activeViewId: 'view.3'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: false});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'main', active: true});
    expect('view.3').toHaveComponentState('C');
  });

  it('should open views to the right and to the left, and then close them', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/3', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/4', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'main', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view/2']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'east',
        newPart: {id: 'EAST-1'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: 'EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'EAST-1', active: true});
    expect('view.2').toHaveComponentState('B');

    // Add view 3 to part EAST-1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/3']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.3', 'C');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: 'EAST-1', views: [{id: 'view.2'}, {id: 'view.3'}], activeViewId: 'view.3'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'EAST-1', active: false});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'EAST-1', active: true});
    expect('view.3').toHaveComponentState('C');

    // Move view 3 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'EAST-1',
        viewId: 'view.3',
        viewUrlSegments: segments(['path/to/view/3']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'EAST-1',
        region: 'east',
        newPart: {id: 'EAST-2'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MTreeNode({
            child1: new MPart({id: 'EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: new MPart({id: 'EAST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            direction: 'row',
            ratio: .5,
          }),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'EAST-1', active: true});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'EAST-2', active: true});
    expect('view.3').toHaveComponentState('C');

    // Add view 4 to part EAST-2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/4']);
    await waitUntilStable();
    enterComponentState(fixture, 'view.4', 'D');

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MTreeNode({
            child1: new MPart({id: 'EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: new MPart({id: 'EAST-2', views: [{id: 'view.3'}, {id: 'view.4'}], activeViewId: 'view.4'}),
            direction: 'row',
            ratio: .5,
          }),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'EAST-1', active: true});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'EAST-2', active: false});
    expect('view.3').toHaveComponentState('C');
    expect('view.4').toBeRegistered({partId: 'EAST-2', active: true});
    expect('view.4').toHaveComponentState('D');

    // Move view 4 to a new part in the west
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'EAST-2',
        viewId: 'view.4',
        viewUrlSegments: segments(['path/to/view/4']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'west',
        newPart: {id: 'WEST-1'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MTreeNode({
            child1: new MPart({id: 'WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
            child2: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            direction: 'row',
            ratio: .5,
          }),
          child2: new MTreeNode({
            child1: new MPart({id: 'EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: new MPart({id: 'EAST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            direction: 'row',
            ratio: .5,
          }),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'EAST-1', active: true});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'EAST-2', active: true});
    expect('view.3').toHaveComponentState('C');
    expect('view.4').toBeRegistered({partId: 'WEST-1', active: true});
    expect('view.4').toHaveComponentState('D');

    // Move view 3 to a new part in the west
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'EAST-2',
        viewId: 'view.3',
        viewUrlSegments: segments(['path/to/view/3']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'WEST-1',
        region: 'west',
        newPart: {id: 'WEST-2'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MTreeNode({
            child1: new MTreeNode({
              child1: new MPart({id: 'WEST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
              child2: new MPart({id: 'WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
              direction: 'row',
              ratio: .5,
            }),
            child2: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            direction: 'row',
            ratio: .5,
          }),
          child2: new MPart({id: 'EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'EAST-1', active: true});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'WEST-2', active: true});
    expect('view.3').toHaveComponentState('C');
    expect('view.4').toBeRegistered({partId: 'WEST-1', active: true});
    expect('view.4').toHaveComponentState('D');

    // Move view 2 to a new part in the north
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'EAST-1',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view/2']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'north',
        newPart: {id: 'NORTH-1'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MTreeNode({
            child1: new MPart({id: 'WEST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            child2: new MPart({id: 'WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
            direction: 'row',
            ratio: .5,
          }),
          child2: new MTreeNode({
            child1: new MPart({id: 'NORTH-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            direction: 'column',
            ratio: .5,
          }),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toBeRegistered({partId: 'main', active: true});
    expect('view.1').toHaveComponentState('A');

    expect('view.2').toBeRegistered({partId: 'NORTH-1', active: true});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'WEST-2', active: true});
    expect('view.3').toHaveComponentState('C');
    expect('view.4').toBeRegistered({partId: 'WEST-1', active: true});
    expect('view.4').toHaveComponentState('D');

    // Close view 1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1'], {close: true});
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MTreeNode({
            child1: new MPart({id: 'WEST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            child2: new MPart({id: 'WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
            direction: 'row',
            ratio: .5,
          }),
          child2: new MPart({id: 'NORTH-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').not.toBeRegistered({partId: 'main', active: true});
    expect('view.2').toBeRegistered({partId: 'NORTH-1', active: true});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'WEST-2', active: true});
    expect('view.3').toHaveComponentState('C');
    expect('view.4').toBeRegistered({partId: 'WEST-1', active: true});
    expect('view.4').toHaveComponentState('D');

    // Close view 3
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/3'], {close: true});
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
          child2: new MPart({id: 'NORTH-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').not.toBeRegistered({partId: 'main', active: true});
    expect('view.2').toBeRegistered({partId: 'NORTH-1', active: true});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').not.toBeRegistered({partId: 'WEST-2', active: true});
    expect('view.4').toBeRegistered({partId: 'WEST-1', active: true});
    expect('view.4').toHaveComponentState('D');

    // Close view 4
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/4'], {close: true});
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'NORTH-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.1').not.toBeRegistered({partId: 'main', active: true});
    expect('view.2').toBeRegistered({partId: 'NORTH-1', active: true});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').not.toBeRegistered({partId: 'WEST-2', active: true});
    expect('view.4').not.toBeRegistered({partId: 'WEST-1', active: true});
  });

  it('should detach views before being re-parented in the DOM (1)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Create initial workbench layout.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout
      .addView('view.1', {partId: 'main'})
      .addView('view.2', {partId: 'main'})
      .addView('view.3', {partId: 'main'})
      .navigateView('view.1', ['path/to/view'])
      .navigateView('view.2', ['path/to/view'])
      .navigateView('view.3', ['path/to/view'])
      .activateView('view.3'),
    );
    await waitUntilStable();

    // Enter transient states.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.activateView('view.1'));
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.activateView('view.2'));
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.activateView('view.3'));
    await waitUntilStable();
    enterComponentState(fixture, 'view.3', 'C');

    // Move view.2 to the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'east',
        newPart: {id: 'right'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.3'}], activeViewId: 'view.3'}),
          child2: new MPart({id: 'right', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toHaveComponentState('C');

    // Move view.3 to the north of view.2
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.3',
        viewUrlSegments: segments(['path/to/view']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'right',
        region: 'north',
        newPart: {id: 'top-right'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MTreeNode({
            child1: new MPart({id: 'top-right', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            child2: new MPart({id: 'right', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'column',
            ratio: .5,
          }),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toHaveComponentState('C');
  });

  it('should detach views before being re-parented in the DOM (2)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Create initial workbench layout.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout
      .addView('view.1', {partId: 'main'})
      .addView('view.2', {partId: 'main'})
      .addView('view.3', {partId: 'main'})
      .navigateView('view.1', ['path/to/view'])
      .navigateView('view.2', ['path/to/view'])
      .navigateView('view.3', ['path/to/view'])
      .activateView('view.3'),
    );
    await waitUntilStable();

    // Enter transient states.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.activateView('view.1'));
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.activateView('view.2'));
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.activateView('view.3'));
    await waitUntilStable();
    enterComponentState(fixture, 'view.3', 'C');

    // Move view 2 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'east',
        newPart: {id: 'EAST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.3'}], activeViewId: 'view.3'}),
          child2: new MPart({id: 'EAST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toHaveComponentState('C');

    // Move view 2 to a new part in the west of the initial part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'EAST',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'west',
        newPart: {id: 'WEST-2'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'WEST-2', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          child2: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.3'}], activeViewId: 'view.3'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toHaveComponentState('C');
  });

  it('should detach views before being re-parented in the DOM (3)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Create initial workbench layout.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout
      .addView('view.1', {partId: 'main'})
      .addView('view.2', {partId: 'main'})
      .addView('view.3', {partId: 'main'})
      .addView('view.4', {partId: 'main'})
      .navigateView('view.1', ['path/to/view'])
      .navigateView('view.2', ['path/to/view'])
      .navigateView('view.3', ['path/to/view'])
      .navigateView('view.4', ['path/to/view'])
      .activateView('view.4'),
    );
    await waitUntilStable();

    // Enter transient states.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.activateView('view.1'));
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.activateView('view.2'));
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.activateView('view.3'));
    await waitUntilStable();
    enterComponentState(fixture, 'view.3', 'C');

    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.activateView('view.4'));
    await waitUntilStable();
    enterComponentState(fixture, 'view.4', 'D');

    // Move view 2 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'east',
        newPart: {id: 'EAST-1'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.3'}, {id: 'view.4'}], activeViewId: 'view.4'}),
          child2: new MPart({id: 'EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toHaveComponentState('C');
    expect('view.4').toHaveComponentState('D');

    // Move view 3 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.3',
        viewUrlSegments: segments(['path/to/view']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'EAST-1',
        region: 'east',
        newPart: {id: 'EAST-2'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.4'}], activeViewId: 'view.4'}),
          child2: new MTreeNode({
            child1: new MPart({id: 'EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: new MPart({id: 'EAST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            direction: 'row',
            ratio: .5,
          }),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toHaveComponentState('C');
    expect('view.4').toHaveComponentState('D');

    // Move view 4 to a new part in the west
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.4',
        viewUrlSegments: segments(['path/to/view']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'west',
        newPart: {id: 'WEST-1'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MTreeNode({
            child1: new MPart({id: 'WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
            child2: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            direction: 'row',
            ratio: .5,
          }),
          child2: new MTreeNode({
            child1: new MPart({id: 'EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: new MPart({id: 'EAST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            direction: 'row',
            ratio: .5,
          }),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toHaveComponentState('C');
    expect('view.4').toHaveComponentState('D');

    // Move view 3 to a new part in the west
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'EAST-2',
        viewId: 'view.3',
        viewUrlSegments: segments(['path/to/view']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'WEST-1',
        region: 'west',
        newPart: {id: 'WEST-2'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MTreeNode({
            child1: new MTreeNode({
              child1: new MPart({id: 'WEST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
              child2: new MPart({id: 'WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
              direction: 'row',
              ratio: .5,
            }),
            child2: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            direction: 'row',
            ratio: .5,
          }),
          child2: new MPart({id: 'EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toHaveComponentState('C');
    expect('view.4').toHaveComponentState('D');

    // Move view 2 to a new part in the north
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'EAST-1',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'north',
        newPart: {id: 'NORTH-1'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MTreeNode({
            child1: new MPart({id: 'WEST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            child2: new MPart({id: 'WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
            direction: 'row',
            ratio: .5,
          }),
          child2: new MTreeNode({
            child1: new MPart({id: 'NORTH-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            direction: 'column',
            ratio: .5,
          }),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toHaveComponentState('C');
    expect('view.4').toHaveComponentState('D');

    // Close view 1
    await TestBed.inject(WorkbenchRouter).navigate([], {target: 'view.1', close: true});
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MTreeNode({
            child1: new MPart({id: 'WEST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            child2: new MPart({id: 'WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
            direction: 'row',
            ratio: .5,
          }),
          child2: new MPart({id: 'NORTH-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toHaveComponentState('C');
    expect('view.4').toHaveComponentState('D');

    // Close view 3
    await TestBed.inject(WorkbenchRouter).navigate([], {target: 'view.3', close: true});
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
          child2: new MPart({id: 'NORTH-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.2').toHaveComponentState('B');
    expect('view.4').toHaveComponentState('D');

    // Close view 4
    await TestBed.inject(WorkbenchRouter).navigate([], {target: 'view.4', close: true});
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'NORTH-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
      },
    });
    expect('view.2').toHaveComponentState('B');
  });

  it('should detach views before being re-parented in the DOM (4)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Create initial workbench layout.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout
      .addView('view.1', {partId: 'main'})
      .addView('view.2', {partId: 'main'})
      .addView('view.3', {partId: 'main'})
      .navigateView('view.1', ['path/to/view'])
      .navigateView('view.2', ['path/to/view'])
      .navigateView('view.3', ['path/to/view'])
      .activateView('view.3'),
    );
    await waitUntilStable();

    // Enter transient states.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.activateView('view.1'));
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.activateView('view.2'));
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.activateView('view.3'));
    await waitUntilStable();
    enterComponentState(fixture, 'view.3', 'C');

    // Move view 3 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.3',
        viewUrlSegments: segments(['path/to/view']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'east',
        newPart: {id: 'EAST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
          child2: new MPart({id: 'EAST', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toHaveComponentState('C');

    // Move view 2 to a new part in the south of EAST part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'EAST',
        region: 'south',
        newPart: {id: 'SOUTH'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MTreeNode({
            child1: new MPart({id: 'EAST', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            child2: new MPart({id: 'SOUTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'column',
            ratio: .5,
          }),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toHaveComponentState('C');

    // Move view 2 to a new part in the north of EAST part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'EAST',
        region: 'north',
        newPart: {id: 'NORTH'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MTreeNode({
            child1: new MPart({id: 'NORTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: new MPart({id: 'EAST', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            direction: 'column',
            ratio: .5,
          }),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toHaveComponentState('C');
  });

  it('should detach views before being re-parented in the DOM (5)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Create initial workbench layout.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout
      .addView('view.1', {partId: 'main'})
      .addView('view.2', {partId: 'main'})
      .addView('view.3', {partId: 'main'})
      .navigateView('view.1', ['path/to/view'])
      .navigateView('view.2', ['path/to/view'])
      .navigateView('view.3', ['path/to/view'])
      .activateView('view.3'),
    );
    await waitUntilStable();

    // Enter transient states.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.activateView('view.1'));
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.activateView('view.2'));
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.activateView('view.3'));
    await waitUntilStable();
    enterComponentState(fixture, 'view.3', 'C');

    // Move view 3 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.3',
        viewUrlSegments: segments(['path/to/view']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'east',
        newPart: {id: 'EAST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
          child2: new MPart({id: 'EAST', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toHaveComponentState('C');

    // Move view 2 to a new part in the north of EAST part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'EAST',
        region: 'north',
        newPart: {id: 'NORTH'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MTreeNode({
            child1: new MPart({id: 'NORTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: new MPart({id: 'EAST', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            direction: 'column',
            ratio: .5,
          }),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toHaveComponentState('C');

    // Move view 3 to a new part in the south of NORTH part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'EAST',
        viewId: 'view.3',
        viewUrlSegments: segments(['path/to/view']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'NORTH',
        region: 'south',
        newPart: {id: 'SOUTH'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MTreeNode({
            child1: new MPart({id: 'NORTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: new MPart({id: 'SOUTH', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            direction: 'column',
            ratio: .5,
          }),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toHaveComponentState('C');
  });

  it('should detach views before being re-parented in the DOM (6)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchLayoutComponent));
    await waitForInitialWorkbenchLayout();

    // Create initial workbench layout.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout
      .addView('view.1', {partId: 'main'})
      .addView('view.2', {partId: 'main'})
      .navigateView('view.1', ['path/to/view'])
      .navigateView('view.2', ['path/to/view'])
      .activateView('view.2'),
    );
    await waitUntilStable();

    // Enter transient states.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.activateView('view.1'));
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.activateView('view.2'));
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    // Move view 2 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'east',
        newPart: {id: 'EAST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          child2: new MPart({id: 'EAST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the west of initial part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'EAST',
        viewId: 'view.2',
        viewUrlSegments: segments(['path/to/view']),
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'main',
        region: 'west',
        newPart: {id: 'WEST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          child1: new MPart({id: 'WEST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
          child2: new MPart({id: 'main', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
          direction: 'row',
          ratio: .5,
        }),
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');
  });
});

/****************************************************************************************************
 * Fixtures                                                                                         *
 ****************************************************************************************************/
@Component({
  selector: 'spec-router-outlet-plus-workbench-fixture',
  template: `
    <section class="outlet">
      <router-outlet name="outlet"/>
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
    WorkbenchComponent,
  ],
})
class RouterOutletPlusWorkbenchTestFixtureComponent {
}

