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
import {ActivityBarComponent} from '../activity/activity-bar/activity-bar.component';
import {WorkbenchLayoutService} from './workbench-layout.service';
import {SciSashboxComponent, SciSashDirective} from '@scion/components/sashbox';
import {ActivityPanelComponent} from '../activity/activity-panel/activity-panel.component';
import {GridComponent} from './grid/grid.component';
import {ɵWorkbenchRouter} from '../routing/ɵworkbench-router.service';
import {ɵWorkbenchLayout} from './ɵworkbench-layout';
import {NgTemplateOutlet} from '@angular/common';
import {WorkbenchService} from '../workbench.service';
import {GridElementIfVisiblePipe} from '../common/grid-element-if-visible.pipe';
import {RouterOutlet} from '@angular/router';
import {SciViewportComponent} from '@scion/components/viewport';
import {ViewDropZoneDirective, WbViewDropEvent} from '../view-dnd/view-drop-zone.directive';
import {GridDropTargets} from '../view-dnd/grid-drop-targets.util';
import {DESKTOP} from '../workbench-element-references';
import {ViewDragService} from '../view-dnd/view-drag.service';
import {Logger} from '../logging';
import {WORKBENCH_ID} from '../workbench-id';

@Component({
  selector: 'wb-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  standalone: true,
  imports: [
    ActivityBarComponent,
    SciSashDirective,
    SciSashboxComponent,
    ActivityPanelComponent,
    GridComponent,
    NgTemplateOutlet,
    GridElementIfVisiblePipe,
    RouterOutlet,
    SciViewportComponent,
    ViewDropZoneDirective,
  ],
})
export class LayoutComponent {

  public readonly layout = input.required<ɵWorkbenchLayout>();

  private readonly _workbenchLayoutService = inject(WorkbenchLayoutService);
  private readonly _workbenchRouter = inject(ɵWorkbenchRouter);
  private readonly _workbenchId = inject(WORKBENCH_ID);
  private readonly _viewDragService = inject(ViewDragService);
  private readonly _logger = inject(Logger);
  private readonly _workbenchService = inject(WorkbenchService);
  private readonly _toolbars = computed(() => this.layout().activityLayout.toolbars);
  private readonly _panels = computed(() => this.layout().activityLayout.panels);

  protected readonly desktop = inject(DESKTOP);
  protected readonly mainGrid = computed(() => this.layout().grids.main);
  protected readonly leftActivityPanel = computed(() => this._toolbars().leftTop.activeActivityId || this._toolbars().leftBottom.activeActivityId ? this._panels().left : null);
  protected readonly rightActivityPanel = computed(() => this._toolbars().rightTop.activeActivityId || this._toolbars().rightBottom.activeActivityId ? this._panels().right : null);
  protected readonly bottomActivityPanel = computed(() => this._toolbars().bottomLeft.activeActivityId || this._toolbars().bottomRight.activeActivityId ? this._panels().bottom : null);
  protected readonly leftActivityBarVisible = computed(() => this._toolbars().leftTop.activities.length || this._toolbars().leftBottom.activities.length || this._toolbars().bottomLeft.activities.length);
  protected readonly rightActivityBarVisible = computed(() => this._toolbars().rightTop.activities.length || this._toolbars().rightBottom.activities.length || this._toolbars().bottomRight.activities.length);
  protected readonly widescreenModeEnabled = computed(() => this._workbenchService.widescreenModeEnabled());

  protected onSashStart(): void {
    this._workbenchLayoutService.signalResizing(true);
  }

  // TODO [Marc] What if we do not have a left sash?
  protected onHorizontalSashEnd(sashSizes: number[]): void {
    this._workbenchLayoutService.signalResizing(false);

    if (this.leftActivityPanel() && this.rightActivityPanel()) {
      const [leftSashSize, _mainSashSize, rightSashSize] = sashSizes; // eslint-disable-line @typescript-eslint/no-unused-vars
      void this._workbenchRouter.navigate(layout => layout
        .setActivityPanelSize('left', leftSashSize!)
        .setActivityPanelSize('right', rightSashSize!),
      );
    }
    else if (this.leftActivityPanel()) {
      const [leftSashSize] = sashSizes;
      void this._workbenchRouter.navigate(layout => layout.setActivityPanelSize('left', leftSashSize!));
    }
    else if (this.rightActivityPanel()) {
      const [_leftSashSize, _mainSashSize, rightSashSize] = sashSizes; // eslint-disable-line @typescript-eslint/no-unused-vars
      void this._workbenchRouter.navigate(layout => layout.setActivityPanelSize('left', rightSashSize!));
    }
    // void this._workbenchRouter.navigate(layout => layout
    //   .setActivityPanelSize('left', leftPanelSize)
    //   .setActivityPanelSize('right', rightPanelSize),
    // );
  }

  protected onVerticalSashEnd([_mainContentSize, bottomPanelSize]: number[]): void {
    this._workbenchLayoutService.signalResizing(false);
    void this._workbenchRouter.navigate(layout => layout.setActivityPanelSize('bottom', bottomPanelSize!));
  }

  protected onDesktopViewDrop(event: WbViewDropEvent): void {
    this._viewDragService.dispatchViewMoveEvent({
      source: {
        workbenchId: event.dragData.workbenchId,
        partId: event.dragData.partId,
        viewId: event.dragData.viewId,
        alternativeViewId: event.dragData.alternativeViewId,
        navigation: event.dragData.navigation,
        classList: event.dragData.classList,
      },
      target: GridDropTargets.resolve({
        grid: this.mainGrid(),
        workbenchId: this._workbenchId,
        dropRegion: event.dropRegion,
      }),
      dragData: event.dragData,
    });
  }

  protected onLegacyStartPageActivate(): void {
    this._logger.warn('[Deprecation] The configuration for displaying a start page in the workbench has changed. Provide a desktop using an `<ng-template>` with the `wbDesktop` directive. The template content will be used as the desktop content. Previously, the component associated with the empty path route was used as the start page. Legacy support will be removed in version 21.', `
    
    Example:
    <wb-workbench>
      <ng-template wbDesktop>
        Welcome
      </ng-template>
    </wb-workbench>
    `,
    );
  }
}
