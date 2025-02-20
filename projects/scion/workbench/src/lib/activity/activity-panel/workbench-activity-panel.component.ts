/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, inject, input} from '@angular/core';
import {SciSashboxComponent, SciSashDirective} from '@scion/components/sashbox';
import {ɵWorkbenchRouter} from '../../routing/ɵworkbench-router.service';
import {GridComponent} from '../../layout/grid/grid.component';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';

@Component({
  selector: 'wb-activity-panel',
  templateUrl: './workbench-activity-panel.component.html',
  styleUrls: ['./workbench-activity-panel.component.scss'],
  standalone: true,
  imports: [
    SciSashboxComponent,
    SciSashDirective,
    GridComponent,
  ],
})
export class WorkbenchActivityPanelComponent {

  public readonly panel = input.required<'left' | 'right' | 'bottom'>();

  private readonly _workbenchLayoutService = inject(WorkbenchLayoutService);
  private readonly _workbenchRouter = inject(ɵWorkbenchRouter);

  protected readonly activityLayout = computed(() => this._workbenchLayoutService.layout()!.activityLayout);
  protected readonly grids = computed(() => this._workbenchLayoutService.layout()!.grids);
  protected readonly leftPanelSashSize = computed((): [string, string] => calculateSashSizes(this.activityLayout()?.panels.left.ratio ?? 0.5));
  protected readonly rightPanelSashSize = computed((): [string, string] => calculateSashSizes(this.activityLayout()?.panels.right.ratio ?? 0.5));
  protected readonly bottomPanelSashSize = computed((): [string, string] => calculateSashSizes(this.activityLayout()?.panels.bottom.ratio ?? 0.5));

  protected onSashStart(): void {
    this._workbenchLayoutService.signalResizing(true);
  }

  protected onSashEndLeftPanel([sashSize1, sashSize2]: number[]): void {
    const ratio = sashSize1 / (sashSize1 + sashSize2);
    this._workbenchLayoutService.signalResizing(false);
    void this._workbenchRouter.navigate(layout => layout.setActivityPanelRatio('left', ratio));
  }

  protected onSashEndRightPanel([sashSize1, sashSize2]: number[]): void {
    const ratio = sashSize1 / (sashSize1 + sashSize2);
    this._workbenchLayoutService.signalResizing(false);
    void this._workbenchRouter.navigate(layout => layout.setActivityPanelRatio('right', ratio));
  }

  protected onSashEndBottomPanel([sashSize1, sashSize2]: number[]): void {
    const ratio = sashSize1 / (sashSize1 + sashSize2);
    this._workbenchLayoutService.signalResizing(false);
    void this._workbenchRouter.navigate(layout => layout.setActivityPanelRatio('bottom', ratio));
  }
}

function calculateSashSizes(ratio: number): [string, string] {
  // Important: `SciSashboxComponent` requires proportions to be >= 1. For this reason we cannot simply calculate [ratio, 1 - ratio].
  if (ratio === 0) {
    return ['0px', '1'];
  }
  if (ratio === 1) {
    return ['1', '0px'];
  }

  return [`${1 / (1 - ratio)}`, `${1 / ratio}`];
}
