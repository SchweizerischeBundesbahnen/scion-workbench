/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, waitForAsync} from '@angular/core/testing';
import {Component, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ViewComponent} from './view.component';
import {WorkbenchViewRegistry} from './workbench-view.registry';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {WorkbenchView} from './workbench-view.model';
import {WorkbenchViewPreDestroy} from '../workbench.model';
import {Observable} from 'rxjs';
import {WorkbenchRouteData} from '../routing/workbench-route-data';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {advance, styleFixture} from '../testing/testing.util';
import {WorkbenchComponent} from '../workbench.component';
import {WorkbenchTestingModule} from '../testing/workbench-testing.module';
import {RouterTestingModule} from '@angular/router/testing';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {By} from '@angular/platform-browser';

describe('ViewComponent', () => {

  let fixture: ComponentFixture<WorkbenchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest(),
        RouterTestingModule.withRoutes([
          {path: 'view', loadComponent: () => SpecViewComponent},
          {path: 'view-with-title', loadComponent: () => SpecViewComponent, data: {[WorkbenchRouteData.title]: 'ROUTE TITLE'}},
          {path: 'view-with-heading', loadComponent: () => SpecViewComponent, data: {[WorkbenchRouteData.heading]: 'ROUTE HEADING'}},
          {path: 'view-1', loadComponent: () => SpecView1Component},
          {path: 'view-2', loadComponent: () => SpecView2Component},
        ]),
      ],
    });
    fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
  }));

  it('should render dirty state', fakeAsync(() => {
    // Add View
    TestBed.inject(WorkbenchRouter).navigate(['view-1']).then();
    advance(fixture);

    // Set dirty flag
    const viewDebugElement = getViewDebugElement<SpecView1Component>('view.1');
    viewDebugElement.view.dirty = true;
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab')).classes).withContext('(A)').toEqual(jasmine.objectContaining({'e2e-dirty': true}));

    // Clear dirty flag
    viewDebugElement.view.dirty = false;
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab')).classes).not.withContext('(B)').toEqual(jasmine.objectContaining({'e2e-dirty': true}));

    viewDebugElement.view.dirty = true;
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab')).classes).withContext('(C)').toEqual(jasmine.objectContaining({'e2e-dirty': true}));

    discardPeriodicTasks();
  }));

  it('should render title', fakeAsync(() => {
    // Add View
    TestBed.inject(WorkbenchRouter).navigate(['view', {title: 'TITLE'}]).then();
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab .title')).nativeElement.innerText).withContext('(A)').toEqual('TITLE');

    // Set title
    const viewDebugElement = getViewDebugElement<SpecViewComponent>('view.1');
    viewDebugElement.view.title = 'Foo';
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab .title')).nativeElement.innerText).withContext('(B)').toEqual('Foo');

    // Set title
    viewDebugElement.view.title = 'Bar';
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab .title')).nativeElement.innerText).withContext('(C)').toEqual('Bar');

    discardPeriodicTasks();
  }));

  it('should not render heading (by default)', fakeAsync(() => {
    TestBed.inject(WorkbenchRouter).navigate(['view', {heading: 'HEADING'}]).then();
    advance(fixture);
    const headingElement = fixture.debugElement.query(By.css('wb-view-tab .heading')).nativeElement;
    expect(getComputedStyle(headingElement)).toEqual(jasmine.objectContaining({display: 'none'}));

    discardPeriodicTasks();
  }));

  it('should not render heading if tab height < 3.5rem', fakeAsync(() => {
    setDesignToken('--sci-workbench-tab-height', '3.4rem');

    TestBed.inject(WorkbenchRouter).navigate(['view', {heading: 'HEADING'}]).then();
    advance(fixture);
    const headingElement = fixture.debugElement.query(By.css('wb-view-tab .heading')).nativeElement;
    expect(getComputedStyle(headingElement)).toEqual(jasmine.objectContaining({display: 'none'}));

    discardPeriodicTasks();
  }));

  it('should render heading if tab height >= 3.5rem', fakeAsync(() => {
    setDesignToken('--sci-workbench-tab-height', '3.5rem');

    // Add View
    TestBed.inject(WorkbenchRouter).navigate(['view', {heading: 'HEADING'}]).then();
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab .heading')).nativeElement.innerText).withContext('(A)').toEqual('HEADING');

    // Set heading
    const viewDebugElement = getViewDebugElement<SpecViewComponent>('view.1');
    viewDebugElement.view.heading = 'Foo';
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab .heading')).nativeElement.innerText).withContext('(A)').toEqual('Foo');

    // Set heading
    viewDebugElement.view.heading = 'Bar';
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab .heading')).nativeElement.innerText).withContext('(B)').toEqual('Bar');

    discardPeriodicTasks();
  }));

  it('should render title as configured on route', fakeAsync(() => {
    // Add View
    TestBed.inject(WorkbenchRouter).navigate(['view-with-title']).then();
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab .title')).nativeElement.innerText).withContext('(A)').toEqual('ROUTE TITLE');

    // Set title
    const viewDebugElement = getViewDebugElement<SpecViewComponent>('view.1');
    viewDebugElement.view.title = 'Foo';
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab .title')).nativeElement.innerText).withContext('(B)').toEqual('Foo');

    // Set title
    viewDebugElement.view.title = 'Bar';
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab .title')).nativeElement.innerText).withContext('(C)').toEqual('Bar');

    discardPeriodicTasks();
  }));

  it('should render heading as configured on route', fakeAsync(() => {
    setDesignToken('--sci-workbench-tab-height', '3.5rem');

    // Add View
    TestBed.inject(WorkbenchRouter).navigate(['view-with-heading']).then();
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab .heading')).nativeElement.innerText).withContext('(A)').toEqual('ROUTE HEADING');

    // Set heading
    const viewDebugElement = getViewDebugElement<SpecViewComponent>('view.1');
    viewDebugElement.view.heading = 'Foo';
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab .heading')).nativeElement.innerText).withContext('(B)').toEqual('Foo');

    // Set heading
    viewDebugElement.view.heading = 'Bar';
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab .heading')).nativeElement.innerText).withContext('(C)').toEqual('Bar');

    discardPeriodicTasks();
  }));

  it('should take title from view over title configured on route', fakeAsync(() => {
    // Add View
    TestBed.inject(WorkbenchRouter).navigate(['view-with-title', {title: 'TITLE'}]).then();
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab .title')).nativeElement.innerText).withContext('(A)').toEqual('TITLE');

    // Set title
    const viewDebugElement = getViewDebugElement<SpecViewComponent>('view.1');
    viewDebugElement.view.title = 'Foo';
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab .title')).nativeElement.innerText).withContext('(B)').toEqual('Foo');

    // Set title
    viewDebugElement.view.title = 'Bar';
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab .title')).nativeElement.innerText).withContext('(C)').toEqual('Bar');

    discardPeriodicTasks();
  }));

  it('should take heading from view over heading configured on route', fakeAsync(() => {
    setDesignToken('--sci-workbench-tab-height', '3.5rem');

    // Add View
    TestBed.inject(WorkbenchRouter).navigate(['view-with-heading', {heading: 'HEADING'}]).then();
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab .heading')).nativeElement.innerText).withContext('(A)').toEqual('HEADING');

    // Set heading
    const viewDebugElement = getViewDebugElement<SpecViewComponent>('view.1');
    viewDebugElement.view.heading = 'Foo';
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab .heading')).nativeElement.innerText).withContext('(B)').toEqual('Foo');

    // Set heading
    viewDebugElement.view.heading = 'Bar';
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab .heading')).nativeElement.innerText).withContext('(C)').toEqual('Bar');

    discardPeriodicTasks();
  }));

  it('should unset title when navigating to a different route', fakeAsync(() => {
    // Add View
    TestBed.inject(WorkbenchRouter).navigate(['view-1', {title: 'TITLE'}]).then();
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab .title')).nativeElement.innerText).withContext('(A)').toEqual('TITLE');

    TestBed.inject(WorkbenchRouter).navigate(['view-2', {title: ''}], {target: 'view.1'}).then();
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab .title')).nativeElement.innerText).withContext('(B)').toEqual('');

    discardPeriodicTasks();
  }));

  it('should unset heading when navigating to a different route', fakeAsync(() => {
    setDesignToken('--sci-workbench-tab-height', '3.5rem');

    // Add View
    TestBed.inject(WorkbenchRouter).navigate(['view-1', {heading: 'HEADING'}]).then();
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab .heading')).nativeElement.innerText).withContext('(A)').toEqual('HEADING');

    TestBed.inject(WorkbenchRouter).navigate(['view-2', {heading: ''}], {target: 'view.1'}).then();
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab .heading'))).withContext('(B)').toBeNull();

    discardPeriodicTasks();
  }));

  it('should replace title when navigating to a different route', fakeAsync(() => {
    // Add View
    TestBed.inject(WorkbenchRouter).navigate(['view-1', {title: 'TITLE 1'}]).then();
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab .title')).nativeElement.innerText).withContext('(A)').toEqual('TITLE 1');

    // Navigate to a different view
    TestBed.inject(WorkbenchRouter).navigate(['view-2', {title: 'TITLE 2'}], {target: 'view.1'}).then();
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab .title')).nativeElement.innerText).withContext('(B)').toEqual('TITLE 2');

    discardPeriodicTasks();
  }));

  it('should replace heading when navigating to a different route', fakeAsync(() => {
    setDesignToken('--sci-workbench-tab-height', '3.5rem');

    // Add View
    TestBed.inject(WorkbenchRouter).navigate(['view-1', {heading: 'HEADING 1'}]).then();
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab .heading')).nativeElement.innerText).withContext('(A)').toEqual('HEADING 1');

    // Navigate to a different view
    TestBed.inject(WorkbenchRouter).navigate(['view-2', {heading: 'HEADING 2'}], {target: 'view.1'}).then();
    advance(fixture);
    expect(fixture.debugElement.query(By.css('wb-view-tab .heading')).nativeElement.innerText).withContext('(B)').toEqual('HEADING 2');

    discardPeriodicTasks();
  }));

  it('should detach inactive views from Angular component tree and DOM', fakeAsync(() => {
    // Add View 1
    TestBed.inject(WorkbenchRouter).navigate(['view-1']).then();
    advance(fixture);
    const view1DebugElement = getViewDebugElement<SpecView1Component>('view.1');
    const component1: SpecView1Component = view1DebugElement.component;

    view1DebugElement.component.checked = false;
    fixture.detectChanges();
    expect(view1DebugElement.component.checked).withContext('(A)').toBeTrue();
    expect(fixture.debugElement.query(By.css('spec-view-1'))).withContext('(B)').toBeDefined();

    // Add View 2
    TestBed.inject(WorkbenchRouter).navigate(['view-2']).then();
    advance(fixture);
    const view2DebugElement = getViewDebugElement<SpecView2Component>('view.2');
    const component2: SpecView2Component = view2DebugElement.component;

    view1DebugElement.component.checked = false;
    view2DebugElement.component.checked = false;
    fixture.detectChanges();
    expect(view1DebugElement.component.checked).withContext('(C)').toBeFalse();
    expect(fixture.debugElement.query(By.css('spec-view-1'))).withContext('(D)').toBeNull();
    expect(view2DebugElement.component.checked).withContext('(E)').toBeTrue();
    expect(fixture.debugElement.query(By.css('spec-view-2'))).withContext('(F)').toBeDefined();

    // Ensure View 1 not to be destroyed
    expect(getViewDebugElement<SpecView1Component>('view.1').component).withContext('(G)').toBe(component1);
    expect(getViewDebugElement<SpecView1Component>('view.1').component.destroyed).withContext('(H)').toBeFalse();

    // Switch to View 1
    TestBed.inject(WorkbenchRouter).navigate(['view-1'], {activate: true}).then();
    advance(fixture);

    view1DebugElement.component.checked = false;
    view2DebugElement.component.checked = false;
    fixture.detectChanges();
    expect(view1DebugElement.component.checked).withContext('(I)').toBeTrue();
    expect(fixture.debugElement.query(By.css('spec-view-1'))).withContext('(J)').toBeDefined();
    expect(view2DebugElement.component.checked).withContext('(K)').toBeFalse();
    expect(fixture.debugElement.query(By.css('spec-view-2'))).withContext('(L)').toBeNull();

    // Ensure View 2 not to be destroyed
    expect(getViewDebugElement<SpecView1Component>('view.2').component).withContext('(M)').toBe(component2);
    expect(getViewDebugElement<SpecView1Component>('view.2').component.destroyed).withContext('(N)').toBeFalse();

    // Switch to View 2
    TestBed.inject(WorkbenchRouter).navigate(['view-2'], {activate: true}).then();
    advance(fixture);

    view1DebugElement.component.checked = false;
    view2DebugElement.component.checked = false;
    fixture.detectChanges();
    expect(view1DebugElement.component.checked).withContext('(O)').toBeFalse();
    expect(fixture.debugElement.query(By.css('spec-view-1'))).withContext('(P)').toBeNull();
    expect(view2DebugElement.component.checked).withContext('(Q)').toBeTrue();
    expect(fixture.debugElement.query(By.css('spec-view-2'))).withContext('(R)').toBeDefined();

    // Ensure View 1 not to be destroyed
    expect(getViewDebugElement<SpecView1Component>('view.1').component).withContext('(S)').toBe(component1);
    expect(getViewDebugElement<SpecView1Component>('view.1').component.destroyed).withContext('(T)').toBeFalse();

    discardPeriodicTasks();
  }));

  it('invokes activate and deactivate lifecycle hooks', fakeAsync(() => {
    // Add View 1
    TestBed.inject(WorkbenchRouter).navigate(['view-1']).then();
    advance(fixture);
    const view1DebugElement = getViewDebugElement<SpecView1Component>('view.1');
    expect(view1DebugElement.view.active).withContext('(A)').toBeTrue();
    expect(view1DebugElement.component.activated).withContext('(B)').toBeTrue();

    // Add View 2
    TestBed.inject(WorkbenchRouter).navigate(['view-2']).then();
    advance(fixture);
    const view2DebugElement = getViewDebugElement<SpecView1Component>('view.2');
    expect(view1DebugElement.view.active).withContext('(C)').toBeFalse();
    expect(view1DebugElement.component.activated).withContext('(D)').toBeFalse();
    expect(view2DebugElement.view.active).withContext('(E)').toBeTrue();
    expect(view2DebugElement.component.activated).withContext('(F)').toBeTrue();

    // Switch to View 1
    TestBed.inject(WorkbenchRouter).navigate(['view-1'], {activate: true}).then();
    advance(fixture);

    expect(view1DebugElement.view.active).withContext('(G)').toBeTrue();
    expect(view1DebugElement.component.activated).withContext('(H)').toBeTrue();
    expect(view2DebugElement.view.active).withContext('(I)').toBeFalse();
    expect(view2DebugElement.component.activated).withContext('(J)').toBeFalse();

    // Switch to View 2
    TestBed.inject(WorkbenchRouter).navigate(['view-2'], {activate: true}).then();
    advance(fixture);

    expect(view1DebugElement.view.active).withContext('(K)').toBeFalse();
    expect(view1DebugElement.component.activated).withContext('(L)').toBeFalse();
    expect(view2DebugElement.view.active).withContext('(M)').toBeTrue();
    expect(view2DebugElement.component.activated).withContext('(N)').toBeTrue();

    discardPeriodicTasks();
  }));

  it('invokes destroy lifecycle hook', fakeAsync(() => {
    // Add View 1
    TestBed.inject(WorkbenchRouter).navigate(['view-1']).then();
    advance(fixture);
    const view1DebugElement = getViewDebugElement<SpecView1Component>('view.1');
    expect(view1DebugElement.view.destroyed).withContext('(A)').toBeFalse();
    expect(view1DebugElement.component.destroyed).withContext('(B)').toBeFalse();

    // Add View 2
    TestBed.inject(WorkbenchRouter).navigate(['view-2']).then();
    advance(fixture);
    const view2DebugElement = getViewDebugElement<SpecView1Component>('view.2');
    expect(view1DebugElement.view.destroyed).withContext('(C)').toBeFalse();
    expect(view1DebugElement.component.destroyed).withContext('(D)').toBeFalse();
    expect(view2DebugElement.view.destroyed).withContext('(E)').toBeFalse();
    expect(view2DebugElement.component.destroyed).withContext('(F)').toBeFalse();

    // Close View 2
    TestBed.inject(WorkbenchRouter).navigate([], {target: 'view.2', close: true}).then();
    advance(fixture);
    expect(view1DebugElement.view.destroyed).withContext('(G)').toBeFalse();
    expect(view1DebugElement.component.destroyed).withContext('(H)').toBeFalse();
    expect(view2DebugElement.view.destroyed).withContext('(I)').toBeTrue();
    expect(view2DebugElement.component.destroyed).withContext('(J)').toBeTrue();

    // Close View 1
    TestBed.inject(WorkbenchRouter).navigate([], {target: 'view.1', close: true}).then();
    advance(fixture);
    expect(view1DebugElement.view.destroyed).withContext('(K)').toBeTrue();
    expect(view1DebugElement.component.destroyed).withContext('(L)').toBeTrue();
    expect(view2DebugElement.view.destroyed).withContext('(M)').toBeTrue();
    expect(view2DebugElement.component.destroyed).withContext('(N)').toBeTrue();

    expect(fixture.debugElement.query(By.css('spec-view-1'))).withContext('(O)').toBeNull();
    expect(fixture.debugElement.query(By.css('spec-view-2'))).withContext('(P)').toBeNull();

    discardPeriodicTasks();
  }));

  it('prevents the view from being closed', fakeAsync(() => {
    // Add View 1
    TestBed.inject(WorkbenchRouter).navigate(['view-1']).then();
    advance(fixture);
    const view1DebugElement = getViewDebugElement<SpecView1Component>('view.1');

    // Try to close View 1 (prevent)
    view1DebugElement.component.preventDestroy = true;
    TestBed.inject(WorkbenchRouter).navigate([], {target: 'view.1', close: true}).then();
    advance(fixture);

    expect(view1DebugElement.view.destroyed).withContext('(A)').toBeFalse();
    expect(view1DebugElement.component.destroyed).withContext('(B)').toBeFalse();
    expect(fixture.debugElement.query(By.css('spec-view-1'))).withContext('(C)').toBeDefined();

    // Try to close to View 1 (accept)
    view1DebugElement.component.preventDestroy = false;
    TestBed.inject(WorkbenchRouter).navigate([], {target: 'view.1', close: true}).then();
    advance(fixture);

    expect(view1DebugElement.view.destroyed).withContext('(D)').toBeTrue();
    expect(view1DebugElement.component.destroyed).withContext('(E)').toBeTrue();
    expect(fixture.debugElement.query(By.css('spec-view-1'))).withContext('(F)').toBeNull();

    discardPeriodicTasks();
  }));

  it('allows component routing', fakeAsync(() => {
    // Add View 1
    TestBed.inject(WorkbenchRouter).navigate(['view-1']).then();
    advance(fixture);
    const viewDebugElement1 = getViewDebugElement<SpecView1Component>('view.1');
    expect(viewDebugElement1.component.destroyed).withContext('(A)').toBeFalse();
    expect(viewDebugElement1.view.destroyed).withContext('(B)').toBeFalse();
    expect(fixture.debugElement.query(By.css('spec-view-1'))).withContext('(C)').toBeDefined();

    // Route to View 2
    TestBed.inject(WorkbenchRouter).navigate(['view-2'], {target: 'view.1'}).then();
    advance(fixture);

    const viewDebugElement2 = getViewDebugElement<SpecView2Component>('view.1');
    expect(viewDebugElement2.component.destroyed).withContext('(C)').toBeFalse();
    expect(viewDebugElement2.view.destroyed).withContext('(D)').toBeFalse();
    expect(fixture.debugElement.query(By.css('spec-view-2'))).withContext('(E)').toBeDefined();

    expect(viewDebugElement1.component.destroyed).withContext('(F)').toBeTrue();
    expect(fixture.debugElement.query(By.css('spec-view-1'))).withContext('(G)').toBeNull();

    expect(viewDebugElement1.view.destroyed).withContext('(H)').toBeFalse();
    expect(viewDebugElement1.view).withContext('(I)').toBe(viewDebugElement2.view);

    discardPeriodicTasks();
  }));

  it('allows a view to be added, removed and to be added again', fakeAsync(() => {
    // Add View 1
    TestBed.inject(WorkbenchRouter).navigate(['view-1']).then();
    advance(fixture);
    const viewDebugElement1 = getViewDebugElement<SpecView1Component>('view.1');
    expect(viewDebugElement1.component.destroyed).withContext('(A)').toBeFalse();
    expect(viewDebugElement1.view.destroyed).withContext('(B)').toBeFalse();
    expect(fixture.debugElement.query(By.css('spec-view-1'))).withContext('(C)').toBeDefined();

    // Remove View 1
    viewDebugElement1.view.close().then();
    advance(fixture);
    expect(viewDebugElement1.component.destroyed).withContext('(D)').toBeTrue();
    expect(viewDebugElement1.view.destroyed).withContext('(E)').toBeTrue();
    expect(fixture.debugElement.query(By.css('spec-view-1'))).withContext('(F)').toBeNull();

    // Add View 1 again
    TestBed.inject(WorkbenchRouter).navigate(['view-1']).then();
    advance(fixture);
    const viewDebugElement2 = getViewDebugElement<SpecView1Component>('view.1');
    expect(viewDebugElement2.component.destroyed).withContext('(G)').toBeFalse();
    expect(viewDebugElement2.view.destroyed).withContext('(H)').toBeFalse();
    expect(fixture.debugElement.query(By.css('spec-view-1'))).withContext('(I)').toBeDefined();

    // Remove View 1
    viewDebugElement2.view.close().then();
    advance(fixture);
    expect(viewDebugElement2.component.destroyed).withContext('(D)').toBeTrue();
    expect(viewDebugElement2.view.destroyed).withContext('(E)').toBeTrue();
    expect(fixture.debugElement.query(By.css('spec-view-1'))).withContext('(F)').toBeNull();

    discardPeriodicTasks();
  }));

  function getViewDebugElement<T>(viewId: string): ViewDebugElement<T> {
    const view = TestBed.inject(WorkbenchViewRegistry).get(viewId);
    const viewComponent = view.portal.componentRef.instance as ViewComponent;
    const component = viewComponent.routerOutlet.component as T;

    return {view, viewComponent, component};
  }

  function setDesignToken(name: string, value: string): void {
    const workbenchElement = (fixture.debugElement.nativeElement as HTMLElement);
    workbenchElement.style.setProperty(name, value);
  }

  interface ViewDebugElement<T> {
    view: WorkbenchView;
    viewComponent: ViewComponent;
    component: T;
  }
});

