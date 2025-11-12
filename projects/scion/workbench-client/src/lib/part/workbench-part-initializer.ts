/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Beans, Initializer} from '@scion/toolkit/bean-manager';
import {ContextService} from '@scion/microfrontend-platform';
import {ɵWorkbenchPart} from './ɵworkbench-part';
import {WorkbenchPart} from './workbench-part';
import {ɵWORKBENCH_PART_CONTEXT, ɵWorkbenchPartContext} from './ɵworkbench-part-context';
import {WORKBENCH_ELEMENT} from '../workbench.model';

/**
 * Registers {@link WorkbenchPart} in the bean manager if in the context of a workbench part.
 *
 * @internal
 */
export class WorkbenchPartInitializer implements Initializer {

  public async init(): Promise<void> {
    const partContext = await Beans.get(ContextService).lookup<ɵWorkbenchPartContext>(ɵWORKBENCH_PART_CONTEXT);
    if (partContext !== null) {
      Beans.register(WorkbenchPart, {useValue: new ɵWorkbenchPart(partContext)});
      Beans.register(WORKBENCH_ELEMENT, {useExisting: WorkbenchPart});
    }
  }
}
