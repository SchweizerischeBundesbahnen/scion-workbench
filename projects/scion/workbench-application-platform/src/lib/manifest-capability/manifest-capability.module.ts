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
import { WorkbenchModule } from '@scion/workbench';
import { CoreModule } from '../core/core.module';
import { INTENT_HANDLER } from '../core/metadata';
import { ManifestRegistryIntentHandler } from './manifest-registry-intent-handler.service';

/**
 * Built-in capability to lookup manifests.
 */
@NgModule({
  imports: [
    CoreModule,
    WorkbenchModule.forChild(),
  ],
  providers: [
    {provide: INTENT_HANDLER, useClass: ManifestRegistryIntentHandler, multi: true},
  ],
})
export class ManifestCapabilityModule {
}
