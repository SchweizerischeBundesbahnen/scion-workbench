/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { PlatformConfig, PlatformConfigLoader } from './metadata';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { WorkbenchApplicationPlatformConfig } from '../workbench-application-platform.config';
import { Logger } from './logger.service';

/**
 * Loads applications as configured in `WorkbenchApplicationPlatformModule.forRoot({applicationConfig: {...}})`.
 */
@Injectable()
export class ModulePlatformConfigLoader implements PlatformConfigLoader {

  constructor(private _platformConfig: WorkbenchApplicationPlatformConfig, private _logger: Logger) {
  }

  public load$(): Observable<PlatformConfig> {
    if (!this._platformConfig.applicationConfig) {
      this._logger.error('Missing application config in `WorkbenchApplicationPlatformModule`. Did you forget to register applications when calling \'WorkbenchApplicationPlatformModule.forRoot(...)\'?');
      return of({apps: []});
    }
    return of({
      apps: this._platformConfig.applicationConfig,
    });
  }
}
