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
import {WorkbenchLauncher} from './workbench-launcher.service';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {provideWorkbenchInitializer, WorkbenchStartupPhase} from './workbench-initializer';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';

describe('Workbench Startup', () => {

  it('should run PreStartup function in Angular zone', async () => {
    let insideZone: boolean | undefined;

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideWorkbenchInitializer(() => void (insideZone = NgZone.isInAngularZone()), {phase: WorkbenchStartupPhase.PreStartup}),
      ],
    });

    await TestBed.inject(WorkbenchLauncher).launch();
    expect(insideZone).toBeTrue();
  });

  it('should run Startup function in Angular zone', async () => {
    let insideZone: boolean | undefined;

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideWorkbenchInitializer(() => void (insideZone = NgZone.isInAngularZone()), {phase: WorkbenchStartupPhase.Startup}),
      ],
    });

    await TestBed.inject(WorkbenchLauncher).launch();
    expect(insideZone).toBeTrue();
  });

  it('should run PostStartup function in Angular zone', async () => {
    let insideZone: boolean | undefined;

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideWorkbenchInitializer(() => void (insideZone = NgZone.isInAngularZone()), {phase: WorkbenchStartupPhase.PostStartup}),
      ],
    });

    await TestBed.inject(WorkbenchLauncher).launch();
    expect(insideZone).toBeTrue();
  });
});
