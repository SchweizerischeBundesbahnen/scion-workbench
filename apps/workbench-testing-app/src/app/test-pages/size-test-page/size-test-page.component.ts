/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ElementRef, inject, NgZone, signal} from '@angular/core';
import {SciViewportComponent} from '@scion/components/viewport';
import {WorkbenchDialog} from '@scion/workbench';
import {map, Observable, Subject} from 'rxjs';
import {distinctUntilChanged, startWith} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {observeIn} from '@scion/toolkit/operators';

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
    const dialog = inject(WorkbenchDialog, {optional: true});
    if (dialog) {
      dialog.title = 'Size Test Page';
      dialog.size.minHeight = '100px';
      dialog.size.minWidth = '500px';
    }

    boundingClientRect$(inject(ElementRef) as ElementRef<HTMLElement>)
      .pipe(takeUntilDestroyed())
      .subscribe(({x, y, width, height}) => {
        this.sizes.update(array => array.concat(`x=${x}, y=${y}, width=${width}, height=${height}`));
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
  return onEveryAnimationFrame$()
    .pipe(
      map(() => element.nativeElement.getBoundingClientRect()),
      distinctUntilChanged((a, b) => a.top === b.top && a.right === b.right && a.bottom === b.bottom && a.left === b.left),
    );
}

/**
 * Creates an observable that emits on every animation frame.
 *
 * Unlike {@link `interval(0, animationFrameScheduler)`}, the observable always emits outside the Angular zone.
 *
 * The RxJS `animationFrameScheduler` does not necessarily execute in the current execution context, such as inside or outside Angular.
 * The scheduler always executes tasks in the zone where the scheduler was first used in the application.
 */
function onEveryAnimationFrame$(): Observable<void> {
  const zone = inject(NgZone);
  return new Observable<void>(observer => {
    const animationFrame$ = new Subject<void>();
    const subscription = animationFrame$
      .pipe(
        startWith(undefined as void),
        observeIn(fn => zone.runOutsideAngular(fn)),
      )
      .subscribe(() => {
        requestAnimationFrame(() => {
          observer.next();
          animationFrame$.next();
        });
      });

    return () => subscription.unsubscribe();
  });
}
