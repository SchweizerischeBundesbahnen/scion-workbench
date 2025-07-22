/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable} from '@angular/core';
import {ViewDragService, ViewMoveEvent} from '../view-dnd/view-drag.service';
import {Router} from '@angular/router';
import {LocationStrategy} from '@angular/common';
import {ɵWorkbenchRouter} from '../routing/ɵworkbench-router.service';
import {Routing} from '../routing/routing.util';
import {ɵWorkbenchLayoutFactory} from '../layout/ɵworkbench-layout.factory';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Defined} from '@scion/toolkit/util';
import {generatePerspectiveWindowName} from '../perspective/workbench-perspective.service';
import {ANONYMOUS_PERSPECTIVE_ID_PREFIX} from '../workbench.constants';
import {computePartId, computeViewId, WORKBENCH_ID} from '../workbench.identifiers';
import {UID} from '../common/uid.util';
import {filter} from 'rxjs/operators';

/**
 * Updates the workbench layout when receiving a {@link ViewMoveEvent} event relevant for this application.
 */
@Injectable({providedIn: 'root'})
export class ViewMoveHandler {

  private readonly _workbenchId = inject(WORKBENCH_ID);
  private readonly _workbenchRouter = inject(ɵWorkbenchRouter);
  private readonly _workbenchLayoutFactory = inject(ɵWorkbenchLayoutFactory);
  private readonly _router = inject(Router);
  private readonly _locationStrategy = inject(LocationStrategy);

  constructor() {
    this.installViewMoveHandler();
  }

  /**
   * Updates the workbench layout when receiving a {@link ViewMoveEvent} event relevant for this application.
   */
  private async onViewMove(event: ViewMoveEvent): Promise<void> {
    const crossWorkbenchViewDrag = (event.source.workbenchId !== event.target.workbenchId);

    // Check if to remove the view from this workbench instance if being moved to another workbench instance.
    if (crossWorkbenchViewDrag && event.source.workbenchId === this._workbenchId) {
      // Check if to add the view to a new browser window.
      if (event.target.workbenchId === 'new-window') {
        await this.moveViewToNewWindow(event);
      }
      else {
        await this.removeView(event);
      }
    }
    // Check if to add the view to this workbench instance if being moved from another workbench instance to this workbench instance.
    else if (crossWorkbenchViewDrag && event.target.workbenchId === this._workbenchId) {
      await this.addView(event);
    }
    // Move the view within the same workbench instance.
    else {
      await this.moveView(event);
    }
  }

  private async addView(event: ViewMoveEvent): Promise<void> {
    const region = event.target.region;
    const addToNewPart = !!region;
    const commands = Routing.segmentsToCommands(event.source.navigation?.path ?? []);

    await this._workbenchRouter.navigate(layout => {
      const newViewId = event.source.alternativeViewId ?? computeViewId();
      if (addToNewPart) {
        const newPartId = event.target.newPart?.id ?? computePartId();
        return layout
          .addPart(newPartId, {relativeTo: event.target.elementId, align: coerceAlignProperty(region), ratio: event.target.newPart?.ratio}, {structural: false})
          .addView(newViewId, {partId: newPartId, activateView: true, activatePart: true, cssClass: event.source.classList?.get('layout')})
          .modify(layout => event.source.navigation ? layout.navigateView(newViewId, commands, {hint: event.source.navigation.hint, cssClass: event.source.classList?.get('navigation'), data: event.source.navigation.data}) : layout);
      }
      else {
        return layout
          .addView(newViewId, {
            partId: Defined.orElseThrow(event.target.elementId, () => Error(`[ViewMoveError] Target part required for region 'center'.`)),
            position: event.target.position ?? 'after-active-view',
            cssClass: event.source.classList?.get('layout'),
            activateView: true,
            activatePart: true,
          })
          .modify(layout => event.source.navigation ? layout.navigateView(newViewId, commands, {hint: event.source.navigation.hint, cssClass: event.source.classList?.get('navigation'), data: event.source.navigation.data}) : layout);
      }
    });
  }

  private async moveViewToNewWindow(event: ViewMoveEvent): Promise<void> {
    // Open the view "standalone" in a blank window in an anonymous perspective.
    const urlTree = await this._workbenchRouter.createUrlTree(() => {
      const newLayout = this._workbenchLayoutFactory.create();
      const newViewId = event.source.alternativeViewId ?? computeViewId();
      const commands = Routing.segmentsToCommands(event.source.navigation?.path ?? []);
      return newLayout
        .addView(newViewId, {
          partId: newLayout.activePart({grid: 'mainArea'}).id,
          activateView: true,
          cssClass: event.source.classList?.get('layout'),
        })
        .modify(layout => event.source.navigation ? layout.navigateView(newViewId, commands, {hint: event.source.navigation.hint, cssClass: event.source.classList?.get('navigation'), data: event.source.navigation.data}) : layout);
    });
    const target = generatePerspectiveWindowName(`${ANONYMOUS_PERSPECTIVE_ID_PREFIX}${UID.randomUID()}`);
    if (window.open(this._locationStrategy.prepareExternalUrl(this._router.serializeUrl(urlTree!)), target)) {
      await this.removeView(event);
    }
  }

  private async removeView(event: ViewMoveEvent): Promise<void> {
    await this._workbenchRouter.navigate(layout => layout.removeView(event.source.viewId, {force: true}));
  }

  private async moveView(event: ViewMoveEvent): Promise<void> {
    const addToNewPart = !!event.target.region;
    if (addToNewPart) {
      const newPartId = event.target.newPart?.id ?? computePartId();
      await this._workbenchRouter.navigate(layout => layout
        .addPart(newPartId, {relativeTo: event.target.elementId, align: coerceAlignProperty(event.target.region!), ratio: event.target.newPart?.ratio}, {structural: false})
        .moveView(event.source.viewId, newPartId, {activatePart: true, activateView: true}),
      );
    }
    else {
      const targetPartId = Defined.orElseThrow(event.target.elementId, () => Error(`[ViewMoveError] Target part required for region 'center'.`));
      await this._workbenchRouter.navigate(layout => layout.moveView(event.source.viewId, targetPartId, {
        position: event.target.position ?? (event.source.partId === targetPartId ? undefined : 'after-active-view'),
        activateView: true,
        activatePart: true,
      }));
    }
  }

  /**
   * Subscribes to {@link ViewMoveEvent} events relevant for this app instance,
   * invoking {@link onViewMove} for each event and signaling completion once the view has been moved.
   */
  private installViewMoveHandler(): void {
    const viewDragService = inject(ViewDragService);

    viewDragService.viewMove$
      .pipe(
        // Skip events not relevant for this app instance.
        filter(event => event.source.workbenchId === this._workbenchId || event.target.workbenchId === this._workbenchId),
        takeUntilDestroyed(),
      )
      .subscribe(event => {
        void this.onViewMove(event).finally(() => viewDragService.signalViewMoved(event));
      });
  }
}

function coerceAlignProperty(region: 'north' | 'east' | 'south' | 'west' | 'center'): 'left' | 'right' | 'top' | 'bottom' {
  switch (region) {
    case 'west':
      return 'left';
    case 'east':
      return 'right';
    case 'north':
      return 'top';
    case 'south':
      return 'bottom';
    default:
      throw Error(`[UnsupportedRegionError] Supported regions are 'north', 'east', 'south' or 'west', but is '${region}'.`);
  }
}
