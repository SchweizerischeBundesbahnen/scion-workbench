/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ApplicationRef, CreateEffectOptions, DestroyRef, effect, EffectCleanupRegisterFn, EffectRef, inject, Injector} from '@angular/core';
//
// * Angular has two different kinds of effect: component effects and root effects. Component effects
// * are created when `effect()` is called from a component, directive, or within a service of a
// * component/directive. Root effects are created when `effect()` is called from outside the
// * component tree, such as in a root service, or when the `forceRoot` option is provided.
// * component tree, such as in a root service.
// *
// * The two effect types differ in their timing. Component effects run as a component lifecycle
// * event during Angular's synchronization (change detection) process, and can safely read input
// * signals or create/destroy views that depend on component state. Root effects run as microtasks

// * Always create a root effect (which is scheduled as a microtask) regardless of whether `effect`
// * is called within a component.

/**
 * Creates a root effect that will not be disabled if called from a component and that component is removed from change detection.
 *
 * // Run as root effect to run even if the parent component is detached from change detection (e.g., if the view is not visible).
 */
export function rootEffect(effectFn: (onCleanup: EffectCleanupRegisterFn) => void, options?: CreateEffectOptions): EffectRef {
  const injector = options?.injector ?? inject(Injector);
  const rootInjector = injector.get(ApplicationRef).injector;

  const effectRef = effect(effectFn, {
    ...options,
    injector: rootInjector,
    manualCleanup: true,
  });

  const manualCleanup = options?.manualCleanup ?? false;
  if (!manualCleanup) {
    injector.get(DestroyRef).onDestroy(() => effectRef.destroy());
  }

  return effectRef;
}
