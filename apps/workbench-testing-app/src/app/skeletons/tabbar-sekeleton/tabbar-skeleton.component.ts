/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, input, model, signal} from '@angular/core';
import {WorkbenchPart, WorkbenchView} from '@scion/workbench';
import {ArrayPipe} from '../array.pipe';

/**
 * Represents a skeleton for a tabbar.
 */
@Component({
  selector: 'app-tabbar-skeleton',
  templateUrl: './tabbar-skeleton.component.html',
  styleUrls: ['./tabbar-skeleton.component.scss'],
  imports: [
    ArrayPipe,
  ],
  host: {
    '[class.active]': 'active()',
  },
})
export class TabbarSkeletonComponent {

  public readonly tabs = input.required<number>();
  public readonly selectedTab = model.required<number>();

  protected readonly active = inject(WorkbenchView, {optional: true})?.focused ?? inject(WorkbenchPart, {optional: true})?.focused ?? signal(false);

  protected onTabSelect(index: number): void {
    this.selectedTab.set(index);
  }
}
