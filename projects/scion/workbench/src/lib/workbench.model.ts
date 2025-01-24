/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Observable} from 'rxjs';
import {ComponentPortal, TemplatePortal} from '@angular/cdk/portal';
import {WorkbenchView} from './view/workbench-view.model';
import {WorkbenchPart} from './part/workbench-part.model';

/**
 * Guard that a view can implement to decide whether it can be closed.
 *
 * The following example implements a `CanClose` guard that asks the user whether the view can be closed.
 *
 * ```ts
 * class ViewComponent implements CanClose {
 *
 *   public async canClose(): Promise<boolean> {
 *     const action = await inject(WorkbenchMessageBoxService).open('Do you want to close this view?', {
 *       actions: {yes: 'Yes', no: 'No'},
 *     });
 *     return action === 'yes';
 *   }
 * }
 * ```
 * @deprecated since version 18.0.0-beta.9. Register a callback on {@link WorkbenchView.canClose} instead of implementing the {@link CanClose} lifecycle hook. Refer to the {@link WorkbenchView.canClose} documentation for an example. This API will be removed in a future release.
 */
export interface CanClose {

  /**
   * Decides whether this view can be closed.
   *
   * This function can call `inject` to get any required dependencies.
   *
   * @deprecated since version 18.0.0-beta.9. Register a callback on {@link WorkbenchView.canClose} instead of implementing the {@link CanClose} lifecycle hook. Refer to the {@link WorkbenchView.canClose} documentation for an example. This API will be removed in a future release.
   */
  canClose(): Observable<boolean> | Promise<boolean> | boolean;
}

/**
 * The signature of a function to confirm closing a view., e.g., if dirty.
 *
 * The function can call `inject` to get dependencies.
 */
export type CanCloseFn = () => Observable<boolean> | Promise<boolean> | boolean;

/**
 * Reference to a `CanClose` guard registered on a view.
 */
export interface CanCloseRef {

  /**
   * Removes the `CanClose` guard from the view.
   *
   * Has no effect if another guard was registered in the meantime.
   */
  dispose(): void;
}

/**
 * Describes an action contributed to a part.
 *
 * Part actions are displayed in the part bar, enabling interaction with the part and its content. Actions can be aligned to the left or right.
 */
export interface WorkbenchPartAction {
  /**
   * Specifies the content of the action.
   *
   * Use a {@link ComponentPortal} to render a component, or a {@link TemplatePortal} to render a template.
   */
  portal: TemplatePortal<void> | ComponentPortal<unknown>;
  /**
   * Controls where to place this action in the part bar.
   */
  align?: 'start' | 'end';
  /**
   * Predicate to match a specific context, such as a particular part or condition. Defaults to any context.
   *
   * The function:
   * - Can call `inject` to get any required dependencies, such as the contextual part.
   * - Runs in a reactive context, re-evaluating when tracked signals change.
   *   To execute code outside this reactive context, use Angular's `untracked` function.
   */
  canMatch?: CanMatchPartFn;
  /**
   * Specifies CSS class(es) to add to the action, e.g., to locate the action in tests.
   */
  cssClass?: string | string[];
}

/**
 * The signature of a function used as a `canMatch` condition for a part.
 *
 * The function:
 * - Can call `inject` to get any required dependencies.
 * - Runs in a reactive context, re-evaluating when tracked signals change.
 *   To execute code outside this reactive context, use Angular's `untracked` function.
 */
export type CanMatchPartFn = (part: WorkbenchPart) => boolean;

/**
 * Factory function to create a {@link WorkbenchMenuItem}.
 *
 * The function will be invoked when opening a view's context menu. Use the passed view handle to decide whether to display the menu item.
 */
export type WorkbenchMenuItemFactoryFn = (view: WorkbenchView) => WorkbenchMenuItem | null;

/**
 * Menu item in a menu or context menu.
 */
export interface WorkbenchMenuItem {
  /**
   * Specifies the content of the menu item.
   */
  portal: TemplatePortal | ComponentPortal<any>;
  /**
   * Specifies the callback triggered when clicking this menu item.
   *
   * The function can call `inject` to get any required dependencies.
   */
  onAction: () => void;
  /**
   * Allows the user to interact with the menu item using keys on the keyboard, e.g., ['ctrl', 'alt', 1].
   *
   * Supported modifiers are 'ctrl', 'shift', 'alt' and 'meta'.
   */
  accelerator?: string[];
  /**
   * Allows grouping menu items of the same group.
   */
  group?: string;
  /**
   * Allows disabling the menu item based on a condition.
   */
  isDisabled?: () => boolean;
  /**
   * Specifies CSS class(es) to add to the menu item, e.g., to locate the menu item in tests.
   */
  cssClass?: string | string[];
}

/**
 * Information about a workbench theme.
 */
export interface WorkbenchTheme {
  /**
   * The name of the theme.
   */
  name: string;
  /**
   * The color scheme of the theme.
   */
  colorScheme: 'light' | 'dark';
}
