import {Injector, TemplateRef} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {ComponentType} from '@angular/cdk/portal';
import {Disposable} from '../disposable';
import {WorkbenchRouter} from '../routing/workbench-router.service';

/**
 * Represents an activity in the activity panel.
 *
 * Register this activity in {WorkbenchActivityPartService} and its route as primary Angular route.
 *
 * @deprecated since version 14; API will be removed in version 16; no replacement
 */
export abstract class Activity {

  /**
   * Specifies the title of the activity.
   */
  public abstract title: string | null;

  /**
   * Specifies CSS class(es) to be added to the activity, useful in end-to-end tests for locating the activity.
   */
  public abstract cssClass: string | string[] | undefined;

  /**
   * Specifies the text for the activity item.
   *
   * You can use it in combination with `itemCssClass`, e.g. to render an icon glyph by using its textual name.
   */
  public abstract itemText: string | null;

  /**
   * Specifies CSS class(es) added to the activity item, e.g. used for e2e testing or to set an icon font class.
   */
  public abstract itemCssClass: string | string[] | undefined;
  /**
   * Controls whether to open this activity in the activity panel or to open it in a separate view.
   */
  public abstract target: 'activity-panel' | 'view';

  /**
   * Controls whether to show or hide this activity. By default, this activity is showing.
   */
  public abstract visible: boolean;

  /**
   * Specifies where to insert this activity in the list of activities.
   */
  public abstract position: number | undefined;

  /**
   * Specifies the number of pixels added to the activity panel width if this is the active activity.
   */
  public abstract panelWidthDelta: number;

  /**
   * Specifies the routing commands used by Angular router to navigate when this activity is activated.
   * The route must be registered as primary Angular route.
   */
  public abstract set routerLink(routerLink: any[] | string);

  /**
   * Returns the routing commands of this activity.
   */
  public abstract readonly commands: any[];

  /**
   * Returns the routing path of this activity.
   */
  public abstract readonly path: string | undefined;

  /**
   * Emits upon activation change of this activity.
   */
  public abstract readonly active$: Observable<boolean>;

  /**
   * Indicates if this activity is currently active.
   */
  public abstract readonly active: boolean;

  /**
   * Returns the actions associated with this activity.
   */
  public abstract readonly actions: ActivityAction[];

  /**
   * Associates an action with this activity. When this activity is active, it is displayed in the activity panel header.
   *
   * Either provide a template or component to render the action, and optionally an injector to provide data to the component.
   */
  public abstract registerAction(action: TemplateRef<void> | ComponentType<any>, injector?: Injector): Disposable;
}

export class InternalActivity implements Activity {

  private _commands: any[] = [];
  private _actions: ActivityAction[] = [];
  private _path: string | undefined;
  private _active$ = new BehaviorSubject<boolean>(false);

  public panelWidthDelta = 0;
  public title: string | null = null;
  public cssClass: string | string[] | undefined;

  public itemText: string | null = null;
  public itemCssClass: string | string[] | undefined;

  public target: 'activity-panel' | 'view' = 'activity-panel';
  public visible = true;
  public position: number | undefined;

  constructor(private _workbenchRouter: WorkbenchRouter, private _injector: Injector) {
  }

  public set routerLink(routerLink: any[] | string) {
    this._commands = this._workbenchRouter.normalizeCommands(routerLink ? (Array.isArray(routerLink) ? routerLink : [routerLink]) : []);
    this._path = this.commands.filter(it => typeof it === 'string').join('/');
  }

  public get actions(): ActivityAction[] {
    return this._actions;
  }

  public get commands(): any[] {
    return this._commands;
  }

  public get path(): string | undefined {
    return this._path;
  }

  public get active$(): Observable<boolean> {
    return this._active$;
  }

  public get active(): boolean {
    return this._active$.getValue();
  }

  public set active(active: boolean) {
    this._active$.next(active);
  }

  public registerAction(templateOrComponent: TemplateRef<void> | ComponentType<any>, injector?: Injector): Disposable {
    const action = ((): ActivityAction => {
      if (templateOrComponent instanceof TemplateRef) {
        return {template: templateOrComponent, injector: injector};
      }
      else {
        const portalInjector = Injector.create({
          parent: injector || this._injector,
          providers: [{provide: Activity, useValue: this}],
        });
        return {component: templateOrComponent, injector: portalInjector};
      }
    })();
    this._actions.push(action);

    return {
      dispose: (): void => {
        const index = this._actions.indexOf(action);
        if (index === -1) {
          throw Error('[IllegalStateError] Action not registered in activity');
        }
        this._actions.splice(index, 1);
      },
    };
  }
}

/**
 * Action to be added to an activity.
 *
 * Specify either a template or a component to render the action.
 */
export interface ActivityAction {
  template?: TemplateRef<void>;
  component?: ComponentType<any>;
  injector?: Injector;
}
