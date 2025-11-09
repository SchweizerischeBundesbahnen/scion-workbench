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
import {WorkbenchRouter} from '../../routing/workbench-router.service';
import {MPart, MTreeNode, toEqualWorkbenchLayoutCustomMatcher} from '../../testing/jasmine/matcher/to-equal-workbench-layout.matcher';
import {toBeRegisteredCustomMatcher} from '../../testing/jasmine/matcher/to-be-registered.matcher';
import {Component} from '@angular/core';
import {expect} from '../../testing/jasmine/matcher/custom-matchers.definition';
import {ViewDragService} from '../../view-dnd/view-drag.service';
import {MAIN_AREA} from '../workbench-layout';
import {toHaveComponentStateCustomMatcher} from '../../testing/jasmine/matcher/to-have-component-state.matcher';
import {enterComponentState, TestComponent, withComponentContent, withComponentStateInputElement} from '../../testing/test.component';
import {segments, styleFixture, waitUntilStable, waitUntilWorkbenchStarted} from '../../testing/testing.util';
import {WorkbenchPartRegistry} from '../../part/workbench-part.registry';
import {WORKBENCH_ID} from '../../workbench.identifiers';
import {provideWorkbenchForTest} from '../../testing/workbench.provider';
import {WorkbenchComponent} from '../../workbench.component';
import {firstValueFrom, ReplaySubject, Subject} from 'rxjs';
import {WorkbenchService} from '../../workbench.service';
import {WorkbenchView} from '../../view/workbench-view.model';
import {throwError} from '../../common/throw-error.util';
import {ɵWorkbenchService} from '../../ɵworkbench.service';

