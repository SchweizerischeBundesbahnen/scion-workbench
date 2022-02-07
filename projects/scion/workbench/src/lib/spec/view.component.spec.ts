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
    expect(fixture.debugElement.query(By.css('wb-view-tab')).classes).toEqual(jasmine.objectContaining({'dirty': true}), '(A)');

    // Clear dirty flag
    viewDebugElement.view.dirty = false;
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab')).classes).not.toEqual(jasmine.objectContaining({'dirty': true}), '(B)');

    viewDebugElement.view.dirty = true;
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab')).classes).toEqual(jasmine.objectContaining({'dirty': true}), '(C)');

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
    expect(fixture.debugElement.query(By.css('wb-view-tab')).query(By.css('.heading')).nativeElement.innerText).toEqual('Foo', '(A)');

    // Set heading
    viewDebugElement.view.heading = 'Bar';
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab')).query(By.css('.heading')).nativeElement.innerText).toEqual('Bar', '(B)');

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
    expect(fixture.debugElement.query(By.css('wb-view-tab')).query(By.css('.title')).nativeElement.innerText).toEqual('Foo', '(A)');

    // Set heading
    viewDebugElement.view.title = 'Bar';
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab')).query(By.css('.title')).nativeElement.innerText).toEqual('Bar', '(B)');

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
    expect(view1DebugElement.component.checked).toBeTruthy('(A)');
    expect(fixture.debugElement.query(By.css('spec-view-1'))).toBeTruthy('(B)');

    // Add View 2
    wbRouter.navigate(['view-2']).then();
    advance(fixture);
    const view2DebugElement = getViewDebugElement<SpecView2Component>('view.2');
    const component2: SpecView2Component = view2DebugElement.component;

    view1DebugElement.component.checked = false;
    view2DebugElement.component.checked = false;
    fixture.detectChanges();
    expect(view1DebugElement.component.checked).toBeFalsy('(C)');
    expect(fixture.debugElement.query(By.css('spec-view-1'))).toBeFalsy('(D)');
    expect(view2DebugElement.component.checked).toBeTruthy('(E)');
    expect(fixture.debugElement.query(By.css('spec-view-2'))).toBeTruthy('(F)');

    // Ensure View 1 not to be destroyed
    expect(getViewDebugElement<SpecView1Component>('view.1').component).toBe(component1, '(G)');
    expect(getViewDebugElement<SpecView1Component>('view.1').component.destroyed).toBeFalsy('(H)');

    // Switch to View 1
    TestBed.inject(WorkbenchService).activateView('view.1').then();
    advance(fixture);

    view1DebugElement.component.checked = false;
    view2DebugElement.component.checked = false;
    fixture.detectChanges();
    expect(view1DebugElement.component.checked).toBeTruthy('(I)');
    expect(fixture.debugElement.query(By.css('spec-view-1'))).toBeTruthy('(J)');
    expect(view2DebugElement.component.checked).toBeFalsy('(K)');
    expect(fixture.debugElement.query(By.css('spec-view-2'))).toBeFalsy('(L)');

    // Ensure View 2 not to be destroyed
    expect(getViewDebugElement<SpecView1Component>('view.2').component).toBe(component2, '(M)');
    expect(getViewDebugElement<SpecView1Component>('view.2').component.destroyed).toBeFalsy('(N)');

    // Switch to View 2
    TestBed.inject(WorkbenchService).activateView('view.2').then();
    advance(fixture);

    view1DebugElement.component.checked = false;
    view2DebugElement.component.checked = false;
    fixture.detectChanges();
    expect(view1DebugElement.component.checked).toBeFalsy('(O)');
    expect(fixture.debugElement.query(By.css('spec-view-1'))).toBeFalsy('(P)');
    expect(view2DebugElement.component.checked).toBeTruthy('(Q)');
    expect(fixture.debugElement.query(By.css('spec-view-2'))).toBeTruthy('(R)');

    // Ensure View 1 not to be destroyed
    expect(getViewDebugElement<SpecView1Component>('view.1').component).toBe(component1, '(S)');
    expect(getViewDebugElement<SpecView1Component>('view.1').component.destroyed).toBeFalsy('(T)');

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
    expect(view1DebugElement.view.active).toBeTruthy('(A)');
    expect(view1DebugElement.component.activated).toBeTruthy('(B)');

    // Add View 2
    wbRouter.navigate(['view-2']).then();
    advance(fixture);
    const view2DebugElement = getViewDebugElement<SpecView1Component>('view.2');
    expect(view1DebugElement.view.active).toBeFalsy('(C)');
    expect(view1DebugElement.component.activated).toBeFalsy('(D)');
    expect(view2DebugElement.view.active).toBeTruthy('(E)');
    expect(view2DebugElement.component.activated).toBeTruthy('(F)');

    // Switch to View 1
    TestBed.inject(WorkbenchService).activateView('view.1').then();
    advance(fixture);

    expect(view1DebugElement.view.active).toBeTruthy('(G)');
    expect(view1DebugElement.component.activated).toBeTruthy('(H)');
    expect(view2DebugElement.view.active).toBeFalsy('(I)');
    expect(view2DebugElement.component.activated).toBeFalsy('(J)');

    // Switch to View 2
    TestBed.inject(WorkbenchService).activateView('view.2').then();
    advance(fixture);

    expect(view1DebugElement.view.active).toBeFalsy('(K)');
    expect(view1DebugElement.component.activated).toBeFalsy('(L)');
    expect(view2DebugElement.view.active).toBeTruthy('(M)');
    expect(view2DebugElement.component.activated).toBeTruthy('(N)');

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
    expect(view1DebugElement.view.destroyed).toBeFalsy('(A)');
    expect(view1DebugElement.component.destroyed).toBeFalsy('(B)');

    // Add View 2
    wbRouter.navigate(['view-2']).then();
    advance(fixture);
    const view2DebugElement = getViewDebugElement<SpecView1Component>('view.2');
    expect(view1DebugElement.view.destroyed).toBeFalsy('(C)');
    expect(view1DebugElement.component.destroyed).toBeFalsy('(D)');
    expect(view2DebugElement.view.destroyed).toBeFalsy('(E)');
    expect(view2DebugElement.component.destroyed).toBeFalsy('(F)');

    // Destroy to View 2
    TestBed.inject(WorkbenchService).destroyView('view.2').then();
    advance(fixture);
    expect(view1DebugElement.view.destroyed).toBeFalsy('(G)');
    expect(view1DebugElement.component.destroyed).toBeFalsy('(H)');
    expect(view2DebugElement.view.destroyed).toBeTruthy('(I)');
    expect(view2DebugElement.component.destroyed).toBeTruthy('(J)');

    // Destroy to View 1
    TestBed.inject(WorkbenchService).destroyView('view.1').then();
    advance(fixture);
    expect(view1DebugElement.view.destroyed).toBeTruthy('(K)');
    expect(view1DebugElement.component.destroyed).toBeTruthy('(L)');
    expect(view2DebugElement.view.destroyed).toBeTruthy('(M)');
    expect(view2DebugElement.component.destroyed).toBeTruthy('(N)');

    expect(fixture.debugElement.query(By.css('spec-view-1'))).toBeFalsy('(O)');
    expect(fixture.debugElement.query(By.css('spec-view-2'))).toBeFalsy('(P)');

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

    expect(view1DebugElement.view.destroyed).toBeFalsy('(A)');
    expect(view1DebugElement.component.destroyed).toBeFalsy('(B)');
    expect(fixture.debugElement.query(By.css('spec-view-1'))).toBeTruthy('(C)');

    // Try destroy to View 1 (accept)
    view1DebugElement.component.preventDestroy = false;
    TestBed.inject(WorkbenchService).destroyView('view.1').then();
    advance(fixture);

    expect(view1DebugElement.view.destroyed).toBeTruthy('(D)');
    expect(view1DebugElement.component.destroyed).toBeTruthy('(E)');
    expect(fixture.debugElement.query(By.css('spec-view-1'))).toBeFalsy('(F)');

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
    expect(viewDebugElement1.component.destroyed).toBeFalsy('(A)');
    expect(viewDebugElement1.view.destroyed).toBeFalsy('(B)');
    expect(fixture.debugElement.query(By.css('spec-view-1'))).toBeTruthy('(C)');

    // Route to View 2
    wbRouter.navigate(['view-2'], {target: 'self', selfViewId: 'view.1'}).then();
    advance(fixture);

    const viewDebugElement2 = getViewDebugElement<SpecView2Component>('view.1');
    expect(viewDebugElement2.component.destroyed).toBeFalsy('(C)');
    expect(viewDebugElement2.view.destroyed).toBeFalsy('(D)');
    expect(fixture.debugElement.query(By.css('spec-view-2'))).toBeTruthy('(E)');

    expect(viewDebugElement1.component.destroyed).toBeTruthy('(F)');
    expect(fixture.debugElement.query(By.css('spec-view-1'))).toBeFalsy('(G)');

    expect(viewDebugElement1.view.destroyed).toBeFalsy('(H)');
    expect(viewDebugElement1.view).toBe(viewDebugElement2.view, '(I)');

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
    expect(viewDebugElement1.component.destroyed).toBeFalsy('(A)');
    expect(viewDebugElement1.view.destroyed).toBeFalsy('(B)');
    expect(fixture.debugElement.query(By.css('spec-view-1'))).toBeTruthy('(C)');

    // Remove View 1
    viewDebugElement1.view.close().then();
    advance(fixture);
    expect(viewDebugElement1.component.destroyed).toBeTruthy('(D)');
    expect(viewDebugElement1.view.destroyed).toBeTruthy('(E)');
    expect(fixture.debugElement.query(By.css('spec-view-1'))).toBeFalsy('(F)');

    // Remove View 1 again
    wbRouter.navigate(['view-1']).then();
    advance(fixture);
    const viewDebugElement2 = getViewDebugElement<SpecView1Component>('view.1');
    expect(viewDebugElement2.component.destroyed).toBeFalsy('(G)');
    expect(viewDebugElement2.view.destroyed).toBeFalsy('(H)');
    expect(fixture.debugElement.query(By.css('spec-view-1'))).toBeTruthy('(I)');

    // Remove View 1
    viewDebugElement2.view.close().then();
    advance(fixture);
    expect(viewDebugElement2.component.destroyed).toBeTruthy('(D)');
    expect(viewDebugElement2.view.destroyed).toBeTruthy('(E)');
    expect(fixture.debugElement.query(By.css('spec-view-1'))).toBeFalsy('(F)');

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

