/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';
import {ɵWorkbenchPopupService} from './ɵworkbench-popup.service';
import {ComponentType} from '@angular/cdk/portal';
import {WorkbenchPopupOptions} from './workbench-popup.options';

/**
 * Enables the display of a component in a popup.
 *
 * A popup is a visual workbench element for displaying content above other content. It is positioned relative to an anchor,
 * which can be an element or a coordinate. The popup moves with the anchor. By default, the popup closes on focus loss or
 * when pressing the escape key.
 *
 * A popup can be bound to a context (e.g., part or view), displaying the popup only if the context is visible and closing
 * it when the context is disposed. Defaults to the calling context.
 */
@Injectable({providedIn: 'root', useExisting: ɵWorkbenchPopupService})
export abstract class WorkbenchPopupService {

  /**
   * Opens a popup with the specified component and options.
   *
   * An anchor is used to position the popup based on its preferred alignment. The anchor can be an element or a coordinate.
   *
   * Data can be passed to the component as inputs via {@link WorkbenchPopupOptions.inputs} option. Inputs are available as input
   * properties in the component. Alternatively, data can be passed for injection via a custom injector ({@link WorkbenchPopupOptions.injector})
   * or providers ({@link WorkbenchPopupOptions.providers}).
   *
   * By default, the popup closes on focus loss or when pressing the escape key.
   *
   * @param component - Specifies the component to display in the popup.
   * @param options - Controls the appearance and behavior of the popup.
   * @returns Promise that resolves to the popup result, if any, or that rejects if the popup couldn't be opened or was closed with an error.
   */
  public abstract open<R>(component: ComponentType<unknown>, options: WorkbenchPopupOptions): Promise<R | undefined>;
}
