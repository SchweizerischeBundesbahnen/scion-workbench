/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Directive, effect, ElementRef, inject, InjectionToken, untracked} from '@angular/core';
import {createElement, positionElement, setStyle} from '../common/dom.util';
import {fromEvent} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ɵDestroyRef} from '../common/ɵdestroy-ref';
import {coerceElement} from '@angular/cdk/coercion';
import {Blocking} from './blocking';
import {Blockable} from './blockable';
import {Arrays} from '@scion/toolkit/util';

/**
 * Prevents user interaction of the host when blocked by placing a glass pane over the host element.
 *
 * Configure this direktive via the following DI tokens. These tokens must be provided at the component level.
 * - {@link GLASS_PANE_BLOCKABLE}: Represents the object to be blocked.
 * - {@link GLASS_PANE_TARGET_ELEMENT}: Controls the HTML element to block. Defaults to the directive's host element if not set.
 * - {@link GLASS_PANE_OPTIONS}: Configures the glass pane.
 */
@Directive({selector: '[wbGlassPane]'})
export class GlassPaneDirective {

  private readonly _targetElement = coerceElement<HTMLElement>(inject(GLASS_PANE_TARGET_ELEMENT, {optional: true, host: true}) ?? inject(ElementRef));
  private readonly _options = inject(GLASS_PANE_OPTIONS, {optional: true, host: true}) ?? undefined;

  constructor() {
    positionElement(this._targetElement, {context: 'glasspane'});
    this.installGlassPane();
  }

  private installGlassPane(): void {
    const blockable = inject(GLASS_PANE_BLOCKABLE, {host: true});
    effect(onCleanup => {
      const blockedBy = blockable.blockedBy();
      if (!blockedBy) {
        return;
      }

      untracked(() => {
        const glassPane = new GlassPane(this._targetElement, blockedBy, this._options);
        onCleanup(() => glassPane.dispose());
      });
    });
  }
}

/**
 * Represents the glass pane added to the target element.
 */
class GlassPane {

  private readonly _destroyRef = new ɵDestroyRef();

  constructor(targetElement: HTMLElement, blockedBy: Blocking, options?: GlassPaneOptions) {
    const glassPaneElement = createElement('div', {
      parent: targetElement,
      cssClass: ['glasspane', 'e2e-glasspane', ...Arrays.coerce(options?.cssClass)],
      attributes: {
        'data-owner': blockedBy.id,
        ...options?.attributes,
      },
      style: {
        'position': 'absolute',
        'inset': 0,
        'pointer-events': 'auto',
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

    // Ignore pointer events to block elements overlapping the glass pane, e.g., resize handles of a dialog.
    const currentPointerEvents = targetElement.style.pointerEvents || null;
    setStyle(targetElement, {'pointer-events': 'none'});

    this._destroyRef.onDestroy(() => {
      glassPaneElement.remove();
      setStyle(targetElement, {'pointer-events': currentPointerEvents});
    });
  }

  public dispose(): void {
    this._destroyRef.destroy();
  }
}

/**
 * Configures the glass pane.
 */
export interface GlassPaneOptions {
  /**
   * Specifies CSS class(es) to add to the glass pane HTML element.
   */
  cssClass?: string | string[];
  /**
   * Specifies attributes to add to the glass pane HTML element.
   */
  attributes?: {[key: string]: string};
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

/**
 * DI token to configure the {@link GlassPaneDirective}.
 */
export const GLASS_PANE_OPTIONS = new InjectionToken<GlassPaneOptions>('GLASS_PANE_OPTIONS');
