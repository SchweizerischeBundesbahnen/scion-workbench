/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Pipe, PipeTransform} from '@angular/core';
import {WORKBENCH_PART_REGISTRY} from './workbench-part.registry';
import type {PartComponent} from './part.component';
import {PartId} from '../workbench.identifiers';
import {WbComponentPortal} from '../portal/wb-component-portal';
import {MainAreaPartComponent} from './main-area-part/main-area-part.component';

/**
 * Resolves to the portal of given part, or throws an error if the part is not registered.
 */
@Pipe({name: 'wbPartPortal'})
export class PartPortalPipe implements PipeTransform {

  private readonly _partRegistry = inject(WORKBENCH_PART_REGISTRY);

  public transform(partId: PartId | null): WbComponentPortal<PartComponent | MainAreaPartComponent> | null {
    if (!partId) {
      return null;
    }

    return this._partRegistry.get(partId).portal;
  }
}
