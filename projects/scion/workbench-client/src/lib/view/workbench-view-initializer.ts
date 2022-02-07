/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {Beans, Initializer} from '@scion/toolkit/bean-manager';
import {ContextService} from '@scion/microfrontend-platform';
import {WorkbenchView} from './workbench-view';
import {ɵVIEW_ID_CONTEXT_KEY, ɵWorkbenchView} from './ɵworkbench-view';

/**
 * Registers {@link WorkbenchView} in the bean manager if in the context of a workbench view.
 *
 * @internal
 */
export class WorkbenchViewInitializer implements Initializer {

  public async init(): Promise<void> {
    const viewId = await Beans.get(ContextService).lookup<string>(ɵVIEW_ID_CONTEXT_KEY);
    if (viewId !== null) {
      const workbenchView = new ɵWorkbenchView(viewId);
      Beans.register(WorkbenchView, {useValue: workbenchView});
      // Wait until the view received the initial params, allowing a microfrontend to access the snapshot params in its constructor.
      await workbenchView.whenInitialParams;
    }
  }
}
