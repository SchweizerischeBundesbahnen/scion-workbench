/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {BehaviorSubject, concatWith, delay, firstValueFrom, of, Subject, switchMap} from 'rxjs';
import {assertNotInReactiveContext, ComponentRef, computed, DestroyableInjector, DestroyRef, effect, inject, Injector, Signal, signal, untracked} from '@angular/core';
import {WorkbenchDialog, WorkbenchDialogSize, ɵWorkbenchDialogSize} from './workbench-dialog';
import {WorkbenchDialogOptions} from './workbench-dialog.options';
import {ComponentPortal, ComponentType} from '@angular/cdk/portal';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {WorkbenchDialogComponent} from './workbench-dialog.component';
import {WorkbenchDialogRegistry} from './workbench-dialog.registry';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {setStyle} from '../common/dom.util';
import {fromResize$} from '@scion/toolkit/observable';
import {ViewDragService} from '../view-dnd/view-drag.service';
import {WORKBENCH_COMPONENT_BOUNDS, WORKBENCH_COMPONENT_REF, WORKBENCH_ELEMENT} from '../workbench-element-references';
import {Arrays} from '@scion/toolkit/util';
import {WorkbenchConfig} from '../workbench-config';
import {distinctUntilChanged} from 'rxjs/operators';
import {WorkbenchDialogActionDirective} from './dialog-footer/workbench-dialog-action.directive';
import {WorkbenchDialogFooterDirective} from './dialog-footer/workbench-dialog-footer.directive';
import {WorkbenchDialogHeaderDirective} from './dialog-header/workbench-dialog-header.directive';
import {Disposable} from '../common/disposable';
import {Blockable} from '../glass-pane/blockable';
import {Blocking} from '../glass-pane/blocking';
import {boundingClientRect} from '@scion/components/dimension';
import {Translatable} from '../text/workbench-text-provider.model';
import {WorkbenchFocusMonitor} from '../focus/workbench-focus-tracker.service';
import {DialogId} from '../workbench.identifiers';
import {provideContextAwareServices} from '../context-aware-service-provider';
import {WorkbenchInvocationContext} from '../invocation-context/invocation-context';

/** @inheritDoc */
export class ɵWorkbenchDialog<R = unknown> implements WorkbenchDialog<R>, Blockable, Blocking {

  /** Injector for the dialog; destroyed when the dialog is closed. */
  public readonly injector = inject(Injector) as DestroyableInjector;

  private readonly _overlayRef: OverlayRef;
  private readonly _portal: ComponentPortal<WorkbenchDialogComponent>;
  private readonly _workbenchDialogRegistry = inject(WorkbenchDialogRegistry);
  private readonly _workbenchConfig = inject(WorkbenchConfig);
  private readonly _blink$ = new Subject<void>();
  private readonly _focusMonitor = inject(WorkbenchFocusMonitor);
  private readonly _title = signal<Translatable | undefined>(undefined);
  private readonly _closable = signal(true);
  private readonly _resizable = signal(true);
  private readonly _padding = signal(true);
  private readonly _cssClass = signal<string[]>([]);

  /** Result (or error) to be passed to the dialog opener. */
  private _result: R | Error | undefined;
  private _componentRef = signal<ComponentRef<WorkbenchDialogComponent> | undefined>(undefined);

  public readonly blockedBy: Signal<ɵWorkbenchDialog | null>;
  public readonly size: WorkbenchDialogSize = new ɵWorkbenchDialogSize();
  public readonly focused = computed(() => this._focusMonitor.activeElement()?.id === this.id);
  public readonly attached: Signal<boolean>;
  public readonly destroyed = signal<boolean>(false);
  public readonly bounds = boundingClientRect(computed(() => this._componentRef()?.instance.dialogContent()));
  public readonly modal: boolean;
  public readonly blinking$ = new BehaviorSubject(false);

  public header: WorkbenchDialogHeaderDirective | undefined;
  public footer: WorkbenchDialogFooterDirective | undefined;
  public actions = new Array<WorkbenchDialogActionDirective>();

  constructor(public id: DialogId,
              public component: ComponentType<unknown>,
              public invocationContext: WorkbenchInvocationContext | null,
              private _options: WorkbenchDialogOptions) {
    this._overlayRef = this.createOverlay();
    this._portal = this.createPortal();
    this._cssClass.set(Arrays.coerce(this._options.cssClass));
    this.attached = this.monitorHostElementAttached();
    this.blockedBy = this.computeBlocked();
    this.modal = this._options.modality !== 'none';
    this.bindToHostElement();
    this.restoreFocusOnAttach();
    this.restoreFocusOnUnblock();
    this.closeOnHostDestroy();
    this.blinkOnRequest();

    inject(DestroyRef).onDestroy(() => this.destroyed.set(true));
  }

