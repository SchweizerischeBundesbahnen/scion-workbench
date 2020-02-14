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
import { WorkbenchViewPartRegistry } from '../view-part-grid/workbench-view-part-registry.service';
import { WorkbenchRouter } from '../routing/workbench-router.service';
import { advance } from './util/util.spec';
import { WorkbenchTestingModule } from './workbench-testing.module';
import { WorkbenchService } from '../workbench.service';
import { ViewDragService } from '../view-dnd/view-drag.service';
import { WorkbenchViewRegistry } from '../workbench-view-registry.service';

describe('ViewPartGridComponent', () => {

  beforeEach(async(() => {
    jasmine.addMatchers(jasmineCustomMatchers);

    TestBed.configureTestingModule({
      imports: [AppTestModule],
    });

    TestBed.inject(Router).initialNavigation();
  }));

  it('allows to move a view into a new view part in the east', fakeAsync(() => {
    const workbench = getService(WorkbenchService);
    const wbRouter = getService(WorkbenchRouter);
    const viewDragService = getService(ViewDragService);
    const viewRegistry = getService(WorkbenchViewRegistry);

    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add View 1
    wbRouter.navigate(['view-1'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Add View 2
    wbRouter.navigate(['view-2'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Move View 2 to a new ViewPart in the east
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewRef: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewPartRegion: 'east',
      },
    });
    advance(fixture);

    expect(fixture).toBeViewPartGrid({
      id: 1,
      sash1: ['viewpart.1', 'view.1', 'view.1'],
      sash2: ['viewpart.2', 'view.2', 'view.2'],
      splitter: .5,
      hsplit: false,
    });
    expect(viewRegistry.getElseThrow('view.1').viewPart.viewPartRef).toEqual('viewpart.1');
    expect(viewRegistry.getElseThrow('view.2').viewPart.viewPartRef).toEqual('viewpart.2');
  }));

  it('allows to move a view into a new view part in the west', fakeAsync(() => {
    const workbench = getService(WorkbenchService);
    const wbRouter = getService(WorkbenchRouter);
    const viewDragService = getService(ViewDragService);
    const viewRegistry = getService(WorkbenchViewRegistry);

    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add View 1
    wbRouter.navigate(['view-1'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Add View 2
    wbRouter.navigate(['view-2'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Move View 2 to a new ViewPart in the west
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewRef: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewPartRegion: 'west',
      },
    });
    advance(fixture);

    expect(fixture).toBeViewPartGrid({
      id: 1,
      sash1: ['viewpart.2', 'view.2', 'view.2'],
      sash2: ['viewpart.1', 'view.1', 'view.1'],
      splitter: .5,
      hsplit: false,
    });
    expect(viewRegistry.getElseThrow('view.1').viewPart.viewPartRef).toEqual('viewpart.1');
    expect(viewRegistry.getElseThrow('view.2').viewPart.viewPartRef).toEqual('viewpart.2');
  }));

  it('allows to move a view into a new view part in the north', fakeAsync(() => {
    const workbench = getService(WorkbenchService);
    const wbRouter = getService(WorkbenchRouter);
    const viewDragService = getService(ViewDragService);
    const viewRegistry = getService(WorkbenchViewRegistry);

    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add View 1
    wbRouter.navigate(['view-1'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Add View 2
    wbRouter.navigate(['view-2'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Move View 1 to a new ViewPart in the north
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewRef: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewPartRegion: 'north',
      },
    });
    advance(fixture);

    expect(fixture).toBeViewPartGrid({
      id: 1,
      sash1: ['viewpart.2', 'view.2', 'view.2'],
      sash2: ['viewpart.1', 'view.1', 'view.1'],
      splitter: .5,
      hsplit: true,
    });
    expect(viewRegistry.getElseThrow('view.1').viewPart.viewPartRef).toEqual('viewpart.1');
    expect(viewRegistry.getElseThrow('view.2').viewPart.viewPartRef).toEqual('viewpart.2');
  }));

  it('allows to move a view into a new view part in the south', fakeAsync(() => {
    const workbench = getService(WorkbenchService);
    const wbRouter = getService(WorkbenchRouter);
    const viewDragService = getService(ViewDragService);
    const viewRegistry = getService(WorkbenchViewRegistry);

    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add View 1
    wbRouter.navigate(['view-1'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Add View 2
    wbRouter.navigate(['view-2'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Move View 1 to a new ViewPart in the south
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewRef: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewPartRegion: 'south',
      },
    });
    advance(fixture);

    expect(fixture).toBeViewPartGrid({
      id: 1,
      sash1: ['viewpart.1', 'view.1', 'view.1'],
      sash2: ['viewpart.2', 'view.2', 'view.2'],
      splitter: .5,
      hsplit: true,
    });
    expect(viewRegistry.getElseThrow('view.1').viewPart.viewPartRef).toEqual('viewpart.1');
    expect(viewRegistry.getElseThrow('view.2').viewPart.viewPartRef).toEqual('viewpart.2');
  }));

  it('disallows to move a view into a new view part in the center', fakeAsync(() => {
    const workbench = getService(WorkbenchService);
    const wbRouter = getService(WorkbenchRouter);
    const viewDragService = getService(ViewDragService);
    const viewRegistry = getService(WorkbenchViewRegistry);

    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add View 1
    wbRouter.navigate(['view-1'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Add View 2
    wbRouter.navigate(['view-2'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Move View 1 to a new ViewPart in the center
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewRef: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewPartRegion: 'center',
      },
    });
    advance(fixture);

    expect(fixture).toBeViewPartGrid(['viewpart.1', 'view.2', 'view.1', 'view.2']);
    expect(viewRegistry.getElseThrow('view.1').viewPart.viewPartRef).toEqual('viewpart.1');
    expect(viewRegistry.getElseThrow('view.2').viewPart.viewPartRef).toEqual('viewpart.1');
  }));

  it('allows to move views to another view part', fakeAsync(() => {
    const workbench = getService(WorkbenchService);
    const wbRouter = getService(WorkbenchRouter);
    const viewDragService = getService(ViewDragService);
    const viewRegistry = getService(WorkbenchViewRegistry);

    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add View 1
    wbRouter.navigate(['view-1'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Add View 2
    wbRouter.navigate(['view-2'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Add View 3
    wbRouter.navigate(['view-3'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Move View 3 to a new ViewPart in the east
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewRef: 'view.3',
        viewUrlSegments: [new UrlSegment('view-3', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewPartRegion: 'east',
      },
    });
    advance(fixture);

    // Move View 2 to the new ViewPart
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewRef: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.2',
        viewPartRegion: 'center',
      },
    });
    advance(fixture);

    expect(fixture).toBeViewPartGrid({
      id: 1,
      sash1: ['viewpart.1', 'view.1', 'view.1'],
      sash2: ['viewpart.2', 'view.2', 'view.3', 'view.2'],
      splitter: .5,
      hsplit: false,
    });
    expect(viewRegistry.getElseThrow('view.1').viewPart.viewPartRef).toEqual('viewpart.1');
    expect(viewRegistry.getElseThrow('view.2').viewPart.viewPartRef).toEqual('viewpart.2');
    expect(viewRegistry.getElseThrow('view.3').viewPart.viewPartRef).toEqual('viewpart.2');

    // Move View 1 to the new ViewPart
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewRef: 'view.1',
        viewUrlSegments: [new UrlSegment('view-1', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.2',
        viewPartRegion: 'center',
      },
    });
    advance(fixture);

    expect(fixture).toBeViewPartGrid(['viewpart.2', 'view.1', 'view.3', 'view.2', 'view.1']);
    expect(viewRegistry.getElseThrow('view.1').viewPart.viewPartRef).toEqual('viewpart.2');
    expect(viewRegistry.getElseThrow('view.2').viewPart.viewPartRef).toEqual('viewpart.2');
    expect(viewRegistry.getElseThrow('view.3').viewPart.viewPartRef).toEqual('viewpart.2');
  }));

  it('allows to move the last view of a viewpart to a new viewpart in the east', fakeAsync(() => {
    const workbench = getService(WorkbenchService);
    const wbRouter = getService(WorkbenchRouter);
    const viewDragService = getService(ViewDragService);
    const viewRegistry = getService(WorkbenchViewRegistry);

    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add View 1
    wbRouter.navigate(['view-1'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Add View 2
    wbRouter.navigate(['view-2'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Move View 2 to a new ViewPart in the east
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewRef: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewPartRegion: 'east',
      },
    });
    advance(fixture);
    expect(fixture).toBeViewPartGrid({
      id: 1,
      sash1: ['viewpart.1', 'view.1', 'view.1'],
      sash2: ['viewpart.2', 'view.2', 'view.2'],
      splitter: .5,
      hsplit: false,
    });
    expect(viewRegistry.getElseThrow('view.1').viewPart.viewPartRef).toEqual('viewpart.1');
    expect(viewRegistry.getElseThrow('view.2').viewPart.viewPartRef).toEqual('viewpart.2');

    // Move View 2 to a new ViewPart in the east of ViewPart 1
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.2',
        viewRef: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewPartRegion: 'east',
      },
    });
    advance(fixture);
    expect(fixture).toBeViewPartGrid({
      id: 2,
      sash1: ['viewpart.1', 'view.1', 'view.1'],
      sash2: ['viewpart.3', 'view.2', 'view.2'],
      splitter: .5,
      hsplit: false,
    });
    expect(viewRegistry.getElseThrow('view.1').viewPart.viewPartRef).toEqual('viewpart.1');
    expect(viewRegistry.getElseThrow('view.2').viewPart.viewPartRef).toEqual('viewpart.3');
  }));

  it('allows to move the last view of a viewpart to a new viewpart in the west', fakeAsync(() => {
    const workbench = getService(WorkbenchService);
    const wbRouter = getService(WorkbenchRouter);
    const viewDragService = getService(ViewDragService);
    const viewRegistry = getService(WorkbenchViewRegistry);

    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add View 1
    wbRouter.navigate(['view-1'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Add View 2
    wbRouter.navigate(['view-2'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Move View 2 to a new ViewPart in the east
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewRef: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewPartRegion: 'east',
      },
    });
    advance(fixture);
    expect(fixture).toBeViewPartGrid({
      id: 1,
      sash1: ['viewpart.1', 'view.1', 'view.1'],
      sash2: ['viewpart.2', 'view.2', 'view.2'],
      splitter: .5,
      hsplit: false,
    });
    expect(viewRegistry.getElseThrow('view.1').viewPart.viewPartRef).toEqual('viewpart.1');
    expect(viewRegistry.getElseThrow('view.2').viewPart.viewPartRef).toEqual('viewpart.2');

    // Move View 2 to a new ViewPart in the west of ViewPart 1
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.2',
        viewRef: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewPartRegion: 'west',
      },
    });
    advance(fixture);
    expect(fixture).toBeViewPartGrid({
      id: 2,
      sash1: ['viewpart.3', 'view.2', 'view.2'],
      sash2: ['viewpart.1', 'view.1', 'view.1'],
      splitter: .5,
      hsplit: false,
    });
    expect(viewRegistry.getElseThrow('view.1').viewPart.viewPartRef).toEqual('viewpart.1');
    expect(viewRegistry.getElseThrow('view.2').viewPart.viewPartRef).toEqual('viewpart.3');
  }));

  it('allows to move the last view of a viewpart to a new viewpart in the north', fakeAsync(() => {
    const workbench = getService(WorkbenchService);
    const wbRouter = getService(WorkbenchRouter);
    const viewDragService = getService(ViewDragService);
    const viewRegistry = getService(WorkbenchViewRegistry);

    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add View 1
    wbRouter.navigate(['view-1'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Add View 2
    wbRouter.navigate(['view-2'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Move View 2 to a new ViewPart in the east
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewRef: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewPartRegion: 'east',
      },
    });
    advance(fixture);
    expect(fixture).toBeViewPartGrid({
      id: 1,
      sash1: ['viewpart.1', 'view.1', 'view.1'],
      sash2: ['viewpart.2', 'view.2', 'view.2'],
      splitter: .5,
      hsplit: false,
    });
    expect(viewRegistry.getElseThrow('view.1').viewPart.viewPartRef).toEqual('viewpart.1');
    expect(viewRegistry.getElseThrow('view.2').viewPart.viewPartRef).toEqual('viewpart.2');

    // Move View 2 to a new ViewPart in the north of ViewPart 1
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.2',
        viewRef: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewPartRegion: 'north',
      },
    });
    advance(fixture);
    expect(fixture).toBeViewPartGrid({
      id: 2,
      sash1: ['viewpart.3', 'view.2', 'view.2'],
      sash2: ['viewpart.1', 'view.1', 'view.1'],
      splitter: .5,
      hsplit: true,
    });
    expect(viewRegistry.getElseThrow('view.1').viewPart.viewPartRef).toEqual('viewpart.1');
    expect(viewRegistry.getElseThrow('view.2').viewPart.viewPartRef).toEqual('viewpart.3');
  }));

  it('allows to move the last view of a viewpart to a new viewpart in the south', fakeAsync(() => {
    const workbench = getService(WorkbenchService);
    const wbRouter = getService(WorkbenchRouter);
    const viewDragService = getService(ViewDragService);
    const viewRegistry = getService(WorkbenchViewRegistry);

    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add View 1
    wbRouter.navigate(['view-1'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Add View 2
    wbRouter.navigate(['view-2'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Move View 2 to a new ViewPart in the east
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewRef: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewPartRegion: 'east',
      },
    });
    advance(fixture);
    expect(fixture).toBeViewPartGrid({
      id: 1,
      sash1: ['viewpart.1', 'view.1', 'view.1'],
      sash2: ['viewpart.2', 'view.2', 'view.2'],
      splitter: .5,
      hsplit: false,
    });
    expect(viewRegistry.getElseThrow('view.1').viewPart.viewPartRef).toEqual('viewpart.1');
    expect(viewRegistry.getElseThrow('view.2').viewPart.viewPartRef).toEqual('viewpart.2');

    // Move View 2 to a new ViewPart in the south of ViewPart 1
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.2',
        viewRef: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewPartRegion: 'south',
      },
    });
    advance(fixture);
    expect(fixture).toBeViewPartGrid({
      id: 2,
      sash1: ['viewpart.1', 'view.1', 'view.1'],
      sash2: ['viewpart.3', 'view.2', 'view.2'],
      splitter: .5,
      hsplit: true,
    });
    expect(viewRegistry.getElseThrow('view.1').viewPart.viewPartRef).toEqual('viewpart.1');
    expect(viewRegistry.getElseThrow('view.2').viewPart.viewPartRef).toEqual('viewpart.3');
  }));

  it('allows to move a view around viewparts', fakeAsync(() => {
    const workbench = getService(WorkbenchService);
    const wbRouter = getService(WorkbenchRouter);
    const viewDragService = getService(ViewDragService);
    const viewRegistry = getService(WorkbenchViewRegistry);

    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    const viewPartRegistry = fixture.componentRef.injector.get(WorkbenchViewPartRegistry);

    // Add View 1
    wbRouter.navigate(['view-1'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Add View 2
    wbRouter.navigate(['view-2'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Add View 3
    wbRouter.navigate(['view-3'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    expect(fixture).toBeViewPartGrid(['viewpart.1', 'view.3', 'view.1', 'view.2', 'view.3']);

    // Move View 3 to a new ViewPart in the east
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewRef: 'view.3',
        viewUrlSegments: [new UrlSegment('view-3', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewPartRegion: 'east',
      },
    });
    advance(fixture);
    expect(fixture).toBeViewPartGrid({
      id: 1,
      sash1: ['viewpart.1', 'view.2', 'view.1', 'view.2'],
      sash2: ['viewpart.2', 'view.3', 'view.3'],
      splitter: .5,
      hsplit: false,
    });
    expect(viewRegistry.getElseThrow('view.1').viewPart.viewPartRef).toEqual('viewpart.1');
    expect(viewRegistry.getElseThrow('view.2').viewPart.viewPartRef).toEqual('viewpart.1');
    expect(viewRegistry.getElseThrow('view.3').viewPart.viewPartRef).toEqual('viewpart.2');

    // Move View 2 to a new ViewPart in the south of ViewPart 2
    const viewPart2Component = viewPartRegistry.getElseThrow('viewpart.2').portal.componentRef.instance;
    expect(viewPart2Component).toBeTruthy();

    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewRef: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.2',
        viewPartRegion: 'south',
      },
    });
    advance(fixture);
    expect(fixture).toBeViewPartGrid({
      id: 1,
      sash1: ['viewpart.1', 'view.1', 'view.1'],
      sash2: {
        id: 2,
        sash1: ['viewpart.2', 'view.3', 'view.3'],
        sash2: ['viewpart.3', 'view.2', 'view.2'],
        splitter: .5,
        hsplit: true,
      },
      splitter: .5,
      hsplit: false,
    });
    expect(viewRegistry.getElseThrow('view.1').viewPart.viewPartRef).toEqual('viewpart.1');
    expect(viewRegistry.getElseThrow('view.2').viewPart.viewPartRef).toEqual('viewpart.3');
    expect(viewRegistry.getElseThrow('view.3').viewPart.viewPartRef).toEqual('viewpart.2');

    // Move View 2 to a new ViewPart in the south of ViewPart 1
    viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.3',
        viewRef: 'view.2',
        viewUrlSegments: [new UrlSegment('view-2', {})],
      },
      target: {
        appInstanceId: workbench.appInstanceId,
        viewPartRef: 'viewpart.1',
        viewPartRegion: 'south',
      },
    });
    advance(fixture);
    expect(fixture).toBeViewPartGrid({
      id: 1,
      sash1: {
        id: 3,
        sash1: ['viewpart.1', 'view.1', 'view.1'],
        sash2: ['viewpart.4', 'view.2', 'view.2'],
        splitter: .5,
        hsplit: true,
      },
      sash2: ['viewpart.2', 'view.3', 'view.3'],
      splitter: .5,
      hsplit: false,
    });
    expect(viewRegistry.getElseThrow('view.1').viewPart.viewPartRef).toEqual('viewpart.1');
    expect(viewRegistry.getElseThrow('view.2').viewPart.viewPartRef).toEqual('viewpart.4');
    expect(viewRegistry.getElseThrow('view.3').viewPart.viewPartRef).toEqual('viewpart.2');
  }));

  it('should open the same view multiple times', fakeAsync(() => {
    const wbRouter = getService(WorkbenchRouter);
    const viewRegistry = getService(WorkbenchViewRegistry);

    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add View 1
    wbRouter.navigate(['view-1'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Add View 2
    wbRouter.navigate(['view-2'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Add View 2 again
    wbRouter.navigate(['view-2'], {blankViewPartRef: 'viewpart.1', activateIfPresent: true}).then();
    advance(fixture);

    expect(fixture).toBeViewPartGrid(['viewpart.1', 'view.2', 'view.1', 'view.2']);
    expect(viewRegistry.getElseThrow('view.1').viewPart.viewPartRef).toEqual('viewpart.1');
    expect(viewRegistry.getElseThrow('view.2').viewPart.viewPartRef).toEqual('viewpart.1');
  }));

  it('should open the same view multiple times', fakeAsync(() => {
    const wbRouter = getService(WorkbenchRouter);
    const viewRegistry = getService(WorkbenchViewRegistry);

    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add View 1
    wbRouter.navigate(['view-1'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Add View 2
    wbRouter.navigate(['view-2'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Add View 2 again
    wbRouter.navigate(['view-2'], {blankViewPartRef: 'viewpart.1', activateIfPresent: false}).then();
    advance(fixture);

    expect(fixture).toBeViewPartGrid(['viewpart.1', 'view.3', 'view.1', 'view.2', 'view.3']);
    expect(viewRegistry.getElseThrow('view.1').viewPart.viewPartRef).toEqual('viewpart.1');
    expect(viewRegistry.getElseThrow('view.2').viewPart.viewPartRef).toEqual('viewpart.1');
    expect(viewRegistry.getElseThrow('view.3').viewPart.viewPartRef).toEqual('viewpart.1');
  }));
})
;

/****************************************************************************************************
 * Definition of App Test Module                                                                    *
 ****************************************************************************************************/
@Component({selector: 'spec-view1', template: 'View 1'})
class View1Component {
}

@Component({selector: 'spec-view2', template: 'View 2'})
class View2Component {
}

@Component({selector: 'spec-view3', template: 'View 3'})
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
  return TestBed.inject(token as Type<T>);
}

