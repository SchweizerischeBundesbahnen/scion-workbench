/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, inject, input, Signal} from '@angular/core';
import {ɵWorkbenchRouter} from '../../routing/ɵworkbench-router.service';
import {GridComponent} from '../../layout/grid/grid.component';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';
import {ActivityId} from '../../workbench.identifiers';
import {NgTemplateOutlet} from '@angular/common';
import {SciSashboxComponent, SciSashDirective} from '@scion/components/sashbox';
import {Objects} from '@scion/toolkit/util';

/**
 * Displays two activities, split vertically or horizontally based on the panel's alignment.
 */
@Component({
  selector: 'wb-activity-panel',
  templateUrl: './activity-panel.component.html',
  styleUrls: ['./activity-panel.component.scss'],
  imports: [
    NgTemplateOutlet,
    SciSashboxComponent,
    SciSashDirective,
    GridComponent,
  ],
  host: {
    '[attr.data-panel]': 'panel()',
  },
})
export class ActivityPanelComponent {

  /**
   * Specifies the location of the panel.
   */
  public readonly panel = input.required<'left' | 'right' | 'top' | 'bottom'>();

  /**
   * Specifies the first activity to display in the panel.
   */
  public readonly activityId1 = input.required<ActivityId | undefined>();

  /**
   * Specifies the second activity to display in the panel.
   */
  public readonly activityId2 = input.required<ActivityId | undefined>();

  private readonly _workbenchLayoutService = inject(WorkbenchLayoutService);
  private readonly _workbenchRouter = inject(ɵWorkbenchRouter);

  protected readonly layout = this._workbenchLayoutService.layout;
  protected readonly direction = this.computeDirection();
  protected readonly sashSizes = this.computeSashSizes();

  protected onSashStart(): void {
    this._workbenchLayoutService.signalResizing(true);
  }

  protected onSashEnd({sash1, sash2}: {[sashKey: string]: number}): void {
    this._workbenchLayoutService.signalResizing(false);

    const ratio = sash1! / (sash1! + sash2!);
    void this._workbenchRouter.navigate(layout => layout.setActivityPanelSplitRatio(this.panel(), ratio));
  }

  /**
   * Computes the direction of the sashbox.
   */
  private computeDirection(): Signal<'row' | 'column'> {
    return computed(() => this.panel() === 'bottom' || this.panel() === 'top' ? 'row' : 'column');
  }

  /**
   * Calculates the size of two sashes based on the given ratio.
   */
  private computeSashSizes(): Signal<{sash1: string; sash2: string}> {
    return computed(() => {
      const ratio = this.layout().activityLayout.panels[this.panel()].ratio;
      // Important: `SciSashboxComponent` requires proportions to be >= 1. For this reason we cannot simply calculate [ratio, 1 - ratio].
      if (ratio === 0) {
        return {sash1: '0px', sash2: '1'};
      }
      if (ratio === 1) {
        return {sash1: '1', sash2: '0px'};
      }

      return {
        sash1: `${1 / (1 - ratio)}`,
        sash2: `${1 / ratio}`,
      };
    }, {equal: Objects.isEqual});
  }
}
