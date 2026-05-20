/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {TestBed} from '@angular/core/testing';
import {NgZone} from '@angular/core';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer} from './microfrontend-platform-initializer';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {WorkbenchLauncher} from '../startup/workbench-launcher.service';

describe('Microfrontend Platform Initializer', () => {

  it('should run function in MicrofrontendPlatformStartupPhase.PreStartup phase in Angular zone', async () => {
    let insideZone: boolean | undefined;

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
        provideMicrofrontendPlatformInitializer(() => void (insideZone = NgZone.isInAngularZone()), {phase: MicrofrontendPlatformStartupPhase.PreStartup}),
      ],
    });

    await TestBed.inject(WorkbenchLauncher).launch();
    expect(insideZone).toBeTrue();
  });

  it('should run function in MicrofrontendPlatformStartupPhase.PostStartup phase in Angular zone', async () => {
    let insideZone: boolean | undefined;

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
        provideMicrofrontendPlatformInitializer(() => void (insideZone = NgZone.isInAngularZone()), {phase: MicrofrontendPlatformStartupPhase.PostStartup}),
      ],
    });

    await TestBed.inject(WorkbenchLauncher).launch();
    expect(insideZone).toBeTrue();
  });
});
