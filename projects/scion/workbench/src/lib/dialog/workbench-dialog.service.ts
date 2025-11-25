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
 * Enables the display of a component in a dialog.
 *
 * A dialog is a visual element for focused interaction with the user, such as prompting the user for input or confirming actions.
 * The user can move and resize a dialog.
 *
 * Displayed on top of other content, a modal dialog blocks interaction with other parts of the application.
 *
 * ## Modality
 * A dialog can be context-modal or application-modal. Context-modal blocks a specific part of the application, as specified by the context;
 * application-modal blocks the workbench or browser viewport, based on {@link WorkbenchConfig.dialog.modalityScope}.
 *
 * ## Context
 * A dialog can be bound to a context (e.g., a part or view), defaulting to the calling context.
 * The dialog is displayed only if the context is visible and closes when the context is disposed.
 *
 * ## Positioning
 * A dialog is opened in the center of its context, if any, unless opened from the peripheral area.
 *
 * ## Stacking
 * Dialogs are stacked per modality, with only the topmost dialog in each stack being interactive.
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
   * By default, the dialog is modal to the calling context. Specify a different modality in {@link WorkbenchDialogOptions.modality}.
   *
   * Data can be passed to the component as inputs via {@link WorkbenchDialogOptions.inputs} option. Inputs are available as input
   * properties in the component. Alternatively, data can be passed for injection via a custom injector ({@link WorkbenchDialogOptions.injector})
   * or providers ({@link WorkbenchDialogOptions.providers}).
   *
   * @param component - Specifies the component to display in the dialog.
   * @param options - Controls the appearance and behavior of the dialog.
   * @returns Promise that resolves to the dialog result, if any, or that rejects if the dialog couldn't be opened or was closed with an error.
   */
  public abstract open<R>(component: ComponentType<unknown>, options?: WorkbenchDialogOptions): Promise<R | undefined>;
}
