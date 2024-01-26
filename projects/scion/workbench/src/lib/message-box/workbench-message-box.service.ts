/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {WorkbenchMessageBoxOptions} from './workbench-message-box.options';
import {ComponentType} from '@angular/cdk/portal';
import {Injectable} from '@angular/core';
import {ɵWorkbenchMessageBoxService} from './ɵworkbench-message-box.service';

/**
 * Provides a standardized dialog for presenting a message to the user, such as an info, warning or alert,
 * or for prompting the user for confirmation. The message can be plain text or a component, allowing for
 * structured content or input prompts.
 *
 * ## Modality
 * Displayed on top of other content, a message box blocks interaction with other parts of the application.
 *
 * A message box can be view-modal or application-modal. A view-modal message box blocks only a specific view,
 * allowing the user to interact with other views. An application-modal message box blocks the workbench,
 * or the browser's viewport if configured in {@link WorkbenchModuleConfig.dialog.modalityScope}.
 *
 * ## Stacking
 * Multiple message boxes are stacked, and only the topmost message box in each modality stack can be interacted with.
 *
 * ## Styling
 * The following CSS variables can be set to customize the default look of a message box.
 *
 * - `--sci-workbench-messagebox-max-width`
 * - `--sci-workbench-messagebox-severity-indicator-size`
 * - `--sci-workbench-messagebox-padding`
 * - `--sci-workbench-messagebox-text-align`
 * - `--sci-workbench-messagebox-title-align`
 * - `--sci-workbench-messagebox-title-font-family`
 * - `--sci-workbench-messagebox-title-font-weight`
 * - `--sci-workbench-messagebox-title-font-size`
 */
@Injectable({providedIn: 'root', useExisting: ɵWorkbenchMessageBoxService})
export abstract class WorkbenchMessageBoxService {

  /**
   * Displays the specified message in a message box.
   *
   * By default, the calling context determines the modality of the message box. If the message box is opened from a view, only this view is blocked.
   * To open the message box with a different modality, specify the modality in {@link WorkbenchMessageBoxOptions.modality}.
   *
   * **Example:**
   *
   * ```ts
   * const action = await inject(WorkbenchMessageBoxService).open('Do you want to save changes?', {
   *   actions: {
   *     yes: 'Yes',
   *     no: 'No',
   *     cancel: 'Cancel',
   *   },
   * });
   * ```
   *
   * @param  message - Specifies the text to display.
   * @param options - Controls the appearance and behavior of the message box.
   * @return Promise that resolves to the key of the action button that the user clicked to close the message box.
   */
  public abstract open(message: string, options?: WorkbenchMessageBoxOptions): Promise<string>;

  /**
   * Displays the specified component in a message box.
   *
   * By default, the calling context determines the modality of the message box. If the message box is opened from a view, only this view is blocked.
   * To open the message box with a different modality, specify the modality in {@link WorkbenchMessageBoxOptions.modality}.
   *
   * Data can be passed to the component as inputs via {@link WorkbenchMessageBoxOptions.inputs} property or by providing a custom injector
   * via {@link WorkbenchMessageBoxOptions.injector} property. Inputs are available as input properties in the component.
   *
   * **Example:**
   *
   * ```ts
   * const action = await inject(WorkbenchMessageBoxService).open(SomeComponent, {
   *   inputs: {
   *     a: '...',
   *     b: '...',
   *   },
   *   actions: {
   *     yes: 'Yes',
   *     no: 'No',
   *     cancel: 'Cancel',
   *   },
   * });
   * ```
   *
   * ```ts
   * @Component({...})
   * export class SomeComponent {
   *
   *   @Input({required: true})
   *   public a!: string;
   *
   *   @Input()
   *   public b?: string;
   * }
   * ```
   *
   * @param component - Specifies the component to render as the message.
   * @param options - Controls the appearance and behavior of the message box.
   * @return Promise that resolves to the key of the action button that the user clicked to close the message box.
   */
  public abstract open(component: ComponentType<unknown>, options?: WorkbenchMessageBoxOptions): Promise<string>;
}
