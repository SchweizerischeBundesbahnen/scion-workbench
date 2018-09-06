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
import { Component, Inject, Injectable, InjectionToken, NgModule, NgModuleFactoryLoader, Optional } from '@angular/core';
import { WorkbenchModule } from '../workbench.module';
import { expect, jasmineCustomMatchers } from './util/jasmine-custom-matchers.spec';
import { RouterTestingModule, SpyNgModuleFactoryLoader } from '@angular/router/testing';
import { Router, RouterModule } from '@angular/router';
import { WorkbenchRouter } from '../routing/workbench-router.service';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { advance, clickElement } from './util/util.spec';
import { ActivityPartComponent } from '../activity-part/activity-part.component';
import { By } from '@angular/platform-browser';

/**
 *
 * Testsetup:
 *
 *            +--------------+
 *            | Test Module  |
 *            +--------------+
 *                   |
 *                feature
 *                   |
 *                   v
 * +------------------------------------------+
 * | Feature Module                           |
 * |------------------------------------------|
 * | routes:                                  |
 * |                                          |
 * | 'activity' => Feature_Activity_Component |
 * | 'view'     => Feature_View_Component     |
 * +------------------------------------------+
 *
 */
// tslint:disable class-name
describe('Lazily loaded view', () => {

  beforeEach(async(() => {
    jasmine.addMatchers(jasmineCustomMatchers);

    TestBed.configureTestingModule({
      imports: [AppTestModule]
    });

    TestBed.get(Router).initialNavigation();
  }));

  it('should get services injected from its child injector', fakeAsync(inject([WorkbenchRouter, NgModuleFactoryLoader], (wbRouter: WorkbenchRouter, loader: SpyNgModuleFactoryLoader) => {
    loader.stubbedModules = {
      './feature/feature.module#FeatureModule': FeatureModule,
    };

    const fixture = TestBed.createComponent(AppComponent);
    advance(fixture);

    // Open 'feature/activity'
    clickElement(fixture, ActivityPartComponent, 'a.activity');

    // Verify injection token
    const activityComponent: Feature_Activity_Component = fixture.debugElement.query(By.directive(Feature_Activity_Component)).componentInstance;
    expect(activityComponent.featureService).not.toBeNull('(1)');
    expect(activityComponent.featureService).not.toBeUndefined('(2)');

    // Open 'feature/view'
    wbRouter.navigate(['/feature/view']).then();
    advance(fixture);

    // Verify injection token
    const viewComponent: Feature_View_Component = fixture.debugElement.query(By.directive(Feature_View_Component)).componentInstance;
    expect(viewComponent.featureService).not.toBeNull('(3)');
    expect(viewComponent.featureService).not.toBeUndefined('(4)');
    advance(fixture);
  })));

  /**
   * Verifies that a service provided in the lazily loaded module should be preferred over the service provided in the root module.
   */
  it('should get services injected from its child injector prior to from the root injector', fakeAsync(inject([WorkbenchRouter, NgModuleFactoryLoader], (wbRouter: WorkbenchRouter, loader: SpyNgModuleFactoryLoader) => {
    loader.stubbedModules = {
      './feature/feature.module#FeatureModule': FeatureModule,
    };

    const fixture = TestBed.createComponent(AppComponent);
    advance(fixture);

    // Open 'feature/activity'
    clickElement(fixture, ActivityPartComponent, 'a.activity');

    // Verify injection token
    const activityComponent: Feature_Activity_Component = fixture.debugElement.query(By.directive(Feature_Activity_Component)).componentInstance;
    expect(activityComponent.injectedValue).toEqual('child-injector-value', '(1)');

    // Open 'feature/view'
    wbRouter.navigate(['/feature/view']).then();
    advance(fixture);

    // Verify injection token
    const viewComponent: Feature_View_Component = fixture.debugElement.query(By.directive(Feature_View_Component)).componentInstance;
    expect(viewComponent.injectedValue).toEqual('child-injector-value', '(2)');
    advance(fixture);
  })));
});

/****************************************************************************************************
 * Definition of App Test Module                                                                    *
 ****************************************************************************************************/
@Component({
  template: `
    <wb-workbench style="position: relative; width: 100%; height: 500px">
      <wb-activity cssClass="activity"
                   label="activity"
                   routerLink="feature/activity">
      </wb-activity>
    </wb-workbench>
  `
})
class AppComponent {
}

const DI_TOKEN = new InjectionToken<string>('TOKEN');

@Injectable()
export class FeatureService {
}

@NgModule({
  imports: [
    WorkbenchModule.forRoot(),
    NoopAnimationsModule,
    RouterTestingModule.withRoutes([
      {path: 'feature', loadChildren: './feature/feature.module#FeatureModule'},
    ]),
  ],
  declarations: [AppComponent],
  providers: [
    {provide: DI_TOKEN, useValue: 'root-injector-value'},
  ]
})
class AppTestModule {
}

/****************************************************************************************************
 * Definition of Feature Module                                                                     *
 ****************************************************************************************************/
@Component({template: 'Injected value: {{injectedValue}}'})
class Feature_Activity_Component {
  constructor(@Inject(DI_TOKEN) public injectedValue: string,
              @Optional() public featureService: FeatureService) {
  }
}

@Component({template: 'Injected value: {{injectedValue}}'})
class Feature_View_Component {
  constructor(@Inject(DI_TOKEN) public injectedValue: string,
              @Optional() public featureService: FeatureService) {
  }
}

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {path: 'activity', component: Feature_Activity_Component},
      {path: 'view', component: Feature_View_Component}
    ]),
  ],
  declarations: [
    Feature_Activity_Component,
    Feature_View_Component
  ],
  providers: [
    {provide: DI_TOKEN, useValue: 'child-injector-value'},
    FeatureService,
  ]
})
class FeatureModule {
}
