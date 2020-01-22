/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { ManifestService } from './manifest-service';
import { PlatformMessageClient } from '../host/platform-message-client';
import { Beans } from '../bean-manager';

/**
 * Manifest service used by the platform to interact with the manifest registry.
 *
 * The interaction is on behalf of the platform app {@link PLATFORM_SYMBOLIC_NAME}.
 */
export class PlatformManifestService extends ManifestService {

  constructor() {
    super(Beans.get(PlatformMessageClient));
  }
}
