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
export { WorkbenchModule } from './lib/workbench.module';
export { WorkbenchTestingModule } from './lib/spec/workbench-testing.module';
export { WorkbenchService } from './lib/workbench.service';
export { WorkbenchView, WorkbenchViewPart, WbBeforeDestroy } from './lib/workbench.model';
export { WbRouterLinkDirective, WbRouterLinkWithHrefDirective } from './lib/routing/wb-router-link.directive';
export { WorkbenchRouter, WbNavigationExtras } from './lib/routing/workbench-router.service';
export { WorkbenchAuxiliaryRoutesRegistrator } from './lib/routing/workbench-auxiliary-routes-registrator.service';
export { WorkbenchComponent } from './lib/workbench.component';
export { RemoteSiteComponent } from './lib/remote-site/remote-site.component';
export { OverlayHostRef } from './lib/overlay-host-ref.service';
export { WbActivityDirective } from './lib/activity-part/wb-activity.directive';
export { Activity } from './lib/activity-part/activity';
export { ActivityPartComponent } from './lib/activity-part/activity-part.component';
export { WorkbenchActivityPartService } from './lib/activity-part/workbench-activity-part.service';
export { WbActivityActionDirective } from './lib/activity-part/wb-activity-action.directive';
export { Notification, Duration } from './lib/notification/notification';
export { NotificationService } from './lib/notification/notification.service';
export { MessageBox, Action, Actions } from './lib/message-box/message-box';
export { MessageBoxService } from './lib/message-box/message-box.service';
export { WB_VIEW_TITLE_PARAM, WB_VIEW_HEADING_PARAM }  from './lib/routing/routing-params.constants';
export { Severity, ROUTE_REUSE_PROVIDER, VIEW_TAB_CONTEXT, ViewTabContext } from './lib/workbench.constants';
export { WbRouteReuseProvider, WbRouteReuseStrategy } from './lib/routing/wb-route-reuse-strategy.service';
export { Disposable } from './lib/disposable';
export { ContentAsOverlayComponent } from './lib/content-projection/content-as-overlay.component';
export { PopupService } from './lib/popup/popup.service';
export { Popup, PopupConfig, Position, CloseStrategy } from './lib/popup/metadata';
export { ViewMenuItemDirective } from './lib/view-part/view-context-menu/view-menu.directive';
