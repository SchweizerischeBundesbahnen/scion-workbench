/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {MicrofrontendPlatformClient} from '@scion/microfrontend-platform';
import {WorkbenchDesktop} from './workbench-desktop';

export class ɵWorkbenchDesktop implements WorkbenchDesktop {

  /**
   * @inheritDoc
   */
  public signalReady(): void {
    MicrofrontendPlatformClient.signalReady();
  }
}

/**
 * Context key to check if microfrontend is embedded in the context of a workbench desktop.
 *
 * @docs-private Not public API, intended for internal use only.
 * @ignore
 * @see {@link ContextService}
 */
export const ɵDESKTOP_CONTEXT_KEY = 'ɵworkbench.desktop';
