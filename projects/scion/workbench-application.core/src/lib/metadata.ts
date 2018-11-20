/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

/**
 * To dispose a resource.
 */
export interface Disposable {
  dispose(): void;
}

/**
 * Service to interact with workbench application platform.
 */
export interface Service {

  /**
   * Lifecycle hook that is called when this service is destroyed.
   */
  onDestroy(): void;
}

/**
 * Represents a symbol of a class.
 */
export declare type Type<T> = Function & { prototype: T };
