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
}

export type WorkbenchClientMenuContributionPosition = OneOf<{
  before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  position?: 'start' | 'end';
}>;

export type WorkbenchClientMenuItemLike = WorkbenchClientMenuItem | WorkbenchClientMenu | WorkbenchClientMenuGroup;

export interface WorkbenchClientMenuOpenOptions {
  anchor: WorkbenchClientMenuOrigin,
  /**
   * Controls where to align the menu relative to the menu anchor, unless there is not enough space available in that area. Defaults to `south`.
   */
  align?: 'vertical' | 'horizontal';

  size?: {
    width?: string
    minWidth?: string;
    maxWidth?: string;
  };
  filter?: boolean | {placeholder?: string; notFoundText?: string};
  focus?: boolean;
  cssClass?: string[];
}

export type WorkbenchClientMenuOrigin = {
  x: number;
  y: number;
  width?: number;
  height?: number;
};
