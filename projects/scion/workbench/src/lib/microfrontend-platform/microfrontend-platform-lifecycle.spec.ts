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
import {WorkbenchTestingModule} from '../testing/workbench-testing.module';
import {RouterTestingModule} from '@angular/router/testing';
import {WorkbenchLauncher} from '../startup/workbench-launcher.service';
import {waitForInitialWorkbenchLayout} from '../testing/testing.util';

describe('Microfrontend Platform Lifecycle', () => {

  it('should destroy SCION Microfrontend Platform when destroying the Angular platform', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({
          microfrontendPlatform: {applications: []},
        }),
        RouterTestingModule.withRoutes([]),
      ],
    });

    // Expect SCION Microfrontend Platform to be stopped.
    expect(MicrofrontendPlatform.state).toEqual(PlatformState.Stopped);

    // Start the workbench.
    await TestBed.inject(WorkbenchLauncher).launch();

    // Expect SCION Microfrontend Platform to be started.
    expect(MicrofrontendPlatform.state).toEqual(PlatformState.Started);

    // Delay test execution (destroy) until layout is initialized.
    await waitForInitialWorkbenchLayout();

    // Destroy the current Angular platform.
    TestBed.inject(PlatformRef).destroy();
    TestBed.resetTestingModule();

    // Expect SCION Microfrontend Platform to be stopped.
    await MicrofrontendPlatform.whenState(PlatformState.Stopped);
    expect(MicrofrontendPlatform.state).toEqual(PlatformState.Stopped);
  });
});
