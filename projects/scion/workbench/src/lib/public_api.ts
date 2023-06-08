/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

export {WorkbenchModuleConfig, MenuItemConfig, ViewMenuItemsConfig} from './workbench-module-config';
export {WorkbenchModule} from './workbench.module';
export {WorkbenchService} from './workbench.service';
export {WorkbenchViewPreDestroy, WorkbenchPartAction} from './workbench.model';
export {WorkbenchComponent} from './workbench.component';
export {VIEW_TAB_CONTEXT, ViewTabContext} from './workbench.constants';

export * from './layout/public_api';
export * from './perspective/public_api';
export * from './part/public_api';
export * from './view/public_api';
export * from './routing/public_api';
export * from './message-box/public_api';
export * from './notification/public_api';
export * from './popup/public_api';
export * from './common/public_api';
export * from './microfrontend-platform/public_api';
export * from './startup/public_api';
export * from './logging/public_api';
export * from './storage/public_api';
export * from './testing/public_api';