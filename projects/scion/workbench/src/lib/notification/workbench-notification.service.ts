/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';
import {WorkbenchNotificationOptions} from './workbench-notification.options';
import {ComponentType} from '@angular/cdk/portal';
import {Translatable} from '../text/workbench-text-provider.model';
import {ɵWorkbenchNotificationService} from './ɵworkbench-notification.service';

/**
 * Shows a notification.
 *
 * A notification is a closable message displayed in the upper-right corner that disappears after a few seconds unless hovered or focused.
 * It informs about system events, task completion, or errors. Severity indicates importance or urgency.
 *
 * Notifications can be grouped. Only the most recent notification within a group is displayed.
 *
 * Content can be plain text or structured. Pressing Escape closes the notification.
 */
@Injectable({providedIn: 'root', useExisting: ɵWorkbenchNotificationService})
export abstract class WorkbenchNotificationService {

  /**
   * Displays the specified message as workbench notification.
   *
   * @param message - Specifies the text to display, if any.
   *                  Can be text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
   * @param options - Controls the appearance and behavior of the notification.
   */
  public abstract show(message: Translatable | null, options?: WorkbenchNotificationOptions): void;

  /**
   * Displays the specified component as workbench notification.
   *
   * Data can be passed to the component as inputs via {@link WorkbenchNotificationOptions.inputs} option. Inputs are available as input
   * properties in the component. Alternatively, data can be passed for injection via a custom injector ({@link WorkbenchNotificationOptions.injector})
   * or providers ({@link WorkbenchNotificationOptions.providers}).
   *
   * @param component - Specifies the component to render as the notification.
   * @param options - Controls the appearance and behavior of the notification.
   */
  public abstract show(component: ComponentType<unknown>, options?: WorkbenchNotificationOptions): void;
}
