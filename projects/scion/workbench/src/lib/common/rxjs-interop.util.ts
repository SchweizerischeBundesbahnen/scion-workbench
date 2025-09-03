/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ApplicationRef, CreateEffectOptions, createEnvironmentInjector, DestroyRef, effect, EffectCleanupRegisterFn, EffectRef, inject, Injector, Signal} from '@angular/core';
import {Observable} from 'rxjs';
import {toObservable, ToObservableOptions} from '@angular/core/rxjs-interop';

/**
 * Registers an effect outside Angular's component context, not disabling the effect if the component is detached from the change detector tree.
 *
 * Unlike component effects, a root effect executes during the change detection of the root component, so it should not rely on component inputs being
 * available in its first execution.
 *
 * Use this type of effect in components that may be detached, such as workbench views, to still execute if detached.
 *
 * The effect's lifecycle is bound to the calling injection context (or passed injector) and will be unregistered when the injector is destroyed.
 *
 * Note that {@link afterRenderEffect} is also a root effect.
 *
 * ## From the Angular Documentation
 * Angular has two different kinds of effect: component effects and root effects. Component effects are created when `effect()` is called from a component,
 * directive, or within a service of a component/directive. Root effects are created when `effect()` is called from outside the component tree, such as in
 * a root service.
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

/**
 * Like {@link toObservable}, but uses a root effect to continue emitting even if the "contextual" component is detached from the change detector tree.
 *
 * @see rootEffect
 */
export function toRootObservable<T>(source: Signal<T>, options?: ToObservableOptions): Observable<T> {
  const injector = options?.injector ?? inject(Injector);
  const rootInjector = injector.get(ApplicationRef).injector;

  const observableInjector = createEnvironmentInjector([], rootInjector);
  injector.get(DestroyRef).onDestroy(() => observableInjector.destroy());

  return toObservable(source, {injector: observableInjector});
}
