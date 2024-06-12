/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, EventEmitter, HostBinding, Input, OnChanges, Output} from '@angular/core';
import {WorkbenchView} from '@scion/workbench';

@Component({
  selector: 'app-tabbar-skeleton',
  templateUrl: './tabbar-skeleton.component.html',
  styleUrls: ['./tabbar-skeleton.component.scss'],
  standalone: true,
})
export default class TabbarSkeletonComponent implements OnChanges {

  @Input()
  public tabs: string[] = [];

  @Input()
  public selectedTab: string | undefined;

  @Output()
  public selectedTabChange = new EventEmitter<string>();

  @HostBinding('class.active')
  public get active(): boolean {
    return this.view.part.active;
  }

  constructor(public view: WorkbenchView) {
  }

  public ngOnChanges(): void {
    this.onTabSelect(this.selectedTab);
  }

  public onTabSelect(tab: string | undefined): void {
    this.selectedTab = tab;
    this.selectedTabChange.emit(tab);
  }
}
