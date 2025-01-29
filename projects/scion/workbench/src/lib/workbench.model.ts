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
import {ComponentPortal, ComponentType, TemplatePortal} from '@angular/cdk/portal';
import {WorkbenchView} from './view/workbench-view.model';
import {Injector, TemplateRef} from '@angular/core';
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
 * Represents an action of a {@link WorkbenchPart}.
 *
 * Part actions are displayed in the part bar, enabling interaction with the part and its content. Actions can be aligned to the left or right.
 */
export interface WorkbenchPartAction {
  /**
   * Specifies the content of the action.
   *
   * Use a {@link ComponentType} to render a component, or a {@link TemplateRef} to render a template.
   *
   * The component and template can inject the {@link WorkbenchPart}, either through dependency injection or default template-local variable (`let-part`).
   */
  content: ComponentType<unknown> | TemplateRef<unknown>;
  /**
   * Optional data to pass to the component or template.
   *
   * If using a component, inputs are available as input properties.
   *
   * ```ts
   * @Component({...})
   * class ActionComponent {
   *   someInput = input.required<string>();
   * }
   * ```
   *
   * If using a template, inputs are available for binding via local template let declarations.
   *
   * ```html
   * <ng-template let-input="someInput">
   *   ...
   * </ng-template>
   * ```
   */
  inputs?: {[name: string]: unknown};
  /**
   * Sets the injector for the instantiation of the component or template, giving control over the objects available for injection.
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
   * Controls where to place this action in the part bar. Defaults to `start`.
   */
  align?: 'start' | 'end';
  /**
   * Specifies CSS class(es) to add to the action, e.g., to locate the action in tests.
   */
  cssClass?: string | string[];
}

/**
 * Signature of a function to contribute an action to a {@link WorkbenchPart}.
 *
 * The function:
 * - Can return a component or template, or an object literal for more control.
 * - Is called per part. Returning the action adds it to the part, returning `null` skips it.
 * - Can call `inject` to get any required dependencies.
 * - Runs in a reactive context and is called again when tracked signals change.
 *   Use Angular's `untracked` function to execute code outside this reactive context.
 */
export type WorkbenchPartActionFn = (part: WorkbenchPart) => WorkbenchPartAction | ComponentType<unknown> | TemplateRef<unknown> | null;

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
