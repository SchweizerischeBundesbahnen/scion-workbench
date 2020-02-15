/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Observable } from 'rxjs';
import { PlatformConfig } from './platform-config';

/**
 * Allows loading the config of applications running in the platform and platform properties asynchronously, e.g. from a backend.
 *
 * Using a {@link PlatformConfigLoader} allows a more flexible platform setup than providing a static config. For example, depending
 * on the browser URL, a different config can be loaded, or the config can be read from a database from the backend.
 *
 * @category Platform
 */
export abstract class PlatformConfigLoader {

  /**
   * Loads the platform config asynchronously. The platform unsubscribes from the Observable after emitted the config.
   */
  public abstract load$(): Observable<PlatformConfig>;
}
