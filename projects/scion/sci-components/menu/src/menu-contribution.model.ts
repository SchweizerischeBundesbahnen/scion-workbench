import {Signal} from '@angular/core';
import {ComponentType} from '@angular/cdk/portal';

/**
 * INPUTS FOR DESCRIPTION: https://www.electronjs.org/docs/latest/api/menu-item
 */
export interface SciMenuItemContribution {
  type: 'menu-item'
  id: `menuitem:${string}`;
  name: `menuitem:${string}`[];
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
  onSelect: (context: Map<string, unknown>) => boolean;
}

export interface SciMenuContribution {
  type: 'menu'
  id: `menu:${string}`;
  name: `menu:${string}`[];
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
}

export interface SciMenuGroupContribution {
  type: 'group'
  id: `group:${string}`;
  name: `group:${string}`[];
  label?: Signal<string>;
  collapsible?: {collapsed: boolean} | false;
  position?: {
    before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
    after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  };
  disabled: Signal<boolean>; // Consider renaming to enabled; https://www.electronjs.org/docs/latest/api/menu-item
  // visible: Signal<boolean>; // Consider providing visible
  cssClass?: string[];
}

export type SciMenuContributions = Array<SciMenuItemContribution | SciMenuContribution | SciMenuGroupContribution>;
