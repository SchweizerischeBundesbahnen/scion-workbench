/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {assertNotInReactiveContext, DestroyRef, ElementRef, forwardRef, inject, Injectable, Injector, NgZone, Signal, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {finalize} from 'rxjs/operators';
import {fromEvent, merge} from 'rxjs';
import {Disposable} from '../common/disposable';
import {subscribeIn} from '@scion/toolkit/operators';
import {coerceElement} from '@angular/cdk/coercion';
import {Arrays} from '@scion/toolkit/util';
import {WorkbenchElementId} from '../workbench-elements';

/**
 * Provides the active workbench element, i.e., the element that has the focus.
 */
@Injectable({providedIn: 'root', useExisting: forwardRef(() => ɵWorkbenchFocusTracker)})
export abstract class WorkbenchFocusTracker {

  /**
   * Provides the workbench element that has focus.
   */
  public abstract readonly activeElement: Signal<WorkbenchElementId | null>;
}

@Injectable({providedIn: 'root'})
class ɵWorkbenchFocusTracker implements WorkbenchFocusTracker {

  public activeElement = signal<WorkbenchElementId | null>(null);

  public setActiveElement(element: WorkbenchElementId | null): void {
    this.activeElement.set(element);
  }

  public unsetActiveElement(element: string | null): void {
    if (this.activeElement() === element) {
      this.activeElement.set(null);
    }
  }
}

let _event: Event | undefined;
const excludes = new Array<Element>();

/**
 * Registers the specified element as focus provider in {@link WorkbenchFocusTracker},
 * reporting the element as active when it or any of its child elements gains focus.
 *
 * Stops tracking when the associated injection context is destroyed, or the returned {@link Disposable} is disposed.
 *
 * This function must be called within an injection context, or an explicit {@link Injector} passed.
 */
export function registerFocusTracker(target: Element | ElementRef<Element>, element: WorkbenchElementId | null | (() => WorkbenchElementId | null), options?: {injector?: Injector}): Disposable {
  const elementFn = typeof element === 'function' ? element : () => element;
  assertNotInReactiveContext(registerFocusTracker, 'Call registerFocusProvider() in a non-reactive (non-tracking) context, such as within the untracked() function.');

  const injector = options?.injector ?? inject(Injector);
  const focusTracker = injector.get(ɵWorkbenchFocusTracker);
  const zone = injector.get(NgZone);

  const subscription = merge(fromEvent<FocusEvent>(coerceElement(target), 'focusin'), fromEvent(coerceElement(target), 'sci-microfrontend-focusin'))
    .pipe(
      subscribeIn(fn => zone.runOutsideAngular(fn)),
      // Skip if already consumed downstream
      // filter(event => _event !== event),
      finalize(() => focusTracker.unsetActiveElement(elementFn())),
      takeUntilDestroyed(injector.get(DestroyRef)),
    )
    .subscribe((event: Event) => {
      console.log('>>>> onfocusin', elementFn());
      NgZone.assertNotInAngularZone();
      if (event === _event) {
        return;
      }

      _event = event;

      if (focusTracker.activeElement() === elementFn()) {
        return;
      }

      const e = event.target as Element;
      if (excludes.some(exclude => exclude.contains(e))) {
        return;
      }

      zone.run(() => focusTracker.setActiveElement(elementFn()));
    });

  return {
    dispose: () => subscription.unsubscribe(),
  };
}

/**
 * Excludes the specified and any descendants from triggering focus change event.
 */
export function registerFocusTrackerExclude(element: ElementRef<HTMLElement> | Element): void {
  excludes.push(coerceElement<Element>(element));
  inject(DestroyRef).onDestroy(() => Arrays.remove(excludes, coerceElement<Element>(element)));
}
