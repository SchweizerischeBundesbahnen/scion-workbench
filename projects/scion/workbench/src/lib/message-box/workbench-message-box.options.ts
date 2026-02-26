/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {Injector, Provider} from '@angular/core';
import {DialogId, NotificationId, PartId, PopupId, ViewId} from '../workbench.identifiers';
import {Translatable} from '../text/workbench-text-provider.model';

/**
 * Controls the appearance and behavior of a message box.
 */
export interface WorkbenchMessageBoxOptions {

  /**
   * Specifies the title of the message box.
   *
   * Can be text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
   */
  title?: Translatable;

  /**
   * Defines buttons of the message box. Defaults to an 'OK' button (translation key: `workbench.ok.action`).
   *
   * Each property in the object literal represents a button, with the property value used as the button label.
   * Clicking a button closes the message box and returns the property key to the message box opener.
   *
   * A button with the key 'cancel' is also assigned the Escape keystroke.
   *
   * **Example:**
   * ```ts
   * {
   *   yes: 'Yes',
   *   no: 'No',
   *   cancel: 'Cancel',
   * }
   * ```
   */
  actions?: {[key: string]: Translatable};

  /**
   * Specifies the severity of the message. Defaults to `info`.
   */
  severity?: 'info' | 'warn' | 'error';

  /**
   * Controls which area of the application to block by the message box. Defaults to `context`.
   *
   * One of:
   * - 'none': Non-blocking message box.
   * - `context`: Blocks a specific part of the application, as specified in {@link context}, defaulting to the calling context.
   * - `application`: Blocks the workbench or browser viewport, based on {@link WorkbenchConfig.dialog.modalityScope}.
   * - `view`: Deprecated. Same as `context`. Marked for removal in version 22.
   */
  modality?: 'none' | 'context' | 'application' | ViewModality;

  /**
   * Binds the message box to a context (e.g., part or view). Defaults to the calling context.
   *
   * The message box is displayed only if the context is visible and closes when the context is disposed.
   * The message box is opened in the center of its context, if any, unless opened from the peripheral area.
   *
   * Set to `null` to open the message box outside a context.
   */
  context?: ViewId | PartId | DialogId | PopupId | NotificationId | Context | null;

  /**
   * Specifies if the user can select text displayed in the message box. Defaults to `false`.
   */
  contentSelectable?: boolean;

  /**
   * Specifies data to pass to the message component. Inputs are available as input properties in the message component.
   *
   * Has no effect if opening a plain text message.
   *
   * @example - Reading inputs in the component
   * ```ts
   * public someInput = input.required<string>();
   * ```
   */
  inputs?: {[name: string]: unknown};

  /**
   * Specifies the injector for the instantiation of the message box, giving control over the objects available
   * for injection in the message component. Defaults to the application's root injector.
   *
   * @example - Creating an injector with a DI token
   *
   * ```ts
   * Injector.create({
   *   parent: ...,
   *   providers: [
   *    {provide: <TOKEN>, useValue: <VALUE>}
   *   ],
   * })
   * ```
   */
  injector?: Injector;

  /**
   * Specifies providers available for injection in the message component.
   *
   * Providers can inject {@link WorkbenchMessageBox} to interact with the message.
   */
  providers?: Provider[];

  /**
   * Specifies CSS class(es) to add to the message box, e.g., to locate the message box in tests.
   */
  cssClass?: string | string[];
}

/**
 * @deprecated since version 20.0.0-beta.9. Renamed to `context`. Marked for removal in version 22.
 */
type ViewModality = 'view';

/**
 * @deprecated since version 20.0.0-beta.9. Set view id directly. Migrate `{context: {viewId: 'view.x'}}` to `{context: 'view.x'}`. Marked for removal in version 22.
 */
interface Context {
  /**
   * @deprecated since version 20.0.0-beta.9. Set view id directly. Migrate `{context: {viewId: 'view.x'}}` to `{context: 'view.x'}`. Marked for removal in version 22.
   */
  viewId?: ViewId | null;
}
