import {WorkbenchMenuContributionPosition, WorkbenchMenuTransferable} from './workbench-client-menu.model';
import {DialogId, NotificationId, PartId, PopupId, ViewId} from '../workbench.identifiers';

export interface ɵWorkbenchMenuContributionRegisterCommand {
  location: `menu:${string}` | `toolbar:${string}`,
  requiredContext: Map<string, unknown>;
  position?: WorkbenchMenuContributionPosition;
  metadata?: {[key: string]: unknown};
  contributionInstant?: number;
}

export interface ɵWorkbenchMenuContributionConstructCommand {
  context: Map<string, unknown>;
}

export interface ɵWorkbenchMenuItemLookupCommand {
  location: `menu:${string}` | `toolbar:${string}`,
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
