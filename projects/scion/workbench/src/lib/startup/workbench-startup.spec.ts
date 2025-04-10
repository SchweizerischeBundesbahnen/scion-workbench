/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {TestBed} from '@angular/core/testing';
import {ApplicationInitStatus, inject, Injector, NgZone, provideAppInitializer, signal} from '@angular/core';
import {WorkbenchLauncher} from './workbench-launcher.service';
import {provideWorkbench} from '../workbench.provider';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {provideWorkbenchInitializer, WORKBENCH_POST_STARTUP, WORKBENCH_PRE_STARTUP, WORKBENCH_STARTUP, WorkbenchInitializerFn, WorkbenchStartupPhase} from './workbench-initializer';
import {MICROFRONTEND_PLATFORM_POST_STARTUP, MICROFRONTEND_PLATFORM_PRE_STARTUP, MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer} from '../microfrontend-platform/microfrontend-platform-initializer.provider';
import {resolveWhen} from '../common/resolve-when.util';
import {styleFixture} from '../testing/testing.util';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {firstValueFrom, timer} from 'rxjs';
import {WorkbenchStartup} from './workbench-startup.service';
import {WorkbenchComponent} from '../workbench.component';
import {WorkbenchService} from '../workbench.service';
import createSpy = jasmine.createSpy;
import Spy = jasmine.Spy;

