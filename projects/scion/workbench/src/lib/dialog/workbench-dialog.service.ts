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
 * The user can move or resize a dialog.
 *
 * Displayed on top of other content, a dialog blocks interaction with other parts of the application.
 *
 * ## Modality
 * A dialog can be view-modal or application-modal.
 *
 * A view-modal dialog blocks only a specific view, allowing the user to interact with other views. An application-modal dialog blocks
 * the workbench, or the browser's viewport if configured in {@link WorkbenchConfig.dialog.modalityScope}.
 *
 * ## Dialog Stack
 * Multiple dialogs are stacked, and only the topmost dialog in each modality stack can be interacted with.
 *
 * ## Dialog Component
 * The dialog component can inject the {@link WorkbenchDialog} handle to interact with the dialog, such as setting the title or closing the dialog.
 * Inputs passed to the dialog are available as input properties in the dialog component.
 *
 * ## Dialog Header
 * By default, the dialog displays the title and a close button in the header. Alternatively, the dialog supports the use of a custom header.
 * To provide a custom header, add an Angular template to the HTML of the dialog component and decorate it with the `wbDialogHeader` directive.
 *
 * ```html
 * <ng-template wbDialogHeader>
 *   <app-dialog-header/>
 * </ng-template>
 * ```
 *
 * ## Dialog Footer
 * A dialog has a default footer that displays actions defined in the HTML of the dialog component. An action is an Angular template decorated with
 * the `wbDialogAction` directive. Multiple actions are supported, rendered in modeling order, and can be left- or right-aligned.
 *
 * ```html
 * <!-- Checkbox -->
 * <ng-template wbDialogAction align="start">
 *   <label>
 *     <input type="checkbox"/>
 *     Do not ask me again
 *   </label>
 * </ng-template>
 *
 * <!-- OK Button -->
 * <ng-template wbDialogAction align="end">
 *   <button (click)="...">OK</button>
 * </ng-template>
 *
 * <!-- Cancel Button -->
 * <ng-template wbDialogAction align="end">
 *   <button (click)="...">Cancel</button>
 * </ng-template>
 * ```
 *
 * Alternatively, the dialog supports the use of a custom footer. To provide a custom footer, add an Angular template to the HTML of the dialog component and
 * decorate it with the `wbDialogFooter` directive.
 *
 * ```html
 * <ng-template wbDialogFooter>
 *   <app-dialog-footer/>
 * </ng-template>
 * ```
 *
 * ## Styling
 * The following CSS variables can be set to customize the default look of a dialog.
 *
 * - `--sci-workbench-dialog-padding`
 * - `--sci-workbench-dialog-header-height`
 * - `--sci-workbench-dialog-header-background-color`
 * - `--sci-workbench-dialog-title-font-family`
 * - `--sci-workbench-dialog-title-font-weight`
 * - `--sci-workbench-dialog-title-font-size`
 * - `--sci-workbench-dialog-title-align`
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
