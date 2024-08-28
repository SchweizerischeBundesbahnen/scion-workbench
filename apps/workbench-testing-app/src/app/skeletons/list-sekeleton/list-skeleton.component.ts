/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {ArrayPipe} from '../array.pipe';
import {SciViewportComponent} from '@scion/components/viewport';

/**
 * Represents a skeleton for a list.
 */
@Component({
  selector: 'app-list-skeleton',
  templateUrl: './list-skeleton.component.html',
  styleUrls: ['./list-skeleton.component.scss'],
  standalone: true,
  imports: [
    ArrayPipe,
    SciViewportComponent,
  ],
})
export class ListSkeletonComponent {

  protected readonly listItems = 50;
}
