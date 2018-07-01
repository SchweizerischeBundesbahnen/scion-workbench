import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';

/**
 * Allows rearrange the layout of Workbench window.
 */
@Injectable()
export class WorkbenchLayoutService {

  private _maximized: boolean;

  /**
   * Notifies upon resizing a view by dragging the sashes which separate them.
   */
  public readonly viewSashDrag$ = new Subject<'start' | 'end'>();

  /**
   * Notifies upon dragging a view to different positions within the Workbench.
   */
  public readonly viewTabDrag$ = new Subject<'start' | 'end'>();

  /**
   * Notifies upon moving a message box to different positions within the Workbench.
   */
  public readonly messageBoxMove$ = new Subject<'start' | 'end'>();

  /**
   * Notifies upon workbench layout change.
   */
  public readonly afterGridChange$ = new Subject<void>();

  /**
   * Displays the main content in full viewport width.
   *
   * @param maximize
   *   If not specified, maximize mode is toggled. If 'true', the application is maximized or minimized otherwise.
   */
  public toggleMaximized(maximize?: boolean): void {
    if (maximize === undefined) {
      this._maximized = !this._maximized;
    } else {
      this._maximized = maximize;
    }
  }

  /**
   * Indicates whether the main content is displayed in full viewport width.
   */
  public get maximized(): boolean {
    return this._maximized;
  }
}
