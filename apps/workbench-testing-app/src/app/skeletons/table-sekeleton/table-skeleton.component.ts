/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, ElementRef, HostBinding, inject, Signal} from '@angular/core';
import {ArrayPipe} from '../array.pipe';
import {SciViewportComponent} from '@scion/components/viewport';
import {ListSkeletonComponent} from '../list-sekeleton/list-skeleton.component';
import {dimension} from '@scion/components/dimension';

/**
 * Represents a skeleton for a table.
 */
@Component({
  selector: 'app-table-skeleton',
  templateUrl: './table-skeleton.component.html',
  styleUrls: ['./table-skeleton.component.scss'],
  imports: [
    ArrayPipe,
    ListSkeletonComponent,
    SciViewportComponent,
  ],
})
export class TableSkeletonComponent {

  protected rows = 50;
  protected columns: Signal<number>;

  @HostBinding('style.--columns')
  protected get columnCount(): number {
    return this.columns();
  }

  constructor() {
    const hostSize = dimension(inject(ElementRef<HTMLElement>));
    // Compute number of columns based on table width.
    this.columns = computed(() => Math.ceil((hostSize().offsetWidth) / 150));
  }
}
