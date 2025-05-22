/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Directive, effect, ElementRef, inject, input, IterableDiffers, Renderer2} from '@angular/core';

/**
 * Adds specified attributes to the host element.
 */
@Directive({selector: '[appAttributes]'})
export class AttributesDirective {

  public readonly attributes = input<{[name: string]: string} | undefined>(undefined, {alias: 'appAttributes'});

  constructor() {
    const host = inject(ElementRef).nativeElement as HTMLElement;
    const attributeDiffer = inject(IterableDiffers).find([]).create<string>();
    const renderer = inject(Renderer2);

    effect(() => {
      const attributes = this.attributes() ?? {};
      const diff = attributeDiffer.diff(Object.keys(attributes));
      if (diff) {
        diff.forEachAddedItem(({item: name}) => renderer.setAttribute(host, name, attributes[name]!));
        diff.forEachRemovedItem(({item: name}) => renderer.removeAttribute(host, name));
      }
    });
  }
}
