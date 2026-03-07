import {Signal} from '@angular/core';
import {ComponentType} from '@angular/cdk/portal';
import {SciMenu, SciMenuGroup} from './menu/menu.model';
import {SciToolbar, SciToolbarGroup} from './toolbar/toolbar.model';

/**
 * INPUTS FOR DESCRIPTION: https://www.electronjs.org/docs/latest/api/menu-item
 */
export interface SciMenuItemContribution {
  type: 'menu-item'
  name?: `menuitem:${string}`;
  label?: Signal<string | ComponentType<unknown>>;
  icon?: Signal<string>;
  tooltip?: Signal<string>;
  accelerator?: string[];
  disabled: Signal<boolean>; // Consider renaming to enabled; https://www.electronjs.org/docs/latest/api/menu-item
  // visible: Signal<boolean>; // Consider providing visible
  checked?: Signal<boolean>;
  actionToolbarName?: Signal<`toolbar:${string}` | undefined>;
  matchesFilter?: (filter: string) => boolean;
  cssClass?: string[];
  position?: {
    before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
    after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  };
  onSelect: () => boolean;
  /** Arbitrary metadata associated with the menu. */
  data?: {[key: string]: string};
}

export interface SciMenuContribution {
  type: 'menu'
  name?: `menu:${string}`;
  label?: Signal<string | ComponentType<unknown>>;
  icon?: Signal<string>;
  tooltip?: Signal<string>;
  disabled: Signal<boolean>; // Consider renaming to enabled; https://www.electronjs.org/docs/latest/api/menu-item
  // visible: Signal<boolean>; // Consider providing visible
  visualMenuHint?: boolean;
  position?: {
    before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
    after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  };
  menu: {
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    filter?: boolean | {placeholder?: string; notFoundText?: string};
  };
  cssClass?: string[];
  children: SciMenuContributions;
  /** Arbitrary metadata associated with the menu. */
  data?: {[key: string]: string};
}

export interface SciMenuGroupContribution {
  type: 'group'
  name?: `group:${string}`;
  label?: Signal<string>;
  collapsible?: {collapsed: boolean} | false;
  position?: {
    before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
    after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  };
  disabled: Signal<boolean>; // Consider renaming to enabled; https://www.electronjs.org/docs/latest/api/menu-item
  // visible: Signal<boolean>; // Consider providing visible
  children: SciMenuContributions;
  cssClass?: string[];
  /** Arbitrary metadata associated with the menu. */
  data?: {[key: string]: string};
}

export interface SciMenuContribution2 {
  scope: 'menu' | 'toolbar',
  factory: (menu: SciMenu | SciToolbar, context: Map<string, unknown>) => void;
  context?: Map<string, unknown>;
  before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
}

export interface SciGroupContribution2 {
  scope: 'menu' | 'toolbar',
  factory: (group: SciMenuGroup | SciToolbarGroup, context: Map<string, unknown>) => void;
  context?: Map<string, unknown>;
  before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
}

export interface SciMenuContributionLocation {
  location: `menu:${string}`;
  context?: Map<string, unknown>;
  before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
}

export interface SciToolbarContributionLocation {
  location: `toolbar:${string}`;
  context?: Map<string, unknown>;
  before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
}

export interface SciMenuGroupContributionLocation {
  location: `group(menu):${string}`;
  context?: Map<string, unknown>;
  before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
}

export interface SciToolbarGroupContributionLocation {
  location: `group(toolbar):${string}`;
  context?: Map<string, unknown>;
  before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
}

export type SciMenuContributions = Array<SciMenuItemContribution | SciMenuContribution | SciMenuGroupContribution>

// export type SciMenuContributionLocations = SciMenuContributionLocation | SciToolbarContributionLocation | SciMenuGroupContributionLocation | SciToolbarGroupContributionLocation;
