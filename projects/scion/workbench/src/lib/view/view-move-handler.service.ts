import {Inject, Injectable, Injector} from '@angular/core';
import {ViewDragService, ViewMoveEvent} from '../view-dnd/view-drag.service';
import {UUID} from '@scion/toolkit/uuid';
import {Router} from '@angular/router';
import {LocationStrategy} from '@angular/common';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {RouterUtils} from '../routing/router.util';
import {ɵWorkbenchLayoutFactory} from '../layout/ɵworkbench-layout.factory';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Defined} from '@scion/toolkit/util';
import {generatePerspectiveWindowName} from '../perspective/workbench-perspective.service';
import {ANONYMOUS_PERSPECTIVE_ID_PREFIX} from '../workbench.constants';
import {MAIN_AREA_INITIAL_PART_ID} from '../layout/ɵworkbench-layout';
import {WORKBENCH_ID} from '../workbench-id';

/**
 * Updates the workbench layout when the user moves a view.
 */
@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as registered via workbench startup hook. */)
export class ViewMoveHandler {

  constructor(@Inject(WORKBENCH_ID) private _workbenchId: string,
              private _workbenchRouter: WorkbenchRouter,
              private _workbenchLayoutFactory: ɵWorkbenchLayoutFactory,
              private _viewDragService: ViewDragService,
              private _router: Router,
              private _locationStrategy: LocationStrategy,
              private _injector: Injector) {
    this.installViewMoveListener();
  }

  private installViewMoveListener(): void {
    this._viewDragService.viewMove$
      .pipe(takeUntilDestroyed())
      .subscribe(async (event: ViewMoveEvent) => { // eslint-disable-line rxjs/no-async-subscribe
        // Check if this workbench instance takes part in the view drag operation. If not, do nothing.
        if (event.source.workbenchId !== this._workbenchId && event.target.workbenchId !== this._workbenchId) {
          return;
        }

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
      });
  }

  private async addView(event: ViewMoveEvent): Promise<void> {
    const region = event.target.region;
    const addToNewPart = !!region;
    const commands = RouterUtils.segmentsToCommands(event.source.viewUrlSegments);

    await this._workbenchRouter.ɵnavigate(layout => {
      const newViewId = RouterUtils.isPrimaryRouteTarget(event.source.viewId) ? layout.computeNextViewId() : event.source.viewId;
      if (addToNewPart) {
        const newPartId = event.target.newPart?.id ?? UUID.randomUUID();
        return {
          layout: layout
            .addPart(newPartId, {relativeTo: event.target.elementId, align: coerceAlignProperty(region!), ratio: event.target.newPart?.ratio}, {structural: false})
            .addView(newViewId, {partId: newPartId, activateView: true, activatePart: true}),
          viewOutlets: {[newViewId]: commands},
        };
      }
      else {
        return {
          layout: layout.addView(newViewId, {
            partId: Defined.orElseThrow(event.target.elementId, () => Error(`[IllegalArgumentError] Target part mandatory for region 'center'.`)),
            position: event.target.position ?? 'after-active-view',
            activateView: true,
            activatePart: true,
          }),
          viewOutlets: {[newViewId]: commands},
        };
      }
    });
  }

  private async moveViewToNewWindow(event: ViewMoveEvent): Promise<void> {
    // Open the view "standalone" in a blank window in an anonymous perspective.
    const urlTree = await this._workbenchRouter.createUrlTree(layout => {
      const mainAreaPartId = UUID.randomUUID();

      return {
        layout: this._workbenchLayoutFactory
          .create({
            injector: Injector.create({
              parent: this._injector,
              // Instruct factory not to use UUID as identity for the initial part of the main area
              providers: [{provide: MAIN_AREA_INITIAL_PART_ID, useValue: mainAreaPartId}],
            }),
          })
          .addView(event.source.viewId, {
              partId: mainAreaPartId,
              activateView: true,
              activatePart: true,
            },
          ),
        viewOutlets: layout.views() // Remove other views
          .map(view => view.id)
          .filter(viewId => viewId !== event.source.viewId)
          .reduce((acc, viewId) => ({...acc, [viewId]: null}), {}),
      };
    });
    const target = generatePerspectiveWindowName(`${ANONYMOUS_PERSPECTIVE_ID_PREFIX}${UUID.randomUUID()}`);
    if (window.open(this._locationStrategy.prepareExternalUrl(this._router.serializeUrl(urlTree)), target)) {
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
    const addToNewPart = !!event.target.region;
    if (addToNewPart) {
      const newPartId = event.target.newPart?.id ?? UUID.randomUUID();
      await this._workbenchRouter.ɵnavigate(layout => layout
        .addPart(newPartId, {relativeTo: event.target.elementId, align: coerceAlignProperty(event.target.region!), ratio: event.target.newPart?.ratio}, {structural: false})
        .moveView(event.source.viewId, newPartId, {activatePart: true, activateView: true}),
      );
    }
    else {
      const targetPartId = Defined.orElseThrow(event.target.elementId, () => Error(`[IllegalArgumentError] Target part mandatory for region 'center'.`));
      await this._workbenchRouter.ɵnavigate(layout => layout.moveView(event.source.viewId, targetPartId, {
        position: event.target.position ?? (event.source.partId === targetPartId ? undefined : 'after-active-view'),
        activateView: true,
        activatePart: true,
      }));
    }
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
