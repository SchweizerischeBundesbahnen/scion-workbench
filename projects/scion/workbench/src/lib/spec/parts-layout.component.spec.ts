/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
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
import {WorkbenchViewRegistry} from '../view/workbench-view.registry';
import {MPart, MTreeNode} from '../layout/parts-layout.model';
import {WorkbenchViewPartRegistry} from '../view-part/workbench-view-part.registry';

describe('PartsLayoutComponent', () => {

  let workbench: WorkbenchService;
  let wbRouter: WorkbenchRouter;
  let viewDragService: ViewDragService;
  let viewRegistry: WorkbenchViewRegistry;
  let viewPartRegistry: WorkbenchViewPartRegistry;
  let fixture: ComponentFixture<PartsLayoutComponent>;
  let ngZone: NgZone;

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
    viewRegistry = TestBed.inject(WorkbenchViewRegistry);
    viewPartRegistry = TestBed.inject(WorkbenchViewPartRegistry);
    ngZone = TestBed.inject(NgZone);

    ngZone.run(() => TestBed.inject(Router).initialNavigation());
    fixture = TestBed.createComponent(PartsLayoutComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    fixture.debugElement.nativeElement.style.background = 'lightgray';
  });

  it('allows to move a view to a new part in the east', async () => {
    await ngZone.run(async () => {
      // Add view 1
      await wbRouter.navigate(['view-1']);
      await fixture.whenStable();

      // Add view 2
      await wbRouter.navigate(['view-2']);
      await fixture.whenStable();

      // Move view 2 to a new part in the east
      await viewDragService.dispatchViewMoveEvent({
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
      await fixture.whenStable();
    });

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new MPart({partId: 'EAST', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'row',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual('main');
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('EAST');
  });

  it('allows to move a view to a new part in the west', async () => {
    await ngZone.run(async () => {
      // Add view 1
      await wbRouter.navigate(['view-1']);
      await fixture.whenStable();

      // Add view 2
      await wbRouter.navigate(['view-2']);
      await fixture.whenStable();

      // Move view 2 to a new part in the west
      await viewDragService.dispatchViewMoveEvent({
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
      await fixture.whenStable();
    });

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'WEST', viewIds: ['view.2'], activeViewId: 'view.2'}),
      child2: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      ratio: .5,
      direction: 'row',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual('main');
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('WEST');
  });

  it('allows to move a view to a new part in the north', async () => {
    await ngZone.run(async () => {
      // Add view 1
      await wbRouter.navigate(['view-1']);
      await fixture.whenStable();

      // Add view 2
      await wbRouter.navigate(['view-2']);
      await fixture.whenStable();

      // Move view 1 to a new part in the north
      await viewDragService.dispatchViewMoveEvent({
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
      await fixture.whenStable();
    });

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'NORTH', viewIds: ['view.2'], activeViewId: 'view.2'}),
      child2: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      ratio: .5,
      direction: 'column',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual('main');
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('NORTH');
  });

  it('allows to move a view to a new part in the south', async () => {
    await ngZone.run(async () => {
      // Add view 1
      await wbRouter.navigate(['view-1']);
      await fixture.whenStable();

      // Add view 2
      await wbRouter.navigate(['view-2']);
      await fixture.whenStable();

      // Move view 1 to a new part in the south
      await viewDragService.dispatchViewMoveEvent({
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
      await fixture.whenStable();
    });

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new MPart({partId: 'SOUTH', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'column',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual('main');
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('SOUTH');
  });

  it('disallows to move a view to a new part in the center', async () => {
    await ngZone.run(async () => {
      // Add view 1
      await wbRouter.navigate(['view-1']);
      await fixture.whenStable();

      // Add view 2
      await wbRouter.navigate(['view-2']);
      await fixture.whenStable();

      // Move view 1 to a new part in the center
      await viewDragService.dispatchViewMoveEvent({
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
      await fixture.whenStable();
    });

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', activeViewId: 'view.2', viewIds: ['view.1', 'view.2']}));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual('main');
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('main');
  });

  it('allows to move views to another part', async () => {
    await ngZone.run(async () => {
      // Add view 1
      await wbRouter.navigate(['view-1']);
      await fixture.whenStable();

      // Add view 2
      await wbRouter.navigate(['view-2']);
      await fixture.whenStable();

      // Add view 3
      await wbRouter.navigate(['view-3']);
      await fixture.whenStable();

      // Move view 3 to a new part in the east
      await viewDragService.dispatchViewMoveEvent({
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
      await fixture.whenStable();

      // Move view 2 to the new ViewPart
      await viewDragService.dispatchViewMoveEvent({
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
      await fixture.whenStable();
    });

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new MPart({partId: 'EAST', viewIds: ['view.3', 'view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'row',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual('main');
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('EAST');
    expect(viewRegistry.getElseThrow('view.3').part.partId).toEqual('EAST');

    await ngZone.run(async () => {
      // Move view 1 to the new part
      await viewDragService.dispatchViewMoveEvent({
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
      await fixture.whenStable();
    });

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'EAST', activeViewId: 'view.1', viewIds: ['view.3', 'view.2', 'view.1']}));

    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual('EAST');
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('EAST');
    expect(viewRegistry.getElseThrow('view.3').part.partId).toEqual('EAST');
  });

  it('allows to move the last view of a part to a new part in the east', async () => {
    await ngZone.run(async () => {
      // Add view 1
      await wbRouter.navigate(['view-1']);
      await fixture.whenStable();

      // Add view 2
      await wbRouter.navigate(['view-2']);
      await fixture.whenStable();

      // Move view 2 to a new part in the east
      await viewDragService.dispatchViewMoveEvent({
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
      await fixture.whenStable();
    });

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new MPart({partId: 'EAST-1', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'row',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual('main');
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('EAST-1');

    await ngZone.run(async () => {
      // Move view 2 to a new part in the east of part EAST-1
      await viewDragService.dispatchViewMoveEvent({
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
      await fixture.whenStable();
    });

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new MPart({partId: 'EAST-2', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'row',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual('main');
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('EAST-2');
  });

  it('allows to move the last view of a part to a new part in the west', async () => {
    await ngZone.run(async () => {
      // Add view 1
      await wbRouter.navigate(['view-1']);
      await fixture.whenStable();

      // Add view 2
      await wbRouter.navigate(['view-2']);
      await fixture.whenStable();

      // Move view 2 to a new part in the east
      await viewDragService.dispatchViewMoveEvent({
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
      await fixture.whenStable();
    });

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new MPart({partId: 'EAST', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'row',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual('main');
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('EAST');

    await ngZone.run(async () => {
      // Move view 2 to a new part in the west of part 1
      await viewDragService.dispatchViewMoveEvent({
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
      await fixture.whenStable();
    });

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'WEST-2', viewIds: ['view.2'], activeViewId: 'view.2'}),
      child2: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      ratio: .5,
      direction: 'row',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual('main');
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('WEST-2');
  });

  it('allows to move the last view of a part to a new viewpart in the north', async () => {
    await ngZone.run(async () => {
      // Add view 1
      await wbRouter.navigate(['view-1']);
      await fixture.whenStable();

      // Add view 2
      await wbRouter.navigate(['view-2']);
      await fixture.whenStable();

      // Move view 2 to a new part in the east
      await viewDragService.dispatchViewMoveEvent({
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
      await fixture.whenStable();
    });

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new MPart({partId: 'EAST', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'row',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual('main');
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('EAST');

    await ngZone.run(async () => {
      // Move view 2 to a new part in the north of part 1
      await viewDragService.dispatchViewMoveEvent({
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
      await fixture.whenStable();
    });

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'NORTH', viewIds: ['view.2'], activeViewId: 'view.2'}),
      child2: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      ratio: .5,
      direction: 'column',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual('main');
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('NORTH');
  });

  it('allows to move the last view of a part to a new part in the south', async () => {
    await ngZone.run(async () => {
      // Add view 1
      await wbRouter.navigate(['view-1']);
      await fixture.whenStable();

      // Add view 2
      await wbRouter.navigate(['view-2']);
      await fixture.whenStable();

      // Move view 2 to a new part in the east
      await viewDragService.dispatchViewMoveEvent({
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
      await fixture.whenStable();
    });

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new MPart({partId: 'EAST', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'row',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual('main');
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('EAST');

    await ngZone.run(async () => {
      // Move view 2 to a new part in the south of part 1
      await viewDragService.dispatchViewMoveEvent({
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
      await fixture.whenStable();
    });

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new MPart({partId: 'SOUTH', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'column',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual('main');
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('SOUTH');
  });

  it('allows to move a view around parts', async () => {
    await ngZone.run(async () => {
      // Add view 1
      await wbRouter.navigate(['view-1']);
      await fixture.whenStable();

      // Add view 2
      await wbRouter.navigate(['view-2']);
      await fixture.whenStable();

      // Add view 3
      await wbRouter.navigate(['view-3']);
      await fixture.whenStable();
    });

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', activeViewId: 'view.3', viewIds: ['view.1', 'view.2', 'view.3']}));

    await ngZone.run(async () => {
      // Move view 3 to a new part in the east
      await viewDragService.dispatchViewMoveEvent({
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
      await fixture.whenStable();
    });

    expect(fixture).toEqualPartsLayout(new MTreeNode({
      child1: new MPart({partId: 'main', viewIds: ['view.1', 'view.2'], activeViewId: 'view.2'}),
      child2: new MPart({partId: 'EAST', viewIds: ['view.3'], activeViewId: 'view.3'}),
      ratio: .5,
      direction: 'row',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual('main');
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('main');
    expect(viewRegistry.getElseThrow('view.3').part.partId).toEqual('EAST');

    const viewPart2Component = viewPartRegistry.getElseThrow('EAST').portal.componentRef.instance;
    expect(viewPart2Component).toBeTruthy();

    // Move view 2 to a new part in the south of part 2
    await ngZone.run(async () => {
      await viewDragService.dispatchViewMoveEvent({
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
      await fixture.whenStable();
    });

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
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual('main');
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('SOUTH-EAST');
    expect(viewRegistry.getElseThrow('view.3').part.partId).toEqual('EAST');

    await ngZone.run(async () => {
      // Move view 2 to a new part in the south of part 1
      await viewDragService.dispatchViewMoveEvent({
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
      await fixture.whenStable();
    });

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
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual('main');
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('SOUTH-WEST');
    expect(viewRegistry.getElseThrow('view.3').part.partId).toEqual('EAST');
  });

  it('should open the same view multiple times', async () => {
    await ngZone.run(async () => {
      // Add view 1
      await wbRouter.navigate(['view-1']);
      await fixture.whenStable();

      // Add view 2
      await wbRouter.navigate(['view-2']);
      await fixture.whenStable();

      // Add view 2 again
      await wbRouter.navigate(['view-2'], {blankPartId: 'main', activateIfPresent: true});
      await fixture.whenStable();
    });

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', activeViewId: 'view.2', viewIds: ['view.1', 'view.2']}));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual('main');
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('main');
  });

  it('should open the same view multiple times', async () => {
    await ngZone.run(async () => {
      // Add view 1
      await wbRouter.navigate(['view-1']);
      await fixture.whenStable();

      // Add view 2
      await wbRouter.navigate(['view-2']);
      await fixture.whenStable();

      // Add view 2 again
      await wbRouter.navigate(['view-2'], {blankPartId: 'main', activateIfPresent: false});
      await fixture.whenStable();
    });

    expect(fixture).toEqualPartsLayout(new MPart({partId: 'main', activeViewId: 'view.3', viewIds: ['view.1', 'view.2', 'view.3']}));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual('main');
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('main');
    expect(viewRegistry.getElseThrow('view.3').part.partId).toEqual('main');
  });
});

/****************************************************************************************************
 * Definition of App Test Module                                                                    *
 ****************************************************************************************************/
@Component({selector: 'spec-view1', template: 'view 1'})
class View1Component {
}

@Component({selector: 'spec-view2', template: 'view 2'})
class View2Component {
}

@Component({selector: 'spec-view3', template: 'view 3'})
class View3Component {
}
