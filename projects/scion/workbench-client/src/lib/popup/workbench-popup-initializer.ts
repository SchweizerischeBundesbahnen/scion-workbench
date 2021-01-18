/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Beans, Initializer } from '@scion/toolkit/bean-manager';
import { ContextService } from '@scion/microfrontend-platform';
import { WorkbenchPopup, ɵWorkbenchPopup } from './workbench-popup';
import { ɵPOPUP_CONTEXT, ɵPopupContext } from './workbench-popup-context';

/**
 * Registers {@link WorkbenchPopup} in the bean manager if in the context of a workbench popup.
 *
 * @internal
 */
export class WorkbenchPopupInitializer implements Initializer {

  public async init(): Promise<void> {
    const popupContext = await Beans.get(ContextService).lookup<ɵPopupContext>(ɵPOPUP_CONTEXT);
    if (popupContext !== null) {
      Beans.register(WorkbenchPopup, {useValue: new ɵWorkbenchPopup(popupContext)});
    }
  }
}