@Component({
  selector: 'spec-view',
  template: '{{checkFromTemplate()}}',
  standalone: true,
})
class SpecViewComponent implements OnDestroy, WorkbenchViewPreDestroy {

  public destroyed = false;
  public activated: boolean | undefined;
  public checked = false;
  public preventDestroy = false;

  constructor(public view: WorkbenchView, route: ActivatedRoute) {
    const title = route.snapshot.paramMap.get('title');
    if (title) {
      view.title = title;
    }
    const heading = route.snapshot.paramMap.get('heading');
    if (heading) {
      view.heading = heading;
    }
    view.active$
      .pipe(takeUntilDestroyed())
      .subscribe(active => this.activated = active);
  }

  public onWorkbenchViewPreDestroy(): Observable<boolean> | Promise<boolean> | boolean {
    return !this.preventDestroy;
  }

  public ngOnDestroy(): void {
    this.destroyed = true;
  }

  public checkFromTemplate(): boolean {
    this.checked = true;
    return this.checked;
  }
}

@Component({
  selector: 'spec-view-1',
  template: '{{checkFromTemplate()}}',
  standalone: true,
})
class SpecView1Component extends SpecViewComponent {

  constructor(view: WorkbenchView, route: ActivatedRoute) {
    super(view, route);
  }
}

@Component({
  selector: 'spec-view-2',
  template: '{{checkFromTemplate()}}',
  standalone: true,
})
class SpecView2Component extends SpecViewComponent {

  constructor(view: WorkbenchView, route: ActivatedRoute) {
    super(view, route);
  }
}
