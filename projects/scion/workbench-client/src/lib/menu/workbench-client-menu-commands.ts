import {WorkbenchMenuContributionPosition, WorkbenchMenuItemTransferableLike, WorkbenchMenuTransferable} from './workbench-client-menu.model';
import {DialogId, NotificationId, PartId, PopupId, ViewId} from '../workbench.identifiers';
import {Translatable} from '../text/workbench-text-provider.model';

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
  menu: WorkbenchMenuTransferable,
  anchor: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  },
  align?: 'vertical' | 'horizontal';
  focus?: boolean;
  workbenchElementId: ViewId | PartId | DialogId | PopupId | NotificationId;
  context: Map<string, unknown>;
  metadata?: {[key: string]: unknown};
}
