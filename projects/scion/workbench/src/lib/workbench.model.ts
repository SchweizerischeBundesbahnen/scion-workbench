/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { WbComponentPortal } from './portal/wb-component-portal';
import { ViewPartComponent } from './view-part/view-part.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { ViewComponent } from './view/view.component';
import { WorkbenchService } from './workbench.service';
import { Arrays } from './array.util';
import { Injector, TemplateRef, Type } from '@angular/core';
import { Disposable } from './disposable';
import { ComponentType } from '@angular/cdk/portal';
import { ViewActivationInstantProvider } from './view-activation-instant-provider.service';

/**
 * A view is a visual component within the Workbench to present content,
 * and which can be arranged in a view grid.
 */
export abstract class WorkbenchView {

  /**
   * View outlet identity which is unique in this application.
   */
  public readonly viewRef: string;

  /**
   * The viewpart which contains this view.
   *
   * Note: the viewpart of a view can change, e.g. when the view is moved to another viewpart.
   */
  public readonly viewPart: WorkbenchViewPart;

  /**
   * Specifies the title to be displayed in the view tab.
   */
  public title: string;

  /**
   * Specifies the sub title to be displayed in the view tab.
   */
  public heading: string;

  /**
   * Specifies CSS class(es) added to the <wb-view-tab> and <wb-view> elements, e.g. used for e2e testing.
   */
  public abstract set cssClass(cssClass: string | string[]);

  /**
   * Returns CSS classes specified, if any.
   */
  public abstract get cssClasses(): string[];

  /**
   * Specifies if the content of the current view is dirty.
   * If dirty, a dirty marker is displayed in the view tab.
   */
  public dirty: boolean;

  /**
   * Specifies if the view is blocked, e.g., not interactable because of showing a view-modal message box.
   */
  public blocked: boolean;

  /**
   * Specifies if a close button should be displayed in the view tab.
   */
  public closable: boolean;

  /**
   * Indicates whether this view is the active viewpart view.
   */
  public abstract get active(): boolean;

  /**
   * Indicates whether this view is the active viewpart view.
   * Emits the current state upon subscription.
   */
  public abstract get active$(): Observable<boolean>;

  /**
   * Indicates whether this view is destroyed.
   */
  public abstract get destroyed(): boolean;

  /**
   * Destroys this workbench view and its associated routed component.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public abstract close(): Promise<boolean>;
}

export class InternalWorkbenchView implements WorkbenchView {

  public title: string;
  public heading: string;
  public dirty: boolean;
  public closable: boolean;
  public blocked: boolean;

  public scrollTop: number | null;
  public scrollLeft: number | null;
  public activationInstant: number;

  public readonly active$: BehaviorSubject<boolean>;
  public readonly cssClasses$: BehaviorSubject<string[]>;

  public viewPart: WorkbenchViewPart;

  constructor(public readonly viewRef: string,
              active: boolean,
              public workbench: WorkbenchService,
              public readonly portal: WbComponentPortal<ViewComponent>,
              private _viewActivationInstantProvider: ViewActivationInstantProvider) {
    this.active$ = new BehaviorSubject<boolean>(active);
    this.cssClasses$ = new BehaviorSubject<string[]>([]);
    this.title = viewRef;
    this.closable = true;
  }

  public set cssClass(cssClass: string | string[]) {
    this.cssClasses$.next(Arrays.from(cssClass));
  }

  public get cssClasses(): string[] {
    return this.cssClasses$.value;
  }

  public get active(): boolean {
    return this.active$.getValue();
  }

  public activate(activate: boolean): void {
    if (activate) {
      // DO NOT resolve the viewpart at construction time because it can change, e.g. when this view is moved to another viewpart.
      // Also:
      // - use the element injector of the portal (and not the root injector) to resolve the containing viewpart
      // - store the viewpart reference in a member variable because when the view is deactivated, it is removed
      //   from the Angular component tree and has, therefore, no element injector
      this.viewPart = this.portal.injector.get(WorkbenchViewPart as Type<WorkbenchViewPart>);
      this.activationInstant = this._viewActivationInstantProvider.instant;
    }
    this.active$.next(activate);
  }

  public close(): Promise<boolean> {
    return this.workbench.destroyView(this.viewRef);
  }

  public get destroyed(): boolean {
    return this.portal.isDestroyed;
  }
}

/**
 * A viewpart is a container for multiple views.
 */
export abstract class WorkbenchViewPart {

