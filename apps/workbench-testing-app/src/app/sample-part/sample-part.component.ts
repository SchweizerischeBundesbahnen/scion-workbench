/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, effect, inject, signal, untracked} from '@angular/core';
import {TableSkeletonComponent} from '../skeletons/table-sekeleton/table-skeleton.component';
import {InputFieldSkeletonComponent} from '../skeletons/input-field-sekeleton/input-field-skeleton.component';
import {TabbarSkeletonComponent} from '../skeletons/tabbar-sekeleton/tabbar-skeleton.component';
import {ChartSkeletonComponent} from '../skeletons/chart-skeleton/chart-skeleton.component';
import {Skeletons} from '../skeletons/skeletons.util';
import {NavigationData, WorkbenchPart, WorkbenchRouter} from '@scion/workbench';
import {SciViewportComponent} from '@scion/components/viewport';
import {ListSkeletonComponent} from '../skeletons/list-sekeleton/list-skeleton.component';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {Objects} from '@scion/toolkit/util';
import {ActivatedRoute} from '@angular/router';

/**
 * Skeleton part for showcasing the SCION Workbench.
 *
 * This part is responsive and adapts its layout depending on whether it is displayed in the main or peripheral area.
 *
 * - Peripheral Area: Displays either a form, a table, or a list. The user can switch between these layouts.
 * - Main Area: Displays a form and a tabbar with the following tabs: Table, Form, List
 */
@Component({
  selector: 'app-sample-part',
  templateUrl: './sample-part.component.html',
  styleUrls: ['./sample-part.component.scss'],
  imports: [
    TableSkeletonComponent,
    InputFieldSkeletonComponent,
    TabbarSkeletonComponent,
    ChartSkeletonComponent,
    ListSkeletonComponent,
    SciViewportComponent,
    SciMaterialIconDirective,
  ],
})
export default class SamplePartComponent {

  private _workbenchRouter = inject(WorkbenchRouter);
  private _route = inject(ActivatedRoute);

  protected tabs: SkeletonStyle[] = ['table', 'form', 'list'];
  protected selectedTab = signal(Skeletons.random(0, this.tabs.length - 1));
  protected part = inject(WorkbenchPart);

  constructor() {
    effect(() => {
      const navigationData = this.part.navigation()!.data as PartSkeletonNavigationData | undefined;
      untracked(() => this.onNavigationChange(navigationData ?? {}));
    });
  }

  private onNavigationChange(navigationData: PartSkeletonNavigationData): void {
    if (navigationData.style) {
      this.selectedTab.set(this.tabs.indexOf(navigationData.style));
    }
  }

  protected onReload(): void {
    this.persist({style: this.tabs[(this.selectedTab() + 1) % this.tabs.length]});
  }

  protected onTabChange(index: number): void {
    this.persist({style: this.tabs[index]});
  }

  private persist(data: PartSkeletonNavigationData): void {
    data = {
      style: data.style ?? this.tabs[this.selectedTab()],
    };

    if (Objects.isEqual(data, this.part.navigation()!.data)) {
      return;
    }

    void this._workbenchRouter.navigate(layout => layout.navigatePart(this.part.id, [], {
      hint: this.part.navigation()?.hint,
      data,
      relativeTo: this._route,
    }), {replaceUrl: true});
  }
}

/**
 * Supported skeleton styles.
 *
 * - list: Skeleton representing a list.
 * - table: Skeleton representing a table, displaying a chart if enough space.
 * - form: Skeleton representing a form with input fields.
 */
export type SkeletonStyle = 'list' | 'table' | 'form';

/**
 * Navigation data to persist the visual representation of {@link SamplePartComponent}.
 */
export interface PartSkeletonNavigationData extends NavigationData {
  /**
   * Type of skeleton.
   */
  style?: SkeletonStyle;
}
