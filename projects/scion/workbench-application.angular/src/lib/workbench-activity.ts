/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Observable, ReplaySubject, Subject } from 'rxjs';
import { ActivityAction, ActivityProperties, ActivityService, Disposable, Platform } from '@scion/workbench-application.core';
import { Injectable, InjectionToken, Injector, NgZone, OnDestroy, Provider, Type } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

/**
 * DI injection token to provide the activity component instance.
 *
 * @internal public because of AOT build
 */
export const ACTIVITY_COMPONENT_INSTANCE = new InjectionToken<any>('ACTIVITY_COMPONENT_INSTANCE');

/**
 * Provides a reference to the activity component instance.
 *
 * @internal public because of AOT build
 */
@Injectable()
export class ActivityComponentRef {

  public readonly instance: Promise<any>;

  constructor(componentInjector: Injector) {
    this.instance = new Promise(resolve => { // tslint:disable-line:typedef
      // resolve instance after component injector is fully constructed
      setTimeout(() => resolve(componentInjector.get(ACTIVITY_COMPONENT_INSTANCE)));
    });
  }
}

/**
 * Invoke from the component's providers metadata to inject {WorkbenchActivity}.
 * As its argument, provide the symbol of the component class.
 *
 * ---
 * Example usage:
 *
 * @Component({
 *   ...
 *   providers: [
 *     provideWorkbenchActivity(YourComponent)
 *   ]
 * })
 * export class YourComponent {
 *
 *   constructor(public activity: WorkbenchActivity) {
 *   }
 * }
 */
export function provideWorkbenchActivity(component: Type<any>): Provider[] {
  return [
    {provide: ACTIVITY_COMPONENT_INSTANCE, useExisting: component},
    {provide: WorkbenchActivity, useClass: InternalWorkbenchActivity},
    {provide: ActivityComponentRef, useClass: ActivityComponentRef},
  ];
}

/**
 * Represents an activity in the activity panel.
 */
export abstract class WorkbenchActivity {

  /**
   * Specifies the title of the activity.
   */
  public title: string;

  /**
   * Specifies CSS class(es) added to the activity item and activity panel, e.g. used for e2e testing.
   */
  public cssClass: string | string[];

  /**
   * Specifies the text for the activity item.
   *
   * You can use it in combination with `itemCssClass`, e.g. to render an icon glyph by using its textual name.
   */
  public itemText: string;

  /**
   * Specifies CSS class(es) added to the activity item, e.g. used for e2e testing or to set an icon font class.
   */
  public itemCssClass: string | string[];

  /**
   * Specifies the number of pixels added to the activity panel width if this is the active activity.
   */
  public panelWidthDelta: number;

  /**
   * Emits upon activation change of this activity.
   */
  public abstract get active$(): Observable<boolean>;

  /**
   * Associates an action with this activity. The action is displayed in the upper right corner of the activity panel header.
   *
   * Returns {Disposable} to remove the action.
   */
  public abstract addAction(action: ActivityAction): Disposable;
}

@Injectable()
export class InternalWorkbenchActivity implements WorkbenchActivity, OnDestroy {

  private _properties: ActivityProperties = {};
  private _whenPropertiesLoaded: Promise<void>;
  private _active$ = new ReplaySubject<boolean>(1);
  private _destroy$ = new Subject<void>();

  constructor(private _zone: NgZone) {
    this.loadViewProperties();
    this.installActivityActiveListener();
  }

  public set title(title: string) {
    this.setProperty(properties => properties.title = title);
  }

  public get title(): string {
    return this._properties.title;
  }

  public set cssClass(cssClass: string | string[]) {
    this.setProperty(properties => properties.cssClass = cssClass);
  }

  public get cssClass(): string | string[] {
    return this._properties.cssClass;
  }

  public set itemText(itemText: string) {
    this.setProperty(properties => properties.itemText = itemText);
  }

  public get itemText(): string {
    return this._properties.itemText;
  }

  public set itemCssClass(itemCssClass: string | string[]) {
    this.setProperty(properties => properties.itemCssClass = itemCssClass);
  }

  public get itemCssClass(): string | string[] {
    return this._properties.itemCssClass;
  }

  public set panelWidthDelta(panelWidthDelta: number) {
    this.setProperty(properties => properties.panelWidthDelta = panelWidthDelta);
  }

  public get panelWidthDelta(): number {
    return this._properties.panelWidthDelta;
  }

  public get active$(): Observable<boolean> {
    return this._active$.asObservable();
  }

  private loadViewProperties(): void {
    this._whenPropertiesLoaded = Platform.getService(ActivityService).getProperties().then(properties => {
      this._zone.run(() => this._properties = properties);
    });
  }

  private installActivityActiveListener(): void {
    Platform.getService(ActivityService).active$
      .pipe(takeUntil(this._destroy$))
      .subscribe(active => this._zone.run(() => this._active$.next(active)));
  }

  private setProperty(setterFn: (properties: ActivityProperties) => void): void {
    this._whenPropertiesLoaded.then(() => {
      setterFn(this._properties);
      Platform.getService(ActivityService).setProperties(this._properties);
    });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }

  public addAction(action: ActivityAction): Disposable {
    return Platform.getService(ActivityService).addAction(action);
  }
}
