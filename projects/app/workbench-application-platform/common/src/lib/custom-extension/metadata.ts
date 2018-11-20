import { ActivityAction } from '@scion/workbench-application-platform.api';

/**
 * Custom types for activity actions.
 */
export enum CustomActivityActionTypes {
  /**
   * Action button to show a notification to the user.
   */
  CustomNotify = 'custom',
}

/**
 * Shows an activity button to show a notification to the user.
 */
export interface CustomNotifyActivityAction extends ActivityAction {
  type: CustomActivityActionTypes.CustomNotify;
  properties: {
    text: string;
    title: string;
    cssClass: string | string[];
  };
}
