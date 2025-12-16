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
import {Translatable} from '../text/workbench-text-provider.model';

/**
 * Provides a standardized dialog for presenting a message to the user, such as an info, warning or alert,
 * or for prompting the user for confirmation. The message can be plain text or a component, allowing for
 * structured content or input prompts.
 *
 * Displayed on top of other content, a modal message box blocks interaction with other parts of the application.
 *
 * ## Modality
 * A message box can be context-modal or application-modal. Context-modal blocks a specific part of the application, as specified by the context;
 * application-modal blocks the workbench or browser viewport, based on {@link WorkbenchConfig.dialog.modalityScope}.
 *
 * ## Context
 * A message box can be bound to a context (e.g., part or view), defaulting to the calling context.
 * The message box is displayed only if the context is visible and closes when the context is disposed.
 *
 * ## Positioning
 * A message box is opened in the center of its context, if any, unless opened from the peripheral area.
 *
 * ## Stacking
 * Message boxes are stacked per modality, with only the topmost message box in each stack being interactive.
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
   * By default, the message box is modal to the calling context. Specify a different modality in {@link WorkbenchMessageBoxOptions.modality}.
   *
   * @example
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
   * @param  message - Specifies the text to display, if any.
   *                   Can be text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
   * @param options - Controls the appearance and behavior of the message box.
   * @return Promise that resolves to the key of the action button that the user clicked to close the message box.
   */
  public abstract open(message: Translatable | null, options?: WorkbenchMessageBoxOptions): Promise<string>;

  /**
   * Displays the specified component in a message box.
   *
   * By default, the message box is modal to the calling context. Specify a different modality in {@link WorkbenchMessageBoxOptions.modality}.
   *
   * Data can be passed to the component as inputs via {@link WorkbenchMessageBoxOptions.inputs} option. Inputs are available as input
   * properties in the component. Alternatively, data can be passed for injection via a custom injector ({@link WorkbenchMessageBoxOptions.injector})
   * or providers ({@link WorkbenchMessageBoxOptions.providers}).
   *
   * @example
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
