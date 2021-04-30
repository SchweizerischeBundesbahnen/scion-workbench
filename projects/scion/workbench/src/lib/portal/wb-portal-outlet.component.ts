/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, Input, OnDestroy, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { WbComponentPortal } from './wb-component-portal';

@Component({
  selector: 'wb-portal-outlet',
  template: '<ng-template></ng-template>',
  styleUrls: ['./wb-portal-outlet.component.scss'],
})
export class WbPortalOutletComponent implements OnDestroy {

  private _portal: WbComponentPortal<any> | undefined;

  @ViewChild(TemplateRef, {read: ViewContainerRef, static: true})
  private _viewContainerRef!: ViewContainerRef;

  @Input('wbPortal') // tslint:disable-line:no-input-rename
  public set portal(portal: WbComponentPortal<any>) {
    this.detachPortal();
    this._portal = portal;
    this.attachPortal();
  }

  public ngOnDestroy(): void {
    this.detachPortal();
  }

  private attachPortal(): void {
    if (this._portal) {
      this._portal.attach(this._viewContainerRef);
    }
  }

  private detachPortal(): void {
    if (this._portal && this._portal.viewContainerRef === this._viewContainerRef) {
      this._portal.detach();
    }
  }
}
