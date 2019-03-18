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
 * Entry point for all public APIs of this package.
 */
export { WorkbenchApplicationPlatformModule } from './lib/workbench-application-platform.module';
export * from './lib/workbench-application-platform.config';
export * from './lib/core/message-bus.service';
export * from './lib/core/manifest-registry.service';
export * from './lib/core/application-registry.service';
export * from './lib/core/null-error-handler.service';
export * from './lib/core/default-error-handler.service';
export * from './lib/core/manifest-collector.service';
export * from './lib/messagebox-capability/message-box-intent-handler.service';
export * from './lib/notification-capability/notification-intent-handler.service';
export * from './lib/core/metadata';
export * from './lib/activity-capability/metadata';

export * from '@scion/workbench-application-platform.api';
