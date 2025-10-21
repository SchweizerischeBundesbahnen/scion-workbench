/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Capability} from '@scion/microfrontend-platform';
import {Signal} from '@angular/core';

export abstract class ActivatedMicrofrontend<T extends Capability = Capability> {
  public abstract readonly params: Signal<Map<string, unknown>>;
  public abstract readonly capability: T;
}
