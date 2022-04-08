/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {discardPeriodicTasks, fakeAsync, inject, TestBed, waitForAsync} from '@angular/core/testing';
import {NgModule} from '@angular/core';
import {PartsLayoutComponent} from '../layout/parts-layout.component';
import {WorkbenchService} from '../workbench.service';
import {expect, jasmineCustomMatchers} from './util/jasmine-custom-matchers.spec';
import {By} from '@angular/platform-browser';
import {RouterTestingModule} from '@angular/router/testing';
import {Router} from '@angular/router';
import {SpecView1Component, SpecView2Component} from './view-part.model.spec';
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
    expect(fixture.debugElement.query(By.css('wb-view-tab')).classes).withContext('(A)').toEqual(jasmine.objectContaining({'dirty': true}));

    // Clear dirty flag
    viewDebugElement.view.dirty = false;
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab')).classes).not.withContext('(B)').toEqual(jasmine.objectContaining({'dirty': true}));

    viewDebugElement.view.dirty = true;
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab')).classes).withContext('(C)').toEqual(jasmine.objectContaining({'dirty': true}));

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
    expect(fixture.debugElement.query(By.css('wb-view-tab')).query(By.css('.heading')).nativeElement.innerText).withContext('(A)').toEqual('Foo');

    // Set heading
    viewDebugElement.view.heading = 'Bar';
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab')).query(By.css('.heading')).nativeElement.innerText).withContext('(B)').toEqual('Bar');

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
    expect(fixture.debugElement.query(By.css('wb-view-tab')).query(By.css('.title')).nativeElement.innerText).withContext('(A)').toEqual('Foo');

    // Set heading
    viewDebugElement.view.title = 'Bar';
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab')).query(By.css('.title')).nativeElement.innerText).withContext('(B)').toEqual('Bar');

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
    expect(view1DebugElement.component.checked).withContext('(A)').toBeTruthy();
    expect(fixture.debugElement.query(By.css('spec-view-1'))).withContext('(B)').toBeTruthy();

    // Add View 2
    wbRouter.navigate(['view-2']).then();
    advance(fixture);
    const view2DebugElement = getViewDebugElement<SpecView2Component>('view.2');
    const component2: SpecView2Component = view2DebugElement.component;

    view1DebugElement.component.checked = false;
    view2DebugElement.component.checked = false;
    fixture.detectChanges();
    expect(view1DebugElement.component.checked).withContext('(C)').toBeFalsy();
    expect(fixture.debugElement.query(By.css('spec-view-1'))).withContext('(D)').toBeFalsy();
    expect(view2DebugElement.component.checked).withContext('(E)').toBeTruthy();
    expect(fixture.debugElement.query(By.css('spec-view-2'))).withContext('(F)').toBeTruthy();

    // Ensure View 1 not to be destroyed
    expect(getViewDebugElement<SpecView1Component>('view.1').component).withContext('(G)').toBe(component1);
    expect(getViewDebugElement<SpecView1Component>('view.1').component.destroyed).withContext('(H)').toBeFalsy();

    // Switch to View 1
    TestBed.inject(WorkbenchService).activateView('view.1').then();
    advance(fixture);

    view1DebugElement.component.checked = false;
    view2DebugElement.component.checked = false;
    fixture.detectChanges();
    expect(view1DebugElement.component.checked).withContext('(I)').toBeTruthy();
    expect(fixture.debugElement.query(By.css('spec-view-1'))).withContext('(J)').toBeTruthy();
    expect(view2DebugElement.component.checked).withContext('(K)').toBeFalsy();
    expect(fixture.debugElement.query(By.css('spec-view-2'))).withContext('(L)').toBeFalsy();

    // Ensure View 2 not to be destroyed
    expect(getViewDebugElement<SpecView1Component>('view.2').component).withContext('(M)').toBe(component2);
    expect(getViewDebugElement<SpecView1Component>('view.2').component.destroyed).withContext('(N)').toBeFalsy();

    // Switch to View 2
    TestBed.inject(WorkbenchService).activateView('view.2').then();
    advance(fixture);

    view1DebugElement.component.checked = false;
    view2DebugElement.component.checked = false;
    fixture.detectChanges();
    expect(view1DebugElement.component.checked).withContext('(O)').toBeFalsy();
    expect(fixture.debugElement.query(By.css('spec-view-1'))).withContext('(P)').toBeFalsy();
    expect(view2DebugElement.component.checked).withContext('(Q)').toBeTruthy();
    expect(fixture.debugElement.query(By.css('spec-view-2'))).withContext('(R)').toBeTruthy();

    // Ensure View 1 not to be destroyed
    expect(getViewDebugElement<SpecView1Component>('view.1').component).withContext('(S)').toBe(component1);
    expect(getViewDebugElement<SpecView1Component>('view.1').component.destroyed).withContext('(T)').toBeFalsy();

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
    expect(view1DebugElement.view.active).withContext('(A)').toBeTruthy();
    expect(view1DebugElement.component.activated).withContext('(B)').toBeTruthy();

    // Add View 2
    wbRouter.navigate(['view-2']).then();
    advance(fixture);
    const view2DebugElement = getViewDebugElement<SpecView1Component>('view.2');
    expect(view1DebugElement.view.active).withContext('(C)').toBeFalsy();
    expect(view1DebugElement.component.activated).withContext('(D)').toBeFalsy();
    expect(view2DebugElement.view.active).withContext('(E)').toBeTruthy();
    expect(view2DebugElement.component.activated).withContext('(F)').toBeTruthy();

    // Switch to View 1
    TestBed.inject(WorkbenchService).activateView('view.1').then();
    advance(fixture);

    expect(view1DebugElement.view.active).withContext('(G)').toBeTruthy();
    expect(view1DebugElement.component.activated).withContext('(H)').toBeTruthy();
    expect(view2DebugElement.view.active).withContext('(I)').toBeFalsy();
    expect(view2DebugElement.component.activated).withContext('(J)').toBeFalsy();

    // Switch to View 2
    TestBed.inject(WorkbenchService).activateView('view.2').then();
    advance(fixture);

    expect(view1DebugElement.view.active).withContext('(K)').toBeFalsy();
    expect(view1DebugElement.component.activated).withContext('(L)').toBeFalsy();
    expect(view2DebugElement.view.active).withContext('(M)').toBeTruthy();
    expect(view2DebugElement.component.activated).withContext('(N)').toBeTruthy();

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
    expect(view1DebugElement.view.destroyed).withContext('(A)').toBeFalsy();
    expect(view1DebugElement.component.destroyed).withContext('(B)').toBeFalsy();

    // Add View 2
    wbRouter.navigate(['view-2']).then();
    advance(fixture);
    const view2DebugElement = getViewDebugElement<SpecView1Component>('view.2');
    expect(view1DebugElement.view.destroyed).withContext('(C)').toBeFalsy();
    expect(view1DebugElement.component.destroyed).withContext('(D)').toBeFalsy();
    expect(view2DebugElement.view.destroyed).withContext('(E)').toBeFalsy();
    expect(view2DebugElement.component.destroyed).withContext('(F)').toBeFalsy();

    // Destroy to View 2
    TestBed.inject(WorkbenchService).destroyView('view.2').then();
    advance(fixture);
    expect(view1DebugElement.view.destroyed).withContext('(G)').toBeFalsy();
    expect(view1DebugElement.component.destroyed).withContext('(H)').toBeFalsy();
    expect(view2DebugElement.view.destroyed).withContext('(I)').toBeTruthy();
    expect(view2DebugElement.component.destroyed).withContext('(J)').toBeTruthy();

    // Destroy to View 1
    TestBed.inject(WorkbenchService).destroyView('view.1').then();
    advance(fixture);
    expect(view1DebugElement.view.destroyed).withContext('(K)').toBeTruthy();
    expect(view1DebugElement.component.destroyed).withContext('(L)').toBeTruthy();
    expect(view2DebugElement.view.destroyed).withContext('(M)').toBeTruthy();
    expect(view2DebugElement.component.destroyed).withContext('(N)').toBeTruthy();

    expect(fixture.debugElement.query(By.css('spec-view-1'))).withContext('(O)').toBeFalsy();
    expect(fixture.debugElement.query(By.css('spec-view-2'))).withContext('(P)').toBeFalsy();

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

    expect(view1DebugElement.view.destroyed).withContext('(A)').toBeFalsy();
    expect(view1DebugElement.component.destroyed).withContext('(B)').toBeFalsy();
    expect(fixture.debugElement.query(By.css('spec-view-1'))).withContext('(C)').toBeTruthy();

    // Try destroy to View 1 (accept)
    view1DebugElement.component.preventDestroy = false;
    TestBed.inject(WorkbenchService).destroyView('view.1').then();
    advance(fixture);

    expect(view1DebugElement.view.destroyed).withContext('(D)').toBeTruthy();
    expect(view1DebugElement.component.destroyed).withContext('(E)').toBeTruthy();
    expect(fixture.debugElement.query(By.css('spec-view-1'))).withContext('(F)').toBeFalsy();

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
    expect(viewDebugElement1.component.destroyed).withContext('(A)').toBeFalsy();
    expect(viewDebugElement1.view.destroyed).withContext('(B)').toBeFalsy();
    expect(fixture.debugElement.query(By.css('spec-view-1'))).withContext('(C)').toBeTruthy();

    // Route to View 2
    wbRouter.navigate(['view-2'], {target: 'self', selfViewId: 'view.1'}).then();
    advance(fixture);

    const viewDebugElement2 = getViewDebugElement<SpecView2Component>('view.1');
    expect(viewDebugElement2.component.destroyed).withContext('(C)').toBeFalsy();
    expect(viewDebugElement2.view.destroyed).withContext('(D)').toBeFalsy();
    expect(fixture.debugElement.query(By.css('spec-view-2'))).withContext('(E)').toBeTruthy();

    expect(viewDebugElement1.component.destroyed).withContext('(F)').toBeTruthy();
    expect(fixture.debugElement.query(By.css('spec-view-1'))).withContext('(G)').toBeFalsy();

    expect(viewDebugElement1.view.destroyed).withContext('(H)').toBeFalsy();
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
    expect(viewDebugElement1.component.destroyed).withContext('(A)').toBeFalsy();
    expect(viewDebugElement1.view.destroyed).withContext('(B)').toBeFalsy();
    expect(fixture.debugElement.query(By.css('spec-view-1'))).withContext('(C)').toBeTruthy();

    // Remove View 1
    viewDebugElement1.view.close().then();
    advance(fixture);
    expect(viewDebugElement1.component.destroyed).withContext('(D)').toBeTruthy();
    expect(viewDebugElement1.view.destroyed).withContext('(E)').toBeTruthy();
    expect(fixture.debugElement.query(By.css('spec-view-1'))).withContext('(F)').toBeFalsy();

    // Remove View 1 again
    wbRouter.navigate(['view-1']).then();
    advance(fixture);
    const viewDebugElement2 = getViewDebugElement<SpecView1Component>('view.1');
    expect(viewDebugElement2.component.destroyed).withContext('(G)').toBeFalsy();
    expect(viewDebugElement2.view.destroyed).withContext('(H)').toBeFalsy();
    expect(fixture.debugElement.query(By.css('spec-view-1'))).withContext('(I)').toBeTruthy();

    // Remove View 1
    viewDebugElement2.view.close().then();
    advance(fixture);
    expect(viewDebugElement2.component.destroyed).withContext('(D)').toBeTruthy();
    expect(viewDebugElement2.view.destroyed).withContext('(E)').toBeTruthy();
    expect(fixture.debugElement.query(By.css('spec-view-1'))).withContext('(F)').toBeFalsy();

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

