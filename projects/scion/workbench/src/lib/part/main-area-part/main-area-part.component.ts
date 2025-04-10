/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, inject} from '@angular/core';
import {ɵWorkbenchPart} from '../ɵworkbench-part.model';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';
import {GridElementComponent} from '../../layout/grid-element/grid-element.component';
import {ViewDragService} from '../../view-dnd/view-drag.service';
import {ViewDropZoneDirective, WbViewDropEvent} from '../../view-dnd/view-drop-zone.directive';
import {RequiresDropZonePipe} from '../../view-dnd/requires-drop-zone.pipe';
import {RouterOutlet} from '@angular/router';
import {SciViewportComponent} from '@scion/components/viewport';
import {GridElementIfVisiblePipe} from '../../common/grid-element-if-visible.pipe';
import {WORKBENCH_ID} from '../../workbench-id';
import {GridDropTargets} from '../../view-dnd/grid-drop-targets.util';
import {RouterOutletRootContextDirective} from '../../routing/router-outlet-root-context.directive';
import {Logger} from '../../logging';
import {MAIN_AREA} from '../../layout/workbench-layout';
import {DESKTOP} from '../../workbench-element-references';
import {NgTemplateOutlet} from '@angular/common';

/**
 * Renders the layout of the {@link MAIN_AREA} part.
 *
 * The main area is a special part that is a subgrid, not a stack of views.
 *
 * The main area has the following characteristics:
 * - is optional;
 * - is the primary place to open views;
 * - is shared by perspectives having a main area;
 * - can be maximized;
 *
 * The layout is modeled as a tree of nodes `{@link MTreeNode}` and parts `{@link MPart}`. Each node has two children, which can be either
 * another node or a part (leaf). A node defines a split layout in which the two children are arranged vertically or horizontally.
 *
 *         MTreeNode
 *            |                         +------+-------+
 *     +------+------+        ======>   | left | right |
 *     |             |        renders   +------+-------+
 *   MPart         MPart
 *  (left)        (right)
 */
@Component({
  selector: `wb-part[data-partid="${MAIN_AREA}"]`, // eslint-disable-line @angular-eslint/component-selector
  templateUrl: './main-area-part.component.html',
  styleUrls: ['./main-area-part.component.scss'],
  imports: [
    GridElementComponent,
    ViewDropZoneDirective,
    RequiresDropZonePipe,
    RouterOutlet,
    RouterOutletRootContextDirective,
    SciViewportComponent,
    GridElementIfVisiblePipe,
    NgTemplateOutlet,
  ],
})
export class MainAreaPartComponent {

  private readonly _workbenchId = inject(WORKBENCH_ID);
  private readonly _workbenchLayoutService = inject(WorkbenchLayoutService);
  private readonly _viewDragService = inject(ViewDragService);
  private readonly _logger = inject(Logger);

  protected readonly part = inject(ɵWorkbenchPart);
  protected readonly mainAreaGrid = computed(() => this._workbenchLayoutService.layout().mainAreaGrid!);
  protected readonly desktop = inject(DESKTOP);

  protected onViewDrop(event: WbViewDropEvent): void {
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
        grid: this.mainAreaGrid(),
        workbenchId: this._workbenchId,
        dropRegion: event.dropRegion,
      }),
      dragData: event.dragData,
    });
  }

  protected onLegacyStartPageActivate(): void {
    this._logger.warn('[Deprecation] The configuration for displaying a start page in the workbench has changed. The main area must now be navigated. Previously, no navigation was required and the component associated with the empty path route was used as the start page. Legacy support will be removed in version 21.', `

      // Example for navigating the main area:
      
      import {bootstrapApplication} from '@angular/platform-browser';
      import {provideRouter} from '@angular/router';
      import {MAIN_AREA, provideWorkbench} from '@scion/workbench';
      
      bootstrapApplication(AppComponent, {
        providers: [
          provideWorkbench({
            layout: factory => factory
              .addPart(MAIN_AREA)
              .navigatePart(MAIN_AREA, ['path/to/desktop'])
          }),
          provideRouter([
            {
              path: 'path/to/desktop',
              component: DesktopComponent,
            }
          ])
        ]
      });

      // Example for navigating the main area to the empty path route:
      
      import {bootstrapApplication} from '@angular/platform-browser';
      import {provideRouter} from '@angular/router';
      import {canMatchWorkbenchPart, MAIN_AREA, provideWorkbench} from '@scion/workbench';
      
      bootstrapApplication(AppComponent, {
        providers: [
          provideWorkbench({
            layout: factory => factory
              .addPart(MAIN_AREA)
              .navigatePart(MAIN_AREA, [], {hint: 'desktop'}) // pass hint to match a specific empty path route
          }),
          provideRouter([
            {
              path: '',
              component: DesktopComponent,
              canMatch: [canMatchWorkbenchPart('desktop')] // match only if navigating with the specified hint
            }
          ])
        ],
      });

      Alternatively, or for layouts without a main area, provide a desktop using an '<ng-template>' with the 'wbDesktop' directive. The template content will be used as the desktop content.

      <wb-workbench>
        <ng-template wbDesktop>
          Welcome
        </ng-template>
      </wb-workbench>
    `);
  }
}
