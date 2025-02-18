/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, inject} from '@angular/core';
import {ActivityBarComponent} from '../activity/activity-bar/activity-bar.component';
import {MActivityLayout} from '../activity/workbench-activity.model';
import {WorkbenchLayoutService} from './workbench-layout.service';
import {SciSashboxComponent, SciSashDirective} from '@scion/components/sashbox';
import {WorkbenchActivityPanelComponent} from '../activity/activity-panel/workbench-activity-panel.component';
import {WorkbenchMainGridComponent} from './main-grid/workbench-main-grid.component';
import {WorkbenchService} from '@scion/workbench';
import {ɵWorkbenchRouter} from '../routing/ɵworkbench-router.service';

@Component({
  selector: 'wb-layout',
  templateUrl: './workbench-layout.component.html',
  styleUrls: ['./workbench-layout.component.scss'],
  standalone: true,
  imports: [
    ActivityBarComponent,
    SciSashDirective,
    SciSashboxComponent,
    WorkbenchActivityPanelComponent,
    WorkbenchMainGridComponent,
  ],
})
export class WorkbenchLayoutComponent {

  private readonly _workbenchLayoutService = inject(WorkbenchLayoutService);
  private readonly _workbenchRouter = inject(ɵWorkbenchRouter);

  protected readonly workbenchService = inject(WorkbenchService);

  protected readonly activityLayout = computed((): MActivityLayout | undefined => this._workbenchLayoutService.layout()?.activityLayout);
  protected readonly hasLeftActivityBar = computed((): boolean => {
    const activityLayout = this._workbenchLayoutService.layout()?.activityLayout;
    if (!activityLayout) {
      return false;
    }
    return (
      activityLayout.toolbars.leftTop.activities.length +
      activityLayout.toolbars.leftBottom.activities.length +
      activityLayout.toolbars.bottomLeft.activities.length
    ) > 0;
  });
  protected readonly hasRightActivityBar = computed((): boolean => {
    const activityLayout = this._workbenchLayoutService.layout()?.activityLayout;
    if (!activityLayout) {
      return false;
    }
    return (
      activityLayout.toolbars.rightTop.activities.length +
      activityLayout.toolbars.rightBottom.activities.length +
      activityLayout.toolbars.bottomRight.activities.length
    ) > 0;
  });
  protected readonly leftPanelSize = computed((): string => this.activityLayout()?.panels.left.width ?? '200px');
  protected readonly rightPanelSize = computed((): string => this.activityLayout()?.panels.right.width ?? '200px');
  protected readonly bottomPanelSize = computed((): string => this.activityLayout()?.panels.bottom.height ?? '150px');

  protected onSashStart(): void {
    this._workbenchLayoutService.signalResizing(true);
  }

  protected onSashEndLeftRight([leftPanelSize, _mainLayoutSize, rightPanelSize]: number[]): void {
    this._workbenchLayoutService.signalResizing(false);
    void this._workbenchRouter.navigate(layout => layout
      .setActivityPanelSize('left', leftPanelSize)
      .setActivityPanelSize('right', rightPanelSize),
    );
  }

  protected onSashEndBottom([_mainLayoutSize, bottomPanelSize]: number[]): void {
    this._workbenchLayoutService.signalResizing(false);
    void this._workbenchRouter.navigate(layout => layout.setActivityPanelSize('bottom', bottomPanelSize));
  }
}
