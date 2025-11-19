/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {TestBed} from '@angular/core/testing';
import {inject, Injector, NgZone} from '@angular/core';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {MicrofrontendPlatformInitializerFn, MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer} from './microfrontend-platform-initializer';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {WorkbenchLauncher} from '../startup/workbench-launcher.service';
import {firstValueFrom, timer} from 'rxjs';
import {provideWorkbenchInitializer, WorkbenchStartupPhase} from '../startup/workbench-initializer';
import createSpy = jasmine.createSpy;
import Spy = jasmine.Spy;

describe('Microfrontend Platform Initializer', () => {

  it('should run microfrontend initializers if microfrontend support is enabled', async () => {
    // Create initializer function spys.
    const microfrontendPlatformPreStartupFn = createInitializerSpyFn({debugName: 'microfrontendPlatformPreStartupFn'});
    microfrontendPlatformPreStartupFn.resolve();

    const microfrontendPlatformPostStartupFn1 = createInitializerSpyFn({debugName: 'microfrontendPlatformPostStartupFn1'});
    microfrontendPlatformPostStartupFn1.resolve();

    const microfrontendPlatformPostStartupFn2 = createInitializerSpyFn({debugName: 'microfrontendPlatformPostStartupFn2'});
    microfrontendPlatformPostStartupFn2.resolve();

    // Configure the workbench with microfrontend support.
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
        provideMicrofrontendPlatformInitializer(microfrontendPlatformPostStartupFn1, {phase: MicrofrontendPlatformStartupPhase.PostStartup}),
        provideMicrofrontendPlatformInitializer(microfrontendPlatformPreStartupFn, {phase: MicrofrontendPlatformStartupPhase.PreStartup}),
        provideMicrofrontendPlatformInitializer(microfrontendPlatformPostStartupFn2),
      ],
    });

    // Start the workbench.
    await TestBed.inject(WorkbenchLauncher).launch();

    expect(microfrontendPlatformPreStartupFn).toHaveBeenCalledTimes(1);
    expect(microfrontendPlatformPostStartupFn1).toHaveBeenCalledTimes(1);
    expect(microfrontendPlatformPostStartupFn2).toHaveBeenCalledTimes(1);
    expect(microfrontendPlatformPreStartupFn).toHaveBeenCalledBefore(microfrontendPlatformPostStartupFn1);
    expect(microfrontendPlatformPreStartupFn).toHaveBeenCalledBefore(microfrontendPlatformPostStartupFn2);
  });

  it('should run microfrontend initializers during workbench startup phase', async () => {
    // Create initializer function spys.
    const workbenchPreStartupFn = createInitializerSpyFn({debugName: 'workbenchPreStartupFn'});
    const workbenchPostStartupFn = createInitializerSpyFn({debugName: 'workbenchPostStartupFn'});
    const microfrontendPlatformPreStartupFn = createInitializerSpyFn({debugName: 'microfrontendPlatformPreStartupFn'});
    const microfrontendPlatformPostStartupFn = createInitializerSpyFn({debugName: 'microfrontendPlatformPostStartupFn'});

    // Configure the workbench with initializers.
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
        provideMicrofrontendPlatformInitializer(microfrontendPlatformPreStartupFn, {phase: MicrofrontendPlatformStartupPhase.PreStartup}),
        provideMicrofrontendPlatformInitializer(microfrontendPlatformPostStartupFn, {phase: MicrofrontendPlatformStartupPhase.PostStartup}),
        provideWorkbenchInitializer(workbenchPreStartupFn, {phase: WorkbenchStartupPhase.PreStartup}),
        provideWorkbenchInitializer(workbenchPostStartupFn, {phase: WorkbenchStartupPhase.PostStartup}),
      ],
    });

    // Start the workbench.
    const startup = TestBed.inject(WorkbenchLauncher).launch();
    await expectAsync(startup).toBePending();

    // Expect Workbench PreStartup function to have been called.
    expect(workbenchPreStartupFn).toHaveBeenCalledTimes(1);
    expect(workbenchPostStartupFn).not.toHaveBeenCalled();
    expect(microfrontendPlatformPostStartupFn).not.toHaveBeenCalled();
    expect(microfrontendPlatformPreStartupFn).not.toHaveBeenCalled();

    // Resolve Workbench PreStartup function.
    workbenchPreStartupFn.resolve();
    await firstValueFrom(timer(100));

    // Expect startup to still be pending.
    await expectAsync(startup).toBePending();

    // Expect Microfrontend PreStartup function to have been called.
    expect(microfrontendPlatformPreStartupFn).toHaveBeenCalledTimes(1);
    expect(microfrontendPlatformPostStartupFn).not.toHaveBeenCalled();
    expect(workbenchPostStartupFn).not.toHaveBeenCalled();

    // Resolve Microfrontend PreStartup function.
    microfrontendPlatformPreStartupFn.resolve();
    await firstValueFrom(timer(100));

    // Expect startup to still be pending.
    await expectAsync(startup).toBePending();

    // Expect Microfrontend PostStartup function to have been called.
    expect(microfrontendPlatformPostStartupFn).toHaveBeenCalledTimes(1);
    expect(workbenchPostStartupFn).not.toHaveBeenCalled();

    // Resolve Microfrontend PostStartup function.
    microfrontendPlatformPostStartupFn.resolve();
    await firstValueFrom(timer(100));

    // Expect startup to still be pending.
    await expectAsync(startup).toBePending();

    // Expect Workbench PostStartup function to have been called.
    expect(workbenchPostStartupFn).toHaveBeenCalledTimes(1);

    // Resolve Workbench PostStartup function.
    workbenchPostStartupFn.resolve();

    // Expect startup to be resolved.
    await expectAsync(startup).toBeResolved();

    // Expect invocation order.
    expect(microfrontendPlatformPreStartupFn).toHaveBeenCalledTimes(1);
    expect(microfrontendPlatformPostStartupFn).toHaveBeenCalledTimes(1);
    expect(workbenchPreStartupFn).toHaveBeenCalledTimes(1);
    expect(workbenchPostStartupFn).toHaveBeenCalledTimes(1);

    expect(workbenchPreStartupFn).toHaveBeenCalledBefore(microfrontendPlatformPreStartupFn);
    expect(microfrontendPlatformPreStartupFn).toHaveBeenCalledBefore(microfrontendPlatformPostStartupFn);
    expect(microfrontendPlatformPostStartupFn).toHaveBeenCalledBefore(workbenchPostStartupFn);
  });

  it('should not run microfrontend initializers if microfrontend support is disabled', async () => {
    // Create initializer function spys.
    const microfrontendPlatformPreStartupFn = createInitializerSpyFn({debugName: 'microfrontendPlatformPreStartupFn'});
    microfrontendPlatformPreStartupFn.resolve();

    const microfrontendPlatformPostStartupFn = createInitializerSpyFn({debugName: 'microfrontendPlatformPostStartupFn'});
    microfrontendPlatformPostStartupFn.resolve();

    // Configure the workbench without microfrontend support.
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideMicrofrontendPlatformInitializer(microfrontendPlatformPreStartupFn, {phase: MicrofrontendPlatformStartupPhase.PreStartup}),
        provideMicrofrontendPlatformInitializer(microfrontendPlatformPostStartupFn, {phase: MicrofrontendPlatformStartupPhase.PostStartup}),
      ],
    });

    // Start the workbench.
    await TestBed.inject(WorkbenchLauncher).launch();

    expect(microfrontendPlatformPreStartupFn).not.toHaveBeenCalled();
    expect(microfrontendPlatformPostStartupFn).not.toHaveBeenCalled();
  });

  it('should run function in MicrofrontendPlatformStartupPhase.PreStartup phase in injection context', async () => {
    let injector: Injector | undefined;

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
        provideMicrofrontendPlatformInitializer(() => void (injector = inject(Injector)), {phase: MicrofrontendPlatformStartupPhase.PreStartup}),
      ],
    });

    await TestBed.inject(WorkbenchLauncher).launch();
    expect(injector).toBeDefined();
  });

  it('should run function in MicrofrontendPlatformStartupPhase.PostStartup phase in injection context', async () => {
    let injector: Injector | undefined;

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
        provideMicrofrontendPlatformInitializer(() => void (injector = inject(Injector)), {phase: MicrofrontendPlatformStartupPhase.PostStartup}),
      ],
    });

    await TestBed.inject(WorkbenchLauncher).launch();
    expect(injector).toBeDefined();
  });

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

/**
 * Creates a blocking {@link MicrofrontendPlatformInitializerFn} spy that can be resolved.
 */
function createInitializerSpyFn(config: {debugName: string}): Spy<MicrofrontendPlatformInitializerFn> & {resolve: () => void} {
  let resolveFn!: () => void;
  const promise = new Promise<void>(resolve => resolveFn = resolve);
  const spyFn = createSpy(config.debugName).and.callFake(() => promise) as Spy<MicrofrontendPlatformInitializerFn> & {resolve: () => void};
  spyFn.resolve = resolveFn;
  return spyFn;
}
