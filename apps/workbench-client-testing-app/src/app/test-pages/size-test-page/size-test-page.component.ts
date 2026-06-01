/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ElementRef, inject, signal} from '@angular/core';
import {SciViewportComponent} from '@scion/components/viewport';
import {animationFrameScheduler, interval, map, Observable} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-size-test-page',
  templateUrl: './size-test-page.component.html',
  styleUrl: './size-test-page.component.scss',
  imports: [
    SciViewportComponent,
  ],
})
export default class SizeTestPageComponent {

  protected sizes = signal<string[]>([]);

  constructor() {
    boundingClientRect$(inject(ElementRef) as ElementRef<HTMLElement>)
      .pipe(takeUntilDestroyed())
      .subscribe(({x, y, width, height}) => {
        this.sizes.update(array => array.concat(`x=${Math.floor(x)}, y=${Math.floor(y)}, width=${width}, height=${height}`));
      });
  }

  protected onClear(): void {
    this.sizes.set([]);
  }
}

/**
 * Unlike `boundingClientRect$` from `@scion/toolkit/observable`, emits the bounding box also if the element is hidden.
 * NOTE: Do not use in production code as not performant.
 */
function boundingClientRect$(element: ElementRef<HTMLElement>): Observable<DOMRect> {
  return interval(0, animationFrameScheduler)
    .pipe(
      map(() => element.nativeElement.getBoundingClientRect()),
      distinctUntilChanged((a, b) => a.top === b.top && a.right === b.right && a.bottom === b.bottom && a.left === b.left),
    );
}
