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
export { WorkbenchApplicationModule } from './lib/workbench-application.module';
export * from './lib/workbench-router.service';
export * from './lib/workbench-router-link.directive';
export * from './lib/workbench-view';
export * from './lib/workbench-activity';
export * from './lib/workbench-popup';
export * from './lib/workbench-view-open-activity-action.directive';
export * from './lib/workbench-url-open-activity-action.directive';

export * from '@scion/workbench-application-platform.api';
export * from '@scion/workbench-application.core';
