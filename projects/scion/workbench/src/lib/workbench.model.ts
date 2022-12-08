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
import {Injector, TemplateRef} from '@angular/core';
import {ComponentPortal, ComponentType, TemplatePortal} from '@angular/cdk/portal';
import {WorkbenchView} from './view/workbench-view.model';

/**
 * Lifecycle hook that is called when a view component is to be destroyed, and which is called before 'ngOnDestroy'.
 *
 * The return value controls whether destruction should be continued.
 */
export interface WbBeforeDestroy {

  /**
   * Lifecycle hook which is called upon view destruction.
   *
   * Return a falsy value to prevent view destruction, either as a boolean value or as an observable which emits a boolean value.
   */
  wbBeforeDestroy(): Observable<boolean> | Promise<boolean> | boolean;
}

/**
 * Action to be added to an action bar.
 */
export interface WorkbenchAction {
  /**
   * Specifies either a template or a component to render this action.
   */
  templateOrComponent: TemplateRef<void> | {component: ComponentType<any>; injector: Injector};

  /**
   * Specifies where to place this action.
   */
  align?: 'start' | 'end';
}

/**
 * Represents a viewpart action added to the viewpart action bar. Viewpart actions are displayed next to the view tabs.
 */
export interface WorkbenchViewPartAction extends WorkbenchAction {
  /**
   * Sticks this action to given view.
   *
   * If set, the action is only visible if the specified view is the active view in the viewpart.
   */
  viewId?: string;
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

