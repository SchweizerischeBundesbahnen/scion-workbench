/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Represents an object that can be disposed of to free up resources.
 */
export interface Disposable {
  /**
   * Disposes of the object, releasing any allocated resources.
   */
  dispose(): void;
}

/**
 * Signature of a function to clean up allocated resources.
 */
export type DisposeFn = () => void;
