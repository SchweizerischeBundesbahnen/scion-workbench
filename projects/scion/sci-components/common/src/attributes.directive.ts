/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Directive, effect, ElementRef, inject, input, IterableDiffers, Renderer2, untracked} from '@angular/core';

/**
 * Adds specified attributes to the host element.
 */
@Directive({selector: '[sciAttributes]'})
export class SciAttributesDirective {

  public readonly attributes = input<{[name: string]: string | undefined} | undefined>(undefined, {alias: 'sciAttributes'});

  constructor() {
    const host = inject(ElementRef).nativeElement as HTMLElement;
    const attributeDiffer = inject(IterableDiffers).find([]).create<string>();
    const renderer = inject(Renderer2);

    effect(() => {
      const attributes = this.attributes() ?? {};

      untracked(() => {
        // Delete removed attributes.
        const diff = attributeDiffer.diff(Object.keys(attributes));
        if (diff) {
          diff.forEachRemovedItem(({item: name}) => renderer.removeAttribute(host, name));
        }

        // Update added or changed attributes.
        Object.entries(attributes).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            renderer.setAttribute(host, key, value);
          }
          else {
            renderer.removeAttribute(host, key);
          }
        });
      });
    });
  }
}
