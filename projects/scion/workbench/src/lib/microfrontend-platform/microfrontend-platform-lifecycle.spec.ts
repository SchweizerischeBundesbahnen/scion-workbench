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
import {PlatformRef} from '@angular/core';
import {MicrofrontendPlatform, PlatformState} from '@scion/microfrontend-platform';
import {WorkbenchLauncher} from '../startup/workbench-launcher.service';
import {WorkbenchTestingModule} from '../spec/workbench-testing.module';

describe('Microfrontend Platform Lifecycle', () => {

  it('should destroy SCION Microfrontend Platform when destroying the Angular platform', async () => {
    // Configure Testbed to start SCION Workbench
    TestBed.configureTestingModule({
      imports: [WorkbenchTestingModule.forRoot({
        startup: {launcher: 'LAZY'},
        microfrontendPlatform: {
          applications: [],
        },
      })],
    });

    // Expect SCION Microfrontend Platform to be stopped.
    expect(MicrofrontendPlatform.state).toEqual(PlatformState.Stopped);

    // Start SCION Workbench.
    await TestBed.inject(WorkbenchLauncher).launch();

    // Expect SCION Microfrontend Platform to be started.
    expect(MicrofrontendPlatform.state).toEqual(PlatformState.Started);

    // Destroy the current Angular platform.
    TestBed.inject(PlatformRef).destroy();
    TestBed.resetTestingModule();

    // Expect SCION Microfrontend Platform to be stopped.
    await MicrofrontendPlatform.whenState(PlatformState.Stopped);
    expect(MicrofrontendPlatform.state).toEqual(PlatformState.Stopped);
  });
});
