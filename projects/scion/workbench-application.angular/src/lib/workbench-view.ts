/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Observable, ReplaySubject, Subject } from 'rxjs';
import { Platform, ViewProperties, ViewService } from '@scion/workbench-application.core';
import { Injectable, InjectionToken, Injector, NgZone, OnDestroy, Provider, Type } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

/**
 * DI injection token to provide the view component instance.
 *
 * @internal public because of AOT build
 */
export const VIEW_COMPONENT_INSTANCE = new InjectionToken<any>('VIEW_COMPONENT_INSTANCE');

/**
 * Provides a reference to the view component instance.
 *
 * @internal public because of AOT build
 */
@Injectable()
export class ViewComponentRef {

  public readonly instance: Promise<any>;

  constructor(componentInjector: Injector) {
    this.instance = new Promise(resolve => { // tslint:disable-line:typedef
      // resolve instance after component injector is fully constructed
      setTimeout(() => resolve(componentInjector.get(VIEW_COMPONENT_INSTANCE)));
    });
  }
}

/**
 * Invoke from the component's providers metadata to inject {WorkbenchView} and to use {WbBeforeDestroy} lifecycle hook.
 * As its argument, provide the symbol of the component class.
 *
 * ---
 * Example usage:
 *
 * @Component({
 *   ...
 *   providers: [
 *     provideWorkbenchView(YourComponent)
 *   ]
 * })
 * export class YourComponent implements WbBeforeDestroy {
 *
 *   constructor(public view: WorkbenchView) {
 *   }
 *
 *   public wbBeforeDestroy(): Observable<boolean> | Promise<boolean> | boolean {
 *     ...
 *   }
 * }
 */
export function provideWorkbenchView(component: Type<any>): Provider[] {
  return [
    {provide: VIEW_COMPONENT_INSTANCE, useExisting: component},
    {provide: WorkbenchView, useClass: InternalWorkbenchView},
    {provide: ViewComponentRef, useClass: ViewComponentRef},
  ];
}

/**
 * A view is a visual component within the Workbench to present content,
 * and which can be arranged in a view grid.
 */
export abstract class WorkbenchView {

  /**
   * Specifies the title to be displayed in the view tab.
   */
  public title: string;

  /**
   * Specifies the sub title to be displayed in the view tab.
   */
  public heading: string;

  /**
   * Specifies if the content of the current view is dirty.
   * If dirty, a dirty marker is displayed in the view tab.
   */
  public dirty: boolean;

  /**
   * Specifies if a close button should be displayed in the view tab.
   */
  public closable: boolean;

  /**
   * Indicates whether this view is the active viewpart view.
   * Emits the current state upon subscription.
   */
  public abstract get active$(): Observable<boolean>;

  /**
   * Closes this workbench view.
   */
  public abstract close(): void;
}

@Injectable()
export class InternalWorkbenchView implements WorkbenchView, OnDestroy {

  private _properties: ViewProperties = {};
  private _whenPropertiesLoaded: Promise<void>;
  private _active$ = new ReplaySubject<boolean>(1);
  private _destroy$ = new Subject<void>();

  constructor(private _componentRef: ViewComponentRef, private _zone: NgZone) {
    this.loadViewProperties();
    this.installViewActiveListener();
    this.installBeforeDestroyLifecycleHook();
  }

  public set title(title: string) {
    this.setProperty(properties => properties.title = title);
  }

  public get title(): string {
    return this._properties.title;
  }

  public set heading(heading: string) {
    this.setProperty(properties => properties.heading = heading);
  }

  public get heading(): string {
    return this._properties.heading;
  }

  public set dirty(dirty: boolean) {
    this.setProperty(properties => properties.dirty = dirty);
  }

  public get dirty(): boolean {
    return this._properties.dirty;
  }

  public set closable(closable: boolean) {
    this.setProperty(properties => properties.closable = closable);
  }

  public get closable(): boolean {
    return this._properties.closable;
  }

  public get active$(): Observable<boolean> {
    return this._active$.asObservable();
  }

  public close(): void {
    Platform.getService(ViewService).close();
  }

  private loadViewProperties(): void {
    this._whenPropertiesLoaded = Platform.getService(ViewService).getProperties().then(properties => {
      this._zone.run(() => this._properties = properties);
    });
  }

  private installViewActiveListener(): void {
    Platform.getService(ViewService).active$
      .pipe(takeUntil(this._destroy$))
      .subscribe(active => this._zone.run(() => this._active$.next(active)));
  }

  private installBeforeDestroyLifecycleHook(): void {
    this._componentRef.instance.then(instance => {
      instance.wbBeforeDestroy && Platform.getService(ViewService).setDestroyNotifier((): Observable<boolean> | Promise<boolean> | boolean => {
        return this._zone.run(() => instance.wbBeforeDestroy());
      });
    });
  }

  private uninstallBeforeDestroyLifecycleHook(): void {
    this._componentRef.instance.then(instance => instance.wbBeforeDestroy && Platform.getService(ViewService).setDestroyNotifier(null));
  }

  private setProperty(setterFn: (properties: ViewProperties) => void): void {
    this._whenPropertiesLoaded.then(() => {
      setterFn(this._properties);
      Platform.getService(ViewService).setProperties(this._properties);
    });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this.uninstallBeforeDestroyLifecycleHook();
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
   * Return a falsy value to prevent view destruction, either as a boolean value or as an observable which emits a boolean value.
   */
  wbBeforeDestroy(): Observable<boolean> | Promise<boolean> | boolean;
}
