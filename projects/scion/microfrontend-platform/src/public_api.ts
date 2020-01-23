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
 * Entry point for all public APIs of this package.
 */
export * from './lib/platform.model';
export * from './lib/messaging.model';
export * from './lib/platform-property-service';
export { Beans, PreDestroy, Type, AbstractType, InstanceConstructInstructions, InitializerFn, Initializer, BeanDecorator, BeanInstanceConstructInstructions } from './lib/bean-manager'; // do not export {@link BeanInfo}
export * from './lib/microfrontend-platform';
export * from './lib/platform-state';
export * from './lib/logger';
export * from './lib/client/public_api';
export * from './lib/host/public_api';
