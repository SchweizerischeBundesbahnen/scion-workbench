/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ComponentType} from '@angular/cdk/portal';
import {ComponentRef, createComponent, EnvironmentInjector, inject, Injector, StaticProvider, ViewContainerRef} from '@angular/core';
import {Logger, LoggerNames} from '../logging';

/**
 * Like Angular CDK 'ComponentPortal' but with functionality to detach the portal from its outlet without destroying the component.
 *
 * IMPORTANT: In order for the component to have the "correct" injection context, we construct it the time attaching it to the Angular component tree,
 * or by calling {@link createComponentFromInjectionContext} with the passed context. The "correct" injection context is crucial, for example, when the
 * portal is displayed in a router outlet, so that child outlets can register with their logical parent outlet. The Angular router uses the logical outlet
 * hierarchy to resolve and activate child routes.
 */
export class WbComponentPortal<T> {

  private _viewContainerRef: ViewContainerRef | null | undefined;
  private _componentRef: ComponentRef<T> | null | undefined;

  constructor(private componentType: ComponentType<T>,
              private _options?: PortalOptions,
              private _logger: Logger = inject(Logger)) {
    // Do not construct the component here but the time attaching it to the Angular component tree. See the comment above.
  }

  /**
   * Constructs the portal's component using given injection context.
   */
  private createComponent(elementInjector: Injector): ComponentRef<T> {
    const componentRef = createComponent(this.componentType, {
      elementInjector: Injector.create({
        name: 'WbComponentPortalInjector',
        parent: elementInjector,
        providers: this._options?.providers || [],
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
      throw Error('[PortalError] Component already constructed.');
    }
    this._componentRef = this.createComponent(injectionContext);
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
  }

  public get isConstructed(): boolean {
    return !!this._componentRef;
  }

  private get isAttached(): boolean {
    return this._componentRef && this._viewContainerRef && this._viewContainerRef.indexOf(this._componentRef.hostView) > -1 || false;
  }

  public isAttachedTo(viewContainerRef: ViewContainerRef): boolean {
    return this._viewContainerRef === viewContainerRef && this.isAttached;
  }

  public get isDestroyed(): boolean {
    return this._componentRef === null;
  }

  public get componentRef(): ComponentRef<T> {
    if (this._componentRef === null) {
      throw Error('[NullPortalComponentError] Portal destroyed.');
    }
    if (this._componentRef === undefined) {
      throw Error('[NullPortalComponentError] Component not constructed yet.');
    }
    return this._componentRef;
  }

  private onDestroy(): void {
    this._componentRef = null;
    this._viewContainerRef = null;
  }

  /**
   * Destroys the component instance and all of the data structures associated with it.
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
  providers?: StaticProvider[];
}

