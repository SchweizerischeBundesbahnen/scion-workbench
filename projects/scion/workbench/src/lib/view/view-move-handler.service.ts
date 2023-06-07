import {Injectable} from '@angular/core';
import {ViewDragService, ViewMoveEvent} from '../view-dnd/view-drag.service';
import {UUID} from '@scion/toolkit/uuid';
import {Router} from '@angular/router';
import {LocationStrategy} from '@angular/common';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {RouterUtils} from '../routing/router.util';
import {WorkbenchLayoutFactory} from '../layout/workbench-layout-factory.service';
import {MPart} from '../layout/workbench-layout.model';
import {ɵWorkbenchService} from '../ɵworkbench.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/**
 * Updates the workbench layout when the user moves a view.
 */
@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as registered via workbench startup hook. */)
export class ViewMoveHandler {

  constructor(private _workbenchService: ɵWorkbenchService,
              private _workbenchRouter: WorkbenchRouter,
              private _workbenchLayoutFactory: WorkbenchLayoutFactory,
              private _viewDragService: ViewDragService,
              private _router: Router,
              private _locationStrategy: LocationStrategy) {
    this.installViewMoveListener();
  }

  private installViewMoveListener(): void {
    const appInstanceId = this._workbenchService.appInstanceId;

    this._viewDragService.viewMove$
      .pipe(takeUntilDestroyed())
      .subscribe(async (event: ViewMoveEvent) => { // eslint-disable-line rxjs/no-async-subscribe
        // Check if this app instance takes part in the view drag operation. If not, do nothing.
        if (event.source.appInstanceId !== appInstanceId && event.target.appInstanceId !== appInstanceId) {
          return;
        }

        const crossAppInstanceViewDrag = (event.source.appInstanceId !== event.target.appInstanceId);

        // Check if the user dropped the viewtab at the same location. If so, do nothing.
        if (!crossAppInstanceViewDrag && event.source.partId === event.target.partId && event.target.region === 'center') {
          await this.activateView(event.source.viewId);
          return;
        }

        // Check if to remove the view from this app instance if being moved to another app instance.
        if (crossAppInstanceViewDrag && event.source.appInstanceId === appInstanceId) {
          // Check if to add the view to a new browser window.
          if (event.target.appInstanceId === 'new') {
            await this.moveViewToNewWindow(event);
          }
          else {
            await this.removeView(event);
          }
        }
        // Check if to add the view to this app instance if being moved from another app instance to this app instance.
        else if (crossAppInstanceViewDrag && event.target.appInstanceId === appInstanceId) {
          await this.addView(event);
        }
        // Move the view within the same app instance.
        else {
          await this.moveView(event);
        }
      });
  }

  private async activateView(viewId: string): Promise<void> {
    await this._workbenchRouter.ɵnavigate(layout => layout.activateView(viewId, {activatePart: true}));
  }

  private async addView(event: ViewMoveEvent): Promise<void> {
    const region = event.target.region || 'center';
    const addToNewPart = region !== 'center';
    const commands = RouterUtils.segmentsToCommands(event.source.viewUrlSegments);

    await this._workbenchRouter.ɵnavigate(layout => {
      const newViewId = RouterUtils.isPrimaryRouteTarget(event.source.viewId) ? layout.computeNextViewId() : event.source.viewId;
      if (addToNewPart) {
        const newPartId = event.target.newPartId || UUID.randomUUID();
        return {
          layout: layout
            .addPart(newPartId, {relativeTo: event.target.partId!, align: coerceLayoutAlignment(region)}, {structural: false})
            .addView(newViewId, {partId: newPartId, activateView: true, activatePart: true}),
          viewOutlets: {[newViewId]: commands},
        };
      }
      else {
        return {
          layout: layout.addView(newViewId, {partId: event.target.partId!, position: event.target.insertionIndex, activateView: true, activatePart: true}),
          viewOutlets: {[newViewId]: commands},
        };
      }
    });
  }

  private async moveViewToNewWindow(event: ViewMoveEvent): Promise<void> {
    const urlTree = await this._workbenchRouter.createUrlTree(layout => {
      const viewId = event.source.viewId;
      const partId = UUID.randomUUID();

      return {
        layout: this._workbenchLayoutFactory.create({mainGrid: {root: new MPart({id: partId}), activePartId: partId}})
          .addView(viewId, {partId, activateView: true, activatePart: true}),
        viewOutlets: layout.views()
          .map(view => view.id)
          .filter(viewId => viewId !== event.source.viewId)
          .reduce((acc, viewId) => ({...acc, [viewId]: null}), {}),
      };
    });
    if (window.open(this._locationStrategy.prepareExternalUrl(this._router.serializeUrl(urlTree)))) {
      await this.removeView(event);
    }
  }

  private async removeView(event: ViewMoveEvent): Promise<void> {
    const viewId = event.source.viewId;
    await this._workbenchRouter.ɵnavigate(layout => {
      return {
        layout: layout.removeView(viewId),
        viewOutlets: {[viewId]: null},
      };
    });
  }

  private async moveView(event: ViewMoveEvent): Promise<void> {
    const addToNewPart = (event.target.region || 'center') !== 'center';
    if (addToNewPart) {
      const newPartId = event.target.newPartId || UUID.randomUUID();
      await this._workbenchRouter.ɵnavigate(layout => layout
        .addPart(newPartId, {relativeTo: event.target.partId!, align: coerceLayoutAlignment(event.target.region!)}, {structural: false})
        .moveView(event.source.viewId, newPartId, {activatePart: true, activateView: true}),
      );
    }
    else {
      await this._workbenchRouter.ɵnavigate(layout => layout.moveView(event.source.viewId, event.target.partId!, {
        position: event.target.insertionIndex,
        activateView: true,
        activatePart: true,
      }));
    }
  }
}

function coerceLayoutAlignment(region: 'north' | 'east' | 'south' | 'west' | 'center'): 'left' | 'right' | 'top' | 'bottom' {
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
      throw Error(`[UnsupportedRegionError] Supported regions are: 'north', 'east', 'south' or 'west' [actual=${region}]`);
  }
}