  /**
   * Viewpart outlet identity which is unique in this application.
   */
  public abstract readonly viewPartRef: string;

  /**
   * Emits the currently active view in this viewpart.
   */
  public abstract get activeViewRef$(): Observable<string | null>;

  /**
   * The currently active view, if any.
   */
  public abstract get activeViewRef(): string | null;

  /**
   * Emits the views opened in this viewpart.
   *
   * Upon subscription, the currently opened views are emitted, and then emits continuously
   * when new views are opened or existing views closed. It never completes.
   */
  public abstract get viewRefs$(): Observable<string[]>;

  /**
   * Emits the actions added to this viewpart.
   *
   * Upon subscription, the currently added actions are emitted, and then emits continuously
   * when new actions are added or removed. It never completes.
   */
  public abstract get actions$(): Observable<WorkbenchViewPartAction[]>;

  /**
   * Adds given viewpart action to this viewpart.
   *
   * Viewpart actions are displayed next to the opened view tabs.
   */
  public abstract registerViewPartAction(action: WorkbenchViewPartAction): Disposable;
}

export class InternalWorkbenchViewPart implements WorkbenchViewPart {

  public readonly viewRefs$ = new BehaviorSubject<string[]>([]);
  public readonly actions$ = new BehaviorSubject<WorkbenchViewPartAction[]>([]);
  public readonly activeViewRef$ = new BehaviorSubject<string | null>(null);

  public set viewRefs(viewRefs: string[]) {
    if (!Arrays.equal(viewRefs, this.viewRefs, true)) {
      this.viewRefs$.next(viewRefs);
    }
  }

  public get viewRefs(): string[] {
    return this.viewRefs$.value;
  }

  public set activeViewRef(viewRef: string) {
    if (viewRef !== this.activeViewRef) {
      this.activeViewRef$.next(viewRef);
    }
  }

  public get activeViewRef(): string {
    return this.activeViewRef$.value;
  }

  constructor(public readonly viewPartRef: string,
              public readonly portal: WbComponentPortal<ViewPartComponent>) {
  }

  public registerViewPartAction(action: WorkbenchViewPartAction): Disposable {
    this.actions$.next([...this.actions$.value, action]);
    return {
      dispose: (): void => this.actions$.next(this.actions$.value.filter(it => it !== action)),
    };
  }
}

/**
 * Lifecycle hook that is called when a view component is to be destroyed, and which is called before 'ngOnDestroy'.
 *
 * The return value controls whether destruction should be continued.
 */
export interface WbBeforeDestroy {

  /**
   * Lifecycle hook which is called upon view destruction.
   *
   * Return a falsy value to prevent view destruction, either as a boolean value or as an observable which emits a boolean value.
   */
  wbBeforeDestroy(): Observable<boolean> | Promise<boolean> | boolean;
}

/**
 * Action to be added to an action bar.
 */
export interface WorkbenchAction {
  /**
   * Specifies either a template or a component to render this action.
   */
  templateOrComponent: TemplateRef<void> | { component: ComponentType<any>; injector: Injector };

  /**
   * Specifies where to place this action.
   */
  align?: 'start' | 'end';
}

/**
 * Represents a viewpart action added to the viewpart action bar.
 */

/**
 * Represents a viewpart action added to the viewpart action bar. Viewpart actions are displayed next to the view tabs.
 */
export interface WorkbenchViewPartAction extends WorkbenchAction {
  /**
   * Sticks this action to given view.
   *
   * If set, the action is only visible if the specified view is the active view in the viewpart.
   */
  viewRef?: string;
}
