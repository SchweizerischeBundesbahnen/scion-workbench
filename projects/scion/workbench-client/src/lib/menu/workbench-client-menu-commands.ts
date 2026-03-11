import {SciMenuContributionPosition} from '@scion/sci-components/menu';

export interface WorkbenchClientMenuContributionRegisterCommand {
  location: `menu:${string}` | `toolbar:${string}` | `group:${string}`,
  scope: 'menu' | 'toolbar',
  requiredContext: Map<string, unknown>;
  position?: SciMenuContributionPosition;
}

export interface WorkbenchClientMenuItemListCommand {
  location: `menu:${string}` | `toolbar:${string}` | `group:${string}`,
  context: Map<string, unknown>;
}

export interface WorkbenchClientMenuContributionFactoryCommand {
  context: Map<string, unknown>;
}
