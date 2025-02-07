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
 * <ng-container *wbPortalOutlet="greeting"/>
 * <!-- or -->
 * <ng-template [wbPortalOutlet]="greeting"/>
 * ````
 *
 * @see WbComponentPortal
 */
@Directive({selector: 'ng-template[wbPortalOutlet]', standalone: true})
export class WorkbenchPortalOutletDirective implements OnDestroy {

  private _portal: WbComponentPortal | null = null;

  constructor(private _viewContainerRef: ViewContainerRef, nullTemplate: TemplateRef<void>) {
    // To get notified before Angular destroys the portal, we insert a pseudo-element ahead of it.
    // This pseudo-element gets destroyed first, allowing us to detach the portal and prevent its destruction.
    this._viewContainerRef.createEmbeddedView(nullTemplate).onDestroy(() => this.detach());
    // Additionally, we add an extra element between the pseudo-element and the portal to not break Angular's destroy algorithm.
    // Angular's destroy algorithm terminates when an element removes its immediate successor during destruction, but it continues
    // if the next but one element is removed instead. It is crucial to insert this intermediary element; otherwise, unmounting
    // the workbench with opened views would fail to destroy the workbench component entirely.
    // See tests `workbench-ummount.e2e-spec`.
    this._viewContainerRef.createEmbeddedView(nullTemplate);
  }

  @Input({alias: 'wbPortalOutlet', required: true})
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
