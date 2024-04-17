/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
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
import type {ViewComponent} from '../view/view.component';
import {ViewId} from './workbench-view.model';

/**
 * Resolves the portal for the given view, or throws an error if the view is not registered.
 */
@Pipe({name: 'wbViewPortal', standalone: true})
export class ViewPortalPipe implements PipeTransform {

  constructor(private _viewRegistry: WorkbenchViewRegistry) {
  }

  public transform(viewId: ViewId | null): WbComponentPortal<ViewComponent> | null {
    if (!viewId) {
      return null;
    }
    return this._viewRegistry.get(viewId).portal;
  }
}
