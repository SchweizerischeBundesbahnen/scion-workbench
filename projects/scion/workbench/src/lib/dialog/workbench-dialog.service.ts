/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';
import {WorkbenchDialogOptions} from './workbench-dialog.options';
import {ComponentType} from '@angular/cdk/portal';
import {ɵWorkbenchDialogService} from './ɵworkbench-dialog.service';

/**
 * Enables the display of a component in a modal dialog.
 *
 * A dialog is a visual element for focused interaction with the user, such as prompting the user for input or confirming actions.
 * Displayed on top of other content, a dialog blocks interaction with other parts of the application. The user can move or resize
 * a dialog.
 *
 * ## Modality
 * A dialog can be view-modal or application-modal.
 *
 * A view-modal dialog blocks only a specific view, allowing the user to interact with other views. An application-modal dialog blocks
 * the workbench, or the browser's viewport if configured in {@link WorkbenchModuleConfig.dialog.modalityScope}.
 *
 * ## Dialog Stack
 * Multiple dialogs are stacked, and only the topmost dialog in each modality stack can be interacted with.
 *
 * ## Dialog Component
 * The dialog component can inject the {@link WorkbenchDialog} handle to interact with the dialog, such as setting the title or closing the dialog.
 * Inputs passed to the dialog are available as input properties in the dialog component.
 */
@Injectable({providedIn: 'root', useExisting: ɵWorkbenchDialogService})
export abstract class WorkbenchDialogService {

  /**
   * Opens a dialog with the specified component and options.
   *
   * By default, the calling context determines the modality of the dialog. If the dialog is opened from a view, only this view is blocked.
   * To open the dialog with a different modality, specify the modality in {@link WorkbenchDialogOptions.modality}.
   *
   * Data can be passed to the component as inputs via {@link WorkbenchDialogOptions.inputs} property or by providing a custom injector
   * via {@link WorkbenchDialogOptions.injector} property. Dialog inputs are available as input properties in the dialog component.
   *
   * @param component - Specifies the component to display in the dialog.
   * @param options - Controls how to open a dialog.
   * @returns Promise that resolves to the dialog result, if any, or that rejects if the dialog couldn't be opened or was closed with an error.
   */
  public abstract open<R>(component: ComponentType<unknown>, options?: WorkbenchDialogOptions): Promise<R | undefined>;
}
