/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {discardPeriodicTasks, fakeAsync, TestBed} from '@angular/core/testing';
import {Component, Inject, Injectable, InjectionToken, NgModule, Optional} from '@angular/core';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {advance, styleFixture} from '../testing/testing.util';
import {WorkbenchComponent} from '../workbench.component';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {By} from '@angular/platform-browser';
import {WorkbenchTestingModule} from '../testing/workbench-testing.module';
import {RouterTestingModule} from '@angular/router/testing';

/**
 *
 * Test setup:
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
 * | 'view'     => Feature_View_Component     |
 * +------------------------------------------+
 *
 */
describe('Lazily loaded view', () => {

  it('should get services injected from its child injector', fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest(),
        RouterTestingModule.withRoutes([
          {path: 'feature', loadChildren: () => FeatureModule},
        ]),
      ],
      providers: [
        {provide: DI_TOKEN, useValue: 'root-injector-value'},
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));

    // Open 'feature/view'
    TestBed.inject(WorkbenchRouter).navigate(['/feature/view']).then();
    advance(fixture);

    // Verify injection token
    const viewComponent: Feature_View_Component = fixture.debugElement.query(By.directive(Feature_View_Component)).componentInstance;
    expect(viewComponent.featureService).not.withContext('(3)').toBeNull();
    expect(viewComponent.featureService).not.withContext('(4)').toBeUndefined();

    discardPeriodicTasks();
  }));

  /**
   * Verifies that a service provided in the lazily loaded module should be preferred over the service provided in the root module.
   */
  it('should get services injected from its child injector prior to from the root injector', fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest(),
        RouterTestingModule.withRoutes([
          {path: 'feature', loadChildren: () => FeatureModule},
        ]),
      ],
      providers: [
        {provide: DI_TOKEN, useValue: 'root-injector-value'},
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));

    // Open 'feature/view'
    TestBed.inject(WorkbenchRouter).navigate(['/feature/view']).then();
    advance(fixture);

    // Verify injection token
    const viewComponent: Feature_View_Component = fixture.debugElement.query(By.directive(Feature_View_Component)).componentInstance;
    expect(viewComponent.injectedValue).withContext('(2)').toEqual('child-injector-value');

    discardPeriodicTasks();
  }));
});

/****************************************************************************************************
 * Definition of Test Artifacts                                                                     *
 ****************************************************************************************************/

const DI_TOKEN = new InjectionToken<string>('TOKEN');

@Injectable()
export class FeatureService {
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
      {path: 'view', component: Feature_View_Component},
    ]),
  ],
  declarations: [
    Feature_View_Component,
  ],
  providers: [
    {provide: DI_TOKEN, useValue: 'child-injector-value'},
    FeatureService,
  ],
})
class FeatureModule {
}
