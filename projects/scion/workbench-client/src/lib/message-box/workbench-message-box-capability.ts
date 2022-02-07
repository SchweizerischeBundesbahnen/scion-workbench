/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Capability} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';

/**
 * Represents the built-in message box for displaying a plain text message to the user.
 *
 * @category MessageBox
 */
export interface WorkbenchMessageBoxCapability extends Capability {

  qualifier: {};
  type: WorkbenchCapabilities.MessageBox;
}
