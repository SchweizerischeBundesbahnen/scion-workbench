/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { MessageBus } from './message-bus.service';
import { Service, Type } from './metadata';

const serviceRegistry = new Map<Type<Service>, Service>();

/**
 * Provides access to the workbench application platform.
 */
export const Platform = new class {

  /**
   * Returns the service with the given symbol, or throws an error if not found.
   */
  public getService<T extends Service>(type: Type<T>): T {
    const service = serviceRegistry.get(type) as T;
    if (!service) {
      throw Error(`[NullServiceError] No service with the given symbol found. Did you forget to start workbench application module by calling 'Activator.start()'? [symbol=${type.name}]`);
    }
    return service;
  }

  /**
   * Registers a service.
   *
   * If no lookup symbol is given, the service is registered under its constructor symbol.
   */
  public register(service: Service, symbol: Type<Service> = service.constructor): void {
    serviceRegistry.set(symbol, service);
  }

  /**
   * Destroys this platform and releases resources allocated.
   */
  public destroy(): void {
    // Destroy the {MessageBus} as the last service
    const messageBus = serviceRegistry.get(MessageBus);

    Array.from(serviceRegistry.values())
      .filter(service => service !== messageBus)
      .forEach(service => service.onDestroy());

    serviceRegistry.get(MessageBus).onDestroy();
  }
};
