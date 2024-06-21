/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ɵWorkbenchDialogService} from '../dialog/ɵworkbench-dialog.service';
import {ɵWorkbenchMessageBoxService} from '../message-box/ɵworkbench-message-box.service';
import {ɵWorkbenchView} from './ɵworkbench-view.model';
import {WorkbenchView} from './workbench-view.model';
import {PopupService} from '../popup/popup.service';
import {WorkbenchDialogService} from '../dialog/workbench-dialog.service';
import {WorkbenchMessageBoxService} from '../message-box/workbench-message-box.service';
import {WorkbenchSelectionService} from '../selection/workbench-selection.service';
import {ɵWorkbenchSelectionService} from '../selection/ɵworkbench-selection.service';
import {WorkbenchSelectionProvider} from '../selection/workbench-selection.model';

/**
 * Configures an injector with providers that are aware of the specified view.
 */
export function provideViewContext(view: ɵWorkbenchView | null | undefined): any[] {
  return [
    {provide: ɵWorkbenchView, useValue: view ?? null},
    {provide: WorkbenchView, useExisting: ɵWorkbenchView},
    {provide: WorkbenchSelectionProvider, useExisting: ɵWorkbenchView},
    PopupService,
    ɵWorkbenchDialogService,
    {provide: WorkbenchDialogService, useExisting: ɵWorkbenchDialogService},
    ɵWorkbenchMessageBoxService,
    {provide: WorkbenchMessageBoxService, useExisting: ɵWorkbenchMessageBoxService},
    ɵWorkbenchSelectionService,
    {provide: WorkbenchSelectionService, useExisting: ɵWorkbenchSelectionService},
  ];
}
