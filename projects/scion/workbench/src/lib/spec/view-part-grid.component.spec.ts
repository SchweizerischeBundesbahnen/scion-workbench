/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { async, fakeAsync, TestBed } from '@angular/core/testing';
import { expect, jasmineCustomMatchers } from './util/jasmine-custom-matchers.spec';
import { AbstractType, Component, InjectionToken, NgModule, Type } from '@angular/core';
import { ViewPartGridComponent } from '../view-part-grid/view-part-grid.component';
import { Router, UrlSegment } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkbenchRouter } from '../routing/workbench-router.service';
import { advance } from './util/util.spec';
import { WorkbenchTestingModule } from './workbench-testing.module';
import { WorkbenchService } from '../workbench.service';
import { ViewDragService } from '../view-dnd/view-drag.service';
import { WorkbenchViewRegistry } from '../workbench-view-registry.service';
import { Part, TreeNode } from '../layout/parts-layout.model';
import { MAIN_PART_ID } from '../workbench.constants';
import { WorkbenchViewPartRegistry } from '../view-part-grid/workbench-view-part-registry.service';

describe('ViewPartGridComponent', () => {

  beforeEach(async(() => {
    jasmine.addMatchers(jasmineCustomMatchers);

    TestBed.configureTestingModule({
      imports: [AppTestModule],
    });

    TestBed.get(Router).initialNavigation();
  }));

  it('allows to move a view into a new part in the east', fakeAsync(() => {
    const workbench = getService(WorkbenchService);
    const wbRouter = getService(WorkbenchRouter);
    const viewDragService = getService(ViewDragService);
    const viewRegistry = getService(WorkbenchViewRegistry);

    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add view 1
    wbRouter.navigate(['view-1'], {blankPartId: MAIN_PART_ID}).then();
    advance(fixture);

    // Add view 2
    wbRouter.navigate(['view-2'], {blankPartId: MAIN_PART_ID}).then();
    advance(fixture);

    // Move view 2 to a new part in the east
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        primaryPart: true,
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        region: 'east',
        newPartId: 'EAST',
      },
    });
    advance(fixture);

    expect(fixture).toBePartsLayout(new TreeNode({
      child1: new Part({partId: MAIN_PART_ID, viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new Part({partId: 'EAST', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'row',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual(MAIN_PART_ID);
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('EAST');
  }));

  it('allows to move a view into a new part in the west', fakeAsync(() => {
    const workbench = getService(WorkbenchService);
    const wbRouter = getService(WorkbenchRouter);
    const viewDragService = getService(ViewDragService);
    const viewRegistry = getService(WorkbenchViewRegistry);

    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add view 1
    wbRouter.navigate(['view-1'], {blankPartId: MAIN_PART_ID}).then();
    advance(fixture);

    // Add view 2
    wbRouter.navigate(['view-2'], {blankPartId: MAIN_PART_ID}).then();
    advance(fixture);

    // Move view 2 to a new part in the west
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        primaryPart: true,
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        region: 'west',
        newPartId: 'WEST',
      },
    });
    advance(fixture);

    expect(fixture).toBePartsLayout(new TreeNode({
      child1: new Part({partId: 'WEST', viewIds: ['view.2'], activeViewId: 'view.2'}),
      child2: new Part({partId: MAIN_PART_ID, viewIds: ['view.1'], activeViewId: 'view.1'}),
      ratio: .5,
      direction: 'row',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual(MAIN_PART_ID);
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('WEST');
  }));

  it('allows to move a view into a new part in the north', fakeAsync(() => {
    const workbench = getService(WorkbenchService);
    const wbRouter = getService(WorkbenchRouter);
    const viewDragService = getService(ViewDragService);
    const viewRegistry = getService(WorkbenchViewRegistry);

    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add view 1
    wbRouter.navigate(['view-1'], {blankPartId: MAIN_PART_ID}).then();
    advance(fixture);

    // Add view 2
    wbRouter.navigate(['view-2'], {blankPartId: MAIN_PART_ID}).then();
    advance(fixture);

    // Move view 1 to a new part in the north
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        primaryPart: true,
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        region: 'north',
        newPartId: 'NORTH',
      },
    });
    advance(fixture);

    expect(fixture).toBePartsLayout(new TreeNode({
      child1: new Part({partId: 'NORTH', viewIds: ['view.2'], activeViewId: 'view.2'}),
      child2: new Part({partId: MAIN_PART_ID, viewIds: ['view.1'], activeViewId: 'view.1'}),
      ratio: .5,
      direction: 'column',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual(MAIN_PART_ID);
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('NORTH');
  }));

  it('allows to move a view into a new part in the south', fakeAsync(() => {
    const workbench = getService(WorkbenchService);
    const wbRouter = getService(WorkbenchRouter);
    const viewDragService = getService(ViewDragService);
    const viewRegistry = getService(WorkbenchViewRegistry);

    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add view 1
    wbRouter.navigate(['view-1'], {blankPartId: MAIN_PART_ID}).then();
    advance(fixture);

    // Add view 2
    wbRouter.navigate(['view-2'], {blankPartId: MAIN_PART_ID}).then();
    advance(fixture);

    // Move view 1 to a new part in the south
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        primaryPart: true,
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        region: 'south',
        newPartId: 'SOUTH',
      },
    });
    advance(fixture);

    expect(fixture).toBePartsLayout(new TreeNode({
      child1: new Part({partId: MAIN_PART_ID, viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new Part({partId: 'SOUTH', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'column',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual(MAIN_PART_ID);
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('SOUTH');
  }));

  it('disallows to move a view into a new part in the center', fakeAsync(() => {
    const workbench = getService(WorkbenchService);
    const wbRouter = getService(WorkbenchRouter);
    const viewDragService = getService(ViewDragService);
    const viewRegistry = getService(WorkbenchViewRegistry);

    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add view 1
    wbRouter.navigate(['view-1'], {blankPartId: MAIN_PART_ID}).then();
    advance(fixture);

    // Add view 2
    wbRouter.navigate(['view-2'], {blankPartId: MAIN_PART_ID}).then();
    advance(fixture);

    // Move view 1 to a new part in the center
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        primaryPart: true,
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        region: 'center',
      },
    });
    advance(fixture);

    expect(fixture).toBePartsLayout(new Part({partId: MAIN_PART_ID, activeViewId: 'view.2', viewIds: ['view.1', 'view.2']}));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual(MAIN_PART_ID);
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual(MAIN_PART_ID);
  }));

  it('allows to move views to another part', fakeAsync(() => {
    const workbench = getService(WorkbenchService);
    const wbRouter = getService(WorkbenchRouter);
    const viewDragService = getService(ViewDragService);
    const viewRegistry = getService(WorkbenchViewRegistry);

    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add view 1
    wbRouter.navigate(['view-1'], {blankPartId: MAIN_PART_ID}).then();
    advance(fixture);

    // Add view 2
    wbRouter.navigate(['view-2'], {blankPartId: MAIN_PART_ID}).then();
    advance(fixture);

    // Add view 3
    wbRouter.navigate(['view-3'], {blankPartId: MAIN_PART_ID}).then();
    advance(fixture);

    // Move view 3 to a new part in the east
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        primaryPart: true,
        viewId: 'view.3',
        viewUrlSegments: [new UrlSegment('view-3', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        region: 'east',
        newPartId: 'EAST',
      },
    });
    advance(fixture);

    // Move view 2 to the new ViewPart
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        primaryPart: true,
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'EAST',
        region: 'center',
      },
    });
    advance(fixture);

    expect(fixture).toBePartsLayout(new TreeNode({
      child1: new Part({partId: MAIN_PART_ID, viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new Part({partId: 'EAST', viewIds: ['view.3', 'view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'row',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual(MAIN_PART_ID);
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('EAST');
    expect(viewRegistry.getElseThrow('view.3').part.partId).toEqual('EAST');

    // Move view 1 to the new part
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        primaryPart: true,
        viewId: 'view.1',
        viewUrlSegments: [new UrlSegment('view-1', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: 'EAST',
        region: 'center',
      },
    });
    advance(fixture);

    expect(fixture).toBePartsLayout(new Part({partId: 'EAST', activeViewId: 'view.1', viewIds: ['view.3', 'view.2', 'view.1']}));

    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual('EAST');
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('EAST');
    expect(viewRegistry.getElseThrow('view.3').part.partId).toEqual('EAST');
  }));

  it('allows to move the last view of a part to a new part in the east', fakeAsync(() => {
    const workbench = getService(WorkbenchService);
    const wbRouter = getService(WorkbenchRouter);
    const viewDragService = getService(ViewDragService);
    const viewRegistry = getService(WorkbenchViewRegistry);

    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add view 1
    wbRouter.navigate(['view-1'], {blankPartId: MAIN_PART_ID}).then();
    advance(fixture);

    // Add view 2
    wbRouter.navigate(['view-2'], {blankPartId: MAIN_PART_ID}).then();
    advance(fixture);

    // Move view 2 to a new part in the east
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        primaryPart: true,
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        region: 'east',
        newPartId: 'EAST-1',
      },
    });
    advance(fixture);
    expect(fixture).toBePartsLayout(new TreeNode({
      child1: new Part({partId: MAIN_PART_ID, viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new Part({partId: 'EAST-1', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'row',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual(MAIN_PART_ID);
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('EAST-1');

    // Move view 2 to a new part in the east of part 1
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'EAST-1',
        primaryPart: true,
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        region: 'east',
        newPartId: 'EAST-2',
      },
    });
    advance(fixture);
    expect(fixture).toBePartsLayout(new TreeNode({
      child1: new Part({partId: MAIN_PART_ID, viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new Part({partId: 'EAST-2', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'row',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual(MAIN_PART_ID);
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('EAST-2');
  }));

  it('allows to move the last view of a part to a new part in the west', fakeAsync(() => {
    const workbench = getService(WorkbenchService);
    const wbRouter = getService(WorkbenchRouter);
    const viewDragService = getService(ViewDragService);
    const viewRegistry = getService(WorkbenchViewRegistry);

    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add view 1
    wbRouter.navigate(['view-1'], {blankPartId: MAIN_PART_ID}).then();
    advance(fixture);

    // Add view 2
    wbRouter.navigate(['view-2'], {blankPartId: MAIN_PART_ID}).then();
    advance(fixture);

    // Move view 2 to a new part in the east
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        primaryPart: true,
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        region: 'east',
        newPartId: 'EAST',
      },
    });
    advance(fixture);
    expect(fixture).toBePartsLayout(new TreeNode({
      child1: new Part({partId: MAIN_PART_ID, viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new Part({partId: 'EAST', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'row',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual(MAIN_PART_ID);
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('EAST');

    // Move view 2 to a new part in the west of part 1
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'EAST',
        primaryPart: true,
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        region: 'west',
        newPartId: 'WEST-2',
      },
    });
    advance(fixture);
    expect(fixture).toBePartsLayout(new TreeNode({
      child1: new Part({partId: 'WEST-2', viewIds: ['view.2'], activeViewId: 'view.2'}),
      child2: new Part({partId: MAIN_PART_ID, viewIds: ['view.1'], activeViewId: 'view.1'}),
      ratio: .5,
      direction: 'row',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual(MAIN_PART_ID);
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('WEST-2');
  }));

  it('allows to move the last view of a part to a new viewpart in the north', fakeAsync(() => {
    const workbench = getService(WorkbenchService);
    const wbRouter = getService(WorkbenchRouter);
    const viewDragService = getService(ViewDragService);
    const viewRegistry = getService(WorkbenchViewRegistry);

    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add view 1
    wbRouter.navigate(['view-1'], {blankPartId: MAIN_PART_ID}).then();
    advance(fixture);

    // Add view 2
    wbRouter.navigate(['view-2'], {blankPartId: MAIN_PART_ID}).then();
    advance(fixture);

    // Move view 2 to a new part in the east
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        primaryPart: true,
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        region: 'east',
        newPartId: 'EAST',
      },
    });
    advance(fixture);
    expect(fixture).toBePartsLayout(new TreeNode({
      child1: new Part({partId: MAIN_PART_ID, viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new Part({partId: 'EAST', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'row',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual(MAIN_PART_ID);
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('EAST');

    // Move view 2 to a new part in the north of part 1
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'EAST',
        primaryPart: true,
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        region: 'north',
        newPartId: 'NORTH',
      },
    });
    advance(fixture);
    expect(fixture).toBePartsLayout(new TreeNode({
      child1: new Part({partId: 'NORTH', viewIds: ['view.2'], activeViewId: 'view.2'}),
      child2: new Part({partId: MAIN_PART_ID, viewIds: ['view.1'], activeViewId: 'view.1'}),
      ratio: .5,
      direction: 'column',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual(MAIN_PART_ID);
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('NORTH');
  }));

  it('allows to move the last view of a part to a new part in the south', fakeAsync(() => {
    const workbench = getService(WorkbenchService);
    const wbRouter = getService(WorkbenchRouter);
    const viewDragService = getService(ViewDragService);
    const viewRegistry = getService(WorkbenchViewRegistry);

    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add view 1
    wbRouter.navigate(['view-1'], {blankPartId: MAIN_PART_ID}).then();
    advance(fixture);

    // Add view 2
    wbRouter.navigate(['view-2'], {blankPartId: MAIN_PART_ID}).then();
    advance(fixture);

    // Move view 2 to a new part in the east
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        primaryPart: true,
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        region: 'east',
        newPartId: 'EAST',
      },
    });
    advance(fixture);
    expect(fixture).toBePartsLayout(new TreeNode({
      child1: new Part({partId: MAIN_PART_ID, viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new Part({partId: 'EAST', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'row',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual(MAIN_PART_ID);
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('EAST');

    // Move view 2 to a new part in the south of part 1
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: 'EAST',
        primaryPart: true,
        viewId: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        region: 'south',
        newPartId: 'SOUTH',
      },
    });
    advance(fixture);
    expect(fixture).toBePartsLayout(new TreeNode({
      child1: new Part({partId: MAIN_PART_ID, viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new Part({partId: 'SOUTH', viewIds: ['view.2'], activeViewId: 'view.2'}),
      ratio: .5,
      direction: 'column',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual(MAIN_PART_ID);
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('SOUTH');
  }));

  it('allows to move a view around parts', fakeAsync(() => {
    const workbench = getService(WorkbenchService);
    const wbRouter = getService(WorkbenchRouter);
    const viewDragService = getService(ViewDragService);
    const viewRegistry = getService(WorkbenchViewRegistry);

    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    const viewPartRegistry = fixture.componentRef.injector.get(WorkbenchViewPartRegistry);

    // Add view 1
    wbRouter.navigate(['view-1'], {blankPartId: MAIN_PART_ID}).then();
    advance(fixture);

    // Add view 2
    wbRouter.navigate(['view-2'], {blankPartId: MAIN_PART_ID}).then();
    advance(fixture);

    // Add view 3
    wbRouter.navigate(['view-3'], {blankPartId: MAIN_PART_ID}).then();
    advance(fixture);

    expect(fixture).toBePartsLayout(new Part({partId: MAIN_PART_ID, activeViewId: 'view.3', viewIds: ['view.1', 'view.2', 'view.3']}));

    // Move view 3 to a new part in the east
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        primaryPart: true,
        viewId: 'view.3',
        viewUrlSegments: [new UrlSegment('view-3', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        region: 'east',
        newPartId: 'EAST',
      },
    });
    advance(fixture);
    expect(fixture).toBePartsLayout(new TreeNode({
      child1: new Part({partId: MAIN_PART_ID, viewIds: ['view.1', 'view.2'], activeViewId: 'view.2'}),
      child2: new Part({partId: 'EAST', viewIds: ['view.3'], activeViewId: 'view.3'}),
      ratio: .5,
      direction: 'row',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual(MAIN_PART_ID);
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual(MAIN_PART_ID);
    expect(viewRegistry.getElseThrow('view.3').part.partId).toEqual('EAST');

    // Move view 2 to a new part in the south of part 2
    const viewPart2Component = viewPartRegistry.getElseThrow('EAST').portal.componentRef.instance;
    expect(viewPart2Component).toBeTruthy();

    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        partId: MAIN_PART_ID,
        primaryPart: true,
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
    advance(fixture);
    expect(fixture).toBePartsLayout(new TreeNode({
      child1: new Part({partId: MAIN_PART_ID, viewIds: ['view.1'], activeViewId: 'view.1'}),
      child2: new TreeNode({
        child1: new Part({partId: 'EAST', viewIds: ['view.3'], activeViewId: 'view.3'}),
        child2: new Part({partId: 'SOUTH-EAST', viewIds: ['view.2'], activeViewId: 'view.2'}),
        ratio: .5,
        direction: 'column',
      }),
      ratio: .5,
      direction: 'row',
    }));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual(MAIN_PART_ID);
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('SOUTH-EAST');
    expect(viewRegistry.getElseThrow('view.3').part.partId).toEqual('EAST');

      // Move view 2 to a new part in the south of part 1
      viewDragService.dispatchViewMoveEvent({
        source: {
          appInstanceId: workbench.appInstanceId,
          partId: 'SOUTH-EAST',
          primaryPart: true,
          viewId: 'view.2',
          viewUrlSegments: [new UrlSegment('view-2', {})],
        },
        target: {
          appInstanceId: workbench.appInstanceId,
          partId: MAIN_PART_ID,
          newPartId: 'SOUTH-WEST',
          region: 'south',
        },
      });
      advance(fixture);
      expect(fixture).toBePartsLayout(new TreeNode({
        child1: new TreeNode({
          child1: new Part({partId: MAIN_PART_ID, viewIds: ['view.1'], activeViewId: 'view.1'}),
          child2: new Part({partId: 'SOUTH-WEST', viewIds: ['view.2'], activeViewId: 'view.2'}),
          ratio: .5,
          direction: 'column',
        }),
        child2: new Part({partId: 'EAST', viewIds: ['view.3'], activeViewId: 'view.3'}),
        ratio: .5,
        direction: 'row',
      }));
      expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual(MAIN_PART_ID);
      expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual('SOUTH-WEST');
      expect(viewRegistry.getElseThrow('view.3').part.partId).toEqual('EAST');
    }));

    it('should open the same view multiple times', fakeAsync(() => {
      const wbRouter = getService(WorkbenchRouter);
      const viewRegistry = getService(WorkbenchViewRegistry);

      const fixture = TestBed.createComponent(ViewPartGridComponent);
      fixture.debugElement.nativeElement.style.height = '500px';
      advance(fixture);

      // Add view 1
      wbRouter.navigate(['view-1'], {blankPartId: MAIN_PART_ID}).then();
      advance(fixture);

      // Add view 2
      wbRouter.navigate(['view-2'], {blankPartId: MAIN_PART_ID}).then();
      advance(fixture);

      // Add view 2 again
      wbRouter.navigate(['view-2'], {blankPartId: MAIN_PART_ID, activateIfPresent: true}).then();
      advance(fixture);

      expect(fixture).toBePartsLayout(new Part({partId: MAIN_PART_ID, activeViewId: 'view.2', viewIds: ['view.1', 'view.2']}));
      expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual(MAIN_PART_ID);
      expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual(MAIN_PART_ID);
  }));

  it('should open the same view multiple times', fakeAsync(() => {
    const wbRouter = getService(WorkbenchRouter);
    const viewRegistry = getService(WorkbenchViewRegistry);

    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add view 1
    wbRouter.navigate(['view-1'], {blankPartId: MAIN_PART_ID}).then();
    advance(fixture);

    // Add view 2
    wbRouter.navigate(['view-2'], {blankPartId: MAIN_PART_ID}).then();
    advance(fixture);

    // Add view 2 again
    wbRouter.navigate(['view-2'], {blankPartId: MAIN_PART_ID, activateIfPresent: false}).then();
    advance(fixture);

    expect(fixture).toBePartsLayout(new Part({partId: MAIN_PART_ID, activeViewId: 'view.3', viewIds: ['view.1', 'view.2', 'view.3']}));
    expect(viewRegistry.getElseThrow('view.1').part.partId).toEqual(MAIN_PART_ID);
    expect(viewRegistry.getElseThrow('view.2').part.partId).toEqual(MAIN_PART_ID);
    expect(viewRegistry.getElseThrow('view.3').part.partId).toEqual(MAIN_PART_ID);
  }));
})
;

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

@NgModule({
  declarations: [View1Component, View2Component, View3Component],
  imports: [
    WorkbenchTestingModule.forRoot(),
    RouterTestingModule.withRoutes([
      {path: 'view-1', component: View1Component},
      {path: 'view-2', component: View2Component},
      {path: 'view-3', component: View3Component},
    ]),
  ],
})
class AppTestModule {
}

// TODO [Angular 9]: remove once 'angular/issues/29905' and 'angular/issues/23611' are fixed
function getService<T>(token: Type<T> | AbstractType<T> | InjectionToken<T>): T {
  return TestBed.get(token as Type<T>);
}

