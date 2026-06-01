/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ElementRef, inject, input, signal} from '@angular/core';
import {SciViewportComponent} from '@scion/components/viewport';
import {WorkbenchDialog} from '@scion/workbench';
import {animationFrameScheduler, interval, map, Observable} from 'rxjs';
import {distinctUntilChanged, filter} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {PopupSizeDirective} from '../../popup-opener-page/popup-size.directive';

@Component({
  selector: 'app-size-test-page',
  templateUrl: './size-test-page.component.html',
  styleUrl: './size-test-page.component.scss',
  imports: [SciViewportComponent],
  hostDirectives: [{directive: PopupSizeDirective, inputs: ['size']}],
})
export default class SizeTestPageComponent {

  /**
   * Controls if to capture size changes only if visible.
   */
  protected readonly captureIfVisibleOnly = input(false);

  protected readonly sizes = signal<string[]>([]);

  constructor() {
    const dialog = inject(WorkbenchDialog, {optional: true});
    if (dialog) {
      dialog.title = 'Size Test Page';
      dialog.size.minHeight = '100px';
      dialog.size.minWidth = '500px';
    }

    const host = inject(ElementRef).nativeElement as HTMLElement;
    boundingClientRect$(inject(ElementRef) as ElementRef<HTMLElement>)
      .pipe(
        filter(() => !this.captureIfVisibleOnly() || host.checkVisibility({visibilityProperty: true})),
        takeUntilDestroyed(),
      )
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
  return interval(0, animationFrameScheduler)
    .pipe(
      map(() => element.nativeElement.getBoundingClientRect()),
      distinctUntilChanged((a, b) => a.top === b.top && a.right === b.right && a.bottom === b.bottom && a.left === b.left),
    );
}
