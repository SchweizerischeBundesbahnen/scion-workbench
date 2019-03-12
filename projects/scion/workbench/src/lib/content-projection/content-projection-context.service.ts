import { Injectable } from '@angular/core';
import { TaskScheduler } from '../task-scheduler.service';

/**
 * Indicates if content projection is used in the current view or activity context.
 *
 * A separate instance is used for every {ViewComponent} and {ActivityPartComponent}.
 */
@Injectable()
export class ContentProjectionContext {

  private _active = false;

  constructor(private _taskScheduler: TaskScheduler) {
  }

  public setActive(active: boolean): void {
    // Set active flag asynchronously to not run into a `ExpressionChangedAfterItHasBeenCheckedError`,
    // e.g. if evaluated by a component which already was change detected.
    this._taskScheduler.scheduleMicrotask(() => this._active = active);
  }

  public isActive(): boolean {
    return this._active;
  }
}
