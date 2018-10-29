/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, OnDestroy, Optional, ViewContainerRef } from '@angular/core';
import { ContentHostRef } from './content-host-ref.service';
import { ContentProjectionContext } from './content-projection-context.service';
import { WorkbenchView } from '../workbench.model';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { WorkbenchActivityPartService } from '../activity-part/workbench-activity-part.service';
import { ActivatedRoute } from '@angular/router';


/**
 * Structural component which adds its `ng-content` to a top-level workbench DOM element and projects it into this component's bounding box.
 *
 * This component ensures that its content children are not reparented in the DOM when workbench views are rearranged or activities toggled.
 * For instance, an iframe would reload once it is reparented in the DOM.
 *
 * Use this component to wrap the entire content of your component, so `<wb-content-as-overlay>` is the only root view child of your component.
 *
 * `ng-content` is added to a flex-box container with `flex-direction` set to 'column'.
 * To style elements of `ng-content`, do not combine CSS selectors with :host CSS pseudo-class because not a child of the host component.
 *
 *
 * ---
 * Example HTML template:
 *
 * <wb-content-as-overlay>
 *   <wb-remote-site [url]="..."></wb-remote-site>
 * </wb-content-as-overlay>
 *
 *
 * Example SCSS styles:
 *
 * :host {
 *   display: flex;
 *   > wb-content-as-overlay {
 *     flex: auto;
 *   }
 * }
 *
 * wb-remote-site {
 *   flex: auto;
 * }
 */
@Component({
  selector: 'wb-content-as-overlay',
  templateUrl: './content-as-overlay.component.html',
  styleUrls: ['./content-as-overlay.component.scss']
})
export class ContentAsOverlayComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();
  public contentHost: ViewContainerRef;

  constructor(contentHostRef: ContentHostRef,
              private _contentProjection: ContentProjectionContext,
              @Optional() view: WorkbenchView,
              activityPartService: WorkbenchActivityPartService,
              route: ActivatedRoute) {
    this.contentHost = contentHostRef.get();

    this.installViewActiveListener(view);
    this.installActivityActiveListener(activityPartService, route);
  }

  private installActivityActiveListener(activityService: WorkbenchActivityPartService, route: ActivatedRoute): void {
    const activity = activityService.getActivityFromRoutingContext(route.snapshot);
    activity && activity.active$
      .pipe(takeUntil(this._destroy$))
      .subscribe(active => this._contentProjection.setActive(active));
  }

  private installViewActiveListener(view: WorkbenchView): void {
    view && view.active$
      .pipe(takeUntil(this._destroy$))
      .subscribe(active => this._contentProjection.setActive(active));
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._contentProjection.setActive(false);
  }
}
