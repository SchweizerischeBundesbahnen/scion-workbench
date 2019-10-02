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
import { PartsLayoutProvider } from './view-part-grid-provider.service';
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
              private _layoutService: WorkbenchLayoutService,
              private _partsLayoutProvider: PartsLayoutProvider) {
  }

  /**
   * Sets the given viewpart grid.
   */
  public setPartsLayout(newPartsLayout: PartsLayout): void {
    const prevLayout = this._partsLayoutProvider.layout;

    if (prevLayout && prevLayout.serialize() === newPartsLayout.serialize()) {
      return; // no layout change
    }

    // Initialize a viewpart differ
    const viewPartsDiffer = this._differs.find([]).create<string>();
    prevLayout && viewPartsDiffer.diff(prevLayout.parts.map(part => part.partId));

    // Register new viewparts
    const viewPartsChange = viewPartsDiffer.diff(newPartsLayout.parts.map(part => part.partId));
    viewPartsChange && viewPartsChange.forEachAddedItem(({item}) => {
      this._viewPartRegistry.set(item, this.createWorkbenchViewPart(item));
    });

    // Set part properties
    newPartsLayout.parts.forEach(part => this.getElseThrow(part.partId).setPart(part));

    // Notify about the grid change
    this._partsLayoutProvider.setLayout(newPartsLayout);

    // Destroy viewparts which are no longer used.
    //
    // Important note:
    // Destroy viewparts after notifying about the grid change. Otherwise, moving of the last viewpart-view to another viewpart
    // would fail because the view would already be destroyed.
    viewPartsChange && viewPartsChange.forEachRemovedItem(({item}) => {
      this._viewPartRegistry.get(item).portal.destroy();
      this._viewPartRegistry.delete(item);
    });

    this._layoutService.afterGridChange$.next();
  }

  private createWorkbenchViewPart(partId: string): InternalWorkbenchViewPart {
    const portal = new WbComponentPortal(this._componentFactoryResolver, this._injector.get(VIEW_PART_COMPONENT_TYPE));
    const viewPart = new InternalWorkbenchViewPart(partId, portal);

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
      throw Error(`[IllegalStateError] Part '${partId}' not contained in the part registry`);
    }
    return viewPart;
  }
}
