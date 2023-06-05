/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Directive, Input, OnDestroy, TemplateRef, ViewContainerRef} from '@angular/core';
import {WbComponentPortal} from './wb-component-portal';

/**
 * Directive version of {@link WbComponentPortal}, enabling declarative use in templates.
 *
 * Unlike `CdkPortalOutlet` the portal is not destroyed on detach.
 *
 * ---
 * Usage:
 *
 * ```html
 * <ng-container *wbPortalOutlet="greeting"></ng-container>
 * <!-- or -->
 * <ng-template [wbPortalOutlet]="greeting"></ng-template>
 * ````
 *
 * @see WbComponentPortal
 */
@Directive({selector: 'ng-template[wbPortalOutlet]', standalone: true})
export class WorkbenchPortalOutletDirective implements OnDestroy {

  private _portal: WbComponentPortal | null = null;

  constructor(private _viewContainerRef: ViewContainerRef, nullTemplate: TemplateRef<void>) {
    // To get notified when Angular is about to destroy the portal, we insert a pseudo-element
    // in front of the portal. When Angular invokes its destroy hook, we detach the portal, so
    // it does not get destroyed.
    this._viewContainerRef.createEmbeddedView(nullTemplate).onDestroy(() => this.detach());
  }

  @Input({alias: 'wbPortalOutlet', required: true}) // eslint-disable-line @angular-eslint/no-input-rename
  public set portal(portal: WbComponentPortal | null) {
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
