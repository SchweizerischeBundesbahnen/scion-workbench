/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, HostBinding, inject, input, model, signal} from '@angular/core';
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
})
export class TabbarSkeletonComponent {

  private readonly _active = inject(WorkbenchView, {optional: true})?.part().active ?? inject(WorkbenchPart, {optional: true})?.active ?? signal(false);

  public readonly tabs = input.required<number>();
  public readonly selectedTab = model.required<number>();

  @HostBinding('class.active')
  protected get active(): boolean {
    return this._active();
  }

  protected onTabSelect(index: number): void {
    this.selectedTab.set(index);
  }
}
