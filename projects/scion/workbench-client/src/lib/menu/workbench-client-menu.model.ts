import {OneOf} from './utility-types';

export interface WorkbenchClientMenuItem {
  id: string;
  type: 'menu-item'
  name?: `menuitem:${string}`;
  label?: string;
  icon?: string;
  tooltip?: string;
  accelerator?: string[];
  disabled: boolean;
  checked?: boolean;
  actions: WorkbenchClientMenuItemLike[];
  cssClass?: string[];
  position?: WorkbenchClientMenuContributionPosition;
  data?: {[key: string]: string};
}

export interface WorkbenchClientMenu {
  id: string;
  type: 'menu'
  name?: `menu:${string}`;
  label?: string;
  icon?: string;
  tooltip?: string;
  disabled: boolean;
  visualMenuHint?: boolean;
  position?: WorkbenchClientMenuContributionPosition;
  menu: {
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    filter?: boolean | {placeholder?: string; notFoundText?: string};
  };
  cssClass?: string[];
  children: WorkbenchClientMenuItemLike[];
  data?: {[key: string]: string};
}

export interface WorkbenchClientMenuGroup {
  id: string;
  type: 'group'
  name?: `group:${string}`;
  label?: string;
  collapsible?: {collapsed: boolean} | false;
  position?: WorkbenchClientMenuContributionPosition;
  disabled: boolean;
  children: WorkbenchClientMenuItemLike[];
  cssClass?: string[];
  data?: {[key: string]: string};
}

export type WorkbenchClientMenuContributionPosition = OneOf<{
  before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  position?: 'start' | 'end';
}>;

export type WorkbenchClientMenuItemLike = WorkbenchClientMenuItem | WorkbenchClientMenu | WorkbenchClientMenuGroup;
