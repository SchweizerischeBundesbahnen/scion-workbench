/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
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
export {WorkbenchView, CanClose, ViewSnapshot, ViewId} from './lib/view/workbench-view';
export {ɵVIEW_ID_CONTEXT_KEY, ɵWorkbenchView} from './lib/view/ɵworkbench-view';
export {WorkbenchCapabilities} from './lib/workbench-capabilities.enum';
export {ɵWorkbenchCommands} from './lib/ɵworkbench-commands';
export {ɵWorkbenchPopupCommand} from './lib/popup/workbench-popup-open-command';
export {WorkbenchPopupService} from './lib/popup/workbench-popup-service';
export {WorkbenchPopup, ɵWorkbenchPopupMessageHeaders} from './lib/popup/workbench-popup';
export {WorkbenchPopupCapability, PopupSize} from './lib/popup/workbench-popup-capability';
export {WorkbenchPopupConfig, CloseStrategy} from './lib/popup/workbench-popup.config';
export {WorkbenchPopupReferrer} from './lib/popup/workbench-popup-referrer';
export {Point, TopLeftPoint, TopRightPoint, BottomLeftPoint, BottomRightPoint, PopupOrigin} from './lib/popup/popup.origin';
export {ɵPopupContext, ɵPOPUP_CONTEXT} from './lib/popup/workbench-popup-context';
export {WorkbenchDialogCapability, WorkbenchDialogSize} from './lib/dialog/workbench-dialog-capability';
export {WorkbenchDialog} from './lib/dialog/workbench-dialog';
export {WorkbenchDialogService} from './lib/dialog/workbench-dialog-service';
export {ɵWorkbenchDialogService} from './lib/dialog/ɵworkbench-dialog-service';
export {WorkbenchDialogOptions} from './lib/dialog/workbench-dialog.options';
export {ɵDialogContext, ɵDIALOG_CONTEXT} from './lib/dialog/ɵworkbench-dialog-context';
export {ɵWorkbenchDialogMessageHeaders} from './lib/dialog/ɵworkbench-dialog';
export {WorkbenchMessageBoxCapability, WorkbenchMessageBoxSize, eMESSAGE_BOX_MESSAGE_PARAM} from './lib/message-box/workbench-message-box-capability';
export {WorkbenchMessageBoxService} from './lib/message-box/workbench-message-box-service';
export {ɵWorkbenchMessageBoxService} from './lib/message-box/ɵworkbench-message-box-service';
export {WorkbenchMessageBoxOptions} from './lib/message-box/workbench-message-box.options';
export {WorkbenchMessageBoxLegacyOptions} from './lib/message-box/workbench-message-box-legacy.options';
export {WorkbenchMessageBox} from './lib/message-box/workbench-message-box';
export {ɵMessageBoxContext, ɵMESSAGE_BOX_CONTEXT} from './lib/message-box/ɵworkbench-message-box-context';
export {WorkbenchNotificationCapability} from './lib/notification/workbench-notification-capability';
export {WorkbenchNotificationService} from './lib/notification/workbench-notification-service';
export {WorkbenchNotificationConfig} from './lib/notification/workbench-notification.config';
export {WorkbenchThemeMonitor, WorkbenchTheme} from './lib/theme/workbench-theme-monitor';
export {ɵTHEME_CONTEXT_KEY} from './lib/theme/ɵworkbench-theme-monitor';
export {WorkbenchPerspectiveCapability, WorkbenchPerspectivePart, WorkbenchPerspectiveView, MAIN_AREA} from './lib/perspective/workbench-perspective-capability';
