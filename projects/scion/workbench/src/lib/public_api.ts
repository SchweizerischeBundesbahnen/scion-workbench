/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

export {WorkbenchConfig, MenuItemConfig, ViewMenuItemsConfig} from './workbench-config';
export {provideWorkbench} from './workbench.provider';
export {WorkbenchService} from './workbench.service';
export {WORKBENCH_ID} from './workbench-id';
export {WorkbenchPartAction, WorkbenchTheme, CanMatchPartFn, WorkbenchMenuItem, WorkbenchMenuItemFactoryFn, CanClose, CanCloseFn, CanCloseRef} from './workbench.model';
export {WorkbenchComponent} from './workbench.component';
export {VIEW_TAB_RENDERING_CONTEXT, ViewTabRenderingContext} from './workbench.constants';

export * from './layout/public_api';
export * from './desktop/public_api';
export * from './perspective/public_api';
export * from './part/public_api';
export * from './view/public_api';
export * from './routing/public_api';
export * from './message-box/public_api';
export * from './dialog/public_api';
export * from './notification/public_api';
export * from './popup/public_api';
export * from './common/public_api';
export * from './microfrontend-platform/public_api';
export * from './startup/public_api';
export * from './logging/public_api';
export * from './storage/public_api';
