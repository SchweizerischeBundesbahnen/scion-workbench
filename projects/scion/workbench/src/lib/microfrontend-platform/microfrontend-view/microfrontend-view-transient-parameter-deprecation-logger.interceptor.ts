/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Capability, CapabilityInterceptor} from '@scion/microfrontend-platform';
import {inject, Injectable} from '@angular/core';
import {WorkbenchCapabilities, WorkbenchViewCapability} from '@scion/workbench-client';
import {Logger, LoggerNames} from '../../logging';
import {Objects} from '@scion/toolkit/util';

/**
 * Logs usage of deprecated transient parameters.
 *
 * TODO [Angular 22] Remove with Angular 22.
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendViewTransientParameterDeprecationLogger implements CapabilityInterceptor {

  private readonly _logger = inject(Logger);

  public async intercept(capability: Capability): Promise<Capability> {
    if (capability.type === WorkbenchCapabilities.View) {
      this.logWarningForTransientParams(capability as WorkbenchViewCapability);
    }
    return capability;
  }

  private logWarningForTransientParams(capability: WorkbenchViewCapability): void {
    if (!capability.params) {
      return;
    }

    capability.params
      .filter(param => param.transient !== undefined)
      .forEach(param => {
        this._logger.warn(`[Deprecation][${capability.metadata!.appSymbolicName}] Transient view parameter '${param.name}' in view capability '${Objects.toMatrixNotation(capability.qualifier)}' detected. Transient parameters are deprecated and will be removed in SCION Workbench version 22. No replacement. Instead, send large data as retained message to a random topic and pass the topic as parameter. After receiving the data, the view should delete the retained message to free resources.`, LoggerNames.MICROFRONTEND);
      });
  }
}
