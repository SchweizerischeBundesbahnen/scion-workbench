/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Observable} from 'rxjs';
import {ComponentType} from '@angular/cdk/portal';
import {WorkbenchView} from './view/workbench-view.model';
import {Injector, TemplateRef} from '@angular/core';
import {WorkbenchPart} from './part/workbench-part.model';
import {WorkbenchDialog} from './dialog/workbench-dialog.model';
import {WorkbenchPopup} from './popup/workbench-popup.model';

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
   * Specifies data to pass to the component or template.
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
   * Controls where to place this action in the part bar. Defaults to `end`.
   */
  align?: 'start' | 'end';
  /**
   * Specifies CSS class(es) to add to the action, e.g., to locate the action in tests.
   */
  cssClass?: string | string[];
}

/**
 * Represents a menu item contained in the context menu of a {@link WorkbenchView}.
 *
 * Right-clicking on a view tab opens a context menu to interact with the view and its content.
 */
export interface WorkbenchMenuItem {
  /**
   * Specifies the content of the menu item.
   *
   * Use a {@link ComponentType} to render a component, or a {@link TemplateRef} to render a template.
   *
   * The component and template can inject the {@link WorkbenchView}, either through dependency injection or default template-local variable (`let-view`).
   */
  content: ComponentType<unknown> | TemplateRef<unknown>;
  /**
   * Specifies data to pass to the component or template.
   *
   * If using a component, inputs are available as input properties.
   *
   * ```ts
   * @Component({...})
   * class MenuItemComponent {
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
   * Function invoked when the menu item is clicked.
   *
   * The function can call `inject` to get any required dependencies.
   */
  onAction: () => void;
  /**
   * Binds keyboard accelerator(s) to the menu item, e.g., ['ctrl', 'alt', 1].
   *
   * Supported modifiers are 'ctrl', 'shift', 'alt' and 'meta'.
   */
  accelerator?: string[];
  /**
   * Enables grouping of menu items.
   */
  group?: string;
  /**
   * Controls if the menu item is disabled. Defaults to `false`.
   */
  disabled?: boolean;
  /**
   * Specifies CSS class(es) to add to the menu item, e.g., to locate the menu item in tests.
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
 * Signature of a function to contribute a menu item to the context menu of a {@link WorkbenchView}.
 *
 * The function:
 * - Is called per view. Returning the menu item adds it to the context menu of the view, returning `null` skips it.
 * - Can call `inject` to get any required dependencies.
 * - Runs in a reactive context and is called again when tracked signals change.
 *   Use Angular's `untracked` function to execute code outside this reactive context.
 */
export type WorkbenchViewMenuItemFn = (view: WorkbenchView) => WorkbenchMenuItem | null;

/**
 * Union of workbench elements.
 */
export type WorkbenchElement = WorkbenchPart | WorkbenchView | WorkbenchDialog | WorkbenchPopup;
