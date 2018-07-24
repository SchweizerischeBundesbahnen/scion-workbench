/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { async, ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { Component, NgModule, NgModuleFactoryLoader } from '@angular/core';
import { WorkbenchModule } from '../workbench.module';
import { expect, jasmineCustomMatchers } from '../spec/jasmine-custom-matchers.spec';
import { RouterTestingModule, SpyNgModuleFactoryLoader } from '@angular/router/testing';
import { Router, RouterModule } from '@angular/router';
import { WorkbenchRouter } from './workbench-router.service';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';


/**
 * Test setup: We have 2 feature modules which are lazily loaded:
 *
 *
 * +-----------------------------------------------+     +------------------------------------------------+
 * | Feature Module A                              |     | Feature Module B                               |
 * |                                               |     |                                                |
 * | feature-a/view-1 => FeatureA_View1_Component  |     | feature-b/view-1 => FeatureB_View1_Component   |
 * | feature-a/view-2 => FeatureA_View2_Component  |     | feature-b/view-2 => FeatureB_View2_Component   |
 * +-----------------------------------------------+     +------------------------------------------------+
 *                   |                                             |
 *                   +----------------------+----------------------+
 *                                          |
 *                                    +--------------+
 *                                    | Test Modules |
 *                                    +--------------+
 */
// tslint:disable component-selector class-name
describe('Views', () => {

  @Component({
    selector: 'spec-app', template: `
      <div style="position: relative; width: 100%; height: 500px">
        <wb-workbench></wb-workbench>
      </div>
    `
  })
  class AppComponent {
  }

  @NgModule({
    imports: [
      WorkbenchModule.forRoot(),
      NoopAnimationsModule,
      RouterTestingModule.withRoutes([
        {path: 'feature-a', loadChildren: './feature-a/feature-a.module#FeatureAModule'},
        {path: 'feature-b', loadChildren: './feature-b/feature-b.module#FeatureBModule'},
      ]),
    ],
    declarations: [AppComponent]
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

  it('can be loaded from lazy feature modules', fakeAsync(inject([WorkbenchRouter, NgModuleFactoryLoader], (wbRouter: WorkbenchRouter, loader: SpyNgModuleFactoryLoader) => {
    loader.stubbedModules = {
      './feature-a/feature-a.module#FeatureAModule': FeatureAModule,
      './feature-b/feature-b.module#FeatureBModule': FeatureBModule,
    };

    const fixture = TestBed.createComponent(AppComponent);
    tickAndDetechChanges(fixture);

    // Navigate to view 'feature-a/view-1'
    wbRouter.navigate(['feature-a', 'view-1'], {blankViewPartRef: 'viewpart.1'}).then();
    tickAndDetechChanges(fixture);
    expect(fixture.debugElement.query(By.css('spec-feature_module_a-view-1'))).toBeTruthy('feature-a/view-1');

    // Navigate to view 'feature-a/view-2'
    wbRouter.navigate(['feature-a', 'view-2'], {blankViewPartRef: 'viewpart.1'}).then();
    tickAndDetechChanges(fixture);
    expect(fixture.debugElement.query(By.css('spec-feature_module_a-view-2'))).toBeTruthy('feature-a/view-2');

    // Navigate to view 'feature-b/view-1'
    wbRouter.navigate(['feature-b', 'view-1'], {blankViewPartRef: 'viewpart.1'}).then();
    tickAndDetechChanges(fixture);
    expect(fixture.debugElement.query(By.css('spec-feature_module_b-view-1'))).toBeTruthy('feature-b/view-1');

    // Navigate to view 'feature-b/view-2'
    wbRouter.navigate(['feature-b', 'view-2'], {blankViewPartRef: 'viewpart.1'}).then();
    tickAndDetechChanges(fixture);
    expect(fixture.debugElement.query(By.css('spec-feature_module_b-view-2'))).toBeTruthy('feature-b/view-2');

    tick();
  })));

  function tickAndDetechChanges(fixture: ComponentFixture<any>): void {
    tick();
    fixture.detectChanges();
  }
});

// ------------------------------------------------------------------------------------------- //

/**
 * Components of Feature Module A
 */
@Component({selector: 'spec-feature_module_a-view-1', template: 'Feature Module A - View 1'})
class FeatureA_View1_Component {
}

@Component({selector: 'spec-feature_module_a-view-2', template: 'Feature Module A - View 1'})
class FeatureA_View2_Component {
}

/**
 * Components of Feature Module B
 */
@Component({selector: 'spec-feature_module_b-view-1', template: 'Feature Module B - View 1'})
class FeatureB_View1_Component {
}

@Component({selector: 'spec-feature_module_b-view-2', template: 'Feature Module B - View 1'})
class FeatureB_View2_Component {
}

/**
 * Feature Module A
 */
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {path: 'view-1', component: FeatureA_View1_Component},
      {path: 'view-2', component: FeatureA_View2_Component}
    ]),
  ],
  declarations: [FeatureA_View1_Component, FeatureA_View2_Component]
})
export class FeatureAModule {
}

/**
 * Feature Module B
 */
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {path: 'view-1', component: FeatureB_View1_Component},
      {path: 'view-2', component: FeatureB_View2_Component}
    ]),
  ],
  declarations: [FeatureB_View1_Component, FeatureB_View2_Component]
})
export class FeatureBModule {
}
