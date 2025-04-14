/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {assertNotInReactiveContext, DestroyRef, forwardRef, inject, Injectable, Injector, NgZone, Signal, signal} from '@angular/core';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {filter, finalize} from 'rxjs/operators';
import {fromEvent, merge, switchMap} from 'rxjs';
import {Disposable} from '../common/disposable';
import {observeIn} from '@scion/toolkit/operators';

/**
 * Provides the active workbench element, i.e., the element that has the focus.
 */
@Injectable({providedIn: 'root', useExisting: forwardRef(() => ɵFocusTracker)})
export abstract class FocusTracker {

  /**
   * Provides the workbench element that has focus.
   */
  public abstract readonly activeElement: Signal<string | null>;
}

@Injectable({providedIn: 'root'})
class ɵFocusTracker implements FocusTracker {

  public activeElement = signal<string | null>(null);

  public setActiveElement(element: string): void {
    this.activeElement.set(element);
  }

  public unsetActiveElement(element: string): void {
    if (this.activeElement() === element) {
      this.activeElement.set(null);
    }
  }
}

/**
 * Registers the specified element as focus provider in {@link FocusTracker},
 * reporting the element as active when it or any of its child elements gains focus.
 *
 * Stops tracking when the associated injection context is destroyed, or the returned {@link Disposable} is disposed.
 *
 * This function must be called from an injection context. If an injection context is not available, an explicit `Injector` can be passed instead.
 */
export function registerFocusTracker(target: HTMLElement, element: string, options?: {injector?: Injector}): Disposable {
  assertNotInReactiveContext(registerFocusTracker, 'Call registerFocusProvider() in a non-reactive (non-tracking) context, such as within the untracked() function.');

  const injector = options?.injector ?? inject(Injector);
  const focusTracker = injector.get(ɵFocusTracker);
  const zone = injector.get(NgZone);

  const subscription = toObservable(focusTracker.activeElement, {injector})
    .pipe(
      observeIn(fn => zone.runOutsideAngular(fn)),
      filter(activeElement => activeElement !== element),
      switchMap(() => merge(fromEvent<FocusEvent>(target, 'focusin', {once: true, capture: true}), fromEvent(target, 'sci-microfrontend-focusin', {once: true, capture: true}))),
      finalize(() => focusTracker.unsetActiveElement(element)),
      takeUntilDestroyed(injector.get(DestroyRef)),
    )
    .subscribe(() => {
      NgZone.assertNotInAngularZone();
      zone.run(() => focusTracker.setActiveElement(element));
    });

  return {
    dispose: () => subscription.unsubscribe(),
  };
}