  /**
   * Waits for the dialog to close, resolving to its result or rejecting if closed with an error.
   */
  public async waitForClose(): Promise<R | undefined> {
    // Wait for the overlay to be initially positioned to have a smooth slide-in animation.
    if (this.animate) {
      await firstValueFrom(fromResize$(this._overlayRef.hostElement));
    }

    // Attach the dialog portal to the overlay.
    this._componentRef.set(this._overlayRef.attach(this._portal));

    // Ensure to destroy this handle on browser back/forward navigation.
    this._componentRef()!.onDestroy(() => this.destroy());

    // Trigger a manual change detection cycle to avoid 'ExpressionChangedAfterItHasBeenCheckedError'
    // when the dialog sets dialog-specific properties such as title or size during construction.
    this._componentRef()!.changeDetectorRef.detectChanges();

    // Wait for the dialog to close, resolving to its result or rejecting if closed with an error.
    return new Promise<R | undefined>((resolve, reject) => {
      this.injector.get(DestroyRef).onDestroy(() => {
        this._result instanceof Error ? reject(this._result) : resolve(this._result);
      });
    });
  }

  /** @inheritDoc */
  public close(result?: R | Error): void {
    assertNotInReactiveContext(this.close, 'Call WorkbenchDialog.close() in a non-reactive (non-tracking) context, such as within the untracked() function.');

    // Prevent closing if blocked.
    if (this.blockedBy()) {
      return;
    }

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
    if (!this.blockedBy()) {
      this._componentRef()?.instance.focus();
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
  public get title(): Signal<Translatable | undefined> {
    return this._title;
  }

  /** @inheritDoc */
  public set title(title: Translatable | undefined) {
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
   * Creates a portal to render {@link WorkbenchDialogComponent} in the dialog's injection context.
   */
  private createPortal(): ComponentPortal<WorkbenchDialogComponent> {
    const injector = Injector.create({
      parent: this._options.injector ?? inject(Injector),
      providers: [
        {provide: ɵWorkbenchDialog, useValue: this},
        {provide: WorkbenchDialog, useExisting: ɵWorkbenchDialog},
        {provide: WORKBENCH_ELEMENT, useExisting: ɵWorkbenchDialog},
        provideContextAwareServices(),
      ],
    });
    inject(DestroyRef).onDestroy(() => injector.destroy());
    return new ComponentPortal(WorkbenchDialogComponent, null, injector);
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
      const attached = this.attached();
      untracked(() => attached && this.focus());
    });
  }

  /**
   * Restores focus when unblocking this dialog.
   */
  private restoreFocusOnUnblock(): void {
    effect(() => {
      const blocked = this.blockedBy();
      untracked(() => !blocked && this.focus());
    });
  }

  /**
   * Monitors attachment of the host element.
   */
  private monitorHostElementAttached(): Signal<boolean> {
    if (this.invocationContext) {
      return this.invocationContext.attached;
    }
    if (this._workbenchConfig.dialog?.modalityScope === 'viewport') {
      return computed(() => true);
    }
    const workbenchComponentRef = inject(WORKBENCH_COMPONENT_REF);
    return computed(() => !!workbenchComponentRef());
  }

  /**
   * Binds this dialog to its workbench host element, displaying it only when the host element is attached.
   *
   * Dialogs opened in non-peripheral area are displayed in the center of the host.
   */
  private bindToHostElement(): void {
    if (!this.invocationContext && this._workbenchConfig.dialog?.modalityScope === 'viewport') {
      setStyle(this._overlayRef.hostElement, {inset: '0'});
    }
    else {
      const viewDragService = inject(ViewDragService);
      const workbenchComponentBounds = inject(WORKBENCH_COMPONENT_BOUNDS);

      effect(() => {
        const visible = this.attached() && !viewDragService.dragging();

        // Maintain position and size when hidden to prevent flickering when visible again and to support for virtual scrolling in dialog content.
        if (!visible) {
          setStyle(this._overlayRef.overlayElement, {visibility: 'hidden'}); // Hide via `visibility` instead of `display` property to retain the size.
          return;
        }

        // Align dialog relative to contextual element if opened in non-peripheral area.
        const hostBounds = this.invocationContext?.peripheral() === false ? this.invocationContext.bounds() : workbenchComponentBounds();
        if (!hostBounds) {
          setStyle(this._overlayRef.overlayElement, {visibility: 'hidden'}); // Hide via `visibility` instead of `display` property to retain the size.
          return;
        }

        // IMPORTANT: Track host bounds only if visible to prevent flickering.
        const {left, top, width, height} = hostBounds;
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
   * Computes if this dialog is blocked by another dialog.
   */
  private computeBlocked(): Signal<ɵWorkbenchDialog | null> {
    const dialogRegistry = inject(WorkbenchDialogRegistry);
    const topInThisContext = dialogRegistry.top(this.id);
    const topInInvocationContext = dialogRegistry.top(this.invocationContext?.elementId);

    return computed(() => {
      // Get the top dialog in the context spawned by this dialog.
      if (topInThisContext()) {
        return topInThisContext();
      }
      // Get the top dialog in the context this dialog was opened in.
      if (topInInvocationContext() !== this) {
        return topInInvocationContext();
      }
      return null;
    });
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
   * Closes the dialog when the context element is destroyed.
   */
  private closeOnHostDestroy(): void {
    if (this.invocationContext) {
      effect(() => {
        if (this.invocationContext!.destroyed()) {
          untracked(() => this.close());
        }
      });
    }
  }

  /**
   * Destroys this dialog and associated resources.
   */
  public destroy(): void {
    if (!this.destroyed()) {
      this.injector.destroy();
      this._overlayRef.dispose();
    }
  }
}
