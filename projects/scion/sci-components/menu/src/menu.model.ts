import {Signal} from '@angular/core';
import {ComponentType} from '@angular/cdk/portal';
import {SciMenuContributionPosition} from './menu-contribution.model';

/**
 * INPUTS FOR DESCRIPTION: https://www.electronjs.org/docs/latest/api/menu-item
 */
export interface SciMenuItem {
  type: 'menu-item'
  name?: `menuitem:${string}`;
  label?: Signal<string | ComponentType<unknown>>;
  icon?: Signal<string>;
  tooltip?: Signal<string>;
  accelerator?: string[];
  disabled: Signal<boolean>; // Consider renaming to enabled; https://www.electronjs.org/docs/latest/api/menu-item
  // visible: Signal<boolean>; // Consider providing visible
  checked?: Signal<boolean>;
  actions: SciMenuItemLike[];
  matchesFilter?: (filter: string) => boolean;
  cssClass?: string[];
  position?: SciMenuContributionPosition;
  onSelect: () => boolean;
  /** Arbitrary metadata associated with the menu. */
  data?: {[key: string]: string};
}

export interface SciMenu {
  type: 'menu'
  name?: `menu:${string}`;
  label?: Signal<string | ComponentType<unknown>>;
  icon?: Signal<string>;
  tooltip?: Signal<string>;
  disabled: Signal<boolean>; // Consider renaming to enabled; https://www.electronjs.org/docs/latest/api/menu-item
  // visible: Signal<boolean>; // Consider providing visible
  visualMenuHint?: boolean;
  position?: SciMenuContributionPosition;
  menu: {
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    filter?: boolean | {placeholder?: string; notFoundText?: string};
  };
  cssClass?: string[];
  children: SciMenuItemLike[];
  /** Arbitrary metadata associated with the menu. */
  data?: {[key: string]: string};
}

export interface SciMenuGroup {
  type: 'group'
  name?: `group:${string}`;
  label?: Signal<string>;
  collapsible?: {collapsed: boolean} | false;
  position?: SciMenuContributionPosition;
  disabled: Signal<boolean>; // Consider renaming to enabled; https://www.electronjs.org/docs/latest/api/menu-item
  // visible: Signal<boolean>; // Consider providing visible
  children: SciMenuItemLike[];
  cssClass?: string[];
  /** Arbitrary metadata associated with the menu. */
  data?: {[key: string]: string};
}

export type SciMenuItemLike = SciMenuItem | SciMenu | SciMenuGroup;
