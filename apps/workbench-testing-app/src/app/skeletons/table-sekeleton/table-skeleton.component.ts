/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, ElementRef, inject, Signal} from '@angular/core';
import {IterablePipe} from './iterable.pipe';
import {fromDimension$} from '@scion/toolkit/observable';
import {toSignal} from '@angular/core/rxjs-interop';
import {filter, map} from 'rxjs/operators';
import {SciScrollableDirective, SciScrollbarComponent, SciViewportComponent, SciViewportModule} from '@scion/components/viewport';
import ListSkeletonComponent from '../list-sekeleton/list-skeleton.component';
import {ScrollingModule} from '@angular/cdk/scrolling';

@Component({
  selector: 'app-table-skeleton',
  templateUrl: './table-skeleton.component.html',
  styleUrls: ['./table-skeleton.component.scss'],
  standalone: true,
  imports: [
    IterablePipe,
    SciViewportComponent,
    ListSkeletonComponent,
    // CdkFixedSizeVirtualScroll,
    SciScrollableDirective,
    // CdkVirtualForOf,
    SciScrollbarComponent,
    SciViewportModule,
    ScrollingModule
  ],
})
export default class TableSkeletonComponent {

  public readonly width: Signal<number>;

  protected rows = 100;
  protected columns: Signal<number>;

  constructor() {
    this.width = toSignal(fromDimension$(inject(ElementRef).nativeElement).pipe(map(size => size?.offsetWidth ?? 0), filter(Boolean)), {initialValue: 0});
    this.columns = computed(() => Math.ceil(this.width() / 150));
  }
}
