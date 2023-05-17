/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Entry point for all public APIs of this package.
 */
export {WorkbenchModule} from './lib/workbench.module';
export * from './lib/workbench-module-config';
export {WorkbenchTestingModule} from './lib/testing/workbench-testing.module';
export {WorkbenchService} from './lib/workbench.service';
export {WorkbenchViewPreDestroy, WorkbenchPartAction} from './lib/workbench.model';
export {WorkbenchRouterLinkDirective} from './lib/routing/workbench-router-link.directive';
export {WorkbenchRouter, WorkbenchNavigationExtras, Commands} from './lib/routing/workbench-router.service';
export {WorkbenchAuxiliaryRoutesRegistrator} from './lib/routing/workbench-auxiliary-routes-registrator.service';
export {WorkbenchComponent} from './lib/workbench.component';
export * from './lib/message-box/public_api';
export * from './lib/notification/public_api';
export {WB_VIEW_TITLE_PARAM, WB_VIEW_HEADING_PARAM, WB_STATE_DATA} from './lib/routing/routing.constants';
export {VIEW_TAB_CONTEXT, ViewTabContext} from './lib/workbench.constants';
export {WorkbenchLauncher, WorkbenchStartup} from './lib/startup/workbench-launcher.service';
export {WorkbenchInitializer, WORKBENCH_STARTUP, WORKBENCH_PRE_STARTUP, MICROFRONTEND_PLATFORM_PRE_STARTUP, MICROFRONTEND_PLATFORM_POST_STARTUP, WORKBENCH_POST_STARTUP} from './lib/startup/workbench-initializer';
export {Disposable} from './lib/disposable';
export {ContentAsOverlayComponent} from './lib/content-projection/content-as-overlay.component';
export {PopupService} from './lib/popup/popup.service';
export {Popup, PopupConfig, CloseStrategy, PopupSize, PopupReferrer} from './lib/popup/popup.config';
export {Point, TopLeftPoint, TopRightPoint, BottomLeftPoint, BottomRightPoint, PopupOrigin} from './lib/popup/popup.origin';
export {WorkbenchViewMenuItemDirective} from './lib/part/view-context-menu/view-menu.directive';
export {WorkbenchPartActionDirective} from './lib/part/part-action-bar/part-action.directive';
export {WorkbenchView} from './lib/view/workbench-view.model';
export {WorkbenchPart} from './lib/part/workbench-part.model';
export {MicrofrontendPlatformConfigLoader} from './lib/microfrontend-platform/microfrontend-platform-config-loader';
export {LogAppender, LogEvent, LogLevel, LoggerName, Logger, ConsoleAppender} from './lib/logging';
export {WorkbenchRouteData} from './lib/routing/workbench-route-data';
export {WorkbenchLayout, ReferencePart, MAIN_AREA_PART_ID} from './lib/layout/workbench-layout';
export {WorkbenchPerspective, WorkbenchPerspectives, WorkbenchPerspectiveDefinition, WorkbenchLayoutFn, WorkbenchPerspectiveSelectionFn} from './lib/perspective/workbench-perspective.model';
export {WorkbenchStorage} from './lib/storage/workbench-storage';
