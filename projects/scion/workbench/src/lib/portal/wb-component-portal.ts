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
import {ComponentFactory, ComponentFactoryResolver, ComponentRef, InjectFlags, InjectionToken, Injector, Type, ViewContainerRef} from '@angular/core';

/**
 * Like Angular CDK 'ComponentPortal' but with functionality to detach the portal from its outlet without destroying the component.
 *
 * DI injection tokens are resolved by first checking the portal's custom tokens, and then resolution defaults to the element injector.
 */
export class WbComponentPortal<T> {

  private _config!: PortalConfig;
  private _componentFactory: ComponentFactory<T>;

  private _viewContainerRef: ViewContainerRef | null = null;
  private _reattachFn: (() => void) | null = null;
  private _componentRef: ComponentRef<T> | null = null;
  private _portalInjector!: WbPortalInjector;

  constructor(componentFactoryResolver: ComponentFactoryResolver, componentType: ComponentType<T>) {
    this._componentFactory = componentFactoryResolver.resolveComponentFactory(componentType);
  }

  public init(config: PortalConfig): void {
    this._portalInjector = new WbPortalInjector(config.injectorTokens, Injector.NULL);
    this._componentRef = this._componentFactory.create(this._portalInjector);
    this._componentRef.onDestroy(this.onDestroy.bind(this));
    this._config = config;
  }

  /**
   * Attaches this portal to the specified {ViewContainerRef}, if any, or to its previous outlet if detached.
   *
   * @see detach
   */
  public attach(viewContainerRef?: ViewContainerRef): void {
    if (viewContainerRef) {
      this.setViewContainerRef(viewContainerRef);
    }
    else if (this._reattachFn) {
      this._reattachFn();
    }

    this._reattachFn = null;
  }

  /**
   * Detaches this portal from its outlet without destroying it.
   *
   * The portal is removed from the DOM and its change detector detached from the change detector tree,
   * so it will not be checked until it is reattached.
   *
   * @see attach
   */
  public detach(): void {
    const viewContainerRef = this.viewContainerRef;
    this._reattachFn = (): void => this.setViewContainerRef(viewContainerRef);
    this.setViewContainerRef(null);
  }

  private setViewContainerRef(viewContainerRef: ViewContainerRef | null): void {
    if (viewContainerRef === this._viewContainerRef) {
      return;
    }
    if (!viewContainerRef && this.isDestroyed) {
      return;
    }

    if (this.isDestroyed) {
      throw Error('[IllegalStateError] component is destroyed');
    }

    this.detachFromComponentTree();
    this._viewContainerRef = viewContainerRef;
    this._portalInjector.elementInjector = this.viewContainerRef ? this.viewContainerRef.injector : Injector.NULL;
    this.attachToComponentTree();
  }

  /**
   * Attaches this portal to its outlet.
   *
   * @see detachFromComponentTree
   */
  private attachToComponentTree(): void {
    if (this.isAttached || this.isDestroyed || !this.hasOutlet) {
      return;
    }

    // Attach this portlet
    this._viewContainerRef!.insert(this._componentRef!.hostView, 0);
    this._componentRef!.changeDetectorRef.reattach();

    // Invoke 'onAttach' lifecycle hook
    this._config.onAttach && this._config.onAttach();
  }

  /**
   * Detaches this portal from its outlet, but does not destroy the portal's component.
   *
   * The portal is removed from the DOM and its change detector detached from the change detector tree,
   * so it will not be checked until it is reattached.
   *
   * @see attachToComponentTree
   */
  private detachFromComponentTree(): void {
    if (!this.isAttached) {
      return;
    }

    // Invoke 'onDetach' lifecycle hook
    this._config.onDetach && this._config.onDetach();

    // Detach this portlet
    const index = this._viewContainerRef!.indexOf(this._componentRef!.hostView);
    this._viewContainerRef!.detach(index);
    this._componentRef!.changeDetectorRef.detach();
  }

  /**
   * Destroys the component instance and all of the data structures associated with it.
   */
  public destroy(): void {
    this._componentRef?.destroy();
  }

  public get componentRef(): ComponentRef<T> {
    if (!this._componentRef) {
      throw Error('[PortalError] Illegal state: Portal already destroyed.');
    }
    return this._componentRef;
  }

  public get viewContainerRef(): ViewContainerRef | null {
    return this._viewContainerRef;
  }

  public get isAttached(): boolean {
    return this._componentRef && this._viewContainerRef && this._viewContainerRef.indexOf(this._componentRef.hostView) > -1 || false;
  }

  public get isDestroyed(): boolean {
    return !this._componentRef;
  }

  public get hasOutlet(): boolean {
    return !!this._viewContainerRef;
  }

  public get injector(): Injector {
    return this._portalInjector;
  }

  private onDestroy(): void {
    this.setViewContainerRef(null);
    this._componentRef = null;
  }
}

export interface PortalConfig {
  /**
   * Provides DI injection tokens available in the component attached to the portal.
   */
  injectorTokens: WeakMap<any, any>;
  /**
   * Lifecycle hook which is invoked when the portal is attached to the DOM.
   */
  onAttach?: () => void;
  /**
   * Lifecycle hook which is invoked when the portal is detached from the DOM.
   */
  onDetach?: () => void;
}

/**
 * Resolves a token by first checking its custom tokens, and then defaults to the element injector, if any.
 */
class WbPortalInjector implements Injector {

  constructor(private _customTokens: WeakMap<any, any>, public elementInjector: Injector) {
  }

  public get<T>(token: Type<T> | InjectionToken<T>, notFoundValue?: T, flags?: InjectFlags): T {
    const value = this._customTokens.get(token);
    if (value !== undefined) {
      return value;
    }

    /*
     * DO NOT USE the root injector or a module injector as the element parent injector due to Angular resolution rules,
     * as this would prevent overwriting or extending (multi-provider) tokens in lazily loaded modules.
     *
     * See following comment from the Angular source code [file=`provider.ts`, function=`resolveDep`]:
     *
     *           mod1
     *          /
     *        el1   mod2
     *          \  /
     *          el2
     *
     *  When requesting el2.injector.get(token), we should check in the following order and return the first found value:
     *  - el2.injector.get(token, default)
     *  - el1.injector.get(token, NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR) -> do not check the module
     *  - mod2.injector.get(token, default)
     */
    return this.elementInjector.get(token, notFoundValue, flags);
  }
}
