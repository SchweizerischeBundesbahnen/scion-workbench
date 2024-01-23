/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Directive, ElementRef, inject, InjectionToken, OnDestroy} from '@angular/core';
import {createElement, setStyle} from '../common/dom.util';
import {fromEvent} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ɵDestroyRef} from '../common/ɵdestroy-ref';
import {coerceElement} from '@angular/cdk/coercion';
import {Blocking} from './blocking';
import {Blockable} from './blockable';

/**
 * Prevents user interaction of the host when blocked by placing a glass pane over the host element.
 *
 * Configure this direktive via the following DI tokens. These tokens must be provided at the component level.
 * - {@link GLASS_PANE_BLOCKABLE}: Represents the object to be blocked.
 * - {@link GLASS_PANE_TARGET_ELEMENT}: Controls the HTML element to block. Defaults to the directive's host element if not set.
 */
@Directive({selector: '[wbGlassPane]', standalone: true})
export class GlassPaneDirective implements OnDestroy {

  private readonly _targetElement: HTMLElement;
  private _glassPane: GlassPane | null = null;

  constructor() {
    this._targetElement = coerceElement(inject(GLASS_PANE_TARGET_ELEMENT, {optional: true, host: true}) ?? inject(ElementRef));
    this.installGlassPane();
    this.ensureHostElementPositioned();
  }

  private installGlassPane(): void {
    inject(GLASS_PANE_BLOCKABLE, {host: true}).blockedBy$
      .pipe(takeUntilDestroyed())
      .subscribe((blockedBy: Blocking | null) => {
        this._glassPane?.dispose();
        this._glassPane = blockedBy ? new GlassPane(this._targetElement, blockedBy) : null;
      });
  }

  private ensureHostElementPositioned(): void {
    if (getComputedStyle(this._targetElement).position === 'static') {
      setStyle(this._targetElement, {'position': 'relative'});
    }
  }

  public ngOnDestroy(): void {
    this._glassPane?.dispose();
  }
}

/**
 * Represents the glass pane added to the target element.
 */
class GlassPane {

  private readonly _destroyRef = new ɵDestroyRef();

  constructor(targetElement: HTMLElement, blockedBy: Blocking) {
    const glassPaneElement = createElement('div', {
      parent: targetElement,
      cssClass: ['glasspane', 'e2e-glasspane'],
      attributes: {
        'data-owner': blockedBy.id,
      },
      style: {
        position: 'absolute',
        inset: 0,
      },
    });

    // Indicate the user that this element is blocked when clicking it.
    fromEvent<MouseEvent>(glassPaneElement, 'mousedown')
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((event: MouseEvent) => {
        event.preventDefault(); // to not lose focus
        blockedBy.blink();
      });

    // Prevent the target from gaining focus via sequential keyboard navigation.
    fromEvent(targetElement, 'focusin')
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        blockedBy.focus();
      });

    this._destroyRef.onDestroy(() => {
      glassPaneElement.remove();
    });
  }

  public dispose(): void {
    this._destroyRef.destroy();
  }
}

/**
 * DI token to configure the {@link GlassPaneDirective} with the [object]{@link Blockable} to block.
 */
export const GLASS_PANE_BLOCKABLE = new InjectionToken<Blockable>('GLASS_PANE_BLOCKABLE');

/**
 * DI token to configure the {@link GlassPaneDirective} with the HTML element to block.
 * Defaults to the host element of the {@link GlassPaneDirective} if not specified.
 */
export const GLASS_PANE_TARGET_ELEMENT = new InjectionToken<HTMLElement | ElementRef<HTMLElement>>('GLASS_PANE_TARGET_ELEMENT');
