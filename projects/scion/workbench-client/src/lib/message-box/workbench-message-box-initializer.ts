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
import {ɵWorkbenchMessageBox} from './ɵworkbench-message-box.model';
import {WorkbenchMessageBox} from './workbench-message-box.model';
import {ɵMESSAGE_BOX_CONTEXT, ɵMessageBoxContext} from './ɵworkbench-message-box-context';
import {WORKBENCH_ELEMENT} from '../workbench.model';

/**
 * Registers {@link WorkbenchMessageBox} in the bean manager if in the context of a workbench message box.
 *
 * @internal
 */
export class WorkbenchMessageBoxInitializer implements Initializer {

  public async init(): Promise<void> {
    const messageBoxContext = await Beans.get(ContextService).lookup<ɵMessageBoxContext>(ɵMESSAGE_BOX_CONTEXT);
    if (messageBoxContext !== null) {
      // Handles must be registered with `useFactory` to support the bean manager's PreDestroy lifecycle hook.
      Beans.register(WorkbenchMessageBox, {useFactory: () => new ɵWorkbenchMessageBox(messageBoxContext)});
      Beans.register(WORKBENCH_ELEMENT, {useExisting: WorkbenchMessageBox});
    }
  }
}
