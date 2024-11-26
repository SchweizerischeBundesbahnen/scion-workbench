/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {effect, inject, IterableDiffers, Renderer2, Signal} from '@angular/core';

/**
 * Tracks changes to the provided CSS classes and applies them to the given element.
 */
export function synchronizeCssClasses(element: HTMLElement, classes: Signal<string[]>): void {
  const classListDiffer = inject(IterableDiffers).find([]).create<string>();
  const renderer = inject(Renderer2);
  effect(() => {
    const diff = classListDiffer.diff(classes());
    if (diff) {
      diff.forEachAddedItem(({item}) => renderer.addClass(element, item));
      diff.forEachRemovedItem(({item}) => renderer.removeClass(element, item));
    }
  });
}
