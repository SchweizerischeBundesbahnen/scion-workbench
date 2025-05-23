/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Capability, Qualifier} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';
import {Empty} from '../utility-types';

/**
 * Represents the built-in notification for displaying a plain text message to the user.
 *
 * @category Notification
 */
export interface WorkbenchNotificationCapability extends Capability {
  qualifier: Empty<Qualifier>;
  type: WorkbenchCapabilities.Notification;
}
