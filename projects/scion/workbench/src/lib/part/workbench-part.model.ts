import {Observable} from 'rxjs';
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
   * Emits actions associated with this part.
   *
   * Upon subscription, the currently associated actions are emitted, and then emits continuously
   * when new actions are registered or unregistered. It never completes.
   */
  public abstract readonly actions$: Observable<readonly WorkbenchPartAction[]>;
}
