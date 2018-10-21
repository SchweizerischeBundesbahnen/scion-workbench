import { Injectable, OnDestroy } from '@angular/core';
import { ViewOutletAddEvent, ViewOutletUrlObserver } from './view-outlet-url-observer.service';
import { WorkbenchViewRegistry } from '../workbench-view-registry.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ViewPartGridUrlObserver } from '../view-part-grid/view-part-grid-url-observer.service';

/**
 * Keeps {WorkbenchViewRegistry} in sync with view outlets as specified in the application URL.
 *
 * If a new view is detected in the application URL, it is added to the registry, or removed otherwise.
 */
@Injectable()
export class ViewRegistrySynchronizer implements OnDestroy {

  private readonly _destroy$ = new Subject<void>();

  constructor(viewOutletUrlObserver: ViewOutletUrlObserver, viewRegistry: WorkbenchViewRegistry, gridObserver: ViewPartGridUrlObserver) {
    viewOutletUrlObserver.viewOutletAdd$
      .pipe(takeUntil(this._destroy$))
      .subscribe((event: ViewOutletAddEvent) => {
        const viewPartGrid = gridObserver.parseUrl(event.activationUrl);
        viewRegistry.addViewOutlet(event.viewRef, viewPartGrid && viewPartGrid.isViewActive(event.viewRef) || false);
      });

    viewOutletUrlObserver.viewOutletRemove$
      .pipe(takeUntil(this._destroy$))
      .subscribe((viewRef: string) => {
        viewRegistry.removeViewOutlet(viewRef);
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
