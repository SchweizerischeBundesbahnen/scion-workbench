/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {DestroyRef, Directive, effect, ElementRef, inject, input, untracked} from '@angular/core';
import {createElement} from '../common/dom.util';

@Directive({selector: '[wbIconBadge]'})
export class IconBadgeDirective {

  public readonly badge = input<string | number | boolean | undefined>(undefined);
  public readonly inverse = input(false);

  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;

  constructor() {
    this.createBadgeElement();
  }

  private createBadgeElement(): void {
    const destroyRef = inject(DestroyRef);

    effect(onCleanup => {
      const badge = this.badge();
      const inverse = this.inverse();

      untracked(() => {
        let badgeElement: HTMLElement | undefined;

        if (badge) {
          badgeElement = createElement('div', {
            parent: this._host,
            cssClass: ['e2e-badge'],
            style: {
              'position': 'absolute',
              'right': '-8%',
              'top': '-8%',

              'display': 'inline-grid',
              'place-content': 'center',

              'background-color': 'var(--sci-color-accent)',
              'color': 'var(--sci-color-accent-inverse)',
              'outline': inverse ? '1px solid var(--sci-color-accent-inverse)' : 'none',
              'border-radius': '8px',

              'min-height': '8px',
              'min-width': '8px',
              'padding': badge === true ? '.125em' : '.125em .25em',

              'font-family': 'Roboto, sans-serif',
              'font-size': 'x-small',
              'line-height': '1',

              'user-select': 'none',

              'transform': badge === true ? 'none' : 'translate(5px, -5px)',
              'aspect-ratio': badge === true || `${badge}`.length === 1 ? '1 / 1' : 'auto',
            },
            text: badge === true ? undefined : `${badge}`,
          });
        }

        onCleanup(() => badgeElement?.remove());
        destroyRef.onDestroy(() => badgeElement?.remove());
      });
    });
  }
}
