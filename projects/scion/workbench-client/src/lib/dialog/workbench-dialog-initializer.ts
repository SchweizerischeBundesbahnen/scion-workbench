/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Beans, Initializer} from '@scion/toolkit/bean-manager';
import {ContextService} from '@scion/microfrontend-platform';
import {ɵDIALOG_CONTEXT, ɵDialogContext} from './ɵworkbench-dialog-context';
import {WorkbenchDialog} from './workbench-dialog';
import {ɵWorkbenchDialog} from './ɵworkbench-dialog';
import {WORKBENCH_ELEMENT} from '../workbench.model';

/**
 * Registers {@link WorkbenchDialog} in the bean manager if in the context of a workbench dialog.
 *
 * @internal
 */
export class WorkbenchDialogInitializer implements Initializer {

  public async init(): Promise<void> {
    const dialogContext = await Beans.get(ContextService).lookup<ɵDialogContext>(ɵDIALOG_CONTEXT);
    if (dialogContext !== null) {
      Beans.register(WorkbenchDialog, {useValue: new ɵWorkbenchDialog(dialogContext)});
      Beans.register(WORKBENCH_ELEMENT, {useExisting: WorkbenchDialog});
    }
  }
}
