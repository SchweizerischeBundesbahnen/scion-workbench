/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';
import {ɵWorkbenchPart} from './ɵworkbench-part.model';
import {WorkbenchElementRegistry} from '../registry/workbench-element-registry';
import {PartId} from '../workbench.identifiers';

/**
 * Registry for {@link WorkbenchPart} elements.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchPartRegistry extends WorkbenchElementRegistry<PartId, ɵWorkbenchPart> {
  constructor() {
    super({
      nullElementErrorFn: partId => Error(`[NullPartError] Part '${partId}' not found.`),
      onUnregister: part => part.destroy(),
    });
  }
}
