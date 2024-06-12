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
import TableSkeletonComponent from '../table-sekeleton/table-skeleton.component';
import InputFieldSkeletonComponent from '../input-field-sekeleton/input-field-skeleton.component';
import TabbarSkeletonComponent from '../tabbar-sekeleton/tabbar-skeleton.component';
import ChartSkeletonComponent from '../chart-skeleton/chart-skeleton.component';
import {Skeletons} from '../skeletons.util';
import {WorkbenchRouter, WorkbenchView} from '@scion/workbench';
import {SciViewportComponent} from '@scion/components/viewport';
import ListSkeletonComponent from '../list-sekeleton/list-skeleton.component';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {ActivatedRoute} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-skeleton-page',
  templateUrl: './skeleton-page.component.html',
  styleUrls: ['./skeleton-page.component.scss'],
  standalone: true,
  imports: [
    TableSkeletonComponent,
    InputFieldSkeletonComponent,
    TabbarSkeletonComponent,
    ChartSkeletonComponent,
    SciViewportComponent,
    ListSkeletonComponent,
    SciMaterialIconDirective,
  ],
})
export default class SkeletonPageComponent {

  public tabs = ['table', 'form', 'list'];
  public selectedTab: string | undefined;

  constructor(public view: WorkbenchView, private _route: ActivatedRoute, private _router: WorkbenchRouter) {
    this._route.paramMap
      .pipe(takeUntilDestroyed())
      .subscribe(params => {
        this.selectedTab = params.get('style') ?? this.randomTab();
        this.view.title = this.view.title || params.get('title') || 'Sample View';
      });
  }

  public onTabSelect(tab: string): void {
    this.update(tab);
  }

  public onReload(): void {
    const style = untilDifferent(() => this.randomTab(), this.selectedTab);
    this.update(style);
  }

  private update(style: string): void {
    this._router.navigate([{style}], {
      target: this.view.id,
      relativeTo: this._route,
    }).then();
  }

  private randomTab(): string {
    return this.tabs[Skeletons.random(0, this.tabs.length - 1)];
  }
}

function untilDifferent<T>(fn: () => T, currentValue: T | undefined): T {
  while (true) { // eslint-disable-line no-constant-condition
    const newValue = fn();
    if (newValue !== currentValue) {
      return newValue;
    }
  }
}
