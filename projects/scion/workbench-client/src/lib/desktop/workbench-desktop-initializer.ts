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
import {WorkbenchDesktop} from './workbench-desktop';
import {ɵDESKTOP_CONTEXT_KEY, ɵWorkbenchDesktop} from './ɵworkbench-desktop';

/**
 * Registers {@link WorkbenchDesktop} in the bean manager if in the context of a workbench desktop.
 *
 * @internal
 */
export class WorkbenchDesktopInitializer implements Initializer {

  public async init(): Promise<void> {
    const desktopContext = await Beans.get(ContextService).lookup<boolean>(ɵDESKTOP_CONTEXT_KEY);
    if (desktopContext) {
      Beans.register(WorkbenchDesktop, {useValue: new ɵWorkbenchDesktop()});
    }
  }
}
