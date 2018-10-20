import { Injector, TemplateRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ComponentType, PortalInjector } from '@angular/cdk/portal';
import { Disposable } from '../disposable';
import { InternalWorkbenchRouter } from '../routing/workbench-router.service';

/**
 * Represents an activity in the activity panel.
 *
 * Register this activity in {WorkbenchActivityPartService} and its route as primary Angular route.
 */
export abstract class Activity {

  /**
   * Specifies the title of the activity.
   */
  public title: string;

  /**
   * Use in combination with an icon font to specify the icon.
   */
  public label: string;

  /**
   * Specifies the CSS class(es) used for the icon, e.g. 'material-icons' when using Angular Material Design.
   */
  public cssClass: string | string[];

  /**
   * Controls whether to open this activity in the activity panel or to open it in a separate view.
   */
  public target: 'activity-panel' | 'view';

  /**
   * Controls whether to show or hide this activity. By default, this activity is showing.
   */
  public visible: boolean;

  /**
   * Specifies where to insert this activity in the list of activities.
   */
  public position: number;

  /**
   * Specifies the number of pixels added to the activity panel width if this is the active activity.
   */
  public panelWidthDelta: number;

  /**
   * Specifies the routing commands used by Angular router to navigate when this activity is activated.
   * The route must be registered as primary Angular route.
   */
  public abstract set routerLink(routerLink: any[] | string);

  /**
   * Returns the routing commands of this activity.
   */
  public abstract get commands(): any[];

  /**
   * Returns the routing path of this activity.
   */
  public abstract get path(): string;

  /**
   * Emits upon activation change of this activity.
   */
  public abstract get active$(): Observable<boolean>;

  /**
   * Indicates if this activity is currently active.
   */
  public abstract get active(): boolean;

  /**
   * Returns the actions associated with this activity.
   */
  public abstract get actions(): ActivityAction[];

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
  private _path: string;
  private _active$ = new BehaviorSubject<boolean>(false);

  public panelWidthDelta = 0;
  public title: string;
  public label: string;
  public cssClass: string | string[];
  public target: 'activity-panel' | 'view' = 'activity-panel';
  public visible = true;
  public position: number;

  constructor(private _wbRouter: InternalWorkbenchRouter, private _injector: Injector) {
  }

  public set routerLink(routerLink: any[] | string) {
    this._commands = this._wbRouter.normalizeCommands(routerLink ? (Array.isArray(routerLink) ? routerLink : [routerLink]) : []);
    this._path = this.commands.filter(it => typeof it === 'string').join('/');
  }

  public get actions(): ActivityAction[] {
    return this._actions;
  }

  public get commands(): any[] {
    return this._commands;
  }

  public get path(): string {
    return this._path;
  }

  public get active$(): Observable<boolean> {
    return this._active$.asObservable();
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
      } else {
        const injectionTokens = new WeakMap();
        injectionTokens.set(Activity, this);
        const portalInjector = new PortalInjector(injector || this._injector, injectionTokens);
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
      }
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
