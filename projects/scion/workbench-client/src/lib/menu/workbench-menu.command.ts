/**
 * Command object to contribute menu.
 *
 * @docs-private Not public API. For internal use only.
 * @ignore
 */
export interface ɵWorkbenchMenuContributionCommand {
  location: `menu:${string}` | `toolbar:${string}` | `group(menu):${string}` | `group(toolbar):${string}`;
  contributions: WorkbenchMenuCommands;
  context: Map<string, unknown>;
}

export interface ɵWorkbenchMenuContributionRequestCommand {
  location: `menu:${string}` | `toolbar:${string}` | `group:${string}`;
  context: Map<string, unknown>;
}

export interface WorkbenchMenuCommand {
  type: 'menu',
  id: string;
  name: `menu:${string}` | `menu:${string}`[];
  label?: string;
  icon?: string;
  tooltip?: string;
  disabled: boolean;
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

export interface WorkbenchMenuItemCommand {
  type: 'menu-item';
  id: string;
  name: `menuitem:${string}` | `menuitem:${string}`[];
  label?: string;
  icon?: string;
  tooltip?: string;
  accelerator?: string[];
  disabled: boolean;
  checked?: boolean;
  actionToolbarName?: `toolbar:${string}`;
  position?: {
    before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
    after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  };
  cssClass?: string[];
}

export interface WorkbenchMenuGroupCommand {
  type: 'group';
  id: string;
  name: `group:${string}` | `group:${string}`[];
  label?: string;
  collapsible?: {collapsed: boolean} | false;
  disabled: boolean;
  position?: {
    before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
    after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  };
}

export type WorkbenchMenuCommands = Array<WorkbenchMenuItemCommand | WorkbenchMenuCommand | WorkbenchMenuGroupCommand>;

export interface WorkbenchSelectCommand {
  context: Map<string, unknown>;
}

/**
 * Key to retrieve the identity of a menu item from its data.
 *
 * @docs-private Not public API. For internal use only.
 * @ignore
 */
export const ɵMENU_ID_KEY = 'ɵworkbench.menu.id';
