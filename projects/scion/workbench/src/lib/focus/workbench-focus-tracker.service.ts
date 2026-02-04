/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {forwardRef, inject, Injectable, Signal, signal} from '@angular/core';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {EMPTY, fromEvent, merge, switchMap} from 'rxjs';
import {finalize, startWith} from 'rxjs/operators';
import {WorkbenchElement} from '../workbench.model';

/**
 * Provides the workbench element that contains the focused DOM element, which is currently receiving keyboard events.
 */
@Injectable({providedIn: 'root', useExisting: forwardRef(() => ɵWorkbenchFocusMonitor)})
export abstract class WorkbenchFocusMonitor {

  /**
   * Provides the focused workbench element, or `null` if the focus is on a DOM element outside any workbench element.
   */
  public abstract readonly activeElement: Signal<WorkbenchElement | null>;
}

/**
 * Tracks the focus of the passed HTML element, making the workbench element the workbench focus owner when the element
 * or any of its direct or indirect child elements gains focus.
 *
 * Stops focus tracking when the current injection context is destroyed, unsetting the active workbench element if it was the focus owner.
 *
 * This function must be called within an injection context.
 */
export function trackFocus(target: HTMLElement, workbenchElement: WorkbenchElement | null): FocusTrackerRef {
  const focusMonitor = inject(ɵWorkbenchFocusMonitor);

  const subscription = toObservable(focusMonitor.activeElement)
    .pipe(
      startWith(focusMonitor.activeElement()), // Immediately subscribe to `focusin` events, required when the DOM element is focused right after invocation.
      switchMap(activeWorkbenchElement => activeWorkbenchElement === workbenchElement ? EMPTY : merge(fromEvent<FocusEvent>(target, 'focusin', {once: true}), fromEvent(target, 'sci-microfrontend-focusin', {once: true}))),
      finalize(() => requestAnimationFrame(() => focusMonitor.unsetActiveElement(workbenchElement))), // Asynchronously unset the active workbench element to prevent a `null` focus during destruction until the next element gains focus.
      takeUntilDestroyed(),
    )
    .subscribe(() => {
      focusMonitor.setActiveElement(workbenchElement);
    });

  return {
    unsetActiveElement: () => focusMonitor.unsetActiveElement(workbenchElement),
    destroy: () => subscription.unsubscribe(),
  };
}

/**
 * Reference for tracking focus state of the workbench element.
 */
export interface FocusTrackerRef {

  /**
   * Unsets the active workbench element if the tracked element was the focus owner.
   */
  unsetActiveElement(): void;

  /**
   * Stops focus tracking, unsetting the active workbench element if it was the focus owner.
   */
  destroy(): void;
}

@Injectable({providedIn: 'root'})
class ɵWorkbenchFocusMonitor implements WorkbenchFocusMonitor {

  public activeElement = signal<WorkbenchElement | null>(null);

  public setActiveElement(element: WorkbenchElement | null): void {
    this.activeElement.set(element);
  }

  public unsetActiveElement(element: WorkbenchElement | null): void {
    if (this.activeElement() === element) {
      this.activeElement.set(null);
    }
  }
}
