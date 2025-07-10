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
 * Renders a {@link WbComponentPortal}, similar to `CdkPortalOutlet`, but with the option to detach it when destroying this directive.
 *
 * Usage:
 *
 * ```html
 * <ng-container *wbPortalOutlet="portal; destroyOnDetach: true"/>
 * ````
 *
 * @see WbComponentPortal
 */
@Directive({selector: 'ng-template[wbPortalOutlet]'})
export class WorkbenchPortalOutletDirective {

  /**
   * Specifies the portal.
   */
  public readonly portal = input.required<WbComponentPortal | null | undefined>({alias: 'wbPortalOutlet'});

  /**
   * Controls if to detach the portal's component instead of destroying it when this directive is destroyed, such as during a page re-layout
   */
  public readonly destroyOnDetach = input.required<boolean>({alias: 'wbPortalOutletDestroyOnDetach'});

  private readonly _viewContainerRef = inject(ViewContainerRef);

  constructor() {
    const nullTemplate = inject(TemplateRef) as TemplateRef<void>;

    // Insert a pseudo-element before the portal to detect when Angular is about to destroy the portal.
    // This element gets destroyed first, enabling the portal to detach to prevent destruction.
    this._viewContainerRef.createEmbeddedView(nullTemplate).onDestroy(() => !this.destroyOnDetach() && this.detach(this.portal()));

    // Add an extra element between the pseudo-element and the portal to prevent breaking Angular's destroy algorithm.
    // Angular's destroy algorithm terminates when an element removes its immediate successor during destruction, but it continues
    // if the next but one element is removed instead. It is crucial to insert this intermediary element; otherwise, unmounting
    // the workbench with opened views would fail to destroy the workbench component entirely.
    // Refer to tests in `workbench-unmount.e2e-spec.ts`.
    this._viewContainerRef.createEmbeddedView(nullTemplate);

    // Install the portal.
    effect(onCleanup => {
      const portal = this.portal();
      untracked(() => this.attach(portal));
      onCleanup(() => this.detach(portal));
    });
  }

  private attach(portal: WbComponentPortal | null | undefined): void {
    portal?.attach(this._viewContainerRef);
  }

  private detach(portal: WbComponentPortal | null | undefined): void {
    if (!portal?.isAttachedTo(this._viewContainerRef)) {
      return;
    }

    if (this.destroyOnDetach()) {
      portal.destroy();
    }
    else {
      portal.detach();
    }
  }
}
