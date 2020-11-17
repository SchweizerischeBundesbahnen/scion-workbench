import { Observable } from 'rxjs';
import { Disposable } from '../disposable';
import { WorkbenchViewPartAction } from '../workbench.model';

/**
 * A viewpart is a container for multiple views.
 */
export abstract class WorkbenchViewPart {

  /**
   * Viewpart outlet identity which is unique in this application.
   */
  public abstract readonly partId: string;

  /**
   * Emits the currently active view in this viewpart.
   */
  public abstract get activeViewId$(): Observable<string | null>;

  /**
   * The currently active view, if any.
   */
  public abstract get activeViewId(): string | null;

  /**
   * Emits the views opened in this viewpart.
   *
   * Upon subscription, the currently opened views are emitted, and then emits continuously
   * when new views are opened or existing views closed. It never completes.
   */
  public abstract get viewIds$(): Observable<string[]>;

  public abstract get viewIds(): string[];

  /**
   * Emits the actions of this viewpart.
   *
   * Upon subscription, the actions are emitted, and then emits continuously
   * when new actions are added or removed. It never completes.
   */
  public abstract get actions$(): Observable<WorkbenchViewPartAction[]>;

  /**
   * Registers an action with this viewpart.
   *
   * Viewpart actions are displayed next to the opened view tabs.
   *
   * @return handle to unregister the action.
   */
  public abstract registerViewPartAction(action: WorkbenchViewPartAction): Disposable;
}
