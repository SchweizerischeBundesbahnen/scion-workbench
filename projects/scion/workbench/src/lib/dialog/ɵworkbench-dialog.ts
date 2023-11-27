/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {BehaviorSubject, combineLatest, EMPTY, firstValueFrom, map, merge, Observable, of, switchMap} from 'rxjs';
import {ComponentRef, inject, Injector, NgZone} from '@angular/core';
import {WorkbenchDialog, WorkbenchDialogSize} from './workbench-dialog';
import {WorkbenchDialogOptions} from './workbench-dialog.options';
import {ComponentPortal, ComponentType} from '@angular/cdk/portal';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {WorkbenchDialogComponent} from './workbench-dialog.component';
import {ɵWorkbenchView} from '../view/ɵworkbench-view.model';
import {WorkbenchDialogRegistry} from './workbench-dialog.registry';
import {ɵDestroyRef} from '../common/ɵdestroy-ref';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {setStyle} from '../common/dom.util';
import {fromDimension$} from '@scion/toolkit/observable';
import {subscribeInside} from '@scion/toolkit/operators';
import {ViewDragService} from '../view-dnd/view-drag.service';
import {WORKBENCH_ELEMENT_REF} from '../content-projection/view-container.reference';
import {Arrays} from '@scion/toolkit/util';
import {WorkbenchModuleConfig} from '../workbench-module-config';
import {filter} from 'rxjs/operators';

/** @inheritDoc */
export class ɵWorkbenchDialog<R = unknown> implements WorkbenchDialog<R> {

  private readonly _overlayRef: OverlayRef;
  private readonly _portal: ComponentPortal<WorkbenchDialogComponent>;
  private readonly _workbenchDialogRegistry = inject(WorkbenchDialogRegistry);
  private readonly _zone = inject(NgZone);
  private readonly _workbenchModuleConfig = inject(WorkbenchModuleConfig);
  private readonly _destroyRef = new ɵDestroyRef();
  private _componentRef: ComponentRef<WorkbenchDialogComponent> | undefined;
  private _cssClass: string;

  public readonly size: WorkbenchDialogSize = {};
  public title: string | Observable<string | undefined> | undefined;
  public padding: string | undefined;
  public closable = true;
  public resizable = true;

  /**
   * Indicates whether this dialog is attached to the DOM.
   */
  private readonly _attached$: Observable<boolean>;

  /**
   * Indicates whether this dialog is blocked by other dialog(s) that overlay this dialog.
   */
  public readonly blocked$ = new BehaviorSubject<boolean>(false);

  /**
   * Contains the result to be passed to the dialog opener.
   */
  private _result: R | ɵDialogErrorResult | undefined;

  constructor(public component: ComponentType<unknown>, public _options: WorkbenchDialogOptions, public context: {view?: ɵWorkbenchView}) {
    this._overlayRef = this.createOverlay();
    this._portal = this.createPortal();
    this._cssClass = Arrays.coerce(this._options.cssClass).join(' ');
    this._attached$ = this.monitorHostElementAttached$();

    this.hideOnHostElementDetachOrViewDrag();
    this.stickToHostElement();
    this.blockWhenNotOnTop();
    this.restoreFocusOnAttach();
    this.restoreFocusOnUnblock();
  }

  public async open(): Promise<R | undefined> {
    // Wait for the overlay to be initially positioned to have a smooth slide-in animation.
    if (this.animate) {
      await firstValueFrom(fromDimension$(this._overlayRef.hostElement));
    }

    // Attach the dialog portal to the overlay.
    this._componentRef = this._overlayRef.attach(this._portal);

    // Ensure to destroy this handle on browser back/forward navigation.
    this._componentRef.onDestroy(() => this.destroy());

    // Trigger a manual change detection cycle to avoid 'ExpressionChangedAfterItHasBeenCheckedError'
    // when the dialog sets dialog-specific properties such as title or size during construction.
    this._componentRef.changeDetectorRef.detectChanges();

    // Wait for the dialog to close, resolving to its result or rejecting if closed with an error.
    return new Promise<R | undefined>((resolve, reject) => {
      this._destroyRef.onDestroy(() => {
        if (this._result instanceof ɵDialogErrorResult) {
          reject(this._result.error);
        }
        else {
          resolve(this._result);
        }
      });
    });
  }

  /** @inheritDoc */
  public close(result?: R): void {
    this._result = result;
    this.destroy();
  }

  /** @inheritDoc */
  public closeWithError(error: Error | string): void {
    this._result = new ɵDialogErrorResult(error);
    this.destroy();
  }

  /**
   * Inputs passed to the dialog.
   */
  public get inputs(): {[name: string]: unknown} | undefined {
    return this._options.inputs;
  }

  /**
   * Indicates if to animate the dialog.
   */
  public get animate(): boolean {
    return this._options.animate ?? false;
  }

  /**
   * Focuses the dialog.
   */
  public focus(): void {
    if (!this.blocked$.value) {
      this._componentRef?.instance.focus();
    }
  }

