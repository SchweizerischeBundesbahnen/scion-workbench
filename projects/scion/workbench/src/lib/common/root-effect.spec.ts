/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ComponentRef, createComponent, createEnvironmentInjector, EnvironmentInjector, runInInjectionContext, signal, ViewContainerRef} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {rootEffect} from './root-effect';

describe('RootEffect', () => {

  it('should execute when tracked signal change', async () => {
    const effectCaptor = new Array<string>();
    const testSignal = signal(0);

    const {fixture} = createDynamicTestComponent(() => {
      rootEffect(() => void effectCaptor.push(`effect [signal=${testSignal()}]`));
    });

    // Expect initial effect execution.
    await fixture.whenStable();
    expect(effectCaptor).toEqual([
      'effect [signal=0]',
    ]);

    // Change tracked signal.
    testSignal.set(1);

    // Expect effect to be executed.
    await fixture.whenStable();
    expect(effectCaptor).toEqual([
      'effect [signal=0]',
      'effect [signal=1]',
    ]);
  });

  it('should execute when tracked signal change even if detached from change detection tree', async () => {
    const effectCaptor = new Array<string>();
    const testSignal = signal(0);

    const {fixture, component} = createDynamicTestComponent(() => {
      rootEffect(() => void effectCaptor.push(`effect [signal=${testSignal()}]`));
    });

    // Expect initial effect execution.
    await fixture.whenStable();
    expect(effectCaptor).toEqual([
      'effect [signal=0]',
    ]);

    // Change tracked signal.
    testSignal.set(1);

    // Expect effect to be executed.
    await fixture.whenStable();
    expect(effectCaptor).toEqual([
      'effect [signal=0]',
      'effect [signal=1]',
    ]);

    // Detach the component from the component tree.
    component.changeDetectorRef.detach();

    // Change tracked signal.
    testSignal.set(2);

    // Expect effect to be executed.
    await fixture.whenStable();
    expect(effectCaptor).toEqual([
      'effect [signal=0]',
      'effect [signal=1]',
      'effect [signal=2]',
    ]);

    // Change tracked signal.
    testSignal.set(3);
    await fixture.whenStable();
    expect(effectCaptor).toEqual([
      'effect [signal=0]',
      'effect [signal=1]',
      'effect [signal=2]',
      'effect [signal=3]',
    ]);

    // Attach the component to the component tree.
    component.changeDetectorRef.reattach();

    // Change tracked signal.
    testSignal.set(4);

    // Expect effect to be executed.
    await fixture.whenStable();
    expect(effectCaptor).toEqual([
      'effect [signal=0]',
      'effect [signal=1]',
      'effect [signal=2]',
      'effect [signal=3]',
      'effect [signal=4]',
    ]);
  });

  it('should unregister effect when injection context is destroyed', async () => {
    const effectCaptor = new Array<string>();
    const testSignal = signal(0);
    const injector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));

    runInInjectionContext(injector, () => {
      rootEffect(() => void effectCaptor.push(`effect [signal=${testSignal()}]`));
    });
    TestBed.tick();

    // Expect initial effect execution.
    expect(effectCaptor).toEqual([
      'effect [signal=0]',
    ]);

    // Change tracked signal.
    testSignal.set(1);
    TestBed.tick();

    // Expect effect to be executed.
    expect(effectCaptor).toEqual([
      'effect [signal=0]',
      'effect [signal=1]',
    ]);

    // Destroy injection context.
    injector.destroy();

    // Change tracked signal.
    testSignal.set(2);
    TestBed.tick();

    // Expect effect not to be executed.
    expect(effectCaptor).toEqual([
      'effect [signal=0]',
      'effect [signal=1]',
    ]);
  });

  it('should unregister effect when passed injector is destroyed', async () => {
    const effectCaptor = new Array<string>();
    const testSignal = signal(0);
    const injector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));

    rootEffect(() => void effectCaptor.push(`effect [signal=${testSignal()}]`), {injector});
    TestBed.tick();

    // Expect initial effect execution.
    expect(effectCaptor).toEqual([
      'effect [signal=0]',
    ]);

    // Change tracked signal.
    testSignal.set(1);
    TestBed.tick();

    // Expect effect to be executed.
    expect(effectCaptor).toEqual([
      'effect [signal=0]',
      'effect [signal=1]',
    ]);

    // Destroy injection context.
    injector.destroy();

    // Change tracked signal.
    testSignal.set(2);
    TestBed.tick();

    // Expect effect not to be executed.
    expect(effectCaptor).toEqual([
      'effect [signal=0]',
      'effect [signal=1]',
    ]);
  });

  it('should support for manual cleanup', async () => {
    const effectCaptor = new Array<string>();
    const testSignal = signal(0);
    const injector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));

    const effectRef = rootEffect(() => void effectCaptor.push(`effect [signal=${testSignal()}]`), {injector, manualCleanup: true});
    TestBed.tick();

    // Expect initial effect execution.
    expect(effectCaptor).toEqual([
      'effect [signal=0]',
    ]);

    // Change tracked signal.
    testSignal.set(1);
    TestBed.tick();

    // Expect effect to be executed.
    expect(effectCaptor).toEqual([
      'effect [signal=0]',
      'effect [signal=1]',
    ]);

    // Destroy injector.
    injector.destroy();

    // Change tracked signal.
    testSignal.set(2);
    TestBed.tick();

    // Expect effect to be executed.
    expect(effectCaptor).toEqual([
      'effect [signal=0]',
      'effect [signal=1]',
      'effect [signal=2]',
    ]);

    // Destroy effect.
    effectRef.destroy();

    // Change tracked signal.
    testSignal.set(3);
    TestBed.tick();

    // Expect effect not to be executed.
    expect(effectCaptor).toEqual([
      'effect [signal=0]',
      'effect [signal=1]',
      'effect [signal=2]',
    ]);
  });
});

/**
 * Creates a dynamic component that can be detached from the Angular change detection tree.
 */
function createDynamicTestComponent(onConstruct: () => void): {fixture: ComponentFixture<unknown>; component: ComponentRef<unknown>} {
  @Component({
    selector: 'spec-root',
    template: '',
  })
  class SpecRootComponent {
  }

  @Component({
    selector: 'spec-component',
    template: 'Test Component',
  })
  class TestComponent {
    constructor() {
      onConstruct();
    }
  }

  const fixture = TestBed.createComponent(SpecRootComponent);
  fixture.autoDetectChanges();

  const rootComponent = fixture.componentRef;
  const testComponent = createComponent(TestComponent, {
    elementInjector: rootComponent.injector,
    environmentInjector: TestBed.inject(EnvironmentInjector),
  });

  // Add component into Angular's logical component tree.
  rootComponent.injector.get(ViewContainerRef).insert(testComponent.hostView);

  // Cleanup resources.
  rootComponent.onDestroy(() => testComponent.destroy());

  return {
    fixture,
    component: testComponent,
  };
}
