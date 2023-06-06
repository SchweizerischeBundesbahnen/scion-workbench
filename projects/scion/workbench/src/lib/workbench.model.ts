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
 * Represents an action displayed to the right of the view tabs, either left- or right-aligned.
 * Actions can be associated with specific view(s), part(s), and/or an area.
 */
export interface WorkbenchPartAction {
  /**
   * Specifies the portal to render the action.
   *
   * Specify a {@link ComponentPortal} to render a component, or a {@link TemplatePortal} to render a template,
   * optionally passing an injector to control the injection context.
   */
  portal: Portal<unknown>;
  /**
   * Specifies where to place this action in the part bar.
   */
  align?: 'start' | 'end';
  /**
   * Associates this action with specific target(s).
   */
  target?: {
    /**
     * Identifies the views(s) to associate this action with.
     *
     * If not specified, associates it with any view, or with the contextual view if modeled in the context of a view.
     * Passing `null` or any other view(s) overrides the contextual view default behavior.
     */
    viewId?: string | string[];
    /**
     * Identifies the part(s) to associate this action with. If not specified, associates it with any part.
     */
    partId?: string | string[];
    /**
     * Identifies the area to associate this action with. If not specified, associates it with any area.
     */
    area?: 'main' | 'peripheral';
  };
  /**
   * Specifies CSS class(es) to be associated with the action, useful in end-to-end tests for locating it.
   */
  cssClass?: string | string[];
}

/**
 * Factory function to create a {@link WorkbenchMenuItem}.
 */
export type WorkbenchMenuItemFactoryFn = (view: WorkbenchView) => WorkbenchMenuItem;

/**
 * Menu item in a menu or context menu.
 */
export interface WorkbenchMenuItem {
  /**
   * Specifies the content of the menu item.
   */
  portal: TemplatePortal | ComponentPortal<any>;
  /**
   * Sets the listener invoked when the user performs the menu action, either by clicking the menu or via keyboard accelerator, if any.
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
   * Specifies CSS class(es) to be added to the menu item, useful in end-to-end tests for locating the menu item.
   */
  cssClass?: string | string[];
}

