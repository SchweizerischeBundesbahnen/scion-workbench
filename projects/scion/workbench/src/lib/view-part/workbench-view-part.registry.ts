/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ComponentFactoryResolver, Injectable, Injector, IterableDiffers } from '@angular/core';
import { WbComponentPortal } from '../portal/wb-component-portal';
import { InternalWorkbenchViewPart, WorkbenchViewPart } from '../workbench.model';
import { WorkbenchLayoutService } from '../workbench-layout.service';
import { VIEW_PART_COMPONENT_TYPE } from '../workbench.constants';
import { PartsLayout } from '../layout/parts-layout';

/**
 * Registry for {WorkbenchViewPart} objects.
 */
@Injectable()
export class WorkbenchViewPartRegistry {

  private readonly _viewPartRegistry = new Map<string, InternalWorkbenchViewPart>();

  constructor(private _differs: IterableDiffers,
              private _injector: Injector,
              private _componentFactoryResolver: ComponentFactoryResolver,
              private _layoutService: WorkbenchLayoutService) {
  }

  /**
   * Applies the given parts layout.
   */
  public setPartsLayout(newPartsLayout: PartsLayout): void {
    const prevLayout = this._layoutService.layout;

    if (prevLayout && prevLayout.serialize() === newPartsLayout.serialize()) {
      return; // no layout change
    }

    // Initialize a part differ
    const viewPartsDiffer = this._differs.find([]).create<string>();
    prevLayout && viewPartsDiffer.diff(prevLayout.parts.map(part => part.partId));

    // Register new part
    const viewPartsChange = viewPartsDiffer.diff(newPartsLayout.parts.map(part => part.partId));
    viewPartsChange && viewPartsChange.forEachAddedItem(({item}) => {
      this._viewPartRegistry.set(item, this.createWorkbenchViewPart(item));
    });

    // Set part properties
    newPartsLayout.parts.forEach(part => this.getElseThrow(part.partId).setPart(part));

    // Apply the layout.
    this._layoutService.setLayout(newPartsLayout);

    // Destroy part which are no longer used.
    //
    // Important note:
    // Destroy part after notifying about the layout change. Otherwise, moving of the last view to another part
    // would fail because the view would already be destroyed.
    viewPartsChange && viewPartsChange.forEachRemovedItem(({item}) => {
      this._viewPartRegistry.get(item).destroy();
      this._viewPartRegistry.delete(item);
    });
  }

  private createWorkbenchViewPart(partId: string): InternalWorkbenchViewPart {
    const portal = new WbComponentPortal(this._componentFactoryResolver, this._injector.get(VIEW_PART_COMPONENT_TYPE));
    const viewPart = new InternalWorkbenchViewPart(partId, portal, this._injector);

    portal.init({
      injectorTokens: new WeakMap()
        .set(WorkbenchViewPart, viewPart)
        .set(InternalWorkbenchViewPart, viewPart),
    });

    return viewPart;
  }

  /**
   * Returns the {@link WorkbenchViewPart} of the given identity, or throws an Error if not found.
   */
  public getElseThrow(partId: string): InternalWorkbenchViewPart {
    const viewPart = this._viewPartRegistry.get(partId);
    if (!viewPart) {
      throw Error(`[NullPartError] Part '${partId}' not found in the registry.`);
    }
    return viewPart;
  }
}
