import {WorkbenchMenuContributionPositionLike, WorkbenchMenuTransferable} from './workbench-client-menu.model';
import {DialogId, NotificationId, PartId, PopupId, ViewId} from '../workbench.identifiers';

export interface ɵWorkbenchMenuContributionRegisterCommand {
  location: `menu:${string}` | `toolbar:${string}` | `menubar:${string}`;
  requiredContext: Map<string, unknown>;
  position?: WorkbenchMenuContributionPositionLike;
  metadata?: {[key: string]: unknown};
  contributionInstant?: number;
}

export interface ɵWorkbenchMenuContributionConstructCommand {
  context: Map<string, unknown>;
}

export interface ɵWorkbenchMenuItemLookupCommand {
  location: `menu:${string}` | `toolbar:${string}` | `menubar:${string}`;
  context: Map<string, unknown>;
  metadata?: {[key: string]: unknown};
}

export interface ɵWorkbenchMenuOpenCommand {
  menu: WorkbenchMenuTransferable;
  anchor: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  align?: 'vertical' | 'horizontal';
  focus?: boolean;
  workbenchElementId: ViewId | PartId | DialogId | PopupId | NotificationId;
  context: Map<string, unknown>;
  metadata?: {[key: string]: unknown};
}
