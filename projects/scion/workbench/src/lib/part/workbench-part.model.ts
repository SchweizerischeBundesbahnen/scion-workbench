import {Observable} from 'rxjs';
import {Disposable} from '../disposable';
import {WorkbenchPartAction} from '../workbench.model';

/**
 * Represents a part of the workbench layout.
 *
 * A part is a stack of views that can be arranged in the workbench layout.
 *
 * @see WorkbenchView
 */
export abstract class WorkbenchPart {

  /**
   * Unique identity of this part.
   */
  public abstract readonly id: string;

  /**
   * Indicates whether this part is located in the main area.
   */
  public abstract readonly isInMainArea: boolean;

  /**
   * Indicates whether this part is active or inactive.
   */
  public abstract readonly active: boolean;

  /**
   * Notifies when this part becomes active or inactive.
   *
   * Upon subscription, emits the current state, and then each time the state changes. The observable never completes.
   */
  public abstract readonly active$: Observable<boolean>;

  /**
   * Emits the currently active view in this part.
   */
  public abstract readonly activeViewId$: Observable<string | null>;

  /**
   * The currently active view, if any.
   */
  public abstract readonly activeViewId: string | null;

  /**
   * Emits the views opened in this part.
   *
   * Upon subscription, emits the current views, and then each time the views change. The observable never completes.
   */
  public abstract readonly viewIds$: Observable<string[]>;

  /**
   * The currently opened views in this part.
   */
  public abstract readonly viewIds: string[];

  /**
   * Emits the actions of this part.
   *
   * Upon subscription, emits the current actions, and then each time the actions change. The observable never completes.
   */
  public abstract readonly actions$: Observable<WorkbenchPartAction[]>;

  /**
   * Registers an action with this part.
   *
   * Part actions are displayed next to the opened view tabs.
   *
   * @return handle to unregister the action.
   */
  public abstract registerPartAction(action: WorkbenchPartAction): Disposable;
}
