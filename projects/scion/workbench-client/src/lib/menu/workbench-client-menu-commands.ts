import {WorkbenchMenuContributionPosition, WorkbenchMenuItemTransferableLike} from './workbench-client-menu.model';
import {DialogId, NotificationId, PartId, PopupId, ViewId} from '../workbench.identifiers';

export interface ɵWorkbenchMenuContributionRegisterCommand {
  location: `menu:${string}` | `toolbar:${string}` | `group(menu):${string}` | `group(toolbar):${string}`,
  requiredContext: Map<string, unknown>;
  position?: WorkbenchMenuContributionPosition;
  metadata?: {[key: string]: unknown};
  contributionInstant?: number;
}

export interface ɵWorkbenchMenuContributionConstructCommand {
  context: Map<string, unknown>;
}

export interface ɵWorkbenchMenuItemLookupCommand {
  location: `menu:${string}` | `toolbar:${string}` | `group:${string}`,
  context: Map<string, unknown>;
  metadata?: {[key: string]: unknown};
}

export interface ɵWorkbenchMenuOpenCommand {
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
    metadata?: {[key: string]: unknown};
  };
  context: Map<string, unknown>;
  workbenchElementId: ViewId | PartId | DialogId | PopupId | NotificationId;
}
