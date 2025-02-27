/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injector, Pipe, PipeTransform} from '@angular/core';
import {WORKBENCH_PART_REGISTRY} from './workbench-part.registry';
import type {PartComponent} from './part.component';
import type {MainAreaPartComponent} from './main-area-part/main-area-part.component';
import {ComponentPortal} from '@angular/cdk/portal';
import {PartId} from './workbench-part.model';

/**
 * Constructs the portal for the given part in the calling injection context,
 * or throws an error if the part is not registered.
 */
@Pipe({name: 'wbPartPortal'})
export class PartPortalPipe implements PipeTransform {

  private readonly _partRegistry = inject(WORKBENCH_PART_REGISTRY);
  private readonly _injector = inject(Injector);

  public transform(partId: PartId | null): ComponentPortal<PartComponent | MainAreaPartComponent> | null {
    if (!partId) {
      return null;
    }

    return this._partRegistry.get(partId).createPortalFromInjectionContext(this._injector) as ComponentPortal<PartComponent | MainAreaPartComponent>;
  }
}
