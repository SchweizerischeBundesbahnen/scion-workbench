/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ElementRef, inject, Signal} from '@angular/core';
import {IterablePipe} from './iterable.pipe';
import {fromDimension$} from '@scion/toolkit/observable';
import {toSignal} from '@angular/core/rxjs-interop';
import {filter, map} from 'rxjs/operators';
import {SciViewportComponent} from '@scion/components/viewport';

@Component({
  selector: 'app-list-skeleton',
  templateUrl: './list-skeleton.component.html',
  styleUrls: ['./list-skeleton.component.scss'],
  standalone: true,
  imports: [
    IterablePipe,
    SciViewportComponent,
  ],
})
export default class ListSkeletonComponent {

  public readonly _width: Signal<number>;

  protected entries = 75;

  constructor() {
    this._width = toSignal(fromDimension$(inject(ElementRef).nativeElement).pipe(map(size => size?.offsetWidth ?? 0), filter(Boolean)), {initialValue: 0});
  }
}
