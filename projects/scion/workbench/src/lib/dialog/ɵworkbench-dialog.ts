/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {BehaviorSubject, concatWith, delay, firstValueFrom, map, of, Subject, switchMap} from 'rxjs';
import {ApplicationRef, assertNotInReactiveContext, ComponentRef, computed, effect, EnvironmentInjector, inject, Injector, Signal, signal, untracked} from '@angular/core';
import {WorkbenchDialog, WorkbenchDialogSize, ɵWorkbenchDialogSize} from './workbench-dialog';
import {WorkbenchDialogOptions} from './workbench-dialog.options';
import {ComponentPortal, ComponentType} from '@angular/cdk/portal';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {WorkbenchDialogComponent} from './workbench-dialog.component';
import {ɵWorkbenchView} from '../view/ɵworkbench-view.model';
import {WorkbenchDialogRegistry} from './workbench-dialog.registry';
import {ɵDestroyRef} from '../common/ɵdestroy-ref';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {setStyle} from '../common/dom.util';
import {fromResize$} from '@scion/toolkit/observable';
import {ViewDragService} from '../view-dnd/view-drag.service';
import {WORKBENCH_ELEMENT_REF} from '../content-projection/workbench-element-references';
import {Arrays} from '@scion/toolkit/util';
import {WorkbenchConfig} from '../workbench-config';
import {distinctUntilChanged, filter} from 'rxjs/operators';
import {WorkbenchDialogActionDirective} from './dialog-footer/workbench-dialog-action.directive';
import {WorkbenchDialogFooterDirective} from './dialog-footer/workbench-dialog-footer.directive';
import {WorkbenchDialogHeaderDirective} from './dialog-header/workbench-dialog-header.directive';
import {Disposable} from '../common/disposable';
import {Blockable} from '../glass-pane/blockable';
import {Blocking} from '../glass-pane/blocking';
import {provideViewContext} from '../view/view-context-provider';
import {boundingClientRect} from '@scion/components/dimension';

/** @inheritDoc */
export class ɵWorkbenchDialog<R = unknown> implements WorkbenchDialog<R>, Blockable, Blocking {

  private readonly _dialogEnvironmentInjector = inject(EnvironmentInjector);

  private readonly _overlayRef: OverlayRef;
  private readonly _portal: ComponentPortal<WorkbenchDialogComponent>;
  private readonly _workbenchDialogRegistry = inject(WorkbenchDialogRegistry);
  private readonly _workbenchConfig = inject(WorkbenchConfig);
  private readonly _destroyRef = new ɵDestroyRef();
  private readonly _blink$ = new Subject<void>();
  private readonly _attached: Signal<boolean>;
  private readonly _title = signal<string | undefined>(undefined);
  private readonly _closable = signal(true);
  private readonly _resizable = signal(true);
  private readonly _padding = signal(true);
  private readonly _cssClass = signal<string[]>([]);

  /**
   * Result (or error) to be passed to the dialog opener.
   */
  private _result: R | Error | undefined;
  private _componentRef: ComponentRef<WorkbenchDialogComponent> | undefined;

  /**
   * Indicates whether this dialog is blocked by other dialog(s) that overlay this dialog.
   */
  public readonly blockedBy$ = new BehaviorSubject<ɵWorkbenchDialog | null>(null);
  public readonly size: WorkbenchDialogSize = new ɵWorkbenchDialogSize();
  public header: WorkbenchDialogHeaderDirective | undefined;
  public footer: WorkbenchDialogFooterDirective | undefined;
  public actions = new Array<WorkbenchDialogActionDirective>();
  public blinking$ = new BehaviorSubject(false);
  public context = {
    view: inject(ɵWorkbenchView, {optional: true}),
  };

  constructor(public id: string,
              public component: ComponentType<unknown>,
              private _options: WorkbenchDialogOptions) {
    this._overlayRef = this.createOverlay();
    this._portal = this.createPortal();
    this._cssClass.set(Arrays.coerce(this._options.cssClass));
    this._attached = this.monitorHostElementAttached();

    this.stickToHostElement();
    this.blockWhenNotOnTop();
    this.restoreFocusOnAttach();
    this.restoreFocusOnUnblock();
    this.blinkOnRequest();
  }

