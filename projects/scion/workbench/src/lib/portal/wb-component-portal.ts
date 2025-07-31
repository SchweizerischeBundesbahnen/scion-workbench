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
import {assertNotInReactiveContext, ComponentRef, computed, createComponent, DestroyRef, EnvironmentInjector, inject, Injector, Provider, signal, ViewContainerRef} from '@angular/core';
import {Logger, LoggerNames} from '../logging';

/**
 * Like the Angular CDK 'ComponentPortal' but does not destroy the component on detach.
 *
 * The portal must be constructed within an injection context. Destroying the injection context will also destroy the portal.
 *
 * @see WorkbenchPortalOutletDirective
 */
export class WbComponentPortal<T = unknown> {

  private readonly _viewContainerRef = signal<ViewContainerRef | null>(null);
  private readonly _componentRef = signal<ComponentRef<T> | null | undefined>(undefined);
  private readonly _attached = signal(false);
  private readonly _logger = inject(Logger);

  /**
   * Gets the {@link ComponentRef} of the portal, or `undefined` if not constructed.
   */
  public readonly componentRef = this._componentRef.asReadonly();
  public readonly elementInjector = signal<Injector | undefined>(undefined);

  /**
   * Gets the {@link HTMLElement} of the portal, or `undefined` if not constructed.
   */
  public readonly element = computed(() => this.componentRef()?.location.nativeElement as HTMLElement | undefined);

  /**
   * Indicates if the portal has been constructed.
   */
  public readonly constructed = computed(() => !!this._componentRef());

  /**
   * Indicates if the portal is attached to the DOM.
   */
  public readonly attached = this._attached.asReadonly();

  /**
   * Indicates if the portal has been destroyed.
   */
  public readonly destroyed = computed(() => this._componentRef() === null);

  constructor(private _componentType: ComponentType<T>, private _options?: PortalOptions) {
    // IMPORTANT: In order for the component to have the "correct" injection context, construct it the time attaching it to the Angular component tree,
    // or by calling {@link construct}. The "correct" injection context is crucial, for example, if the portal is displayed in a router outlet, so that
    // child outlets can register with their logical parent outlet. The Angular router uses the logical outlet hierarchy to resolve and activate child routes.

    // Destroy portal and component when the injection context is destroyed.
    inject(DestroyRef).onDestroy(() => this.destroy());
  }

  /**
   * Constructs the portal's component using the given injection context.
   */
  public construct(injector: Injector): void {
    assertNotInReactiveContext(this.construct);

    if (this.constructed()) {
      throw Error(`[PortalError] Component already constructed. [component=${this._componentType}]`);
    }
    const portalComponent = createPortalComponent(this._componentType, {providers: this._options?.providers, injector});
    this._componentRef.set(portalComponent.ref);
    this.elementInjector.set(portalComponent.injector);

    // Trigger change detection to complete the initialization of the component, necessary for components detached from the Angular component tree.
    this._componentRef()!.changeDetectorRef.detectChanges();
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

    this._viewContainerRef.set(viewContainerRef);
    const portalComponent = createPortalComponent(this._componentType, {providers: this._options?.providers, injector: viewContainerRef.injector});
    this._componentRef.update(componentRef => componentRef ?? portalComponent.ref);
    this.elementInjector.set(portalComponent.injector);
    this._logger.debug(() => 'Attaching portal', LoggerNames.LIFECYCLE, this._componentRef()!);
    this._componentRef()!.changeDetectorRef.reattach();
    this._viewContainerRef()!.insert(this._componentRef()!.hostView);
    this._attached.set(true);
    (this._componentRef()!.instance as Partial<OnAttach>).onAttach?.();
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

    this._logger.debug(() => 'Detaching portal', LoggerNames.LIFECYCLE, this._componentRef()!);

    (this._componentRef()!.instance as Partial<OnDetach>).onDetach?.();
    this._viewContainerRef()!.detach(this._viewContainerRef()!.indexOf(this._componentRef()!.hostView));
    this._componentRef()!.changeDetectorRef.detach();
    this._attached.set(false);
  }

  /**
   * Tests if attached to the given {@link ViewContainerRef}.
   */
  public isAttachedTo(viewContainerRef: ViewContainerRef): boolean {
    return this._viewContainerRef() === viewContainerRef && this.attached();
  }

  /**
   * Destroys the portal's component.
   */
  public destroy(): void {
    assertNotInReactiveContext(this.destroy);

    this._logger.debug(() => 'Destroying portal', LoggerNames.LIFECYCLE, this._componentRef());
    this._componentRef()?.destroy();
    this._componentRef.set(null);
    this._viewContainerRef.set(null);
    this._attached.set(false);
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
 * Lifecycle hook for the component rendered by {@link WbComponentPortal} after attached to the DOM.
 */
export interface OnAttach {

  /**
   * Method invoked after attached this component to the DOM.
   */
  onAttach(): void;
}

/**
 * Lifecycle hook for the component rendered by {@link WbComponentPortal} before detached from the DOM.
 */
export interface OnDetach {

  /**
   * Method invoked before detaching this component from the DOM.
   */
  onDetach(): void;
}

/**
 * Creates the specified component based on given options.
 */
function createPortalComponent<T>(componentType: ComponentType<T>, options: {injector: Injector; providers?: Provider[]}): {ref: ComponentRef<T>; injector: Injector} {
  const elementInjector = Injector.create({
    name: 'WbComponentPortalInjector',
    parent: options.injector,
    providers: options.providers ?? [],
  });
  const componentRef = createComponent(componentType, {
    elementInjector: elementInjector,
    environmentInjector: options.injector.get(EnvironmentInjector),
  });
  return {ref: componentRef, injector: elementInjector};
}
