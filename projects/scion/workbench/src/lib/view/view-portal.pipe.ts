/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Pipe, PipeTransform} from '@angular/core';
import {WorkbenchViewRegistry} from './workbench-view.registry';
import {WbComponentPortal} from '../portal/wb-component-portal';
import {ViewComponent} from '../view/view.component';

/**
 * Resolves the portal for a given view id, or `null` if not found.
 */
@Pipe({name: 'wbViewPortal'})
export class ViewPortalPipe implements PipeTransform {

  constructor(private _viewRegistry: WorkbenchViewRegistry) {
  }

  public transform(viewId: string | null): WbComponentPortal<ViewComponent> | null {
    if (!viewId) {
      return null;
    }
    return this._viewRegistry.getElseNull(viewId)?.portal ?? null;
  }
}
