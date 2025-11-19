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
import {ApplicationInitStatus, Component, inject, Injector, NgZone, provideAppInitializer, signal} from '@angular/core';
import {WorkbenchLauncher} from './workbench-launcher.service';
import {provideWorkbench} from '../workbench.provider';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {provideWorkbenchInitializer, WorkbenchInitializerFn, WorkbenchStartupPhase} from './workbench-initializer';
import {resolveWhen} from '../common/resolve-when.util';
import {styleFixture} from '../testing/testing.util';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {firstValueFrom, timer} from 'rxjs';
import {WorkbenchStartup} from './workbench-startup.service';
import {WorkbenchComponent} from '../workbench.component';
import {WorkbenchService} from '../workbench.service';
import {By} from '@angular/platform-browser';
import {MAIN_AREA} from '../layout/workbench-layout';
import {WorkbenchDesktopDirective} from '../desktop/desktop.directive';
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

  it('should run initializers in following order: PreStartup > Startup > PostStartup', async () => {
    // Create initializer function spys.
    const workbenchPreStartupFn1 = createInitializerSpyFn({debugName: 'workbenchPreStartupFn1'});
    const workbenchPreStartupFn2 = createInitializerSpyFn({debugName: 'workbenchPreStartupFn2'});

    const workbenchStartupFn1a = createInitializerSpyFn({debugName: 'workbenchStartupFn1a'});
    const workbenchStartupFn1b = createInitializerSpyFn({debugName: 'workbenchStartupFn1b'});
    const workbenchStartupFn2a = createInitializerSpyFn({debugName: 'workbenchStartupFn2a'});
    const workbenchStartupFn2b = createInitializerSpyFn({debugName: 'workbenchStartupFn2b'});

    const workbenchPostStartupFn1 = createInitializerSpyFn({debugName: 'workbenchPostStartupFn1'});
    const workbenchPostStartupFn2 = createInitializerSpyFn({debugName: 'workbenchPostStartupFn2'});

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideWorkbenchInitializer(workbenchPreStartupFn1, {phase: WorkbenchStartupPhase.PreStartup}),
        provideWorkbenchInitializer(workbenchStartupFn1a, {phase: WorkbenchStartupPhase.Startup}),
        provideWorkbenchInitializer(workbenchPostStartupFn1, {phase: WorkbenchStartupPhase.PostStartup}),
        provideWorkbenchInitializer(workbenchStartupFn1b),

        provideWorkbenchInitializer(workbenchPostStartupFn2, {phase: WorkbenchStartupPhase.PostStartup}),
        provideWorkbenchInitializer(workbenchPreStartupFn2, {phase: WorkbenchStartupPhase.PreStartup}),
        provideWorkbenchInitializer(workbenchStartupFn2a, {phase: WorkbenchStartupPhase.Startup}),
        provideWorkbenchInitializer(workbenchStartupFn2b),
      ],
    });

    // Start the workbench.
    const startup = TestBed.inject(WorkbenchLauncher).launch();
    await expectAsync(startup).toBePending();

    // Expect PreStartup functions to have been called in parallel.
    expect(workbenchPreStartupFn1).toHaveBeenCalledTimes(1);
    expect(workbenchPreStartupFn2).toHaveBeenCalledTimes(1);

    // Expect subsequent startup functions not to have been called.
    expect(workbenchStartupFn1a).not.toHaveBeenCalled();
    expect(workbenchStartupFn1b).not.toHaveBeenCalled();
    expect(workbenchStartupFn2a).not.toHaveBeenCalled();
    expect(workbenchStartupFn2b).not.toHaveBeenCalled();
    expect(workbenchPostStartupFn1).not.toHaveBeenCalled();
    expect(workbenchPostStartupFn2).not.toHaveBeenCalled();

    // Resolve PreStartup functions.
    workbenchPreStartupFn1.resolve();
    workbenchPreStartupFn2.resolve();

    // Expect startup to still be pending.
    await expectAsync(startup).toBePending();

    // Expect Startup functions to have been called in parallel.
    expect(workbenchStartupFn1a).toHaveBeenCalledTimes(1);
    expect(workbenchStartupFn1b).toHaveBeenCalledTimes(1);
    expect(workbenchStartupFn2a).toHaveBeenCalledTimes(1);
    expect(workbenchStartupFn2b).toHaveBeenCalledTimes(1);

    // Expect subsequent startup functions not to have been called.
    expect(workbenchPostStartupFn1).not.toHaveBeenCalled();
    expect(workbenchPostStartupFn2).not.toHaveBeenCalled();

    // Resolve Startup functions.
    workbenchStartupFn1a.resolve();
    workbenchStartupFn1b.resolve();
    workbenchStartupFn2a.resolve();
    workbenchStartupFn2b.resolve();

    // Expect startup to still be pending.
    await expectAsync(startup).toBePending();

    // Expect PostStartup functions to have been called in parallel.
    expect(workbenchPostStartupFn1).toHaveBeenCalledTimes(1);
    expect(workbenchPostStartupFn2).toHaveBeenCalledTimes(1);

    // Resolve PostStartup functions.
    workbenchPostStartupFn2.resolve();
    workbenchPostStartupFn1.resolve();

    // Expect startup to be resolved.
    await expectAsync(startup).toBeResolved();
  });

  it('should run PreStartup function in injection context', async () => {
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

  it('should run Startup function in injection context', async () => {
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

  it('should run PostStartup function in injection context', async () => {
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

  it('should not block startup if initial perspective errors', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart(MAIN_AREA)
            .addPart('part.other-part', {relativeTo: 'part.does-not-exist', align: 'left'}),
        }),
      ],
    });

    @Component({
      selector: 'spec-root',
      template: `
        <wb-workbench>
          <ng-template wbDesktop>
            Desktop
          </ng-template>
        </wb-workbench>
      `,
      imports: [WorkbenchComponent, WorkbenchDesktopDirective],
    })
    class SpecRootComponent {
    }

    // Spy console.
    const errors = new Array<any>();
    spyOn(console, 'error').and.callThrough().and.callFake((args: unknown[]) => errors.push(args));

    // Start workbench.
    const fixture = styleFixture(TestBed.createComponent(SpecRootComponent));

    // Expect startup to have completed.
    await expectAsync(TestBed.inject(WorkbenchStartup).whenDone).toBeResolved();

    // Expect no perspective to be active.
    expect(TestBed.inject(WorkbenchService).activePerspective()).toBeUndefined();

    // Expect splash not to display.
    expect(fixture.debugElement.query(By.css('wb-workbench wb-splash'))).toBeNull();

    // Expect desktop to display.
    expect(fixture.debugElement.query(By.css('wb-workbench wb-desktop-slot')).nativeElement.innerText).toEqual('Desktop');

    // Expect error to be logged.
    expect(errors).toContain(jasmine.stringMatching('Failed to load workbench perspective. Caused by:'));
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
