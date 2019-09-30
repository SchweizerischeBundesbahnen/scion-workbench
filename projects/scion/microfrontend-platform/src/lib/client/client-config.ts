/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

/**
 * Configures a client of the microfrontend platform.
 */
export abstract class ClientConfig {
  /**
   * Specifies the symbolic name of this application.
   * The application must be registered under this symbolic name in the host-app.
   */
  symbolicName: string;
  /**
   * Configures the {@link MessageClient} for sending and receiving messages between applications.
   */
  messaging?: {
    /**
     * Specifies the maximal time to wait until a connection to the broker is established.
     * If the broker does not respond within the specified timeout, an error is thrown.
     *
     * If not set, a timeout of 10s is used.
     */
    connectTimeout?: number;
    /**
     * Specifies the maximal time to wait when publishing a message until receiving a delivery receipt of the broker.
     * If not receiving a delivery receipt within the specified timeout, an error is thrown.
     *
     * If not set, a timeout of 10s is used.
     */
    deliveryTimeout?: number;
  };
}