  /**
   * Returns the position of the dialog in the dialog stack.
   */
  public getPositionInDialogStack(): number {
    return this._workbenchDialogRegistry.indexOf(this);
  }

  public set cssClass(cssClass: string | string[]) {
    this._cssClass = new Array<string>().concat(this._options.cssClass ?? []).concat(cssClass).join(' ');
  }

  public get cssClass(): string {
    return this._cssClass;
  }

  private createPortal(): ComponentPortal<WorkbenchDialogComponent> {
    return new ComponentPortal(WorkbenchDialogComponent, null, Injector.create({
      parent: inject(Injector),
      providers: [
        {provide: ɵWorkbenchDialog, useValue: this},
        {provide: WorkbenchDialog, useExisting: ɵWorkbenchDialog},
      ],
    }));
  }

  /**
   * Creates a dedicated overlay per dialog to place it on top of previously created overlays, such as dialogs, popups, dropdowns, etc.
   */
  private createOverlay(): OverlayRef {
    const overlay = inject(Overlay);
    return overlay.create({
      disposeOnNavigation: true, // dispose dialog on browser back/forward navigation
      panelClass: ['wb-dialog-glass-pane'],
      positionStrategy: overlay.position().global(),
      scrollStrategy: overlay.scrollStrategies.noop(),
    });
  }

  /**
   * Restores focus when re-attaching this dialog.
   */
  private restoreFocusOnAttach(): void {
    this._attached$
      .pipe(
        filter(Boolean),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.focus();
      });
  }

  /**
   * Restores focus when unblocking this dialog.
   */
  private restoreFocusOnUnblock(): void {
    this.blocked$
      .pipe(
        filter(blocked => !blocked),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.focus();
      });
  }

  /**
   * Monitors attachment of the host element.
   */
  private monitorHostElementAttached$(): Observable<boolean> {
    if (this.context.view) {
      return this.context.view.portal.attached$;
    }
    if (this._workbenchModuleConfig.dialog?.modalityScope === 'viewport') {
      return of(true);
    }
    return inject(WORKBENCH_ELEMENT_REF).ref$.pipe(map(ref => !!ref));
  }

  /**
   * Hides this dialog when either its host element is detached or during view drag and drop operation.
   */
  private hideOnHostElementDetachOrViewDrag(): void {
    const viewDragService = inject(ViewDragService);
    const viewDrag$ = merge(
      viewDragService.viewDragStart$.pipe(map(() => true)),
      viewDragService.viewDragEnd$.pipe(map(() => false)),
      of(false), // to initialize `combineLatest`
    );

    combineLatest([this._attached$, viewDrag$])
      .pipe(
        subscribeInside(fn => this._zone.runOutsideAngular(fn)),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(([attached, dragging]) => {
        const hideDialog = !attached || dragging;

        // Hide via `visibility: hidden` instead of `display: none` in order to preserve the dimension of the dialog.
        setStyle(this._overlayRef.overlayElement, {visibility: hideDialog ? 'hidden' : null});
      });
  }

  /**
   * Aligns this dialog with the boundaries of the host element.
   */
  private stickToHostElement(): void {
    if (this._options.modality === 'application' && this._workbenchModuleConfig.dialog?.modalityScope === 'viewport') {
      setStyle(this._overlayRef.hostElement, {inset: 0});
    }
    else {
      const workbenchViewElement$ = (view: ɵWorkbenchView): Observable<HTMLElement> => of(view.portal.componentRef.location.nativeElement);
      const workbenchRootElement$ = (): Observable<HTMLElement> => inject(WORKBENCH_ELEMENT_REF).ref$.pipe(map(ref => ref?.element.nativeElement));
      const hostElement$ = this.context.view ? workbenchViewElement$(this.context.view) : workbenchRootElement$();

      hostElement$
        .pipe(
          switchMap(hostElement => hostElement ? fromDimension$(hostElement) : EMPTY),
          map(({element: hostElement}) => hostElement.getBoundingClientRect()),
          subscribeInside(fn => this._zone.runOutsideAngular(fn)),
          takeUntilDestroyed(this._destroyRef),
        )
        .subscribe(({top, left, width, height}) => {
          setStyle(this._overlayRef.hostElement, {
            top: `${top}px`,
            left: `${left}px`,
            width: `${width}px`,
            height: `${height}px`,
          });
        });
    }
  }

  /**
   * Blocks this dialog if not the topmost dialog in its context.
   */
  private blockWhenNotOnTop(): void {
    this._workbenchDialogRegistry.top$({viewId: this.context.view?.id})
      .pipe(
        map(top => top !== this),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(this.blocked$);
  }

  /**
   * Destroys this dialog and associated resources.
   */
  public destroy(): void {
    if (!this._destroyRef.destroyed) {
      this._destroyRef.destroy();
      this._overlayRef.dispose();
    }
  }
}

/**
 * Wrapper to identify an erroneous result.
 */
class ɵDialogErrorResult {

  constructor(public error: string | Error) {
  }
}
