import {ɵMPartGrid} from './workbench-layout.model';
import {ActivityId} from '../activity/workbench-activity.model';

/**
 * Grids referenced in the workbench layout.
 */
export interface WorkbenchGrids<T = ɵMPartGrid> {
  /**
   * Reference to the "root" grid of the workbench layout.
   */
  main: T;
  /**
   * Reference to the main area grid, a sub-grid embedded by the main area part contained in the main grid.
   */
  mainArea?: T;

  [activityId: ActivityId]: T;
}
