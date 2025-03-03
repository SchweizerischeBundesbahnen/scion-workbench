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
  templateUrl: './activity-panel.component.html',
  styleUrls: ['./activity-panel.component.scss'],
  imports: [
    SciSashboxComponent,
    SciSashDirective,
    GridComponent,
  ],
})
export class ActivityPanelComponent {

  public readonly panel = input.required<'left' | 'right' | 'bottom'>();

  private readonly _workbenchLayoutService = inject(WorkbenchLayoutService);
  private readonly _workbenchRouter = inject(ɵWorkbenchRouter);

  protected readonly workbenchLayout = computed(() => this._workbenchLayoutService.layout()!);
  protected readonly sashSizes = computed(() => calculateSashSizes(this.workbenchLayout().activityLayout.panels[this.panel()].ratio ?? .5));

  protected onSashStart(): void {
    this._workbenchLayoutService.signalResizing(true);
  }

  protected onLeftPanelSashEnd({top, bottom}: {[sashKey: string]: number}): void {
    const ratio = top! / (top! + bottom!);
    this._workbenchLayoutService.signalResizing(false);
    void this._workbenchRouter.navigate(layout => layout.setActivityPanelRatio('left', ratio));
  }

  protected onRightPanelSashEnd({top, bottom}: {[sashKey: string]: number}): void {
    const ratio = top! / (top! + bottom!);
    this._workbenchLayoutService.signalResizing(false);
    void this._workbenchRouter.navigate(layout => layout.setActivityPanelRatio('right', ratio));
  }

  protected onBottomPanelSashEnd({left, right}: {[sashKey: string]: number}): void {
    const ratio = left! / (left! + right!);
    this._workbenchLayoutService.signalResizing(false);
    void this._workbenchRouter.navigate(layout => layout.setActivityPanelRatio('bottom', ratio));
  }
}

/**
 * Calculates the size of two sashes based on the given ratio.
 */
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
