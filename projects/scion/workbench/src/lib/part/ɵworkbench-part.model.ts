/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {MPart} from '../layout/workbench-layout.model';
import {BehaviorSubject} from 'rxjs';
import {inject, Injector} from '@angular/core';
import {Arrays} from '@scion/toolkit/util';
import {Disposable} from '../common/disposable';
import {WorkbenchPartAction} from '../workbench.model';
import {WorkbenchPart} from './workbench-part.model';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {WorkbenchViewRegistry} from '../view/workbench-view.registry';
import {ComponentPortal, ComponentType} from '@angular/cdk/portal';
import {ActivationInstantProvider} from '../activation-instant.provider';

export class ɵWorkbenchPart implements WorkbenchPart {

  private _part!: MPart;
  private _activationInstant: number | undefined;

  private readonly _workbenchRouter = inject(WorkbenchRouter);
  private readonly _viewRegistry = inject(WorkbenchViewRegistry);
  private readonly _activationInstantProvider = inject(ActivationInstantProvider);
  private readonly _partComponent: ComponentType<PartComponent | MainAreaLayoutComponent>;

  public readonly active$ = new BehaviorSubject<boolean>(false);
  public readonly viewIds$ = new BehaviorSubject<string[]>([]);
  public readonly actions$ = new BehaviorSubject<WorkbenchPartAction[]>([]);
  public readonly activeViewId$ = new BehaviorSubject<string | null>(null);
  public readonly isInMainArea: boolean;

  constructor(public readonly id: string, options: {component: ComponentType<PartComponent | MainAreaLayoutComponent>; isInMainArea: boolean}) {
    this._partComponent = options.component;
    this.isInMainArea = options.isInMainArea;
  }

  /**
   * Constructs the portal using the given injection context.
   */
  public createPortalFromInjectionContext(injectionContext: Injector): ComponentPortal<PartComponent | MainAreaLayoutComponent> {
    const injector = Injector.create({
      parent: injectionContext,
      providers: [
        {provide: ɵWorkbenchPart, useValue: this},
        {provide: WorkbenchPart, useExisting: ɵWorkbenchPart},
      ],
    });
    return new ComponentPortal(this._partComponent, null, injector, null, null);
  }

  public setPart(part: MPart, active: boolean): void {
    const prevViewIds = this._part?.views.map(view => view.id);
    const currViewIds = part.views.map(view => view.id);
    this._part = part;

    // Update active part if changed
    if (this.active !== active) {
      this.active$.next(active);
    }

    // Update views if changed
    if (!Arrays.isEqual(prevViewIds, currViewIds, {exactOrder: true})) {
      this.viewIds$.next(currViewIds);
    }

    // Update active view if changed
    if (this.activeViewId !== part.activeViewId) {
      this.activeViewId$.next(part.activeViewId ?? null);
    }
    part.views.forEach(view => this._viewRegistry.get(view.id).activate(view.id === part.activeViewId));
  }

  public get viewIds(): string[] {
    return this.viewIds$.value;
  }

  public get activeViewId(): string | null {
    return this.activeViewId$.value;
  }

  public registerPartAction(action: WorkbenchPartAction): Disposable {
    this.actions$.next(this.actions$.value.concat(action));
    return {
      dispose: (): void => {
        this.actions$.next(this.actions$.value.filter(it => it !== action));
      },
    };
  }

  /**
   * Makes the associated part the active workbench part.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public async activate(): Promise<boolean> {
    if (this.active) {
      return true;
    }

    this._activationInstant = this._activationInstantProvider.now();
    return this._workbenchRouter.ɵnavigate(
      layout => layout.activatePart(this.id),
      {skipLocationChange: true}, // do not add part activation into browser history stack
    );
  }

  public get active(): boolean {
    return this.active$.value;
  }

  /**
   * Activates the specified view.
   *
   * Note: This instruction runs asynchronously via URL routing.
   */
  public async activateView(viewId: string, options?: {skipLocationChange?: boolean}): Promise<boolean> {
    if (this.activeViewId === viewId) {
      return true;
    }

    return this._workbenchRouter.ɵnavigate(layout => layout.activateView(viewId, {activatePart: true}), {skipLocationChange: options?.skipLocationChange});
  }

  public get activationInstant(): number | undefined {
    return this._activationInstant;
  }

  public destroy(): void {
    // IMPORTANT: Only detach the active view, not destroy it, because views are explicitly destroyed when view handles are removed.
    // Otherwise, moving the last view to another part would fail because the view would already be destroyed.
    if (this.activeViewId) {
      this._viewRegistry.get(this.activeViewId, {orElse: null})?.portal.detach();
    }
  }
}

/**
 * Represents a pseudo-type for the actual {@link PartComponent} which must not be referenced in order to avoid import cycles.
 */
type PartComponent = any;

/**
 * Represents a pseudo-type for the actual {@link MainAreaLayoutComponent} which must not be referenced in order to avoid import cycles.
 */
type MainAreaLayoutComponent = any;
