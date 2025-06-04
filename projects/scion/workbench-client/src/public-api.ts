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
export {WorkbenchRouter, type WorkbenchNavigationExtras, ɵMicrofrontendRouteParams, type ɵViewParamsUpdateCommand} from './lib/routing/workbench-router';
export {type WorkbenchViewCapability, type ViewParamDefinition} from './lib/view/workbench-view-capability';
export {WorkbenchView, type CanCloseFn, type CanCloseRef, type ViewSnapshot, type ViewId} from './lib/view/workbench-view';
export {ɵVIEW_ID_CONTEXT_KEY, ɵWorkbenchView} from './lib/view/ɵworkbench-view';
export {WorkbenchCapabilities} from './lib/workbench-capabilities.enum';
export {ɵWorkbenchCommands} from './lib/ɵworkbench-commands';
export {type ɵWorkbenchPopupCommand} from './lib/popup/workbench-popup-open-command';
export {WorkbenchPopupService} from './lib/popup/workbench-popup-service';
export {WorkbenchPopup, ɵWorkbenchPopupMessageHeaders} from './lib/popup/workbench-popup';
export {type WorkbenchPopupCapability, type PopupSize} from './lib/popup/workbench-popup-capability';
export {type WorkbenchPopupConfig, type CloseStrategy} from './lib/popup/workbench-popup.config';
export {type WorkbenchPopupReferrer} from './lib/popup/workbench-popup-referrer';
export {type Point, type TopLeftPoint, type TopRightPoint, type BottomLeftPoint, type BottomRightPoint, type PopupOrigin} from './lib/popup/popup.origin';
export {type ɵPopupContext, ɵPOPUP_CONTEXT} from './lib/popup/workbench-popup-context';
export {type WorkbenchDialogCapability, type WorkbenchDialogSize} from './lib/dialog/workbench-dialog-capability';
export {WorkbenchDialog} from './lib/dialog/workbench-dialog';
export {WorkbenchDialogService} from './lib/dialog/workbench-dialog-service';
export {ɵWorkbenchDialogService} from './lib/dialog/ɵworkbench-dialog-service';
export {type WorkbenchDialogOptions} from './lib/dialog/workbench-dialog.options';
export {type ɵDialogContext, ɵDIALOG_CONTEXT} from './lib/dialog/ɵworkbench-dialog-context';
export {ɵWorkbenchDialogMessageHeaders} from './lib/dialog/ɵworkbench-dialog';
export {type WorkbenchMessageBoxCapability, type WorkbenchMessageBoxSize, eMESSAGE_BOX_MESSAGE_PARAM} from './lib/message-box/workbench-message-box-capability';
export {WorkbenchMessageBoxService} from './lib/message-box/workbench-message-box-service';
export {ɵWorkbenchMessageBoxService} from './lib/message-box/ɵworkbench-message-box-service';
export {type WorkbenchMessageBoxOptions} from './lib/message-box/workbench-message-box.options';
export {WorkbenchMessageBox} from './lib/message-box/workbench-message-box';
export {type ɵMessageBoxContext, ɵMESSAGE_BOX_CONTEXT} from './lib/message-box/ɵworkbench-message-box-context';
export {type WorkbenchNotificationCapability} from './lib/notification/workbench-notification-capability';
export {WorkbenchNotificationService} from './lib/notification/workbench-notification-service';
export {type WorkbenchNotificationConfig} from './lib/notification/workbench-notification.config';
export {WorkbenchThemeMonitor, type WorkbenchTheme} from './lib/theme/workbench-theme-monitor';
export {ɵTHEME_CONTEXT_KEY} from './lib/theme/ɵworkbench-theme-monitor';
export {type WorkbenchPerspectiveCapability, type WorkbenchPerspectivePart, type WorkbenchPerspectiveView, MAIN_AREA} from './lib/perspective/workbench-perspective-capability';
export {type Empty} from './lib/utility-types';
