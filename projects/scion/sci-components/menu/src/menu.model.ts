import {Signal} from '@angular/core';
import {SciMenuContributionPositionLike} from './menu-contribution.model';
import {Translatable} from '@scion/sci-components/text';
import {SciComponentDescriptor} from '@scion/sci-components/common';

/**
 * INPUTS FOR DESCRIPTION: https://www.electronjs.org/docs/latest/api/menu-item
 */
export interface SciMenuItem {
  type: 'menu-item'
  name?: `menuitem:${string}`;
  labelText?: Signal<string>;
  labelComponent?: SciComponentDescriptor;
  iconLigature?: Signal<string>;
  iconComponent?: SciComponentDescriptor;
  control?: SciComponentDescriptor; // only in toolbar, not menu
  tooltip?: Signal<string>;
  accelerator?: string[];
  disabled?: Signal<boolean>; // Consider renaming to enabled; https://www.electronjs.org/docs/latest/api/menu-item
  // visible: Signal<boolean>; // Consider providing visible
  checked?: Signal<boolean>;
  actions: SciMenuItemLike[];
  matchesFilter?: (filter: string) => boolean;
  cssClass?: string[];
  attributes?: {[name: string]: string};
  position?: SciMenuContributionPositionLike;
  onSelect: () => Promise<boolean>;
}

export interface SciMenu {
  type: 'menu'
  name?: `menu:${string}`;
  labelText?: Signal<string>;
  labelComponent?: SciComponentDescriptor;
  iconLigature?: Signal<string>;
  iconComponent?: SciComponentDescriptor;
  tooltip?: Signal<string>;
  disabled?: Signal<boolean>; // Consider renaming to enabled; https://www.electronjs.org/docs/latest/api/menu-item
  // visible: Signal<boolean>; // Consider providing visible
  visualMenuHint?: boolean;
  position?: SciMenuContributionPositionLike;
  menu: {
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    maxHeight?: string;
    filter?: {placeholder?: Signal<Translatable>; notFoundText?: Signal<Translatable>};
  };
  cssClass?: string[];
  children: SciMenuItemLike[];
}

export interface SciMenuGroup {
  type: 'group'
  name?: `menu:${string}` | `toolbar:${string}`;
  label?: Signal<string>;
  collapsible?: {collapsed: boolean};
  position?: SciMenuContributionPositionLike;
  disabled?: Signal<boolean>; // Consider renaming to enabled; https://www.electronjs.org/docs/latest/api/menu-item
  // visible: Signal<boolean>; // Consider providing visible
  children: SciMenuItemLike[];
  cssClass?: string[];
}

export type SciMenuItemLike = SciMenuItem | SciMenu | SciMenuGroup;
