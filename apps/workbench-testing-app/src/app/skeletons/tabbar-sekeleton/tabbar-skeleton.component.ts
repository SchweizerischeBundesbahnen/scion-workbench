/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, HostBinding, inject, input, model} from '@angular/core';
import {WorkbenchView} from '@scion/workbench';
import {ArrayPipe} from '../array.pipe';

/**
 * Represents a skeleton for a tabbar.
 */
@Component({
  selector: 'app-tabbar-skeleton',
  templateUrl: './tabbar-skeleton.component.html',
  styleUrls: ['./tabbar-skeleton.component.scss'],
  standalone: true,
  imports: [
    ArrayPipe,
  ],
})
export class TabbarSkeletonComponent {

  private _view = inject(WorkbenchView);

  public tabs = input.required<number>();
  public selectedTab = model.required<number>();

  @HostBinding('class.active')
  public get active(): boolean {
    return this._view.part().active();
  }

  public onTabSelect(index: number): void {
    this.selectedTab.set(index);
  }
}
