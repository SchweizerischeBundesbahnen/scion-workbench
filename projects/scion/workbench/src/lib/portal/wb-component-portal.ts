import { ComponentType } from '@angular/cdk/portal';
import { ComponentFactory, ComponentFactoryResolver, ComponentRef, Injector, ViewContainerRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/**
 * Like 'ComponentPortal' but with functionality to detach the portal from its outlet without destroying the component.
 */
export class WbComponentPortal<T> {

  private _config: PortalConfig;
  private _componentFactory: ComponentFactory<T>;
  private _outletRequestViewContainerRef$ = new Subject<void>();

  private _viewContainerRef: ViewContainerRef | null;
  private _componentRef: ComponentRef<T> | null;

  constructor(componentFactoryResolver: ComponentFactoryResolver, componentType: ComponentType<T>) {
    this._componentFactory = componentFactoryResolver.resolveComponentFactory(componentType);
  }

  public init(config: PortalConfig): void {
    this._componentRef = this._componentFactory.create(config.injector);
    this._componentRef.onDestroy(this.onDestroy.bind(this));
    this._config = config;
  }

  /**
   * Detaches this portal from its outlet, but does not destroy the portal's component.
   *
   * The portal is removed from the DOM and its change detector detached from the change detector tree,
   * so it will not be checked until it is reattached.
   */
  public detach(): void {
    this.setViewContainerRef(null);
  }

  /**
   * Attaches this portal to its outlet.
   *
   * @see detachFromDom
   */
  public attach(): void {
    this._outletRequestViewContainerRef$.next();
  }

  public setViewContainerRef(viewContainerRef: ViewContainerRef | null): void {
    if (viewContainerRef === this._viewContainerRef) {
      return;
    }
    if (!viewContainerRef && this.isDestroyed) {
      return;
    }

    if (this.isDestroyed) {
      throw Error('Invalid state: component is destroyed');
    }

    this.detachFromComponentTree();
    this._viewContainerRef = viewContainerRef;
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
    this._viewContainerRef.insert(this._componentRef.hostView, 0);
    this._componentRef.changeDetectorRef.reattach();

    // Invoke 'activate' lifecycle hook
    this._config.onActivate && this._config.onActivate();
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

    // Invoke 'deactivate' lifecycle hook
    this._config.onDeactivate && this._config.onDeactivate();

    // Detach this portlet
    const index = this._viewContainerRef.indexOf(this._componentRef.hostView);
    this._viewContainerRef.detach(index);
    this._componentRef.changeDetectorRef.detach();
  }

  /**
   * Destroys the component instance and all of the data structures associated with it.
   */
  public destroy(): void {
    this._componentRef.destroy();
  }

  public get componentRef(): ComponentRef<T> {
    return this._componentRef;
  }

  public get viewContainerRef(): ViewContainerRef {
    return this._viewContainerRef;
  }

  public get isAttached(): boolean {
    return this._viewContainerRef && this._viewContainerRef.indexOf(this._componentRef.hostView) > -1 || false;
  }

  public get isDestroyed(): boolean {
    return !this._componentRef;
  }

  public get hasOutlet(): boolean {
    return !!this._viewContainerRef;
  }

  /**
   * Internal API for the outlet to provide this portal with the actual {ViewContainerRef}.
   */
  public get outletRequestViewContainerRef$(): Observable<void> {
    return this._outletRequestViewContainerRef$.asObservable();
  }

  private onDestroy(): void {
    this._componentRef = null;
    this._viewContainerRef = null;
  }
}

export interface PortalConfig {
  injector: Injector;
  onActivate?: () => void;
  onDeactivate?: () => void;
}
