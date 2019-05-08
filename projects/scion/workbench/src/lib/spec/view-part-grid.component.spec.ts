/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { async, fakeAsync, inject, TestBed } from '@angular/core/testing';
import { expect, jasmineCustomMatchers } from './util/jasmine-custom-matchers.spec';
import { Component, NgModule } from '@angular/core';
import { WorkbenchModule } from '../workbench.module';
import { ViewPartGridComponent } from '../view-part-grid/view-part-grid.component';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkbenchViewPartRegistry } from '../view-part-grid/workbench-view-part-registry.service';
import { WorkbenchRouter } from '../routing/workbench-router.service';
import { advance } from './util/util.spec';

describe('ViewPartGridComponent', () => {

  beforeEach(async(() => {
    jasmine.addMatchers(jasmineCustomMatchers);

    TestBed.configureTestingModule({
      imports: [AppTestModule],
    });

    TestBed.get(Router).initialNavigation();
  }));

  it('allows to move a view into a new view part in the east', fakeAsync(inject([WorkbenchRouter], (wbRouter: WorkbenchRouter) => {
    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    const gridComponent: ViewPartGridComponent = fixture.componentInstance;
    const viewPart1Component = gridComponent.viewPartPortal.componentRef.instance;

    // Add View 1
    wbRouter.navigate(['view-1'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Add View 2
    wbRouter.navigate(['view-2'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Move View 2 to a new ViewPart in the east
    viewPart1Component.moveViewToNewViewPart('view.2', 'east').then();
    advance(fixture);

    expect(fixture).toBeViewPartGrid({
      id: 1,
      sash1: ['viewpart.1', 'view.1', 'view.1'],
      sash2: ['viewpart.2', 'view.2', 'view.2'],
      splitter: .5,
      hsplit: false,
    });
  })));

  it('allows to move a view into a new view part in the west', fakeAsync(inject([WorkbenchRouter], (wbRouter: WorkbenchRouter) => {
    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    const gridComponent: ViewPartGridComponent = fixture.componentInstance;
    const viewPart1Component = gridComponent.viewPartPortal.componentRef.instance;

    // Add View 1
    wbRouter.navigate(['view-1'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Add View 2
    wbRouter.navigate(['view-2'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Move View 2 to a new ViewPart in the west
    viewPart1Component.moveViewToNewViewPart('view.2', 'west').then();
    advance(fixture);

    expect(fixture).toBeViewPartGrid({
      id: 1,
      sash1: ['viewpart.2', 'view.2', 'view.2'],
      sash2: ['viewpart.1', 'view.1', 'view.1'],
      splitter: .5,
      hsplit: false,
    });
  })));

  it('allows to move a view into a new view part in the north', fakeAsync(inject([WorkbenchRouter], (wbRouter: WorkbenchRouter) => {
    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    const gridComponent: ViewPartGridComponent = fixture.componentInstance;
    const viewPart1Component = gridComponent.viewPartPortal.componentRef.instance;

    // Add View 1
    wbRouter.navigate(['view-1'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Add View 2
    wbRouter.navigate(['view-2'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Move View 1 to a new ViewPart in the north
    viewPart1Component.moveViewToNewViewPart('view.2', 'north').then();
    advance(fixture);

    expect(fixture).toBeViewPartGrid({
      id: 1,
      sash1: ['viewpart.2', 'view.2', 'view.2'],
      sash2: ['viewpart.1', 'view.1', 'view.1'],
      splitter: .5,
      hsplit: true,
    });
  })));

  it('allows to move a view into a new view part in the south', fakeAsync(inject([WorkbenchRouter], (wbRouter: WorkbenchRouter) => {
    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    const gridComponent: ViewPartGridComponent = fixture.componentInstance;
    const viewPart1Component = gridComponent.viewPartPortal.componentRef.instance;

    // Add View 1
    wbRouter.navigate(['view-1'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Add View 2
    wbRouter.navigate(['view-2'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Move View 1 to a new ViewPart in the south
    viewPart1Component.moveViewToNewViewPart('view.2', 'south').then();
    advance(fixture);

    expect(fixture).toBeViewPartGrid({
      id: 1,
      sash1: ['viewpart.1', 'view.1', 'view.1'],
      sash2: ['viewpart.2', 'view.2', 'view.2'],
      splitter: .5,
      hsplit: true,
    });
  })));

  it('disallows to move a view into a new view part in the center', fakeAsync(inject([WorkbenchRouter], (wbRouter: WorkbenchRouter) => {
    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    const gridComponent: ViewPartGridComponent = fixture.componentInstance;
    const viewPart1Component = gridComponent.viewPartPortal.componentRef.instance;

    // Add View 1
    wbRouter.navigate(['view-1'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Add View 2
    wbRouter.navigate(['view-2'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Move View 1 to a new ViewPart in the center
    viewPart1Component.moveViewToNewViewPart('view.2', 'center').then();
    advance(fixture);

    expect(fixture).toBeViewPartGrid(['viewpart.1', 'view.2', 'view.1', 'view.2']);
  })));

  it('allows to move views to another view part', fakeAsync(inject([WorkbenchRouter], (wbRouter: WorkbenchRouter) => {
    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    const gridComponent: ViewPartGridComponent = fixture.componentInstance;
    const viewPartRegistry = fixture.componentRef.injector.get(WorkbenchViewPartRegistry);
    const viewPart1Component = gridComponent.viewPartPortal.componentRef.instance;

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
    viewPart1Component.moveViewToNewViewPart('view.3', 'east').then();
    advance(fixture);

    const viewPart2 = viewPartRegistry.getElseThrow('viewpart.2');
    const viewPart2Component = viewPart2.portal.componentRef.instance;

    // Move View 2 to the new ViewPart
    viewPart2Component.moveViewToThisViewPart('view.2').then();
    advance(fixture);

    expect(fixture).toBeViewPartGrid({
      id: 1,
      sash1: ['viewpart.1', 'view.1', 'view.1'],
      sash2: ['viewpart.2', 'view.2', 'view.3', 'view.2'],
      splitter: .5,
      hsplit: false,
    });

    // Move View 1 to the new ViewPart
    viewPart2Component.moveViewToThisViewPart('view.1').then();
    advance(fixture);

    expect(fixture).toBeViewPartGrid(['viewpart.2', 'view.1', 'view.3', 'view.2', 'view.1']);
  })));

  it('allows to move the last view of another viewpart to a new viewpart in the east', fakeAsync(inject([WorkbenchRouter], (wbRouter: WorkbenchRouter) => {
    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    const gridComponent: ViewPartGridComponent = fixture.componentInstance;
    const viewPart1Component = gridComponent.viewPartPortal.componentRef.instance;

    // Add View 1
    wbRouter.navigate(['view-1'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Add View 2
    wbRouter.navigate(['view-2'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Move View 2 to a new ViewPart in the east
    viewPart1Component.moveViewToNewViewPart('view.2', 'east').then();
    advance(fixture);
    expect(fixture).toBeViewPartGrid({
      id: 1,
      sash1: ['viewpart.1', 'view.1', 'view.1'],
      sash2: ['viewpart.2', 'view.2', 'view.2'],
      splitter: .5,
      hsplit: false,
    });

    // Move View 2 to a new ViewPart in the east of ViewPart 1
    viewPart1Component.moveViewToNewViewPart('view.2', 'east').then();
    advance(fixture);
    expect(fixture).toBeViewPartGrid({
      id: 2,
      sash1: ['viewpart.1', 'view.1', 'view.1'],
      sash2: ['viewpart.3', 'view.2', 'view.2'],
      splitter: .5,
      hsplit: false,
    });
  })));

  it('allows to move the last view of another viewpart to a new viewpart in the west', fakeAsync(inject([WorkbenchRouter], (wbRouter: WorkbenchRouter) => {
    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    const gridComponent: ViewPartGridComponent = fixture.componentInstance;
    const viewPart1Component = gridComponent.viewPartPortal.componentRef.instance;

    // Add View 1
    wbRouter.navigate(['view-1'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Add View 2
    wbRouter.navigate(['view-2'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Move View 2 to a new ViewPart in the east
    viewPart1Component.moveViewToNewViewPart('view.2', 'east').then();
    advance(fixture);
    expect(fixture).toBeViewPartGrid({
      id: 1,
      sash1: ['viewpart.1', 'view.1', 'view.1'],
      sash2: ['viewpart.2', 'view.2', 'view.2'],
      splitter: .5,
      hsplit: false,
    });

    // Move View 2 to a new ViewPart in the west of ViewPart 1
    viewPart1Component.moveViewToNewViewPart('view.2', 'west').then();
    advance(fixture);
    expect(fixture).toBeViewPartGrid({
      id: 2,
      sash1: ['viewpart.3', 'view.2', 'view.2'],
      sash2: ['viewpart.1', 'view.1', 'view.1'],
      splitter: .5,
      hsplit: false,
    });
  })));

  it('allows to move the last view of another viewpart to a new viewpart in the north', fakeAsync(inject([WorkbenchRouter], (wbRouter: WorkbenchRouter) => {
    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    const gridComponent: ViewPartGridComponent = fixture.componentInstance;
    const viewPart1Component = gridComponent.viewPartPortal.componentRef.instance;

    // Add View 1
    wbRouter.navigate(['view-1'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Add View 2
    wbRouter.navigate(['view-2'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Move View 2 to a new ViewPart in the east
    viewPart1Component.moveViewToNewViewPart('view.2', 'east').then();
    advance(fixture);
    expect(fixture).toBeViewPartGrid({
      id: 1,
      sash1: ['viewpart.1', 'view.1', 'view.1'],
      sash2: ['viewpart.2', 'view.2', 'view.2'],
      splitter: .5,
      hsplit: false,
    });

    // Move View 2 to a new ViewPart in the north of ViewPart 1
    viewPart1Component.moveViewToNewViewPart('view.2', 'north').then();
    advance(fixture);
    expect(fixture).toBeViewPartGrid({
      id: 2,
      sash1: ['viewpart.3', 'view.2', 'view.2'],
      sash2: ['viewpart.1', 'view.1', 'view.1'],
      splitter: .5,
      hsplit: true,
    });
  })));

  it('allows to move the last view of another viewpart to a new viewpart in the south', fakeAsync(inject([WorkbenchRouter], (wbRouter: WorkbenchRouter) => {
    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    const gridComponent: ViewPartGridComponent = fixture.componentInstance;
    const viewPart1Component = gridComponent.viewPartPortal.componentRef.instance;

    // Add View 1
    wbRouter.navigate(['view-1'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Add View 2
    wbRouter.navigate(['view-2'], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Move View 2 to a new ViewPart in the east
    viewPart1Component.moveViewToNewViewPart('view.2', 'east').then();
    advance(fixture);
    expect(fixture).toBeViewPartGrid({
      id: 1,
      sash1: ['viewpart.1', 'view.1', 'view.1'],
      sash2: ['viewpart.2', 'view.2', 'view.2'],
      splitter: .5,
      hsplit: false,
    });

    // Move View 2 to a new ViewPart in the south of ViewPart 1
    viewPart1Component.moveViewToNewViewPart('view.2', 'south').then();
    advance(fixture);
    expect(fixture).toBeViewPartGrid({
      id: 2,
      sash1: ['viewpart.1', 'view.1', 'view.1'],
      sash2: ['viewpart.3', 'view.2', 'view.2'],
      splitter: .5,
      hsplit: true,
    });
  })));

  it('allows to move a view around viewparts', fakeAsync(inject([WorkbenchRouter], (wbRouter: WorkbenchRouter) => {
    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    const gridComponent: ViewPartGridComponent = fixture.componentInstance;
    const viewPartRegistry = fixture.componentRef.injector.get(WorkbenchViewPartRegistry);
    const viewPart1Component = gridComponent.viewPartPortal.componentRef.instance;

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
    viewPart1Component.moveViewToNewViewPart('view.3', 'east').then();
    advance(fixture);
    expect(fixture).toBeViewPartGrid({
      id: 1,
      sash1: ['viewpart.1', 'view.2', 'view.1', 'view.2'],
      sash2: ['viewpart.2', 'view.3', 'view.3'],
      splitter: .5,
      hsplit: false,
    });

    // Move View 2 to a new ViewPart in the south of ViewPart 2
    const viewPart2Component = viewPartRegistry.getElseThrow('viewpart.2').portal.componentRef.instance;
    expect(viewPart2Component).toBeTruthy();

    viewPart2Component.moveViewToNewViewPart('view.2', 'south').then();
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

    // Move View 2 to a new ViewPart in the south of ViewPart 1
    viewPart1Component.moveViewToNewViewPart('view.2', 'south').then();
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
  })));

  it('should open the same view multiple times', fakeAsync(inject([WorkbenchRouter], (wbRouter: WorkbenchRouter) => {
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
  })));

  it('should open the same view multiple times', fakeAsync(inject([WorkbenchRouter], (wbRouter: WorkbenchRouter) => {
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
  })));
});

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
    WorkbenchModule.forRoot(),
    RouterTestingModule.withRoutes([
      {path: 'view-1', component: View1Component},
      {path: 'view-2', component: View2Component},
      {path: 'view-3', component: View3Component},
    ]),
  ],
})
class AppTestModule {
}