describe('WorkbenchLayout Component', () => {

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
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial'}),
        provideRouter([
          {path: 'path/to/view', component: TestComponent},
          {path: 'path/to/outlet', component: TestComponent, outlet: 'outlet', providers: [withComponentContent('routed content')]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(RouterOutletPlusWorkbenchTestFixtureComponent));
    await waitUntilWorkbenchStarted();

    // Create initial workbench layout.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout
      .addPart('part.left', {relativeTo: MAIN_AREA, align: 'left', ratio: .2})
      .addPart('part.right', {relativeTo: 'part.initial', align: 'right', ratio: .5})
      .addView('view.1', {partId: 'part.left', activateView: true})
      .addView('view.2', {partId: 'part.initial', activateView: true})
      .addView('view.3', {partId: 'part.right', activateView: true}),
    );
    await waitUntilStable();

    // Assert initial workbench layout
    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.left', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MPart({id: MAIN_AREA}),
            direction: 'row',
            ratio: .2,
          }),
          activePartId: MAIN_AREA,
        },
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: new MPart({id: 'part.right', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            direction: 'row',
            ratio: .5,
          }),
          activePartId: 'part.initial',
        },
      },
    });

    // Navigate using the Angular router.
    await TestBed.inject(Router).navigate([{outlets: {outlet: ['path', 'to', 'outlet']}}]);
    await waitUntilStable();

    // Expect the layout not to be discarded.
    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.left', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MPart({id: MAIN_AREA}),
            direction: 'row',
            ratio: .2,
          }),
          activePartId: MAIN_AREA,
        },
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: new MPart({id: 'part.right', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            direction: 'row',
            ratio: .5,
          }),
          activePartId: 'part.initial',
        },
      },
    });

    // Navigate using the Workbench router.
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.4'});
    await waitUntilStable();

    // Expect the layout to be changed.
    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.left', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MPart({id: MAIN_AREA}),
            direction: 'row',
            ratio: .2,
          }),
          activePartId: MAIN_AREA,
        },
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.2'}, {id: 'view.4'}], activeViewId: 'view.4'}),
            child2: new MPart({id: 'part.right', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            direction: 'row',
            ratio: .5,
          }),
          activePartId: 'part.initial',
        },
      },
    });
  });

  it('allows moving a view in the tabbar', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial', startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view', component: TestComponent},
        ]),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // GIVEN four views (view.1, view.2, view.3, view.4).
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.1'});
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.2'});
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.3'});
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view'], {target: 'view.4'});

    // WHEN moving view.3 to position 0
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.initial',
        viewId: 'view.3',
        navigation: {path: segments(['path/to/view'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        position: 'start',
      },
    });
    await waitUntilStable();

    // THEN expect view.3 to be moved: ['view.3', 'view.1', 'view.2', 'view.4']
    expect('view.3').toBeRegistered({partId: 'part.initial', active: true});
    expect(TestBed.inject(WorkbenchPartRegistry).get('part.initial').views().map(view => view.id)).toEqual(['view.3', 'view.1', 'view.2', 'view.4']);

    // WHEN moving view.3 to position 1
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.initial',
        viewId: 'view.3',
        navigation: {path: segments(['path/to/view'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        position: 1,
      },
    });
    await waitUntilStable();

    // THEN expect view.3 not to be moved
    expect('view.3').toBeRegistered({partId: 'part.initial', active: true});
    expect(TestBed.inject(WorkbenchPartRegistry).get('part.initial').views().map(view => view.id)).toEqual(['view.3', 'view.1', 'view.2', 'view.4']);

    // WHEN moving view.3 to position 2
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.initial',
        viewId: 'view.3',
        navigation: {path: segments(['path/to/view'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        position: 2,
      },
    });
    await waitUntilStable();

    // THEN view.3 to be moved as follows: ['view.1', 'view.3', 'view.2', 'view.4']
    expect('view.3').toBeRegistered({partId: 'part.initial', active: true});
    expect(TestBed.inject(WorkbenchPartRegistry).get('part.initial').views().map(view => view.id)).toEqual(['view.1', 'view.3', 'view.2', 'view.4']);

    // WHEN moving view.3 to position 3
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.initial',
        viewId: 'view.3',
        navigation: {path: segments(['path/to/view'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        position: 3,
      },
    });
    await waitUntilStable();

    // THEN expect view.3 to be moved as follows: ['view.1', 'view.2', 'view.3', 'view.4']
    expect('view.3').toBeRegistered({partId: 'part.initial', active: true});
    expect(TestBed.inject(WorkbenchPartRegistry).get('part.initial').views().map(view => view.id)).toEqual(['view.1', 'view.2', 'view.3', 'view.4']);

    // WHEN moving view.3 to position 4
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.initial',
        viewId: 'view.3',
        navigation: {path: segments(['path/to/view'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        position: 'end',
      },
    });
    await waitUntilStable();

    // THEN expect view.3 to be moved as follows: ['view.1', 'view.2', 'view.4', 'view.3']
    expect('view.3').toBeRegistered({partId: 'part.initial', active: true});
    expect(TestBed.inject(WorkbenchPartRegistry).get('part.initial').views().map(view => view.id)).toEqual(['view.1', 'view.2', 'view.4', 'view.3']);
  });

  it('allows to move a view to a new part in the east', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial', startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Add view.1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1'], {target: 'view.1'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view.2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2'], {target: 'view.2'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.initial',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view/2'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'east',
        newPart: {id: 'part.EAST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MPart({id: 'part.EAST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.EAST', active: true});
    expect('view.2').toHaveComponentState('B');
  });

  it('allows to move a view to a new part in the west', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial', startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Add view.1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1'], {target: 'view.1'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view.2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2'], {target: 'view.2'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the west
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.initial',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view/2'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'west',
        newPart: {id: 'part.WEST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.WEST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.WEST', active: true});
    expect('view.2').toHaveComponentState('B');
  });

  it('allows to move a view to a new part in the north', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial', startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Add view.1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1'], {target: 'view.1'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view.2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2'], {target: 'view.2'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 1 to a new part in the north
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.initial',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view/2'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'north',
        newPart: {id: 'part.NORTH'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.NORTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            direction: 'column',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.NORTH', active: true});
    expect('view.2').toHaveComponentState('B');
  });

  it('allows to move a view to a new part in the south', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial', startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Add view.1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1'], {target: 'view.1'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view.2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2'], {target: 'view.2'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 1 to a new part in the south
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.initial',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view/2'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'south',
        newPart: {id: 'part.SOUTH'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MPart({id: 'part.SOUTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'column',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.SOUTH', active: true});
    expect('view.2').toHaveComponentState('B');
  });

  it('disallows to move a view to a new part in the center', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial', startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Add view.1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1'], {target: 'view.1'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view.2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2'], {target: 'view.2'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 1 to a new part in the center
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.initial',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view/2'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.2').toHaveComponentState('B');
  });

  it('allows to move views to another part', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial', startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/3', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Add view.1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1'], {target: 'view.1'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view.2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2'], {target: 'view.2'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.2').toHaveComponentState('B');

    // Add view.3
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/3'], {target: 'view.3'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.3', 'C');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.3'}], activeViewId: 'view.3'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.initial', active: false});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.3').toHaveComponentState('C');

    // Move view 3 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.initial',
        viewId: 'view.3',
        navigation: {path: segments(['path/to/view/3'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'east',
        newPart: {id: 'part.EAST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
            child2: new MPart({id: 'part.EAST', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });

    expect('view.1').toBeRegistered({partId: 'part.initial', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'part.EAST', active: true});
    expect('view.3').toHaveComponentState('C');

    // Move view 2 to the new part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.initial',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view/2'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.EAST',
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MPart({id: 'part.EAST', views: [{id: 'view.3'}, {id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.EAST', active: true});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'part.EAST', active: false});
    expect('view.3').toHaveComponentState('C');

    // Move view 1 to the new part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.initial',
        viewId: 'view.1',
        navigation: {path: segments(['path/to/view/1'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.EAST',
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.EAST', views: [{id: 'view.3'}, {id: 'view.2'}, {id: 'view.1'}], activeViewId: 'view.1'}),
        },
      },
    });

    expect('view.1').toBeRegistered({partId: 'part.EAST', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.EAST', active: false});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'part.EAST', active: false});
    expect('view.3').toHaveComponentState('C');
  });

  it('allows to move the last view of a part to a new part in the east', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial', startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Add view.1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1'], {target: 'view.1'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view.2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2'], {target: 'view.2'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.initial',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view/2'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'east',
        newPart: {id: 'part.EAST-1'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MPart({id: 'part.EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });

    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.EAST-1', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the east of part EAST-1
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.EAST-1',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view/2'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'east',
        newPart: {id: 'part.EAST-2'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MPart({id: 'part.EAST-2', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.EAST-2', active: true});
    expect('view.2').toHaveComponentState('B');
  });

  it('allows to move the last view of a part to a new part in the west', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial', startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Add view.1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1'], {target: 'view.1'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view.2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2'], {target: 'view.2'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.initial',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view/2'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'east',
        newPart: {id: 'part.EAST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MPart({id: 'part.EAST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });

    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.EAST', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the west of part 1
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.EAST',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view/2'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'west',
        newPart: {id: 'part.WEST-2'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.WEST-2', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.WEST-2', active: true});
    expect('view.2').toHaveComponentState('B');
  });

  it('allows to move the last view of a part to a new part in the north', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial', startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Add view.1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1'], {target: 'view.1'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view.2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2'], {target: 'view.2'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.initial',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view/2'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'east',
        newPart: {id: 'part.EAST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MPart({id: 'part.EAST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.EAST', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the north of part 1
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.EAST',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view/2'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'north',
        newPart: {id: 'part.NORTH'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.NORTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            direction: 'column',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.NORTH', active: true});
    expect('view.2').toHaveComponentState('B');
  });

  it('allows to move the last view of a part to a new part in the south', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial', startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Add view.1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1'], {target: 'view.1'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view.2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2'], {target: 'view.2'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.initial',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view/2'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'east',
        newPart: {id: 'part.EAST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MPart({id: 'part.EAST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.EAST', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the south of part 1
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.EAST',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view/2'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'south',
        newPart: {id: 'part.SOUTH'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MPart({id: 'part.SOUTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'column',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.SOUTH', active: true});
    expect('view.2').toHaveComponentState('B');
  });

  it('allows to move a view around parts', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial', startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/3', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Add view.1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1'], {target: 'view.1'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view.2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2'], {target: 'view.2'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.2').toHaveComponentState('B');

    // Add view.3
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/3'], {target: 'view.3'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.3', 'C');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.3'}], activeViewId: 'view.3'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.initial', active: false});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.3').toHaveComponentState('C');

    // Move view 3 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.initial',
        viewId: 'view.3',
        navigation: {path: segments(['path/to/view/3'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'east',
        newPart: {id: 'part.EAST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
            child2: new MPart({id: 'part.EAST', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });

    expect('view.1').toBeRegistered({partId: 'part.initial', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'part.EAST', active: true});
    expect('view.3').toHaveComponentState('C');

    // Move view 2 to a new part in the south of part 2
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.initial',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view/2'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.EAST',
        region: 'south',
        newPart: {id: 'part.SOUTH-EAST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MTreeNode({
              child1: new MPart({id: 'part.EAST', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
              child2: new MPart({id: 'part.SOUTH-EAST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
              direction: 'column',
              ratio: .5,
            }),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.SOUTH-EAST', active: true});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'part.EAST', active: true});
    expect('view.3').toHaveComponentState('C');

    // Move view 2 to a new part in the south of part 1
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.SOUTH-EAST',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view/2'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        newPart: {id: 'part.SOUTH-WEST'},
        region: 'south',
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MTreeNode({
              child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
              child2: new MPart({id: 'part.SOUTH-WEST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
              direction: 'column',
              ratio: .5,
            }),
            child2: new MPart({id: 'part.EAST', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.SOUTH-WEST', active: true});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'part.EAST', active: true});
    expect('view.3').toHaveComponentState('C');
  });

  it('allows to move a view to a new part in the south and back to the initial part ', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial', startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Add view.1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1'], {target: 'view.1'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view.2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2'], {target: 'view.2'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the south
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.initial',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view/2'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'south',
        newPart: {id: 'part.SOUTH'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MPart({id: 'part.SOUTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'column',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.SOUTH', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 back to the initial part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.SOUTH',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view/2'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.2').toHaveComponentState('B');
  });

  it('allows to move a view to a new part in the east and then to the south of the initial part ', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial', startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Add view.1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1'], {target: 'view.1'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view.2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2'], {target: 'view.2'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.initial',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view/2'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'east',
        newPart: {id: 'part.EAST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MPart({id: 'part.EAST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.EAST', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the south
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.EAST',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view/2'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'south',
        newPart: {id: 'part.SOUTH'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MPart({id: 'part.SOUTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'column',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.SOUTH', active: true});
    expect('view.2').toHaveComponentState('B');
  });

  it('allows to move a view to a new part in the west and then to the south of the initial part ', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial', startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Add view.1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1'], {target: 'view.1'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view.2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2'], {target: 'view.2'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the west
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.initial',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view/2'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'west',
        newPart: {id: 'part.WEST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.WEST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.WEST', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the south
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.WEST',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view/2'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'south',
        newPart: {id: 'part.SOUTH'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MPart({id: 'part.SOUTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'column',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.SOUTH', active: true});
    expect('view.2').toHaveComponentState('B');
  });

  it('should open the same view multiple times (target=auto)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial', startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1'], {cssClass: 'testee-1'});
    await waitUntilStable();
    const testeeView1 = findView({cssClass: 'testee-1'});
    enterComponentState(fixture, testeeView1.id, 'A');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: testeeView1.id}], activeViewId: testeeView1.id}),
        },
      },
    });

    expect(testeeView1.id).toBeRegistered({partId: 'part.initial', active: true});
    expect(testeeView1.id).toHaveComponentState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2'], {cssClass: 'testee-2'});
    await waitUntilStable();
    const testeeView2 = findView({cssClass: 'testee-2'});
    enterComponentState(fixture, testeeView2.id, 'B');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: testeeView1.id}, {id: testeeView2.id}], activeViewId: testeeView2.id}),
        },
      },
    });
    expect(testeeView1.id).toBeRegistered({partId: 'part.initial', active: false});
    expect(testeeView1.id).toHaveComponentState('A');
    expect(testeeView2.id).toBeRegistered({partId: 'part.initial', active: true});
    expect(testeeView2.id).toHaveComponentState('B');

    // Add view 2 again (target auto)
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2'], {partId: 'part.initial', cssClass: 'testee-3'});
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: testeeView1.id}, {id: testeeView2.id}], activeViewId: testeeView2.id}),
        },
      },
    });
    expect(testeeView1.id).toBeRegistered({partId: 'part.initial', active: false});
    expect(testeeView1.id).toHaveComponentState('A');
    expect(testeeView2.id).toBeRegistered({partId: 'part.initial', active: true});
    expect(testeeView2.id).toHaveComponentState('B');
  });

  it('should open the same view multiple times (target=blank)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial', startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Add view 1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1'], {cssClass: 'testee-1'});
    await waitUntilStable();
    const testeeView1 = findView({cssClass: 'testee-1'});
    enterComponentState(fixture, testeeView1.id, 'A');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: testeeView1.id}], activeViewId: testeeView1.id}),
        },
      },
    });
    expect(testeeView1.id).toBeRegistered({partId: 'part.initial', active: true});
    expect(testeeView1.id).toHaveComponentState('A');

    // Add view 2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2'], {cssClass: 'testee-2'});
    await waitUntilStable();
    const testeeView2 = findView({cssClass: 'testee-2'});
    enterComponentState(fixture, testeeView2.id, 'B');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: testeeView1.id}, {id: testeeView2.id}], activeViewId: testeeView2.id}),
        },
      },
    });
    expect(testeeView1.id).toBeRegistered({partId: 'part.initial', active: false});
    expect(testeeView1.id).toHaveComponentState('A');
    expect(testeeView2.id).toBeRegistered({partId: 'part.initial', active: true});
    expect(testeeView2.id).toHaveComponentState('B');

    // Add view 2 again (target blank)
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2'], {partId: 'part.initial', target: 'blank', cssClass: 'testee-3'});
    await waitUntilStable();
    const testeeView3 = findView({cssClass: 'testee-3'});
    enterComponentState(fixture, testeeView3.id, 'C');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: testeeView1.id}, {id: testeeView2.id}, {id: testeeView3.id}], activeViewId: testeeView3.id}),
        },
      },
    });
    expect(testeeView1.id).toBeRegistered({partId: 'part.initial', active: false});
    expect(testeeView1.id).toHaveComponentState('A');
    expect(testeeView2.id).toBeRegistered({partId: 'part.initial', active: false});
    expect(testeeView2.id).toHaveComponentState('B');
    expect(testeeView3.id).toBeRegistered({partId: 'part.initial', active: true});
    expect(testeeView3.id).toHaveComponentState('C');
  });

  it('should open views to the right and to the left, and then close them', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial', startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view/1', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/2', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/3', component: TestComponent, providers: [withComponentStateInputElement()]},
          {path: 'path/to/view/4', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Add view.1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1'], {target: 'view.1'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.1', 'A');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');

    // Add view.2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2'], {target: 'view.2'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.2', 'B');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: false});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.initial',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view/2'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'east',
        newPart: {id: 'part.EAST-1'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MPart({id: 'part.EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.EAST-1', active: true});
    expect('view.2').toHaveComponentState('B');

    // Add view.3 to part EAST-1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/3'], {target: 'view.3'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.3', 'C');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MPart({id: 'part.EAST-1', views: [{id: 'view.2'}, {id: 'view.3'}], activeViewId: 'view.3'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.EAST-1', active: false});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'part.EAST-1', active: true});
    expect('view.3').toHaveComponentState('C');

    // Move view 3 to a new part in the east
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.EAST-1',
        viewId: 'view.3',
        navigation: {path: segments(['path/to/view/3'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.EAST-1',
        region: 'east',
        newPart: {id: 'part.EAST-2'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MTreeNode({
              child1: new MPart({id: 'part.EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
              child2: new MPart({id: 'part.EAST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
              direction: 'row',
              ratio: .5,
            }),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.EAST-1', active: true});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'part.EAST-2', active: true});
    expect('view.3').toHaveComponentState('C');

    // Add view.4 to part EAST-2
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/4'], {target: 'view.4'});
    await waitUntilStable();
    enterComponentState(fixture, 'view.4', 'D');

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MTreeNode({
              child1: new MPart({id: 'part.EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
              child2: new MPart({id: 'part.EAST-2', views: [{id: 'view.3'}, {id: 'view.4'}], activeViewId: 'view.4'}),
              direction: 'row',
              ratio: .5,
            }),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.EAST-1', active: true});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'part.EAST-2', active: false});
    expect('view.3').toHaveComponentState('C');
    expect('view.4').toBeRegistered({partId: 'part.EAST-2', active: true});
    expect('view.4').toHaveComponentState('D');

    // Move view.4 to a new part in the west
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.EAST-2',
        viewId: 'view.4',
        navigation: {path: segments(['path/to/view/4'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'west',
        newPart: {id: 'part.WEST-1'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MTreeNode({
              child1: new MPart({id: 'part.WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
              child2: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
              direction: 'row',
              ratio: .5,
            }),
            child2: new MTreeNode({
              child1: new MPart({id: 'part.EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
              child2: new MPart({id: 'part.EAST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
              direction: 'row',
              ratio: .5,
            }),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.EAST-1', active: true});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'part.EAST-2', active: true});
    expect('view.3').toHaveComponentState('C');
    expect('view.4').toBeRegistered({partId: 'part.WEST-1', active: true});
    expect('view.4').toHaveComponentState('D');

    // Move view 3 to a new part in the west
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.EAST-2',
        viewId: 'view.3',
        navigation: {path: segments(['path/to/view/3'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.WEST-1',
        region: 'west',
        newPart: {id: 'part.WEST-2'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MTreeNode({
              child1: new MTreeNode({
                child1: new MPart({id: 'part.WEST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
                child2: new MPart({id: 'part.WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
                direction: 'row',
                ratio: .5,
              }),
              child2: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
              direction: 'row',
              ratio: .5,
            }),
            child2: new MPart({id: 'part.EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toBeRegistered({partId: 'part.EAST-1', active: true});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'part.WEST-2', active: true});
    expect('view.3').toHaveComponentState('C');
    expect('view.4').toBeRegistered({partId: 'part.WEST-1', active: true});
    expect('view.4').toHaveComponentState('D');

    // Move view 2 to a new part in the north
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.EAST-1',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view/2'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'north',
        newPart: {id: 'part.NORTH-1'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MTreeNode({
              child1: new MPart({id: 'part.WEST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
              child2: new MPart({id: 'part.WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
              direction: 'row',
              ratio: .5,
            }),
            child2: new MTreeNode({
              child1: new MPart({id: 'part.NORTH-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
              child2: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
              direction: 'column',
              ratio: .5,
            }),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toBeRegistered({partId: 'part.initial', active: true});
    expect('view.1').toHaveComponentState('A');

    expect('view.2').toBeRegistered({partId: 'part.NORTH-1', active: true});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'part.WEST-2', active: true});
    expect('view.3').toHaveComponentState('C');
    expect('view.4').toBeRegistered({partId: 'part.WEST-1', active: true});
    expect('view.4').toHaveComponentState('D');

    // Close view 1
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1'], {close: true});
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MTreeNode({
              child1: new MPart({id: 'part.WEST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
              child2: new MPart({id: 'part.WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
              direction: 'row',
              ratio: .5,
            }),
            child2: new MPart({id: 'part.NORTH-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').not.toBeRegistered({partId: 'part.initial', active: true});
    expect('view.2').toBeRegistered({partId: 'part.NORTH-1', active: true});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toBeRegistered({partId: 'part.WEST-2', active: true});
    expect('view.3').toHaveComponentState('C');
    expect('view.4').toBeRegistered({partId: 'part.WEST-1', active: true});
    expect('view.4').toHaveComponentState('D');

    // Close view 3
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/3'], {close: true});
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
            child2: new MPart({id: 'part.NORTH-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').not.toBeRegistered({partId: 'part.initial', active: true});
    expect('view.2').toBeRegistered({partId: 'part.NORTH-1', active: true});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').not.toBeRegistered({partId: 'part.WEST-2', active: true});
    expect('view.4').toBeRegistered({partId: 'part.WEST-1', active: true});
    expect('view.4').toHaveComponentState('D');

    // Close view.4
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/4'], {close: true});
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.NORTH-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
        },
      },
    });
    expect('view.1').not.toBeRegistered({partId: 'part.initial', active: true});
    expect('view.2').toBeRegistered({partId: 'part.NORTH-1', active: true});
    expect('view.2').toHaveComponentState('B');
    expect('view.3').not.toBeRegistered({partId: 'part.WEST-2', active: true});
    expect('view.4').not.toBeRegistered({partId: 'part.WEST-1', active: true});
  });

  it('should detach views before being re-parented in the DOM (1)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial', startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Create initial workbench layout.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout
      .addView('view.1', {partId: 'part.initial'})
      .addView('view.2', {partId: 'part.initial'})
      .addView('view.3', {partId: 'part.initial'})
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
        partId: 'part.initial',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'east',
        newPart: {id: 'part.right'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}, {id: 'view.3'}], activeViewId: 'view.3'}),
            child2: new MPart({id: 'part.right', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toHaveComponentState('C');

    // Move view.3 to the north of view.2
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.initial',
        viewId: 'view.3',
        navigation: {path: segments(['path/to/view'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.right',
        region: 'north',
        newPart: {id: 'part.top-right'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MTreeNode({
              child1: new MPart({id: 'part.top-right', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
              child2: new MPart({id: 'part.right', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
              direction: 'column',
              ratio: .5,
            }),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toHaveComponentState('C');
  });

  it('should detach views before being re-parented in the DOM (2)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial', startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Create initial workbench layout.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout
      .addView('view.1', {partId: 'part.initial'})
      .addView('view.2', {partId: 'part.initial'})
      .addView('view.3', {partId: 'part.initial'})
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
        partId: 'part.initial',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'east',
        newPart: {id: 'part.EAST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}, {id: 'view.3'}], activeViewId: 'view.3'}),
            child2: new MPart({id: 'part.EAST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toHaveComponentState('C');

    // Move view 2 to a new part in the west of the initial part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.EAST',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'west',
        newPart: {id: 'part.WEST-2'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.WEST-2', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: new MPart({id: 'part.initial', views: [{id: 'view.1'}, {id: 'view.3'}], activeViewId: 'view.3'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toHaveComponentState('C');
  });

  it('should detach views before being re-parented in the DOM (3)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial', startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Create initial workbench layout.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout
      .addView('view.1', {partId: 'part.initial'})
      .addView('view.2', {partId: 'part.initial'})
      .addView('view.3', {partId: 'part.initial'})
      .addView('view.4', {partId: 'part.initial'})
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
        partId: 'part.initial',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'east',
        newPart: {id: 'part.EAST-1'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}, {id: 'view.3'}, {id: 'view.4'}], activeViewId: 'view.4'}),
            child2: new MPart({id: 'part.EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'row',
            ratio: .5,
          }),
        },
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
        partId: 'part.initial',
        viewId: 'view.3',
        navigation: {path: segments(['path/to/view'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.EAST-1',
        region: 'east',
        newPart: {id: 'part.EAST-2'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}, {id: 'view.4'}], activeViewId: 'view.4'}),
            child2: new MTreeNode({
              child1: new MPart({id: 'part.EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
              child2: new MPart({id: 'part.EAST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
              direction: 'row',
              ratio: .5,
            }),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toHaveComponentState('C');
    expect('view.4').toHaveComponentState('D');

    // Move view.4 to a new part in the west
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.initial',
        viewId: 'view.4',
        navigation: {path: segments(['path/to/view'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'west',
        newPart: {id: 'part.WEST-1'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MTreeNode({
              child1: new MPart({id: 'part.WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
              child2: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
              direction: 'row',
              ratio: .5,
            }),
            child2: new MTreeNode({
              child1: new MPart({id: 'part.EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
              child2: new MPart({id: 'part.EAST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
              direction: 'row',
              ratio: .5,
            }),
            direction: 'row',
            ratio: .5,
          }),
        },
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
        partId: 'part.EAST-2',
        viewId: 'view.3',
        navigation: {path: segments(['path/to/view'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.WEST-1',
        region: 'west',
        newPart: {id: 'part.WEST-2'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MTreeNode({
              child1: new MTreeNode({
                child1: new MPart({id: 'part.WEST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
                child2: new MPart({id: 'part.WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
                direction: 'row',
                ratio: .5,
              }),
              child2: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
              direction: 'row',
              ratio: .5,
            }),
            child2: new MPart({id: 'part.EAST-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'row',
            ratio: .5,
          }),
        },
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
        partId: 'part.EAST-1',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'north',
        newPart: {id: 'part.NORTH-1'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MTreeNode({
              child1: new MPart({id: 'part.WEST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
              child2: new MPart({id: 'part.WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
              direction: 'row',
              ratio: .5,
            }),
            child2: new MTreeNode({
              child1: new MPart({id: 'part.NORTH-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
              child2: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
              direction: 'column',
              ratio: .5,
            }),
            direction: 'row',
            ratio: .5,
          }),
        },
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
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MTreeNode({
              child1: new MPart({id: 'part.WEST-2', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
              child2: new MPart({id: 'part.WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
              direction: 'row',
              ratio: .5,
            }),
            child2: new MPart({id: 'part.NORTH-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toHaveComponentState('C');
    expect('view.4').toHaveComponentState('D');

    // Close view 3
    await TestBed.inject(WorkbenchRouter).navigate([], {target: 'view.3', close: true});
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.WEST-1', views: [{id: 'view.4'}], activeViewId: 'view.4'}),
            child2: new MPart({id: 'part.NORTH-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.2').toHaveComponentState('B');
    expect('view.4').toHaveComponentState('D');

    // Close view.4
    await TestBed.inject(WorkbenchRouter).navigate([], {target: 'view.4', close: true});
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.NORTH-1', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
        },
      },
    });
    expect('view.2').toHaveComponentState('B');
  });

  it('should detach views before being re-parented in the DOM (4)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial', startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Create initial workbench layout.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout
      .addView('view.1', {partId: 'part.initial'})
      .addView('view.2', {partId: 'part.initial'})
      .addView('view.3', {partId: 'part.initial'})
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
        partId: 'part.initial',
        viewId: 'view.3',
        navigation: {path: segments(['path/to/view'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'east',
        newPart: {id: 'part.EAST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
            child2: new MPart({id: 'part.EAST', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toHaveComponentState('C');

    // Move view 2 to a new part in the south of EAST part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.initial',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.EAST',
        region: 'south',
        newPart: {id: 'part.SOUTH'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MTreeNode({
              child1: new MPart({id: 'part.EAST', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
              child2: new MPart({id: 'part.SOUTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
              direction: 'column',
              ratio: .5,
            }),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toHaveComponentState('C');

    // Move view 2 to a new part in the north of EAST part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.initial',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.EAST',
        region: 'north',
        newPart: {id: 'part.NORTH'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MTreeNode({
              child1: new MPart({id: 'part.NORTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
              child2: new MPart({id: 'part.EAST', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
              direction: 'column',
              ratio: .5,
            }),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toHaveComponentState('C');
  });

  it('should detach views before being re-parented in the DOM (5)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial', startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Create initial workbench layout.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout
      .addView('view.1', {partId: 'part.initial'})
      .addView('view.2', {partId: 'part.initial'})
      .addView('view.3', {partId: 'part.initial'})
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
        partId: 'part.initial',
        viewId: 'view.3',
        navigation: {path: segments(['path/to/view'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'east',
        newPart: {id: 'part.EAST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}, {id: 'view.2'}], activeViewId: 'view.2'}),
            child2: new MPart({id: 'part.EAST', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toHaveComponentState('C');

    // Move view 2 to a new part in the north of EAST part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.initial',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.EAST',
        region: 'north',
        newPart: {id: 'part.NORTH'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MTreeNode({
              child1: new MPart({id: 'part.NORTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
              child2: new MPart({id: 'part.EAST', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
              direction: 'column',
              ratio: .5,
            }),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toHaveComponentState('C');

    // Move view 3 to a new part in the south of NORTH part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.EAST',
        viewId: 'view.3',
        navigation: {path: segments(['path/to/view'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.NORTH',
        region: 'south',
        newPart: {id: 'part.SOUTH'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MTreeNode({
              child1: new MPart({id: 'part.NORTH', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
              child2: new MPart({id: 'part.SOUTH', views: [{id: 'view.3'}], activeViewId: 'view.3'}),
              direction: 'column',
              ratio: .5,
            }),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');
    expect('view.3').toHaveComponentState('C');
  });

  it('should detach views before being re-parented in the DOM (6)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial', startup: {launcher: 'APP_INITIALIZER'}}),
        provideRouter([
          {path: 'path/to/view', component: TestComponent, providers: [withComponentStateInputElement()]},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Create initial workbench layout.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout
      .addView('view.1', {partId: 'part.initial'})
      .addView('view.2', {partId: 'part.initial'})
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
        partId: 'part.initial',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'east',
        newPart: {id: 'part.EAST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            child2: new MPart({id: 'part.EAST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');

    // Move view 2 to a new part in the west of initial part
    TestBed.inject(ViewDragService).dispatchViewMoveEvent({
      source: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        partId: 'part.EAST',
        viewId: 'view.2',
        navigation: {path: segments(['path/to/view'])},
      },
      target: {
        workbenchId: TestBed.inject(WORKBENCH_ID),
        elementId: 'part.initial',
        region: 'west',
        newPart: {id: 'part.WEST'},
      },
    });
    await waitUntilStable();

    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            child1: new MPart({id: 'part.WEST', views: [{id: 'view.2'}], activeViewId: 'view.2'}),
            child2: new MPart({id: 'part.initial', views: [{id: 'view.1'}], activeViewId: 'view.1'}),
            direction: 'row',
            ratio: .5,
          }),
        },
      },
    });
    expect('view.1').toHaveComponentState('A');
    expect('view.2').toHaveComponentState('B');
  });

  /**
   * Verifies the DOM not to be updated until the navigation completes (consistent read).
   *
   * Note that workbench handles (part, view) are updated during navigation.
   */
  it('should not update DOM until navigation completes (consistent read)', async () => {
    const onCanActivate$ = new ReplaySubject<void>(1);
    const canActivate$ = new Subject<boolean>();

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial'}),
        provideRouter([
          {
            path: 'path/to/view/1',
            loadComponent: () => TestViewComponent,
          },
          {
            path: 'path/to/view/2',
            loadComponent: () => TestViewComponent,
            canActivate: [() => {
              onCanActivate$.next();
              return canActivate$;
            }],
          },
        ]),
      ],
    });

    @Component({
      selector: 'spec-view',
      template: 'View',
    })
    class TestViewComponent {
    }

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Open view 1.
    await TestBed.inject(WorkbenchRouter).navigate(['path/to/view/1'], {target: 'view.101'});
    await waitUntilStable();

    // Open view 2 but block the navigation.
    const navigation2 = TestBed.inject(WorkbenchRouter).navigate(['path/to/view/2'], {target: 'view.102'});

    // Wait until entering 'CanActivate' guard.
    await firstValueFrom(onCanActivate$);
    await waitUntilStable();

    // Expect part handle to still have previous state.
    expect(TestBed.inject(WorkbenchService).getPart('part.initial')!.activeView()!.id).toEqual('view.101');
    expect(TestBed.inject(WorkbenchService).getPart('part.initial')!.views().map(view => view.id)).toEqual(['view.101']);

    // Expect view handle to be partially updated.
    expect(TestBed.inject(WorkbenchService).getView('view.101')!.active()).toBeTrue();
    expect(TestBed.inject(WorkbenchService).getView('view.102')!.active()).toBeTrue();

    // Expect DOM not to be updated.
    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({id: MAIN_AREA}),
        },
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.101'}], activeViewId: 'view.101'}),
        },
      },
    });

    // Continue navigation of view 2.
    canActivate$.next(true);
    await navigation2;
    await waitUntilStable();

    // Expect DOM to be updated.
    expect(fixture).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({id: MAIN_AREA}),
        },
        mainArea: {
          root: new MPart({id: 'part.initial', views: [{id: 'view.101'}, {id: 'view.102'}], activeViewId: 'view.102'}),
        },
      },
    });
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
  imports: [
    RouterOutlet,
    WorkbenchComponent,
  ],
})
class RouterOutletPlusWorkbenchTestFixtureComponent {
}

function findView(findBy: {cssClass: string}): WorkbenchView {
  const view = TestBed.inject(ɵWorkbenchService).views().find(view => view.classList.asList().includes(findBy.cssClass));
  return view ?? throwError(`[NullViewError] No view found with CSS class ${findBy.cssClass}`);
}
