/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { AfterViewInit, Component, Input, OnDestroy, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { WbComponentPortal } from './wb-component-portal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'wb-portal-outlet',
  template: '<ng-template></ng-template>',
  styleUrls: ['./wb-portal-outlet.component.scss']
})
export class WbPortalOutletComponent implements AfterViewInit, OnDestroy {

  private _portal: WbComponentPortal<any>;
  private _portalChange$ = new Subject<void>();
  private _destroy$ = new Subject<void>();

  @ViewChild(TemplateRef, {read: ViewContainerRef})
  private _viewContainerRef: ViewContainerRef;

  @Input('wbPortal') // tslint:disable-line:no-input-rename
  public set portal(portal: WbComponentPortal<any>) {
    this._portalChange$.next();

    this.doIfAttached((): void => this._portal.setViewContainerRef(null));
    this._portal = portal;

    if (this._portal) {
      this._portal.setViewContainerRef(this._viewContainerRef);
      this._portal.outletRequestViewContainerRef$
        .pipe(
          takeUntil(this._portalChange$),
          takeUntil(this._destroy$))
        .subscribe(() => this._portal.setViewContainerRef(this._viewContainerRef));
    }
  }

  public ngAfterViewInit(): void {
    this._portal && this._portal.setViewContainerRef(this._viewContainerRef);
  }

  public ngOnDestroy(): void {
    this.doIfAttached((): void => this._portal.setViewContainerRef(null));
    this._destroy$.next();
  }

  private doIfAttached(fn: () => void): void {
    this._portal && this._portal.viewContainerRef === this._viewContainerRef && fn();
  }
}
