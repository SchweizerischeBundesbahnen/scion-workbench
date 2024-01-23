/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Represents an object that is blocking another object, preventing user interaction with the other object.
 */
export interface Blocking {

  /**
   * Identifies the object that is blocking another object.
   */
  readonly id: string;

  /**
   * Instructs the blocking object to gain focus.
   */
  focus(): void;

  /**
   * Instructs the blocking object to signal the user to continue interacting with this object.
   */
  blink(): void;
}
