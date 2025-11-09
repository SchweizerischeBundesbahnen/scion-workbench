/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Blocking} from './blocking';
import {Signal} from '@angular/core';

/**
 * Represents an object that can be blocked by another object, such as a dialog, preventing user interaction with the object.
 */
export interface Blockable {

  /**
   * Indicates whether an object (typically a dialog) blocks this object.
   */
  blockedBy: Signal<Blocking | null>;
}
