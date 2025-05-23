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
import {waitUntilWorkbenchStarted} from '../testing/testing.util';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {provideRouter} from '@angular/router';

describe('Microfrontend Platform Lifecycle', () => {

  it('should destroy SCION Microfrontend Platform when destroying the Angular platform', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
        provideRouter([]),
      ],
    });

    // Expect SCION Microfrontend Platform to be stopped.
    expect(MicrofrontendPlatform.state).toEqual(PlatformState.Stopped);

    // Start the workbench.
    await TestBed.inject(WorkbenchLauncher).launch();

    // Expect SCION Microfrontend Platform to be started.
    expect(MicrofrontendPlatform.state).toEqual(PlatformState.Started);

    // Delay test execution (destroy) until layout is initialized.
    await waitUntilWorkbenchStarted();

    // Destroy the current Angular platform.
    TestBed.inject(PlatformRef).destroy();
    TestBed.resetTestingModule();

    // Expect SCION Microfrontend Platform to be stopped.
    await MicrofrontendPlatform.whenState(PlatformState.Stopped);
    expect(MicrofrontendPlatform.state).toEqual(PlatformState.Stopped);
  });
});
