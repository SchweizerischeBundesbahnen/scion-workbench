/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Directive, effect, inject, input, TemplateRef, untracked, ViewContainerRef} from '@angular/core';
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
@Directive({selector: 'ng-template[wbPortalOutlet]'})
export class WorkbenchPortalOutletDirective {

  public readonly portal = input.required<WbComponentPortal | null>({alias: 'wbPortalOutlet'});
  public readonly detachable = input<boolean>(false, {alias: 'wbPortalOutletDetachable'});

  private readonly _viewContainerRef = inject(ViewContainerRef);

  constructor() {
    this.installDetachTrigger(); // must be called before `installPortal`.
    this.installPortal();
  }

  /**
   * Attaches the portal, detaching the previous portal, if any.
   */
  private installPortal(): void {
    effect(onCleanup => {
      const portal = this.portal();
      untracked(() => this.attach(portal));
      onCleanup(() => this.detach(portal));
    });
  }

  /**
   * Installs a trigger to detach the portal if about to be destroyed.
   */
  private installDetachTrigger(): void {
    const nullTemplate = inject(TemplateRef) as TemplateRef<void>;

    const effectRef = effect(() => {
      effectRef.destroy();

      if (!this.detachable()) {
        return;
      }

      // To get notified before Angular destroys the portal, we insert a pseudo-element ahead of it.
      // This pseudo-element gets destroyed first, allowing us to detach the portal and prevent its destruction.
      this._viewContainerRef.createEmbeddedView(nullTemplate).onDestroy(() => this.detach(this.portal()));

      // Additionally, we add an extra element between the pseudo-element and the portal to not break Angular's destroy algorithm.
      // Angular's destroy algorithm terminates when an element removes its immediate successor during destruction, but it continues
      // if the next but one element is removed instead. It is crucial to insert this intermediary element; otherwise, unmounting
      // the workbench with opened views would fail to destroy the workbench component entirely.
      // See tests `workbench-unmount.e2e-spec.ts`.
      this._viewContainerRef.createEmbeddedView(nullTemplate);
    });
  }

  private attach(portal: WbComponentPortal | null): void {
    portal?.attach(this._viewContainerRef);
  }

  private detach(portal: WbComponentPortal | null): void {
    if (!portal?.isAttachedTo(this._viewContainerRef)) {
      return;
    }

    if (this.detachable()) {
      portal.detach();
    }
    else {
      portal.destroy();
    }
  }
}
