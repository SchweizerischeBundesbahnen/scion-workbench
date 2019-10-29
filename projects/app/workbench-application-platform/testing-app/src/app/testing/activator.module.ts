/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { NgModule } from '@angular/core';
import { ManifestRegistryService, PlatformCapabilityTypes } from '@scion/workbench-application.core';

@NgModule({})
export class ActivatorModule {
  constructor(manifestRegistryService: ManifestRegistryService) {
    manifestRegistryService.registerCapability$(
      {
        type: PlatformCapabilityTypes.View,
        qualifier: {entity: 'activator', scope: 'example'},
        private: false,
        description: 'Example capability registered through an Activator module.',
      },
    ).subscribe();
  }
}