describe('Workbench Startup', () => {

  /**
   * Tests that activation of the initial perspective does not block application startup.
   */
  it('should not block application startup if starting workbench in APP_INITIALIZER', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbench({ // DO NOT use `provideWorkbenchForTest` to not trigger the initial navigation. By default, the initial navigation is performed after application initializers complete.
          startup: {
            launcher: 'APP_INITIALIZER',
          },
        }),
      ],
    });

    await expectAsync(TestBed.inject(ApplicationInitStatus).donePromise).toBeResolved();
  });

  /**
   * Tests that activation of the initial perspective does not block application startup.
   */
  it('should not block application startup if starting workbench manually in APP_INITIALIZER', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbench(), // DO NOT use `provideWorkbenchForTest` to not trigger the initial navigation. By default, the initial navigation is performed after application initializers complete.
        provideAppInitializer(() => inject(WorkbenchLauncher).launch()),
      ],
    });

    await expectAsync(TestBed.inject(ApplicationInitStatus).donePromise).toBeResolved();
  });

  it('should register workbench initializer in default phase "WORKBENCH_STARTUP"', async () => {
    const initialzerFn: WorkbenchInitializerFn = () => {
      // noop
    };

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchInitializer(initialzerFn),
      ],
    });

    expect(TestBed.inject(WORKBENCH_PRE_STARTUP, [])).withContext('WORKBENCH_PRE_STARTUP').not.toContain(initialzerFn);
    expect(TestBed.inject(WORKBENCH_STARTUP, [])).withContext('WORKBENCH_STARTUP').toContain(initialzerFn);
    expect(TestBed.inject(WORKBENCH_POST_STARTUP, [])).withContext('WORKBENCH_POST_STARTUP').not.toContain(initialzerFn);
  });

  it('should register workbench initializer in phase "WORKBENCH_PRE_STARTUP"', async () => {
    const initialzerFn: WorkbenchInitializerFn = () => {
      // noop
    };

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchInitializer(initialzerFn, {phase: WorkbenchStartupPhase.PreStartup}),
      ],
    });

    expect(TestBed.inject(WORKBENCH_PRE_STARTUP, [])).withContext('WORKBENCH_PRE_STARTUP').toContain(initialzerFn);
    expect(TestBed.inject(WORKBENCH_STARTUP, [])).withContext('WORKBENCH_STARTUP').not.toContain(initialzerFn);
    expect(TestBed.inject(WORKBENCH_POST_STARTUP, [])).withContext('WORKBENCH_POST_STARTUP').not.toContain(initialzerFn);
  });

  it('should register workbench initializer in phase "WORKBENCH_STARTUP"', async () => {
    const initialzerFn: WorkbenchInitializerFn = () => {
      // noop
    };

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchInitializer(initialzerFn, {phase: WorkbenchStartupPhase.Startup}),
      ],
    });

    expect(TestBed.inject(WORKBENCH_PRE_STARTUP, [])).withContext('WORKBENCH_PRE_STARTUP').not.toContain(initialzerFn);
    expect(TestBed.inject(WORKBENCH_STARTUP, [])).withContext('WORKBENCH_STARTUP').toContain(initialzerFn);
    expect(TestBed.inject(WORKBENCH_POST_STARTUP, [])).withContext('WORKBENCH_POST_STARTUP').not.toContain(initialzerFn);
  });

  it('should register workbench initializer in phase "WORKBENCH_POST_STARTUP"', async () => {
    const initialzerFn: WorkbenchInitializerFn = () => {
      // noop
    };

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchInitializer(initialzerFn, {phase: WorkbenchStartupPhase.PostStartup}),
      ],
    });

    expect(TestBed.inject(WORKBENCH_PRE_STARTUP, [])).withContext('WORKBENCH_PRE_STARTUP').not.toContain(initialzerFn);
    expect(TestBed.inject(WORKBENCH_STARTUP, [])).withContext('WORKBENCH_STARTUP').not.toContain(initialzerFn);
    expect(TestBed.inject(WORKBENCH_POST_STARTUP, [])).withContext('WORKBENCH_POST_STARTUP').toContain(initialzerFn);
  });

  it('should register microfrontend platform initializer in default phase "MICROFRONTEND_PLATFORM_POST_STARTUP"', async () => {
    const initialzerFn: WorkbenchInitializerFn = () => {
      // noop
    };

    TestBed.configureTestingModule({
      providers: [
        provideMicrofrontendPlatformInitializer(initialzerFn),
      ],
    });

    expect(TestBed.inject(MICROFRONTEND_PLATFORM_PRE_STARTUP, [])).withContext('MICROFRONTEND_PLATFORM_PRE_STARTUP').not.toContain(initialzerFn);
    expect(TestBed.inject(MICROFRONTEND_PLATFORM_POST_STARTUP, [])).withContext('MICROFRONTEND_PLATFORM_POST_STARTUP').toContain(initialzerFn);
  });

  it('should register microfrontend platform initializer in phase "MICROFRONTEND_PLATFORM_PRE_STARTUP"', async () => {
    const initialzerFn: WorkbenchInitializerFn = () => {
      // noop
    };

    TestBed.configureTestingModule({
      providers: [
        provideMicrofrontendPlatformInitializer(initialzerFn, {phase: MicrofrontendPlatformStartupPhase.PreStartup}),
      ],
    });

    expect(TestBed.inject(MICROFRONTEND_PLATFORM_PRE_STARTUP, [])).withContext('MICROFRONTEND_PLATFORM_PRE_STARTUP').toContain(initialzerFn);
    expect(TestBed.inject(MICROFRONTEND_PLATFORM_POST_STARTUP, [])).withContext('MICROFRONTEND_PLATFORM_POST_STARTUP').not.toContain(initialzerFn);
  });

  it('should register microfrontend platform initializer in phase "MICROFRONTEND_PLATFORM_POST_STARTUP"', async () => {
    const initialzerFn: WorkbenchInitializerFn = () => {
      // noop
    };

    TestBed.configureTestingModule({
      providers: [
        provideMicrofrontendPlatformInitializer(initialzerFn, {phase: MicrofrontendPlatformStartupPhase.PostStartup}),
      ],
    });

    expect(TestBed.inject(MICROFRONTEND_PLATFORM_PRE_STARTUP, [])).withContext('MICROFRONTEND_PLATFORM_PRE_STARTUP').not.toContain(initialzerFn);
    expect(TestBed.inject(MICROFRONTEND_PLATFORM_POST_STARTUP, [])).withContext('MICROFRONTEND_PLATFORM_POST_STARTUP').toContain(initialzerFn);
  });

  it('should run initializers in following order: WORKBENCH_PRE_STARTUP > WORKBENCH_STARTUP > WORKBENCH_POST_STARTUP', async () => {
    // Create initializer function spys.
    const workbenchPreStartupFn1 = createInitializerSpyFn({debugName: 'workbenchPreStartupFn1'});
    const workbenchPreStartupFn2 = createInitializerSpyFn({debugName: 'workbenchPreStartupFn2'});

    const workbenchStartupFn1 = createInitializerSpyFn({debugName: 'workbenchStartupFn1'});
    const workbenchStartupFn2 = createInitializerSpyFn({debugName: 'workbenchStartupFn2'});

    const workbenchPostStartupFn1 = createInitializerSpyFn({debugName: 'workbenchPostStartupFn1'});
    const workbenchPostStartupFn2 = createInitializerSpyFn({debugName: 'workbenchPostStartupFn2'});

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideWorkbenchInitializer(workbenchPreStartupFn1, {phase: WorkbenchStartupPhase.PreStartup}),
        provideWorkbenchInitializer(workbenchStartupFn1, {phase: WorkbenchStartupPhase.Startup}),
        provideWorkbenchInitializer(workbenchPostStartupFn1, {phase: WorkbenchStartupPhase.PostStartup}),

        provideWorkbenchInitializer(workbenchPreStartupFn2, {phase: WorkbenchStartupPhase.PreStartup}),
        provideWorkbenchInitializer(workbenchStartupFn2, {phase: WorkbenchStartupPhase.Startup}),
        provideWorkbenchInitializer(workbenchPostStartupFn2, {phase: WorkbenchStartupPhase.PostStartup}),
      ],
    });

    // Start the workbench.
    const startup = TestBed.inject(WorkbenchLauncher).launch();
    await expectAsync(startup).toBePending();

    // Expect WORKBENCH_PRE_STARTUP functions to have been called in parallel.
    expect(workbenchPreStartupFn1).toHaveBeenCalledOnceWith();
    expect(workbenchPreStartupFn2).toHaveBeenCalledOnceWith();

    // Expect subsequent startup functions not to have been called.
    expect(workbenchStartupFn1).toHaveBeenCalledTimes(0);
    expect(workbenchStartupFn2).toHaveBeenCalledTimes(0);
    expect(workbenchPostStartupFn1).toHaveBeenCalledTimes(0);
    expect(workbenchPostStartupFn2).toHaveBeenCalledTimes(0);

    // Resolve WORKBENCH_PRE_STARTUP functions.
    workbenchPreStartupFn1.resolve();
    workbenchPreStartupFn2.resolve();

    // Expect startup to still be pending.
    await expectAsync(startup).toBePending();

    // Expect WORKBENCH_STARTUP functions to have been called in parallel.
    expect(workbenchStartupFn1).toHaveBeenCalledOnceWith();
    expect(workbenchStartupFn2).toHaveBeenCalledOnceWith();

    // Expect subsequent startup functions not to have been called.
    expect(workbenchPostStartupFn1).toHaveBeenCalledTimes(0);
    expect(workbenchPostStartupFn2).toHaveBeenCalledTimes(0);

    // Resolve WORKBENCH_STARTUP functions.
    workbenchStartupFn1.resolve();
    workbenchStartupFn2.resolve();

    // Expect startup to still be pending.
    await expectAsync(startup).toBePending();

    // Expect WORKBENCH_POST_STARTUP functions to have been called in parallel.
    expect(workbenchPostStartupFn1).toHaveBeenCalledOnceWith();
    expect(workbenchPostStartupFn2).toHaveBeenCalledOnceWith();

    // Resolve WORKBENCH_POST_STARTUP functions.
    workbenchPostStartupFn2.resolve();
    workbenchPostStartupFn1.resolve();

    // Expect startup to still be resolved.
    await expectAsync(startup).toBeResolved();
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

    expect(microfrontendPlatformPreStartupFn).toHaveBeenCalledTimes(0);
    expect(microfrontendPlatformPostStartupFn).toHaveBeenCalledTimes(0);
  });

  it('should not run microfrontend initializers if microfrontend support is enabled', async () => {
    // Create initializer function spys.
    const microfrontendPlatformPreStartupFn = createInitializerSpyFn({debugName: 'microfrontendPlatformPreStartupFn'});
    microfrontendPlatformPreStartupFn.resolve();

    const microfrontendPlatformPostStartupFn = createInitializerSpyFn({debugName: 'microfrontendPlatformPostStartupFn'});
    microfrontendPlatformPostStartupFn.resolve();

    // Configure the workbench without microfrontend support.
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
        provideMicrofrontendPlatformInitializer(microfrontendPlatformPostStartupFn, {phase: MicrofrontendPlatformStartupPhase.PostStartup}),
        provideMicrofrontendPlatformInitializer(microfrontendPlatformPreStartupFn, {phase: MicrofrontendPlatformStartupPhase.PreStartup}),
      ],
    });

    // Start the workbench.
    await TestBed.inject(WorkbenchLauncher).launch();

    expect(microfrontendPlatformPreStartupFn).toHaveBeenCalledTimes(1);
    expect(microfrontendPlatformPostStartupFn).toHaveBeenCalledTimes(1);
    expect(microfrontendPlatformPreStartupFn).toHaveBeenCalledBefore(microfrontendPlatformPostStartupFn);
  });

  it('should run "WORKBENCH_PRE_STARTUP" function in injection context', async () => {
    let injector: Injector | undefined;

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideWorkbenchInitializer(() => void (injector = inject(Injector)), {phase: WorkbenchStartupPhase.PreStartup}),
      ],
    });

    await TestBed.inject(WorkbenchLauncher).launch();
    expect(injector).toBeDefined();
  });

  it('should run "WORKBENCH_STARTUP" function in injection context', async () => {
    let injector: Injector | undefined;

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideWorkbenchInitializer(() => void (injector = inject(Injector)), {phase: WorkbenchStartupPhase.Startup}),
      ],
    });

    await TestBed.inject(WorkbenchLauncher).launch();
    expect(injector).toBeDefined();
  });

  it('should run "WORKBENCH_POST_STARTUP" function in injection context', async () => {
    let injector: Injector | undefined;

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideWorkbenchInitializer(() => void (injector = inject(Injector)), {phase: WorkbenchStartupPhase.PostStartup}),
      ],
    });

    await TestBed.inject(WorkbenchLauncher).launch();
    expect(injector).toBeDefined();
  });

  it('should run "MICROFRONTEND_PLATFORM_PRE_STARTUP" function in injection context', async () => {
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

  it('should run "MICROFRONTEND_PLATFORM_POST_STARTUP" function in injection context', async () => {
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

  it('should run "WORKBENCH_PRE_STARTUP" function in Angular zone', async () => {
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

  it('should run "WORKBENCH_STARTUP" function in Angular zone', async () => {
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

  it('should run "WORKBENCH_POST_STARTUP" function in Angular zone', async () => {
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

  it('should run "MICROFRONTEND_PLATFORM_PRE_STARTUP" function in Angular zone', async () => {
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

  it('should run "MICROFRONTEND_PLATFORM_POST_STARTUP" function in Angular zone', async () => {
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

  it('should block startup until activated the initial perspective', async () => {
    const onActivatePerspectiveEnter = signal(false);
    const onActivatePerspectiveDone = signal(false);
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: {
            perspectives: [
              {
                id: 'initial-perspective',
                layout: async factory => {
                  onActivatePerspectiveEnter.set(true);
                  await resolveWhen(onActivatePerspectiveDone);
                  return factory.addPart('part.main');
                },
              },
            ],
          },
        }),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchComponent));

    // Wait until entering perspective activation.
    await resolveWhen(onActivatePerspectiveEnter, {injector: TestBed.inject(Injector)});

    // Expect startup still pending.
    expect(TestBed.inject(WorkbenchStartup).done()).toBeFalse();

    // Simulate slow perspective activation.
    await firstValueFrom(timer(500));

    // Expect startup still pending.
    expect(TestBed.inject(WorkbenchStartup).done()).toBeFalse();

    // Continue perspective activation.
    onActivatePerspectiveDone.set(true);

    // Expect startup to have completed.
    await expectAsync(TestBed.inject(WorkbenchStartup).whenDone).toBeResolved();

    // Expect perspective to be active.
    expect(TestBed.inject(WorkbenchService).activePerspective()!.id).toEqual('initial-perspective');
  });

  // TODO [Angular 21] Remove tests (Legacy Workbench Provider Registration)
  describe('Legacy Workbench Provider Registration', () => {

    it('should run initializers in following order: WORKBENCH_PRE_STARTUP > WORKBENCH_STARTUP > WORKBENCH_POST_STARTUP', async () => {
      // Create initializer function spys.
      const workbenchPreStartupFn1 = createInitializerSpyFn({debugName: 'workbenchPreStartupFn1'});
      const workbenchPreStartupFn2 = createInitializerSpyFn({debugName: 'workbenchPreStartupFn2'});

      const workbenchStartupFn1 = createInitializerSpyFn({debugName: 'workbenchStartupFn1'});
      const workbenchStartupFn2 = createInitializerSpyFn({debugName: 'workbenchStartupFn2'});

      const workbenchPostStartupFn1 = createInitializerSpyFn({debugName: 'workbenchPostStartupFn1'});
      const workbenchPostStartupFn2 = createInitializerSpyFn({debugName: 'workbenchPostStartupFn2'});

      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest(),
          {provide: WORKBENCH_PRE_STARTUP, useValue: workbenchPreStartupFn1, multi: true},
          {provide: WORKBENCH_STARTUP, useValue: workbenchStartupFn1, multi: true},
          {provide: WORKBENCH_POST_STARTUP, useValue: workbenchPostStartupFn1, multi: true},

          {provide: WORKBENCH_PRE_STARTUP, useValue: workbenchPreStartupFn2, multi: true},
          {provide: WORKBENCH_STARTUP, useValue: workbenchStartupFn2, multi: true},
          {provide: WORKBENCH_POST_STARTUP, useValue: workbenchPostStartupFn2, multi: true},
        ],
      });

      // Start the workbench.
      const startup = TestBed.inject(WorkbenchLauncher).launch();
      await expectAsync(startup).toBePending();

      // Expect WORKBENCH_PRE_STARTUP functions to have been called in parallel.
      expect(workbenchPreStartupFn1).toHaveBeenCalledOnceWith();
      expect(workbenchPreStartupFn2).toHaveBeenCalledOnceWith();

      // Expect subsequent startup functions not to have been called.
      expect(workbenchStartupFn1).toHaveBeenCalledTimes(0);
      expect(workbenchStartupFn2).toHaveBeenCalledTimes(0);
      expect(workbenchPostStartupFn1).toHaveBeenCalledTimes(0);
      expect(workbenchPostStartupFn2).toHaveBeenCalledTimes(0);

      // Resolve WORKBENCH_PRE_STARTUP functions.
      workbenchPreStartupFn1.resolve();
      workbenchPreStartupFn2.resolve();

      // Expect startup to still be pending.
      await expectAsync(startup).toBePending();

      // Expect WORKBENCH_STARTUP functions to have been called in parallel.
      expect(workbenchStartupFn1).toHaveBeenCalledOnceWith();
      expect(workbenchStartupFn2).toHaveBeenCalledOnceWith();

      // Expect subsequent startup functions not to have been called.
      expect(workbenchPostStartupFn1).toHaveBeenCalledTimes(0);
      expect(workbenchPostStartupFn2).toHaveBeenCalledTimes(0);

      // Resolve WORKBENCH_STARTUP functions.
      workbenchStartupFn1.resolve();
      workbenchStartupFn2.resolve();

      // Expect startup to still be pending.
      await expectAsync(startup).toBePending();

      // Expect WORKBENCH_POST_STARTUP functions to have been called in parallel.
      expect(workbenchPostStartupFn1).toHaveBeenCalledOnceWith();
      expect(workbenchPostStartupFn2).toHaveBeenCalledOnceWith();

      // Resolve WORKBENCH_POST_STARTUP functions.
      workbenchPostStartupFn2.resolve();
      workbenchPostStartupFn1.resolve();

      // Expect startup to still be resolved.
      await expectAsync(startup).toBeResolved();
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
          {provide: MICROFRONTEND_PLATFORM_PRE_STARTUP, useValue: microfrontendPlatformPreStartupFn, multi: true},
          {provide: MICROFRONTEND_PLATFORM_POST_STARTUP, useValue: microfrontendPlatformPostStartupFn, multi: true},
        ],
      });

      // Start the workbench.
      await TestBed.inject(WorkbenchLauncher).launch();

      expect(microfrontendPlatformPreStartupFn).toHaveBeenCalledTimes(0);
      expect(microfrontendPlatformPostStartupFn).toHaveBeenCalledTimes(0);
    });

    it('should run "WORKBENCH_PRE_STARTUP" function in injection context', async () => {
      let injector: Injector | undefined;

      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest(),
          {provide: WORKBENCH_PRE_STARTUP, useValue: () => injector = inject(Injector), multi: true},
        ],
      });

      await TestBed.inject(WorkbenchLauncher).launch();
      expect(injector).toBeDefined();
    });

    it('should run "WORKBENCH_STARTUP" function in injection context', async () => {
      let injector: Injector | undefined;

      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest(),
          {provide: WORKBENCH_STARTUP, useValue: () => injector = inject(Injector), multi: true},
        ],
      });

      await TestBed.inject(WorkbenchLauncher).launch();
      expect(injector).toBeDefined();
    });

    it('should run "WORKBENCH_POST_STARTUP" function in injection context', async () => {
      let injector: Injector | undefined;

      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest(),
          {provide: WORKBENCH_POST_STARTUP, useValue: () => injector = inject(Injector), multi: true},
        ],
      });

      await TestBed.inject(WorkbenchLauncher).launch();
      expect(injector).toBeDefined();
    });

    it('should run "MICROFRONTEND_PLATFORM_PRE_STARTUP" function in injection context', async () => {
      let injector: Injector | undefined;

      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
          {provide: MICROFRONTEND_PLATFORM_PRE_STARTUP, useValue: () => injector = inject(Injector), multi: true},
        ],
      });

      await TestBed.inject(WorkbenchLauncher).launch();
      expect(injector).toBeDefined();
    });

    it('should run "MICROFRONTEND_PLATFORM_POST_STARTUP" function in injection context', async () => {
      let injector: Injector | undefined;

      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
          {provide: MICROFRONTEND_PLATFORM_POST_STARTUP, useValue: () => injector = inject(Injector), multi: true},
        ],
      });

      await TestBed.inject(WorkbenchLauncher).launch();
      expect(injector).toBeDefined();
    });

    it('should run "WORKBENCH_PRE_STARTUP" function in Angular zone', async () => {
      let insideZone: boolean | undefined;

      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest(),
          {provide: WORKBENCH_PRE_STARTUP, useValue: () => insideZone = NgZone.isInAngularZone(), multi: true},
        ],
      });

      await TestBed.inject(WorkbenchLauncher).launch();
      expect(insideZone).toBeTrue();
    });

    it('should run "WORKBENCH_STARTUP" function in Angular zone', async () => {
      let insideZone: boolean | undefined;

      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest(),
          {provide: WORKBENCH_STARTUP, useValue: () => insideZone = NgZone.isInAngularZone(), multi: true},
        ],
      });

      await TestBed.inject(WorkbenchLauncher).launch();
      expect(insideZone).toBeTrue();
    });

    it('should run "WORKBENCH_POST_STARTUP" function in Angular zone', async () => {
      let insideZone: boolean | undefined;

      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest(),
          {provide: WORKBENCH_POST_STARTUP, useValue: () => insideZone = NgZone.isInAngularZone(), multi: true},
        ],
      });

      await TestBed.inject(WorkbenchLauncher).launch();
      expect(insideZone).toBeTrue();
    });

    it('should run "MICROFRONTEND_PLATFORM_PRE_STARTUP" function in Angular zone', async () => {
      let insideZone: boolean | undefined;

      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
          {provide: MICROFRONTEND_PLATFORM_PRE_STARTUP, useValue: () => insideZone = NgZone.isInAngularZone(), multi: true},
        ],
      });

      await TestBed.inject(WorkbenchLauncher).launch();
      expect(insideZone).toBeTrue();
    });

    it('should run "MICROFRONTEND_PLATFORM_POST_STARTUP" function in Angular zone', async () => {
      let insideZone: boolean | undefined;

      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
          {provide: MICROFRONTEND_PLATFORM_POST_STARTUP, useValue: () => insideZone = NgZone.isInAngularZone(), multi: true},
        ],
      });

      await TestBed.inject(WorkbenchLauncher).launch();
      expect(insideZone).toBeTrue();
    });
  });
});

/**
 * Creates a blocking {@link WorkbenchInitializerFn} spy that can be resolved.
 */
function createInitializerSpyFn(config: {debugName: string}): Spy<WorkbenchInitializerFn> & {resolve: () => void} {
  let resolveFn!: () => void;
  const promise = new Promise<void>(resolve => resolveFn = resolve);
  const spyFn = createSpy(config.debugName).and.callFake(() => promise) as Spy<WorkbenchInitializerFn> & {resolve: () => void};
  spyFn.resolve = resolveFn;
  return spyFn;
}
