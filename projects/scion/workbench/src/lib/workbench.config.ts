/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ComponentType } from '@angular/cdk/portal';

/**
 * Configuration for the Workbench.
 */
export abstract class WorkbenchConfig {

  /**
   * Specifies whether to reuse routes of activities.
   * If set to 'true', which is by default, activity components are not destroyed when toggling the activity.
   */
  public abstract reuseActivityRoutes?: boolean;

  /**
   * Allows customizing the appearance of a view tab by providing a custom view tab component.
   *
   * Inject {@link WorkbenchView} and {@link VIEW_TAB_CONTEXT} token into the component to get a reference to the view and the rendering context.
   *
   *
   * ---
   * Example:
   *
   * @Component(...)
   * export class ViewTabContentComponent {
   *   constructor(view: WorkbenchView, @Inject(VIEW_TAB_CONTEXT) context: ViewTabContext) {}
   * }
   */
  public abstract viewTabComponent?: ComponentType<any>;

  /**
   * Controls which built-in menu items to display in the view context menu.
   */
  public abstract viewMenuItems?: ViewMenuItemsConfig;
}

/**
 * Controls which built-in menu items to display in the view context menu.
 */
export interface ViewMenuItemsConfig {
  close?: MenuItemConfig;
  closeOthers?: MenuItemConfig;
  closeAll?: MenuItemConfig;
  closeToTheRight?: MenuItemConfig;
  closeToTheLeft?: MenuItemConfig;
  moveUp?: MenuItemConfig;
  moveRight?: MenuItemConfig;
  moveDown?: MenuItemConfig;
  moveLeft?: MenuItemConfig;
  moveBlank?: MenuItemConfig;
}

export interface MenuItemConfig {
  visible?: boolean;
  text?: string;
  accelerator?: string[];
  group?: string;
}
