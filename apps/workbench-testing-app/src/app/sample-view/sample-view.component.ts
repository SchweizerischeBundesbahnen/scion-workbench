/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
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
import {NavigationData, WorkbenchRouter, WorkbenchView} from '@scion/workbench';
import {SciViewportComponent} from '@scion/components/viewport';
import {ListSkeletonComponent} from '../skeletons/list-sekeleton/list-skeleton.component';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {Objects} from '@scion/toolkit/util';
import {ActivatedRoute} from '@angular/router';

/**
 * Skeleton view for showcasing the SCION Workbench.
 *
 * This view is responsive and adapts its layout depending on whether it is displayed in the main or peripheral area.
 *
 * - Peripheral Area: Displays either a form, a table, or a list. The user can switch between these layouts.
 * - Main Area: Displays a form and a tabbar with the following tabs: Table, Form, List
 */
@Component({
  selector: 'app-sample-view',
  templateUrl: './sample-view.component.html',
  styleUrls: ['./sample-view.component.scss'],
  standalone: true,
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
export default class SampleViewComponent {

  private _workbenchRouter = inject(WorkbenchRouter);
  private _route = inject(ActivatedRoute);

  protected tabs: SkeletonStyle[] = ['table', 'form', 'list'];
  protected selectedTab = signal(Skeletons.random(0, this.tabs.length - 1));
  protected view = inject(WorkbenchView);

  constructor() {
    effect(() => {
      const navigationData = this.view.navigation()!.data as ViewSkeletonNavigationData;
      untracked(() => this.onNavigationChange(navigationData));
    });
    effect(() => {
      const title = this.view.title();
      untracked(() => this.onTitleChange(title));
    });
  }

  private onNavigationChange(navigationData: ViewSkeletonNavigationData): void {
    if (navigationData.style) {
      this.selectedTab.set(this.tabs.indexOf(navigationData.style));
    }
    if (navigationData.title) {
      this.view.title = navigationData.title;
    }
  }

  private onTitleChange(title: string | null): void {
    this.persist({title});
  }

  protected onReload(): void {
    this.persist({style: this.tabs[(this.selectedTab() + 1) % this.tabs.length]});
  }

  protected onTabChange(index: number): void {
    this.persist({style: this.tabs[index]});
  }

  private persist(data: ViewSkeletonNavigationData): void {
    data = {
      style: data.style ?? this.tabs[this.selectedTab()],
      title: data.title ?? this.view.title() ?? undefined,
    };

    if (Objects.isEqual(data, this.view.navigation()!.data)) {
      return;
    }

    this._workbenchRouter.navigate([], {
      hint: this.view.navigation()?.hint,
      target: this.view.id,
      data,
      relativeTo: this._route,
      replaceUrl: true,
      activate: this.view.active(),
    }).then();
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
 * Navigation data to persist the visual representation of {@link SampleViewComponent}.
 */
export interface ViewSkeletonNavigationData extends NavigationData {
  /**
   * Title of the view.
   */
  title?: string | null;
  /**
   * Type of skeleton.
   */
  style?: SkeletonStyle;
}
