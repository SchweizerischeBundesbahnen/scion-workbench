import {Injectable, OnDestroy} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {ViewDragService, ViewMoveEvent} from '../view-dnd/view-drag.service';
import {UUID} from '@scion/toolkit/uuid';
import {Router} from '@angular/router';
import {WorkbenchViewRegistry} from './workbench-view.registry';
import {LocationStrategy} from '@angular/common';
import {Subject} from 'rxjs';
import {ɵWorkbenchService} from '../ɵworkbench.service';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {RouterUtils} from '../routing/router.util';

/**
 * Subscribes to view move requests for moving views in the {@link PartsLayout} when the user arranges views via drag and drop or view context menu.
 */
@Injectable()
export class ViewMoveHandler implements OnDestroy {

  private _destroy$ = new Subject<void>();

  constructor(private _workbench: ɵWorkbenchService,
              private _viewRegistry: WorkbenchViewRegistry,
              private _viewDragService: ViewDragService,
              private _locationStrategy: LocationStrategy,
              private _router: Router,
              private _workbenchRouter: WorkbenchRouter) {
    this.installViewMoveListener();
  }

  private installViewMoveListener(): void {
    const appInstanceId = this._workbench.appInstanceId;

    this._viewDragService.viewMove$
      .pipe(takeUntil(this._destroy$))
      .subscribe((event: ViewMoveEvent) => {
        // Check if this app instance takes part in the view drag operation. If not, do nothing.
        if (event.source.appInstanceId !== appInstanceId && event.target.appInstanceId !== appInstanceId) {
          return;
        }

        const crossAppInstanceViewDrag = (event.source.appInstanceId !== event.target.appInstanceId);

        // Check if the user dropped the viewtab at the same location. If so, do nothing.
        if (!crossAppInstanceViewDrag && event.source.partId === event.target.partId && event.target.region === 'center') {
          this.activateView(event.source.viewId);
          return;
        }

        // Check if to remove the view from this app instance if being moved to another app instance.
        if (crossAppInstanceViewDrag && event.source.appInstanceId === appInstanceId) {
          // Check if to add the view to a new browser window.
          if (event.target.appInstanceId === 'new') {
            this.moveViewToNewWindow(event);
          }
          else {
            this.removeView(event);
          }
        }
        // Check if to add the view to this app instance if being moved from another app instance to this app instance.
        else if (crossAppInstanceViewDrag && event.target.appInstanceId === appInstanceId) {
          this.addView(event);
        }
        // Move the view within the same app instance.
        else {
          this.moveView(event);
        }
      });
  }

  private activateView(viewId: string): void {
    this._workbenchRouter.ɵnavigate(layout => layout.activateView(viewId)).then();
  }

  private addView(event: ViewMoveEvent): void {
    const region = event.target.region || 'center';
    const addToNewViewPart = region !== 'center';

    const commands = RouterUtils.segmentsToCommands(event.source.viewUrlSegments);
    if (addToNewViewPart) {
      const newViewId = this._viewRegistry.computeNextViewOutletIdentity();
      const newPartId = event.target.newPartId || UUID.randomUUID();
      this._workbenchRouter.ɵnavigate(layout => ({
        layout: layout
          .addPart(newPartId, {relativeTo: event.target.partId ?? undefined, align: coerceLayoutAlignment(region)})
          .addView(newPartId, newViewId),
        viewOutlets: {[newViewId]: commands},
      })).then();
    }
    else {
      const newViewId = this._viewRegistry.computeNextViewOutletIdentity();
      this._workbenchRouter.ɵnavigate(layout => ({
        layout: layout.addView(event.target.partId!, newViewId, event.target.insertionIndex),
        viewOutlets: {[newViewId]: commands},
      })).then();
    }
  }

  private async moveViewToNewWindow(event: ViewMoveEvent): Promise<void> {
    const urlTree = await this._workbenchRouter.createUrlTree(layout => ({
      layout: layout.clear(),
      viewOutlets: layout.viewsIds
        .filter(viewId => viewId !== event.source.viewId)
        .reduce((acc, viewId) => ({...acc, [viewId]: null}), {}),
    }));
    if (window.open(this._locationStrategy.prepareExternalUrl(this._router.serializeUrl(urlTree)))) {
      this.removeView(event);
    }
  }

  private removeView(event: ViewMoveEvent): void {
    this._workbench.destroyView(event.source.viewId).then();
  }

  private moveView(event: ViewMoveEvent): void {
    const addToNewPart = (event.target.region || 'center') !== 'center';
    if (addToNewPart) {
      const newPartId = event.target.newPartId || UUID.randomUUID();
      this._workbenchRouter.ɵnavigate(layout => layout
        .addPart(newPartId, {relativeTo: event.target.partId!, align: coerceLayoutAlignment(event.target.region!)})
        .moveView(event.source.viewId, newPartId),
      ).then();
    }
    else {
      this._workbenchRouter.ɵnavigate(layout => layout.moveView(event.source.viewId, event.target.partId!, event.target.insertionIndex)).then();
    }
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
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
      throw Error(`[UnsupportedRegionError] Supported regions are: \'north\', \'east\', \'south\' or \'west\' [actual=${region}]`);
  }
}
