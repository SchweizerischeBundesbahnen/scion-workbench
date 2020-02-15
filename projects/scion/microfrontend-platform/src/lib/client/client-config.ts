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
 * Configures a client application of the microfrontend platform.
 *
 * @category Platform
 */
export abstract class ClientConfig {
  /**
   * Specifies the symbolic name of this client. The client must be registered in the host app under this symbol.
   */
  symbolicName: string;
  /**
   * Configures the {@link MessageClient} for sending and receiving messages between applications.
   */
  messaging?: {
    /**
     * Specifies the maximal time to wait until the client discovered the messaging broker.
     * By default, a timeout of 10s is used.
     */
    brokerDiscoverTimeout?: number;
    /**
     * Specifies the maximal time to wait when publishing a message until receiving a delivery
     * receipt of the messaging broker. By default, a timeout of 10s is used.
     */
    deliveryTimeout?: number;
  };
}
