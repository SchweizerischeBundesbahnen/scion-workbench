import {WorkbenchClientMenuContributionPosition, WorkbenchClientMenuItemLike, WorkbenchClientMenuOpenOptions} from './workbench-client-menu.model';

export interface ɵWorkbenchClientMenuContributionRegisterCommand {
  location: `menu:${string}` | `toolbar:${string}` | `group:${string}`,
  scope: 'menu' | 'toolbar',
  requiredContext: Map<string, unknown>;
  position?: WorkbenchClientMenuContributionPosition;
}

export interface ɵWorkbenchClientMenuItemListCommand {
  location: `menu:${string}` | `toolbar:${string}` | `group:${string}`,
  context: Map<string, unknown>;
}

export interface ɵWorkbenchClientMenuContributionFactoryCommand {
  context: Map<string, unknown>;
}

export interface ɵWorkbenchClientMenuOpenCommand {
  menu: `menu:${string}` | WorkbenchClientMenuItemLike[];
  options: WorkbenchClientMenuOpenOptions;
}
