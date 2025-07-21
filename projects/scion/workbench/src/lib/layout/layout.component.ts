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
import {ViewDropZoneDirective, WbViewDropEvent} from '../view-dnd/view-drop-zone.directive';
import {GridDropTargets} from '../view-dnd/grid-drop-targets.util';
import {ViewDragService} from '../view-dnd/view-drag.service';
import {WORKBENCH_ID} from '../workbench-id';
import {WorkbenchPerspectiveService} from '../perspective/workbench-perspective.service';
import {MAIN_AREA} from './workbench-layout';
import {WorkbenchPortalOutletDirective} from '../portal/workbench-portal-outlet.directive';
import {WorkbenchDesktop} from '../desktop/workbench-desktop.model';

@Component({
  selector: 'wb-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  imports: [
    ActivityBarComponent,
    SciSashDirective,
    SciSashboxComponent,
    ActivityPanelComponent,
    GridComponent,
    NgTemplateOutlet,
    ViewDropZoneDirective,
    WorkbenchPortalOutletDirective,
  ],
  host: {
    '[@.disabled]': 'perspectiveService.switchingPerspective() || perspectiveService.resettingPerspective()',
  },
})
export class LayoutComponent {

  public readonly layout = input.required<ɵWorkbenchLayout>();

  private readonly _workbenchLayoutService = inject(WorkbenchLayoutService);
  private readonly _workbenchRouter = inject(ɵWorkbenchRouter);
  private readonly _workbenchId = inject(WORKBENCH_ID);
  private readonly _viewDragService = inject(ViewDragService);
  private readonly _panels = computed(() => this.layout().activityLayout.panels);

  protected readonly desktop = inject(WorkbenchDesktop);
  protected readonly toolbars = computed(() => this.layout().activityLayout.toolbars);

  protected readonly leftActivityPanel = computed(() => this.toolbars().leftTop.activeActivityId || this.toolbars().leftBottom.activeActivityId ? this._panels().left : null);
  protected readonly rightActivityPanel = computed(() => this.toolbars().rightTop.activeActivityId || this.toolbars().rightBottom.activeActivityId ? this._panels().right : null);
  protected readonly bottomActivityPanel = computed(() => this.toolbars().bottomLeft.activeActivityId || this.toolbars().bottomRight.activeActivityId ? this._panels().bottom : null);

  protected readonly leftActivityBarVisible = computed(() => this.toolbars().leftTop.activities.length || this.toolbars().leftBottom.activities.length || this.toolbars().bottomLeft.activities.length);
  protected readonly rightActivityBarVisible = computed(() => this.toolbars().rightTop.activities.length || this.toolbars().rightBottom.activities.length || this.toolbars().bottomRight.activities.length);

  protected readonly panelAlignment = inject(WorkbenchService).settings.panelAlignment;
  protected readonly panelAnimation = inject(WorkbenchService).settings.panelAnimation;

  protected readonly perspectiveService = inject(WorkbenchPerspectiveService);

  /**
   * Determines if a view can be dropped to the main grid.
   */
  protected readonly canDrop = inject(ViewDragService).canDrop(computed(() => this.layout().grids.main));

  /**
   * Determines if dropping at the boundaries of the main grid is enabled.
   *
   * Enabled for layouts without activities or layouts with activities but no main area.
   */
  protected readonly canDropInMainGrid = computed(() => {
    return !this.layout().hasActivities() || this.layout().parts({grid: 'main'}).some(part => part.id !== MAIN_AREA);
  });

  protected onSashStart(): void {
    this._workbenchLayoutService.signalResizing(true);
  }

  protected onHorizontalSashEnd({left, right}: {[sashKey: string]: number}): void {
    this._workbenchLayoutService.signalResizing(false);
    void this._workbenchRouter.navigate(layout => layout
      .modify(layout => left !== undefined ? layout.setActivityPanelSize('left', left) : layout)
      .modify(layout => right !== undefined ? layout.setActivityPanelSize('right', right) : layout),
    );
  }

  protected onVerticalSashEnd({bottom}: {[sashKey: string]: number}): void {
    this._workbenchLayoutService.signalResizing(false);
    void this._workbenchRouter.navigate(layout => layout.setActivityPanelSize('bottom', bottom!));
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
        grid: this.layout().grids.main,
        workbenchId: this._workbenchId,
        dropRegion: event.dropRegion,
      }),
      dragData: event.dragData,
    });
  }
}
