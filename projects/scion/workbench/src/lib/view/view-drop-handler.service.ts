import { Injectable, OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { ViewDragService, ViewMoveEvent } from '../view-dnd/view-drag.service';
import { UUID } from '@scion/toolkit/uuid';
import { Router, UrlSegment } from '@angular/router';
import { ViewOutletNavigator } from '../routing/view-outlet-navigator.service';
import { WorkbenchViewRegistry } from './workbench-view.registry';
import { LocationStrategy } from '@angular/common';
import { PartsLayoutFactory } from '../layout/parts-layout.factory';
import { Subject } from 'rxjs';
import { WorkbenchLayoutService } from '../workbench-layout.service';
import { ɵWorkbenchService } from '../ɵworkbench.service';

/**
 * Subscribes to view move requests for moving views in the {@link PartsLayout} when the user arranges views via drag and drop.
 */
@Injectable({providedIn: 'root'})
export class ViewDropHandler implements OnDestroy {

  private _destroy$ = new Subject<void>();

  constructor(private _workbench: ɵWorkbenchService,
              private _viewOutletNavigator: ViewOutletNavigator,
              private _viewRegistry: WorkbenchViewRegistry,
              private _viewDragService: ViewDragService,
              private _locationStrategy: LocationStrategy,
              private _router: Router,
              private _layoutService: WorkbenchLayoutService,
              private _partsLayoutFactory: PartsLayoutFactory) {
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
          this.removeView(event);
          // Check if to add the view to a new browser window.
          if (event.target.appInstanceId === 'new') {
            this.addViewToNewWindow(event);
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
    this._viewOutletNavigator.navigate({
      partsLayout: this._layoutService.layout
        .activateView(viewId)
        .serialize(),
    }).then();
  }

  private addView(event: ViewMoveEvent): void {
    const addToNewViewPart = (event.target.region || 'center') !== 'center';

    const commands = segmentsToCommands(event.source.viewUrlSegments);
    if (addToNewViewPart) {
      const newViewId = this._viewRegistry.computeNextViewOutletIdentity();
      const newPartId = event.target.newPartId || UUID.randomUUID();
      this._viewOutletNavigator.navigate({
        viewOutlet: {name: newViewId, commands},
        partsLayout: this._layoutService.layout
          .addPart(newPartId, {relativeTo: event.target.partId, align: coerceLayoutAlignment(event.target.region)})
          .addView(newPartId, newViewId)
          .serialize(),
      }).then();
    }
    else {
      const newViewId = this._viewRegistry.computeNextViewOutletIdentity();
      this._viewOutletNavigator.navigate({
        viewOutlet: {name: newViewId, commands},
        partsLayout: this._layoutService.layout
          .addView(event.target.partId, newViewId, event.target.insertionIndex)
          .serialize(),
      }).then();
    }
  }

  private addViewToNewWindow(event: ViewMoveEvent): void {
    const emptyLayout = this._partsLayoutFactory.create();
    const urlTree = this._viewOutletNavigator.createUrlTree({
      viewOutlet: this._viewRegistry.viewIds
        .filter(viewId => viewId !== event.source.viewId) // continue with all other outlets in order to remove them from the URL tree
        .map(viewId => ({name: viewId, commands: null})),
      partsLayout: emptyLayout
        .addView(emptyLayout.activePart.partId, event.source.viewId)
        .serialize(),
    });
    window.open(this._locationStrategy.prepareExternalUrl(this._router.serializeUrl(urlTree)));
  }

  private removeView(event: ViewMoveEvent): void {
    this._workbench.destroyView(event.source.viewId).then();
  }

  private moveView(event: ViewMoveEvent): void {
    const addToNewPart = (event.target.region || 'center') !== 'center';
    if (addToNewPart) {
      const newPartId = event.target.newPartId || UUID.randomUUID();
      this._viewOutletNavigator.navigate({
        partsLayout: this._layoutService.layout
          .addPart(newPartId, {relativeTo: event.target.partId, align: coerceLayoutAlignment(event.target.region)})
          .moveView(event.source.viewId, newPartId)
          .serialize(),
      }).then();
    }
    else {
      this._viewOutletNavigator.navigate({
        partsLayout: this._layoutService.layout
          .moveView(event.source.viewId, event.target.partId, event.target.insertionIndex)
          .serialize(),
      }).then();
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

/**
 * Converts URL segments into an array of routable commands.
 *
 * @see UrlSegment
 * @see Router#navigate
 */
function segmentsToCommands(segments: UrlSegment[]): any[] {
  return segments.reduce((acc: any[], segment: UrlSegment) => {
    return acc.concat(
      segment.path || [],
      segment.parameters && Object.keys(segment.parameters).length ? segment.parameters : [],
    );
  }, []);
}
