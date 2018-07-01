import { async, ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { NgModule } from '@angular/core';
import { ViewPartGridComponent } from '../view-part-grid/view-part-grid.component';
import { WorkbenchModule } from '../workbench.module';
import { expect, jasmineCustomMatchers } from '../spec/jasmine-custom-matchers.spec';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { SpecView1Component, SpecView2Component } from '../view-part/view-part.model.spec';
import { WB_VIEW_TITLE_PARAM } from './routing-params.constants';
import { WorkbenchRouter } from './workbench-router.service';

describe('WbRouter', () => {

  @NgModule({
    declarations: [SpecView1Component, SpecView2Component],
    imports: [
      WorkbenchModule.forRoot(),
      RouterTestingModule.withRoutes([
        {path: 'path/to/view-1', component: SpecView1Component},
        {path: 'path/to/view-2', component: SpecView1Component},
        {path: 'path/to/view-3', component: SpecView1Component},
      ])
    ]
  })
  class TestModule {
  }

  beforeEach(async(() => {
    jasmine.addMatchers(jasmineCustomMatchers);

    TestBed.configureTestingModule({
      imports: [TestModule]
    });

    TestBed.get(Router).initialNavigation();
  }));

  it('resolves views by path', fakeAsync(inject([WorkbenchRouter], (wbRouter: WorkbenchRouter) => {
    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    tickAndDetechChanges(fixture);

    // Add View 1
    wbRouter.navigate(['path', 'to', 'view-1', {[WB_VIEW_TITLE_PARAM]: 'view-1 (A)'}], {blankViewPartRef: 'viewpart.1'}).then();
    tickAndDetechChanges(fixture);

    // Add View 1 again
    wbRouter.navigate(['path', 'to', 'view-1', {[WB_VIEW_TITLE_PARAM]: 'view-1 (B)'}], {blankViewPartRef: 'viewpart.1', tryActivateView: false}).then();
    tickAndDetechChanges(fixture);

    // Add View 2
    wbRouter.navigate(['path', 'to', 'view-2', {[WB_VIEW_TITLE_PARAM]: 'view-2 (A)'}], {blankViewPartRef: 'viewpart.1'}).then();
    tickAndDetechChanges(fixture);

    // Add View 2 again (activate)
    wbRouter.navigate(['path', 'to', 'view-2', {[WB_VIEW_TITLE_PARAM]: 'view-1 (B)'}], {blankViewPartRef: 'viewpart.1', tryActivateView: true}).then();
    tickAndDetechChanges(fixture);

    // Add View 3
    wbRouter.navigate(['path', 'to', 'view-3', {[WB_VIEW_TITLE_PARAM]: 'view-3'}], {blankViewPartRef: 'viewpart.1', tryActivateView: true}).then();
    tickAndDetechChanges(fixture);

    expect(wbRouter.resolve(['path', 'to', 'view-1']).map(it => it.title).sort()).toEqual(['view-1 (A)', 'view-1 (B)'].sort());
    expect(wbRouter.resolve(['path', 'to', 'view-2']).map(it => it.title)).toEqual(['view-2 (A)']);
    expect(wbRouter.resolve(['path', 'to', 'view-3']).map(it => it.title)).toEqual(['view-3']);

    tick();
  })));

  function tickAndDetechChanges(fixture: ComponentFixture<any>): void {
    tick();
    fixture.detectChanges();
  }
});
