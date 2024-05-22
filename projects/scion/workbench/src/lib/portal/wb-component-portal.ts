/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ComponentType} from '@angular/cdk/portal';
import {ComponentRef, createComponent, EnvironmentInjector, inject, Injector, Provider, ViewContainerRef} from '@angular/core';
import {Logger, LoggerNames} from '../logging';
import {BehaviorSubject, Observable} from 'rxjs';

/**
 * Like the Angular CDK 'ComponentPortal' but does not destroy the component on detach.
 *
 * IMPORTANT: In order for the component to have the "correct" injection context, construct it the time attaching it to the Angular component tree,
 * or by calling {@link createComponentFromInjectionContext}. The "correct" injection context is crucial, for example, if the portal is displayed
 * in a router outlet, so that child outlets can register with their logical parent outlet. The Angular router uses the logical outlet hierarchy to
 * resolve and activate child routes.
 *
 * @see WbComponentPortal
 */
export class WbComponentPortal<T = any> {

  private _viewContainerRef: ViewContainerRef | null | undefined;
  private _componentRef: ComponentRef<T> | null | undefined;
  private _logger = inject(Logger);
  private _attached$ = new BehaviorSubject<boolean>(false);
  private _elementInjector: Injector | undefined;

  constructor(private _componentType: ComponentType<T>, private _options?: PortalOptions) {
    // Do not construct the component here but the time attaching it to the Angular component tree. See the comment above.
  }

  public get elementInjector(): Injector | undefined {
    return this._elementInjector;
  }

  /**
   * Constructs the portal's component using given injection context.
   */
  private createComponent(elementInjector: Injector): ComponentRef<T> {
    this._elementInjector = Injector.create({
      name: 'WbComponentPortalInjector',
      parent: elementInjector,
      providers: this._options?.providers || [],
    });
    const componentRef = createComponent(this._componentType, {
      elementInjector: this._elementInjector,
      environmentInjector: elementInjector.get(EnvironmentInjector),
    });
    componentRef.onDestroy(() => this.onDestroy());
    return componentRef;
  }

  /**
   * Constructs the portal's component using the given injection context.
   */
  public createComponentFromInjectionContext(injectionContext: Injector): void {
    if (this.isConstructed) {
      throw Error(`[PortalConstructError] Component already constructed. [component=${this._componentType}]`);
    }
    this._componentRef = this.createComponent(injectionContext);
    // Trigger change detection to complete the initialization of the component, important for components detached from the Angular component tree.
    this._componentRef.changeDetectorRef.detectChanges();
  }

  /**
   * Attaches this portal to the given {@link ViewContainerRef} according to the following rules:
   *
   * - If the component is not yet constructed, constructs it based on the given view container's injection context.
   * - If already attached to the given view container, does nothing.
   * - If already attached to a different view container, detaches it first.
   */
  public attach(viewContainerRef: ViewContainerRef): void {
    if (this.isAttachedTo(viewContainerRef)) {
      return;
    }
    if (this.isAttached) {
      this.detach();
    }

    this._viewContainerRef = viewContainerRef;
    this._componentRef = this._componentRef || this.createComponent(this._viewContainerRef.injector);
    this._componentRef.changeDetectorRef.reattach();
    this._viewContainerRef.insert(this._componentRef.hostView);
    this._attached$.next(true);
    this._logger.debug(() => 'Attaching portal', LoggerNames.LIFECYCLE, this._componentRef);
  }

  /**
   * Detaches this portal from its view container without destroying it. Does nothing if not attached.
   *
   * The portal is removed from the DOM and its change detector detached from the Angular change detector tree,
   * so it will not be checked for changes until it is reattached.
   */
  public detach(): void {
    if (!this.isAttached) {
      return;
    }

    this._logger.debug(() => 'Detaching portal', LoggerNames.LIFECYCLE, this._componentRef);
    const index = this._viewContainerRef!.indexOf(this._componentRef!.hostView);
    this._viewContainerRef!.detach(index);
    this._componentRef!.changeDetectorRef.detach();
    this._attached$.next(false);
  }

  public get isConstructed(): boolean {
    return !!this._componentRef;
  }

  private get isAttached(): boolean {
    return this._attached$.value;
  }

  public isAttachedTo(viewContainerRef: ViewContainerRef): boolean {
    return this._viewContainerRef === viewContainerRef && this.isAttached;
  }

  public get isDestroyed(): boolean {
    return this._componentRef === null;
  }

  public get componentRef(): ComponentRef<T> {
    if (this._componentRef === null) {
      throw Error('[NullPortalError] Portal destroyed.');
    }
    if (this._componentRef === undefined) {
      throw Error('[NullPortalError] Component not constructed yet.');
    }
    return this._componentRef;
  }

  public get attached$(): Observable<boolean> {
    return this._attached$;
  }

  private onDestroy(): void {
    this._componentRef = null;
    this._viewContainerRef = null;
    this._attached$.next(false);
    this._attached$.complete();
  }

  /**
   * Destroys the component instance and all the data structures associated with it.
   */
  public destroy(): void {
    this._componentRef?.destroy();
  }
}

/**
 * Controls instantiation of the component.
 */
export interface PortalOptions {
  /**
   * Providers registered with the injector for the instantiation of the component.
   */
  providers?: Provider[];
}
