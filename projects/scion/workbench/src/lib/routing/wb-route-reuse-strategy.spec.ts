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
import { Router, RouteReuseStrategy, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

/**
 * +---------------------------------------------+     +---------------------------------------------+
 * | Feature Module A                            |     | Feature Module B                            |
 * |                                             |     |                                             |
 * | feature-a/activity-1 => FeatureA_Activity1_Component   |     | feature-b/activity-1 => FeatureB_Activity1_Component   |
 * | feature-a/activity-2 => FeatureA_Activity2_Component   |     | feature-b/activity-2 => FeatureB_Activity2_Component   |
 * +---------------------------------------------+     +---------------------------------------------+
 *                   |                                             |
 *                   +----------------------+----------------------+
 *                                          |
 *                                          |
 *                   +---------------------------------------------+
 *                   | App Module                                  |
 *                   |                                             |
 *                   | app/activity-1 => AppActivity1              |
 *                   | app/activity-2 => AppActivity2              |
 *                   +---------------------------------------------+
 */
// tslint:disable component-selector class-name
describe('WbRouteReuseStrategy', () => {

  @Component({
    selector: 'spec-app', template: `
      <div style="position: relative; width: 100%; height: 500px">
        <wb-workbench>
          <!-- Activities from app module -->
          <wb-activity cssClass="activity-app_module-1" label="app_module-1" routerLink="app/activity-1"></wb-activity>
          <wb-activity cssClass="activity-app_module-2" label="app_module-2" routerLink="app/activity-2"></wb-activity>

          <!-- Activities from feature module A -->
          <wb-activity cssClass="activity-feature_module_a-1" label="feature_module_a-1" routerLink="feature-a/activity-1"></wb-activity>
          <wb-activity cssClass="activity-feature_module_a-2" label="feature_module_a-2" routerLink="feature-a/activity-2"></wb-activity>

          <!-- Activities from feature module B -->
          <wb-activity cssClass="activity-feature_module_b-1" label="feature_module_b-1" routerLink="feature-b/activity-1"></wb-activity>
          <wb-activity cssClass="activity-feature_module_b-2" label="feature_module_b-2" routerLink="feature-b/activity-2"></wb-activity>
        </wb-workbench>
      </div>
    `
  })
  class AppComponent {
  }

  @Component({selector: 'spec-activity-app_module-1', template: 'App Module - Activity 1'})
  class App_Activity1_Component {
    public static SEQ = 0;
    public readonly identity = `${App_Activity1_Component.name}, instance ${++App_Activity1_Component.SEQ}`;
  }

  @Component({selector: 'spec-activity-app_module-2', template: 'App Module - Activity 2'})
  class App_Activity2_Component {
    public static SEQ = 0;
    public readonly identity = `${App_Activity2_Component.name}, instance ${++App_Activity2_Component.SEQ}`;
  }

  @NgModule({
    imports: [
      WorkbenchModule.forRoot(),
      NoopAnimationsModule,
      RouterTestingModule.withRoutes([
        {path: 'app/activity-1', component: App_Activity1_Component},
        {path: 'app/activity-2', component: App_Activity2_Component},
        {path: 'feature-a', loadChildren: './feature-a/feature-a.module#FeatureAModule'},
        {path: 'feature-b', loadChildren: './feature-b/feature-b.module#FeatureBModule'},
      ]),
    ],
    declarations: [AppComponent, App_Activity1_Component, App_Activity2_Component]
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

  it('reuses activity routes', fakeAsync(inject([Router, NgModuleFactoryLoader, RouteReuseStrategy], (router: Router, loader: SpyNgModuleFactoryLoader, routeReuseStrategy: RouteReuseStrategy) => {
    loader.stubbedModules = {
      './feature-a/feature-a.module#FeatureAModule': FeatureAModule,
      './feature-b/feature-b.module#FeatureBModule': FeatureBModule,
    };

    // Configure to use reuse strategy
    router.routeReuseStrategy = routeReuseStrategy;

    const fixture = TestBed.createComponent(AppComponent);
    tickAndDetechChanges(fixture);

    // Open 'app/activity-1'
    fixture.debugElement.query(By.css('a.activity-app_module-1')).nativeElement.click();
    tickAndDetechChanges(fixture);
    expect(fixture.debugElement.query(By.css('spec-activity-app_module-1'))).toBeTruthy('app/activity-1');
    const appActivity1 = fixture.debugElement.query(By.css('spec-activity-app_module-1')).componentInstance;

    // Open 'app/activity-2'
    fixture.debugElement.query(By.css('a.activity-app_module-2')).nativeElement.click();
    tickAndDetechChanges(fixture);
    expect(fixture.debugElement.query(By.css('spec-activity-app_module-2'))).toBeTruthy('app/activity-2');
    const appActivity2 = fixture.debugElement.query(By.css('spec-activity-app_module-2')).componentInstance;

    // Open 'feature-a/activity-1'
    fixture.debugElement.query(By.css('a.activity-feature_module_a-1')).nativeElement.click();
    tickAndDetechChanges(fixture);
    expect(fixture.debugElement.query(By.css('spec-activity-feature_module_a-1'))).toBeTruthy('feature-a/activity-1');
    const featureAActivity1 = fixture.debugElement.query(By.css('spec-activity-feature_module_a-1')).componentInstance;

    // Open 'feature-a/activity-2'
    fixture.debugElement.query(By.css('a.activity-feature_module_a-2')).nativeElement.click();
    tickAndDetechChanges(fixture);
    expect(fixture.debugElement.query(By.css('spec-activity-feature_module_a-2'))).toBeTruthy('feature-a/activity-2');
    const featureAActivity2 = fixture.debugElement.query(By.css('spec-activity-feature_module_a-2')).componentInstance;

    // Open 'feature-b/activity-1'
    fixture.debugElement.query(By.css('a.activity-feature_module_b-1')).nativeElement.click();
    tickAndDetechChanges(fixture);
    expect(fixture.debugElement.query(By.css('spec-activity-feature_module_b-1'))).toBeTruthy('feature-b/activity-1');
    const featureBActivity1 = fixture.debugElement.query(By.css('spec-activity-feature_module_b-1')).componentInstance;

    // Open 'feature-a/activity-2'
    fixture.debugElement.query(By.css('a.activity-feature_module_b-2')).nativeElement.click();
    tickAndDetechChanges(fixture);
    expect(fixture.debugElement.query(By.css('spec-activity-feature_module_b-2'))).toBeTruthy('feature-b/activity-2');
    const featureBActivity2 = fixture.debugElement.query(By.css('spec-activity-feature_module_b-2')).componentInstance;

    // Goto 'app/activity-1'
    fixture.debugElement.query(By.css('a.activity-app_module-1')).nativeElement.click();
    tickAndDetechChanges(fixture);
    expect(fixture.debugElement.query(By.css('spec-activity-app_module-1')).componentInstance).toBe(appActivity1, 'goto \'app/activity-1\'');

    // Goto 'app/activity-2'
    fixture.debugElement.query(By.css('a.activity-app_module-2')).nativeElement.click();
    tickAndDetechChanges(fixture);
    expect(fixture.debugElement.query(By.css('spec-activity-app_module-2')).componentInstance).toBe(appActivity2, 'goto \'app/activity-2\'');

    // Goto 'feature-a/activity-1'
    fixture.debugElement.query(By.css('a.activity-feature_module_a-1')).nativeElement.click();
    tickAndDetechChanges(fixture);
    expect(fixture.debugElement.query(By.css('spec-activity-feature_module_a-1')).componentInstance).toBe(featureAActivity1, 'goto \'feature-a/activity-1\'');

    // Goto 'feature-a/activity-2'
    fixture.debugElement.query(By.css('a.activity-feature_module_a-2')).nativeElement.click();
    tickAndDetechChanges(fixture);
    expect(fixture.debugElement.query(By.css('spec-activity-feature_module_a-2')).componentInstance).toBe(featureAActivity2, 'goto \'feature-a/activity-2\'');

    // Goto 'feature-b/activity-1'
    fixture.debugElement.query(By.css('a.activity-feature_module_b-1')).nativeElement.click();
    tickAndDetechChanges(fixture);
    expect(fixture.debugElement.query(By.css('spec-activity-feature_module_b-1')).componentInstance).toBe(featureBActivity1, 'goto \'feature-b/activity-1\'');

    // Goto 'feature-b/activity-2'
    fixture.debugElement.query(By.css('a.activity-feature_module_b-2')).nativeElement.click();
    tickAndDetechChanges(fixture);
    expect(fixture.debugElement.query(By.css('spec-activity-feature_module_b-2')).componentInstance).toBe(featureBActivity2, 'goto \'feature-b/activity-2\'');

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
@Component({selector: 'spec-activity-feature_module_a-1', template: 'Feature Module A - Activity 1'})
class FeatureA_Activity1_Component {
  public static SEQ = 0;
  public readonly identity = `${FeatureA_Activity1_Component.name}, instance ${++FeatureA_Activity1_Component.SEQ}`;
}

@Component({selector: 'spec-activity-feature_module_a-2', template: 'Feature Module A - Activity 2'})
class FeatureA_Activity2_Component {
  public static SEQ = 0;
  public readonly identity = `${FeatureA_Activity2_Component.name}, instance ${++FeatureA_Activity2_Component.SEQ}`;
}

/**
 * Components of Feature Module B
 */
@Component({selector: 'spec-activity-feature_module_b-1', template: 'Feature Module B - Activity 1'})
class FeatureB_Activity1_Component {
  public static SEQ = 0;
  public readonly identity = `${FeatureB_Activity1_Component.name}, instance ${++FeatureB_Activity1_Component.SEQ}`;
}

@Component({selector: 'spec-activity-feature_module_b-2', template: 'Feature Module B - Activity 2'})
class FeatureB_Activity2_Component {
  public static SEQ = 0;
  public readonly identity = `${FeatureB_Activity2_Component.name}, instance ${++FeatureB_Activity2_Component.SEQ}`;
}

/**
 * Feature Module A
 */
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {path: 'activity-1', component: FeatureA_Activity1_Component},
      {path: 'activity-2', component: FeatureA_Activity2_Component}
    ]),
  ],
  declarations: [FeatureA_Activity1_Component, FeatureA_Activity2_Component]
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
      {path: 'activity-1', component: FeatureB_Activity1_Component},
      {path: 'activity-2', component: FeatureB_Activity2_Component}
    ]),
  ],
  declarations: [FeatureB_Activity1_Component, FeatureB_Activity2_Component]
})
export class FeatureBModule {
}
