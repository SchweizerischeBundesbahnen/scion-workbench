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
import {Injectable, NgZone} from '@angular/core';
import {MICROFRONTEND_PLATFORM_POST_STARTUP, MICROFRONTEND_PLATFORM_PRE_STARTUP, WORKBENCH_POST_STARTUP, WORKBENCH_PRE_STARTUP, WORKBENCH_STARTUP, WorkbenchInitializer} from './workbench-initializer';
import {WorkbenchLauncher} from './workbench-launcher.service';
import {provideRouter} from '@angular/router';
import {provideWorkbenchForTest} from '../testing/workbench.provider';

describe('Workbench lifecycle hooks', () => {

  it('should run initializers registered under "WORKBENCH_PRE_STARTUP" DI token in the Angular zone', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([]),
        {provide: NgZoneCaptorWorkbenchInitializer, useClass: NgZoneCaptorWorkbenchInitializer},
        {provide: WORKBENCH_PRE_STARTUP, useExisting: NgZoneCaptorWorkbenchInitializer, multi: true},
      ],
    });

    // Start the workbench.
    await TestBed.inject(WorkbenchLauncher).launch();

    // Expect lifecycle hook to be invoked inside the Angular zone.
    expect(TestBed.inject(NgZoneCaptorWorkbenchInitializer).constructedInsideAngular).toBeTrue();
    expect(TestBed.inject(NgZoneCaptorWorkbenchInitializer).initializedInsideAngular).toBeTrue();
  });

  it('should run initializers registered under "WORKBENCH_STARTUP" DI token in the Angular zone', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([]),
        {provide: NgZoneCaptorWorkbenchInitializer, useClass: NgZoneCaptorWorkbenchInitializer},
        {provide: WORKBENCH_STARTUP, useExisting: NgZoneCaptorWorkbenchInitializer, multi: true},
      ],
    });

    // Start the workbench.
    await TestBed.inject(WorkbenchLauncher).launch();

    // Expect lifecycle hook to be invoked inside the Angular zone.
    expect(TestBed.inject(NgZoneCaptorWorkbenchInitializer).constructedInsideAngular).toBeTrue();
    expect(TestBed.inject(NgZoneCaptorWorkbenchInitializer).initializedInsideAngular).toBeTrue();
  });

  it('should run initializers registered under "WORKBENCH_POST_STARTUP" DI token in the Angular zone', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([]),
        {provide: NgZoneCaptorWorkbenchInitializer, useClass: NgZoneCaptorWorkbenchInitializer},
        {provide: WORKBENCH_POST_STARTUP, useExisting: NgZoneCaptorWorkbenchInitializer, multi: true},
      ],
    });

    // Start the workbench.
    await TestBed.inject(WorkbenchLauncher).launch();

    // Expect lifecycle hook to be invoked inside the Angular zone.
    expect(TestBed.inject(NgZoneCaptorWorkbenchInitializer).constructedInsideAngular).toBeTrue();
    expect(TestBed.inject(NgZoneCaptorWorkbenchInitializer).initializedInsideAngular).toBeTrue();
  });

  it('should run initializers registered under "MICROFRONTEND_PLATFORM_PRE_STARTUP" DI token in the Angular zone', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
        provideRouter([]),
        {provide: NgZoneCaptorWorkbenchInitializer, useClass: NgZoneCaptorWorkbenchInitializer},
        {provide: MICROFRONTEND_PLATFORM_PRE_STARTUP, useExisting: NgZoneCaptorWorkbenchInitializer, multi: true},
      ],
    });

    // Start the workbench.
    await TestBed.inject(WorkbenchLauncher).launch();

    // Expect lifecycle hook to be invoked inside the Angular zone.
    expect(TestBed.inject(NgZoneCaptorWorkbenchInitializer).constructedInsideAngular).toBeTrue();
    expect(TestBed.inject(NgZoneCaptorWorkbenchInitializer).initializedInsideAngular).toBeTrue();
  });

  it('should run initializers registered under "MICROFRONTEND_PLATFORM_POST_STARTUP" DI token in the Angular zone', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
        provideRouter([]),
        {provide: NgZoneCaptorWorkbenchInitializer, useClass: NgZoneCaptorWorkbenchInitializer},
        {provide: MICROFRONTEND_PLATFORM_POST_STARTUP, useExisting: NgZoneCaptorWorkbenchInitializer, multi: true},
      ],
    });

    // Start the workbench.
    await TestBed.inject(WorkbenchLauncher).launch();

    // Expect lifecycle hook to be invoked inside the Angular zone.
    expect(TestBed.inject(NgZoneCaptorWorkbenchInitializer).constructedInsideAngular).toBeTrue();
    expect(TestBed.inject(NgZoneCaptorWorkbenchInitializer).initializedInsideAngular).toBeTrue();
  });

  /**
   * Captures the zone in which this initializer was created and executed.
   */
  @Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as registered only in this test. */)
  class NgZoneCaptorWorkbenchInitializer implements WorkbenchInitializer {

    public constructedInsideAngular: boolean;
    public initializedInsideAngular: boolean | undefined;

    constructor() {
      this.constructedInsideAngular = NgZone.isInAngularZone();
    }

    public async init(): Promise<void> {
      this.initializedInsideAngular = NgZone.isInAngularZone();
    }
  }
});
