/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ComponentFixture, discardPeriodicTasks, fakeAsync, inject, TestBed, waitForAsync} from '@angular/core/testing';
import {NgModule} from '@angular/core';
import {PartsLayoutComponent} from '../layout/parts-layout.component';
import {WorkbenchService} from '../workbench.service';
import {expect, jasmineCustomMatchers} from './util/jasmine-custom-matchers.spec';
import {RouterTestingModule} from '@angular/router/testing';
import {Router} from '@angular/router';
import {SpecView1Component, SpecView2Component} from './view.component.model.spec';
import {ViewComponent} from '../view/view.component';
import {WorkbenchViewRegistry} from '../view/workbench-view.registry';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {advance} from './util/util.spec';
import {WorkbenchTestingModule} from './workbench-testing.module';
import {WorkbenchView} from '../view/workbench-view.model';

describe('ViewComponent', () => {

  beforeEach(waitForAsync(() => {
    jasmine.addMatchers(jasmineCustomMatchers);

    TestBed.configureTestingModule({
      imports: [AppTestModule],
    });

    TestBed.inject(Router).initialNavigation();
  }));

  it('should render dirty state', fakeAsync(inject([WorkbenchRouter], (wbRouter: WorkbenchRouter) => {
    const fixture = TestBed.createComponent(PartsLayoutComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add View
    wbRouter.navigate(['view-1']).then();
    advance(fixture);

    // Set dirty flag
    const viewDebugElement = getViewDebugElement<SpecView1Component>('view.1');
    viewDebugElement.view.dirty = true;
    advance(fixture);
    expect(cssClasses(fixture, 'wb-view-tab')).withContext('(A)').toEqual(jasmine.arrayContaining(['dirty']));

    // Clear dirty flag
    viewDebugElement.view.dirty = false;
    advance(fixture);
    expect(cssClasses(fixture, 'wb-view-tab')).not.withContext('(B)').toEqual(jasmine.arrayContaining(['dirty']));

    viewDebugElement.view.dirty = true;
    advance(fixture);
    expect(cssClasses(fixture, 'wb-view-tab')).withContext('(C)').toEqual(jasmine.arrayContaining(['dirty']));

    discardPeriodicTasks();
  })));

  it('should render heading text', fakeAsync(inject([WorkbenchRouter], (wbRouter: WorkbenchRouter) => {
    const fixture = TestBed.createComponent(PartsLayoutComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add View
    wbRouter.navigate(['view-1']).then();
    advance(fixture);

    // Set heading
    const viewDebugElement = getViewDebugElement<SpecView1Component>('view.1');
    viewDebugElement.view.heading = 'Foo';
    advance(fixture);
    expect(querySelector(fixture, 'wb-view-tab .heading').innerText).withContext('(A)').toEqual('Foo');

    // Set heading
    viewDebugElement.view.heading = 'Bar';
    advance(fixture);
    expect(querySelector(fixture, 'wb-view-tab .heading').innerText).withContext('(B)').toEqual('Bar');

    discardPeriodicTasks();
  })));

  it('should render title', fakeAsync(inject([WorkbenchRouter], (wbRouter: WorkbenchRouter) => {
    const fixture = TestBed.createComponent(PartsLayoutComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add View
    wbRouter.navigate(['view-1']).then();
    advance(fixture);

    // Set heading
    const viewDebugElement = getViewDebugElement<SpecView1Component>('view.1');
    viewDebugElement.view.title = 'Foo';
    advance(fixture);
    expect(querySelector(fixture, 'wb-view-tab .title').innerText).withContext('(A)').toEqual('Foo');

    // Set heading
    viewDebugElement.view.title = 'Bar';
    advance(fixture);
    expect(querySelector(fixture, 'wb-view-tab .title').innerText).withContext('(B)').toEqual('Bar');

    discardPeriodicTasks();
  })));

  it('should detach inactive views from Angular component tree and DOM', fakeAsync(inject([WorkbenchRouter], (wbRouter: WorkbenchRouter) => {
    const fixture = TestBed.createComponent(PartsLayoutComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add View 1
    wbRouter.navigate(['view-1']).then();
    advance(fixture);
    const view1DebugElement = getViewDebugElement<SpecView1Component>('view.1');
    const component1: SpecView1Component = view1DebugElement.component;

    view1DebugElement.component.checked = false;
    fixture.detectChanges();
    expect(view1DebugElement.component.checked).withContext('(A)').toBeTrue();
    expect(querySelector(fixture, 'spec-view-1')).withContext('(B)').toBeDefined();

    // Add View 2
    wbRouter.navigate(['view-2']).then();
    advance(fixture);
    const view2DebugElement = getViewDebugElement<SpecView2Component>('view.2');
    const component2: SpecView2Component = view2DebugElement.component;

    view1DebugElement.component.checked = false;
    view2DebugElement.component.checked = false;
    fixture.detectChanges();
    expect(view1DebugElement.component.checked).withContext('(C)').toBeFalse();
    expect(querySelector(fixture, 'spec-view-1')).withContext('(D)').toBeUndefined();
    expect(view2DebugElement.component.checked).withContext('(E)').toBeTrue();
    expect(querySelector(fixture, 'spec-view-2')).withContext('(F)').toBeDefined();

    // Ensure View 1 not to be destroyed
    expect(getViewDebugElement<SpecView1Component>('view.1').component).withContext('(G)').toBe(component1);
    expect(getViewDebugElement<SpecView1Component>('view.1').component.destroyed).withContext('(H)').toBeFalse();

    // Switch to View 1
    TestBed.inject(WorkbenchService).activateView('view.1').then();
    advance(fixture);

    view1DebugElement.component.checked = false;
    view2DebugElement.component.checked = false;
    fixture.detectChanges();
    expect(view1DebugElement.component.checked).withContext('(I)').toBeTrue();
    expect(querySelector(fixture, 'spec-view-1')).withContext('(J)').toBeDefined();
    expect(view2DebugElement.component.checked).withContext('(K)').toBeFalse();
    expect(querySelector(fixture, 'spec-view-2')).withContext('(L)').toBeUndefined();

    // Ensure View 2 not to be destroyed
    expect(getViewDebugElement<SpecView1Component>('view.2').component).withContext('(M)').toBe(component2);
    expect(getViewDebugElement<SpecView1Component>('view.2').component.destroyed).withContext('(N)').toBeFalse();

    // Switch to View 2
    TestBed.inject(WorkbenchService).activateView('view.2').then();
    advance(fixture);

    view1DebugElement.component.checked = false;
    view2DebugElement.component.checked = false;
    fixture.detectChanges();
    expect(view1DebugElement.component.checked).withContext('(O)').toBeFalse();
    expect(querySelector(fixture, 'spec-view-1')).withContext('(P)').toBeUndefined();
    expect(view2DebugElement.component.checked).withContext('(Q)').toBeTrue();
    expect(querySelector(fixture, 'spec-view-2')).withContext('(R)').toBeDefined();

    // Ensure View 1 not to be destroyed
    expect(getViewDebugElement<SpecView1Component>('view.1').component).withContext('(S)').toBe(component1);
    expect(getViewDebugElement<SpecView1Component>('view.1').component.destroyed).withContext('(T)').toBeFalse();

    discardPeriodicTasks();
  })));

  it('invokes activate and deactivate lifecycle hooks', fakeAsync(inject([WorkbenchRouter], (wbRouter: WorkbenchRouter) => {
    const fixture = TestBed.createComponent(PartsLayoutComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add View 1
    wbRouter.navigate(['view-1']).then();
    advance(fixture);
    const view1DebugElement = getViewDebugElement<SpecView1Component>('view.1');
    expect(view1DebugElement.view.active).withContext('(A)').toBeTrue();
    expect(view1DebugElement.component.activated).withContext('(B)').toBeTrue();

    // Add View 2
    wbRouter.navigate(['view-2']).then();
    advance(fixture);
    const view2DebugElement = getViewDebugElement<SpecView1Component>('view.2');
    expect(view1DebugElement.view.active).withContext('(C)').toBeFalse();
    expect(view1DebugElement.component.activated).withContext('(D)').toBeFalse();
    expect(view2DebugElement.view.active).withContext('(E)').toBeTrue();
    expect(view2DebugElement.component.activated).withContext('(F)').toBeTrue();

    // Switch to View 1
    TestBed.inject(WorkbenchService).activateView('view.1').then();
    advance(fixture);

    expect(view1DebugElement.view.active).withContext('(G)').toBeTrue();
    expect(view1DebugElement.component.activated).withContext('(H)').toBeTrue();
    expect(view2DebugElement.view.active).withContext('(I)').toBeFalse();
    expect(view2DebugElement.component.activated).withContext('(J)').toBeFalse();

    // Switch to View 2
    TestBed.inject(WorkbenchService).activateView('view.2').then();
    advance(fixture);

    expect(view1DebugElement.view.active).withContext('(K)').toBeFalse();
    expect(view1DebugElement.component.activated).withContext('(L)').toBeFalse();
    expect(view2DebugElement.view.active).withContext('(M)').toBeTrue();
    expect(view2DebugElement.component.activated).withContext('(N)').toBeTrue();

    discardPeriodicTasks();
  })));

  it('invokes destroy lifecycle hook', fakeAsync(inject([WorkbenchRouter], (wbRouter: WorkbenchRouter) => {
    const fixture = TestBed.createComponent(PartsLayoutComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add View 1
    wbRouter.navigate(['view-1']).then();
    advance(fixture);
    const view1DebugElement = getViewDebugElement<SpecView1Component>('view.1');
    expect(view1DebugElement.view.destroyed).withContext('(A)').toBeFalse();
    expect(view1DebugElement.component.destroyed).withContext('(B)').toBeFalse();

    // Add View 2
    wbRouter.navigate(['view-2']).then();
    advance(fixture);
    const view2DebugElement = getViewDebugElement<SpecView1Component>('view.2');
    expect(view1DebugElement.view.destroyed).withContext('(C)').toBeFalse();
    expect(view1DebugElement.component.destroyed).withContext('(D)').toBeFalse();
    expect(view2DebugElement.view.destroyed).withContext('(E)').toBeFalse();
    expect(view2DebugElement.component.destroyed).withContext('(F)').toBeFalse();

    // Destroy to View 2
    TestBed.inject(WorkbenchService).destroyView('view.2').then();
    advance(fixture);
    expect(view1DebugElement.view.destroyed).withContext('(G)').toBeFalse();
    expect(view1DebugElement.component.destroyed).withContext('(H)').toBeFalse();
    expect(view2DebugElement.view.destroyed).withContext('(I)').toBeTrue();
    expect(view2DebugElement.component.destroyed).withContext('(J)').toBeTrue();

    // Destroy to View 1
    TestBed.inject(WorkbenchService).destroyView('view.1').then();
    advance(fixture);
    expect(view1DebugElement.view.destroyed).withContext('(K)').toBeTrue();
    expect(view1DebugElement.component.destroyed).withContext('(L)').toBeTrue();
    expect(view2DebugElement.view.destroyed).withContext('(M)').toBeTrue();
    expect(view2DebugElement.component.destroyed).withContext('(N)').toBeTrue();

    expect(querySelector(fixture, 'spec-view-1')).withContext('(O)').toBeUndefined();
    expect(querySelector(fixture, 'spec-view-2')).withContext('(P)').toBeUndefined();

    discardPeriodicTasks();
  })));

  it('prevents the view from being destroyed', fakeAsync(inject([WorkbenchRouter], (wbRouter: WorkbenchRouter) => {
    const fixture = TestBed.createComponent(PartsLayoutComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add View 1
    wbRouter.navigate(['view-1']).then();
    advance(fixture);
    const view1DebugElement = getViewDebugElement<SpecView1Component>('view.1');

    // Try destroy to View 1 (prevent)
    view1DebugElement.component.preventDestroy = true;
    TestBed.inject(WorkbenchService).destroyView('view.1').then();
    advance(fixture);

    expect(view1DebugElement.view.destroyed).withContext('(A)').toBeFalse();
    expect(view1DebugElement.component.destroyed).withContext('(B)').toBeFalse();
    expect(querySelector(fixture, 'spec-view-1')).withContext('(C)').toBeDefined();

    // Try destroy to View 1 (accept)
    view1DebugElement.component.preventDestroy = false;
    TestBed.inject(WorkbenchService).destroyView('view.1').then();
    advance(fixture);

    expect(view1DebugElement.view.destroyed).withContext('(D)').toBeTrue();
    expect(view1DebugElement.component.destroyed).withContext('(E)').toBeTrue();
    expect(querySelector(fixture, 'spec-view-1')).withContext('(F)').toBeUndefined();

    discardPeriodicTasks();
  })));

  it('allows component routing', fakeAsync(inject([WorkbenchRouter], (wbRouter: WorkbenchRouter) => {
    const fixture = TestBed.createComponent(PartsLayoutComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add View 1
    wbRouter.navigate(['view-1']).then();
    advance(fixture);
    const viewDebugElement1 = getViewDebugElement<SpecView1Component>('view.1');
    expect(viewDebugElement1.component.destroyed).withContext('(A)').toBeFalse();
    expect(viewDebugElement1.view.destroyed).withContext('(B)').toBeFalse();
    expect(querySelector(fixture, 'spec-view-1')).withContext('(C)').toBeDefined();

    // Route to View 2
    wbRouter.navigate(['view-2'], {target: 'self', selfViewId: 'view.1'}).then();
    advance(fixture);

    const viewDebugElement2 = getViewDebugElement<SpecView2Component>('view.1');
    expect(viewDebugElement2.component.destroyed).withContext('(C)').toBeFalse();
    expect(viewDebugElement2.view.destroyed).withContext('(D)').toBeFalse();
    expect(querySelector(fixture, 'spec-view-2')).withContext('(E)').toBeDefined();

    expect(viewDebugElement1.component.destroyed).withContext('(F)').toBeTrue();
    expect(querySelector(fixture, 'spec-view-1')).withContext('(G)').toBeUndefined();

    expect(viewDebugElement1.view.destroyed).withContext('(H)').toBeFalse();
    expect(viewDebugElement1.view).withContext('(I)').toBe(viewDebugElement2.view);

    discardPeriodicTasks();
  })));

  it('allows a view to be added, removed and to be added again', fakeAsync(inject([WorkbenchRouter], (wbRouter: WorkbenchRouter) => {
    const fixture = TestBed.createComponent(PartsLayoutComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add View 1
    wbRouter.navigate(['view-1']).then();
    advance(fixture);
    const viewDebugElement1 = getViewDebugElement<SpecView1Component>('view.1');
    expect(viewDebugElement1.component.destroyed).withContext('(A)').toBeFalse();
    expect(viewDebugElement1.view.destroyed).withContext('(B)').toBeFalse();
    expect(querySelector(fixture, 'spec-view-1')).withContext('(C)').toBeDefined();

    // Remove View 1
    viewDebugElement1.view.close().then();
    advance(fixture);
    expect(viewDebugElement1.component.destroyed).withContext('(D)').toBeTrue();
    expect(viewDebugElement1.view.destroyed).withContext('(E)').toBeTrue();
    expect(querySelector(fixture, 'spec-view-1')).withContext('(F)').toBeUndefined();

    // Add View 1 again
    wbRouter.navigate(['view-1']).then();
    advance(fixture);
    const viewDebugElement2 = getViewDebugElement<SpecView1Component>('view.1');
    expect(viewDebugElement2.component.destroyed).withContext('(G)').toBeFalse();
    expect(viewDebugElement2.view.destroyed).withContext('(H)').toBeFalse();
    expect(querySelector(fixture, 'spec-view-1')).withContext('(I)').toBeDefined();

    // Remove View 1
    viewDebugElement2.view.close().then();
    advance(fixture);
    expect(viewDebugElement2.component.destroyed).withContext('(D)').toBeTrue();
    expect(viewDebugElement2.view.destroyed).withContext('(E)').toBeTrue();
    expect(querySelector(fixture, 'spec-view-1')).withContext('(F)').toBeUndefined();

    discardPeriodicTasks();
  })));

  function getViewDebugElement<T>(viewId: string): ViewDebugElement<T> {
    const view = TestBed.inject(WorkbenchViewRegistry).getElseThrow(viewId);
    const viewComponent = view.portal.componentRef.instance as ViewComponent;
    const component = viewComponent.routerOutlet.component as T;

    return {view, viewComponent, component};
  }

  interface ViewDebugElement<T> {
    view: WorkbenchView;
    viewComponent: ViewComponent;
    component: T;
  }
});

/****************************************************************************************************
 * Definition of App Test Module                                                                    *
 ****************************************************************************************************/

@NgModule({
  declarations: [SpecView1Component, SpecView2Component],
  imports: [
    WorkbenchTestingModule.forRoot({startup: {launcher: 'APP_INITIALIZER'}}),
    RouterTestingModule.withRoutes([
      {path: 'view-1', component: SpecView1Component},
      {path: 'view-2', component: SpecView2Component},
    ]),
  ],
})
class AppTestModule {
}

/**
 * Since 'sci-viewport' uses a shadow DOM, we cannot use {@link DebugElement#query} because not working
 * across shadow DOM boundaries.
 */
function querySelector(fixture: ComponentFixture<any>, selector: string): HTMLElement | undefined {
  return fixture.nativeElement.querySelector(selector) ?? undefined;
}

/**
 * Since 'sci-viewport' uses a shadow DOM, we cannot use {@link DebugElement#query} because not working
 * across shadow DOM boundaries.
 */
function cssClasses(fixture: ComponentFixture<any>, selector: string): string[] {
  return Array.from(querySelector(fixture, selector)?.classList);
}
