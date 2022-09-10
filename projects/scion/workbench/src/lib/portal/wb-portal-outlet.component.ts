/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, Input, OnDestroy, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {WbComponentPortal} from './wb-component-portal';

@Component({
  selector: 'wb-portal-outlet',
  template: '<ng-template></ng-template>',
  styleUrls: ['./wb-portal-outlet.component.scss'],
})
export class WbPortalOutletComponent implements OnDestroy {

  private _portal: WbComponentPortal<any> | null = null;

  @ViewChild(TemplateRef, {read: ViewContainerRef, static: true})
  private _viewContainerRef!: ViewContainerRef;

  @Input('wbPortal') // eslint-disable-line @angular-eslint/no-input-rename
  public set portal(portal: WbComponentPortal<any> | null) {
    this.detach();
    this._portal = portal;
    this.attach();
  }

  private attach(): void {
    this._portal?.attach(this._viewContainerRef);
  }

  private detach(): void {
    if (this._portal?.isAttachedTo(this._viewContainerRef)) {
      this._portal.detach();
    }
  }

  public ngOnDestroy(): void {
    this.detach();
  }
}
