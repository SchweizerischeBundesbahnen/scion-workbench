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
import {assertNotInReactiveContext, ComponentRef, createComponent, EnvironmentInjector, inject, Injector, Provider, Signal, signal, ViewContainerRef} from '@angular/core';
import {Logger, LoggerNames} from '../logging';

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
  private _attached = signal(false);

  constructor(private _componentType: ComponentType<T>, private _options?: PortalOptions) {
    // Do not construct the component here but the time attaching it to the Angular component tree. See the comment above.
  }

  /**
   * Constructs the portal's component using given injection context.
   */
  private createComponent(elementInjector: Injector): ComponentRef<T> {
    const componentRef = createComponent(this._componentType, {
      elementInjector: Injector.create({
        name: 'WbComponentPortalInjector',
        parent: elementInjector,
        providers: this._options?.providers ?? [],
      }),
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
    // Trigger change detection to complete the initialization of the component, necessary for components detached from the Angular component tree.
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
    assertNotInReactiveContext(this.attach);
    if (this.isAttachedTo(viewContainerRef)) {
      return;
    }
    if (this.attached()) {
      this.detach();
    }

    this._viewContainerRef = viewContainerRef;
    this._componentRef = this._componentRef ?? this.createComponent(this._viewContainerRef.injector);
    this._logger.debug(() => 'Attaching portal', LoggerNames.LIFECYCLE, this._componentRef);

    this._componentRef.changeDetectorRef.reattach();
    this._viewContainerRef.insert(this._componentRef.hostView);
    this._attached.set(true);
    (this._componentRef.instance as Partial<OnAttach>).onAttach?.();
  }

  /**
   * Detaches this portal from its view container without destroying it. Does nothing if not attached.
   *
   * The portal is removed from the DOM and its change detector detached from the Angular change detector tree,
   * so it will not be checked for changes until it is reattached.
   */
  public detach(): void {
    assertNotInReactiveContext(this.detach);
    if (!this.attached()) {
      return;
    }

    this._logger.debug(() => 'Detaching portal', LoggerNames.LIFECYCLE, this._componentRef);
    (this._componentRef!.instance as Partial<OnDetach>).onDetach?.();
    const index = this._viewContainerRef!.indexOf(this._componentRef!.hostView);
    this._viewContainerRef!.detach(index);
    this._componentRef!.changeDetectorRef.detach();
    this._attached.set(false);
  }

  public get isConstructed(): boolean {
    return !!this._componentRef;
  }

  public isAttachedTo(viewContainerRef: ViewContainerRef): boolean {
    return this._viewContainerRef === viewContainerRef && this.attached();
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

  public get attached(): Signal<boolean> {
    return this._attached;
  }

  private onDestroy(): void {
    this._componentRef = null;
    this._viewContainerRef = null;
    this._attached.set(false);
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

/**
 * Lifecycle hook for component rendered by {@link WbComponentPortal} when attaching to the DOM.
 */
export interface OnAttach {

  /**
   * Method invoked after attached this component to the DOM.
   */
  onAttach(): void;
}

/**
 * Lifecycle hook for component rendered by {@link WbComponentPortal} when detaching from the DOM.
 */
export interface OnDetach {

  /**
   * Method invoked before detaching this component from the DOM.
   */
  onDetach(): void;
}
