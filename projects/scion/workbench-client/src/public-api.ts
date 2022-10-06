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
export {WorkbenchClient} from './lib/workbench-client';
export {WorkbenchRouter, WorkbenchNavigationExtras, ɵMicrofrontendRouteParams, ɵViewParamsUpdateCommand} from './lib/routing/workbench-router';
export {WorkbenchViewCapability, ViewParamDefinition} from './lib/view/workbench-view-capability';
export {WorkbenchView, ViewClosingListener, ViewClosingEvent, ViewSnapshot} from './lib/view/workbench-view';
export {ɵVIEW_ID_CONTEXT_KEY} from './lib/view/ɵworkbench-view';
export {WorkbenchCapabilities} from './lib/workbench-capabilities.enum';
export {ɵWorkbenchCommands} from './lib/ɵworkbench-commands';
export {ɵWorkbenchPopupCommand} from './lib/popup/workbench-popup-open-command';
export {WorkbenchPopupService} from './lib/popup/workbench-popup-service';
export {WorkbenchPopup, ɵWorkbenchPopupMessageHeaders} from './lib/popup/workbench-popup';
export {WorkbenchPopupCapability, PopupSize} from './lib/popup/workbench-popup-capability';
export {WorkbenchPopupConfig, CloseStrategy} from './lib/popup/workbench-popup.config';
export {Point, TopLeftPoint, TopRightPoint, BottomLeftPoint, BottomRightPoint, PopupOrigin} from './lib/popup/popup.origin';
export {ɵPopupContext, ɵPOPUP_CONTEXT} from './lib/popup/workbench-popup-context';
export {WorkbenchMessageBoxCapability} from './lib/message-box/workbench-message-box-capability';
export {WorkbenchMessageBoxService} from './lib/message-box/workbench-message-box-service';
export {WorkbenchMessageBoxConfig} from './lib/message-box/workbench-message-box.config';
export {WorkbenchNotificationCapability} from './lib/notification/workbench-notification-capability';
export {WorkbenchNotificationService} from './lib/notification/workbench-notification-service';
export {WorkbenchNotificationConfig} from './lib/notification/workbench-notification.config';
