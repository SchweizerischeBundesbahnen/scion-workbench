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
 * Loads applications running in the platform.
 */
export abstract class PlatformConfigLoader {

  /**
   * Loads applications running in the platform.
   */
  public abstract load$(): Observable<PlatformConfig>;
}
