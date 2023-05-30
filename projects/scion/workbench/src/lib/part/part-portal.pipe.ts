/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injector, Pipe, PipeTransform} from '@angular/core';
import {WorkbenchPartRegistry} from './workbench-part.registry';
import type {PartComponent} from './part.component';
import type {MainAreaLayoutComponent} from '../layout/main-area-layout/main-area-layout.component';
import {ComponentPortal} from '@angular/cdk/portal';

/**
 * Constructs the portal for the given part in the calling injection context,
 * or throws an error if the part is not registered.
 */
@Pipe({name: 'wbPartPortal', standalone: true})
export class PartPortalPipe implements PipeTransform {

  constructor(private _partRegistry: WorkbenchPartRegistry, private _injector: Injector) {
  }

  public transform(partId: string | null): ComponentPortal<PartComponent | MainAreaLayoutComponent> | null {
    if (!partId) {
      return null;
    }

    return this._partRegistry.get(partId).createPortalFromInjectionContext(this._injector);
  }
}
