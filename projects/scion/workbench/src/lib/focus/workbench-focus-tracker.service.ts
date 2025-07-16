/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {DestroyRef, ElementRef, forwardRef, inject, Injectable, Injector, Signal, signal} from '@angular/core';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {EMPTY, fromEvent, merge, switchMap} from 'rxjs';
import {Disposable} from '../common/disposable';
import {coerceElement} from '@angular/cdk/coercion';
import {WorkbenchElementId} from '../workbench-elements';
import {finalize, startWith} from 'rxjs/operators';

/**
 * Provides the active workbench element, i.e., the element that has the focus.
 */
@Injectable({providedIn: 'root', useExisting: forwardRef(() => ɵWorkbenchFocusTracker)})
export abstract class WorkbenchFocusTracker {

  /**
   * Provides the workbench element that has focus.
   */
  public abstract readonly activeElement: Signal<WorkbenchElementId | null>;

  public abstract unsetActiveElement(element: string | null): void;
}

@Injectable({providedIn: 'root'})
class ɵWorkbenchFocusTracker implements WorkbenchFocusTracker {

  public activeElement = signal<WorkbenchElementId | null>(null);

  public setActiveElement(element: WorkbenchElementId | null): void {
    this.activeElement.set(element);
  }

  public unsetActiveElement(element: WorkbenchElementId | null): void {
    if (this.activeElement() === element) {
      this.activeElement.set(null);
    }
  }
}

/**
 * Registers the specified element as focus provider in {@link WorkbenchFocusTracker},
 * reporting the element as active when it or any of its child elements gains focus.
 *
 * Stops tracking when the associated injection context is destroyed, or the returned {@link Disposable} is disposed.
 *
 * This function must be called within an injection context, or an explicit {@link Injector} passed.
 */
export function registerFocusTracker(target: ElementRef<Element> | Element, element: WorkbenchElementId | null | (() => WorkbenchElementId | null), options?: {injector?: Injector}): Disposable {
  const elementFn = typeof element === 'function' ? element : () => element;

  const injector = options?.injector ?? inject(Injector);
  const focusTracker = injector.get(ɵWorkbenchFocusTracker);

  const subscription = toObservable(focusTracker.activeElement, {injector})
    .pipe(
      startWith(undefined), // immediate subscription to focusin; microfrontend focustracker e2e tests (host popup)
      switchMap(activeElement => activeElement === elementFn() ? EMPTY : merge(fromEvent<FocusEvent>(coerceElement(target), 'focusin', {once: true}), fromEvent(coerceElement(target), 'sci-microfrontend-focusin', {once: true}))),
      finalize(() => setTimeout(() => focusTracker.unsetActiveElement(elementFn()))), // TODO[focus-tracker] Test test to fail if not setTimeout
      takeUntilDestroyed(injector.get(DestroyRef)),
    )
    .subscribe(() => {
      focusTracker.setActiveElement(elementFn());
    });

  return {
    dispose: () => subscription.unsubscribe(),
  };
}
