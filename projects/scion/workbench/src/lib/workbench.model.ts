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
import {ComponentPortal, Portal, TemplatePortal} from '@angular/cdk/portal';
import {WorkbenchView} from './view/workbench-view.model';
import {WorkbenchPart} from './part/workbench-part.model';

/**
 * Lifecycle hook that is called when a view component is to be destroyed, and which is called before 'ngOnDestroy'.
 *
 * The return value controls whether destruction should be continued.
 */
export interface WorkbenchViewPreDestroy {

  /**
   * Lifecycle hook which is called upon view destruction.
   *
   * Return a falsy value to prevent view destruction, either as a boolean value or as an observable which emits a boolean value.
   */
  onWorkbenchViewPreDestroy(): Observable<boolean> | Promise<boolean> | boolean;
}

/**
 * Describes an action contributed to a part.
 *
 * Part actions are displayed to the right of the view tab bar and enable interaction with the part and its content.
 */
export interface WorkbenchPartAction {
  /**
   * Specifies the portal to render the action.
   *
   * Use a {@link ComponentPortal} to render a component, or a {@link TemplatePortal} to render a template.
   */
  portal: Portal<unknown>;
  /**
   * Specifies where to place this action in the action bar.
   */
  align?: 'start' | 'end';
  /**
   * Predicate to match a specific part, parts in a specific area, or parts from a specific perspective.
   *
   * By default, if not specified, matches any part.
   *
   * The function can call `inject` to get any required dependencies.
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
 * The function can call `inject` to get any required dependencies.
 */
export type CanMatchPartFn = (part: WorkbenchPart) => boolean;

/**
 * Factory function to create a {@link WorkbenchMenuItem}.
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
