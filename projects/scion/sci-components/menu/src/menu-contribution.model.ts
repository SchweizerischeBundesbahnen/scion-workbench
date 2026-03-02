import {Signal} from '@angular/core';
import {ComponentType} from '@angular/cdk/portal';

export interface SciMenuItemContribution {
  type: 'menu-item'
  id: `menuitem:${string}`;
  name: `menuitem:${string}`[];
  label?: Signal<string | ComponentType<unknown>>;
  icon?: Signal<string>;
  tooltip?: Signal<string>;
  accelerator?: string[];
  disabled: Signal<boolean>;
  checked?: Signal<boolean>;
  actionToolbarName?: Signal<`toolbar:${string}` | undefined>;
  matchesFilter?: (filter: string) => boolean;
  cssClass?: string[];
  position?: {
    before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
    after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  };
  onSelect: () => boolean | void;
}

export interface SciMenuContribution {
  type: 'menu'
  id: `menu:${string}`;
  name: `menu:${string}`[];
  label?: Signal<string | ComponentType<unknown>>;
  icon?: Signal<string>;
  tooltip?: Signal<string>;
  disabled: Signal<boolean>;
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
  disabled: Signal<boolean>;
  cssClass?: string[];
}

export type SciMenuContributions = Array<SciMenuItemContribution | SciMenuContribution | SciMenuGroupContribution>;
