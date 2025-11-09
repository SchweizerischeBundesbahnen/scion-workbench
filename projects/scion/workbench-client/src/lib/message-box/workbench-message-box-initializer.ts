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
import {ɵWorkbenchMessageBox} from './ɵworkbench-message-box';
import {WorkbenchMessageBox} from './workbench-message-box';
import {ɵMESSAGE_BOX_CONTEXT, ɵMessageBoxContext} from './ɵworkbench-message-box-context';

/**
 * Registers {@link WorkbenchMessageBox} in the bean manager if in the context of a workbench message box.
 *
 * @internal
 */
export class WorkbenchMessageBoxInitializer implements Initializer {

  public async init(): Promise<void> {
    const messageBoxContext = await Beans.get(ContextService).lookup<ɵMessageBoxContext>(ɵMESSAGE_BOX_CONTEXT);
    if (messageBoxContext !== null) {
      Beans.register(WorkbenchMessageBox, {useValue: new ɵWorkbenchMessageBox(messageBoxContext)});
      Beans.register(Symbol.for('WORKBENCH_ELEMENT'), {useExisting: WorkbenchMessageBox});
    }
  }
}
