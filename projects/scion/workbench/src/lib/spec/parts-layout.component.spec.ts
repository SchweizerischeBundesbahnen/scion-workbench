/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ComponentFixture, ComponentFixtureAutoDetect, TestBed} from '@angular/core/testing';
import {expect, jasmineCustomMatchers} from './util/jasmine-custom-matchers.spec';
import {Component, NgZone} from '@angular/core';
import {PartsLayoutComponent} from '../layout/parts-layout.component';
import {Router, UrlSegment} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {WorkbenchTestingModule} from './workbench-testing.module';
import {WorkbenchService} from '../workbench.service';
import {ViewDragService} from '../view-dnd/view-drag.service';
import {MPart, MTreeNode} from '../layout/parts-layout.model';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {firstValueFrom, timeout} from 'rxjs';

describe('PartsLayoutComponent', () => {

  let workbench: WorkbenchService;
  let wbRouter: WorkbenchRouter;
  let viewDragService: ViewDragService;
  let fixture: ComponentFixture<PartsLayoutComponent>;

  beforeEach(() => {
    jasmine.addMatchers(jasmineCustomMatchers);

    TestBed.configureTestingModule({
      declarations: [View1Component, View2Component, View3Component],
      imports: [
        WorkbenchTestingModule.forRoot({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'view-1', component: View1Component},
          {path: 'view-2', component: View2Component},
          {path: 'view-3', component: View3Component},
          {path: 'view-4', component: View4Component},
        ]),
      ],
      providers: [
        // enable automatic change-detection for the fixture
        {provide: ComponentFixtureAutoDetect, useValue: true},
      ],
    });

    workbench = TestBed.inject(WorkbenchService);
    wbRouter = TestBed.inject(WorkbenchRouter);
    viewDragService = TestBed.inject(ViewDragService);

    TestBed.inject(NgZone).run(() => TestBed.inject(Router).initialNavigation());
    fixture = TestBed.createComponent(PartsLayoutComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    fixture.debugElement.nativeElement.style.background = 'lightgray';
  });

  it('allows to move a view to a new part in the east', async () => {
    // Add view 1
    await wbRouter.navigate(['view-1']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});

    // Add view 2
    await wbRouter.navigate(['view-2']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1', 'view.2'], activeViewId: 'view.2'}));
    expect('view.1').toBeRegistered({partId: 'main', active: false, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'main', active: true, transientState: 'B'});

    // Move view 2 to a new part in the east
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        region: 'east',
        newPartId: 'EAST',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new MPart({partId: 'EAST', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'row',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'EAST', active: true, transientState: 'B'});
  });

  it('allows to move a view to a new part in the west', async () => {
    // Add view 1
    await wbRouter.navigate(['view-1']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});

    // Add view 2
    await wbRouter.navigate(['view-2']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1', 'view.2'], activeViewId: 'view.2'}));
    expect('view.1').toBeRegistered({partId: 'main', active: false, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'main', active: true, transientState: 'B'});

    // Move view 2 to a new part in the west
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        region: 'west',
        newPartId: 'WEST',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'WEST', viewIds: ['view.2'], activeViewId: 'view.2'}),
      child2: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      ratio: .5,
      direction: 'row',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'WEST', active: true, transientState: 'B'});
  });

  it('allows to move a view to a new part in the north', async () => {
    // Add view 1
    await wbRouter.navigate(['view-1']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});

    // Add view 2
    await wbRouter.navigate(['view-2']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1', 'view.2'], activeViewId: 'view.2'}));
    expect('view.1').toBeRegistered({partId: 'main', active: false, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'main', active: true, transientState: 'B'});

    // Move view 1 to a new part in the north
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        region: 'north',
        newPartId: 'NORTH',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'NORTH', viewIds: ['view.2'], activeViewId: 'view.2'}),
      child2: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      ratio: .5,
      direction: 'column',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'NORTH', active: true, transientState: 'B'});
  });

  it('allows to move a view to a new part in the south', async () => {
    // Add view 1
    await wbRouter.navigate(['view-1']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});

    // Add view 2
    await wbRouter.navigate(['view-2']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1', 'view.2'], activeViewId: 'view.2'}));
    expect('view.1').toBeRegistered({partId: 'main', active: false, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'main', active: true, transientState: 'B'});

    // Move view 1 to a new part in the south
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        region: 'south',
        newPartId: 'SOUTH',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new MPart({partId: 'SOUTH', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'column',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'SOUTH', active: true, transientState: 'B'});
  });

  it('disallows to move a view to a new part in the center', async () => {
    // Add view 1
    await wbRouter.navigate(['view-1']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});

    // Add view 2
    await wbRouter.navigate(['view-2']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1', 'view.2'], activeViewId: 'view.2'}));
    expect('view.1').toBeRegistered({partId: 'main', active: false, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'main', active: true, transientState: 'B'});

    // Move view 1 to a new part in the center
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        region: 'center',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', activeViewId: 'view.2', viewIds: ['view.1', 'view.2']}));
    expect('view.1').toBeRegistered({partId: 'main', active: false, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'main', active: true, transientState: 'B'});
  });

  it('allows to move views to another part', async () => {
    // Add view 1
    await wbRouter.navigate(['view-1']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});

    // Add view 2
    await wbRouter.navigate(['view-2']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1', 'view.2'], activeViewId: 'view.2'}));
    expect('view.1').toBeRegistered({partId: 'main', active: false, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'main', active: true, transientState: 'B'});

    // Add view 3
    await wbRouter.navigate(['view-3']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.3', 'C');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1', 'view.2', 'view.3'], activeViewId: 'view.3'}));
    expect('view.1').toBeRegistered({partId: 'main', active: false, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'main', active: false, transientState: 'B'});
    expect('view.3').toBeRegistered({partId: 'main', active: true, transientState: 'C'});

    // Move view 3 to a new part in the east
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        viewId: 'view.3',
        viewUrlSegments: [new UrlSegment('view-3', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        region: 'east',
        newPartId: 'EAST',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1', 'view.2'], activeViewId: 'view.2'}),
      child2: new MPart({partId: 'EAST', viewIds: ['view.3'], activeViewId: 'view.3'}),
      ratio: .5,
      direction: 'row',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: false, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'main', active: true, transientState: 'B'});
    expect('view.3').toBeRegistered({partId: 'EAST', active: true, transientState: 'C'});

    // Move view 2 to the new ViewPart
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'EAST',
        region: 'center',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new MPart({partId: 'EAST', viewIds: ['view.3', 'view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'row',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'EAST', active: true, transientState: 'B'});
    expect('view.3').toBeRegistered({partId: 'EAST', active: false, transientState: 'C'});

    // Move view 1 to the new part
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        viewId: 'view.1',
        viewUrlSegments: [new UrlSegment('view-1', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'EAST',
        region: 'center',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'EAST', activeViewId: 'view.1', viewIds: ['view.3', 'view.2', 'view.1']}));
    expect('view.1').toBeRegistered({partId: 'EAST', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'EAST', active: false, transientState: 'B'});
    expect('view.3').toBeRegistered({partId: 'EAST', active: false, transientState: 'C'});
  });

  it('allows to move the last view of a part to a new part in the east', async () => {
    // Add view 1
    await wbRouter.navigate(['view-1']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});

    // Add view 2
    await wbRouter.navigate(['view-2']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1', 'view.2'], activeViewId: 'view.2'}));
    expect('view.1').toBeRegistered({partId: 'main', active: false, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'main', active: true, transientState: 'B'});

    // Move view 2 to a new part in the east
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        region: 'east',
        newPartId: 'EAST-1',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new MPart({partId: 'EAST-1', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'row',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'EAST-1', active: true, transientState: 'B'});

    // Move view 2 to a new part in the east of part EAST-1
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'EAST-1',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        region: 'east',
        newPartId: 'EAST-2',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new MPart({partId: 'EAST-2', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'row',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'EAST-2', active: true, transientState: 'B'});
  });

  it('allows to move the last view of a part to a new part in the west', async () => {
    // Add view 1
    await wbRouter.navigate(['view-1']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});

    // Add view 2
    await wbRouter.navigate(['view-2']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1', 'view.2'], activeViewId: 'view.2'}));
    expect('view.1').toBeRegistered({partId: 'main', active: false, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'main', active: true, transientState: 'B'});

    // Move view 2 to a new part in the east
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        region: 'east',
        newPartId: 'EAST',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new MPart({partId: 'EAST', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'row',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'EAST', active: true, transientState: 'B'});

    // Move view 2 to a new part in the west of part 1
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'EAST',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        region: 'west',
        newPartId: 'WEST-2',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'WEST-2', viewIds: ['view.2'], activeViewId: 'view.2'}),
      child2: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      ratio: .5,
      direction: 'row',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'WEST-2', active: true, transientState: 'B'});
  });

  it('allows to move the last view of a part to a new viewpart in the north', async () => {
    // Add view 1
    await wbRouter.navigate(['view-1']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});

    // Add view 2
    await wbRouter.navigate(['view-2']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1', 'view.2'], activeViewId: 'view.2'}));
    expect('view.1').toBeRegistered({partId: 'main', active: false, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'main', active: true, transientState: 'B'});

    // Move view 2 to a new part in the east
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        region: 'east',
        newPartId: 'EAST',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new MPart({partId: 'EAST', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'row',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'EAST', active: true, transientState: 'B'});

    // Move view 2 to a new part in the north of part 1
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'EAST',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        region: 'north',
        newPartId: 'NORTH',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'NORTH', viewIds: ['view.2'], activeViewId: 'view.2'}),
      child2: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      ratio: .5,
      direction: 'column',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'NORTH', active: true, transientState: 'B'});
  });

  it('allows to move the last view of a part to a new part in the south', async () => {
    // Add view 1
    await wbRouter.navigate(['view-1']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});

    // Add view 2
    await wbRouter.navigate(['view-2']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1', 'view.2'], activeViewId: 'view.2'}));
    expect('view.1').toBeRegistered({partId: 'main', active: false, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'main', active: true, transientState: 'B'});

    // Move view 2 to a new part in the east
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        region: 'east',
        newPartId: 'EAST',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new MPart({partId: 'EAST', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'row',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'EAST', active: true, transientState: 'B'});

    // Move view 2 to a new part in the south of part 1
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'EAST',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        region: 'south',
        newPartId: 'SOUTH',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new MPart({partId: 'SOUTH', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'column',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'SOUTH', active: true, transientState: 'B'});
  });

  it('allows to move a view around parts', async () => {
    // Add view 1
    await wbRouter.navigate(['view-1']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});

    // Add view 2
    await wbRouter.navigate(['view-2']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1', 'view.2'], activeViewId: 'view.2'}));
    expect('view.1').toBeRegistered({partId: 'main', active: false, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'main', active: true, transientState: 'B'});

    // Add view 3
    await wbRouter.navigate(['view-3']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.3', 'C');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', activeViewId: 'view.3', viewIds: ['view.1', 'view.2', 'view.3']}));
    expect('view.1').toBeRegistered({partId: 'main', active: false, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'main', active: false, transientState: 'B'});
    expect('view.3').toBeRegistered({partId: 'main', active: true, transientState: 'C'});

    // Move view 3 to a new part in the east
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        viewId: 'view.3',
        viewUrlSegments: [new UrlSegment('view-3', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        region: 'east',
        newPartId: 'EAST',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1', 'view.2'], activeViewId: 'view.2'}),
      child2: new MPart({partId: 'EAST', viewIds: ['view.3'], activeViewId: 'view.3'}),
      ratio: .5,
      direction: 'row',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: false, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'main', active: true, transientState: 'B'});
    expect('view.3').toBeRegistered({partId: 'EAST', active: true, transientState: 'C'});

    // Move view 2 to a new part in the south of part 2
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'EAST',
        region: 'south',
        newPartId: 'SOUTH-EAST',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new MTreeNode({
        child1: new MPart({partId: 'EAST', viewIds: ['view.3'], activeViewId: 'view.3'}),
        child2: new MPart({partId: 'SOUTH-EAST', viewIds: ['view.2'], activeViewId: 'view.2'}),
        ratio: .5,
        direction: 'column',
      }),
      ratio: .5,
      direction: 'row',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'SOUTH-EAST', active: true, transientState: 'B'});
    expect('view.3').toBeRegistered({partId: 'EAST', active: true, transientState: 'C'});

    // Move view 2 to a new part in the south of part 1
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'SOUTH-EAST',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        newPartId: 'SOUTH-WEST',
        region: 'south',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MTreeNode({
        child1: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
        child2: new MPart({partId: 'SOUTH-WEST', viewIds: ['view.2'], activeViewId: 'view.2'}),
        ratio: .5,
        direction: 'column',
      }),
      child2: new MPart({partId: 'EAST', viewIds: ['view.3'], activeViewId: 'view.3'}),
      ratio: .5,
      direction: 'row',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'SOUTH-WEST', active: true, transientState: 'B'});
    expect('view.3').toBeRegistered({partId: 'EAST', active: true, transientState: 'C'});
  });

  it('allows to move a view to a new part in the south and back to the main part ', async () => {
    // Add view 1
    await wbRouter.navigate(['view-1']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});

    // Add view 2
    await wbRouter.navigate(['view-2']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1', 'view.2'], activeViewId: 'view.2'}));
    expect('view.1').toBeRegistered({partId: 'main', active: false, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'main', active: true, transientState: 'B'});

    // Move view 2 to a new part in the south
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        region: 'south',
        newPartId: 'SOUTH',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new MPart({partId: 'SOUTH', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'column',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'SOUTH', active: true, transientState: 'B'});

    // Move view 2 back to the main part
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'SOUTH',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        region: 'center',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1', 'view.2'], activeViewId: 'view.2'}));
    expect('view.1').toBeRegistered({partId: 'main', active: false, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'main', active: true, transientState: 'B'});
  });

  it('allows to move a view to a new part in the east and then to the south of the main part ', async () => {
    // Add view 1
    await wbRouter.navigate(['view-1']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});

    // Add view 2
    await wbRouter.navigate(['view-2']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1', 'view.2'], activeViewId: 'view.2'}));
    expect('view.1').toBeRegistered({partId: 'main', active: false, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'main', active: true, transientState: 'B'});

    // Move view 2 to a new part in the east
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        region: 'east',
        newPartId: 'EAST',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new MPart({partId: 'EAST', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'row',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'EAST', active: true, transientState: 'B'});

    // Move view 2 to a new part in the south
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'EAST',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        region: 'south',
        newPartId: 'SOUTH',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new MPart({partId: 'SOUTH', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'column',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'SOUTH', active: true, transientState: 'B'});
  });

  it('allows to move a view to a new part in the west and then to the south of the main part ', async () => {
    // Add view 1
    await wbRouter.navigate(['view-1']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});

    // Add view 2
    await wbRouter.navigate(['view-2']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1', 'view.2'], activeViewId: 'view.2'}));
    expect('view.1').toBeRegistered({partId: 'main', active: false, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'main', active: true, transientState: 'B'});

    // Move view 2 to a new part in the west
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        region: 'west',
        newPartId: 'WEST',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'WEST', viewIds: ['view.2'], activeViewId: 'view.2'}),
      child2: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      ratio: .5,
      direction: 'row',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'WEST', active: true, transientState: 'B'});

    // Move view 2 to a new part in the south
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'WEST',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        region: 'south',
        newPartId: 'SOUTH',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new MPart({partId: 'SOUTH', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'column',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'SOUTH', active: true, transientState: 'B'});
  });

  it('should open the same view multiple times', async () => {
    // Add view 1
    await wbRouter.navigate(['view-1']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});

    // Add view 2
    await wbRouter.navigate(['view-2']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1', 'view.2'], activeViewId: 'view.2'}));
    expect('view.1').toBeRegistered({partId: 'main', active: false, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'main', active: true, transientState: 'B'});

    // Add view 2 again
    await wbRouter.navigate(['view-2'], {blankPartId: 'main'});
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', activeViewId: 'view.2', viewIds: ['view.1', 'view.2']}));
    expect('view.1').toBeRegistered({partId: 'main', active: false, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'main', active: true, transientState: 'B'});
  });

  it('should open the same view multiple times', async () => {
    // Add view 1
    await wbRouter.navigate(['view-1']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});

    // Add view 2
    await wbRouter.navigate(['view-2']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1', 'view.2'], activeViewId: 'view.2'}));
    expect('view.1').toBeRegistered({partId: 'main', active: false, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'main', active: true, transientState: 'B'});

    // Add view 2 again
    await wbRouter.navigate(['view-2'], {blankPartId: 'main', target: 'blank'});
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.3', 'C');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', activeViewId: 'view.3', viewIds: ['view.1', 'view.2', 'view.3']}));
    expect('view.1').toBeRegistered({partId: 'main', active: false, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'main', active: false, transientState: 'B'});
    expect('view.3').toBeRegistered({partId: 'main', active: true, transientState: 'C'});
  });

  it('should open views to the right and to the left, and then close them', async () => {
    // Add view 1
    await wbRouter.navigate(['view-1']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.1', 'A');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});

    // Add view 2
    await wbRouter.navigate(['view-2']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.2', 'B');

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', viewIds: ['view.1', 'view.2'], activeViewId: 'view.2'}));
    expect('view.1').toBeRegistered({partId: 'main', active: false, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'main', active: true, transientState: 'B'});

    // Move view 2 to a new part in the east
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        region: 'east',
        newPartId: 'EAST-1',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new MPart({partId: 'EAST-1', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'row',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'EAST-1', active: true, transientState: 'B'});

    // Add view 3 to part EAST-1
    await wbRouter.navigate(['view-3']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.3', 'C');

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new MPart({partId: 'EAST-1', viewIds: ['view.2', 'view.3'], activeViewId: 'view.3'}),
      ratio: .5,
      direction: 'row',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'EAST-1', active: false, transientState: 'B'});
    expect('view.3').toBeRegistered({partId: 'EAST-1', active: true, transientState: 'C'});

    // Move view 3 to a new part in the east
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'EAST-1',
        viewId: 'view.3',
        viewUrlSegments: [new UrlSegment('view-3', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'EAST-1',
        region: 'east',
        newPartId: 'EAST-2',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new MTreeNode({
        child1: new MPart({partId: 'EAST-1', viewIds: ['view.2'], activeViewId: 'view.2'}),
        child2: new MPart({partId: 'EAST-2', viewIds: ['view.3'], activeViewId: 'view.3'}),
        ratio: .5,
        direction: 'row',
      }),
      ratio: .5,
      direction: 'row',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'EAST-1', active: true, transientState: 'B'});
    expect('view.3').toBeRegistered({partId: 'EAST-2', active: true, transientState: 'C'});

    // Add view 4 to part main
    await wbRouter.navigate(['view-4']);
    await waitUntilLayoutChanged();
    enterTransientViewState(fixture, 'view.4', 'D');

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new MTreeNode({
        child1: new MPart({partId: 'EAST-1', viewIds: ['view.2'], activeViewId: 'view.2'}),
        child2: new MPart({partId: 'EAST-2', viewIds: ['view.3', 'view.4'], activeViewId: 'view.4'}),
        ratio: .5,
        direction: 'row',
      }),
      ratio: .5,
      direction: 'row',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'EAST-1', active: true, transientState: 'B'});
    expect('view.3').toBeRegistered({partId: 'EAST-2', active: false, transientState: 'C'});
    expect('view.4').toBeRegistered({partId: 'EAST-2', active: true, transientState: 'D'});

    // Move view 4 to a new part in the west
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'EAST-2',
        viewId: 'view.4',
        viewUrlSegments: [new UrlSegment('view-4', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        region: 'west',
        newPartId: 'WEST-1',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MTreeNode({
        child1: new MPart({partId: 'WEST-1', viewIds: ['view.4'], activeViewId: 'view.4'}),
        child2: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
        ratio: .5,
        direction: 'row',
      }),
      child2: new MTreeNode({
        child1: new MPart({partId: 'EAST-1', viewIds: ['view.2'], activeViewId: 'view.2'}),
        child2: new MPart({partId: 'EAST-2', viewIds: ['view.3'], activeViewId: 'view.3'}),
        ratio: .5,
        direction: 'row',
      }),
      ratio: .5,
      direction: 'row',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'EAST-1', active: true, transientState: 'B'});
    expect('view.3').toBeRegistered({partId: 'EAST-2', active: true, transientState: 'C'});
    expect('view.4').toBeRegistered({partId: 'WEST-1', active: true, transientState: 'D'});

    // Move view 3 to a new part in the west
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'EAST-2',
        viewId: 'view.3',
        viewUrlSegments: [new UrlSegment('view-3', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'WEST-1',
        region: 'west',
        newPartId: 'WEST-2',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MTreeNode({
        child1: new MTreeNode({
          child1: new MPart({partId: 'WEST-2', viewIds: ['view.3'], activeViewId: 'view.3'}),
          child2: new MPart({partId: 'WEST-1', viewIds: ['view.4'], activeViewId: 'view.4'}),
          ratio: .5,
          direction: 'row',
        }),
        child2: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
        ratio: .5,
        direction: 'row',
      }),
      child2: new MPart({partId: 'EAST-1', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'row',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'EAST-1', active: true, transientState: 'B'});
    expect('view.3').toBeRegistered({partId: 'WEST-2', active: true, transientState: 'C'});
    expect('view.4').toBeRegistered({partId: 'WEST-1', active: true, transientState: 'D'});

    // Move view 2 to a new part in the north
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'EAST-1',
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'main',
        region: 'north',
        newPartId: 'NORTH-1',
      },
    });
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MTreeNode({
        child1: new MPart({partId: 'WEST-2', viewIds: ['view.3'], activeViewId: 'view.3'}),
        child2: new MPart({partId: 'WEST-1', viewIds: ['view.4'], activeViewId: 'view.4'}),
        ratio: .5,
        direction: 'row',
      }),
      child2: new MTreeNode({
        child1: new MPart({partId: 'NORTH-1', viewIds: ['view.2'], activeViewId: 'view.2'}),
        child2: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
        ratio: .5,
        direction: 'column',
      }),
      ratio: .5,
      direction: 'row',
    }));
    expect('view.1').toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'NORTH-1', active: true, transientState: 'B'});
    expect('view.3').toBeRegistered({partId: 'WEST-2', active: true, transientState: 'C'});
    expect('view.4').toBeRegistered({partId: 'WEST-1', active: true, transientState: 'D'});

    // Close view 1
    await wbRouter.navigate(['view-1'], {closeIfPresent: true});
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MTreeNode({
        child1: new MPart({partId: 'WEST-2', viewIds: ['view.3'], activeViewId: 'view.3'}),
        child2: new MPart({partId: 'WEST-1', viewIds: ['view.4'], activeViewId: 'view.4'}),
        ratio: .5,
        direction: 'row',
      }),
      child2: new MPart({partId: 'NORTH-1', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'row',
    }));
    expect('view.1').not.toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'NORTH-1', active: true, transientState: 'B'});
    expect('view.3').toBeRegistered({partId: 'WEST-2', active: true, transientState: 'C'});
    expect('view.4').toBeRegistered({partId: 'WEST-1', active: true, transientState: 'D'});

    // Close view 3
    await wbRouter.navigate(['view-3'], {closeIfPresent: true});
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'WEST-1', viewIds: ['view.4'], activeViewId: 'view.4'}),
      child2: new MPart({partId: 'NORTH-1', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'row',
    }));
    expect('view.1').not.toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'NORTH-1', active: true, transientState: 'B'});
    expect('view.3').not.toBeRegistered({partId: 'WEST-2', active: true, transientState: 'C'});
    expect('view.4').toBeRegistered({partId: 'WEST-1', active: true, transientState: 'D'});

    // Close view 4
    await wbRouter.navigate(['view-4'], {closeIfPresent: true});
    await waitUntilLayoutChanged();

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'NORTH-1', viewIds: ['view.2'], activeViewId: 'view.2'}));
    expect('view.1').not.toBeRegistered({partId: 'main', active: true, transientState: 'A'});
    expect('view.2').toBeRegistered({partId: 'NORTH-1', active: true, transientState: 'B'});
    expect('view.3').not.toBeRegistered({partId: 'WEST-2', active: true, transientState: 'C'});
    expect('view.4').not.toBeRegistered({partId: 'WEST-1', active: true, transientState: 'D'});
  });
});

/****************************************************************************************************
 * Definition of App Test Module                                                                    *
 ****************************************************************************************************/
@Component({selector: 'spec-view-1', template: 'view 1 <input class="transient-state">'})
class View1Component {
}

@Component({selector: 'spec-view-2', template: 'view 2 <input class="transient-state">'})
class View2Component {
}

@Component({selector: 'spec-view-3', template: 'view 3 <input class="transient-state">'})
class View3Component {
}

@Component({selector: 'spec-view-4', template: 'view 4 <input class="transient-state">'})
class View4Component {
}

async function waitUntilLayoutChanged(): Promise<void> {
  await firstValueFrom(TestBed.inject(WorkbenchLayoutService).onLayoutChange$
    .pipe(timeout({first: 100, with: () => Promise.resolve()})),
  );
}

/**
 * Enters given textual state on the input field of the component.
 *
 * Use that state to check whether the component has been re-created.
 */
export function enterTransientViewState(fixture: ComponentFixture<any>, viewId: string, textualState: string): void {
  fixture.nativeElement.querySelector(`wb-view[data-viewid="${viewId}"] input.transient-state`).value = textualState;
}
