import {WorkbenchMenuContributionPosition, WorkbenchMenuItemTransferableLike} from './workbench-client-menu.model';
import {DialogId, NotificationId, PartId, PopupId, ViewId} from '../workbench.identifiers';

export interface ɵWorkbenchClientMenuContributionRegisterCommand {
  location: `menu:${string}` | `toolbar:${string}` | `group:${string}`,
  scope: 'menu' | 'toolbar',
  requiredContext: Map<string, unknown>;
  position?: WorkbenchMenuContributionPosition;
}

export interface ɵWorkbenchClientMenuContributionCreateCommand {
  context: Map<string, unknown>;
}

export interface ɵWorkbenchClientMenuItemLookupCommand {
  location: `menu:${string}` | `toolbar:${string}` | `group:${string}`,
  context: Map<string, unknown>;
}

export interface ɵWorkbenchClientMenuOpenCommand {
  menu: `menu:${string}` | WorkbenchMenuItemTransferableLike[];
  options: {
    anchor: {
      x: number;
      y: number;
      width?: number;
      height?: number;
    },
    align?: 'vertical' | 'horizontal';
    size?: {
      width?: string
      minWidth?: string;
      maxWidth?: string;
    };
    filter?: boolean | {placeholder?: string; notFoundText?: string};
    focus?: boolean;
    cssClass?: string[];
  };
  context: Map<string, unknown>;
  workbenchElementId: ViewId | PartId | DialogId | PopupId | NotificationId;
}