  public async open(): Promise<R | undefined> {
    // Wait for the overlay to be initially positioned to have a smooth slide-in animation.
    if (this.animate) {
      await firstValueFrom(fromResize$(this._overlayRef.hostElement));
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
        this._result instanceof Error ? reject(this._result) : resolve(this._result);
      });
    });
  }

  /** @inheritDoc */
  public close(result?: R | Error): void {
    assertNotInReactiveContext(this.close, 'Call WorkbenchDialog.close() in a non-reactive (non-tracking) context, such as within the untracked() function.');
    this._result = result;
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

  /** @inheritDoc */
  public focus(): void {
    if (!this.blockedBy$.value) {
      this._componentRef?.instance.focus();
    }
  }

  public registerHeader(header: WorkbenchDialogHeaderDirective): Disposable {
    this.header = header;
    return {
      dispose: () => {
        if (this.header === header) {
          this.header = undefined;
        }
      },
    };
  }

  public registerFooter(footer: WorkbenchDialogFooterDirective): Disposable {
    if (this.actions.length) {
      throw Error('[DialogInitError] Custom dialog footer not supported if using dialog actions.');
    }
    this.footer = footer;
    return {
      dispose: () => {
        if (this.footer === footer) {
          this.footer = undefined;
        }
      },
    };
  }

  public registerAction(action: WorkbenchDialogActionDirective): Disposable {
    if (this.footer) {
      throw Error('[DialogInitError] Dialog actions not supported if using a custom dialog footer.');
    }
    this.actions = this.actions.concat(action);
    return {
      dispose: () => this.actions = this.actions.filter(candidate => candidate !== action),
    };
  }

  /** @inheritDoc */
  public get title(): Signal<string | undefined> {
    return this._title;
  }

  /** @inheritDoc */
  public set title(title: string | undefined) {
    untracked(() => this._title.set(title));
  }

  /** @inheritDoc */
  public get closable(): Signal<boolean> {
    return this._closable;
  }

  /** @inheritDoc */
  public set closable(closable: boolean) {
    untracked(() => this._closable.set(closable));
  }

  /** @inheritDoc */
  public get resizable(): Signal<boolean> {
    return this._resizable;
  }

  /** @inheritDoc */
  public set resizable(resizable: boolean) {
    untracked(() => this._resizable.set(resizable));
  }

  /** @inheritDoc */
  public get padding(): Signal<boolean> {
    return this._padding;
  }

  /** @inheritDoc */
  public set padding(padding: boolean) {
    untracked(() => this._padding.set(padding));
  }

  /** @inheritDoc */
  public get cssClass(): Signal<string[]> {
    return this._cssClass;
  }

  /** @inheritDoc */
  public set cssClass(cssClass: string | string[]) {
    untracked(() => this._cssClass.set(new Array<string>().concat(this._options.cssClass ?? []).concat(cssClass)));
  }

  /**
   * Returns the position of the dialog in the dialog stack.
   */
  public getPositionInDialogStack(): number {
    return this._workbenchDialogRegistry.indexOf(this);
  }

  /** @inheritDoc */
  public blink(): void {
    this._blink$.next();
  }

  /**
   * Reference to the handle's injector. The injector will be destroyed when closing the dialog.
   */
  public get injector(): Injector {
    return this._dialogEnvironmentInjector;
  }

  private createPortal(): ComponentPortal<WorkbenchDialogComponent> {
    return new ComponentPortal(WorkbenchDialogComponent, null, Injector.create({
      // Use the root environment injector instead of the dialog's environment injector.
      // Otherwise, if an application-modal dialog opens a view-modal dialog, the view-modal dialog
      // would not open because it uses the same environment injector, which, however, was destroyed
      // when closed the application-modal dialog. View-modal dialogs are only opened after
      // all application-modal dialogs have been closed.
      parent: this._options.injector ?? inject(ApplicationRef).injector,
      providers: [
        provideViewContext(this.context.view),
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
      panelClass: ['wb-dialog-modality-context'],
      positionStrategy: overlay.position().global(),
      scrollStrategy: overlay.scrollStrategies.noop(),
    });
  }

  /**
   * Restores focus when re-attaching this dialog.
   */
  private restoreFocusOnAttach(): void {
    effect(() => {
      const attached = this._attached();
      untracked(() => attached && this.focus());
    });
  }

  /**
   * Restores focus when unblocking this dialog.
   */
  private restoreFocusOnUnblock(): void {
    this.blockedBy$
      .pipe(
        filter(blockedBy => !blockedBy),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.focus();
      });
  }

  /**
   * Monitors attachment of the host element.
   */
  private monitorHostElementAttached(): Signal<boolean> {
    if (this.context.view) {
      return this.context.view.portal.attached;
    }
    if (this._workbenchConfig.dialog?.modalityScope === 'viewport') {
      return computed(() => true);
    }
    const workbenchElementRef = inject(WORKBENCH_ELEMENT_REF);
    return computed(() => !!workbenchElementRef());
  }

  /**
   * Aligns this dialog with the boundaries of the host element.
   */
  private stickToHostElement(): void {
    if (this._options.modality === 'application' && this._workbenchConfig.dialog?.modalityScope === 'viewport') {
      setStyle(this._overlayRef.hostElement, {inset: '0'});
    }
    else {
      const workbenchElementRef = inject(WORKBENCH_ELEMENT_REF);
      const hostElement = computed(() => this.context.view ? this.context.view.portal.componentRef.location.nativeElement : workbenchElementRef()?.element.nativeElement);
      const hostBounds = boundingClientRect(hostElement);
      const viewDragService = inject(ViewDragService);

      effect(() => {
        const visible = this._attached() && !viewDragService.dragging();

        // Maintain position and size when hidden to prevent flickering when visible again and to support for virtual scrolling in dialog content.
        if (!visible) {
          setStyle(this._overlayRef.overlayElement, {visibility: 'hidden'}); // Hide via `visibility` instead of `display` property to retain the size.
          return;
        }

        // IMPORTANT: Track host bounds only if visible to prevent flickering.
        const {left, top, width, height} = hostBounds();
        setStyle(this._overlayRef.overlayElement, {visibility: null});
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
        map(top => top === this ? null : top),
        takeUntilDestroyed(),
      )
      .subscribe(this.blockedBy$);
  }

  private blinkOnRequest(): void {
    this._blink$
      .pipe(
        switchMap(() => of(true).pipe(concatWith(of(false).pipe(delay(300))))),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe(this.blinking$);
  }

  /**
   * Destroys this dialog and associated resources.
   */
  public destroy(): void {
    if (!this._destroyRef.destroyed) {
      this._dialogEnvironmentInjector.destroy();
      this._destroyRef.destroy();
      this._overlayRef.dispose();
    }
  }
}
