import { Injectable } from '@angular/core';

/**
 * Indicates if content projection is used in the current view or activity context.
 *
 * A separate instance is used for every {ViewComponent} and {ActivityPartComponent}.
 */
@Injectable()
export class ContentProjectionContext {

  private _active = false;

  public setActive(active: boolean): void {
    // Set active flag asynchronously to not run into a `ExpressionChangedAfterItHasBeenCheckedError`,
    // e.g. if evaluated by a component which already was change detected.
    setTimeout(() => this._active = active);
  }

  public isActive(): boolean {
    return this._active;
  }
}
