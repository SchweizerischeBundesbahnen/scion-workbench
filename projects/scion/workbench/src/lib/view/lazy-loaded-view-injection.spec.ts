/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {TestBed} from '@angular/core/testing';
import {Component, inject, Injectable, InjectionToken} from '@angular/core';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {provideRouter, Routes} from '@angular/router';
import {styleFixture, waitUntilStable, waitUntilWorkbenchStarted} from '../testing/testing.util';
import {WorkbenchComponent} from '../workbench.component';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {By} from '@angular/platform-browser';
import {provideWorkbenchForTest} from '../testing/workbench.provider';

/**
 *
 * Test setup:
 *
 *             +-------------+
 *             | Application |
 *             +-------------+
 *                   |
 *                feature
 *                   |
 *                   v
 * +------------------------------------------+
 * | Feature                                  |
 * |------------------------------------------|
 * | routes:                                  |
 * |                                          |
 * | 'view'     => Feature_View_Component     |
 * +------------------------------------------+
 *
 */
describe('Lazily loaded view', () => {

  it('should get services injected from its child injector', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'feature', loadChildren: () => featureRoutes},
        ]),
        {provide: DI_TOKEN, useValue: 'root-injector-value'},
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Open 'feature/view'
    await TestBed.inject(WorkbenchRouter).navigate(['/feature/view']);
    await waitUntilStable();

    // Verify injection token
    const viewComponent = fixture.debugElement.query(By.directive(Feature_View_Component)).componentInstance as Feature_View_Component;
    expect(viewComponent.featureService).not.withContext('(3)').toBeNull();
    expect(viewComponent.featureService).not.withContext('(4)').toBeUndefined();
  });

  /**
   * Verifies that a service provided in the lazily loaded module should be preferred over the service provided in the root module.
   */
  it('should get services injected from its child injector prior to from the root injector', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'feature', loadChildren: () => featureRoutes},
        ]),
        {provide: DI_TOKEN, useValue: 'root-injector-value'},
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Open 'feature/view'
    await TestBed.inject(WorkbenchRouter).navigate(['/feature/view']);
    await waitUntilStable();

    // Verify injection token
    const viewComponent = fixture.debugElement.query(By.directive(Feature_View_Component)).componentInstance as Feature_View_Component;
    expect(viewComponent.injectedValue).withContext('(2)').toEqual('child-injector-value');
  });
});

/****************************************************************************************************
 * Definition of Test Artifacts                                                                     *
 ****************************************************************************************************/

const DI_TOKEN = new InjectionToken<string>('TOKEN');

@Injectable(/* DO NOT provide via 'providedIn' metadata as registered only in this test. */)
class FeatureService {
}

@Component({template: 'Injected value: {{injectedValue}}'})
class Feature_View_Component {

  public injectedValue = inject<string>(DI_TOKEN);
  public featureService = inject(FeatureService, {optional: true});
}

const featureRoutes: Routes = [
  {
    path: '',
    providers: [
      {provide: DI_TOKEN, useValue: 'child-injector-value'},
      FeatureService,
    ],
    children: [
      {path: 'view', component: Feature_View_Component},
    ],
  },
];
